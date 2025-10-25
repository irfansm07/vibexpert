// VIBEXPERT - COMPLETE JAVASCRIPT WITH BACKEND INTEGRATION

const API_URL = 'http://vibexpert-backend-main.onrender.com';

let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];
let liveUsersCount = Math.floor(Math.random() * 500) + 100;
let activitiesQueue = [];

const colleges = {
  nit: [
    {name: 'NIT Bhopal', email: 'nit.bhopal@edu.in', location: 'Bhopal'},
    {name: 'NIT Rourkela', email: 'nit.rourkela@edu.in', location: 'Rourzela'},
    {name: 'NIT Warangal', email: 'nit.warangal@edu.in', location: 'Warangal'},
    {name: 'NIT Jamshedpur', email: 'nit.jam@edu.in', location: 'Jamshedpur'},
    {name: 'NIT Durgapur', email: 'nit.durgapur@edu.in', location: 'Durgapur'},
    {name: 'NIT Srinagar', email: 'nit.srinagar@edu.in', location: 'Srinagar'},
    {name: 'NIT Hamirpur', email: 'nit.hamirpur@edu.in', location: 'Hamirpur'},
    {name: 'NIT Jalandhar', email: 'nit.jalandhar@edu.in', location: 'Jalandhar'},
    {name: 'NIT Kurukshetra', email: 'nit.kurukshetra@edu.in', location: 'Kurukshetra'},
    {name: 'NIT Allahabad', email: 'nit.allahabad@edu.in', location: 'Allahabad'},
    {name: 'NIT Silchar', email: 'nit.silchar@edu.in', location: 'Silchar'},
    {name: 'NIT Manipur', email: 'nit.manipur@edu.in', location: 'Manipur'},
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
    {name: 'IIT Indore', email: 'iit.indore@edu.in', location: 'Indore'},
    {name: 'IIT Varanasi', email: 'iit.varanasi@edu.in', location: 'Varanasi'},
    {name: 'IIT Bhubaneswar', email: 'iit.bhubaneswar@edu.in', location: 'Bhubaneswar'},
    {name: 'IIT Patna', email: 'iit.patna@edu.in', location: 'Patna'},
  ],
  vit: [
    {name: 'VIT Bhopal', email: 'vitbhopal@vit.ac.in', location: 'Bhopal'},
    {name: 'VIT Vellore', email: 'vitvellore@vit.ac.in', location: 'Vellore'},
    {name: 'VIT Chennai', email: 'vitchennai@vit.ac.in', location: 'Chennai'},
    {name: 'VIT Pune', email: 'vitpune@vit.ac.in', location: 'Pune'},
    {name: 'VIT Amaravati', email: 'vitamaravati@vit.ac.in', location: 'Amaravati'},
  ],
  other: [
    {name: 'Delhi University', email: 'du@delhi.edu.in', location: 'New Delhi'},
    {name: 'Mumbai University', email: 'mu@mumbai.edu.in', location: 'Mumbai'},
    {name: 'Bangalore University', email: 'bu@bangalore.edu.in', location: 'Bangalore'},
    {name: 'Chennai University', email: 'cu@chennai.edu.in', location: 'Chennai'},
    {name: 'Kolkata University', email: 'ku@kolkata.edu.in', location: 'Kolkata'},
    {name: 'Hyderabad University', email: 'hu@hyderabad.edu.in', location: 'Hyderabad'},
    {name: 'Pune University', email: 'pu@pune.edu.in', location: 'Pune'},
    {name: 'Banaras Hindu University', email: 'bhu@banaras.edu.in', location: 'Varanasi'},
  ]
};

const activityMessages = [
  '📝 {user} posted something new!',
  '❤️ {user} liked a post',
  '💬 {user} joined the chat',
  '🔥 {user}\'s post is trending!',
  '🎉 {user} just joined VibeXpert',
  '⭐ {user} got a new like',
  '📸 {user} shared a photo',
  '🚀 {user} is super active today!',
];

const trendingTopics = [
  {title: 'Campus Life', posts: Math.floor(Math.random() * 1000) + 500, emoji: '🎓'},
  {title: 'Friday Vibes', posts: Math.floor(Math.random() * 800) + 300, emoji: '🎉'},
  {title: 'Study Tips', posts: Math.floor(Math.random() * 600) + 200, emoji: '📚'},
  {title: 'Coffee Talks', posts: Math.floor(Math.random() * 700) + 250, emoji: '☕'},
  {title: 'Gaming Zone', posts: Math.floor(Math.random() * 900) + 400, emoji: '🎮'},
  {title: 'Sports Talk', posts: Math.floor(Math.random() * 800) + 350, emoji: '⚽'},
];

// HELPER: Get Auth Token
function getToken() {
  return localStorage.getItem('authToken');
}

// HELPER: Make API Call
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
  initCursor();
  checkUser();
  loadTheme();
  initProfilePage();
  showLoginForm();
  startLiveActivityUpdates();
  startUserCountUpdate();
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
  notifText.textContent = text;
  notif.style.animation = 'none';
  setTimeout(() => {
    notif.style.animation = 'slideInUp 0.5s ease';
  }, 10);
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

// LOGIN - NOW WITH BACKEND
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
    
    // Save token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    msg('✅ Logged in!', 'success');
    
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

// FORGOT PASSWORD - NOW WITH BACKEND
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
    
    msg('✅ ' + data.message, 'success');
    document.getElementById('resetEmail').value = '';
    
    // Show code input and new password fields
    showResetCodeForm(email);
  } catch (error) {
    msg('❌ Failed: ' + error.message, 'error');
  }
}

// NEW: Show reset code verification form
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

// NEW: Verify reset code and update password
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
    msg('Verifying code...', 'success');
    
    const data = await apiCall('/api/verify-reset-code', 'POST', {
      email,
      code,
      newPassword
    });
    
    msg('✅ ' + data.message, 'success');
    
    setTimeout(() => goLogin(null), 1500);
  } catch (error) {
    msg('❌ Failed: ' + error.message, 'error');
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
  
  // Reset forgot password form to original state
  const forgotForm = document.getElementById('forgotPasswordForm');
  forgotForm.innerHTML = `
    <h2>Reset Password</h2>
    <input type="email" id="resetEmail" placeholder="Enter your email" required>
    <button type="submit">Send Reset Link</button>
    <p><a href="#" onclick="goLogin(event)">Back to Login</a></p>
  `;
}

// SIGNUP - NOW WITH BACKEND
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
    
    const data = await apiCall('/api/register', 'POST', {
      username,
      email,
      password
    });
    
    msg('🎉 ' + data.message, 'success');
    
    setTimeout(() => {
      goLogin(null);
    }, 2000);
  } catch (error) {
    msg('❌ Registration failed: ' + error.message, 'error');
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
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  msg('👋 Logged out', 'success');
  showLoginForm();
}

// PAGES
function showPage(name, e) {
  if(e) e.preventDefault();
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(name).style.display = 'block';
  
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
  
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.querySelector('.options-btn').classList.remove('active');
  document.querySelector('.hamburger-btn').classList.remove('active');
  
  window.scrollTo(0, 0);
}

function goHome() {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.nav-link').classList.add('active');
  showPage('home');
}

function goToHome() {
  showPage('home', { target: document.querySelector('.nav-link') });
}

// REST OF THE CODE REMAINS THE SAME (universities, colleges, posts, etc.)
// ... (keeping all the other functions from the original file)

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
        <h3>${c.name}</h3>
        <p>${c.location}</p>
        <p style="font-size:12px; color:#888;">${c.email}</p>
        <button ${isVerified ? 'class="verified"' : ''} onclick="openVerify('${c.name}', '${c.email}')">${isVerified ? '✓ Joined' : 'Connect'}</button>
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

function createPost() {
  const text = document.getElementById('postText').value.trim();
  if(!text) {
    msg('Write something', 'error');
    return;
  }
  
  const post = {
    author: currentUser.username,
    text: text,
    time: new Date().toLocaleTimeString()
  };
  
  let posts = JSON.parse(localStorage.getItem('posts') || '[]');
  posts.unshift(post);
  localStorage.setItem('posts', JSON.stringify(posts));
  
  document.getElementById('postText').value = '';
  loadPosts();
  msg('🚀 Posted!', 'success');
  updateHomeStats();
}

function loadPosts() {
  let posts = JSON.parse(localStorage.getItem('posts') || '[]');
  let html = '';
  
  posts.forEach(p => {
    html += `
      <div class="post">
        <div class="author">@${p.author}</div>
        <div class="text">${p.text}</div>
        <div class="time">${p.time}</div>
      </div>
    `;
  });
  
  document.getElementById('postsFeed').innerHTML = html;
}

function toggleOptionsMenu() {
  const menu = document.getElementById('optionsMenu');
  const btn = document.querySelector('.options-btn');
  
  if(menu.style.display === 'none') {
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
  
  if(menu.style.display === 'none') {
    menu.style.display = 'block';
    btn.classList.add('active');
  } else {
    menu.style.display = 'none';
    btn.classList.remove('active');
  }
}

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

function showComplaintModal() {
  document.getElementById('complaintModal').style.display = 'flex';
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.querySelector('.options-btn').classList.remove('active');
  document.querySelector('.hamburger-btn').classList.remove('active');
}

function submitComplaint() {
  const text = document.getElementById('complaintText').value.trim();
  
  if(!text) {
    msg('Write your complaint', 'error');
    return;
  }
  
  let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
  complaints.push({user: currentUser.username, text, date: new Date().toLocaleDateString()});
  localStorage.setItem('complaints', JSON.stringify(complaints));
  
  msg('✅ Complaint submitted!', 'success');
  document.getElementById('complaintText').value = '';
  closeModal('complaintModal');
}

function toggleTheme() {
  const body = document.body;
  if(body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.querySelector('.options-btn').classList.remove('active');
  document.querySelector('.hamburger-btn').classList.remove('active');
  msg('🎨 Theme updated!', 'success');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme + '-theme';
}

function showContactModal() {
  document.getElementById('contactModal').style.display = 'flex';
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.querySelector('.options-btn').classList.remove('active');
  document.querySelector('.hamburger-btn').classList.remove('active');
}

function showPhotoModal() {
  document.getElementById('photoModal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if(e.target === m) {
      m.style.display = 'none';
    }
  });
});

function loadCommunities() {
  const joinedCollege = currentUser?.joinedCollege;
  const verified = JSON.parse(localStorage.getItem('verified') || '[]');
  
  const container = document.getElementById('communitiesContainer');
  const chatSection = document.getElementById('chatSection');
  
  if(verified.length === 0 || !joinedCollege) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Please join your college community to start chatting and connecting!</p>
        <button onclick="goToHome()" class="home-nav-btn">Go to Home</button>
      </div>
    `;
    chatSection.style.display = 'none';
  } else {
    container.innerHTML = `
      <div class="community-card">
        <h3>✓ ${joinedCollege}</h3>
        <p>You are part of this community</p>
        <button onclick="scrollToChat()">Open Chat</button>
      </div>
    `;
    chatSection.style.display = 'block';
    loadChatMessages();
  }
}

function scrollToChat() {
  document.getElementById('chatSection').scrollIntoView({ behavior: 'smooth' });
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if(!message) {
    msg('Write a message', 'error');
    return;
  }
  
  const chatData = {
    sender: currentUser.username,
    text: message,
    college: currentUser.joinedCollege,
    time: new Date().toLocaleTimeString()
  };
  
  let chats = JSON.parse(localStorage.getItem('chats') || '[]');
  chats.push(chatData);
  localStorage.setItem('chats', JSON.stringify(chats));
  
  input.value = '';
  loadChatMessages();
  msg('💬 Message sent!', 'success');
}

function handleChatKeypress(e) {
  if(e.key === 'Enter') {
    sendChatMessage();
  }
}

function loadChatMessages() {
  const messagesContainer = document.getElementById('chatMessages');
  let chats = JSON.parse(localStorage.getItem('chats') || '[]');
  
  chats = chats.filter(c => c.college === currentUser?.joinedCollege);
  
  let html = '';
  chats.forEach(chat => {
    const isOwn = chat.sender === currentUser.username;
    html += `
      <div class="chat-message ${isOwn ? 'own' : 'other'}">
        ${!isOwn ? `<div class="sender">@${chat.sender}</div>` : ''}
        <div class="text">${chat.text}</div>
      </div>
    `;
  });
  
  messagesContainer.innerHTML = html || '<div style="color:#888; text-align:center; padding:20px;">Start the conversation!</div>';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showProfilePage() {
  loadProfileData();
  document.getElementById('profilePageModal').style.display = 'flex';
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.querySelector('.options-btn').classList.remove('active');
  document.querySelector('.hamburger-btn').classList.remove('active');
  window.scrollTo(0, 0);
}

function loadProfileData() {
  loadProfileBasicInfo();
  loadProfileStats();
  loadUserPosts();
  loadProfileLikes();
}

function loadProfileBasicInfo() {
  if(!currentUser) return;
  
  let profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.email) || '{}');
  
  document.getElementById('profileDisplayName').textContent = currentUser.username || 'User';
  document.getElementById('nicknameValue').textContent = profileData.nickname || currentUser.username;
  document.getElementById('profileDescriptionText').textContent = profileData.description || 'No description added yet. Click edit to add one!';
  
  if(profileData.avatar) {
    document.getElementById('profilePhoto').style.backgroundImage = `url(${profileData.avatar})`;
    document.getElementById('profilePhoto').textContent = '';
  } else {
    document.getElementById('profilePhoto').style.backgroundImage = 'none';
    document.getElementById('profilePhoto').textContent = '👤';
  }
  
  document.getElementById('editNickname').value = profileData.nickname || '';
  document.getElementById('editDescription').value = profileData.description || '';
  updateCharCounts();
}

function loadProfileStats() {
  if(!currentUser) return;
  
  let userPosts = getUserPosts();
  document.getElementById('profilePostsCount').textContent = userPosts.length;
  
  let profileLikes = getProfileLikes();
  document.getElementById('profileLikesCount').textContent = profileLikes.length;
  
  let profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.email) || '{}');
  let activeHours = profileData.activeHours || Math.floor(Math.random() * 24) + 1;
  document.getElementById('usedHoursCount').textContent = activeHours + 'h';
}

function getUserPosts() {
  let allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
  return allPosts.filter(p => p.author === currentUser.username);
}

function getProfileLikes() {
  let likes = JSON.parse(localStorage.getItem('profileLikes_' + currentUser.email) || '[]');
  return likes;
}

function loadUserPosts() {
  let userPosts = getUserPosts();
  let container = document.getElementById('userPostsContainer');
  let noPostsMsg = document.getElementById('noPostsMessage');
  
  if(userPosts.length === 0) {
    container.innerHTML = '';
    noPostsMsg.style.display = 'block';
  } else {
    noPostsMsg.style.display = 'none';
    container.innerHTML = '';
    userPosts.reverse().forEach((post, index) => {
      let postHtml = `
        <div class="user-post-card">
          <div class="post-header">
            <span class="post-time">${post.time}</span>
            <button class="post-delete-btn" onclick="deleteUserPost(${userPosts.length - 1 - index})">Delete</button>
          </div>
          <div class="post-content">${escapeHtml(post.text)}</div>
          <div class="post-stats"><span>Posted</span></div>
        </div>
      `;
      container.innerHTML += postHtml;
    });
  }
}

function deleteUserPost(index) {
  if(confirm('Delete this post?')) {
    let allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    let userPosts = allPosts.filter(p => p.author === currentUser.username);
    userPosts.reverse();
    userPosts.splice(index, 1);
    userPosts.reverse();
    let otherPosts = allPosts.filter(p => p.author !== currentUser.username);
    let finalPosts = otherPosts.concat(userPosts);
    localStorage.setItem('posts', JSON.stringify(finalPosts));
    loadUserPosts();
    msg('🗑️ Post deleted!', 'success');
  }
}

function loadProfileLikes() {
  let likes = getProfileLikes();
  let container = document.getElementById('profileLikesContainer');
  let noLikesMsg = document.getElementById('noLikesMessage');
  
  if(likes.length === 0) {
    container.innerHTML = '';
    noLikesMsg.style.display = 'block';
  } else {
    noLikesMsg.style.display = 'none';
    container.innerHTML = '';
    likes.forEach(like => {
      let likeHtml = `
        <div class="like-card">
          <div class="like-avatar">👤</div>
          <div class="like-name">${escapeHtml(like.userName)}</div>
          <div class="like-time">${like.time || 'Recently'}</div>
        </div>
      `;
      container.innerHTML += likeHtml;
    });
  }
}

function openEditProfile() {
  document.getElementById('editProfileSection').style.display = 'block';
}

function cancelEditProfile() {
  document.getElementById('editProfileSection').style.display = 'none';
  loadProfileBasicInfo();
}

function saveProfile() {
  let nickname = document.getElementById('editNickname').value.trim();
  let description = document.getElementById('editDescription').value.trim();
  
  if(!nickname || !description) {
    msg('All fields required', 'error');
    return;
  }
  if(nickname.length > 25 || description.length > 150) {
    msg('Text too long', 'error');
    return;
  }
  
  let profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.email) || '{}');
  profileData.nickname = nickname;
  profileData.description = description;
  profileData.activeHours = profileData.activeHours || Math.floor(Math.random() * 24) + 1;
  localStorage.setItem('profileData_' + currentUser.email, JSON.stringify(profileData));
  
  msg('✅ Profile updated!', 'success');
  document.getElementById('editProfileSection').style.display = 'none';
  loadProfileBasicInfo();
  loadProfileStats();
}

function updateCharCounts() {
  let ni = document.getElementById('editNickname');
  let di = document.getElementById('editDescription');
  if(ni) ni.addEventListener('input', () => { document.getElementById('nicknameCharCount').textContent = ni.value.length + '/25'; });
  if(di) di.addEventListener('input', () => { document.getElementById('descCharCount').textContent = di.value.length + '/150'; });
}

function switchProfileTab(tabName) {
  document.querySelectorAll('.profile-tab-content').forEach(t => { t.classList.remove('active'); t.style.display = 'none'; });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  if(tabName === 'posts') {
    document.getElementById('postsTab').classList.add('active');
    document.getElementById('postsTab').style.display = 'block';
  } else {
    document.getElementById('likesTab').classList.add('active');
    document.getElementById('likesTab').style.display = 'block';
  }
  event.target.classList.add('active');
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')) {
    msg('Select an image file', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    let profileData = JSON.parse(localStorage.getItem('profileData_' + currentUser.email) || '{}');
    profileData.avatar = base64;
    localStorage.setItem('profileData_' + currentUser.email, JSON.stringify(profileData));
    
    document.getElementById('profilePhoto').style.backgroundImage = `url(${base64})`;
    document.getElementById('profilePhoto').textContent = '';
    msg('📸 Avatar updated!', 'success');
  };
  reader.readAsDataURL(file);
}

function escapeHtml(text) {
  let map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
  return text.replace(/[&<>"']/g, m => map[m]);
}

function updateActiveStatus() {
  let now = new Date().getHours();
  document.getElementById('activeText').textContent = (now >= 9 && now <= 23) ? 'Active Now' : 'Away';
}

function initProfilePage() {
  updateActiveStatus();
  let postsTab = document.getElementById('postsTab');
  if(postsTab) {
    postsTab.classList.add('active');
    postsTab.style.display = 'block';
  }
}

function msg(text, type) {
  const box = document.getElementById('message');
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  box.innerHTML = '';
  box.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}



