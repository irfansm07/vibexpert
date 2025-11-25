// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT
// Enhanced Community Chat + Post Integration
// ========================================

const API_URL = 'https://vibexpert-backend-main.onrender.com';

// Global Variables
let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];
let socket = null;
let selectedFiles = [];
let previewUrls = [];
let editingMessageId = null;
let editingItemType = null; // 'message' or 'post'
let editTimeout = null;
let selectedMusic = null;
let selectedStickers = [];
let cropper = null;
let selectedPostDestination = 'profile';
let currentCropIndex = -1;
let currentFilters = {};
let searchTimeout = null;
let currentCommentPostId = null;
let hasScrolledToBottom = false;
let scrollCheckEnabled = true;
let scrollProgressIndicator = null;

// ENHANCED CHAT VARIABLES
let typingUsers = new Set();
let typingTimeout = null;
let lastTypingEmit = 0;
let isLoadingMessages = false;
let hasMoreMessages = true;
let currentMessagePage = 1;
let chatInitialized = false;

// Data (Simulated Backend Data)
const rewardsData = {
  dailyTasks: [
    { id: 'post_today', title: 'Share Your Day', desc: 'Create 1 post', reward: 10, icon: '📝', completed: false },
    { id: 'comment_5', title: 'Engage', desc: 'Comment on 5 posts', reward: 15, icon: '💬', completed: false },
    { id: 'like_10', title: 'Spread Love', desc: 'Like 10 posts', reward: 5, icon: '❤️', completed: false },
    { id: 'login_streak', title: 'Daily Login', desc: '7 days streak', reward: 50, icon: '🔥', completed: false }
  ],
  achievements: [
    { id: 'social', title: 'Social Butterfly', desc: '50 connections', reward: 100, icon: '🦋', progress: 0, target: 50 },
    { id: 'content', title: 'Content King', desc: '100 posts', reward: 200, icon: '👑', progress: 0, target: 100 },
    { id: 'influencer', title: 'Influencer', desc: '1000 likes', reward: 500, icon: '⭐', progress: 0, target: 1000 },
    { id: 'hero', title: 'Community Hero', desc: '500 messages', reward: 150, icon: '🦸', progress: 0, target: 500 }
  ]
};

const musicLibrary = [
  { id: 1, name: "Chill Vibes", artist: "LoFi Beats", duration: "2:30", url: "https://assets.mixkit.co/music/preview/mixkit-chill-vibes-239.mp3", emoji: "🎧" },
  { id: 2, name: "Upbeat Energy", artist: "Electronic", duration: "3:15", url: "https://assets.mixkit.co/music/preview/mixkit-upbeat-energy-225.mp3", emoji: "⚡" },
  { id: 3, name: "Dreamy Piano", artist: "Classical", duration: "2:45", url: "https://assets.mixkit.co/music/preview/mixkit-dreamy-piano-1171.mp3", emoji: "🎹" },
  { id: 4, name: "Summer Vibes", artist: "Tropical", duration: "3:30", url: "https://assets.mixkit.co/music/preview/mixkit-summer-vibes-129.mp3", emoji: "🏖️" },
  { id: 5, name: "Happy Day", artist: "Pop Rock", duration: "2:50", url: "https://assets.mixkit.co/music/preview/mixkit-happy-day-583.mp3", emoji: "😊" },
  { id: 6, name: "Relaxing Guitar", artist: "Acoustic", duration: "3:10", url: "https://assets.mixkit.co/music/preview/mixkit-relaxing-guitar-243.mp3", emoji: "🎸" }
];

const stickerLibrary = {
  emotions: [
    { id: 'happy', emoji: '😊', name: 'Happy' },
    { id: 'laugh', emoji: '😂', name: 'Laugh' },
    { id: 'love', emoji: '❤️', name: 'Love' },
    { id: 'cool', emoji: '😎', name: 'Cool' },
    { id: 'fire', emoji: '🔥', name: 'Fire' },
    { id: 'star', emoji: '⭐', name: 'Star' }
  ],
  animals: [
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'panda', emoji: '🐼', name: 'Panda' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
    { id: 'dragon', emoji: '🐉', name: 'Dragon' },
    { id: 'butterfly', emoji: '🦋', name: 'Butterfly' }
  ],
  objects: [
    { id: 'balloon', emoji: '🎈', name: 'Balloon' },
    { id: 'gift', emoji: '🎁', name: 'Gift' },
    { id: 'camera', emoji: '📷', name: 'Camera' },
    { id: 'music', emoji: '🎵', name: 'Music' },
    { id: 'book', emoji: '📚', name: 'Book' },
    { id: 'computer', emoji: '💻', name: 'Computer' }
  ]
};

const colleges = {
  nit: [
    {name: 'NIT Bhopal', email: '@gmail.com', location: 'Bhopal'},
    {name: 'NIT Rourkela', email: '@nitrkl.ac.in', location: 'Rourkela'},
    {name: 'NIT Warangal', email: '@nitw.ac.in', location: 'Warangal'},
    {name: 'NIT Trichy', email: '@nitt.edu', location: 'Trichy'},
    {name: 'NIT Surathkal', email: '@nitk.edu.in', location: 'Surathkal'}
  ],
  iit: [
    {name: 'IIT Delhi', email: '@iitd.ac.in', location: 'New Delhi'},
    {name: 'IIT Bombay', email: '@iitb.ac.in', location: 'Mumbai'},
    {name: 'IIT Madras', email: '@iitm.ac.in', location: 'Chennai'},
    {name: 'IIT Kharagpur', email: '@kgp.iitkgp.ac.in', location: 'Kharagpur'},
    {name: 'IIT Kanpur', email: '@iitk.ac.in', location: 'Kanpur'}
  ],
  vit: [
    {name: 'VIT Bhopal', email: '@vitbhopal.ac.in', location: 'Bhopal'},
    {name: 'VIT Vellore', email: '@vit.ac.in', location: 'Vellore'},
    {name: 'VIT Chennai', email: '@vit.ac.in', location: 'Chennai'}
  ],
  other: [
    {name: 'Delhi University', email: '@du.ac.in', location: 'New Delhi'},
    {name: 'Mumbai University', email: '@mu.ac.in', location: 'Mumbai'},
    {name: 'BITS Pilani', email: '@pilani.bits-pilani.ac.in', location: 'Pilani'}
  ]
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 VibeXpert initializing...');
  
  const token = getToken();
  const saved = localStorage.getItem('user');
  
  if (token && saved) {
    document.body.classList.add('logged-in');
    const aboutPage = document.getElementById('aboutUsPage');
    const mainPage = document.getElementById('mainPage');
    if (aboutPage) aboutPage.style.display = 'none';
    if (mainPage) mainPage.style.display = 'block';
    
    try {
      currentUser = JSON.parse(saved);
      const userName = document.getElementById('userName');
      if (userName) userName.textContent = 'Hi, ' + currentUser.username;
      if (currentUser.college) {
        updateLiveNotif(`Connected to ${currentUser.college}`);
        initializeSocket();
      }
    } catch(e) {
      console.error('Parse error:', e);
      localStorage.clear();
      showAboutUsPage();
    }
  } else {
    showAboutUsPage();
  }
  
  setupEventListeners();
  initializeMusicPlayer();
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
  initializeSearchBar();
  loadTrending();
  console.log('✅ Initialized');
});

// ========================================
// ABOUT US PAGE FUNCTIONALITY
// ========================================

function showAboutUsPage() {
  document.body.classList.remove('logged-in');
  const aboutPage = document.getElementById('aboutUsPage');
  const mainPage = document.getElementById('mainPage');
  if (aboutPage) aboutPage.style.display = 'block';
  if (mainPage) mainPage.style.display = 'none';
  
  initScrollProgress();
  initRevealOnScroll();
  initStatsCounter();
  initScrollDetection();
  createScrollProgressIndicator();
}

function createScrollProgressIndicator() {
  if (scrollProgressIndicator) return;
  scrollProgressIndicator = document.createElement('div');
  scrollProgressIndicator.className = 'scroll-progress-indicator';
  scrollProgressIndicator.innerHTML = '📜 Scroll to explore • <span id="scrollPercent">0%</span>';
  document.body.appendChild(scrollProgressIndicator);
}

function initScrollProgress() {
  window.addEventListener('scroll', updateScrollProgress);
}

function updateScrollProgress() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
  
  const progressFill = document.getElementById('scrollProgressFill');
  if (progressFill) progressFill.style.width = scrolled + '%';
  
  const scrollPercent = document.getElementById('scrollPercent');
  if (scrollPercent) scrollPercent.textContent = Math.round(scrolled) + '%';
  
  if (scrollProgressIndicator) {
    if (scrolled > 10 && scrolled < 95) scrollProgressIndicator.classList.add('show');
    else scrollProgressIndicator.classList.remove('show');
  }
  
  if (scrollCheckEnabled && scrolled >= 95 && !hasScrolledToBottom) {
    hasScrolledToBottom = true;
    scrollCheckEnabled = false;
    showAuthPopupAutomatic();
  }
}

function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(element => revealObserver.observe(element));
}

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let hasAnimated = false;
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-count'));
          animateCounter(stat, 0, target, 2000);
        });
      }
    });
  }, { threshold: 0.5 });
  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) statsObserver.observe(statsSection);
}

function animateCounter(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 30);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

function initScrollDetection() {
  window.addEventListener('scroll', checkScrollPosition);
}

function checkScrollPosition() {
  if (!scrollCheckEnabled || hasScrolledToBottom) return;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
  if (scrollPercentage >= 95) {
    hasScrolledToBottom = true;
    scrollCheckEnabled = false;
    showAuthPopupAutomatic();
  }
}

function showAuthPopupAutomatic() {
  console.log('🎉 User reached bottom');
  showAuthPopup();
  createConfetti();
}

function showAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.add('show');
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (scrollProgressIndicator) scrollProgressIndicator.classList.remove('show');
  }
}

function closeAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.remove('show');
    authPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      scrollCheckEnabled = true;
      hasScrolledToBottom = false;
    }, 1000);
  }
}

function createConfetti() {
  const colors = ['#667eea', '#f093fb', '#feca57', '#ff6b6b', '#4ecdc4'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}%;top:-10px;opacity:${Math.random()};transform:rotate(${Math.random()*360}deg);animation:confettiFall ${2+Math.random()*3}s linear forwards;z-index:25000;pointer-events:none;`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  document.addEventListener('click', function(e) {
    const optionsMenu = document.getElementById('optionsMenu');
    const optionsBtn = document.querySelector('.options-btn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    
    if (optionsMenu && !optionsMenu.contains(e.target) && e.target !== optionsBtn && !optionsBtn?.contains(e.target)) {
      optionsMenu.style.display = 'none';
    }
    if (hamburgerMenu && !hamburgerMenu.contains(e.target) && e.target !== hamburgerBtn && !hamburgerBtn?.contains(e.target)) {
      hamburgerMenu.style.display = 'none';
    }
    
    const authPopup = document.getElementById('authPopup');
    const authOverlay = document.querySelector('.auth-popup-overlay');
    if (authPopup && authPopup.classList.contains('show') && e.target === authOverlay) {
      closeAuthPopup();
    }
    
    if (e.target.classList.contains('cta-button') || e.target.closest('.cta-button')) {
      e.preventDefault();
      showAuthPopup();
    }
  });
}

function initializeMusicPlayer() {
  window.musicPlayer = new Audio();
  window.musicPlayer.volume = 0.5;
}

// ========================================
// API & AUTH
// ========================================

function getToken() {
  return localStorage.getItem('authToken');
}

async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  const options = { method, headers: {}, signal: controller.signal };
  const token = getToken();
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    
    if (response.status === 401 && endpoint !== '/api/login' && endpoint !== '/api/register') {
      localStorage.clear();
      document.body.classList.remove('logged-in');
      showAboutUsPage();
      showMessage('⚠️ Session expired. Please login.', 'error');
      throw new Error('Session expired');
    }
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('network'))) {
      await new Promise(r => setTimeout(r, 1000));
      return apiCall(endpoint, method, body, retries - 1);
    }
    throw error;
  }
}

async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if(!email || !password) return showMessage('Fill all fields', 'error');
  try {
    showMessage('Logging in...', 'success');
    const data = await apiCall('/api/login', 'POST', { email, password });
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    showMessage('✅ Login successful!', 'success');
    setTimeout(() => {
      document.body.classList.add('logged-in');
      const aboutPage = document.getElementById('aboutUsPage');
      const authPopup = document.getElementById('authPopup');
      const mainPage = document.getElementById('mainPage');
      if (aboutPage) aboutPage.style.display = 'none';
      if (authPopup) {
        authPopup.classList.remove('show');
        authPopup.style.display = 'none';
      }
      if (mainPage) mainPage.style.display = 'block';
      document.body.style.overflow = 'auto';
      if (scrollProgressIndicator) {
        scrollProgressIndicator.remove();
        scrollProgressIndicator = null;
      }
      const userName = document.getElementById('userName');
      if (userName) userName.textContent = 'Hi, ' + currentUser.username;
      const form = document.getElementById('loginForm');
      if (form) form.reset();
      loadPosts();
      if (currentUser.college) initializeSocket();
    }, 800);
  } catch(error) {
    showMessage('❌ Login failed: ' + error.message, 'error');
  }
}

async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const registrationNumber = document.getElementById('signupReg')?.value.trim();
  const password = document.getElementById('signupPass')?.value;
  const confirm = document.getElementById('signupConfirm')?.value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  if(!username || !email || !registrationNumber || !password || !confirm) return showMessage('Fill all fields', 'error');
  if(!gender) return showMessage('Please select gender', 'error');
  if(password !== confirm) return showMessage('Passwords don\'t match', 'error');
  if(password.length < 6) return showMessage('Password min 6 characters', 'error');
  try {
    showMessage('Creating account...', 'success');
    await apiCall('/api/register', 'POST', { username, email, password, registrationNumber, gender });
    showMessage('🎉 Account created!', 'success');
    const form = document.getElementById('signupForm');
    if (form) form.reset();
    setTimeout(() => goLogin(null), 2000);
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

function goSignup(e) {
  if (e) e.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

function goLogin(e) {
  if(e) e.preventDefault();
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

function goForgotPassword(e) {
  e.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email) return showMessage('⚠️ Enter email', 'error');
  try {
    showMessage('📧 Sending code...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ Check email', 'success');
    document.getElementById('resetEmailSection').style.display = 'none';
    document.getElementById('resetCodeSection').style.display = 'block';
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyResetCode(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  const code = document.getElementById('resetCode')?.value.trim();
  const newPassword = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('confirmNewPassword')?.value;
  if(!code || code.length !== 6) return showMessage('⚠️ Enter 6-digit code', 'error');
  if(!newPassword || !confirmPassword) return showMessage('⚠️ Enter password', 'error');
  if(newPassword !== confirmPassword) return showMessage('⚠️ Passwords don\'t match', 'error');
  if(newPassword.length < 6) return showMessage('⚠️ Min 6 characters', 'error');
  try {
    showMessage('🔐 Verifying...', 'success');
    await apiCall('/api/reset-password', 'POST', { email, code, newPassword });
    showMessage('✅ Password reset!', 'success');
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetEmailSection').style.display = 'block';
    document.getElementById('resetCodeSection').style.display = 'none';
    setTimeout(() => goLogin(null), 2000);
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function resendResetCode() {
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email) return showMessage('⚠️ Email required', 'error');
  try {
    showMessage('📧 Resending...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ New code sent!', 'success');
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

function logout() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUser = null;
  localStorage.clear();
  document.body.classList.remove('logged-in');
  document.getElementById('aboutUsPage').style.display = 'block';
  document.getElementById('mainPage').style.display = 'none';
  showMessage('👋 Logged out', 'success');
  hasScrolledToBottom = false;
  scrollCheckEnabled = true;
  createScrollProgressIndicator();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// ENHANCED COMMUNITY CHAT & FEED
// ========================================

function initializeEnhancedChat() {
  if (chatInitialized) return;
  chatInitialized = true;
  console.log('✨ Enhanced chat initializing');
  setupChatInputEnhancements();
  setupTypingIndicator();
  setupConnectionMonitor();
  setupInfiniteScroll();
}

function setupChatInputEnhancements() {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;
  
  chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    handleTypingIndicator();
  });
  
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendEnhancedMessage();
    }
  });
}

async function sendEnhancedMessage() {
  const chatInput = document.getElementById('chatInput');
  const content = chatInput?.value.trim();
  if (!content) return;
  
  try {
    const tempId = 'temp-' + Date.now();
    
    // Simulate adding to UI immediately
    const messageData = { 
      id: tempId, 
      type: 'message',
      content: content, 
      sender: currentUser, 
      timestamp: new Date(), 
      status: 'sending',
      reactions: []
    };
    
    appendFeedItemToChat(messageData);
    
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // API Call (Assuming a new endpoint for simplicity)
    const data = await apiCall('/api/community/messages', 'POST', { content });
    
    // Update status and ID upon successful send
    updateMessageInChat({ 
      oldId: tempId, 
      id: data.id || tempId, 
      content: data.content || content,
      status: 'sent' 
    });
    playMessageSound('send');
    
    if (socket && currentUser.college) {
      socket.emit('stop_typing', { 
        collegeName: currentUser.college, 
        username: currentUser.username 
      });
    }
  } catch(error) {
    showMessage('❌ Failed to send', 'error');
    updateMessageInChat({ 
      oldId: tempId, 
      status: 'failed',
      content: content + ' (Failed to send)'
    });
  }
}

// Unified renderer for Messages and Posts in the chat stream
function renderFeedItem(item) {
  const isOwn = currentUser && (item.sender?.id === currentUser.id || item.user_id === currentUser.id);
  const sender = item.sender?.username || item.users?.username || 'User';
  const avatar = item.sender?.profile_pic || item.users?.profile_pic;
  const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now';
  const itemId = item.id || ('tmp-' + Math.random().toString(36).slice(2,8));
  
  let innerContent = '';
  let reactionsHtml = createReactionBar(itemId, item.reactions || item.message_reactions);
  let actionsHtml = '';
  
  if (isOwn) {
    actionsHtml = `
      <div class="message-actions-inline">
        <button onclick="openEditModal('${itemId}', '${item.type}')" title="Edit">✏️</button>
        <button onclick="deleteFeedItem('${itemId}', '${item.type}')" title="Delete">🗑️</button>
        <button onclick="copyMessageText('${itemId}')" title="Copy">📋</button>
      </div>
    `;
  } else {
    actionsHtml = `
      <div class="message-actions-inline">
        <button onclick="copyMessageText('${itemId}')" title="Copy">📋</button>
      </div>
    `;
  }
  
  if (item.type === 'message') {
    innerContent = `
      <div class="text-bubble" id="text-bubble-${itemId}">${escapeHtml(item.content)}</div>
      ${actionsHtml}
    `;
  } else if (item.type === 'post') {
    // Integrated Post Card View (Minimized for chat)
    innerContent = `
      <div class="integrated-post-card" id="post-card-${itemId}">
        <div class="integrated-post-header">
          <div class="integrated-post-avatar" style="${avatar ? `background-image:url('${avatar}');background-size:cover;` : ''}">${!avatar ? '👤' : ''}</div>
          <div style="font-weight:700; color:var(--primary-color);">📝 Post by @${escapeHtml(sender)}</div>
        </div>
        <div class="integrated-post-text">${escapeHtml(item.content)}</div>
        ${item.media?.length > 0 ? `
          <div class="integrated-post-media-grid">
            ${item.media.slice(0, 2).map(m => `
              <div class="integrated-post-media-item">
                ${m.type === 'image' ? `<img src="${m.url || 'https://placehold.co/100x100?text=Image'}" alt="Media">` : '🖼️'}
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="integrated-post-footer-stats">
          <span>❤️ ${item.like_count || 0}</span>
          <span>💬 ${item.comment_count || 0}</span>
        </div>
      </div>
      ${actionsHtml}
    `;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `msg-${itemId}`;
  
  wrapper.innerHTML = `
    ${!isOwn ? `<div class="sender" style="color:${getColorForUser(sender)};">@${escapeHtml(sender)}</div>` : ''}
    ${innerContent}
    <div class="message-footer">
      <span class="message-time">${time}</span>
      <span class="message-status ${item.status || ''}" id="status-${itemId}">
        ${item.status === 'sending' ? '⏳' : item.status === 'sent' ? '✓' : item.status === 'read' ? '✓✓' : ''}
      </span>
    </div>
    ${reactionsHtml}
  `;
  
  return wrapper;
}

function appendFeedItemToChat(item) {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;
  
  if (document.getElementById(`msg-${item.id}`)) return;
  
  messagesEl.appendChild(renderFeedItem(item));
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  
  if (item.type === 'message' && item.sender?.id !== currentUser.id) playMessageSound('receive');
}

function updateMessageInChat({ oldId, id, content, status }) {
  const messageEl = document.getElementById(`msg-${oldId}`);
  if (!messageEl) return;
  
  // Update ID
  messageEl.id = `msg-${id}`;
  
  // Update content
  const textEl = messageEl.querySelector('.text-bubble');
  if (textEl) {
    textEl.innerHTML = `${escapeHtml(content)} ${status === 'edited' ? '<span style="font-size:10px;color:#888;">(edited)</span>' : ''}`;
  }
  
  // Update status
  if (status) {
    const statusEl = messageEl.querySelector('.message-status');
    if (statusEl) {
      statusEl.className = `message-status ${status}`;
      statusEl.textContent = status === 'sending' ? '⏳' : status === 'sent' ? '✓' : '✓✓';
    }
  }
}

function updateMessageReactions(messageId, reactions) {
  const messageEl = document.getElementById(`msg-${messageId}`);
  if (!messageEl) return;
  
  // Find and replace the existing reaction bar
  const oldBar = messageEl.querySelector('.reaction-bar');
  if (oldBar) oldBar.remove();
  
  const newBar = document.createElement('div');
  newBar.innerHTML = createReactionBar(messageId, reactions);
  messageEl.appendChild(newBar.firstChild);
}

function getColorForUser(username) {
  // Simple hash function to generate a consistent color based on username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = 'hsl(' + (hash % 360) + ', 50%, 65%)';
  return color;
}

function openEditModal(itemId, itemType) {
  const itemEl = document.getElementById(`msg-${itemId}`);
  const contentEl = itemEl?.querySelector('.text-bubble') || itemEl?.querySelector('.integrated-post-text');
  
  if (!contentEl) return;
  
  editingMessageId = itemId;
  editingItemType = itemType;
  
  const modal = document.getElementById('editMessageModal');
  const input = document.getElementById('editContentInput');
  const label = document.getElementById('editTypeLabel');
  
  if (modal && input && label) {
    // Clean content for editing (remove the "(edited)" tag)
    let content = contentEl.textContent.replace(/\s\(edited\)$/, '').trim();
    
    input.value = content;
    label.textContent = `Editing ${itemType === 'post' ? 'Post' : 'Message'}...`;
    modal.style.display = 'flex';
  }
}

async function saveEditedContent() {
  const modal = document.getElementById('editMessageModal');
  const input = document.getElementById('editContentInput');
  const newContent = input?.value.trim();
  
  if (!newContent) return showMessage('⚠️ Content cannot be empty', 'error');
  if (!editingMessageId) return closeModal('editMessageModal');
  
  try {
    showMessage('💾 Saving changes...', 'success');
    
    const endpoint = editingItemType === 'post' ? 
      `/api/posts/${editingMessageId}` : `/api/community/messages/${editingMessageId}`;
    
    const data = await apiCall(endpoint, 'PUT', { content: newContent });
    
    // Update UI locally immediately
    updateMessageInChat({ 
      oldId: editingMessageId, 
      id: editingMessageId, 
      content: newContent, 
      status: 'edited'
    });
    
    // If post, send update via socket (if backend doesn't handle)
    if (editingItemType === 'post' && socket) {
      socket.emit('item_updated', data.updatedItem);
    }
    
    closeModal('editMessageModal');
    showMessage(`✅ ${editingItemType} updated!`, 'success');
  } catch(error) {
    showMessage('❌ Failed to save edit: ' + error.message, 'error');
  } finally {
    editingMessageId = null;
    editingItemType = null;
  }
}

async function deleteFeedItem(itemId, itemType) {
  if (!confirm(`Delete this ${itemType}?`)) return;
  
  try {
    const itemEl = document.getElementById(`msg-${itemId}`);
    if (itemEl) {
      itemEl.style.opacity = '0.5';
      itemEl.style.pointerEvents = 'none';
    }
    
    const endpoint = itemType === 'post' ? 
      `/api/posts/${itemId}` : `/api/community/messages/${itemId}`;
    
    await apiCall(endpoint, 'DELETE');
    
    if (itemEl) {
      itemEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => itemEl.remove(), 300);
    }
    
    showMessage(`🗑️ ${itemType} deleted`, 'success');
  } catch(error) {
    console.error('Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
    
    const itemEl = document.getElementById(`msg-${itemId}`);
    if (itemEl) {
      itemEl.style.opacity = '1';
      itemEl.style.pointerEvents = 'auto';
    }
  }
}

async function toggleReaction(messageId, emoji) {
  try {
    const messageEl = event.target.closest('.chat-message');
    const reactionBar = messageEl.querySelector('.reaction-bar');
    const currentPill = reactionBar.querySelector(`.reaction-pill[data-emoji="${emoji}"]`);
    const isNew = !currentPill;
    
    // Optimistic UI Update
    if (currentPill && currentPill.classList.contains('selected')) {
      currentPill.classList.remove('selected');
      const countSpan = currentPill.querySelector('.reaction-count');
      const newCount = (parseInt(countSpan.textContent) || 1) - 1;
      if (newCount > 0) countSpan.textContent = newCount;
      else currentPill.remove();
    } else {
      // Check if the user already reacted with a different emoji (to replace it)
      reactionBar.querySelectorAll('.reaction-pill.selected').forEach(pill => {
        pill.classList.remove('selected');
        const countSpan = pill.querySelector('.reaction-count');
        const newCount = (parseInt(countSpan.textContent) || 1) - 1;
        if (newCount > 0) countSpan.textContent = newCount;
        else pill.remove();
      });
      
      if (isNew) {
        const newPill = document.createElement('div');
        newPill.className = 'reaction-pill selected';
        newPill.dataset.emoji = emoji;
        newPill.innerHTML = `<span class="emoji">${emoji}</span><span class="reaction-count">1</span>`;
        reactionBar.insertBefore(newPill, reactionBar.lastChild);
      } else {
        currentPill.classList.add('selected');
        const countSpan = currentPill.querySelector('.reaction-count');
        countSpan.textContent = (parseInt(countSpan.textContent) || 0) + 1;
      }
    }
    
    // API Call
    await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
  } catch (err) {
    console.error('Reaction failed', err);
    showMessage('❌ Failed to add reaction', 'error');
    // TODO: Rollback optimistic update on failure
  }
}

function createReactionBar(messageId, reactions) {
  const reactionCounts = {};
  const userReacted = {};
  
  if (reactions && Array.isArray(reactions)) {
    reactions.forEach(r => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      if (r.user_id && currentUser && r.user_id === currentUser.id) userReacted[r.emoji] = true;
    });
  }
  
  const defaultEmojis = ['❤️', '👍', '😂', '🔥'];
  const allEmojis = Array.from(new Set([...defaultEmojis, ...Object.keys(reactionCounts)]));
  
  let html = '<div class="reaction-bar">';
  allEmojis.forEach(emoji => {
    const count = reactionCounts[emoji] || 0;
    const selected = userReacted[emoji] ? 'selected' : '';
    html += `<div class="reaction-pill ${selected}" data-emoji="${emoji}" onclick="toggleReaction('${messageId}', '${emoji}')">
      <span class="emoji">${emoji}</span>
      ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
    </div>`;
  });
  html += `<div class="reaction-pill" onclick="showEmojiPickerForMessage(event, '${messageId}')" title="Add reaction">✚</div></div>`;
  return html;
}

function showEmojiPickerForMessage(e, messageId) {
  e.stopPropagation();
  // Simple inline picker
  const picker = document.createElement('div');
  picker.className = 'emoji-reaction-picker';
  picker.style.position = 'absolute';
  picker.style.bottom = '100%';
  picker.style.right = '0';
  picker.style.background = 'var(--color-bg-base)';
  picker.style.borderRadius = '10px';
  picker.style.padding = '5px';
  picker.style.zIndex = '50';
  picker.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  
  const emojis = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '😢', '👏', '🤝', '🙌', '⭐', '💯'];
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.style.cssText = 'background:none;border:none;cursor:pointer;padding:8px;font-size:20px;';
    btn.onclick = (event) => {
      event.stopPropagation();
      toggleReaction(messageId, emoji);
      picker.remove();
    };
    picker.appendChild(btn);
  });
  
  const messageEl = document.getElementById(`msg-${messageId}`);
  if (messageEl) {
    // Temporarily append to the message element for positioning
    messageEl.appendChild(picker);
    
    // Remove after a click outside
    setTimeout(() => {
      const closeHandler = (ev) => {
        if (!picker.contains(ev.target)) {
          picker.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 10);
  }
}

// Placeholder functions for new chat toolbar buttons
function openMediaAttachment() {
  showMessage('📎 Media attachment feature: Select files via post creator.', 'success');
  showPage('posts');
}

function openEmojiPicker(e) {
  e.stopPropagation();
  showMessage('😊 Emoji Picker: Placeholder activated.', 'success');
  // In a real app, this would show a large, functional emoji picker
}

function openGifPicker() {
  showMessage('GIF Picker: Placeholder activated.', 'success');
  // In a real app, this would show a GIF search modal
}

function handleTypingIndicator() {
  const now = Date.now();
  if (now - lastTypingEmit > 2000 && socket && currentUser && currentUser.college) {
    socket.emit('typing', { 
      collegeName: currentUser.college, 
      username: currentUser.username 
    });
    lastTypingEmit = now;
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (socket && currentUser && currentUser.college) {
      socket.emit('stop_typing', { 
        collegeName: currentUser.college, 
        username: currentUser.username 
      });
    }
  }, 3000);
}

function showTypingIndicator(username) {
  typingUsers.add(username);
  updateTypingDisplay();
}

function hideTypingIndicator(username) {
  typingUsers.delete(username);
  updateTypingDisplay();
}

function updateTypingDisplay() {
  const container = document.getElementById('typingIndicatorsContainer');
  const messagesBox = document.getElementById('chatMessages');
  
  if (!container || !messagesBox) return;
  
  if (typingUsers.size === 0) {
    container.innerHTML = '';
    return;
  }
  
  const usersList = Array.from(typingUsers);
  let text = '';
  
  if (usersList.length === 1) text = `${usersList[0]} is typing`;
  else if (usersList.length === 2) text = `${usersList[0]} and ${usersList[1]} are typing`;
  else text = `${usersList.length} people are typing`;
  
  container.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="typing-text">${text}</span>
        </div>
  `;
  
  // Scroll to bottom only if user is near the bottom
  if (messagesBox.scrollHeight - messagesBox.scrollTop - messagesBox.clientHeight < 100) {
    messagesBox.scrollTo({ top: messagesBox.scrollHeight, behavior: 'smooth' });
  }
}

function setupConnectionMonitor() {
  if (!socket) return;
  
  socket.on('connect', () => {
    updateLiveNotif(`Connected to ${currentUser.college}`);
  });
  
  socket.on('disconnect', () => {
    updateLiveNotif('⚠️ Connection Lost - Reconnecting...');
  });
}

function setupInfiniteScroll() {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;
  
  messagesEl.addEventListener('scroll', async () => {
    if (messagesEl.scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
      isLoadingMessages = true;
      const oldHeight = messagesEl.scrollHeight;
      
      try {
        const data = await apiCall(`/api/community/feed?page=${currentMessagePage + 1}`, 'GET');
        
        if (data.feed && data.feed.length > 0) {
          currentMessagePage++;
          const fragment = document.createDocumentFragment();
          
          data.feed.reverse().forEach(item => {
            fragment.appendChild(renderFeedItem(item));
          });
          messagesEl.insertBefore(fragment, messagesEl.firstChild);
          
          const newHeight = messagesEl.scrollHeight;
          messagesEl.scrollTop = newHeight - oldHeight;
        } else {
          hasMoreMessages = false;
        }
      } catch(error) {
        console.error('Load more feed items:', error);
      } finally {
        isLoadingMessages = false;
      }
    }
  });
}

function playMessageSound(type) {
  const sounds = {
    send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354.wav',
    receive: 'https://assets.mixkit.co/active_storage/sfx/2357/2357.wav',
    notification: 'https://assets.mixkit.co/active_storage/sfx/2358/2358.wav'
  };
  
  const audio = new Audio(sounds[type]);
  audio.volume = 0.2;
  audio.play().catch(() => {});
}

function setupEnhancedSocketListeners() {
  if (!socket) return;
  
  socket.on('new_message', (item) => {
    if (item.sender?.id !== currentUser.id) {
      appendFeedItemToChat(item);
    }
  });
  
  socket.on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username) {
      showTypingIndicator(data.username);
    }
  });
  
  socket.on('user_stop_typing', (data) => {
    if (data.username) hideTypingIndicator(data.username);
  });
  
  socket.on('message_deleted', ({ id }) => {
    const messageEl = document.getElementById(`msg-${id}`);
    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }
  });
  
  socket.on('item_updated', (item) => {
    // Re-render the specific item in place
    const oldItemEl = document.getElementById(`msg-${item.id}`);
    if (oldItemEl) {
      const newItemEl = renderFeedItem(item);
      oldItemEl.parentNode.replaceChild(newItemEl, oldItemEl);
    }
  });
  
  socket.on('reactions_updated', ({ id, reactions }) => {
    updateMessageReactions(id, reactions);
  });
}

function handleChatKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendEnhancedMessage();
  }
}

async function sendChatMessage() {
  await sendEnhancedMessage();
}

// ========================================
// COMMUNITIES & CHAT CONTROL
// ========================================

function loadCommunities() {
  const container = document.getElementById('communitiesContainer');
  const chatSection = document.getElementById('chatSection');
  
  if (!container || !chatSection) return;
  
  if (!currentUser || !currentUser.communityJoined) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Connect to college first!</p>
        <button class="home-nav-btn" onclick="showPage('home')">Explore</button>
      </div>
    `;
    chatSection.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <div class="community-card">
      <h3>${currentUser.college} Community</h3>
      <p>Share and chat with students</p>
      <button onclick="openCommunitySection()">Open Group</button>
    </div>
  `;
  chatSection.style.display = 'none';
}

function openCommunitySection() {
  const container = document.getElementById('communitiesContainer');
  const chatSection = document.getElementById('chatSection');
  const communityNameEl = document.getElementById('currentCommunityName');
  
  if (!chatSection || !currentUser.college) return;
  
  container.innerHTML = ''; // Hide the single card view
  chatSection.style.display = 'block';
  if (communityNameEl) communityNameEl.textContent = currentUser.college;
  
  loadCommunityFeed();
  initializeEnhancedChat();
}

async function loadCommunityFeed() {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;
  
  try {
    messagesEl.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">⏳ Loading Feed...</div>';
    
    // Assuming a new API endpoint that returns a combined, sorted feed
    // NOTE: This API call should return both 'message' and 'post' type items, 
    // each with necessary metadata (sender, content, timestamp, etc.)
    const data = await apiCall('/api/community/feed', 'GET');
    
    if (!data.feed || data.feed.length === 0) {
      messagesEl.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Start the conversation!</div>';
      return;
    }
    
    messagesEl.innerHTML = '';
    data.feed.forEach(item => appendFeedItemToChat(item));
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch(error) {
    console.error('Load community feed:', error);
    messagesEl.innerHTML = '<div style="text-align:center;padding:20px;color:#ff6b6b;">❌ Failed to load community feed.</div>';
  }
}

// ========================================
// COLLEGE VERIFICATION & OTHER FUNCTIONS
// ========================================

function selectUniversity(type) {
  currentType = type;
  currentPage = 1;
  allColleges = colleges[type];
  
  const titles = {
    nit: 'National Institutes of Technology', 
    iit: 'Indian Institutes of Technology', 
    vit: 'VIT Colleges', 
    other: 'Other Universities'
  };
  
  const title = document.getElementById('collegeTitle');
  if (title) title.textContent = titles[type];
  
  const home = document.getElementById('home');
  const list = document.getElementById('collegeList');
  
  if (home) home.style.display = 'none';
  if (list) list.style.display = 'block';
  
  showColleges();
}

function showColleges() {
  const list = allColleges;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const page = list.slice(start, end);
  
  let html = '';
  page.forEach(c => {
    const isConnected = currentUser && currentUser.college === c.name;
    html += `
      <div class="college-item">
        <h3>${c.name}</h3>
        <p>${c.location}</p>
        ${isConnected ? 
          '<button class="verified" disabled>✓ Connected</button>' : 
          `<button onclick="openVerify('${c.name}','${c.email}')">Connect</button>`
        }
        </div>
    `;
  });
  
  const container = document.getElementById('collegeContainer');
  if (container) container.innerHTML = html;
}

function searchColleges() {
  const searchInput = document.getElementById('searchCollege');
  if (!searchInput) return;
  
  const search = searchInput.value.toLowerCase();
  const filtered = colleges[currentType].filter(c => 
    c.name.toLowerCase().includes(search) || 
    c.location.toLowerCase().includes(search)
  );
  
  allColleges = filtered;
  currentPage = 1;
  showColleges();
}

function backToUniversities() {
  const list = document.getElementById('collegeList');
  const home = document.getElementById('home');
  
  if (list) list.style.display = 'none';
  if (home) home.style.display = 'block';
}

function openVerify(name, emailDomain) {
  if (currentUser && currentUser.college) {
    showMessage('⚠️ Already connected to ' + currentUser.college, 'error');
    return;
  }
  
  currentVerifyCollege = {name, emailDomain};
  
  const modalHtml = `
    <div class="modal-box">
      <span class="close" onclick="closeModal('verifyModal')">&times;</span>
      <h2>Verify College</h2>
      <p>Enter your college email</p>
      <p style="color:#888;font-size:13px;">Must end with: ${emailDomain}</p>
      <input type="email" id="verifyEmail" placeholder="your.email${emailDomain}">
      <button onclick="requestVerificationCode()">Send Code</button>
      <div id="codeSection" style="display:none;margin-top:20px;">
        <input type="text" id="verifyCode" placeholder="6-digit code" maxlength="6">
        <button onclick="verifyCollegeCode()">Verify</button>
      </div>
    </div>
  `;
  
  const modal = document.getElementById('verifyModal');
  if (modal) {
    modal.innerHTML = modalHtml;
    modal.style.display = 'flex';
  }
}

async function requestVerificationCode() {
  const emailInput = document.getElementById('verifyEmail');
  if (!emailInput) return;
  
  const email = emailInput.value.trim();
  if (!email) return showMessage('⚠️ Enter email', 'error');
  
  if (!email.endsWith(currentVerifyCollege.emailDomain)) {
    return showMessage('⚠️ Must end with ' + currentVerifyCollege.emailDomain, 'error');
  }
  
  try {
    showMessage('📧 Sending code...', 'success');
    await apiCall('/api/college/request-verification', 'POST', {
      collegeName: currentVerifyCollege.name, 
      collegeEmail: email
    });
    
    showMessage('✅ Code sent to ' + email, 'success');
    const codeSection = document.getElementById('codeSection');
    if (codeSection) codeSection.style.display = 'block';
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyCollegeCode() {
  const codeInput = document.getElementById('verifyCode');
  if (!codeInput) return;
  
  const code = codeInput.value.trim();
  if (!code || code.length !== 6) return showMessage('⚠️ Enter 6-digit code', 'error');
  
  try {
    showMessage('🔐 Verifying...', 'success');
    const data = await apiCall('/api/college/verify', 'POST', { code });
    
    showMessage('🎉 ' + data.message, 'success');
    currentUser.college = data.college;
    currentUser.communityJoined = true;
    currentUser.badges = data.badges;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    closeModal('verifyModal');
    initializeSocket();
    
    setTimeout(() => {
      showPage('communities');
      updateLiveNotif('Connected to ' + data.college);
    }, 1500);
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

// ... (Rest of JS methods - loadPosts, deletePost, toggleLike, etc. are retained but not displayed here for brevity)

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
  
  if (modalId === 'cropEditorModal' && cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function showMessage(text, type) {
  const box = document.getElementById('message');
  
  if (!box) {
    console.log('Message:', text);
    return;
  }
  
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  
  box.innerHTML = '';
  box.appendChild(div);
  
  setTimeout(() => {
    if (div.parentNode) div.remove();
  }, 4000);
}

function updateLiveStats() {
  const onlineCount = Math.floor(Math.random() * 300) + 150;
  const postsToday = Math.floor(Math.random() * 500) + 200;
  const activeChats = Math.floor(Math.random() * 100) + 50;
  
  const elements = {
    'liveUsersCount': onlineCount + ' Active',
    'heroOnline': onlineCount,
    'heroPostsToday': postsToday,
    'heroChats': activeChats,
    'footerUsers': onlineCount
  };
  
  Object.keys(elements).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = elements[id];
  });
}

function updateOnlineCount(count) {
  const elements = ['liveUsersCount', 'heroOnline', 'chatOnlineCount', 'footerUsers'];
  
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'liveUsersCount') el.textContent = count + ' Active';
      else if (id === 'chatOnlineCount') el.textContent = count;
      else el.textContent = count;
    }
  });
}

function updateLiveNotif(text) {
  const notif = document.getElementById('notifText');
  if (notif) notif.textContent = text;
}

function toggleOptionsMenu() {
  const menu = document.getElementById('optionsMenu');
  const hamburger = document.getElementById('hamburgerMenu');
  
  if (hamburger) hamburger.style.display = 'none';
  if (menu) menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  
  if (options) options.style.display = 'none';
  if (menu) menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
}

function showComplaintModal() {
  const modal = document.getElementById('complaintModal');
  if (modal) modal.style.display = 'flex';
  
  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

function showContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.style.display = 'flex';
  
  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

function showFeedbackModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="modal-box">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>📢 Feedback</h2>
      <p style="color:#888;margin-bottom:20px;">We'd love to hear from you!</p>
      <input type="text" id="feedbackSubject" placeholder="Subject" style="margin-bottom:15px;">
      <textarea id="feedbackMessage" placeholder="Your feedback..." 
        style="width:100%;min-height:120px;padding:12px;background:rgba(20,30,50,0.6);
        border:1px solid rgba(79,116,163,0.3);border-radius:10px;color:white;
        font-family:inherit;resize:vertical;"></textarea>
      <button onclick="submitFeedback()" style="width:100%;margin-top:15px;">📤 Send</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

async function submitFeedback() {
  const subject = document.getElementById('feedbackSubject')?.value.trim();
  const message = document.getElementById('feedbackMessage')?.value.trim();
  
  if (!subject || !message) return showMessage('⚠️ Fill all fields', 'error');
  
  try {
    await apiCall('/api/feedback', 'POST', { subject, message });
    showMessage('✅ Thank you!', 'success');
    document.querySelector('.modal')?.remove();
  } catch(error) {
    showMessage('❌ Failed', 'error');
  }
}

function submitComplaint() {
  const text = document.getElementById('complaintText')?.value.trim();
  
  if (text) {
    showMessage('✅ Submitted!', 'success');
    const input = document.getElementById('complaintText');
    if (input) input.value = '';
    closeModal('complaintModal');
  } else {
    showMessage('⚠️ Enter details', 'error');
  }
}

function toggleTheme() {
  const body = document.body;
  
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  }
  
  showMessage('🎨 Theme changed!', 'success');
  
  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

function loadTrending() {
  const container = document.getElementById('trendingContainer');
  if (!container) return;
  
  const trending = [
    { title: 'Campus Fest 2025', badge: 'Hot', text: 'Annual cultural festival starting next week!', likes: 234, comments: 45 },
    { title: 'Study Groups', badge: 'New', text: 'Join semester exam preparation groups', likes: 156, comments: 23 },
    { title: 'Sports Week', badge: 'Popular', text: 'Inter-college sports competition registrations open', likes: 189, comments: 67 }
  ];
  
  let html = '';
  
  trending.forEach(item => {
    html += `
      <div class="trending-card">
        <div class="trending-card-header">
          <div class="trending-title">${item.title}</div>
          <div class="trending-badge">${item.badge}</div>
        </div>
        <div class="trending-text">${item.text}</div>
        <div class="trending-footer">
          <div class="trending-engagement">
            <div class="engagement-item">❤️ ${item.likes}</div>
            <div class="engagement-item">💬 ${item.comments}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function loadRewardsPage() {
  const container = document.getElementById('rewards');
  if (!container) return;
  
  const userPoints = currentUser?.rewardPoints || 0;
  
  let html = `
    <div style="text-align:center;margin-bottom:40px;">
      <h2 style="font-size:36px;color:#4f74a3;">🎁 Rewards</h2>
      <div style="margin:30px auto;padding:30px;background:linear-gradient(135deg,rgba(79,116,163,0.2),rgba(141,164,211,0.2));
        border:2px solid #4f74a3;border-radius:20px;max-width:400px;">
        <div style="font-size:48px;font-weight:800;color:#4f74a3;">${userPoints}</div>
        <div style="font-size:14px;color:#888;">YOUR POINTS</div>
      </div>
    </div>
    
    <div style="margin-bottom:50px;">
      <h3 style="color:#4f74a3;font-size:24px;margin-bottom:20px;">📋 Daily Tasks</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
  `;
  
  rewardsData.dailyTasks.forEach(task => {
    html += `
      <div class="reward-task-card ${task.completed ? 'completed' : ''}" onclick="completeTask('${task.id}')">
        <div style="font-size:48px;margin-bottom:15px;">${task.icon}</div>
        <h4 style="color:#4f74a3;font-size:18px;margin-bottom:8px;">${task.title}</h4>
        <p style="color:#888;font-size:14px;margin-bottom:15px;">${task.desc}</p>
        <div style="display:flex;justify-content:space-between;">
          <span style="background:linear-gradient(135deg,#4f74a3,#8da4d3);color:white;
            padding:6px 16px;border-radius:20px;font-weight:600;font-size:13px;">+${task.reward} pts</span>
          ${task.completed ? 
            '<span style="color:#22c55e;">✓ Done</span>' : 
            '<span style="color:#888;">Click to complete</span>'
          }
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
    
    <div>
      <h3 style="color:#4f74a3;font-size:24px;margin-bottom:20px;">🏆 Achievements</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
  `;
  
  rewardsData.achievements.forEach(achievement => {
    const progress = Math.min(100, (achievement.progress / achievement.target) * 100);
    
    html += `
      <div class="achievement-card">
        <div style="font-size:56px;margin-bottom:15px;">${achievement.icon}</div>
        <h4 style="color:#4f74a3;font-size:20px;margin-bottom:8px;">${achievement.title}</h4>
        <p style="color:#888;font-size:14px;margin-bottom:15px;">${achievement.desc}</p>
        <div class="progress-bar" style="background:rgba(79,116,163,0.2);height:8px;border-radius:10px;overflow:hidden;margin-bottom:10px;">
          <div style="background:linear-gradient(135deg,#4f74a3,#8da4d3);height:100%;width:${progress}%;
            transition:width 0.5s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;">
          <span style="color:#888;">${achievement.progress} / ${achievement.target}</span>
          <span style="color:#4f74a3;font-weight:600;">+${achievement.reward} pts</span>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

function completeTask(taskId) {
  const task = rewardsData.dailyTasks.find(t => t.id === taskId);
  if (!task) return;
  
  if (task.completed) {
    showMessage('⚠️ Already completed', 'error');
    return;
  }
  
  task.completed = true;
  showMessage(`✅ +${task.reward} points earned!`, 'success');
  loadRewardsPage();
}

function showPostCelebrationModal(postCount) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  let milestone = '';
  if (postCount === 1) milestone = '🎉 First Post!';
  else if (postCount === 10) milestone = '🎉 10 Posts!';
  else if (postCount === 50) milestone = '🎉 50 Posts!';
  else if (postCount === 100) milestone = '🎉 100 Posts!';
  
  modal.innerHTML = `
    <div class="modal-box" style="text-align:center;max-width:400px;">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <div style="font-size:80px;margin:20px 0;">🎊</div>
      <h2 style="color:#4f74a3;font-size:32px;margin-bottom:15px;">${milestone || 'Post Shared!'}</h2>
      <p style="color:#888;font-size:16px;margin-bottom:25px;">
        Your content is now live! Keep sharing your amazing moments.
      </p>
      <div style="background:linear-gradient(135deg,rgba(79,116,163,0.2),rgba(141,164,211,0.2));
        padding:20px;border-radius:15px;margin-bottom:20px;">
        <div style="font-size:36px;font-weight:800;color:#4f74a3;">${postCount}</div>
        <div style="font-size:14px;color:#888;">Total Posts</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
        style="width:100%;padding:14px;background:linear-gradient(135deg,#4f74a3,#8da4d3);
        color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;">
        Awesome! 🚀
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ... (Rest of the JS, including loadPosts, loadTrending, utility functions, etc.)

// ========================================
// CONSOLE LOG - INITIALIZATION COMPLETE
// ========================================

console.log('%c🎉 VibeXpert Enhanced Chat Ready! 🎉', 'color: #4f74a3; font-size: 20px; font-weight: bold;');
console.log('%cFeatures: Real-time chat, Reactions, Typing indicators, Message actions', 'color: #8da4d3; font-size: 14px;');
