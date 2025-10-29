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
  userNameSpan.textContent = `Hi, ${currentUser?.name || 'User'}`;
  
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
    const response = await fetch('/login', {
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
      showMessage(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Signup function
async function signup(event) {
  event.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const regNumber = document.getElementById('signupReg').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const type = document.querySelector('input[name="type"]:checked')?.value;
  const hobbies = document.getElementById('signupHobbies').value;
  const password = document.getElementById('signupPass').value;
  const confirmPassword = document.getElementById('signupConfirm').value;
  
  // Get selected interests
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
  const interests = Array.from(interestCheckboxes).map(cb => cb.value);
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        regNumber,
        gender,
        type,
        interests,
        hobbies,
        password
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage('Account created successfully! Please login.', 'success');
      goLogin(event);
    } else {
      showMessage(data.message || 'Signup failed', 'error');
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
    const response = await fetch('/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    showMessage(data.message || 'If an account exists, a reset link has been sent.', 'success');
  } catch (error) {
    console.error('Forgot password error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Show message
function showMessage(message, type) {
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
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Toggle hamburger menu
function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
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
  document.getElementById('contactModal').style.display = 'flex';
}

// Show complaint modal
function showComplaintModal() {
  document.getElementById('complaintModal').style.display = 'flex';
}

// Submit complaint
async function submitComplaint() {
  const complaintText = document.getElementById('complaintText').value;
  
  if (!complaintText.trim()) {
    showMessage('Please enter your complaint', 'error');
    return;
  }
  
  try {
    const response = await fetch('/submit-complaint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ complaint: complaintText }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage('Complaint submitted successfully', 'success');
      closeModal('complaintModal');
      document.getElementById('complaintText').value = '';
    } else {
      showMessage(data.message || 'Failed to submit complaint', 'error');
    }
  } catch (error) {
    console.error('Complaint submission error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Show photo modal
function showPhotoModal() {
  document.getElementById('photoModal').style.display = 'flex';
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
  
  imagePreview.src = imageSrc;
  previewContainer.style.display = 'block';
  
  // Scroll to preview
  previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Remove image
function removeImage() {
  selectedImage = null;
  originalImage = null;
  document.getElementById('imagePreviewContainer').style.display = 'none';
}

// Open image editor
function openImageEditor() {
  if (!selectedImage) return;
  
  document.getElementById('imageEditorModal').style.display = 'flex';
  
  // Initialize canvas with the selected image
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = function() {
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image on canvas
    ctx.drawImage(img, 0, 0);
    
    // Store original image data for reset
    originalImage = canvas.toDataURL();
  };
  
  img.src = selectedImage;
}

// Initialize image editor
function initializeImageEditor() {
  // Set up filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Apply selected filter
      currentFilter = this.getAttribute('data-filter');
      applyFilter(currentFilter);
    });
  });
  
  // Set up adjustment sliders
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    slider.addEventListener('input', applyAdjustments);
  });
}

// Apply filter to image
function applyFilter(filter) {
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  
  // Reset canvas
  const img = new Image();
  img.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // Apply filter
    switch(filter) {
      case 'grayscale':
        applyGrayscale(ctx, canvas.width, canvas.height);
        break;
      case 'sepia':
        applySepia(ctx, canvas.width, canvas.height);
        break;
      case 'invert':
        applyInvert(ctx, canvas.width, canvas.height);
        break;
      case 'blur':
        applyBlur(ctx, canvas.width, canvas.height);
        break;
      case 'saturate':
        applySaturate(ctx, canvas.width, canvas.height);
        break;
      default:
        // No filter - just draw original
        break;
    }
  };
  img.src = originalImage;
}

// Apply adjustments (brightness, contrast, saturation)
function applyAdjustments() {
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  
  const brightness = document.getElementById('brightness').value;
  const contrast = document.getElementById('contrast').value;
  const saturation = document.getElementById('saturation').value;
  
  // Reset canvas
  const img = new Image();
  img.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // Apply current filter first
    if (currentFilter && currentFilter !== 'none') {
      applyFilter(currentFilter);
    }
    
    // Apply adjustments
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const brightnessFactor = (brightness - 100) / 100;
    const contrastFactor = (contrast - 100) / 100;
    const saturationFactor = (saturation - 100) / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      data[i] = clamp(data[i] + (255 * brightnessFactor));
      data[i+1] = clamp(data[i+1] + (255 * brightnessFactor));
      data[i+2] = clamp(data[i+2] + (255 * brightnessFactor));
      
      // Contrast
      data[i] = clamp(((data[i] / 255 - 0.5) * (1 + contrastFactor) + 0.5) * 255);
      data[i+1] = clamp(((data[i+1] / 255 - 0.5) * (1 + contrastFactor) + 0.5) * 255);
      data[i+2] = clamp(((data[i+2] / 255 - 0.5) * (1 + contrastFactor) + 0.5) * 255);
      
      // Saturation (simplified)
      if (saturationFactor !== 0) {
        const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
        data[i] = clamp(data[i] + (data[i] - gray) * saturationFactor);
        data[i+1] = clamp(data[i+1] + (data[i+1] - gray) * saturationFactor);
        data[i+2] = clamp(data[i+2] + (data[i+2] - gray) * saturationFactor);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  img.src = originalImage;
}

// Helper function to clamp values between 0-255
function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

// Filter functions
function applyGrayscale(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
    data[i] = gray;
    data[i+1] = gray;
    data[i+2] = gray;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applySepia(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    
    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
    data[i+1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
    data[i+2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applyInvert(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i+1] = 255 - data[i+1];
    data[i+2] = 255 - data[i+2];
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applyBlur(ctx, width, height) {
  // Simple box blur implementation
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data);
  
  const radius = 2;
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += tempData[idx];
          g += tempData[idx+1];
          b += tempData[idx+2];
          count++;
        }
      }
      
      const idx = (y * width + x) * 4;
      data[idx] = r / count;
      data[idx+1] = g / count;
      data[idx+2] = b / count;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function applySaturate(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
    // Increase saturation by moving away from gray
    data[i] = clamp(data[i] + (data[i] - gray) * 0.5);
    data[i+1] = clamp(data[i+1] + (data[i+1] - gray) * 0.5);
    data[i+2] = clamp(data[i+2] + (data[i+2] - gray) * 0.5);
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Crop functions
function startCrop() {
  isCropping = true;
  const canvas = document.getElementById('editorCanvas');
  
  canvas.style.cursor = 'crosshair';
  
  canvas.onmousedown = function(e) {
    if (!isCropping) return;
    
    const rect = canvas.getBoundingClientRect();
    cropStartX = e.clientX - rect.left;
    cropStartY = e.clientY - rect.top;
    
    canvas.onmousemove = function(e) {
      cropEndX = e.clientX - rect.left;
      cropEndY = e.clientY - rect.top;
      
      // Draw temporary crop rectangle
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Draw crop rectangle
        ctx.strokeStyle = '#4f74a3';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          cropStartX, 
          cropStartY, 
          cropEndX - cropStartX, 
          cropEndY - cropStartY
        );
        ctx.setLineDash([]);
      };
      img.src = originalImage;
    };
  };
  
  canvas.onmouseup = function() {
    canvas.onmousemove = null;
  };
}

function applyCrop() {
  if (!isCropping) return;
  
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  
  const width = Math.abs(cropEndX - cropStartX);
  const height = Math.abs(cropEndY - cropStartY);
  const x = Math.min(cropStartX, cropEndX);
  const y = Math.min(cropStartY, cropEndY);
  
  // Get the cropped image data
  const imageData = ctx.getImageData(x, y, width, height);
  
  // Resize canvas to cropped dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Put the cropped image back
  ctx.putImageData(imageData, 0, 0);
  
  // Reset cropping state
  isCropping = false;
  canvas.style.cursor = 'default';
  canvas.onmousedown = null;
  canvas.onmousemove = null;
  canvas.onmouseup = null;
  
  // Update original image for further edits
  originalImage = canvas.toDataURL();
}

function resetCrop() {
  isCropping = false;
  
  const canvas = document.getElementById('editorCanvas');
  canvas.style.cursor = 'default';
  canvas.onmousedown = null;
  canvas.onmousemove = null;
  canvas.onmouseup = null;
  
  // Redraw original image
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = originalImage;
}

// Save edited image
function saveEditedImage() {
  const canvas = document.getElementById('editorCanvas');
  selectedImage = canvas.toDataURL();
  
  // Update preview
  showImagePreview(selectedImage);
  
  closeModal('imageEditorModal');
  showMessage('Image edited successfully!', 'success');
}

// Create post
async function createPost() {
  const postText = document.getElementById('postText').value;
  const postDestination = document.getElementById('postDestination').value;
  
  if (!postText.trim() && !selectedImage) {
    showMessage('Please add some text or an image to your post', 'error');
    return;
  }
  
  // Check if posting to community and user has communities
  if (postDestination === 'community') {
    if (!userCommunities || userCommunities.length === 0) {
      showMessage('You are not connected to any community. Please connect to your community to start vibing!', 'error');
      return;
    }
  }
  
  try {
    const formData = new FormData();
    formData.append('text', postText);
    formData.append('destination', postDestination);
    
    if (selectedImage) {
      // Convert data URL to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      formData.append('image', blob, 'post-image.jpg');
    }
    
    const token = localStorage.getItem('token');
    const postResponse = await fetch('/create-post', {
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
          ? `Posted in ${data.communityName || 'your community'} successfully!` 
          : 'Post created successfully!', 
        'success'
      );
      
      // Reset form
      document.getElementById('postText').value = '';
      removeImage();
      
      // Reload posts
      loadPosts();
    } else {
      showMessage(data.message || 'Failed to create post', 'error');
    }
  } catch (error) {
    console.error('Post creation error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Load user communities
async function loadUserCommunities() {
  if (!currentUser) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/user-communities', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      userCommunities = data.communities || [];
    }
  } catch (error) {
    console.error('Error loading user communities:', error);
  }
}

// Load posts
async function loadPosts() {
  try {
    const response = await fetch('/posts');
    const data = await response.json();
    
    if (data.success) {
      displayPosts(data.posts);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

// Display posts
function displayPosts(posts) {
  const postsFeed = document.getElementById('postsFeed');
  postsFeed.innerHTML = '';
  
  if (posts.length === 0) {
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
      <div class="post-content">${post.text}</div>
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

// Format time
function formatTime(timestamp) {
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
    const response = await fetch('/trending');
    const data = await response.json();
    
    if (data.success) {
      displayTrendingContent(data.trending);
    }
  } catch (error) {
    console.error('Error loading trending content:', error);
  }
}

// Display trending content
function displayTrendingContent(trending) {
  const container = document.getElementById('trendingContainer');
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

// Update live stats
async function updateLiveStats() {
  try {
    const response = await fetch('/live-stats');
    const data = await response.json();
    
    if (data.success) {
      // Update hero stats
      document.getElementById('heroOnline').textContent = data.onlineUsers || 0;
      document.getElementById('heroPostsToday').textContent = data.postsToday || 0;
      document.getElementById('heroChats').textContent = data.activeChats || 0;
      
      // Update header and footer
      liveUsersCount.textContent = `${data.onlineUsers || 0} Active`;
      footerUsers.textContent = `${data.onlineUsers || 0} Users Online`;
      
      // Update live activity notification
      if (data.liveActivity) {
        liveActivityNotif.style.display = 'flex';
        notifText.textContent = data.liveActivity;
      } else {
        liveActivityNotif.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error updating live stats:', error);
  }
  
  // Update every 30 seconds
  setTimeout(updateLiveStats, 30000);
}

// Show profile page
function showProfilePage() {
  // Load profile data
  loadProfileData();
  document.getElementById('profilePageModal').style.display = 'flex';
}

// Load profile data
function loadProfileData() {
  if (!currentUser) return;
  
  // Update profile information
  document.getElementById('profileDisplayName').textContent = currentUser.name || 'User';
  document.getElementById('nicknameValue').textContent = currentUser.nickname || currentUser.name?.toLowerCase() || 'user';
  document.getElementById('profileDescriptionText').textContent = currentUser.description || 'No description added yet. Click edit to add one!';
  
  // Update stats (these would come from the server)
  document.getElementById('profilePostsCount').textContent = currentUser.postCount || 0;
  document.getElementById('profileLikesCount').textContent = currentUser.likeCount || 0;
  document.getElementById('usedHoursCount').textContent = `${currentUser.activeHours || 0}h`;
  
  // Load user posts
  loadUserPosts();
}

// Open edit profile
function openEditProfile() {
  document.getElementById('editProfileSection').style.display = 'block';
  
  // Populate form fields
  document.getElementById('editNickname').value = currentUser.nickname || currentUser.name?.toLowerCase() || '';
  document.getElementById('editDescription').value = currentUser.description || '';
  
  // Set up character counters
  document.getElementById('editNickname').addEventListener('input', function() {
    document.getElementById('nicknameCharCount').textContent = `${this.value.length}/25`;
  });
  
  document.getElementById('editDescription').addEventListener('input', function() {
    document.getElementById('descCharCount').textContent = `${this.value.length}/150`;
  });
  
  // Initialize character counts
  document.getElementById('nicknameCharCount').textContent = `${document.getElementById('editNickname').value.length}/25`;
  document.getElementById('descCharCount').textContent = `${document.getElementById('editDescription').value.length}/150`;
}

// Cancel edit profile
function cancelEditProfile() {
  document.getElementById('editProfileSection').style.display = 'none';
}

// Save profile
async function saveProfile() {
  const nickname = document.getElementById('editNickname').value;
  const description = document.getElementById('editDescription').value;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nickname, description }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update current user data
      currentUser.nickname = nickname;
      currentUser.description = description;
      localStorage.setItem('userData', JSON.stringify(currentUser));
      
      // Update profile display
      loadProfileData();
      cancelEditProfile();
      showMessage('Profile updated successfully!', 'success');
    } else {
      showMessage(data.message || 'Failed to update profile', 'error');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    showMessage('Network error. Please try again.', 'error');
  }
}

// Handle avatar upload
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // In a real app, you would upload this to the server
    const reader = new FileReader();
    reader.onload = function(e) {
      // Update profile photo display
      const profilePhoto = document.getElementById('profilePhoto');
      profilePhoto.innerHTML = '';
      profilePhoto.style.backgroundImage = `url(${e.target.result})`;
      profilePhoto.style.backgroundSize = 'cover';
      profilePhoto.style.backgroundPosition = 'center';
      
      showMessage('Avatar updated!', 'success');
    };
    reader.readAsDataURL(file);
  }
}

// Switch profile tab
function switchProfileTab(tab) {
  // Hide all tab contents
  document.getElementById('postsTab').style.display = 'none';
  document.getElementById('likesTab').style.display = 'none';
  
  // Remove active class from all tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab and activate button
  document.getElementById(tab + 'Tab').style.display = 'block';
  event.target.classList.add('active');
  
  // Load tab data if needed
  if (tab === 'likes') {
    loadProfileLikes();
  }
}

// Load user posts
async function loadUserPosts() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/user-posts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayUserPosts(data.posts);
    }
  } catch (error) {
    console.error('Error loading user posts:', error);
  }
}

// Display user posts
function displayUserPosts(posts) {
  const container = document.getElementById('userPostsContainer');
  const noPostsMessage = document.getElementById('noPostsMessage');
  
  if (!posts || posts.length === 0) {
    container.innerHTML = '';
    noPostsMessage.style.display = 'block';
    return;
  }
  
  noPostsMessage.style.display = 'none';
  container.innerHTML = '';
  
  posts.forEach(post => {
    const postItem = document.createElement('div');
    postItem.className = 'user-post-item';
    
    let imageHtml = '';
    if (post.image) {
      imageHtml = `<img src="${post.image}" alt="Post image" style="max-width:100%; border-radius:6px; margin-top:10px;">`;
    }
    
    postItem.innerHTML = `
      <div style="font-weight:600; margin-bottom:5px;">${formatTime(post.createdAt)}</div>
      <div>${post.text}</div>
      ${imageHtml}
      <div style="display:flex; gap:15px; margin-top:10px; font-size:13px; color:#a0a0a0;">
        <span>❤️ ${post.likes || 0}</span>
        <span>💬 ${post.comments || 0}</span>
      </div>
    `;
    
    container.appendChild(postItem);
  });
}

// Load profile likes
async function loadProfileLikes() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/profile-likes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayProfileLikes(data.likes);
    }
  } catch (error) {
    console.error('Error loading profile likes:', error);
  }
}

// Display profile likes
function displayProfileLikes(likes) {
  const container = document.getElementById('profileLikesContainer');
  const noLikesMessage = document.getElementById('noLikesMessage');
  
  if (!likes || likes.length === 0) {
    container.innerHTML = '';
    noLikesMessage.style.display = 'block';
    return;
  }
  
  noLikesMessage.style.display = 'none';
  container.innerHTML = '';
  
  likes.forEach(like => {
    const likeItem = document.createElement('div');
    likeItem.className = 'profile-like-item';
    
    likeItem.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:30px; height:30px; background:linear-gradient(135deg, #4f74a3, #8da4d3); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:600; font-size:12px;">
          ${like.userName ? like.userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <div style="font-weight:600;">${like.userName || 'Anonymous'}</div>
          <div style="font-size:12px; color:#a0a0a0;">liked your post</div>
        </div>
      </div>
    `;
    
    container.appendChild(likeItem);
  });
}

// University selection
function selectUniversity(type) {
  // This would load colleges based on the selected university type
  showPage('collegeList');
  document.getElementById('collegeTitle').textContent = `${type.toUpperCase()} Colleges`;
  
  // Load colleges (mock data for demonstration)
  loadColleges(type);
}

// Load colleges
function loadColleges(type) {
  // Mock data - in a real app, this would come from the server
  const mockColleges = {
    nit: [
      { name: 'NIT Trichy', location: 'Tamil Nadu', students: '8000', established: '1964' },
      { name: 'NIT Warangal', location: 'Telangana', students: '7500', established: '1959' },
      { name: 'NIT Surathkal', location: 'Karnataka', students: '7000', established: '1960' }
    ],
    iit: [
      { name: 'IIT Bombay', location: 'Maharashtra', students: '10000', established: '1958' },
      { name: 'IIT Delhi', location: 'Delhi', students: '9000', established: '1961' },
      { name: 'IIT Madras', location: 'Tamil Nadu', students: '9500', established: '1959' }
    ],
    vit: [
      { name: 'VIT Vellore', location: 'Tamil Nadu', students: '35000', established: '1984' },
      { name: 'VIT Bhopal', location: 'Madhya Pradesh', students: '8000', established: '2017' }
    ],
    other: [
      { name: 'University of Delhi', location: 'Delhi', students: '25000', established: '1922' },
      { name: 'JNU', location: 'Delhi', students: '8000', established: '1969' }
    ]
  };
  
  const colleges = mockColleges[type] || [];
  displayColleges(colleges);
}

// Display colleges
function displayColleges(colleges) {
  const container = document.getElementById('collegeContainer');
  container.innerHTML = '';
  
  colleges.forEach(college => {
    const card = document.createElement('div');
    card.className = 'college-card';
    card.onclick = () => selectCollege(college.name);
    
    card.innerHTML = `
      <h3>${college.name}</h3>
      <p>📍 ${college.location}</p>
      <div class="college-stats">
        <span>👥 ${college.students} students</span>
        <span>📅 Est. ${college.established}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // Setup pagination (simplified)
  setupPagination();
}

// Setup pagination
function setupPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = `
    <button onclick="prevPage()">← Previous</button>
    <button class="active">1</button>
    <button>2</button>
    <button>3</button>
    <button onclick="nextPage()">Next →</button>
  `;
}

// Select college
function selectCollege(collegeName) {
  // Show verification modal
  document.getElementById('verifyModal').style.display = 'flex';
}

// Verify college
function verifyCollege() {
  const email = document.getElementById('verifyEmail').value;
  
  // Simple email validation
  if (!email.includes('@')) {
    showMessage('Please enter a valid college email', 'error');
    return;
  }
  
  // In a real app, this would send a verification email
  showMessage('Verification email sent! Please check your inbox.', 'success');
  closeModal('verifyModal');
}

// Search colleges
function searchColleges() {
  const searchTerm = document.getElementById('searchCollege').value.toLowerCase();
  const collegeCards = document.querySelectorAll('.college-card');
  
  collegeCards.forEach(card => {
    const collegeName = card.querySelector('h3').textContent.toLowerCase();
    if (collegeName.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Back to universities
function backToUniversities() {
  showPage('home');
}

// Pagination functions
function prevPage() {
  // Implementation would go here
  showMessage('Loading previous page...', 'info');
}

function nextPage() {
  // Implementation would go here
  showMessage('Loading next page...', 'info');
}

// Handle window resize
function handleResize() {
  // Close menus on resize to larger screens
  if (window.innerWidth > 768) {
    document.getElementById('hamburgerMenu').style.display = 'none';
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
  const duration = 15 + Math.random() * 20; // Random duration between 15-35 seconds
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
