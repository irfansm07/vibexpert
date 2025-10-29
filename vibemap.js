// Global variables
let currentUser = null;
let selectedImage = null;
let originalImage = null;
let currentFilter = 'none';
let isCropping = false;
let cropStartX = 0;
let cropStartY = 0;
let cropEndX = 0;
let cropEndY = 0;
let communities = [];
let userCommunities = [];

// API Configuration - UPDATE THIS WITH YOUR RENDER URL
const API_BASE_URL = 'https://vibexpert-backend-main.onrender.com'; // Replace with your actual Render URL
// For local development: 'http://localhost:3000'

// DOM elements
const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const messageDiv = document.getElementById('message');
const userNameSpan = document.getElementById('userName');
const liveUsersCount = document.getElementById('liveUsersCount');
const footerUsers = document.getElementById('footerUsers');
const liveActivityNotif = document.getElementById('liveActivityNotif');
const notifText = document.getElementById('notifText');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  checkLoginStatus();
  initializeChains();
  updateLiveStats();
  
  // Set up event listeners for responsive behavior
  window.addEventListener('resize', handleResize);
  
  // Initialize image editor event listeners
  initializeImageEditor();
});

// Check if user is logged in
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if (token && userData) {
    try {
      currentUser = JSON.parse(userData);
      showMainPage();
      loadUserCommunities();
    } catch (e) {
      console.error('Error parsing user data:', e);
      showLoginPage();
    }
  } else {
    showLoginPage();
  }
}

// Show login page
function showLoginPage() {
  loginPage.style.display = 'flex';
  mainPage.style.display = 'none';
}

// Show main page
function showMainPage() {
  loginPage.style.display = 'none';
  mainPage.style.display = 'flex';
  userNameSpan.textContent = `Hi, ${currentUser?.username || 'User'}`;
  
  // Load initial data
  loadTrendingContent();
  loadPosts();
  updateLiveStats();
}

// Login function
async function login(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      currentUser = data.user;
      showMainPage();
      showMessage('Login successful!', 'success');
      
      // Load user communities after login
      loadUserCommunities();
    } else {
      showMessage(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Network error. Please check if backend is running.', 'error');
  }
}

// Signup function
async function signup(event) {
  event.preventDefault();
  
  const username = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const registrationNumber = document.getElementById('signupReg').value;
  const password = document.getElementById('signupPass').value;
  const confirmPassword = document.getElementById('signupConfirm').value;
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        registrationNumber
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage('Account created successfully! Please login.', 'success');
      goLogin(event);
    } else {
      showMessage(data.error || 'Signup failed', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Forgot password
function goForgotPassword(event) {
  event.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
}

// Go to login
function goLogin(event) {
  if (event) event.preventDefault();
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

// Go to signup
function goSignup(event) {
  event.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

// Handle forgot password
async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('resetEmail').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    showMessage(data.message || 'If an account exists, a reset code has been sent.', 'success');
  } catch (error) {
    console.error('Forgot password error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Show message
function showMessage(message, type) {
  if (!messageDiv) return;
  
  messageDiv.textContent = message;
  messageDiv.className = type;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Navigation functions
function showPage(pageId, event) {
  if (event) event.preventDefault();
  
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.style.display = 'none';
    page.classList.remove('active');
  });
  
  // Remove active class from all nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  // Show selected page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
    
    // Add active class to corresponding nav link
    if (event && event.target.classList.contains('nav-link')) {
      event.target.classList.add('active');
    } else {
      // Find the nav link that corresponds to this page
      const correspondingLink = document.querySelector(`.nav-link[onclick*="${pageId}"]`);
      if (correspondingLink) {
        correspondingLink.classList.add('active');
      }
    }
  }
  
  // Close hamburger menu on mobile
  if (window.innerWidth <= 768) {
    toggleHamburgerMenu();
  }
}

// Go to home
function goHome() {
  showPage('home');
}

// Toggle options menu
function toggleOptionsMenu() {
  const menu = document.getElementById('optionsMenu');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

// Toggle hamburger menu
function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  currentUser = null;
  showLoginPage();
  showMessage('Logged out successfully', 'success');
}

// Toggle theme
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
  
  // Save theme preference
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Load theme preference
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme + '-theme';
}

// Show contact modal
function showContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.style.display = 'flex';
}

// Show complaint modal
function showComplaintModal() {
  const modal = document.getElementById('complaintModal');
  if (modal) modal.style.display = 'flex';
}

// Submit complaint
async function submitComplaint() {
  const complaintText = document.getElementById('complaintText')?.value;
  
  if (!complaintText || !complaintText.trim()) {
    showMessage('Please enter your complaint', 'error');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        subject: 'Complaint',
        message: complaintText 
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage('Complaint submitted successfully', 'success');
      closeModal('complaintModal');
      const complaintInput = document.getElementById('complaintText');
      if (complaintInput) complaintInput.value = '';
    } else {
      showMessage(data.error || 'Failed to submit complaint', 'error');
    }
  } catch (error) {
    console.error('Complaint submission error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

// Show photo modal
function showPhotoModal() {
  const modal = document.getElementById('photoModal');
  if (modal) modal.style.display = 'flex';
}

// Upload photo
function uploadPhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = handleImageUpload;
  input.click();
  closeModal('photoModal');
}

// Take photo (placeholder - would need camera access)
function takePhoto() {
  showMessage('Camera feature coming soon!', 'info');
  closeModal('photoModal');
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      selectedImage = e.target.result;
      originalImage = e.target.result;
      showImagePreview(selectedImage);
    };
    reader.readAsDataURL(file);
  }
}

// Show image preview
function showImagePreview(imageSrc) {
  const previewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  
  if (imagePreview) imagePreview.src = imageSrc;
  if (previewContainer) {
    previewContainer.style.display = 'block';
    // Scroll to preview
    previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Remove image
function removeImage() {
  selectedImage = null;
  originalImage = null;
  const previewContainer = document.getElementById('imagePreviewContainer');
  if (previewContainer) previewContainer.style.display = 'none';
}

// Create post
async function createPost() {
  const postText = document.getElementById('postText')?.value;
  const postDestination = document.getElementById('postDestination')?.value || 'profile';
  
  if (!postText?.trim() && !selectedImage) {
    showMessage('Please add some text or an image to your post', 'error');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('content', postText || '');
    formData.append('postTo', postDestination);
    
    if (selectedImage) {
      // Convert data URL to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      formData.append('media', blob, 'post-image.jpg');
    }
    
    const token = localStorage.getItem('token');
    const postResponse = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await postResponse.json();
    
    if (data.success) {
      showMessage(
        postDestination === 'community' 
          ? `Posted in community successfully!` 
          : 'Post created successfully!', 
        'success'
      );
      
      // Reset form
      const postTextInput = document.getElementById('postText');
      if (postTextInput) postTextInput.value = '';
      removeImage();
      
      // Reload posts
      loadPosts();
    } else {
      showMessage(data.error || 'Failed to create post', 'error');
    }
  } catch (error) {
    console.error('Post creation error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Load user communities
async function loadUserCommunities() {
  if (!currentUser) return;
  
  // This would be implemented based on your communities system
  userCommunities = currentUser.college ? [currentUser.college] : [];
}

// Load posts
async function loadPosts() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    const data = await response.json();
    
    if (data.success) {
      displayPosts(data.posts);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    // Show mock posts if API fails
    displayMockPosts();
  }
}

// Display posts
function displayPosts(posts) {
  const postsFeed = document.getElementById('postsFeed');
  if (!postsFeed) return;
  
  postsFeed.innerHTML = '';
  
  if (!posts || posts.length === 0) {
    postsFeed.innerHTML = '<p style="text-align:center; color:#a0a0a0; padding:40px;">No posts yet. Be the first to post!</p>';
    return;
  }
  
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    let imageHtml = '';
    if (post.image) {
      imageHtml = `<img src="${post.image}" alt="Post image" class="post-image">`;
    }
    
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-avatar">${post.userName ? post.userName.charAt(0).toUpperCase() : 'U'}</div>
        <div class="post-user">
          <div class="post-user-name">${post.userName || 'Anonymous'}</div>
          <div class="post-time">${formatTime(post.createdAt)}</div>
        </div>
      </div>
      <div class="post-content">${post.text || ''}</div>
      ${imageHtml}
      <div class="post-actions">
        <div class="post-action">❤️ ${post.likes || 0}</div>
        <div class="post-action">💬 ${post.comments || 0}</div>
        <div class="post-action">🔄 ${post.shares || 0}</div>
      </div>
    `;
    
    postsFeed.appendChild(postElement);
  });
}

// Display mock posts for fallback
function displayMockPosts() {
  const postsFeed = document.getElementById('postsFeed');
  if (!postsFeed) return;
  
  const mockPosts = [
    {
      userName: 'VibeXpert Team',
      text: 'Welcome to VibeXpert! Connect with your college community and start sharing your vibes.',
      createdAt: new Date().toISOString(),
      likes: 15,
      comments: 3,
      shares: 2
    },
    {
      userName: 'Campus News',
      text: 'Annual college fest starts next week! Get ready for amazing events and competitions.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 42,
      comments: 8,
      shares: 5
    }
  ];
  
  displayPosts(mockPosts);
}

// Format time
function formatTime(timestamp) {
  if (!timestamp) return 'Recently';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

// Load trending content
async function loadTrendingContent() {
  try {
    const response = await fetch(`${API_BASE_URL}/trending`);
    const data = await response.json();
    
    if (data.success) {
      displayTrendingContent(data.trending);
    }
  } catch (error) {
    console.error('Error loading trending content:', error);
    // Show mock trending content
    displayMockTrending();
  }
}

// Display trending content
function displayTrendingContent(trending) {
  const container = document.getElementById('trendingContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  trending.forEach(item => {
    const card = document.createElement('div');
    card.className = 'trending-card';
    
    card.innerHTML = `
      <div class="trending-card-header">
        <div class="trending-title">${item.title}</div>
        <div class="trending-badge">${item.engagement}</div>
      </div>
      <div class="trending-content">${item.content}</div>
    `;
    
    container.appendChild(card);
  });
}

// Display mock trending content
function displayMockTrending() {
  const container = document.getElementById('trendingContainer');
  if (!container) return;
  
  const mockTrending = [
    {
      title: "Welcome to VibeXpert!",
      content: "New social platform for college communities",
      engagement: "🎉 New"
    },
    {
      title: "Getting Started",
      content: "Connect with your college and start posting",
      engagement: "📚 Guide"
    }
  ];
  
  displayTrendingContent(mockTrending);
}

// Update live stats
async function updateLiveStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/live-stats`);
    const data = await response.json();
    
    if (data.success) {
      // Update hero stats
      const heroOnline = document.getElementById('heroOnline');
      const heroPostsToday = document.getElementById('heroPostsToday');
      const heroChats = document.getElementById('heroChats');
      
      if (heroOnline) heroOnline.textContent = data.onlineUsers || 0;
      if (heroPostsToday) heroPostsToday.textContent = data.postsToday || 0;
      if (heroChats) heroChats.textContent = data.activeChats || 0;
      
      // Update header and footer
      if (liveUsersCount) liveUsersCount.textContent = `${data.onlineUsers || 0} Active`;
      if (footerUsers) footerUsers.textContent = `${data.onlineUsers || 0} Users Online`;
      
      // Update live activity notification
      if (liveActivityNotif && notifText) {
        if (data.liveActivity) {
          liveActivityNotif.style.display = 'flex';
          notifText.textContent = data.liveActivity;
        } else {
          liveActivityNotif.style.display = 'none';
        }
      }
    }
  } catch (error) {
    console.error('Error updating live stats:', error);
    // Set default values
    if (liveUsersCount) liveUsersCount.textContent = '50 Active';
    if (footerUsers) footerUsers.textContent = '50 Users Online';
  }
  
  // Update every 30 seconds
  setTimeout(updateLiveStats, 30000);
}

// Test backend connection
async function testBackendConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    console.log('Backend connection:', data);
    return data.success;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
}

// Initialize image editor (basic implementation)
function initializeImageEditor() {
  // Basic implementation - you can expand this
  console.log('Image editor initialized');
}

// Handle window resize
function handleResize() {
  // Close menus on resize to larger screens
  if (window.innerWidth > 768) {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) hamburgerMenu.style.display = 'none';
  }
}

// Initialize floating chains effect
function initializeChains() {
  // Create floating chain elements
  for (let i = 0; i < 15; i++) {
    createChain();
  }
}

// Create a single chain element
function createChain() {
  const chain = document.createElement('div');
  chain.className = 'chain';
  
  // Random position
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  
  // Random size
  const size = 2 + Math.random() * 4;
  
  // Random animation delay
  const delay = Math.random() * 5;
  
  chain.style.left = `${x}px`;
  chain.style.top = `${y}px`;
  chain.style.width = `${size}px`;
  chain.style.height = `${size}px`;
  chain.style.animationDelay = `${delay}s`;
  
  document.body.appendChild(chain);
  
  // Animate the chain
  animateChain(chain);
}

// Animate a chain element
function animateChain(chain) {
  const duration = 15 + Math.random() * 20;
  const startX = parseFloat(chain.style.left);
  const startY = parseFloat(chain.style.top);
  
  // Random movement
  const moveX = (Math.random() - 0.5) * 200;
  const moveY = (Math.random() - 0.5) * 200;
  
  const keyframes = [
    { transform: `translate(0, 0)`, opacity: 0 },
    { transform: `translate(0, 0)`, opacity: 0.7 },
    { transform: `translate(${moveX}px, ${moveY}px)`, opacity: 0 }
  ];
  
  const options = {
    duration: duration * 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };
  
  chain.animate(keyframes, options).onfinish = () => {
    // Remove and recreate chain for continuous effect
    chain.remove();
    createChain();
  };
}

// Load theme on startup
loadTheme();

// Test connection on startup
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    testBackendConnection().then(connected => {
      if (!connected) {
        console.warn('Backend is not reachable. Using fallback data.');
      }
    });
  }, 1000);
});

