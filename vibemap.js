// VIBEXPERT - COMPLETE WORKING VERSION

const API_URL = 'https://vibexpert-backend-main.onrender.com';

let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];

const colleges = {
  nit: [
    {name: 'NIT Bhopal', email: '@manit.ac.in', location: 'Bhopal'},
    {name: 'NIT Rourkela', email: '@nitrkl.ac.in', location: 'Rourkela'},
    {name: 'NIT Warangal', email: '@nitw.ac.in', location: 'Warangal'},
    {name: 'NIT Trichy', email: '@nitt.edu', location: 'Trichy'},
    {name: 'NIT Surathkal', email: '@nitk.edu.in', location: 'Surathkal'},
  ],
  iit: [
    {name: 'IIT Delhi', email: '@iitd.ac.in', location: 'New Delhi'},
    {name: 'IIT Bombay', email: '@iitb.ac.in', location: 'Mumbai'},
    {name: 'IIT Madras', email: '@iitm.ac.in', location: 'Chennai'},
    {name: 'IIT Kharagpur', email: '@kgp.iitkgp.ac.in', location: 'Kharagpur'},
    {name: 'IIT Kanpur', email: '@iitk.ac.in', location: 'Kanpur'},
  ],
  vit: [
    {name: 'VIT Bhopal', email: '@vitbhopal.ac.in', location: 'Bhopal'},
    {name: 'VIT Vellore', email: '@vit.ac.in', location: 'Vellore'},
    {name: 'VIT Chennai', email: '@vit.ac.in', location: 'Chennai'},
  ],
  other: [
    {name: 'Delhi University', email: '@du.ac.in', location: 'New Delhi'},
    {name: 'Mumbai University', email: '@mu.ac.in', location: 'Mumbai'},
    {name: 'BITS Pilani', email: '@pilani.bits-pilani.ac.in', location: 'Pilani'},
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
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
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
    
    if (currentUser.college) {
      updateLiveNotif(`Connected to ${currentUser.college}`);
    }
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
      loadPosts();
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
    
    msg('🎉 Account created! Check your email', 'success');
    
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
  } else if(name === 'communities') {
    loadCommunities();
  }
  
  // Close mobile menus
  document.getElementById('hamburgerMenu').style.display = 'none';
  
  window.scrollTo(0, 0);
}

function goHome() {
  showPage('home');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
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
  document.getElementById('home').style.display = 'none';
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
    const isConnected = currentUser && currentUser.college === c.name;
    html += `
      <div class="college-item">
        <h3>${c.name}</h3>
        <p>${c.location}</p>
        ${isConnected 
          ? '<button class="verified" disabled>✓ Connected</button>'
          : `<button onclick="openVerify('${c.name}', '${c.email}')">Connect</button>`
        }
      </div>
    `;
  });
  
  document.getElementById('collegeContainer').innerHTML = html;
}

function searchColleges() {
  const search = document.getElementById('searchCollege').value.toLowerCase();
  const filtered = colleges[currentType].filter(c => 
    c.name.toLowerCase().includes(search) || c.location.toLowerCase().includes(search)
  );
  allColleges = filtered;
  currentPage = 1;
  showColleges();
}

function backToUniversities() {
  document.getElementById('collegeList').style.display = 'none';
  document.getElementById('home').style.display = 'block';
}

// COLLEGE VERIFICATION
function openVerify(name, emailDomain) {
  if (currentUser && currentUser.college) {
    msg('⚠️ You are already connected to ' + currentUser.college, 'error');
    return;
  }
  
  currentVerifyCollege = {name, emailDomain};
  
  const modalHtml = `
    <div class="modal-box">
      <span class="close" onclick="closeModal('verifyModal')">&times;</span>
      <h2>Verify Your College</h2>
      <p>Enter your college email to verify</p>
      <p style="color:#888; font-size:13px;">Email must end with: ${emailDomain}</p>
      <input type="email" id="verifyEmail" placeholder="your.email${emailDomain}">
      <button onclick="requestVerificationCode()">Send Verification Code</button>
      <div id="codeSection" style="display:none; margin-top:20px;">
        <input type="text" id="verifyCode" placeholder="Enter 6-digit code" maxlength="6">
        <button onclick="verifyCollegeCode()">Verify Code</button>
      </div>
    </div>
  `;
  
  document.getElementById('verifyModal').innerHTML = modalHtml;
  document.getElementById('verifyModal').style.display = 'flex';
}

async function requestVerificationCode() {
  const email = document.getElementById('verifyEmail').value.trim();
  
  if (!email) {
    msg('⚠️ Enter your email', 'error');
    return;
  }
  
  if (!email.endsWith(currentVerifyCollege.emailDomain)) {
    msg('⚠️ Email must end with ' + currentVerifyCollege.emailDomain, 'error');
    return;
  }
  
  try {
    msg('📧 Sending verification code...', 'success');
    
    await apiCall('/api/college/request-verification', 'POST', {
      collegeName: currentVerifyCollege.name,
      collegeEmail: email
    });
    
    msg('✅ Code sent to ' + email, 'success');
    document.getElementById('codeSection').style.display = 'block';
  } catch (error) {
    msg('❌ ' + error.message, 'error');
  }
}

async function verifyCollegeCode() {
  const code = document.getElementById('verifyCode').value.trim();
  
  if (!code || code.length !== 6) {
    msg('⚠️ Enter 6-digit code', 'error');
    return;
  }
  
  try {
    msg('🔍 Verifying...', 'success');
    
    const data = await apiCall('/api/college/verify', 'POST', { code });
    
    msg('🎉 ' + data.message, 'success');
    
    // Update current user
    currentUser.college = data.college;
    currentUser.communityJoined = true;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    closeModal('verifyModal');
    
    setTimeout(() => {
      showPage('communities');
      updateLiveNotif('Connected to ' + data.college);
    }, 1500);
  } catch (error) {
    msg('❌ ' + error.message, 'error');
  }
}

// POSTS
let selectedFiles = [];
let previewUrls = [];

async function createPost() {
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

async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if(!feedEl) return;
  
  try {
    feedEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Loading posts...</div>';
    
    const params = currentUser?.college ? `?college=${encodeURIComponent(currentUser.college)}` : '';
    const data = await apiCall('/api/posts' + params, 'GET');
    
    if(!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No posts yet. Be the first to post! 📝</div>';
      return;
    }
    
    let html = '';
    data.posts.forEach(post => {
      const author = post.users?.username || 'User';
      const authorId = post.users?.id || '';
      const content = post.content || '';
      const media = post.media || [];
      const time = new Date(post.created_at || post.timestamp).toLocaleString();
      const isOwn = currentUser && authorId === currentUser.id;
      
      html += `
        <div class="post">
          <div class="post-header">
            <div class="author">@${author}</div>
            ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️ Delete</button>` : ''}
          </div>
          ${content ? `<div class="text">${content}</div>` : ''}
          
          ${media.length > 0 ? `
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; margin:15px 0;">
              ${media.map(m => 
                m.type === 'image' 
                  ? `<img src="${m.url}" style="width:100%; border-radius:8px; cursor:pointer;" onclick="window.open('${m.url}', '_blank')">` 
                  : `<video src="${m.url}" controls style="width:100%; border-radius:8px;"></video>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="time">${time}</div>
        </div>
      `;
    });
    
    feedEl.innerHTML = html;
  } catch (error) {
    console.error('Load posts error:', error);
    feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">Failed to load posts</div>';
  }
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  
  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    msg('🗑️ Post deleted', 'success');
    loadPosts();
  } catch (error) {
    msg('❌ Failed to delete', 'error');
  }
}

// PHOTO UPLOAD
function showPhotoModal() {
  const modalHtml = `
    <div class="modal-box">
      <span class="close" onclick="closeModal('photoModal')">&times;</span>
      <h2>Add Photos/Videos</h2>
      <button onclick="openPhotoGallery()" style="margin-bottom:10px;">📁 Choose from Gallery</button>
      <button onclick="openCamera()">📸 Take Photo</button>
      <div id="photoPreviewContainer" style="margin-top:15px;"></div>
    </div>
  `;
  document.getElementById('photoModal').innerHTML = modalHtml;
  document.getElementById('photoModal').style.display = 'flex';
  displayPhotoPreviews();
}

function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  
  input.onchange = function(e) {
    handleFileSelection(e);
  };
  
  input.click();
}

function openCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  
  input.onchange = function(e) {
    handleFileSelection(e);
  };
  
  input.click();
}

function handleFileSelection(e) {
  const files = Array.from(e.target.files);
  
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
  msg('✅ ' + files.length + ' file(s) added', 'success');
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
        <button onclick="removeSelectedFile(${index})" style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.7); color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:16px; line-height:1;">✕</button>
      </div>
    `;
  });
  
  html += '</div>';
  html += `<div style="text-align:right; color:#888; font-size:12px;">${selectedFiles.length}/5 files</div>`;
  html += `<button onclick="closeModal('photoModal')" style="margin-top:10px; width:100%;">Done</button>`;
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
}

// COMMUNITIES
function loadCommunities() {
  const container = document.getElementById('communitiesContainer');
  
  if (!currentUser || !currentUser.communityJoined) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Connect to your college first to join community chat!</p>
        <button class="home-nav-btn" onclick="showPage('home')">Explore Colleges</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="community-card">
      <h3>${currentUser.college} Community</h3>
      <p>Chat with students from your college</p>
      <button onclick="openCommunityChat()">Open Chat</button>
    </div>
  `;
}

function openCommunityChat() {
  document.getElementById('chatSection').style.display = 'block';
  loadCommunityMessages();
}

async function loadCommunityMessages() {
  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('chatMessages');
    
    if (!data.messages || data.messages.length === 0) {
      messagesEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">No messages yet. Start chatting!</div>';
      return;
    }
    
    let html = '';
    data.messages.reverse().forEach(msg => {
      const isOwn = msg.sender_id === currentUser.id;
      const sender = msg.users?.username || 'User';
      html += `
        <div class="chat-message ${isOwn ? 'own' : 'other'}">
          ${!isOwn ? `<div class="sender">@${sender}</div>` : ''}
          <div class="text">${msg.content}</div>
        </div>
      `;
    });
    
    messagesEl.innerHTML = html;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (error) {
    console.error('Load messages error:', error);
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();
  
  if (!content) return;
  
  try {
    await apiCall('/api/community/messages', 'POST', { content });
    input.value = '';
    loadCommunityMessages();
  } catch (error) {
    msg('❌ Failed to send message', 'error');
  }
}

function handleChatKeypress(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

// MODALS
function closeModal(id) {
  const modal = document.getElementById(id);
  if(modal) modal.style.display = 'none';
}

function showComplaintModal() {
  document.getElementById('complaintModal').style.display = 'flex';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

function showContactModal() {
  document.getElementById('contactModal').style.display = 'flex';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

function showProfilePage() {
  msg('Profile page coming soon!', 'success');
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

function submitComplaint() {
  const text = document.getElementById('complaintText').value.trim();
  if (text) {
    msg('✅ Complaint submitted!', 'success');
    document.getElementById('complaintText').value = '';
    closeModal('complaintModal');
  } else {
    msg('⚠️ Enter complaint details', 'error');
  }
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
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

// MENUS
function toggleOptionsMenu() {
  const menu = document.getElementById('optionsMenu');
  const hamburger = document.getElementById('hamburgerMenu');
  hamburger.style.display = 'none';
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  options.style.display = 'none';
  
  if(menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

// Close menus when clicking outside
document.addEventListener('click', function(e) {
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
});

// LIVE STATS
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

function updateLiveNotif(text) {
  const notif = document.getElementById('notifText');
  if (notif) notif.textContent = text;
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

// TRENDING (Mock data)
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

// Load trending on page load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(loadTrending, 500);
});

console.log('✅ VibeXpert fully loaded and functional!');
