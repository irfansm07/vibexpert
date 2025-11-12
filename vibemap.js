// VIBEXPERT - COMPLETE UPDATED VERSION WITH FUNCTIONAL LIKES, COMMENTS & SHARES

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

// Enhanced music library with working audio files
const musicLibrary = [
  {
    id: 1,
    name: "Chill Vibes",
    artist: "LoFi Beats",
    duration: "2:30",
    url: "https://assets.mixkit.co/music/preview/mixkit-chill-vibes-239.mp3",
    emoji: "🎧"
  },
  {
    id: 2,
    name: "Upbeat Energy",
    artist: "Electronic Pop",
    duration: "3:15",
    url: "https://assets.mixkit.co/music/preview/mixkit-upbeat-energy-225.mp3",
    emoji: "⚡"
  },
  {
    id: 3,
    name: "Dreamy Piano",
    artist: "Classical",
    duration: "2:45",
    url: "https://assets.mixkit.co/music/preview/mixkit-dreamy-piano-1171.mp3",
    emoji: "🎹"
  },
  {
    id: 4,
    name: "Summer Vibes",
    artist: "Tropical",
    duration: "3:30",
    url: "https://assets.mixkit.co/music/preview/mixkit-summer-vibes-129.mp3",
    emoji: "🏖️"
  },
  {
    id: 5,
    name: "Happy Day",
    artist: "Pop Rock",
    duration: "2:50",
    url: "https://assets.mixkit.co/music/preview/mixkit-happy-day-583.mp3",
    emoji: "😊"
  },
  {
    id: 6,
    name: "Relaxing Guitar",
    artist: "Acoustic",
    duration: "3:10",
    url: "https://assets.mixkit.co/music/preview/mixkit-relaxing-guitar-243.mp3",
    emoji: "🎸"
  }
];

// Enhanced sticker library with categories
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
  ],
  nature: [
    { id: 'sun', emoji: '☀️', name: 'Sun' },
    { id: 'moon', emoji: '🌙', name: 'Moon' },
    { id: 'tree', emoji: '🌳', name: 'Tree' },
    { id: 'flower', emoji: '🌸', name: 'Flower' },
    { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
    { id: 'wave', emoji: '🌊', name: 'Wave' }
  ],
  food: [
    { id: 'pizza', emoji: '🍕', name: 'Pizza' },
    { id: 'burger', emoji: '🍔', name: 'Burger' },
    { id: 'icecream', emoji: '🍦', name: 'Ice Cream' },
    { id: 'coffee', emoji: '☕', name: 'Coffee' },
    { id: 'cake', emoji: '🍰', name: 'Cake' },
    { id: 'drink', emoji: '🥤', name: 'Drink' }
  ],
  activities: [
    { id: 'sports', emoji: '⚽', name: 'Sports' },
    { id: 'game', emoji: '🎮', name: 'Game' },
    { id: 'music', emoji: '🎵', name: 'Music' },
    { id: 'art', emoji: '🎨', name: 'Art' },
    { id: 'movie', emoji: '🎬', name: 'Movie' },
    { id: 'travel', emoji: '✈️', name: 'Travel' }
  ]
};

const colleges = {
  nit: [
    {name: 'NIT Bhopal', email: '@stu.manit.ac.in', location: 'Bhopal'},
    {name: 'NIT Rourkela', email: '@nitrkl.ac.in', location: 'Rourkela'},
    {name: 'NIT Warangal', email: '@nitw.ac.in', location: 'Warangal'},
    {name: 'NIT Trichy', email: '@nitt.edu', location: 'Trichy'},
    {name: 'NIT Surathkal', email: '@nitk.edu.in', location: 'Surathkal'},
  ],
  iit: [
    {name: 'IIT Delhi', email: '@iitd.ac.in', location: 'New Delhi'},
    {name: 'IIT Bombay', email: '@iitb.ac.in', location: 'Mumbai'},
    {name: 'IIT Madras', email: '@iitm.ac.in', location: 'Chennai'},
    {name: 'IIT Kharagpur', email: '@kgp.iitkgp.ac.in', location: 'Kharagpur'},
    {name: 'IIT Kanpur', email: '@iitk.ac.in', location: 'Kanpur'},
  ],
  vit: [
    {name: 'VIT Bhopal', email: '@vitbhopal.ac.in', location: 'Bhopal'},
    {name: 'VIT Vellore', email: '@vit.ac.in', location: 'Vellore'},
    {name: 'VIT Chennai', email: '@vit.ac.in', location: 'Chennai'},
  ],
  other: [
    {name: 'Delhi University', email: '@du.ac.in', location: 'New Delhi'},
    {name: 'Mumbai University', email: '@mu.ac.in', location: 'Mumbai'},
    {name: 'BITS Pilani', email: '@pilani.bits-pilani.ac.in', location: 'Pilani'},
  ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  setupEventListeners();
  initializeMusicPlayer();
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
  initializeSearchBar();
  loadTrending();
});

function setupEventListeners() {
  const addMusicBtn = document.getElementById('addMusicBtn');
  if (addMusicBtn) {
    addMusicBtn.addEventListener('click', openMusicSelector);
  }
  
  const addStickerBtn = document.getElementById('addStickerBtn');
  if (addStickerBtn) {
    addStickerBtn.addEventListener('click', openStickerSelector);
  }
}

function initializeMusicPlayer() {
  window.musicPlayer = new Audio();
  window.musicPlayer.volume = 0.5;
  
  window.musicPlayer.addEventListener('loadedmetadata', function() {
    console.log('Music loaded:', this.src);
  });
  
  window.musicPlayer.addEventListener('error', function(e) {
    console.error('Error loading music:', e);
    showMessage('Error loading music file. Please try another one.', 'error');
  });
}

// FIXED: Enhanced API call with timeout and retry logic for mobile
function getToken() {
  return localStorage.getItem('authToken');
}

async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for mobile networks
  
  const options = {
    method,
    headers: {},
    signal: controller.signal
  };
  
  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body && !(body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }
  
  try {
    console.log(`📡 API Call: ${method} ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    console.log(`✅ API Success: ${endpoint}`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Retry logic for network errors
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('network') || error.message.includes('fetch'))) {
      console.log(`🔄 Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiCall(endpoint, method, body, retries - 1);
    }
    
    console.error(`❌ API Error: ${endpoint}`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection and try again');
    }
    throw error;
  }
}

// FIXED: Image compression for mobile uploads
async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  // Skip if file is already small
  if (file.size < 500 * 1024) return file; // Less than 500KB
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
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
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log(`🗜️ Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
    };
  });
}

function checkAuthStatus() {
  const token = getToken();
  const saved = localStorage.getItem('user');
  
  if(token && saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
    
    if (currentUser.college) {
      updateLiveNotif(`Connected to ${currentUser.college}`);
      initializeSocket();
    }
  }
}

function showLoginPage() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('mainPage').style.display = 'none';
}

function showMainPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
}

// AUTH FUNCTIONS
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if(!email || !password) {
    showMessage('Fill all fields', 'error');
    return;
  }
  
  try {
    showMessage('Logging in...', 'success');
    
    const data = await apiCall('/api/login', 'POST', { email, password });
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    showMessage('✅ Login successful!', 'success');
    
    setTimeout(() => {
      showMainPage();
      document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
      document.getElementById('loginForm').reset();
      loadPosts();
      if (currentUser.college) {
        initializeSocket();
      }
    }, 800);
  } catch (error) {
    showMessage('❌ Login failed: ' + error.message, 'error');
  }
}

async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const registrationNumber = document.getElementById('signupReg').value.trim();
  const password = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  if(!username || !email || !registrationNumber || !password || !confirm) {
    showMessage('Fill all fields', 'error');
    return;
  }
  
  if(password !== confirm) {
    showMessage('Passwords don\'t match', 'error');
    return;
  }
  
  try {
    showMessage('Creating account...', 'success');
    
    await apiCall('/api/register', 'POST', { username, email, password, registrationNumber });
    
    showMessage('🎉 Account created! Check your email', 'success');
    
    document.getElementById('signupForm').reset();
    
    setTimeout(() => {
      goLogin(null);
    }, 2000);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

// COMMUNITY FUNCTIONS
function loadCommunities() {
  const container = document.getElementById('communitiesContainer');
  
  if (!currentUser || !currentUser.communityJoined) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Connect to your college first to join community!</p>
        <button class="home-nav-btn" onclick="showPage('home')">Explore Colleges</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="community-card">
      <h3>${currentUser.college} Community</h3>
      <p>Share and chat with students from your college</p>
      <button onclick="openCommunitySection()">Open Community</button>
    </div>
  `;
}

function openCommunitySection() {
  document.getElementById('chatSection').style.display = 'block';
  loadCommunityPosts();
  loadCommunityMessages();
}

async function loadCommunityPosts() {
  const container = document.getElementById('communityPostsContainer');
  if (!container) {
    const chatSection = document.getElementById('chatSection');
    if (chatSection) {
      const postsDiv = document.createElement('div');
      postsDiv.innerHTML = `
        <div style="margin-bottom:30px;">
          <div class="chat-header">
            <h3>📸 Community Posts</h3>
            <p style="color:#888; font-size:13px; margin:5px 0 0 0;">Share photos, videos, and updates with your community</p>
          </div>
          <div id="communityPostsContainer" style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
            <div style="text-align:center; padding:20px; color:#888;">⏳ Loading community posts...</div>
          </div>
        </div>
      `;
      chatSection.insertBefore(postsDiv, chatSection.firstChild);
    }
  }
  
  const postsContainer = document.getElementById('communityPostsContainer');
  if (!postsContainer) return;
  
  try {
    console.log('📨 Loading community posts');
    
    const data = await apiCall('/api/posts/community', 'GET');
    
    if (data.needsJoinCommunity) {
      postsContainer.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <div style="font-size:48px; margin-bottom:20px;">🎓</div>
          <h3 style="color:#4f74a3;">Join a Community First!</h3>
          <p style="color:#888;">Connect to your college to see community posts.</p>
        </div>
      `;
      return;
    }
    
    if (!data.posts || data.posts.length === 0) {
      postsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">📸 No community posts yet. Be the first to share!</div>';
      return;
    }
    
    postsContainer.innerHTML = '';
    data.posts.forEach(post => {
      postsContainer.appendChild(createPostElement(post));
    });
    
    console.log('✅ Community posts loaded');
  } catch (error) {
    console.error('❌ Failed to load community posts:', error);
    if (postsContainer) {
      postsContainer.innerHTML = `
        <div style="text-align:center; padding:20px; color:#ff6b6b;">
          ❌ Failed to load community posts<br>
          <small style="font-size:12px;color:#888;margin-top:8px;display:block;">
            ${error.message || 'Please try again'}
          </small>
        </div>
      `;
    }
  }
}

function openCommunityChat() {
  document.getElementById('chatSection').style.display = 'block';
  loadCommunityMessages();
}

async function loadCommunityMessages() {
  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('chatMessages');
    
    if (!data.messages || data.messages.length === 0) {
      messagesEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">No messages yet. Start chatting!</div>';
      return;
    }
    
    messagesEl.innerHTML = '';
    data.messages.reverse().forEach(msg => {
      appendMessageToChat(msg);
    });
    
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (error) {
    console.error('Load messages error:', error);
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
    ${Object.keys(reactionCounts).length > 0 ? `
      <div style="display:flex; gap:5px; margin-top:5px; flex-wrap:wrap;">
        ${Object.entries(reactionCounts).map(([emoji, count]) => 
          `<span style="background:rgba(79,116,163,0.2); padding:2px 6px; border-radius:10px; font-size:12px;">${emoji} ${count}</span>`
        ).join('')}
      </div>
    ` : ''}
    <div style="display:flex; gap:8px; margin-top:8px; font-size:11px; color:#888;">
      <span onclick="reactToMessage('${msg.id}')" style="cursor:pointer;">❤️</span>
      <span onclick="reactToMessage('${msg.id}', '👍')" style="cursor:pointer;">👍</span>
      <span onclick="reactToMessage('${msg.id}', '😂')" style="cursor:pointer;">😂</span>
      <span onclick="reactToMessage('${msg.id}', '🔥')" style="cursor:pointer;">🔥</span>
      ${canEdit ? `<span onclick="editMessage('${msg.id}', '${msg.content.replace(/'/g, "\\'")}')" style="cursor:pointer;">✏️ Edit</span>` : ''}
      ${isOwn ? `<span onclick="deleteMessage('${msg.id}')" style="cursor:pointer;">🗑️ Delete</span>` : ''}
      <span onclick="showMessageViews('${msg.id}')" style="cursor:pointer;">👁️ Views</span>
    </div>
  `;
  
  messagesEl.appendChild(messageDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  markMessageAsViewed(msg.id);
}

function updateMessageInChat(msg) {
  const messageEl = document.getElementById(`msg-${msg.id}`);
  if (!messageEl) return;
  
  const isOwn = msg.sender_id === currentUser.id;
  const textEl = messageEl.querySelector('.text');
  if (textEl) {
    textEl.innerHTML = `${msg.content} <span style="font-size:10px;color:#888;">(edited)</span>`;
  }
}

function removeMessageFromChat(id) {
  const messageEl = document.getElementById(`msg-${id}`);
  if (messageEl) {
    messageEl.remove();
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();
  
  if (!content) return;
  
  try {
    await apiCall('/api/community/messages', 'POST', { content });
    input.value = '';
  } catch (error) {
    showMessage('❌ Failed to send message: ' + error.message, 'error');
  }
}

function handleChatKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

async function editMessage(messageId, currentContent) {
  if (editingMessageId) {
    showMessage('⚠️ Finish editing current message first', 'error');
    return;
  }
  
  const newContent = prompt('Edit message:', currentContent);
  if (!newContent || newContent.trim() === '' || newContent === currentContent) return;
  
  try {
    editingMessageId = messageId;
    await apiCall(`/api/community/messages/${messageId}`, 'PATCH', { content: newContent.trim() });
    showMessage('✅ Message edited', 'success');
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  } finally {
    editingMessageId = null;
  }
}

async function deleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;
  
  try {
    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');
    showMessage('🗑️ Message deleted', 'success');
  } catch (error) {
    showMessage('❌ Failed to delete: ' + error.message, 'error');
  }
}

async function reactToMessage(messageId, emoji = '❤️') {
  try {
    await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
  } catch (error) {
    console.error('React error:', error);
  }
}

async function markMessageAsViewed(messageId) {
  try {
    await apiCall(`/api/community/messages/${messageId}/view`, 'POST');
  } catch (error) {
    console.error('View error:', error);
  }
}

async function showMessageViews(messageId) {
  try {
    const data = await apiCall(`/api/community/messages/${messageId}/views`, 'GET');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-box">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>Message Views (${data.count})</h2>
        ${data.views.length > 0 ? `
          <div style="max-height:300px; overflow-y:auto;">
            ${data.views.map(v => `
              <div style="padding:10px; border-bottom:1px solid rgba(79,116,163,0.1);">
                <strong>@${v.users?.username || 'User'}</strong>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align:center; color:#888;">No views yet</p>'}
      </div>
    `;
    document.body.appendChild(modal);
  } catch (error) {
    showMessage('❌ Failed to load views', 'error');
  }
}

// BADGES PAGE
function loadBadgesPage() {
  const container = document.getElementById('badges');
  if (!container) return;
  
  const allBadges = [
    { emoji: '🎓', name: 'Community Member', desc: 'Joined a college community', earned: currentUser?.badges?.includes('🎓 Community Member') },
    { emoji: '🎨', name: 'First Post', desc: 'Created your first post', earned: currentUser?.badges?.includes('🎨 First Post') },
    { emoji: '⭐', name: 'Content Creator', desc: 'Posted 10 times', earned: currentUser?.badges?.includes('⭐ Content Creator') },
    { emoji: '💬', name: 'Chatty', desc: 'Sent 50 messages', earned: false },
    { emoji: '🔥', name: 'On Fire', desc: '7 day streak', earned: false },
  ];
  
  let html = `
    <div style="text-align:center; margin-bottom:40px;">
      <h2 style="font-size:32px; color:#4f74a3; margin-bottom:10px;">🏆 Badges</h2>
      <p style="color:#888;">Earn badges by being active in the community!</p>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:20px;">
  `;
  
  allBadges.forEach(badge => {
    html += `
      <div style="background:${badge.earned ? 'linear-gradient(135deg, rgba(79,116,163,0.2), rgba(141,164,211,0.2))' : 'rgba(15,25,45,0.9)'}; border:2px solid ${badge.earned ? '#4f74a3' : 'rgba(79,116,163,0.2)'}; border-radius:16px; padding:30px 20px; text-align:center; transition:all 0.3s ease;" ${badge.earned ? 'style="box-shadow:0 10px 30px rgba(79,116,163,0.3);"' : ''}>
        <div style="font-size:48px; margin-bottom:15px; filter:${badge.earned ? 'none' : 'grayscale(100%) opacity(0.3)'};">${badge.emoji}</div>
        <h3 style="color:${badge.earned ? '#4f74a3' : '#666'}; font-size:18px; margin-bottom:8px;">${badge.name}</h3>
        <p style="color:#888; font-size:13px; margin-bottom:15px;">${badge.desc}</p>
        <div style="background:${badge.earned ? 'linear-gradient(135deg, #4f74a3, #8da4d3)' : 'rgba(79,116,163,0.1)'}; color:${badge.earned ? 'white' : '#666'}; padding:8px 16px; border-radius:20px; font-size:12px; font-weight:600; display:inline-block;">
          ${badge.earned ? '✓ Earned' : '🔒 Locked'}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// NEW: Like/Comment/Share Functions
async function toggleLikePost(postId) {
  try {
    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');
    
    // Update UI immediately
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    const likeCount = document.querySelector(`[data-post-id="${postId}"] .like-count`);
    
    if (likeBtn && likeCount) {
      if (data.liked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = '❤️ Liked';
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = '❤️ Like';
      }
      likeCount.textContent = `❤️ ${data.likeCount}`;
    }
  } catch (error) {
    console.error('Like error:', error);
    showMessage('❌ Failed to like post', 'error');
  }
}

async function openComments(postId) {
  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'GET');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:600px; max-height:80vh; display:flex; flex-direction:column;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2 style="margin-bottom:20px;">💬 Comments (${data.comments?.length || 0})</h2>
        
        <div id="commentsContainer" style="flex:1; overflow-y:auto; margin-bottom:20px; max-height:400px;">
          ${data.comments && data.comments.length > 0 ? 
            data.comments.map(comment => `
              <div class="comment-item" style="padding:15px; background:rgba(15,25,45,0.6); border-radius:12px; margin-bottom:10px; border:1px solid rgba(79,116,163,0.2);">
                <div style="display:flex; gap:10px; align-items:start;">
                  <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #4f74a3, #8da4d3); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    ${comment.users?.profile_pic ? `<img src="${comment.users.profile_pic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : '👤'}
                  </div>
                  <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:5px;">
                      <strong style="color:#4f74a3;">@${comment.users?.username || 'User'}</strong>
                      ${comment.user_id === currentUser?.id ? `
                        <button onclick="deleteComment('${comment.id}', '${postId}')" style="background:transparent; border:none; color:#ff6b6b; cursor:pointer; font-size:14px;">🗑️</button>
                      ` : ''}
                    </div>
                    <p style="color:#e0e0e0; margin:0; word-break:break-word;">${comment.content}</p>
                    <small style="color:#888; font-size:11px;">${new Date(comment.created_at).toLocaleString()}</small>
                  </div>
                </div>
              </div>
            `).join('') 
            : '<p style="text-align:center; color:#888; padding:40px;">No comments yet. Be the first to comment!</p>'
          }
        </div>
        
        <div style="display:flex; gap:10px;">
          <input type="text" id="commentInput" placeholder="Write a comment..." style="flex:1; padding:12px; background:rgba(20,30,50,0.6); border:1px solid rgba(79,116,163,0.3); border-radius:10px; color:white;">
          <button onclick="postComment('${postId}')" style="padding:12px 24px; background:linear-gradient(135deg, #4f74a3, #8da4d3); border:none; border-radius:10px; color:white; cursor:pointer; font-weight:600;">Post</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('commentInput').focus();
  } catch (error) {
    console.error('Load comments error:', error);
    showMessage('❌ Failed to load comments', 'error');
  }
}

async function postComment(postId) {
  const input = document.getElementById('commentInput');
  const content = input?.value.trim();
  
  if (!content) {
    showMessage('⚠️ Comment cannot be empty', 'error');
    return;
  }
  
  try {
    await apiCall(`/api/posts/${postId}/comments`, 'POST', { content });
    showMessage('✅ Comment posted!', 'success');
    
    // Refresh comments
    document.querySelector('.modal')?.remove();
    openComments(postId);
    
    // Update comment count in post
    const commentCount = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
    if (commentCount) {
      const current = parseInt(commentCount.textContent.match(/\d+/)?.[0] || 0);
      commentCount.textContent = `💬 ${current + 1}`;
    }
  } catch (error) {
    console.error('Post comment error:', error);
    showMessage('❌ Failed to post comment', 'error');
  }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Delete this comment?')) return;
  
  try {
    await apiCall(`/api/posts/comments/${commentId}`, 'DELETE');
    showMessage('🗑️ Comment deleted', 'success');
    
    // Refresh comments
    document.querySelector('.modal')?.remove();
    openComments(postId);
    
    // Update comment count in post
    const commentCount = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
    if (commentCount) {
      const current = parseInt(commentCount.textContent.match(/\d+/)?.[0] || 0);
      commentCount.textContent = `💬 ${Math.max(0, current - 1)}`;
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    showMessage('❌ Failed to delete comment', 'error');
  }
}

async function sharePost(postId) {
  try {
    const data = await apiCall(`/api/posts/${postId}`, 'GET');
    const post = data.post;
    
    if (!post) {
      showMessage('❌ Post not found', 'error');
      return;
    }
    
    const shareText = `Check out this post by @${post.users?.username || 'User'} on VibeXpert!\n\n${post.content || 'View post for media content'}`;
    const shareUrl = `${window.location.origin}/?post=${postId}`;
    
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VibeXpert Post',
          text: shareText,
          url: shareUrl
        });
        
        // Increment share count
        await apiCall(`/api/posts/${postId}/share`, 'POST');
        
        // Update UI
        const shareCount = document.querySelector(`[data-post-id="${postId}"] .share-count`);
        if (shareCount) {
          const current = parseInt(shareCount.textContent.match(/\d+/)?.[0] || 0);
          shareCount.textContent = `🔄 ${current + 1}`;
        }
        
        showMessage('✅ Post shared!', 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // User cancelled
        }
      }
    }
    
    // Fallback: Show share modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:500px;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2 style="margin-bottom:20px;">🔄 Share Post</h2>
        
        <div style="background:rgba(15,25,45,0.6); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid rgba(79,116,163,0.2);">
          <p style="color:#e0e0e0; margin:0; word-break:break-word;">${shareText}</p>
        </div>
        
        <div style="display:flex; gap:10px; margin-bottom:15px;">
          <input type="text" id="shareUrlInput" value="${shareUrl}" readonly style="flex:1; padding:10px; background:rgba(20,30,50,0.6); border:1px solid rgba(79,116,163,0.3); border-radius:8px; color:white;">
          <button onclick="copyShareUrl('${postId}')" style="padding:10px 20px; background:linear-gradient(135deg, #4f74a3, #8da4d3); border:none; border-radius:8px; color:white; cursor:pointer; font-weight:600;">📋 Copy</button>
        </div>
        
        <p style="text-align:center; color:#888; font-size:13px;">Share this link with your friends!</p>
      </div>
    `;
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Share post error:', error);
    showMessage('❌ Failed to share post', 'error');
  }
}

async function copyShareUrl(postId) {
  const input = document.getElementById('shareUrlInput');
  if (!input) return;
  
  try {
    await navigator.clipboard.writeText(input.value);
    showMessage('✅ Link copied to clipboard!', 'success');
    
    // Increment share count
    await apiCall(`/api/posts/${postId}/share`, 'POST');
    
    // Update UI
    const shareCount = document.querySelector(`[data-post-id="${postId}"] .share-count`);
    if (shareCount) {
      const current = parseInt(shareCount.textContent.match(/\d+/)?.[0] || 0);
      shareCount.textContent = `🔄 ${current + 1}`;
    }
    
    document.querySelector('.modal')?.remove();
  } catch (error) {
    console.error('Copy error:', error);
    showMessage('❌ Failed to copy link', 'error');
  }
}

// NEW: Create post element with interactive buttons
function createPostElement(post) {
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
  const isLiked = post.user_has_liked || false;
  
  const postDiv = document.createElement('div');
  postDiv.className = 'enhanced-post';
  postDiv.setAttribute('data-post-id', post.id);
  
  postDiv.innerHTML = `
    <div class="enhanced-post-header">
      <div class="enhanced-user-info">
        <div class="enhanced-user-avatar">
          ${post.users?.profile_pic ? `<img src="${post.users.profile_pic}" class="enhanced-user-avatar">` : '👤'}
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
      ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️ Delete</button>` : ''}
    </div>
    
    <div class="enhanced-post-content">
      ${content ? `<div class="enhanced-post-text">${content}</div>` : ''}
      
      ${stickers.length > 0 ? `
        <div class="post-stickers-container">
          ${stickers.map(sticker => `<span class="post-sticker">${sticker.emoji || sticker}</span>`).join('')}
        </div>
      ` : ''}
      
      ${music ? `
        <div class="post-music-container">
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
        </div>
      ` : ''}
      
      ${media.length > 0 ? `
        <div class="enhanced-post-media">
          ${media.map(m => 
            m.type === 'image' 
              ? `<div class="enhanced-media-item"><img src="${m.url}" alt="Post image"></div>` 
              : m.type === 'video'
              ? `<div class="enhanced-media-item"><video src="${m.url}" controls></video></div>`
              : `<div class="enhanced-media-item"><audio src="${m.url}" controls></audio></div>`
          ).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="enhanced-post-footer">
      <div class="enhanced-post-stats">
        <span class="like-count">❤️ ${likeCount}</span>
        <span class="comment-count">💬 ${commentCount}</span>
        <span class="share-count">🔄 ${shareCount}</span>
      </div>
      <div class="enhanced-post-engagement">
        <button class="engagement-btn like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLikePost('${post.id}')">
          ${isLiked ? '❤️ Liked' : '❤️ Like'}
        </button>
        <button class="engagement-btn" onclick="openComments('${post.id}')">💬 Comment</button>
        <button class="engagement-btn" onclick="sharePost('${post.id}')">🔄 Share</button>
      </div>
    </div>
  `;
  
  return postDiv;
}
