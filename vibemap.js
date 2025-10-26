// VIBEXPERT - SIMPLIFIED & FIXED VERSION

const API_URL = 'https://vibexpert-backend-main.onrender.com';

let currentUser = null;
let selectedFiles = [];
let previewUrls = [];

// Get Auth Token
function getToken() {
  return localStorage.getItem('authToken');
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {}
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
    console.log(`🔄 ${method} ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    console.log('✅ Success');
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// INIT
document.addEventListener('DOMContentLoaded', function() {
  checkUser();
  showLoginForm();
  
  if(document.getElementById('posts')) {
    loadPosts();
  }
});

// Check if user is logged in
function checkUser() {
  const token = getToken();
  const saved = localStorage.getItem('user');
  
  if(token && saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
  }
}

// Show Login Form
function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
}

// LOGIN
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if(!email || !password) {
    msg('Fill all fields', 'error');
    return;
  }
  
  try {
    msg('Logging in...', 'success');
    
    const data = await apiCall('/api/login', 'POST', { email, password });
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    msg('✅ Login successful!', 'success');
    
    setTimeout(() => {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('mainPage').style.display = 'block';
      document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
      document.getElementById('loginForm').reset();
    }, 800);
  } catch (error) {
    msg('❌ Login failed: ' + error.message, 'error');
  }
}

// SIGNUP
async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  if(!username || !email || !password || !confirm) {
    msg('Fill all required fields', 'error');
    return;
  }
  
  if(password !== confirm) {
    msg('Passwords don\'t match', 'error');
    return;
  }
  
  try {
    msg('Creating account...', 'success');
    
    await apiCall('/api/register', 'POST', {
      username,
      email,
      password
    });
    
    msg('🎉 Account created! Redirecting...', 'success');
    
    document.getElementById('signupForm').reset();
    
    setTimeout(() => {
      goLogin(null);
      msg('✅ You can now log in', 'success');
    }, 2000);
  } catch (error) {
    msg('❌ ' + error.message, 'error');
  }
}

// FORGOT PASSWORD
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
    msg('Please enter your email', 'error');
    return;
  }
  
  try {
    msg('Sending reset code...', 'success');
    
    await apiCall('/api/forgot-password', 'POST', { email });
    
    msg('✅ Check your email for reset code', 'success');
  } catch (error) {
    msg('❌ ' + error.message, 'error');
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

// LOGOUT
function logout() {
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  msg('👋 Logged out', 'success');
  showLoginForm();
}

// PAGES
function showPage(name, e) {
  if(e) e.preventDefault();
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const targetPage = document.getElementById(name);
  if(targetPage) targetPage.style.display = 'block';
  
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if(e && e.target) e.target.classList.add('active');
  
  if(name === 'posts') {
    loadPosts();
  }
  
  // Close menus
  const optionsMenu = document.getElementById('optionsMenu');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  if(optionsMenu) optionsMenu.style.display = 'none';
  if(hamburgerMenu) hamburgerMenu.style.display = 'none';
  
  window.scrollTo(0, 0);
}

// PHOTO UPLOAD
function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  input.onchange = handleFileSelection;
  input.click();
}

function openCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.capture = 'environment';
  input.onchange = handleFileSelection;
  input.click();
}

function handleFileSelection(e) {
  const files = Array.from(e.target.files);
  
  if (files.length + selectedFiles.length > 5) {
    msg('⚠️ Maximum 5 files allowed', 'error');
    return;
  }
  
  files.forEach(file => {
    if (!file.type.match(/image.*/) && !file.type.match(/video.*/)) {
      msg('⚠️ Only images and videos allowed', 'error');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      msg('⚠️ File too large (max 10MB)', 'error');
      return;
    }
    
    selectedFiles.push(file);
    
    const previewUrl = URL.createObjectURL(file);
    previewUrls.push({
      url: previewUrl,
      type: file.type.startsWith('image') ? 'image' : 'video'
    });
  });
  
  displayPhotoPreviews();
  msg('✅ ' + files.length + ' file(s) selected', 'success');
}

function displayPhotoPreviews() {
  const container = document.getElementById('photoPreviewContainer');
  if (!container) return;
  
  if (previewUrls.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:10px; margin:10px 0;">';
  
  previewUrls.forEach((preview, index) => {
    html += `
      <div style="position:relative; border-radius:8px; overflow:hidden; aspect-ratio:1;">
        ${preview.type === 'image' 
          ? `<img src="${preview.url}" style="width:100%; height:100%; object-fit:cover;">` 
          : `<video src="${preview.url}" style="width:100%; height:100%; object-fit:cover;"></video>`
        }
        <button onclick="removeSelectedFile(${index})" style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.7); color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">✕</button>
      </div>
    `;
  });
  
  html += '</div>';
  html += `<div style="text-align:right; color:#888; font-size:12px;">${selectedFiles.length}/5 files</div>`;
  container.innerHTML = html;
}

function removeSelectedFile(index) {
  URL.revokeObjectURL(previewUrls[index].url);
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  displayPhotoPreviews();
  msg('🗑️ File removed', 'success');
}

function clearSelectedFiles() {
  previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
  selectedFiles = [];
  previewUrls = [];
  displayPhotoPreviews();
}

// CREATE POST
async function createPost() {
  const text = document.getElementById('postText').value.trim();
  
  if(!text && selectedFiles.length === 0) {
    msg('⚠️ Add text or photos', 'error');
    return;
  }
  
  if(!currentUser) {
    msg('❌ Please login first', 'error');
    return;
  }
  
  try {
    msg('📤 Creating post...', 'success');
    
    const formData = new FormData();
    formData.append('content', text);
    
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });
    
    const data = await apiCall('/api/posts', 'POST', formData);
    
    if(data.success) {
      msg('🎉 Post created!', 'success');
      
      document.getElementById('postText').value = '';
      clearSelectedFiles();
      
      loadPosts();
    }
  } catch (error) {
    msg('❌ Failed: ' + error.message, 'error');
  }
}

// LOAD POSTS
async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if(!feedEl) return;
  
  try {
    const data = await apiCall('/api/posts', 'GET');
    
    if(!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No posts yet. Be the first!</div>';
      return;
    }
    
    let html = '';
    data.posts.forEach(post => {
      const author = post.users?.username || 'Unknown';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.timestamp || post.created_at).toLocaleString();
      
      html += `
        <div style="background:#1a1a1a; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <div style="font-weight:600; color:#6366f1; margin-bottom:10px; font-size:14px;">@${escapeHtml(author)}</div>
          ${content ? `<div style="color:#fff; margin-bottom:10px;">${escapeHtml(content)}</div>` : ''}
          
          ${media.length > 0 ? `
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; margin:10px 0;">
              ${media.map(m => {
                if(m.type === 'image') {
                  return `<img src="${m.url}" style="width:100%; border-radius:8px; cursor:pointer;" onclick="openImageModal('${m.url}')">`;
                } else {
                  return `<video src="${m.url}" controls style="width:100%; border-radius:8px;"></video>`;
                }
              }).join('')}
            </div>
          ` : ''}
          
          <div style="color:#888; font-size:13px; margin-top:10px;">${escapeHtml(time)}</div>
        </div>
      `;
    });
    
    feedEl.innerHTML = html;
  } catch (error) {
    console.error('Load posts error:', error);
    feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">Failed to load posts. Please refresh.</div>';
  }
}

// Open image in modal
function openImageModal(url) {
  let modal = document.getElementById('imageViewModal');
  if(!modal) {
    const modalHtml = `
      <div id="imageViewModal" class="modal" style="display:flex;" onclick="if(event.target === this) closeModal('imageViewModal')">
        <div style="max-width:90%; max-height:90%; position:relative;">
          <span onclick="closeModal('imageViewModal')" style="position:absolute; top:-40px; right:0; color:white; font-size:40px; cursor:pointer;">&times;</span>
          <img id="modalImage" src="" style="width:100%; height:auto; border-radius:8px;">
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('imageViewModal');
  }
  
  document.getElementById('modalImage').src = url;
  modal.style.display = 'flex';
}

// MENUS
function toggleOptionsMenu() {
  const menu = document.getElementById('optionsMenu');
  const btn = document.querySelector('.options-btn');
  
  if(!menu || !btn) return;
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
    btn.classList.add('active');
  } else {
    menu.style.display = 'none';
    btn.classList.remove('active');
  }
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  const btn = document.querySelector('.hamburger-btn');
  
  if(!menu || !btn) return;
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
    btn.classList.add('active');
  } else {
    menu.style.display = 'none';
    btn.classList.remove('active');
  }
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
  const optionsMenu = document.getElementById('optionsMenu');
  const optionsBtn = document.querySelector('.options-btn');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  
  if(optionsMenu && optionsBtn && !e.target.closest('.options-btn') && !e.target.closest('.options-menu')) {
    optionsMenu.style.display = 'none';
    optionsBtn.classList.remove('active');
  }
  
  if(hamburgerMenu && hamburgerBtn && !e.target.closest('.hamburger-btn') && !e.target.closest('.hamburger-menu')) {
    hamburgerMenu.style.display = 'none';
    hamburgerBtn.classList.remove('active');
  }
});

// MODALS
function closeModal(id) {
  const modal = document.getElementById(id);
  if(modal) modal.style.display = 'none';
}

// MESSAGE
function msg(text, type) {
  const box = document.getElementById('message');
  if(!box) return;
  
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  box.innerHTML = '';
  box.appendChild(div);
  setTimeout(() => {
    if(div.parentNode) div.remove();
  }, 4000);
}

// ESCAPE HTML
function escapeHtml(text) {
  if(!text) return '';
  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
