// VIBEXPERT - MINIMAL VERSION THAT ACTUALLY WORKS

const API_URL = 'https://vibexpert-backend-main.onrender.com';

let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];
let liveUsersCount = Math.floor(Math.random() * 500) + 100;

// NEW: Photo upload state
let selectedFiles = [];
let previewUrls = [];

const colleges = {
  nit: [
    {name: 'NIT Bhopal', email: 'nit.bhopal@edu.in', location: 'Bhopal'},
    {name: 'NIT Rourkela', email: 'nit.rourkela@edu.in', location: 'Rourkela'},
    {name: 'NIT Warangal', email: 'nit.warangal@edu.in', location: 'Warangal'},
  ],
  iit: [
    {name: 'IIT Delhi', email: 'iit.delhi@edu.in', location: 'New Delhi'},
    {name: 'IIT Bombay', email: 'iit.bombay@edu.in', location: 'Mumbai'},
  ],
  vit: [
    {name: 'VIT Bhopal', email: 'vitbhopal@vit.ac.in', location: 'Bhopal'},
  ],
  other: [
    {name: 'Delhi University', email: 'du@delhi.edu.in', location: 'New Delhi'},
  ]
};

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
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// INIT
document.addEventListener('DOMContentLoaded', function() {
  checkUser();
  showLoginForm();
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
    msg('Fill all fields', 'error');
    return;
  }
  
  if(password !== confirm) {
    msg('Passwords don\'t match', 'error');
    return;
  }
  
  try {
    msg('Creating account...', 'success');
    
    await apiCall('/api/register', 'POST', { username, email, password });
    
    msg('🎉 Account created!', 'success');
    
    document.getElementById('signupForm').reset();
    
    setTimeout(() => {
      goLogin(null);
    }, 2000);
  } catch (error) {
    msg('❌ ' + error.message, 'error');
  }
}

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
    msg('Enter your email', 'error');
    return;
  }
  
  try {
    await apiCall('/api/forgot-password', 'POST', { email });
    msg('✅ Check your email', 'success');
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
  
  window.scrollTo(0, 0);
}

function goHome() {
  showPage('home');
}

// UNIVERSITIES
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
    html += `
      <div class="college-item">
        <h3>${c.name}</h3>
        <p>${c.location}</p>
        <button onclick="openVerify('${c.name}', '${c.email}')">Connect</button>
      </div>
    `;
  });
  
  document.getElementById('collegeContainer').innerHTML = html;
}

function backToUniversities() {
  document.getElementById('collegeList').style.display = 'none';
}

function openVerify(name, email) {
  currentVerifyCollege = {name, email};
  document.getElementById('verifyModal').style.display = 'flex';
}

function verifyCollege() {
  msg('🎓 Joined college!', 'success');
  closeModal('verifyModal');
}

// ========================================
// PHOTO UPLOAD FUNCTIONS - SIMPLIFIED
// ========================================

function openPhotoGallery() {
  console.log('📷 Opening gallery...');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  
  input.onchange = function(e) {
    console.log('Files selected:', e.target.files.length);
    handleFileSelection(e);
  };
  
  input.click();
}

function openCamera() {
  console.log('📸 Opening camera...');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  
  input.onchange = function(e) {
    console.log('Photo taken');
    handleFileSelection(e);
  };
  
  input.click();
}

function handleFileSelection(e) {
  const files = Array.from(e.target.files);
  console.log('Processing files:', files.length);
  
  if (files.length + selectedFiles.length > 5) {
    msg('⚠️ Max 5 files', 'error');
    return;
  }
  
  files.forEach(file => {
    if (!file.type.match(/image.*/) && !file.type.match(/video.*/)) {
      msg('⚠️ Images/videos only', 'error');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      msg('⚠️ File too large', 'error');
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
  if (!container) {
    console.error('Preview container not found!');
    return;
  }
  
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
  msg('🗑️ Removed', 'success');
}

function clearSelectedFiles() {
  previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
  selectedFiles = [];
  previewUrls = [];
  displayPhotoPreviews();
}

// CREATE POST
async function createPost() {
  console.log('Creating post...');
  const text = document.getElementById('postText').value.trim();
  
  if(!text && selectedFiles.length === 0) {
    msg('⚠️ Add text or photos', 'error');
    return;
  }
  
  if(!currentUser) {
    msg('❌ Please login', 'error');
    return;
  }
  
  try {
    msg('📤 Posting...', 'success');
    
    const formData = new FormData();
    formData.append('content', text);
    
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });
    
    const data = await apiCall('/api/posts', 'POST', formData);
    
    if(data.success) {
      msg('🎉 Posted!', 'success');
      
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
      feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No posts yet</div>';
      return;
    }
    
    let html = '';
    data.posts.forEach(post => {
      const author = post.users?.username || 'User';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.timestamp || post.created_at).toLocaleString();
      
      html += `
        <div style="background:#1a1a1a; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="font-weight:600; color:#6366f1; margin-bottom:10px;">@${author}</div>
          ${content ? `<div style="color:#fff; margin-bottom:10px;">${content}</div>` : ''}
          
          ${media.length > 0 ? `
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; margin:10px 0;">
              ${media.map(m => 
                m.type === 'image' 
                  ? `<img src="${m.url}" style="width:100%; border-radius:8px;">` 
                  : `<video src="${m.url}" controls style="width:100%; border-radius:8px;"></video>`
              ).join('')}
            </div>
          ` : ''}
          
          <div style="color:#888; font-size:13px; margin-top:10px;">${time}</div>
        </div>
      `;
    });
    
    feedEl.innerHTML = html;
  } catch (error) {
    console.error('Load posts error:', error);
    feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">Failed to load</div>';
  }
}

// MENUS
function toggleOptionsMenu() {
  const menu = document.getElementById('optionsMenu');
  if(!menu) return;
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  if(!menu) return;
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

// MODALS
function showComplaintModal() {
  document.getElementById('complaintModal').style.display = 'flex';
}

function showContactModal() {
  document.getElementById('contactModal').style.display = 'flex';
}

function showPhotoModal() {
  document.getElementById('photoModal').style.display = 'flex';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if(modal) modal.style.display = 'none';
}

function showProfilePage() {
  msg('Profile coming soon!', 'success');
}

function submitComplaint() {
  msg('Complaint submitted!', 'success');
  closeModal('complaintModal');
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
  msg('🎨 Theme changed!', 'success');
}

// MESSAGE
function msg(text, type) {
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

// Log to see if functions are loaded
console.log('✅ VibeXpert loaded');
console.log('✅ openPhotoGallery:', typeof openPhotoGallery);
console.log('✅ openCamera:', typeof openCamera);
console.log('✅ createPost:', typeof createPost);
