${isSelected ? '✓ Selected' : '✅ Select'}
        </button>
      </div>
    `;
    selector.appendChild(musicItem);
  });
  
  showModal('musicSelectorModal');
}

function previewMusic(url, musicId) {
  const player = window.musicPlayer;
  
  player.pause();
  player.currentTime = 0;
  
  player.src = url;
  
  player.play().catch(e => {
    console.error('Error playing music:', e);
    showMessage('Could not play music preview. Please try another track.', 'error');
  });
  
  document.querySelectorAll('.music-item').forEach(item => {
    item.classList.remove('playing');
  });
  
  const currentItem = document.querySelector(`.music-item button[onclick*="${musicId}"]`)?.closest('.music-item');
  if (currentItem) {
    currentItem.classList.add('playing');
  }
}

function selectMusic(musicId) {
  selectedMusic = musicLibrary.find(m => m.id === musicId);
  updateSelectedAssets();
  closeMusicSelector();
  showMessage(`🎵 "${selectedMusic.name}" added to your post!`, 'success');
  
  window.musicPlayer.pause();
  window.musicPlayer.currentTime = 0;
}

function closeMusicSelector() {
  window.musicPlayer.pause();
  window.musicPlayer.currentTime = 0;
  closeModal('musicSelectorModal');
}

function removeMusic() {
  selectedMusic = null;
  updateSelectedAssets();
  showMessage('🎵 Music removed from post', 'success');
}

function openStickerSelector() {
  const modal = document.getElementById('stickerSelectorModal');
  const selector = document.getElementById('stickerSelector');
  
  selector.innerHTML = '';
  
  Object.keys(stickerLibrary).forEach(category => {
    const categorySection = document.createElement('div');
    categorySection.className = 'sticker-category';
    
    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categorySection.appendChild(categoryTitle);
    
    const stickerGrid = document.createElement('div');
    stickerGrid.className = 'sticker-grid';
    
    stickerLibrary[category].forEach(sticker => {
      const stickerItem = document.createElement('div');
      stickerItem.className = 'sticker-item';
      stickerItem.innerHTML = `
        <div class="sticker" onclick="addSticker('${sticker.emoji}', '${sticker.name}')">
          ${sticker.emoji}
        </div>
        <div class="sticker-name">${sticker.name}</div>
      `;
      stickerGrid.appendChild(stickerItem);
    });
    
    categorySection.appendChild(stickerGrid);
    selector.appendChild(categorySection);
  });
  
  showModal('stickerSelectorModal');
}

function addSticker(emoji, name) {
  if (selectedStickers.length >= 5) {
    showMessage('Maximum 5 stickers allowed per post', 'error');
    return;
  }
  
  selectedStickers.push({emoji, name});
  updateSelectedAssets();
  
  const postText = document.getElementById('postText');
  postText.value += emoji;
  
  showMessage(`🎨 Sticker "${name}" added!`, 'success');
}

function removeStickers() {
  selectedStickers = [];
  updateSelectedAssets();
  showMessage('🎨 All stickers removed', 'success');
}

function showPostDestinationModal() {
  showModal('postDestinationModal');
}

function selectPostDestination(destination) {
  if (destination === 'community') {
    if (!currentUser.communityJoined || !currentUser.college) {
      showMessage('⚠️ Please connect to your university first!', 'error');
      closeModal('postDestinationModal');
      
      setTimeout(() => {
        if (confirm('You need to join a college community first. Explore colleges now?')) {
          showPage('home');
          document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
        }
      }, 500);
      return;
    }
  }
  
  selectedPostDestination = destination;
  const displayText = destination === 'profile' ? 'My Profile' : 'Community Feed';
  document.getElementById('currentDestination').textContent = displayText;
  closeModal('postDestinationModal');
  showMessage(`📍 Post will be shared to ${displayText}`, 'success');
  
  console.log('✅ Post destination set to:', selectedPostDestination);
}

function updateSelectedAssets() {
  const container = document.getElementById('selectedAssets');
  if (!container) return;
  
  let html = '';
  
  if (selectedMusic) {
    html += `
      <div class="selected-asset">
        <span>🎵 ${selectedMusic.name}</span>
        <button onclick="removeMusic()" class="remove-asset-btn">✕</button>
      </div>
    `;
  }
  
  if (selectedStickers.length > 0) {
    html += `
      <div class="selected-asset selected-stickers">
        <span>🎨 Stickers:</span>
        ${selectedStickers.map(sticker => `<span class="sticker-preview">${sticker.emoji}</span>`).join('')}
        <button onclick="removeStickers()" class="remove-asset-btn">✕</button>
      </div>
    `;
  }
  
  container.innerHTML = html;
  container.style.display = html ? 'block' : 'none';
}

// FIXED: Enhanced Create Post Function with mobile support
async function createPost() {
  const postText = document.getElementById('postText').value.trim();
  
  console.log('🚀 === POST CREATION START ===');
  console.log('📝 Post text:', postText);
  console.log('📁 Files:', selectedFiles.length);
  console.log('🎵 Music:', selectedMusic ? selectedMusic.name : 'None');
  console.log('🎨 Stickers:', selectedStickers.length);
  console.log('📍 Destination:', selectedPostDestination);
  
  if (!postText && selectedFiles.length === 0 && !selectedMusic && selectedStickers.length === 0) {
    console.log('❌ No content to post');
    showMessage('⚠️ Please add some content to your post', 'error');
    return;
  }
  
  if (!currentUser) {
    console.log('❌ User not logged in');
    showMessage('⚠️ Please login to post', 'error');
    return;
  }
  
  if (selectedPostDestination === 'community') {
    console.log('🔍 Checking community membership...');
    console.log('Community joined:', currentUser.communityJoined);
    console.log('College:', currentUser.college);
    
    if (!currentUser.communityJoined || !currentUser.college) {
      console.log('❌ User not in community');
      showMessage('⚠️ Please connect to your university first!', 'error');
      
      setTimeout(() => {
        if (confirm('You need to join a college community first. Explore colleges now?')) {
          showPage('home');
          document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
        }
      }, 500);
      return;
    }
  }
  
  try {
    console.log('✅ All validations passed');
    showMessage('📤 Creating post... Please wait', 'success');
    
    const formData = new FormData();
    formData.append('content', postText);
    formData.append('postTo', selectedPostDestination);
    
    console.log('📦 FormData created with postTo:', selectedPostDestination);
    
    if (selectedMusic) {
      formData.append('music', JSON.stringify(selectedMusic));
      console.log('🎵 Added music:', selectedMusic.name);
    }
    
    if (selectedStickers.length > 0) {
      formData.append('stickers', JSON.stringify(selectedStickers));
      console.log('🎨 Added stickers:', selectedStickers.length);
    }
    
    if (selectedFiles.length > 0) {
      showMessage(`📤 Uploading ${selectedFiles.length} file(s)...`, 'success');
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('media', selectedFiles[i]);
        console.log(`📁 Added file ${i + 1}:`, selectedFiles[i].name, `(${(selectedFiles[i].size / 1024).toFixed(0)}KB)`);
      }
    }
    
    console.log('📤 Sending POST request to /api/posts...');
    
    const data = await apiCall('/api/posts', 'POST', formData);
    
    console.log('✅ Response received:', data);
    
    if (data.success) {
      const msg = selectedPostDestination === 'profile' 
        ? '✅ Post added to your profile!' 
        : '✅ Post shared to community!';
      
      showMessage(msg, 'success');
      console.log('🎉 Post created successfully!');
      
      const postCount = data.postCount || 1;
      setTimeout(() => {
        showPostCelebrationModal(postCount);
      }, 800);
      
      if (data.badgeUpdated && data.newBadges?.length > 0) {
        setTimeout(() => {
          showMessage(`🏆 New badge: ${data.newBadges.join(', ')}`, 'success');
        }, 6000);
      }
      
      resetPostForm();
      
      setTimeout(() => {
        console.log('🔄 Reloading feeds...');
        loadPosts();
        
        if (selectedPostDestination === 'profile') {
          const profilePostsContainer = document.getElementById('userProfilePosts');
          if (profilePostsContainer) {
            loadUserProfilePosts(currentUser.id);
          }
        }
        
        if (selectedPostDestination === 'community') {
          const communityPostsContainer = document.getElementById('communityPostsContainer');
          if (communityPostsContainer) {
            loadCommunityPosts();
          }
        }
      }, 1000);
    } else {
      console.log('❌ Post creation failed:', data);
      showMessage('❌ Failed to create post', 'error');
    }
  } catch (error) {
    console.error('❌ CREATE POST ERROR:', error);
    
    if (error.message.includes('timeout')) {
      showMessage('⚠️ Upload timeout - please try with smaller images or check your connection', 'error');
    } else if (error.message.includes('university') || error.message.includes('community')) {
      showMessage('⚠️ Please connect to your university first!', 'error');
      setTimeout(() => {
        if (confirm('You need to join a college community first. Explore colleges now?')) {
          showPage('home');
          document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
        }
      }, 500);
    } else {
      showMessage('❌ Error: ' + (error.message || 'Failed to create post'), 'error');
    }
  }
  
  console.log('🏁 === POST CREATION END ===');
}

function resetPostForm() {
  console.log('🧹 Resetting post form...');
  document.getElementById('postText').value = '';
  selectedFiles = [];
  previewUrls = [];
  selectedMusic = null;
  selectedStickers = [];
  
  const photoContainer = document.getElementById('photoPreviewContainer');
  if (photoContainer) {
    photoContainer.innerHTML = '';
    photoContainer.style.display = 'none';
  }
  
  const assetsContainer = document.getElementById('selectedAssets');
  if (assetsContainer) {
    assetsContainer.innerHTML = '';
    assetsContainer.style.display = 'none';
  }
  
  console.log('✅ Form reset complete. Destination remains:', selectedPostDestination);
}

// RENDER POSTS HELPER
function renderPosts(posts) {
  let html = '';
  
  posts.forEach(post => {
    const author = post.users?.username || 'User';
    const authorId = post.users?.id || '';
    const content = post.content || '';
    const media = post.media || [];
    const time = new Date(post.created_at || post.timestamp).toLocaleString();
    const isOwn = currentUser && authorId === currentUser.id;
    const postedTo = post.posted_to === 'community' ? '🌍 Community' : '👤 Profile';
    const music = post.music || null;
    const stickers = post.stickers || [];
    
    const likeCount = post.like_count || 0;
    const commentCount = post.comment_count || 0;
    const shareCount = post.share_count || 0;
    const isLiked = post.is_liked || false;
    
    html += `
      <div class="enhanced-post" id="post-${post.id}">
        <div class="enhanced-post-header">
          <div class="enhanced-user-info" onclick="showUserProfile('${authorId}')" style="cursor: pointer;">
            <div class="enhanced-user-avatar">
              ${post.users?.profile_pic ? `<img src="${post.users.profile_pic}" class="enhanced-user-avatar">` : '👤'}
            </div>
            <div class="enhanced-user-details">
              <div class="enhanced-username">@${author}</div>
              <div class="enhanced-post-meta">
                <span>${time}</span>
                <span>•</span>
                <span>${postedTo}</span>
              </div>
            </div>
          </div>
          ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️ Delete</button>` : ''}
        </div>
        
        <div class="enhanced-post-content">
          ${content ? `<div class="enhanced-post-text">${content}</div>` : ''}
          
          ${stickers.length > 0 ? `
            <div class="post-stickers-container">
              ${stickers.map(sticker => `<span class="post-sticker">${sticker.emoji || sticker}</span>`).join('')}
            </div>
          ` : ''}
          
          ${music ? `
            <div class="post-music-container">
              <div class="music-player">
                <div class="music-info">
                  <div class="music-icon">${music.emoji || '🎵'}</div>
                  <div class="music-details">
                    <div class="music-name">${music.name}</div>
                    <div class="music-duration">${music.artist} • ${music.duration}</div>
                  </div>
                </div>
                <audio controls class="post-audio-player">
                  <source src="${music.url}" type="audio/mpeg">
                </audio>
              </div>
            </div>
          ` : ''}
          
          ${media.length > 0 ? `
            <div class="enhanced-post-media">
              ${media.map(m => 
                m.type === 'image' 
                  ? `<div class="enhanced-media-item"><img src="${m.url}" alt="Post image"></div>` 
                  : m.type === 'video'
                  ? `<div class="enhanced-media-item"><video src="${m.url}" controls></video></div>`
                  : `<div class="enhanced-media-item"><audio src="${m.url}" controls></audio></div>`
              ).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="enhanced-post-footer">
          <div class="enhanced-post-stats">
            <span id="like-count-${post.id}">❤️ ${likeCount}</span>
            <span id="comment-count-${post.id}">💬 ${commentCount}</span>
            <span id="share-count-${post.id}">🔄 ${shareCount}</span>
          </div>
          <div class="enhanced-post-engagement">
            <button 
              class="engagement-btn ${isLiked ? 'liked' : ''}" 
              id="like-btn-${post.id}"
              onclick="toggleLike('${post.id}')"
            >
              ${isLiked ? '❤️ Liked' : '❤️ Like'}
            </button>
            <button class="engagement-btn" onclick="openCommentModal('${post.id}')">💬 Comment</button>
            <button class="engagement-btn" onclick="sharePost('${post.id}', '${content.replace(/'/g, "\\'")}', '${author}')">🔄 Share</button>
          </div>
        </div>
      </div>
    `;
  });
  
  return html;
}

// Load Posts - Shows ALL posts
async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if (!feedEl) {
    console.log('❌ Feed element not found');
    return;
  }
  
  console.log('📨 === LOADING POSTS ===');
  console.log('👤 Current user:', currentUser?.username);
  
  try {
    feedEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">⏳ Loading posts...</div>';
    
    const endpoint = '/api/posts';
    
    console.log('🔗 Fetching from:', endpoint);
    
    const data = await apiCall(endpoint, 'GET');
    
    console.log('✅ Received data:', {
      success: data.success,
      postsCount: data.posts?.length || 0
    });
    
    if (!data.posts || data.posts.length === 0) {
      const emptyMsg = '📝 No posts yet. Create your first post!';
      
      console.log('ℹ️ No posts found');
      feedEl.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">${emptyMsg}</div>`;
      return;
    }
    
    console.log('✅ Rendering', data.posts.length, 'posts');
    
    feedEl.innerHTML = renderPosts(data.posts);
    console.log('✅ Posts rendered successfully');
    
  } catch (error) {
    console.error('❌ LOAD POSTS ERROR:', error);
    feedEl.innerHTML = `
      <div style="text-align:center; padding:40px; color:#ff6b6b;">
        ❌ Failed to load posts<br>
        <small style="font-size:14px;color:#888;margin-top:8px;display:block;">
          ${error.message || 'Please check your connection and try again'}
        </small>
      </div>
    `;
  }
  
  console.log('🏁 === LOADING POSTS END ===');
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;
  
  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    showMessage('🗑️ Post deleted', 'success');
    
    const postEl = document.getElementById(`post-${postId}`);
    if (postEl) {
      postEl.remove();
    }
    
    setTimeout(() => {
      loadPosts();
    }, 500);
  } catch (error) {
    showMessage('❌ Failed to delete: ' + error.message, 'error');
  }
}

// SOCKET FUNCTIONS
function initializeSocket() {
  if (socket) return;
  
  socket = io(API_URL);
  
  socket.on('connect', () => {
    console.log('Socket connected');
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
    }
    socket.emit('user_online', currentUser.id);
  });
  
  socket.on('new_message', (message) => {
    appendMessageToChat(message);
  });
  
  socket.on('message_updated', (message) => {
    updateMessageInChat(message);
  });
  
  socket.on('message_deleted', ({ id }) => {
    removeMessageFromChat(id);
  });
  
  socket.on('online_count', (count) => {
    updateOnlineCount(count);
  });
  
  socket.on('post_liked', (data) => {
    const likeCount = document.querySelector(`#like-count-${data.postId}`);
    if (likeCount) {
      likeCount.textContent = `❤️ ${data.likeCount}`;
    }
  });
  
  socket.on('post_commented', (data) => {
    const commentCount = document.querySelector(`#comment-count-${data.postId}`);
    if (commentCount) {
      commentCount.textContent = `💬 ${data.commentCount}`;
    }
  });
  
  socket.on('post_shared', (data) => {
    const shareCount = document.querySelector(`#share-count-${data.postId}`);
    if (shareCount) {
      shareCount.textContent = `🔄 ${data.shareCount}`;
    }
  });
}

// NAVIGATION FUNCTIONS
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
  } else if(name === 'rewards') {
    loadRewardsPage();
  }
  
  document.getElementById('hamburgerMenu').style.display = 'none';
  
  window.scrollTo(0, 0);
}

function goHome() {
  showPage('home');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.nav-link[onclick*="home"]')?.classList.add('active');
}

// COLLEGE FUNCTIONS
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

function openVerify(name, emailDomain) {
  if (currentUser && currentUser.college) {
    showMessage('⚠️ You are already connected to ' + currentUser.college, 'error');
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
    showMessage('⚠️ Enter your email', 'error');
    return;
  }
  
  if (!email.endsWith(currentVerifyCollege.emailDomain)) {
    showMessage('⚠️ Email must end with ' + currentVerifyCollege.emailDomain, 'error');
    return;
  }
  
  try {
    showMessage('📧 Sending verification code...', 'success');
    
    await apiCall('/api/college/request-verification', 'POST', {
      collegeName: currentVerifyCollege.name,
      collegeEmail: email
    });
    
    showMessage('✅ Code sent to ' + email, 'success');
    document.getElementById('codeSection').style.display = 'block';
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyCollegeCode() {
  const code = document.getElementById('verifyCode').value.trim();
  
  if (!code || code.length !== 6) {
    showMessage('⚠️ Enter 6-digit code', 'error');
    return;
  }
  
  try {
    showMessage('🔍 Verifying...', 'success');
    
    const data = await apiCall('/api/college/verify', 'POST', { code });
    
    showMessage('🎉 ' + data.message, 'success');
    
    currentUser.college = data.college;
    currentUser.communityJoined = true;
    currentUser.badges = data.badges;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    closeModal('verifyModal');
    
    initializeSocket();
    
    setTimeout(() => {
      showPage('communities');
      updateLiveNotif('Connected to ' + data.college);
    }, 1500);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

// PROFILE FUNCTIONS (Remaining functions from original code)
function showProfilePage() {
  if (!currentUser) return;
  showProfileModal(currentUser);
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

function showProfileModal(user) {
  const isOwnProfile = currentUser && user.id === currentUser.id;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box profile-modal-box">
      <button class="close-profile" onclick="this.parentElement.parentElement.remove()">&times;</button>
      
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-cover"></div>
          <div class="profile-main">
            <div class="profile-photo-section">
              <div class="profile-photo" style="${user.profile_pic ? `background-image: url('${user.profile_pic}'); background-size: cover;` : ''}">
                ${!user.profile_pic ? '👤' : ''}
              </div>
              ${isOwnProfile ? `
                <button class="avatar-upload-btn" onclick="uploadProfilePic()">📷 Change Avatar</button>
              ` : ''}
              <div class="active-badge">
                <span class="status-dot"></span>
                <span>Active Now</span>
              </div>
            </div>
            
            <div class="profile-name-section">
              <h2>${user.username}</h2>
              <div class="nickname-display">
                <span class="nickname-label">@${user.username}</span>
              </div>
              ${user.college ? `<p style="color:#888; font-size:14px;">🎓 ${user.college}</p>` : ''}
              ${user.registration_number ? `<p style="color:#888; font-size:13px;">📋 ${user.registration_number}</p>` : ''}
            </div>
            
            ${isOwnProfile ? `
              <button class="profile-edit-btn" onclick="toggleEditProfile()">✏️ Edit Profile</button>
            ` : ''}
          </div>
        </div>
        
        <div class="profile-stats-section">
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value">${user.postCount || 0}</div>
            <div class="stat-title">Posts</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-value">${user.badges?.length || 0}</div>
            <div class="stat-title">Badges</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">24h</div>
            <div class="stat-title">Active</div>
          // VIBEXPERT - COMPLETE UPDATED VERSION WITH REWARDS SYSTEM

const API_URL = 'https://vibexpert-backend-main.onrender.com';

let currentUser = null;
let currentType = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let currentVerifyCollege = null;
let allColleges = [];
let socket = null;
let selectedFiles = [];
let previewUrls = [];
let editingMessageId = null;
let editTimeout = null;
let selectedMusic = null;
let selectedStickers = [];
let cropper = null;
let selectedPostDestination = 'profile';
let currentEditIndex = -1;
let currentCropIndex = -1;
let currentFilters = {};
let searchTimeout = null;
let currentCommentPostId = null;

// Enhanced Rewards System Data
const rewardsData = {
  dailyTasks: [
    { id: 'post_today', title: 'Share Your Day', desc: 'Create 1 post', reward: 10, icon: '📝', completed: false },
    { id: 'comment_5', title: 'Engage with Community', desc: 'Comment on 5 posts', reward: 15, icon: '💬', completed: false },
    { id: 'like_10', title: 'Spread Love', desc: 'Like 10 posts', reward: 5, icon: '❤️', completed: false },
    { id: 'login_streak', title: 'Daily Login', desc: 'Login for 7 days straight', reward: 50, icon: '🔥', completed: false }
  ],
  
  achievements: [
    { id: 'social_butterfly', title: 'Social Butterfly', desc: 'Connect with 50 users', reward: 100, icon: '🦋', progress: 0, target: 50 },
    { id: 'content_king', title: 'Content King', desc: 'Post 100 times', reward: 200, icon: '👑', progress: 0, target: 100 },
    { id: 'influencer', title: 'Influencer', desc: 'Get 1000 likes', reward: 500, icon: '⭐', progress: 0, target: 1000 },
    { id: 'community_hero', title: 'Community Hero', desc: 'Send 500 messages', reward: 150, icon: '🦸', progress: 0, target: 500 }
  ],
  
  exclusiveRewards: [
    { id: 'premium_theme', title: 'Premium Themes', desc: 'Unlock exclusive dark & light themes', cost: 500, icon: '🎨', category: 'cosmetic' },
    { id: 'profile_frame', title: 'Golden Profile Frame', desc: 'Stand out with a golden border', cost: 300, icon: '🖼️', category: 'cosmetic' },
    { id: 'custom_badge', title: 'Custom Badge', desc: 'Design your own profile badge', cost: 800, icon: '🏆', category: 'premium' },
    { id: 'ad_free', title: '30 Days Ad-Free', desc: 'Enjoy distraction-free experience', cost: 1000, icon: '🚀', category: 'utility' },
    { id: 'early_access', title: 'Early Access', desc: 'Try new features first', cost: 600, icon: '⚡', category: 'premium' },
    { id: 'boost_post', title: 'Post Boost (5x)', desc: 'Boost 5 posts to community', cost: 400, icon: '📢', category: 'utility' }
  ],
  
  leaderboard: [
    { rank: 1, name: 'TechMaster', points: 5420, avatar: '👨‍💻', trend: 'up' },
    { rank: 2, name: 'VibeQueen', points: 4890, avatar: '👸', trend: 'up' },
    { rank: 3, name: 'CodeNinja', points: 4250, avatar: '🥷', trend: 'down' },
    { rank: 4, name: 'StudyBuddy', points: 3870, avatar: '📚', trend: 'up' },
    { rank: 5, name: 'MusicLover', points: 3420, avatar: '🎵', trend: 'same' }
  ]
};

// Enhanced music library
const musicLibrary = [
  { id: 1, name: "Chill Vibes", artist: "LoFi Beats", duration: "2:30", url: "https://assets.mixkit.co/music/preview/mixkit-chill-vibes-239.mp3", emoji: "🎧" },
  { id: 2, name: "Upbeat Energy", artist: "Electronic Pop", duration: "3:15", url: "https://assets.mixkit.co/music/preview/mixkit-upbeat-energy-225.mp3", emoji: "⚡" },
  { id: 3, name: "Dreamy Piano", artist: "Classical", duration: "2:45", url: "https://assets.mixkit.co/music/preview/mixkit-dreamy-piano-1171.mp3", emoji: "🎹" },
  { id: 4, name: "Summer Vibes", artist: "Tropical", duration: "3:30", url: "https://assets.mixkit.co/music/preview/mixkit-summer-vibes-129.mp3", emoji: "🏖️" },
  { id: 5, name: "Happy Day", artist: "Pop Rock", duration: "2:50", url: "https://assets.mixkit.co/music/preview/mixkit-happy-day-583.mp3", emoji: "😊" },
  { id: 6, name: "Relaxing Guitar", artist: "Acoustic", duration: "3:10", url: "https://assets.mixkit.co/music/preview/mixkit-relaxing-guitar-243.mp3", emoji: "🎸" }
];

// Enhanced sticker library
const stickerLibrary = {
  emotions: [
    { id: 'happy', emoji: '😊', name: 'Happy' },
    { id: 'laugh', emoji: '😂', name: 'Laugh' },
    { id: 'love', emoji: '❤️', name: 'Love' },
    { id: 'cool', emoji: '😎', name: 'Cool' },
    { id: 'fire', emoji: '🔥', name: 'Fire' },
    { id: 'star', emoji: '⭐', name: 'Star' }
  ],
  animals: [
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'panda', emoji: '🐼', name: 'Panda' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
    { id: 'dragon', emoji: '🐉', name: 'Dragon' },
    { id: 'butterfly', emoji: '🦋', name: 'Butterfly' }
  ],
  objects: [
    { id: 'balloon', emoji: '🎈', name: 'Balloon' },
    { id: 'gift', emoji: '🎁', name: 'Gift' },
    { id: 'camera', emoji: '📷', name: 'Camera' },
    { id: 'music', emoji: '🎵', name: 'Music' },
    { id: 'book', emoji: '📚', name: 'Book' },
    { id: 'computer', emoji: '💻', name: 'Computer' }
  ],
  nature: [
    { id: 'sun', emoji: '☀️', name: 'Sun' },
    { id: 'moon', emoji: '🌙', name: 'Moon' },
    { id: 'tree', emoji: '🌳', name: 'Tree' },
    { id: 'flower', emoji: '🌸', name: 'Flower' },
    { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
    { id: 'wave', emoji: '🌊', name: 'Wave' }
  ],
  food: [
    { id: 'pizza', emoji: '🍕', name: 'Pizza' },
    { id: 'burger', emoji: '🍔', name: 'Burger' },
    { id: 'icecream', emoji: '🍦', name: 'Ice Cream' },
    { id: 'coffee', emoji: '☕', name: 'Coffee' },
    { id: 'cake', emoji: '🍰', name: 'Cake' },
    { id: 'drink', emoji: '🥤', name: 'Drink' }
  ],
  activities: [
    { id: 'sports', emoji: '⚽', name: 'Sports' },
    { id: 'game', emoji: '🎮', name: 'Game' },
    { id: 'music', emoji: '🎵', name: 'Music' },
    { id: 'art', emoji: '🎨', name: 'Art' },
    { id: 'movie', emoji: '🎬', name: 'Movie' },
    { id: 'travel', emoji: '✈️', name: 'Travel' }
  ]
};

const colleges = {
  nit: [
    {name: 'NIT Bhopal', email: '@stu.manit.ac.in', location: 'Bhopal'},
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  setupEventListeners();
  initializeMusicPlayer();
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
  initializeSearchBar();
  loadTrending();
});

function setupEventListeners() {
  const addMusicBtn = document.getElementById('addMusicBtn');
  if (addMusicBtn) {
    addMusicBtn.addEventListener('click', openMusicSelector);
  }
  
  const addStickerBtn = document.getElementById('addStickerBtn');
  if (addStickerBtn) {
    addStickerBtn.addEventListener('click', openStickerSelector);
  }
}

function initializeMusicPlayer() {
  window.musicPlayer = new Audio();
  window.musicPlayer.volume = 0.5;
  
  window.musicPlayer.addEventListener('loadedmetadata', function() {
    console.log('Music loaded:', this.src);
  });
  
  window.musicPlayer.addEventListener('error', function(e) {
    console.error('Error loading music:', e);
    showMessage('Error loading music file. Please try another one.', 'error');
  });
}

// ==================== REWARDS PAGE FUNCTION ====================
function loadRewardsPage() {
  const container = document.getElementById('rewards');
  if (!container) return;
  
  const userPoints = currentUser?.rewardPoints || 0;
  
  let html = `
    <div style="text-align:center; margin-bottom:40px;">
      <h2 style="font-size:36px; color:#4f74a3; margin-bottom:10px;">🎁 Rewards Center</h2>
      <p style="color:#888; font-size:16px;">Earn points and unlock exclusive rewards!</p>
      <div style="margin:30px auto; padding:30px; background:linear-gradient(135deg, rgba(79,116,163,0.2), rgba(141,164,211,0.2)); border:2px solid #4f74a3; border-radius:20px; max-width:400px;">
        <div style="font-size:48px; font-weight:800; color:#4f74a3; margin-bottom:8px;">${userPoints}</div>
        <div style="font-size:14px; color:#888; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Your Points</div>
      </div>
    </div>

    <!-- Daily Tasks -->
    <div style="margin-bottom:50px;">
      <h3 style="color:#4f74a3; font-size:24px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
        <span>📋</span> Daily Tasks
      </h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
        ${rewardsData.dailyTasks.map(task => `
          <div class="reward-task-card ${task.completed ? 'completed' : ''}" onclick="completeTask('${task.id}')">
            <div style="font-size:48px; margin-bottom:15px;">${task.icon}</div>
            <h4 style="color:#4f74a3; font-size:18px; margin-bottom:8px;">${task.title}</h4>
            <p style="color:#888; font-size:14px; margin-bottom:15px;">${task.desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="background:linear-gradient(135deg, #4f74a3, #8da4d3); color:white; padding:6px 16px; border-radius:20px; font-weight:600; font-size:13px;">
                +${task.reward} pts
              </span>
              ${task.completed ? 
                '<span style="color:#22c55e; font-weight:600;">✓ Done</span>' : 
                '<span style="color:#888; font-size:12px;">Complete</span>'
              }
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Achievements -->
    <div style="margin-bottom:50px;">
      <h3 style="color:#4f74a3; font-size:24px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
        <span>🏆</span> Achievements
      </h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
        ${rewardsData.achievements.map(ach => {
          const percentage = (ach.progress / ach.target) * 100;
          return `
            <div class="reward-achievement-card">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                <div style="font-size:56px;">${ach.icon}</div>
                <div style="text-align:right;">
                  <div style="font-size:20px; font-weight:700; color:#4f74a3;">${ach.progress}/${ach.target}</div>
                  <div style="font-size:12px; color:#888;">Progress</div>
                </div>
              </div>
              <h4 style="color:#4f74a3; font-size:18px; margin-bottom:8px;">${ach.title}</h4>
              <p style="color:#888; font-size:14px; margin-bottom:15px;">${ach.desc}</p>
              <div style="background:rgba(79,116,163,0.1); height:8px; border-radius:10px; overflow:hidden; margin-bottom:12px;">
                <div style="width:${percentage}%; height:100%; background:linear-gradient(135deg, #4f74a3, #8da4d3); transition:width 0.3s ease;"></div>
              </div>
              <div style="text-align:center;">
                <span style="background:rgba(254,202,87,0.2); color:#feca57; padding:6px 16px; border-radius:20px; font-weight:600; font-size:13px;">
                  🎁 ${ach.reward} pts reward
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Exclusive Rewards Shop -->
    <div style="margin-bottom:50px;">
      <h3 style="color:#4f74a3; font-size:24px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
        <span>🛍️</span> Exclusive Rewards Shop
      </h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:20px;">
        ${rewardsData.exclusiveRewards.map(reward => `
          <div class="reward-shop-card" onclick="purchaseReward('${reward.id}', ${reward.cost})">
            <div class="reward-category-badge ${reward.category}">${reward.category}</div>
            <div style="font-size:64px; margin:20px 0;">${reward.icon}</div>
            <h4 style="color:#4f74a3; font-size:18px; margin-bottom:8px; font-weight:700;">${reward.title}</h4>
            <p style="color:#888; font-size:13px; margin-bottom:20px; line-height:1.5;">${reward.desc}</p>
            <button style="width:100%; padding:12px; background:linear-gradient(135deg, #4f74a3, #8da4d3); color:white; border:none; border-radius:10px; font-weight:700; cursor:pointer; transition:all 0.3s ease; font-size:15px;">
              💎 ${reward.cost} Points
            </button>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Leaderboard -->
    <div style="margin-bottom:50px;">
      <h3 style="color:#4f74a3; font-size:24px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
        <span>👑</span> Top Contributors This Month
      </h3>
      <div class="leaderboard-container">
        ${rewardsData.leaderboard.map(user => `
          <div class="leaderboard-item ${user.rank <= 3 ? 'top-rank' : ''}">
            <div style="display:flex; align-items:center; gap:20px; flex:1;">
              <div class="leaderboard-rank rank-${user.rank}">
                ${user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
              </div>
              <div style="font-size:40px;">${user.avatar}</div>
              <div style="flex:1;">
                <div style="font-weight:700; color:#4f74a3; font-size:18px; margin-bottom:4px;">${user.name}</div>
                <div style="font-size:14px; color:#888;">${user.points.toLocaleString()} points</div>
              </div>
            </div>
            <div class="leaderboard-trend trend-${user.trend}">
              ${user.trend === 'up' ? '📈' : user.trend === 'down' ? '📉' : '➡️'}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center; margin-top:25px;">
        <button onclick="showFullLeaderboard()" style="padding:14px 32px; background:rgba(79,116,163,0.15); border:2px solid rgba(79,116,163,0.3); border-radius:25px; color:#4f74a3; font-weight:700; cursor:pointer; transition:all 0.3s ease; font-size:15px;">
          View Full Leaderboard 🏆
        </button>
      </div>
    </div>

    <!-- How to Earn Points -->
    <div style="background:linear-gradient(135deg, rgba(79,116,163,0.1), rgba(141,164,211,0.1)); border:2px solid rgba(79,116,163,0.2); border-radius:20px; padding:40px 30px; text-align:center;">
      <h3 style="color:#4f74a3; font-size:24px; margin-bottom:25px;">💡 How to Earn More Points</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; text-align:left;">
        <div>
          <div style="font-size:32px; margin-bottom:10px;">📝</div>
          <div style="font-weight:600; color:#4f74a3; margin-bottom:5px;">Create Posts</div>
          <div style="font-size:13px; color:#888;">+10 pts per post</div>
        </div>
        <div>
          <div style="font-size:32px; margin-bottom:10px;">💬</div>
          <div style="font-weight:600; color:#4f74a3; margin-bottom:5px;">Comment</div>
          <div style="font-size:13px; color:#888;">+3 pts per comment</div>
        </div>
        <div>
          <div style="font-size:32px; margin-bottom:10px;">❤️</div>
          <div style="font-weight:600; color:#4f74a3; margin-bottom:5px;">Like Posts</div>
          <div style="font-size:13px; color:#888;">+1 pt per like</div>
        </div>
        <div>
          <div style="font-size:32px; margin-bottom:10px;">🔥</div>
          <div style="font-weight:600; color:#4f74a3; margin-bottom:5px;">Daily Streak</div>
          <div style="font-size:13px; color:#888;">+50 pts weekly</div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

function completeTask(taskId) {
  showMessage('🎉 Task completed! +10 points', 'success');
  // Update UI and backend
}

function purchaseReward(rewardId, cost) {
  const userPoints = currentUser?.rewardPoints || 0;
  
  if (userPoints < cost) {
    showMessage(`⚠️ Not enough points! You need ${cost - userPoints} more points.`, 'error');
    return;
  }
  
  if (confirm(`Purchase this reward for ${cost} points?`)) {
    showMessage('🎁 Reward unlocked successfully!', 'success');
    // Update backend and user points
  }
}

function showFullLeaderboard() {
  showMessage('📊 Full leaderboard coming soon!', 'success');
}

// FIXED: Enhanced API call with timeout and retry logic for mobile
function getToken() {
  return localStorage.getItem('authToken');
}

async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  const options = {
    method,
    headers: {},
    signal: controller.signal
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
    console.log(`📡 API Call: ${method} ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    console.log(`✅ API Success: ${endpoint}`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('network') || error.message.includes('fetch'))) {
      console.log(`🔄 Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiCall(endpoint, method, body, retries - 1);
    }
    
    console.error(`❌ API Error: ${endpoint}`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection and try again');
    }
    throw error;
  }
}

async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  if (file.size < 500 * 1024) return file;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log(`🗜️ Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
    };
  });
}

function checkAuthStatus() {
  const token = getToken();
  const saved = localStorage.getItem('user');
  
  if(token && saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
    
    if (currentUser.college) {
      updateLiveNotif(`Connected to ${currentUser.college}`);
      initializeSocket();
    }
  }
}

function showLoginPage() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('mainPage').style.display = 'none';
}

function showMainPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
}

// AUTH FUNCTIONS
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if(!email || !password) {
    showMessage('Fill all fields', 'error');
    return;
  }
  
  try {
    showMessage('Logging in...', 'success');
    
    const data = await apiCall('/api/login', 'POST', { email, password });
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    showMessage('✅ Login successful!', 'success');
    
    setTimeout(() => {
      showMainPage();
      document.getElementById('userName').textContent = 'Hi, ' + currentUser.username;
      document.getElementById('loginForm').reset();
      loadPosts();
      if (currentUser.college) {
        initializeSocket();
      }
    }, 800);
  } catch (error) {
    showMessage('❌ Login failed: ' + error.message, 'error');
  }
}

async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const registrationNumber = document.getElementById('signupReg').value.trim();
  const password = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  if(!username || !email || !registrationNumber || !password || !confirm) {
    showMessage('Fill all fields', 'error');
    return;
  }
  
  if(password !== confirm) {
    showMessage('Passwords don\'t match', 'error');
    return;
  }
  
  try {
    showMessage('Creating account...', 'success');
    
    await apiCall('/api/register', 'POST', { username, email, password, registrationNumber });
    
    showMessage('🎉 Account created! Check your email', 'success');
    
    document.getElementById('signupForm').reset();
    
    setTimeout(() => {
      goLogin(null);
    }, 2000);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

// ==================== LIKE FUNCTIONALITY ====================
async function toggleLike(postId) {
  if (!currentUser) {
    showMessage('⚠️ Please login to like posts', 'error');
    return;
  }
  
  try {
    const likeBtn = document.querySelector(`#like-btn-${postId}`);
    const likeCount = document.querySelector(`#like-count-${postId}`);
    
    if (likeBtn) {
      likeBtn.disabled = true;
    }
    
    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');
    
    if (data.success) {
      if (likeBtn) {
        if (data.liked) {
          likeBtn.innerHTML = '❤️ Liked';
          likeBtn.classList.add('liked');
        } else {
          likeBtn.innerHTML = '❤️ Like';
          likeBtn.classList.remove('liked');
        }
        likeBtn.disabled = false;
      }
      
      if (likeCount) {
        likeCount.textContent = `❤️ ${data.likeCount}`;
      }
    }
  } catch (error) {
    console.error('❌ Like error:', error);
    showMessage('❌ Failed to like post', 'error');
    
    const likeBtn = document.querySelector(`#like-btn-${postId}`);
    if (likeBtn) {
      likeBtn.disabled = false;
    }
  }
}

// ==================== COMMENT FUNCTIONALITY ====================
function openCommentModal(postId) {
  if (!currentUser) {
    showMessage('⚠️ Please login to comment', 'error');
    return;
  }
  
  currentCommentPostId = postId;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'commentModal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
      <span class="close" onclick="closeCommentModal()">&times;</span>
      <h2>💬 Comments</h2>
      
      <div id="commentsContainer" style="margin: 20px 0; max-height: 300px; overflow-y: auto;">
        <div style="text-align: center; padding: 20px; color: #888;">⏳ Loading comments...</div>
      </div>
      
      <div style="border-top: 1px solid rgba(79,116,163,0.2); padding-top: 20px;">
        <textarea 
          id="commentInput" 
          placeholder="Write a comment..." 
          style="width: 100%; min-height: 80px; padding: 12px; background: rgba(20,30,50,0.6); border: 1px solid rgba(79,116,163,0.3); border-radius: 10px; color: white; font-family: inherit; resize: vertical;"
        ></textarea>
        <button onclick="submitComment('${postId}')" style="width: 100%; margin-top: 10px;">💬 Post Comment</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  loadComments(postId);
}

function closeCommentModal() {
  const modal = document.getElementById('commentModal');
  if (modal) {
    modal.remove();
  }
  currentCommentPostId = null;
}

async function loadComments(postId) {
  const container = document.getElementById('commentsContainer');
  if (!container) return;
  
  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'GET');
    
    if (!data.success || !data.comments || data.comments.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">💬 No comments yet. Be the first to comment!</div>';
      return;
    }
    
    let html = '';
    data.comments.forEach(comment => {
      const author = comment.users?.username || 'User';
      const time = new Date(comment.created_at).toLocaleString();
      const isOwn = currentUser && comment.user_id === currentUser.id;
      
      html += `
        <div class="comment-item" style="background: rgba(15,25,45,0.9); border: 1px solid rgba(79,116,163,0.2); border-radius: 12px; padding: 15px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4f74a3, #8da4d3); display: flex; align-items: center; justify-content: center; font-size: 18px;">
                ${comment.users?.profile_pic ? `<img src="${comment.users.profile_pic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : '👤'}
              </div>
              <div>
                <div style="font-weight: 600; color: #4f74a3;">@${author}</div>
                <div style="font-size: 11px; color: #888;">${time}</div>
              </div>
            </div>
            ${isOwn ? `<button onclick="deleteComment('${comment.id}', '${postId}')" style="background: rgba(255,107,107,0.2); color: #ff6b6b; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️ Delete</button>` : ''}
          </div>
          <div style="color: #e0e0e0; line-height: 1.5;">${comment.content}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('❌ Load comments error:', error);
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">❌ Failed to load comments</div>';
  }
}

async function submitComment(postId) {
  const input = document.getElementById('commentInput');
  const content = input?.value.trim();
  
  if (!content) {
    showMessage('⚠️ Comment cannot be empty', 'error');
    return;
  }
  
  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'POST', { content });
    
    if (data.success) {
      showMessage('✅ Comment posted!', 'success');
      input.value = '';
      loadComments(postId);
      
      const commentCount = document.querySelector(`#comment-count-${postId}`);
      if (commentCount) {
        const currentCount = parseInt(commentCount.textContent.replace(/\D/g, '')) || 0;
        commentCount.textContent = `💬 ${currentCount + 1}`;
      }
    }
  } catch (error) {
    console.error('❌ Comment error:', error);
    showMessage('❌ Failed to post comment', 'error');
  }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Delete this comment?')) return;
  
  try {
    await apiCall(`/api/posts/${postId}/comments/${commentId}`, 'DELETE');
    showMessage('🗑️ Comment deleted', 'success');
    loadComments(postId);
    
    const commentCount = document.querySelector(`#comment-count-${postId}`);
    if (commentCount) {
      const currentCount = parseInt(commentCount.textContent.replace(/\D/g, '')) || 0;
      if (currentCount > 0) {
        commentCount.textContent = `💬 ${currentCount - 1}`;
      }
    }
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    showMessage('❌ Failed to delete comment', 'error');
  }
}

// ==================== SHARE FUNCTIONALITY ====================
function sharePost(postId, postContent = '', author = '') {
  const shareModal = document.createElement('div');
  shareModal.className = 'modal';
  shareModal.id = 'shareModal';
  shareModal.style.display = 'flex';
  
  const postUrl = `${window.location.origin}/?post=${postId}`;
  const shareText = `Check out this post by @${author} on VibeXpert!\n\n${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}`;
  
  shareModal.innerHTML = `
    <div class="modal-box" style="max-width: 500px;">
      <span class="close" onclick="closeShareModal()">&times;</span>
      <h2>🔄 Share Post</h2>
      
      <div style="background: rgba(15,25,45,0.9); border: 1px solid rgba(79,116,163,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <button onclick="shareVia('copy', '${postUrl}')" class="share-option-btn">
            <span style="font-size: 32px;">📋</span>
            <span>Copy Link</span>
          </button>
          
          <button onclick="shareVia('whatsapp', '${postUrl}', '${encodeURIComponent(shareText)}')" class="share-option-btn">
            <span style="font-size: 32px;">💬</span>
            <span>WhatsApp</span>
          </button>
          
          <button onclick="shareVia('twitter', '${postUrl}', '${encodeURIComponent(shareText)}')" class="share-option-btn">
            <span style="font-size: 32px;">🐦</span>
            <span>Twitter</span>
          </button>
          
          <button onclick="shareVia('native', '${postUrl}', '${encodeURIComponent(shareText)}')" class="share-option-btn">
            <span style="font-size: 32px;">📤</span>
            <span>More</span>
          </button>
        </div>
      </div>
      
      <div style="background: rgba(79,116,163,0.1); padding: 12px; border-radius: 8px; margin-top: 15px;">
        <input 
          type="text" 
          value="${postUrl}" 
          readonly 
          id="shareUrlInput"
          style="width: 100%; background: transparent; border: none; color: #4f74a3; text-align: center; font-size: 14px;"
        >
      </div>
    </div>
  `;
  
  document.body.appendChild(shareModal);
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.remove();
  }
}

async function shareVia(platform, url, text = '') {
  switch(platform) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(url);
        showMessage('✅ Link copied to clipboard!', 'success');
        closeShareModal();
      } catch (err) {
        const input = document.getElementById('shareUrlInput');
        if (input) {
          input.select();
          document.execCommand('copy');
          showMessage('✅ Link copied to clipboard!', 'success');
        }
      }
      break;
      
    case 'whatsapp':
      window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
      closeShareModal();
      break;
      
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
      closeShareModal();
      break;
      
    case 'native':
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'VibeXpert Post',
            text: decodeURIComponent(text),
            url: url
          });
          closeShareModal();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share error:', err);
          }
        }
      } else {
        showMessage('⚠️ Sharing not supported on this device', 'error');
      }
      break;
  }
  
  try {
    const postId = url.split('post=')[1];
    if (postId) {
      await apiCall(`/api/posts/${postId}/share`, 'POST');
      
      const shareCount = document.querySelector(`#share-count-${postId}`);
      if (shareCount) {
        const currentCount = parseInt(shareCount.textContent.replace(/\D/g, '')) || 0;
        shareCount.textContent = `🔄 ${currentCount + 1}`;
      }
    }
  } catch (error) {
    console.error('Share count error:', error);
  }
}

// COMMUNITY FUNCTIONS
function loadCommunities() {
  const container = document.getElementById('communitiesContainer');
  
  if (!currentUser || !currentUser.communityJoined) {
    container.innerHTML = `
      <div class="community-guidance">
        <p>🎓 Connect to your college first to join community!</p>
        <button class="home-nav-btn" onclick="showPage('home')">Explore Colleges</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="community-card">
      <h3>${currentUser.college} Community</h3>
      <p>Share and chat with students from your college</p>
      <button onclick="openCommunitySection()">Open Community</button>
    </div>
  `;
}

function openCommunitySection() {
  document.getElementById('chatSection').style.display = 'block';
  loadCommunityPosts();
  loadCommunityMessages();
}

async function loadCommunityPosts() {
  const container = document.getElementById('communityPostsContainer');
  if (!container) {
    const chatSection = document.getElementById('chatSection');
    if (chatSection) {
      const postsDiv = document.createElement('div');
      postsDiv.innerHTML = `
        <div style="margin-bottom:30px;">
          <div class="chat-header">
            <h3>📸 Community Posts</h3>
            <p style="color:#888; font-size:13px; margin:5px 0 0 0;">Share photos, videos, and updates with your community</p>
          </div>
          <div id="communityPostsContainer" style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
            <div style="text-align:center; padding:20px; color:#888;">⏳ Loading community posts...</div>
          </div>
        </div>
      `;
      chatSection.insertBefore(postsDiv, chatSection.firstChild);
    }
  }
  
  const postsContainer = document.getElementById('communityPostsContainer');
  if (!postsContainer) return;
  
  try {
    console.log('📨 Loading community posts');
    
    const data = await apiCall('/api/posts/community', 'GET');
    
    if (data.needsJoinCommunity) {
      postsContainer.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <div style="font-size:48px; margin-bottom:20px;">🎓</div>
          <h3 style="color:#4f74a3;">Join a Community First!</h3>
          <p style="color:#888;">Connect to your college to see community posts.</p>
        </div>
      `;
      return;
    }
    
    if (!data.posts || data.posts.length === 0) {
      postsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">📸 No community posts yet. Be the first to share!</div>';
      return;
    }
    
    postsContainer.innerHTML = renderPosts(data.posts);
    console.log('✅ Community posts loaded');
  } catch (error) {
    console.error('❌ Failed to load community posts:', error);
    if (postsContainer) {
      postsContainer.innerHTML = `
        <div style="text-align:center; padding:20px; color:#ff6b6b;">
          ❌ Failed to load community posts<br>
          <small style="font-size:12px;color:#888;margin-top:8px;display:block;">
            ${error.message || 'Please try again'}
          </small>
        </div>
      `;
    }
  }
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
    
    messagesEl.innerHTML = '';
    data.messages.reverse().forEach(msg => {
      appendMessageToChat(msg);
    });
    
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (error) {
    console.error('Load messages error:', error);
  }
}

function appendMessageToChat(msg) {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;
  
  const isOwn = msg.sender_id === currentUser.id;
  const sender = msg.users?.username || 'User';
  const messageTime = new Date(msg.timestamp);
  const now = new Date();
  const canEdit = isOwn && ((now - messageTime) / 1000 / 60) < 2;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isOwn ? 'own' : 'other'}`;
  messageDiv.id = `msg-${msg.id}`;
  
  const reactions = msg.message_reactions || [];
  const reactionCounts = {};
  reactions.forEach(r => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });
  
  messageDiv.innerHTML = `
    ${!isOwn ? `<div class="sender">@${sender}</div>` : ''}
    <div class="text">${msg.content}${msg.edited ? ' <span style="font-size:10px;color:#888;">(edited)</span>' : ''}</div>
    ${Object.keys(reactionCounts).length > 0 ? `
      <div style="display:flex; gap:5px; margin-top:5px; flex-wrap:wrap;">
        ${Object.entries(reactionCounts).map(([emoji, count]) => 
          `<span style="background:rgba(79,116,163,0.2); padding:2px 6px; border-radius:10px; font-size:12px;">${emoji} ${count}</span>`
        ).join('')}
      </div>
    ` : ''}
    <div style="display:flex; gap:8px; margin-top:8px; font-size:11px; color:#888;">
      <span onclick="reactToMessage('${msg.id}')" style="cursor:pointer;">❤️</span>
      <span onclick="reactToMessage('${msg.id}', '👍')" style="cursor:pointer;">👍</span>
      <span onclick="reactToMessage('${msg.id}', '😂')" style="cursor:pointer;">😂</span>
      <span onclick="reactToMessage('${msg.id}', '🔥')" style="cursor:pointer;">🔥</span>
      ${canEdit ? `<span onclick="editMessage('${msg.id}', '${msg.content.replace(/'/g, "\\'")}')" style="cursor:pointer;">✏️ Edit</span>` : ''}
      ${isOwn ? `<span onclick="deleteMessage('${msg.id}')" style="cursor:pointer;">🗑️ Delete</span>` : ''}
      <span onclick="showMessageViews('${msg.id}')" style="cursor:pointer;">👁️ Views</span>
    </div>
  `;
  
  messagesEl.appendChild(messageDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  markMessageAsViewed(msg.id);
}

function updateMessageInChat(msg) {
  const messageEl = document.getElementById(`msg-${msg.id}`);
  if (!messageEl) return;
  
  const isOwn = msg.sender_id === currentUser.id;
  const textEl = messageEl.querySelector('.text');
  if (textEl) {
    textEl.innerHTML = `${msg.content} <span style="font-size:10px;color:#888;">(edited)</span>`;
  }
}

function removeMessageFromChat(id) {
  const messageEl = document.getElementById(`msg-${id}`);
  if (messageEl) {
    messageEl.remove();
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();
  
  if (!content) return;
  
  try {
    await apiCall('/api/community/messages', 'POST', { content });
    input.value = '';
  } catch (error) {
    showMessage('❌ Failed to send message: ' + error.message, 'error');
  }
}

function handleChatKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

async function editMessage(messageId, currentContent) {
  if (editingMessageId) {
    showMessage('⚠️ Finish editing current message first', 'error');
    return;
  }
  
  const newContent = prompt('Edit message:', currentContent);
  if (!newContent || newContent.trim() === '' || newContent === currentContent) return;
  
  try {
    editingMessageId = messageId;
    await apiCall(`/api/community/messages/${messageId}`, 'PATCH', { content: newContent.trim() });
    showMessage('✅ Message edited', 'success');
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  } finally {
    editingMessageId = null;
  }
}

async function deleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;
  
  try {
    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');
    showMessage('🗑️ Message deleted', 'success');
  } catch (error) {
    showMessage('❌ Failed to delete: ' + error.message, 'error');
  }
}

async function reactToMessage(messageId, emoji = '❤️') {
  try {
    await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
  } catch (error) {
    console.error('React error:', error);
  }
}

async function markMessageAsViewed(messageId) {
  try {
    await apiCall(`/api/community/messages/${messageId}/view`, 'POST');
  } catch (error) {
    console.error('View error:', error);
  }
}

async function showMessageViews(messageId) {
  try {
    const data = await apiCall(`/api/community/messages/${messageId}/views`, 'GET');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-box">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>Message Views (${data.count})</h2>
        ${data.views.length > 0 ? `
          <div style="max-height:300px; overflow-y:auto;">
            ${data.views.map(v => `
              <div style="padding:10px; border-bottom:1px solid rgba(79,116,163,0.1);">
                <strong>@${v.users?.username || 'User'}</strong>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align:center; color:#888;">No views yet</p>'}
      </div>
    `;
    document.body.appendChild(modal);
  } catch (error) {
    showMessage('❌ Failed to load views', 'error');
  }
}

// UTILITY FUNCTIONS
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) modal.style.display = 'none';
}

function showMessage(text, type) {
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

function updateOnlineCount(count) {
  const elements = ['liveUsersCount', 'heroOnline', 'chatOnlineCount', 'footerUsers'];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'liveUsersCount') {
        el.textContent = count + ' Active';
      } else if (id === 'footerUsers') {
        el.textContent = count;
      } else {
        el.textContent = count;
      }
    }
  });
}

function updateLiveNotif(text) {
  const notif = document.getElementById('notifText');
  if (notif) notif.textContent = text;
}

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

function showFeedbackModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>📢 Send Feedback</h2>
      <p style="color:#888; margin-bottom:20px;">We'd love to hear from you!</p>
      <input type="text" id="feedbackSubject" placeholder="Subject" style="margin-bottom:15px;">
      <textarea id="feedbackMessage" placeholder="Your feedback..." style="width:100%; min-height:120px; padding:12px; background:rgba(20,30,50,0.6); border:1px solid rgba(79,116,163,0.3); border-radius:10px; color:white; font-family:inherit; resize:vertical;"></textarea>
      <button onclick="submitFeedback()" style="width:100%; margin-top:15px;">📤 Send Feedback</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

async function submitFeedback() {
  const subject = document.getElementById('feedbackSubject')?.value.trim();
  const message = document.getElementById('feedbackMessage')?.value.trim();
  
  if (!subject || !message) {
    showMessage('⚠️ Please fill all fields', 'error');
    return;
  }
  
  try {
    await apiCall('/api/feedback', 'POST', { subject, message });
    showMessage('✅ Thank you for your feedback!', 'success');
    document.querySelector('.modal')?.remove();
  } catch (error) {
    showMessage('❌ Failed to submit feedback', 'error');
  }
}

function submitComplaint() {
  const text = document.getElementById('complaintText').value.trim();
  if (text) {
    showMessage('✅ Complaint submitted!', 'success');
    document.getElementById('complaintText').value = '';
    closeModal('complaintModal');
  } else {
    showMessage('⚠️ Enter complaint details', 'error');
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
  showMessage('🎨 Theme changed!', 'success');
  document.getElementById('hamburgerMenu').style.display = 'none';
  document.getElementById('optionsMenu').style.display = 'none';
}

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

// POST CELEBRATION MODAL
function showPostCelebrationModal(postCount) {
  console.log('🎉 Showing celebration for post #', postCount);
  
  let milestone = getMilestoneForPost(postCount);
  
  const modal = document.createElement('div');
  modal.className = 'celebration-modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="celebration-modal-content">
      <div class="celebration-confetti"></div>
      
      <div class="celebration-icon-circle" style="background: linear-gradient(135deg, ${milestone.color}, ${milestone.color}dd);">
        <span style="font-size: 48px;">${milestone.icon}</span>
      </div>
      
      <div class="celebration-emoji">${milestone.emoji}</div>
      
      <h2 class="celebration-title" style="color: ${milestone.color};">
        ${milestone.title}
      </h2>
      
      <p class="celebration-message">${milestone.message}</p>
      
      <div class="celebration-stats" style="background: ${milestone.color}15;">
        <div class="celebration-count" style="color: ${milestone.color};">${postCount}</div>
        <div class="celebration-label">TOTAL POSTS</div>
      </div>
      
      <div class="celebration-quote">
        "${milestone.quote}"
      </div>
      
      <button class="celebration-button" style="background: linear-gradient(135deg, ${milestone.color}, ${milestone.color}dd); box-shadow: 0 4px 15px ${milestone.color}40;" onclick="closeCelebrationModal()">
        🚀 Keep Posting!
      </button>
      
      ${postCount >= 10 ? `
        <button class="celebration-share-btn" onclick="shareAchievement(${postCount})">
          📢 Share Achievement
        </button>
      ` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    closeCelebrationModal();
  }, 5000);
  
  playSuccessSound();
}

function getMilestoneForPost(count) {
  const milestones = {
    1: {
      emoji: '🎉',
      icon: '⭐',
      title: 'First Post!',
      message: 'Congratulations on your first post!',
      quote: 'Every journey begins with a single step',
      color: '#667eea'
    },
    5: {
      emoji: '🚀',
      icon: '📈',
      title: 'Rising Star!',
      message: 'You\'re building momentum!',
      quote: 'Consistency is the key to success',
      color: '#f093fb'
    },
    10: {
      emoji: '⭐',
      icon: '🎨',
      title: 'Content Creator!',
      message: 'You\'re officially a content creator!',
      quote: 'Create content that matters',
      color: '#feca57'
    },
    25: {
      emoji: '🏆',
      icon: '👑',
      title: 'Champion!',
      message: 'You\'re crushing it!',
      quote: 'Champions are made from dedication',
      color: '#ff6b6b'
    },
    50: {
      emoji: '💎',
      icon: '✨',
      title: 'Diamond Creator!',
      message: 'You\'re a legend in the making!',
      quote: 'Shine bright like a diamond',
      color: '#4ecdc4'
    },
    100: {
      emoji: '👑',
      icon: '⚡',
      title: 'Elite Creator!',
      message: 'You\'re unstoppable!',
      quote: 'You are an inspiration to others',
      color: '#a29bfe'
    }
  };
  
  if (milestones[count]) {
    return milestones[count];
  }
  
  if (count % 10 === 0) {
    return {
      emoji: '🎊',
      icon: '🔥',
      title: `${count} Posts!`,
      message: 'You\'re on fire!',
      quote: 'Keep up the amazing work',
      color: '#667eea'
    };
  }
  
  return {
    emoji: '🎉',
    icon: '✨',
    title: 'Post Published!',
    message: 'Your voice matters!',
    quote: 'Every post brings you closer to your goals',
    color: '#4f74a3'
  };
}

function closeCelebrationModal() {
  const modal = document.querySelector('.celebration-modal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function shareAchievement(postCount) {
  const text = `🎉 I just made my ${postCount}th post on VibeXpert! Join me and connect with students across 500+ universities! 🚀`;
  
  if (navigator.share) {
    navigator.share({
      title: 'VibeXpert Achievement',
      text: text,
      url: window.location.origin
    }).catch(err => console.log('Share cancelled'));
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showMessage('✅ Achievement copied to clipboard!', 'success');
    });
  }
}

function playSuccessSound() {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8PVazn77BdGAg+ltryxnIlBSl+zPLaizsIGWe57+mjUBELTKXh8bllHAU2jdXzzn0pBSh6yvDckTsIF2m98OihUBAMUKnn8bZkHgU7k9n0y3krBSh9y/HajDkHGGu/8OmgTxAMTqnm8LVjHAU4kdXy0H8qBSh7yfDajzsIGWu98OmhTxAMUKjn8bZkHQU7k9jzzn4pBSh8yvHajDkHGGu/8OmgTw==');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed'));
  } catch (e) {
    console.log('Could not play sound');
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
    showMessage('Enter your email', 'error');
    return;
  }
  
  try {
    showMessage('📧 Sending reset code...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ Check your email for reset code', 'success');
    
    document.getElementById('resetEmailSection').style.display = 'none';
    document.getElementById('resetCodeSection').style.display = 'block';
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyResetCode(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value.trim();
  const code = document.getElementById('resetCode').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmNewPassword').value;
  
  if(!code || code.length !== 6) {
    showMessage('⚠️ Enter 6-digit code', 'error');
    return;
  }
  
  if(!newPassword || !confirmPassword) {
    showMessage('⚠️ Enter new password', 'error');
    return;
  }
  
  if(newPassword !== confirmPassword) {
    showMessage('⚠️ Passwords don\'t match', 'error');
    return;
  }
  
  if(newPassword.length < 6) {
    showMessage('⚠️ Password must be at least 6 characters', 'error');
    return;
  }
  
  try {
    showMessage('🔍 Verifying code...', 'success');
    await apiCall('/api/reset-password', 'POST', { email, code, newPassword });
    showMessage('✅ Password reset successful! Please login', 'success');
    
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetEmailSection').style.display = 'block';
    document.getElementById('resetCodeSection').style.display = 'none';
    
    setTimeout(() => {
      goLogin(null);
    }, 2000);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
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
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  showLoginPage();
  showMessage('👋 Logged out', 'success');
  showLoginForm();
}

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
}

function initializeSearchBar() {
  const searchBox = document.getElementById('searchBox');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchBox) {
    console.warn('Search box not found');
    return;
  }
  
  console.log('✅ Search bar initialized');
  
  searchBox.addEventListener('input', (e) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    
    searchResults.innerHTML = '<div class="no-results">🔍 Searching...</div>';
    searchResults.style.display = 'block';
    
    searchTimeout = setTimeout(() => {
      performUserSearch(query);
    }, 600);
  });
  
  searchBox.addEventListener('focus', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
      performUserSearch(query);
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      hideSearchResults();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideSearchResults();
      searchBox.blur();
    }
  });
}

async function performUserSearch(query) {
  const searchResults = document.getElementById('searchResults');
  
  if (!searchResults) {
    console.error('❌ Search results container not found');
    return;
  }
  
  try {
    console.log('🔍 Searching for:', query);
    
    const data = await apiCall(`/api/search/users?query=${encodeURIComponent(query)}`, 'GET');
    
    console.log('📊 Search API response:', data);
    console.log('📊 Number of users found:', data.users?.length || 0);
    
    if (!data.success) {
      throw new Error('Search failed');
    }
    
    if (data.users && data.users.length > 0) {
      console.log('✅ Users found:');
      data.users.forEach((user, index) => {
        console.log(`  ${index + 1}. @${user.username} - ${user.email}`);
      });
    } else {
      console.log('⚠️ No users found for query:', query);
    }
    
    displaySearchResults(data.users || []);
  } catch (error) {
    console.error('❌ Search error:', error);
    searchResults.innerHTML = `
      <div class="no-results" style="color:#ff6b6b;">
        ❌ ${error.message || 'Search failed'}<br>
        <small style="font-size:12px;color:#888;margin-top:8px;display:block;">
          Please check your internet connection and try again
        </small>
      </div>
    `;
    searchResults.style.display = 'block';
  }
}

function displaySearchResults(users) {
  const searchResults = document.getElementById('searchResults');
  
  if (!searchResults) return;
  
  if (users.length === 0) {
    searchResults.innerHTML = '<div class="no-results">😔 No users found</div>';
    searchResults.style.display = 'block';
    return;
  }
  
  console.log(`✅ Displaying ${users.length} search results`);
  
  let html = '';
  users.forEach(user => {
    const avatarContent = user.profile_pic 
      ? `<img src="${user.profile_pic}" alt="${user.username}">` 
      : '👤';
    
    html += `
      <div class="search-result-item" onclick="showUserProfile('${user.id}')">
        <div class="search-result-avatar">
          ${avatarContent}
        </div>
        <div class="search-result-info">
          <div class="search-result-username">@${user.username}</div>
          <div class="search-result-details">${user.registration_number || user.email}</div>
          ${user.college ? `<div class="search-result-college">🎓 ${user.college}</div>` : ''}
        </div>
      </div>
    `;
  });
  
  searchResults.innerHTML = html;
  searchResults.style.display = 'block';
}

function hideSearchResults() {
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.style.display = 'none';
  }
}

async function showUserProfile(userId) {
  hideSearchResults();
  
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.value = '';
  }
  
  try {
    console.log('👤 Loading profile for user:', userId);
    showMessage('Loading profile...', 'success');
    
    const data = await apiCall(`/api/profile/${userId}`, 'GET');
    
    if (!data.success || !data.user) {
      throw new Error('User not found');
    }
    
    const user = data.user;
    console.log('✅ Profile loaded:', user.username);
    
    showProfileModal(user);
  } catch (error) {
    console.error('❌ Failed to load profile:', error);
    showMessage('❌ Failed to load profile: ' + error.message, 'error');
  }
}

// ENHANCED POST FEATURES
function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  
  input.onchange = function(e) {
    handlePhotoSelection(e.target.files);
  };
  
  input.click();
}

function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        showMessage('📷 Camera access granted. Taking photo...', 'success');
        setTimeout(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          input.onchange = function(e) {
            handlePhotoSelection(e.target.files);
          };
          input.click();
        }, 1000);
      })
      .catch(function(error) {
        console.error('Camera error:', error);
        showMessage('⚠️ Camera not available. Using gallery instead.', 'error');
        openPhotoGallery();
      });
  } else {
    showMessage('⚠️ Camera not supported. Using gallery instead.', 'error');
    openPhotoGallery();
  }
}

async function handlePhotoSelection(files) {
  if (!files.length) return;
  
  showMessage('📸 Processing images...', 'success');
  
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) {
      showMessage('Please select image files only', 'error');
      continue;
    }
    
    if (selectedFiles.length >= 5) {
      showMessage('Maximum 5 photos allowed', 'error');
      break;
    }
    
    try {
      const compressedFile = await compressImage(file);
      selectedFiles.push(compressedFile);
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const previewUrl = e.target.result;
        previewUrls.push(previewUrl);
        displayPhotoPreviews();
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image processing error:', error);
      showMessage('Failed to process image: ' + file.name, 'error');
    }
  }
  
  if (selectedFiles.length > 0) {
    showMessage(`✅ ${selectedFiles.length} photo(s) ready`, 'success');
  }
}

function displayPhotoPreviews() {
  const container = document.getElementById('photoPreviewContainer');
  if (!container) return;
  
  if (previewUrls.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  
  container.style.display = 'block';
  let html = '<div class="media-preview-grid">';
  
  previewUrls.forEach((previewUrl, index) => {
    html += `
      <div class="preview-item">
        <div class="preview-image-container">
          <img src="${previewUrl}" alt="Preview ${index + 1}" class="preview-image">
          <div class="media-actions">
            <button class="crop-btn" onclick="openCropEditor(${index})">✂️ Crop</button>
            <button class="edit-btn" onclick="openPhotoEditor(${index})">🎨 Edit</button>
            <button class="remove-btn" onclick="removePhoto(${index})">🗑️</button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function openCropEditor(index) {
  currentCropIndex = index;
  const imageUrl = previewUrls[index];
  
  document.getElementById('cropImage').src = imageUrl;
  showModal('cropEditorModal');
  
  setTimeout(() => {
    const image = document.getElementById('cropImage');
    if (cropper) {
      cropper.destroy();
    }
    
    cropper = new Cropper(image, {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 0.8,
      responsive: true,
      restore: true,
      checkCrossOrigin: false,
      guides: true,
      center: true,
      highlight: true,
      background: false,
      movable: true,
      rotatable: true,
      scalable: true,
      zoomable: true,
      zoomOnTouch: true,
      zoomOnWheel: true,
      wheelZoomRatio: 0.1,
      ready: function() {
        console.log('Cropper ready');
      }
    });
    
    setupAspectRatioButtons();
  }, 100);
}

function setupAspectRatioButtons() {
  const buttons = document.querySelectorAll('.aspect-ratio-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const ratio = this.dataset.ratio;
      if (ratio === 'free') {
        cropper.setAspectRatio(NaN);
      } else {
        cropper.setAspectRatio(eval(ratio));
      }
    });
  });
}

function rotateImage() {
  if (cropper) {
    cropper.rotate(90);
  }
}

function resetCrop() {
  if (cropper) {
    cropper.reset();
  }
}

function applyCrop() {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas();
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    previewUrls[currentCropIndex] = croppedDataUrl;
    
    canvas.toBlob(function(blob) {
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
      selectedFiles[currentCropIndex] = file;
    }, 'image/jpeg', 0.8);
    
    displayPhotoPreviews();
    closeCropEditor();
    showMessage('✅ Photo cropped successfully!', 'success');
  }
}

function closeCropEditor() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  closeModal('cropEditorModal');
}

function openPhotoEditor(index) {
  currentEditIndex = index;
  const imageUrl = previewUrls[index];
  
  document.getElementById('editImage').src = imageUrl;
  showModal('photoEditorModal');
  
  currentFilters[index] = currentFilters[index] || 'normal';
  applyFilter('normal');
}

function applyFilter(filterName) {
  const image = document.getElementById('editImage');
  currentFilters[currentEditIndex] = filterName;
  
  image.className = '';
  
  if (filterName !== 'normal') {
    image.classList.add(`filter-${filterName}`);
  }
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active-filter');
  });
  event.target.classList.add('active-filter');
}

function resetFilters() {
  applyFilter('normal');
}

function saveEditedPhoto() {
  const image = document.getElementById('editImage');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  
  ctx.filter = getFilterValue(currentFilters[currentEditIndex]);
  ctx.drawImage(image, 0, 0);
  
  const editedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
  previewUrls[currentEditIndex] = editedDataUrl;
  
  canvas.toBlob(function(blob) {
    const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
    selectedFiles[currentEditIndex] = file;
  }, 'image/jpeg', 0.8);
  
  displayPhotoPreviews();
  closePhotoEditor();
  showMessage('✅ Photo edited successfully!', 'success');
}

function closePhotoEditor() {
  closeModal('photoEditorModal');
  currentEditIndex = -1;
}

function getFilterValue(filterName) {
  const filters = {
    normal: 'none',
    vintage: 'sepia(0.4) contrast(1.2) brightness(1.1)',
    clarendon: 'contrast(1.2) saturate(1.35)',
    moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
    lark: 'contrast(0.9) brightness(1.2) hue-rotate(-10deg)',
    reyes: 'sepia(0.6) contrast(1.1) brightness(1.1) saturate(1.4)'
  };
  return filters[filterName] || 'none';
}

function removePhoto(index) {
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  displayPhotoPreviews();
  showMessage('🗑️ Photo removed', 'success');
}

function openMusicSelector() {
  const modal = document.getElementById('musicSelectorModal');
  const selector = document.getElementById('musicSelector');
  
  selector.innerHTML = '';
  
  musicLibrary.forEach(music => {
    const musicItem = document.createElement('div');
    musicItem.className = 'music-item';
    const isSelected = selectedMusic && selectedMusic.id === music.id;
    
    musicItem.innerHTML = `
      <div class="music-info">
        <div class="music-emoji">${music.emoji}</div>
        <div class="music-details">
          <div class="music-name">${music.name}</div>
          <div class="music-artist">${music.artist} • ${music.duration}</div>
        </div>
      </div>
      <div class="music-actions">
        <button class="preview-btn" onclick="previewMusic('${music.url}', ${music.id})">▶️ Preview</button>
        <button class="select-btn ${isSelected ? 'selected' : ''}" onclick="selectMusic(${music.id})">
          ${isSelected ? '
