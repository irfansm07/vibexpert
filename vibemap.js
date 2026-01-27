// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT WITH ALL FIXES
// ========================================

const API_URL = 'https://vibexpert-backend-main.onrender.com';

// Enhanced Sticker Library with GIFs and Trendy Content
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
    { id: 'monkey', emoji: '🐵', name: 'Monkey' },
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'panda', emoji: '🐼', name: 'Panda' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
    { id: 'dragon', emoji: '🐉', name: 'Dragon' }
  ],
  objects: [
    { id: 'balloon', emoji: '🎈', name: 'Balloon' },
    { id: 'gift', emoji: '🎁', name: 'Gift' },
    { id: 'camera', emoji: '📷', name: 'Camera' },
    { id: 'music', emoji: '🎵', name: 'Music' },
    { id: 'book', emoji: '📚', name: 'Book' },
    { id: 'computer', emoji: '💻', name: 'Computer' }
  ],
  gifs: [
    { id: 'dance', emoji: '🕺', name: 'Dance', type: 'gif' },
    { id: 'wave', emoji: '👋', name: 'Wave', type: 'gif' },
    { id: 'clap', emoji: '👏', name: 'Clap', type: 'gif' },
    { id: 'thumbs_up', emoji: '👍', name: 'Thumbs Up', type: 'gif' },
    { id: 'heart', emoji: '💖', name: 'Heart', type: 'gif' },
    { id: 'party', emoji: '🎉', name: 'Party', type: 'gif' }
  ],
  stickers: [
    { id: 'vibexpert_logo', emoji: '🎓', name: 'VibeXpert', type: 'sticker' },
    { id: 'study', emoji: '📖', name: 'Study Time', type: 'sticker' },
    { id: 'exam', emoji: '📝', name: 'Exam Mode', type: 'sticker' },
    { id: 'graduate', emoji: '🎓', name: 'Graduate', type: 'sticker' },
    { id: 'college', emoji: '🏫', name: 'College Life', type: 'sticker' },
    { id: 'friends', emoji: '👥', name: 'Friends', type: 'sticker' }
  ]
};

// Animal Avatar States - Dancing Monkeys
const animalAvatars = {
  email: { idle: '🐵', happy: '🕺', excited: '💃' },
  password: { idle: '🐒', happy: '🦍', excited: '🦧' },
  confirm: { idle: '🐵', happy: '🕺', excited: '💃' }
};

// Global Variables
let currentUser = null;
let emojiPickerVisible = false;
let currentEmojiCategory = 'emotions';

// Voice Recording Variables
let voiceRecorder = null;
let voiceRecordingStartTime = null;
let voiceRecordingTimer = null;
let voiceRecordingStream = null;
let voiceAudioChunks = [];
let isVoiceRecording = false;

// ========================================
// EMOJI PICKER FUNCTIONS
// ========================================

function toggleEmojiPicker() {
  const emojiPicker = document.getElementById('emojiPicker');
  emojiPickerVisible = !emojiPickerVisible;
  
  if (emojiPickerVisible) {
    emojiPicker.style.display = 'block';
    loadEmojiCategory(currentEmojiCategory);
  } else {
    emojiPicker.style.display = 'none';
  }
}

function showEmojiCategory(category) {
  currentEmojiCategory = category;
  const categoryButtons = document.querySelectorAll('.emoji-category');
  categoryButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  loadEmojiCategory(category);
}

function loadEmojiCategory(category) {
  const emojiGrid = document.getElementById('emojiGrid');
  if (!emojiGrid) return;
  
  const emojis = stickerLibrary[category] || [];
  emojiGrid.innerHTML = '';
  
  emojis.forEach(emoji => {
    const emojiButton = document.createElement('button');
    emojiButton.className = 'emoji-item';
    if (emoji.type === 'gif') emojiButton.classList.add('gif');
    else if (emoji.type === 'sticker') emojiButton.classList.add('sticker');
    
    emojiButton.textContent = emoji.emoji;
    emojiButton.title = emoji.name;
    emojiButton.onclick = () => insertEmoji(emoji.emoji, emoji.type);
    emojiGrid.appendChild(emojiButton);
  });
}

function insertEmoji(emoji, type = 'emoji') {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;
  
  const currentValue = chatInput.value;
  const cursorPosition = chatInput.selectionStart;
  let insertText = emoji;
  
  if (type === 'gif') insertText = `[GIF:${emoji}]`;
  else if (type === 'sticker') insertText = `[STICKER:${emoji}]`;
  
  const newValue = currentValue.slice(0, cursorPosition) + insertText + currentValue.slice(cursorPosition);
  chatInput.value = newValue;
  chatInput.focus();
  
  const newCursorPosition = cursorPosition + insertText.length;
  chatInput.setSelectionRange(newCursorPosition, newCursorPosition);
  toggleEmojiPicker();
}

// ========================================
// VOICE RECORDING FUNCTIONS
// ========================================

function toggleVoiceRecording() {
  if (isVoiceRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

async function startVoiceRecording() {
  try {
    voiceRecordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceRecorder = new MediaRecorder(voiceRecordingStream);
    voiceAudioChunks = [];
    
    voiceRecorder.ondataavailable = (event) => {
      voiceAudioChunks.push(event.data);
    };
    
    voiceRecorder.onstop = () => {
      const audioBlob = new Blob(voiceAudioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const voiceMessage = {
        type: 'voice',
        url: audioUrl,
        duration: Math.floor((Date.now() - voiceRecordingStartTime) / 1000),
        timestamp: new Date().toISOString()
      };
      
      sendVoiceMessage(voiceMessage);
    };
    
    voiceRecorder.start();
    voiceRecordingStartTime = Date.now();
    isVoiceRecording = true;
    
    // Update UI
    const voiceBtn = document.querySelector('.voice-btn');
    const voiceRecorderEl = document.getElementById('voiceRecorder');
    const voiceTimer = document.querySelector('.voice-timer');
    
    voiceBtn.classList.add('recording');
    voiceRecorderEl.style.display = 'block';
    
    voiceRecordingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - voiceRecordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      voiceTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
  } catch (error) {
    console.error('Voice recording error:', error);
    showMessage('🎤 Microphone access denied', 'error');
  }
}

function stopVoiceRecording() {
  if (voiceRecorder && voiceRecorder.state !== 'inactive') {
    voiceRecorder.stop();
  }
  
  if (voiceRecordingStream) {
    voiceRecordingStream.getTracks().forEach(track => track.stop());
  }
  
  if (voiceRecordingTimer) {
    clearInterval(voiceRecordingTimer);
  }
  
  // Reset UI
  const voiceBtn = document.querySelector('.voice-btn');
  const voiceRecorderEl = document.getElementById('voiceRecorder');
  const voiceTimer = document.querySelector('.voice-timer');
  
  voiceBtn.classList.remove('recording');
  voiceRecorderEl.style.display = 'none';
  voiceTimer.textContent = '00:00';
  
  isVoiceRecording = false;
}

function cancelVoiceRecording() {
  stopVoiceRecording();
  voiceAudioChunks = [];
}

function sendVoiceMessage(voiceMessage) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message right';
  
  const durationMinutes = Math.floor(voiceMessage.duration / 60);
  const durationSeconds = voiceMessage.duration % 60;
  const durationText = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
  
  messageEl.innerHTML = `
    <div class="text">
      <div class="voice-message-player">
        <button class="voice-play-btn" onclick="playVoiceMessage('${voiceMessage.url}', this)">▶️</button>
        <div class="voice-info">
          <div class="voice-duration">🎤 Voice message • ${durationText}</div>
          <div class="voice-waveform">
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
          </div>
        </div>
      </div>
      <audio src="${voiceMessage.url}" style="display:none;"></audio>
    </div>
    <div class="message-time">${formatTime(new Date(voiceMessage.timestamp))}</div>
  `;
  
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  console.log('Voice message sent:', voiceMessage);
}

function playVoiceMessage(audioUrl, playBtn) {
  const audioEl = playBtn.parentElement.nextElementSibling;
  
  if (audioEl.paused) {
    document.querySelectorAll('audio').forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        const otherBtn = audio.previousElementSibling.querySelector('.voice-play-btn');
        if (otherBtn) otherBtn.textContent = '▶️';
      }
    });
    
    audioEl.play();
    playBtn.textContent = '⏸️';
    
    audioEl.onended = () => {
      playBtn.textContent = '▶️';
    };
  } else {
    audioEl.pause();
    playBtn.textContent = '▶️';
  }
}

// ========================================
// AVATAR ANIMATION FUNCTIONS
// ========================================

function handleAvatarMove(event, avatarId) {
  const avatar = document.getElementById(avatarId);
  if (!avatar) return;
  
  // Fixed position - no cursor following, just subtle hover effect
  avatar.style.transform = 'translateY(-50%) scale(1.1)';
  avatar.style.transition = 'transform 0.2s ease';
}

function resetAvatar(avatarId) {
  const avatar = document.getElementById(avatarId);
  if (!avatar) return;
  
  avatar.style.transform = 'translateY(-50%) scale(1)';
  avatar.style.transition = 'transform 0.3s ease';
}

function handleInputChange(inputId) {
  const input = document.getElementById(inputId);
  const avatarId = inputId + 'Avatar';
  const avatar = document.getElementById(avatarId);
  
  if (!avatar) return;
  
  const value = input.value.trim();
  const minLength = input.type === 'email' ? 5 : 6;
  
  // Remove existing states
  avatar.classList.remove('happy', 'excited');
  
  // Determine avatar type based on input field
  let avatarType = 'email';
  if (inputId.includes('Password')) {
    avatarType = 'password';
  } else if (inputId.includes('Confirm')) {
    avatarType = 'confirm';
  }
  
  // Update avatar based on input validation
  if (value.length >= minLength) {
    if (input.type === 'email' && value.includes('@') && value.includes('.')) {
      avatar.classList.add('excited');
      avatar.textContent = animalAvatars[avatarType].excited;
    } else if (input.type === 'password' && value.length >= 8) {
      avatar.classList.add('excited');
      avatar.textContent = animalAvatars[avatarType].excited;
    } else if (value.length >= minLength) {
      avatar.classList.add('happy');
      avatar.textContent = animalAvatars[avatarType].happy;
    }
  } else {
    // Reset to idle animal
    avatar.textContent = animalAvatars[avatarType].idle;
  }
}

// ========================================
// AUTH FUNCTIONS WITH LOGIN GLITCH FIX
// ========================================

function getToken() {
  return localStorage.getItem('authToken');
}

function login(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  showMessage('🔐 Logging in...', 'success');

  setTimeout(() => {
    const userData = {
      id: 'user_' + Date.now(),
      username: email.split('@')[0],
      email: email,
      college: 'VIT Bhopal',
      token: 'token_' + Date.now()
    };

    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    currentUser = userData;
    
    document.body.classList.add('logged-in');
    document.getElementById('aboutUsPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('authPopup').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    document.getElementById('userName').textContent = 'Hi, ' + userData.username;
    
    showMessage('✅ Login successful!', 'success');
  }, 1500);
}

function signup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const reg = document.getElementById('signupReg').value;
  const password = document.getElementById('signupPass').value;

  showMessage('📝 Creating account...', 'success');

  setTimeout(() => {
    const userData = {
      id: 'user_' + Date.now(),
      username: name,
      email: email,
      regNumber: reg,
      college: 'VIT Bhopal',
      token: 'token_' + Date.now()
    };

    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    currentUser = userData;
    
    document.body.classList.add('logged-in');
    document.getElementById('aboutUsPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('authPopup').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    document.getElementById('userName').textContent = 'Hi, ' + userData.username;
    
    showMessage('🎉 Account created successfully!', 'success');
  }, 1500);
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  currentUser = null;
  
  document.body.classList.remove('logged-in');
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('aboutUsPage').style.display = 'block';
  
  showMessage('👋 Logged out successfully', 'success');
}

function goLogin(event) {
  event.preventDefault();
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function goSignup(event) {
  event.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function goForgotPassword(event) {
  event.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showMessage(message, type = 'info') {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.innerHTML = `<div class="message ${type}">${message}</div>`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  }
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

// ========================================
// INITIALIZATION WITH LOGIN GLITCH FIX
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 VibeXpert initializing...');

  const token = getToken();
  const saved = localStorage.getItem('user');

  if (token && saved) {
    try {
      currentUser = JSON.parse(saved);
      
      // Only show main page if user is properly authenticated
      if (currentUser && currentUser.username) {
        document.body.classList.add('logged-in');
        const aboutPage = document.getElementById('aboutUsPage');
        const mainPage = document.getElementById('mainPage');
        const authPopup = document.getElementById('authPopup');
        
        // Hide login/about page and show main page
        if (aboutPage) aboutPage.style.display = 'none';
        if (mainPage) mainPage.style.display = 'block';
        if (authPopup) authPopup.style.display = 'none';
        
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = 'Hi, ' + currentUser.username;
      } else {
        // Invalid user data, show login
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
  console.log('✅ Initialized');
});

function showAboutUsPage() {
  document.body.classList.remove('logged-in');
  const aboutPage = document.getElementById('aboutUsPage');
  const mainPage = document.getElementById('mainPage');
  if (aboutPage) aboutPage.style.display = 'block';
  if (mainPage) mainPage.style.display = 'none';
}

function showAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.add('show');
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.remove('show');
    authPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function setupEventListeners() {
  document.addEventListener('click', function(e) {
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

// Close emoji picker when clicking outside
document.addEventListener('click', function(event) {
  const emojiPicker = document.getElementById('emojiPicker');
  const emojiBtn = document.querySelector('.emoji-btn');
  
  if (emojiPickerVisible && 
      !emojiPicker.contains(event.target) && 
      !emojiBtn.contains(event.target)) {
    emojiPicker.style.display = 'none';
    emojiPickerVisible = false;
  }
});

// Chat functions
function handleChatKeypress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  
  if (!chatInput || !chatMessages) return;
  
  const message = chatInput.value.trim();
  if (!message) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message right';
  messageEl.innerHTML = `
    <div class="text">${message}</div>
    <div class="message-time">${formatTime(new Date())}</div>
  `;
  
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatInput.value = '';
}

// Basic page navigation
function showPage(pageId, event) {
  if (event) event.preventDefault();
  
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
}

function goHome() {
  showPage('home');
}
