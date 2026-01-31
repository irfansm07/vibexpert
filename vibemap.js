// ========================================
// VIBEXPERT - COMPLETE FIXED JAVASCRIPT
// Enhanced Community Chat + All Features
// CHAT FIXES: Duplicate messages removed, typing indicators fixed, scroll optimized
// ========================================

const API_URL = 'https://vibexpert-backend-main.onrender.com';

// ==========================================
// GLOBAL VARIABLES
// ==========================================

// Core User & App State
let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];
let socket = null;

// Post Creation
let selectedFiles = [];
let previewUrls = [];
let selectedMusic = null;
let selectedStickers = [];
let cropper = null;
let selectedPostDestination = 'profile';
let currentEditIndex = -1;
let currentCropIndex = -1;
let currentFilters = {};

// Search & Comments
let searchTimeout = null;
let currentCommentPostId = null;

// About Page
let hasScrolledToBottom = false;
let scrollCheckEnabled = true;
let scrollProgressIndicator = null;

// ✅ CHAT FIXES: Consolidated chat variables
let messageCache = new Set();           // Track message IDs to prevent duplicates
let isLoadingMessages = false;          // Prevent multiple simultaneous loads
let typingUsersSet = new Set();         // Track who is typing
let typingIndicatorTimeout = null;      // Timeout for typing indicator
let lastTypingEmit = 0;                 // Throttle typing events

// Emoji & Voice
let emojiPickerVisible = false;
let currentEmojiCategory = 'emotions';
let voiceRecorder = null;
let voiceRecordingStartTime = null;
let voiceRecordingTimer = null;
let voiceRecordingStream = null;
let voiceAudioChunks = [];
let isVoiceRecording = false;

// Message Reactions
let messageReactions = new Map;
let hasMoreMessages = true;
let currentMessagePage = 1;
let lastMessageTime = Date.now();
let connectionStatus = 'connected';
let chatInitialized = false;

// Post Media
let newPostMediaFiles = [];
let editingMessageId = null;
let editTimeout = null;
let profilePhotoActionsVisible = false;

// RealVibe
let realVibeMediaFile = null;
let realVibeMediaType = null;

// ==========================================
// DATA STRUCTURES
// ==========================================

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
    {name: 'NIT Bhopal', email: '@stu.manit.ac.in', location: 'Bhopal'},
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

const roadmapLevels = {
  wood: {
    name: 'Wood League',
    color: '#8B4513',
    icon: '🪵',
    position: 80,
    requirements: { posts: 5, comments: 10, likes: 20, days_active: 3 },
    rewards: ['Wood Badge', '50 Points', 'Basic Avatar Frame']
  },
  bronze: {
    name: 'Bronze League',
    color: '#CD7F32',
    icon: '🥉',
    position: 480,
    requirements: { posts: 15, comments: 30, likes: 50, days_active: 7 },
    rewards: ['Bronze Badge', '150 Points', 'Bronze Avatar Frame']
  },
  silver: {
    name: 'Silver League',
    color: '#C0C0C0',
    icon: '🥈',
    position: 880,
    requirements: { posts: 50, comments: 100, likes: 200, days_active: 15 },
    rewards: ['Silver Badge', '500 Points', 'Silver Avatar Frame']
  },
  gold: {
    name: 'Gold League',
    color: '#FFD700',
    icon: '🥇',
    position: 1280,
    requirements: { posts: 100, comments: 250, likes: 500, days_active: 30 },
    rewards: ['Gold Badge', '1000 Points', 'Gold Avatar Frame', 'VIP Status']
  }
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 VibeXpert initializing...');

  const token = getToken();
  const saved = localStorage.getItem('user');

  if (token && saved) {
    try {
      currentUser = JSON.parse(saved);
      
      if (currentUser && currentUser.username) {
        document.body.classList.add('logged-in');
        const aboutPage = document.getElementById('aboutUsPage');
        const mainPage = document.getElementById('mainPage');
        const authPopup = document.getElementById('authPopup');
        
        if (aboutPage) aboutPage.style.display = 'none';
        if (mainPage) mainPage.style.display = 'block';
        if (authPopup) authPopup.style.display = 'none';
        
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = 'Hi, ' + currentUser.username;
        
        if (currentUser.college) {
          updateLiveNotif(`Connected to ${currentUser.college}`);
          initializeSocket();
        }
        
        updateProfileAvatar();
        updatePremiumBadge();
      } else {
        showAboutUsPage();
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
  initializeMenuSearch();
  initFireworks();
  
  console.log('✅ VibeXpert Initialized');
});

// ========================================
// UTILITY FUNCTIONS
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

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

function updateLiveNotif(text) {
  const notif = document.getElementById('notifText');
  if (notif) notif.textContent = text;
}

function updateOnlineCount(count) {
  const elements = ['liveUsersCount', 'heroOnline', 'onlineCount', 'footerUsers'];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'liveUsersCount') el.textContent = count + ' Active';
      else el.textContent = count;
    }
  });
}

function initializeMusicPlayer() {
  window.musicPlayer = new Audio();
  window.musicPlayer.volume = 0.5;
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

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
  return date.toLocaleDateString();
}

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

// Continue in next part...
// ========================================
// AUTHENTICATION & USER MANAGEMENT
// ========================================

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
    currentUser.postCount = currentUser.postCount || 0;
    currentUser.commentCount = currentUser.commentCount || 0;
    currentUser.likeCount = currentUser.likeCount || 0;
    currentUser.daysActive = currentUser.daysActive || 1;
    currentUser.currentLevel = currentUser.currentLevel || 'wood';
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
      updateProfileAvatar();
      updatePremiumBadge();
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

function updateProfileAvatar() {
  if (!currentUser) return;
  const avatarImg = document.getElementById('profileAvatarImg');
  const avatarInitial = document.getElementById('profileAvatarInitial');
  const userName = document.getElementById('userName');
  if (userName) userName.textContent = currentUser.username || 'User';
  if (currentUser.profile_pic && avatarImg && avatarInitial) {
    avatarImg.src = currentUser.profile_pic;
    avatarImg.style.display = 'block';
    avatarInitial.style.display = 'none';
  } else if (avatarInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    avatarInitial.textContent = initial;
  }
}

function updatePremiumBadge() {
  const userName = document.getElementById('userName');
  if (!userName) return;
  const subscription = checkSubscriptionStatus();
  if (subscription) {
    const planEmoji = subscription.plan === 'royal' ? '👑' : '🥈';
    userName.innerHTML = `${planEmoji} Hi, ${currentUser.username}`;
  } else {
    userName.textContent = 'Hi, ' + currentUser.username;
  }
}

function checkSubscriptionStatus() {
  if (!currentUser || !currentUser.subscription) return null;
  const now = new Date();
  const endDate = new Date(currentUser.subscription.endDate);
  if (now > endDate) {
    currentUser.isPremium = false;
    currentUser.subscription = null;
    localStorage.setItem('user', JSON.stringify(currentUser));
    return null;
  }
  return currentUser.subscription;
}

// ========================================
// ✅ WHATSAPP CHAT SYSTEM - FIXED VERSION
// No Duplicates, Proper Scrolling, Working Typing Indicators
// ========================================

// ==========================================
// CORE CHAT FUNCTIONS
// ==========================================

function scrollToBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }
}

function isWhatsAppAtBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return true;
  const threshold = 100;
  const position = messagesEl.scrollTop + messagesEl.clientHeight;
  const bottom = messagesEl.scrollHeight;
  return (bottom - position) < threshold;
}

// ✅ FIXED: Single appendWhatsAppMessage with triple duplicate check
function appendWhatsAppMessage(msg) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));
  
  // ✅ CHECK 1: Cache
  if (!msg.isTemp && messageCache.has(messageId)) {
    console.log('⚠️ Duplicate (cache):', messageId);
    return;
  }
  
  // ✅ CHECK 2: DOM
  if (document.getElementById(`wa-msg-${messageId}`)) {
    console.log('⚠️ Duplicate (DOM):', messageId);
    return;
  }
  
  const isOwn = msg.sender_id === currentUser?.id;
  
  // ✅ CHECK 3: Recent content (for own messages)
  if (!msg.isTemp && isOwn) {
    const recent = Array.from(messagesEl.querySelectorAll('.whatsapp-message.own'))
      .filter(el => parseInt(el.dataset.timestamp || 0) > Date.now() - 2000);
    
    if (recent.some(el => el.querySelector('.message-text')?.textContent === (msg.text || msg.content))) {
      console.log('⚠️ Duplicate (content):', messageId);
      return;
    }
  }

  // Add to cache
  if (!msg.isTemp) messageCache.add(messageId);

  // Check scroll position BEFORE adding message
  const wasAtBottom = isWhatsAppAtBottom();

  // Create message element
  const sender = msg.users?.username || 'User';
  const time = new Date(msg.timestamp || msg.created_at || Date.now());
  const timeLabel = time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now();

  wrapper.innerHTML = `
    ${!isOwn ? `<div class="message-sender-name">${escapeHtml(sender)}</div>` : ''}
    <div class="message-bubble">
      <div class="message-text">${escapeHtml(msg.text || msg.content || '')}</div>
      <div class="message-meta">
        <span class="message-time">${timeLabel}</span>
        ${isOwn ? `<span class="message-status">${msg.isTemp ? '⏳' : '✓✓'}</span>` : ''}
      </div>
    </div>
  `;

  messagesEl.appendChild(wrapper);

  // ✅ Smart scroll: only if user was at bottom OR it's own message
  if (isOwn || wasAtBottom) {
    setTimeout(() => scrollToBottom(), 50);
  }

  // Play sound (not for own or temp messages)
  if (!isOwn && !msg.isTemp) {
    playMessageSound('receive');
  }
}

// ✅ FIXED: Send message with optimistic UI
async function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();
  
  if (!content) return;
  if (!currentUser) return;

  try {
    // 1. Clear input IMMEDIATELY
    const originalContent = content;
    input.value = '';
    input.style.height = 'auto';

    // 2. Stop typing indicator
    if (socket && currentUser.college) {
      socket.emit('stop_typing', { 
        collegeName: currentUser.college, 
        username: currentUser.username 
      });
    }

    // 3. Create unique temp ID
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const tempMessage = {
      id: tempId,
      content: originalContent,
      sender_id: currentUser.id,
      users: {
        username: currentUser.username,
        profile_pic: currentUser.profile_pic
      },
      timestamp: new Date(),
      text: originalContent,
      isTemp: true
    };

    // 4. Show optimistic message
    appendWhatsAppMessage(tempMessage);

    // 5. Send to server (backend will broadcast to others, NOT back to us)
    const response = await apiCall('/api/community/messages', 'POST', { 
      content: originalContent 
    });
    
    if (response.success && response.message) {
      // 6. Remove temp message
      const tempEl = document.getElementById(`wa-msg-${tempId}`);
      if (tempEl) {
        console.log(`🗑️ Removing temp: ${tempId}`);
        tempEl.remove();
      }
      
      // 7. Add real message from API response
      console.log(`✅ Adding real: ${response.message.id}`);
      appendWhatsAppMessage(response.message);
      
      playMessageSound('send');
    }
  } catch(error) {
    console.error('❌ Send error:', error);
    
    // Remove temp on error
    const tempEl = document.querySelector('[id^="wa-msg-temp-"]');
    if (tempEl) tempEl.remove();
    
    // Restore input
    input.value = originalContent;
    showMessage('❌ Failed to send message', 'error');
  }
}

function handleWhatsAppKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendWhatsAppMessage();
  }
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
}

// ✅ FIXED: Typing indicator
function handleWhatsAppTyping() {
  if (!socket || !currentUser || !currentUser.college) return;
  
  const now = Date.now();
  
  // Emit typing event (throttled to every 2 seconds)
  if (now - lastTypingEmit > 2000) {
    socket.emit('typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
    lastTypingEmit = now;
  }

  // Clear existing timeout
  clearTimeout(typingIndicatorTimeout);

  // Stop typing after 3 seconds of inactivity
  typingIndicatorTimeout = setTimeout(() => {
    socket.emit('stop_typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  }, 3000);
}

function showWhatsAppTypingIndicator(username) {
  if (!username || username === currentUser?.username) return;
  typingUsersSet.add(username);
  updateWhatsAppTypingDisplay();
}

function hideWhatsAppTypingIndicator(username) {
  typingUsersSet.delete(username);
  updateWhatsAppTypingDisplay();
}

function updateWhatsAppTypingDisplay() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  // Remove existing indicator
  const existingIndicator = document.getElementById('typing-indicator');
  if (existingIndicator) existingIndicator.remove();

  // If no one is typing, exit
  if (typingUsersSet.size === 0) return;

  // Create typing indicator
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'whatsapp-typing-indicator';

  const usersList = Array.from(typingUsersSet);
  let text = '';

  if (usersList.length === 1) {
    text = `${usersList[0]} is typing`;
  } else if (usersList.length === 2) {
    text = `${usersList[0]} and ${usersList[1]} are typing`;
  } else {
    text = `${usersList.length} people are typing`;
  }

  indicator.innerHTML = `
    <div class="typing-bubble">
      <span>${text}</span>
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  messagesEl.appendChild(indicator);
  scrollToBottom();
}

async function loadWhatsAppMessages() {
  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('whatsappMessages');
    
    if (!messagesEl) return;

    // Clear
    messagesEl.innerHTML = '';
    messageCache.clear();

    if (!data.messages?.length) {
      messagesEl.innerHTML = `
        <div class="no-messages">
          <div style="font-size:64px;">👋</div>
          <h3>Welcome to Community Chat!</h3>
          <p>Say hi to your college community</p>
        </div>
      `;
      return;
    }

    // Load messages
    data.messages.forEach(msg => appendWhatsAppMessage(msg));
    
    // Scroll to bottom
    setTimeout(() => scrollToBottom(), 100);
    
  } catch(error) {
    console.error('Load error:', error);
  }
}

async function deleteWhatsAppMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');
    
    const messageEl = document.getElementById(`wa-msg-${messageId}`);
    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }
    
    showMessage('🗑️ Message deleted', 'success');
  } catch(error) {
    console.error('Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
  }
}

// ========================================
// SOCKET.IO INITIALIZATION
// ========================================

function initializeSocket() {
  if (socket) {
    console.log('⚠️ Socket already initialized');
    return;
  }

  socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
    
    if (currentUser) {
      socket.emit('user_online', currentUser.id);
      
      if (currentUser.college) {
        socket.emit('join_college', currentUser.college);
      }
    }
  });

  // ✅ CRITICAL: Single listener for new messages
  socket.on('new_message', (message) => {
    console.log('📨 Received:', message.id);
    
    // Double-check not own message
    if (message.sender_id === currentUser?.id) {
      console.log('⚠️ Ignoring own message');
      return;
    }
    
    appendWhatsAppMessage(message);
  });

  socket.on('user_typing', (data) => {
    if (data.username && data.username !== currentUser?.username) {
      showWhatsAppTypingIndicator(data.username);
    }
  });

  socket.on('user_stop_typing', (data) => {
    if (data.username) {
      hideWhatsAppTypingIndicator(data.username);
    }
  });

  socket.on('message_deleted', ({ id }) => {
    const el = document.getElementById(`wa-msg-${id}`);
    if (el) el.remove();
  });

  socket.on('online_count', (count) => {
    updateOnlineCount(count);
  });

  socket.on('disconnect', () => {
    console.log('👋 Socket disconnected');
  });

  socket.on('reconnect', () => {
    console.log('🔄 Socket reconnected');
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
    }
  });
}

// ✅ Initialize chat fixes when community page loads
function initWhatsAppChatFixes() {
  console.log('🔧 Initializing WhatsApp Chat Fixes...');

  if (!socket) {
    console.error('❌ Socket not initialized');
    return;
  }

  // Clear cache
  messageCache.clear();

  // Setup input handlers
  const input = document.getElementById('whatsappInput');
  if (input) {
    // Remove old listeners
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Add new listeners
    newInput.addEventListener('input', (e) => {
      handleWhatsAppTyping();
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    });

    newInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendWhatsAppMessage();
      }
    });
  }

  console.log('✅ WhatsApp Chat Fixes Initialized!');
}
