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

// ========================================
// ENHANCED COMMUNITY CHAT
// ========================================

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

await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

if (messageEl) {
messageEl.style.animation = 'fadeOut 0.3s ease';
setTimeout(() => messageEl.remove(), 300);
}

showMessage('🗑️ Message deleted', 'success');
} catch(error) {
console.error('Delete error:', error);
showMessage('❌ Failed to delete', 'error');

const messageEl = document.getElementById(`msg-${messageId}`);
if (messageEl) {
messageEl.style.opacity = '1';
messageEl.style.pointerEvents = 'auto';
}
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

  // Simple community card to open chat
  container.innerHTML = `
    <div class="community-card-wrapper">
      <div class="community-card" onclick="openCommunityChat()">
        <div class="community-icon">🎓</div>
        <div class="community-info">
          <h3>${currentUser.college}</h3>
          <p>College Community Chat</p>
          <div class="community-stats">
            <span class="stat-badge">
              <span class="online-dot"></span>
              <span id="commOnlineCount">0</span> Online
            </span>
            <span class="stat-badge">💬 Community Chat</span>
          </div>
        </div>
        <div class="community-arrow">→</div>
      </div>
    </div>
  `;
  
  // Update online count
  updateOnlineCount();
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

function initializeSocket() {
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
    updateConnectionStatus(true);
    
    if (currentUser && currentUser.college) {
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
    if (currentUser && currentUser.college) {
      socket.emit('join_college', currentUser.college);
      loadCommunityMessages();
    }
  });

  socket.on('new_message', (message) => {
    console.log('📨 New message received:', message);
    addMessageToUI(message, false);
  });

  socket.on('message_deleted', ({ id }) => {
    console.log('🗑️ Message deleted:', id);
    removeMessageFromUI(id);
  });

  socket.on('online_count', (count) => {
    updateOnlineCount(count);
  });

  socket.on('user_typing', ({ username }) => {
    showTypingIndicator(username);
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
// INPUT HANDLERS
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

function handleChatKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendCommunityMessage();
  }
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

console.log('✅ Community chat module loaded');


// ==========================================
// CLOSE COMMUNITY CHAT FUNCTION
// ==========================================
function closeCommunityChat() {
  const chatSection = document.getElementById('chatSection');
  if (chatSection) {
    chatSection.style.display = 'none';
  }
  // Don't need to show communities page as it's in the same section
}

function updateOnlineCount() {
  // This will be called periodically to update online counts
  if (socket && socket.connected) {
    socket.emit('request_online_count');
  }
}
