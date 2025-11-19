// =========================================================
// VIBEXPERT - FULLY INTEGRATED vibemap.js (REPLACABLE FILE)
// Implements: About Us Page -> Login Modal -> Main App
// =========================================================

// ========================================
// 1. GLOBAL VARIABLES & CORE HELPERS
// ========================================

// Global State Variables
let currentUser = null;
let socket = null;
let cropper = null;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let currentPostDestination = 'community';
let selectedFiles = []; // For post creation
let currentEditingPostId = null;
let selectedMusic = null;
let selectedStickers = [];
let hasScrolledToBottom = false; // For About Us auto-popup
let scrollCheckEnabled = true;   // For About Us auto-popup

// Assuming the following constants are needed elsewhere
const ITEMS_PER_PAGE = 10;
let allColleges = [];
let collegePage = 1;
let currentVerifyCollege = null;
let postPage = 1;
let searchTimeout;


// Helper: Get Auth Token
function getToken() {
    return localStorage.getItem('authToken');
}

// Helper: API Call Abstraction
async function apiCall(endpoint, method, body = null) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body && !(body instanceof FormData)) {
        config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        // For FormData (e.g., file uploads), remove Content-Type header
        delete headers['Content-Type'];
        config.body = body;
    }

    const response = await fetch(endpoint, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API call failed');
    }

    return data;
}

// Helper: Show Toast Message
function showMessage(msg, type = 'info') {
    const msgElement = document.getElementById('toastMessage');
    const toast = document.getElementById('toast');
    if (msgElement && toast) {
        msgElement.textContent = msg;
        toast.className = 'toast show ' + type;
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
}

// Helper: Open Modal
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Helper: Close Modal
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ========================================
// 2. CORE PAGE FLOW & INITIALIZATION
// ========================================

// Logic to SHOW the About Us page and HIDE the main page
function showAboutUsPage() {
    const aboutPage = document.getElementById('aboutUsPage');
    const mainPage = document.getElementById('mainPage');
    if (aboutPage) aboutPage.style.display = 'block';
    if (mainPage) mainPage.style.display = 'none';
    
    // Initialize about page features (animations/scroll)
    initScrollProgress();
    initRevealOnScroll();
    initStatsCounter();
    initScrollDetection(); 
    
    // Ensure scroll is at the top when landing on About Us
    window.scrollTo(0, 0);
    if (aboutPage) aboutPage.scrollTo(0, 0);
}

// Initialization on Document Load (The main entry point)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 VibeXpert initializing...');
    
    // Check if user is already logged in
    const token = getToken();
    const saved = localStorage.getItem('user');
    
    if (token && saved) {
        // --- User is logged in: Go to Main Page ---
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
            loadPosts(); 
        } catch(e) {
            console.error('Parse error during initialization. Clearing storage and showing About Us:', e);
            localStorage.clear();
            showAboutUsPage(); // Fallback
        }
    } else {
        // --- User not logged in: Start on About Us Page ---
        showAboutUsPage();
    }
    
    // Continue with other initialization functions
    setupEventListeners();
    initializeMusicPlayer();
    updateLiveStats();
    setInterval(updateLiveStats, 5000);
    initializeSearchBar();
    loadTrending();
    loadColleges(); 
    console.log('✅ Initialization complete.');
});


// ========================================
// 3. AUTHENTICATION FLOW FUNCTIONS
// ========================================

// Show Auth Popup (Login/Signup Modal)
function showAuthPopup() {
    const authPopup = document.getElementById('authPopup');
    if (authPopup) {
        authPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        scrollCheckEnabled = false; // Disable further scroll checks
    }
}

// Close Auth Popup
function closeAuthPopup() {
    const authPopup = document.getElementById('authPopup');
    if (authPopup) {
        authPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        scrollCheckEnabled = true; // Re-enable scroll checks
        hasScrolledToBottom = false; // Reset flag
    }
}

// Helper to switch to Login form within the modal
function goLogin(e) {
    if (e) e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

// Helper to switch to Signup form within the modal
function goSignup(e) {
    if (e) e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}


// LOGIN Function (Handles page transition to Main)
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
        
        setTimeout(() => {
            // TRANSITION TO MAIN PAGE
            const aboutPage = document.getElementById('aboutUsPage');
            const mainPage = document.getElementById('mainPage');
            
            if (aboutPage) aboutPage.style.display = 'none'; 
            closeAuthPopup(); // Use closeAuthPopup to hide modal and reset scroll state
            if (mainPage) mainPage.style.display = 'block'; 
            
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = 'Hi, ' + currentUser.username;
            const form = document.getElementById('loginForm');
            if (form) form.reset();
            
            loadPosts(); 
            if (currentUser.college) initializeSocket();
            
            showMessage('✅ Welcome back!', 'success');
        }, 500);
    } catch(error) {
        showMessage('❌ Login failed: ' + (error.message || 'Check your credentials.'), 'error');
    }
}


// SIGNUP Function (Handles page transition to Main)
async function signup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    const college = document.getElementById('signupCollege')?.value.trim();
    if(!username || !email || !password || !college) return showMessage('Fill all fields', 'error');
    
    try {
        showMessage('Registering...', 'success');
        const data = await apiCall('/api/signup', 'POST', { username, email, password, college });
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        
        setTimeout(() => {
            // TRANSITION TO MAIN PAGE
            const aboutPage = document.getElementById('aboutUsPage');
            const mainPage = document.getElementById('mainPage');
            
            if (aboutPage) aboutPage.style.display = 'none'; 
            closeAuthPopup(); // Use closeAuthPopup to hide modal and reset scroll state
            if (mainPage) mainPage.style.display = 'block'; 
            
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = 'Hi, ' + currentUser.username;
            const form = document.getElementById('signupForm');
            if (form) form.reset();
            
            loadPosts();
            if (currentUser.college) initializeSocket();
            
            showMessage('🎉 Welcome to VibeXpert!', 'success');
        }, 500);
    } catch(error) {
        showMessage('❌ Signup failed: ' + error.message, 'error');
    }
}


// LOGOUT Function (Handles page transition back to About Us)
function logout() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    currentUser = null;
    localStorage.clear();
    
    // TRANSITION TO ABOUT US PAGE
    showAboutUsPage(); 
    
    showMessage('👋 Logged out', 'success');
}

// ========================================
// 4. ABOUT US PAGE ANIMATION/SCROLL LOGIC
// ========================================

// Scroll Progress Bar
function initScrollProgress() {
    const aboutPage = document.getElementById('aboutUsPage');
    if (!aboutPage) return;
    aboutPage.removeEventListener('scroll', updateScrollProgress); // Prevent duplicates
    aboutPage.addEventListener('scroll', updateScrollProgress);
}

function updateScrollProgress() {
    const aboutPage = document.getElementById('aboutUsPage');
    if (!aboutPage) return;
    
    const scrollTop = aboutPage.scrollTop;
    const scrollHeight = aboutPage.scrollHeight;
    const clientHeight = aboutPage.clientHeight;
    
    const totalScrollableHeight = scrollHeight - clientHeight;
    
    if (totalScrollableHeight <= 0) return;
    
    const scrolled = (scrollTop / totalScrollableHeight) * 100;
    
    const progressFill = document.getElementById('scrollProgressFill');
    if (progressFill) {
        progressFill.style.width = scrolled + '%';
    }
    
    // Check if scrolled to bottom for auto-popup (Original Feature)
    if (scrollCheckEnabled && scrolled >= 97 && !hasScrolledToBottom) {
        hasScrolledToBottom = true;
        showAuthPopup();
    }
}

// Scroll Detection for Auth Popup (Re-initializes flags)
function initScrollDetection() {
  hasScrolledToBottom = false;
  scrollCheckEnabled = true;
}

// Reveal on Scroll Animation
function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const aboutPage = document.getElementById('aboutUsPage');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15,
    root: aboutPage || null,
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
    threshold: 0.5,
    root: document.getElementById('aboutUsPage') || null,
  });
  
  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
}

function animateCounter(element, start, end, duration) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value.toLocaleString();

    if (progress < 1) {
        window.requestAnimationFrame(step);
    } else {
        element.textContent = end.toLocaleString();
    }
  }

  window.requestAnimationFrame(step);
}

// ========================================
// 5. ORIGINAL VIBEXPERT APPLICATION LOGIC
// ========================================

/**
 * --------------------------------------------------------------------------
 * !!! CRITICAL STEP !!!
 * --------------------------------------------------------------------------
 * * PASTE ALL YOUR REMAINING, ORIGINAL VIBEMAP.JS CODE HERE.
 * This includes all functions not defined above, such as:
 * * - setupEventListeners (ensure you merge the new listeners above with your old ones)
 * - initializeMusicPlayer
 * - updateLiveStats
 * - initializeSearchBar
 * - loadTrending
 * - initializeSocket
 * - loadPosts
 * - renderPosts
 * - createPost, likePost, sharePost, etc.
 * - All other application-specific helpers.
 * * Start pasting your original code immediately below this comment:
 */


// --- BEGIN ORIGINAL VIBEMAP.JS CODE PASTE AREA ---

function setupEventListeners() {
  // Existing listeners for auth modal and page flow are already set up above.
  
  // Add/Merge your existing listeners for the main app here.
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('postForm')?.addEventListener('submit', createPost);
  document.getElementById('fileInput')?.addEventListener('change', handleFileSelect);
  document.getElementById('audioRecordBtn')?.addEventListener('click', toggleAudioRecording);
  document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
  document.getElementById('chatInput')?.addEventListener('keypress', handleChatTyping);
  document.getElementById('musicSearchInput')?.addEventListener('input', searchMusic);
  document.getElementById('musicSelectBtn')?.addEventListener('click', openMusicModal);
  document.getElementById('stickerSelectBtn')?.addEventListener('click', openStickerModal);
  document.getElementById('searchBarInput')?.addEventListener('input', handleGlobalSearch);
  document.getElementById('profileBtn')?.addEventListener('click', () => openModal('userProfileModal'));
  document.getElementById('contactUsBtn')?.addEventListener('click', () => openModal('contactModal'));
  document.getElementById('submitComplaintBtn')?.addEventListener('click', submitComplaint);
  document.getElementById('complaintForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitComplaint();
  });
  document.getElementById('collegeVerificationBtn')?.addEventListener('click', openCollegeVerifyModal);
  document.getElementById('collegeVerifyForm')?.addEventListener('submit', submitCollegeVerification);
  
  // Dynamic listeners for posts (like/comment/share) are handled via event delegation in renderPosts
  
  // Cropper Modal Listeners (from hloo.html snippet)
  document.querySelectorAll('.aspect-ratio-btn').forEach(button => {
    button.addEventListener('click', function() {
      const ratio = this.getAttribute('data-ratio');
      setCropperAspectRatio(ratio);
    });
  });

  // Listener to switch between login/signup forms
  document.getElementById('switchToSignup')?.addEventListener('click', goSignup);
  document.getElementById('switchToLogin')?.addEventListener('click', goLogin);

  // Smooth scroll for internal links in About Us (already handled in section 4)
}

// Music Player Implementation
function initializeMusicPlayer() {
    // Basic music player setup (assuming elements exist in hloo.html)
    const musicPlayer = document.getElementById('musicPlayer');
    const musicTitle = document.getElementById('musicTitle');
    const musicControls = document.getElementById('musicControls');

    musicControls?.addEventListener('click', () => {
        if (musicPlayer.paused) {
            musicPlayer.play();
            musicControls.textContent = '⏸';
        } else {
            musicPlayer.pause();
            musicControls.textContent = '▶';
        }
    });

    musicPlayer?.addEventListener('ended', () => {
        musicControls.textContent = '▶';
        selectedMusic = null;
        musicTitle.textContent = 'No music selected';
    });
}

// Live Stats Update (Placeholder for connection stats)
async function updateLiveStats() {
    try {
        const stats = await apiCall('/api/stats', 'GET');
        document.getElementById('activeUsersCount').textContent = stats.activeUsers.toLocaleString();
        document.getElementById('totalPostsCount').textContent = stats.totalPosts.toLocaleString();
        document.getElementById('totalUsersCount').textContent = stats.totalUsers.toLocaleString();
    } catch(e) {
        console.error('Failed to fetch stats:', e);
    }
}

// Search Bar Initialization (Global search logic)
function initializeSearchBar() {
    // Listener is attached in setupEventListeners
}

function handleGlobalSearch(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length < 3) return;

    searchTimeout = setTimeout(async () => {
        try {
            const results = await apiCall(`/api/search?q=${encodeURIComponent(query)}`, 'GET');
            renderSearchResults(results);
        } catch(e) {
            console.error('Search failed:', e);
            showMessage('Search failed', 'error');
        }
    }, 500);
}

function renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    container.innerHTML = ''; // Clear old results

    // Placeholder rendering logic
    let html = '<h3>Users</h3>';
    if (results.users?.length) {
        results.users.forEach(user => {
            html += `<div class="search-result-item" onclick="openUserProfile('${user.id}')">${user.username} (${user.college})</div>`;
        });
    } else {
        html += '<p>No users found.</p>';
    }

    html += '<h3>Posts</h3>';
    if (results.posts?.length) {
        // You might use a simplified version of renderPosts here
        html += `<div class="post-list">${renderPosts(results.posts)}</div>`;
    } else {
        html += '<p>No posts found.</p>';
    }

    container.innerHTML = html;
}

// Trending Content Loading
async function loadTrending() {
  const container = document.getElementById('trendingContent');
  if (!container) return;
  try {
    const data = await apiCall('/api/trending', 'GET');
    renderTrending(data.trending);
  } catch(e) {
    console.error('Failed to load trending:', e);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Could not load trending content.</div>';
  }
}

function renderTrending(items) {
  const container = document.getElementById('trendingContent');
  if (!container) return;
  let html = '';
  items.forEach(item => {
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

// Socket Initialization
function initializeSocket() {
    if (socket) return;
    if (!currentUser || !currentUser.college) return;
    
    // Replace with your actual backend URL (e.g., 'http://localhost:3000')
    socket = io(); 
    
    socket.on('connect', () => {
        console.log('Socket connected. Joining college room...');
        socket.emit('join_college', { collegeName: currentUser.college });
    });
    
    socket.on('post_update', (data) => {
        showMessage(`New activity in ${data.collegeName}: ${data.message}`, 'info');
        loadPosts(); // Reload posts on new activity
    });
    
    socket.on('receive_chat_message', (data) => {
        appendChatMessage(data);
    });

    socket.on('user_typing', (data) => {
        updateTypingStatus(data.username, true);
    });
    
    socket.on('user_stop_typing', (data) => {
        updateTypingStatus(data.username, false);
    });

    socket.on('disconnect', () => {
        updateLiveNotif('Connection lost. Reconnecting...');
        console.log('Socket disconnected.');
    });
}

// Main Posts Loading
async function loadPosts(reset = true) {
    const container = document.getElementById('postList');
    if (!container) return;

    if (reset) {
        postPage = 1;
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">⏳ Loading posts...</div>';
    } else {
        postPage++;
    }

    try {
        const data = await apiCall(`/api/posts?page=${postPage}&limit=${ITEMS_PER_PAGE}`, 'GET');
        
        if (reset) {
            container.innerHTML = '';
        }

        if (!data.posts || data.posts.length === 0) {
            if (reset) {
                 container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">No posts found. Be the first to post!</div>';
            }
            return; // No more posts to load
        }
        
        container.innerHTML += renderPosts(data.posts);
        
        // Setup listener for infinite scroll
        if (data.posts.length === ITEMS_PER_PAGE && postPage === 1) {
            setupInfiniteScroll();
        }
    } catch(error) {
        console.error('❌ Load posts failed:', error);
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#f00;">Failed to load posts.</div>';
    }
}

// Render Posts (Placeholder, assuming it handles HTML generation)
function renderPosts(posts) {
    let html = '';
    posts.forEach(post => {
        // Post content rendering logic here
        const isLiked = post.likes.includes(currentUser?.id);
        const mediaHtml = renderMedia(post.media);

        html += `
            <div class="post-card" data-post-id="${post._id}">
                <div class="post-header">
                    <img src="${post.author.profilePic || 'default-avatar.png'}" class="post-avatar" onclick="openUserProfile('${post.author._id}')">
                    <div class="post-info">
                        <div class="post-username">${post.author.username}</div>
                        <div class="post-college">${post.author.college}</div>
                    </div>
                    ${post.author._id === currentUser?._id ? `<button class="post-menu-btn" onclick="openPostMenu('${post._id}')">⋮</button>` : ''}
                </div>
                <div class="post-content">
                    <p>${post.text}</p>
                    ${mediaHtml}
                </div>
                <div class="post-actions">
                    <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" onclick="likePost('${post._id}')">
                        ❤️ ${post.likes.length}
                    </button>
                    <button class="action-btn comment-btn" onclick="openCommentModal('${post._id}')">
                        💬 ${post.comments.length}
                    </button>
                    <button class="action-btn share-btn" onclick="sharePost('${post._id}')">
                        📤 Share
                    </button>
                </div>
            </div>
        `;
    });
    return html;
}

// Placeholder for rendering media content in posts
function renderMedia(mediaArray) {
    if (!mediaArray || mediaArray.length === 0) return '';
    let html = '<div class="post-media-container">';
    mediaArray.forEach(media => {
        if (media.type === 'image') {
            html += `<img src="${media.url}" alt="Post image" onclick="openImageModal('${media.url}')">`;
        } else if (media.type === 'video') {
            html += `<video src="${media.url}" controls></video>`;
        } else if (media.type === 'audio') {
            html += `<audio src="${media.url}" controls></audio>`;
        }
    });
    html += '</div>';
    return html;
}

// Live Notif Update
function updateLiveNotif(text) {
    const notifText = document.getElementById('notifText');
    if (notifText) {
        notifText.textContent = text;
    }
}

// College Loading
async function loadColleges() {
    try {
        const data = await apiCall('/api/colleges', 'GET');
        allColleges = data.colleges || [];
        // Populate select fields if they exist
        const signupSelect = document.getElementById('signupCollege');
        const verifySelect = document.getElementById('collegeSelectVerify');
        
        [signupSelect, verifySelect].forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">-- Select College --</option>';
                allColleges.forEach(college => {
                    const option = document.createElement('option');
                    option.value = college.name;
                    option.textContent = college.name;
                    select.appendChild(option);
                });
            }
        });
    } catch(e) {
        console.error('Failed to load colleges:', e);
    }
}

// --- END ORIGINAL VIBEMAP.JS CODE PASTE AREA ---

/**
 * --------------------------------------------------------------------------
 * NOTE: Ensure all curly braces and parentheses are matched after pasting.
 * --------------------------------------------------------------------------
 */
