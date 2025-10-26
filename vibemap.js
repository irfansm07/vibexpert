// VIBEXPERT - COMPLETE FIXED FRONTEND WITH FULL BACKEND INTEGRATION + PHOTO UPLOAD

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
    {name: 'NIT Jamshedpur', email: 'nit.jam@edu.in', location: 'Jamshedpur'},
    {name: 'NIT Durgapur', email: 'nit.durgapur@edu.in', location: 'Durgapur'},
    {name: 'NIT Srinagar', email: 'nit.srinagar@edu.in', location: 'Srinagar'},
    {name: 'NIT Hamirpur', email: 'nit.hamirpur@edu.in', location: 'Hamirpur'},
    {name: 'NIT Jalandhar', email: 'nit.jalandhar@edu.in', location: 'Jalandhar'},
    {name: 'NIT Kurukshetra', email: 'nit.kurukshetra@edu.in', location: 'Kurukshetra'},
    {name: 'NIT Allahabad', email: 'nit.allahabad@edu.in', location: 'Allahabad'},
  ],
  iit: [
    {name: 'IIT Delhi', email: 'iit.delhi@edu.in', location: 'New Delhi'},
    {name: 'IIT Bombay', email: 'iit.bombay@edu.in', location: 'Mumbai'},
    {name: 'IIT Madras', email: 'iit.madras@edu.in', location: 'Chennai'},
    {name: 'IIT Kharagpur', email: 'iit.kharagpur@edu.in', location: 'Kharagpur'},
    {name: 'IIT Kanpur', email: 'iit.kanpur@edu.in', location: 'Kanpur'},
    {name: 'IIT Roorkee', email: 'iit.roorkee@edu.in', location: 'Roorkee'},
    {name: 'IIT Guwahati', email: 'iit.guwahati@edu.in', location: 'Guwahati'},
    {name: 'IIT Hyderabad', email: 'iit.hyderabad@edu.in', location: 'Hyderabad'},
  ],
  vit: [
    {name: 'VIT Bhopal', email: 'vitbhopal@vit.ac.in', location: 'Bhopal'},
    {name: 'VIT Vellore', email: 'vitvellore@vit.ac.in', location: 'Vellore'},
    {name: 'VIT Chennai', email: 'vitchennai@vit.ac.in', location: 'Chennai'},
    {name: 'VIT Amaravati', email: 'vitamaravati@vit.ac.in', location: 'Amaravati'},
  ],
  other: [
    {name: 'Delhi University', email: 'du@delhi.edu.in', location: 'New Delhi'},
    {name: 'Mumbai University', email: 'mu@mumbai.edu.in', location: 'Mumbai'},
    {name: 'Bangalore University', email: 'bu@bangalore.edu.in', location: 'Bangalore'},
    {name: 'Pune University', email: 'pu@pune.edu.in', location: 'Pune'},
  ]
};

const activityMessages = [
  '📝 {user} posted something new!',
  '❤️ {user} liked a post',
  '💬 {user} joined the chat',
  '🔥 {user}\'s post is trending!',
  '🎉 {user} just joined VibeXpert',
];

const trendingTopics = [
  {title: 'Campus Life', posts: Math.floor(Math.random() * 1000) + 500, emoji: '🎓'},
  {title: 'Friday Vibes', posts: Math.floor(Math.random() * 800) + 300, emoji: '🎉'},
  {title: 'Study Tips', posts: Math.floor(Math.random() * 600) + 200, emoji: '📚'},
  {title: 'Coffee Talks', posts: Math.floor(Math.random() * 700) + 250, emoji: '☕'},
];

// HELPER: Get Auth Token
function getToken() {
  return localStorage.getItem('authToken');
}

// HELPER: Make API Call with better error handling
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`🔄 ${method} ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response. Please try again.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Error: ${response.status}`);
    }
    
    console.log('✅ Success:', endpoint);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Better error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    throw error;
  }
}

// NEW: API Call for File Upload
async function apiUpload(endpoint, formData) {
  const options = {
    method: 'POST',
    headers: {}
  };
  
  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  options.body = formData;
  
  try {
    console.log(`📤 Uploading to ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status}`);
    }
    
    console.log('✅ Upload Success');
    return data;
  } catch (error) {
    console.error('❌ Upload Error:', error);
    throw error;
  }
}

// INIT
document.addEventListener('DOMContentLoaded', function() {
  initCursor();
  checkUser();
  loadTheme();
  initProfilePage();
  showLoginForm();
  startLiveActivityUpdates();
  startUserCountUpdate();
  
  // Load posts if on posts page
  if(document.getElementById('posts')) {
    loadPosts();
  }
});

// CURSOR CHAIN
function initCursor() {
  let x = 0, y = 0;
  const chains = [];
  
  for(let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'chain';
    el.style.opacity = 1 - (i * 0.08);
    document.body.appendChild(el);
    chains.push({el, x: 0, y: 0});
  }
  
  document.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    
    let prevX = x, prevY = y;
    chains.forEach((c) => {
      const dx = prevX - c.x;
      const dy = prevY - c.y;
      const angle = Math.atan2(dy, dx);
      
      c.x = prevX - Math.cos(angle) * 6;
      c.y = prevY - Math.sin(angle) * 6;
      
      c.el.style.left = c.x + 'px';
      c.el.style.top = c.y + 'px';
      
      prevX = c.x;
      prevY = c.y;
    });
  });
}

// LIVE ACTIVITY SYSTEM
function startLiveActivityUpdates() {
  setInterval(() => {
    const randomActivity = activityMessages[Math.floor(Math.random() * activityMessages.length)];
    const randomUser = 'User_' + Math.floor(Math.random() * 9000 + 1000);
    const activity = randomActivity.replace('{user}', randomUser);
    
    updateLiveNotification(activity);
    liveUsersCount = Math.max(80, Math.floor(liveUsersCount + Math.random() * 20 - 8));
    updateUserCounts();
    loadTrendingTopics();
  }, 5000);
}

function updateLiveNotification(text) {
  const notif = document.getElementById('liveActivityNotif');
  const notifText = document.getElementById('notifText');
  if(notifText) {
    notifText.textContent = text;
    notif.style.animation = 'none';
    setTimeout(() => {
      notif.style.animation = 'slideInUp 0.5s ease';
    }, 10);
  }
}

function startUserCountUpdate() {
  setInterval(() => {
    liveUsersCount = Math.max(80, Math.floor(liveUsersCount + Math.random() * 15 - 6));
    updateUserCounts();
  }, 8000);
}

function updateUserCounts() {
  const liveUsersEl = document.getElementById('liveUsersCount');
  const footerUsersEl = document.getElementById('footerUsers');
  const heroOnlineEl = document.getElementById('heroOnline');
  
  if(liveUsersEl) liveUsersEl.textContent = liveUsersCount + ' Active';
  if(footerUsersEl) footerUsersEl.textContent = liveUsersCount + ' Users Online';
  if(heroOnlineEl) heroOnlineEl.textContent = liveUsersCount;
}

// TRENDING TOPICS
function loadTrendingTopics() {
  const container = document.getElementById('trendingContainer');
  if(!container) return;
  
  let html = '';
  trendingTopics.forEach(topic => {
    html += `
      <div class="trending-card">
        <div class="trending-card-header">
          <span class="trending-title">${topic.emoji} ${topic.title}</span>
          <span class="trending-badge">🔥 TRENDING</span>
        </div>
        <div class="trending-text">
          Join thousands discussing ${topic.title.toLowerCase()} on campus!
        </div>
        <div class="trending-footer">
          <div class="trending-engagement">
            <div class="engagement-item">💬 ${topic.posts}</div>
            <div class="engagement-item">👥 ${Math.floor(topic.posts / 5)}</div>
          </div>
          <span style="color:#888; font-size:11px;">Now trending</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// HOME STATS
function updateHomeStats() {
  const postsToday = Math.floor(Math.random() * 500) + 200;
  const activeChats = Math.floor(Math.random() * 150) + 50;
  
  const heroPostsEl = document.getElementById('heroPostsToday');
  const heroChatsEl = document.getElementById('heroChats');
  
  if(heroPostsEl) heroPostsEl.textContent = postsToday;
  if(heroChatsEl) heroChatsEl.textContent = activeChats;
}

// CHAT ONLINE COUNT
function updateChatOnlineCount() {
  const chatOnline = Math.floor(Math.random() * 80) + 20;
  const chatOnlineEl = document.getElementById('chatOnlineCount');
  if(chatOnlineEl) chatOnlineEl.textContent = chatOnline;
}

// SHOW LOGIN FORM ON INIT
function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
}

// LOGIN - WITH BACKEND
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
      updateHomeStats();
      loadTrendingTopics();
    }, 800);
  } catch (error) {
    msg('❌ Login failed: ' + error.message, 'error');
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
    
    const data = await apiCall('/api/forgot-password', 'POST', { email });
    
    msg('✅ Check your email for reset code', 'success');
    document.getElementById('resetEmail').value = '';
    
    showResetCodeForm(email);
  } catch (error) {
    msg('❌ ' + error.message, 'error');
  }
}

function showResetCodeForm(email) {
  const form = document.getElementById('forgotPasswordForm');
  form.innerHTML = `
    <h2>Enter Reset Code</h2>
    <p style="color:#888; font-size:13px; margin-bottom:15px;">Check your email: ${email}</p>
    <input type="text" id="resetCode" placeholder="Enter 6-digit code" required maxlength="6">
    <input type="password" id="newPassword" placeholder="New Password" required>
    <input type="password" id="confirmPassword" placeholder="Confirm New Password" required>
    <button type="button" onclick="verifyResetCode('${email}')">Reset Password</button>
    <p><a href="#" onclick="goLogin(event)">Back to Login</a></p>
  `;
}

async function verifyResetCode(email) {
  const code = document.getElementById('resetCode').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if(!code || !newPassword || !confirmPassword) {
    msg('Fill all fields', 'error');
    return;
  }
  
  if(newPassword !== confirmPassword) {
    msg('Passwords don\'t match', 'error');
    return;
  }
  
  try {
    msg('Resetting password...', 'success');
    
    await apiCall('/api/reset-password', 'POST', {
      email,
      code,
      newPassword
    });
    
    msg('✅ Password reset successful!', 'success');
    
    setTimeout(() => goLogin(null), 1500);
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
  
  const forgotForm = document.getElementById('forgotPasswordForm');
  forgotForm.innerHTML = `
    <h2>Reset Password</h2>
    <input type="email" id="resetEmail" placeholder="Enter your email" required>
    <button type="submit">Send Reset Link</button>
    <p><a href="#" onclick="goLogin(event)">Back to Login</a></p>
  `;
}

// SIGNUP - WITH BACKEND
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
  
  if(password.length < 6) {
    msg('Password must be at least 6 characters', 'error');
    return;
  }
  
  try {
    msg('Creating account...', 'success');
    
    await apiCall('/api/register', 'POST', {
      username,
      email,
      password
    });
    
    msg('🎉 Account created! Redirecting to login...', 'success');
    
    document.getElementById('signupForm').reset();
    
    setTimeout(() => {
      goLogin(null);
      msg('✅ You can now log in', 'success');
    }, 2000);
  } catch (error) {
    msg('❌ ' + error.message, 'error');
  }
}

function checkUser() {
  const token = getToken();
  const saved = localStorage.getItem('user');
  
  if(token && saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
    updateHomeStats();
    loadTrendingTopics();
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  const optionsMenu = document.getElementById('optionsMenu');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  if(optionsMenu) optionsMenu.style.display = 'none';
  if(hamburgerMenu) hamburgerMenu.style.display = 'none';
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
  
  if(name === 'communities') {
    loadCommunities();
    updateChatOnlineCount();
  }
  if(name === 'home') {
    updateHomeStats();
    loadTrendingTopics();
  }
  if(name === 'posts') {
    loadPosts();
  }
  
  const optionsMenu = document.getElementById('optionsMenu');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const optionsBtn = document.querySelector('.options-btn');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  
  if(optionsMenu) optionsMenu.style.display = 'none';
  if(hamburgerMenu) hamburgerMenu.style.display = 'none';
  if(optionsBtn) optionsBtn.classList.remove('active');
  if(hamburgerBtn) hamburgerBtn.classList.remove('active');
  
  window.scrollTo(0, 0);
}

function goHome() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const firstLink = document.querySelector('.nav-link');
  if(firstLink) firstLink.classList.add('active');
  showPage('home');
}

function goToHome() {
  showPage('home', { target: document.querySelector('.nav-link') });
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

function showColleges(filtered = null) {
  const list = filtered || allColleges;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const page = list.slice(start, end);
  
  const verified = JSON.parse(localStorage.getItem('verified') || '[]');
  
  let html = '';
  page.forEach(c => {
    const isVerified = verified.includes(c.name);
    html += `
      <div class="college-item">
        <h3>${escapeHtml(c.name)}</h3>
        <p>${escapeHtml(c.location)}</p>
        <p style="font-size:12px; color:#888;">${escapeHtml(c.email)}</p>
        <button ${isVerified ? 'class="verified"' : ''} onclick="openVerify('${escapeHtml(c.name).replace(/'/g, "\\'")}', '${escapeHtml(c.email)}')">${isVerified ? '✓ Joined' : 'Connect'}</button>
      </div>
    `;
  });
  
  document.getElementById('collegeContainer').innerHTML = html;
  
  const total = Math.ceil(list.length / ITEMS_PER_PAGE);
  let pag = '';
  for(let i = 1; i <= total; i++) {
    pag += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i}, '${filtered ? 'filtered' : 'all'}')">${i}</button>`;
  }
  document.getElementById('pagination').innerHTML = pag;
}

function goPage(n, type) {
  currentPage = n;
  if(type === 'filtered') {
    const query = document.getElementById('searchCollege').value.toLowerCase();
    const filtered = allColleges.filter(c => c.name.toLowerCase().includes(query) || c.location.toLowerCase().includes(query));
    showColleges(filtered);
  } else {
    showColleges();
  }
  window.scrollTo(0, 0);
}

function searchColleges() {
  const query = document.getElementById('searchCollege').value.toLowerCase();
  currentPage = 1;
  const filtered = allColleges.filter(c => c.name.toLowerCase().includes(query) || c.location.toLowerCase().includes(query));
  showColleges(filtered);
}

function backToUniversities() {
  document.getElementById('collegeList').style.display = 'none';
  window.scrollTo(0, 0);
}

function openVerify(name, email) {
  currentVerifyCollege = {name, email};
  document.getElementById('verifyEmail').value = '';
  document.getElementById('verifyModal').style.display = 'flex';
}

function verifyCollege() {
  const email = document.getElementById('verifyEmail').value.trim();
  
  if(!email) {
    msg('Enter your email', 'error');
    return;
  }
  
  const domain = currentVerifyCollege.email.split('@')[1];
  const userDomain = email.split('@')[1];
  
  if(userDomain !== domain) {
    msg('Use your college email (' + domain + ')', 'error');
    return;
  }
  
  let verified = JSON.parse(localStorage.getItem('verified') || '[]');
  if(!verified.includes(currentVerifyCollege.name)) {
    verified.push(currentVerifyCollege.name);
    localStorage.setItem('verified', JSON.stringify(verified));
  }
  
  if(currentUser) {
    currentUser.joinedCollege = currentVerifyCollege.name;
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
  
  msg('🎓 Joined ' + currentVerifyCollege.name, 'success');
  closeModal('verifyModal');
  
  setTimeout(() => {
    showColleges();
  }, 500);
}

// ========================================
// NEW: PHOTO UPLOAD FUNCTIONS
// ========================================

// Open file picker for photos
function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  input.onchange = handleFileSelection;
  input.click();
}

// Open camera
function openCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.capture = 'environment';
  input.onchange = handleFileSelection;
  input.click();
}

// Handle file selection
function handleFileSelection(e) {
  const files = Array.from(e.target.files);
  
  if (files.length + selectedFiles.length > 5) {
    msg('⚠️ Maximum 5 files allowed', 'error');
    return;
  }
  
  files.forEach(file => {
    // Validate file type
    if (!file.type.match(/image.*/) && !file.type.match(/video.*/)) {
      msg('⚠️ Only images and videos allowed', 'error');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      msg('⚠️ File too large (max 10MB)', 'error');
      return;
    }
    
    selectedFiles.push(file);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    previewUrls.push({
      url: previewUrl,
      type: file.type.startsWith('image') ? 'image' : 'video'
    });
  });
  
  displayPhotoPreviews();
  msg('✅ ' + files.length + ' file(s) selected', 'success');
}

// Display photo previews
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
        <button onclick="removeSelectedFile(${index})" style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.7); color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:16px;">✕</button>
      </div>
    `;
  });
  
  html += '</div>';
  html += `<div style="text-align:right; color:#888; font-size:12px;">${selectedFiles.length}/5 files selected</div>`;
  container.innerHTML = html;
}

// Remove selected file
function removeSelectedFile(index) {
  URL.revokeObjectURL(previewUrls[index].url);
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  displayPhotoPreviews();
  msg('🗑️ File removed', 'success');
}

// Clear all selected files
function clearSelectedFiles() {
  previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
  selectedFiles = [];
  previewUrls = [];
  displayPhotoPreviews();
}

// ========================================
// POSTS - UPDATED WITH PHOTO UPLOAD
// ========================================

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
    
    // Add college if user has joined one
    if(currentUser.college) {
      formData.append('college', currentUser.college);
    }
    
    // Add selected files
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });
    
    const data = await apiUpload('/api/posts', formData);
    
    if(data.success) {
      msg('🎉 Post created successfully!', 'success');
      
      // Clear form
      document.getElementById('postText').value = '';
      clearSelectedFiles();
      
      // Reload posts
      loadPosts();
      updateHomeStats();
    }
  } catch (error) {
    msg('❌ Failed to create post: ' + error.message, 'error');
  }
}

async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if(!feedEl) return;
  
  try {
    const data = await apiCall('/api/posts?limit=20', 'GET');
    
    if(!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No posts yet. Be the first to post!</div>';
      return;
    }
    
    let html = '';
    data.posts.forEach(post => {
      const author = post.users?.username || 'Unknown';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.created_at).toLocaleString();
      const likes = post.likes_count || 0;
      const comments = post.comments_count || 0;
      
      html += `
        <div class="post">
          <div class="author">@${escapeHtml(author)}</div>
          ${content ? `<div class="text">${escapeHtml(content)}</div>` : ''}
          
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
          
          <div class="time">${escapeHtml(time)}</div>
          <div style="display:flex; gap:15px; margin-top:10px; color:#888; font-size:13px;">
            <span>❤️ ${likes} likes</span>
            <span>💬 ${comments} comments</span>
          </div>
        </div>
      `;
    });
    
    feedEl.innerHTML = html;
  } catch (error) {
    console.error('Load posts error:', error);
    feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">Failed to load posts. Please try again.</div>';
  }
}

// Open image in modal
function openImageModal(url) {
  const modal = document.getElementById('imageViewModal');
  if(!modal) {
    // Create modal if doesn't exist
    const modalHtml = `
      <div id="imageViewModal" class="modal" style="display:flex;">
        <div class="modal-content" style="max-width:90%; max-height:90%; background:transparent;">
          <span class="close" onclick="closeModal('imageViewModal')" style="color:white; font-size:40px;">&times;</span>
          <img id="modalImage" src="" style="width:100%; height:auto; border-radius:8px;">
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
  
  document.getElementById('modalImage').src = url;
  document.getElementById('imageViewModal').style.display = 'flex';
}
