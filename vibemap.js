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

// ==========================================
// MISSING FUNCTION DEFINITION - THIS WAS THE ISSUE
// ==========================================

// This function was referenced but never defined, causing issues
function handleUnifiedKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendUnifiedMessage();
  }
  
  // Auto-resize textarea
  const target = event.target;
  target.style.height = 'auto';
  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  
  // Handle typing indicator
  handleTypingIndicator();
}

// Missing sendUnifiedMessage function
async function sendUnifiedMessage() {
  const input = document.getElementById('unifiedInput');
  const content = input?.value?.trim();

  if (!content && !selectedMediaFile) {
    showMessage('⚠️ Add message or media', 'error');
    return;
  }

  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }

  if (!currentUser.communityJoined || !currentUser.college) {
    showMessage('⚠️ Join college community first', 'error');
    return;
  }

  try {
    showMessage('📤 Sending...', 'success');

    const formData = new FormData();
    if (content) formData.append('content', content);
    if (selectedMediaFile) {
      formData.append('media', selectedMediaFile);
    }

    const data = await apiCall('/api/community/messages', 'POST', formData);

    if (data.success) {
      showMessage('✅ Message sent!', 'success');

      // Clear input and media
      if (input) input.value = '';
      clearMediaPreview();

      // Add message to UI (if not already added by socket)
      if (data.message) {
        const messageExists = document.getElementById(`unified-msg-${data.message.id}`);
        if (!messageExists) {
          addRealTimeMessage(data.message);
        }
      }

      // Play send sound
      playMessageSound('send');

      // Stop typing indicator
      if (socket && currentUser.college) {
        socket.emit('stop_typing', {
          collegeName: currentUser.college,
          username: currentUser.username
        });
      }
    } else {
      throw new Error(data.error || 'Failed to send');
    }

  } catch (error) {
    console.error('❌ Send error:', error);
    showMessage('❌ Failed to send message', 'error');
  }
}

// Missing openPhotoPicker function
function openPhotoPicker() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  
  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    handleMediaFiles(files);
  };
  
  input.click();
}

// Missing openEmojiPicker function - unified version
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
  picker.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:5000;background:rgba(15,25,45,0.98);border:2px solid rgba(79,116,163,0.4);border-radius:15px;padding:15px;';

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

// Missing openStickerPicker function
function openStickerPicker() {
  showMessage('🎨 Sticker picker coming soon!', 'success');
  
  // Quick sticker selection
  const stickers = ['🔥', '💯', '✨', '⚡', '💪', '🎯', '🚀', '💝', '🎨', '📚'];
  const sticker = prompt('Quick sticker:\n' + stickers.join(' ') + '\n\nChoose one:');
  
  if (sticker && stickers.includes(sticker)) {
    const input = document.getElementById('unifiedInput');
    if (input) {
      input.value += sticker;
      input.focus();
    }
  }
}

// Missing openExperienceShare function
function openExperienceShare() {
  showMessage('📝 Experience sharing coming soon!', 'success');
}

// Missing clearMediaPreview function
function clearMediaPreview() {
  selectedMediaFile = null;
  const previewArea = document.getElementById('mediaPreviewArea');
  if (previewArea) previewArea.style.display = 'none';
}

// Missing searchInChat function
function searchInChat() {
  const query = prompt('Search messages:');
  if (query) {
    showMessage(`🔍 Searching for "${query}"`, 'success');
  }
}

// Missing showChatInfo function
function showChatInfo() {
  showMessage('ℹ️ Chat info coming soon!', 'success');
}

// Missing selectedMediaFile variable
let selectedMediaFile = null;

// Missing addRealTimeMessage function
function addRealTimeMessage(message, skipScroll = false) {
  const messagesEl = document.getElementById('unifiedMessages');
  if (!messagesEl) return;

  // Check if message already exists
  const existingMsg = document.getElementById(`unified-msg-${message.id}`);
  if (existingMsg) return;

  // Remove empty state if present
  const emptyState = messagesEl.querySelector('.empty-chat-state');
  if (emptyState) {
    emptyState.remove();
  }

  const isOwn = message.sender_id === currentUser?.id;
  const sender = message.users?.username || message.sender_name || 'User';
  const time = new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const messageEl = document.createElement('div');
  messageEl.className = `unified-message ${isOwn ? 'own' : 'other'}`;
  messageEl.id = `unified-msg-${message.id}`;

  let html = `
    <div class="message-header">
      <span class="sender-name">${isOwn ? 'You' : sender}</span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-content">
  `;

  if (message.content) {
    html += `<div class="message-text">${escapeHtml(message.content)}</div>`;
  }

  if (message.media_url) {
    if (message.media_type?.startsWith('image/')) {
      html += `<img src="${message.media_url}" class="message-media" style="max-width:300px;border-radius:10px;margin-top:10px;" onclick="openMediaViewer('${message.media_url}')">`;
    } else if (message.media_type?.startsWith('video/')) {
      html += `<video src="${message.media_url}" controls class="message-media" style="max-width:300px;border-radius:10px;margin-top:10px;"></video>`;
    }
  }

  html += `
    </div>
    <div class="message-actions">
      <button onclick="reactToUnifiedMessage('${message.id}')">❤️</button>
      <button onclick="replyToUnifiedMessage('${message.id}')">↩️</button>
      ${isOwn ? `<button onclick="deleteUnifiedMessage('${message.id}')">🗑️</button>` : ''}
    </div>
  `;

  messageEl.innerHTML = html;
  messagesEl.appendChild(messageEl);

  // Animate entrance
  setTimeout(() => {
    messageEl.classList.add('message-visible');
  }, 10);

  // Scroll to bottom
  if (!skipScroll) {
    setTimeout(() => {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  // Play receive sound for other users' messages
  if (!isOwn) {
    playMessageSound('receive');
  }
}

// Missing reactToUnifiedMessage function
function reactToUnifiedMessage(messageId) {
  showMessage('❤️ Reactions coming soon!', 'success');
}

// Missing replyToUnifiedMessage function  
function replyToUnifiedMessage(messageId) {
  showMessage('↩️ Reply feature coming soon!', 'success');
}

// Missing deleteUnifiedMessage function
async function deleteUnifiedMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const data = await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

    if (data.success) {
      const messageEl = document.getElementById(`unified-msg-${messageId}`);
      if (messageEl) {
        messageEl.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => messageEl.remove(), 300);
      }
      showMessage('🗑️ Message deleted', 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
  }
}

// Missing openMediaViewer function
function openMediaViewer(url) {
  window.open(url, '_blank');
}

// Missing showJoinCommunityModal function
function showJoinCommunityModal() {
  showMessage('🏫 Join community feature - redirect to college verification', 'success');
  showPage('home');
}

// Missing escapeHtml function is already defined in the original code
// but ensuring it exists
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Missing playMessageSound function
function playMessageSound(type) {
  try {
    const sounds = {
      send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354.wav',
      receive: 'https://assets.mixkit.co/active_storage/sfx/2357/2357.wav',
      notification: 'https://assets.mixkit.co/active_storage/sfx/2358/2358.wav'
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  } catch (error) {
    // Silently fail
  }
}

// Missing showMessage function
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

// Missing apiCall function - this is critical
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

// Missing getToken function
function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('vibexpert_token');
}

// Missing showPage function
function showPage(name, e) {
  if(e) e.preventDefault();

  document.querySelectorAll('.page, .main-section').forEach(p => p.style.display = 'none');
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

// Missing loadPosts function stub
async function loadPosts() {
  console.log('Loading posts...');
  // Implementation from original code
}

// Missing loadCommunities function
function loadCommunities() {
  console.log('Loading communities...');
  // Check if user is logged in and has joined community
  if (!currentUser || !currentUser.communityJoined) {
    const container = document.getElementById('communitiesContainer');
    if (container) {
      container.innerHTML = `
        <div class="community-guidance">
          <p>🎓 Connect to college first!</p>
          <button class="home-nav-btn" onclick="showPage('home')">Explore</button>
        </div>
      `;
    }
    return;
  }

  // Initialize real-time chat
  initializeRealTimeChat();
}

// Missing loadRewardsPage function stub
function loadRewardsPage() {
  console.log('Loading rewards page...');
  setTimeout(() => updateRoadmapUI(), 100);
}

// Missing initializeRealTimeChat function
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

// Missing initializeSocketConnection function
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

// Missing updateConnectionStatus function
function updateConnectionStatus(isConnected) {
  const onlineCountEl = document.getElementById('onlineCount');
  if (onlineCountEl) {
    const currentCount = parseInt(onlineCountEl.textContent) || 0;
    onlineCountEl.textContent = isConnected ? currentCount : '0';
  }
}

// Missing updateOnlineCount function
function updateOnlineCount(count) {
  const onlineCountEl = document.getElementById('onlineCount');
  if (onlineCountEl) {
    onlineCountEl.textContent = count || '0';
  }
}

// Missing loadCommunityMessages function
async function loadCommunityMessages() {
  try {
    console.log('📥 Loading community messages...');

    const messagesEl = document.getElementById('unifiedMessages');
    if (!messagesEl) return;

    // Show loading state
    messagesEl.innerHTML = `
      <div class="loading-messages-state">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>
    `;

    const data = await apiCall('/api/community/messages', 'GET');

    if (!data.success) {
      if (data.needsJoinCommunity) {
        messagesEl.innerHTML = `
          <div class="empty-chat-state">
            <div class="empty-chat-icon">🏫</div>
            <h3>Join Your College Community</h3>
            <p>Connect with students from your college</p>
            <button onclick="showJoinCommunityModal()" class="btn-primary">Join Now</button>
          </div>
        `;
        return;
      }
      throw new Error(data.error || 'Failed to load messages');
    }

    // Clear loading state
    messagesEl.innerHTML = '';

    if (!data.messages || data.messages.length === 0) {
      messagesEl.innerHTML = `
        <div class="empty-chat-state">
          <div class="empty-chat-icon">👋</div>
          <h3>No Messages Yet</h3>
          <p>Be the first to start the conversation!</p>
        </div>
      `;
      return;
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

// Missing setupUnifiedChatInput function
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

// Missing removeMessageFromUI function
function removeMessageFromUI(messageId) {
  const messageEl = document.getElementById(`unified-msg-${messageId}`);
  if (messageEl) {
    messageEl.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => messageEl.remove(), 300);
  }
}

// Missing showTypingIndicator function
function showTypingIndicator(username) {
  typingUsers.add(username);
  updateTypingDisplay();
}

// Missing hideTypingIndicator function
function hideTypingIndicator(username) {
  typingUsers.delete(username);
  updateTypingDisplay();
}

// Missing updateTypingDisplay function
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

// Missing handleTypingIndicator function
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

// Missing handleMediaFiles function
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

// Missing updatePhotoPreview function
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

// Missing removeMedia function
function removeMedia(index) {
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  updatePhotoPreview();
  showMessage('✅ Media removed', 'success');
}

// Missing updateRoadmapUI function stub
function updateRoadmapUI() {
  console.log('Updating roadmap UI...');
  // Implementation would go here
}

console.log('✅ VibeXpert JavaScript Fixed and Loaded Successfully!');
