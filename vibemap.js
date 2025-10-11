/* ====== VibeXpert - Updated with Backend Integration ====== */

// 🔧 BACKEND API URL - Change this when you deploy
const API_URL = 'http://localhost:5000/api/auth';
// For production, change to: const API_URL = 'https://your-backend-url.onrender.com/api/auth';

let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
  initAnimatedBackground();
  setupEventListeners();

  // Show main page only if user logged in
  const savedUser = localStorage.getItem('currentVibeMapUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainPage();
  } else {
    showAuthPage();
  }
});

/* -------------------- Page show/hide -------------------- */
function showAuthPage() {
  const auth = document.getElementById('authPage');
  const main = document.getElementById('mainPage');
  if (auth) auth.style.display = 'flex';
  if (main) main.style.display = 'none';
  switchAuthTab('login');
}

function showMainPage() {
  const auth = document.getElementById('authPage');
  const main = document.getElementById('mainPage');
  if (auth) auth.style.display = 'none';
  if (main) main.style.display = 'block';
  if (currentUser) {
    const userGreet = document.querySelector('#userGreeting span');
    if (userGreet) userGreet.textContent = `Hi! ${currentUser.name}`;
  }
  switchPage('home');
}

/* -------------------- Auth handlers -------------------- */
function handleLogout(e) {
  e?.preventDefault();
  currentUser = null;
  localStorage.removeItem('currentVibeMapUser');
  showAuthPage();
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (loginForm) loginForm.reset();
  if (signupForm) signupForm.reset();
}

function setupEventListeners() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      switchAuthTab(this.dataset.tab);
    });
  });

  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      switchPage(this.dataset.page);
    });
  });

  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', function () {
      switchPage('home');
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
      const homeLink = document.querySelector('[data-page="home"]');
      if (homeLink) homeLink.classList.add('active');
    });
  }

  // Forgot password link
  const forgotLink = document.querySelector('.forgot-password a');
  if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
      e.preventDefault();
      switchAuthTab('forgot');
    });
  }

  setupSearchFunctionality();
}

/* Switch auth tabs */
function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add('active');

  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(`${tabName}-section`);
  if (section) section.classList.add('active');
  clearAlerts();
}

/* ==================== LOGIN (Backend Integration) ==================== */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!username || !password) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  showAlert('Logging in...', 'success');

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentVibeMapUser', JSON.stringify(data.user));
      showAlert('Login successful!', 'success');
      setTimeout(showMainPage, 600);
    } else {
      showAlert(data.message || 'Invalid credentials', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('Server error. Please try again.', 'error');
  }
}

/* ==================== SIGNUP (Backend Integration) ==================== */
async function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const regNumber = document.getElementById('signupRegNumber').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
  const userType = document.querySelector('input[name="usertype"]:checked')?.value || '';
  const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(i => i.value);
  const hobbies = document.getElementById('signupHobbies')?.value.trim() || '';

  // Frontend validation
  if (!name || !email || !regNumber || !password || !confirmPassword || !gender || !userType) {
    showAlert('Please fill in all required fields', 'error');
    return;
  }
  if (!validateEmail(email)) {
    showAlert('Please enter a valid email address', 'error');
    return;
  }
  if (password.length < 6) {
    showAlert('Password must be at least 6 characters', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'error');
    return;
  }

  showAlert('Creating your account...', 'success');

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        regNumber,
        password,
        gender,
        userType,
        interests,
        hobbies
      })
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Account created! Check your email to verify.', 'success');
      showSignupPopup(name);
      
      // Auto-login after successful signup
      currentUser = data.user;
      localStorage.setItem('currentVibeMapUser', JSON.stringify(data.user));
      
      setTimeout(showMainPage, 2000);
    } else {
      showAlert(data.message || 'Signup failed', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showAlert('Server error. Please try again.', 'error');
  }
}

/* ==================== FORGOT PASSWORD (Backend Integration) ==================== */
async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  
  if (!email) {
    showAlert('Please enter your email', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showAlert('Please enter a valid email address', 'error');
    return;
  }

  showAlert('Sending reset email...', 'success');

  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Password reset email sent! Check your inbox.', 'success');
      setTimeout(() => {
        switchAuthTab('login');
      }, 3000);
    } else {
      showAlert(data.message || 'Failed to send reset email', 'error');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    showAlert('Server error. Please try again.', 'error');
  }
}

/* Navigation between main pages */
function switchPage(pageId) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(`${pageId}-content`);
  if (target) target.classList.add('active');
}

/* Alerts */
function showAlert(msg, type = 'success') {
  const c = document.getElementById('alertContainer');
  if (!c) return;
  c.innerHTML = `<div class="alert ${type}">${msg}</div>`;
  setTimeout(() => { if (c) c.innerHTML = ''; }, 3000);
}

function clearAlerts() {
  const c = document.getElementById('alertContainer');
  if (c) c.innerHTML = '';
}

/* Utils */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* -------------------- Search (demo users) -------------------- */
function setupSearchFunctionality() {
  const users = [
    { name: 'Arjun K.', interest: 'Food Blogger' },
    { name: 'Priya S.', interest: 'Art Enthusiast' },
    { name: 'Rohit M.', interest: 'Tech Geek' },
    { name: 'Sneha R.', interest: 'Music Lover' },
    { name: 'Dev P.', interest: 'Sports Fan' },
    { name: 'Ananya T.', interest: 'Book Worm' },
    { name: 'Smi', interest: 'Web Developer' }
  ];

  const searchBox = document.getElementById('searchBox');
  const searchResults = document.getElementById('searchResults');
  if (!searchBox || !searchResults) return;

  searchBox.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    searchResults.innerHTML = '';
    if (query.length > 1) {
      const filtered = users.filter(u => u.name.toLowerCase().includes(query) || u.interest.toLowerCase().includes(query));
      if (filtered.length) {
        filtered.forEach(u => {
          const div = document.createElement('div');
          div.className = 'search-result-item';
          div.textContent = `${u.name} - ${u.interest}`;
          div.addEventListener('click', () => {
            searchBox.value = u.name;
            searchResults.style.display = 'none';
          });
          searchResults.appendChild(div);
        });
        searchResults.style.display = 'block';
      } else {
        const no = document.createElement('div');
        no.className = 'search-result-item';
        no.textContent = 'No users found';
        no.style.color = '#666';
        searchResults.appendChild(no);
        searchResults.style.display = 'block';
      }
    } else {
      searchResults.style.display = 'none';
    }
  });

  document.addEventListener('click', function(event) {
    if (!searchBox.contains(event.target) && !searchResults.contains(event.target)) {
      searchResults.style.display = 'none';
    }
  });
}

/* -------------------- Animated background -------------------- */
function initAnimatedBackground() {
  const bg = document.getElementById('animatedBg');
  if (!bg) return;

  const dotColors = ['rgba(79,116,163,0.4)', 'rgba(141,164,211,0.35)', 'rgba(90,127,184,0.35)'];
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    d.style.left = Math.random() * 100 + '%';
    d.style.top = Math.random() * 100 + '%';
    d.style.animationDelay = Math.random() * 8 + 's';
    d.style.background = dotColors[Math.floor(Math.random() * dotColors.length)];
    bg.appendChild(d);
  }

  for (let i = 0; i < 15; i++) {
    const l = document.createElement('div');
    l.className = 'line';
    l.style.left = Math.random() * 100 + '%';
    l.style.top = Math.random() * 100 + '%';
    l.style.animationDelay = Math.random() * 10 + 's';
    l.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    l.style.background = 'linear-gradient(90deg, transparent, rgba(79,116,163,0.18), transparent)';
    bg.appendChild(l);
  }
}

/* -------------------- Extras: interactions & scroll animations -------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.canteen-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('h3')?.textContent || 'Canteen';
      showAlert(`${name} menu coming soon!`, 'success');
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const toObserve = document.querySelectorAll('.fade-in, .college-photo, .canteen-card, .post');
  toObserve.forEach(el => {
    el.style.opacity = el.style.opacity || '0';
    el.style.transform = el.style.transform || 'translateY(20px)';
    observer.observe(el);
  });
});

/* -------------------- Signup Popup -------------------- */
function showSignupPopup(username) {
  const popup = document.getElementById('signupPopup');
  const title = document.getElementById('popupTitle');
  const msg = document.getElementById('popupMessage');
  if (!popup) return;

  title.textContent = "🎉 Congratulations!";
  msg.textContent = `Thank you ${username}, for signing up to VibeXpert. Check your email to verify your account!`;

  popup.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closePopup');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('signupPopup').style.display = 'none';
    });
  }
});