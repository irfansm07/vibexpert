// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT PART 1: INITIALIZATION & CORE
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
let currentChatCollege = null;
let chatMessages = [];
let isTyping = false;
let onlineUsers = new Set();
let emojiCategories = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🐊'],
  food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🏋️', '🤼', '🤸', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎯', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟', '🃏', '🀄', '🎴', '🎳'],
  objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠', '⛏', '🔩', '⚙️', '🗜', '⚗️', '⛓', '⚔', '🪓', '🔫', '🏹', '🛡', '🪚']
};

// Data
const rewardsData = {
  dailyTasks: [
    { id: 'post_today', title: 'Share Your Day', desc: 'Create 1 post', reward: 10, icon: '📝', completed: false },
    { id: 'comment_5', title: 'Engage', desc: 'Comment on 5 posts', reward: 15, icon: '💬', completed: false },
    { id: 'like_10', title: 'Spread Love', desc: 'Like 10 posts', reward: 5, icon: '❤️', completed: false },
    { id: 'login_streak', title: 'Daily Login', desc: '7 days streak', reward: 50, icon: '🔥', completed: false }
  ],
  achievements: [
    { id: 'first_post', title: 'First Post', desc: 'Create your first post', reward: 25, icon: '🎯', unlocked: false },
    { id: 'social_butterfly', title: 'Social Butterfly', desc: 'Make 10 friends', reward: 100, icon: '🦋', unlocked: false },
    { id: 'content_creator', title: 'Content Creator', desc: 'Create 50 posts', reward: 200, icon: '📸', unlocked: false },
    { id: 'chat_master', title: 'Chat Master', desc: 'Send 100 messages', reward: 150, icon: '💬', unlocked: false }
  ]
};

// ========================================
// INITIALIZATION
// ========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  checkAuthStatus();
  initializeSocket();
  setupEventListeners();
  initializeVantaBackgrounds();
  setupScrollProgress();
  setupRevealOnScroll();
}

function checkAuthStatus() {
  const token = localStorage.getItem('vibexpert_token');
  if (token) {
    validateToken(token);
  } else {
    showAboutUsPage();
  }
}

function validateToken(token) {
  fetch(`${API_URL}/api/validate-token`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.valid) {
      currentUser = data.user;
      showMainPage();
      loadUserData();
    } else {
      localStorage.removeItem('vibexpert_token');
      showAboutUsPage();
    }
  })
  .catch(error => {
    console.error('Token validation error:', error);
    showAboutUsPage();
  });
}

function showAboutUsPage() {
  document.getElementById('aboutUsPage').style.display = 'block';
  document.getElementById('mainPage').style.display = 'none';
}

function showMainPage() {
  document.getElementById('aboutUsPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  document.getElementById('userName').textContent = currentUser.name || 'User';
}

// ========================================
// SOCKET.IO INITIALIZATION
// ========================================

function initializeSocket() {
  socket = io(API_URL, {
    auth: {
      token: localStorage.getItem('vibexpert_token')
    }
  });

  socket.on('connect', () => {
    console.log('Connected to server');
    connectionStatus = 'connected';
    hideConnectionBanner();
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    connectionStatus = 'disconnected';
    showConnectionBanner();
  });

  socket.on('reconnect', () => {
    console.log('Reconnected to server');
    connectionStatus = 'connected';
    hideConnectionBanner();
  });

  // Chat events
  socket.on('new_message', handleNewMessage);
  socket.on('typing_start', handleTypingStart);
  socket.on('typing_stop', handleTypingStop);
  socket.on('message_reaction', handleMessageReaction);
  socket.on('user_joined', handleUserJoined);
  socket.on('user_left', handleUserLeft);
  socket.on('online_users', handleOnlineUsers);
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Theme toggle
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('theme-toggle')) {
      toggleTheme();
    }
  });

  // Logout
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('logout-btn')) {
      logout();
    }
  });

  // Navigation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-btn')) {
      const sectionName = e.target.textContent.toLowerCase().replace(/[^\w]/g, '');
      showSection(sectionName);
    }
  });

  // Modal close buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-modal-btn') || 
        e.target.classList.contains('close-modal')) {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    }
  });

  // Click outside modal to close
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Escape to close modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    }
    
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Focus search input
      const searchInput = document.querySelector('#collegeSearchInput, #chatSearchInput');
      if (searchInput) {
        searchInput.focus();
      }
    }
  });

  // Window resize handler
  window.addEventListener('resize', function() {
    handleWindowResize();
  });

  // Scroll handler for infinite loading
  window.addEventListener('scroll', function() {
    handleScroll();
  });
}

// ========================================
// VANTA BACKGROUNDS
// ========================================

function initializeVantaBackgrounds() {
  // About page globe background
  if (document.getElementById('vanta-globe-bg')) {
    VANTA.GLOBE({
      el: "#vanta-globe-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x4f74a3,
      backgroundColor: 0x0a0a0a,
      size: 0.80
    });
  }

  // Main page net background
  if (document.getElementById('vanta-net-bg')) {
    VANTA.NET({
      el: "#vanta-net-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x4f74a3,
      backgroundColor: 0x0a0a0a,
      points: 10.00,
      maxDistance: 20.00,
      spacing: 15.00
    });
  }
}

// ========================================
// SCROLL PROGRESS
// ========================================

function setupScrollProgress() {
  const progressBar = document.getElementById('scrollProgressFill');
  const progressIndicator = document.getElementById('scrollProgressIndicator');
  
  if (!progressBar) return;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    progressBar.style.width = scrollPercent + '%';
    
    // Show/hide progress indicator
    if (progressIndicator) {
      if (scrollPercent > 10 && scrollPercent < 90) {
        progressIndicator.classList.add('show');
        progressIndicator.textContent = Math.round(scrollPercent) + '%';
      } else {
        progressIndicator.classList.remove('show');
      }
    }
  });
}

// ========================================
// REVEAL ON SCROLL
// ========================================

function setupRevealOnScroll() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  document.querySelectorAll('.reveal-on-scroll').forEach(element => {
    observer.observe(element);
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function handleWindowResize() {
  // Handle responsive adjustments
  if (window.innerWidth < 768) {
    // Mobile adjustments
    document.body.classList.add('mobile-view');
  } else {
    document.body.classList.remove('mobile-view');
  }
}

function handleScroll() {
  // Handle infinite scroll for feeds
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    // Near bottom, load more content
    loadMoreContent();
  }
}

function loadMoreContent() {
  // Implementation depends on current section
  const activeSection = document.querySelector('.section.active');
  if (activeSection) {
    const sectionId = activeSection.id;
    
    switch(sectionId) {
      case 'homeSection':
        loadMoreHomeFeed();
        break;
      case 'realvibeSection':
        loadMoreRealVibe();
        break;
      case 'postsSection':
        loadMoreMyPosts();
        break;
    }
  }
}

function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return date.toLocaleDateString();
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#4f74a3'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ========================================
// API CALLS
// ========================================

async function apiCall(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('vibexpert_token');
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// ========================================
// THEME MANAGEMENT
// ========================================

function toggleTheme() {
  const body = document.body;
  const themeBtn = document.querySelector('.theme-toggle');
  
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeBtn.textContent = '🌙';
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    themeBtn.textContent = '☀️';
  }
  
  localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.textContent = '🌙';
  }
}

// ========================================
// AUTHENTICATION
// ========================================

function logout() {
  localStorage.removeItem('vibexpert_token');
  if (socket) {
    socket.disconnect();
  }
  showAboutUsPage();
}

// ========================================
// NAVIGATION
// ========================================

function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show selected section
  const selectedSection = document.getElementById(`${sectionName}Section`);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  // Load section data
  loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
  switch(sectionName) {
    case 'home':
      loadHomeFeed();
      break;
    case 'communities':
      loadColleges();
      break;
    case 'realvibe':
      loadRealVibe();
      break;
    case 'posts':
      loadMyPosts();
      break;
    case 'rewards':
      loadRewards();
      break;
  }
}

// ========================================
// DATA LOADING FUNCTIONS
// ========================================

async function loadUserData() {
  try {
    const response = await apiCall('/api/user/data');
    updateLiveCounter(response.onlineCount);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

function updateLiveCounter(count) {
  const liveCountElement = document.getElementById('liveCount');
  if (liveCountElement) {
    liveCountElement.textContent = count || '0';
  }
}

// ========================================
// SCROLL TO FUNCTIONS
// ========================================

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function showMainPage() {
  document.getElementById('aboutUsPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  document.getElementById('userName').textContent = currentUser.name || 'User';
  
  // Load initial data
  loadSectionData('home');
}
// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT PART 2: ENHANCED CHAT SYSTEM
// ========================================

// ========================================
// CHAT SYSTEM INITIALIZATION
// ========================================

function initializeEnhancedChat() {
  if (chatInitialized) return;
  
  chatInitialized = true;
  setupChatInputEnhancements();
  setupMessageActions();
  setupTypingIndicator();
  setupReactionSystem();
  setupConnectionMonitor();
  setupMessageOptimization();
  setupInfiniteScroll();
}

function joinCollegeChat(collegeName) {
  if (!socket || !currentUser) return;
  
  currentChatCollege = collegeName;
  socket.emit('join_college', { college: collegeName, user: currentUser });
  
  // Update UI
  document.getElementById('chatCollegeName').textContent = collegeName;
  document.getElementById('chatSection').style.display = 'flex';
  document.getElementById('communitiesSection').style.display = 'none';
  
  // Load messages
  loadChatMessages();
  
  // Initialize chat features
  initializeEnhancedChat();
}

function leaveCollegeChat() {
  if (!socket || !currentChatCollege) return;
  
  socket.emit('leave_college', { college: currentChatCollege, user: currentUser });
  currentChatCollege = null;
  
  document.getElementById('chatSection').style.display = 'none';
  document.getElementById('communitiesSection').style.display = 'block';
}

function backToCommunities() {
  leaveCollegeChat();
}

// ========================================
// MESSAGE LOADING & RENDERING
// ========================================

async function loadChatMessages() {
  try {
    const response = await apiCall(`/api/community/messages?college=${currentChatCollege}&page=${currentMessagePage}`, 'GET');
    
    if (response.messages) {
      if (currentMessagePage === 1) {
        chatMessages = response.messages;
        renderChatMessages();
      } else {
        chatMessages.unshift(...response.messages);
        prependMessages(response.messages);
      }
      
      hasMoreMessages = response.messages.length === ITEMS_PER_PAGE;
      currentMessagePage++;
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    showNotification('Failed to load messages', 'error');
  }
}

function renderChatMessages() {
  const container = document.getElementById('chatMessagesContainer');
  container.innerHTML = '';
  
  chatMessages.forEach(message => {
    const messageElement = createMessageElement(message);
    container.appendChild(messageElement);
  });
  
  scrollToBottom();
}

function prependMessages(newMessages) {
  const container = document.getElementById('chatMessagesContainer');
  const scrollHeight = container.scrollHeight;
  
  newMessages.forEach(message => {
    const messageElement = createMessageElement(message);
    container.insertBefore(messageElement, container.firstChild);
  });
  
  // Maintain scroll position
  container.scrollTop = container.scrollHeight - scrollHeight;
}

function createMessageElement(message) {
  const isOwn = message.sender_id === currentUser.id;
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isOwn ? 'own' : 'other'}`;
  messageDiv.dataset.messageId = message.id;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = message.sender_name ? message.sender_name[0].toUpperCase() : '?';
  
  const content = document.createElement('div');
  content.className = 'message-content';
  
  const header = document.createElement('div');
  header.className = 'message-header';
  
  if (!isOwn) {
    const senderName = document.createElement('span');
    senderName.className = 'sender-name';
    senderName.textContent = message.sender_name || 'Unknown';
    header.appendChild(senderName);
  }
  
  const time = document.createElement('span');
  time.className = 'message-time';
  time.textContent = formatMessageTime(message.created_at);
  header.appendChild(time);
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  // Handle media content
  if (message.media_url) {
    const mediaElement = createMediaElement(message);
    bubble.appendChild(mediaElement);
  }
  
  // Add text content
  if (message.content) {
    const textElement = document.createElement('div');
    textElement.textContent = message.content;
    bubble.appendChild(textElement);
  }
  
  const actions = document.createElement('div');
  actions.className = 'message-actions';
  actions.innerHTML = `
    <button class="message-action-btn" onclick="copyMessage('${message.id}')" title="Copy">📋</button>
    <button class="message-action-btn" onclick="replyToMessage('${message.id}')" title="Reply">↩️</button>
    ${isOwn ? `<button class="message-action-btn" onclick="deleteMessage('${message.id}')" title="Delete">🗑️</button>` : ''}
  `;
  
  content.appendChild(header);
  content.appendChild(bubble);
  content.appendChild(actions);
  
  // Add reactions if any
  if (message.reactions && message.reactions.length > 0) {
    const reactionBar = createReactionBar(message.reactions, message.id);
    content.appendChild(reactionBar);
  }
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  return messageDiv;
}

function createMediaElement(message) {
  const mediaDiv = document.createElement('div');
  mediaDiv.className = 'message-media';
  
  if (message.media_type === 'image') {
    const img = document.createElement('img');
    img.src = message.media_url;
    img.alt = 'Shared image';
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.onclick = () => viewMedia(message.media_url, 'image');
    mediaDiv.appendChild(img);
  } else if (message.media_type === 'video') {
    const video = document.createElement('video');
    video.src = message.media_url;
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.borderRadius = '8px';
    mediaDiv.appendChild(video);
  } else if (message.media_type === 'audio') {
    const audio = document.createElement('audio');
    audio.src = message.media_url;
    audio.controls = true;
    audio.style.width = '100%';
    mediaDiv.appendChild(audio);
  } else {
    const docLink = document.createElement('a');
    docLink.href = message.media_url;
    docLink.target = '_blank';
    docLink.textContent = '📄 View Document';
    docLink.style.display = 'inline-block';
    docLink.style.padding = '8px 12px';
    docLink.style.background = 'rgba(79, 116, 163, 0.2)';
    docLink.style.borderRadius = '6px';
    docLink.style.textDecoration = 'none';
    docLink.style.color = '#4f74a3';
    mediaDiv.appendChild(docLink);
  }
  
  return mediaDiv;
}

function createReactionBar(reactions, messageId) {
  const reactionBar = document.createElement('div');
  reactionBar.className = 'reaction-bar';
  
  reactions.forEach(reaction => {
    const pill = document.createElement('span');
    pill.className = 'reaction-pill';
    pill.innerHTML = `${reaction.emoji} <span class="reaction-count">${reaction.count}</span>`;
    pill.onclick = () => toggleReaction(messageId, reaction.emoji);
    reactionBar.appendChild(pill);
  });
  
  return reactionBar;
}

// ========================================
// MESSAGE SENDING
// ========================================

async function sendModernMessage() {
  const input = document.getElementById('modernChatInput');
  const content = input.value.trim();
  
  if (!content || !currentChatCollege) return;
  
  try {
    updateMessageStatus('Sending...');
    
    const response = await apiCall('/api/community/messages', 'POST', {
      content: content,
      college: currentChatCollege
    });
    
    if (response.success) {
      input.value = '';
      updateCharCount();
      updateMessageStatus('Message sent');
      
      // Message will be received via socket
    }
  } catch (error) {
    console.error('Error sending message:', error);
    updateMessageStatus('Failed to send');
  }
}

async function sendMediaMessage(file, type) {
  if (!file || !currentChatCollege) return;
  
  try {
    updateMessageStatus('Uploading...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('college', currentChatCollege);
    formData.append('media_type', type);
    
    const token = localStorage.getItem('vibexpert_token');
    const response = await fetch(`${API_URL}/api/community/messages/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      updateMessageStatus('Media sent');
      closeMediaUpload();
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Error sending media:', error);
    updateMessageStatus('Failed to send media');
  }
}

// ========================================
// CHAT INPUT HANDLING
// ========================================

function setupChatInputEnhancements() {
  const input = document.getElementById('modernChatInput');
  if (!input) return;
  
  // Auto-resize
  input.addEventListener('input', handleChatInput);
  
  // Keyboard shortcuts
  input.addEventListener('keydown', handleChatInputKeydown);
  
  // Character count
  input.addEventListener('input', updateCharCount);
}

function handleChatInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendModernMessage();
  } else {
    handleTyping();
  }
}

function handleChatInput() {
  const input = document.getElementById('modernChatInput');
  updateCharCount();
  
  // Auto-resize textarea
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function updateCharCount() {
  const input = document.getElementById('modernChatInput');
  const charCount = document.getElementById('charCount');
  const sendBtn = document.getElementById('modernSendBtn');
  
  if (!input || !charCount || !sendBtn) return;
  
  const count = input.value.length;
  charCount.textContent = `${count} / 1000`;
  
  sendBtn.disabled = count === 0 || count > 1000;
}

function updateMessageStatus(status) {
  const statusElement = document.getElementById('messageStatus');
  if (statusElement) {
    statusElement.textContent = status;
    
    setTimeout(() => {
      statusElement.textContent = 'Ready';
    }, 3000);
  }
}

// ========================================
// TYPING INDICATOR
// ========================================

function setupTypingIndicator() {
  // Typing indicator is handled by socket events
}

function handleTyping() {
  if (!socket || !currentChatCollege) return;
  
  const now = Date.now();
  if (now - lastTypingEmit > 3000) {
    socket.emit('typing_start', { college: currentChatCollege, user: currentUser });
    lastTypingEmit = now;
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing_stop', { college: currentChatCollege, user: currentUser });
  }, 3000);
}

function handleTypingStart(data) {
  if (data.college !== currentChatCollege || data.user.id === currentUser.id) return;
  
  typingUsers.add(data.user.name);
  updateTypingIndicator();
}

function handleTypingStop(data) {
  if (data.college !== currentChatCollege || data.user.id === currentUser.id) return;
  
  typingUsers.delete(data.user.name);
  updateTypingIndicator();
}

function updateTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  const typingText = document.getElementById('typingText');
  
  if (!indicator || !typingText) return;
  
  if (typingUsers.size > 0) {
    const names = Array.from(typingUsers);
    let text = '';
    
    if (names.length === 1) {
      text = `${names[0]} is typing...`;
    } else if (names.length === 2) {
      text = `${names[0]} and ${names[1]} are typing...`;
    } else {
      text = `${names.length} people are typing...`;
    }
    
    typingText.textContent = text;
    indicator.style.display = 'flex';
  } else {
    indicator.style.display = 'none';
  }
}

// ========================================
// EMOJI PICKER
// ========================================

function toggleEmojiPicker() {
  const modal = document.getElementById('emojiPickerModal');
  if (!modal) return;
  
  modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
  
  if (modal.style.display === 'block') {
    loadEmojiCategory('smileys');
  }
}

function loadEmojiCategory(category) {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const emojis = emojiCategories[category] || [];
  emojis.forEach(emoji => {
    const button = document.createElement('button');
    button.textContent = emoji;
    button.onclick = () => insertEmoji(emoji);
    grid.appendChild(button);
  });
}

function showEmojiCategory(category) {
  // Update active category button
  document.querySelectorAll('.emoji-category').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  loadEmojiCategory(category);
}

function insertEmoji(emoji) {
  const input = document.getElementById('modernChatInput');
  if (!input) return;
  
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const text = input.value;
  
  input.value = text.substring(0, start) + emoji + text.substring(end);
  input.selectionStart = input.selectionEnd = start + emoji.length;
  input.focus();
  
  toggleEmojiPicker();
  updateCharCount();
}

// ========================================
// MEDIA UPLOAD
// ========================================

function toggleMediaUpload() {
  const modal = document.getElementById('mediaUploadModal');
  if (!modal) return;
  
  modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
}

function selectMediaUpload(type) {
  const input = document.getElementById('mediaFileInput');
  if (!input) return;
  
  input.accept = {
    'image': 'image/*',
    'video': 'video/*',
    'audio': 'audio/*',
    'document': '.pdf,.doc,.docx,.txt'
  }[type] || '*/*';
  
  input.click();
}

function handleMediaFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const preview = document.getElementById('mediaPreview');
  if (!preview) return;
  
  preview.innerHTML = '';
  
  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '100%';
    img.style.maxHeight = '200px';
    img.style.borderRadius = '8px';
    preview.appendChild(img);
  } else {
    const info = document.createElement('div');
    info.innerHTML = `
      <div>📄 ${file.name}</div>
      <div>Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
      <div>Type: ${file.type}</div>
    `;
    preview.appendChild(info);
  }
  
  // Auto-send the media
  const mediaType = file.type.split('/')[0];
  sendMediaMessage(file, mediaType);
}

function closeMediaUpload() {
  const modal = document.getElementById('mediaUploadModal');
  const input = document.getElementById('mediaFileInput');
  const preview = document.getElementById('mediaPreview');
  
  if (modal) modal.style.display = 'none';
  if (input) input.value = '';
  if (preview) preview.innerHTML = '<span>Preview will appear here</span>';
}

function viewMedia(url, type) {
  // Create modal to view media
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.style.maxWidth = '90%';
  content.style.maxHeight = '90%';
  content.style.background = 'rgba(15, 20, 35, 0.95)';
  content.style.borderRadius = '12px';
  content.style.padding = '20px';
  
  if (type === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '70vh';
    img.style.borderRadius = '8px';
    content.appendChild(img);
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    color: white;
    font-size: 16px;
    cursor: pointer;
  `;
  closeBtn.onclick = () => modal.remove();
  
  content.appendChild(closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

// ========================================
// CHAT SEARCH
// ========================================

function toggleChatSearch() {
  const searchBar = document.getElementById('chatSearchBar');
  if (!searchBar) return;
  
  searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
  
  if (searchBar.style.display === 'block') {
    const searchInput = document.getElementById('chatSearchInput');
    if (searchInput) searchInput.focus();
  }
}

function searchChatMessages() {
  const query = document.getElementById('chatSearchInput').value.toLowerCase();
  const messages = document.querySelectorAll('.chat-message');
  
  messages.forEach(message => {
    const bubble = message.querySelector('.message-bubble');
    if (!bubble) return;
    
    const content = bubble.textContent.toLowerCase();
    
    if (content.includes(query)) {
      message.style.display = 'flex';
      highlightText(bubble, query);
    } else {
      message.style.display = 'none';
    }
  });
}

function clearChatSearch() {
  const searchInput = document.getElementById('chatSearchInput');
  if (!searchInput) return;
  
  searchInput.value = '';
  
  document.querySelectorAll('.chat-message').forEach(message => {
    message.style.display = 'flex';
    const bubble = message.querySelector('.message-bubble');
    if (bubble) {
      bubble.innerHTML = bubble.textContent;
    }
  });
}

function highlightText(element, query) {
  const text = element.textContent;
  const regex = new RegExp(`(${query})`, 'gi');
  element.innerHTML = text.replace(regex, '<mark>$1</mark>');
}

// ========================================
// CHAT INFO PANEL
// ========================================

function toggleChatInfo() {
  const panel = document.getElementById('chatInfoPanel');
  if (!panel) return;
  
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  
  if (panel.style.display === 'block') {
    loadChatInfo();
  }
}

function loadChatInfo() {
  const totalMessagesEl = document.getElementById('totalMessages');
  const activeUsersEl = document.getElementById('activeUsers');
  const chatCollegeInfoEl = document.getElementById('chatCollegeInfo');
  
  if (totalMessagesEl) totalMessagesEl.textContent = chatMessages.length;
  if (activeUsersEl) activeUsersEl.textContent = onlineUsers.size;
  if (chatCollegeInfoEl) chatCollegeInfoEl.textContent = currentChatCollege || '-';
}

function closeChatInfo() {
  const panel = document.getElementById('chatInfoPanel');
  if (panel) panel.style.display = 'none';
}

// ========================================
// REACTIONS SYSTEM
// ========================================

function setupReactionSystem() {
  // Reactions are handled by socket events
}

async function toggleReaction(messageId, emoji) {
  try {
    await apiCall(`/api/community/messages/${messageId}/react`, 'POST', {
      emoji: emoji
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
  }
}

// ========================================
// CONNECTION MONITOR
// ========================================

function setupConnectionMonitor() {
  // Connection monitoring is handled by socket events
}

function showConnectionBanner() {
  const banner = document.getElementById('connectionBanner');
  const statusText = document.getElementById('connectionStatusText');
  
  if (banner && statusText) {
    statusText.textContent = 'Reconnecting...';
    banner.style.display = 'block';
  }
}

function hideConnectionBanner() {
  const banner = document.getElementById('connectionBanner');
  if (banner) banner.style.display = 'none';
}

// ========================================
// MESSAGE ACTIONS
// ========================================

function setupMessageActions() {
  // Message actions are handled by individual functions
}

function copyMessage(messageId) {
  const message = chatMessages.find(m => m.id === messageId);
  if (message) {
    navigator.clipboard.writeText(message.content);
    showNotification('Message copied', 'success');
  }
}

function replyToMessage(messageId) {
  const message = chatMessages.find(m => m.id === messageId);
  if (message) {
    const input = document.getElementById('modernChatInput');
    if (input) {
      input.value = `@${message.sender_name}: `;
      input.focus();
    }
  }
}

async function deleteMessage(messageId) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  
  try {
    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');
    
    // Remove from UI
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.remove();
    }
    
    // Remove from array
    chatMessages = chatMessages.filter(m => m.id !== messageId);
    
    showNotification('Message deleted', 'success');
  } catch (error) {
    console.error('Error deleting message:', error);
    showNotification('Failed to delete message', 'error');
  }
}

// ========================================
// SCROLL MANAGEMENT
// ========================================

function setupInfiniteScroll() {
  const messagesContainer = document.getElementById('modernChatMessages');
  if (!messagesContainer) return;
  
  messagesContainer.addEventListener('scroll', function() {
    const scrollTop = messagesContainer.scrollTop;
    const scrollHeight = messagesContainer.scrollHeight;
    const clientHeight = messagesContainer.clientHeight;
    
    // Show/hide scroll to bottom button
    const scrollBtn = document.getElementById('scrollToBottom');
    if (scrollBtn) {
      if (scrollTop < scrollHeight - clientHeight - 100) {
        scrollBtn.style.display = 'flex';
      } else {
        scrollBtn.style.display = 'none';
      }
    }
    
    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasMoreMessages) {
      loadMoreMessages();
    }
  });
}

function scrollToBottom() {
  const messagesContainer = document.getElementById('modernChatMessages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    hideScrollToBottomButton();
  }
}

function scrollToChatBottom() {
  scrollToBottom();
}

function showScrollToBottomButton() {
  const button = document.getElementById('scrollToBottom');
  if (button) button.style.display = 'flex';
}

function hideScrollToBottomButton() {
  const button = document.getElementById('scrollToBottom');
  if (button) button.style.display = 'none';
}

function showNewMessageIndicator() {
  const indicator = document.querySelector('.new-message-indicator');
  if (indicator) indicator.style.display = 'block';
}

async function loadMoreMessages() {
  if (!hasMoreMessages || !currentChatCollege) return;
  
  try {
    const response = await apiCall(`/api/community/messages?college=${currentChatCollege}&page=${currentMessagePage}`, 'GET');
    
    if (response.messages && response.messages.length > 0) {
      chatMessages.unshift(...response.messages);
      prependMessages(response.messages);
      hasMoreMessages = response.messages.length === ITEMS_PER_PAGE;
      currentMessagePage++;
    }
  } catch (error) {
    console.error('Error loading more messages:', error);
  }
}

// ========================================
// MESSAGE OPTIMIZATION
// ========================================

function setupMessageOptimization() {
  // Optimize message rendering for better performance
}

// ========================================
// SOCKET EVENT HANDLERS
// ========================================

function handleNewMessage(message) {
  if (message.college !== currentChatCollege) return;
  
  chatMessages.push(message);
  const messageElement = createMessageElement(message);
  const container = document.getElementById('chatMessagesContainer');
  if (container) {
    container.appendChild(messageElement);
    scrollToBottom();
    showNewMessageIndicator();
  }
}

function handleMessageReaction(data) {
  if (data.college !== currentChatCollege) return;
  
  // Update reaction display
  const messageElement = document.querySelector(`[data-message-id="${data.messageId}"]`);
  if (messageElement) {
    const existingReactionBar = messageElement.querySelector('.reaction-bar');
    if (existingReactionBar) {
      existingReactionBar.remove();
    }
    
    if (data.reactions && data.reactions.length > 0) {
      const reactionBar = createReactionBar(data.reactions, data.messageId);
      messageElement.querySelector('.message-content').appendChild(reactionBar);
    }
  }
}

function handleUserJoined(data) {
  if (data.college !== currentChatCollege) return;
  
  onlineUsers.add(data.user.name);
  updateOnlineCount();
}

function handleUserLeft(data) {
  if (data.college !== currentChatCollege) return;
  
  onlineUsers.delete(data.user.name);
  updateOnlineCount();
}

function handleOnlineUsers(data) {
  if (data.college !== currentChatCollege) return;
  
  onlineUsers = new Set(data.users.map(u => u.name));
  updateOnlineCount();
}

function updateOnlineCount() {
  const onlineCountEl = document.getElementById('chatOnlineCount');
  if (onlineCountEl) {
    onlineCountEl.textContent = onlineUsers.size;
  }
}
// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT PART 3: COMMUNITIES & POSTS
// ========================================

// ========================================
// COLLEGES SECTION
// ========================================

async function loadColleges() {
  try {
    const response = await apiCall('/api/colleges');
    renderColleges(response.colleges || []);
  } catch (error) {
    console.error('Error loading colleges:', error);
    showNotification('Failed to load colleges', 'error');
  }
}

function renderColleges(colleges) {
  const container = document.getElementById('collegesContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (colleges.length === 0) {
    container.innerHTML = `
      <div class="no-colleges">
        <p>No colleges found</p>
      </div>
    `;
    return;
  }
  
  colleges.forEach(college => {
    const collegeElement = createCollegeElement(college);
    container.appendChild(collegeElement);
  });
}

function createCollegeElement(college) {
  const collegeDiv = document.createElement('div');
  collegeDiv.className = 'college-card';
  collegeDiv.innerHTML = `
    <div class="college-header">
      <div class="college-logo">${college.name ? college.name[0].toUpperCase() : '?'}</div>
      <div class="college-info">
        <h3>${college.name || 'Unknown College'}</h3>
        <p>${college.location || 'Location not specified'}</p>
      </div>
    </div>
    <div class="college-stats">
      <div class="stat">
        <span class="stat-number">${college.student_count || 0}</span>
        <span class="stat-label">Students</span>
      </div>
      <div class="stat">
        <span class="stat-number">${college.online_count || 0}</span>
        <span class="stat-label">Online</span>
      </div>
    </div>
    <div class="college-actions">
      <button class="join-btn" onclick="joinCollege('${college.id}', '${college.name}')">
        Join Community
      </button>
    </div>
  `;
  
  return collegeDiv;
}

async function joinCollege(collegeId, collegeName) {
  try {
    const response = await apiCall('/api/colleges/join', 'POST', {
      college_id: collegeId
    });
    
    if (response.success) {
      showNotification(`Joined ${collegeName} community!`, 'success');
      joinCollegeChat(collegeName);
    }
  } catch (error) {
    console.error('Error joining college:', error);
    showNotification('Failed to join college', 'error');
  }
}

function searchColleges() {
  const searchInput = document.getElementById('collegeSearchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase();
  const collegeCards = document.querySelectorAll('.college-card');
  
  collegeCards.forEach(card => {
    const collegeName = card.querySelector('h3').textContent.toLowerCase();
    const collegeLocation = card.querySelector('p').textContent.toLowerCase();
    
    if (collegeName.includes(query) || collegeLocation.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ========================================
// POST CREATION
// ========================================

function showPostCreator() {
  const modal = document.getElementById('postCreatorModal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  resetPostCreator();
}

function closePostCreator() {
  const modal = document.getElementById('postCreatorModal');
  if (modal) modal.style.display = 'none';
}

function resetPostCreator() {
  const content = document.getElementById('postContent');
  const mediaPreview = document.getElementById('postMediaPreview');
  
  if (content) content.value = '';
  if (mediaPreview) mediaPreview.innerHTML = '';
  
  selectedFiles = [];
  previewUrls = [];
  selectedMusic = null;
  selectedStickers = [];
}

function selectPostType(type) {
  const buttons = document.querySelectorAll('.post-type-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  const mediaArea = document.getElementById('mediaUploadArea');
  if (!mediaArea) return;
  
  if (type === 'image' || type === 'video' || type === 'audio') {
    mediaArea.style.display = 'block';
    setupMediaUpload(type);
  } else {
    mediaArea.style.display = 'none';
  }
}

function setupMediaUpload(type) {
  const input = document.getElementById('postMediaInput');
  if (!input) return;
  
  input.accept = {
    'image': 'image/*',
    'video': 'video/*',
    'audio': 'audio/*'
  }[type] || '*/*';
}

function handlePostMediaSelect(event) {
  const files = Array.from(event.target.files);
  selectedFiles = selectedFiles.concat(files);
  
  const preview = document.getElementById('postMediaPreview');
  if (!preview) return;
  
  files.forEach(file => {
    const previewElement = createMediaPreview(file);
    preview.appendChild(previewElement);
  });
}

function createMediaPreview(file) {
  const previewDiv = document.createElement('div');
  previewDiv.className = 'media-preview-item';
  
  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';
    img.style.borderRadius = '8px';
    previewDiv.appendChild(img);
  } else {
    const info = document.createElement('div');
    info.innerHTML = `
      <div>📄 ${file.name}</div>
      <div>${(file.size / 1024 / 1024).toFixed(2)} MB</div>
    `;
    previewDiv.appendChild(info);
  }
  
  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255, 0, 0, 0.8);
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    color: white;
    font-size: 12px;
    cursor: pointer;
  `;
  removeBtn.onclick = () => {
    selectedFiles = selectedFiles.filter(f => f !== file);
    previewDiv.remove();
  };
  
  previewDiv.style.position = 'relative';
  previewDiv.appendChild(removeBtn);
  
  return previewDiv;
}

function addEmoji() {
  // Simple emoji picker for post creator
  const commonEmojis = ['😀', '😍', '🎉', '❤️', '👍', '🔥', '💯', '✨'];
  const emoji = prompt('Choose an emoji:\n' + commonEmojis.join(' '));
  
  if (emoji && commonEmojis.includes(emoji)) {
    const content = document.getElementById('postContent');
    if (content) {
      content.value += emoji;
      content.focus();
    }
  }
}

function addHashtag() {
  const content = document.getElementById('postContent');
  if (content) {
    content.value += ' #';
    content.focus();
  }
}

function addMention() {
  const content = document.getElementById('postContent');
  if (content) {
    content.value += '@';
    content.focus();
  }
}

function addLocation() {
  const location = prompt('Enter location:');
  if (location) {
    const content = document.getElementById('postContent');
    if (content) {
      content.value += ` 📍 ${location}`;
      content.focus();
    }
  }
}

async function publishPost() {
  const content = document.getElementById('postContent');
  const audience = document.getElementById('postAudience');
  const allowComments = document.getElementById('allowComments');
  const allowReactions = document.getElementById('allowReactions');
  
  if (!content || !content.value.trim()) {
    showNotification('Please add some content to your post', 'error');
    return;
  }
  
  try {
    const postData = {
      content: content.value.trim(),
      audience: audience ? audience.value : 'public',
      allow_comments: allowComments ? allowComments.checked : true,
      allow_reactions: allowReactions ? allowReactions.checked : true
    };
    
    // Handle media files
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      Object.keys(postData).forEach(key => {
        formData.append(key, postData[key]);
      });
      
      const token = localStorage.getItem('vibexpert_token');
      const response = await fetch(`${API_URL}/api/posts/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        showNotification('Post published successfully!', 'success');
        closePostCreator();
        loadSectionData('posts');
      } else {
        throw new Error('Failed to publish post');
      }
    } else {
      const response = await apiCall('/api/posts/create', 'POST', postData);
      
      if (response.success) {
        showNotification('Post published successfully!', 'success');
        closePostCreator();
        loadSectionData('posts');
      }
    }
  } catch (error) {
    console.error('Error publishing post:', error);
    showNotification('Failed to publish post', 'error');
  }
}

async function saveDraft() {
  const content = document.getElementById('postContent');
  if (!content || !content.value.trim()) {
    showNotification('Nothing to save', 'error');
    return;
  }
  
  try {
    const draftData = {
      content: content.value.trim(),
      files: selectedFiles.map(f => f.name),
      created_at: new Date().toISOString()
    };
    
    const drafts = JSON.parse(localStorage.getItem('post_drafts') || '[]');
    drafts.push(draftData);
    localStorage.setItem('post_drafts', JSON.stringify(drafts));
    
    showNotification('Draft saved', 'success');
  } catch (error) {
    console.error('Error saving draft:', error);
    showNotification('Failed to save draft', 'error');
  }
}

function viewDrafts() {
  const drafts = JSON.parse(localStorage.getItem('post_drafts') || '[]');
  
  if (drafts.length === 0) {
    showNotification('No drafts found', 'info');
    return;
  }
  
  // Show drafts modal or list
  showDraftsModal(drafts);
}

function showDraftsModal(drafts) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  content.innerHTML = `
    <div class="modal-header">
      <h3>Your Drafts</h3>
      <button class="close-modal-btn" onclick="this.closest('.modal').remove()">✕</button>
    </div>
    <div class="modal-body">
      ${drafts.map((draft, index) => `
        <div class="draft-item" style="border: 1px solid #333; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
          <p>${draft.content.substring(0, 100)}${draft.content.length > 100 ? '...' : ''}</p>
          <small>${new Date(draft.created_at).toLocaleString()}</small>
          <div style="margin-top: 10px;">
            <button onclick="loadDraft(${index})" style="background: #4f74a3; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px;">Edit</button>
            <button onclick="deleteDraft(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px;">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

function loadDraft(index) {
  const drafts = JSON.parse(localStorage.getItem('post_drafts') || '[]');
  const draft = drafts[index];
  
  if (draft) {
    const content = document.getElementById('postContent');
    if (content) {
      content.value = draft.content;
    }
    
    showPostCreator();
    document.querySelector('.modal').remove();
  }
}

function deleteDraft(index) {
  const drafts = JSON.parse(localStorage.getItem('post_drafts') || '[]');
  drafts.splice(index, 1);
  localStorage.setItem('post_drafts', JSON.stringify(drafts));
  
  // Refresh drafts modal
  document.querySelector('.modal').remove();
  viewDrafts();
}

// ========================================
// FEED LOADING & RENDERING
// ========================================

async function loadHomeFeed() {
  try {
    const response = await apiCall('/api/posts/feed');
    renderFeed(response.posts || []);
  } catch (error) {
    console.error('Error loading feed:', error);
    renderFeed([]);
  }
}

async function loadMoreHomeFeed() {
  try {
    const response = await apiCall(`/api/posts/feed?page=${currentPage + 1}`);
    const morePosts = response.posts || [];
    
    if (morePosts.length > 0) {
      currentPage++;
      appendToFeed(morePosts);
    }
  } catch (error) {
    console.error('Error loading more feed:', error);
  }
}

function renderFeed(posts) {
  const feedContainer = document.getElementById('homeFeed');
  if (!feedContainer) return;
  
  feedContainer.innerHTML = '';
  
  if (posts.length === 0) {
    feedContainer.innerHTML = `
      <div class="empty-feed">
        <p>No posts yet. Be the first to share something!</p>
        <button class="create-post-btn" onclick="showPostCreator()">
          Create Post
        </button>
      </div>
    `;
    return;
  }
  
  posts.forEach(post => {
    const postElement = createPostElement(post);
    feedContainer.appendChild(postElement);
  });
}

function appendToFeed(posts) {
  const feedContainer = document.getElementById('homeFeed');
  if (!feedContainer) return;
  
  posts.forEach(post => {
    const postElement = createPostElement(post);
    feedContainer.appendChild(postElement);
  });
}

function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post';
  postDiv.dataset.postId = post.id;
  
  const isOwn = post.author_id === currentUser.id;
  
  postDiv.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${post.author_name ? post.author_name[0].toUpperCase() : '?'}</div>
      <div class="post-info">
        <div class="post-author">${post.author_name || 'Anonymous'}</div>
        <div class="post-time">${formatMessageTime(post.created_at)}</div>
      </div>
      <div class="post-menu">
        <button class="menu-btn" onclick="togglePostMenu('${post.id}')">⋮</button>
      </div>
    </div>
    <div class="post-content">
      ${post.content ? `<p>${post.content}</p>` : ''}
      ${post.media_url ? createPostMedia(post) : ''}
    </div>
    <div class="post-stats">
      <button class="stat-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
        <span class="stat-icon">❤️</span>
        <span class="stat-count">${post.likes_count || 0}</span>
      </button>
      <button class="stat-btn" onclick="toggleComments('${post.id}')">
        <span class="stat-icon">💬</span>
        <span class="stat-count">${post.comments_count || 0}</span>
      </button>
      <button class="stat-btn" onclick="sharePost('${post.id}')">
        <span class="stat-icon">🔄</span>
      </button>
    </div>
    <div class="post-comments" id="comments-${post.id}" style="display: none;">
      <div class="comments-container" id="comments-container-${post.id}"></div>
      <div class="comment-input">
        <input type="text" placeholder="Add a comment..." id="comment-input-${post.id}">
        <button onclick="addComment('${post.id}')">Send</button>
      </div>
    </div>
  `;
  
  return postDiv;
}

function createPostMedia(post) {
  let mediaHtml = '';
  
  if (post.media_type === 'image') {
    mediaHtml = `<img src="${post.media_url}" alt="Post image" style="max-width: 100%; border-radius: 8px;" onclick="viewMedia('${post.media_url}', 'image')">`;
  } else if (post.media_type === 'video') {
    mediaHtml = `<video src="${post.media_url}" controls style="max-width: 100%; border-radius: 8px;"></video>`;
  } else if (post.media_type === 'audio') {
    mediaHtml = `<audio src="${post.media_url}" controls style="width: 100%;"></audio>`;
  } else {
    mediaHtml = `<a href="${post.media_url}" target="_blank" style="display: inline-block; padding: 8px 12px; background: rgba(79, 116, 163, 0.2); border-radius: 6px; text-decoration: none; color: #4f74a3;">📄 View Document</a>`;
  }
  
  return `<div class="post-media">${mediaHtml}</div>`;
}

function togglePostMenu(postId) {
  // Show post menu with options like edit, delete, report
  const menu = document.createElement('div');
  menu.className = 'post-menu-dropdown';
  menu.innerHTML = `
    <button onclick="editPost('${postId}')">Edit</button>
    <button onclick="deletePost('${postId}')">Delete</button>
    <button onclick="reportPost('${postId}')">Report</button>
  `;
  
  // Position menu near the button
  const button = event.target;
  const rect = button.getBoundingClientRect();
  menu.style.position = 'absolute';
  menu.style.top = rect.bottom + 'px';
  menu.style.right = '0';
  menu.style.background = 'rgba(15, 20, 35, 0.95)';
  menu.style.border = '1px solid rgba(79, 116, 163, 0.2)';
  menu.style.borderRadius = '8px';
  menu.style.padding = '5px 0';
  menu.style.zIndex = '1000';
  
  menu.querySelectorAll('button').forEach(btn => {
    btn.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 16px;
      border: none;
      background: none;
      color: white;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
    `;
    btn.onmouseover = () => btn.style.background = 'rgba(79, 116, 163, 0.2)';
    btn.onmouseout = () => btn.style.background = 'none';
  });
  
  document.body.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

async function editPost(postId) {
  try {
    const response = await apiCall(`/api/posts/${postId}`);
    const post = response.post;
    
    if (post) {
      showPostCreator();
      document.getElementById('postContent').value = post.content;
      // Load media if any
    }
  } catch (error) {
    console.error('Error loading post for editing:', error);
    showNotification('Failed to load post', 'error');
  }
}

async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  
  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    
    // Remove from UI
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      postElement.remove();
    }
    
    showNotification('Post deleted', 'success');
  } catch (error) {
    console.error('Error deleting post:', error);
    showNotification('Failed to delete post', 'error');
  }
}

function reportPost(postId) {
  const reason = prompt('Why are you reporting this post?');
  if (reason) {
    // Send report to server
    showNotification('Post reported. Thank you for helping keep the community safe.', 'success');
  }
}

async function toggleLike(postId) {
  try {
    const response = await apiCall(`/api/posts/${postId}/like`, 'POST');
    
    if (response.success) {
      const likeBtn = document.querySelector(`[data-post-id="${postId}"] .stat-btn`);
      const likeCount = likeBtn.querySelector('.stat-count');
      
      if (response.liked) {
        likeBtn.classList.add('liked');
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
      } else {
        likeBtn.classList.remove('liked');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (!commentsSection) return;
  
  if (commentsSection.style.display === 'none') {
    commentsSection.style.display = 'block';
    loadComments(postId);
  } else {
    commentsSection.style.display = 'none';
  }
}

async function loadComments(postId) {
  try {
    const response = await apiCall(`/api/posts/${postId}/comments`);
    renderComments(postId, response.comments || []);
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

function renderComments(postId, comments) {
  const container = document.getElementById(`comments-container-${postId}`);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (comments.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666;">No comments yet</p>';
    return;
  }
  
  comments.forEach(comment => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${comment.author_name}</span>
        <span class="comment-time">${formatMessageTime(comment.created_at)}</span>
      </div>
      <div class="comment-content">${comment.content}</div>
    `;
    container.appendChild(commentDiv);
  });
}

async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input || !input.value.trim()) return;
  
  try {
    const response = await apiCall(`/api/posts/${postId}/comments`, 'POST', {
      content: input.value.trim()
    });
    
    if (response.success) {
      input.value = '';
      loadComments(postId);
      
      // Update comment count
      const commentBtn = document.querySelector(`[data-post-id="${postId}"] .stat-btn:nth-child(2) .stat-count`);
      if (commentBtn) {
        commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
      }
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    showNotification('Failed to add comment', 'error');
  }
}

function sharePost(postId) {
  // Copy post link to clipboard
  const postUrl = `${window.location.origin}/post/${postId}`;
  navigator.clipboard.writeText(postUrl);
  showNotification('Post link copied to clipboard!', 'success');
}

// ========================================
// MY POSTS SECTION
// ========================================

async function loadMyPosts() {
  try {
    const response = await apiCall('/api/posts/my');
    renderMyPosts(response.posts || []);
  } catch (error) {
    console.error('Error loading my posts:', error);
    renderMyPosts([]);
  }
}

async function loadMoreMyPosts() {
  try {
    const response = await apiCall(`/api/posts/my?page=${currentPage + 1}`);
    const morePosts = response.posts || [];
    
    if (morePosts.length > 0) {
      currentPage++;
      appendToFeed(morePosts);
    }
  } catch (error) {
    console.error('Error loading more my posts:', error);
  }
}

function renderMyPosts(posts) {
  const container = document.getElementById('myPostsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-posts">
        <p>You haven't created any posts yet.</p>
        <button class="create-post-btn" onclick="showPostCreator()">
          Create Your First Post
        </button>
      </div>
    `;
    return;
  }
  
  posts.forEach(post => {
    const postElement = createPostElement(post);
    container.appendChild(postElement);
  });
}

// ========================================
// REALVIBE SECTION
// ========================================

async function loadRealVibe() {
  try {
    const response = await apiCall('/api/posts/trending');
    renderRealVibe(response.posts || []);
  } catch (error) {
    console.error('Error loading trending posts:', error);
    renderRealVibe([]);
  }
}

async function loadMoreRealVibe() {
  try {
    const response = await apiCall(`/api/posts/trending?page=${currentPage + 1}`);
    const morePosts = response.posts || [];
    
    if (morePosts.length > 0) {
      currentPage++;
      appendToFeed(morePosts);
    }
  } catch (error) {
    console.error('Error loading more trending posts:', error);
  }
}

function renderRealVibe(posts) {
  const container = document.getElementById('realvibeFeed');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-trending">
        <p>No trending content right now.</p>
      </div>
    `;
    return;
  }
  
  posts.forEach(post => {
    const postElement = createPostElement(post);
    container.appendChild(postElement);
  });
}

function filterRealVibe(filter) {
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  // Load filtered content
  loadFilteredRealVibe(filter);
}

async function loadFilteredRealVibe(filter) {
  try {
    const response = await apiCall(`/api/posts/trending?filter=${filter}`);
    renderRealVibe(response.posts || []);
  } catch (error) {
    console.error('Error loading filtered trending posts:', error);
  }
}
// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT PART 4: REWARDS & FINAL FUNCTIONS
// ========================================

// ========================================
// REWARDS SYSTEM
// ========================================

async function loadRewards() {
  try {
    const response = await apiCall('/api/rewards');
    renderRewards(response);
  } catch (error) {
    console.error('Error loading rewards:', error);
    renderRewards({
      totalPoints: 0,
      achievementsCount: 0,
      currentStreak: 0,
      currentRank: 'Beginner',
      dailyTasks: rewardsData.dailyTasks,
      achievements: rewardsData.achievements
    });
  }
}

function renderRewards(data) {
  // Update stats
  updateRewardStats(data);
  
  // Render daily tasks
  renderDailyTasks(data.dailyTasks || rewardsData.dailyTasks);
  
  // Render achievements
  renderAchievements(data.achievements || rewardsData.achievements);
}

function updateRewardStats(data) {
  const totalPointsEl = document.getElementById('totalPoints');
  const achievementsCountEl = document.getElementById('achievementsCount');
  const currentStreakEl = document.getElementById('currentStreak');
  const currentRankEl = document.getElementById('currentRank');
  
  if (totalPointsEl) totalPointsEl.textContent = data.totalPoints || 0;
  if (achievementsCountEl) achievementsCountEl.textContent = data.achievementsCount || 0;
  if (currentStreakEl) currentStreakEl.textContent = data.currentStreak || 0;
  if (currentRankEl) currentRankEl.textContent = data.currentRank || 'Beginner';
}

function renderDailyTasks(tasks) {
  const container = document.getElementById('dailyTasksGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    container.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const taskDiv = document.createElement('div');
  taskDiv.className = `task-card ${task.completed ? 'completed' : ''}`;
  taskDiv.innerHTML = `
    <div class="task-icon">${task.icon}</div>
    <div class="task-info">
      <h4>${task.title}</h4>
      <p>${task.desc}</p>
    </div>
    <div class="task-reward">+${task.reward} pts</div>
    <div class="task-status">
      ${task.completed ? 
        '<span class="completed-badge">✓ Completed</span>' : 
        `<button class="claim-btn" onclick="completeTask('${task.id}')">Complete</button>`
      }
    </div>
  `;
  
  return taskDiv;
}

async function completeTask(taskId) {
  try {
    const response = await apiCall('/api/tasks/complete', 'POST', {
      task_id: taskId
    });
    
    if (response.success) {
      showNotification(`Task completed! +${response.points} points`, 'success');
      loadRewards(); // Refresh rewards data
    }
  } catch (error) {
    console.error('Error completing task:', error);
    showNotification('Failed to complete task', 'error');
  }
}

function renderAchievements(achievements) {
  const container = document.getElementById('achievementsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  achievements.forEach(achievement => {
    const achievementElement = createAchievementElement(achievement);
    container.appendChild(achievementElement);
  });
}

function createAchievementElement(achievement) {
  const achievementDiv = document.createElement('div');
  achievementDiv.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
  achievementDiv.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-info">
      <h4>${achievement.title}</h4>
      <p>${achievement.desc}</p>
    </div>
    <div class="achievement-reward">+${achievement.reward} pts</div>
    <div class="achievement-status">
      ${achievement.unlocked ? 
        '<span class="unlocked-badge">🏆 Unlocked</span>' : 
        '<span class="locked-badge">🔒 Locked</span>'
      }
    </div>
  `;
  
  return achievementDiv;
}

// ========================================
// LIVE ACTIVITY NOTIFICATIONS
// ========================================

function updateLiveActivity(text) {
  const notif = document.getElementById('liveActivityNotif');
  const notifText = document.getElementById('notifText');
  
  if (notif && notifText) {
    notifText.textContent = text;
    notif.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notif.style.display = 'none';
    }, 5000);
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ========================================
// ANIMATION HELPERS
// ========================================

function animateValue(element, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();
  
  function updateValue(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const value = Math.floor(start + range * progress);
    element.textContent = formatNumber(value);
    
    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  }
  
  requestAnimationFrame(updateValue);
}

function animateCounter(selector, targetValue, duration = 2000) {
  const element = document.querySelector(selector);
  if (element) {
    animateValue(element, 0, targetValue, duration);
  }
}

// ========================================
// LOCAL STORAGE HELPERS
// ========================================

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

// ========================================
// ERROR HANDLING
// ========================================

function handleApiError(error, defaultMessage = 'An error occurred') {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  if (error.message) {
    message = error.message;
  } else if (error.status === 401) {
    message = 'Please log in again';
    logout();
  } else if (error.status === 403) {
    message = 'You do not have permission to perform this action';
  } else if (error.status === 404) {
    message = 'Resource not found';
  } else if (error.status >= 500) {
    message = 'Server error. Please try again later';
  }
  
  showNotification(message, 'error');
}

// ========================================
// VALIDATION HELPERS
// ========================================

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function validateUsername(username) {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
}

// ========================================
// DATE/TIME HELPERS
// ========================================

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ========================================
// URL HELPERS
// ========================================

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function updateQueryParam(name, value) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(name, value);
  
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

// ========================================
// DEVICE/PLATFORM HELPERS
// ========================================

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isTablet() {
  return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent);
}

function isDesktop() {
  return !isMobile() && !isTablet();
}

// ========================================
// ACCESSIBILITY HELPERS
// ========================================

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

function setFocus(element) {
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ========================================
// PERFORMANCE HELPERS
// ========================================

function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// ========================================
// THEME HELPERS
// ========================================

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function watchSystemTheme(callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addListener(callback);
  return () => mediaQuery.removeListener(callback);
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      focusSearchInput();
    }
    
    // Ctrl/Cmd + N for new post
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      showPostCreator();
    }
    
    // Ctrl/Cmd + / for help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      showKeyboardShortcuts();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

function focusSearchInput() {
  const searchInput = document.querySelector('#collegeSearchInput, #chatSearchInput, input[placeholder*="search"]');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

function showKeyboardShortcuts() {
  const shortcuts = [
    { key: 'Ctrl + K', description: 'Search' },
    { key: 'Ctrl + N', description: 'New Post' },
    { key: 'Ctrl + /', description: 'Show Shortcuts' },
    { key: 'Escape', description: 'Close Modal' },
    { key: 'Enter', description: 'Send Message' },
    { key: 'Shift + Enter', description: 'New Line in Chat' }
  ];
  
  let shortcutsHtml = '<h3>Keyboard Shortcuts</h3><ul>';
  shortcuts.forEach(shortcut => {
    shortcutsHtml += `<li><strong>${shortcut.key}:</strong> ${shortcut.description}</li>`;
  });
  shortcutsHtml += '</ul>';
  
  showNotification(shortcutsHtml, 'info', 5000);
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// ========================================
// INITIALIZATION HELPERS
// ========================================

function initializeAppFeatures() {
  setupKeyboardShortcuts();
  lazyLoadImages();
  loadTheme();
  
  // Preload critical images
  preloadImage('/api/user/avatar');
  
  // Initialize tooltips
  initializeTooltips();
  
  // Setup form validation
  setupFormValidation();
}

function initializeTooltips() {
  const tooltipElements = document.querySelectorAll('[title]');
  
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', function(e) {
      showTooltip(e.target, e.target.title);
    });
    
    element.addEventListener('mouseleave', function() {
      hideTooltip();
    });
  });
}

function showTooltip(element, text) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10000;
    pointer-events: none;
  `;
  
  document.body.appendChild(tooltip);
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

function setupFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });
}

function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      showFieldError(input, 'This field is required');
      isValid = false;
    } else {
      clearFieldError(input);
    }
  });
  
  return isValid;
}

function showFieldError(field, message) {
  clearFieldError(field);
  
  field.classList.add('error');
  
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
  `;
  
  field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorElement = field.parentNode.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
}

// ========================================
// FINAL INITIALIZATION
// ========================================

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeAppFeatures();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is hidden
    if (socket) {
      socket.emit('page_hidden');
    }
  } else {
    // Page is visible
    if (socket) {
      socket.emit('page_visible');
    }
    loadUserData(); // Refresh user data
  }
});

// Handle online/offline status
window.addEventListener('online', function() {
  showNotification('Connection restored', 'success');
  if (socket && !socket.connected) {
    socket.connect();
  }
});

window.addEventListener('offline', function() {
  showNotification('Connection lost', 'error');
});

// Handle beforeunload (page closing)
window.addEventListener('beforeunload', function(e) {
  if (socket) {
    socket.emit('user_leaving');
  }
});

// ========================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ========================================

// Make important functions globally accessible
window.VibeXpert = {
  // Chat functions
  joinCollegeChat,
  leaveCollegeChat,
  sendModernMessage,
  toggleEmojiPicker,
  toggleMediaUpload,
  
  // Post functions
  showPostCreator,
  publishPost,
  toggleLike,
  addComment,
  
  // Navigation
  showSection,
  toggleTheme,
  
  // Utility
  showNotification,
  formatMessageTime,
  
  // Rewards
  completeTask,
  
  // Authentication
  logout
};

// ========================================
// DEBUG HELPERS (Remove in production)
// ========================================

function debugLog(message, data = null) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[VibeXpert Debug]', message, data);
  }
}

// Add debug logging to important functions
const originalApiCall = window.apiCall;
window.apiCall = function(endpoint, method, data) {
  debugLog('API Call', { endpoint, method, data });
  return originalApiCall(endpoint, method, data);
};

// ========================================
// APP READY
// ========================================

debugLog('VibeXpert application initialized');

// Signal that the app is ready
window.dispatchEvent(new CustomEvent('vibexpert:ready'));
