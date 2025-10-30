// VIBEXPERT - ENHANCED POST SECTION
// Keep all existing code from original vibemap.js and add/replace these functions

const API_URL = 'https://vibexpert-backend-main.onrender.com';

let currentUser = null;
let socket = null;
let selectedFiles = [];
let selectedPostDestination = 'profile';
let currentEditingImageIndex = null;
let originalImage = null;
let canvas = null;
let ctx = null;
let selectedMusic = null;
let textElements = [];
let stickerElements = [];

// Music library
const musicLibrary = [
  { id: 1, title: 'Chill Vibes', artist: 'Audio Library', duration: '2:45', emoji: '🎵' },
  { id: 2, title: 'Summer Days', artist: 'Free Music', duration: '3:12', emoji: '☀️' },
  { id: 3, title: 'Night Drive', artist: 'Audio Collection', duration: '2:58', emoji: '🌙' },
  { id: 4, title: 'Happy Mood', artist: 'Sound Library', duration: '2:30', emoji: '😊' },
  { id: 5, title: 'Study Focus', artist: 'Concentration', duration: '4:15', emoji: '📚' },
  { id: 6, title: 'Workout Energy', artist: 'Fitness Beats', duration: '3:45', emoji: '💪' },
  { id: 7, title: 'Relaxation', artist: 'Calm Sounds', duration: '3:20', emoji: '🧘' },
  { id: 8, title: 'Party Time', artist: 'Dance Mix', duration: '3:05', emoji: '🎉' }
];

// Stickers collection
const stickersCollection = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬',
  '👀', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️',
  '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘',
  '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
  '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐',
  '🔥', '⭐', '✨', '💫', '🌟', '💥', '💢', '💯',
  '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initializePostSection();
  loadStickers();
  checkUser();
  showLoginForm();
});

function initializePostSection() {
  // Character counter
  const postTextArea = document.getElementById('postText');
  if (postTextArea) {
    postTextArea.addEventListener('input', updateCharCounter);
  }
  
  // Initialize editor canvas
  canvas = document.getElementById('editorCanvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
  }
}

function updateCharCounter() {
  const postText = document.getElementById('postText');
  const charCounter = document.getElementById('charCounter');
  if (postText && charCounter) {
    const count = postText.value.length;
    charCounter.textContent = `${count}/1000`;
    charCounter.style.color = count > 900 ? '#ff6b6b' : '#888';
  }
}

// GALLERY & CAMERA
function openGallery() {
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
  input.accept = 'image/*';
  input.capture = 'environment';
  input.onchange = handleFileSelection;
  input.click();
}

function handleFileSelection(e) {
  const files = Array.from(e.target.files);
  
  if (files.length + selectedFiles.length > 10) {
    msg('⚠️ Maximum 10 files allowed', 'error');
    return;
  }
  
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      msg('⚠️ File too large (max 10MB)', 'error');
      return;
    }
    
    selectedFiles.push({
      file: file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video'
    });
  });
  
  displayPhotoPreview();
  msg(`✅ ${files.length} file(s) added`, 'success');
}

function displayPhotoPreview() {
  const container = document.getElementById('photoPreviewContainer');
  if (!container) return;
  
  if (selectedFiles.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'grid';
  container.innerHTML = '';
  
  selectedFiles.forEach((item, index) => {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'photo-preview-item';
    
    if (item.type === 'image') {
      previewDiv.innerHTML = `
        <img src="${item.url}" alt="Preview">
        ${selectedMusic ? '<div class="music-badge">🎵 Music</div>' : ''}
        <div class="photo-preview-actions">
          <button class="preview-action-btn" onclick="editImage(${index})">✏️ Edit</button>
          <button class="preview-action-btn" onclick="removeFile(${index})">🗑️</button>
        </div>
      `;
    } else {
      previewDiv.innerHTML = `
        <video src="${item.url}" style="width:100%; height:100%; object-fit:cover;"></video>
        ${selectedMusic ? '<div class="music-badge">🎵 Music</div>' : ''}
        <div class="photo-preview-actions">
          <button class="preview-action-btn" onclick="removeFile(${index})">🗑️</button>
        </div>
      `;
    }
    
    container.appendChild(previewDiv);
  });
}

function removeFile(index) {
  URL.revokeObjectURL(selectedFiles[index].url);
  selectedFiles.splice(index, 1);
  displayPhotoPreview();
  msg('🗑️ File removed', 'success');
}

// IMAGE EDITOR
function editImage(index) {
  currentEditingImageIndex = index;
  const file = selectedFiles[index];
  
  if (file.type !== 'image') {
    msg('⚠️ Can only edit images', 'error');
    return;
  }
  
  const img = new Image();
  img.onload = function() {
    originalImage = img;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Reset editor state
    resetEditorState();
    
    document.getElementById('imageEditorModal').style.display = 'flex';
  };
  img.src = file.url;
}

function resetEditorState() {
  // Reset filters
  document.getElementById('brightness').value = 100;
  document.getElementById('contrast').value = 100;
  document.getElementById('saturation').value = 100;
  document.getElementById('blur').value = 0;
  document.getElementById('grayscale').value = 0;
  document.getElementById('sepia').value = 0;
  
  textElements = [];
  stickerElements = [];
  
  switchEditorTab('filters');
}

function switchEditorTab(tabName) {
  // Hide all panels
  document.querySelectorAll('.editor-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Remove active from all tabs
  document.querySelectorAll('.editor-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected panel
  document.getElementById(tabName + 'Panel').classList.add('active');
  
  // Add active to clicked tab
  event.target.classList.add('active');
}

function applyFilters() {
  if (!originalImage) return;
  
  const brightness = document.getElementById('brightness').value;
  const contrast = document.getElementById('contrast').value;
  const saturation = document.getElementById('saturation').value;
  const blur = document.getElementById('blur').value;
  const grayscale = document.getElementById('grayscale').value;
  const sepia = document.getElementById('sepia').value;
  
  ctx.filter = `
    brightness(${brightness}%)
    contrast(${contrast}%)
    saturate(${saturation}%)
    blur(${blur}px)
    grayscale(${grayscale}%)
    sepia(${sepia}%)
  `;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(originalImage, 0, 0);
  
  // Redraw text and stickers
  textElements.forEach(drawTextElement);
  stickerElements.forEach(drawStickerElement);
  
  ctx.filter = 'none';
}

function resetFilters() {
  document.getElementById('brightness').value = 100;
  document.getElementById('contrast').value = 100;
  document.getElementById('saturation').value = 100;
  document.getElementById('blur').value = 0;
  document.getElementById('grayscale').value = 0;
  document.getElementById('sepia').value = 0;
  applyFilters();
}

// CROP FUNCTIONS
function cropSquare() {
  cropToRatio(1, 1);
}

function cropPortrait() {
  cropToRatio(4, 5);
}

function cropLandscape() {
  cropToRatio(16, 9);
}

function cropToRatio(ratioW, ratioH) {
  if (!originalImage) return;
  
  const imgWidth = originalImage.width;
  const imgHeight = originalImage.height;
  const imgRatio = imgWidth / imgHeight;
  const targetRatio = ratioW / ratioH;
  
  let cropWidth, cropHeight, cropX, cropY;
  
  if (imgRatio > targetRatio) {
    cropHeight = imgHeight;
    cropWidth = imgHeight * targetRatio;
    cropX = (imgWidth - cropWidth) / 2;
    cropY = 0;
  } else {
    cropWidth = imgWidth;
    cropHeight = imgWidth / targetRatio;
    cropX = 0;
    cropY = (imgHeight - cropHeight) / 2;
  }
  
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  ctx.drawImage(originalImage, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  
  msg(`✂️ Cropped to ${ratioW}:${ratioH}`, 'success');
}

function rotateImage() {
  if (!originalImage) return;
  
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCanvas.width = canvas.height;
  tempCanvas.height = canvas.width;
  
  tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempCtx.rotate(Math.PI / 2);
  tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  
  canvas.width = tempCanvas.width;
  canvas.height = tempCanvas.height;
  ctx.drawImage(tempCanvas, 0, 0);
  
  msg('↻ Rotated 90°', 'success');
}

function flipHorizontal() {
  if (!originalImage) return;
  
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  msg('↔️ Flipped horizontally', 'success');
}

function flipVertical() {
  if (!originalImage) return;
  
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  ctx.drawImage(canvas, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  msg('↕️ Flipped vertically', 'success');
}

// STICKERS
function loadStickers() {
  const stickersGrid = document.getElementById('stickersGrid');
  if (!stickersGrid) return;
  
  stickersGrid.innerHTML = '';
  stickersCollection.forEach(sticker => {
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'sticker-item';
    stickerDiv.textContent = sticker;
    stickerDiv.onclick = () => addStickerToImage(sticker);
    stickersGrid.appendChild(stickerDiv);
  });
}

function addStickerToImage(sticker) {
  if (!canvas) return;
  
  const stickerElement = {
    text: sticker,
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 60
  };
  
  stickerElements.push(stickerElement);
  drawStickerElement(stickerElement);
  
  msg(`😊 Sticker added`, 'success');
}

function drawStickerElement(element) {
  ctx.font = `${element.size}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(element.text, element.x, element.y);
}

// TEXT
function addTextToImage() {
  const textInput = document.getElementById('textInput');
  const textColor = document.getElementById('textColor');
  const fontSize = document.getElementById('fontSize');
  
  if (!textInput.value.trim()) {
    msg('⚠️ Enter text first', 'error');
    return;
  }
  
  const textElement = {
    text: textInput.value,
    x: canvas.width / 2,
    y: canvas.height / 2,
    color: textColor.value,
    size: parseInt(fontSize.value)
  };
  
  textElements.push(textElement);
  drawTextElement(textElement);
  
  textInput.value = '';
  msg('📝 Text added', 'success');
}

function drawTextElement(element) {
  ctx.font = `bold ${element.size}px Arial`;
  ctx.fillStyle = element.color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(element.text, element.x, element.y);
  ctx.fillText(element.text, element.x, element.y);
}

function saveEditedImage() {
  if (!canvas || currentEditingImageIndex === null) return;
  
  canvas.toBlob((blob) => {
    const file = new File([blob], selectedFiles[currentEditingImageIndex].file.name, { type: 'image/jpeg' });
    URL.revokeObjectURL(selectedFiles[currentEditingImageIndex].url);
    selectedFiles[currentEditingImageIndex] = {
      file: file,
      url: URL.createObjectURL(file),
      type: 'image'
    };
    
    displayPhotoPreview();
    closeImageEditor();
    msg('✅ Image saved!', 'success');
  }, 'image/jpeg', 0.9);
}

function closeImageEditor() {
  document.getElementById('imageEditorModal').style.display = 'none';
  currentEditingImageIndex = null;
  originalImage = null;
  textElements = [];
  stickerElements = [];
}

// MUSIC LIBRARY
function openMusicLibrary() {
  document.getElementById('musicModal').style.display = 'flex';
  displayMusicLibrary();
}

function closeMusicModal() {
  document.getElementById('musicModal').style.display = 'none';
}

function switchMusicTab(tabName) {
  document.querySelectorAll('.music-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  document.querySelectorAll('.music-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(tabName + 'Panel').classList.add('active');
  event.target.classList.add('active');
}

function displayMusicLibrary() {
  const musicList = document.getElementById('musicList');
  if (!musicList) return;
  
  musicList.innerHTML = '';
  musicLibrary.forEach(music => {
    const musicDiv = document.createElement('div');
    musicDiv.className = 'music-item';
    musicDiv.innerHTML = `
      <div class="music-item-icon">${music.emoji}</div>
      <div class="music-item-info">
        <div class="music-item-title">${music.title}</div>
        <div class="music-item-artist">${music.artist} • ${music.duration}</div>
      </div>
    `;
    musicDiv.onclick = () => selectMusic(music);
    musicList.appendChild(musicDiv);
  });
}

function filterMusic() {
  const searchTerm = document.getElementById('musicSearch').value.toLowerCase();
  const filtered = musicLibrary.filter(music => 
    music.title.toLowerCase().includes(searchTerm) ||
    music.artist.toLowerCase().includes(searchTerm)
  );
  
  const musicList = document.getElementById('musicList');
  musicList.innerHTML = '';
  
  filtered.forEach(music => {
    const musicDiv = document.createElement('div');
    musicDiv.className = 'music-item';
    musicDiv.innerHTML = `
      <div class="music-item-icon">${music.emoji}</div>
      <div class="music-item-info">
        <div class="music-item-title">${music.title}</div>
        <div class="music-item-artist">${music.artist} • ${music.duration}</div>
      </div>
    `;
    musicDiv.onclick = () => selectMusic(music);
    musicList.appendChild(musicDiv);
  });
}

function selectMusic(music) {
  selectedMusic = music;
  closeMusicModal();
  displayPhotoPreview();
  msg(`🎵 Music selected: ${music.title}`, 'success');
}

function handleMusicUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 10 * 1024 * 1024) {
    msg('⚠️ Music file too large (max 10MB)', 'error');
    return;
  }
  
  selectedMusic = {
    title: file.name,
    artist: 'User Upload',
    duration: '0:00',
    emoji: '🎵',
    file: file
  };
  
  closeMusicModal();
  displayPhotoPreview();
  msg('✅ Music uploaded!', 'success');
}

// POST DESTINATION
function showPostDestinationModal() {
  document.getElementById('destinationModal').style.display = 'flex';
}

function closeDestinationModal() {
  document.getElementById('destinationModal').style.display = 'none';
}

function selectDestination(destination) {
  selectedPostDestination = destination;
  const destinationText = document.getElementById('destinationText');
  if (destinationText) {
    destinationText.textContent = destination === 'profile' ? 'Profile' : 'Community';
  }
  closeDestinationModal();
  msg(`📍 Post will be shared to ${destination === 'profile' ? 'your profile' : 'community feed'}`, 'success');
}

// CREATE POST
async function createPost() {
  const postText = document.getElementById('postText').value.trim();
  
  if (!postText && selectedFiles.length === 0) {
    msg('⚠️ Add text or media', 'error');
    return;
  }
  
  if (!currentUser) {
    msg('❌ Please login', 'error');
    return;
  }
  
  try {
    msg('📤 Posting...', 'success');
    
    const formData = new FormData();
    formData.append('content', postText);
    formData.append('postTo', selectedPostDestination);
    
    selectedFiles.forEach(item => {
      formData.append('media', item.file);
    });
    
    if (selectedMusic) {
      formData.append('musicTitle', selectedMusic.title);
      formData.append('musicArtist', selectedMusic.artist);
      if (selectedMusic.file) {
        formData.append('music', selectedMusic.file);
      }
    }
    
    const data = await apiCall('/api/posts', 'POST', formData);
    
    if (data.success) {
      msg('🎉 Posted successfully!', 'success');
      
      // Clear form
      document.getElementById('postText').value = '';
      updateCharCounter();
      clearSelectedFiles();
      selectedMusic = null;
      
      // Reload posts
      loadPosts();
    }
  } catch (error) {
    msg('❌ Failed: ' + error.message, 'error');
  }
}

function clearSelectedFiles() {
  selectedFiles.forEach(item => URL.revokeObjectURL(item.url));
  selectedFiles = [];
  displayPhotoPreview();
}

// LOAD POSTS
async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if (!feedEl) return;
  
  try {
    feedEl.innerHTML = '<div class="loading-skeleton" style="height:200px;"></div>';
    
    const type = selectedPostDestination === 'community' ? 'community' : 'my';
    const data = await apiCall(`/api/posts?type=${type}`, 'GET');
    
    if (!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:#888;">
          <div style="font-size:48px; margin-bottom:15px;">📝</div>
          <p style="font-size:18px;">No posts yet. Be the first to post!</p>
        </div>
      `;
      return;
    }
    
    feedEl.innerHTML = '';
    data.posts.forEach(post => {
      const postCard = createPostCard(post);
      feedEl.appendChild(postCard);
    });
  } catch (error) {
    console.error('Load posts error:', error);
    feedEl.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">Failed to load posts</div>';
  }
}

function createPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  
  const author = post.users?.username || 'User';
  const authorId = post.users?.id || '';
  const content = post.content || '';
  const media = post.media || [];
  const time = new Date(post.created_at || post.timestamp).toLocaleString();
  const isOwn = currentUser && authorId === currentUser.id;
  const postedTo = post.posted_to === 'community' ? '🌍 Community' : '👤 Profile';
  
  let mediaHTML = '';
  if (media.length > 0) {
    const gridClass = media.length === 1 ? 'single' : 
                      media.length === 2 ? 'double' : 
                      media.length === 3 ? 'triple' : 'multiple';
    
    mediaHTML = `<div class="post-media-grid ${gridClass}">`;
    media.slice(0, 4).forEach(m => {
      if (m.type === 'image') {
        mediaHTML += `
          <div class="post-media-item" onclick="window.open('${m.url}', '_blank')">
            <img src="${m.url}" alt="Post media">
          </div>
        `;
      } else {
        mediaHTML += `
          <div class="post-media-item">
            <video src="${m.url}" controls></video>
          </div>
        `;
      }
    });
    mediaHTML += '</div>';
  }
  
  let musicHTML = '';
  if (post.musicTitle) {
    musicHTML = `
      <div class="post-music-player">
        <div class="music-icon">🎵</div>
        <div class="music-info">
          <div class="music-title">${post.musicTitle}</div>
          <div class="music-duration">${post.musicArtist || 'Unknown Artist'}</div>
        </div>
      </div>
    `;
  }
  
  card.innerHTML = `
    <div class="post-header">
      <div class="post-author">
        <div class="post-avatar">👤</div>
        <div class="post-author-info">
          <h4>@${author}</h4>
          <p>${time}</p>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="post-destination-badge">${postedTo}</span>
        ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️ Delete</button>` : ''}
      </div>
    </div>
    ${content ? `<div class="post-content">${escapeHtml(content)}</div>` : ''}
    ${musicHTML}
    ${mediaHTML}
    <div class="post-actions-bar">
      <button class="post-action-btn">❤️ Like</button>
      <button class="post-action-btn">💬 Comment</button>
      <button class="post-action-btn">🔗 Share</button>
    </div>
  `;
  
  return card;
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

function escapeHtml(text) {
  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper function for API calls
function getToken() {
  return localStorage.getItem('authToken');
}

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

// Message notification
function msg(text, type) {
  const box = document.getElementById('message');
  if (!box) {
    console.log('Message:', text);
    return;
  }
  
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  box.innerHTML = '';
  box.appendChild(div);
  
  setTimeout(() => {
    if (div.parentNode) div.remove();
  }, 4000);
}

console.log('✅ VibeXpert Enhanced Post Section - Loaded!');
