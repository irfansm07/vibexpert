// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT
// Enhanced Community Chat + All Features
// ========================================

const API_URL = 'https://vibexpert-backend-main.onrender.com';

// Emoji Picker Functions
let currentEmojiCategory = 'emotions';
let emojiPickerVisible = false;

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

  // Update active category button
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
    if (emoji.type === 'gif') {
      emojiButton.classList.add('gif');
    } else if (emoji.type === 'sticker') {
      emojiButton.classList.add('sticker');
    }
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

  // Add special formatting for GIFs and stickers
  if (type === 'gif') {
    insertText = `[GIF:${emoji}]`;
  } else if (type === 'sticker') {
    insertText = `[STICKER:${emoji}]`;
  }

  const newValue = currentValue.slice(0, cursorPosition) + insertText + currentValue.slice(cursorPosition);

  chatInput.value = newValue;
  chatInput.focus();

  // Set cursor position after the inserted emoji
  const newCursorPosition = cursorPosition + insertText.length;
  chatInput.setSelectionRange(newCursorPosition, newCursorPosition);

  // Hide emoji picker after selection
  toggleEmojiPicker();
}

// Close emoji picker when clicking outside
document.addEventListener('click', function (event) {
  const emojiPicker = document.getElementById('emojiPicker');
  const emojiBtn = document.querySelector('.emoji-btn');

  if (emojiPickerVisible &&
    !emojiPicker.contains(event.target) &&
    !emojiBtn.contains(event.target)) {
    emojiPicker.style.display = 'none';
    emojiPickerVisible = false;
  }
});

// Voice Recording Functions
let voiceRecorder = null;
let voiceRecordingStartTime = null;
let voiceRecordingTimer = null;
let voiceRecordingStream = null;
let voiceAudioChunks = [];
let isVoiceRecording = false;

function toggleVoiceRecording() {
  if (isVoiceRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

async function startVoiceRecording() {
  try {
    // Request microphone access
    voiceRecordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    voiceRecorder = new MediaRecorder(voiceRecordingStream);
    voiceAudioChunks = [];

    voiceRecorder.ondataavailable = (event) => {
      voiceAudioChunks.push(event.data);
    };

    voiceRecorder.onstop = () => {
      const audioBlob = new Blob(voiceAudioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create voice message element
      const voiceMessage = {
        type: 'voice',
        url: audioUrl,
        duration: Math.floor((Date.now() - voiceRecordingStartTime) / 1000),
        timestamp: new Date().toISOString()
      };

      // Send voice message
      sendVoiceMessage(voiceMessage);
    };

    // Start recording
    voiceRecorder.start();
    voiceRecordingStartTime = Date.now();
    isVoiceRecording = true;

    // Update UI
    const voiceBtn = document.querySelector('.voice-btn');
    const voiceRecorderEl = document.getElementById('voiceRecorder');
    const voiceTimer = document.querySelector('.voice-timer');

    voiceBtn.classList.add('recording');
    voiceRecorderEl.style.display = 'block';

    // Start timer
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

  // Simulate sending to server
  console.log('Voice message sent:', voiceMessage);
}

function playVoiceMessage(audioUrl, playBtn) {
  const audioEl = playBtn.parentElement.nextElementSibling;

  if (audioEl.paused) {
    // Stop any other playing audio
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

// Avatar Animation Functions
function handleAvatarMove(event, avatarId) {
  const avatar = document.getElementById(avatarId);
  if (!avatar) return;

  const input = event.target;
  const rect = input.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate position relative to input
  const maxX = rect.width - 40;
  const maxY = rect.height - 40;

  // Constrain movement within input bounds
  const constrainedX = Math.max(0, Math.min(x - 20, maxX));
  const constrainedY = Math.max(0, Math.min(y - 20, maxY));

  // Apply smooth movement
  avatar.style.transform = `translate(${constrainedX - maxX}px, ${constrainedY - 20}px) scale(1.1)`;
  avatar.style.transition = 'transform 0.1s ease-out';
}

function resetAvatar(avatarId) {
  const avatar = document.getElementById(avatarId);
  if (!avatar) return;

  avatar.style.transform = 'translateY(-50%) scale(1)';
  avatar.style.transition = 'transform 0.3s ease-out';
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

  if (value.length >= minLength) {
    // Check if email is valid or password is strong enough
    if (input.type === 'email' && value.includes('@') && value.includes('.')) {
      avatar.classList.add('excited');
      avatar.textContent = '🎉';
    } else if (input.type === 'password' && value.length >= 8) {
      avatar.classList.add('excited');
      avatar.textContent = '🔥';
    } else if (value.length >= minLength) {
      avatar.classList.add('happy');
      if (input.type === 'email') {
        avatar.textContent = '😊';
      } else if (input.type === 'password') {
        avatar.textContent = '😄';
      }
    }
  } else {
    // Reset to original emoji
    if (inputId.includes('Email')) {
      avatar.textContent = inputId.includes('login') ? '👁️' : '📧';
    } else if (inputId.includes('Password')) {
      avatar.textContent = inputId.includes('login') ? '🔒' : '🔐';
    } else if (inputId.includes('Confirm')) {
      avatar.textContent = '✅';
    }
  }
}

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
const vibeshopData = {
  items: []
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
    { name: 'NIT Bhopal', email: '@stu.manit.ac.in', location: 'Bhopal' },
    { name: 'NIT Bhopal', email: '@gmail.com', location: 'Bhopal' },
    { name: 'NIT Rourkela', email: '@nitrkl.ac.in', location: 'Rourkela' },
    { name: 'NIT Warangal', email: '@nitw.ac.in', location: 'Warangal' },
    { name: 'NIT Trichy', email: '@nitt.edu', location: 'Trichy' },
    { name: 'NIT Surathkal', email: '@nitk.edu.in', location: 'Surathkal' }
  ],
  iit: [
    { name: 'IIT Delhi', email: '@iitd.ac.in', location: 'New Delhi' },
    { name: 'IIT Bombay', email: '@iitb.ac.in', location: 'Mumbai' },
    { name: 'IIT Madras', email: '@iitm.ac.in', location: 'Chennai' },
    { name: 'IIT Kharagpur', email: '@kgp.iitkgp.ac.in', location: 'Kharagpur' },
    { name: 'IIT Kanpur', email: '@iitk.ac.in', location: 'Kanpur' }
  ],
  vit: [
    { name: 'VIT Bhopal', email: '@vitbhopal.ac.in', location: 'Bhopal' },
    { name: 'VIT Vellore', email: '@vit.ac.in', location: 'Vellore' },
    { name: 'VIT Chennai', email: '@vit.ac.in', location: 'Chennai' }
  ],
  other: [
    { name: 'Delhi University', email: '@du.ac.in', location: 'New Delhi' },
    { name: 'Mumbai University', email: '@mu.ac.in', location: 'Mumbai' },
    { name: 'BITS Pilani', email: '@pilani.bits-pilani.ac.in', location: 'Pilani' }
  ]
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function () {
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

        if (currentUser.college) {
          updateLiveNotif(`Connected to ${currentUser.college}`);
          initializeSocket();
        }
      } else {
        // Invalid user data, show login
        showAboutUsPage();
      }
    } catch (e) {
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

  initRevealOnScroll();
  initStatsCounter();
  initScrollDetection();
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

function scrollToBottomAndLogin() {
  // Scroll to bottom of page
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  });

  // Wait for scroll to complete, then show login popup
  setTimeout(() => {
    showAuthPopup();
  }, 1000);
}

function showAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.add('show');
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    initBlobEyeTracking();
    initPasswordEyeClosing(); // Make characters close eyes when typing password
  }
}

// ========================================
// BLOB EYE TRACKING ANIMATION
// ========================================
function initBlobEyeTracking() {
  const authPopup = document.getElementById('authPopup');
  const svg = authPopup?.querySelector('.auth-characters-svg');
  if (!svg) return;

  // Remove old listener if present
  if (authPopup._eyeTrackHandler) {
    authPopup.removeEventListener('mousemove', authPopup._eyeTrackHandler);
  }

  const handler = function (e) {
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;
    // SVG viewBox is 420x460
    const scaleX = 420 / svgWidth;
    const scaleY = 460 / svgHeight;
    // Mouse position in SVG coordinate space
    const mouseX = (e.clientX - svgRect.left) * scaleX;
    const mouseY = (e.clientY - svgRect.top) * scaleY;

    const eyes = svg.querySelectorAll('.blob-eye');
    eyes.forEach(function (eye) {
      const pupil = eye.querySelector('.blob-pupil');
      const eyeWhite = eye.querySelector('circle:first-child');
      if (!pupil || !eyeWhite) return;

      const cx = parseFloat(eyeWhite.getAttribute('cx'));
      const cy = parseFloat(eyeWhite.getAttribute('cy'));
      const eyeR = parseFloat(eyeWhite.getAttribute('r'));
      const pupilR = parseFloat(pupil.getAttribute('r'));
      const maxMove = eyeR - pupilR - 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist * 0.15, maxMove);
      const newCx = cx + Math.cos(angle) * clampedDist;
      const newCy = cy + Math.sin(angle) * clampedDist;

      pupil.setAttribute('cx', newCx);
      pupil.setAttribute('cy', newCy);
    });
  };

  authPopup._eyeTrackHandler = handler;
  authPopup.addEventListener('mousemove', handler);

  // Also handle touch for mobile
  authPopup.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handler({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }, { passive: true });
}

// ========================================
// PASSWORD FIELD - CHARACTERS CLOSE EYES
// ========================================
function initPasswordEyeClosing() {
  const passwordField = document.getElementById('loginPassword');
  const signupPasswordField = document.getElementById('signupPass');
  const svg = document.querySelector('.auth-characters-svg');

  if (!svg) return;

  const eyes = svg.querySelectorAll('.blob-eye');
  let closedLines = [];
  let eyesClosed = false;

  function closeEyes() {
    if (eyesClosed) return;
    eyesClosed = true;

    // Clean up any previous closed-eye lines
    closedLines.forEach(l => l.remove());
    closedLines = [];

    eyes.forEach(eye => {
      // Hide all original eye children (circles, pupils, highlights)
      Array.from(eye.children).forEach(child => {
        child.setAttribute('data-orig-display', child.style.display || '');
        child.style.display = 'none';
      });

      // Get eye center from the first circle (eye white)
      const eyeWhite = eye.querySelector('circle:first-child');
      if (!eyeWhite) return;
      const cx = parseFloat(eyeWhite.getAttribute('cx'));
      const cy = parseFloat(eyeWhite.getAttribute('cy'));
      const r = parseFloat(eyeWhite.getAttribute('r'));

      // Draw a curved "closed eye" line
      const w = r * 1.2;
      const closedEye = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      closedEye.setAttribute('d', `M${cx - w},${cy} Q${cx},${cy + w * 0.5} ${cx + w},${cy}`);
      closedEye.setAttribute('stroke', '#2d2d4e');
      closedEye.setAttribute('stroke-width', '2.5');
      closedEye.setAttribute('fill', 'none');
      closedEye.setAttribute('stroke-linecap', 'round');
      closedEye.classList.add('closed-eye-line');

      eye.appendChild(closedEye);
      closedLines.push(closedEye);
    });
  }

  function openEyes() {
    if (!eyesClosed) return;
    eyesClosed = false;

    // Restore all original eye children
    eyes.forEach(eye => {
      Array.from(eye.children).forEach(child => {
        if (child.classList.contains('closed-eye-line')) return;
        child.style.display = child.getAttribute('data-orig-display') || '';
      });
    });

    // Remove closed-eye lines
    closedLines.forEach(l => l.remove());
    closedLines = [];
  }

  // Login password field
  if (passwordField) {
    passwordField.addEventListener('focus', closeEyes);
    passwordField.addEventListener('blur', openEyes);
  }

  // Signup password fields
  if (signupPasswordField) {
    signupPasswordField.addEventListener('focus', closeEyes);
    signupPasswordField.addEventListener('blur', openEyes);
  }

  const confirmPasswordField = document.getElementById('signupConfirm');
  if (confirmPasswordField) {
    confirmPasswordField.addEventListener('focus', closeEyes);
    confirmPasswordField.addEventListener('blur', openEyes);
  }
}

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.classList.add('showing');
  } else {
    input.type = 'password';
    btn.classList.remove('showing');
  }
  input.focus();
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
    confetti.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}%;top:-10px;opacity:${Math.random()};transform:rotate(${Math.random() * 360}deg);animation:confettiFall ${2 + Math.random() * 3}s linear forwards;z-index:25000;pointer-events:none;`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  document.addEventListener('click', function (e) {
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

// Fixed apiCall function - merged both versions with proper endpoint handling
async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  // Ensure endpoint starts with / and construct full URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;

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
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || data.message || 'Request failed');
      err.status = response.status;
      err.code = data.code || null;

      // Daily message limit — show a prominent banner and stop the call chain
      if (response.status === 429 && data.code === 'DAILY_LIMIT_REACHED') {
        showMessage(
          '🚫 Your college has reached the 10,000 message limit for today! Chat resets at midnight UTC. 🌙',
          'error',
          7000
        );
        // Return null so callers don't crash; they should guard with  if (!response) return;
        return null;
      }

      throw err;
    }

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



// Keep login and signup functions as they were (they're correct)
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) return showMessage('Fill all fields', 'error');
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
      location.reload();
    }, 800);
  } catch (error) {
    showMessage('❌ Login failed: ' + error.message, 'error');
  }
}

// Form navigation functions
function goSignup(e) {
  e?.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function goLogin(e) {
  e?.preventDefault();
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function goForgotPassword(e) {
  e?.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email) return showMessage('⚠️ Email required', 'error');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return showMessage('⚠️ Invalid email format', 'error');

  try {
    showMessage('📧 Sending reset code...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ Reset code sent to your email!', 'success');
    document.getElementById('resetEmailSection').style.display = 'none';
    document.getElementById('resetCodeSection').style.display = 'block';
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPass')?.value;
  const confirm = document.getElementById('signupConfirm')?.value;

  if (!username || !email || !password || !confirm) return showMessage('Fill all fields', 'error');
  if (password !== confirm) return showMessage('Passwords don\'t match', 'error');
  if (password.length < 6) return showMessage('Password min 6 characters', 'error');
  if (username.length < 3) return showMessage('Username must be at least 3 characters', 'error');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return showMessage('Invalid email format', 'error');

  try {
    showMessage('Creating account...', 'success');
    await apiCall('/api/register', 'POST', { username, email, password });
    showMessage('🎉 Account created!', 'success');
    const form = document.getElementById('signupForm');
    if (form) form.reset();
    setTimeout(() => goLogin(null), 2000);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyResetCode(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  const code = document.getElementById('resetCode')?.value.trim();
  const newPassword = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('confirmNewPassword')?.value;
  if (!code || code.length !== 6) return showMessage('⚠️ Enter 6-digit code', 'error');
  if (!newPassword || !confirmPassword) return showMessage('⚠️ Enter password', 'error');
  if (newPassword !== confirmPassword) return showMessage('⚠️ Passwords don\'t match', 'error');
  if (newPassword.length < 6) return showMessage('⚠️ Min 6 characters', 'error');
  try {
    showMessage('🔐 Verifying...', 'success');
    await apiCall('/api/reset-password', 'POST', { email, code, newPassword });
    showMessage('✅ Password reset!', 'success');
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetEmailSection').style.display = 'block';
    document.getElementById('resetCodeSection').style.display = 'none';
    setTimeout(() => goLogin(null), 2000);
  } catch (error) {
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
  } catch (error) {
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
  location.reload();
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

  chatInput.addEventListener('input', function () {
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
  } catch (error) {
    showMessage('❌ Failed to send', 'error');
  }
}

function appendMessageToChat(msg) {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  const sender = (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || 'User';
  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));

  if (document.getElementById('msg-' + messageId)) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now(); // ✅ Store timestamp for duplicate detection

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
  } catch (error) {
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

  window.queueMessageUpdate = function (message) {
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
      } catch (error) {
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
  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));

  // ✅ FIX: Build media HTML for renderMessage
  let renderMediaHTML = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      renderMediaHTML = `<video class="msg-media" src="${msg.media_url}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      renderMediaHTML = `<audio class="msg-media" src="${msg.media_url}" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      renderMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      renderMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      renderMediaHTML = `<img class="msg-media" src="${msg.media_url}" alt="image" onclick="openImageViewer(this.src)">`;
    }
  }

  let html = `<div class="chat-message ${isOwn ? 'own' : 'other'}" id="msg-${messageId}">`;
  if (!isOwn) html += `<div class="sender">@${escapeHtml(sender)}</div>`;
  html += `
   ${renderMediaHTML}
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
  audio.play().catch(() => { });
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
  const content = input.value.trim();

  if (!content) return;

  try {
    // 1. Clear input immediately
    input.value = '';

    // 2. Create unique temp ID
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // 3. Show optimistic message
    const tempMessage = {
      id: tempId,
      content: content,
      user_id: currentUser.id,
      users: {
        username: currentUser.username,
        avatar_url: currentUser.avatar_url
      },
      created_at: new Date().toISOString(),
      isTemp: true // Mark as temporary
    };

    appendWhatsAppMessage(tempMessage, true); // true = own message

    // 4. Send to server
    const response = await apiCall('/api/community/messages', 'POST', {
      content: content
    });

    if (response.success) {
      // 5. Remove temp message
      const tempElement = document.getElementById(`wa-msg-${tempId}`);
      if (tempElement) {
        tempElement.remove();
      }

      // 6. Add real message from API response
      appendWhatsAppMessage(response.message, true);

      console.log('✅ Message sent successfully');
    }

  } catch (error) {
    console.error('❌ Failed to send message:', error);
    showMessage('Failed to send message', 'error');

    // Remove temp message on error
    const tempElement = document.getElementById(`wa-msg-temp-${tempId}`);
    if (tempElement) {
      tempElement.remove();
    }
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
    <div class="join-community-container"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
        <div class="join-icon" style="font-size: 80px; margin-bottom: 20px;">🤝</div>
        <h2 style="margin-bottom: 15px; color: var(--text-color);">Join a Community</h2>
        <p style="margin-bottom: 30px; color: var(--text-muted); max-width: 400px;">Connect with students from your
            university. Join now to start chatting and sharing vibes!</p>
        <button onclick="goToActiveUniversities()" class="cta-button"
            style="padding: 15px 40px; font-size: 18px; border-radius: 30px; background: linear-gradient(45deg, #4f74a3, #8da4d3); border: none; color: white; cursor: pointer; box-shadow: 0 5px 15px rgba(79, 116, 163, 0.4); transition: transform 0.2s;">
            Join Now →
        </button>
    </div>
    `;
    return;
  }

  // Ensure whatsapp container is correctly positioned on next frame
  // (header may still be visible when communities loads)
  requestAnimationFrame(() => {
    const header = document.querySelector('.header');
    const chatContainer = document.querySelector('.whatsapp-container');
    if (header && chatContainer) {
      if (document.body.classList.contains('header-autohide')) {
        chatContainer.style.top = '0';
        chatContainer.style.height = '100vh';
      } else {
        const hh = header.offsetHeight || 72;
        chatContainer.style.top = hh + 'px';
        chatContainer.style.height = `calc(100vh - ${hh}px)`;
      }
    }
  });

  // WhatsApp-style complete layout
  container.innerHTML = `
    <div class="whatsapp-container">
      <!-- Left Sidebar: Chats List -->
      <div class="whatsapp-sidebar">
        <div class="whatsapp-sidebar-header">
          <div>
            <h3>${currentUser.college}</h3>
            <p style="font-size:12px;color:#888;margin-top:3px;">College Community</p>
          </div>
          <div class="sidebar-actions">
          </div>
        </div>
        
        <div class="whatsapp-search">
          <input type="text" placeholder="🔍 Search messages..." id="chatSearchBox" onkeyup="searchChatMessages()">
        </div>
        
        <div class="whatsapp-chats-list" id="chatsList">
          <!-- Community Group Chat -->
          <div class="chat-item active" onclick="openCommunityChat()">
            <div class="chat-avatar">
              <div class="group-avatar">🎓</div>
            </div>
            <div class="chat-info">
              <div class="chat-header-row">
                <h4>${currentUser.college} Community</h4>
                <span class="chat-time">Now</span>
              </div>
              <div class="chat-preview">
                <span class="preview-text">Click to open group chat</span>
                <span class="unread-badge" id="unreadCount" style="display:none;">0</span>
              </div>
            </div>
          </div>
          
          <!-- Announcements Channel -->
          <div class="chat-item" onclick="openAnnouncementsChannel()">
            <div class="chat-avatar">
              <div class="group-avatar" style="background:linear-gradient(135deg,#ff6b6b,#ff8787);">📢</div>
            </div>
            <div class="chat-info">
              <div class="chat-header-row">
                <h4>📢 Announcements</h4>
                <span class="chat-time">"COMING SOON"</span>
              </div>
              <div class="chat-preview">
                <span class="preview-text">Important college updates</span>
              </div>
            </div>
          </div>
          
          <!-- Study Groups -->
          <div class="chat-item" onclick="showMessage('Study groups coming soon!', 'success')">
            <div class="chat-avatar">
            </div>
            <div class="chat-info">
              <div class="chat-header-row">
                 </div>
              <div class="chat-preview">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Main Chat Area -->
      <div class="whatsapp-main" id="whatsappMain">
        <div class="whatsapp-chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar-large">🎓</div>
            <div>
              <h3>${currentUser.college} Community</h3>
              <p class="chat-status">Your College Community · Live</p>
            </div>
          </div>
        </div>

        <div class="whatsapp-messages" id="whatsappMessages">
          <div class="date-separator">
            <span>Today</span>
          </div>
          <div style="text-align:center;padding:40px;color:#888;">
          </div>
        </div>

        <div class="whatsapp-input-area">
          <button class="icon-btn" onclick="openEmojiPicker()" title="Emoji">😊</button>
          <!-- FILE BUTTON replaces sticker -->
          <input type="file" id="chatFileInput" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z" style="display:none" onchange="handleChatFileSelect(event)">
          <button class="icon-btn file-attach-btn" onclick="document.getElementById('chatFileInput').click()" title="Send Photo/Video">📎</button>
          <div class="input-wrapper">
            <textarea id="whatsappInput" placeholder="Type a message..." rows="1" 
              onkeydown="handleWhatsAppKeypress(event)" 
              oninput="handleTypingIndicator()"></textarea>
          </div>
          <button class="send-btn-whatsapp" onclick="sendWhatsAppMessageWithMedia()" title="Send">
            <span class="send-icon">➤</span>
          </button>
        </div>
      </div>

      <!-- Twitter-style Feed (Initially Hidden) -->
      <div class="twitter-feed-panel" id="twitterFeedPanel" style="display:none;">
        <div class="twitter-header">
          <button class="icon-btn" onclick="toggleTwitterFeed()">←</button>
          <h3>Community Posts</h3>
        </div>
        <div class="twitter-feed" id="twitterFeed">
          <div style="text-align:center;padding:40px;color:#888;">
            <div style="font-size:48px;margin-bottom:15px;">📰</div>
            <p>Loading posts...</p>
          </div>
        </div>
      </div>

      <!-- Chat Info Panel (Hidden) -->
      <div class="chat-info-panel" id="chatInfoPanel" style="display:none;">
        <div class="info-panel-header">
          <button class="icon-btn" onclick="toggleChatInfo()">←</button>
          <h3>Chat Info</h3>
        </div>
        <div class="info-panel-content">
          <div class="info-section">
            <div class="info-avatar">🎓</div>
            <h2>${currentUser.college}</h2>
            <p>College Community Group</p>
          </div>
          
          <div class="info-section">
            <h4>📊 Statistics</h4>
            <div class="info-stats">
              <div class="info-stat-item">
                <span class="stat-value" id="totalMembers">0</span>
                <span class="stat-label">Members</span>
              </div>
              <div class="info-stat-item">
                <span class="stat-value" id="totalMessages">0</span>
                <span class="stat-label">Messages</span>
              </div>
              <div class="info-stat-item">
                <span class="stat-value" id="activeToday">0</span>
                <span class="stat-label">Active Today</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h4>⚙️ Settings</h4>
            <div class="info-option" onclick="toggleNotifications()">
              <span>🔔 Notifications</span>
              <span id="notifStatus">On</span>
            </div>
            <div class="info-option" onclick="muteChat()">
              <span>🔇 Mute Chat</span>
              <span>Off</span>
            </div>
          </div>
          
          <div class="info-section">
            <button class="danger-btn" onclick="leaveGroup()">🚪 Leave Group</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize chat
  setTimeout(() => {
    if (typeof initWhatsAppChatFixes === 'function') {
      initWhatsAppChatFixes();  // ← ADD ONLY THIS LINE
    }
    loadWhatsAppMessages();
    initWhatsAppFeatures();
    loadTwitterFeed();
  }, 100);
}

// ==========================================
// WHATSAPP MESSAGE FUNCTIONS
// ==========================================

let isLoadingWhatsAppMessages = false;

async function loadWhatsAppMessages() {
  if (isLoadingWhatsAppMessages) return;
  isLoadingWhatsAppMessages = true;

  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('whatsappMessages');

    if (!messagesEl) return;

    // ✅ FIXED: Only clear if this is the first load
    const existingMessages = messagesEl.querySelectorAll('[id^="wa-msg-"]');
    const isFirstLoad = existingMessages.length === 0;

    if (isFirstLoad) {
      messagesEl.innerHTML = '';
      // Reset date tracking so separators re-render fresh
      resetChatDateTracking();
    }

    if (!data.messages || data.messages.length === 0) {
      if (isFirstLoad) {
        messagesEl.innerHTML += `
          <div class="no-messages">
            <div style="font-size:64px;margin-bottom:20px;">👋</div>
            <h3 style="color:#4f74a3;margin-bottom:10px;">Welcome to Community Chat!</h3>
            <p style="color:#888;">Say hi to your college community</p>
          </div>
        `;
      }
      return;
    }

    // ✅ FIXED: Only append new messages that don't already exist
    console.log(`📥 Loading ${data.messages.length} messages`);
    data.messages.forEach(msg => {
      const msgExists = document.getElementById(`wa-msg-${msg.id}`);
      if (!msgExists) {
        appendWhatsAppMessage(msg);
      }
    });

    // ✅ Scroll to bottom only on first load
    if (isFirstLoad) {
      setTimeout(() => scrollToBottom(), 100);
    }

    // Update stats
    updateChatStats(data.messages.length);
  } catch (error) {
    console.error('Load messages error:', error);
  } finally {
    isLoadingWhatsAppMessages = false;
  }
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

  // ✅ Clear input IMMEDIATELY
  const originalContent = content;
  input.value = '';
  input.style.height = 'auto';

  // ✅ Create unique temp ID
  const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  const tempMessage = {
    id: tempId,
    content: originalContent,
    sender_id: currentUser.id,
    users: {
      username: currentUser.username,
      avatar_url: currentUser.avatar_url
    },
    created_at: new Date().toISOString(),
    text: originalContent,
    isTemp: true
  };

  try {
    // ✅ Show optimistic message
    appendWhatsAppMessage(tempMessage);

    // Stop typing indicator
    if (socket && currentUser.college) {
      socket.emit('stop_typing', {
        collegeName: currentUser.college,
        username: currentUser.username
      });
    }

    // ✅ Send to server
    const response = await apiCall('/api/community/messages', 'POST', {
      content: originalContent
    });

    if (response.success && response.message) {
      playMessageSound('send');

      // ✅ Remove temp message
      const tempEl = document.getElementById(`wa-msg-${tempId}`);
      if (tempEl) {
        console.log(`🗑️ Removing temp: ${tempId}`);
        tempEl.remove();
      }

      // ✅ Add real message from API (NOT from socket)
      console.log(`✅ Adding real: ${response.message.id}`);
      appendWhatsAppMessage(response.message);
    }
  } catch (error) {
    console.error('❌ Send error:', error);
    showMessage('❌ Failed to send message', 'error');

    // Remove temp on error
    const tempEl = document.getElementById(`wa-msg-${tempId}`);
    if (tempEl) tempEl.remove();

    // Restore input
    input.value = originalContent;
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
  } catch (error) {
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
    { cat: 'Smileys', items: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋'] },
    { cat: 'Gestures', items: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '🙏'] },
    { cat: 'Hearts', items: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
    { cat: 'Objects', items: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎵', '🎶'] }
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

function goToActiveUniversities() {
  // If user is already joined, go directly to chat
  if (currentUser && currentUser.college) {
    console.log('🎓 User already has college:', currentUser.college);
    // Switch to communities tab which will trigger initCommunityChat
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[onclick*="communities"]')?.classList.add('active');

    // Manually trigger showPage for communities
    showPage('communities');
    return;
  }

  showPage('activeUniversities');
  renderActiveUniversities();
}

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

  currentVerifyCollege = { name, emailDomain };

  const modalHtml = `
   <div class="modal-box verify-modal-box">
     <span class="close" onclick="closeModal('verifyModal')">&times;</span>
     
     <div class="verify-header">
       <div class="verify-icon">🎓</div>
       <h2>Verify College</h2>
       <p class="verify-subtitle">Connect with your campus community</p>
     </div>

     <div class="verify-step">
       <label>1. Enter College Email</label>
       <div class="input-group">
         <input type="email" id="verifyEmail" placeholder="student@${emailDomain}">
         <div class="email-hint">Must end with: <strong>${emailDomain}</strong></div>
       </div>
       <button class="action-btn send-otp-btn" onclick="requestVerificationCode()">
         <span>📧 Send Verification Code</span>
       </button>
     </div>

     <div class="verify-step disabled-step" id="codeSection">
       <label>2. Enter Verification Code</label>
       <div class="input-group">
         <input type="text" id="verifyCode" placeholder="Enter 6-digit OTP" maxlength="6" disabled>
       </div>
       <button class="action-btn verify-btn" id="verifyBtn" onclick="verifyCollegeCode()" disabled>
         <span>✨ Verify & Join</span>
       </button>
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

    // Enable OTP section
    const codeSection = document.getElementById('codeSection');
    const verifyCodeInput = document.getElementById('verifyCode');
    const verifyBtn = document.getElementById('verifyBtn');

    if (codeSection) {
      codeSection.classList.remove('disabled-step');
      if (verifyCodeInput) {
        verifyCodeInput.disabled = false;
        verifyCodeInput.focus();
      }
      if (verifyBtn) verifyBtn.disabled = false;
    }
  } catch (error) {
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
    currentUser.registration_number = data.collegeEmail || currentUser.email; // Use verified college email
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


function openCommunityChat() {
  // Community chat is already open by default
  console.log('Community chat opened');
}

function openAnnouncementsChannel() {
  showMessage('📢 Announcements coming soon!', 'success');
}

function searchChatMessages() {
  const query = document.getElementById('chatSearchBox')?.value.toLowerCase() || '';
  const messages = document.querySelectorAll('.whatsapp-message');
  messages.forEach(msg => {
    const text = msg.textContent.toLowerCase();
    msg.style.display = text.includes(query) ? '' : 'none';
  });
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
  } catch (error) {
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

  try {
    const data = await apiCall(`/api/profile/${userId}`, 'GET');
    if (data.success && data.user) {
      showProfilePage(data.user);
    } else {
      showMessage('User not found', 'error');
    }
  } catch (error) {
    console.error('Show profile error:', error);
    showMessage('Failed to load profile', 'error');
  }
}


function showProfilePage(user) {
  const targetUser = user || currentUser;
  if (!targetUser) return;

  // Store current profile user globally for toggleFollow
  window.currentProfileUser = targetUser;

  // Show the profile page section
  showPage('profile');

  // Populate Header
  const nameEl = document.getElementById('profilePageName');
  const userEl = document.getElementById('profilePageUsername');
  const avatarImg = document.getElementById('profilePageAvatarImg');
  const avatarInitial = document.getElementById('profilePageAvatarInitial');
  const collegeEl = document.getElementById('profileCollege');
  const regNoEl = document.getElementById('profileRegNo');
  const postsStat = document.getElementById('profileStatPosts');
  const followBtn = document.getElementById('followBtn');
  const followersStat = document.getElementById('profileStatFollowers');

  if (nameEl) nameEl.textContent = targetUser.name || targetUser.username;
  if (userEl) userEl.textContent = `@${targetUser.username}`;

  // Real User ID Display
  const userIdEl = document.getElementById('profilePageUserId');
  if (userIdEl) {
    const shortId = targetUser.id ? targetUser.id.slice(-8).toUpperCase() : '000000';
    userIdEl.textContent = `ID: #${shortId}`;
  }

  // Avatar
  if (targetUser.profile_pic) {
    if (avatarImg) { avatarImg.src = targetUser.profile_pic; avatarImg.style.display = 'block'; }
    if (avatarInitial) avatarInitial.style.display = 'none';
  } else {
    if (avatarImg) avatarImg.style.display = 'none';
    if (avatarInitial) avatarInitial.style.display = 'block';
  }

  // Real data from database
  if (collegeEl) collegeEl.textContent = targetUser.college || 'No college set';
  if (regNoEl) regNoEl.textContent = targetUser.registration_number || targetUser.email || 'No email';
  if (postsStat) postsStat.textContent = targetUser.postCount || 0;
  if (followersStat) followersStat.textContent = targetUser.followersCount || 0;

  const followingStat = document.getElementById('profileStatFollowing');
  if (followingStat) followingStat.textContent = targetUser.followingCount || 0;

  // Set bio
  const bioEl = document.getElementById('profileBio');
  if (bioEl) bioEl.textContent = targetUser.bio || 'Tell the world about yourself...';

  // Dynamic Badges - based on REAL data
  const badgesEl = document.getElementById('profilePageBadges');
  if (badgesEl) {
    let badges = '';
    // Premium badge
    if (targetUser.isPremium || (targetUser.subscription && targetUser.subscription.plan)) {
      const plan = targetUser.subscription ? targetUser.subscription.plan : 'noble';
      if (plan === 'royal') {
        badges += '<span class="badge-item" style="background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));color:#FFD700;">👑 Royal</span>';
      } else {
        badges += '<span class="badge-item" style="background:rgba(192,192,192,0.2);color:#c0c0c0;">🥈 Noble</span>';
      }
    }
    // Community badge
    if (targetUser.college) {
      badges += `<span class="badge-item">🎓 ${targetUser.college}</span>`;
    }
    // Verified badge (if has email)
    if (targetUser.email || targetUser.registration_number) {
      badges += '<span class="badge-item" style="background:rgba(59,130,246,0.2);color:#60a5fa;">✓ Verified</span>';
    }
    badgesEl.innerHTML = badges || '<span class="badge-item">🆕 New Member</span>';
  }

  // Ownership Visibility
  const isOwn = currentUser && (targetUser.id === currentUser.id || targetUser.username === currentUser.username);

  document.querySelectorAll('.edit-cover-btn, .avatar-edit-overlay, .btn-micro').forEach(btn => {
    btn.style.display = isOwn ? 'block' : 'none';
  });

  // Handle Follow Button
  if (followBtn) {
    if (isOwn) {
      followBtn.style.display = 'none';
    } else {
      followBtn.style.display = 'block';
      const isFollowing = targetUser.isFollowing;
      followBtn.textContent = isFollowing ? 'Following' : 'Follow';
      followBtn.className = isFollowing ? 'btn-secondary' : 'btn-primary';
      followBtn.style.opacity = isFollowing ? '0.7' : '1';
    }
  }

  // Fetch real follower/following counts from backend
  fetchProfileStats(targetUser);

  // Load default tab
  switchProfileTab('info');
}

// Fetch real stats from backend
async function fetchProfileStats(targetUser) {
  if (!targetUser || !targetUser.id) return;
  try {
    const result = await apiCall(`/api/profile/${targetUser.id}`);
    if (result && result.user) {
      const followersStat = document.getElementById('profileStatFollowers');
      const followingStat = document.getElementById('profileStatFollowing');
      const postsStat = document.getElementById('profileStatPosts');
      if (followersStat) followersStat.textContent = result.user.followersCount || 0;
      if (followingStat) followingStat.textContent = result.user.followingCount || 0;
      if (postsStat) postsStat.textContent = result.user.postCount || 0;
      // Update target user data
      targetUser.followersCount = result.user.followersCount || 0;
      targetUser.followingCount = result.user.followingCount || 0;
      targetUser.postCount = result.user.postCount || 0;
      // Update isFollowing status for follow button
      if (result.user.isFollowing !== undefined) {
        targetUser.isFollowing = result.user.isFollowing;
        const followBtn = document.getElementById('followBtn');
        if (followBtn && followBtn.style.display !== 'none') {
          followBtn.textContent = result.user.isFollowing ? 'Following' : 'Follow';
          followBtn.className = result.user.isFollowing ? 'btn-secondary' : 'btn-primary';
          followBtn.style.opacity = result.user.isFollowing ? '0.7' : '1';
        }
      }
    }
  } catch (e) {
    console.log('Could not fetch profile stats:', e);
  }
}

async function toggleFollow() {
  if (!currentUser || !window.currentProfileUser) return;

  const targetUser = window.currentProfileUser;
  const followBtn = document.getElementById('followBtn');
  const followersStat = document.getElementById('profileStatFollowers');

  // Optimistic UI Update
  const isFollowing = targetUser.isFollowing;
  const originalFollowersCount = targetUser.followersCount;

  // Toggle state locally
  targetUser.isFollowing = !isFollowing;
  targetUser.followersCount += isFollowing ? -1 : 1;

  // Update UI immediately
  if (followBtn) {
    followBtn.textContent = targetUser.isFollowing ? 'Following' : 'Follow';
    followBtn.className = targetUser.isFollowing ? 'btn-secondary' : 'btn-primary';
    followBtn.style.opacity = targetUser.isFollowing ? '0.7' : '1';
  }

  if (followersStat) {
    followersStat.textContent = targetUser.followersCount;
  }

  try {
    const endpoint = isFollowing ? `/api/unfollow/${targetUser.id}` : `/api/follow/${targetUser.id}`;
    const result = await apiCall(endpoint, 'POST');

    if (result.success) {
      const action = isFollowing ? 'Unfollowed' : 'Following';
      showLiveActivity(`${action === 'Following' ? '✨' : '👋'} ${action} @${targetUser.username}`, 'success');

      // Update local storage to keep "following" list in sync if needed (optional but good for other UI parts)
      if (!currentUser.following) currentUser.following = [];
      if (!isFollowing) {
        if (!currentUser.following.includes(targetUser.username)) currentUser.following.push(targetUser.username);
        currentUser.followingCount = (currentUser.followingCount || 0) + 1;
      } else {
        currentUser.following = currentUser.following.filter(u => u !== targetUser.username);
        currentUser.followingCount = Math.max(0, (currentUser.followingCount || 0) - 1);
      }
      saveUserToLocal();

    } else {
      // Revert if failed
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Follow toggle error:', error);
    // Revert UI
    targetUser.isFollowing = isFollowing;
    targetUser.followersCount = originalFollowersCount;
    if (followBtn) {
      followBtn.textContent = isFollowing ? 'Following' : 'Follow';
      followBtn.className = isFollowing ? 'btn-secondary' : 'btn-primary';
      followBtn.style.opacity = isFollowing ? '0.7' : '1';
    }
    if (followersStat) {
      followersStat.textContent = originalFollowersCount;
    }
    showMessage('❌ Action failed', 'error');
  }
}

function switchProfileTab(tabName, event) {
  // Update buttons
  document.querySelectorAll('.profile-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (event) {
    event.currentTarget.classList.add('active');
  } else {
    // Find button by text or data-tab if I had it, otherwise just first one or find by onclick
    const btns = document.querySelectorAll('.profile-tab-btn');
    btns.forEach(btn => {
      if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
        btn.classList.add('active');
      }
    });
  }

  // Update content
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const targetPane = document.getElementById('profileTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (targetPane) targetPane.classList.add('active');

  // Specific tab loading logic
  if (tabName === 'cart') loadCartItems();
  else if (tabName === 'shipping') loadShippingDetails();
  else if (tabName === 'orders') loadOrderHistory();
}

function loadCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const summary = document.querySelector('.cart-summary');
  if (!container) return;

  const cart = [
    { id: 1, name: 'VibeX Premium Hoodie', price: 1499, img: '📦', qty: 1 },
    { id: 2, name: 'Smart Student Pack', price: 499, img: '🎒', qty: 1 }
  ];

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty. Start shopping!</p>
      </div>`;
    if (summary) summary.style.display = 'none';
    return;
  }

  let html = '';
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    html += `
      <div class="cart-item" style="display:flex;align-items:center;gap:20px;padding:20px;background:rgba(255,255,255,0.05);border-radius:15px;margin-bottom:15px;border:1px solid rgba(79,116,163,0.2);">
        <div style="font-size:40px;">${item.img}</div>
        <div style="flex:1;">
          <h4 style="color:white;margin:0 0 5px 0;">${item.name}</h4>
          <p style="color:#8da4d3;margin:0;font-size:14px;">Qty: ${item.qty} • ₹${item.price}</p>
        </div>
        <div style="font-weight:700;color:white;">₹${item.price * item.qty}</div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (summary) {
    summary.style.display = 'block';
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  }
}

function loadShippingDetails() {
  const container = document.getElementById('shippingAddressContent');
  if (!container) return;
  // Mock loading
  container.innerHTML = `
    <p><strong>${currentUser?.username || 'Premium User'}</strong></p>
    <p>Block B, Excellence Residency</p>
    <p>University Main Road, Tech Park</p>
    <p>PIN: 4620XX | India</p>
    <p style="margin-top:10px;font-size:12px;color:#4f74a3;">📞 +91 98765 43210</p>
  `;
}

function loadOrderHistory() {
  const container = document.getElementById('orderHistoryContainer');
  if (!container) return;

  const orders = [
    { id: 'VX-9921', date: 'Oct 24, 2023', status: 'Delivered', total: 1299, items: 1 },
    { id: 'VX-8842', date: 'Sep 12, 2023', status: 'In Transit', total: 2450, items: 3 }
  ];

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <p>No orders yet. Your future purchases will appear here.</p>
      </div>`;
    return;
  }

  let html = '';
  orders.forEach(order => {
    const statusColor = order.status === 'Delivered' ? '#4ade80' : '#8da4d3';
    html += `
      <div class="order-card" style="padding:25px;background:rgba(255,255,255,0.05);border-radius:20px;margin-bottom:15px;border:1px solid rgba(79,116,163,0.2);">
        <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
          <div>
            <h4 style="color:white;margin:0;">Order #${order.id}</h4>
            <span style="color:#8da4d3;font-size:12px;">${order.date}</span>
          </div>
          <span style="color:${statusColor};font-weight:700;font-size:14px;">${order.status}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#8da4d3;">${order.items} ${order.items === 1 ? 'Item' : 'Items'}</span>
          <span style="color:white;font-weight:700;">₹${order.total}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// PROFILE EDITING & PHOTO UPLOADS
function uploadProfilePic() {
  document.getElementById('profilePicInput').click();
}

function handleProfilePicUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentUser) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    currentUser.profile_pic = dataUrl;

    // Update UI components
    const profileImg = document.getElementById('profilePageAvatarImg');
    const profileInitial = document.getElementById('profilePageAvatarInitial');
    const mainAvatarImg = document.getElementById('profileAvatarImg');
    const mainAvatarInitial = document.getElementById('profileAvatarInitial');

    if (profileImg) {
      profileImg.src = dataUrl;
      profileImg.style.display = 'block';
    }
    if (profileInitial) profileInitial.style.display = 'none';

    if (mainAvatarImg) {
      mainAvatarImg.src = dataUrl;
      mainAvatarImg.style.display = 'block';
    }
    if (mainAvatarInitial) mainAvatarInitial.style.display = 'none';

    saveUserToLocal();
    showLiveActivity('✨ Profile picture updated!', 'success');
  };
  reader.readAsDataURL(file);
}


function showEditProfilePage() {
  if (!currentUser) return;

  // Populate form
  const nameInput = document.getElementById('editName');
  const userInput = document.getElementById('editUsername');
  const bioInput = document.getElementById('editBio');
  const collegeInput = document.getElementById('editCollege');
  const regNoInput = document.getElementById('editRegNo');

  if (nameInput) nameInput.value = currentUser.username || ''; // Standard username as name
  if (userInput) userInput.value = currentUser.username || '';
  if (bioInput) bioInput.value = currentUser.bio || '';
  if (collegeInput) collegeInput.value = currentUser.college || '';
  if (regNoInput) regNoInput.value = currentUser.registration_number || '';

  showPage('editProfile');
}

async function saveProfileChanges() {
  if (!currentUser) return;

  const newName = document.getElementById('editName').value;
  const newUsername = document.getElementById('editUsername').value;
  const newBio = document.getElementById('editBio').value;
  const newCollege = document.getElementById('editCollege').value;
  const newRegNo = document.getElementById('editRegNo').value;

  try {
    showMessage('Saving profile...', 'info');

    const result = await apiCall('/api/profile/update', 'PUT', {
      username: newUsername,
      bio: newBio,
      college: newCollege,
      registration_number: newRegNo
    });

    if (result.success) {
      // Update currentUser with server response
      currentUser = result.user;
      saveUserToLocal();

      // Refresh UI
      const userNameDisplay = document.getElementById('userName');
      if (userNameDisplay) userNameDisplay.textContent = currentUser.username;

      showProfilePage(currentUser);
      showLiveActivity('🚀 Profile updated! VIBE HARD.', 'success');
    }
  } catch (error) {
    console.error('Save profile error:', error);
    showMessage('❌ Failed to save profile', 'error');
  }
}

function editProfileBio() {
  if (!currentUser) return;
  const modal = document.getElementById('bioEditModal');
  const textarea = document.getElementById('modalBioText');
  const userInput = document.getElementById('modalUsernameText');
  const countDisplay = document.getElementById('bioCharCount');

  if (modal) {
    if (textarea) {
      textarea.value = currentUser.bio || '';
      if (countDisplay) countDisplay.textContent = `${textarea.value.length}/200`;

      // Character counter
      textarea.oninput = () => {
        if (countDisplay) countDisplay.textContent = `${textarea.value.length}/200`;
      };
    }
    if (userInput) userInput.value = currentUser.username || '';

    modal.style.display = 'flex';
  }
}

function saveBioFromModal() {
  const textarea = document.getElementById('modalBioText');
  const userInput = document.getElementById('modalUsernameText');

  if (currentUser) {
    let changed = false;

    if (textarea) {
      const newBio = textarea.value;
      if (currentUser.bio !== newBio) {
        currentUser.bio = newBio;
        changed = true;
      }
    }

    if (userInput) {
      const newUsername = userInput.value.trim();
      if (newUsername && currentUser.username !== newUsername) {
        currentUser.username = newUsername;
        changed = true;

        // Update global UI elements for username
        const navUsername = document.getElementById('userName');
        if (navUsername) navUsername.textContent = newUsername;
      }
    }

    if (changed) {
      saveUserToLocal();
      showProfilePage(currentUser);
      showLiveActivity('🚀 Profile updated! Looking fresh.', 'success');
    }

    closeModal('bioEditModal');
  }
}

function editShippingAddress() {
  // Can be part of edit profile too, but for now keeping it simple
  const modal = prompt("Enter Shipping Address:", "Excellence Residency, Block B...");
  if (modal) {
    const container = document.getElementById('shippingAddressContent');
    if (container) container.innerHTML = `<p>${modal}</p>`;
    showLiveActivity('🚚 Shipping info updated!', 'success');
  }
}

function saveUserToLocal() {
  if (currentUser) {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
}


// ========================================
// NAVIGATION
// ========================================

// ==========================================
// HEADER AUTO-HIDE — for communities, posts, realvibe
// ==========================================

let _headerHideTimer = null;

function enableHeaderAutohide() {
  const header = document.querySelector('.header');
  if (!header) return;

  document.body.classList.add('header-autohide');
  header.classList.remove('header-peeking');

  // Immediately expand whatsapp container to full height when header hides
  const chatContainer = document.querySelector('.whatsapp-container');
  if (chatContainer) {
    chatContainer.style.top = '0';
    chatContainer.style.height = '100vh';
  }

  // Create hover zone if not exists
  let zone = document.getElementById('headerHoverZone');
  if (!zone) {
    zone = document.createElement('div');
    zone.id = 'headerHoverZone';
    zone.className = 'header-hover-zone';
    document.body.appendChild(zone);
  }

  // Remove old listeners first
  document.removeEventListener('mousemove', _headerMouseMove);
  zone.removeEventListener('mouseenter', _headerZoneEnter);
  header.removeEventListener('mouseleave', _headerMouseLeave);
  header.removeEventListener('mouseenter', _headerMouseEnter);

  // Show on mouse near top (within 60px)
  document.addEventListener('mousemove', _headerMouseMove);
  // Also show when hovering the zone directly
  zone.addEventListener('mouseenter', _headerZoneEnter);
  // Cancel hide timer when mouse enters header
  header.addEventListener('mouseenter', _headerMouseEnter);
  // Hide when mouse leaves header
  header.addEventListener('mouseleave', _headerMouseLeave);

  // Touch: show on tap near top
  document.addEventListener('touchstart', _headerTouchStart, { passive: true });
}

function disableHeaderAutohide() {
  const header = document.querySelector('.header');
  if (!header) return;

  document.body.classList.remove('header-autohide');
  header.classList.remove('header-peeking');

  // Restore chat container below header
  const chatContainer = document.querySelector('.whatsapp-container');
  if (chatContainer) {
    const headerH = header.offsetHeight || 72;
    chatContainer.style.top = headerH + 'px';
    chatContainer.style.height = `calc(100vh - ${headerH}px)`;
  }

  document.removeEventListener('mousemove', _headerMouseMove);
  document.removeEventListener('touchstart', _headerTouchStart);
  header.removeEventListener('mouseenter', _headerMouseEnter);

  const zone = document.getElementById('headerHoverZone');
  if (zone) zone.remove();

  clearTimeout(_headerHideTimer);
}

function _headerMouseMove(e) {
  const header = document.querySelector('.header');
  if (!header) return;

  if (e.clientY <= 60) {
    // Mouse is near top — show header
    clearTimeout(_headerHideTimer);
    header.classList.add('header-peeking');
    // Shrink container to make room for header
    const cont = document.querySelector('.whatsapp-container');
    if (cont) {
      const hh = header.offsetHeight || 72;
      cont.style.top = hh + 'px';
      cont.style.height = `calc(100vh - ${hh}px)`;
    }
  } else if (e.clientY > 120 && !header.contains(e.target)) {
    // Mouse moved well away AND is not over the header — start hide timer
    clearTimeout(_headerHideTimer);
    _headerHideTimer = setTimeout(() => {
      // Only hide if mouse is still not on the header itself
      if (!header.matches(':hover')) {
        header.classList.remove('header-peeking');
        // Re-expand container when header hides
        const cont = document.querySelector('.whatsapp-container');
        if (cont) { cont.style.top = '0'; cont.style.height = '100vh'; }
      }
    }, 800);
  }
}

function _headerZoneEnter() {
  const header = document.querySelector('.header');
  if (header) {
    clearTimeout(_headerHideTimer);
    header.classList.add('header-peeking');
    // Shrink container to make room
    const cont = document.querySelector('.whatsapp-container');
    if (cont) {
      const hh = header.offsetHeight || 72;
      cont.style.top = hh + 'px';
      cont.style.height = `calc(100vh - ${hh}px)`;
    }
  }
}

function _headerMouseEnter() {
  // Cancel any pending hide timer when mouse enters the header
  clearTimeout(_headerHideTimer);
}

function _headerMouseLeave() {
  _headerHideTimer = setTimeout(() => {
    const header = document.querySelector('.header');
    if (header) header.classList.remove('header-peeking');
  }, 600);
}

function _headerTouchStart(e) {
  const header = document.querySelector('.header');
  if (!header) return;
  const touch = e.touches[0];
  if (touch && touch.clientY <= 60) {
    clearTimeout(_headerHideTimer);
    header.classList.add('header-peeking');
    _headerHideTimer = setTimeout(() => header.classList.remove('header-peeking'), 3000);
  }
}

function showPage(name, e) {
  if (e) e.preventDefault();

  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(name);
  if (page) page.style.display = 'block';

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (e?.target) e.target.classList.add('active');

  if (name === 'posts') loadPosts();
  else if (name === 'communities') loadCommunities();
  else if (name === 'vibeshop') loadVibeshopPage();

  // Hide footer on communities, posts, realvibe
  const footer = document.getElementById('mainFooter');
  if (footer) {
    const noFooterPages = ['communities', 'posts', 'realvibe'];
    footer.style.display = noFooterPages.includes(name) ? 'none' : '';
  }

  // Auto-hide header on communities, posts, realvibe
  const autoHidePages = ['communities', 'posts', 'realvibe'];
  if (autoHidePages.includes(name)) {
    enableHeaderAutohide();
  } else {
    disableHeaderAutohide();
  }

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

function goToActiveUniversities() {
  showPage('home');
  const section = document.getElementById('active-universities');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
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

      // Update local post count
      if (currentUser) {
        currentUser.postCount = (currentUser.postCount || 0) + 1;
        saveUserToLocal();
      }

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
  } catch (error) {
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
  } catch (error) {
    console.error('❌ Load posts:', error);
    feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:#ff6b6b;">❌ Failed to load</div>';
  }
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;

  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');

    // Update local post count
    if (currentUser) {
      currentUser.postCount = Math.max(0, (currentUser.postCount || 0) - 1);
      saveUserToLocal();
    }

    const postEl = document.getElementById(`post-${postId}`);
    if (postEl) postEl.remove();

    setTimeout(() => loadPosts(), 500);
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  switch (platform) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(url);
        showMessage('✅ Link copied!', 'success');
        closeShareModal();
      } catch (err) {
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
        } catch (err) {
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
  } catch (error) {
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

  switch (filterName) {
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
  } catch (error) {
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

function loadVibeshopPage() {
  console.log('🛍️ Loading VibeShop Page');
}




// ========================================
// REWARDS ROADMAP SYSTEM
// ========================================

const roadmapLevels = {};

function updateRoadmapUI() {
  // Roadmaps removed for VibeShop refactor
}


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
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
  const realVibePage = document.getElementById('realvibe');
  if (realVibePage) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
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
// SUBSCRIPTION SYSTEM - RAZORPAY INTEGRATION
// ==========================================

function openSubscriptionPopup() {
  const popup = document.getElementById('subscriptionPopup');
  if (popup) {
    showSubView('subscriptionIntro');
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
    updatePlanPricing();
  }
}

function closeSubscriptionPopup() {
  const popup = document.getElementById('subscriptionPopup');
  if (popup) {
    popup.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

function showSubView(viewId) {
  document.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

function showAllPlansView() {
  showSubView('subscriptionPlansView');
}

function showIntroView() {
  showSubView('subscriptionIntro');
}

function viewAllPlans() {
  showAllPlansView();
}

function updatePlanPricing() {
  const isFirstTime = !currentUser || !currentUser.hasSubscribed;
  const noblePrice = document.getElementById('noblePrice');
  const royalPrice = document.getElementById('royalPrice');
  if (noblePrice) noblePrice.textContent = '₹9';
  if (royalPrice) royalPrice.textContent = '₹25';
}

async function selectPlan(planType) {
  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    closeSubscriptionPopup();
    showAuthPopup();
    return;
  }

  const plans = {
    noble: { name: 'Noble', firstTimePrice: 9, regularPrice: 9, posters: 5, videos: 1, days: 15 },
    royal: { name: 'Royal', firstTimePrice: 25, regularPrice: 25, posters: 5, videos: 3, days: 23 }
  };

  const plan = plans[planType];
  if (!plan) { showMessage('❌ Invalid plan', 'error'); return; }

  const isFirstTime = !currentUser.hasSubscribed;
  const price = isFirstTime ? plan.firstTimePrice : plan.regularPrice;

  // Show processing spinner in popup
  showSubView('subscriptionProcessing');

  try {
    const token = getToken();
    if (!token) {
      showMessage('⚠️ Session expired. Please login again.', 'error');
      closeSubscriptionPopup();
      showAuthPopup();
      return;
    }

    // Step 1: Create order on backend
    const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount: price, planType, isFirstTime })
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.success) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    // Step 2: Open REAL Razorpay Checkout - money goes to YOUR account
    showIntroView(); // Hide processing while Razorpay opens

    const rzpOptions = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount * 100, // Razorpay wants paise
      currency: 'INR',
      name: 'VibeXpert',
      description: `${plan.name} Plan - ${plan.days} Days`,
      image: 'https://vibexpert.online/assets/logo.png',
      order_id: orderData.orderId,
      prefill: {
        name: currentUser.name || currentUser.username || '',
        email: currentUser.email || ''
      },
      theme: { color: '#FFD700' },
      handler: async function (response) {
        // Payment successful on Razorpay's side - now verify on our backend
        showSubView('subscriptionProcessing');
        try {
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // Update local user data
            currentUser.subscription = {
              plan: planType,
              startDate: new Date(),
              endDate: new Date(verifyData.subscription ? verifyData.subscription.endDate : Date.now() + plan.days * 86400000),
              posters: plan.posters,
              videos: plan.videos,
              postersUsed: 0,
              videosUsed: 0
            };
            currentUser.hasSubscribed = true;
            currentUser.isPremium = true;
            localStorage.setItem('user', JSON.stringify(currentUser));

            // Show success in popup
            const successEl = document.getElementById('successPlanDetails');
            if (successEl) {
              successEl.innerHTML = `<strong>${plan.name} Plan</strong> activated!<br>` +
                `📸 ${plan.posters} Posters + 🎥 ${plan.videos} Video${plan.videos > 1 ? 's' : ''}<br>` +
                `⏰ Valid for ${plan.days} days<br>` +
                `<small style="opacity:0.7">Payment ID: ${response.razorpay_payment_id}</small>`;
            }
            showSubView('subscriptionSuccess');
            updatePremiumBadge();
            showMessage('🎉 Subscription activated!', 'success');
          } else {
            throw new Error(verifyData.error || 'Verification failed');
          }
        } catch (vErr) {
          console.error('Payment verification error:', vErr);
          showSubView('subscriptionFailed');
          showMessage('❌ Payment verification failed', 'error');
        }
      },
      modal: {
        ondismiss: function () {
          showIntroView();
          showMessage('Payment cancelled', 'error');
        }
      }
    };

    const rzp = new Razorpay(rzpOptions);
    rzp.on('payment.failed', function (resp) {
      console.error('Razorpay payment failed:', resp.error);
      showSubView('subscriptionFailed');
      showMessage('❌ Payment failed: ' + (resp.error.description || 'Unknown error'), 'error');
    });
    rzp.open();

  } catch (error) {
    console.error('Subscription error:', error);
    showSubView('subscriptionFailed');
    showMessage('❌ ' + (error.message || 'Payment failed. Please try again.'), 'error');
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
  if (typeof createConfetti === 'function') createConfetti();
}

// Check subscription status
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

// Display premium badge if user is subscribed
function updatePremiumBadge() {
  const userName = document.getElementById('userName');
  if (!userName || !currentUser) return;
  const subscription = checkSubscriptionStatus();
  if (subscription) {
    const planEmoji = subscription.plan === 'royal' ? '👑' : '🥈';
    const badgeClass = subscription.plan === 'royal' ? 'royal-verified' : 'noble-verified';
    userName.innerHTML = `${planEmoji} Hi, ${currentUser.username} <span class="premium-verification-badge ${badgeClass}">✓</span>`;
  } else {
    userName.textContent = 'Hi, ' + currentUser.username;
  }
}

// Fetch subscription status from backend on login
async function fetchSubscriptionStatus() {
  if (!currentUser) return;
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`${API_URL}/api/subscription/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.subscription) {
      currentUser.subscription = {
        plan: data.subscription.plan,
        startDate: data.subscription.startDate,
        endDate: data.subscription.endDate,
        posters: data.subscription.postersQuota || 5,
        videos: data.subscription.videosQuota || 1,
        postersUsed: 0,
        videosUsed: 0
      };
      currentUser.isPremium = true;
      currentUser.hasSubscribed = true;
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      currentUser.isPremium = false;
      currentUser.subscription = null;
    }
    updatePremiumBadge();
  } catch (err) {
    console.error('Failed to fetch subscription status:', err);
  }
}

// Call this after login
document.addEventListener('DOMContentLoaded', function () {
  if (currentUser) {
    fetchSubscriptionStatus();
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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

console.log('✨ RealVibe features initialized!')



// ========================================
// WHATSAPP CHAT FIXES - JAVASCRIPT
// Scrolling + Typing Indicator Solutions
// ========================================

/**
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. Add these functions to your vibemap.js file
 * 2. Call initWhatsAppChatFixes() when community chat loads
 * 3. Update your existing Socket.IO listeners
 */

// ==========================================
// SCROLL MANAGEMENT
// ==========================================

/**
 * Scroll to bottom of WhatsApp messages
 */
function scrollWhatsAppToBottom(smooth = true) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  if (smooth) {
    messagesEl.scrollTo({
      top: messagesEl.scrollHeight,
      behavior: 'smooth'
    });
  } else {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

/**
 * Check if user is at bottom of chat (within 100px threshold)
 */
function isWhatsAppAtBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return true;

  const threshold = 100;
  const position = messagesEl.scrollTop + messagesEl.clientHeight;
  const bottom = messagesEl.scrollHeight;

  return (bottom - position) < threshold;
}

/**
 * Enhanced appendWhatsAppMessage with smart auto-scroll
 */
// ==========================================
// WHATSAPP-STYLE DATE SEPARATOR HELPERS
// ==========================================

let _lastChatDateLabel = null;

function formatDateLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - msgDay) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 4) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

function insertDateSeparatorIfNeeded(messagesEl, messageTime) {
  const label = formatDateLabel(messageTime);
  if (label === _lastChatDateLabel) return false;
  _lastChatDateLabel = label;
  const sep = document.createElement('div');
  sep.className = 'wa-date-separator';
  sep.setAttribute('data-date-label', label);
  sep.innerHTML = `<span>${label}</span>`;
  messagesEl.appendChild(sep);
  return true;
}

function resetChatDateTracking() {
  _lastChatDateLabel = null;
}

// ==========================================
// WHATSAPP MESSAGE APPEND
// ==========================================

function appendWhatsAppMessage(msg) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  const sender = (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || 'User';
  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));

  // ✅ CRITICAL: Enhanced duplicate detection
  const existingMsg = document.getElementById(`wa-msg-${messageId}`);
  if (existingMsg && !msg.isTemp) {
    console.log('⚠️ Duplicate detected, skipping:', messageId);
    return;
  }

  // ✅ Remember if user was at bottom
  const wasAtBottom = (messagesEl.scrollTop + messagesEl.clientHeight >= messagesEl.scrollHeight - 100);

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now();

  let messageHTML = '';

  if (!isOwn) {
    messageHTML += `<div class="message-sender-name">${escapeHtml(sender)}</div>`;
  }

  // ✅ FIX: Render media in the base appendWhatsAppMessage function
  let baseMediaHTML = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      baseMediaHTML = `<video class="msg-media" src="${msg.media_url}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      baseMediaHTML = `<audio class="msg-media" src="${msg.media_url}" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      baseMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      baseMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      baseMediaHTML = `<img class="msg-media" src="${msg.media_url}" alt="image" onclick="openImageViewer(this.src)">`;
    }
  }

  messageHTML += `
    <div class="message-bubble">
      ${baseMediaHTML}
      <div class="message-text">${escapeHtml(msg.text || msg.content || '')}</div>
      <div class="message-meta">
        <span class="message-time">${timeLabel}</span>
        ${isOwn ? `<span class="message-status">${msg.isTemp ? '⏳' : '✓✓'}</span>` : ''}
      </div>
      ${isOwn ? '<div class="message-tail own-tail"></div>' : '<div class="message-tail other-tail"></div>'}
    </div>
  `;

  wrapper.innerHTML = messageHTML;

  // 📅 WhatsApp-style date separator
  insertDateSeparatorIfNeeded(messagesEl, messageTime);

  messagesEl.appendChild(wrapper);

  // ✅ Smart scroll: only if user was already at bottom OR it's own message
  if (isOwn || wasAtBottom) {
    scrollToBottom();
  }

  if (!isOwn && !msg.isTemp) {
    playMessageSound('receive');
  }
}

// ==========================================
// TYPING INDICATOR
// ==========================================

let typingUsersSet = new Set();
let typingIndicatorTimeout = null;

/**
 * Show typing indicator for a user
 */
function showWhatsAppTypingIndicator(username) {
  if (!username || username === currentUser?.username) return;

  typingUsersSet.add(username);
  updateWhatsAppTypingDisplay();
}

/**
 * Hide typing indicator for a user
 */
function hideWhatsAppTypingIndicator(username) {
  typingUsersSet.delete(username);
  updateWhatsAppTypingDisplay();
}

/**
 * Update typing indicator display
 */
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

  // Auto-scroll to show typing indicator
  scrollWhatsAppToBottom(true);
}

/**
 * Handle user typing in input
 */
function handleWhatsAppTyping() {
  if (!socket || !currentUser || !currentUser.college) return;

  const now = Date.now();

  // Emit typing event (throttled to every 2 seconds)
  if (!window.lastWhatsAppTypingEmit || (now - window.lastWhatsAppTypingEmit) > 2000) {
    socket.emit('typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
    window.lastWhatsAppTypingEmit = now;
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

// ==========================================
// SOCKET.IO LISTENERS
// ==========================================

/**
 * Setup Socket.IO listeners for WhatsApp chat
 */
function setupWhatsAppSocketListeners() {
  if (!socket) return;

  console.log('✅ Setting up WhatsApp Socket listeners');

  // ✅ Remove old listeners to prevent duplicates
  socket.off('new_message');
  socket.off('user_typing');
  socket.off('user_stop_typing');
  socket.off('message_deleted');
  socket.off('messages_seen');

  // New message received (only from OTHER users - backend excludes sender)
  socket.on('new_message', (message) => {
    console.log('📨 New message received:', message);

    // ✅ Double-check it's not from current user (shouldn't happen with backend fix)
    if (message.sender_id === currentUser?.id) {
      console.log('⚠️ Ignoring own message from socket');
      return;
    }

    appendWhatsAppMessage(message);
  });

  // User started typing
  socket.off('user_typing').on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username) {
      showWhatsAppTypingIndicator(data.username);
    }
  });

  // User stopped typing
  socket.off('user_stop_typing').on('user_stop_typing', (data) => {
    if (data.username) {
      hideWhatsAppTypingIndicator(data.username);
    }
  });

  // Message deleted
  socket.off('message_deleted').on('message_deleted', ({ id }) => {
    const messageEl = document.getElementById(`wa-msg-${id}`);
    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }
  });

  // ✅ SEEN BY — someone in the room has seen messages up to lastMsgId
  socket.on('messages_seen', (data) => {
    const { username, avatar, lastMsgId } = data;
    if (!username) return;

    // Store in global map
    if (!window._msgSeenBy) window._msgSeenBy = {};
    if (!window._msgSeenBy[lastMsgId]) window._msgSeenBy[lastMsgId] = [];
    const already = window._msgSeenBy[lastMsgId].find(u => u.username === username);
    if (!already) window._msgSeenBy[lastMsgId].push({ username, avatar: avatar || '👤' });

    // Find the last own message and mark it seen with blue ticks + avatar row
    const allOwn = document.querySelectorAll('.whatsapp-message.own');
    if (!allOwn.length) return;
    const lastOwnMsg = allOwn[allOwn.length - 1];
    const lastOwnId = lastOwnMsg.id.replace('wa-msg-', '');

    // Blue double ticks
    const statusEl = document.getElementById('status-' + lastOwnId);
    if (statusEl) {
      statusEl.innerHTML = '<span class="tick tick-seen">✓✓</span>';
    }

    // Seen-by avatars row
    const seenByRow = document.getElementById('seenby-' + lastOwnId);
    if (seenByRow) {
      // Collect ALL people who have seen ANY message (show under last message)
      const allSeenUsers = [];
      const seen = new Set();
      Object.values(window._msgSeenBy).forEach(arr => {
        arr.forEach(u => {
          if (!seen.has(u.username)) { seen.add(u.username); allSeenUsers.push(u); }
        });
      });
      seenByRow.innerHTML = allSeenUsers.slice(0, 5).map(u =>
        `<span class="seen-avatar-chip" title="${u.username}">${u.avatar}</span>`
      ).join('');
    }
  });
}

// ==========================================
// SEEN BY — emit to server when user views chat
// ==========================================

function emitMarkSeen(lastMsgId) {
  if (!socket || !currentUser || !currentUser.college || !lastMsgId) return;
  // Don't emit for temp IDs
  if (String(lastMsgId).startsWith('temp-') || String(lastMsgId).startsWith('tmp-')) return;
  socket.emit('mark_seen', {
    collegeName: currentUser.college,
    username: currentUser.username || 'User',
    avatar: currentUser.avatar || '👤',
    lastMsgId: lastMsgId
  });
}

// Also emit mark_seen when user scrolls to bottom of chat
(function () {
  function attachScrollSeen() {
    const container = document.getElementById('whatsappMessages');
    if (!container) return;
    container.addEventListener('scroll', function () {
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
      if (!atBottom) return;
      const msgs = container.querySelectorAll('.whatsapp-message.other');
      if (!msgs.length) return;
      const lastMsg = msgs[msgs.length - 1];
      const lastId = lastMsg.id.replace('wa-msg-', '');
      if (lastId) emitMarkSeen(lastId);
    });
  }
  // Try immediately and also after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachScrollSeen);
  } else {
    attachScrollSeen();
  }
  // Also re-attach whenever community chat loads
  const _orig = window.openCommunityChat;
  if (typeof _orig === 'function') {
    window.openCommunityChat = function () {
      _orig.apply(this, arguments);
      setTimeout(attachScrollSeen, 600);
    };
  }
})();

// ==========================================
// ENHANCED SEND MESSAGE
// ==========================================

/**
 * Enhanced appendWhatsAppMessage to ensure reliable rendering
 */
function appendWhatsAppMessageFixed(msg) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  // Determine if it's a temp message based on ID or flag
  const isTemp = msg.isTemp || (msg.id && typeof msg.id === 'string' && (msg.id.startsWith('temp-') || msg.id.startsWith('tmp-')));

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  // robust sender name logic
  const sender = (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || 'User';

  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));


  // ✅ CRITICAL: Enhanced duplicate detection
  const existingMsg = document.getElementById(`wa-msg-${messageId}`);
  if (existingMsg && !isTemp) {
    console.log('⚠️ Duplicate detected, skipping:', messageId);
    return;
  }

  // ✅ Remember if user was at bottom
  const wasAtBottom = (messagesEl.scrollTop + messagesEl.clientHeight >= messagesEl.scrollHeight - 100);

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now();

  let messageHTML = '';

  if (!isOwn) {
    const safeSender = typeof escapeHtml === 'function' ? escapeHtml(sender) : sender;
    messageHTML += `<div class="message-sender-name">${safeSender}</div>`;
  }

  const contentRaw = msg.text || msg.content || '';
  const contentText = typeof escapeHtml === 'function' ? escapeHtml(contentRaw) : contentRaw;

  // Media (image/video/audio/pdf/document)
  let mediaHTML = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      mediaHTML = `<video class="msg-media" src="${msg.media_url}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      mediaHTML = `<audio class="msg-media" src="${msg.media_url}" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      mediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      mediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      mediaHTML = `<img class="msg-media" src="${msg.media_url}" alt="image" onclick="openImageViewer(this.src)">`;
    }
  }

  // Options bar (shown on hover)
  const optionsBar = `
    <div class="msg-options-bar">
      <button class="msg-opt-btn" onclick="showEmojiReactPicker('${messageId}', this)" title="React">😊</button>
      ${isOwn ? `<button class="msg-opt-btn" onclick="editChatMsg('${messageId}')" title="Edit">✏️</button>` : ''}
      ${isOwn ? `<button class="msg-opt-btn delete-opt" onclick="deleteChatMsg('${messageId}')" title="Delete">🗑️</button>` : ''}
      ${isOwn ? `<button class="msg-opt-btn seen-opt" onclick="showSeenBy('${messageId}')" title="Seen by">👁️</button>` : ''}
    </div>
  `;

  // Emoji reaction row
  const reactBar = `<div class="msg-react-bar" id="reacts-${messageId}"></div>`;

  messageHTML += `
    ${optionsBar}
    <div class="message-bubble" id="bubble-${messageId}">
      ${mediaHTML}
      <div class="message-text">${contentText}</div>
      <div class="message-meta">
        <span class="message-time">${timeLabel}</span>
        ${isOwn ? `<span class="message-status" id="status-${messageId}">${isTemp ? '<span class="tick tick-sending">⏳</span>' : '<span class="tick tick-sent">✓✓</span>'}</span>` : ''}
      </div>
      ${isOwn ? '<div class="message-tail own-tail"></div>' : '<div class="message-tail other-tail"></div>'}
    </div>
    ${reactBar}
    ${isOwn ? `<div class="seen-by-avatars" id="seenby-${messageId}"></div>` : ''}
  `;

  wrapper.innerHTML = messageHTML;

  // 📅 WhatsApp-style date separator
  insertDateSeparatorIfNeeded(messagesEl, messageTime);

  messagesEl.appendChild(wrapper);

  // If we received someone else's message and we're at the bottom → mark as seen
  if (!isOwn && !isTemp && wasAtBottom) { emitMarkSeen(messageId); }

  // ✅ Smart scroll: only if user was already at bottom OR it's own message
  if (isOwn || wasAtBottom) {
    if (messagesEl.scrollTo) {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    } else {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  if (!isOwn && !isTemp) {
    if (typeof playMessageSound === 'function') playMessageSound('receive');
  }
}

/**
 * Enhanced sendWhatsAppMessage with proper handling
 */
async function sendWhatsAppMessageFixed() {
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
      text: content,
      isTemp: true          // ← ADD THIS LINE
    };

    appendWhatsAppMessageFixed(tempMsg);
    input.value = '';
    input.style.height = 'auto';

    // Stop typing indicator immediately
    if (socket && currentUser.college) {
      socket.emit('stop_typing', {
        collegeName: currentUser.college,
        username: currentUser.username
      });
    }

    // Send to server
    const response = await apiCall('/api/community/messages', 'POST', { content });

    if (response.success && response.message) {
      playMessageSound('send');

      // Remove temp message
      const tempEl = document.getElementById(`wa-msg-${tempMsg.id}`);
      if (tempEl) tempEl.remove();

      // Server excludes sender from socket broadcast, so we add the real message directly
      appendWhatsAppMessageFixed(response.message);
    }

  } catch (error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');

    // Remove temp message on error
    const tempEl = document.querySelector('[id^="wa-msg-temp-"]');
    if (tempEl) tempEl.remove();
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize all WhatsApp chat fixes
 * Call this when community chat is loaded
 */
function initWhatsAppChatFixes() {
  console.log('🔧 Initializing WhatsApp Chat Fixes...');

  // Setup socket listeners
  setupWhatsAppSocketListeners();

  // Setup input handler
  const input = document.getElementById('whatsappInput');
  if (input) {
    // Handle typing indicator
    input.addEventListener('input', handleWhatsAppTyping);

    // Auto-resize textarea
    input.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    });
  }



  console.log('✅ WhatsApp Chat Fixes Initialized!');
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when community page is shown
document.addEventListener('DOMContentLoaded', function () {
  const communitiesPage = document.getElementById('communities');

  if (communitiesPage) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.target.style.display !== 'none') {
          // Wait for WhatsApp chat to be rendered
          setTimeout(() => {
            const whatsappMain = document.getElementById('whatsappMain');
            if (whatsappMain && !whatsappMain.dataset.fixesApplied) {
              whatsappMain.dataset.fixesApplied = 'true';
              initWhatsAppChatFixes();

              // Load messages after initialization
              if (typeof loadWhatsAppMessages === 'function') {
                loadWhatsAppMessages();
              }
            }
          }, 100);
        }
      });
    });

    observer.observe(communitiesPage, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});

// Export for manual initialization
window.initWhatsAppChatFixes = initWhatsAppChatFixes;

console.log('📦 WhatsApp Chat Fixes Module Loaded');

// ==========================================
// FIX: Override existing functions
// ==========================================

// Store original functions
const originalAppendWhatsAppMessage = window.appendWhatsAppMessage;
const originalSendWhatsAppMessage = window.sendWhatsAppMessage;

// Override with fixed versions
window.appendWhatsAppMessage = appendWhatsAppMessageFixed;
window.sendWhatsAppMessage = sendWhatsAppMessageFixed;

console.log('✅ WhatsApp functions overridden with fixed versions');

// ==========================================
// NEW COMMUNITY CHAT LOGIC (5-Day Retention)
// ==========================================

let communitySocketInitialized = false;

function setupCommunitySocketListeners() {   // ← ADD THIS WHOLE FUNCTION
  if (!socket || communitySocketInitialized) return;
  communitySocketInitialized = true;
  socket.off('new_message');
  socket.on('new_message', (message) => {
    if (message.sender_id === currentUser?.id) return;
    appendCommunityMessage(message);
  });
  socket.on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username)
      showTypingIndicator(data.username);
  });
  socket.on('user_stop_typing', (data) => {
    if (data.username) hideTypingIndicator(data.username);
  });
  socket.on('message_deleted', ({ id }) => {
    const el = document.getElementById(`wa-msg-${id}`) || document.getElementById(`msg-${id}`);
    if (el) { el.style.animation = 'fadeOut 0.3s ease'; setTimeout(() => el.remove(), 300); }
  });
}

function initCommunityChat() {

  console.log('💬 Initializing Community Chat...');

  // Reload user from storage to be sure
  if (!currentUser) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing user', e);
    }
  }

  console.log('👤 Current User Status:', currentUser ? 'Logged In' : 'Null', currentUser?.college);

  const chatState = document.getElementById('communityChatState');
  const joinState = document.getElementById('joinCommunityState');
  const communitySection = document.getElementById('communities');

  if (!currentUser || !currentUser.college) {
    console.log('❌ User not joined to a college. Showing Join State.');
    if (joinState) {
      joinState.style.display = 'flex';
      joinState.classList.remove('hidden');
    }
    if (chatState) {
      chatState.style.display = 'none';
      chatState.classList.add('hidden');
    }
    return;
  }

  // User is joined
  console.log('✅ User is joined. Showing Chat State.');
  if (joinState) {
    joinState.style.display = 'none';
    joinState.classList.add('hidden');
  }
  if (chatState) {
    chatState.style.display = 'flex';
    chatState.classList.remove('hidden');
  }

  // Update Header
  const title = document.getElementById('communityTitle');
  if (title) title.textContent = `Welcome to ${currentUser.college}`;

  // Join Socket Room
  if (socket) {
    console.log('🔌 Joining socket room:', currentUser.college);
    socket.emit('join_college', currentUser.college);
    setupCommunitySocketListeners();
  }

  // Ensure chat container is positioned correctly relative to header
  requestAnimationFrame(() => {
    const header = document.querySelector('.header');
    const chatContainer = document.querySelector('.whatsapp-container');
    if (header && chatContainer) {
      if (document.body.classList.contains('header-autohide')) {
        chatContainer.style.top = '0';
        chatContainer.style.height = '100vh';
      } else {
        const hh = header.offsetHeight || 72;
        chatContainer.style.top = hh + 'px';
        chatContainer.style.height = `calc(100vh - ${hh}px)`;
      }
    }
  });

  // Load Messages
  loadCommunityMessages();
}

async function loadCommunityMessages() {
  try {
    const messagesArea = document.getElementById('chatMessages');
    if (!messagesArea) return;

    // Keep welcome message
    const welcomeMsg = messagesArea.querySelector('.chat-welcome-message');
    messagesArea.innerHTML = '';
    if (welcomeMsg) messagesArea.appendChild(welcomeMsg);

    const data = await apiCall('/api/community/messages');

    if (data.success && data.messages) {
      // Mark where unread starts (last seen timestamp from localStorage)
      const lastSeen = localStorage.getItem('lastSeenTime_' + currentUser.college) || 0;
      let firstUnreadEl = null;

      data.messages.forEach(msg => {
        appendWhatsAppMessageFixed(msg);
        const msgTime = new Date(msg.created_at || 0).getTime();
        const isUnread = msgTime > Number(lastSeen) && msg.sender_id !== currentUser.id;
        if (isUnread && !firstUnreadEl) {
          // Insert unread divider before this message
          const el = document.getElementById('whatsappMessages');
          const divider = document.createElement('div');
          divider.className = 'unread-divider';
          divider.innerHTML = '↑ Unread messages';
          if (el && el.lastChild) {
            el.insertBefore(divider, el.lastChild);
            firstUnreadEl = divider;
          }
        }
      });

      // Save current time as "last seen"
      localStorage.setItem('lastSeenTime_' + currentUser.college, Date.now());

      // Scroll to first unread, otherwise scroll to bottom
      if (firstUnreadEl) {
        firstUnreadEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const el = document.getElementById('whatsappMessages');
        if (el) el.scrollTop = el.scrollHeight;
      }

      // Emit mark_seen for the last OTHER message (user has now viewed the chat)
      const allOtherMsgs = document.querySelectorAll('.whatsapp-message.other');
      if (allOtherMsgs.length) {
        const lastOther = allOtherMsgs[allOtherMsgs.length - 1];
        const lastId = lastOther.id.replace('wa-msg-', '');
        if (lastId) emitMarkSeen(lastId);
      }
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

function appendCommunityMessage(msg) {
  const messagesArea = document.getElementById('chatMessages');
  if (!messagesArea) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  const senderName = msg.users?.username || 'User';
  const time = new Date(msg.created_at || msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${isOwn ? 'right' : 'left'}`;

  let mediaHtml = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      mediaHtml = `<video src="${msg.media_url}" class="chat-media-video" controls></video>`;
    } else if (msg.media_type === 'audio') {
      mediaHtml = `<audio src="${msg.media_url}" class="chat-media-audio" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      mediaHtml = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      mediaHtml = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      mediaHtml = `<img src="${msg.media_url}" class="chat-media-img" onclick="openImageViewer(this.src)">`;
    }
  }

  msgDiv.innerHTML = `
    ${!isOwn ? `<div class="chat-sender-name">${senderName}</div>` : ''}
    <div class="chat-bubble">
      ${msg.content || ''}
      ${mediaHtml}
      <div class="message-time">${time}</div>
    </div>
  `;

  messagesArea.appendChild(msgDiv);
  scrollToCommunityBottom();
}

function scrollToCommunityBottom() {
  const messagesArea = document.getElementById('chatMessages');
  if (messagesArea) {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

let selectedChatMedia = null;

function handleChatMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedChatMedia = file;
  const reader = new FileReader();

  const previewContainer = document.getElementById('chatMediaPreview');
  const imgPreview = document.getElementById('chatPreviewImg');
  const videoPreview = document.getElementById('chatPreviewVideo');

  if (previewContainer) {
    reader.onload = function (e) {
      previewContainer.style.display = 'block';

      if (file.type.startsWith('video/')) {
        videoPreview.src = e.target.result;
        videoPreview.style.display = 'block';
        imgPreview.style.display = 'none';
      } else {
        imgPreview.src = e.target.result;
        imgPreview.style.display = 'block';
        videoPreview.style.display = 'none';
      }
    };

    reader.readAsDataURL(file);
  }
}

function clearChatPreview() {
  selectedChatMedia = null;
  const input = document.getElementById('chatMediaInput');
  const preview = document.getElementById('chatMediaPreview');

  if (input) input.value = '';
  if (preview) preview.style.display = 'none';
}
// ==========================================
// CHAT MEDIA EDITOR — Full image/video editor popup
// ==========================================

let selectedWhatsAppMedia = null;

// ── State ─────────────────────────────────────────────────────
const _me = {
  file: null, origImg: null, canvas: null, ctx: null,
  rotation: 0, flipH: false, flipV: false,
  brightness: 0, contrast: 0, saturation: 0,
  filter: 'none',
  drawing: false, drawColor: '#ff3b6b', drawSize: 4,
  isDrawMode: false, isTextMode: false,
  cropMode: false, cropStart: null, cropEnd: null,
  lastX: 0, lastY: 0,
  videoSrc: null
};

const FILTERS = {
  none:    { label:'Original', css:'' },
  vivid:   { label:'Vivid',    css:'saturate(1.8) contrast(1.1)' },
  bw:      { label:'B&W',      css:'grayscale(1)' },
  warm:    { label:'Warm',     css:'sepia(0.4) saturate(1.3)' },
  cool:    { label:'Cool',     css:'hue-rotate(20deg) saturate(1.2)' },
  fade:    { label:'Fade',     css:'opacity(0.85) saturate(0.7)' },
  sharp:   { label:'Sharp',   css:'contrast(1.3) brightness(1.05)' },
  dreamy:  { label:'Dreamy',  css:'blur(0.4px) brightness(1.1) saturate(1.4)' }
};

function handleChatFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  _me.file = file;

  // Only open the editor for images and videos; send other files (audio, PDF, docs) directly
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
    openMediaEditor(file);
  } else {
    // Show a plain preview bar for audio / documents / PDFs
    selectedWhatsAppMedia = file;
    const bar = document.getElementById('chatFilePreviewBar');
    const img = document.getElementById('chatFilePreviewImg');
    const vid = document.getElementById('chatFilePreviewVideo');
    const nameEl = document.getElementById('chatFilePreviewName');
    if (bar) {
      if (img) img.style.display = 'none';
      if (vid) vid.style.display = 'none';
      if (nameEl) nameEl.textContent = file.name;
      bar.style.display = 'flex';
    }
  }
}

function openMediaEditor(file) {
  // Remove any existing editor
  document.getElementById('mediaEditorOverlay')?.remove();

  const isVideo = file.type.startsWith('video/');

  const overlay = document.createElement('div');
  overlay.id = 'mediaEditorOverlay';
  overlay.className = 'media-editor-overlay';

  overlay.innerHTML = `
    <div class="media-editor-modal">
      <div class="me-header">
        <button class="me-close-btn" onclick="closeMediaEditor()">✕</button>
        <h3 class="me-title">${isVideo ? '🎥 Video Preview' : '🖼️ Edit Photo'}</h3>
        <button class="me-send-btn" onclick="confirmMediaAndSend()">Send ➤</button>
      </div>

      <div class="me-body">
        ${isVideo ? buildVideoEditor() : buildImageEditor()}
      </div>

      ${!isVideo ? `
      <div class="me-toolbar">
        <!-- Tabs -->
        <div class="me-tabs">
          <button class="me-tab active" onclick="meSetTab(this,'filters')">🎨 Filters</button>
          <button class="me-tab" onclick="meSetTab(this,'adjust')">⚡ Adjust</button>
          <button class="me-tab" onclick="meSetTab(this,'transform')">↻ Transform</button>
          <button class="me-tab" onclick="meSetTab(this,'draw')">✏️ Draw</button>
          <button class="me-tab" onclick="meSetTab(this,'text')">T Text</button>
          <button class="me-tab" onclick="meSetTab(this,'crop')">✂️ Crop</button>
        </div>

        <!-- Filters Panel -->
        <div class="me-panel active" id="me-panel-filters">
          <div class="me-filters-row">
            ${Object.entries(FILTERS).map(([k,v]) =>
              `<button class="me-filter-pill ${k==='none'?'active':''}" onclick="meApplyFilter('${k}',this)">
                <span class="me-filter-icon">${filterIcon(k)}</span>
                <span>${v.label}</span>
              </button>`
            ).join('')}
          </div>
        </div>

        <!-- Adjust Panel -->
        <div class="me-panel" id="me-panel-adjust">
          <div class="me-slider-row">
            <label>☀️ Brightness</label>
            <input type="range" min="-100" max="100" value="0" oninput="meAdjust('brightness',this.value,this)">
            <span class="me-slider-val">0</span>
          </div>
          <div class="me-slider-row">
            <label>◑ Contrast</label>
            <input type="range" min="-100" max="100" value="0" oninput="meAdjust('contrast',this.value,this)">
            <span class="me-slider-val">0</span>
          </div>
          <div class="me-slider-row">
            <label>🎨 Saturation</label>
            <input type="range" min="-100" max="100" value="0" oninput="meAdjust('saturation',this.value,this)">
            <span class="me-slider-val">0</span>
          </div>
        </div>

        <!-- Transform Panel -->
        <div class="me-panel" id="me-panel-transform">
          <div class="me-btn-grid">
            <button class="me-tool-btn" onclick="meRotate(-90)">↺ Rotate L</button>
            <button class="me-tool-btn" onclick="meRotate(90)">↻ Rotate R</button>
            <button class="me-tool-btn" onclick="meFlip('H')">⇔ Flip H</button>
            <button class="me-tool-btn" onclick="meFlip('V')">⇕ Flip V</button>
            <button class="me-tool-btn danger" onclick="meReset()">↩ Reset All</button>
          </div>
        </div>

        <!-- Draw Panel -->
        <div class="me-panel" id="me-panel-draw">
          <div class="me-draw-controls">
            <label>Color:</label>
            <input type="color" value="#ff3b6b" oninput="_me.drawColor=this.value">
            <label>Size:</label>
            <input type="range" min="2" max="24" value="4" oninput="_me.drawSize=this.value">
            <button class="me-tool-btn ${_me.isDrawMode?'active':''}" id="meDrawToggle" onclick="meToggleDraw()">
              ${_me.isDrawMode?'🛑 Stop':'✏️ Start Draw'}
            </button>
            <button class="me-tool-btn danger" onclick="meUndoDraw()">↩ Undo</button>
          </div>
        </div>

        <!-- Text Panel -->
        <div class="me-panel" id="me-panel-text">
          <div class="me-text-controls">
            <input id="meTextInput" type="text" placeholder="Type text here..." class="me-text-field">
            <input type="color" value="#ffffff" id="meTextColor">
            <input type="range" min="12" max="72" value="28" id="meTextSize">
            <button class="me-tool-btn" onclick="meAddText()">Add Text ➕</button>
          </div>
        </div>

        <!-- Crop Panel -->
        <div class="me-panel" id="me-panel-crop">
          <div class="me-btn-grid">
            <button class="me-tool-btn ${_me.cropMode?'active':''}" id="meCropToggle" onclick="meToggleCrop()">✂️ Select Area</button>
            <button class="me-tool-btn" onclick="meApplyCrop()">✅ Apply Crop</button>
            <button class="me-tool-btn danger" onclick="meCancelCrop()">✕ Cancel</button>
            <button class="me-tool-btn" onclick="meCropAspect(1,1)">1:1</button>
            <button class="me-tool-btn" onclick="meCropAspect(16,9)">16:9</button>
            <button class="me-tool-btn" onclick="meCropAspect(4,3)">4:3</button>
          </div>
        </div>
      </div>
      ` : `
      <!-- Video caption -->
      <div class="me-toolbar" style="padding:14px;">
        <input id="meVideoCaption" type="text" placeholder="Add a caption (optional)..." class="me-text-field">
      </div>
      `}
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  if (!isVideo) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        _me.origImg = img;
        _me.rotation = 0; _me.flipH = false; _me.flipV = false;
        _me.brightness = 0; _me.contrast = 0; _me.saturation = 0;
        _me.filter = 'none'; _me.isDrawMode = false; _me.isTextMode = false;
        _me.cropMode = false; _me.cropStart = null; _me.cropEnd = null;
        meRenderCanvas();
        meAttachCanvasEvents();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    _me.videoSrc = URL.createObjectURL(file);
    const vid = document.getElementById('meVideoPreview');
    if (vid) vid.src = _me.videoSrc;
  }
}

function buildImageEditor() {
  return `<div class="me-canvas-wrap">
    <canvas id="meCanvas"></canvas>
    <canvas id="meCropCanvas" class="me-crop-canvas" style="display:none;"></canvas>
  </div>`;
}

function buildVideoEditor() {
  return `<div class="me-video-wrap">
    <video id="meVideoPreview" controls playsinline style="max-width:100%;max-height:340px;border-radius:12px;"></video>
  </div>`;
}

function filterIcon(k) {
  const icons = {none:'🌟',vivid:'✨',bw:'⬛',warm:'🌅',cool:'❄️',fade:'🌫️',sharp:'🔍',dreamy:'💜'};
  return icons[k]||'🎨';
}

// ── Rendering ─────────────────────────────────────────────────
function meRenderCanvas() {
  const canvas = document.getElementById('meCanvas');
  if (!canvas || !_me.origImg) return;
  _me.canvas = canvas;
  _me.ctx = canvas.getContext('2d');

  const maxW = canvas.parentElement.clientWidth - 16;
  const maxH = 340;
  const img = _me.origImg;

  const rad = (_me.rotation * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));
  const rotW = img.width * absCos + img.height * absSin;
  const rotH = img.width * absSin + img.height * absCos;

  const scale = Math.min(maxW / rotW, maxH / rotH, 1);
  canvas.width  = Math.round(rotW * scale);
  canvas.height = Math.round(rotH * scale);

  const ctx = _me.ctx;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(_me.flipH ? -1 : 1, _me.flipV ? -1 : 1);

  // CSS filter on canvas context (via filter property)
  let f = FILTERS[_me.filter]?.css || '';
  const b = _me.brightness;
  const c = _me.contrast;
  const s = _me.saturation;
  f += ` brightness(${1 + b/100}) contrast(${1 + c/100}) saturate(${1 + s/100})`;
  ctx.filter = f.trim();

  ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
  ctx.restore();
  ctx.filter = 'none';
}

// ── Tab switching ──────────────────────────────────────────────
function meSetTab(btn, panelId) {
  document.querySelectorAll('.me-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.me-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('me-panel-' + panelId)?.classList.add('active');
  if (panelId !== 'draw') { _me.isDrawMode = false; meUpdateDrawBtn(); }
  if (panelId !== 'crop') { _me.cropMode = false; meCancelCrop(); }
}

// ── Filters ───────────────────────────────────────────────────
function meApplyFilter(key, btn) {
  _me.filter = key;
  document.querySelectorAll('.me-filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  meRenderCanvas();
}

// ── Adjust ────────────────────────────────────────────────────
function meAdjust(prop, val, input) {
  _me[prop] = parseFloat(val);
  input.parentElement.querySelector('.me-slider-val').textContent = Math.round(val);
  meRenderCanvas();
}

// ── Transform ─────────────────────────────────────────────────
function meRotate(deg) { _me.rotation = ((_me.rotation + deg) % 360 + 360) % 360; meRenderCanvas(); }
function meFlip(dir)   { if (dir === 'H') _me.flipH = !_me.flipH; else _me.flipV = !_me.flipV; meRenderCanvas(); }
function meReset() {
  _me.rotation=0; _me.flipH=false; _me.flipV=false;
  _me.brightness=0; _me.contrast=0; _me.saturation=0;
  _me.filter='none'; _me.isDrawMode=false; _me.cropMode=false;
  _me.cropStart=null; _me.cropEnd=null;
  // Reset sliders
  document.querySelectorAll('#me-panel-adjust input[type=range]').forEach(s => { s.value=0; s.parentElement.querySelector('.me-slider-val').textContent='0'; });
  document.querySelectorAll('.me-filter-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.me-filter-pill')?.classList.add('active');
  meRenderCanvas();
}

// ── Draw ──────────────────────────────────────────────────────
let _meDrawHistory = [];
function meToggleDraw() {
  _me.isDrawMode = !_me.isDrawMode;
  _me.isTextMode = false;
  meUpdateDrawBtn();
}
function meUpdateDrawBtn() {
  const btn = document.getElementById('meDrawToggle');
  if (btn) btn.textContent = _me.isDrawMode ? '🛑 Stop' : '✏️ Start Draw';
}
function meUndoDraw() {
  if (!_meDrawHistory.length || !_me.canvas) return;
  const last = _meDrawHistory.pop();
  _me.ctx.putImageData(last, 0, 0);
}

// ── Text ──────────────────────────────────────────────────────
function meAddText() {
  const txt = document.getElementById('meTextInput')?.value.trim();
  if (!txt || !_me.canvas) return;
  const color = document.getElementById('meTextColor')?.value || '#ffffff';
  const size  = document.getElementById('meTextSize')?.value  || 28;
  const ctx = _me.ctx;
  // Save for undo
  _meDrawHistory.push(ctx.getImageData(0, 0, _me.canvas.width, _me.canvas.height));
  ctx.font = `bold ${size}px sans-serif`;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.strokeText(txt, _me.canvas.width/2, _me.canvas.height/2);
  ctx.fillText(txt, _me.canvas.width/2, _me.canvas.height/2);
  document.getElementById('meTextInput').value = '';
}

// ── Crop ──────────────────────────────────────────────────────
let _cropRect = null;
function meToggleCrop() {
  _me.cropMode = !_me.cropMode;
  const btn = document.getElementById('meCropToggle');
  if (btn) btn.textContent = _me.cropMode ? '✕ Stop Select' : '✂️ Select Area';
  if (!_me.cropMode) meCancelCrop();
}
function meCancelCrop() {
  _cropRect = null;
  _me.cropMode = false;
  const cc = document.getElementById('meCropCanvas');
  if (cc) { cc.style.display='none'; const ctx=cc.getContext('2d'); ctx.clearRect(0,0,cc.width,cc.height); }
}
function meCropAspect(w, h) {
  if (!_me.canvas) return;
  _me.cropMode = true;
  const cw=_me.canvas.width, ch=_me.canvas.height;
  const aspect=w/h;
  let rw,rh;
  if (cw/ch > aspect) { rh=ch*0.8; rw=rh*aspect; } else { rw=cw*0.8; rh=rw/aspect; }
  const rx=(cw-rw)/2, ry=(ch-rh)/2;
  _cropRect={x:rx,y:ry,w:rw,h:rh};
  meDrawCropOverlay();
}
function meDrawCropOverlay() {
  const cc = document.getElementById('meCropCanvas');
  if (!cc || !_me.canvas || !_cropRect) return;
  cc.width=_me.canvas.width; cc.height=_me.canvas.height;
  cc.style.display='block';
  const ctx=cc.getContext('2d');
  ctx.clearRect(0,0,cc.width,cc.height);
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,cc.width,cc.height);
  ctx.clearRect(_cropRect.x,_cropRect.y,_cropRect.w,_cropRect.h);
  ctx.strokeStyle='#4f74a3';
  ctx.lineWidth=2;
  ctx.strokeRect(_cropRect.x,_cropRect.y,_cropRect.w,_cropRect.h);
  // Grid lines
  ctx.strokeStyle='rgba(255,255,255,0.4)';
  ctx.lineWidth=1;
  for (let i=1;i<3;i++){
    ctx.beginPath(); ctx.moveTo(_cropRect.x+_cropRect.w*i/3,_cropRect.y); ctx.lineTo(_cropRect.x+_cropRect.w*i/3,_cropRect.y+_cropRect.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(_cropRect.x,_cropRect.y+_cropRect.h*i/3); ctx.lineTo(_cropRect.x+_cropRect.w,_cropRect.y+_cropRect.h*i/3); ctx.stroke();
  }
}
function meApplyCrop() {
  if (!_cropRect || !_me.canvas || !_me.ctx) return;
  const {x,y,w,h} = _cropRect;
  const imgData = _me.ctx.getImageData(x,y,w,h);
  _me.canvas.width=w; _me.canvas.height=h;
  _me.ctx.putImageData(imgData,0,0);
  meCancelCrop();
  // Reset origImg reference to the cropped version so re-renders stay cropped
  const tmp=document.createElement('canvas'); tmp.width=w; tmp.height=h;
  tmp.getContext('2d').putImageData(imgData,0,0);
  const ni=new Image(); ni.src=tmp.toDataURL();
  ni.onload=()=>{ _me.origImg=ni; };
}

// ── Canvas Events (draw + crop drag) ──────────────────────────
function meAttachCanvasEvents() {
  const canvas = document.getElementById('meCanvas');
  const cc     = document.getElementById('meCropCanvas');
  if (!canvas) return;

  function getPos(e, el) {
    const r=el.getBoundingClientRect();
    const cx=e.touches?e.touches[0].clientX:e.clientX;
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    return {x:cx-r.left, y:cy-r.top};
  }

  // Draw on main canvas
  canvas.addEventListener('mousedown', e => {
    if (!_me.isDrawMode) return;
    _meDrawHistory.push(_me.ctx.getImageData(0,0,canvas.width,canvas.height));
    _me.drawing=true;
    const p=getPos(e,canvas); _me.lastX=p.x; _me.lastY=p.y;
  });
  canvas.addEventListener('mousemove', e => {
    if (!_me.drawing||!_me.isDrawMode) return;
    const p=getPos(e,canvas);
    _me.ctx.beginPath();
    _me.ctx.moveTo(_me.lastX,_me.lastY);
    _me.ctx.lineTo(p.x,p.y);
    _me.ctx.strokeStyle=_me.drawColor;
    _me.ctx.lineWidth=_me.drawSize;
    _me.ctx.lineCap='round';
    _me.ctx.lineJoin='round';
    _me.ctx.stroke();
    _me.lastX=p.x; _me.lastY=p.y;
  });
  canvas.addEventListener('mouseup', ()=>{ _me.drawing=false; });
  canvas.addEventListener('mouseleave', ()=>{ _me.drawing=false; });

  // Touch draw
  canvas.addEventListener('touchstart', e=>{ e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:e.touches[0].clientX,clientY:e.touches[0].clientY})); },{passive:false});
  canvas.addEventListener('touchmove',  e=>{ e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousemove',{clientX:e.touches[0].clientX,clientY:e.touches[0].clientY})); },{passive:false});
  canvas.addEventListener('touchend',   ()=>canvas.dispatchEvent(new MouseEvent('mouseup')));

  // Crop drag on crop-canvas overlay
  if (cc) {
    let dragging=false, startX=0, startY=0;
    cc.addEventListener('mousedown', e=>{
      if (!_me.cropMode) return;
      dragging=true;
      const p=getPos(e,cc); startX=p.x; startY=p.y;
      _cropRect=null;
    });
    cc.addEventListener('mousemove', e=>{
      if (!dragging||!_me.cropMode) return;
      const p=getPos(e,cc);
      _cropRect={x:Math.min(startX,p.x),y:Math.min(startY,p.y),w:Math.abs(p.x-startX),h:Math.abs(p.y-startY)};
      meDrawCropOverlay();
    });
    cc.addEventListener('mouseup', ()=>{ dragging=false; });
  }
}

// ── Close / Confirm ───────────────────────────────────────────
function closeMediaEditor() {
  document.getElementById('mediaEditorOverlay')?.remove();
  clearChatFilePreview();
}

async function confirmMediaAndSend() {
  const isVideo = _me.file?.type.startsWith('video/');

  if (isVideo) {
    // Use original video file + caption
    selectedWhatsAppMedia = _me.file;
    const caption = document.getElementById('meVideoCaption')?.value.trim() || '';
    document.getElementById('whatsappInput').value = caption;
  } else {
    // Export edited canvas as Blob → File
    const canvas = document.getElementById('meCanvas');
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      selectedWhatsAppMedia = new File([blob], _me.file?.name || 'photo.jpg', { type: 'image/jpeg' });
      // Show small thumbnail in preview bar
      const bar = document.getElementById('chatFilePreviewBar');
      const img = document.getElementById('chatFilePreviewImg');
      if (bar && img) {
        img.src = canvas.toDataURL();
        img.style.display = 'block';
        document.getElementById('chatFilePreviewVideo').style.display = 'none';
        document.getElementById('chatFilePreviewName').textContent = selectedWhatsAppMedia.name;
        bar.style.display = 'flex';
      }
    }, 'image/jpeg', 0.93);
  }

  // Close the editor
  document.getElementById('mediaEditorOverlay')?.remove();

  // For video, also show in preview bar
  if (isVideo) {
    const bar = document.getElementById('chatFilePreviewBar');
    const vid = document.getElementById('chatFilePreviewVideo');
    const img = document.getElementById('chatFilePreviewImg');
    if (bar && vid) {
      vid.src = URL.createObjectURL(_me.file);
      vid.style.display = 'block';
      if (img) img.style.display = 'none';
      document.getElementById('chatFilePreviewName').textContent = _me.file.name;
      bar.style.display = 'flex';
    }
  }
}

function clearChatFilePreview() {
  selectedWhatsAppMedia = null;
  const fileInput = document.getElementById('chatFileInput');
  const bar = document.getElementById('chatFilePreviewBar');
  const img = document.getElementById('chatFilePreviewImg');
  const vid = document.getElementById('chatFilePreviewVideo');
  if (fileInput) fileInput.value = '';
  if (bar) bar.style.display = 'none';
  if (img) { img.src = ''; img.style.display = 'none'; }
  if (vid) { vid.src = ''; vid.style.display = 'none'; }
}

// Send message with optional media
async function sendWhatsAppMessageWithMedia() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();

  if (!content && !selectedWhatsAppMedia) {
    input?.focus();
    return;
  }

  if (!currentUser) { showMessage('⚠️ Please login first', 'error'); return; }

  // Optimistic bubble
  const tempId = 'temp-' + Date.now();
  const tempMsg = {
    id: tempId,
    content: content || '',
    text: content || '',
    sender_id: currentUser.id,
    users: currentUser,
    timestamp: new Date(),
    isTemp: true,
    media_url: selectedWhatsAppMedia ? URL.createObjectURL(selectedWhatsAppMedia) : null,
    media_name: selectedWhatsAppMedia ? selectedWhatsAppMedia.name : null,
    media_type: selectedWhatsAppMedia ? (
      selectedWhatsAppMedia.type.startsWith('video/') ? 'video' :
      selectedWhatsAppMedia.type.startsWith('audio/') ? 'audio' :
      selectedWhatsAppMedia.type === 'application/pdf' ? 'pdf' :
      selectedWhatsAppMedia.type.startsWith('application/') || selectedWhatsAppMedia.type.startsWith('text/') ? 'document' :
      'image'
    ) : null
  };

  // ✅ FIX: Capture media reference BEFORE clearChatFilePreview() nullifies selectedWhatsAppMedia
  const mediaToUpload = selectedWhatsAppMedia;

  appendWhatsAppMessageFixed(tempMsg);
  input.value = '';
  input.style.height = 'auto';
  clearChatFilePreview(); // safe now — we already captured the reference above

  if (socket && currentUser.college) {
    socket.emit('stop_typing', { collegeName: currentUser.college, username: currentUser.username });
  }

  try {
    let response;
    if (mediaToUpload) {
      const fd = new FormData();
      fd.append('content', content || '');
      fd.append('media', mediaToUpload);
      response = await apiCall('/api/community/messages', 'POST', fd);
    } else {
      response = await apiCall('/api/community/messages', 'POST', { content });
    }

    if (response.success && response.message) {
      playMessageSound('send');
      const tempEl = document.getElementById(`wa-msg-${tempId}`);
      if (tempEl) tempEl.remove();
      appendWhatsAppMessageFixed(response.message);
    }
  } catch (error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');
    const tempEl = document.getElementById(`wa-msg-${tempId}`);
    if (tempEl) tempEl.remove();
  }
}

// ==========================================
// MESSAGE OPTIONS: REACT, EDIT, DELETE, SEEN
// ==========================================

const REACT_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

function showEmojiReactPicker(msgId, btn) {
  // Remove any existing picker
  document.querySelectorAll('.emoji-react-picker').forEach(p => p.remove());

  const picker = document.createElement('div');
  picker.className = 'emoji-react-picker';
  picker.innerHTML = REACT_EMOJIS.map(e =>
    `<button class="react-emoji-btn" onclick="addMsgReaction('${msgId}','${e}',this)">${e}</button>`
  ).join('');

  // Position near button
  const rect = btn.getBoundingClientRect();
  picker.style.position = 'fixed';
  picker.style.top = (rect.top - 55) + 'px';
  picker.style.left = rect.left + 'px';
  document.body.appendChild(picker);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closePicker(ev) {
      if (!picker.contains(ev.target)) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 10);
}

function addMsgReaction(msgId, emoji, btn) {
  const bar = document.getElementById('reacts-' + msgId);
  if (!bar) { btn.closest('.emoji-react-picker')?.remove(); return; }

  // Check if this emoji already exists
  let existing = bar.querySelector(`[data-emoji="${emoji}"]`);
  if (existing) {
    const countEl = existing.querySelector('.react-count');
    countEl.textContent = parseInt(countEl.textContent || 0) + 1;
  } else {
    const pill = document.createElement('button');
    pill.className = 'react-pill';
    pill.dataset.emoji = emoji;
    pill.innerHTML = `${emoji} <span class="react-count">1</span>`;
    pill.onclick = () => {
      const c = pill.querySelector('.react-count');
      const n = parseInt(c.textContent) - 1;
      if (n <= 0) pill.remove(); else c.textContent = n;
    };
    bar.appendChild(pill);
  }

  btn.closest('.emoji-react-picker')?.remove();
}

function editChatMsg(msgId) {
  const bubble = document.getElementById('bubble-' + msgId);
  const textEl = bubble?.querySelector('.message-text');
  if (!textEl) return;

  const current = textEl.textContent;
  const newText = prompt('Edit message:', current);
  if (newText === null || newText.trim() === current) return;

  textEl.textContent = newText.trim();

  // Add "edited" label
  let editedTag = bubble.querySelector('.edited-tag');
  if (!editedTag) {
    editedTag = document.createElement('span');
    editedTag.className = 'edited-tag';
    editedTag.textContent = 'edited';
    const meta = bubble.querySelector('.message-meta');
    if (meta) meta.prepend(editedTag);
  }

  // Fire API silently (best effort)
  apiCall(`/api/community/messages/${msgId}`, 'PATCH', { content: newText.trim() })
    .catch(() => {/* server may not support yet */ });
}

async function deleteChatMsg(msgId) {
  if (!confirm('Delete this message?')) return;

  const el = document.getElementById('wa-msg-' + msgId);
  if (el) { el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }

  try {
    await apiCall(`/api/community/messages/${msgId}`, 'DELETE');
    if (el) { el.style.animation = 'fadeOut 0.3s ease'; setTimeout(() => el.remove(), 300); }
    showMessage('🗑️ Deleted', 'success');
  } catch (e) {
    if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
    showMessage('❌ Could not delete', 'error');
  }
}

function showSeenBy(msgId) {
  // Remove existing popup
  document.querySelectorAll('.seen-by-popup').forEach(p => p.remove());

  // Collect seen users for this message and all prior messages
  const seenUsers = [];
  const seen = new Set();
  if (window._msgSeenBy) {
    Object.values(window._msgSeenBy).forEach(arr => {
      arr.forEach(u => {
        if (!seen.has(u.username)) { seen.add(u.username); seenUsers.push(u); }
      });
    });
  }

  const popup = document.createElement('div');
  popup.className = 'seen-by-popup';

  if (seenUsers.length === 0) {
    popup.innerHTML = `
      <div class="sbp-header">👁️ Seen by</div>
      <div class="sbp-empty">Not seen by anyone yet</div>
    `;
  } else {
    popup.innerHTML = `
      <div class="sbp-header">👁️ Seen by ${seenUsers.length} ${seenUsers.length === 1 ? 'person' : 'people'}</div>
      <div class="sbp-list">
        ${seenUsers.map(u => `
          <div class="sbp-user">
            <span class="sbp-avatar">${u.avatar}</span>
            <span class="sbp-name">${u.username}</span>
            <span class="sbp-tick">✓✓</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Position near the message
  const msgEl = document.getElementById('wa-msg-' + msgId);
  const rect = msgEl ? msgEl.getBoundingClientRect() : null;
  popup.style.position = 'fixed';
  popup.style.zIndex = '99999';
  if (rect) {
    popup.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    popup.style.right = '16px';
  } else {
    popup.style.bottom = '80px';
    popup.style.right = '16px';
  }

  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('sbp-visible'));

  // Close on outside click or after 4s
  const close = (ev) => {
    if (!popup.contains(ev.target)) {
      popup.classList.remove('sbp-visible');
      setTimeout(() => popup.remove(), 200);
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 80);
  setTimeout(() => { popup.classList.remove('sbp-visible'); setTimeout(() => popup.remove(), 200); }, 4000);
}

async function sendCommunityMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();

  if (!content && !selectedChatMedia) return;

  // Optimistic UI
  appendCommunityMessage({
    sender_id: currentUser.id,
    content: content,
    created_at: new Date().toISOString(),
    media_url: selectedChatMedia ? URL.createObjectURL(selectedChatMedia) : null,
    media_type: selectedChatMedia ? (
      selectedChatMedia.type.startsWith('video/') ? 'video' :
      selectedChatMedia.type.startsWith('audio/') ? 'audio' :
      selectedChatMedia.type === 'application/pdf' ? 'pdf' :
      (selectedChatMedia.type.startsWith('application/') || selectedChatMedia.type.startsWith('text/')) ? 'document' : 'image'
    ) : null,
    users: { username: currentUser.username }
  });

  const mediaToSend = selectedChatMedia;
  input.value = '';
  clearChatPreview();

  try {
    const formData = new FormData();
    formData.append('content', content);
    if (mediaToSend) {
      formData.append('media', mediaToSend);
    }

    await apiCall('/api/community/messages', 'POST', formData);
    // Success - Socket will handle real message, we rely on optimistic for immediate feedback
  } catch (error) {
    console.error('Send failed:', error);
    showMessage('Failed to send message', 'error');
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendCommunityMessage();
  }
}


function toggleChatInfo() {
  const panel = document.getElementById('chatInfoPanel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function leaveGroup() {
  if (confirm('Are you sure you want to leave the community?')) {
    showMessage('Feature coming soon!', 'success');
  }
}

function toggleNotifications() {
  const status = document.getElementById('notifStatus');
  if (status) status.textContent = status.textContent === 'On' ? 'Off' : 'On';
}

function muteChat() {
  showMessage('🔇 Chat muted!', 'success');
}

function openImageViewer(src) {
  window.open(src, '_blank');
}

function searchInChat() {
  const box = document.getElementById('chatSearchBox');
  if (box) box.focus();
}

// Global scope override for showPage
// We capture the previous implementation if we can, but since we are appending,
// we just define a wrapper.
const previousShowPage = window.showPage;

window.showPage = function (pageId, ...args) {
  console.log(`Navigate to: ${pageId}`);

  // Call original logic (assuming it handles display:block/none)
  if (typeof previousShowPage === 'function') {
    previousShowPage(pageId, ...args);
  } else {
    // Fallback if previousShowPage isn't captured (e.g. it was defined as function declaration)
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';
  }

  // Hide footer on communities, posts, realvibe
  const footer = document.getElementById('mainFooter');
  if (footer) {
    const noFooterPages = ['communities', 'posts', 'realvibe'];
    footer.style.display = noFooterPages.includes(pageId) ? 'none' : '';
  }

  // Auto-hide header on communities, posts, realvibe
  const autoHidePages = ['communities', 'posts', 'realvibe'];
  if (autoHidePages.includes(pageId)) {
    enableHeaderAutohide();
  } else {
    disableHeaderAutohide();
  }

  // Hook for Communities
  if (pageId === 'communities') {
    setTimeout(() => initCommunityChat(), 50);
  }
};
