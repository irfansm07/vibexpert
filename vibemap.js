// VIBEXPERT - ENHANCED VERSION WITH ADVANCED POST FEATURES

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
let cropper = null;
let currentEditingImageIndex = null;
let selectedPostDestination = 'profile';

// Image filter presets
const filterPresets = {
  normal: { brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0, sharpen: 0, hue: 0 },
  vintage: { brightness: 1.1, contrast: 1.1, saturation: 0.8, grayscale: 0, blur: 0.5, sharpen: 0, hue: 10 },
  dramatic: { brightness: 0.9, contrast: 1.3, saturation: 1.1, grayscale: 0, blur: 0, sharpen: 1, hue: 0 },
  warm: { brightness: 1.1, contrast: 1, saturation: 1.2, grayscale: 0, blur: 0, sharpen: 0, hue: 15 },
  cool: { brightness: 1, contrast: 1.1, saturation: 0.9, grayscale: 0, blur: 0, sharpen: 0, hue: -10 },
  bw: { brightness: 1, contrast: 1.2, saturation: 0, grayscale: 1, blur: 0, sharpen: 0.5, hue: 0 }
};

// ... (your existing colleges and other data structures remain the same)

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

// INIT
document.addEventListener('DOMContentLoaded', function() {
  checkUser();
  showLoginForm();
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
  initializeSearchBar();
  loadTrending();
});

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
      initializeSocket();
    }
  }
}

// ... (your existing authentication functions remain the same)

// ENHANCED POST CREATION WITH CROPPING AND FILTERS
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

  // Show destination selection modal
  showPostDestinationModal();
}

async function actuallyCreatePost(destination) {
  const text = document.getElementById('postText').value.trim();
  
  try {
    msg('📤 Posting...', 'success');
    
    const formData = new FormData();
    formData.append('content', text);
    formData.append('postTo', destination);
    
    // Process and add files
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const preview = previewUrls[i];
      
      // If the file has been processed (cropped/filtered), use the processed version
      if (preview.processedFile) {
        formData.append('media', preview.processedFile);
      } else {
        formData.append('media', file);
      }
    }
    
    const data = await apiCall('/api/posts', 'POST', formData);
    
    if(data.success) {
      msg('🎉 Posted to ' + (destination === 'community' ? 'Community!' : 'Profile!'), 'success');
      
      if (data.badges && data.badges.length > currentUser.badges?.length) {
        currentUser.badges = data.badges;
        localStorage.setItem('user', JSON.stringify(currentUser));
        msg('🏆 New badge unlocked!', 'success');
      }
      
      document.getElementById('postText').value = '';
      clearSelectedFiles();
      
      loadPosts();
    }
  } catch (error) {
    if (error.message.includes('join a college community first')) {
      msg('❌ Please join a college community first to post there!', 'error');
      showCommunityJoinPrompt();
    } else {
      msg('❌ Failed: ' + error.message, 'error');
    }
  }
}

function showPostDestinationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 400px;">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>📍 Where to Post?</h2>
      <p style="color: #888; margin-bottom: 20px;">Choose where you want to share your post:</p>
      
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <button onclick="selectPostDestination('profile', this.parentElement.parentElement.parentElement)" 
                style="display: flex; align-items: center; gap: 15px; padding: 20px; background: rgba(20, 30, 50, 0.8); border: 2px solid #4f74a3; border-radius: 12px; color: white; cursor: pointer; text-align: left; width: 100%; transition: all 0.3s ease;">
          <div style="font-size: 24px;">👤</div>
          <div>
            <div style="font-weight: 600; font-size: 16px;">My Profile</div>
            <div style="font-size: 12px; color: #888; margin-top: 5px;">Only you can see this post</div>
          </div>
        </button>
        
        <button onclick="selectPostDestination('community', this.parentElement.parentElement.parentElement)" 
                style="display: flex; align-items: center; gap: 15px; padding: 20px; background: rgba(20, 30, 50, 0.8); border: 2px solid #4f74a3; border-radius: 12px; color: white; cursor: pointer; text-align: left; width: 100%; transition: all 0.3s ease;">
          <div style="font-size: 24px;">🌐</div>
          <div>
            <div style="font-weight: 600; font-size: 16px;">Community Feed</div>
            <div style="font-size: 12px; color: #888; margin-top: 5px;">All ${currentUser.college || 'college'} members can see</div>
          </div>
        </button>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="padding: 10px 20px; background: transparent; border: 1px solid #666; border-radius: 8px; color: #888; cursor: pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function selectPostDestination(destination, modalElement) {
  if (destination === 'community' && (!currentUser.communityJoined || !currentUser.college)) {
    msg('❌ Please join a college community first to post there!', 'error');
    modalElement.remove();
    showCommunityJoinPrompt();
    return;
  }
  
  selectedPostDestination = destination;
  modalElement.remove();
  actuallyCreatePost(destination);
}

function showCommunityJoinPrompt() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 450px; text-align: center;">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <div style="font-size: 48px; margin-bottom: 20px;">🎓</div>
      <h2>Join a Community First!</h2>
      <p style="color: #888; margin-bottom: 25px; line-height: 1.5;">
        To post in the community feed, you need to join a college community first. 
        Connect with your college to start vibing with fellow students!
      </p>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <button onclick="this.parentElement.parentElement.parentElement.remove(); showPage('home')" 
                style="padding: 12px 25px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
          Explore Colleges
        </button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="padding: 12px 25px; background: transparent; border: 1px solid #666; border-radius: 8px; color: #888; cursor: pointer;">
          Maybe Later
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ENHANCED PHOTO HANDLING WITH CROPPING AND FILTERS
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
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        showCameraModal(stream);
      })
      .catch(function(error) {
        console.error('Camera error:', error);
        msg('❌ Camera access denied', 'error');
      });
  } else {
    msg('❌ Camera not supported', 'error');
  }
}

function showCameraModal(stream) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 500px;">
      <span class="close" onclick="closeCameraModal()">&times;</span>
      <h2>📷 Take Photo</h2>
      <video id="cameraVideo" autoplay playsinline style="width: 100%; border-radius: 8px; background: #000;"></video>
      <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
        <button onclick="capturePhoto()" style="padding: 12px 25px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
          📸 Capture
        </button>
        <button onclick="closeCameraModal()" style="padding: 12px 25px; background: transparent; border: 1px solid #666; border-radius: 8px; color: #888; cursor: pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const video = document.getElementById('cameraVideo');
  video.srcObject = stream;
  
  window.closeCameraModal = function() {
    stream.getTracks().forEach(track => track.stop());
    modal.remove();
  };
}

function capturePhoto() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  canvas.toBlob(function(blob) {
    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
    handleFileSelection({ target: { files: [file] } });
    closeCameraModal();
  }, 'image/jpeg', 0.8);
}

function handleFileSelection(event) {
  const files = Array.from(event.target.files);
  
  if (selectedFiles.length + files.length > 5) {
    msg('❌ Maximum 5 files allowed', 'error');
    return;
  }
  
  files.forEach(file => {
    if (file.size > 50 * 1024 * 1024) {
      msg('❌ File too large (max 50MB)', 'error');
      return;
    }
    
    selectedFiles.push(file);
    const url = URL.createObjectURL(file);
    previewUrls.push({ 
      originalUrl: url, 
      processedUrl: url,
      processedFile: null,
      filters: { ...filterPresets.normal }
    });
  });
  
  updateFilePreviews();
}

function updateFilePreviews() {
  const previewContainer = document.getElementById('filePreviews');
  previewContainer.innerHTML = '';
  
  previewUrls.forEach((preview, index) => {
    const isImage = selectedFiles[index].type.startsWith('image/');
    const previewElement = document.createElement('div');
    previewElement.className = 'file-preview';
    previewElement.style.position = 'relative';
    previewElement.style.display = 'inline-block';
    previewElement.style.margin = '5px';
    previewElement.style.borderRadius = '8px';
    previewElement.style.overflow = 'hidden';
    previewElement.style.maxWidth = '100px';
    
    if (isImage) {
      previewElement.innerHTML = `
        <img src="${preview.processedUrl}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />
        <div style="position: absolute; top: 5px; right: 5px; display: flex; gap: 2px;">
          <button onclick="editImage(${index})" style="background: rgba(0,0,0,0.7); border: none; border-radius: 4px; color: white; padding: 4px; cursor: pointer; font-size: 12px;">✏️</button>
          <button onclick="removeFile(${index})" style="background: rgba(255,0,0,0.7); border: none; border-radius: 4px; color: white; padding: 4px; cursor: pointer; font-size: 12px;">❌</button>
        </div>
      `;
    } else {
      previewElement.innerHTML = `
        <video src="${preview.processedUrl}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" controls></video>
        <div style="position: absolute; top: 5px; right: 5px;">
          <button onclick="removeFile(${index})" style="background: rgba(255,0,0,0.7); border: none; border-radius: 4px; color: white; padding: 4px; cursor: pointer; font-size: 12px;">❌</button>
        </div>
      `;
    }
    
    previewContainer.appendChild(previewElement);
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  URL.revokeObjectURL(previewUrls[index].originalUrl);
  if (previewUrls[index].processedUrl !== previewUrls[index].originalUrl) {
    URL.revokeObjectURL(previewUrls[index].processedUrl);
  }
  previewUrls.splice(index, 1);
  updateFilePreviews();
}

function clearSelectedFiles() {
  previewUrls.forEach(preview => {
    URL.revokeObjectURL(preview.originalUrl);
    if (preview.processedUrl !== preview.originalUrl) {
      URL.revokeObjectURL(preview.processedUrl);
    }
  });
  selectedFiles = [];
  previewUrls = [];
  updateFilePreviews();
}

// IMAGE EDITING WITH CROPPING AND FILTERS
function editImage(index) {
  currentEditingImageIndex = index;
  showImageEditorModal();
}

function showImageEditorModal() {
  const preview = previewUrls[currentEditingImageIndex];
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 90vw; max-height: 90vh; width: 800px;">
      <span class="close" onclick="closeImageEditor()">&times;</span>
      <h2>🖼️ Edit Image</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 20px; height: 500px;">
        <!-- Image Canvas -->
        <div style="background: #000; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <img id="editorImage" src="${preview.originalUrl}" style="max-width: 100%; max-height: 100%;" />
        </div>
        
        <!-- Controls -->
        <div style="overflow-y: auto;">
          <!-- Crop Section -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">✂️ Crop</h3>
            <button onclick="initCropper()" style="width: 100%; padding: 10px; background: #4f74a3; border: none; border-radius: 6px; color: white; cursor: pointer; margin-bottom: 10px;">
              Enable Cropping
            </button>
            <button onclick="applyCrop()" style="width: 100%; padding: 10px; background: #6366f1; border: none; border-radius: 6px; color: white; cursor: pointer;">
              Apply Crop
            </button>
          </div>
          
          <!-- Filters Section -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">🎨 Filters</h3>
            
            <!-- Filter Presets -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 15px;">
              ${Object.entries(filterPresets).map(([name, filter]) => `
                <button onclick="applyFilterPreset('${name}')" 
                        style="padding: 8px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">
                  ${name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              `).join('')}
            </div>
            
            <!-- Filter Controls -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <label style="font-size: 12px; color: #888;">Brightness: <span id="brightnessValue">100</span>%</label>
                <input type="range" id="brightness" min="0" max="200" value="100" step="1" 
                       oninput="updateFilterValue('brightness', this.value)" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 12px; color: #888;">Contrast: <span id="contrastValue">100</span>%</label>
                <input type="range" id="contrast" min="0" max="200" value="100" step="1" 
                       oninput="updateFilterValue('contrast', this.value)" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 12px; color: #888;">Saturation: <span id="saturationValue">100</span>%</label>
                <input type="range" id="saturation" min="0" max="200" value="100" step="1" 
                       oninput="updateFilterValue('saturation', this.value)" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 12px; color: #888;">Hue: <span id="hueValue">0</span>°</label>
                <input type="range" id="hue" min="-180" max="180" value="0" step="1" 
                       oninput="updateFilterValue('hue', this.value)" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 12px; color: #888;">Blur: <span id="blurValue">0</span>px</label>
                <input type="range" id="blur" min="0" max="10" value="0" step="0.1" 
                       oninput="updateFilterValue('blur', this.value)" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 12px; color: #888;">Sharpen: <span id="sharpenValue">0</span></label>
                <input type="range" id="sharpen" min="0" max="2" value="0" step="0.1" 
                       oninput="updateFilterValue('sharpen', this.value)" style="width: 100%;">
              </div>
              <div>
                <label style="font-size: 12px; color: #888;">
                  <input type="checkbox" id="grayscale" onchange="updateFilterValue('grayscale', this.checked ? 1 : 0)" />
                  Grayscale
                </label>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div style="display: flex; gap: 10px;">
            <button onclick="saveImageEdits()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 600;">
              Save Changes
            </button>
            <button onclick="resetImageEdits()" style="flex: 1; padding: 12px; background: #6b7280; border: none; border-radius: 6px; color: white; cursor: pointer;">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Initialize filter values
  const currentFilters = preview.filters;
  document.getElementById('brightness').value = currentFilters.brightness * 100;
  document.getElementById('contrast').value = currentFilters.contrast * 100;
  document.getElementById('saturation').value = currentFilters.saturation * 100;
  document.getElementById('hue').value = currentFilters.hue;
  document.getElementById('blur').value = currentFilters.blur;
  document.getElementById('sharpen').value = currentFilters.sharpen;
  document.getElementById('grayscale').checked = currentFilters.grayscale === 1;
  
  updateFilterDisplays();
}

function closeImageEditor() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  document.querySelector('.modal').remove();
}

function initCropper() {
  const image = document.getElementById('editorImage');
  if (cropper) {
    cropper.destroy();
  }
  
  cropper = new Cropper(image, {
    aspectRatio: NaN,
    viewMode: 1,
    autoCropArea: 0.8,
    responsive: true,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
  });
}

function applyCrop() {
  if (!cropper) {
    msg('❌ Please enable cropping first', 'error');
    return;
  }
  
  const canvas = cropper.getCroppedCanvas();
  const preview = previewUrls[currentEditingImageIndex];
  
  canvas.toBlob(function(blob) {
    const processedUrl = URL.createObjectURL(blob);
    preview.processedUrl = processedUrl;
    document.getElementById('editorImage').src = processedUrl;
    
    // Store the cropped file for upload
    preview.processedFile = new File([blob], `cropped-${selectedFiles[currentEditingImageIndex].name}`, { 
      type: 'image/jpeg' 
    });
    
    cropper.destroy();
    cropper = null;
    msg('✅ Crop applied', 'success');
  }, 'image/jpeg', 0.9);
}

function applyFilterPreset(presetName) {
  const preset = filterPresets[presetName];
  const preview = previewUrls[currentEditingImageIndex];
  
  // Update filter values
  Object.assign(preview.filters, preset);
  
  // Update UI controls
  document.getElementById('brightness').value = preset.brightness * 100;
  document.getElementById('contrast').value = preset.contrast * 100;
  document.getElementById('saturation').value = preset.saturation * 100;
  document.getElementById('hue').value = preset.hue;
  document.getElementById('blur').value = preset.blur;
  document.getElementById('sharpen').value = preset.sharpen;
  document.getElementById('grayscale').checked = preset.grayscale === 1;
  
  updateFilterDisplays();
  applyFiltersToImage();
}

function updateFilterValue(filter, value) {
  const preview = previewUrls[currentEditingImageIndex];
  
  if (filter === 'grayscale') {
    preview.filters[filter] = value ? 1 : 0;
  } else {
    preview.filters[filter] = parseFloat(value);
    
    // Convert percentage values to multipliers
    if (['brightness', 'contrast', 'saturation'].includes(filter)) {
      preview.filters[filter] = value / 100;
    }
  }
  
  updateFilterDisplays();
  applyFiltersToImage();
}

function updateFilterDisplays() {
  const filters = previewUrls[currentEditingImageIndex].filters;
  
  document.getElementById('brightnessValue').textContent = Math.round(filters.brightness * 100);
  document.getElementById('contrastValue').textContent = Math.round(filters.contrast * 100);
  document.getElementById('saturationValue').textContent = Math.round(filters.saturation * 100);
  document.getElementById('hueValue').textContent = Math.round(filters.hue);
  document.getElementById('blurValue').textContent = filters.blur.toFixed(1);
  document.getElementById('sharpenValue').textContent = filters.sharpen.toFixed(1);
}

async function applyFiltersToImage() {
  const preview = previewUrls[currentEditingImageIndex];
  const formData = new FormData();
  formData.append('image', selectedFiles[currentEditingImageIndex]);
  formData.append('filters', JSON.stringify(preview.filters));
  
  if (cropper) {
    const cropData = cropper.getData();
    formData.append('crop', JSON.stringify(cropData));
  }
  
  try {
    const response = await fetch(`${API_URL}/api/process-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const processedUrl = URL.createObjectURL(blob);
      preview.processedUrl = processedUrl;
      document.getElementById('editorImage').src = processedUrl;
      
      // Store the processed file for upload
      preview.processedFile = new File([blob], `filtered-${selectedFiles[currentEditingImageIndex].name}`, { 
        type: 'image/jpeg' 
      });
    }
  } catch (error) {
    console.error('Filter application failed:', error);
    msg('❌ Failed to apply filters', 'error');
  }
}

function saveImageEdits() {
  const preview = previewUrls[currentEditingImageIndex];
  
  // Update the preview in the main post composer
  const previewContainer = document.getElementById('filePreviews');
  const previewImg = previewContainer.querySelectorAll('img')[currentEditingImageIndex];
  if (previewImg) {
    previewImg.src = preview.processedUrl;
  }
  
  closeImageEditor();
  msg('✅ Image edits saved', 'success');
}

function resetImageEdits() {
  const preview = previewUrls[currentEditingImageIndex];
  preview.filters = { ...filterPresets.normal };
  preview.processedUrl = preview.originalUrl;
  preview.processedFile = null;
  
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  
  document.getElementById('editorImage').src = preview.originalUrl;
  updateFilterDisplays();
  msg('🔄 Image reset to original', 'success');
}

// ... (your existing functions like showPage, loadPosts, etc. remain the same)

// UTILITY FUNCTIONS
function msg(text, type = 'info') {
  const msgDiv = document.getElementById('message');
  msgDiv.textContent = text;
  msgDiv.className = 'message ' + type;
  msgDiv.style.display = 'block';
  
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 4000);
}

function updateLiveStats() {
  const stats = ['12.5K', '8.2K', '156', '4.9★'];
  const elements = document.querySelectorAll('.stat');
  elements.forEach((el, i) => {
    el.textContent = stats[i];
  });
}

function updateLiveNotif(text) {
  const notif = document.getElementById('liveNotif');
  notif.textContent = text;
  notif.style.display = 'block';
  setTimeout(() => {
    notif.style.display = 'none';
  }, 5000);
}

function initializeSearchBar() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      if (query.length > 2) {
        performSearch(query);
      }
    });
  }
}

async function performSearch(query) {
  // Search implementation
  console.log('Searching for:', query);
}

function loadTrending() {
  // Trending implementation
}

// ... (rest of your existing functions remain unchanged)
