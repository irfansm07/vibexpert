// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT
// Enhanced Community Chat + All Features
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
let hasScrolledToBottom = false;
let scrollCheckEnabled = true;
let scrollProgressIndicator = null;

// ENHANCED CHAT VARIABLES
let typingUsers = new Set();
let typingTimeout = null;
let lastTypingEmit = 0;
let messageReactions = new Map();
let hasMoreMessages = true;
let currentMessagePage = 1;
let lastMessageTime = Date.now();
let connectionStatus = 'connected';
let chatInitialized = false;

// Data
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

// ==========================================
// MODERN LANDING PAGE FUNCTIONS
// ==========================================

function scrollToSection(sectionId) {
const section = document.getElementById(sectionId);
if (section) {
section.scrollIntoView({ behavior: 'smooth' });
}
}

function toggleMobileMenu() {
const navMenu = document.querySelector('.nav-menu');
if (navMenu) {
navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
}
}

// Enhanced scroll progress for modern nav
function updateScrollProgress() {
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
const scrollHeight = document.documentElement.scrollHeight;
const clientHeight = window.innerHeight;
const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;

const progressFill = document.getElementById('scrollProgressFill');
if (progressFill) progressFill.style.width = scrolled + '%';
  
// Update nav background based on scroll
const nav = document.querySelector('.modern-nav');
if (nav) {
if (scrolled > 50) {
nav.style.background = 'rgba(15, 25, 45, 0.98)';
nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
} else {
nav.style.background = 'rgba(15, 25, 45, 0.95)';
nav.style.boxShadow = 'none';
}
}
}

// Initialize modern landing page
function initializeModernLanding() {
// Scroll progress
window.addEventListener('scroll', updateScrollProgress);
  
// Animate stats on scroll
const observerOptions = {
threshold: 0.5,
rootMargin: '0px 0px -50px 0px'
};
  
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
const statNumbers = entry.target.querySelectorAll('.stat-number');
statNumbers.forEach(stat => {
const target = parseInt(stat.getAttribute('data-count'));
animateCounter(stat, 0, target, 2000);
});
}
});
}, observerOptions);
  
document.querySelectorAll('.stats-grid').forEach(grid => {
observer.observe(grid);
});
  
// Smooth reveal animations
const revealObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('revealed');
}
});
}, { threshold: 0.1 });
  
document.querySelectorAll('.reveal-on-scroll').forEach(el => {
revealObserver.observe(el);
});
}

// Enhanced counter animation
function animateCounter(element, start, end, duration) {
const range = end - start;
const increment = range / (duration / 16);
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

// ==========================================
// PREMIUM CHAT INTERFACE FUNCTIONS
// ==========================================

// Premium message handling
function handlePremiumMessageKeypress(event) {
  const input = document.getElementById('premiumMessageInput');
  const sendBtn = document.getElementById('premiumSendBtn');
  
  if (input.value.trim()) {
    sendBtn.disabled = false;
  } else {
    sendBtn.disabled = true;
  }
  
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendPremiumMessage();
  }
  
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function sendPremiumMessage() {
  const input = document.getElementById('premiumMessageInput');
  const messageText = input.value.trim();
  
  if (!messageText) return;
  
  const messageElement = createPremiumMessage(messageText, 'sent');
  const messagesContainer = document.getElementById('premiumMessages');
  messagesContainer.appendChild(messageElement);
  
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('premiumSendBtn').disabled = true;
  
  scrollToBottom();
  
  if (typeof sendMessage === 'function') {
    sendMessage();
  }
}

function createPremiumMessage(text, type = 'sent', sender = 'You', time = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `premium-message ${type}`;
  messageDiv.style.cssText = `
    display: flex;
    margin-bottom: 16px;
    max-width: 75%;
    animation: premiumMessageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  const messageTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (type === 'received') {
    messageDiv.style.marginRight = 'auto';
    messageDiv.innerHTML = `
      <div class="message-avatar" style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        margin-right: 12px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      ">👤</div>
      <div class="message-content">
        <div class="message-bubble" style="
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 20px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        ">
          <div style="color: #f1f5f9; font-size: 15px; line-height: 1.4; word-wrap: break-word;">
            ${escapeHtml(text)}
          </div>
        </div>
        <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
          ${sender} • ${messageTime}
        </div>
      </div>
    `;
  } else {
    messageDiv.style.marginLeft = 'auto';
    messageDiv.innerHTML = `
      <div class="message-content" style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
        <div class="message-bubble" style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 20px;
          padding: 12px 16px;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          border-top-right-radius: 8px;
        ">
          <div style="color: white; font-size: 15px; line-height: 1.4; word-wrap: break-word;">
            ${escapeHtml(text)}
          </div>
        </div>
        <div style="color: #64748b; font-size: 12px; display: flex; align-items: center; gap: 6px;">
          ${messageTime} <span style="color: #10b981;">✓✓</span>
        </div>
      </div>
    `;
  }
  
  return messageDiv;
}

// Enhanced emoji picker
function togglePremiumEmojiPicker() {
  const emojiPicker = document.getElementById('premiumEmojiPicker');
  const isVisible = emojiPicker.style.display !== 'none';
  
  if (isVisible) {
    emojiPicker.style.display = 'none';
  } else {
    emojiPicker.style.display = 'flex';
    populatePremiumEmojiGrid();
  }
}

function populatePremiumEmojiGrid() {
  const emojiGrid = document.getElementById('premiumEmojiGrid');
  if (!emojiGrid || emojiGrid.children.length > 0) return;
  
  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😊', '👋', '😃', '😄', '😁', '😆', '😅', '🤣', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🦏', '🦇', '🐘', '🦛', '🦒', '🦘', '🦡', '🐆', '🦅', '🦉', '🦚', '🦜', '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥟', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🎂', '🍰', '🧈', '🍫', '🍬', '🍭', '🍮', '🎵', '🎶', '🎙', '🎚', '🎛', '🎤', '🎧', '📻', '🎷', '🪕', '🎸', '🥁', '🪘', '🎺', '🎻', '🪗', '🎬', '🎥', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯', '💡', '🔦', '🏮', '🪔', '📔', '🕯', '🎆', '🎇', '🧨', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎗', '🎟', '🎫', '🎖', '🏆', '🏅', '🥇', '🥈', '🥉', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👀', '🎉', '🎊', '🎈', '🎁', '🎀', '🔥', '⭐', '✨', '💫', '☄️', '🌟', '💥', '💢'];
  
  emojis.forEach(emoji => {
    const button = document.createElement('button');
    button.textContent = emoji;
    button.style.cssText = `
      background: none;
      border: none;
      color: #e2e8f0;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
    `;
    button.onclick = () => insertPremiumEmoji(emoji);
    button.onmouseover = () => {
      button.style.background = 'rgba(148, 163, 184, 0.1)';
      button.style.transform = 'scale(1.2)';
    };
    button.onmouseout = () => {
      button.style.background = 'none';
      button.style.transform = 'scale(1)';
    };
    emojiGrid.appendChild(button);
  });
}

function insertPremiumEmoji(emoji) {
  const input = document.getElementById('premiumMessageInput');
  const cursorPos = input.selectionStart;
  const textBefore = input.value.substring(0, cursorPos);
  const textAfter = input.value.substring(cursorPos);
  
  input.value = textBefore + emoji + textAfter;
  input.focus();
  input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
  
  document.getElementById('premiumSendBtn').disabled = false;
  togglePremiumEmojiPicker();
}

// Enhanced chat functions
function attachFile() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt';
  fileInput.onchange = handleFileSelection;
  fileInput.click();
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const messageText = `📎 Shared ${file.type.startsWith('image/') ? 'an image' : file.type.startsWith('video/') ? 'a video' : file.type.startsWith('audio/') ? 'an audio file' : 'a file'}: ${file.name}`;
  const messageElement = createPremiumMessage(messageText, 'sent');
  
  const messagesContainer = document.getElementById('premiumMessages');
  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

function openCamera() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*';
  fileInput.capture = 'environment';
  fileInput.onchange = handleFileSelection;
  fileInput.click();
}

function toggleVoiceRecord() {
  alert('Voice recording coming soon!');
}

function startVoiceCall() {
  alert('Voice call coming soon!');
}

function startVideoCall() {
  alert('Video call coming soon!');
}

function openChatSearch() {
  alert('Chat search coming soon!');
}

function openChatMenu() {
  alert('Chat menu coming soon!');
}

function showCommunityGuidelines() {
  alert('Community guidelines coming soon!');
}

function showIntroduceYourself() {
  const input = document.getElementById('premiumMessageInput');
  input.value = "Hey everyone! I'm new here. Looking forward to connecting with fellow students! 🎓";
  input.focus();
  document.getElementById('premiumSendBtn').disabled = false;
}

function searchEmojis(query) {
  const emojiGrid = document.getElementById('premiumEmojiGrid');
  const buttons = emojiGrid.getElementsByTagName('button');
  
  for (let button of buttons) {
    const emoji = button.textContent;
    if (query && !emoji.includes(query)) {
      button.style.display = 'none';
    } else {
      button.style.display = 'flex';
    }
  }
}

// Enhanced scroll detection
document.addEventListener('DOMContentLoaded', function() {
  const messagesContainer = document.getElementById('premiumMessages');
  if (messagesContainer) {
    messagesContainer.addEventListener('scroll', function() {
      const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50;
      const scrollBtn = document.getElementById('scrollToBottomBtn');
      
      if (scrollBtn) {
        if (isAtBottom) {
          scrollBtn.style.display = 'none';
        } else {
          scrollBtn.style.display = 'flex';
        }
      }
    });
  }
});

// Add premium message animation
const style = document.createElement('style');
style.textContent = `
  @keyframes premiumMessageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;
document.head.appendChild(style);

// ==========================================
// WHATSAPP-STYLE CHAT FUNCTIONS
// ==========================================

// WhatsApp-style message handling
function handleWhatsAppKeypress(event) {
  const input = document.getElementById('whatsappInput');
  const sendBtn = document.getElementById('whatsappSendBtn');
  
  // Enable/disable send button based on input
  if (input.value.trim()) {
    sendBtn.disabled = false;
  } else {
    sendBtn.disabled = true;
  }
  
  // Handle Enter key
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendWhatsAppMessage();
  }
  
  // Auto-resize textarea
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappInput');
  const messageText = input.value.trim();
  
  if (!messageText) return;
  
  // Create message element
  const messageElement = createWhatsAppMessage(messageText, 'sent');
  
  // Add to messages container
  const messagesContainer = document.getElementById('whatsappMessages');
  messagesContainer.appendChild(messageElement);
  
  // Clear input
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('whatsappSendBtn').disabled = true;
  
  // Scroll to bottom
  scrollToBottom();
  
  // Send to server (existing functionality)
  if (typeof sendMessage === 'function') {
    sendMessage();
  }
}

function createWhatsAppMessage(text, type = 'sent', sender = 'You', time = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `whatsapp-message ${type}`;
  
  const messageTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (type === 'received') {
    messageDiv.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="message-text">${escapeHtml(text)}</div>
        </div>
        <div class="message-time">
          <span>${sender}</span>
          <span>•</span>
          <span>${messageTime}</span>
        </div>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">
          <div class="message-text">${escapeHtml(text)}</div>
        </div>
        <div class="message-time">
          <span>${messageTime}</span>
          <span class="message-status">✓✓</span>
        </div>
      </div>
    `;
  }
  
  return messageDiv;
}

function handleTypingIndicator() {
  const input = document.getElementById('whatsappInput');
  
  // Show typing indicator if user is typing
  if (input.value.trim()) {
    if (typeof handleTyping === 'function') {
      handleTyping();
    }
  }
}

function toggleEmojiPicker() {
  const emojiPicker = document.getElementById('emojiPicker');
  const isVisible = emojiPicker.style.display !== 'none';
  
  if (isVisible) {
    emojiPicker.style.display = 'none';
  } else {
    emojiPicker.style.display = 'flex';
    populateEmojiGrid();
  }
}

function populateEmojiGrid() {
  const emojiGrid = document.getElementById('emojiGrid');
  if (!emojiGrid || emojiGrid.children.length > 0) return;
  
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
    '🖖', '👋', '🤙', '💪', '🙏', '🤝', '🙏', '✍️',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '👀', '🎉', '🎊', '🎈', '🎁', '🎀',
    '🔥', '⭐', '✨', '💫', '☄️', '🌟', '💥', '💢'
  ];
  
  emojis.forEach(emoji => {
    const button = document.createElement('button');
    button.textContent = emoji;
    button.onclick = () => insertEmoji(emoji);
    emojiGrid.appendChild(button);
  });
}

function insertEmoji(emoji) {
  const input = document.getElementById('whatsappInput');
  const cursorPos = input.selectionStart;
  const textBefore = input.value.substring(0, cursorPos);
  const textAfter = input.value.substring(cursorPos);
  
  input.value = textBefore + emoji + textAfter;
  input.focus();
  input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
  
  // Enable send button
  document.getElementById('whatsappSendBtn').disabled = false;
  
  // Close emoji picker
  toggleEmojiPicker();
}

function attachMedia() {
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*,audio/*';
  fileInput.onchange = handleMediaSelection;
  fileInput.click();
}

function handleMediaSelection(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // For now, just show a simple message
  // In a real implementation, you'd upload and display the media
  const messageText = `📎 Shared ${file.type.startsWith('image/') ? 'an image' : file.type.startsWith('video/') ? 'a video' : 'a file'}: ${file.name}`;
  const messageElement = createWhatsAppMessage(messageText, 'sent');
  
  const messagesContainer = document.getElementById('whatsappMessages');
  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

function scrollToBottom() {
  const messagesContainer = document.getElementById('whatsappMessages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Hide scroll to bottom button
  const scrollBtn = document.getElementById('scrollToBottom');
  if (scrollBtn) {
    scrollBtn.style.display = 'none';
  }
}

function showScrollToBottomButton() {
  const scrollBtn = document.getElementById('scrollToBottom');
  if (scrollBtn) {
    scrollBtn.style.display = 'flex';
  }
}

function toggleChatSettings() {
  // Placeholder for chat settings functionality
  alert('Chat settings coming soon!');
}

function searchMessages() {
  // Placeholder for message search functionality
  const searchTerm = prompt('Search messages:');
  if (searchTerm) {
    alert(`Searching for: ${searchTerm}`);
  }
}

function showCommunityInfo() {
  // Placeholder for community info
  alert('Community info coming soon!');
}

// Enhanced scroll detection
document.addEventListener('DOMContentLoaded', function() {
  const messagesContainer = document.getElementById('whatsappMessages');
  if (messagesContainer) {
    messagesContainer.addEventListener('scroll', function() {
      const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50;
      const scrollBtn = document.getElementById('scrollToBottom');
      
      if (scrollBtn) {
        if (isAtBottom) {
          scrollBtn.style.display = 'none';
        } else {
          scrollBtn.style.display = 'flex';
        }
      }
    });
  }
});

// ==========================================
// ENHANCED COMMUNITY CHAT
// ==========================================

function initializeEnhancedChat() {
if (chatInitialized) return;
chatInitialized = true;
console.log('✨ Enhanced chat initializing');
setupChatInputEnhancements();
setupMessageActions();
setupTypingIndicator();
setupReactionSystem();
setupConnectionMonitor();
setupMessageOptimization();
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
const messageData = { 
content, 
timestamp: Date.now(), 
tempId: 'temp-' + Date.now() 
};

addMessageToUI({ 
id: messageData.tempId, 
content, 
sender_id: currentUser.id, 
users: currentUser, 
timestamp: new Date(), 
status: 'sending' 
});

chatInput.value = '';
chatInput.style.height = 'auto';

await apiCall('/api/community/messages', 'POST', { content });
updateMessageStatus(messageData.tempId, 'sent');
playMessageSound('send');

if (socket && currentUser.college) {
socket.emit('stop_typing', { 
collegeName: currentUser.college, 
username: currentUser.username 
});
}
} catch(error) {
showMessage('❌ Failed to send', 'error');
}
}

function appendMessageToChat(msg) {
const messagesEl = document.getElementById('chatMessages');
if (!messagesEl) return;

const isOwn = msg.sender_id === (currentUser && currentUser.id);
const sender = (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || 'User';
const messageTime = msg.timestamp ? new Date(msg.timestamp) : new Date();
const timeLabel = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2,8));

if (document.getElementById('msg-' + messageId)) return;

const wrapper = document.createElement('div');
wrapper.className = 'chat-message ' + (isOwn ? 'own' : 'other');
wrapper.id = `msg-${messageId}`;

let messageHTML = '';
if (!isOwn) messageHTML += `<div class="sender">@${escapeHtml(sender)}</div>`;

messageHTML += `
   <div class="text">${escapeHtml(msg.text || msg.content || '')}</div>
   <div class="message-footer">
     <span class="message-time">${timeLabel}</span>
     <div class="message-actions">
       <button class="message-action-btn" onclick="addReactionToMessage('${messageId}')" title="React">❤️</button>
       <button class="message-action-btn" onclick="copyMessageText('${messageId}')" title="Copy">📋</button>
       ${isOwn ? `<button class="message-action-btn" onclick="deleteMessage('${messageId}')" title="Delete">🗑️</button>` : ''}
     </div>
   </div>
 `;

messageHTML += createReactionBar(messageId, msg.message_reactions || []);
wrapper.innerHTML = messageHTML;
messagesEl.appendChild(wrapper);
messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });

if (!isOwn) playMessageSound('receive');
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

function createReactionBar(messageId, reactions) {
const reactionCounts = {};
const userReacted = {};

if (reactions && Array.isArray(reactions)) {
reactions.forEach(r => {
reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
if (r.user_id && currentUser && r.user_id === currentUser.id) userReacted[r.emoji] = true;
});
}

const defaultEmojis = ['❤️', '👍', '😂', '🔥', '🎉', '😮'];
const allEmojis = Array.from(new Set([...defaultEmojis, ...Object.keys(reactionCounts)]));

let html = '<div class="reaction-bar">';
allEmojis.forEach(emoji => {
const count = reactionCounts[emoji] || 0;
const selected = userReacted[emoji] ? 'selected' : '';
html += `<div class="reaction-pill ${selected}" onclick="toggleReaction('${messageId}', '${emoji}')">
     <span class="emoji">${emoji}</span>
     ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
   </div>`;
});
html += `<div class="reaction-pill" onclick="showEmojiPickerForMessage('${messageId}')" title="Add reaction">✚</div></div>`;
return html;
}

async function toggleReaction(messageId, emoji) {
try {
const pill = event.target.closest('.reaction-pill');
const countSpan = pill.querySelector('.reaction-count');
let count = parseInt(countSpan?.textContent) || 0;

if (pill.classList.contains('selected')) {
pill.classList.remove('selected');
count = Math.max(0, count - 1);
} else {
pill.classList.add('selected');
count = count + 1;
}

if (countSpan) {
countSpan.textContent = count || '';
} else if (count > 0) {
const newCountSpan = document.createElement('span');
newCountSpan.className = 'reaction-count';
newCountSpan.textContent = count;
pill.appendChild(newCountSpan);
}

await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
} catch (err) {
console.error('Reaction failed', err);
showMessage('❌ Failed to add reaction', 'error');
}
}

function showEmojiPickerForMessage(messageId) {
document.querySelectorAll('.emoji-picker').forEach(e => e.remove());

const picker = document.createElement('div');
picker.className = 'emoji-picker';

const emojis = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '😢', '👏', '🤝', '🙌', '⭐', '💯'];
emojis.forEach(emoji => {
const btn = document.createElement('button');
btn.textContent = emoji;
btn.onclick = (e) => {
e.stopPropagation();
toggleReaction(messageId, emoji);
picker.remove();
};
picker.appendChild(btn);
});

document.body.appendChild(picker);

const messageEl = document.getElementById(`msg-${messageId}`);
if (messageEl) {
const rect = messageEl.getBoundingClientRect();
picker.style.position = 'fixed';
picker.style.left = Math.max(10, rect.left) + 'px';
picker.style.top = Math.max(10, rect.top - picker.offsetHeight - 10) + 'px';
}

setTimeout(() => {
const closeHandler = (e) => {
if (!picker.contains(e.target)) {
picker.remove();
document.removeEventListener('click', closeHandler);
}
};
document.addEventListener('click', closeHandler);
}, 10);
}

function addReactionToMessage(messageId) {
showEmojiPickerForMessage(messageId);
}

function copyMessageText(messageId) {
const messageEl = document.getElementById(`msg-${messageId}`);
const text = messageEl?.querySelector('.text')?.textContent;
if (!text) return;

navigator.clipboard.writeText(text).then(() => {
showMessage('📋 Message copied!', 'success');
}).catch(() => {
showMessage('❌ Failed to copy', 'error');
});
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
let container = document.querySelector('.typing-indicators-container');
const messagesBox = document.querySelector('.chat-messages');

if (!container && messagesBox) {
container = document.createElement('div');
container.className = 'typing-indicators-container';
messagesBox.appendChild(container);
}

if (!container) return;

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

messagesBox.scrollTo({ top: messagesBox.scrollHeight, behavior: 'smooth' });
}

function setupMessageActions() {
console.log('✨ Message actions setup');
}

async function deleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const messageEl = document.getElementById(`msg-${messageId}`);
    if (messageEl) {
      messageEl.style.opacity = '0.5';
      messageEl.style.pointerEvents = 'none';
    }

    // Get current user for authentication
    const currentUser = getCurrentUser();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (currentUser && currentUser.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }

    const response = await fetch(`/api/community/messages/${messageId}`, {
      method: 'DELETE',
      headers: headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete message');
    }

    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }

    console.log('Message deleted successfully');
    
  } catch (error) {
    console.error('Error deleting message:', error);
    
    // Restore message if deletion failed
    const messageEl = document.getElementById(`msg-${messageId}`);
    if (messageEl) {
      messageEl.style.opacity = '1';
      messageEl.style.pointerEvents = 'auto';
    }
    
    alert('Failed to delete message: ' + error.message);
  }
}

function updateMessageStatus(messageId, status) {
const messageEl = document.getElementById(`msg-${messageId}`);
if (!messageEl) return;

let statusIcon = messageEl.querySelector('.message-status');
if (!statusIcon) {
statusIcon = document.createElement('span');
statusIcon.className = 'message-status';
const timeSpan = messageEl.querySelector('.message-time');
if (timeSpan) timeSpan.appendChild(statusIcon);
}

statusIcon.className = `message-status ${status}`;
statusIcon.textContent = status === 'sending' ? '⏳' : status === 'sent' ? '✓' : '✓✓';
}

function setupConnectionMonitor() {
if (!socket) return;

socket.on('connect', () => {
connectionStatus = 'connected';
updateConnectionStatus();
});

socket.on('disconnect', () => {
connectionStatus = 'disconnected';
updateConnectionStatus();
});

socket.on('reconnect', () => {
connectionStatus = 'connected';
updateConnectionStatus();
setTimeout(() => loadCommunityMessages(), 500);
});
}

function updateConnectionStatus() {
let banner = document.querySelector('.connection-status');
const chatSection = document.getElementById('chatSection');

if (connectionStatus === 'disconnected') {
if (!banner && chatSection) {
banner = document.createElement('div');
banner.className = 'connection-status';
chatSection.prepend(banner);
}
if (banner) banner.textContent = '⚠️ Disconnected - Reconnecting...';
} else {
if (banner) {
banner.classList.add('connected');
banner.textContent = '✅ Connected';
setTimeout(() => banner.remove(), 2000);
}
}
}

function setupMessageOptimization() {
let messageQueue = [];
let updateTimeout = null;

window.queueMessageUpdate = function(message) {
messageQueue.push(message);
clearTimeout(updateTimeout);
updateTimeout = setTimeout(() => {
messageQueue.forEach(msg => appendMessageToChat(msg));
messageQueue = [];
}, 100);
};
}

function setupInfiniteScroll() {
const messagesEl = document.getElementById('chatMessages');
if (!messagesEl) return;

messagesEl.addEventListener('scroll', async () => {
if (messagesEl.scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
isLoadingMessages = true;
const oldHeight = messagesEl.scrollHeight;

try {
const data = await apiCall(`/api/community/messages?page=${currentMessagePage + 1}`, 'GET');

if (data.messages && data.messages.length > 0) {
currentMessagePage++;
data.messages.reverse().forEach(msg => {
const messageEl = document.createElement('div');
messageEl.innerHTML = renderMessage(msg);
messagesEl.insertBefore(messageEl.firstChild, messagesEl.firstChild);
});

const newHeight = messagesEl.scrollHeight;
messagesEl.scrollTop = newHeight - oldHeight;
} else {
hasMoreMessages = false;
}
} catch(error) {
console.error('Load more messages:', error);
} finally {
isLoadingMessages = false;
}
}
});
}

function renderMessage(msg) {
const isOwn = msg.sender_id === (currentUser && currentUser.id);
const sender = (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || 'User';
const messageTime = msg.timestamp ? new Date(msg.timestamp) : new Date();
const timeLabel = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2,8));

let html = `<div class="chat-message ${isOwn ? 'own' : 'other'}" id="msg-${messageId}">`;
if (!isOwn) html += `<div class="sender">@${escapeHtml(sender)}</div>`;
html += `
   <div class="text">${escapeHtml(msg.text || msg.content || '')}</div>
   <div class="message-footer">
     <span class="message-time">${timeLabel}</span>
     <div class="message-actions">
       <button class="message-action-btn" onclick="addReactionToMessage('${messageId}')" title="React">❤️</button>
       <button class="message-action-btn" onclick="copyMessageText('${messageId}')" title="Copy">📋</button>
       ${isOwn ? `<button class="message-action-btn" onclick="deleteMessage('${messageId}')" title="Delete">🗑️</button>` : ''}
     </div>
   </div>
 `;
html += createReactionBar(messageId, msg.message_reactions || []);
html += '</div>';

return html;
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

function setupReactionSystem() {
console.log('✨ Reactions ready');
}

function setupTypingIndicator() {
console.log('✨ Typing indicator ready');
}

function addMessageToUI(message) {
appendMessageToChat(message);
}

function setupEnhancedSocketListeners() {
if (!socket) return;

socket.on('new_message', (message) => {
if (window.queueMessageUpdate) queueMessageUpdate(message);
else appendMessageToChat(message);
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
}

// Auto-initialize chat when section becomes visible
document.addEventListener('DOMContentLoaded', () => {
const observer = new MutationObserver((mutations) => {
mutations.forEach((mutation) => {
const chatSection = document.getElementById('chatSection');
if (mutation.target === chatSection && 
chatSection.style.display !== 'none' && 
!chatSection.dataset.initialized) {
chatSection.dataset.initialized = 'true';
initializeEnhancedChat();
setupEnhancedSocketListeners();
console.log('🎉 Enhanced chat ready!');
}
});
});

const chatSection = document.getElementById('chatSection');
if (chatSection) {
observer.observe(chatSection, { 
attributes: true, 
attributeFilter: ['style'] 
});
}
});

function handleChatKeypress(e) {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
sendEnhancedMessage();
}
}

async function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();
  
  if (!content) return;

  try {
    // Optimistic UI update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      content,
      sender_id: currentUser.id,
      users: currentUser,
      timestamp: new Date()
    };
    
    appendWhatsAppMessage(tempMsg);
    input.value = '';
    input.style.height = 'auto';

    // Send to server
    await apiCall('/api/community/messages', 'POST', { content });
    
    if (socket && currentUser.college) {
      socket.emit('stop_typing', { 
        collegeName: currentUser.college, 
        username: currentUser.username 
      });
    }
  } catch(error) {
    showMessage('❌ Failed to send', 'error');
  }
}

function handleWhatsAppKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendWhatsAppMessage();
  }
  
  // Auto-resize textarea
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
}

function showMessageOptions(messageId, isOwn) {
  const options = [
    { icon: '📋', label: 'Copy', action: () => copyMessage(messageId) },
    { icon: '↪️', label: 'Reply', action: () => replyToMessage(messageId) },
    { icon: '⭐', label: 'Star', action: () => starMessage(messageId) }
  ];

  if (isOwn) {
    options.push({ icon: '🗑️', label: 'Delete', action: () => deleteWhatsAppMessage(messageId) });
  }

  showContextMenu(options);
}

function scrollToBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }
}

// ========================================
// COMMUNITIES & CHAT
// ========================================

function loadCommunities() {
  // Initialize real community chat
  initializeRealCommunityChat();
}

async function initializeRealCommunityChat() {
  console.log('🚀 Initializing REAL community chat...');
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    showJoinCommunityPrompt();
    return;
  }
  
  try {
    currentUser = JSON.parse(userStr);
    
    if (!currentUser.communityJoined || !currentUser.college) {
      showJoinCommunityPrompt();
      return;
    }
    
    messageContainer = document.getElementById('unifiedMessages');
    if (!messageContainer) {
      console.error('❌ Message container not found');
      return;
    }
    
    initializeSocketConnection();
    await loadRealMessages();
    setupChatInput();
    updateCommunityHeader();
    
    console.log('✅ Real community chat initialized');
    
  } catch (error) {
    console.error('❌ Error initializing chat:', error);
    showErrorState('Failed to initialize chat');
  }
}

// ==========================================
// REAL-TIME CHAT INITIALIZATION
// ==========================================

async function initializeRealTimeChat() {
  console.log('🚀 Initializing real-time chat...');

  // Initialize Socket.IO connection
  initializeSocketConnection();

  // Load existing messages
  await loadCommunityMessages();

  // Set up input handlers
  setupUnifiedChatInput();

  // Update online count
  updateOnlineCount();

  console.log('✅ Real-time chat initialized');
}

// ==========================================
// SOCKET.IO CONNECTION
// ==========================================

function initializeSocketConnection() {
  if (socket && socket.connected) {
    console.log('✅ Socket already connected');
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
    }
    return;
  }

  socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
      socket.emit('user_online', currentUser.id);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
    updateConnectionStatus(false);
  });

  socket.on('reconnect', () => {
    console.log('🔄 Socket reconnected');
    updateConnectionStatus(true);
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
      loadCommunityMessages();
    }
  });

  socket.on('new_message', (message) => {
    console.log('📨 New message received:', message);
    addRealTimeMessage(message);
  });

  socket.on('message_deleted', ({ id }) => {
    console.log('🗑️ Message deleted:', id);
    removeMessageFromUI(id);
  });

  socket.on('online_count', (count) => {
    updateOnlineCount(count);
  });

  socket.on('user_typing', ({ username }) => {
    if (username !== currentUser?.username) {
      showTypingIndicator(username);
    }
  });

  socket.on('user_stop_typing', ({ username }) => {
    hideTypingIndicator(username);
  });
}

function updateConnectionStatus(isConnected) {
  const onlineCountEl = document.getElementById('onlineCount');
  if (onlineCountEl) {
    const currentCount = parseInt(onlineCountEl.textContent) || 0;
    onlineCountEl.textContent = isConnected ? currentCount : '0';
  }
}

function updateOnlineCount(count) {
  const onlineCountEl = document.getElementById('onlineCount');
  if (onlineCountEl) {
    onlineCountEl.textContent = count || '0';
  }
}

// ==========================================
// LOAD MESSAGES FROM API
// ==========================================

async function loadRealMessages() {
  try {
    console.log('📥 Loading real messages from backend...');
    
    messageContainer.innerHTML = `
      <div class="loading-messages-state">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>
    `;
    
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/api/community/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      if (data.needsJoinCommunity) {
        showJoinCommunityPrompt();
        return;
      }
      throw new Error(data.error || 'Failed to load messages');
    }
    
    messageContainer.innerHTML = '';
    
    if (!data.messages || data.messages.length === 0) {
      messageContainer.innerHTML = `
        <div class="empty-chat-state">
          <div class="empty-chat-icon">👋</div>
          <h3>No Messages Yet</h3>
          <p>Be the first to start the conversation!</p>
        </div>
      `;
      return;
    }
    
    data.messages.forEach(msg => {
      addRealMessageToUI(msg, true);
    });
    
    setTimeout(() => scrollToBottom(), 100);
    
    console.log(`✅ Loaded ${data.messages.length} real messages`);
    
  } catch (error) {
    console.error('❌ Error loading messages:', error);
    showErrorState('Failed to load messages: ' + error.message);
  }
}

    // Display all messages
    data.messages.forEach(msg => {
      addRealTimeMessage(msg, true); // Skip scroll for initial load
    });

    // Scroll to bottom after loading
    setTimeout(() => {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }, 100);

    console.log(`✅ Loaded ${data.messages.length} messages`);

  } catch (error) {
    console.error('❌ Load messages error:', error);
    const messagesEl = document.getElementById('unifiedMessages');
    if (messagesEl) {
      messagesEl.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Failed to Load Messages</h3>
          <p>${error.message}</p>
          <button onclick="loadCommunityMessages()" class="btn-primary">Retry</button>
        </div>
      `;
    }
  }
}

// ==========================================
// ADD MESSAGE TO UI
// ==========================================

function addRealMessageToUI(message, skipScroll = false) {
  const existingMsg = document.getElementById(`msg-${message.id}`);
  if (existingMsg) return;
  
  const emptyState = messageContainer.querySelector('.empty-chat-state');
  if (emptyState) emptyState.remove();
  
  const isOwnMessage = message.sender_id === currentUser.id;
  const sender = message.users?.username || 'User';
  const senderPic = message.users?.profile_pic || null;
  
  const timestamp = new Date(message.created_at);
  const timeStr = timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const messageEl = document.createElement('div');
  messageEl.className = `unified-message ${isOwnMessage ? 'own' : 'other'}`;
  messageEl.id = `msg-${message.id}`;
  
  let html = `
    <div class="message-header">
      <span class="sender-name">${isOwnMessage ? 'You' : sender}</span>
      <span class="message-time">${timeStr}</span>
    </div>
    <div class="message-content">
  `;
  
  if (message.content) {
    html += `<div class="message-text">${escapeHtml(message.content)}</div>`;
  }
  
  if (message.media_url) {
    if (message.media_type?.startsWith('image/')) {
      html += `<img src="${message.media_url}" class="message-media">`;
    } else if (message.media_type?.startsWith('video/')) {
      html += `<video src="${message.media_url}" controls class="message-media"></video>`;
    }
  }
  
  html += `</div>`;
  html += `
    <div class="message-actions">
      <button onclick="reactToMessage('${message.id}')">❤️</button>
      <button onclick="replyToMessage('${message.id}')">↩️</button>
      ${isOwnMessage ? `<button onclick="deleteMessage('${message.id}')">🗑️</button>` : ''}
    </div>
  `;
  
  messageEl.innerHTML = html;
  messageContainer.appendChild(messageEl);
  
  setTimeout(() => messageEl.classList.add('message-visible'), 10);
  if (!skipScroll) setTimeout(() => scrollToBottom(), 50);
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendRealMessage() {
  const input = document.getElementById('unifiedInput');
  const content = input?.value?.trim();
  
  if (!content) return;
  
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/api/community/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send message');
    }
    
    input.value = '';
    input.style.height = 'auto';
    
    if (socket) {
      socket.emit('stop_typing', {
        collegeName: currentUser.college,
        username: currentUser.username
      });
    }
    
    console.log('✅ Message sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    showMessage('Failed to send message', 'error');
  }
}

// ==========================================
// TYPING INDICATORS
// ==========================================

function handleTypingIndicator() {
  if (!socket || !currentUser || !currentUser.college) return;

  const now = Date.now();
  if (now - lastTypingEmit > 2000) {
    socket.emit('typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
    lastTypingEmit = now;
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (socket && currentUser.college) {
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
  const typingIndicatorEl = document.getElementById('typingIndicator');

  if (!typingIndicatorEl) return;

  if (typingUsers.size === 0) {
    typingIndicatorEl.style.display = 'none';
    return;
  }

  const usernames = Array.from(typingUsers);
  let text = '';

  if (usernames.length === 1) {
    text = `${usernames[0]} is typing...`;
  } else if (usernames.length === 2) {
    text = `${usernames[0]} and ${usernames[1]} are typing...`;
  } else {
    text = `${usernames.length} people are typing...`;
  }

  typingIndicatorEl.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="typingText">${text}</span>
    </div>
  `;
  typingIndicatorEl.style.display = 'block';

  // Scroll to bottom
  const messagesEl = document.getElementById('unifiedMessages');
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }
}

// ==========================================
// INPUT HANDLERS
// ==========================================

function setupUnifiedChatInput() {
  const input = document.getElementById('unifiedInput');
  if (!input) return;

  // Auto-resize
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    handleTypingIndicator();
  });

  // Enter to send
  input.addEventListener('keydown', handleUnifiedKeypress);
}

// ==========================================
// MESSAGE ACTIONS
// ==========================================

async function deleteUnifiedMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const data = await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

    if (data.success) {
      removeMessageFromUI(messageId);
      showMessage('🗑️ Message deleted', 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
  }
}

function removeMessageFromUI(messageId) {
  const messageEl = document.getElementById(`unified-msg-${messageId}`);
  if (messageEl) {
    messageEl.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => messageEl.remove(), 300);
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function playMessageSound(type) {
  try {
    const sounds = {
      send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354.wav',
      receive: 'https://assets.mixkit.co/active_storage/sfx/2357/2357.wav'
    };

    if (sounds[type]) {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.2;
      audio.play().catch(() => {}); // Silently fail
    }
  } catch (error) {
    // Ignore audio errors
  }
}


// ==========================================
// WHATSAPP MESSAGE FUNCTIONS
// ==========================================

async function loadWhatsAppMessages() {
  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('whatsappMessages');
    
    if (!messagesEl) return;

    // Keep date separator
    const dateSeparator = messagesEl.querySelector('.date-separator');
    messagesEl.innerHTML = '';
    if (dateSeparator) messagesEl.appendChild(dateSeparator);

    if (!data.messages || data.messages.length === 0) {
      messagesEl.innerHTML += `
        <div class="no-messages">
          <div style="font-size:64px;margin-bottom:20px;">👋</div>
          <h3 style="color:#4f74a3;margin-bottom:10px;">Welcome to Community Chat!</h3>
          <p style="color:#888;">Say hi to your college community</p>
        </div>
      `;
      return;
    }

    data.messages.reverse().forEach(msg => appendWhatsAppMessage(msg));
    scrollToBottom();
    
    // Update stats
    updateChatStats(data.messages.length);
  } catch(error) {
    console.error('', error);
    const messagesEl = document.getElementById('whatsappMessages');
    
    }
  }

function appendWhatsAppMessage(msg) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  const sender = (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || 'User';
  const messageTime = msg.timestamp ? new Date(msg.timestamp) : new Date();
  const timeLabel = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2,8));

  // Check if message already exists
  if (document.getElementById('wa-msg-' + messageId)) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;

  let messageHTML = '';
  
  // Add sender name for others
  if (!isOwn) {
    messageHTML += `<div class="message-sender-name">${escapeHtml(sender)}</div>`;
  }

  // Message bubble
  messageHTML += `
    <div class="message-bubble">
      <div class="message-text">${escapeHtml(msg.text || msg.content || '')}</div>
      <div class="message-meta">
        <span class="message-time">${timeLabel}</span>
        ${isOwn ? '<span class="message-status">✓✓</span>' : ''}
      </div>
      ${isOwn ? '<div class="message-tail own-tail"></div>' : '<div class="message-tail other-tail"></div>'}
    </div>
  `;

  // Message actions (on long press / click)
  messageHTML += `
    <div class="message-actions-menu" id="actions-${messageId}" style="display:none;">
      <button onclick="replyToMessage('${messageId}')">↩️ Reply</button>
      <button onclick="copyMessageText('${messageId}')">📋 Copy</button>
      <button onclick="forwardMessage('${messageId}')">↪️ Forward</button>
      ${isOwn ? `<button onclick="deleteWhatsAppMessage('${messageId}')" style="color:#ff6b6b;">🗑️ Delete</button>` : ''}
    </div>
  `;

  wrapper.innerHTML = messageHTML;
  
  // Add long press / right click for actions
  wrapper.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showMessageActions(messageId);
  });
  
  // Add long press for mobile
  let pressTimer;
  wrapper.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => showMessageActions(messageId), 500);
  });
  wrapper.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  messagesEl.appendChild(wrapper);
  scrollToBottom();

  if (!isOwn) playMessageSound('receive');
}

async function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();
  
  if (!content) {
    showMessage('⚠️ Message cannot be empty', 'error');
    input?.focus();
    return;
  }

  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }

  try {
    // Optimistic UI update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      content,
      sender_id: currentUser.id,
      users: currentUser,
      timestamp: new Date(),
      text: content
    };
    
    appendWhatsAppMessage(tempMsg);
    input.value = '';
    input.style.height = 'auto';

    // Send to server
    const response = await apiCall('/api/community/messages', 'POST', { content });
    
    if (response.success) {
      playMessageSound('send');
      
      // Stop typing indicator
      if (socket && currentUser.college) {
        socket.emit('stop_typing', { 
          collegeName: currentUser.college, 
          username: currentUser.username 
        });
      }
      
      // Remove temp message and add real one
      const tempEl = document.getElementById(`wa-msg-${tempMsg.id}`);
      if (tempEl) tempEl.remove();
      
      if (response.message) {
        appendWhatsAppMessage(response.message);
      }
    }
  } catch(error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');
  }
}

function handleWhatsAppKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendWhatsAppMessage();
  }
  
  // Auto-resize textarea
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
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

function showMessageActions(messageId) {
  // Hide all other action menus
  document.querySelectorAll('.message-actions-menu').forEach(menu => {
    menu.style.display = 'none';
  });
  
  // Show this message's actions
  const actionsMenu = document.getElementById(`actions-${messageId}`);
  if (actionsMenu) {
    actionsMenu.style.display = 'flex';
    
    // Hide after 5 seconds
    setTimeout(() => {
      actionsMenu.style.display = 'none';
    }, 5000);
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

function copyMessageText(messageId) {
  const messageEl = document.getElementById(`wa-msg-${messageId}`);
  const text = messageEl?.querySelector('.message-text')?.textContent;
  
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showMessage('📋 Message copied!', 'success');
  }).catch(() => {
    showMessage('❌ Failed to copy', 'error');
  });
}

function replyToMessage(messageId) {
  const messageEl = document.getElementById(`wa-msg-${messageId}`);
  const text = messageEl?.querySelector('.message-text')?.textContent;
  const sender = messageEl?.querySelector('.message-sender-name')?.textContent || 'You';
  
  if (!text) return;
  
  const input = document.getElementById('whatsappInput');
  if (input) {
    input.value = `@${sender}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}\n\n`;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
  
  showMessage(`↩️ Replying to ${sender}`, 'success');
}

function forwardMessage(messageId) {
  showMessage('↪️ Forward feature coming soon!', 'success');
}

function scrollToBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }
}

function updateChatStats(messageCount) {
  const totalMessages = document.getElementById('totalMessages');
  if (totalMessages) totalMessages.textContent = messageCount;
}

// ==========================================
// EMOJI & STICKER PICKERS
// ==========================================

function openEmojiPicker() {
  // Close any existing picker
  const existing = document.getElementById('emojiPickerPopup');
  if (existing) {
    existing.remove();
    return;
  }

  const picker = document.createElement('div');
  picker.id = 'emojiPickerPopup';
  picker.className = 'emoji-picker-popup';
  picker.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:5000;';

  const emojis = [
    { cat: 'Smileys', items: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋'] },
    { cat: 'Gestures', items: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐','🖖','👋','🤝','🙏'] },
    { cat: 'Hearts', items: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
    { cat: 'Objects', items: ['🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','⚽','🏀','🎮','🎯','🎪','🎨','🎭','🎬','🎤','🎧','🎵','🎶'] }
  ];

  let html = `
    <div class="emoji-picker-header">
      <input type="text" class="emoji-search" placeholder="Search emoji..." oninput="searchEmojis(this.value)">
      <button onclick="closeEmojiPicker()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888;">✕</button>
    </div>
    <div class="emoji-categories" id="emojiCategories">
  `;

  emojis.forEach(category => {
    html += `
      <div class="emoji-category">
        <div class="emoji-category-title">${category.cat}</div>
        <div class="emoji-grid">
          ${category.items.map(emoji => `
            <div class="emoji-item" onclick="insertEmoji('${emoji}')">${emoji}</div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';
  picker.innerHTML = html;
  document.body.appendChild(picker);
}

function closeEmojiPicker() {
  const picker = document.getElementById('emojiPickerPopup');
  if (picker) picker.remove();
}

function insertEmoji(emoji) {
  const input = document.getElementById('whatsappInput');
  if (input) {
    input.value += emoji;
    input.focus();
  }
  closeEmojiPicker();
}

function searchEmojis(query) {
  // Simple search implementation
  const categories = document.querySelectorAll('.emoji-category');
  categories.forEach(cat => {
    const items = cat.querySelectorAll('.emoji-item');
    let hasVisible = false;
    items.forEach(item => {
      // In real app, you'd have emoji names to search
      item.style.display = 'flex';
      hasVisible = true;
    });
    cat.style.display = hasVisible ? 'block' : 'none';
  });
}

function openStickerPicker() {
  showMessage('🎨 Sticker picker coming soon!', 'success');
  
  // Quick sticker selection
  const stickers = ['🔥', '💯', '✨', '⚡', '💪', '🎯', '🚀', '💝', '🎨', '📚'];
  const sticker = prompt('Quick sticker:\n' + stickers.join(' ') + '\n\nChoose one:');
  
  if (sticker && stickers.includes(sticker)) {
    const input = document.getElementById('whatsappInput');
    if (input) {
      input.value += sticker;
      input.focus();
    }
  }
}

function openAttachMenu() {
  const menu = document.createElement('div');
  menu.className = 'attach-menu-popup';
  menu.style.cssText = 'position:fixed;bottom:80px;left:50px;background:rgba(15,25,45,0.98);border:2px solid rgba(79,116,163,0.4);border-radius:15px;padding:15px;z-index:5000;';
  
  menu.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;min-width:200px;">
      <button onclick="attachPhoto()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(79,116,163,0.2);border:2px solid rgba(79,116,163,0.3);border-radius:12px;cursor:pointer;color:#4f74a3;font-weight:600;">
        <span style="font-size:32px;">📷</span>
        <span>Photo</span>
      </button>
      <button onclick="attachVideo()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(79,116,163,0.2);border:2px solid rgba(79,116,163,0.3);border-radius:12px;cursor:pointer;color:#4f74a3;font-weight:600;">
        <span style="font-size:32px;">🎥</span>
        <span>Video</span>
      </button>
      <button onclick="attachDocument()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(79,116,163,0.2);border:2px solid rgba(79,116,163,0.3);border-radius:12px;cursor:pointer;color:#4f74a3;font-weight:600;">
        <span style="font-size:32px;">📄</span>
        <span>Document</span>
      </button>
      <button onclick="menu.remove()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(239,68,68,0.2);border:2px solid rgba(239,68,68,0.3);border-radius:12px;cursor:pointer;color:#ff6b6b;font-weight:600;">
        <span style="font-size:32px;">✕</span>
        <span>Cancel</span>
      </button>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !e.target.closest('.icon-btn')) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

function attachPhoto() {
  showMessage('📷 Photo attachment coming soon!', 'success');
  document.querySelector('.attach-menu-popup')?.remove();
}

function attachVideo() {
  showMessage('🎥 Video attachment coming soon!', 'success');
  document.querySelector('.attach-menu-popup')?.remove();
}

function attachDocument() {
  showMessage('📄 Document attachment coming soon!', 'success');
  document.querySelector('.attach-menu-popup')?.remove();
}

// ========================================
// COLLEGE VERIFICATION
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

// ========================================
// SOCKET.IO REAL-TIME
// ========================================

function initializeSocket() {
if (socket) return;

socket = io(API_URL);

socket.on('connect', () => {
console.log('Socket connected');
if (currentUser?.college) socket.emit('join_college', currentUser.college);
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

setupEnhancedSocketListeners();
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


// ========================================
// PROFILE & SEARCH
// ========================================

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
const avatarContent = user.profile_pic ? 
`<img src="${user.profile_pic}" alt="${user.username}">` : '👤';

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
             <div class="profile-photo" style="${user.profile_pic ? `background-image:url('${user.profile_pic}');background-size:cover;` : ''}">
               ${!user.profile_pic ? '👤' : ''}
             </div>
             ${isOwnProfile ? '<button class="avatar-upload-btn" onclick="uploadProfilePic()">📷 Change</button>' : ''}
             <div class="active-badge">
               <span class="status-dot"></span>
               <span>Active</span>
             </div>
           </div>
           <div class="profile-name-section">
             <h2>${user.username}</h2>
             <div class="nickname-display">
               <span class="nickname-label">@${user.username}</span>
             </div>
             ${user.college ? `<p style="color:#888;font-size:14px;">🎓 ${user.college}</p>` : ''}
             ${user.registration_number ? `<p style="color:#888;font-size:13px;">📋 ${user.registration_number}</p>` : ''}
           </div>
           ${isOwnProfile ? '<button class="profile-edit-btn" onclick="toggleEditProfile()">✏️ Edit</button>' : ''}
         </div>
       </div>
       <div class="profile-stats-section">
         <div class="stat-card">
           <div class="stat-icon">📝</div>
           <div class="stat-value">${user.postCount || 0}</div>
           <div class="stat-title">Posts</div>
         </div>
         <div class="stat-card">
           <div class="stat-icon">🏆</div>
           <div class="stat-value">${user.badges?.length || 0}</div>
           <div class="stat-title">Badges</div>
         </div>
         <div class="stat-card">
           <div class="stat-icon">⏱️</div>
           <div class="stat-value">24h</div>
           <div class="stat-title">Active</div>
         </div>
       </div>
     </div>
   </div>
 `;

document.body.appendChild(modal);
}

// ========================================
// NAVIGATION
// ========================================

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

// ========================================
// POSTS SYSTEM
// ========================================

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
const msg = selectedPostDestination === 'profile' ? 
'✅ Posted to profile!' : '✅ Shared to community!';
showMessage(msg, 'success');
checkAndUpdateRewards('post');
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
const postedTo = post.posted_to === 'community' ? '🌐 Community' : '👤 Profile';
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
             ${post.users?.profile_pic ? 
               `<img src="${post.users.profile_pic}" class="enhanced-user-avatar">` : 
               '👤'
             }
           </div>
           <div class="enhanced-user-details">
             <div class="enhanced-username">@${author}</div>
             <div class="enhanced-post-meta">
               <span>${time}</span>
               <span>•</span>
               <span>${postedTo}</span>
             </div>
           </div>
         </div>
         ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️</button>` : ''}
       </div>
       <div class="enhanced-post-content">
         ${content ? `<div class="enhanced-post-text">${content}</div>` : ''}
         ${stickers.length > 0 ? 
           `<div class="post-stickers-container">
             ${stickers.map(s => `<span class="post-sticker">${s.emoji || s}</span>`).join('')}
           </div>` : ''
         }
         ${music ? 
           `<div class="post-music-container">
             <div class="music-player">
               <div class="music-info">
                 <div class="music-icon">${music.emoji || '🎵'}</div>
                 <div class="music-details">
                   <div class="music-name">${music.name}</div>
                   <div class="music-duration">${music.artist} • ${music.duration}</div>
                 </div>
               </div>
               <audio controls class="post-audio-player">
                 <source src="${music.url}" type="audio/mpeg">
               </audio>
             </div>
           </div>` : ''
         }
         ${media.length > 0 ? 
           `<div class="enhanced-post-media">
             ${media.map(m => 
               m.type === 'image' ? 
                 `<div class="enhanced-media-item"><img src="${m.url}"></div>` :
               m.type === 'video' ? 
                 `<div class="enhanced-media-item"><video src="${m.url}" controls></video></div>` :
                 `<div class="enhanced-media-item"><audio src="${m.url}" controls></audio></div>`
             ).join('')}
           </div>` : ''
         }
       </div>
       <div class="enhanced-post-footer">
         <div class="enhanced-post-stats">
           <span id="like-count-${post.id}">❤️ ${likeCount}</span>
           <span id="comment-count-${post.id}">💬 ${commentCount}</span>
           <span id="share-count-${post.id}">🔄 ${shareCount}</span>
         </div>
         <div class="enhanced-post-engagement">
           <button class="engagement-btn ${isLiked ? 'liked' : ''}" id="like-btn-${post.id}" onclick="toggleLike('${post.id}')">
             ${isLiked ? '❤️ Liked' : '❤️ Like'}
           </button>
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

async function toggleLike(postId) {
if (!currentUser) return showMessage('⚠️ Login to like', 'error');

try {
const likeBtn = document.querySelector(`#like-btn-${postId}`);
const likeCount = document.querySelector(`#like-count-${postId}`);

if (likeBtn) likeBtn.disabled = true;

const data = await apiCall(`/api/posts/${postId}/like`, 'POST');

if (data.success) {
  
  if (data.liked) {
    checkAndUpdateRewards('like');
  }
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
       <textarea id="commentInput" placeholder="Write a comment..." 
         style="width:100%;min-height:80px;padding:12px;background:rgba(20,30,50,0.6);
         border:1px solid rgba(79,116,163,0.3);border-radius:10px;color:white;
         font-family:inherit;resize:vertical;"></textarea>
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
       <div class="comment-item" style="background:rgba(15,25,45,0.9);border:1px solid rgba(79,116,163,0.2);
         border-radius:12px;padding:15px;margin-bottom:10px;">
         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
           <div style="display:flex;align-items:center;gap:10px;">
             <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4f74a3,#8da4d3);
               display:flex;align-items:center;justify-content:center;font-size:18px;">
               ${comment.users?.profile_pic ? 
                 `<img src="${comment.users.profile_pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : 
                 '👤'
               }
             </div>
             <div>
               <div style="font-weight:600;color:#4f74a3;">@${author}</div>
               <div style="font-size:11px;color:#888;">${time}</div>
             </div>
           </div>
           ${isOwn ? 
             `<button onclick="deleteComment('${comment.id}','${postId}')" 
               style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:none;
               padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">🗑️</button>` : 
             ''
           }
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
checkAndUpdateRewards('comment');
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
     <div style="background:rgba(15,25,45,0.9);border:1px solid rgba(79,116,163,0.2);
       border-radius:12px;padding:20px;margin:20px 0;">
       <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;">
         <button onclick="shareVia('copy','${postUrl}')" class="share-option-btn">
           <span style="font-size:32px;">📋</span>
           <span>Copy Link</span>
         </button>
         <button onclick="shareVia('whatsapp','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn">
           <span style="font-size:32px;">💬</span>
           <span>WhatsApp</span>
         </button>
         <button onclick="shareVia('twitter','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn">
           <span style="font-size:32px;">🐦</span>
           <span>Twitter</span>
         </button>
         <button onclick="shareVia('native','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn">
           <span style="font-size:32px;">📤</span>
           <span>More</span>
         </button>
       </div>
     </div>
     <div style="background:rgba(79,116,163,0.1);padding:12px;border-radius:8px;">
       <input type="text" value="${postUrl}" readonly id="shareUrlInput" 
         style="width:100%;background:transparent;border:none;color:#4f74a3;text-align:center;font-size:14px;">
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
await navigator.share({ 
title: 'VibeXpert', 
text: decodeURIComponent(text), 
url 
});
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

// ========================================
// POST MEDIA FEATURES
// ========================================

function showPostDestinationModal() {
showModal('postDestinationModal');
}

function selectPostDestination(destination) {
selectedPostDestination = destination;

const displayEl = document.getElementById('currentDestination');
if (displayEl) {
displayEl.textContent = destination === 'profile' ? 'My Profile' : 'Community Feed';
}

closeModal('postDestinationModal');
showMessage(`✅ Will post to ${destination === 'profile' ? 'Profile' : 'Community'}`, 'success');
}

function openPhotoGallery() {
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*,video/*,audio/*';
input.multiple = true;

input.onchange = (e) => {
const files = Array.from(e.target.files);
handleMediaFiles(files);
};

input.click();
}

function openCamera() {
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.capture = 'environment';

input.onchange = (e) => {
const files = Array.from(e.target.files);
handleMediaFiles(files);
};

input.click();
}

function handleMediaFiles(files) {
if (!files || files.length === 0) return;

files.forEach(file => {
if (file.size > 10 * 1024 * 1024) {
showMessage('⚠️ File too large (max 10MB)', 'error');
return;
}

selectedFiles.push(file);

const reader = new FileReader();
reader.onload = (e) => {
previewUrls.push(e.target.result);
updatePhotoPreview();
};
reader.readAsDataURL(file);
});
}

function updatePhotoPreview() {
const container = document.getElementById('photoPreviewContainer');
if (!container) return;

if (previewUrls.length === 0) {
container.style.display = 'none';
return;
}

container.style.display = 'grid';
container.innerHTML = '';

previewUrls.forEach((url, index) => {
const wrapper = document.createElement('div');
wrapper.className = 'media-preview-item';

const file = selectedFiles[index];
const isVideo = file.type.startsWith('video/');
const isAudio = file.type.startsWith('audio/');

if (isVideo) {
wrapper.innerHTML = `
       <video src="${url}" controls></video>
       <button class="remove-media-btn" onclick="removeMedia(${index})">&times;</button>
     `;
} else if (isAudio) {
wrapper.innerHTML = `
       <div class="audio-preview">🎵 ${file.name}</div>
       <audio src="${url}" controls></audio>
       <button class="remove-media-btn" onclick="removeMedia(${index})">&times;</button>
     `;
} else {
wrapper.innerHTML = `
       <img src="${url}" alt="Preview">
       <div class="media-actions">
         <button onclick="openCropEditor(${index})">✂️</button>
         <button onclick="openPhotoEditor(${index})">🎨</button>
         <button onclick="removeMedia(${index})">&times;</button>
       </div>
     `;
}

container.appendChild(wrapper);
});
}

function removeMedia(index) {
selectedFiles.splice(index, 1);
previewUrls.splice(index, 1);
updatePhotoPreview();
showMessage('✅ Media removed', 'success');
}

function openMusicSelector() {
const modal = document.getElementById('musicSelectorModal');
if (!modal) return;

let html = '<div class="music-library">';

musicLibrary.forEach(music => {
const isSelected = selectedMusic && selectedMusic.id === music.id;
html += `
     <div class="music-item ${isSelected ? 'selected' : ''}" onclick="selectMusic(${music.id})">
       <div class="music-item-icon">${music.emoji}</div>
       <div class="music-item-info">
         <div class="music-item-name">${music.name}</div>
         <div class="music-item-artist">${music.artist}</div>
         <div class="music-item-duration">${music.duration}</div>
       </div>
       ${isSelected ? '<div class="music-selected-badge">✓</div>' : ''}
     </div>
   `;
});

html += '</div>';

const selector = document.getElementById('musicSelector');
if (selector) selector.innerHTML = html;

showModal('musicSelectorModal');
}

function selectMusic(musicId) {
const music = musicLibrary.find(m => m.id === musicId);
if (!music) return;

selectedMusic = music;
closeModal('musicSelectorModal');
updateSelectedAssets();
showMessage(`🎵 Added: ${music.name}`, 'success');
}

function openStickerSelector() {
const modal = document.getElementById('stickerSelectorModal');
if (!modal) return;

let html = '<div class="sticker-categories">';

Object.keys(stickerLibrary).forEach(category => {
html += `<h3 style="text-transform:capitalize;color:#4f74a3;margin:20px 0 10px 0;">${category}</h3>`;
html += '<div class="sticker-grid">';

stickerLibrary[category].forEach(sticker => {
const isSelected = selectedStickers.some(s => s.id === sticker.id);
html += `
       <div class="sticker-item ${isSelected ? 'selected' : ''}" onclick="toggleSticker('${sticker.id}', '${category}')">
         <span class="sticker-emoji">${sticker.emoji}</span>
         <span class="sticker-name">${sticker.name}</span>
       </div>
     `;
});

html += '</div>';
});

html += '</div>';

const selector = document.getElementById('stickerSelector');
if (selector) selector.innerHTML = html;

showModal('stickerSelectorModal');
}

function toggleSticker(stickerId, category) {
const sticker = stickerLibrary[category].find(s => s.id === stickerId);
if (!sticker) return;

const index = selectedStickers.findIndex(s => s.id === stickerId);

if (index > -1) {
selectedStickers.splice(index, 1);
showMessage('✅ Sticker removed', 'success');
} else {
if (selectedStickers.length >= 5) {
showMessage('⚠️ Max 5 stickers', 'error');
return;
}
selectedStickers.push(sticker);
showMessage(`✅ Added: ${sticker.name}`, 'success');
}

updateSelectedAssets();
openStickerSelector();
}

function updateSelectedAssets() {
const container = document.getElementById('selectedAssets');
if (!container) return;

if (!selectedMusic && selectedStickers.length === 0) {
container.style.display = 'none';
return;
}

container.style.display = 'block';
let html = '<div class="selected-assets-wrapper">';

if (selectedMusic) {
html += `
     <div class="selected-asset-item">
       <span>${selectedMusic.emoji} ${selectedMusic.name}</span>
       <button onclick="removeMusic()">&times;</button>
     </div>
   `;
}

selectedStickers.forEach((sticker, index) => {
html += `
     <div class="selected-asset-item">
       <span>${sticker.emoji} ${sticker.name}</span>
       <button onclick="removeSticker(${index})">&times;</button>
     </div>
   `;
});

html += '</div>';
container.innerHTML = html;
}

function removeMusic() {
selectedMusic = null;
updateSelectedAssets();
showMessage('✅ Music removed', 'success');
}

function removeSticker(index) {
selectedStickers.splice(index, 1);
updateSelectedAssets();
showMessage('✅ Sticker removed', 'success');
}

function openPhotoEditor(index) {
currentEditIndex = index;
const img = document.getElementById('editImage');
if (img) {
img.src = previewUrls[index];
showModal('photoEditorModal');
}
}

function applyFilter(filterName) {
const img = document.getElementById('editImage');
if (!img) return;

currentFilters = {};

switch(filterName) {
case 'normal':
img.style.filter = 'none';
break;
case 'vintage':
currentFilters = { sepia: 50, contrast: 110, brightness: 90 };
break;
case 'clarendon':
currentFilters = { contrast: 120, saturate: 135 };
break;
case 'moon':
currentFilters = { grayscale: 100, contrast: 110, brightness: 110 };
break;
case 'lark':
currentFilters = { contrast: 90, brightness: 110, saturate: 130 };
break;
case 'reyes':
currentFilters = { sepia: 22, brightness: 110, contrast: 85, saturate: 75 };
break;
}

applyFiltersToImage();
}

function applyFiltersToImage() {
const img = document.getElementById('editImage');
if (!img) return;

let filterString = '';

if (currentFilters.brightness) filterString += `brightness(${currentFilters.brightness}%) `;
if (currentFilters.contrast) filterString += `contrast(${currentFilters.contrast}%) `;
if (currentFilters.saturate) filterString += `saturate(${currentFilters.saturate}%) `;
if (currentFilters.sepia) filterString += `sepia(${currentFilters.sepia}%) `;
if (currentFilters.grayscale) filterString += `grayscale(${currentFilters.grayscale}%) `;

img.style.filter = filterString.trim();
}

function resetFilters() {
const img = document.getElementById('editImage');
if (img) img.style.filter = 'none';
currentFilters = {};
showMessage('✅ Filters reset', 'success');
}

function saveEditedPhoto() {
showMessage('✅ Changes saved!', 'success');
closeModal('photoEditorModal');
}

function openCropEditor(index) {
currentCropIndex = index;
const img = document.getElementById('cropImage');

if (img) {
img.src = previewUrls[index];
showModal('cropEditorModal');

setTimeout(() => {
if (cropper) cropper.destroy();

cropper = new Cropper(img, {
aspectRatio: NaN,
viewMode: 1,
autoCropArea: 1,
responsive: true,
background: false
});
}, 300);
}
}

function resetCrop() {
if (cropper) {
cropper.reset();
showMessage('✅ Crop reset', 'success');
}
}

function rotateImage() {
if (cropper) {
cropper.rotate(90);
}
}

function applyCrop() {
if (!cropper) return;

const canvas = cropper.getCroppedCanvas();
if (!canvas) return;

canvas.toBlob((blob) => {
const file = new File([blob], selectedFiles[currentCropIndex].name, {
type: 'image/jpeg'
});

selectedFiles[currentCropIndex] = file;

const reader = new FileReader();
reader.onload = (e) => {
previewUrls[currentCropIndex] = e.target.result;
updatePhotoPreview();
closeModal('cropEditorModal');
showMessage('✅ Crop applied!', 'success');

if (cropper) {
cropper.destroy();
cropper = null;
}
};
reader.readAsDataURL(file);
}, 'image/jpeg', 0.9);
}

// Setup aspect ratio buttons
document.addEventListener('DOMContentLoaded', () => {
const aspectBtns = document.querySelectorAll('.aspect-ratio-btn');
aspectBtns.forEach(btn => {
btn.addEventListener('click', () => {
aspectBtns.forEach(b => b.classList.remove('active'));
btn.classList.add('active');

const ratio = btn.getAttribute('data-ratio');
if (cropper) {
if (ratio === 'free') {
cropper.setAspectRatio(NaN);
} else {
cropper.setAspectRatio(eval(ratio));
}
}
});
});
});

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
  console.log('📊 Loading Rewards Page');
  
  // Just update the roadmap UI - that's it!
  setTimeout(() => updateRoadmapUI(), 100);
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
// ========================================
// REWARDS ROADMAP SYSTEM
// ========================================

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

function updateRoadmapUI() {
  if (!currentUser) return;
  
  const userStats = {
    posts: currentUser.postCount || 0,
    comments: currentUser.commentCount || 0,
    likes: currentUser.likeCount || 0,
    days_active: currentUser.daysActive || 1
  };
  
  const currentLevel = calculateUserLevel(userStats);
  const nextLevel = getNextLevel(currentLevel);
  
  updateCharacterPosition(currentLevel);  // ✅ Make sure this line is here
  updateProgressInfo(currentLevel, nextLevel, userStats);
  updateMilestoneStatuses(userStats);
}

function calculateUserLevel(stats) {
  const levels = ['wood', 'bronze', 'silver', 'gold'];
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    const reqs = roadmapLevels[level].requirements;
    if (stats.posts >= reqs.posts && stats.comments >= reqs.comments && 
        stats.likes >= reqs.likes && stats.days_active >= reqs.days_active) {
      return level;
    }
  }
  return 'wood';
}

function getNextLevel(currentLevel) {
  const levels = ['wood', 'bronze', 'silver', 'gold'];
  const idx = levels.indexOf(currentLevel);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

function updateCharacterPosition(level) {
  const char = document.getElementById('roadmapCharacter');
  if (char) {
    char.style.top = roadmapLevels[level].position + 'px';
    char.textContent = roadmapLevels[level].icon;
  }
}

function updateProgressInfo(currentLevel, nextLevel, stats) {
  const nameEl = document.getElementById('currentLevelName');
  const descEl = document.getElementById('progressDescription');
  const tasksEl = document.getElementById('progressTasks');
  const barEl = document.getElementById('progressBarFill');
  const percentEl = document.getElementById('progressPercentage');
  
  if (nameEl) nameEl.textContent = roadmapLevels[currentLevel].name;
  
  if (nextLevel) {
    const reqs = roadmapLevels[nextLevel].requirements;
    const progress = ((stats.posts/reqs.posts + stats.comments/reqs.comments + 
                      stats.likes/reqs.likes + stats.days_active/reqs.days_active) / 4) * 100;
    
    if (descEl) descEl.textContent = `Progress to ${roadmapLevels[nextLevel].name}`;
    if (tasksEl) tasksEl.innerHTML = `
      <div style="margin-top: 15px;">
        <div>📝 Posts: ${stats.posts}/${reqs.posts}</div>
        <div>💬 Comments: ${stats.comments}/${reqs.comments}</div>
        <div>❤️ Likes: ${stats.likes}/${reqs.likes}</div>
        <div>📅 Days Active: ${stats.days_active}/${reqs.days_active}</div>
      </div>`;
    if (barEl) barEl.style.width = Math.min(100, progress) + '%';
    if (percentEl) percentEl.textContent = Math.round(progress) + '%';
  } else {
    if (descEl) descEl.textContent = '🏆 Maximum Level!';
    if (tasksEl) tasksEl.innerHTML = '<div style="margin-top:15px;color:#FFD700;">Highest level achieved! 🎉</div>';
    if (barEl) barEl.style.width = '100%';
    if (percentEl) percentEl.textContent = '100%';
  }
}

function updateMilestoneStatuses(stats) {
  Object.keys(roadmapLevels).forEach(level => {
    const card = document.querySelector(`.milestone-level.${level}`);
    if (!card) return;
    
    const reqs = roadmapLevels[level].requirements;
    const completed = stats.posts >= reqs.posts && stats.comments >= reqs.comments && 
                     stats.likes >= reqs.likes && stats.days_active >= reqs.days_active;
    
    const badge = card.querySelector('.level-status');
    if (badge) {
      if (completed) {
        badge.className = 'level-status completed';
        badge.textContent = '✅ Completed';
      } else {
        const current = calculateUserLevel(stats);
        const next = getNextLevel(current);
        if (level === next) {
          badge.className = 'level-status in-progress';
          badge.textContent = '🎯 In Progress';
        } else {
          badge.className = 'level-status locked';
          badge.textContent = '🔒 Locked';
        }
      }
    }
  });
}

function checkAndUpdateRewards(action) {
  if (!currentUser) return;
  
  switch(action) {
    case 'post': currentUser.postCount = (currentUser.postCount || 0) + 1; break;
    case 'comment': currentUser.commentCount = (currentUser.commentCount || 0) + 1; break;
    case 'like': currentUser.likeCount = (currentUser.likeCount || 0) + 1; break;
  }
  
  localStorage.setItem('user', JSON.stringify(currentUser));
  updateRoadmapUI();
  checkLevelUp();
}

function checkLevelUp() {
  const stats = {
    posts: currentUser.postCount || 0,
    comments: currentUser.commentCount || 0,
    likes: currentUser.likeCount || 0,
    days_active: currentUser.daysActive || 1
  };
  
  const current = calculateUserLevel(stats);
  const previous = currentUser.currentLevel || 'wood';
  
  if (current !== previous) {
    currentUser.currentLevel = current;
    localStorage.setItem('user', JSON.stringify(currentUser));
    showLevelUpCelebration(current);
  }
}

function showLevelUpCelebration(level) {
  const data = roadmapLevels[level];
  const modal = document.createElement('div');
  modal.className = 'modal celebration-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="celebration-modal-content">
      <div class="celebration-emoji">${data.icon}</div>
      <h2 class="celebration-title" style="color:${data.color}">Level Up!</h2>
      <p class="celebration-message">You've reached ${data.name}!</p>
      <div class="celebration-stats" style="background:linear-gradient(135deg,${data.color}33,${data.color}22);">
        <div class="celebration-count">${data.name}</div>
        <div class="celebration-label">New Rank</div>
      </div>
      <div class="celebration-quote">
        <strong>Rewards:</strong><br>${data.rewards.join(' • ')}
      </div>
      <button class="celebration-button" style="background:linear-gradient(135deg,${data.color},${data.color}cc);" 
        onclick="this.closest('.modal').remove()">Awesome! 🎉</button>
    </div>`;
  document.body.appendChild(modal);
  createConfetti();
}

window.updateRoadmapUI = updateRoadmapUI;
window.checkAndUpdateRewards = checkAndUpdateRewards;
// ========================================
// CONSOLE LOG - INITIALIZATION COMPLETE
// ========================================

console.log('%c🎉 VibeXpert Enhanced Chat Ready! 🎉', 'color: #4f74a3; font-size: 20px; font-weight: bold;');
console.log('%cFeatures: Real-time chat, Reactions, Typing indicators, Message actions', 'color: #8da4d3; font-size: 14px;');

// ==========================================
// FIREWORKS ANIMATION - BIGGER & FASTER
// ==========================================

function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.velocity = {
        x: (Math.random() - 0.5) * 12,  // FASTER (was 8)
        y: (Math.random() - 0.5) * 12   // FASTER (was 8)
      };
      this.alpha = 1;
      this.decay = Math.random() * 0.018 + 0.018;  // SLOWER FADE (was 0.015)
      this.size = Math.random() * 1 + 2;  // BIGGER (was 3 + 2)
    }
    
    update() {
      this.velocity.x *= 0.98;
      this.velocity.y *= 0.98;
      this.velocity.y += 0.1;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= this.decay;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  let particles = [];
  // MORE COLORFUL (12 colors instead of 6)
  const colors = [
    '#FFD700', '#FFA500', '#FF6B6B', '#FF1493', 
    '#00FF00', '#00FFFF', '#FF00FF', '#4f74a3', 
    '#8da4d3', '#C0C0C0', '#FF4500', '#7FFF00'
  ];
  
  function createFirework(x, y) {
    const particleCount = 60;  // MORE PARTICLES (was 30)
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color));
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles = particles.filter(particle => {
      particle.update();
      particle.draw();
      return particle.alpha > 0;
    });
    
    requestAnimationFrame(animate);
  }
  
  // MORE FREQUENT FIREWORKS (800ms instead of 2000ms)
  setInterval(() => {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    createFirework(x, y);
  }, 800);
  
  animate();
}

// ==========================================
// REWARDS PROGRESS UPDATE
// ==========================================

function updateRewardsProgress() {
  if (!currentUser) return;
  
  const userStats = {
    activeHours: currentUser.activeHours || 0,
    weeksActive: currentUser.weeksActive || 0,
    alternativeHours: currentUser.alternativeHours || 0,
    posts: currentUser.postCount || 0,
    views: currentUser.viewCount || 0,
    likes: currentUser.likeCount || 0,
    followers: currentUser.followerCount || 0
  };
  
  const woodProgress = Math.min(100, (userStats.activeHours / 20) * 100);
  const altWoodProgress = Math.min(100, (userStats.alternativeHours / 50) * 100);
  const progress = Math.max(woodProgress, altWoodProgress);
  
  const progressBar = document.getElementById('progressBarFill');
  const progressPercent = document.getElementById('progressPercentage');
  
  if (progressBar) progressBar.style.width = progress + '%';
  if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
  
  const tasksEl = document.getElementById('progressTasks');
  if (tasksEl) {
    tasksEl.innerHTML = `
      <div style="margin-top: 15px;">
        <div style="color: ${userStats.activeHours >= 20 ? '#22c55e' : '#888'};">
          ⏱️ Active Hours: ${userStats.activeHours}/20 per week
        </div>
        <div style="color: ${userStats.weeksActive >= 4 ? '#22c55e' : '#888'};">
          📅 Weeks: ${userStats.weeksActive}/4
        </div>
        <div style="color: ${userStats.alternativeHours >= 50 ? '#22c55e' : '#888'};">
          🔥 Alternative: ${userStats.alternativeHours}/50 hours in 10 days
        </div>
      </div>
    `;
  }
}

function updateRewardsCharacterPosition(level) {
  const positions = {
    wood: 80,
    bronze: 480,
    silver: 880,
    gold: 1280
  };
   
   const emojis = {
    wood: '🚶‍♂️',    // Walking man
    bronze: '🏃‍♂️',   // Running man
    silver: '🤸‍♂️',   // Gymnast
    gold: '👑'       // Crown/King
  };
  
  const char = document.getElementById('roadmapCharacter');
  if (char) {
    char.style.top = (positions[level] || 80) + 'px';
    char.textContent = emojis[level] || '🚶‍♂️';
  }
}

// Initialize when rewards page loads
document.addEventListener('DOMContentLoaded', () => {
  initFireworks();
  
  const rewardsPage = document.getElementById('rewards');
  if (rewardsPage) {
    const observer = new MutationObserver(() => {
      if (rewardsPage.style.display !== 'none') {
        updateRewardsProgress();
        updateRewardsCharacterPosition('wood');
      }
    });
    
    observer.observe(rewardsPage, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
  }
});

// PROFILE AVATAR UPDATE
// ==========================================

function updateProfileAvatar() {
  if (!currentUser) return;
  
  const avatarImg = document.getElementById('profileAvatarImg');
  const avatarInitial = document.getElementById('profileAvatarInitial');
  const userName = document.getElementById('userName');
  
  if (userName) {
    userName.textContent = currentUser.username || 'User';
  }
  
  if (currentUser.profile_pic && avatarImg && avatarInitial) {
    avatarImg.src = currentUser.profile_pic;
    avatarImg.style.display = 'block';
    avatarInitial.style.display = 'none';
  } else if (avatarInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    avatarInitial.textContent = initial;
  }
}

// Call this after login
document.addEventListener('DOMContentLoaded', function() {
  if (currentUser) {
    updateProfileAvatar();
  }
});

// ==========================================
// SEARCH BAR IN MENU FUNCTIONALITY
// ==========================================

function initializeMenuSearch() {
  const menuSearchBox = document.getElementById('searchBox');
  const mobileSearchBox = document.getElementById('mobileSearchBox');
  
  if (menuSearchBox) {
    menuSearchBox.addEventListener('input', (e) => {
      handleMenuSearch(e.target.value, 'searchResults');
    });
  }
  
  if (mobileSearchBox) {
    mobileSearchBox.addEventListener('input', (e) => {
      handleMenuSearch(e.target.value, 'mobileSearchResults');
    });
  }
}

function handleMenuSearch(query, resultsId) {
  const searchResults = document.getElementById(resultsId);
  
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (query.length < 2) {
    if (searchResults) searchResults.style.display = 'none';
    return;
  }
  
  if (searchResults) {
    searchResults.innerHTML = '<div class="no-results">🔍 Searching...</div>';
    searchResults.style.display = 'block';
  }
  
  searchTimeout = setTimeout(() => performUserSearch(query), 600);
}

// Initialize menu search on load
document.addEventListener('DOMContentLoaded', function() {
  initializeMenuSearch();
});

// ==========================================
// REALVIBE FUNCTIONALITY
// ==========================================

let realVibeMediaFile = null;
let realVibeMediaType = null;

function openRealVibeCreator() {
  const modal = document.getElementById('realVibeCreatorModal');
  if (modal) modal.style.display = 'flex';
  
  // Reset form
  clearRealVibePreview();
  const caption = document.getElementById('realVibeCaption');
  if (caption) caption.value = '';
  updateCaptionCounter();
  
  // Disable publish button
  const publishBtn = document.getElementById('publishRealVibeBtn');
  if (publishBtn) publishBtn.disabled = true;
}

function captureRealVibePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleRealVibeFile(file, 'image');
  };
  
  input.click();
}

function uploadRealVibeMedia() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      handleRealVibeFile(file, type);
    }
  };
  
  input.click();
}

function captureRealVibeVideo() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  input.capture = 'environment';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleRealVibeFile(file, 'video');
  };
  
  input.click();
}

function handleRealVibeFile(file, type) {
  if (file.size > 50 * 1024 * 1024) {
    showMessage('⚠️ File too large (max 50MB)', 'error');
    return;
  }
  
  realVibeMediaFile = file;
  realVibeMediaType = type;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewArea = document.getElementById('realVibePreviewArea');
    const previewImg = document.getElementById('realVibePreviewImg');
    const previewVideo = document.getElementById('realVibePreviewVideo');
    
    if (type === 'image') {
      previewImg.src = e.target.result;
      previewImg.style.display = 'block';
      previewVideo.style.display = 'none';
    } else {
      previewVideo.src = e.target.result;
      previewVideo.style.display = 'block';
      previewImg.style.display = 'none';
    }
    
    if (previewArea) previewArea.style.display = 'block';
    
    // Enable publish button
    const publishBtn = document.getElementById('publishRealVibeBtn');
    if (publishBtn) publishBtn.disabled = false;
  };
  
  reader.readAsDataURL(file);
}

function clearRealVibePreview() {
  realVibeMediaFile = null;
  realVibeMediaType = null;
  
  const previewArea = document.getElementById('realVibePreviewArea');
  const previewImg = document.getElementById('realVibePreviewImg');
  const previewVideo = document.getElementById('realVibePreviewVideo');
  
  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  if (previewVideo) {
    previewVideo.src = '';
    previewVideo.style.display = 'none';
  }
  if (previewArea) previewArea.style.display = 'none';
  
  // Disable publish button
  const publishBtn = document.getElementById('publishRealVibeBtn');
  if (publishBtn) publishBtn.disabled = true;
}

async function publishRealVibe() {
  if (!realVibeMediaFile) {
    showMessage('⚠️ Please add media first', 'error');
    return;
  }
  
  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }
  
  try {
    showMessage('✨ Publishing RealVibe...', 'success');
    
    const caption = document.getElementById('realVibeCaption')?.value.trim();
    const visibility = document.querySelector('input[name="realVibeVisibility"]:checked')?.value || 'public';
    
    const formData = new FormData();
    formData.append('media', realVibeMediaFile);
    formData.append('caption', caption);
    formData.append('visibility', visibility);
    formData.append('type', realVibeMediaType);
    
    // For now, simulate success (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showMessage('🎉 RealVibe published successfully!', 'success');
    closeModal('realVibeCreatorModal');
    
    // Reload RealVibes
    loadRealVibes();
    
  } catch (error) {
    console.error('Publish RealVibe error:', error);
    showMessage('❌ Failed to publish RealVibe', 'error');
  }
}

function updateCaptionCounter() {
  const caption = document.getElementById('realVibeCaption');
  const counter = document.getElementById('captionCount');
  
  if (caption && counter) {
    counter.textContent = caption.value.length;
  }
}

// Add caption counter listener
document.addEventListener('DOMContentLoaded', function() {
  const caption = document.getElementById('realVibeCaption');
  if (caption) {
    caption.addEventListener('input', updateCaptionCounter);
  }
});

async function loadRealVibes() {
  const storiesGrid = document.getElementById('realVibeStoriesGrid');
  const yourGrid = document.getElementById('yourRealVibesGrid');
  
  // For now, show empty state (replace with actual API call)
  if (storiesGrid) {
    storiesGrid.innerHTML = `
      <div class="no-realvibes">
        <div class="no-realvibes-icon">✨</div>
        <h4>No RealVibes Yet</h4>
        <p>Be the first to share your authentic moment!</p>
        <button class="create-first-realvibe" onclick="openRealVibeCreator()">Create First RealVibe</button>
      </div>
    `;
  }
  
  if (yourGrid) {
    yourGrid.innerHTML = '<div class="no-your-realvibes"><p>You haven\'t created any RealVibes yet</p></div>';
  }
}

function viewRealVibe(realVibeId) {
  const modal = document.getElementById('realVibeViewerModal');
  if (modal) modal.style.display = 'flex';
  
  // Load and display RealVibe (implement with actual data)
  // For now, just show modal structure
}

function viewPreviousRealVibe() {
  // Navigate to previous RealVibe
  console.log('Previous RealVibe');
}

function viewNextRealVibe() {
  // Navigate to next RealVibe
  console.log('Next RealVibe');
}

function reactToRealVibe() {
  showMessage('❤️ Reacted!', 'success');
}

function replyToRealVibe() {
  showMessage('💬 Reply feature coming soon!', 'success');
}

function shareRealVibe() {
  showMessage('🔄 Share feature coming soon!', 'success');
}

// Load RealVibes when page is shown
document.addEventListener('DOMContentLoaded', function() {
  const realVibePage = document.getElementById('realvibe');
  if (realVibePage) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.target.style.display !== 'none') {
          loadRealVibes();
        }
      });
    });
    
    observer.observe(realVibePage, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
  }
});
// ==========================================
// SUBSCRIPTION SYSTEM
// ==========================================

function openSubscriptionPopup() {
  const popup = document.getElementById('subscriptionPopup');
  if (popup) {
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeSubscriptionPopup() {
  const popup = document.getElementById('subscriptionPopup');
  if (popup) {
    popup.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

function viewAllPlans() {
  closeSubscriptionPopup();
  showPage('subscriptionPlans');
  
  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function selectPlan(planType) {
  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    closeSubscriptionPopup();
    showAuthPopup();
    return;
  }
  
  // Plan details
  const plans = {
    noble: {
      name: 'Noble',
      firstTimePrice: 9,
      regularPrice: 79,
      posters: 5,
      videos: 1,
      days: 15
    },
    royal: {
      name: 'Royal',
      firstTimePrice: 15,
      regularPrice: 99,
      posters: 5,
      videos: 3,
      days: 23
    }
  };
  
  const plan = plans[planType];
  
  if (!plan) {
    showMessage('❌ Invalid plan', 'error');
    return;
  }
  
  // Check if first time subscriber
  const isFirstTime = !currentUser.hasSubscribed;
  const price = isFirstTime ? plan.firstTimePrice : plan.regularPrice;
  
  // Confirmation
  const confirmMsg = `Subscribe to ${plan.name} Plan?\n\n` +
    `Price: ₹${price}\n` +
    `Posters: ${plan.posters}\n` +
    `Videos: ${plan.videos}\n` +
    `Duration: ${plan.days} days\n\n` +
    (isFirstTime ? '🎉 First time special price!' : 'Regular pricing');
  
  if (!confirm(confirmMsg)) return;
  
  try {
    showMessage('💳 Processing payment...', 'success');
    
    // Simulate payment processing (replace with actual payment gateway)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would integrate with actual payment gateway
    // For now, we'll simulate success
    
    // Update user subscription
    currentUser.subscription = {
      plan: planType,
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000),
      posters: plan.posters,
      videos: plan.videos,
      postersUsed: 0,
      videosUsed: 0
    };
    
    currentUser.hasSubscribed = true;
    currentUser.isPremium = true;
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    closeSubscriptionPopup();
    
    showMessage('🎉 Subscription successful!', 'success');
    
    // Show success modal
    showSubscriptionSuccessModal(plan);
    
  } catch (error) {
    console.error('Subscription error:', error);
    showMessage('❌ Payment failed. Please try again.', 'error');
  }
}

function showSubscriptionSuccessModal(plan) {
  const modal = document.createElement('div');
  modal.className = 'modal celebration-modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="celebration-modal-content">
      <div class="celebration-emoji">👑</div>
      <h2 class="celebration-title" style="color:#FFD700;">Welcome to ${plan.name}!</h2>
      <p class="celebration-message">You can now advertise your content</p>
      
      <div class="celebration-stats" style="background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));">
        <div class="celebration-count">${plan.posters} Posters + ${plan.videos} Video${plan.videos > 1 ? 's' : ''}</div>
        <div class="celebration-label">Available Now</div>
      </div>
      
      <div class="celebration-quote">
        <strong>Duration:</strong> ${plan.days} days<br>
        Your ads will appear in Community & RealVibes sections
      </div>
      
      <button class="celebration-button" style="background:linear-gradient(135deg,#FFD700,#FFA500);" 
        onclick="this.closest('.modal').remove(); showPage('posts');">
        Start Creating Ads 🚀
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  createConfetti();
}

// Check subscription status
function checkSubscriptionStatus() {
  if (!currentUser || !currentUser.subscription) return null;
  
  const now = new Date();
  const endDate = new Date(currentUser.subscription.endDate);
  
  if (now > endDate) {
    // Subscription expired
    currentUser.isPremium = false;
    currentUser.subscription = null;
    localStorage.setItem('user', JSON.stringify(currentUser));
    return null;
  }
  
  return currentUser.subscription;
}

// Display premium badge if user is subscribed
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

// Call this after login
document.addEventListener('DOMContentLoaded', function() {
  if (currentUser) {
    updatePremiumBadge();
  }
});

// TWITTER-STYLE FEED FUNCTIONS
// ==========================================

function toggleTwitterFeed() {
  const twitterPanel = document.getElementById('twitterFeedPanel');
  const whatsappMain = document.getElementById('whatsappMain');
  
  if (!twitterPanel || !whatsappMain) return;

  if (twitterPanel.style.display === 'none') {
    // Show Twitter feed
    twitterPanel.style.display = 'flex';
    whatsappMain.style.display = 'none';
    loadTwitterFeed();
  } else {
    // Show WhatsApp chat
    twitterPanel.style.display = 'none';
    whatsappMain.style.display = 'flex';
  }
}

async function loadTwitterFeed() {
  const feedEl = document.getElementById('twitterFeed');
  if (!feedEl) return;

  try {
    feedEl.innerHTML = '<div class="loading-spinner">⏳ Loading posts...</div>';
    
    const data = await apiCall('/api/posts/community', 'GET');

    if (!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = `
        <div class="no-posts-state">
          <div class="no-posts-icon">📸</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
          <button class="create-post-btn" onclick="openCreatePostModal()">Create Post</button>
        </div>
      `;
      return;
    }

    feedEl.innerHTML = renderTwitterPosts(data.posts);
  } catch(error) {
    console.error('Load feed:', error);
    feedEl.innerHTML = '<div class="error-state">❌ Failed to load posts</div>';
  }
}

function renderTwitterPosts(posts) {
  let html = '';

  posts.forEach(post => {
    const author = post.users?.username || 'User';
    const authorId = post.users?.id || '';
    const content = post.content || '';
    const media = post.media || [];
    const time = formatTimeAgo(new Date(post.created_at || post.timestamp));
    const isOwn = currentUser && authorId === currentUser.id;
    const likeCount = post.like_count || 0;
    const commentCount = post.comment_count || 0;
    const shareCount = post.share_count || 0;
    const isLiked = post.is_liked || false;

    html += `
      <div class="twitter-post" id="twitter-post-${post.id}">
        <div class="twitter-post-header">
          <div class="twitter-user-info" onclick="showUserProfile('${authorId}')">
            <div class="twitter-avatar">
              ${post.users?.profile_pic ? 
                `<img src="${post.users.profile_pic}">` : 
                '👤'
              }
            </div>
            <div class="twitter-user-details">
              <span class="twitter-username">@${author}</span>
              <span class="twitter-time">· ${time}</span>
            </div>
          </div>
          ${isOwn ? `<button class="twitter-delete-btn" onclick="deleteTwitterPost('${post.id}')">🗑️</button>` : ''}
        </div>

        <div class="twitter-post-content">
          ${content ? `<p class="twitter-text">${content}</p>` : ''}
          
          ${media.length > 0 ? `
            <div class="twitter-media ${media.length === 1 ? 'single' : 'grid'}">
              ${media.slice(0, 4).map((m, idx) => {
                if (m.type === 'image') {
                  return `<img src="${m.url}" onclick="openMediaViewer('${post.id}', ${idx})">`;
                } else if (m.type === 'video') {
                  return `<video src="${m.url}" controls></video>`;
                }
                return '';
              }).join('')}
              ${media.length > 4 ? `<div class="media-overlay">+${media.length - 4}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="twitter-post-actions">
          <button class="twitter-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleTwitterLike('${post.id}')">
            <span>${isLiked ? '❤️' : '🤍'}</span>
            <span>${likeCount}</span>
          </button>
          <button class="twitter-action-btn" onclick="openTwitterComments('${post.id}')">
            <span>💬</span>
            <span>${commentCount}</span>
          </button>
          <button class="twitter-action-btn" onclick="shareTwitterPost('${post.id}')">
            <span>🔄</span>
            <span>${shareCount}</span>
          </button>
        </div>
      </div>
    `;
  });

  return html;
}

async function toggleTwitterLike(postId) {
  if (!currentUser) return showMessage('⚠️ Login to like', 'error');

  try {
    const btn = document.querySelector(`#twitter-post-${postId} .twitter-action-btn.liked, #twitter-post-${postId} .twitter-action-btn:first-child`);
    if (btn) btn.disabled = true;

    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');

    if (data.success) {
      const postEl = document.getElementById(`twitter-post-${postId}`);
      if (postEl) {
        const likeBtn = postEl.querySelector('.twitter-action-btn:first-child');
        if (likeBtn) {
          likeBtn.classList.toggle('liked', data.liked);
          likeBtn.innerHTML = `
            <span>${data.liked ? '❤️' : '🤍'}</span>
            <span>${data.likeCount}</span>
          `;
          likeBtn.disabled = false;
        }
      }
    }
  } catch(error) {
    showMessage('❌ Failed to like', 'error');
  }
}

function openCreatePostModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:600px;">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>Create Post</h2>
      
      <textarea id="newPostContent" placeholder="What's happening?" 
        style="width:100%;min-height:120px;padding:15px;background:rgba(20,30,50,0.6);
        border:2px solid rgba(79,116,163,0.3);border-radius:12px;color:white;
        font-family:inherit;resize:vertical;margin-bottom:15px;"></textarea>

      <div id="newPostMediaPreview" style="display:none;margin-bottom:15px;"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button onclick="selectPostMedia()" 
          style="background:rgba(79,116,163,0.2);color:#4f74a3;border:2px solid rgba(79,116,163,0.3);
          padding:10px 20px;border-radius:10px;cursor:pointer;">
          📷 Add Photo/Video
        </button>
        <button onclick="submitNewPost()" 
          style="background:linear-gradient(135deg,#4f74a3,#8da4d3);color:white;border:none;
          padding:12px 30px;border-radius:10px;font-weight:700;cursor:pointer;">
          Post
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

let newPostMediaFiles = [];

function selectPostMedia() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    newPostMediaFiles = files;
    previewNewPostMedia(files);
  };
  input.click();
}

function previewNewPostMedia(files) {
  const preview = document.getElementById('newPostMediaPreview');
  if (!preview) return;

  preview.style.display = 'grid';
  preview.style.gridTemplateColumns = 'repeat(auto-fill,minmax(100px,1fr))';
  preview.style.gap = '10px';
  preview.innerHTML = '';

  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;';
      
      if (file.type.startsWith('video/')) {
        div.innerHTML = `<video src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;"></video>`;
      } else {
        div.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
      }
      
      div.innerHTML += `<button onclick="removeNewPostMedia(${idx})" 
        style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.7);color:white;
        border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;">×</button>`;
      
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removeNewPostMedia(idx) {
  newPostMediaFiles.splice(idx, 1);
  previewNewPostMedia(newPostMediaFiles);
  if (newPostMediaFiles.length === 0) {
    document.getElementById('newPostMediaPreview').style.display = 'none';
  }
}

async function submitNewPost() {
  const content = document.getElementById('newPostContent')?.value.trim();
  
  if (!content && newPostMediaFiles.length === 0) {
    return showMessage('⚠️ Add content or media', 'error');
  }

  try {
    showMessage('📤 Creating post...', 'success');

    const formData = new FormData();
    formData.append('content', content);
    formData.append('postTo', 'community');

    newPostMediaFiles.forEach(file => {
      formData.append('media', file);
    });

    await apiCall('/api/posts', 'POST', formData);
    
    showMessage('✅ Post created!', 'success');
    document.querySelector('.modal').remove();
    newPostMediaFiles = [];
    loadTwitterFeed();
  } catch(error) {
    showMessage('❌ Failed to create post', 'error');
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
  return date.toLocaleDateString();
}

function initWhatsAppFeatures() {
  // Setup typing indicator
  const input = document.getElementById('whatsappInput');
  if (input) {
    let typingTimeout;
    input.addEventListener('input', () => {
      if (socket && currentUser && currentUser.college) {
        socket.emit('typing', { 
          collegeName: currentUser.college, 
          username: currentUser.username 
        });
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          socket.emit('stop_typing', { 
            collegeName: currentUser.college, 
            username: currentUser.username 
          });
        }, 2000);
      }
    });
  }
}

function searchChats() {
  const query = document.getElementById('chatSearchBox')?.value.toLowerCase() || '';
  const chatItems = document.querySelectorAll('.chat-item');
  
  chatItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? 'flex' : 'none';
  });
}

function openChat(chatId) {
  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget?.classList.add('active');
}

function refreshChats() {
  loadWhatsAppMessages();
  showMessage('🔄 Refreshed', 'success');
}

// Update socket listeners for WhatsApp
if (socket) {
  socket.on('new_message', (message) => {
    appendWhatsAppMessage(message);
    
    // Show notification if not focused
    if (document.hidden) {
      const unreadBadge = document.getElementById('unreadCount');
      if (unreadBadge) {
        const count = parseInt(unreadBadge.textContent || '0') + 1;
        unreadBadge.textContent = count;
        unreadBadge.style.display = 'inline';
      }
    }
  });
  
  socket.on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username) {
      showTypingIndicator(data.username);
    }
  });
  
  socket.on('user_stop_typing', (data) => {
    hideTypingIndicator(data.username);
  });
}

function showTypingIndicator(username) {
  let indicator = document.getElementById('typing-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'whatsapp-typing-indicator';
    document.getElementById('whatsappMessages')?.appendChild(indicator);
  }
  indicator.innerHTML = `
    <div class="typing-bubble">
      <span>${username} is typing</span>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  scrollToBottom();
}

function hideTypingIndicator(username) {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// ==========================================
// ENHANCED PROFILE FUNCTIONS
// ==========================================

let profilePhotoActionsVisible = false;

// Show enhanced profile modal
function showEnhancedProfile() {
  if (!currentUser) return;
  
  const modal = document.getElementById('enhancedProfileModal');
  if (modal) {
    modal.style.display = 'flex';
    loadEnhancedProfileData();
  }
}

// Close enhanced profile
function closeEnhancedProfile() {
  const modal = document.getElementById('enhancedProfileModal');
  if (modal) modal.style.display = 'none';
  profilePhotoActionsVisible = false;
}

// Load profile data
async function loadEnhancedProfileData() {
  if (!currentUser) return;
  
  // Display name and username
  const displayName = document.getElementById('profileDisplayName');
  const username = document.getElementById('profileUsername');
  
  if (displayName) displayName.textContent = currentUser.username || 'User';
  if (username) username.textContent = '@' + (currentUser.username || 'user');
  
  // College info
  const collegeEl = document.getElementById('profileCollege');
  if (collegeEl && currentUser.college) {
    collegeEl.textContent = `🎓 ${currentUser.college}`;
  }
  
  // Profile photo
  updateProfilePhotoDisplay();
  
  // Bio
  const bioText = document.getElementById('bioText');
  if (bioText) {
    if (currentUser.bio) {
      bioText.textContent = currentUser.bio;
      bioText.style.color = '#e0e0e0';
    } else {
      bioText.textContent = 'Click to add bio...';
      bioText.style.color = '#888';
    }
  }
  
  // Cover photo
  if (currentUser.coverPhoto) {
    const cover = document.getElementById('profileCover');
    if (cover) {
      cover.style.backgroundImage = `url('${currentUser.coverPhoto}')`;
      cover.style.backgroundSize = 'cover';
      cover.style.backgroundPosition = 'center';
    }
  }
  
  // Stats
  updateProfileStats();
  
  // Badges
  updateProfileBadges();
}

// Update profile photo display
function updateProfilePhotoDisplay() {
  const photoImg = document.getElementById('profilePhotoImg');
  const photoInitial = document.getElementById('profilePhotoInitial');
  
  if (currentUser.profile_pic && photoImg && photoInitial) {
    photoImg.src = currentUser.profile_pic;
    photoImg.style.display = 'block';
    photoInitial.style.display = 'none';
  } else if (photoInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    photoInitial.textContent = initial;
    photoInitial.style.display = 'block';
    if (photoImg) photoImg.style.display = 'none';
  }
  
  // Also update header avatar
  const headerImg = document.getElementById('profileAvatarImg');
  const headerInitial = document.getElementById('profileAvatarInitial');
  
  if (currentUser.profile_pic && headerImg && headerInitial) {
    headerImg.src = currentUser.profile_pic;
    headerImg.style.display = 'block';
    headerInitial.style.display = 'none';
  } else if (headerInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    headerInitial.textContent = initial;
  }
}

// Toggle photo actions
function togglePhotoActions() {
  const actions = document.getElementById('profilePhotoActions');
  if (!actions) return;
  
  profilePhotoActionsVisible = !profilePhotoActionsVisible;
  actions.style.display = profilePhotoActionsVisible ? 'flex' : 'none';
}

// Capture photo from camera
function captureProfilePhoto() {
  const input = document.getElementById('profilePhotoCameraInput');
  if (input) input.click();
}

// Upload photo from gallery
function uploadProfilePhoto() {
  const input = document.getElementById('profilePhotoInput');
  if (input) input.click();
}

// Handle photo upload
async function handleProfilePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showMessage('⚠️ Photo too large (max 5MB)', 'error');
    return;
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showMessage('⚠️ Please select an image file', 'error');
    return;
  }
  
  try {
    showMessage('📤 Uploading photo...', 'success');
    
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const data = await apiCall('/api/user/profile-photo', 'POST', formData);
    
    if (data.success && data.photoUrl) {
      currentUser.profile_pic = data.photoUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      updateProfilePhotoDisplay();
      showMessage('✅ Photo updated!', 'success');
      
      // Hide actions
      const actions = document.getElementById('profilePhotoActions');
      if (actions) actions.style.display = 'none';
      profilePhotoActionsVisible = false;
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    showMessage('❌ Failed to upload photo', 'error');
  }
  
  // Clear input
  event.target.value = '';
}

// Remove profile photo
async function removeProfilePhoto() {
  if (!confirm('Remove profile photo?')) return;
  
  try {
    showMessage('🗑️ Removing photo...', 'success');
    
    const data = await apiCall('/api/user/profile-photo', 'DELETE');
    
    if (data.success) {
      currentUser.profile_pic = null;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      updateProfilePhotoDisplay();
      showMessage('✅ Photo removed', 'success');
      
      // Hide actions
      const actions = document.getElementById('profilePhotoActions');
      if (actions) actions.style.display = 'none';
      profilePhotoActionsVisible = false;
    }
  } catch (error) {
    console.error('Photo remove error:', error);
    showMessage('❌ Failed to remove photo', 'error');
  }
}

// Edit cover photo
function editCoverPhoto() {
  const input = document.getElementById('coverPhotoInput');
  if (input) input.click();
}

// Handle cover photo upload
async function handleCoverPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    showMessage('⚠️ Photo too large (max 5MB)', 'error');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    showMessage('⚠️ Please select an image file', 'error');
    return;
  }
  
  try {
    showMessage('📤 Uploading cover...', 'success');
    
    const formData = new FormData();
    formData.append('coverPhoto', file);
    
    const data = await apiCall('/api/user/cover-photo', 'POST', formData);
    
    if (data.success && data.photoUrl) {
      currentUser.coverPhoto = data.photoUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      const cover = document.getElementById('profileCover');
      if (cover) {
        cover.style.backgroundImage = `url('${data.photoUrl}')`;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
      }
      
      showMessage('✅ Cover updated!', 'success');
    }
  } catch (error) {
    console.error('Cover upload error:', error);
    showMessage('❌ Failed to upload cover', 'error');
  }
  
  event.target.value = '';
}

// Edit bio
function editBio() {
  const bioDisplay = document.getElementById('bioDisplay');
  const bioEdit = document.getElementById('bioEdit');
  const bioInput = document.getElementById('bioInput');
  const bioCount = document.getElementById('bioCount');
  
  if (!bioDisplay || !bioEdit || !bioInput) return;

}
  


console.log('✨ RealVibe features initialized!');

// ==========================================
// FIXED COMMUNITY CHAT - COMPLETE SOLUTION
// ==========================================

// Additional chat-specific global variables (socket, currentUser, typingTimeout already declared globally)
let chatMessages = [];
let isLoadingMessages = false;
let messageContainer = null;

// ==========================================
// INITIALIZE CHAT WHEN SECTION OPENS
// ==========================================

function openCommunityChat() {
  if (!currentUser) {
    showMessage('Please login first', 'error');
    return;
  }

  if (!currentUser.community_joined || !currentUser.college) {
    showJoinCommunityModal();
    return;
  }

  // Show chat section
  document.querySelectorAll('.main-section').forEach(s => s.style.display = 'none');
  const chatSection = document.getElementById('chatSection');
  if (chatSection) {
    chatSection.style.display = 'block';
    initializeCommunityChat();
  }
}

async function initializeCommunityChat() {
  console.log('🚀 Initializing community chat...');

  // Set up message container reference
  messageContainer = document.getElementById('chatMessages');
  if (!messageContainer) {
    console.error('❌ Chat messages container not found!');
    return;
  }

  // Initialize socket connection
  initializeSocket();

  // Load existing messages
  await loadCommunityMessages();

  // Set up input handlers
  setupChatInput();

  // Set up emoji picker
  setupEmojiPicker();

  console.log('✅ Community chat initialized');
}

// ==========================================
// SOCKET.IO CONNECTION
// ==========================================

function initializeSocketConnection() {
  if (socket && socket.connected) {
    console.log('✅ Socket already connected');
    socket.emit('join_college', currentUser.college);
    return;
  }
  
  socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    socket.emit('join_college', currentUser.college);
    socket.emit('user_online', currentUser.id);
    updateConnectionStatus(true);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
    updateConnectionStatus(false);
  });
  
  socket.on('reconnect', () => {
    console.log('🔄 Socket reconnected');
    updateConnectionStatus(true);
    socket.emit('join_college', currentUser.college);
    loadRealMessages();
  });
  
  socket.on('new_message', (message) => {
    console.log('📨 New message received:', message);
    addRealMessageToUI(message);
  });
  
  socket.on('message_deleted', ({ id }) => {
    console.log('🗑️ Message deleted:', id);
    removeMessageFromUI(id);
  });
  
  socket.on('online_count', (count) => {
    updateOnlineCount(count);
  });
  
  socket.on('user_typing', ({ username }) => {
    if (username !== currentUser.username) {
      showTypingIndicator(username);
    }
  });
  
  socket.on('user_stop_typing', ({ username }) => {
    hideTypingIndicator(username);
  });
}

function updateConnectionStatus(isConnected) {
  const statusEl = document.getElementById('connectionStatus');
  if (!statusEl) return;

  if (isConnected) {
    statusEl.innerHTML = '<span style="color:#51cf66;">● Connected</span>';
  } else {
    statusEl.innerHTML = '<span style="color:#ff6b6b;">● Disconnected</span>';
  }
}

function updateOnlineCount(count) {
  const countEl = document.getElementById('chatOnlineCount');
  if (countEl) {
    countEl.textContent = count || 0;
  }
}

// ==========================================
// LOAD MESSAGES FROM DATABASE
// ==========================================

async function loadCommunityMessages() {
  if (isLoadingMessages) return;
  isLoadingMessages = true;

  try {
    console.log('📥 Loading messages...');
    
    if (!messageContainer) {
      messageContainer = document.getElementById('chatMessages');
    }

    // Show loading state
    messageContainer.innerHTML = `
      <div class="loading-messages-state">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>
    `;

    const token = localStorage.getItem('vibexpert_token');
    const response = await fetch(`${API_URL}/api/community/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📦 Received data:', data);

    if (!data.success) {
      if (data.needsJoinCommunity) {
        messageContainer.innerHTML = `
          <div class="empty-chat-state">
            <div class="empty-chat-icon">🏫</div>
            <h3>Join Your College Community</h3>
            <p>Connect with students from your college</p>
            <button onclick="showJoinCommunityModal()" class="btn-primary">Join Now</button>
          </div>
        `;
        return;
      }
    }

    // Clear loading state
    messageContainer.innerHTML = '';

    if (!data.messages || data.messages.length === 0) {
      messageContainer.innerHTML = `
        <div class="empty-chat-state">
          <div class="empty-chat-icon">👋</div>
          <h3>No Messages Yet</h3>
          <p>Be the first to start the conversation!</p>
        </div>
      `;
      return;
    }

    // Store messages
    chatMessages = data.messages;

    // Add date separator
    addDateSeparator();

    // Display all messages in correct order
    data.messages.forEach(msg => {
      addMessageToUI(msg, true);
    });

    // Scroll to bottom
    setTimeout(() => scrollToBottom(), 100);

    console.log(`✅ Loaded ${data.messages.length} messages`);

  } catch (error) {
    console.error('❌ Load messages error:', error);
    messageContainer.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Failed to Load Messages</h3>
        <p>${error.message}</p>
        <button onclick="loadCommunityMessages()" class="btn-primary">Retry</button>
      </div>
    `;
  } finally {
    isLoadingMessages = false;
  }
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendCommunityMessage() {
  const input = document.getElementById('chatInput');
  const content = input?.value?.trim();

  if (!content) {
    return;
  }

  if (!currentUser || !currentUser.community_joined) {
    showMessage('Please join a community first', 'error');
    return;
  }

  try {
    // Create temporary message for immediate feedback
    const tempId = 'temp-' + Date.now();
    const tempMessage = {
      id: tempId,
      content: content,
      sender_id: currentUser.id,
      college_name: currentUser.college,
      created_at: new Date().toISOString(),
      users: {
        username: currentUser.username,
        profile_pic: currentUser.profile_pic
      },
      isTemp: true
    };

    // Add to UI immediately
    addMessageToUI(tempMessage, false);

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Send to server
    const token = localStorage.getItem('vibexpert_token');
    const response = await fetch(`${API_URL}/api/community/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    const data = await response.json();

    if (data.success && data.message) {
      // Remove temporary message
      removeMessageFromUI(tempId);
      
      // Add real message (if not already added by socket)
      const messageExists = document.getElementById(`msg-${data.message.id}`);
      if (!messageExists) {
        addMessageToUI(data.message, false);
      }

      // Play send sound
      playSound('send');

      console.log('✅ Message sent:', data.message.id);
    } else {
      throw new Error(data.error || 'Failed to send message');
    }

  } catch (error) {
    console.error('❌ Send error:', error);
    showMessage('Failed to send message: ' + error.message, 'error');
    
    // Mark temp messages as failed
    document.querySelectorAll('[id^="msg-temp-"]').forEach(el => {
      el.style.opacity = '0.5';
      el.style.border = '2px solid #ff6b6b';
    });
  }

  // Stop typing indicator
  if (socket && currentUser.college) {
    socket.emit('stop_typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  }
}

// ==========================================
// ADD MESSAGE TO UI
// ==========================================

function addMessageToUI(message, skipScroll = false) {
  if (!messageContainer) {
    messageContainer = document.getElementById('chatMessages');
  }

  if (!messageContainer) return;

  // Check if message already exists
  const existingMsg = document.getElementById(`msg-${message.id}`);
  if (existingMsg) {
    console.log('⚠️ Message already exists:', message.id);
    return;
  }

  // Remove empty state if present
  const emptyState = messageContainer.querySelector('.empty-chat-state');
  if (emptyState) {
    emptyState.remove();
  }

  const isOwnMessage = message.sender_id === currentUser?.id;
  const sender = message.users?.username || message.sender_name || 'User';
  const timestamp = new Date(message.created_at || message.timestamp);
  const timeStr = timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`;
  messageEl.id = `msg-${message.id}`;

  let html = '';

  // Add sender name for other users
  if (!isOwnMessage) {
    html += `<div class="message-sender">@${escapeHtml(sender)}</div>`;
  }

  // Message bubble
  html += `
    <div class="message-bubble">
      <div class="message-content">${escapeHtml(message.content || message.text)}</div>
      <div class="message-footer">
        <span class="message-time">${timeStr}</span>
        ${isOwnMessage ? '<span class="message-status">✓✓</span>' : ''}
      </div>
    </div>
  `;

  // Message actions
  html += `
    <div class="message-actions">
      <button class="message-action-btn" onclick="reactToMessage('${message.id}')" title="React">
        ❤️
      </button>
      <button class="message-action-btn" onclick="copyMessage('${message.id}')" title="Copy">
        📋
      </button>
      ${isOwnMessage ? `
        <button class="message-action-btn delete-btn" onclick="deleteMessage('${message.id}')" title="Delete">
          🗑️
        </button>
      ` : ''}
    </div>
  `;

  messageEl.innerHTML = html;

  // Append to container
  messageContainer.appendChild(messageEl);

  // Animate entrance
  setTimeout(() => {
    messageEl.classList.add('message-visible');
  }, 10);

  // Scroll to bottom
  if (!skipScroll) {
    setTimeout(() => scrollToBottom(), 50);
  }

  // Play receive sound for other users' messages
  if (!isOwnMessage && !message.isTemp) {
    playSound('receive');
  }
}

// ==========================================
// REMOVE MESSAGE FROM UI
// ==========================================

function removeMessageFromUI(messageId) {
  const messageEl = document.getElementById(`msg-${messageId}`);
  if (messageEl) {
    messageEl.style.animation = 'fadeOutMessage 0.3s ease-out';
    setTimeout(() => messageEl.remove(), 300);
  }
}

// ==========================================
// DELETE MESSAGE
// ==========================================

async function deleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const token = localStorage.getItem('vibexpert_token');
    const response = await fetch(`${API_URL}/api/community/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      removeMessageFromUI(messageId);
      console.log('✅ Message deleted');
    } else {
      throw new Error(data.error);
    }

  } catch (error) {
    console.error('❌ Delete error:', error);
    showMessage('Failed to delete message', 'error');
  }
}

// ==========================================
// REACT TO MESSAGE
// ==========================================

async function reactToMessage(messageId) {
  // Show emoji picker
  showEmojiPickerForMessage(messageId);
}

function showEmojiPickerForMessage(messageId) {
  // Remove any existing picker
  const existingPicker = document.querySelector('.emoji-picker-popup');
  if (existingPicker) {
    existingPicker.remove();
    return;
  }

  const picker = document.createElement('div');
  picker.className = 'emoji-picker-popup';
  picker.innerHTML = `
    <div class="emoji-picker-header">
      <span>React with emoji</span>
      <button onclick="this.closest('.emoji-picker-popup').remove()">✕</button>
    </div>
    <div class="emoji-picker-grid">
      ${['❤️', '👍', '😂', '😮', '😢', '🔥', '🎉', '👏', '💯', '⭐', '🙌', '🤝'].map(emoji => `
        <button class="emoji-btn" onclick="addReactionToMessage('${messageId}', '${emoji}')">
          ${emoji}
        </button>
      `).join('')}
    </div>
  `;

  document.body.appendChild(picker);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closePickerOnOutside(e) {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener('click', closePickerOnOutside);
      }
    });
  }, 100);
}

async function addReactionToMessage(messageId, emoji) {
  // Close picker
  const picker = document.querySelector('.emoji-picker-popup');
  if (picker) picker.remove();

  try {
    const token = localStorage.getItem('vibexpert_token');
    const response = await fetch(`${API_URL}/api/community/messages/${messageId}/react`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emoji })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Reaction added');
    }

  } catch (error) {
    console.error('❌ React error:', error);
  }
}

// ==========================================
// COPY MESSAGE
// ==========================================

function copyMessage(messageId) {
  const messageEl = document.getElementById(`msg-${messageId}`);
  if (!messageEl) return;

  const content = messageEl.querySelector('.message-content')?.textContent;
  if (!content) return;

  navigator.clipboard.writeText(content).then(() => {
    showMessage('Message copied!', 'success');
  }).catch(() => {
    showMessage('Failed to copy', 'error');
  });
}

// ==========================================
// TYPING INDICATORS
// ==========================================

function handleTyping() {
  if (!socket || !currentUser) return;

  const now = Date.now();
  if (now - (window.lastTypingEmit || 0) < 1000) return;

  window.lastTypingEmit = now;

  socket.emit('typing', {
    collegeName: currentUser.college,
    username: currentUser.username
  });

  // Auto-stop typing after 3 seconds
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  }, 3000);
}

function showTypingIndicator(username) {
  typingUsers.add(username);
  updateTypingIndicator();
}

function hideTypingIndicator(username) {
  typingUsers.delete(username);
  updateTypingIndicator();
}

function updateTypingIndicator() {
  let typingIndicatorEl = document.getElementById('typingIndicator');

  if (!typingIndicatorEl) return;

  if (typingUsers.size === 0) {
    typingIndicatorEl.style.display = 'none';
    return;
  }

  const usernames = Array.from(typingUsers);
  let text = '';
  
  if (usernames.length === 1) {
    text = `${usernames[0]} is typing...`;
  } else if (usernames.length === 2) {
    text = `${usernames[0]} and ${usernames[1]} are typing...`;
  } else {
    text = `${usernames.length} people are typing...`;
  }

  typingIndicatorEl.textContent = text;
  typingIndicatorEl.style.display = 'block';
}

// ==========================================
// UNIFIED CHAT INPUT HANDLERS
// ==========================================

function setupChatInput() {
  const input = document.getElementById('chatInput');
  if (!input) return;

  // Auto-resize
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    handleTyping();
  });

  // Enter to send
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCommunityMessage();
    }
  });
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendCommunityMessage();
  }
}

function handleChatInput() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendButton');

  if (input && sendBtn) {
    sendBtn.disabled = !input.value.trim();
  }
}

function sendMessage() {
  sendCommunityMessage();
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function scrollToBottom() {
  if (!messageContainer) return;
  
  messageContainer.scrollTo({
    top: messageContainer.scrollHeight,
    behavior: 'smooth'
  });
}

function addDateSeparator() {
  if (!messageContainer) return;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const separator = document.createElement('div');
  separator.className = 'date-separator';
  separator.innerHTML = `<span>${dateStr}</span>`;
  messageContainer.appendChild(separator);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function playSound(type) {
  try {
    const sounds = {
      send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354.wav',
      receive: 'https://assets.mixkit.co/active_storage/sfx/2357/2357.wav'
    };

    if (sounds[type]) {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.2;
      audio.play().catch(() => {}); // Silently fail
    }
  } catch (error) {
    // Ignore audio errors
  }
}

function setupEmojiPicker() {
  // Emoji picker is now shown on demand
  console.log('✅ Emoji picker ready');
}

// ==========================================
// AMAZING COMMUNITY CHAT SYSTEM - ENHANCED
// ==========================================

let selectedMediaFile = null;
let selectedMediaType = null;
let isUserScrolling = false;
let lastSeenMessageId = null;
let unseenMessageCount = 0;
let messageQueue = [];
let isProcessingMessages = false;
let typingIndicatorTimeout = null;

// Enhanced message ordering system with error handling
function addMessageToQueue(message) {
  if (!message || !message.id) {
    console.warn('Invalid message added to queue:', message);
    return;
  }
  
  // Prevent duplicate messages
  if (messageQueue.some(m => m.id === message.id)) {
    return;
  }
  
  messageQueue.push(message);
  
  // Process queue with debounce for performance
  clearTimeout(window.messageQueueTimeout);
  window.messageQueueTimeout = setTimeout(processMessageQueue, 50);
}

async function processMessageQueue() {
  if (isProcessingMessages || messageQueue.length === 0) return;
  
  isProcessingMessages = true;
  
  try {
    // Sort messages by timestamp to ensure proper order
    messageQueue.sort((a, b) => {
      const timeA = new Date(a.created_at || a.timestamp).getTime();
      const timeB = new Date(b.created_at || b.timestamp).getTime();
      return timeA - timeB;
    });
    
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      
      // Add timestamp if missing
      if (message.created_at) {
        message.timestamp = new Date(message.created_at).getTime();
      } else {
        message.timestamp = Date.now();
      }
      
      await addMessageToUIOrdered(message);
      
      // Small delay to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  } catch (error) {
    console.error('Error processing message queue:', error);
  } finally {
    isProcessingMessages = false;
    scrollToBottomSmooth();
  }
}

// Enhanced UI message addition with performance optimizations
async function addMessageToUIOrdered(message) {
  const container = document.getElementById('messagesContainer');
  if (!container) {
    console.warn('Messages container not found');
    return;
  }

  // Check if message already exists
  const existingMsg = document.getElementById(`msg-${message.id}`);
  if (existingMsg) {
    console.log('Message already exists:', message.id);
    return;
  }

  // Remove empty state
  const emptyState = container.querySelector('.no-messages');
  if (emptyState) emptyState.remove();

  const isOwn = message.sender_id === currentUser?.id;
  const sender = message.users?.username || message.sender_name || 'User';
  const time = new Date(message.created_at || message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  // Create message element with performance optimizations
  const messageEl = document.createElement('div');
  messageEl.className = `amazing-message ${isOwn ? 'own' : 'other'}`;
  messageEl.id = `msg-${message.id}`;
  
  // Use requestAnimationFrame for smooth animations
  requestAnimationFrame(() => {
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
  });

  // Build message HTML efficiently
  const avatarHtml = message.users?.profile_pic 
    ? `<img src="${message.users.profile_pic}" alt="${sender}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
    : '';
  
  const avatarFallback = avatarHtml ? '<span style="display:none;">👤</span>' : '👤';

  const mediaHtml = message.media_url 
    ? message.media_type?.startsWith('image/') 
      ? `<img src="${message.media_url}" class="message-media" onclick="viewMedia('${message.media_url}')" loading="lazy" onerror="this.style.display='none';">`
      : message.media_type?.startsWith('video/')
        ? `<video src="${message.media_url}" class="message-media" controls preload="metadata"></video>`
        : ''
    : '';

  const contentHtml = message.content 
    ? `<div class="message-text">${escapeHtml(message.content)}</div>` 
    : '';

  const reactionsHtml = message.reactions 
    ? `<span class="react-count">${message.reactions}</span>` 
    : '<span class="react-count">0</span>';

  messageEl.innerHTML = `
    <div class="message-avatar">
      ${avatarHtml}
      ${avatarFallback}
    </div>
    <div class="message-content-wrapper">
      <div class="message-header">
        <span class="message-sender">${isOwn ? 'You' : sender}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-bubble">
        ${contentHtml}
        ${mediaHtml}
      </div>
      <div class="message-actions">
        <button class="action-btn react-btn" onclick="reactToMessage('${message.id}')" title="React">
          ❤️ ${reactionsHtml}
        </button>
        <button class="action-btn reply-btn" onclick="replyToMessage('${message.id}')" title="Reply">↩️</button>
        ${isOwn ? `<button class="action-btn delete-btn" onclick="deleteAmazingMessage('${message.id}')" title="Delete">🗑️</button>` : ''}
      </div>
    </div>
  `;
  
  // Find correct position based on timestamp for proper ordering
  const existingMessages = container.querySelectorAll('.amazing-message');
  let insertBefore = null;
  
  for (const existingMsg of existingMessages) {
    const existingId = existingMsg.id.replace('msg-', '');
    const existingTimestamp = parseInt(existingId) || 0;
    const currentTimestamp = parseInt(message.id) || message.timestamp;
    
    if (currentTimestamp < existingTimestamp) {
      insertBefore = existingMsg;
      break;
    }
  }
  
  // Insert message in correct position
  if (insertBefore) {
    container.insertBefore(messageEl, insertBefore);
  } else {
    container.appendChild(messageEl);
  }

  // Smooth animation with performance optimization
  requestAnimationFrame(() => {
    messageEl.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    messageEl.style.opacity = '1';
    messageEl.style.transform = 'translateY(0)';
  });

  // Update unseen count if message is new and user is not at bottom
  if (!isOwn && !isAtBottom()) {
    unseenMessageCount++;
    updateUnseenIndicator();
  }
  
  // Cleanup old messages if too many (performance optimization)
  cleanupOldMessages();
}

// Performance optimization: Remove very old messages to prevent memory issues
function cleanupOldMessages() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;
  
  const messages = container.querySelectorAll('.amazing-message');
  const maxMessages = 500; // Keep last 500 messages
  
  if (messages.length > maxMessages) {
    const toRemove = Array.from(messages).slice(0, messages.length - maxMessages);
    toRemove.forEach(msg => msg.remove());
  }
}

// Enhanced scroll with performance optimization
function scrollToBottomSmooth() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;
  
  // Use requestAnimationFrame for smooth scrolling
  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  });
}

// Enhanced bottom detection with tolerance
function isAtBottom() {
  const container = document.getElementById('messagesContainer');
  if (!container) return true;
  
  const threshold = 100; // pixels from bottom
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
}

// Enhanced unseen indicator with better UX
function updateUnseenIndicator() {
  const indicator = document.getElementById('unseenIndicator');
  const count = document.getElementById('unseenCount');
  
  if (indicator && count) {
    if (unseenMessageCount > 0) {
      count.textContent = unseenMessageCount > 99 ? '99+' : unseenMessageCount;
      indicator.style.display = 'flex';
      
      // Add pulse animation for new messages
      if (!indicator.classList.contains('pulse')) {
        indicator.classList.add('pulse');
        setTimeout(() => indicator.classList.remove('pulse'), 1000);
      }
    } else {
      indicator.style.display = 'none';
    }
  }
}

// Enhanced error handling for socket connections
function initializeSocketConnection() {
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return;
  }

  try {
    socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000
    });

    // Enhanced socket event handlers with error handling
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      if (currentUser?.college) {
        socket.emit('join_college', currentUser.college);
        socket.emit('user_online', currentUser.id);
      }
      updateConnectionStatus(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      updateConnectionStatus(false);
    });

    socket.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
      updateConnectionStatus(true);
      if (currentUser?.college) {
        socket.emit('join_college', currentUser.college);
        loadAmazingMessages();
      }
    });

    socket.on('new_message', (message) => {
      if (message && message.id) {
        addMessageToQueue(message);
      }
    });

    socket.on('message_deleted', ({ id }) => {
      if (id) {
        const messageEl = document.getElementById(`msg-${id}`);
        if (messageEl) {
          messageEl.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => messageEl.remove(), 300);
        }
      }
    });

    socket.on('online_count', (count) => {
      updateOnlineCount(count);
    });

    socket.on('user_typing', ({ username }) => {
      if (username && username !== currentUser?.username) {
        showTypingIndicator(username);
      }
    });

    socket.on('user_stop_typing', ({ username }) => {
      if (username && username !== currentUser?.username) {
        hideTypingIndicator(username);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      updateConnectionStatus(false);
    });

  } catch (error) {
    console.error('Failed to initialize socket:', error);
    updateConnectionStatus(false);
  }
}

// Enhanced connection status update
function updateConnectionStatus(isConnected) {
  const statusEl = document.getElementById('connectionStatus');
  if (!statusEl) return;

  const statusText = isConnected ? '🟢 Connected' : '🔴 Disconnected';
  const statusClass = isConnected ? 'connected' : 'disconnected';
  
  statusEl.innerHTML = `<span class="${statusClass}">${statusText}</span>`;
  statusEl.className = `connection-status ${statusClass}`;
}

// Enhanced online count update
function updateOnlineCount(count) {
  const countEl = document.getElementById('onlineCount');
  if (countEl) {
    countEl.textContent = count || 0;
  }
}

// Enhanced typing indicators with better UX
function showTypingIndicator(username) {
  clearTimeout(typingIndicatorTimeout);
  
  const indicator = document.getElementById('typingIndicators');
  if (!indicator) return;
  
  if (!typingUsers.has(username)) {
    typingUsers.add(username);
  }
  
  updateTypingDisplay();
  
  // Auto-hide after 3 seconds of inactivity
  typingIndicatorTimeout = setTimeout(() => {
    typingUsers.delete(username);
    updateTypingDisplay();
  }, 3000);
}

function hideTypingIndicator(username) {
  typingUsers.delete(username);
  updateTypingDisplay();
}

function updateTypingDisplay() {
  const indicator = document.getElementById('typingIndicators');
  if (!indicator) return;

  if (typingUsers.size === 0) {
    indicator.style.display = 'none';
    return;
  }

  const usernames = Array.from(typingUsers);
  let text = '';
  
  if (usernames.length === 1) {
    text = `${usernames[0]} is typing...`;
  } else if (usernames.length === 2) {
    text = `${usernames[0]} and ${usernames[1]} are typing...`;
  } else {
    text = `${usernames.length} people are typing...`;
  }

  indicator.innerHTML = `
    <div class="typing-avatar">👤</div>
    <div class="typing-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
      <span id="typingUsersText">${text}</span>
    </div>
  `;
  indicator.style.display = 'flex';
}

// Smooth scroll function
function scrollToBottomSmooth() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
}

// Check if user is at bottom of chat
function isAtBottom() {
  const container = document.getElementById('messagesContainer');
  if (!container) return true;
  
  const threshold = 100; // pixels from bottom
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
}

// Update unseen message indicator
function updateUnseenIndicator() {
  const indicator = document.getElementById('unseenIndicator');
  const count = document.getElementById('unseenCount');
  
  if (indicator && count && unseenMessageCount > 0) {
    count.textContent = unseenMessageCount;
    indicator.style.display = 'flex';
  } else if (indicator) {
    indicator.style.display = 'none';
  }
}

// Initialize amazing chat when communities page loads
function initializeAmazingChat() {
  console.log('🚀 Initializing Amazing Community Chat...');

  // Set community name
  if (currentUser?.college) {
    document.getElementById('communityName').textContent = `${currentUser.college} Community`;
  }

  // Initialize socket connection with enhanced handlers
  initializeSocketConnection();

  // Load messages
  loadAmazingMessages();

  // Set up input handlers
  setupAmazingInput();

  // Populate emoji and sticker panels
  populateEmojiPanel();
  populateStickerPanel();

  console.log('✅ Amazing Chat Initialized');
}

// ==========================================
// LOAD MESSAGES WITH UNSEEN TRACKING
// ==========================================

async function loadAmazingMessages() {
  try {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    // Show loading
    container.innerHTML = `
      <div class="loading-messages">
        <div class="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    `;

    const data = await apiCall('/api/community/messages', 'GET');

    if (!data.success) {
      if (data.needsJoinCommunity) {
        container.innerHTML = `
          <div class="join-community-prompt">
            <div class="join-icon">🎓</div>
            <h3>Join Your College Community</h3>
            <p>Connect with fellow students and start chatting!</p>
            <button onclick="showJoinCommunityModal()" class="join-btn">Join Community</button>
          </div>
        `;
        return;
      }
      throw new Error(data.error || 'Failed to load messages');
    }

    // Clear loading
    container.innerHTML = '';

    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = `
        <div class="no-messages">
          <div class="no-messages-icon">💬</div>
          <h3>No Messages Yet</h3>
          <p>Be the first to start the conversation!</p>
        </div>
      `;
      return;
    }

    // Display messages
    data.messages.forEach(msg => {
      addAmazingMessage(msg, true); // Skip scroll for initial load
    });

    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom();
      markMessagesAsSeen();
    }, 100);

  } catch (error) {
    console.error('❌ Load messages error:', error);
    const container = document.getElementById('messagesContainer');
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Failed to Load Messages</h3>
          <p>${error.message}</p>
          <button onclick="loadAmazingMessages()" class="retry-btn">Retry</button>
        </div>
      `;
    }
  }
}

// ==========================================
// ADD MESSAGE TO UI WITH REACTIONS
// ==========================================

function addAmazingMessage(message, skipScroll = false) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  // Check if message already exists
  const existingMsg = document.getElementById(`msg-${message.id}`);
  if (existingMsg) return;

  // Remove empty state
  const emptyState = container.querySelector('.no-messages');
  if (emptyState) emptyState.remove();

  const isOwn = message.sender_id === currentUser?.id;
  const sender = message.users?.username || 'User';
  const time = new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const messageEl = document.createElement('div');
  messageEl.className = `amazing-message ${isOwn ? 'own' : 'other'}`;
  messageEl.id = `msg-${message.id}`;

  let html = `
    <div class="message-avatar">
      ${message.users?.profile_pic ?
        `<img src="${message.users.profile_pic}" alt="${sender}">` :
        '👤'
      }
    </div>
    <div class="message-content-wrapper">
      <div class="message-header">
        <span class="message-sender">${isOwn ? 'You' : sender}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-bubble">
  `;

  if (message.content) {
    html += `<div class="message-text">${escapeHtml(message.content)}</div>`;
  }

  if (message.media_url) {
    if (message.media_type?.startsWith('image/')) {
      html += `<img src="${message.media_url}" class="message-media" onclick="viewMedia('${message.media_url}')">`;
    } else if (message.media_type?.startsWith('video/')) {
      html += `<video src="${message.media_url}" controls class="message-media"></video>`;
    }
  }

  html += `
      </div>
      <div class="message-actions">
        <button class="action-btn react-btn" onclick="reactToMessage('${message.id}')" title="React">
          ❤️ <span class="react-count">${message.reactions || 0}</span>
        </button>
        <button class="action-btn reply-btn" onclick="replyToMessage('${message.id}')" title="Reply">↩️</button>
        ${isOwn ? `<button class="action-btn delete-btn" onclick="deleteAmazingMessage('${message.id}')" title="Delete">🗑️</button>` : ''}
      </div>
    </div>
  `;

  messageEl.innerHTML = html;
  container.appendChild(messageEl);

  // Animate entrance
  setTimeout(() => messageEl.classList.add('visible'), 10);

  // Scroll to bottom if not user scrolling
  if (!skipScroll && !isUserScrolling) {
    setTimeout(() => scrollToBottom(), 50);
  }

  // Update unseen count if message is new and user is not at bottom
  if (!isOwn && !isAtBottom()) {
    unseenMessageCount++;
    updateUnseenIndicator();
  }
}

// ==========================================
// MESSAGE ACTIONS
// ==========================================

async function reactToMessage(messageId) {
  try {
    const data = await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji: '❤️' });

    if (data.success) {
      // Update reaction count in UI
      const reactBtn = document.querySelector(`#msg-${messageId} .react-btn .react-count`);
      if (reactBtn) {
        const currentCount = parseInt(reactBtn.textContent) || 0;
        reactBtn.textContent = currentCount + 1;
      }
      showMessage('❤️ Reacted!', 'success');
    }
  } catch (error) {
    console.error('Reaction error:', error);
    showMessage('❌ Failed to react', 'error');
  }
}

function replyToMessage(messageId) {
  const input = document.getElementById('messageInput');
  if (input) {
    input.value = `@reply to message: `;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

async function deleteAmazingMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const data = await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

    if (data.success) {
      const messageEl = document.getElementById(`msg-${messageId}`);
      if (messageEl) {
        messageEl.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => messageEl.remove(), 300);
      }
      showMessage('🗑️ Message deleted', 'success');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
  }
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const content = input?.value?.trim();

  if (!content && !selectedMediaFile) {
    showMessage('⚠️ Type a message or add media', 'error');
    return;
  }

  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }

  try {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (selectedMediaFile) {
      formData.append('media', selectedMediaFile);
    }

    // Clear input immediately
    if (input) input.value = '';
    clearMediaPreview();

    const data = await apiCall('/api/community/messages', 'POST', formData);

    if (data.success && data.message) {
      // Add to UI immediately
      addAmazingMessage(data.message);

      // Mark as seen since we just sent it
      markMessagesAsSeen();

      // Stop typing indicator
      stopTyping();
    }

  } catch (error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');
  }
}

// ==========================================
// MEDIA SHARING
// ==========================================

function openGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = false;

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showMessage('⚠️ File too large (max 10MB)', 'error');
        return;
      }
      handleMediaSelection(file);
    }
  };

  input.click();
}

function handleMediaSelection(file) {
  selectedMediaFile = file;
  selectedMediaType = file.type.startsWith('video/') ? 'video' : 'image';

  const reader = new FileReader();
  reader.onload = (e) => {
    const previewPanel = document.getElementById('mediaPreviewPanel');
    const previewContent = document.getElementById('previewContent');

    if (previewPanel && previewContent) {
      if (selectedMediaType === 'image') {
        previewContent.innerHTML = `<img src="${e.target.result}" class="preview-media">`;
      } else {
        previewContent.innerHTML = `<video src="${e.target.result}" controls class="preview-media"></video>`;
      }
      previewPanel.style.display = 'flex';
    }
  };

  reader.readAsDataURL(file);
}

function clearMediaPreview() {
  selectedMediaFile = null;
  selectedMediaType = null;

  const previewPanel = document.getElementById('mediaPreviewPanel');
  if (previewPanel) previewPanel.style.display = 'none';
}

// ==========================================
// EMOJI PANEL
// ==========================================

function openEmojiPanel() {
  const panel = document.getElementById('emojiPanel');
  if (panel) {
    panel.style.display = 'block';
    closeStickerPanel(); // Close sticker panel if open
  }
}

function closeEmojiPanel() {
  const panel = document.getElementById('emojiPanel');
  if (panel) panel.style.display = 'none';
}

function populateEmojiPanel() {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;

  const emojis = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋',
    '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','😐','😑','😶','😏','😒','🙄','😬','🤐','🤨',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟',
    '🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','⚽','🏀','🎮','🎯','🎪','🎨','🎭','🎬','🎤','🎧','🎵','🎶'
  ];

  let html = '';
  emojis.forEach(emoji => {
    html += `<button class="emoji-btn" onclick="insertEmoji('${emoji}')">${emoji}</button>`;
  });

  grid.innerHTML = html;
}

function insertEmoji(emoji) {
  const input = document.getElementById('messageInput');
  if (input) {
    input.value += emoji;
    input.focus();
  }
  closeEmojiPanel();
}

// ==========================================
// STICKER PANEL
// ==========================================

function openStickerPanel() {
  const panel = document.getElementById('stickerPanel');
  if (panel) {
    panel.style.display = 'block';
    closeEmojiPanel(); // Close emoji panel if open
  }
}

function closeStickerPanel() {
  const panel = document.getElementById('stickerPanel');
  if (panel) panel.style.display = 'none';
}

function populateStickerPanel() {
  const grid = document.getElementById('stickerGrid');
  if (!grid) return;

  const stickers = [
    '🔥', '💯', '✨', '⚡', '💪', '🎯', '🚀', '💝', '🎨', '📚', '🌟', '🎪', '🎭', '🎨', '🎪',
    '😎', '🤓', '🤠', '👻', '🎃', '🦄', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'
  ];

  let html = '';
  stickers.forEach(sticker => {
    html += `<button class="sticker-btn" onclick="insertSticker('${sticker}')">${sticker}</button>`;
  });

  grid.innerHTML = html;
}

function insertSticker(sticker) {
  const input = document.getElementById('messageInput');
  if (input) {
    input.value += sticker;
    input.focus();
  }
  closeStickerPanel();
}

// ==========================================
// TYPING INDICATORS
// ==========================================

function handleTyping() {
  const input = document.getElementById('messageInput');
  if (!input || !socket || !currentUser) return;

  const content = input.value.trim();

  if (content.length > 0) {
    socket.emit('typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  } else {
    stopTyping();
  }
}

function stopTyping() {
  if (socket && currentUser) {
    socket.emit('stop_typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  }
}

function showTypingIndicator(username) {
  const indicator = document.getElementById('typingIndicators');
  const textEl = document.getElementById('typingUsersText');

  if (indicator && textEl) {
    textEl.textContent = `${username} is typing...`;
    indicator.style.display = 'flex';
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicators');
  if (indicator) indicator.style.display = 'none';
}

// ==========================================
// ONLINE MEMBERS
// ==========================================

function updateOnlineMembers(members) {
  const countEl = document.getElementById('onlineCount');
  const avatarsEl = document.getElementById('onlineAvatars');

  if (countEl) countEl.textContent = members.length;

  if (avatarsEl) {
    let html = '';
    members.slice(0, 5).forEach(member => {
      html += `<div class="online-avatar" title="${member.username}">👤</div>`;
    });
    if (members.length > 5) {
      html += `<div class="online-more">+${members.length - 5}</div>`;
    }
    avatarsEl.innerHTML = html;
  }
}

// ==========================================
// UNSEEN MESSAGES
// ==========================================

function isAtBottom() {
  const container = document.getElementById('messagesContainer');
  if (!container) return true;

  const threshold = 100; // pixels from bottom
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function updateUnseenIndicator() {
  const indicator = document.getElementById('unseenIndicator');
  const countEl = document.getElementById('unseenCount');

  if (indicator && countEl) {
    if (unseenMessageCount > 0) {
      countEl.textContent = unseenMessageCount;
      indicator.style.display = 'flex';
    } else {
      indicator.style.display = 'none';
    }
  }
}

function markMessagesAsSeen() {
  unseenMessageCount = 0;
  updateUnseenIndicator();
}

function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    markMessagesAsSeen();
  }
}

// ==========================================
// INPUT HANDLERS
// ==========================================

function setupAmazingInput() {
  const input = document.getElementById('messageInput');
  if (!input) return;

  input.addEventListener('input', function() {
    // Auto-resize
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';

    // Update send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.disabled = !this.value.trim() && !selectedMediaFile;
    }

    // Handle typing
    handleTyping();
  });

  // Handle scroll for unseen messages
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.addEventListener('scroll', function() {
      isUserScrolling = true;
      if (isAtBottom()) {
        markMessagesAsSeen();
      }
    });
  }
}

function handleMessageKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ==========================================
// SEARCH MESSAGES
// ==========================================

function searchMessages() {
  const query = prompt('Search messages:');
  if (query) {
    showMessage(`🔍 Searching for "${query}"`, 'success');
    // Implement search functionality
  }
}

// ==========================================
// COMMUNITY INFO
// ==========================================

function showCommunityInfo() {
  showMessage('ℹ️ Community info coming soon!', 'success');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showJoinCommunityPrompt() {
  if (messageContainer) {
    messageContainer.innerHTML = `
      <div class="join-community-prompt">
        <div class="join-icon">🎓</div>
        <h3>Join Your College Community</h3>
        <p>Connect with fellow students from your college</p>
        <button onclick="showJoinCommunityModal()" class="join-btn">Join Community</button>
      </div>
    `;
  }
}

function showErrorState(message) {
  if (messageContainer) {
    messageContainer.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="loadRealMessages()" class="retry-btn">Retry</button>
      </div>
    `;
  }
}

function updateConnectionStatus(isConnected) {
  const statusEl = document.getElementById('connectionStatus');
  if (statusEl) {
    statusEl.innerHTML = isConnected ? 
      '<span style="color:#10b981;">● Connected</span>' : 
      '<span style="color:#ef4444;">● Disconnected</span>';
  }
}

function updateOnlineCount(count) {
  const elements = document.querySelectorAll('.online-count');
  elements.forEach(el => {
    el.textContent = count || 0;
  });
}

function scrollToBottom() {
  if (messageContainer) {
    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: 'smooth'
    });
  }
}

// ==========================================
// AMAZING COMMUNITY CHAT SYSTEM
// ==========================================

// Initialize amazing chat when communities page loads
function initializeAmazingChat() {
  console.log('🚀 Initializing Amazing Community Chat...');

  // Set community name
  if (currentUser?.college) {
    document.getElementById('communityName').textContent = `${currentUser.college} Community`;
  }

  // Initialize socket connection
  initializeSocketConnection();

  // Load messages
  loadAmazingMessages();

  // Set up input handlers
  setupAmazingInput();

  // Populate emoji and sticker panels
  populateEmojiPanel();
  populateStickerPanel();

  console.log('✅ Amazing Chat Initialized');
}

// ==========================================
// LOAD MESSAGES WITH UNSEEN TRACKING
// ==========================================

async function loadAmazingMessages() {
  try {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    // Show loading
    container.innerHTML = `
      <div class="loading-messages">
        <div class="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    `;

    const data = await apiCall('/api/community/messages', 'GET');

    if (!data.success) {
      if (data.needsJoinCommunity) {
        container.innerHTML = `
          <div class="join-community-prompt">
            <div class="join-icon">🎓</div>
            <h3>Join Your College Community</h3>
            <p>Connect with fellow students and start chatting!</p>
            <button onclick="showJoinCommunityModal()" class="join-btn">Join Community</button>
          </div>
        `;
        return;
      }
      throw new Error(data.error || 'Failed to load messages');
    }

    // Clear loading
    container.innerHTML = '';

    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = `
        <div class="no-messages">
          <div class="no-messages-icon">💬</div>
          <h3>No Messages Yet</h3>
          <p>Be the first to start the conversation!</p>
        </div>
      `;
      return;
    }

    // Display messages
    data.messages.forEach(msg => {
      addAmazingMessage(msg, true); // Skip scroll for initial load
    });

    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom();
      markMessagesAsSeen();
    }, 100);

  } catch (error) {
    console.error('❌ Load messages error:', error);
    const container = document.getElementById('messagesContainer');
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Failed to Load Messages</h3>
          <p>${error.message}</p>
          <button onclick="loadAmazingMessages()" class="retry-btn">Retry</button>
        </div>
      `;
    }
  }
}

// ==========================================
// ADD MESSAGE TO UI WITH REACTIONS
// ==========================================

function addAmazingMessage(message, skipScroll = false) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  // Check if message already exists
  const existingMsg = document.getElementById(`msg-${message.id}`);
  if (existingMsg) return;

  // Remove empty state
  const emptyState = container.querySelector('.no-messages');
  if (emptyState) emptyState.remove();

  const isOwn = message.sender_id === currentUser?.id;
  const sender = message.users?.username || 'User';
  const time = new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const messageEl = document.createElement('div');
  messageEl.className = `amazing-message ${isOwn ? 'own' : 'other'}`;
  messageEl.id = `msg-${message.id}`;

  let html = `
    <div class="message-avatar">
      ${message.users?.profile_pic ?
        `<img src="${message.users.profile_pic}" alt="${sender}">` :
        '👤'
      }
    </div>
    <div class="message-content-wrapper">
      <div class="message-header">
        <span class="message-sender">${isOwn ? 'You' : sender}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-bubble">
  `;

  if (message.content) {
    html += `<div class="message-text">${escapeHtml(message.content)}</div>`;
  }

  if (message.media_url) {
    if (message.media_type?.startsWith('image/')) {
      html += `<img src="${message.media_url}" class="message-media" onclick="viewMedia('${message.media_url}')">`;
    } else if (message.media_type?.startsWith('video/')) {
      html += `<video src="${message.media_url}" controls class="message-media"></video>`;
    }
  }

  html += `
      </div>
      <div class="message-actions">
        <button class="action-btn react-btn" onclick="reactToMessage('${message.id}')" title="React">
          ❤️ <span class="react-count">${message.reactions || 0}</span>
        </button>
        <button class="action-btn reply-btn" onclick="replyToMessage('${message.id}')" title="Reply">↩️</button>
        ${isOwn ? `<button class="action-btn delete-btn" onclick="deleteAmazingMessage('${message.id}')" title="Delete">🗑️</button>` : ''}
      </div>
    </div>
  `;

  messageEl.innerHTML = html;
  container.appendChild(messageEl);

  // Animate entrance
  setTimeout(() => messageEl.classList.add('visible'), 10);

  // Scroll to bottom if not user scrolling
  if (!skipScroll && !isUserScrolling) {
    setTimeout(() => scrollToBottom(), 50);
  }

  // Update unseen count if message is new and user is not at bottom
  if (!isOwn && !isAtBottom()) {
    unseenMessageCount++;
    updateUnseenIndicator();
  }
}

// ==========================================
// MESSAGE ACTIONS
// ==========================================

async function reactToMessage(messageId) {
  try {
    const data = await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji: '❤️' });

    if (data.success) {
      // Update reaction count in UI
      const reactBtn = document.querySelector(`#msg-${messageId} .react-btn .react-count`);
      if (reactBtn) {
        const currentCount = parseInt(reactBtn.textContent) || 0;
        reactBtn.textContent = currentCount + 1;
      }
      showMessage('❤️ Reacted!', 'success');
    }
  } catch (error) {
    console.error('Reaction error:', error);
    showMessage('❌ Failed to react', 'error');
  }
}

function replyToMessage(messageId) {
  const input = document.getElementById('messageInput');
  if (input) {
    input.value = `@reply to message: `;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

async function deleteAmazingMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const data = await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

    if (data.success) {
      const messageEl = document.getElementById(`msg-${messageId}`);
      if (messageEl) {
        messageEl.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => messageEl.remove(), 300);
      }
      showMessage('🗑️ Message deleted', 'success');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
  }
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const content = input?.value?.trim();

  if (!content && !selectedMediaFile) {
    showMessage('⚠️ Type a message or add media', 'error');
    return;
  }

  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }

  try {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (selectedMediaFile) {
      formData.append('media', selectedMediaFile);
    }

    // Clear input immediately
    if (input) input.value = '';
    clearMediaPreview();

    const data = await apiCall('/api/community/messages', 'POST', formData);

    if (data.success && data.message) {
      // Add to UI immediately
      addAmazingMessage(data.message);

      // Mark as seen since we just sent it
      markMessagesAsSeen();

      // Stop typing indicator
      stopTyping();
    }

  } catch (error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');
  }
}

// ==========================================
// MEDIA SHARING
// ==========================================

function openGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = false;

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showMessage('⚠️ File too large (max 10MB)', 'error');
        return;
      }
      handleMediaSelection(file);
    }
  };

  input.click();
}

function handleMediaSelection(file) {
  selectedMediaFile = file;
  selectedMediaType = file.type.startsWith('video/') ? 'video' : 'image';

  const reader = new FileReader();
  reader.onload = (e) => {
    const previewPanel = document.getElementById('mediaPreviewPanel');
    const previewContent = document.getElementById('previewContent');

    if (previewPanel && previewContent) {
      if (selectedMediaType === 'image') {
        previewContent.innerHTML = `<img src="${e.target.result}" class="preview-media">`;
      } else {
        previewContent.innerHTML = `<video src="${e.target.result}" controls class="preview-media"></video>`;
      }
      previewPanel.style.display = 'flex';
    }
  };

  reader.readAsDataURL(file);
}

function clearMediaPreview() {
  selectedMediaFile = null;
  selectedMediaType = null;

  const previewPanel = document.getElementById('mediaPreviewPanel');
  if (previewPanel) previewPanel.style.display = 'none';
}

// ==========================================
// EMOJI PANEL
// ==========================================

function openEmojiPanel() {
  const panel = document.getElementById('emojiPanel');
  if (panel) {
    panel.style.display = 'block';
    closeStickerPanel(); // Close sticker panel if open
  }
}

function closeEmojiPanel() {
  const panel = document.getElementById('emojiPanel');
  if (panel) panel.style.display = 'none';
}

function populateEmojiPanel() {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;

  const emojis = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋',
    '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','😐','😑','😶','😏','😒','🙄','😬','🤐','🤨',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟',
    '🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','⚽','🏀','🎮','🎯','🎪','🎨','🎭','🎬','🎤','🎧','🎵','🎶'
  ];

  let html = '';
  emojis.forEach(emoji => {
    html += `<button class="emoji-btn" onclick="insertEmoji('${emoji}')">${emoji}</button>`;
  });

  grid.innerHTML = html;
}

function insertEmoji(emoji) {
  const input = document.getElementById('messageInput');
  if (input) {
    input.value += emoji;
    input.focus();
  }
  closeEmojiPanel();
}

// ==========================================
// STICKER PANEL
// ==========================================

function openStickerPanel() {
  const panel = document.getElementById('stickerPanel');
  if (panel) {
    panel.style.display = 'block';
    closeEmojiPanel(); // Close emoji panel if open
  }
}

function closeStickerPanel() {
  const panel = document.getElementById('stickerPanel');
  if (panel) panel.style.display = 'none';
}

function populateStickerPanel() {
  const grid = document.getElementById('stickerGrid');
  if (!grid) return;

  const stickers = [
    '🔥', '💯', '✨', '⚡', '💪', '🎯', '🚀', '💝', '🎨', '📚', '🌟', '🎪', '🎭', '🎨', '🎪',
    '😎', '🤓', '🤠', '👻', '🎃', '🦄', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'
  ];

  let html = '';
  stickers.forEach(sticker => {
    html += `<button class="sticker-btn" onclick="insertSticker('${sticker}')">${sticker}</button>`;
  });

  grid.innerHTML = html;
}

function insertSticker(sticker) {
  const input = document.getElementById('messageInput');
  if (input) {
    input.value += sticker;
    input.focus();
  }
  closeStickerPanel();
}

// ==========================================
// TYPING INDICATORS
// ==========================================

function handleTyping() {
  const input = document.getElementById('messageInput');
  if (!input || !socket || !currentUser) return;

  const content = input.value.trim();

  if (content.length > 0) {
    socket.emit('typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  } else {
    stopTyping();
  }
}

function stopTyping() {
  if (socket && currentUser) {
    socket.emit('stop_typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  }
}

function showTypingIndicator(username) {
  const indicator = document.getElementById('typingIndicators');
  const textEl = document.getElementById('typingUsersText');

  if (indicator && textEl) {
    textEl.textContent = `${username} is typing...`;
    indicator.style.display = 'flex';
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicators');
  if (indicator) indicator.style.display = 'none';
}

// ==========================================
// ONLINE MEMBERS
// ==========================================

function updateOnlineMembers(members) {
  const countEl = document.getElementById('onlineCount');
  const avatarsEl = document.getElementById('onlineAvatars');

  if (countEl) countEl.textContent = members.length;

  if (avatarsEl) {
    let html = '';
    members.slice(0, 5).forEach(member => {
      html += `<div class="online-avatar" title="${member.username}">👤</div>`;
    });
    if (members.length > 5) {
      html += `<div class="online-more">+${members.length - 5}</div>`;
    }
    avatarsEl.innerHTML = html;
  }
}

// ==========================================
// UNSEEN MESSAGES
// ==========================================

function isAtBottom() {
  const container = document.getElementById('messagesContainer');
  if (!container) return true;

  const threshold = 100; // pixels from bottom
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function updateUnseenIndicator() {
  const indicator = document.getElementById('unseenIndicator');
  const countEl = document.getElementById('unseenCount');

  if (indicator && countEl) {
    if (unseenMessageCount > 0) {
      countEl.textContent = unseenMessageCount;
      indicator.style.display = 'flex';
    } else {
      indicator.style.display = 'none';
    }
  }
}

function markMessagesAsSeen() {
  unseenMessageCount = 0;
  updateUnseenIndicator();
}

function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    markMessagesAsSeen();
  }
}

// ==========================================
// INPUT HANDLERS
// ==========================================

function setupAmazingInput() {
  const input = document.getElementById('messageInput');
  if (!input) return;

  input.addEventListener('input', function() {
    // Auto-resize
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';

    // Update send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.disabled = !this.value.trim() && !selectedMediaFile;
    }

    // Handle typing
    handleTyping();
  });

  // Handle scroll for unseen messages
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.addEventListener('scroll', function() {
      isUserScrolling = true;
      if (isAtBottom()) {
        markMessagesAsSeen();
      }
    });
  }
}

function handleMessageKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ==========================================
// SEARCH MESSAGES
// ==========================================

function searchMessages() {
  const query = prompt('Search messages:');
  if (query) {
    showMessage(`🔍 Searching for "${query}"`, 'success');
    // Implement search functionality
  }
}

// ==========================================
// COMMUNITY INFO
// ==========================================

function showCommunityInfo() {
  showMessage('ℹ️ Community info coming soon!', 'success');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function viewMedia(url) {
  // Open media in lightbox or new window
  window.open(url, '_blank');
}

// ==========================================
// INITIALIZE AMAZING CHAT ON PAGE LOAD
// ==========================================

// ==========================================
// REAL COLLEGE COMMUNITY SYSTEM
// ==========================================

// Store user's college data
let userCollegeData = null;

// Function to check if user has already joined a community
async function checkUserCommunityStatus() {
  try {
    // Get current logged-in user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { hasCommunity: false, needsLogin: true };
    }

    // Check localStorage first for immediate response
    const storedCommunity = localStorage.getItem('userCollegeData');
    if (storedCommunity) {
      userCollegeData = JSON.parse(storedCommunity);
      return { 
        hasCommunity: true, 
        community: userCollegeData,
        fromStorage: true 
      };
    }

    // If not in storage, check backend
    const response = await fetch('/api/user/community-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token || localStorage.getItem('authToken')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.hasCommunity) {
        userCollegeData = data.community;
        localStorage.setItem('userCollegeData', JSON.stringify(userCollegeData));
        return { 
          hasCommunity: true, 
          community: userCollegeData,
          fromBackend: true 
        };
      }
    }

    return { hasCommunity: false, needsLogin: false };

  } catch (error) {
    console.error('Error checking community status:', error);
    // If backend fails, don't show login - just check if user exists
    const currentUser = getCurrentUser();
    if (currentUser) {
      return { hasCommunity: false, needsLogin: false };
    }
    return { hasCommunity: false, needsLogin: true, error: error.message };
  }
}

// Debug function to show all storage items
function debugStorage() {
  console.log('=== DEBUG: ALL STORAGE ITEMS ===');
  
  console.log('localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value?.substring(0, 100)}${value?.length > 100 ? '...' : ''}`);
  }
  
  console.log('sessionStorage items:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    console.log(`  ${key}: ${value?.substring(0, 100)}${value?.length > 100 ? '...' : ''}`);
  }
  
  console.log('=== END STORAGE DEBUG ===');
}

// Function to get current user
function getCurrentUser() {
  console.log('=== DEBUG: Getting Current User ===');
  
  // Debug: Show all storage items
  debugStorage();
  
  // Try multiple sources for user data
  const userData = localStorage.getItem('userData') || 
                   sessionStorage.getItem('userData') ||
                   localStorage.getItem('user') ||
                   sessionStorage.getItem('user');
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('Found user data in storage:', user);
      
      // Try to get token from multiple sources
      const token = localStorage.getItem('authToken') || 
                    sessionStorage.getItem('authToken') ||
                    localStorage.getItem('token') ||
                    sessionStorage.getItem('token') ||
                    localStorage.getItem('jwt') ||
                    sessionStorage.getItem('jwt') ||
                    user.token ||
                    user.accessToken;
      
      console.log('Found token:', token ? 'Yes' : 'No');
      console.log('Token length:', token ? token.length : 0);
      
      if (token) {
        user.token = token;
      }
      
      return user;
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  // Check if user is logged in via header (your existing system)
  const userName = document.getElementById('userName');
  const userGreeting = document.querySelector('.greeting-name');
  
  console.log('Header elements:', {
    userName: userName?.textContent,
    userGreeting: userGreeting?.textContent
  });
  
  if ((userName && userName.textContent && userName.textContent !== 'User') ||
      (userGreeting && userGreeting.textContent && userGreeting.textContent !== 'User')) {
    const name = userName?.textContent || userGreeting?.textContent;
    console.log('Found user name in header:', name);
    
    // Try to get token from storage
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('token') ||
                  localStorage.getItem('jwt') ||
                  sessionStorage.getItem('jwt');
    
    console.log('Found token:', token ? 'Yes' : 'No');
    
    return {
      name: name,
      username: name,
      id: 'current_user',
      token: token,
      // Try to get college info from storage
      college: localStorage.getItem('userCollege') || 
               localStorage.getItem('college') ||
               sessionStorage.getItem('userCollege') ||
               sessionStorage.getItem('college'),
      communityJoined: true // Assume joined if we can see user name
    };
  }
  
  console.log('No user found anywhere');
  return null;
}

// Function to join college community
async function joinCollegeCommunity(collegeType, collegeName) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('Please login to join a community');
    }

    const response = await fetch('/api/user/join-community', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token || localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        collegeType: collegeType,
        collegeName: collegeName,
        userId: currentUser.id || currentUser.userId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to join community');
    }

    const data = await response.json();
    
    // Store community data
    userCollegeData = {
      collegeType: collegeType,
      collegeName: collegeName,
      communityId: data.communityId,
      joinedAt: new Date().toISOString(),
      members: data.members || 0,
      onlineMembers: data.onlineMembers || 0
    };

    localStorage.setItem('userCollegeData', JSON.stringify(userCollegeData));

    return {
      success: true,
      community: userCollegeData,
      message: data.message || 'Successfully joined community!'
    };

  } catch (error) {
    console.error('Error joining community:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to get REAL-TIME community data from your backend
async function getRealTimeCommunityData(collegeType) {
  try {
    console.log('Getting REAL-TIME data for college:', collegeType);
    
    // Get current user with proper authentication
    const currentUser = getCurrentUser();
    
    // Try authenticated requests first
    if (currentUser && currentUser.token) {
      console.log('Trying authenticated real-time requests...');
      
      const [onlineResponse, statsResponse] = await Promise.all([
        fetch('/api/community/online-users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        }),
        fetch('/api/community/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        })
      ]);
      
      let onlineCount = 0;
      let totalMembers = 0;
      
      if (onlineResponse.ok) {
        const onlineData = await onlineResponse.json();
        if (onlineData.success) {
          onlineCount = onlineData.onlineCount || 0;
          console.log('REAL online users (auth):', onlineCount);
        }
      }
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          totalMembers = statsData.stats?.totalMessages || 100;
          console.log('REAL stats (auth):', statsData.stats);
        }
      }
      
      if (onlineCount > 0 || totalMembers > 0) {
        return {
          members: totalMembers,
          onlineMembers: onlineCount,
          communityName: userCollegeData?.collegeName || `${collegeType.toUpperCase()} Community`,
          avatar: `https://picsum.photos/seed/${collegeType}-community/48/48`
        };
      }
    }
    
    // Try unauthenticated requests (for testing)
    console.log('Trying unauthenticated real-time requests...');
    
    const [onlineResponse, statsResponse] = await Promise.all([
      fetch('/api/community/online-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      fetch('/api/community/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    ]);
    
    let onlineCount = 0;
    let totalMembers = 0;
    
    if (onlineResponse.ok) {
      const onlineData = await onlineResponse.json();
      if (onlineData.success) {
        onlineCount = onlineData.onlineCount || 0;
        console.log('REAL online users (unauth):', onlineCount);
      }
    }
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      if (statsData.success) {
        totalMembers = statsData.stats?.totalMessages || 100;
        console.log('REAL stats (unauth):', statsData.stats);
      }
    }
    
    if (onlineCount > 0 || totalMembers > 0) {
      return {
        members: totalMembers,
        onlineMembers: onlineCount,
        communityName: userCollegeData?.collegeName || `${collegeType.toUpperCase()} Community`,
        avatar: `https://picsum.photos/seed/${collegeType}-community/48/48`
      };
    }
    
    console.log('All backend calls failed, using fallback data');
    return getFallbackCommunityData(collegeType);
    
  } catch (error) {
    console.error('Error getting REAL-TIME data:', error);
    return getFallbackCommunityData(collegeType);
  }
}

// Fallback community data
function getFallbackCommunityData(collegeType) {
  const communities = {
    'nit': {
      members: 2847,
      onlineMembers: 342,
      communityName: 'NIT Community',
      avatar: 'https://picsum.photos/seed/nit-community/48/48'
    },
    'iit': {
      members: 2156,
      onlineMembers: 287,
      communityName: 'IIT Community', 
      avatar: 'https://picsum.photos/seed/iit-community/48/48'
    },
    'vit': {
      members: 1834,
      onlineMembers: 198,
      communityName: 'VIT Community',
      avatar: 'https://picsum.photos/seed/vit-community/48/48'
    },
    'other': {
      members: 3421,
      onlineMembers: 456,
      communityName: 'University Community',
      avatar: 'https://picsum.photos/seed/university-community/48/48'
    }
  };
  
  return communities[collegeType] || communities['other'];
}

// Function to load real community messages from your backend
async function loadRealCommunityMessages(collegeType, communityId) {
  try {
    console.log('=== DEBUG: Loading REAL messages for college:', collegeType);
    
    // Get current user with proper authentication
    const currentUser = getCurrentUser();
    console.log('Current user for message loading:', currentUser);
    
    // First, let's test if the backend endpoint exists and works
    console.log('Testing backend endpoint...');
    
    try {
      const testResponse = await fetch('/api/community/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backend test response status:', testResponse.status);
      console.log('Backend test response headers:', [...testResponse.headers.entries()]);
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('Backend test response data:', data);
        
        if (data.success && data.messages) {
          console.log('✅ Found real messages from backend:', data.messages.length);
          
          const formattedMessages = data.messages.map(msg => ({
            id: msg.id,
            sender: msg.users?.username || msg.senderName || 'Unknown User',
            message: msg.content || msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: msg.users?.profile_pic || msg.avatar || `https://picsum.photos/seed/${msg.users?.username || 'user'}/36/36`,
            isCurrentUser: msg.sender_id === userCollegeData?.userId,
            senderId: msg.sender_id
          }));
          
          console.log('✅ Formatted messages:', formattedMessages);
          return formattedMessages;
        } else {
          console.log('❌ Backend returned no messages:', data);
        }
      } else {
        const errorText = await testResponse.text();
        console.log('❌ Backend error response:', testResponse.status, errorText);
      }
    } catch (backendError) {
      console.log('❌ Backend call failed:', backendError);
    }
    
    console.log('❌ All backend attempts failed, using sample messages');
    return getSampleMessages(collegeType);
    
  } catch (error) {
    console.error('❌ Error loading REAL messages:', error);
    return getSampleMessages(collegeType);
  }
}

// Get sample messages for fallback
function getSampleMessages(collegeType) {
  const sampleMessages = {
    'nit': [
      { sender: 'Rahul Sharma', message: 'Hey NIT folks! Anyone preparing for GATE 2024?', time: '2:30 PM', avatar: 'https://picsum.photos/seed/rahul/36/36' },
      { sender: 'Priya Patel', message: 'Yes! Started preparation last month. Which branch?', time: '2:32 PM', avatar: 'https://picsum.photos/seed/priya/36/36' },
      { sender: 'Amit Kumar', message: 'CSE here. Looking for study partners!', time: '2:35 PM', avatar: 'https://picsum.photos/seed/amit/36/36' }
    ],
    'iit': [
      { sender: 'Vikram Singh', message: 'IITians! Who\'s up for hackathon this weekend?', time: '3:15 PM', avatar: 'https://picsum.photos/seed/vikram/36/36' },
      { sender: 'Ananya Reddy', message: 'Count me in! Which domain?', time: '3:18 PM', avatar: 'https://picsum.photos/seed/ananya/36/36' },
      { sender: 'Karan Mehta', message: 'AI/ML track. Let\'s form a team!', time: '3:20 PM', avatar: 'https://picsum.photos/seed/karan/36/36' }
    ],
    'vit': [
      { sender: 'Suresh Babu', message: 'VIT Bhopal peeps! Fest season incoming 🎉', time: '1:45 PM', avatar: 'https://picsum.photos/seed/suresh/36/36' },
      { sender: 'Neha Gupta', message: 'Excited for TechnoVibes! Anyone participating?', time: '1:48 PM', avatar: 'https://picsum.photos/seed/nehagupta/36/36' },
      { sender: 'Rohit Verma', message: 'Robotics competition here I come!', time: '1:50 PM', avatar: 'https://picsum.photos/seed/rohit/36/36' }
    ],
    'other': [
      { sender: 'Student Leader', message: 'Welcome to University Community! 🎓', time: '12:00 PM', avatar: 'https://picsum.photos/seed/student/36/36' },
      { sender: 'Campus Rep', message: 'Share your college experiences here!', time: '12:05 PM', avatar: 'https://picsum.photos/seed/campus/36/36' },
      { sender: 'Alumni Member', message: 'Great to see active participation!', time: '12:10 PM', avatar: 'https://picsum.photos/seed/alumni/36/36' }
    ]
  };
  
  return sampleMessages[collegeType] || sampleMessages['other'];
}

// Function to send REAL message to your backend
async function sendRealMessage(messageText) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.token) {
      throw new Error('Please login to send messages');
    }
    
    if (!userCollegeData) {
      throw new Error('Please join a community first');
    }
    
    console.log('Sending REAL message to backend:', messageText);
    console.log('User data:', { userId: currentUser.id, college: userCollegeData.collegeType });
    
    // Send REAL message to your backend API
    const response = await fetch('/api/community/messages-with-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({
        content: messageText
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error(errorData.message || 'Failed to send message');
    }
    
    const data = await response.json();
    console.log('REAL message sent successfully:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to send message');
    }
    
    // Return formatted message for immediate UI update
    return {
      success: true,
      message: {
        id: data.message?.id || Date.now(),
        sender: currentUser.username || currentUser.name || 'You',
        message: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser.profilePic || `https://picsum.photos/seed/${currentUser.username || 'user'}/36/36`,
        isCurrentUser: true,
        senderId: currentUser.id || currentUser.userId
      }
    };
    
  } catch (error) {
    console.error('Error sending REAL message:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// COMMUNITY CHAT INITIALIZATION
// ==========================================

// Initialize community chat system
async function initializeCommunityChat() {
  try {
    console.log('=== DEBUG: Community Chat Initialization ===');
    
    // Check if user is logged in by looking for actual user data
    const currentUser = getCurrentUser();
    console.log('Current user found:', currentUser);
    
    if (!currentUser) {
      console.log('No user found - showing login message');
      showLoginRequiredMessage();
      return;
    }
    
    // Check if user has community data
    if (currentUser.college && currentUser.communityJoined) {
      console.log('User has community - loading directly');
      const communityData = {
        type: currentUser.college.toLowerCase(),
        name: `${currentUser.college} Community`,
        college: currentUser.college,
        connected: true,
        userId: currentUser.id || currentUser.userId,
        username: currentUser.username || currentUser.name
      };
      
      await loadExistingCommunityChat(communityData);
      return;
    }
    
    // If user is logged in but no community, show join message
    console.log('User logged in but no community - showing join message');
    showJoinCommunityMessage();
    
  } catch (error) {
    console.error('Error initializing chat:', error);
    showErrorMessage('Failed to load chat. Please refresh.');
  }
}

// Check if user is already in a community (from your existing system)
async function checkExistingCommunity() {
  try {
    // Get current user info from your existing system
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.log('No current user found');
      return null;
    }
    
    console.log('Found current user:', currentUser);
    
    // Check if user has college info directly from their data
    if (currentUser.college && currentUser.communityJoined) {
      console.log('User has community in their data:', currentUser.college);
      return {
        type: currentUser.college.toLowerCase(),
        name: `${currentUser.college} Community`,
        college: currentUser.college,
        connected: true,
        userId: currentUser.id || currentUser.userId,
        username: currentUser.username || currentUser.name
      };
    }
    
    console.log('User not joined any community yet');
    return null;
    
  } catch (error) {
    console.error('Error checking existing community:', error);
    return null;
  }
}

// Load existing community chat directly
async function loadExistingCommunityChat(communityData) {
  console.log('Loading existing community chat:', communityData);
  
  // Use the exact college name from user data
  const communityName = communityData.name || communityData.college || 'University Community';
  const collegeType = communityData.type || communityData.college?.toLowerCase() || 'other';
  
  console.log('Community details:', { communityName, collegeType });
  
  // Set user college data for the chat system
  userCollegeData = {
    collegeType: collegeType,
    collegeName: communityName,
    communityId: communityData.id || `${collegeType}_community`,
    joinedAt: communityData.joinedAt || new Date().toISOString(),
    existingUser: true,
    userId: communityData.userId
  };
  
  // Get real-time community data
  const realTimeData = await getRealTimeCommunityData(collegeType);
  
  // Update community name in real-time data to use exact college name
  realTimeData.communityName = communityName;
  
  // Update community header with real data
  updateCommunityHeader(realTimeData);
  
  // Load community messages
  const messages = await loadRealCommunityMessages(collegeType, userCollegeData.communityId);
  displayMessages(messages);
  
  // Initialize chat input
  initializeChatInput();
  
  // Start real-time updates
  startRealTimeUpdates();
  
  console.log('Community chat loaded successfully for:', communityName);
}

// Show login required message
function showLoginRequiredMessage() {
  const communitiesSection = document.getElementById('communities');
  communitiesSection.innerHTML = `
    <div class="join-community-container">
      <div class="join-community-card">
        <div class="join-community-icon">🔐</div>
        <h2>Login Required</h2>
        <p>Please login to join your college community and start chatting with fellow students!</p>
        <button class="join-community-btn" onclick="showLoginModal()">
          🚀 Login Now
        </button>
      </div>
    </div>
  `;
}

// Show join community message
function showJoinCommunityMessage() {
  const communitiesSection = document.getElementById('communities');
  communitiesSection.innerHTML = `
    <div class="join-community-container">
      <div class="join-community-card">
        <div class="join-community-icon">🎓</div>
        <h2>Join Your College Community</h2>
        <p>Select your college from the universities page to join your community chat and connect with fellow students!</p>
        <div class="join-community-steps">
          <div class="step">
            <span class="step-number">1</span>
            <span class="step-text">Go to Home</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span class="step-text">Select Your University</span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span class="step-text">Join Your College</span>
          </div>
          <div class="step">
            <span class="step-number">4</span>
            <span class="step-text">Start Chatting!</span>
          </div>
        </div>
        <button class="join-community-btn" onclick="goToUniversities()">
          🏠 Go to Universities
        </button>
      </div>
    </div>
  `;
}

// Show error message
function showErrorMessage(message) {
  const communitiesSection = document.getElementById('communities');
  communitiesSection.innerHTML = `
    <div class="join-community-container">
      <div class="join-community-card">
        <div class="join-community-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>${message}</p>
        <button class="join-community-btn" onclick="location.reload()">
          🔄 Refresh Page
        </button>
      </div>
    </div>
  `;
}

// Load user's college chat
async function loadUserCollegeChat(communityData) {
  // Get real-time community data
  const realTimeData = await getRealTimeCommunityData(communityData.collegeType);
  
  // Update community header with real data
  updateCommunityHeader(realTimeData);
  
  // Load community messages
  const messages = await loadRealCommunityMessages(communityData.collegeType, communityData.communityId);
  displayMessages(messages);
  
  // Initialize chat input
  initializeChatInput();
  
  // Start real-time updates
  startRealTimeUpdates();
}

// Update community header with real data
function updateCommunityHeader(realTimeData) {
  const communityDetails = document.querySelector('.community-details h3');
  const communityMembers = document.querySelector('.community-details p');
  const communityAvatar = document.querySelector('.community-avatar img');
  
  if (communityDetails) communityDetails.textContent = realTimeData.communityName;
  if (communityMembers) communityMembers.textContent = `${realTimeData.members.toLocaleString()} members • ${realTimeData.onlineMembers} online`;
  if (communityAvatar) communityAvatar.src = realTimeData.avatar;
}

// Display messages in chat
function displayMessages(messages) {
  const messageGroup = document.querySelector('.message-group');
  if (!messageGroup) return;
  
  messageGroup.innerHTML = '';
  
  messages.forEach(msg => {
    const messageElement = createRealMessageElement(msg);
    messageGroup.appendChild(messageElement);
  });
  
  scrollToBottom();
}

// Create real message element
function createRealMessageElement(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-item ${msg.isCurrentUser ? 'sent' : 'received'}`;
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <img src="${msg.avatar || `https://picsum.photos/seed/${msg.sender}/36/36`}" alt="${msg.sender}">
    </div>
    <div class="message-content">
      <div class="message-meta">
        <span class="sender-name">${msg.sender}</span>
        <span class="message-time">${msg.time}</span>
      </div>
      <div class="message-bubble">
        <p>${msg.message}</p>
      </div>
    </div>
  `;
  
  return messageDiv;
}

// Initialize chat input
function initializeChatInput() {
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', handleMessageKeyPress);
  }
}

// Handle message key press
function handleMessageKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendUserMessage();
  }
}

// Send user message
async function sendUserMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageText = messageInput.value.trim();
  
  if (!messageText) return;
  
  if (!userCollegeData) {
    alert('Please join a community first!');
    return;
  }
  
  // Add message to UI immediately for better UX
  const currentUser = getCurrentUser();
  const tempMessage = {
    sender: currentUser.name || 'You',
    message: messageText,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isCurrentUser: true,
    avatar: `https://picsum.photos/seed/${currentUser.name || 'user'}/36/36`
  };
  
  const messageElement = createRealMessageElement(tempMessage);
  const messageGroup = document.querySelector('.message-group');
  if (messageGroup) {
    messageGroup.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Clear input
  messageInput.value = '';
  
  // Send to backend
  const result = await sendRealMessage(messageText);
  
  if (!result.success) {
    // Remove message if failed to send
    messageElement.remove();
    alert('Failed to send message: ' + result.error);
  }
}

// Start REAL-TIME updates
function startRealTimeUpdates() {
  console.log('Starting REAL-TIME updates for community chat');
  
  // Update online members count every 15 seconds (more frequent for real-time feel)
  setInterval(async () => {
    if (userCollegeData) {
      console.log('Updating REAL-TIME member counts...');
      const realTimeData = await getRealTimeCommunityData(userCollegeData.collegeType);
      updateCommunityHeader(realTimeData);
    }
  }, 15000);
  
  // Poll for new messages every 3 seconds (more frequent for real-time chat)
  setInterval(async () => {
    if (userCollegeData) {
      console.log('Checking for new REAL messages...');
      const messages = await loadRealCommunityMessages(userCollegeData.collegeType, userCollegeData.communityId);
      const currentMessages = document.querySelectorAll('.message-item');
      
      // Only update if there are new messages
      if (messages.length > currentMessages.length) {
        console.log(`Found ${messages.length - currentMessages.length} new messages`);
        displayMessages(messages);
        
        // Show notification for new messages if user is not active
        if (document.hidden) {
          showNewMessageNotification(messages.length - currentMessages.length);
        }
      }
    }
  }, 3000);
  
  // Update typing indicator every 5 seconds
  setInterval(async () => {
    if (userCollegeData) {
      checkTypingUsers();
    }
  }, 5000);
}

// Show notification for new messages
function showNewMessageNotification(count) {
  if (count > 0) {
    // Update browser title
    document.title = `(${count}) New Messages - VibeXpert`;
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Messages', {
        body: `You have ${count} new message${count > 1 ? 's' : ''} in ${userCollegeData.collegeName}`,
        icon: '/favicon.ico'
      });
    }
  }
}

// Check for typing users (placeholder for future implementation)
function checkTypingUsers() {
  // This would connect to your backend to check who's currently typing
  // For now, it's a placeholder
}

// Go to universities page
function goToUniversities() {
  showPage('home');
}

// Enhanced university selection with backend integration
async function selectUniversityForCommunity(collegeType) {
  const collegeNames = {
    'nit': 'National Institute of Technology',
    'iit': 'Indian Institute of Technology', 
    'vit': 'Vellore Institute of Technology',
    'other': 'Other Universities'
  };
  
  const collegeName = collegeNames[collegeType];
  
  try {
    const result = await joinCollegeCommunity(collegeType, collegeName);
    
    if (result.success) {
      alert(`🎓 Welcome to ${collegeName} Community!\n\nYou can now chat with fellow students from your college.\n\nNote: You cannot change your college community once joined.`);
      
      // Navigate to community chat
      showPage('communities');
    } else {
      alert(`❌ Failed to join community: ${result.error}`);
    }
  } catch (error) {
    console.error('Error joining community:', error);
    alert('❌ Failed to join community. Please try again.');
  }
}

// Function to join college community with specific college name
async function joinCollegeCommunity(collegeType, collegeName) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('Please login to join a community');
    }

    // For now, simulate joining (replace with actual backend call)
    const communityData = {
      collegeType: collegeType,
      collegeName: collegeName, // Use the exact college name
      communityId: `${collegeType}_community`,
      joinedAt: new Date().toISOString(),
      members: Math.floor(Math.random() * 3000) + 1000,
      onlineMembers: Math.floor(Math.random() * 500) + 100
    };

    // Store community data
    userCollegeData = communityData;
    localStorage.setItem('userCollegeData', JSON.stringify(userCollegeData));

    return {
      success: true,
      community: communityData,
      message: `Successfully joined ${collegeName} Community!`
    };

  } catch (error) {
    console.error('Error joining community:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Show login modal (placeholder - implement based on your existing login system)
function showLoginModal() {
  // Navigate to login page or show login modal
  showPage('login');
}

// Create message element
function createMessageElement(sender, message, time, type = 'received') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-item ${type}`;
  
  const avatarSeed = sender.toLowerCase().replace(' ', '-');
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <img src="https://picsum.photos/seed/${avatarSeed}/36/36" alt="${sender}">
    </div>
    <div class="message-content">
      <div class="message-meta">
        <span class="sender-name">${sender}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-bubble">
        <p>${message}</p>
      </div>
    </div>
  `;
  
  return messageDiv;
}

// Handle message key press
function handleMessageKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// Send message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageText = messageInput.value.trim();
  
  if (!messageText) return;
  
  // Create and add message
  const messageElement = createMessageElement('You', messageText, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 'sent');
  const messageGroup = document.querySelector('.message-group');
  if (messageGroup) {
    messageGroup.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Clear input
  messageInput.value = '';
  
  // Simulate response
  setTimeout(() => {
    simulateResponse();
  }, 1000 + Math.random() * 2000);
}

// Simulate response
function simulateResponse() {
  const responses = [
    'Great point! Anyone else have thoughts on this?',
    'That\'s interesting! Let me share my experience...',
    'I agree with this perspective!',
    'Thanks for sharing! Very helpful information.',
    'Awesome! Totally agree with this!',
    'That\'s so true! Happened with me too.',
    'Great suggestion! Let\'s try this out.',
    'Thanks for sharing! Very useful info!'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const randomSender = ['Community Member', 'Student Helper', 'Campus Guide', 'VibeXpert Team'][Math.floor(Math.random() * 4)];
  
  const responseElement = createMessageElement(randomSender, randomResponse, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 'received');
  const messageGroup = document.querySelector('.message-group');
  if (messageGroup) {
    messageGroup.appendChild(responseElement);
    scrollToBottom();
  }
}

// Scroll to bottom of messages
function scrollToBottom() {
  const messagesWrapper = document.querySelector('.messages-wrapper');
  if (messagesWrapper) {
    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
  }
}

// ==========================================
// INITIALIZE AMAZING CHAT ON PAGE LOAD
// ==========================================

// Toggle chat info modal
function toggleChatInfo() {
  alert('Chat Info:\n\nVibeXpert Community\n👥 2,847 members\n🟢 342 online\n\nThis is a unified community chat where everyone can connect and share ideas!');
}

// Flip to posts section with enhanced animation
function flipToPosts() {
  const chatContainer = document.querySelector('.unified-chat-container');
  const communitiesSection = document.getElementById('communities');
  
  // Add enhanced flip animation with scale and rotation
  chatContainer.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  chatContainer.style.transform = 'rotateY(180deg) scale(0.8)';
  chatContainer.style.opacity = '0.5';
  
  // Add visual feedback during flip
  chatContainer.style.boxShadow = '0 20px 60px rgba(79, 116, 163, 0.8)';
  
  // After flip animation, switch to posts section
  setTimeout(() => {
    // Hide communities and show posts
    document.getElementById('communities').style.display = 'none';
    document.getElementById('posts').style.display = 'block';
    
    // Update nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    const postsLink = document.querySelector('a[onclick*="posts"]');
    if (postsLink) postsLink.classList.add('active');
    
    // Reset transform for next time with bounce effect
    chatContainer.style.transform = 'rotateY(0deg) scale(1)';
    chatContainer.style.opacity = '1';
    chatContainer.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
    
    // Focus on post input with smooth scroll
    setTimeout(() => {
      const postInput = document.getElementById('postText');
      if (postInput) {
        postInput.focus();
        postInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add pulse animation to post input
        postInput.style.animation = 'pulse 1s ease-in-out 2';
      }
    }, 300);
  }, 800);
}

// Add pulse animation to CSS
const flipStyle = document.createElement('style');
flipStyle.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
document.head.appendChild(flipStyle);

document.addEventListener('DOMContentLoaded', function() {
  // Initialize community chat when communities page becomes visible
  const communitiesPage = document.getElementById('communities');
  if (communitiesPage) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.target.style.display !== 'none') {
          initializeCommunityChat();
        }
      });
    });

    observer.observe(communitiesPage, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});

console.log('✅ Amazing Community Chat System Ready');
console.log('✅ Community chat module loaded');



