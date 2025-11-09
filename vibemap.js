// VIBEXPERT - COMPLETE UPDATED VERSION WITH MOBILE FIXES

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
    
    let html = '';
    data.posts.forEach(post => {
      const author = post.users?.username || 'User';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.created_at).toLocaleString();
      const isOwn = currentUser && post.user_id === currentUser.id;
      const music = post.music || null;
      const stickers = post.stickers || [];
      
      html += `
        <div class="enhanced-post">
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
                  <span>🌍 Community</span>
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
              <span>❤️ 0</span>
              <span>💬 0</span>
            </div>
            <div class="enhanced-post-engagement">
              <button class="engagement-btn">❤️ Like</button>
              <button class="engagement-btn">💬 Comment</button>
            </div>
          </div>
        </div>
      `;
    });
    
    postsContainer.innerHTML = html;
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

// PROFILE FUNCTIONS
function showProfilePage() {
  if (!currentUser) return;
  showProfileModal(currentUser);
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
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
              <div class="profile-photo" style="${user.profile_pic ? `background-image: url('${user.profile_pic}'); background-size: cover;` : ''}">
                ${!user.profile_pic ? '👤' : ''}
              </div>
              ${isOwnProfile ? `
                <button class="avatar-upload-btn" onclick="uploadProfilePic()">📷 Change Avatar</button>
              ` : ''}
              <div class="active-badge">
                <span class="status-dot"></span>
                <span>Active Now</span>
              </div>
            </div>
            
            <div class="profile-name-section">
              <h2>${user.username}</h2>
              <div class="nickname-display">
                <span class="nickname-label">@${user.username}</span>
              </div>
              ${user.college ? `<p style="color:#888; font-size:14px;">🎓 ${user.college}</p>` : ''}
              ${user.registration_number ? `<p style="color:#888; font-size:13px;">📋 ${user.registration_number}</p>` : ''}
            </div>
            
            ${isOwnProfile ? `
              <button class="profile-edit-btn" onclick="toggleEditProfile()">✏️ Edit Profile</button>
            ` : ''}
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
        
        <div class="profile-description-section">
          <h3>About</h3>
          <p id="profileDescriptionText">${user.bio || 'No description added yet. Click edit to add one!'}</p>
        </div>
        
        ${isOwnProfile ? `
          <div class="edit-profile-section" id="editProfileSection" style="display:none;">
            <h3>Edit Profile</h3>
            <div class="edit-form-group">
              <label>Username</label>
              <input type="text" id="editUsername" value="${user.username}" maxlength="30">
            </div>
            <div class="edit-form-group">
              <label>Bio</label>
              <textarea id="editBio" maxlength="200" rows="4" placeholder="Tell us about yourself...">${user.bio || ''}</textarea>
              <small id="bioCounter">0/200</small>
            </div>
            <div class="edit-form-buttons">
              <button class="btn-save" onclick="saveProfile()">💾 Save</button>
              <button class="btn-cancel" onclick="toggleEditProfile()">❌ Cancel</button>
            </div>
          </div>
        ` : ''}
        
        ${user.badges && user.badges.length > 0 ? `
          <div style="background:rgba(15,25,45,0.9); border:1px solid rgba(79,116,163,0.2); border-radius:12px; padding:20px; margin-top:20px;">
            <h3 style="color:#4f74a3; margin-bottom:15px;">🏆 Badges</h3>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              ${user.badges.map(badge => `
                <span style="background:linear-gradient(135deg, rgba(79,116,163,0.2), rgba(141,164,211,0.2)); border:1px solid rgba(79,116,163,0.3); padding:8px 16px; border-radius:20px; font-size:14px;">${badge}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div style="background:rgba(15,25,45,0.9); border:1px solid rgba(79,116,163,0.2); border-radius:12px; padding:20px; margin-top:20px;">
          <h3 style="color:#4f74a3; margin-bottom:20px;">📝 Profile Posts</h3>
          <div id="userProfilePosts" style="display:flex; flex-direction:column; gap:15px;">
            <div style="text-align:center; padding:20px; color:#888;">⏳ Loading posts...</div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  if (isOwnProfile) {
    const bioTextarea = document.getElementById('editBio');
    if (bioTextarea) {
      bioTextarea.addEventListener('input', updateBioCounter);
      updateBioCounter();
    }
  }
  
  loadUserProfilePosts(user.id);
}

async function loadUserProfilePosts(userId) {
  const container = document.getElementById('userProfilePosts');
  if (!container) return;
  
  try {
    console.log('📨 Loading profile posts for user:', userId);
    
    const data = await apiCall(`/api/posts/user/${userId}`, 'GET');
    
    if (!data.posts || data.posts.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">📝 No profile posts yet.</div>';
      return;
    }
    
    let html = '';
    data.posts.forEach(post => {
      const author = post.users?.username || 'User';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.created_at).toLocaleString();
      const isOwn = currentUser && post.user_id === currentUser.id;
      const music = post.music || null;
      const stickers = post.stickers || [];
      
      html += `
        <div class="enhanced-post" style="margin:0;">
          <div class="enhanced-post-header">
            <div class="enhanced-user-info">
              <div class="enhanced-user-avatar">
                ${post.users?.profile_pic ? `<img src="${post.users.profile_pic}" class="enhanced-user-avatar">` : '👤'}
              </div>
              <div class="enhanced-user-details">
                <div class="enhanced-username">@${author}</div>
                <div class="enhanced-post-meta">
                  <span>${time}</span>
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
              <span>❤️ 0</span>
              <span>💬 0</span>
            </div>
            <div class="enhanced-post-engagement">
              <button class="engagement-btn">❤️ Like</button>
              <button class="engagement-btn">💬 Comment</button>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    console.log('✅ Profile posts loaded');
  } catch (error) {
    console.error('❌ Failed to load profile posts:', error);
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#ff6b6b;">❌ Failed to load posts</div>';
  }
}

function toggleEditProfile() {
  const section = document.getElementById('editProfileSection');
  if (!section) return;
  
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function updateBioCounter() {
  const textarea = document.getElementById('editBio');
  const counter = document.getElementById('bioCounter');
  if (textarea && counter) {
    counter.textContent = `${textarea.value.length}/200`;
  }
}

async function saveProfile() {
  const username = document.getElementById('editUsername')?.value.trim();
  const bio = document.getElementById('editBio')?.value.trim();
  
  if (!username) {
    showMessage('⚠️ Username required', 'error');
    return;
  }
  
  try {
    const data = await apiCall('/api/profile', 'PATCH', { username, bio });
    
    if (data.success) {
      currentUser.username = data.user.username;
      currentUser.bio = data.user.bio;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      showMessage('✅ Profile updated!', 'success');
      document.querySelector('.modal')?.remove();
      showProfilePage();
    }
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

function uploadProfilePic() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showMessage('⚠️ Image too large (max 5MB)', 'error');
      return;
    }
    
    try {
      showMessage('📤 Uploading profile picture...', 'success');
      
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('profilePic', compressedFile);
      
      const data = await apiCall('/api/profile', 'PATCH', formData);
      
      if (data.success) {
        currentUser.profile_pic = data.user.profile_pic;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showMessage('✅ Profile picture updated!', 'success');
        document.querySelector('.modal')?.remove();
        showProfilePage();
      }
    } catch (error) {
      showMessage('❌ Failed to upload: ' + error.message, 'error');
    }
  };
  
  input.click();
}

// UTILITY FUNCTIONS
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) modal.style.display = 'none';
}

function showMessage(text, type) {
  const box = document.getElementById('message');
  if(!box) {
    console.log('Message:', text);
    return;
  }
  
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  box.innerHTML = '';
  box.appendChild(div);
  
  setTimeout(() => {
    if(div.parentNode) div.remove();
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
      if (id === 'liveUsersCount') {
        el.textContent = count + ' Active';
      } else if (id === 'footerUsers') {
        el.textContent = count;
      } else {
        el.textContent = count;
      }
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
  hamburger.style.display = 'none';
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  options.style.display = 'none';
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

function showComplaintModal() {
  document.getElementById('complaintModal').style.display = 'flex';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

function showContactModal() {
  document.getElementById('contactModal').style.display = 'flex';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

function showFeedbackModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>📢 Send Feedback</h2>
      <p style="color:#888; margin-bottom:20px;">We'd love to hear from you!</p>
      <input type="text" id="feedbackSubject" placeholder="Subject" style="margin-bottom:15px;">
      <textarea id="feedbackMessage" placeholder="Your feedback..." style="width:100%; min-height:120px; padding:12px; background:rgba(20,30,50,0.6); border:1px solid rgba(79,116,163,0.3); border-radius:10px; color:white; font-family:inherit; resize:vertical;"></textarea>
      <button onclick="submitFeedback()" style="width:100%; margin-top:15px;">📤 Send Feedback</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

async function submitFeedback() {
  const subject = document.getElementById('feedbackSubject')?.value.trim();
  const message = document.getElementById('feedbackMessage')?.value.trim();
  
  if (!subject || !message) {
    showMessage('⚠️ Please fill all fields', 'error');
    return;
  }
  
  try {
    await apiCall('/api/feedback', 'POST', { subject, message });
    showMessage('✅ Thank you for your feedback!', 'success');
    document.querySelector('.modal')?.remove();
  } catch (error) {
    showMessage('❌ Failed to submit feedback', 'error');
  }
}

function submitComplaint() {
  const text = document.getElementById('complaintText').value.trim();
  if (text) {
    showMessage('✅ Complaint submitted!', 'success');
    document.getElementById('complaintText').value = '';
    closeModal('complaintModal');
  } else {
    showMessage('⚠️ Enter complaint details', 'error');
  }
}

function toggleTheme() {
  const body = document.body;
  if(body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  }
  showMessage('🎨 Theme changed!', 'success');
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
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

console.log('✅ VibeXpert Updated - All features working on mobile, tablet, and desktop!');

function goForgotPassword(e) {
  e.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value.trim();
  
  if(!email) {
    showMessage('Enter your email', 'error');
    return;
  }
  
  try {
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ Check your email for reset code', 'success');
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

function goSignup(e) {
  e.preventDefault();
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

function logout() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  showLoginPage();
  showMessage('👋 Logged out', 'success');
  showLoginForm();
}

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
}

// FIXED: Enhanced search functionality for mobile
function initializeSearchBar() {
  const searchBox = document.getElementById('searchBox');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchBox) {
    console.warn('Search box not found');
    return;
  }
  
  console.log('✅ Search bar initialized');
  
  // Debounced search with longer delay for mobile typing
  searchBox.addEventListener('input', (e) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    
    // Show loading state
    searchResults.innerHTML = '<div class="no-results">🔍 Searching...</div>';
    searchResults.style.display = 'block';
    
    // Debounce search (wait 600ms for mobile typing)
    searchTimeout = setTimeout(() => {
      performUserSearch(query);
    }, 600);
  });
  
  searchBox.addEventListener('focus', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
      performUserSearch(query);
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      hideSearchResults();
    }
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
  
  if (!searchResults) {
    console.error('❌ Search results container not found');
    return;
  }
  
  try {
    console.log('🔍 Searching for:', query);
    
    const data = await apiCall(`/api/search/users?query=${encodeURIComponent(query)}`, 'GET');
    
    console.log('📊 Search API response:', data);
    console.log('📊 Number of users found:', data.users?.length || 0);
    
    if (!data.success) {
      throw new Error('Search failed');
    }
    
    if (data.users && data.users.length > 0) {
      console.log('✅ Users found:');
      data.users.forEach((user, index) => {
        console.log(`  ${index + 1}. @${user.username} - ${user.email}`);
      });
    } else {
      console.log('⚠️ No users found for query:', query);
    }
    
    displaySearchResults(data.users || []);
  } catch (error) {
    console.error('❌ Search error:', error);
    searchResults.innerHTML = `
      <div class="no-results" style="color:#ff6b6b;">
        ❌ ${error.message || 'Search failed'}<br>
        <small style="font-size:12px;color:#888;margin-top:8px;display:block;">
          Please check your internet connection and try again
        </small>
      </div>
    `;
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
  
  console.log(`✅ Displaying ${users.length} search results`);
  
  let html = '';
  users.forEach(user => {
    const avatarContent = user.profile_pic 
      ? `<img src="${user.profile_pic}" alt="${user.username}">` 
      : '👤';
    
    html += `
      <div class="search-result-item" onclick="showUserProfile('${user.id}')">
        <div class="search-result-avatar">
          ${avatarContent}
        </div>
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
  if (searchResults) {
    searchResults.style.display = 'none';
  }
}

async function showUserProfile(userId) {
  hideSearchResults();
  
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.value = '';
  }
  
  try {
    console.log('👤 Loading profile for user:', userId);
    showMessage('Loading profile...', 'success');
    
    const data = await apiCall(`/api/profile/${userId}`, 'GET');
    
    if (!data.success || !data.user) {
      throw new Error('User not found');
    }
    
    const user = data.user;
    console.log('✅ Profile loaded:', user.username);
    
    showProfileModal(user);
  } catch (error) {
    console.error('❌ Failed to load profile:', error);
    showMessage('❌ Failed to load profile: ' + error.message, 'error');
  }
}

// ENHANCED POST FEATURES

function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  
  input.onchange = function(e) {
    handlePhotoSelection(e.target.files);
  };
  
  input.click();
}

function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        showMessage('📷 Camera access granted. Taking photo...', 'success');
        setTimeout(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          input.onchange = function(e) {
            handlePhotoSelection(e.target.files);
          };
          input.click();
        }, 1000);
      })
      .catch(function(error) {
        console.error('Camera error:', error);
        showMessage('⚠️ Camera not available. Using gallery instead.', 'error');
        openPhotoGallery();
      });
  } else {
    showMessage('⚠️ Camera not supported. Using gallery instead.', 'error');
    openPhotoGallery();
  }
}

// FIXED: Enhanced photo selection with compression for mobile
async function handlePhotoSelection(files) {
  if (!files.length) return;
  
  showMessage('📸 Processing images...', 'success');
  
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) {
      showMessage('Please select image files only', 'error');
      continue;
    }
    
    if (selectedFiles.length >= 5) {
      showMessage('Maximum 5 photos allowed', 'error');
      break;
    }
    
    try {
      // Compress image for mobile
      const compressedFile = await compressImage(file);
      selectedFiles.push(compressedFile);
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const previewUrl = e.target.result;
        previewUrls.push(previewUrl);
        displayPhotoPreviews();
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image processing error:', error);
      showMessage('Failed to process image: ' + file.name, 'error');
    }
  }
  
  if (selectedFiles.length > 0) {
    showMessage(`✅ ${selectedFiles.length} photo(s) ready`, 'success');
  }
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
  
  previewUrls.forEach((previewUrl, index) => {
    html += `
      <div class="preview-item">
        <div class="preview-image-container">
          <img src="${previewUrl}" alt="Preview ${index + 1}" class="preview-image">
          <div class="media-actions">
            <button class="crop-btn" onclick="openCropEditor(${index})">✂️ Crop</button>
            <button class="edit-btn" onclick="openPhotoEditor(${index})">🎨 Edit</button>
            <button class="remove-btn" onclick="removePhoto(${index})">🗑️</button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function openCropEditor(index) {
  currentCropIndex = index;
  const imageUrl = previewUrls[index];
  
  document.getElementById('cropImage').src = imageUrl;
  showModal('cropEditorModal');
  
  setTimeout(() => {
    const image = document.getElementById('cropImage');
    if (cropper) {
      cropper.destroy();
    }
    
    cropper = new Cropper(image, {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 0.8,
      responsive: true,
      restore: true,
      checkCrossOrigin: false,
      guides: true,
      center: true,
      highlight: true,
      background: false,
      movable: true,
      rotatable: true,
      scalable: true,
      zoomable: true,
      zoomOnTouch: true,
      zoomOnWheel: true,
      wheelZoomRatio: 0.1,
      ready: function() {
        console.log('Cropper ready');
      }
    });
    
    setupAspectRatioButtons();
  }, 100);
}

function setupAspectRatioButtons() {
  const buttons = document.querySelectorAll('.aspect-ratio-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const ratio = this.dataset.ratio;
      if (ratio === 'free') {
        cropper.setAspectRatio(NaN);
      } else {
        cropper.setAspectRatio(eval(ratio));
      }
    });
  });
}

function rotateImage() {
  if (cropper) {
    cropper.rotate(90);
  }
}

function resetCrop() {
  if (cropper) {
    cropper.reset();
  }
}

function applyCrop() {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas();
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    previewUrls[currentCropIndex] = croppedDataUrl;
    
    canvas.toBlob(function(blob) {
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      selectedFiles[currentCropIndex] = file;
    }, 'image/jpeg', 0.8);
    
    displayPhotoPreviews();
    closeCropEditor();
    showMessage('✅ Photo cropped successfully!', 'success');
  }
}

function closeCropEditor() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  closeModal('cropEditorModal');
}

function openPhotoEditor(index) {
  currentEditIndex = index;
  const imageUrl = previewUrls[index];
  
  document.getElementById('editImage').src = imageUrl;
  showModal('photoEditorModal');
  
  currentFilters[index] = currentFilters[index] || 'normal';
  applyFilter('normal');
}

function applyFilter(filterName) {
  const image = document.getElementById('editImage');
  currentFilters[currentEditIndex] = filterName;
  
  image.className = '';
  
  if (filterName !== 'normal') {
    image.classList.add(`filter-${filterName}`);
  }
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active-filter');
  });
  event.target.classList.add('active-filter');
}

function resetFilters() {
  applyFilter('normal');
}

function saveEditedPhoto() {
  const image = document.getElementById('editImage');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  
  ctx.filter = getFilterValue(currentFilters[currentEditIndex]);
  ctx.drawImage(image, 0, 0);
  
  const editedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
  previewUrls[currentEditIndex] = editedDataUrl;
  
  canvas.toBlob(function(blob) {
    const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
    selectedFiles[currentEditIndex] = file;
  }, 'image/jpeg', 0.8);
  
  displayPhotoPreviews();
  closePhotoEditor();
  showMessage('✅ Photo edited successfully!', 'success');
}

function closePhotoEditor() {
  closeModal('photoEditorModal');
  currentEditIndex = -1;
}

function getFilterValue(filterName) {
  const filters = {
    normal: 'none',
    vintage: 'sepia(0.4) contrast(1.2) brightness(1.1)',
    clarendon: 'contrast(1.2) saturate(1.35)',
    moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
    lark: 'contrast(0.9) brightness(1.2) hue-rotate(-10deg)',
    reyes: 'sepia(0.6) contrast(1.1) brightness(1.1) saturate(1.4)'
  };
  return filters[filterName] || 'none';
}

function removePhoto(index) {
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  displayPhotoPreviews();
  showMessage('🗑️ Photo removed', 'success');
}

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
        <button class="preview-btn" onclick="previewMusic('${music.url}', ${music.id})">▶️ Preview</button>
        <button class="select-btn ${isSelected ? 'selected' : ''}" onclick="selectMusic(${music.id})">
          ${isSelected ? '✓ Selected' : '✅ Select'}
        </button>
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
  
  player.play().catch(e => {
    console.error('Error playing music:', e);
    showMessage('Could not play music preview. Please try another track.', 'error');
  });
  
  document.querySelectorAll('.music-item').forEach(item => {
    item.classList.remove('playing');
  });
  
  const currentItem = document.querySelector(`.music-item button[onclick*="${musicId}"]`)?.closest('.music-item');
  if (currentItem) {
    currentItem.classList.add('playing');
  }
}

function selectMusic(musicId) {
  selectedMusic = musicLibrary.find(m => m.id === musicId);
  updateSelectedAssets();
  closeMusicSelector();
  showMessage(`🎵 "${selectedMusic.name}" added to your post!`, 'success');
  
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
  showMessage('🎵 Music removed from post', 'success');
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
        <div class="sticker" onclick="addSticker('${sticker.emoji}', '${sticker.name}')">
          ${sticker.emoji}
        </div>
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
  if (selectedStickers.length >= 5) {
    showMessage('Maximum 5 stickers allowed per post', 'error');
    return;
  }
  
  selectedStickers.push({emoji, name});
  updateSelectedAssets();
  
  const postText = document.getElementById('postText');
  postText.value += emoji;
  
  showMessage(`🎨 Sticker "${name}" added!`, 'success');
}

function removeStickers() {
  selectedStickers = [];
  updateSelectedAssets();
  showMessage('🎨 All stickers removed', 'success');
}

function showPostDestinationModal() {
  showModal('postDestinationModal');
}

function selectPostDestination(destination) {
  if (destination === 'community') {
    if (!currentUser.communityJoined || !currentUser.college) {
      showMessage('⚠️ Please connect to your university first!', 'error');
      closeModal('postDestinationModal');
      
      setTimeout(() => {
        if (confirm('You need to join a college community first. Explore colleges now?')) {
          showPage('home');
          document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
        }
      }, 500);
      return;
    }
  }
  
  selectedPostDestination = destination;
  const displayText = destination === 'profile' ? 'My Profile' : 'Community Feed';
  document.getElementById('currentDestination').textContent = displayText;
  closeModal('postDestinationModal');
  showMessage(`📍 Post will be shared to ${displayText}`, 'success');
  
  console.log('✅ Post destination set to:', selectedPostDestination);
}

function updateSelectedAssets() {
  const container = document.getElementById('selectedAssets');
  if (!container) return;
  
  let html = '';
  
  if (selectedMusic) {
    html += `
      <div class="selected-asset">
        <span>🎵 ${selectedMusic.name}</span>
        <button onclick="removeMusic()" class="remove-asset-btn">✕</button>
      </div>
    `;
  }
  
  if (selectedStickers.length > 0) {
    html += `
      <div class="selected-asset selected-stickers">
        <span>🎨 Stickers:</span>
        ${selectedStickers.map(sticker => `<span class="sticker-preview">${sticker.emoji}</span>`).join('')}
        <button onclick="removeStickers()" class="remove-asset-btn">✕</button>
      </div>
    `;
  }
  
  container.innerHTML = html;
  container.style.display = html ? 'block' : 'none';
}

// FIXED: Enhanced Create Post Function with mobile support
async function createPost() {
  const postText = document.getElementById('postText').value.trim();
  
  console.log('🚀 === POST CREATION START ===');
  console.log('📝 Post text:', postText);
  console.log('📁 Files:', selectedFiles.length);
  console.log('🎵 Music:', selectedMusic ? selectedMusic.name : 'None');
  console.log('🎨 Stickers:', selectedStickers.length);
  console.log('📍 Destination:', selectedPostDestination);
  
  // Validate content
  if (!postText && selectedFiles.length === 0 && !selectedMusic && selectedStickers.length === 0) {
    console.log('❌ No content to post');
    showMessage('⚠️ Please add some content to your post', 'error');
    return;
  }
  
  if (!currentUser) {
    console.log('❌ User not logged in');
    showMessage('⚠️ Please login to post', 'error');
    return;
  }
  
  // Check community membership for community posts
  if (selectedPostDestination === 'community') {
    console.log('🔍 Checking community membership...');
    console.log('Community joined:', currentUser.communityJoined);
    console.log('College:', currentUser.college);
    
    if (!currentUser.communityJoined || !currentUser.college) {
      console.log('❌ User not in community');
      showMessage('⚠️ Please connect to your university first!', 'error');
      
      setTimeout(() => {
        if (confirm('You need to join a college community first. Explore colleges now?')) {
          showPage('home');
          document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
        }
      }, 500);
      return;
    }
  }
  
  try {
    console.log('✅ All validations passed');
    showMessage('📤 Creating post... Please wait', 'success');
    
    const formData = new FormData();
    formData.append('content', postText);
    formData.append('postTo', selectedPostDestination);
    
    console.log('📦 FormData created with postTo:', selectedPostDestination);
    
    if (selectedMusic) {
      formData.append('music', JSON.stringify(selectedMusic));
      console.log('🎵 Added music:', selectedMusic.name);
    }
    
    if (selectedStickers.length > 0) {
      formData.append('stickers', JSON.stringify(selectedStickers));
      console.log('🎨 Added stickers:', selectedStickers.length);
    }
    
    // Add files with progress indication
    if (selectedFiles.length > 0) {
      showMessage(`📤 Uploading ${selectedFiles.length} file(s)...`, 'success');
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('media', selectedFiles[i]);
        console.log(`📁 Added file ${i + 1}:`, selectedFiles[i].name, `(${(selectedFiles[i].size / 1024).toFixed(0)}KB)`);
      }
    }
    
    console.log('📤 Sending POST request to /api/posts...');
    
    const data = await apiCall('/api/posts', 'POST', formData);
    
    console.log('✅ Response received:', data);
    
    if (data.success) {
      const msg = selectedPostDestination === 'profile' 
        ? '✅ Post added to your profile!' 
        : '✅ Post shared to community!';
      
      showMessage(msg, 'success');
      console.log('🎉 Post created successfully!');
      
      if (data.badgeUpdated && data.newBadges?.length > 0) {
        setTimeout(() => {
          showMessage(`🏆 New badge: ${data.newBadges.join(', ')}`, 'success');
        }, 1500);
      }
      
      resetPostForm();
      
      setTimeout(() => {
        console.log('🔄 Reloading feeds...');
        loadPosts();
        
        if (selectedPostDestination === 'profile') {
          const profilePostsContainer = document.getElementById('userProfilePosts');
          if (profilePostsContainer) {
            loadUserProfilePosts(currentUser.id);
          }
        }
        
        if (selectedPostDestination === 'community') {
          const communityPostsContainer = document.getElementById('communityPostsContainer');
          if (communityPostsContainer) {
            loadCommunityPosts();
          }
        }
      }, 1000);
    } else {
      console.log('❌ Post creation failed:', data);
      showMessage('❌ Failed to create post', 'error');
    }
  } catch (error) {
    console.error('❌ CREATE POST ERROR:', error);
    
    if (error.message.includes('timeout')) {
      showMessage('⚠️ Upload timeout - please try with smaller images or check your connection', 'error');
    } else if (error.message.includes('university') || error.message.includes('community')) {
      showMessage('⚠️ Please connect to your university first!', 'error');
      setTimeout(() => {
        if (confirm('You need to join a college community first. Explore colleges now?')) {
          showPage('home');
          document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
        }
      }, 500);
    } else {
      showMessage('❌ Error: ' + (error.message || 'Failed to create post'), 'error');
    }
  }
  
  console.log('🏁 === POST CREATION END ===');
}

function resetPostForm() {
  console.log('🧹 Resetting post form...');
  document.getElementById('postText').value = '';
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
  
  console.log('✅ Form reset complete. Destination remains:', selectedPostDestination);
}

// Load Posts - Shows ALL posts (profile + community)
async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if (!feedEl) {
    console.log('❌ Feed element not found');
    return;
  }
  
  console.log('📨 === LOADING POSTS ===');
  console.log('👤 Current user:', currentUser?.username);
  
  try {
    feedEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">⏳ Loading posts...</div>';
    
    const endpoint = '/api/posts';
    
    console.log('🔗 Fetching from:', endpoint);
    
    const data = await apiCall(endpoint, 'GET');
    
    console.log('✅ Received data:', {
      success: data.success,
      postsCount: data.posts?.length || 0
    });
    
    if (!data.posts || data.posts.length === 0) {
      const emptyMsg = '📝 No posts yet. Create your first post!';
      
      console.log('ℹ️ No posts found');
      feedEl.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">${emptyMsg}</div>`;
      return;
    }
    
    console.log('✅ Rendering', data.posts.length, 'posts');
    
    let html = '';
    data.posts.forEach((post, index) => {
      console.log(`Rendering post ${index + 1}:`, {
        id: post.id,
        author: post.users?.username,
        postedTo: post.posted_to,
        hasContent: !!post.content,
        mediaCount: post.media?.length || 0
      });
      
      const author = post.users?.username || 'User';
      const authorId = post.users?.id || '';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.created_at || post.timestamp).toLocaleString();
      const isOwn = currentUser && authorId === currentUser.id;
      const postedTo = post.posted_to === 'community' ? '🌍 Community' : '👤 Profile';
      const music = post.music || null;
      const stickers = post.stickers || [];
      
      html += `
        <div class="enhanced-post">
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
                ${stickers.map(sticker => `
                  <span class="post-sticker">${sticker.emoji || sticker}</span>
                `).join('')}
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
                    Your browser does not support the audio element.
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
              <span>❤️ 0</span>
              <span>💬 0</span>
              <span>🔄 0</span>
            </div>
            <div class="enhanced-post-engagement">
              <button class="engagement-btn">❤️ Like</button>
              <button class="engagement-btn">💬 Comment</button>
              <button class="engagement-btn">🔄 Share</button>
            </div>
          </div>
        </div>
      `;
    });
    
    feedEl.innerHTML = html;
    console.log('✅ Posts rendered successfully');
    
  } catch (error) {
    console.error('❌ LOAD POSTS ERROR:', error);
    feedEl.innerHTML = `
      <div style="text-align:center; padding:40px; color:#ff6b6b;">
        ❌ Failed to load posts<br>
        <small style="font-size:14px;color:#888;margin-top:8px;display:block;">
          ${error.message || 'Please check your connection and try again'}
        </small>
      </div>
    `;
  }
  
  console.log('🏁 === LOADING POSTS END ===');
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  
  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    showMessage('🗑️ Post deleted', 'success');
    loadPosts();
  } catch (error) {
    showMessage('❌ Failed to delete: ' + error.message, 'error');
  }
}

// SOCKET FUNCTIONS
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
  
  socket.on('new_message', (message) => {
    appendMessageToChat(message);
  });
  
  socket.on('message_updated', (message) => {
    updateMessageInChat(message);
  });
  
  socket.on('message_deleted', ({ id }) => {
    removeMessageFromChat(id);
  });
  
  socket.on('online_count', (count) => {
    updateOnlineCount(count);
  });
}

// NAVIGATION FUNCTIONS
function showPage(name, e) {
  if(e) e.preventDefault();
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const targetPage = document.getElementById(name);
  if(targetPage) targetPage.style.display = 'block';
  
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if(e && e.target) e.target.classList.add('active');
  
  if(name === 'posts') {
    loadPosts();
  } else if(name === 'communities') {
    loadCommunities();
  } else if(name === 'badges') {
    loadBadgesPage();
  }
  
  document.getElementById('hamburgerMenu').style.display = 'none';
  
  window.scrollTo(0, 0);
}

function goHome() {
  showPage('home');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
}

// COLLEGE FUNCTIONS
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
  
  document.getElementById('collegeTitle').textContent = titles[type];
  document.getElementById('home').style.display = 'none';
  document.getElementById('collegeList').style.display = 'block';
  
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
          : `<button onclick="openVerify('${c.name}', '${c.email}')">Connect</button>`
        }
      </div>
    `;
  });
  
  document.getElementById('collegeContainer').innerHTML = html;
}

function searchColleges() {
  const search = document.getElementById('searchCollege').value.toLowerCase();
  const filtered = colleges[currentType].filter(c => 
    c.name.toLowerCase().includes(search) || c.location.toLowerCase().includes(search)
  );
  allColleges = filtered;
  currentPage = 1;
  showColleges();
}

function backToUniversities() {
  document.getElementById('collegeList').style.display = 'none';
  document.getElementById('home').style.display = 'block';
}

function openVerify(name, emailDomain) {
  if (currentUser && currentUser.college) {
    showMessage('⚠️ You are already connected to ' + currentUser.college, 'error');
    return;
  }
  
  currentVerifyCollege = {name, emailDomain};
  
  const modalHtml = `
    <div class="modal-box">
      <span class="close" onclick="closeModal('verifyModal')">&times;</span>
      <h2>Verify Your College</h2>
      <p>Enter your college email to verify</p>
      <p style="color:#888; font-size:13px;">Email must end with: ${emailDomain}</p>
      <input type="email" id="verifyEmail" placeholder="your.email${emailDomain}">
      <button onclick="requestVerificationCode()">Send Verification Code</button>
      <div id="codeSection" style="display:none; margin-top:20px;">
        <input type="text" id="verifyCode" placeholder="Enter 6-digit code" maxlength="6">
        <button onclick="verifyCollegeCode()">Verify Code</button>
      </div>
    </div>
  `;
  
  document.getElementById('verifyModal').innerHTML = modalHtml;
  document.getElementById('verifyModal').style.display = 'flex';
}

async function requestVerificationCode() {
  const email = document.getElementById('verifyEmail').value.trim();
  
  if (!email) {
    showMessage('⚠️ Enter your email', 'error');
    return;
  }
  
  if (!email.endsWith(currentVerifyCollege.emailDomain)) {
    showMessage('⚠️ Email must end with ' + currentVerifyCollege.emailDomain, 'error');
    return;
  }
  
  try {
    showMessage('📧 Sending verification code...', 'success');
    
    await apiCall('/api/college/request-verification', 'POST', {
      collegeName: currentVerifyCollege.name,
      collegeEmail: email
    });
    
    showMessage('✅ Code sent to ' + email, 'success');
    document.getElementById('codeSection').style.display = 'block';
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyCollegeCode() {
  const code = document.getElementById('verifyCode').value.trim();
  
  if (!code || code.length !== 6) {
    showMessage('⚠️ Enter 6-digit code', 'error');
    return;
  }
  
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
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}
