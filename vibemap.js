// ========================================
// ABOUT US PAGE FUNCTIONALITY
// Add this at the BEGINNING of vibemap.js
// ========================================

let hasScrolledToBottom = false;
let scrollCheckEnabled = true;

// Initialize About Us Page on load
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 VibeXpert initializing...');
  
  // Check if user is already logged in
  const token = getToken();
  const saved = localStorage.getItem('user');
  
  if (token && saved) {
    // User is logged in - hide about page, show main page
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
    // User not logged in - show about page
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

function showAboutUsPage() {
  const aboutPage = document.getElementById('aboutUsPage');
  const mainPage = document.getElementById('mainPage');
  if (aboutPage) aboutPage.style.display = 'block';
  if (mainPage) mainPage.style.display = 'none';
  
  // Initialize about page features
  initScrollProgress();
  initRevealOnScroll();
  initStatsCounter();
  initScrollDetection();
}

// Scroll Progress Bar
function initScrollProgress() {
  const aboutPage = document.getElementById('aboutUsPage');
  if (!aboutPage) return;
  
  aboutPage.addEventListener('scroll', updateScrollProgress);
  window.addEventListener('scroll', updateScrollProgress);
}

function updateScrollProgress() {
  const aboutPage = document.getElementById('aboutUsPage');
  if (!aboutPage) return;
  
  const scrollTop = aboutPage.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = aboutPage.scrollHeight || document.documentElement.scrollHeight;
  const clientHeight = aboutPage.clientHeight || window.innerHeight;
  
  const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
  
  const progressFill = document.getElementById('scrollProgressFill');
  if (progressFill) {
    progressFill.style.width = scrolled + '%';
  }
  
  // Check if scrolled to bottom
  if (scrollCheckEnabled && scrolled >= 95 && !hasScrolledToBottom) {
    hasScrolledToBottom = true;
    showAuthPopup();
  }
}

// Reveal on Scroll Animation
function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

// Animated Stats Counter
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
  }, {
    threshold: 0.5
  });
  
  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
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

// Scroll Detection for Auth Popup
function initScrollDetection() {
  const aboutPage = document.getElementById('aboutUsPage');
  if (!aboutPage) return;
  
  // Listen for scroll events
  aboutPage.addEventListener('scroll', checkScrollPosition);
  window.addEventListener('scroll', checkScrollPosition);
}

function checkScrollPosition() {
  if (!scrollCheckEnabled || hasScrolledToBottom) return;
  
  const aboutPage = document.getElementById('aboutUsPage');
  if (!aboutPage) return;
  
  const scrollTop = aboutPage.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = aboutPage.scrollHeight || document.documentElement.scrollHeight;
  const clientHeight = aboutPage.clientHeight || window.innerHeight;
  
  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
  
  // Show auth popup when user reaches 95% of page
  if (scrollPercentage >= 97) {
    hasScrolledToBottom = true;
    showAuthPopup();
  }
}

// Show Auth Popup
function showAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    scrollCheckEnabled = false; // Disable further scroll checks
  }
}

// Close Auth Popup
function closeAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    scrollCheckEnabled = true; // Re-enable scroll checks
    hasScrolledToBottom = false; // Reset flag
  }
}

// Override existing login function to hide about page after successful login
const originalLogin = typeof login !== 'undefined' ? login : null;

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
      // Hide about page and auth popup
      const aboutPage = document.getElementById('aboutUsPage');
      const authPopup = document.getElementById('authPopup');
      const mainPage = document.getElementById('mainPage');
      
      if (aboutPage) aboutPage.style.display = 'none';
      if (authPopup) authPopup.style.display = 'none';
      if (mainPage) mainPage.style.display = 'block';
      
      document.body.style.overflow = 'auto';
      
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

// Override existing logout function to show about page
const originalLogout = typeof logout !== 'undefined' ? logout : null;

function logout() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUser = null;
  localStorage.clear();
  
  // Show about page instead of login page
  const aboutPage = document.getElementById('aboutUsPage');
  const mainPage = document.getElementById('mainPage');
  
  if (aboutPage) aboutPage.style.display = 'block';
  if (mainPage) mainPage.style.display = 'none';
  
  showMessage('👋 Logged out', 'success');
  
  // Reset scroll detection
  hasScrolledToBottom = false;
  scrollCheckEnabled = true;
  
  // Scroll to top of about page
  window.scrollTo(0, 0);
  if (aboutPage) aboutPage.scrollTo(0, 0);
}

// Override signup to handle about page
async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const registrationNumber = document.getElementById('signupReg')?.value.trim();
  const password = document.getElementById('signupPass')?.value;
  const confirm = document.getElementById('signupConfirm')?.value;
  
  if(!username || !email || !registrationNumber || !password || !confirm) {
    return showMessage('Fill all fields', 'error');
  }
  if(password !== confirm) return showMessage('Passwords don\'t match', 'error');
  
  try {
    showMessage('Creating account...', 'success');
    await apiCall('/api/register', 'POST', { username, email, password, registrationNumber });
    showMessage('🎉 Account created! Check email', 'success');
    const form = document.getElementById('signupForm');
    if (form) form.reset();
    setTimeout(() => goLogin(null), 2000);
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

// Helper function to check if user is on about page
function isOnAboutPage() {
  const aboutPage = document.getElementById('aboutUsPage');
  return aboutPage && aboutPage.style.display !== 'none';
}

// Add smooth scroll for anchor links
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Prevent popup close when clicking inside auth box
document.addEventListener('click', function(e) {
  const authPopup = document.getElementById('authPopup');
  const authBox = document.querySelector('.auth-box');
  
  if (authPopup && authPopup.style.display === 'flex') {
    if (authBox && authBox.contains(e.target)) {
      e.stopPropagation();
    }
  }
});

console.log('✅ About Us page functionality loaded');

// ========================================
// CONTINUE WITH ORIGINAL VIBEMAP.JS CODE
// ========================================

// All your existing VibeXpert code continues here...
// (The rest of the original vibemap.js file)


















// VIBEXPERT - COMPLETE FIXED VERSION WITH ALL FEATURES

const API_URL = 'https://vibexpert-backend-main.onrender.com';

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
let editTimeout = null;
let selectedMusic = null;
let selectedStickers = [];
let cropper = null;
let selectedPostDestination = 'profile';
let currentEditIndex = -1;
let currentCropIndex = -1;
let currentFilters = {};
let searchTimeout = null;
let currentCommentPostId = null;

// Rewards System Data
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
  ],
  exclusiveRewards: [
    { id: 'theme', title: 'Premium Themes', desc: 'Exclusive themes', cost: 500, icon: '🎨', category: 'cosmetic' },
    { id: 'frame', title: 'Golden Frame', desc: 'Profile border', cost: 300, icon: '🖼️', category: 'cosmetic' },
    { id: 'badge', title: 'Custom Badge', desc: 'Your own badge', cost: 800, icon: '🏆', category: 'premium' },
    { id: 'adfree', title: 'Ad-Free 30 Days', desc: 'No distractions', cost: 1000, icon: '🚀', category: 'utility' },
    { id: 'early', title: 'Early Access', desc: 'New features first', cost: 600, icon: '⚡', category: 'premium' },
    { id: 'boost', title: 'Post Boost 5x', desc: 'Boost 5 posts', cost: 400, icon: '📢', category: 'utility' }
  ],
  leaderboard: [
    { rank: 1, name: 'TechMaster', points: 5420, avatar: '👨‍💻', trend: 'up' },
    { rank: 2, name: 'VibeQueen', points: 4890, avatar: '👸', trend: 'up' },
    { rank: 3, name: 'CodeNinja', points: 4250, avatar: '🥷', trend: 'down' },
    { rank: 4, name: 'StudyBuddy', points: 3870, avatar: '📚', trend: 'up' },
    { rank: 5, name: 'MusicLover', points: 3420, avatar: '🎵', trend: 'same' }
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 VibeXpert initializing...');
  checkAuthStatus();
  setupEventListeners();
  initializeMusicPlayer();
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
  initializeSearchBar();
  loadTrending();
  console.log('✅ Initialized');
});

function setupEventListeners() {
  const addMusicBtn = document.getElementById('addMusicBtn');
  if (addMusicBtn) addMusicBtn.addEventListener('click', openMusicSelector);
  
  const addStickerBtn = document.getElementById('addStickerBtn');
  if (addStickerBtn) addStickerBtn.addEventListener('click', openStickerSelector);
  
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
  });
}

function initializeMusicPlayer() {
  window.musicPlayer = new Audio();
  window.musicPlayer.volume = 0.5;
  window.musicPlayer.addEventListener('loadedmetadata', () => console.log('🎵 Music loaded'));
  window.musicPlayer.addEventListener('error', (e) => {
    console.error('❌ Music error:', e);
    showMessage('Error loading music', 'error');
  });
}

// AUTH
function getToken() {
  return localStorage.getItem('authToken');
}

async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  const options = {
    method,
    headers: {},
    signal: controller.signal
  };
  
  const token = getToken();
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  
  if (body && !(body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }
  
  try {
    console.log(`📡 ${method} ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    console.log(`✅ Success: ${endpoint}`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('network'))) {
      console.log(`🔄 Retry (${retries})`);
      await new Promise(r => setTimeout(r, 1000));
      return apiCall(endpoint, method, body, retries - 1);
    }
    console.error(`❌ ${endpoint}:`, error);
    if (error.name === 'AbortError') throw new Error('Timeout - check connection');
    throw error;
  }
}

function checkAuthStatus() {
  const token = getToken();
  const saved = localStorage.getItem('user');
  if(token && saved) {
    try {
      currentUser = JSON.parse(saved);
      showMainPage();
      const userName = document.getElementById('userName');
      if (userName) userName.textContent = 'Hi, ' + currentUser.username;
      if (currentUser.college) {
        updateLiveNotif(`Connected to ${currentUser.college}`);
        initializeSocket();
      }
    } catch(e) {
      console.error('Parse error:', e);
      localStorage.clear();
      showLoginPage();
    }
  } else {
    showLoginPage();
  }
}

function showLoginPage() {
  const loginPage = document.getElementById('loginPage');
  const mainPage = document.getElementById('mainPage');
  if (loginPage) loginPage.style.display = 'flex';
  if (mainPage) mainPage.style.display = 'none';
}

function showMainPage() {
  const loginPage = document.getElementById('loginPage');
  const mainPage = document.getElementById('mainPage');
  if (loginPage) loginPage.style.display = 'none';
  if (mainPage) mainPage.style.display = 'block';
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
      showMainPage();
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
  
  if(!username || !email || !registrationNumber || !password || !confirm) {
    return showMessage('Fill all fields', 'error');
  }
  if(password !== confirm) return showMessage('Passwords don\'t match', 'error');
  
  try {
    showMessage('Creating account...', 'success');
    await apiCall('/api/register', 'POST', { username, email, password, registrationNumber });
    showMessage('🎉 Account created! Check email', 'success');
    const form = document.getElementById('signupForm');
    if (form) form.reset();
    setTimeout(() => goLogin(null), 2000);
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

function goSignup(e) {
  if (e) e.preventDefault();
  const login = document.getElementById('loginForm');
  const forgot = document.getElementById('forgotPasswordForm');
  const signup = document.getElementById('signupForm');
  if (login) login.style.display = 'none';
  if (forgot) forgot.style.display = 'none';
  if (signup) signup.style.display = 'block';
}

function goLogin(e) {
  if(e) e.preventDefault();
  const login = document.getElementById('loginForm');
  const forgot = document.getElementById('forgotPasswordForm');
  const signup = document.getElementById('signupForm');
  if (signup) signup.style.display = 'none';
  if (forgot) forgot.style.display = 'none';
  if (login) login.style.display = 'block';
}

function goForgotPassword(e) {
  e.preventDefault();
  const login = document.getElementById('loginForm');
  const forgot = document.getElementById('forgotPasswordForm');
  const signup = document.getElementById('signupForm');
  if (login) login.style.display = 'none';
  if (signup) signup.style.display = 'none';
  if (forgot) forgot.style.display = 'block';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  if(!email) return showMessage('Enter email', 'error');
  
  try {
    showMessage('📧 Sending code...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ Check email', 'success');
    const emailSec = document.getElementById('resetEmailSection');
    const codeSec = document.getElementById('resetCodeSection');
    if (emailSec) emailSec.style.display = 'none';
    if (codeSec) codeSec.style.display = 'block';
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
    showMessage('🔍 Verifying...', 'success');
    await apiCall('/api/reset-password', 'POST', { email, code, newPassword });
    showMessage('✅ Password reset! Login now', 'success');
    const form = document.getElementById('forgotPasswordForm');
    if (form) form.reset();
    const emailSec = document.getElementById('resetEmailSection');
    const codeSec = document.getElementById('resetCodeSection');
    if (emailSec) emailSec.style.display = 'block';
    if (codeSec) codeSec.style.display = 'none';
    setTimeout(() => goLogin(null), 2000);
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
  showLoginPage();
  showMessage('👋 Logged out', 'success');
  goLogin(null);
}

// NAVIGATION
function showPage(name, e) {
  if(e) e.preventDefault();
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(name);
  if(page) page.style.display = 'block';
  
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if(e?.target) e.target.classList.add('active');
  
  if(name === 'posts') loadPosts();
  else if(name === 'communities') loadCommunities();
  else if(name === 'rewards') loadRewardsPage();
  
  const hamburger = document.getElementById('hamburgerMenu');
  if (hamburger) hamburger.style.display = 'none';
  window.scrollTo(0, 0);
}

function goHome() {
  showPage('home');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const homeLink = document.querySelector('.nav-link[onclick*="home"]');
  if (homeLink) homeLink.classList.add('active');
}

// POSTS
async function createPost() {
  const postText = document.getElementById('postText')?.value.trim();
  console.log('🚀 Creating post');
  
  if (!postText && selectedFiles.length === 0 && !selectedMusic && selectedStickers.length === 0) {
    return showMessage('⚠️ Add content', 'error');
  }
  if (!currentUser) return showMessage('⚠️ Login required', 'error');
  
  if (selectedPostDestination === 'community') {
    if (!currentUser.communityJoined || !currentUser.college) {
      showMessage('⚠️ Join university first', 'error');
      setTimeout(() => {
        if (confirm('Join college community?')) {
          showPage('home');
          const homeLink = document.querySelector('.nav-link[onclick*="home"]');
          if (homeLink) homeLink.classList.add('active');
        }
      }, 500);
      return;
    }
  }
  
  try {
    showMessage('📤 Creating...', 'success');
    const formData = new FormData();
    formData.append('content', postText);
    formData.append('postTo', selectedPostDestination);
    if (selectedMusic) formData.append('music', JSON.stringify(selectedMusic));
    if (selectedStickers.length > 0) formData.append('stickers', JSON.stringify(selectedStickers));
    if (selectedFiles.length > 0) {
      showMessage(`📤 Uploading ${selectedFiles.length} file(s)...`, 'success');
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('media', selectedFiles[i]);
      }
    }
    
    const data = await apiCall('/api/posts', 'POST', formData);
    if (data.success) {
      const msg = selectedPostDestination === 'profile' ? '✅ Posted to profile!' : '✅ Shared to community!';
      showMessage(msg, 'success');
      const postCount = data.postCount || 1;
      setTimeout(() => showPostCelebrationModal(postCount), 800);
      if (data.badgeUpdated && data.newBadges?.length > 0) {
        setTimeout(() => showMessage(`🏆 Badge: ${data.newBadges.join(', ')}`, 'success'), 6000);
      }
      resetPostForm();
      setTimeout(() => {
        loadPosts();
        if (selectedPostDestination === 'profile') {
          const profilePosts = document.getElementById('userProfilePosts');
          if (profilePosts && currentUser) loadUserProfilePosts(currentUser.id);
        }
        if (selectedPostDestination === 'community') {
          const communityPosts = document.getElementById('communityPostsContainer');
          if (communityPosts) loadCommunityPosts();
        }
      }, 1000);
    } else {
      showMessage('❌ Failed', 'error');
    }
  } catch(error) {
    console.error('❌ Post error:', error);
    if (error.message.includes('timeout')) {
      showMessage('⚠️ Timeout - try smaller images', 'error');
    } else if (error.message.includes('university') || error.message.includes('community')) {
      showMessage('⚠️ Join university first', 'error');
    } else {
      showMessage('❌ Error: ' + error.message, 'error');
    }
  }
}

function resetPostForm() {
  const postText = document.getElementById('postText');
  if (postText) postText.value = '';
  selectedFiles = [];
  previewUrls = [];
  selectedMusic = null;
  selectedStickers = [];
  const photoContainer = document.getElementById('photoPreviewContainer');
  if (photoContainer) {
    photoContainer.innerHTML = '';
    photoContainer.style.display = 'none';
  }
  const assetsContainer = document.getElementById('selectedAssets');
  if (assetsContainer) {
    assetsContainer.innerHTML = '';
    assetsContainer.style.display = 'none';
  }
}

function renderPosts(posts) {
  let html = '';
  posts.forEach(post => {
    const author = post.users?.username || 'User';
    const authorId = post.users?.id || '';
    const content = post.content || '';
    const media = post.media || [];
    const time = new Date(post.created_at || post.timestamp).toLocaleString();
    const isOwn = currentUser && authorId === currentUser.id;
    const postedTo = post.posted_to === 'community' ? '🌍 Community' : '👤 Profile';
    const music = post.music || null;
    const stickers = post.stickers || [];
    const likeCount = post.like_count || 0;
    const commentCount = post.comment_count || 0;
    const shareCount = post.share_count || 0;
    const isLiked = post.is_liked || false;
    
    html += `
      <div class="enhanced-post" id="post-${post.id}">
        <div class="enhanced-post-header">
          <div class="enhanced-user-info" onclick="showUserProfile('${authorId}')" style="cursor:pointer;">
            <div class="enhanced-user-avatar">
              ${post.users?.profile_pic ? `<img src="${post.users.profile_pic}" class="enhanced-user-avatar">` : '👤'}
            </div>
            <div class="enhanced-user-details">
              <div class="enhanced-username">@${author}</div>
              <div class="enhanced-post-meta"><span>${time}</span><span>•</span><span>${postedTo}</span></div>
            </div>
          </div>
          ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️</button>` : ''}
        </div>
        <div class="enhanced-post-content">
          ${content ? `<div class="enhanced-post-text">${content}</div>` : ''}
          ${stickers.length > 0 ? `<div class="post-stickers-container">${stickers.map(s => `<span class="post-sticker">${s.emoji || s}</span>`).join('')}</div>` : ''}
          ${music ? `<div class="post-music-container"><div class="music-player"><div class="music-info"><div class="music-icon">${music.emoji || '🎵'}</div><div class="music-details"><div class="music-name">${music.name}</div><div class="music-duration">${music.artist} • ${music.duration}</div></div></div><audio controls class="post-audio-player"><source src="${music.url}" type="audio/mpeg"></audio></div></div>` : ''}
          ${media.length > 0 ? `<div class="enhanced-post-media">${media.map(m => m.type === 'image' ? `<div class="enhanced-media-item"><img src="${m.url}"></div>` : m.type === 'video' ? `<div class="enhanced-media-item"><video src="${m.url}" controls></video></div>` : `<div class="enhanced-media-item"><audio src="${m.url}" controls></audio></div>`).join('')}</div>` : ''}
        </div>
        <div class="enhanced-post-footer">
          <div class="enhanced-post-stats">
            <span id="like-count-${post.id}">❤️ ${likeCount}</span>
            <span id="comment-count-${post.id}">💬 ${commentCount}</span>
            <span id="share-count-${post.id}">🔄 ${shareCount}</span>
          </div>
          <div class="enhanced-post-engagement">
            <button class="engagement-btn ${isLiked ? 'liked' : ''}" id="like-btn-${post.id}" onclick="toggleLike('${post.id}')">${isLiked ? '❤️ Liked' : '❤️ Like'}</button>
            <button class="engagement-btn" onclick="openCommentModal('${post.id}')">💬 Comment</button>
            <button class="engagement-btn" onclick="sharePost('${post.id}', '${content.replace(/'/g, "\\'")}', '${author}')">🔄 Share</button>
          </div>
        </div>
      </div>
    `;
  });
  return html;
}

async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if (!feedEl) return;
  try {
    feedEl.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">⏳ Loading...</div>';
    const data = await apiCall('/api/posts', 'GET');
    if (!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">📝 No posts yet</div>';
      return;
    }
    feedEl.innerHTML = renderPosts(data.posts);
  } catch(error) {
    console.error('❌ Load posts:', error);
    feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:#ff6b6b;">❌ Failed to load</div>';
  }
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');
    const postEl = document.getElementById(`post-${postId}`);
    if (postEl) postEl.remove();
    setTimeout(() => loadPosts(), 500);
  } catch(error) {
    showMessage('❌ Failed: ' + error.message, 'error');
  }
}

// LIKE
async function toggleLike(postId) {
  if (!currentUser) return showMessage('⚠️ Login to like', 'error');
  try {
    const likeBtn = document.querySelector(`#like-btn-${postId}`);
    const likeCount = document.querySelector(`#like-count-${postId}`);
    if (likeBtn) likeBtn.disabled = true;
    
    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');
    if (data.success) {
      if (likeBtn) {
        likeBtn.innerHTML = data.liked ? '❤️ Liked' : '❤️ Like';
        if (data.liked) likeBtn.classList.add('liked');
        else likeBtn.classList.remove('liked');
        likeBtn.disabled = false;
      }
      if (likeCount) likeCount.textContent = `❤️ ${data.likeCount}`;
    }
  } catch(error) {
    console.error('❌ Like:', error);
    showMessage('❌ Failed to like', 'error');
    const likeBtn = document.querySelector(`#like-btn-${postId}`);
    if (likeBtn) likeBtn.disabled = false;
  }
}

// COMMENT
function openCommentModal(postId) {
  if (!currentUser) return showMessage('⚠️ Login to comment', 'error');
  currentCommentPostId = postId;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'commentModal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:600px;max-height:80vh;overflow-y:auto;">
      <span class="close" onclick="closeCommentModal()">&times;</span>
      <h2>💬 Comments</h2>
      <div id="commentsContainer" style="margin:20px 0;max-height:300px;overflow-y:auto;">
        <div style="text-align:center;padding:20px;color:#888;">⏳ Loading...</div>
      </div>
      <div style="border-top:1px solid rgba(79,116,163,0.2);padding-top:20px;">
        <textarea id="commentInput" placeholder="Write a comment..." style="width:100%;min-height:80px;padding:12px;background:rgba(20,30,50,0.6);border:1px solid rgba(79,116,163,0.3);border-radius:10px;color:white;font-family:inherit;resize:vertical;"></textarea>
        <button onclick="submitComment('${postId}')" style="width:100%;margin-top:10px;">💬 Post</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  loadComments(postId);
}

function closeCommentModal() {
  const modal = document.getElementById('commentModal');
  if (modal) modal.remove();
  currentCommentPostId = null;
}

async function loadComments(postId) {
  const container = document.getElementById('commentsContainer');
  if (!container) return;
  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'GET');
    if (!data.success || !data.comments || data.comments.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">💬 No comments yet</div>';
      return;
    }
    let html = '';
    data.comments.forEach(comment => {
      const author = comment.users?.username || 'User';
      const time = new Date(comment.created_at).toLocaleString();
      const isOwn = currentUser && comment.user_id === currentUser.id;
      html += `
        <div class="comment-item" style="background:rgba(15,25,45,0.9);border:1px solid rgba(79,116,163,0.2);border-radius:12px;padding:15px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4f74a3,#8da4d3);display:flex;align-items:center;justify-content:center;font-size:18px;">
                ${comment.users?.profile_pic ? `<img src="${comment.users.profile_pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '👤'}
              </div>
              <div>
                <div style="font-weight:600;color:#4f74a3;">@${author}</div>
                <div style="font-size:11px;color:#888;">${time}</div>
              </div>
            </div>
            ${isOwn ? `<button onclick="deleteComment('${comment.id}','${postId}')" style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">🗑️</button>` : ''}
          </div>
          <div style="color:#e0e0e0;line-height:1.5;">${comment.content}</div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch(error) {
    console.error('❌ Load comments:', error);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#ff6b6b;">❌ Failed to load</div>';
  }
}

async function submitComment(postId) {
  const input = document.getElementById('commentInput');
  const content = input?.value.trim();
  if (!content) return showMessage('⚠️ Empty comment', 'error');
  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'POST', { content });
    if (data.success) {
      showMessage('✅ Comment posted!', 'success');
      input.value = '';
      loadComments(postId);
      const commentCount = document.querySelector(`#comment-count-${postId}`);
      if (commentCount) {
        const currentCount = parseInt(commentCount.textContent.replace(/\D/g, '')) || 0;
        commentCount.textContent = `💬 ${currentCount + 1}`;
      }
    }
  } catch(error) {
    console.error('❌ Comment:', error);
    showMessage('❌ Failed to post', 'error');
  }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Delete?')) return;
  try {
    await apiCall(`/api/posts/${postId}/comments/${commentId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');
    loadComments(postId);
    const commentCount = document.querySelector(`#comment-count-${postId}`);
    if (commentCount) {
      const currentCount = parseInt(commentCount.textContent.replace(/\D/g, '')) || 0;
      if (currentCount > 0) commentCount.textContent = `💬 ${currentCount - 1}`;
    }
  } catch(error) {
    console.error('❌ Delete comment:', error);
    showMessage('❌ Failed', 'error');
  }
}

// SHARE
function sharePost(postId, postContent = '', author = '') {
  const shareModal = document.createElement('div');
  shareModal.className = 'modal';
  shareModal.id = 'shareModal';
  shareModal.style.display = 'flex';
  const postUrl = `${window.location.origin}/?post=${postId}`;
  const shareText = `Check out @${author} on VibeXpert!`;
  shareModal.innerHTML = `
    <div class="modal-box" style="max-width:500px;">
      <span class="close" onclick="closeShareModal()">&times;</span>
      <h2>🔄 Share</h2>
      <div style="background:rgba(15,25,45,0.9);border:1px solid rgba(79,116,163,0.2);border-radius:12px;padding:20px;margin:20px 0;">
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;">
          <button onclick="shareVia('copy','${postUrl}')" class="share-option-btn"><span style="font-size:32px;">📋</span><span>Copy Link</span></button>
          <button onclick="shareVia('whatsapp','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn"><span style="font-size:32px;">💬</span><span>WhatsApp</span></button>
          <button onclick="shareVia('twitter','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn"><span style="font-size:32px;">🐦</span><span>Twitter</span></button>
          <button onclick="shareVia('native','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn"><span style="font-size:32px;">📤</span><span>More</span></button>
        </div>
      </div>
      <div style="background:rgba(79,116,163,0.1);padding:12px;border-radius:8px;">
        <input type="text" value="${postUrl}" readonly id="shareUrlInput" style="width:100%;background:transparent;border:none;color:#4f74a3;text-align:center;font-size:14px;">
      </div>
    </div>
  `;
  document.body.appendChild(shareModal);
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.remove();
}

async function shareVia(platform, url, text = '') {
  switch(platform) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(url);
        showMessage('✅ Link copied!', 'success');
        closeShareModal();
      } catch(err) {
        const input = document.getElementById('shareUrlInput');
        if (input) {
          input.select();
          document.execCommand('copy');
          showMessage('✅ Link copied!', 'success');
        }
      }
      break;
    case 'whatsapp':
      window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
      closeShareModal();
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
      closeShareModal();
      break;
    case 'native':
      if (navigator.share) {
        try {
          await navigator.share({ title: 'VibeXpert', text: decodeURIComponent(text), url });
          closeShareModal();
        } catch(err) {
          if (err.name !== 'AbortError') console.error('Share:', err);
        }
      } else {
        showMessage('⚠️ Not supported', 'error');
      }
      break;
  }
  try {
    const postId = url.split('post=')[1];
    if (postId) {
      await apiCall(`/api/posts/${postId}/share`, 'POST');
      const shareCount = document.querySelector(`#share-count-${postId}`);
      if (shareCount) {
        const currentCount = parseInt(shareCount.textContent.replace(/\D/g, '')) || 0;
        shareCount.textContent = `🔄 ${currentCount + 1}`;
      }
    }
  } catch(error) {
    console.error('Share count:', error);
  }
}

// MEDIA
function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = (e) => handlePhotoSelection(e.target.files);
  input.click();
}

function openCamera() {
  if (navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        showMessage('📷 Camera ready', 'success');
        setTimeout(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          input.onchange = (e) => handlePhotoSelection(e.target.files);
          input.click();
        }, 1000);
      })
      .catch(() => {
        showMessage('⚠️ Camera unavailable', 'error');
        openPhotoGallery();
      });
  } else {
    openPhotoGallery();
  }
}

async function handlePhotoSelection(files) {
  if (!files.length) return;
  showMessage('📸 Processing...', 'success');
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) {
      showMessage('Images only', 'error');
      continue;
    }
    if (selectedFiles.length >= 5) {
      showMessage('Max 5 photos', 'error');
      break;
    }
    try {
      const compressedFile = await compressImage(file);
      selectedFiles.push(compressedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrls.push(e.target.result);
        displayPhotoPreviews();
      };
      reader.readAsDataURL(compressedFile);
    } catch(error) {
      console.error('Image error:', error);
      showMessage('Failed: ' + file.name, 'error');
    }
  }
  if (selectedFiles.length > 0) showMessage(`✅ ${selectedFiles.length} photo(s) ready`, 'success');
}

async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  if (file.size < 500 * 1024) return file;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error('Failed to read'));
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onerror = () => reject(new Error('Failed to load'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            console.log(`🗜️ ${(file.size/1024).toFixed(0)}KB → ${(compressedFile.size/1024).toFixed(0)}KB`);
            resolve(compressedFile);
          }, 'image/jpeg', quality);
        } catch(error) {
          reject(error);
        }
      };
    };
  });
}

function displayPhotoPreviews() {
  const container = document.getElementById('photoPreviewContainer');
  if (!container) return;
  if (previewUrls.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  container.style.display = 'block';
  let html = '<div class="media-preview-grid">';
  previewUrls.forEach((url, index) => {
    html += `
      <div class="preview-item">
        <div class="preview-image-container">
          <img src="${url}" alt="Preview ${index + 1}" class="preview-image">
          <div class="media-actions">
            <button class="remove-btn" onclick="removePhoto(${index})">🗑️</button>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function removePhoto(index) {
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  displayPhotoPreviews();
  showMessage('🗑️ Removed', 'success');
}

// MUSIC & STICKERS
function openMusicSelector() {
  const modal = document.getElementById('musicSelectorModal');
  const selector = document.getElementById('musicSelector');
  selector.innerHTML = '';
  musicLibrary.forEach(music => {
    const musicItem = document.createElement('div');
    musicItem.className = 'music-item';
    const isSelected = selectedMusic && selectedMusic.id === music.id;
    musicItem.innerHTML = `
      <div class="music-info">
        <div class="music-emoji">${music.emoji}</div>
        <div class="music-details">
          <div class="music-name">${music.name}</div>
          <div class="music-artist">${music.artist} • ${music.duration}</div>
        </div>
      </div>
      <div class="music-actions">
        <button class="preview-btn" onclick="previewMusic('${music.url}',${music.id})">▶️</button>
        <button class="select-btn ${isSelected ? 'selected' : ''}" onclick="selectMusic(${music.id})">${isSelected ? '✓ Selected' : '✅ Select'}</button>
      </div>
    `;
    selector.appendChild(musicItem);
  });
  showModal('musicSelectorModal');
}

function previewMusic(url, musicId) {
  const player = window.musicPlayer;
  player.pause();
  player.currentTime = 0;
  player.src = url;
  player.play().catch(() => showMessage('Could not play', 'error'));
  document.querySelectorAll('.music-item').forEach(item => item.classList.remove('playing'));
  const currentItem = document.querySelector(`.music-item button[onclick*="${musicId}"]`)?.closest('.music-item');
  if (currentItem) currentItem.classList.add('playing');
}

function selectMusic(musicId) {
  selectedMusic = musicLibrary.find(m => m.id === musicId);
  updateSelectedAssets();
  closeMusicSelector();
  showMessage(`🎵 "${selectedMusic.name}" added!`, 'success');
  window.musicPlayer.pause();
  window.musicPlayer.currentTime = 0;
}

function closeMusicSelector() {
  window.musicPlayer.pause();
  window.musicPlayer.currentTime = 0;
  closeModal('musicSelectorModal');
}

function removeMusic() {
  selectedMusic = null;
  updateSelectedAssets();
  showMessage('🎵 Music removed', 'success');
}

function openStickerSelector() {
  const modal = document.getElementById('stickerSelectorModal');
  const selector = document.getElementById('stickerSelector');
  selector.innerHTML = '';
  Object.keys(stickerLibrary).forEach(category => {
    const categorySection = document.createElement('div');
    categorySection.className = 'sticker-category';
    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categorySection.appendChild(categoryTitle);
    const stickerGrid = document.createElement('div');
    stickerGrid.className = 'sticker-grid';
    stickerLibrary[category].forEach(sticker => {
      const stickerItem = document.createElement('div');
      stickerItem.className = 'sticker-item';
      stickerItem.innerHTML = `
        <div class="sticker" onclick="addSticker('${sticker.emoji}','${sticker.name}')">${sticker.emoji}</div>
        <div class="sticker-name">${sticker.name}</div>
      `;
      stickerGrid.appendChild(stickerItem);
    });
    categorySection.appendChild(stickerGrid);
    selector.appendChild(categorySection);
  });
  showModal('stickerSelectorModal');
}

function addSticker(emoji, name) {
  if (selectedStickers.length >= 5) return showMessage('Max 5 stickers', 'error');
  selectedStickers.push({emoji, name});
  updateSelectedAssets();
  const postText = document.getElementById('postText');
  if (postText) postText.value += emoji;
  showMessage(`🎨 "${name}" added!`, 'success');
}

function removeStickers() {
  selectedStickers = [];
  updateSelectedAssets();
  showMessage('🎨 Stickers removed', 'success');
}

function updateSelectedAssets() {
  const container = document.getElementById('selectedAssets');
  if (!container) return;
  let html = '';
  if (selectedMusic) {
    html += `<div class="selected-asset"><span>🎵 ${selectedMusic.name}</span><button onclick="removeMusic()" class="remove-asset-btn">✕</button></div>`;
  }
  if (selectedStickers.length > 0) {
    html += `<div class="selected-asset selected-stickers"><span>🎨 Stickers:</span>${selectedStickers.map(s => `<span class="sticker-preview">${s.emoji}</span>`).join('')}<button onclick="removeStickers()" class="remove-asset-btn">✕</button></div>`;
  }
  container.innerHTML = html;
  container.style.display = html ? 'block' : 'none';
}

function showPostDestinationModal() {
  showModal('postDestinationModal');
}

function selectPostDestination(destination) {
  if (destination === 'community') {
    if (!currentUser.communityJoined || !currentUser.college) {
      showMessage('⚠️ Join university first', 'error');
      closeModal('postDestinationModal');
      setTimeout(() => {
        if (confirm('Join college community?')) {
          showPage('home');
          const homeLink = document.querySelector('.nav-link[onclick*="home"]');
          if (homeLink) homeLink.classList.add('active');
        }
      }, 500);
      return;
    }
  }
  selectedPostDestination = destination;
  const displayText = destination === 'profile' ? 'My Profile' : 'Community Feed';
  const currentDest = document.getElementById('currentDestination');
  if (currentDest) currentDest.textContent = displayText;
  closeModal('postDestinationModal');
  showMessage(`📍 Post to ${displayText}`, 'success');
}

// CELEBRATION
function showPostCelebrationModal(postCount) {
  const milestone = getMilestoneForPost(postCount);
  const modal = document.createElement('div');
  modal.className = 'celebration-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="celebration-modal-content">
      <div class="celebration-confetti"></div>
      <div class="celebration-icon-circle" style="background:linear-gradient(135deg,${milestone.color},${milestone.color}dd);"><span style="font-size:48px;">${milestone.icon}</span></div>
      <div class="celebration-emoji">${milestone.emoji}</div>
      <h2 class="celebration-title" style="color:${milestone.color};">${milestone.title}</h2>
      <p class="celebration-message">${milestone.message}</p>
      <div class="celebration-stats" style="background:${milestone.color}15;">
        <div class="celebration-count" style="color:${milestone.color};">${postCount}</div>
        <div class="celebration-label">TOTAL POSTS</div>
      </div>
      <div class="celebration-quote">"${milestone.quote}"</div>
      <button class="celebration-button" style="background:linear-gradient(135deg,${milestone.color},${milestone.color}dd);box-shadow:0 4px 15px ${milestone.color}40;" onclick="closeCelebrationModal()">🚀 Keep Posting!</button>
      ${postCount >= 10 ? `<button class="celebration-share-btn" onclick="shareAchievement(${postCount})">📢 Share</button>` : ''}
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => closeCelebrationModal(), 5000);
}

function getMilestoneForPost(count) {
  const milestones = {
    1: { emoji: '🎉', icon: '⭐', title: 'First Post!', message: 'Congratulations!', quote: 'Every journey begins with a step', color: '#667eea' },
    5: { emoji: '🚀', icon: '📈', title: 'Rising Star!', message: 'Building momentum!', quote: 'Consistency is key', color: '#f093fb' },
    10: { emoji: '⭐', icon: '🎨', title: 'Content Creator!', message: 'Officially a creator!', quote: 'Create content that matters', color: '#feca57' },
    25: { emoji: '🏆', icon: '👑', title: 'Champion!', message: 'Crushing it!', quote: 'Champions are made', color: '#ff6b6b' },
    50: { emoji: '💎', icon: '✨', title: 'Diamond!', message: 'Legend in making!', quote: 'Shine bright', color: '#4ecdc4' },
    100: { emoji: '👑', icon: '⚡', title: 'Elite!', message: 'Unstoppable!', quote: 'You inspire others', color: '#a29bfe' }
  };
  if (milestones[count]) return milestones[count];
  if (count % 10 === 0) return { emoji: '🎊', icon: '🔥', title: `${count} Posts!`, message: 'On fire!', quote: 'Keep up the work', color: '#667eea' };
  return { emoji: '🎉', icon: '✨', title: 'Post Published!', message: 'Your voice matters!', quote: 'Every post brings you closer', color: '#4f74a3' };
}

function closeCelebrationModal() {
  const modal = document.querySelector('.celebration-modal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => modal.remove(), 300);
  }
}

function shareAchievement(postCount) {
  const text = `🎉 I just made my ${postCount}th post on VibeXpert! Join me! 🚀`;
  if (navigator.share) {
    navigator.share({ title: 'VibeXpert Achievement', text, url: window.location.origin }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showMessage('✅ Copied!', 'success'));
  }
}

// REWARDS
function loadRewardsPage() {
  const container = document.getElementById('rewards');
  if (!container) return;
  const userPoints = currentUser?.rewardPoints || 0;
  let html = `
    <div style="text-align:center;margin-bottom:40px;">
      <h2 style="font-size:36px;color:#4f74a3;">🎁 Rewards</h2>
      <div style="margin:30px auto;padding:30px;background:linear-gradient(135deg,rgba(79,116,163,0.2),rgba(141,164,211,0.2));border:2px solid #4f74a3;border-radius:20px;max-width:400px;">
        <div style="font-size:48px;font-weight:800;color:#4f74a3;">${userPoints}</div>
        <div style="font-size:14px;color:#888;">YOUR POINTS</div>
      </div>
    </div>
    <div style="margin-bottom:50px;">
      <h3 style="color:#4f74a3;font-size:24px;margin-bottom:20px;">📋 Daily Tasks</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
        ${rewardsData.dailyTasks.map(task => `
          <div class="reward-task-card ${task.completed ? 'completed' : ''}" onclick="completeTask('${task.id}')">
            <div style="font-size:48px;margin-bottom:15px;">${task.icon}</div>
            <h4 style="color:#4f74a3;font-size:18px;margin-bottom:8px;">${task.title}</h4>
            <p style="color:#888;font-size:14px;margin-bottom:15px;">${task.desc}</p>
            <div style="display:flex;justify-content:space-between;">
              <span style="background:linear-gradient(135deg,#4f74a3,#8da4d3);color:white;padding:6px 16px;border-radius:20px;font-weight:600;font-size:13px;">+${task.reward} pts</span>
              ${task.completed ? '<span style="color:#22c55e;">✓ Done</span>' : '<span style="color:#888;font-size:12px;">Complete</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function completeTask(taskId) {
  showMessage('🎉 Task completed! +10 points', 'success');
}

function purchaseReward(rewardId, cost) {
  const userPoints = currentUser?.rewardPoints || 0;
  if (userPoints < cost) {
    showMessage(`⚠️ Need ${cost - userPoints} more points`, 'error');
    return;
  }
  if (confirm(`Purchase for ${cost} points?`)) {
    showMessage('🎁 Reward unlocked!', 'success');
  }
}

// COLLEGE
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
        ${isConnected 
          ? '<button class="verified" disabled>✓ Connected</button>'
          : `<button onclick="openVerify('${c.name}','${c.email}')">Connect</button>`
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
    c.name.toLowerCase().includes(search) || c.location.toLowerCase().includes(search)
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
    showMessage('🔍 Verifying...', 'success');
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

// COMMUNITIES
function loadCommunities() {
  const container = document.getElementById('communitiesContainer');
  if (!container) return;
  if (!currentUser || !currentUser.communityJoined) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Connect to college first!</p>
        <button class="home-nav-btn" onclick="showPage('home')">Explore</button>
      </div>
    `;
    return;
  }
  container.innerHTML = `
    <div class="community-card">
      <h3>${currentUser.college} Community</h3>
      <p>Share and chat with students</p>
      <button onclick="openCommunitySection()">Open</button>
    </div>
  `;
}

function openCommunitySection() {
  const chatSection = document.getElementById('chatSection');
  if (chatSection) chatSection.style.display = 'block';
  loadCommunityPosts();
  loadCommunityMessages();
}

async function loadCommunityPosts() {
  let container = document.getElementById('communityPostsContainer');
  if (!container) {
    const chatSection = document.getElementById('chatSection');
    if (chatSection) {
      const postsDiv = document.createElement('div');
      postsDiv.innerHTML = `
        <div style="margin-bottom:30px;">
          <div class="chat-header">
            <h3>📸 Community Posts</h3>
            <p style="color:#888;font-size:13px;margin:5px 0 0 0;">Share with community</p>
          </div>
          <div id="communityPostsContainer" style="display:flex;flex-direction:column;gap:15px;margin-top:20px;">
            <div style="text-align:center;padding:20px;color:#888;">⏳ Loading...</div>
          </div>
        </div>
      `;
      chatSection.insertBefore(postsDiv, chatSection.firstChild);
    }
  }
  const postsContainer = document.getElementById('communityPostsContainer');
  if (!postsContainer) return;
  try {
    const data = await apiCall('/api/posts/community', 'GET');
    if (data.needsJoinCommunity) {
      postsContainer.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:20px;">🎓</div>
          <h3 style="color:#4f74a3;">Join Community!</h3>
          <p style="color:#888;">Connect to college first</p>
        </div>
      `;
      return;
    }
    if (!data.posts || data.posts.length === 0) {
      postsContainer.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">📸 No posts yet</div>';
      return;
    }
    postsContainer.innerHTML = renderPosts(data.posts);
  } catch(error) {
    console.error('❌ Community posts:', error);
    if (postsContainer) {
      postsContainer.innerHTML = '<div style="text-align:center;padding:20px;color:#ff6b6b;">❌ Failed to load</div>';
    }
  }
}

function openCommunityChat() {
  const chatSection = document.getElementById('chatSection');
  if (chatSection) chatSection.style.display = 'block';
  loadCommunityMessages();
}

async function loadCommunityMessages() {
  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('chatMessages');
    if (!messagesEl) return;
    if (!data.messages || data.messages.length === 0) {
      messagesEl.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">No messages yet</div>';
      return;
    }
    messagesEl.innerHTML = '';
    data.messages.reverse().forEach(msg => appendMessageToChat(msg));
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch(error) {
    console.error('Load messages:', error);
  }
}

function appendMessageToChat(msg) {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;
  const isOwn = msg.sender_id === currentUser.id;
  const sender = msg.users?.username || 'User';
  const messageTime = new Date(msg.timestamp);
  const now = new Date();
  const canEdit = isOwn && ((now - messageTime) / 1000 / 60) < 2;
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isOwn ? 'own' : 'other'}`;
  messageDiv.id = `msg-${msg.id}`;
  const reactions = msg.message_reactions || [];
  const reactionCounts = {};
  reactions.forEach(r => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });
  messageDiv.innerHTML = `
    ${!isOwn ? `<div class="sender">@${sender}</div>` : ''}
    <div class="text">${msg.content}${msg.edited ? ' <span style="font-size:10px;color:#888;">(edited)</span>' : ''}</div>
    ${Object.keys(reactionCounts).length > 0 ? `<div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;">${Object.entries(reactionCounts).map(([emoji, count]) => `<span style="background:rgba(79,116,163,0.2);padding:2px 6px;border-radius:10px;font-size:12px;">${emoji} ${count}</span>`).join('')}</div>` : ''}
    <div style="display:flex;gap:8px;margin-top:8px;font-size:11px;color:#888;">
      <span onclick="reactToMessage('${msg.id}')" style="cursor:pointer;">❤️</span>
      <span onclick="reactToMessage('${msg.id}','👍')" style="cursor:pointer;">👍</span>
      <span onclick="reactToMessage('${msg.id}','😂')" style="cursor:pointer;">😂</span>
      <span onclick="reactToMessage('${msg.id}','🔥')" style="cursor:pointer;">🔥</span>
      ${canEdit ? `<span onclick="editMessage('${msg.id}','${msg.content.replace(/'/g, "\\'")}')" style="cursor:pointer;">✏️</span>` : ''}
      ${isOwn ? `<span onclick="deleteMessage('${msg.id}')" style="cursor:pointer;">🗑️</span>` : ''}
    </div>
  `;
  messagesEl.appendChild(messageDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateMessageInChat(msg) {
  const messageEl = document.getElementById(`msg-${msg.id}`);
  if (!messageEl) return;
  const textEl = messageEl.querySelector('.text');
  if (textEl) {
    textEl.innerHTML = `${msg.content} <span style="font-size:10px;color:#888;">(edited)</span>`;
  }
}

function removeMessageFromChat(id) {
  const messageEl = document.getElementById(`msg-${id}`);
  if (messageEl) messageEl.remove();
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const content = input.value.trim();
  if (!content) return;
  try {
    await apiCall('/api/community/messages', 'POST', { content });
    input.value = '';
  } catch(error) {
    showMessage('❌ Failed to send', 'error');
  }
}

function handleChatKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

async function editMessage(messageId, currentContent) {
  if (editingMessageId) return showMessage('⚠️ Finish editing first', 'error');
  const newContent = prompt('Edit message:', currentContent);
  if (!newContent || newContent.trim() === '' || newContent === currentContent) return;
  try {
    editingMessageId = messageId;
    await apiCall(`/api/community/messages/${messageId}`, 'PATCH', { content: newContent.trim() });
    showMessage('✅ Edited', 'success');
  } catch(error) {
    showMessage('❌ ' + error.message, 'error');
  } finally {
    editingMessageId = null;
  }
}

async function deleteMessage(messageId) {
  if (!confirm('Delete?')) return;
  try {
    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');
  } catch(error) {
    showMessage('❌ Failed', 'error');
  }
}

async function reactToMessage(messageId, emoji = '❤️') {
  try {
    await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
  } catch(error) {
    console.error('React:', error);
  }
}

// SOCKET
function initializeSocket() {
  if (socket) return;
  socket = io(API_URL);
  socket.on('connect', () => {
    console.log('Socket connected');
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
    }
    socket.emit('user_online', currentUser.id);
  });
  socket.on('new_message', (message) => appendMessageToChat(message));
  socket.on('message_updated', (message) => updateMessageInChat(message));
  socket.on('message_deleted', ({ id }) => removeMessageFromChat(id));
  socket.on('online_count', (count) => updateOnlineCount(count));
  socket.on('post_liked', (data) => {
    const likeCount = document.querySelector(`#like-count-${data.postId}`);
    if (likeCount) likeCount.textContent = `❤️ ${data.likeCount}`;
  });
  socket.on('post_commented', (data) => {
    const commentCount = document.querySelector(`#comment-count-${data.postId}`);
    if (commentCount) commentCount.textContent = `💬 ${data.commentCount}`;
  });
  socket.on('post_shared', (data) => {
    const shareCount = document.querySelector(`#share-count-${data.postId}`);
    if (shareCount) shareCount.textContent = `🔄 ${data.shareCount}`;
  });
}

// PROFILE & SEARCH
function initializeSearchBar() {
  const searchBox = document.getElementById('searchBox');
  const searchResults = document.getElementById('searchResults');
  if (!searchBox) return;
  console.log('✅ Search initialized');
  searchBox.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    if (searchResults) {
      searchResults.innerHTML = '<div class="no-results">🔍 Searching...</div>';
      searchResults.style.display = 'block';
    }
    searchTimeout = setTimeout(() => performUserSearch(query), 600);
  });
  searchBox.addEventListener('focus', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) performUserSearch(query);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) hideSearchResults();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideSearchResults();
      searchBox.blur();
    }
  });
}

async function performUserSearch(query) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;
  try {
    console.log('🔍 Searching:', query);
    const data = await apiCall(`/api/search/users?query=${encodeURIComponent(query)}`, 'GET');
    if (!data.success) throw new Error('Search failed');
    displaySearchResults(data.users || []);
  } catch(error) {
    console.error('❌ Search:', error);
    searchResults.innerHTML = '<div class="no-results" style="color:#ff6b6b;">❌ Search failed</div>';
    searchResults.style.display = 'block';
  }
}

function displaySearchResults(users) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;
  if (users.length === 0) {
    searchResults.innerHTML = '<div class="no-results">😔 No users found</div>';
    searchResults.style.display = 'block';
    return;
  }
  let html = '';
  users.forEach(user => {
    const avatarContent = user.profile_pic ? `<img src="${user.profile_pic}" alt="${user.username}">` : '👤';
    html += `
      <div class="search-result-item" onclick="showUserProfile('${user.id}')">
        <div class="search-result-avatar">${avatarContent}</div>
        <div class="search-result-info">
          <div class="search-result-username">@${user.username}</div>
          <div class="search-result-details">${user.registration_number || user.email}</div>
          ${user.college ? `<div class="search-result-college">🎓 ${user.college}</div>` : ''}
        </div>
      </div>
    `;
  });
  searchResults.innerHTML = html;
  searchResults.style.display = 'block';
}

function hideSearchResults() {
  const searchResults = document.getElementById('searchResults');
  if (searchResults) searchResults.style.display = 'none';
}

async function showUserProfile(userId) {
  hideSearchResults();
  const searchBox = document.getElementById('searchBox');
  if (searchBox) searchBox.value = '';
  try {
    showMessage('Loading profile...', 'success');
    const data = await apiCall(`/api/profile/${userId}`, 'GET');
    if (!data.success || !data.user) throw new Error('User not found');
    showProfileModal(data.user);
  } catch(error) {
    console.error('❌ Profile:', error);
    showMessage('❌ Failed to load', 'error');
  }
}

function showProfilePage() {
  if (!currentUser) return;
  showProfileModal(currentUser);
  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

function showProfileModal(user) {
  const isOwnProfile = currentUser && user.id === currentUser.id;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box profile-modal-box">
      <button class="close-profile" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-cover"></div>
          <div class="profile-main">
            <div class="profile-photo-section">
              <div class="profile-photo" style="${user.profile_pic ? `background-image:url('${user.profile_pic}');background-size:cover;` : ''}">${!user.profile_pic ? '👤' : ''}</div>
              ${isOwnProfile ? '<button class="avatar-upload-btn" onclick="uploadProfilePic()">📷 Change</button>' : ''}
              <div class="active-badge"><span class="status-dot"></span><span>Active</span></div>
            </div>
            <div class="profile-name-section">
              <h2>${user.username}</h2>
              <div class="nickname-display"><span class="nickname-label">@${user.username}</span></div>
              ${user.college ? `<p style="color:#888;font-size:14px;">🎓 ${user.college}</p>` : ''}
              ${user.registration_number ? `<p style="color:#888;font-size:13px;">📋 ${user.registration_number}</p>` : ''}
            </div>
            ${isOwnProfile ? '<button class="profile-edit-btn" onclick="toggleEditProfile()">✏️ Edit</button>' : ''}
          </div>
        </div>
        <div class="profile-stats-section">
          <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${user.postCount || 0}</div><div class="stat-title">Posts</div></div>
          <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${user.badges?.length || 0}</div><div class="stat-title">Badges</div></div>
          <div class="stat-card"><div class="stat-icon">⏱️</div><div class="stat-value">24h</div><div class="stat-title">Active</div></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function uploadProfilePic() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showMessage('📤 Uploading...', 'success');
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('profilePic', compressedFile);
      const data = await apiCall('/api/profile/picture', 'POST', formData);
      if (data.success) {
        currentUser.profile_pic = data.profilePicUrl;
        localStorage.setItem('user', JSON.stringify(currentUser));
        showMessage('✅ Profile picture updated!', 'success');
        document.querySelector('.modal')?.remove();
        showProfileModal(currentUser);
      }
    } catch(error) {
      showMessage('❌ Upload failed', 'error');
    }
  };
  input.click();
}

function toggleEditProfile() {
  showMessage('✏️ Edit feature coming soon!', 'success');
}

// UTILITIES
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
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
  if (menu) {
    menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
  }
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (options) options.style.display = 'none';
  if (menu) {
    menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
  }
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
      <textarea id="feedbackMessage" placeholder="Your feedback..." style="width:100%;min-height:120px;padding:12px;background:rgba(20,30,50,0.6);border:1px solid rgba(79,116,163,0.3);border-radius:10px;color:white;font-family:inherit;resize:vertical;"></textarea>
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

async function loadUserProfilePosts(userId) {
  const container = document.getElementById('userProfilePosts');
  if (!container) return;
  try {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">⏳ Loading posts...</div>';
    const data = await apiCall(`/api/posts/user/${userId}`, 'GET');
    if (!data.posts || data.posts.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">📝 No posts yet</div>';
      return;
    }
    container.innerHTML = renderPosts(data.posts);
  } catch(error) {
    console.error('❌ Load user posts:', error);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#ff6b6b;">❌ Failed to load posts</div>';
  }
}

// ADDITIONAL HELPERS
function showFullLeaderboard() {
  showMessage('📊 Full leaderboard coming soon!', 'success');
}

console.log('✅ VibeXpert script loaded successfully');


