// VIBEXPERT - COMPLETE JAVASCRIPT

let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];

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

// INIT
document.addEventListener('DOMContentLoaded', function() {
  initCursor();
  checkUser();
  loadTheme();
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

// AUTH
function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  
  if(!email || !pass) {
    msg('Fill all fields', 'error');
    return;
  }
  
  currentUser = {name: email.split('@')[0], email: email};
  localStorage.setItem('user', JSON.stringify(currentUser));
  msg('Logged in!', 'success');
  
  setTimeout(() => {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + currentUser.name;
    document.getElementById('loginForm').reset();
  }, 800);
}

function signup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const reg = document.getElementById('signupReg').value.trim();
  const pass = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const type = document.querySelector('input[name="type"]:checked')?.value;
  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(el => el.value);
  const hobbies = document.getElementById('signupHobbies').value.trim();
  
  if(!name || !email || !reg || !pass || !confirm) {
    msg('Fill all required fields', 'error');
    return;
  }
  
  if(!gender) {
    msg('Please select your gender', 'error');
    return;
  }
  
  if(!type) {
    msg('Please select your type', 'error');
    return;
  }
  
  if(pass !== confirm) {
    msg('Passwords don\'t match', 'error');
    return;
  }
  
  currentUser = { name, email, reg, gender, type, interests, hobbies };
  localStorage.setItem('user', JSON.stringify(currentUser));
  msg('Account created!', 'success');
  
  setTimeout(() => {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + name;
    document.getElementById('signupForm').reset();
    goLogin();
  }, 800);
}

function goSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

function goLogin() {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

function checkUser() {
  const saved = localStorage.getItem('user');
  if(saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + currentUser.name;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('user');
  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  msg('Logged out', 'success');
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

// COLLEGE VERIFICATION
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
  
  msg('✓ Joined ' + currentVerifyCollege.name, 'success');
  closeModal('verifyModal');
  
  setTimeout(() => {
    showColleges();
  }, 500);
}

// POSTS
function createPost() {
  const text = document.getElementById('postText').value.trim();
  if(!text) {
    msg('Write something', 'error');
    return;
  }
  
  const post = {
    author: currentUser.name,
    text: text,
    time: new Date().toLocaleTimeString()
  };
  
  let posts = JSON.parse(localStorage.getItem('posts') || '[]');
  posts.unshift(post);
  localStorage.setItem('posts', JSON.stringify(posts));
  
  document.getElementById('postText').value = '';
  loadPosts();
  msg('Posted!', 'success');
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

// OPTIONS MENU (DESKTOP/TABLET)
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

// HAMBURGER MENU (MOBILE)
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

// MODALS
function showProfileModal() {
  if(currentUser) {
    document.getElementById('profileName').textContent = currentUser.name || 'N/A';
    document.getElementById('profileEmail').textContent = currentUser.email || 'N/A';
    document.getElementById('profileReg').textContent = currentUser.reg || 'N/A';
  }
  document.getElementById('profileModal').style.display = 'flex';
  document.getElementById('optionsMenu').style.display = 'none';
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.querySelector('.options-btn').classList.remove('active');
  document.querySelector('.hamburger-btn').classList.remove('active');
}

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
  complaints.push({
    user: currentUser.name,
    text: text,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('complaints', JSON.stringify(complaints));
  
  msg('Complaint submitted! We will review it soon.', 'success');
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
  msg('Theme updated!', 'success');
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

// COMMUNITIES
function loadCommunities() {
  const joinedCollege = currentUser?.joinedCollege;
  const verified = JSON.parse(localStorage.getItem('verified') || '[]');
  
  const container = document.getElementById('communitiesContainer');
  const chatSection = document.getElementById('chatSection');
  
  if(verified.length === 0 || !joinedCollege) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Please join the community in the Home page according to your university and start vibing into your college community!</p>
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
    sender: currentUser.name,
    text: message,
    college: currentUser.joinedCollege,
    time: new Date().toLocaleTimeString()
  };
  
  let chats = JSON.parse(localStorage.getItem('chats') || '[]');
  chats.push(chatData);
  localStorage.setItem('chats', JSON.stringify(chats));
  
  input.value = '';
  loadChatMessages();
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
    const isOwn = chat.sender === currentUser.name;
    html += `
      <div class="chat-message ${isOwn ? 'own' : 'other'}">
        ${!isOwn ? `<div class="sender">@${chat.sender}</div>` : ''}
        <div class="text">${chat.text}</div>
      </div>
    `;
  });
  
  messagesContainer.innerHTML = html || '<div style="color:#888; text-align:center; padding:20px;">No messages yet. Start the conversation!</div>';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// MESSAGES
function msg(text, type) {
  const box = document.getElementById('message');
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  box.innerHTML = '';
  box.appendChild(div);
  
  setTimeout(() => {
    div.remove();
  }, 3500);
}
