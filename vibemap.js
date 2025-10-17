// VIBEXPERT - COMPLETE RESPONSIVE JAVASCRIPT
// One joined college per user | Connect from Home | Communities enforcement

const colleges = {
  nit: [
    { name: 'NIT Bhopal', email: 'nit.bhopal@edu.in', location: 'Bhopal' },
    { name: 'NIT Rourkela', email: 'nit.rourkela@edu.in', location: 'Rourkela' },
    { name: 'NIT Warangal', email: 'nit.warangal@edu.in', location: 'Warangal' },
    { name: 'NIT Jamshedpur', email: 'nit.jam@edu.in', location: 'Jamshedpur' },
    { name: 'NIT Durgapur', email: 'nit.durgapur@edu.in', location: 'Durgapur' },
    { name: 'NIT Srinagar', email: 'nit.srinagar@edu.in', location: 'Srinagar' },
    { name: 'NIT Hamirpur', email: 'nit.hamirpur@edu.in', location: 'Hamirpur' },
    { name: 'NIT Jalandhar', email: 'nit.jalandhar@edu.in', location: 'Jalandhar' },
  ],
  iit: [
    { name: 'IIT Delhi', email: 'iit.delhi@edu.in', location: 'New Delhi' },
    { name: 'IIT Bombay', email: 'iit.bombay@edu.in', location: 'Mumbai' },
    { name: 'IIT Madras', email: 'iit.madras@edu.in', location: 'Chennai' },
    { name: 'IIT Kharagpur', email: 'iit.kharagpur@edu.in', location: 'Kharagpur' },
    { name: 'IIT Kanpur', email: 'iit.kanpur@edu.in', location: 'Kanpur' },
    { name: 'IIT Roorkee', email: 'iit.roorkee@edu.in', location: 'Roorkee' },
  ],
  vit: [
    { name: 'VIT Bhopal', email: 'vitbhopal@vit.ac.in', location: 'Bhopal' },
    { name: 'VIT Vellore', email: 'vitvellore@vit.ac.in', location: 'Vellore' },
    { name: 'VIT Chennai', email: 'vitchennai@vit.ac.in', location: 'Chennai' },
    { name: 'VIT Pune', email: 'vitpune@vit.ac.in', location: 'Pune' },
  ],
  other: [
    { name: 'Delhi University', email: 'du@delhi.edu.in', location: 'New Delhi' },
    { name: 'Mumbai University', email: 'mu@mumbai.edu.in', location: 'Mumbai' },
    { name: 'Bangalore University', email: 'bu@bangalore.edu.in', location: 'Bangalore' },
  ]
};

let currentUser = null;
let currentType = null;
let allColleges = [];
let currentPage = 1;
let currentJoinedCollege = null;
const ITEMS_PER_PAGE = 8;

// UTILITIES
function el(id) { return document.getElementById(id); }

function userStorageKey() {
  if (!currentUser || !currentUser.email) return null;
  return 'joinedCollege:' + currentUser.email.toLowerCase();
}

function getJoinedCollegeForUser() {
  const key = userStorageKey();
  if (!key) return null;
  return localStorage.getItem(key) || null;
}

function setJoinedCollegeForUser(collegeName) {
  const key = userStorageKey();
  if (key) localStorage.setItem(key, collegeName);
}

function clearJoinedCollegeForUser() {
  const key = userStorageKey();
  if (key) localStorage.removeItem(key);
}

function showMessage(msgText, type = 'info') {
  const box = el('message');
  if (!box) {
    alert(msgText);
    return;
  }
  box.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = msgText;
  box.appendChild(div);
  setTimeout(() => { if(div) div.remove(); }, 3500);
}

function setAvatarInitials() {
  const elAvatar = el('avatarInitials');
  if (!elAvatar) return;
  let initial = 'U';
  if (currentUser && currentUser.name) initial = currentUser.name[0].toUpperCase();
  elAvatar.textContent = initial;
}

function escapeForJs(s) {
  return ('' + s).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme + '-theme';
  
  setAvatarInitials();
  
  el('loginPage').style.display = 'flex';
  el('mainPage').style.display = 'none';
});

// AUTH
function login(e) {
  if (e) e.preventDefault();
  const emailInput = el('loginEmail');
  const passInput = el('loginPassword');
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const pass = passInput ? passInput.value : '';
  
  if (!email || !pass) {
    showMessage('Fill all fields', 'error');
    return;
  }

  const namePart = email.split('@')[0] || 'User';
  currentUser = { name: namePart, email: email };
  showMessage('Logged in!', 'success');

  setTimeout(() => {
    el('loginPage').style.display = 'none';
    el('mainPage').style.display = 'block';
    setAvatarInitials();
  }, 300);
}

function signup(e) {
  if (e) e.preventDefault();
  const name = el('signupName') ? el('signupName').value.trim() : '';
  const email = el('signupEmail') ? el('signupEmail').value.trim().toLowerCase() : '';
  const reg = el('signupReg') ? el('signupReg').value.trim() : '';
  const pass = el('signupPass') ? el('signupPass').value : '';
  const confirm = el('signupConfirm') ? el('signupConfirm').value : '';

  if (!name || !email || !reg || !pass || !confirm) {
    showMessage('Fill all fields', 'error');
    return;
  }
  if (pass !== confirm) {
    showMessage("Passwords don't match", 'error');
    return;
  }

  currentUser = { name, email, reg };
  showMessage('Account created! Logged in.', 'success');

  setTimeout(() => {
    el('loginPage').style.display = 'none';
    el('mainPage').style.display = 'block';
    setAvatarInitials();
  }, 350);
}

function goSignup(e) {
  if (e) e.preventDefault();
  if (el('loginForm')) el('loginForm').style.display = 'none';
  if (el('signupForm')) el('signupForm').style.display = 'block';
}

function goLogin(e) {
  if (e) e.preventDefault();
  if (el('signupForm')) el('signupForm').style.display = 'none';
  if (el('loginForm')) el('loginForm').style.display = 'block';
}

function logout() {
  currentUser = null;
  currentJoinedCollege = null;
  el('mainPage').style.display = 'none';
  el('loginPage').style.display = 'flex';
  showMessage('Logged out', 'success');
}

// NAVIGATION
function showPage(name, e) {
  if (e) e.preventDefault();
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = el(name);
  if (page) page.style.display = 'block';
  
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (e && e.target) e.target.classList.add('active');

  if (name === 'communities') loadCommunities();
  
  if (el('menu')) el('menu').style.display = 'none';
  window.scrollTo(0, 0);
}

function goHome() {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const home = el('home');
  if (home) home.style.display = 'block';
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const first = document.querySelector('.nav-link');
  if (first) first.classList.add('active');
  if (el('menu')) el('menu').style.display = 'none';
  window.scrollTo(0, 0);
}

// UNIVERSITY & COLLEGE
function selectUniversity(type) {
  currentType = type;
  allColleges = (colleges[type] || []).slice();
  currentPage = 1;

  const titles = {
    nit: 'National Institutes of Technology',
    iit: 'Indian Institutes of Technology',
    vit: 'VIT Colleges',
    other: 'Other Universities'
  };
  
  const titleEl = el('collegeTitle');
  if (titleEl) titleEl.textContent = titles[type] || 'Colleges';

  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const listPage = el('collegeList');
  if (listPage) listPage.style.display = 'block';
  
  if (el('menu')) el('menu').style.display = 'none';
  showColleges();
  window.scrollTo(0, 0);
}

function showColleges(filtered = null) {
  const list = filtered || allColleges;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const page = list.slice(start, end);

  const userJoined = getJoinedCollegeForUser();

  let html = '';
  page.forEach(c => {
    const isJoinedThis = userJoined === c.name;
    const joinedSomeOther = userJoined && !isJoinedThis;
    const disabled = joinedSomeOther ? 'disabled' : '';
    let btnText = 'Connect';
    if (isJoinedThis) btnText = '✓ Joined';
    else if (joinedSomeOther) btnText = 'Joined elsewhere';

    html += `
      <div class="college-item">
        <h3>${c.name}</h3>
        <p>${c.location}</p>
        <p style="font-size:11px; color:#888;">${c.email}</p>
        <button ${disabled} onclick="openVerify('${escapeForJs(c.name)}', '${escapeForJs(c.email)}')">${btnText}</button>
      </div>
    `;
  });

  const container = el('collegeContainer');
  if (container) container.innerHTML = html;

  const total = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  let pag = '';
  for (let i = 1; i <= total; i++) {
    pag += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  const pagination = el('pagination');
  if (pagination) pagination.innerHTML = pag;
}

function goPage(n) {
  currentPage = n;
  showColleges();
  window.scrollTo(0, 0);
}

function searchColleges() {
  const qEl = el('searchCollege');
  if (!qEl) return;
  const query = qEl.value.trim().toLowerCase();
  currentPage = 1;
  const filtered = allColleges.filter(c => 
    c.name.toLowerCase().includes(query) || c.location.toLowerCase().includes(query)
  );
  showColleges(filtered);
}

function backToUniversities() {
  goHome();
}

// VERIFICATION
function openVerify(name, email) {
  if (!currentUser || !currentUser.email) {
    showMessage('Please log in to connect to a college.', 'error');
    return;
  }

  const userJoined = getJoinedCollegeForUser();
  if (userJoined && userJoined !== name) {
    showMessage(`You have already joined ${userJoined}. You cannot join another college.`, 'error');
    return;
  }

  const confirmMsg = `Connect to ${name}? You will be added to that college community. Continue?`;
  if (!confirm(confirmMsg)) return;

  const collegeDomain = (email && email.includes('@')) ? email.split('@')[1] : null;
  const userDomain = (currentUser.email && currentUser.email.includes('@')) ? currentUser.email.split('@')[1] : null;
  
  if (collegeDomain && userDomain && collegeDomain !== userDomain) {
    showMessage(`Please use your college email (${collegeDomain}) to join ${name}.`, 'error');
    return;
  }

  setJoinedCollegeForUser(name);
  showMessage('✓ Joined ' + name, 'success');

  setTimeout(() => {
    showSuccessModal(name);
  }, 500);
}

function showSuccessModal(collegeName) {
  const msg = el('successMessage');
  if (msg) msg.textContent = 'You have successfully joined the ' + collegeName + ' community! 🎉';
  const modal = el('successModal');
  if (modal) modal.style.display = 'flex';
  currentJoinedCollege = collegeName;
}

function goToCommunityChat() {
  closeModal('successModal');
  setTimeout(() => {
    openCommunityChat(currentJoinedCollege);
  }, 300);
}

// COMMUNITIES
function loadCommunities() {
  const container = el('communitiesContent');
  if (!container) return;

  const userJoined = getJoinedCollegeForUser();
  
  if (!userJoined) {
    container.innerHTML = `
      <div class="no-community-msg">
        <h3>Please first connect to your college community to start vibeing with your mates</h3>
        <p>You can connect from the Home page — only one college allowed per user.</p>
        <button onclick="goHome()">🏠 Home</button>
      </div>
    `;
    return;
  }

  const found = findCollege(userJoined);
  const loc = found ? found.location : 'Campus';
  
  container.innerHTML = `
    <div class="cards">
      <div class="card">
        <div class="icon">💬</div>
        <h3>${userJoined}</h3>
        <p>${loc}</p>
        <button onclick="openCommunityChat('${escapeForJs(userJoined)}')">Join Chat</button>
      </div>
    </div>
  `;
}

function findCollege(name) {
  for (const t in colleges) {
    const found = colleges[t].find(c => c.name === name);
    if (found) return found;
  }
  return null;
}

// CHAT
function openCommunityChat(collegeName) {
  const userJoined = getJoinedCollegeForUser();
  if (!userJoined) {
    showMessage('Please connect your university first from Home', 'error');
    goHome();
    return;
  }
  if (collegeName !== userJoined) {
    showMessage(`You can only open your own college community (${userJoined})`, 'error');
    return;
  }

  currentJoinedCollege = collegeName;
  const nameEl = el('communityName');
  if (nameEl) nameEl.textContent = collegeName + ' - Community Chat';
  
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const chatPage = el('communityChat');
  if (chatPage) chatPage.style.display = 'block';
  
  if (el('chatInput')) el('chatInput').focus();
  loadChatMessages();
  window.scrollTo(0, 0);
}

function backToCommunities() {
  currentJoinedCollege = null;
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const commPage = el('communities');
  if (commPage) commPage.style.display = 'block';
  loadCommunities();
  window.scrollTo(0, 0);
}

function sendMessage() {
  const input = el('chatInput');
  const text = input ? input.value.trim() : '';
  
  if (!text) {
    showMessage('Type a message', 'error');
    return;
  }

  if (!currentJoinedCollege) {
    showMessage('No community selected', 'error');
    return;
  }

  const message = {
    author: currentUser.name,
    text: text,
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    college: currentJoinedCollege
  };

  let allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  allMessages.push(message);
  localStorage.setItem('chatMessages', JSON.stringify(allMessages));

  if (input) input.value = '';
  loadChatMessages();
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function loadChatMessages() {
  if (!currentJoinedCollege) return;

  let allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  const communityMessages = allMessages.filter(m => m.college === currentJoinedCollege);

  const chatMessages = el('chatMessages');
  if (!chatMessages) return;

  let html = '';
  communityMessages.forEach(m => {
    const isOwn = m.author === currentUser.name;
    html += `
      <div class="chat-message ${isOwn ? 'own' : 'other'}">
        <div class="message-content">
          ${!isOwn ? '<div class="message-author">@' + m.author + '</div>' : ''}
          <div>${escapeHtml(m.text)}</div>
          <div class="message-time">${m.time}</div>
        </div>
      </div>
    `;
  });

  chatMessages.innerHTML = html;
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// POSTS
function createPost() {
  const text = el('postText');
  const postText = text ? text.value.trim() : '';
  
  if (!postText) {
    showMessage('Write something', 'error');
    return;
  }

  const post = {
    author: currentUser.name,
    text: postText,
    time: new Date().toLocaleTimeString()
  };

  let posts = JSON.parse(localStorage.getItem('posts') || '[]');
  posts.unshift(post);
  localStorage.setItem('posts', JSON.stringify(posts));

  if (text) text.value = '';
  loadPosts();
  showMessage('Posted!', 'success');
}

function loadPosts() {
  let posts = JSON.parse(localStorage.getItem('posts') || '[]');
  let html = '';

  posts.forEach(p => {
    html += `
      <div class="post">
        <div class="author">@${p.author}</div>
        <div class="text">${escapeHtml(p.text)}</div>
        <div class="time">${p.time}</div>
      </div>
    `;
  });

  const feed = el('postsFeed');
  if (feed) feed.innerHTML = html;
}

// MENU & THEME
function toggleMenu() {
  const menu = el('menu');
  if (!menu) return;
  menu.style.display = (menu.style.display === 'block' || menu.style.display === 'flex') ? 'none' : 'block';
}

document.addEventListener('click', (e) => {
  const menu = el('menu');
  if (!menu) return;
  if (!e.target.closest('.profile-area') && !e.target.closest('#menu')) {
    menu.style.display = 'none';
  }
});

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
  const menu = el('menu');
  if (menu) menu.style.display = 'none';
}

// MODALS
function closeModal(id) {
  const modal = el(id);
  if (modal) modal.style.display = 'none';
}

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m) {
      m.style.display = 'none';
    }
  });
});

function showContactModal() {
  const modal = el('contactModal');
  if (modal) modal.style.display = 'flex';
  const menu = el('menu');
  if (menu) menu.style.display = 'none';
}

function showChatbot() {
  showMessage('Chatbot coming soon!', 'success');
  const menu = el('menu');
  if (menu) menu.style.display = 'none';
}

function showPhotoModal() {
  const modal = el('photoModal');
  if (modal) modal.style.display = 'flex';
}

// EXPOSE GLOBALS
window.login = login;
window.signup = signup;
window.goSignup = goSignup;
window.goLogin = goLogin;
window.logout = logout;
window.showPage = showPage;
window.goHome = goHome;
window.selectUniversity = selectUniversity;
window.searchColleges = searchColleges;
window.goPage = goPage;
window.backToUniversities = backToUniversities;
window.openVerify = openVerify;
window.goToCommunityChat = goToCommunityChat;
window.openCommunityChat = openCommunityChat;
window.backToCommunities = backToCommunities;
window.sendMessage = sendMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.createPost = createPost;
window.toggleMenu = toggleMenu;
window.toggleTheme = toggleTheme;
window.closeModal = closeModal;
window.showContactModal = showContactModal;
window.showChatbot = showChatbot;
window.showPhotoModal = showPhotoModal;

// Load posts on page ready
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const postsPage = el('posts');
    if (postsPage && postsPage.style.display !== 'none') {
      loadPosts();
    }
  });

  const postsSection = el('posts');
  if (postsSection) {
    observer.observe(postsSection, {attributes: true});
  }
});
