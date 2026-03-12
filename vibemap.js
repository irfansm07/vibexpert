// ========================================
// VIBEXPERT - COMPLETE JAVASCRIPT
// Enhanced Community Chat + All Features
// ========================================

const API_URL = 'https://vibexpert-backend-main.onrender.com';

// ── Media Proxy ────────────────────────────────────────────────────────────────
// Routes Supabase storage URLs through our Render backend to bypass Indian mobile
// carrier (Jio / Airtel / Vi) throttling/blocking of *.supabase.co domains.
function proxyMediaUrl(url) {
  if (!url) return url;
  // Only proxy Supabase storage URLs; leave everything else as-is
  if (url.includes('.supabase.co/storage/')) {
    return `${API_URL}/api/proxy/media?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// ── Rewards stub (prevents ReferenceError crash on like / post / comment) ─────
// Replace this with your real rewards logic if/when you add that feature back.
function checkAndUpdateRewards(action) {
  // no-op placeholder — add reward logic here when needed
  console.log('[Rewards] action:', action);
}


// ═══════════════════════════════════════════════════════════════════════
//  INSTITUTE COMMUNITY CHAT — SAFETY MODULE
//  ① Mandatory ghost name gate
//  ② Bad-word filter (EN + HI + regional) with 3-strike mute system
//  ③ Media safety (no videos; image upload consent warning)
// ═══════════════════════════════════════════════════════════════════════

// ── 1. Ghost-name gate ─────────────────────────────────────────────────
// Every user MUST set a ghost name before they can view or send messages.
// Real name / avatar is NEVER shown in community chat.

let _ghostName = localStorage.getItem('vx_ghost_name') || '';

function getGhostName() { return _ghostName; }

function hasGhostName() { return !!_ghostName && _ghostName.length >= 2; }

function saveGhostName(name) {
  _ghostName = (name || '').trim().slice(0, 30);
  if (_ghostName.length >= 2) {
    localStorage.setItem('vx_ghost_name', _ghostName);
    return true;
  }
  return false;
}

// Show the mandatory ghost-name setup modal and block chat until done
function requireGhostName(onSuccess) {
  if (hasGhostName()) { if (onSuccess) onSuccess(); return; }

  // Build modal if not already in DOM
  let modal = document.getElementById('ghostNameRequiredModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ghostNameRequiredModal';
    modal.style.cssText = 'display:flex;position:fixed;inset:0;z-index:20000;background:rgba(0,0,0,0.85);align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#12102a;border:1px solid rgba(167,139,250,0.3);border-radius:18px;padding:32px 28px;width:340px;max-width:92vw;box-shadow:0 32px 80px rgba(0,0,0,0.9);text-align:center;">
        <div style="font-size:44px;margin-bottom:10px;">👻</div>
        <h3 style="margin:0 0 6px;color:#a78bfa;font-size:20px;font-weight:700;">Choose Your Ghost Name</h3>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;line-height:1.5;">
          Institute Chat is <strong style="color:#a78bfa">100% anonymous</strong>.<br>
          Pick a nickname — your real name will <em>never</em> be shown.
        </p>
        <input id="ghostNameReqInput" type="text" maxlength="30" placeholder="e.g. NightOwl, CoolBean…"
          style="width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(167,139,250,0.3);color:#fff;border-radius:10px;padding:12px 14px;font-size:15px;margin-bottom:6px;box-sizing:border-box;outline:none;text-align:center;">
        <p id="ghostNameReqErr" style="color:#ff6b6b;font-size:12px;min-height:18px;margin-bottom:10px;"></p>
        <button onclick="confirmGhostName()" 
          style="width:100%;background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;color:#fff;border-radius:10px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.3px;">
          👻 Enter Chat
        </button>
        <p style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:14px;">You can change this anytime from chat settings</p>
      </div>`;
    document.body.appendChild(modal);

    // Submit on Enter
    modal.querySelector('#ghostNameReqInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmGhostName();
    });
  }

  // Store callback
  modal._onSuccess = onSuccess;
  modal.style.display = 'flex';
  setTimeout(() => modal.querySelector('#ghostNameReqInput').focus(), 100);
}

function confirmGhostName() {
  const modal = document.getElementById('ghostNameRequiredModal');
  const input = document.getElementById('ghostNameReqInput');
  const err = document.getElementById('ghostNameReqErr');
  const val = (input?.value || '').trim();

  if (!val || val.length < 2) {
    if (err) err.textContent = '⚠️ Please enter at least 2 characters.';
    return;
  }
  if (val.length > 30) {
    if (err) err.textContent = '⚠️ Max 30 characters allowed.';
    return;
  }

  // Check uniqueness via socket before saving (only if socket connected AND user has a college)
  const socketReady = typeof socket !== 'undefined' && socket && socket.connected && currentUser && currentUser.college;
  if (socketReady) {
    if (err) err.textContent = '⏳ Checking availability...';
    // Safety timeout — if server never responds, fall back to local save
    const fallbackTimer = setTimeout(() => {
      socket.off('ghost_name_result');
      saveGhostName(val);
      if (modal) modal.style.display = 'none';
      showMessage(`👻 Ghost name set: "${_ghostName}"`, 'success');
      if (modal?._onSuccess) modal._onSuccess();
    }, 4000);
    // Listen for result once
    socket.once('ghost_name_result', (result) => {
      clearTimeout(fallbackTimer);
      if (!result.success) {
        if (err) err.textContent = `❌ ${result.error}`;
        return;
      }
      saveGhostName(val);
      if (modal) modal.style.display = 'none';
      showMessage(`👻 Ghost name set: "${_ghostName}"`, 'success');
      if (modal?._onSuccess) modal._onSuccess();
    });
    socket.emit('register_ghost_name', {
      userId: currentUser.id,
      collegeName: currentUser.college,
      ghostName: val
    });
  } else {
    // Fallback: socket not connected, or user has no college yet — save locally and proceed
    saveGhostName(val);
    if (modal) modal.style.display = 'none';
    showMessage(`👻 Ghost name set: "${_ghostName}"`, 'success');
    if (modal?._onSuccess) modal._onSuccess();
  }
}

// Allow user to change ghost name from inside chat
function changeGhostName() {
  const newName = prompt('Enter new ghost name (2-30 chars):', _ghostName);
  if (newName === null) return; // cancelled
  const trimmed = newName.trim();
  if (!trimmed || trimmed.length < 2) {
    showMessage('⚠️ Too short! Min 2 characters.', 'error');
    return;
  }
  // Check uniqueness via socket
  if (typeof socket !== 'undefined' && socket && currentUser) {
    socket.once('ghost_name_result', (result) => {
      if (!result.success) {
        showMessage(`❌ ${result.error}`, 'error');
        return;
      }
      saveGhostName(trimmed);
      showMessage(`👻 Ghost name changed to "${_ghostName}"`, 'success');
    });
    socket.emit('register_ghost_name', {
      userId: currentUser.id,
      collegeName: currentUser.college,
      ghostName: trimmed
    });
  } else {
    saveGhostName(trimmed);
    showMessage(`👻 Ghost name changed to "${_ghostName}"`, 'success');
  }
}


// ── 2. Bad-word filter + 3-strike mute system ─────────────────────────

// Strike state persisted in localStorage
const CHAT_STRIKE_KEY = 'vx_chat_strikes';
const CHAT_MUTE_KEY = 'vx_chat_muted_until';
const MAX_STRIKES = 3;
const MUTE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getChatStrikes() {
  try { return parseInt(localStorage.getItem(CHAT_STRIKE_KEY) || '0', 10); } catch { return 0; }
}
function addChatStrike() {
  const s = Math.min(getChatStrikes() + 1, MAX_STRIKES);
  localStorage.setItem(CHAT_STRIKE_KEY, String(s));
  if (s >= MAX_STRIKES) {
    const muteUntil = Date.now() + MUTE_DURATION_MS;
    localStorage.setItem(CHAT_MUTE_KEY, String(muteUntil));
    localStorage.setItem(CHAT_STRIKE_KEY, '0'); // reset after mute
  }
  return s;
}
function isChatMuted() {
  try {
    const until = parseInt(localStorage.getItem(CHAT_MUTE_KEY) || '0', 10);
    if (!until) return false;
    if (Date.now() < until) return true;
    // Mute expired — clean up
    localStorage.removeItem(CHAT_MUTE_KEY);
    return false;
  } catch { return false; }
}
function muteTimeLeft() {
  try {
    const until = parseInt(localStorage.getItem(CHAT_MUTE_KEY) || '0', 10);
    if (!until) return '';
    const ms = until - Date.now();
    if (ms <= 0) return '';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  } catch { return ''; }
}

// ── Banned word list ───────────────────────────────────────────────────
// Covers: English, Hindi (roman), Punjabi, Tamil, Telugu, Kannada,
//         Malayalam, Bengali, Marathi + universal family slurs
const BANNED_WORDS = [
  // ── English profanity ──
  'fuck', 'f u c k', 'fucker', 'fucking', 'fucked', 'fucks', 'motherfucker', 'motherfucking',
  'shit', 'shits', 'shitty', 'bullshit', 'horseshit', 'apeshit',
  'bitch', 'bitches', 'bitching', 'son of a bitch',
  'asshole', 'ass hole', 'arsehole', 'arse',
  'cunt', 'cunts', 'crap', 'crappy',
  'dick', 'dicks', 'dickhead', 'cock', 'cocks', 'cocksucker',
  'pussy', 'pussies', 'whore', 'slut', 'slutty',
  'bastard', 'bastards', 'nigger', 'nigga', 'faggot', 'fag', 'dyke',
  'retard', 'retarded', 'spastic', 'twat', 'wanker', 'jerk off', 'jackass',
  'piss', 'pissed', 'pissing', 'damn', 'damnit', 'goddamn', 'hell yeah',
  'nude', 'naked', 'nudes', 'sex', 'sexy', 'porn', 'porno', 'hentai', 'xxx',
  'boobs', 'boob', 'tits', 'tit', 'penis', 'vagina', 'erotic', 'orgasm',
  // ── Family slurs (EN) ──
  'your mother', 'ur mother', 'yo mama', 'your mama', 'your mom', 'ur mom',
  'your father', 'ur father', 'your dad', 'ur dad',
  'your sister', 'ur sister', 'your sis',

  // ── Hindi / Urdu (roman) ──
  'madarchod', 'madar chod', 'maa ki aankh', 'maa ka', 'teri maa', 'teri ma',
  'teri maa ki', 'bhen chod', 'bhen ki aankh', 'behenchod', 'behen chod',
  'bhosdi', 'bhosda', 'bhosdike', 'chutiya', 'chut', 'chut ki',
  'gaand', 'gaandu', 'gandu', 'lund', 'loda', 'lauda', 'lawda', 'lundbaaz',
  'randi', 'raand', 'rand', 'harami', 'haraami', 'suwar', 'suar', 'kutte',
  'kamine', 'kamina', 'kaminey', 'saala', 'saali', 'haramzada', 'haramzadi',
  'maa chod', 'baap chod', 'bap chod', 'teri maa ko', 'teri behan ko',
  // Family slurs (HI roman)
  'teri maa', 'tera baap', 'teri behen', 'teri behan', 'tera bap',
  'maa', 'mata', 'maa ko', 'behen ko', 'behan ko', 'baap ko', 'bap ko',

  // ── Punjabi (roman) ──
  'teri maa di', 'teri pen di', 'pen di lun', 'maa di', 'penchod',
  'pen chod', 'teri pen', 'tera pyo', 'tere pyo', 'tenu', 'kutta',

  // ── Tamil (roman transliteration) ──
  'ommala', 'omala', 'punda', 'otha', 'thevidiya', 'mayiru', 'sunni', 'poolu',
  'thevdiya', 'koothi', 'puluthi', 'naaye', 'naai', 'loosu',
  // Family (Tamil)
  'amma', 'appan', 'akka', 'thangachi', 'anni',

  // ── Telugu (roman) ──
  'dengu', 'dengey', 'lanja', 'pooku', 'modda', 'gudda', 'naayala', 'sala',
  'baadu', 'nee amma', 'nee amma ki', 'nee amma tho',
  // Family (Telugu)
  'amma', 'nana', 'akka', 'atta',

  // ── Kannada (roman) ──
  'sule', 'sulemagane', 'holemagane', 'tika', 'ninna amma', 'nin taayi',
  'taayi', 'thaayi', 'akka', 'tangi',

  // ── Malayalam (roman) ──
  'myru', 'myiru', 'poorr', 'pooru', 'kunna', 'kunni', 'patti',
  'ammayude', 'ammaye', 'achan', 'chechi', 'ammachi',

  // ── Bengali (roman) ──
  'magi', 'boga', 'khanki', 'shala', 'khankir chele', 'chele', 'maa ke',
  'tor ma', 'tor baap', 'tor bon', 'tor didi',

  // ── Marathi (roman) ──
  'aai zava', 'aai zhav', 'bhadwa', 'bhadwi', 'rand', 'raand', 'haram',
  'aai ga', 'aai chi', 'bai cha', 'bai chi',

  // ── Universal ──
  'nude send', 'send nudes', 'send pic', 'naughty pic', 'dirty pic',
  '18+', 'adult content', 'explicit', 'nsfw',
];

// Pre-process list: sort longest first, normalize
const _BANNED_SORTED = [...new Set(BANNED_WORDS.map(w => w.toLowerCase().trim()))]
  .sort((a, b) => b.length - a.length);

/**
 * Check text for banned words.
 * Returns { clean: false, word: 'foundWord' } or { clean: true }
 */
function checkBannedWords(text) {
  if (!text || typeof text !== 'string') return { clean: true };
  // Normalize: lowercase, collapse multiple spaces, remove common obfuscation chars
  const normalized = text.toLowerCase()
    .replace(/[@4]/g, 'a').replace(/[3]/g, 'e').replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o').replace(/[5\$]/g, 's').replace(/[7]/g, 't')
    .replace(/[+]/g, 't').replace(/\*/g, '').replace(/\./g, '')
    .replace(/\s+/g, ' ');

  for (const word of _BANNED_SORTED) {
    // Use word-boundary-aware check (allow partial for multi-word phrases)
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = word.includes(' ')
      ? new RegExp(escaped, 'i')
      : new RegExp(`(?:^|[^a-z])${escaped}(?:[^a-z]|$)`, 'i');
    if (rx.test(normalized)) return { clean: false, word };
  }
  return { clean: true };
}

/**
 * Called before every message send in community chat.
 * Returns true if the message can be sent, false if blocked.
 */
function communitySafetyCheck(text) {
  // ── Mute check ──────────────────────────────────────────────────────
  if (isChatMuted()) {
    const left = muteTimeLeft();
    showCommunityMutedBanner(left);
    return false;
  }

  // ── Bad-word check ───────────────────────────────────────────────────
  const result = checkBannedWords(text);
  if (!result.clean) {
    const strikes = addChatStrike();
    const remaining = MAX_STRIKES - strikes;

    if (isChatMuted()) {
      // Just got 3rd strike → now muted
      showMessage(
        `🚫 You have been muted for 24 hours due to repeated use of banned language.`,
        'error', 8000
      );
      showCommunityMutedBanner(muteTimeLeft());
    } else {
      // 1st or 2nd strike warning
      const icon = strikes === 1 ? '⚠️' : '🔴';
      const label = strikes === 1 ? 'Warning' : 'Final Warning';
      showMessage(
        `${icon} ${label} (Strike ${strikes}/${MAX_STRIKES}): Message contains banned language. ` +
        `${remaining > 0 ? remaining + ' strike(s) left before 24h mute.' : ''}`,
        'error', 7000
      );
    }
    return false;
  }
  return true;
}

function showCommunityMutedBanner(timeLeft) {
  const existing = document.getElementById('chatMutedBanner');
  if (existing) return;
  const banner = document.createElement('div');
  banner.id = 'chatMutedBanner';
  banner.style.cssText = `position:absolute;bottom:0;left:0;right:0;background:#3d0000;
    color:#ff9999;padding:14px 18px;text-align:center;font-size:13px;
    font-weight:600;z-index:999;border-top:1px solid rgba(255,50,50,0.3);`;
  banner.innerHTML = `🔇 You are muted for <strong>${timeLeft || '24h'}</strong> due to repeated violations. You can read but not send messages.`;
  const chatArea = document.querySelector('.whatsapp-container') || document.getElementById('communityChatState');
  if (chatArea) chatArea.style.position = 'relative', chatArea.appendChild(banner);
}


// ── 3. Media safety for community chat ────────────────────────────────
// Videos are BLOCKED. Images require an explicit consent warning.

let _imageConsentAcknowledged = sessionStorage.getItem('vx_img_consent') === '1';

/**
 * Call this before allowing image upload in community chat.
 * Returns a promise that resolves true (agreed) or false (cancelled).
 */
function requireImageConsent() {
  if (_imageConsentAcknowledged) return Promise.resolve(true);

  return new Promise(resolve => {
    let modal = document.getElementById('imgConsentModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'imgConsentModal';
      modal.style.cssText = 'display:flex;position:fixed;inset:0;z-index:20001;background:rgba(0,0,0,0.85);align-items:center;justify-content:center;';
      modal.innerHTML = `
        <div style="background:#12102a;border:1px solid rgba(255,165,0,0.3);border-radius:16px;padding:28px;width:330px;max-width:92vw;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">📎</div>
          <h3 style="margin:0 0 8px;color:#fbbf24;font-size:17px;">Media Upload Warning</h3>
          <p style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;margin-bottom:18px;">
            By uploading this file you confirm it does <strong style="color:#fff">NOT</strong> contain:<br>
            🔞 18+ / adult / explicit content<br>
            🚫 Nudity or sexual imagery<br>
            ⚠️ Harassment or offensive material<br><br>
            Violations will result in a <strong style="color:#ff9999">permanent ban</strong>.
          </p>
          <div style="display:flex;gap:10px;">
            <button id="imgConsentAgree"
              style="flex:1;background:linear-gradient(135deg,#15803d,#22c55e);border:none;color:#fff;border-radius:10px;padding:11px;font-weight:700;cursor:pointer;">
              ✅ I Agree
            </button>
            <button id="imgConsentCancel"
              style="flex:1;background:rgba(255,255,255,0.08);border:none;color:#fff;border-radius:10px;padding:11px;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    modal._resolve = resolve;

    document.getElementById('imgConsentAgree').onclick = () => {
      _imageConsentAcknowledged = true;
      sessionStorage.setItem('vx_img_consent', '1');
      modal.style.display = 'none';
      resolve(true);
    };
    document.getElementById('imgConsentCancel').onclick = () => {
      modal.style.display = 'none';
      resolve(false);
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════
//  END SAFETY MODULE
// ═══════════════════════════════════════════════════════════════════════

// Emoji Picker Functions
let currentEmojiCategory = 'emotions';
let emojiPickerVisible = false;

function toggleEmojiPicker() {
  const emojiPicker = document.getElementById('emojiPicker');
  emojiPickerVisible = !emojiPickerVisible;

  if (emojiPickerVisible) {
    emojiPicker.style.display = 'block';
    loadEmojiCategory(currentEmojiCategory);
  } else {
    emojiPicker.style.display = 'none';
  }
}

function showEmojiCategory(category, event) {
  currentEmojiCategory = category;

  // Update active category button
  const categoryButtons = document.querySelectorAll('.emoji-category');
  categoryButtons.forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }

  loadEmojiCategory(category);
}

function loadEmojiCategory(category) {
  const emojiGrid = document.getElementById('emojiGrid');
  if (!emojiGrid) return;

  const emojis = stickerLibrary[category] || [];

  emojiGrid.innerHTML = '';
  emojis.forEach(emoji => {
    const emojiButton = document.createElement('button');
    emojiButton.className = 'emoji-item';
    if (emoji.type === 'gif') {
      emojiButton.classList.add('gif');
    } else if (emoji.type === 'sticker') {
      emojiButton.classList.add('sticker');
    }
    emojiButton.textContent = emoji.emoji;
    emojiButton.title = emoji.name;
    emojiButton.onclick = () => insertEmoji(emoji.emoji, emoji.type);
    emojiGrid.appendChild(emojiButton);
  });
}

function insertEmoji(emoji, type = 'emoji') {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;

  const currentValue = chatInput.value;
  const cursorPosition = chatInput.selectionStart;
  let insertText = emoji;

  // Add special formatting for GIFs and stickers
  if (type === 'gif') {
    insertText = `[GIF:${emoji}]`;
  } else if (type === 'sticker') {
    insertText = `[STICKER:${emoji}]`;
  }

  const newValue = currentValue.slice(0, cursorPosition) + insertText + currentValue.slice(cursorPosition);

  chatInput.value = newValue;
  chatInput.focus();

  // Set cursor position after the inserted emoji
  const newCursorPosition = cursorPosition + insertText.length;
  chatInput.setSelectionRange(newCursorPosition, newCursorPosition);

  // Hide emoji picker after selection
  toggleEmojiPicker();
}

// Close emoji picker when clicking outside
document.addEventListener('click', function (event) {
  const emojiPicker = document.getElementById('emojiPicker');
  const emojiBtn = document.querySelector('.emoji-btn');

  if (emojiPickerVisible &&
    !emojiPicker.contains(event.target) &&
    !emojiBtn.contains(event.target)) {
    emojiPicker.style.display = 'none';
    emojiPickerVisible = false;
  }
});

// Voice Recording Functions
let voiceRecorder = null;
let voiceRecordingStartTime = null;
let voiceRecordingTimer = null;
let voiceRecordingStream = null;
let voiceAudioChunks = [];
let isVoiceRecording = false;

function toggleVoiceRecording() {
  if (isVoiceRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

async function startVoiceRecording() {
  try {
    // Request microphone access
    voiceRecordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    voiceRecorder = new MediaRecorder(voiceRecordingStream);
    voiceAudioChunks = [];

    voiceRecorder.ondataavailable = (event) => {
      voiceAudioChunks.push(event.data);
    };

    voiceRecorder.onstop = () => {
      const audioBlob = new Blob(voiceAudioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create voice message element
      const voiceMessage = {
        type: 'voice',
        url: audioUrl,
        duration: Math.floor((Date.now() - voiceRecordingStartTime) / 1000),
        timestamp: new Date().toISOString()
      };

      // Send voice message
      sendVoiceMessage(voiceMessage);
    };

    // Start recording
    voiceRecorder.start();
    voiceRecordingStartTime = Date.now();
    isVoiceRecording = true;

    // Update UI
    const voiceBtn = document.querySelector('.voice-btn');
    const voiceRecorderEl = document.getElementById('voiceRecorder');
    const voiceTimer = document.querySelector('.voice-timer');

    voiceBtn.classList.add('recording');
    voiceRecorderEl.style.display = 'block';

    // Start timer
    voiceRecordingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - voiceRecordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      voiceTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);

  } catch (error) {
    console.error('Voice recording error:', error);
    showMessage('🎤 Microphone access denied', 'error');
  }
}

function stopVoiceRecording() {
  if (voiceRecorder && voiceRecorder.state !== 'inactive') {
    voiceRecorder.stop();
  }

  if (voiceRecordingStream) {
    voiceRecordingStream.getTracks().forEach(track => track.stop());
  }

  if (voiceRecordingTimer) {
    clearInterval(voiceRecordingTimer);
  }

  // Reset UI
  const voiceBtn = document.querySelector('.voice-btn');
  const voiceRecorderEl = document.getElementById('voiceRecorder');
  const voiceTimer = document.querySelector('.voice-timer');

  voiceBtn.classList.remove('recording');
  voiceRecorderEl.style.display = 'none';
  voiceTimer.textContent = '00:00';

  isVoiceRecording = false;
}

function cancelVoiceRecording() {
  stopVoiceRecording();
  voiceAudioChunks = [];
}

function sendVoiceMessage(voiceMessage) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message right';

  const durationMinutes = Math.floor(voiceMessage.duration / 60);
  const durationSeconds = voiceMessage.duration % 60;
  const durationText = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  messageEl.innerHTML = `
    <div class="text">
      <div class="voice-message-player">
        <button class="voice-play-btn" onclick="playVoiceMessage('${voiceMessage.url}', this)">▶️</button>
        <div class="voice-info">
          <div class="voice-duration">🎤 Voice message • ${durationText}</div>
          <div class="voice-waveform">
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
          </div>
        </div>
      </div>
      <audio src="${voiceMessage.url}" style="display:none;"></audio>
    </div>
    <div class="message-time">${formatTime(new Date(voiceMessage.timestamp))}</div>
  `;

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Simulate sending to server
  console.log('Voice message sent:', voiceMessage);
}

function playVoiceMessage(audioUrl, playBtn) {
  const audioEl = playBtn.parentElement.nextElementSibling;

  if (audioEl.paused) {
    // Stop any other playing audio
    document.querySelectorAll('audio').forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        const otherBtn = audio.previousElementSibling.querySelector('.voice-play-btn');
        if (otherBtn) otherBtn.textContent = '▶️';
      }
    });

    audioEl.play();
    playBtn.textContent = '⏸️';

    audioEl.onended = () => {
      playBtn.textContent = '▶️';
    };
  } else {
    audioEl.pause();
    playBtn.textContent = '▶️';
  }
}

// Avatar Animation Functions
function handleAvatarMove(event, avatarId) {
  const avatar = document.getElementById(avatarId);
  if (!avatar) return;

  const input = event.target;
  const rect = input.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate position relative to input
  const maxX = rect.width - 40;
  const maxY = rect.height - 40;

  // Constrain movement within input bounds
  const constrainedX = Math.max(0, Math.min(x - 20, maxX));
  const constrainedY = Math.max(0, Math.min(y - 20, maxY));

  // Apply smooth movement
  avatar.style.transform = `translate(${constrainedX - maxX}px, ${constrainedY - 20}px) scale(1.1)`;
  avatar.style.transition = 'transform 0.1s ease-out';
}

function resetAvatar(avatarId) {
  const avatar = document.getElementById(avatarId);
  if (!avatar) return;

  avatar.style.transform = 'translateY(-50%) scale(1)';
  avatar.style.transition = 'transform 0.3s ease-out';
}

function handleInputChange(inputId) {
  const input = document.getElementById(inputId);
  const avatarId = inputId + 'Avatar';
  const avatar = document.getElementById(avatarId);

  if (!avatar) return;

  const value = input.value.trim();
  const minLength = input.type === 'email' ? 5 : 6;

  // Remove existing states
  avatar.classList.remove('happy', 'excited');

  if (value.length >= minLength) {
    // Check if email is valid or password is strong enough
    if (input.type === 'email' && value.includes('@') && value.includes('.')) {
      avatar.classList.add('excited');
      avatar.textContent = '🎉';
    } else if (input.type === 'password' && value.length >= 8) {
      avatar.classList.add('excited');
      avatar.textContent = '🔥';
    } else if (value.length >= minLength) {
      avatar.classList.add('happy');
      if (input.type === 'email') {
        avatar.textContent = '😊';
      } else if (input.type === 'password') {
        avatar.textContent = '😄';
      }
    }
  } else {
    // Reset to original emoji
    if (inputId.includes('Email')) {
      avatar.textContent = inputId.includes('login') ? '👁️' : '📧';
    } else if (inputId.includes('Password')) {
      avatar.textContent = inputId.includes('login') ? '🔒' : '🔐';
    } else if (inputId.includes('Confirm')) {
      avatar.textContent = '✅';
    }
  }
}

// Global Variables
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
let hasScrolledToBottom = false;
let scrollCheckEnabled = true;
let scrollProgressIndicator = null;

// ENHANCED CHAT VARIABLES
let typingUsers = new Set();
let typingTimeout = null;
let lastTypingEmit = 0;
let messageReactions = new Map();
let hasMoreMessages = true;
let currentMessagePage = 1;
let lastMessageTime = Date.now();
let connectionStatus = 'connected';
let chatInitialized = false;

// Data
const vibeshopData = {
  items: []
};

const musicLibrary = [
  // ── Chill / LoFi ──
  { id: 1, name: "Chill Vibes", artist: "LoFi Beats", duration: "2:30", url: "https://assets.mixkit.co/music/preview/mixkit-chill-vibes-239.mp3", emoji: "🎧" },
  { id: 2, name: "Tech House Vibes", artist: "LoFi House", duration: "2:52", url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3", emoji: "🎧" },
  { id: 3, name: "Dreamy Piano", artist: "Classical", duration: "2:45", url: "https://assets.mixkit.co/music/preview/mixkit-dreamy-piano-1171.mp3", emoji: "🎹" },
  { id: 4, name: "Laid Back Afternoon", artist: "Chillhop", duration: "2:41", url: "https://assets.mixkit.co/music/preview/mixkit-laid-back-afternoon-132.mp3", emoji: "🌅" },
  { id: 5, name: "Deep in the Groove", artist: "LoFi Soul", duration: "2:43", url: "https://assets.mixkit.co/music/preview/mixkit-deep-in-the-groove-141.mp3", emoji: "🎵" },
  // ── Upbeat / Pop ──
  { id: 6, name: "Upbeat Energy", artist: "Electronic Pop", duration: "3:15", url: "https://assets.mixkit.co/music/preview/mixkit-upbeat-energy-225.mp3", emoji: "⚡" },
  { id: 7, name: "Happy Day", artist: "Pop Rock", duration: "2:50", url: "https://assets.mixkit.co/music/preview/mixkit-happy-day-583.mp3", emoji: "😊" },
  { id: 8, name: "Feel the Good Stuff", artist: "Pop Vibes", duration: "2:28", url: "https://assets.mixkit.co/music/preview/mixkit-feel-the-good-stuff-214.mp3", emoji: "🌟" },
  { id: 9, name: "Infectious Bounce", artist: "Pop Funk", duration: "2:19", url: "https://assets.mixkit.co/music/preview/mixkit-infectious-bounce-547.mp3", emoji: "🎉" },
  { id: 10, name: "Pop Melodic Happy", artist: "Pop", duration: "2:30", url: "https://assets.mixkit.co/music/preview/mixkit-pop-melodic-and-happy-567.mp3", emoji: "🎶" },
  // ── Summer / Tropical ──
  { id: 11, name: "Summer Vibes", artist: "Tropical", duration: "3:30", url: "https://assets.mixkit.co/music/preview/mixkit-summer-vibes-129.mp3", emoji: "🏖️" },
  { id: 12, name: "Beach Party", artist: "Tropical Pop", duration: "2:09", url: "https://assets.mixkit.co/music/preview/mixkit-beach-party-244.mp3", emoji: "🏝️" },
  { id: 13, name: "Caribbean Steel Pan", artist: "Caribbean", duration: "2:14", url: "https://assets.mixkit.co/music/preview/mixkit-caribbean-steel-pan-beats-284.mp3", emoji: "🥁" },
  { id: 14, name: "Tropical Fun", artist: "Tropical", duration: "2:02", url: "https://assets.mixkit.co/music/preview/mixkit-tropical-fun-and-cute-143.mp3", emoji: "🌴" },
  // ── Acoustic / Guitar ──
  { id: 15, name: "Relaxing Guitar", artist: "Acoustic", duration: "3:10", url: "https://assets.mixkit.co/music/preview/mixkit-relaxing-guitar-243.mp3", emoji: "🎸" },
  { id: 16, name: "Acoustic Breeze", artist: "Acoustic Folk", duration: "2:31", url: "https://assets.mixkit.co/music/preview/mixkit-acoustic-breeze-2182.mp3", emoji: "🌿" },
  { id: 17, name: "Light and Cheerful", artist: "Acoustic Pop", duration: "2:08", url: "https://assets.mixkit.co/music/preview/mixkit-light-and-cheerful-5063.mp3", emoji: "☀️" },
  // ── Cinematic / Emotional ──
  { id: 18, name: "Cinematic Drama", artist: "Cinematic", duration: "3:02", url: "https://assets.mixkit.co/music/preview/mixkit-cinematic-drama-opener-607.mp3", emoji: "🎬" },
  { id: 19, name: "Epic Adventure", artist: "Cinematic", duration: "2:16", url: "https://assets.mixkit.co/music/preview/mixkit-epic-adventure-436.mp3", emoji: "⚔️" },
  { id: 20, name: "Motivational Trailer", artist: "Trailer", duration: "1:59", url: "https://assets.mixkit.co/music/preview/mixkit-motivational-epic-trailer-568.mp3", emoji: "🚀" },
  { id: 21, name: "Emotional Drive", artist: "Emotional Pop", duration: "2:40", url: "https://assets.mixkit.co/music/preview/mixkit-emotional-drive-600.mp3", emoji: "💫" },
  { id: 22, name: "Inspirational Journey", artist: "Orchestral", duration: "2:52", url: "https://assets.mixkit.co/music/preview/mixkit-inspirational-journey-560.mp3", emoji: "🌠" },
  // ── Electronic / Dance ──
  { id: 23, name: "Electro Camel", artist: "EDM", duration: "2:18", url: "https://assets.mixkit.co/music/preview/mixkit-electro-camel-229.mp3", emoji: "🐪" },
  { id: 24, name: "Funky Loop", artist: "Funk EDM", duration: "2:34", url: "https://assets.mixkit.co/music/preview/mixkit-funky-loop-575.mp3", emoji: "🕺" },
  { id: 25, name: "Dance Party", artist: "Club", duration: "2:27", url: "https://assets.mixkit.co/music/preview/mixkit-dance-party-233.mp3", emoji: "💃" },
  { id: 26, name: "Trance Music", artist: "Trance", duration: "2:20", url: "https://assets.mixkit.co/music/preview/mixkit-trance-music-121.mp3", emoji: "🌀" },
  { id: 27, name: "Fast Bouncing EDM", artist: "EDM", duration: "2:02", url: "https://assets.mixkit.co/music/preview/mixkit-fast-bouncing-edm-track-2272.mp3", emoji: "⚡" },
  // ── Hip-Hop / Trap ──
  { id: 28, name: "Hip Hop Vibes", artist: "Hip-Hop", duration: "2:45", url: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3", emoji: "🎤" },
  { id: 29, name: "Trap Vibe", artist: "Trap", duration: "2:18", url: "https://assets.mixkit.co/music/preview/mixkit-trap-vibe-2228.mp3", emoji: "🔥" },
  { id: 30, name: "Driving Hip Hop", artist: "Hip-Hop", duration: "2:01", url: "https://assets.mixkit.co/music/preview/mixkit-driving-hip-hop-track-571.mp3", emoji: "🚗" },
  { id: 31, name: "B-Boy Hip Hop", artist: "Breakbeat", duration: "2:08", url: "https://assets.mixkit.co/music/preview/mixkit-b-boy-hip-hop-beat-2295.mp3", emoji: "💥" },
  // ── Jazz / Soul ──
  { id: 32, name: "Cool Jazz", artist: "Jazz", duration: "2:30", url: "https://assets.mixkit.co/music/preview/mixkit-cool-jazz-2192.mp3", emoji: "🎷" },
  { id: 33, name: "Saxophone Jazz Lounge", artist: "Jazz Fusion", duration: "2:44", url: "https://assets.mixkit.co/music/preview/mixkit-saxophone-jazz-lounge-2196.mp3", emoji: "🎺" },
  { id: 34, name: "Jazz in Paris", artist: "French Jazz", duration: "2:18", url: "https://assets.mixkit.co/music/preview/mixkit-jazz-in-paris-2200.mp3", emoji: "🗼" },
  // ── Ambient / Study ──
  { id: 35, name: "Slow Mellow Groove", artist: "Ambient", duration: "2:29", url: "https://assets.mixkit.co/music/preview/mixkit-slow-mellow-groove-2308.mp3", emoji: "🌙" },
  { id: 36, name: "Soft Note", artist: "Ambient Piano", duration: "2:36", url: "https://assets.mixkit.co/music/preview/mixkit-soft-note-559.mp3", emoji: "🌌" },
  { id: 37, name: "Blissful Memory", artist: "Ambient", duration: "2:39", url: "https://assets.mixkit.co/music/preview/mixkit-blissful-memory-557.mp3", emoji: "✨" },
  { id: 38, name: "Deep Sea Ambient", artist: "Ambient", duration: "2:38", url: "https://assets.mixkit.co/music/preview/mixkit-deep-sea-ambient-2220.mp3", emoji: "🌊" },
  { id: 39, name: "Forest Lullaby", artist: "Nature", duration: "2:30", url: "https://assets.mixkit.co/music/preview/mixkit-forest-lullaby-4128.mp3", emoji: "🌲" },
  // ── Fun / Ukulele ──
  { id: 40, name: "Funny Ukulele", artist: "Ukulele", duration: "2:01", url: "https://assets.mixkit.co/music/preview/mixkit-funny-ukulele-579.mp3", emoji: "🪗" },
  { id: 41, name: "Happy Whistling", artist: "Whistler", duration: "2:10", url: "https://assets.mixkit.co/music/preview/mixkit-happy-whistling-596.mp3", emoji: "🎵" },
  { id: 42, name: "Playful Cat", artist: "Quirky", duration: "1:51", url: "https://assets.mixkit.co/music/preview/mixkit-playful-cat-541.mp3", emoji: "🐱" },
  { id: 43, name: "Cheerful Kids Song", artist: "Kids Pop", duration: "1:53", url: "https://assets.mixkit.co/music/preview/mixkit-cheerful-kids-song-1029.mp3", emoji: "🌈" },
  // ── Rock ──
  { id: 44, name: "Rock Guitar", artist: "Rock", duration: "2:10", url: "https://assets.mixkit.co/music/preview/mixkit-rock-guitar-solo-583.mp3", emoji: "🤘" },
  { id: 45, name: "Driving Rock", artist: "Hard Rock", duration: "2:11", url: "https://assets.mixkit.co/music/preview/mixkit-driving-rock-584.mp3", emoji: "🎸" },
  { id: 46, name: "Loud Engines Rock", artist: "Punk Rock", duration: "2:23", url: "https://assets.mixkit.co/music/preview/mixkit-loud-engines-rock-585.mp3", emoji: "🔊" },
  // ── Romantic / Soft ──
  { id: 47, name: "Romantic Piano", artist: "Romantic", duration: "2:23", url: "https://assets.mixkit.co/music/preview/mixkit-romantic-piano-554.mp3", emoji: "💕" },
  { id: 48, name: "Beautiful Wedding", artist: "Orchestral", duration: "2:27", url: "https://assets.mixkit.co/music/preview/mixkit-beautiful-wedding-584.mp3", emoji: "💒" },
  // ── India / Fusion ──
  { id: 49, name: "Tabla Groove", artist: "Indian Fusion", duration: "2:18", url: "https://assets.mixkit.co/music/preview/mixkit-tabla-groove-4055.mp3", emoji: "🪘" },
  { id: 50, name: "Indian Folk Music", artist: "Folk", duration: "2:09", url: "https://assets.mixkit.co/music/preview/mixkit-indian-folk-music-4072.mp3", emoji: "🎻" },
  { id: 51, name: "Relaxing Kalimba", artist: "World Music", duration: "2:22", url: "https://assets.mixkit.co/music/preview/mixkit-relaxing-kalimba-589.mp3", emoji: "🎶" },
  // ── Extra Chill ──
  { id: 52, name: "Midnight Whispers", artist: "Chill Pop", duration: "2:33", url: "https://assets.mixkit.co/music/preview/mixkit-midnight-whispers-2181.mp3", emoji: "🌃" },
  { id: 53, name: "Life is a Game", artist: "Indie Pop", duration: "2:21", url: "https://assets.mixkit.co/music/preview/mixkit-life-is-a-game-579.mp3", emoji: "🎮" },
];

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
  ]
};

const colleges = {
  nit: [
    { name: 'NIT Bhopal', email: '@stu.manit.ac.in', location: 'Bhopal' },
    { name: 'NIT Bhopal', email: '@gmail.com', location: 'Bhopal' },
    { name: 'NIT Rourkela', email: '@nitrkl.ac.in', location: 'Rourkela' },
    { name: 'NIT Warangal', email: '@nitw.ac.in', location: 'Warangal' },
    { name: 'NIT Trichy', email: '@nitt.edu', location: 'Trichy' },
    { name: 'NIT Surathkal', email: '@nitk.edu.in', location: 'Surathkal' }
  ],
  iit: [
    { name: 'IIT Delhi', email: '@iitd.ac.in', location: 'New Delhi' },
    { name: 'IIT Bombay', email: '@iitb.ac.in', location: 'Mumbai' },
    { name: 'IIT Madras', email: '@iitm.ac.in', location: 'Chennai' },
    { name: 'IIT Kharagpur', email: '@kgp.iitkgp.ac.in', location: 'Kharagpur' },
    { name: 'IIT Kanpur', email: '@iitk.ac.in', location: 'Kanpur' }
  ],
  vit: [
    { name: 'VIT Bhopal', email: '@vitbhopal.ac.in', location: 'Bhopal' },
    { name: 'VIT Vellore', email: '@vit.ac.in', location: 'Vellore' },
    { name: 'VIT Chennai', email: '@vit.ac.in', location: 'Chennai' }
  ],
  other: [
    { name: 'Delhi University', email: '@du.ac.in', location: 'New Delhi' },
    { name: 'Mumbai University', email: '@mu.ac.in', location: 'Mumbai' },
    { name: 'BITS Pilani', email: '@pilani.bits-pilani.ac.in', location: 'Pilani' }
  ]
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 VibeXpert initializing...');

  const token = getToken();
  const saved = localStorage.getItem('user');

  if (token && saved) {
    try {
      currentUser = JSON.parse(saved);

      // Only show main page if user is properly authenticated
      if (currentUser && currentUser.username) {
        document.body.classList.add('logged-in');
        const aboutPage = document.getElementById('aboutUsPage');
        const mainPage = document.getElementById('mainPage');
        const authPopup = document.getElementById('authPopup');

        // Hide login/about page and show main page
        if (aboutPage) aboutPage.style.display = 'none';
        if (mainPage) mainPage.style.display = 'block';
        if (authPopup) authPopup.style.display = 'none';

        const userName = document.getElementById('userName');
        if (userName) userName.textContent = 'Hi, ' + currentUser.username;

        if (currentUser.college) {
          updateLiveNotif(`Connected to ${currentUser.college}`);
          initializeSocket();
        }
        // Load home feed on startup
        setTimeout(() => loadHomeFeed(), 300);
      } else {
        // Invalid user data, show login
        showAboutUsPage();
      }
    } catch (e) {
      console.error('Parse error:', e);
      localStorage.clear();
      showAboutUsPage();
    }
  } else {
    showAboutUsPage();
  }

  setupEventListeners();
  initializeMusicPlayer();
  updateLiveStats();
  setInterval(updateLiveStats, 5000);
  initializeSearchBar();
  loadTrending();
  console.log('✅ Initialized');
});

// ========================================
// ABOUT US PAGE FUNCTIONALITY
// ========================================

function showAboutUsPage() {
  document.body.classList.remove('logged-in');
  const aboutPage = document.getElementById('aboutUsPage');
  const mainPage = document.getElementById('mainPage');
  if (aboutPage) aboutPage.style.display = 'block';
  if (mainPage) mainPage.style.display = 'none';

  initRevealOnScroll();
  initStatsCounter();
  initScrollDetection();
}

function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(element => revealObserver.observe(element));
}

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let hasAnimated = false;
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-count'));
          animateCounter(stat, 0, target, 2000);
        });
      }
    });
  }, { threshold: 0.5 });
  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) statsObserver.observe(statsSection);
}

function animateCounter(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 30);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

function initScrollDetection() {
  window.addEventListener('scroll', checkScrollPosition);
}

function checkScrollPosition() {
  if (!scrollCheckEnabled || hasScrolledToBottom) return;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;
  const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
  if (scrollPercentage >= 95) {
    hasScrolledToBottom = true;
    scrollCheckEnabled = false;
    showAuthPopupAutomatic();
  }
}

function showAuthPopupAutomatic() {
  console.log('🎉 User reached bottom');
  showAuthPopup();
  createConfetti();
}

function scrollToBottomAndLogin() {
  // Scroll to bottom of page
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  });

  // Wait for scroll to complete, then show login popup
  setTimeout(() => {
    showAuthPopup();
  }, 1000);
}

function showAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.add('show');
    authPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    initBlobEyeTracking();
    initPasswordEyeClosing(); // Make characters close eyes when typing password
  }
}

// ========================================
// BLOB EYE TRACKING ANIMATION
// ========================================
function initBlobEyeTracking() {
  const authPopup = document.getElementById('authPopup');
  const svg = authPopup?.querySelector('.auth-characters-svg');
  if (!svg) return;

  // Remove old listener if present
  if (authPopup._eyeTrackHandler) {
    authPopup.removeEventListener('mousemove', authPopup._eyeTrackHandler);
  }

  const handler = function (e) {
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;
    if (svgWidth === 0 || svgHeight === 0) return; // Prevent NaN errors if hidden

    // SVG viewBox is 420x460
    const scaleX = 420 / svgWidth;
    const scaleY = 460 / svgHeight;
    // Mouse position in SVG coordinate space
    const mouseX = (e.clientX - svgRect.left) * scaleX;
    const mouseY = (e.clientY - svgRect.top) * scaleY;

    const eyes = svg.querySelectorAll('.blob-eye');
    eyes.forEach(function (eye) {
      const pupil = eye.querySelector('.blob-pupil');
      const eyeWhite = eye.querySelector('circle:first-child');
      if (!pupil || !eyeWhite) return;

      // Make pupil move smoothly via CSS
      if (!pupil.style.transition) {
        pupil.style.transition = 'transform 0.15s ease-out';
        pupil.style.transformOrigin = 'center';
        // Also ensure pupil is black and visible directly inline to fix visibility issue
        pupil.style.fill = '#000000';
        pupil.style.opacity = '1';
      }

      const cx = parseFloat(eyeWhite.getAttribute('cx'));
      const cy = parseFloat(eyeWhite.getAttribute('cy'));
      const eyeR = parseFloat(eyeWhite.getAttribute('r'));
      const pupilR = parseFloat(pupil.getAttribute('r'));

      // Read original start centers (only once)
      if (!pupil.dataset.origCx) {
        pupil.dataset.origCx = pupil.getAttribute('cx');
        pupil.dataset.origCy = pupil.getAttribute('cy');
      }
      const origPx = parseFloat(pupil.dataset.origCx);
      const origPy = parseFloat(pupil.dataset.origCy);

      const maxMove = eyeR - pupilR - 1.5;

      // Calculate distance from center of eyeball
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist * 0.15, maxMove);
      const targetCx = cx + Math.cos(angle) * clampedDist;
      const targetCy = cy + Math.sin(angle) * clampedDist;

      // Translate relative to original pupil position
      const transX = targetCx - origPx;
      const transY = targetCy - origPy;

      pupil.style.transform = `translate(${transX}px, ${transY}px)`;
    });
  };

  authPopup._eyeTrackHandler = handler;
  authPopup.addEventListener('mousemove', handler);

  // Also handle touch for mobile
  authPopup.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handler({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }, { passive: true });
}

// ========================================
// PASSWORD FIELD - CHARACTERS CLOSE EYES
// ========================================
function initPasswordEyeClosing() {
  const passwordField = document.getElementById('loginPassword');
  const signupPasswordField = document.getElementById('signupPass');
  const svg = document.querySelector('.auth-characters-svg');

  if (!svg) return;
  // Prevent duplicate event listener bugs on multiple popup opens
  if (svg.dataset.eyeClosingInitialized) return;
  svg.dataset.eyeClosingInitialized = 'true';

  const eyes = svg.querySelectorAll('.blob-eye');
  let closedLines = [];
  let eyesClosed = false;

  function closeEyes() {
    if (eyesClosed) return;
    eyesClosed = true;

    // Clean up any previous closed-eye lines
    closedLines.forEach(l => l.remove());
    closedLines = [];

    eyes.forEach(eye => {
      // Hide all original eye children (circles, pupils, highlights)
      Array.from(eye.children).forEach(child => {
        if (!child.hasAttribute('data-orig-display')) {
          child.setAttribute('data-orig-display', child.style.display || '');
        }
        child.style.display = 'none';
      });

      // Get eye center from the first circle (eye white)
      const eyeWhite = eye.querySelector('circle:first-child');
      if (!eyeWhite) return;
      const cx = parseFloat(eyeWhite.getAttribute('cx'));
      const cy = parseFloat(eyeWhite.getAttribute('cy'));
      const r = parseFloat(eyeWhite.getAttribute('r'));

      // Draw a curved "closed eye" line
      const w = r * 1.2;
      const closedEye = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      closedEye.setAttribute('d', `M${cx - w},${cy} Q${cx},${cy + w * 0.5} ${cx + w},${cy}`);
      closedEye.setAttribute('stroke', '#2d2d4e');
      closedEye.setAttribute('stroke-width', '2.5');
      closedEye.setAttribute('fill', 'none');
      closedEye.setAttribute('stroke-linecap', 'round');
      closedEye.classList.add('closed-eye-line');

      eye.appendChild(closedEye);
      closedLines.push(closedEye);
    });
  }

  function openEyes() {
    if (!eyesClosed) return;
    eyesClosed = false;

    // Restore all original eye children
    eyes.forEach(eye => {
      Array.from(eye.children).forEach(child => {
        if (child.classList.contains('closed-eye-line')) return;
        child.style.display = child.getAttribute('data-orig-display') || '';
      });
    });

    // Remove closed-eye lines
    closedLines.forEach(l => l.remove());
    closedLines = [];
  }

  // Login password field
  if (passwordField) {
    passwordField.addEventListener('focus', closeEyes);
    passwordField.addEventListener('blur', openEyes);
  }

  // Signup password fields
  if (signupPasswordField) {
    signupPasswordField.addEventListener('focus', closeEyes);
    signupPasswordField.addEventListener('blur', openEyes);
  }

  const confirmPasswordField = document.getElementById('signupConfirm');
  if (confirmPasswordField) {
    confirmPasswordField.addEventListener('focus', closeEyes);
    confirmPasswordField.addEventListener('blur', openEyes);
  }
}

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.classList.add('showing');
  } else {
    input.type = 'password';
    btn.classList.remove('showing');
  }
  input.focus();
}

function closeAuthPopup() {
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    authPopup.classList.remove('show');
    authPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      scrollCheckEnabled = true;
      hasScrolledToBottom = false;
    }, 1000);
  }
}

function createConfetti() {
  const colors = ['#667eea', '#f093fb', '#feca57', '#ff6b6b', '#4ecdc4'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}%;top:-10px;opacity:${Math.random()};transform:rotate(${Math.random() * 360}deg);animation:confettiFall ${2 + Math.random() * 3}s linear forwards;z-index:25000;pointer-events:none;`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  document.addEventListener('click', function (e) {
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

    const authPopup = document.getElementById('authPopup');
    const authOverlay = document.querySelector('.auth-popup-overlay');
    if (authPopup && authPopup.classList.contains('show') && e.target === authOverlay) {
      closeAuthPopup();
    }


  });
}

function initializeMusicPlayer() {
  window.musicPlayer = new Audio();
  window.musicPlayer.volume = 0.5;
}

// ========================================
// API & AUTH
// ========================================

function getToken() {
  return localStorage.getItem('authToken');
}

// Fixed apiCall function - merged both versions with proper endpoint handling
async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  // Ensure endpoint starts with / and construct full URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;

  const options = {
    method,
    headers: {},
    signal: controller.signal
  };

  const token = getToken();
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  if (body && !(body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  }

  try {
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || data.message || 'Request failed');
      err.status = response.status;
      err.code = data.code || null;

      // Daily message limit — show a prominent banner and stop the call chain
      if (response.status === 429 && data.code === 'DAILY_LIMIT_REACHED') {
        showMessage(
          '🚫 Your college has reached the 10,000 message limit for today! Chat resets at midnight UTC. 🌙',
          'error',
          7000
        );
        // Return null so callers don't crash; they should guard with  if (!response) return;
        return null;
      }

      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('network'))) {
      await new Promise(r => setTimeout(r, 1000));
      return apiCall(endpoint, method, body, retries - 1);
    }
    throw error;
  }
}



// Keep login and signup functions as they were (they're correct)
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  if (!email || !password) return showMessage('Fill all fields', 'error');
  try {
    showMessage('Logging in...', 'success');
    const data = await apiCall('/api/login', 'POST', { email, password });
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    currentUser.postCount = currentUser.postCount || 0;
    currentUser.commentCount = currentUser.commentCount || 0;
    currentUser.likeCount = currentUser.likeCount || 0;
    currentUser.daysActive = currentUser.daysActive || 1;
    currentUser.currentLevel = currentUser.currentLevel || 'wood';
    showMessage('✅ Login successful!', 'success');
    setTimeout(() => {
      location.reload();
    }, 800);
  } catch (error) {
    showMessage('❌ Login failed: ' + error.message, 'error');
  }
}

// Form navigation functions
function goSignup(e) {
  e?.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function goLogin(e) {
  e?.preventDefault();
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'none';
}

function goForgotPassword(e) {
  e?.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('forgotPasswordForm').style.display = 'block';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email) return showMessage('⚠️ Email required', 'error');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return showMessage('⚠️ Invalid email format', 'error');

  try {
    showMessage('📧 Sending reset code...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ Reset code sent to your email!', 'success');
    document.getElementById('resetEmailSection').style.display = 'none';
    document.getElementById('resetCodeSection').style.display = 'block';
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function signup(e) {
  e.preventDefault();
  const username = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPass')?.value;
  const confirm = document.getElementById('signupConfirm')?.value;

  if (!username || !email || !password || !confirm) return showMessage('Fill all fields', 'error');
  if (password !== confirm) return showMessage('Passwords don\'t match', 'error');
  if (password.length < 6) return showMessage('Password min 6 characters', 'error');
  if (username.length < 3) return showMessage('Username must be at least 3 characters', 'error');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return showMessage('Invalid email format', 'error');

  try {
    showMessage('Creating account...', 'success');
    await apiCall('/api/register', 'POST', { username, email, password });
    showMessage('🎉 Account created!', 'success');
    const form = document.getElementById('signupForm');
    if (form) form.reset();
    setTimeout(() => goLogin(null), 2000);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyResetCode(e) {
  e.preventDefault();
  const email = document.getElementById('resetEmail')?.value.trim();
  const code = document.getElementById('resetCode')?.value.trim();
  const newPassword = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('confirmNewPassword')?.value;
  if (!code || code.length !== 6) return showMessage('⚠️ Enter 6-digit code', 'error');
  if (!newPassword || !confirmPassword) return showMessage('⚠️ Enter password', 'error');
  if (newPassword !== confirmPassword) return showMessage('⚠️ Passwords don\'t match', 'error');
  if (newPassword.length < 6) return showMessage('⚠️ Min 6 characters', 'error');
  try {
    showMessage('🔐 Verifying...', 'success');
    await apiCall('/api/reset-password', 'POST', { email, code, newPassword });
    showMessage('✅ Password reset!', 'success');
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('resetEmailSection').style.display = 'block';
    document.getElementById('resetCodeSection').style.display = 'none';
    setTimeout(() => goLogin(null), 2000);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function resendResetCode() {
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email) return showMessage('⚠️ Email required', 'error');
  try {
    showMessage('📧 Resending...', 'success');
    await apiCall('/api/forgot-password', 'POST', { email });
    showMessage('✅ New code sent!', 'success');
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

function logout() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentUser = null;
  localStorage.clear();
  location.reload();
}

// ========================================
// ENHANCED COMMUNITY CHAT
// ========================================

function initializeEnhancedChat() {
  if (chatInitialized) return;
  chatInitialized = true;
  console.log('✨ Enhanced chat initializing');
  setupChatInputEnhancements();
  setupMessageActions();
  setupTypingIndicator();
  setupReactionSystem();
  setupConnectionMonitor();
  setupMessageOptimization();
  setupInfiniteScroll();
}

function setupChatInputEnhancements() {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;

  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    handleTypingIndicator();
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendEnhancedMessage();
    }
  });
}

async function sendEnhancedMessage() {
  const chatInput = document.getElementById('chatInput');
  const content = chatInput?.value.trim();
  if (!content) return;

  // ── SAFETY CHECKS ──
  if (!hasGhostName()) { requireGhostName(() => sendEnhancedMessage()); return; }
  if (!communitySafetyCheck(content)) return;
  if (isChatMuted()) { showCommunityMutedBanner(muteTimeLeft()); return; }
  // ───────────────────

  const ghostName = getGhostName();

  try {
    const messageData = {
      content,
      timestamp: Date.now(),
      tempId: 'temp-' + Date.now()
    };

    addMessageToUI({
      id: messageData.tempId,
      content,
      sender_id: currentUser.id,
      anon_name: ghostName,
      users: { id: currentUser.id, username: ghostName, profile_pic: null },
      timestamp: new Date(),
      status: 'sending'
    });

    chatInput.value = '';
    chatInput.style.height = 'auto';

    await apiCall('/api/community/messages', 'POST', { content, anon_name: ghostName });
    updateMessageStatus(messageData.tempId, 'sent');
    playMessageSound('send');

    if (socket && currentUser.college) {
      socket.emit('stop_typing', {
        collegeName: currentUser.college,
        username: currentUser.username
      });
    }
  } catch (error) {
    showMessage('❌ Failed to send', 'error');
  }
}

function appendMessageToChat(msg) {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  const sender = msg.anon_name || (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || '👻 Ghost';
  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));

  if (document.getElementById('msg-' + messageId)) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now(); // ✅ Store timestamp for duplicate detection

  let messageHTML = '';
  if (!isOwn) messageHTML += `<div class="sender">@${escapeHtml(sender)}</div>`;

  messageHTML += `
   <div class="text">${escapeHtml(msg.text || msg.content || '')}</div>
   <div class="message-footer">
     <span class="message-time">${timeLabel}</span>
     <div class="message-actions">
       ${!isOwn ? `<button class="message-action-btn" onclick="addReactionToMessage('${messageId}')" title="React">❤️</button>` : ''}
       <button class="message-action-btn" onclick="copyMessageText('${messageId}')" title="Copy">📋</button>
       ${isOwn ? `<button class="message-action-btn" onclick="deleteMessage('${messageId}')" title="Delete">🗑️</button>` : ''}
     </div>
   </div>
 `;

  messageHTML += createReactionBar(messageId, msg.message_reactions || []);
  wrapper.innerHTML = messageHTML;
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });

  if (!isOwn) playMessageSound('receive');
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createReactionBar(messageId, reactions) {
  const reactionCounts = {};
  const userReacted = {};

  if (reactions && Array.isArray(reactions)) {
    reactions.forEach(r => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      if (r.user_id && currentUser && r.user_id === currentUser.id) userReacted[r.emoji] = true;
    });
  }

  const defaultEmojis = ['❤️', '👍', '😂', '🔥', '🎉', '😮'];
  const allEmojis = Array.from(new Set([...defaultEmojis, ...Object.keys(reactionCounts)]));

  let html = '<div class="reaction-bar">';
  allEmojis.forEach(emoji => {
    const count = reactionCounts[emoji] || 0;
    const selected = userReacted[emoji] ? 'selected' : '';
    html += `<div class="reaction-pill ${selected}" onclick="toggleReaction('${messageId}', '${emoji}')">
     <span class="emoji">${emoji}</span>
     ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
   </div>`;
  });
  html += `<div class="reaction-pill" onclick="showEmojiPickerForMessage('${messageId}')" title="Add reaction">✚</div></div>`;
  return html;
}

// Track the current reaction per message for the current user
const _userMessageReactions = new Map(); // messageId -> emoji

async function toggleReaction(messageId, emoji) {
  try {
    const pill = event.target.closest('.reaction-pill');
    if (!pill) return;

    const msgWrapper = pill.closest('.whatsapp-message') || pill.closest('[id^="wa-msg-"]') || document.getElementById(`wa-msg-${messageId}`);
    const allPills = msgWrapper ? msgWrapper.querySelectorAll('.reaction-pill') : document.querySelectorAll(`#reacts-${messageId} .reaction-pill`);

    const prevEmoji = _userMessageReactions.get(messageId);
    const isSameEmoji = prevEmoji === emoji;

    // Deselect all pills for this message first (one reaction per user)
    allPills.forEach(p => {
      const pillEmoji = p.querySelector('.emoji')?.textContent;
      if (p.classList.contains('selected') && pillEmoji) {
        p.classList.remove('selected');
        const cs = p.querySelector('.reaction-count');
        if (cs) {
          const c = Math.max(0, parseInt(cs.textContent) - 1);
          cs.textContent = c || '';
          if (!c) cs.remove();
        }
      }
    });

    if (isSameEmoji) {
      // Toggling off — remove reaction
      _userMessageReactions.delete(messageId);
      await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
      return;
    }

    // Select the new pill
    pill.classList.add('selected');
    _userMessageReactions.set(messageId, emoji);
    const countSpan = pill.querySelector('.reaction-count');
    let count = parseInt(countSpan?.textContent) || 0;
    count++;
    if (countSpan) {
      countSpan.textContent = count;
    } else {
      const newCountSpan = document.createElement('span');
      newCountSpan.className = 'reaction-count';
      newCountSpan.textContent = count;
      const emojiSpan = pill.querySelector('.emoji');
      if (emojiSpan) emojiSpan.after(newCountSpan);
      else pill.appendChild(newCountSpan);
    }

    await apiCall(`/api/community/messages/${messageId}/react`, 'POST', { emoji });
  } catch (err) {
    console.error('Reaction failed', err);
    showMessage('❌ Failed to add reaction', 'error');
  }
}

function showEmojiPickerForMessage(messageId) {
  document.querySelectorAll('.emoji-picker').forEach(e => e.remove());

  const picker = document.createElement('div');
  picker.className = 'emoji-picker';

  const emojis = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '😢', '👏', '🤝', '🙌', '⭐', '💯'];
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleReaction(messageId, emoji);
      picker.remove();
    };
    picker.appendChild(btn);
  });

  document.body.appendChild(picker);

  const messageEl = document.getElementById(`msg-${messageId}`);
  if (messageEl) {
    const rect = messageEl.getBoundingClientRect();
    picker.style.position = 'fixed';
    picker.style.left = Math.max(10, rect.left) + 'px';
    picker.style.top = Math.max(10, rect.top - picker.offsetHeight - 10) + 'px';
  }

  setTimeout(() => {
    const closeHandler = (e) => {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 10);
}

function addReactionToMessage(messageId) {
  showEmojiPickerForMessage(messageId);
}

function copyMessageText(messageId) {
  const messageEl = document.getElementById(`msg-${messageId}`);
  const text = messageEl?.querySelector('.text')?.textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showMessage('📋 Message copied!', 'success');
  }).catch(() => {
    showMessage('❌ Failed to copy', 'error');
  });
}

function handleTypingIndicator() {
  // Ghost chat: do not emit real username in typing indicator
  // (typing events suppressed to protect ghost anonymity)
}

function showTypingIndicator(username) {
  typingUsers.add(username);
  updateTypingDisplay();
}

function hideTypingIndicator(username) {
  typingUsers.delete(username);
  updateTypingDisplay();
}

function updateTypingDisplay() {
  // Ghost chat: typing indicator hidden to protect anonymity
  let container = document.querySelector('.typing-indicators-container');
  if (container) container.innerHTML = '';
}

function setupMessageActions() {
  console.log('✨ Message actions setup');
}

async function deleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    const messageEl = document.getElementById(`msg-${messageId}`);
    if (messageEl) {
      messageEl.style.opacity = '0.5';
      messageEl.style.pointerEvents = 'none';
    }

    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }

    showMessage('🗑️ Message deleted', 'success');
  } catch (error) {
    console.error('Delete error:', error);
    showMessage('❌ Failed to delete', 'error');

    const messageEl = document.getElementById(`msg-${messageId}`);
    if (messageEl) {
      messageEl.style.opacity = '1';
      messageEl.style.pointerEvents = 'auto';
    }
  }
}

function updateMessageStatus(messageId, status) {
  const messageEl = document.getElementById(`msg-${messageId}`);
  if (!messageEl) return;

  let statusIcon = messageEl.querySelector('.message-status');
  if (!statusIcon) {
    statusIcon = document.createElement('span');
    statusIcon.className = 'message-status';
    const timeSpan = messageEl.querySelector('.message-time');
    if (timeSpan) timeSpan.appendChild(statusIcon);
  }

  statusIcon.className = `message-status ${status}`;
  statusIcon.textContent = status === 'sending' ? '⏳' : status === 'sent' ? '✓' : '✓✓';
}

function setupConnectionMonitor() {
  if (!socket) return;

  socket.on('connect', () => {
    connectionStatus = 'connected';
    updateConnectionStatus();
  });

  socket.on('disconnect', () => {
    connectionStatus = 'disconnected';
    updateConnectionStatus();
  });

  socket.on('reconnect', () => {
    connectionStatus = 'connected';
    updateConnectionStatus();
    setTimeout(() => loadCommunityMessages(), 500);
  });
}

function updateConnectionStatus() {
  let banner = document.querySelector('.connection-status');
  const chatSection = document.getElementById('chatSection');

  if (connectionStatus === 'disconnected') {
    if (!banner && chatSection) {
      banner = document.createElement('div');
      banner.className = 'connection-status';
      chatSection.prepend(banner);
    }
    if (banner) banner.textContent = '⚠️ Disconnected - Reconnecting...';
  } else {
    if (banner) {
      banner.classList.add('connected');
      banner.textContent = '✅ Connected';
      setTimeout(() => banner.remove(), 2000);
    }
  }
}

function setupMessageOptimization() {
  let messageQueue = [];
  let updateTimeout = null;

  window.queueMessageUpdate = function (message) {
    messageQueue.push(message);
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      messageQueue.forEach(msg => appendMessageToChat(msg));
      messageQueue = [];
    }, 100);
  };
}

function setupInfiniteScroll() {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;

  messagesEl.addEventListener('scroll', async () => {
    if (messagesEl.scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
      isLoadingMessages = true;
      const oldHeight = messagesEl.scrollHeight;

      try {
        const data = await apiCall(`/api/community/messages?page=${currentMessagePage + 1}`, 'GET');

        if (data.messages && data.messages.length > 0) {
          currentMessagePage++;
          data.messages.reverse().forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.innerHTML = renderMessage(msg);
            messagesEl.insertBefore(messageEl.firstChild, messagesEl.firstChild);
          });

          const newHeight = messagesEl.scrollHeight;
          messagesEl.scrollTop = newHeight - oldHeight;
        } else {
          hasMoreMessages = false;
        }
      } catch (error) {
        console.error('Load more messages:', error);
      } finally {
        isLoadingMessages = false;
      }
    }
  });
}

function renderMessage(msg) {
  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  // Ghost name only in community chat
  const sender = msg.anon_name || (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || '👻 Ghost';
  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));

  // ✅ FIX: Build media HTML for renderMessage
  let renderMediaHTML = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      renderMediaHTML = `<video class="msg-media" src="${proxyMediaUrl(msg.media_url)}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      renderMediaHTML = `<audio class="msg-media" src="${proxyMediaUrl(msg.media_url)}" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      renderMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      renderMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      renderMediaHTML = `<img class="msg-media" src="${proxyMediaUrl(msg.media_url)}" alt="image" onclick="openImageViewer(this.src)">`;
    }
  }

  let html = `<div class="chat-message ${isOwn ? 'own' : 'other'}" id="msg-${messageId}">`;
  if (!isOwn) html += `<div class="sender" style="color:#a78bfa;">👻 ${escapeHtml(sender)}</div>`;
  html += `
   ${renderMediaHTML}
   <div class="text">${escapeHtml(msg.text || msg.content || '')}</div>
   <div class="message-footer">
     <span class="message-time">${timeLabel}</span>
     <div class="message-actions">
       ${!isOwn ? `<button class="message-action-btn" onclick="addReactionToMessage('${messageId}')" title="React">❤️</button>` : ''}
       <button class="message-action-btn" onclick="copyMessageText('${messageId}')" title="Copy">📋</button>
       ${isOwn ? `<button class="message-action-btn" onclick="deleteMessage('${messageId}')" title="Delete">🗑️</button>` : ''}
     </div>
   </div>
 `;
  html += createReactionBar(messageId, msg.message_reactions || []);
  html += '</div>';

  return html;
}

function playMessageSound(type) {
  const sounds = {
    send: 'https://assets.mixkit.co/active_storage/sfx/2354/2354.wav',
    receive: 'https://assets.mixkit.co/active_storage/sfx/2357/2357.wav',
    notification: 'https://assets.mixkit.co/active_storage/sfx/2358/2358.wav'
  };

  const audio = new Audio(sounds[type]);
  audio.volume = 0.2;
  audio.play().catch(() => { });
}

function setupReactionSystem() {
  console.log('✨ Reactions ready');
}

function setupTypingIndicator() {
  console.log('✨ Typing indicator ready');
}

function addMessageToUI(message) {
  appendMessageToChat(message);
}

function setupEnhancedSocketListeners() {
  if (!socket) return;
  // Restore lifetime seen data from localStorage
  _initSeenLifetime();


  socket.on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username) {
      showTypingIndicator(data.username);
    }
  });

  socket.on('user_stop_typing', (data) => {
    if (data.username) hideTypingIndicator(data.username);
  });

  socket.on('message_deleted', ({ id }) => {
    const messageEl = document.getElementById(`msg-${id}`);
    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }
  });
}

// Auto-initialize chat when section becomes visible
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const chatSection = document.getElementById('chatSection');
      if (mutation.target === chatSection &&
        chatSection.style.display !== 'none' &&
        !chatSection.dataset.initialized) {
        chatSection.dataset.initialized = 'true';
        initializeEnhancedChat();
        setupEnhancedSocketListeners();
        console.log('🎉 Enhanced chat ready!');
      }
    });
  });

  const chatSection = document.getElementById('chatSection');
  if (chatSection) {
    observer.observe(chatSection, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});

function handleChatKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendEnhancedMessage();
  }
}

async function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappInput');
  const content = input.value.trim();

  if (!content) return;

  try {
    // 1. Clear input immediately
    input.value = '';

    // 2. Create unique temp ID
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // 3. Show optimistic message
    const tempMessage = {
      id: tempId,
      content: content,
      user_id: currentUser.id,
      users: {
        username: currentUser.username,
        avatar_url: currentUser.avatar_url
      },
      created_at: new Date().toISOString(),
      isTemp: true // Mark as temporary
    };

    appendWhatsAppMessage(tempMessage, true); // true = own message

    // 4. Send to server
    const response = await apiCall('/api/community/messages', 'POST', {
      content: content
    });

    if (response.success) {
      // 5. Remove temp message
      const tempElement = document.getElementById(`wa-msg-${tempId}`);
      if (tempElement) {
        tempElement.remove();
      }

      // 6. Add real message from API response
      appendWhatsAppMessage(response.message, true);

      console.log('✅ Message sent successfully');
    }

  } catch (error) {
    console.error('❌ Failed to send message:', error);
    showMessage('Failed to send message', 'error');

    // Remove temp message on error
    const tempElement = document.getElementById(`wa-msg-temp-${tempId}`);
    if (tempElement) {
      tempElement.remove();
    }
  }
}
function handleWhatsAppKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    // If file preview is active, use the media-aware send function
    const filePreviewBar = document.getElementById('chatFilePreviewBar');
    if (filePreviewBar && filePreviewBar.style.display !== 'none') {
      sendWhatsAppMessageWithMedia();
    } else {
      sendWhatsAppMessageWithMedia(); // always use the full send
    }
  }

  // Auto-resize textarea
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
}

function showMessageOptions(messageId, isOwn) {
  const options = [
    { icon: '📋', label: 'Copy', action: () => copyMessage(messageId) },
    { icon: '↪️', label: 'Reply', action: () => replyToMessage(messageId) },
    { icon: '⭐', label: 'Star', action: () => starMessage(messageId) }
  ];

  if (isOwn) {
    options.push({ icon: '🗑️', label: 'Delete', action: () => deleteWhatsAppMessage(messageId) });
  }

  showContextMenu(options);
}

function scrollToBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }
}

// ========================================
// COMMUNITIES & CHAT
// ========================================

function loadCommunities() {
  const container = document.getElementById('communitiesContainer');
  if (!container) return;

  if (!currentUser || !currentUser.communityJoined) {

    container.innerHTML = `
    <div class="join-community-container"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; overflow-y: auto;">
        <div class="join-icon" style="font-size: 80px; margin-bottom: 10px; margin-top: 40px;">🤝</div>
        <h2 style="margin-bottom: 5px; color: var(--text-color);">Join a Community</h2>
        <p style="margin-bottom: 20px; color: var(--text-muted); max-width: 400px;">Connect with students from your
            university. Select your college to start chatting and sharing vibes!</p>
            
        <h2 class="title" style="margin-top: 10px; margin-bottom: 15px; color: var(--text-color);">500+ Active Universities</h2>
        <div class="cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; width: 100%; max-width: 900px; padding-bottom: 40px;">
          <div class="card" onclick="selectUniversity('nit')" style="background: rgba(15, 25, 45, 0.6); border: 1px solid rgba(79, 116, 163, 0.2); padding: 20px; border-radius: 15px; cursor: pointer; transition: transform 0.2s;">
            <div class="icon" style="font-size: 35px; margin-bottom: 10px;">🏛️</div>
            <h3 style="color: var(--text-color); margin-bottom: 5px; font-size: 18px;">NIT Colleges</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">National Institutes of Technology</p>
            <button style="padding: 8px 20px; border-radius: 20px; background: rgba(79, 116, 163, 0.2); border: 1px solid rgba(79, 116, 163, 0.4); color: white; cursor: pointer; width: 100%;">Join</button>
          </div>
          <div class="card" onclick="selectUniversity('iit')" style="background: rgba(15, 25, 45, 0.6); border: 1px solid rgba(79, 116, 163, 0.2); padding: 20px; border-radius: 15px; cursor: pointer; transition: transform 0.2s;">
            <div class="icon" style="font-size: 35px; margin-bottom: 10px;">🏰</div>
            <h3 style="color: var(--text-color); margin-bottom: 5px; font-size: 18px;">IIT Colleges</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">Indian Institutes of Technology</p>
            <button style="padding: 8px 20px; border-radius: 20px; background: rgba(79, 116, 163, 0.2); border: 1px solid rgba(79, 116, 163, 0.4); color: white; cursor: pointer; width: 100%;">Join</button>
          </div>
          <div class="card" onclick="selectUniversity('vit')" style="background: rgba(15, 25, 45, 0.6); border: 1px solid rgba(79, 116, 163, 0.2); padding: 20px; border-radius: 15px; cursor: pointer; transition: transform 0.2s;">
            <div class="icon" style="font-size: 35px; margin-bottom: 10px;">🎓</div>
            <h3 style="color: var(--text-color); margin-bottom: 5px; font-size: 18px;">VIT Colleges</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">VIT Bhopal & Other Campuses</p>
            <button style="padding: 8px 20px; border-radius: 20px; background: rgba(79, 116, 163, 0.2); border: 1px solid rgba(79, 116, 163, 0.4); color: white; cursor: pointer; width: 100%;">Join</button>
          </div>
          <div class="card" onclick="selectUniversity('other')" style="background: rgba(15, 25, 45, 0.6); border: 1px solid rgba(79, 116, 163, 0.2); padding: 20px; border-radius: 15px; cursor: pointer; transition: transform 0.2s;">
            <div class="icon" style="font-size: 35px; margin-bottom: 10px;">🌟</div>
            <h3 style="color: var(--text-color); margin-bottom: 5px; font-size: 18px;">Other Universities</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">Central & State Universities</p>
            <button style="padding: 8px 20px; border-radius: 20px; background: rgba(79, 116, 163, 0.2); border: 1px solid rgba(79, 116, 163, 0.4); color: white; cursor: pointer; width: 100%;">Join</button>
          </div>
        </div>
    </div>
    `;
    return;
  }

  // Ensure whatsapp container is correctly positioned on next frame
  // (header may still be visible when communities loads)
  requestAnimationFrame(() => {
    const header = document.querySelector('.header');
    const chatContainer = document.querySelector('.whatsapp-container');
    if (header && chatContainer) {
      if (document.body.classList.contains('header-autohide')) {
        chatContainer.style.top = '0';
        chatContainer.style.height = '100vh';
      } else {
        const hh = header.offsetHeight || 72;
        chatContainer.style.top = hh + 'px';
        chatContainer.style.height = `calc(100vh - ${hh}px)`;
      }
    }
  });

  // WhatsApp-style complete layout — HTML lives in index.html #vx-tpl-whatsapp
  const _waTpl = document.getElementById('vx-tpl-whatsapp');
  if (!_waTpl) {
    console.error('[VX] Missing <template id=vx-tpl-whatsapp> in index.html');
    return;
  }
  container.innerHTML = _waTpl.innerHTML
    .replace(/__VX_COLLEGE__/g, escapeHtml(currentUser.college));

  // Initialize chat — default to Executive Chat tab
  setTimeout(() => {
    if (typeof initWhatsAppChatFixes === 'function') {
      initWhatsAppChatFixes();
    }
    // Open Executive Chat as the default tab
    openExecutiveChat();
    initWhatsAppFeatures();
    loadTwitterFeed();
  }, 150);
}

// ==========================================
// WHATSAPP MESSAGE FUNCTIONS
// ==========================================

let isLoadingWhatsAppMessages = false;

async function loadWhatsAppMessages() {
  if (isLoadingWhatsAppMessages) return;
  isLoadingWhatsAppMessages = true;

  try {
    const data = await apiCall('/api/community/messages', 'GET');
    const messagesEl = document.getElementById('whatsappMessages');

    if (!messagesEl) return;

    // ✅ FIXED: Only clear if this is the first load
    const existingMessages = messagesEl.querySelectorAll('[id^="wa-msg-"]');
    const isFirstLoad = existingMessages.length === 0;

    if (isFirstLoad) {
      messagesEl.innerHTML = '';
      // Reset date tracking so separators re-render fresh
      resetChatDateTracking();
    }

    if (!data.messages || data.messages.length === 0) {
      if (isFirstLoad) {
        messagesEl.innerHTML += `
          <div class="no-messages">
            <div style="font-size:64px;margin-bottom:20px;">👋</div>
            <h3 style="color:#4f74a3;margin-bottom:10px;">Welcome to Community Chat!</h3>
            <p style="color:#888;">Say hi to your college community</p>
          </div>
        `;
      }
      return;
    }

    // ✅ FIXED: Only append new messages that don't already exist
    console.log(`📥 Loading ${data.messages.length} messages`);
    data.messages.forEach(msg => {
      const msgExists = document.getElementById(`wa-msg-${msg.id}`);
      if (!msgExists) {
        appendWhatsAppMessage(msg);
      }
    });

    // ✅ Scroll to bottom only on first load
    if (isFirstLoad) {
      setTimeout(() => scrollToBottom(), 100);
    }

    // Update stats
    updateChatStats(data.messages.length);
  } catch (error) {
    console.error('Load messages error:', error);
  } finally {
    isLoadingWhatsAppMessages = false;
  }
}


async function sendWhatsAppMessage() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();

  if (!content) {
    showMessage('⚠️ Message cannot be empty', 'error');
    input?.focus();
    return;
  }

  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }

  // ✅ Clear input IMMEDIATELY
  const originalContent = content;
  input.value = '';
  input.style.height = 'auto';

  // ✅ Create unique temp ID
  const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  const tempMessage = {
    id: tempId,
    content: originalContent,
    sender_id: currentUser.id,
    users: {
      username: currentUser.username,
      avatar_url: currentUser.avatar_url
    },
    created_at: new Date().toISOString(),
    text: originalContent,
    isTemp: true
  };

  try {
    // ✅ Show optimistic message
    appendWhatsAppMessage(tempMessage);

    // Stop typing indicator
    if (socket && currentUser.college) {
      socket.emit('stop_typing', {
        collegeName: currentUser.college,
        username: currentUser.username
      });
    }

    // ✅ Send to server
    const response = await apiCall('/api/community/messages', 'POST', {
      content: originalContent
    });

    if (response.success && response.message) {
      playMessageSound('send');

      // ✅ Remove temp message
      const tempEl = document.getElementById(`wa-msg-${tempId}`);
      if (tempEl) {
        console.log(`🗑️ Removing temp: ${tempId}`);
        tempEl.remove();
      }

      // ✅ Add real message from API (NOT from socket)
      console.log(`✅ Adding real: ${response.message.id}`);
      appendWhatsAppMessage(response.message);
    }
  } catch (error) {
    console.error('❌ Send error:', error);
    showMessage('❌ Failed to send message', 'error');

    // Remove temp on error
    const tempEl = document.getElementById(`wa-msg-${tempId}`);
    if (tempEl) tempEl.remove();

    // Restore input
    input.value = originalContent;
  }
}
function handleWhatsAppKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendWhatsAppMessage();
  }

  // Auto-resize textarea
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
}

function handleTypingIndicator() {
  // Ghost chat: do not emit typing events to protect anonymity
}

function showMessageActions(messageId) {
  // Hide all other action menus
  document.querySelectorAll('.message-actions-menu').forEach(menu => {
    menu.style.display = 'none';
  });

  // Show this message's actions
  const actionsMenu = document.getElementById(`actions-${messageId}`);
  if (actionsMenu) {
    actionsMenu.style.display = 'flex';

    // Hide after 5 seconds
    setTimeout(() => {
      actionsMenu.style.display = 'none';
    }, 5000);
  }
}

async function deleteWhatsAppMessage(messageId) {
  if (!confirm('Delete this message?')) return;

  try {
    await apiCall(`/api/community/messages/${messageId}`, 'DELETE');

    const messageEl = document.getElementById(`wa-msg-${messageId}`);
    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }

    showMessage('🗑️ Message deleted', 'success');
  } catch (error) {
    console.error('Delete error:', error);
    showMessage('❌ Failed to delete', 'error');
  }
}

function copyMessageText(messageId) {
  const messageEl = document.getElementById(`wa-msg-${messageId}`);
  const text = messageEl?.querySelector('.message-text')?.textContent;

  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showMessage('📋 Message copied!', 'success');
  }).catch(() => {
    showMessage('❌ Failed to copy', 'error');
  });
}

function replyToMessage(messageId) {
  const messageEl = document.getElementById(`wa-msg-${messageId}`);
  const text = messageEl?.querySelector('.message-text')?.textContent;
  const sender = messageEl?.querySelector('.message-sender-name')?.textContent || 'You';

  if (!text) return;

  const input = document.getElementById('whatsappInput');
  if (input) {
    input.value = `@${sender}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}\n\n`;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  showMessage(`↩️ Replying to ${sender}`, 'success');
}

// ── WhatsApp-style reply with preview strip ──────────────────
let _replyToMsgId = null;

function replyToWhatsAppMsg(messageId) {
  const wrapper = document.getElementById(`wa-msg-${messageId}`);
  if (!wrapper) return;

  // Get text from message bubble, skipping any nested reply-quote
  const bubbleEl = wrapper.querySelector('.message-bubble');
  const textEl = bubbleEl?.querySelector('.message-text');
  // Use only direct text nodes, ignoring nested reply quotes
  let text = '';
  if (textEl) {
    // textContent of .message-text might include reply quote text if nested — use direct text
    text = Array.from(textEl.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent)
      .join('').trim() || textEl.textContent.trim() || '';
  }

  // Get sender: own messages show current user's name, others show sender name div
  const isOwn = wrapper.classList.contains('own');
  let sender;
  if (isOwn) {
    sender = (currentUser && (currentUser.username || currentUser.name)) || 'You';
  } else {
    sender = wrapper.querySelector('.message-sender-name')?.textContent?.trim() || 'User';
  }

  // Check if there's media instead
  const mediaEl = bubbleEl?.querySelector('.msg-media, .msg-doc-link');
  const hasMedia = !!mediaEl;
  const previewText = text ? (text.length > 60 ? text.substring(0, 60) + '…' : text) : (hasMedia ? '📎 Media' : 'Message');

  _replyToMsgId = messageId;

  const preview = document.getElementById('chatReplyPreview');
  const senderSpan = document.getElementById('replyPreviewSender');
  const textSpan = document.getElementById('replyPreviewText');

  if (preview) {
    if (senderSpan) senderSpan.textContent = sender;
    if (textSpan) textSpan.textContent = previewText;
    preview.style.display = 'flex';
  }

  const input = document.getElementById('whatsappInput');
  if (input) input.focus();
}

function cancelReply() {
  _replyToMsgId = null;
  const preview = document.getElementById('chatReplyPreview');
  if (preview) preview.style.display = 'none';
}

function scrollToReplyMsg(msgId) {
  const el = document.getElementById('wa-msg-' + msgId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Flash highlight
  el.classList.add('reply-highlight');
  setTimeout(() => el.classList.remove('reply-highlight'), 1500);
}

function forwardMessage(messageId) {
  showMessage('↪️ Forward feature coming soon!', 'success');
}

function scrollToBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (messagesEl) {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }
}

function updateChatStats(messageCount) {
  const totalMessages = document.getElementById('totalMessages');
  if (totalMessages) totalMessages.textContent = messageCount;
}

// ==========================================
// EMOJI & STICKER PICKERS
// ==========================================

function openEmojiPicker() {
  // Close any existing picker
  const existing = document.getElementById('emojiPickerPopup');
  if (existing) {
    existing.remove();
    return;
  }

  const picker = document.createElement('div');
  picker.id = 'emojiPickerPopup';
  picker.className = 'emoji-picker-popup';
  picker.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:5000;';

  const emojis = [
    { cat: 'Smileys', items: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋'] },
    { cat: 'Gestures', items: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '🙏'] },
    { cat: 'Hearts', items: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
    { cat: 'Objects', items: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎵', '🎶'] }
  ];

  let html = `
    <div class="emoji-picker-header">
      <input type="text" class="emoji-search" placeholder="🔍 Search emoji..." oninput="searchEmojis(this.value)">
      <button class="emoji-picker-close-btn" onclick="closeEmojiPicker()" title="Close">✕</button>
    </div>
    <div class="emoji-categories" id="emojiCategories">
  `;

  emojis.forEach(category => {
    html += `
      <div class="emoji-category">
        <div class="emoji-category-title">${category.cat}</div>
        <div class="emoji-grid">
          ${category.items.map(emoji => `
            <div class="emoji-item" onclick="insertEmoji('${emoji}')">${emoji}</div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';
  picker.innerHTML = html;
  document.body.appendChild(picker);
}

function closeEmojiPicker() {
  const picker = document.getElementById('emojiPickerPopup');
  if (picker) picker.remove();
}

function insertEmoji(emoji) {
  const input = document.getElementById('whatsappInput');
  if (input) {
    input.value += emoji;
    input.focus();
  }
  closeEmojiPicker();
}

function searchEmojis(query) {
  // Simple search implementation
  const categories = document.querySelectorAll('.emoji-category');
  categories.forEach(cat => {
    const items = cat.querySelectorAll('.emoji-item');
    let hasVisible = false;
    items.forEach(item => {
      // In real app, you'd have emoji names to search
      item.style.display = 'flex';
      hasVisible = true;
    });
    cat.style.display = hasVisible ? 'block' : 'none';
  });
}

function openStickerPicker() {
  showMessage('🎨 Sticker picker coming soon!', 'success');

  // Quick sticker selection
  const stickers = ['🔥', '💯', '✨', '⚡', '💪', '🎯', '🚀', '💝', '🎨', '📚'];
  const sticker = prompt('Quick sticker:\n' + stickers.join(' ') + '\n\nChoose one:');

  if (sticker && stickers.includes(sticker)) {
    const input = document.getElementById('whatsappInput');
    if (input) {
      input.value += sticker;
      input.focus();
    }
  }
}

function openAttachMenu() {
  const menu = document.createElement('div');
  menu.className = 'attach-menu-popup';
  menu.style.cssText = 'position:fixed;bottom:80px;left:50px;background:rgba(15,25,45,0.98);border:2px solid rgba(79,116,163,0.4);border-radius:15px;padding:15px;z-index:5000;';

  menu.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;min-width:200px;">
      <button onclick="attachPhoto()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(79,116,163,0.2);border:2px solid rgba(79,116,163,0.3);border-radius:12px;cursor:pointer;color:#4f74a3;font-weight:600;">
        <span style="font-size:32px;">📷</span>
        <span>Photo</span>
      </button>
      <button onclick="attachVideo()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(79,116,163,0.2);border:2px solid rgba(79,116,163,0.3);border-radius:12px;cursor:pointer;color:#4f74a3;font-weight:600;">
        <span style="font-size:32px;">🎥</span>
        <span>Video</span>
      </button>
      <button onclick="attachDocument()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(79,116,163,0.2);border:2px solid rgba(79,116,163,0.3);border-radius:12px;cursor:pointer;color:#4f74a3;font-weight:600;">
        <span style="font-size:32px;">📄</span>
        <span>Document</span>
      </button>
      <button onclick="menu.remove()" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;background:rgba(239,68,68,0.2);border:2px solid rgba(239,68,68,0.3);border-radius:12px;cursor:pointer;color:#ff6b6b;font-weight:600;">
        <span style="font-size:32px;">✕</span>
        <span>Cancel</span>
      </button>
    </div>
  `;

  document.body.appendChild(menu);

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !e.target.closest('.icon-btn')) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

function attachPhoto() {
  showMessage('📷 Photo attachment coming soon!', 'success');
  document.querySelector('.attach-menu-popup')?.remove();
}

function attachVideo() {
  showMessage('🎥 Video attachment coming soon!', 'success');
  document.querySelector('.attach-menu-popup')?.remove();
}

function attachDocument() {
  showMessage('📄 Document attachment coming soon!', 'success');
  document.querySelector('.attach-menu-popup')?.remove();
}

// ========================================
// COLLEGE VERIFICATION
// ========================================

function goToActiveUniversities() {
  // If user is already joined, go directly to chat
  if (currentUser && currentUser.college) {
    console.log('🎓 User already has college:', currentUser.college);
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[onclick*="communities"]')?.classList.add('active');
    showPage('communities');
    return;
  }
  // Not joined — go to communities which renders the join/select screen
  showPage('communities');
}

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

  // Use showPage so all pages are hidden/shown correctly
  showPage('collegeList');

  const title = document.getElementById('collegeTitle');
  if (title) title.textContent = titles[type];

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
       ${isConnected ?
        '<button class="verified" disabled>✓ Connected</button>' :
        `<button onclick="openVerify('${c.name}','${c.email}')">Connect</button>`
      }
     </div>
   `;
  });

  const container = document.getElementById('collegeContainer');
  if (container) container.innerHTML = html;
}

function searchColleges() {
  const searchInput = document.getElementById('searchCollege');
  if (!searchInput) return;

  const search = searchInput.value.toLowerCase();
  const filtered = colleges[currentType].filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.location.toLowerCase().includes(search)
  );

  allColleges = filtered;
  currentPage = 1;
  showColleges();
}

function backToUniversities() {
  // If user hasn't joined yet, go back to communities join screen
  // If user came from home page university cards, go back to home
  if (currentUser && currentUser.communityJoined) {
    showPage('home');
  } else {
    showPage('communities');
  }
}

function openVerify(name, emailDomain) {
  if (currentUser && currentUser.college) {
    showMessage('⚠️ Already connected to ' + currentUser.college, 'error');
    return;
  }

  currentVerifyCollege = { name, emailDomain };

  const modalHtml = `
   <div class="modal-box verify-modal-box">
     <span class="close" onclick="closeModal('verifyModal')">&times;</span>
     
     <div class="verify-header">
       <div class="verify-icon">🎓</div>
       <h2>Verify College</h2>
       <p class="verify-subtitle">Connect with your campus community</p>
     </div>

     <div class="verify-step">
       <label>1. Enter College Email</label>
       <div class="input-group">
         <input type="email" id="verifyEmail" placeholder="student@${emailDomain}">
         <div class="email-hint">Must end with: <strong>${emailDomain}</strong></div>
       </div>
       <button class="action-btn send-otp-btn" onclick="requestVerificationCode()">
         <span>📧 Send Verification Code</span>
       </button>
     </div>

     <div class="verify-step disabled-step" id="codeSection">
       <label>2. Enter Verification Code</label>
       <div class="input-group">
         <input type="text" id="verifyCode" placeholder="Enter 6-digit OTP" maxlength="6" disabled>
       </div>
       <button class="action-btn verify-btn" id="verifyBtn" onclick="verifyCollegeCode()" disabled>
         <span>✨ Verify & Join</span>
       </button>
     </div>
   </div>
 `;

  const modal = document.getElementById('verifyModal');
  if (modal) {
    modal.innerHTML = modalHtml;
    modal.style.display = 'flex';
  }
}

async function requestVerificationCode() {
  const emailInput = document.getElementById('verifyEmail');
  if (!emailInput) return;

  const email = emailInput.value.trim();
  if (!email) return showMessage('⚠️ Enter email', 'error');

  if (!email.endsWith(currentVerifyCollege.emailDomain)) {
    return showMessage('⚠️ Must end with ' + currentVerifyCollege.emailDomain, 'error');
  }

  try {
    showMessage('📧 Sending code...', 'success');
    await apiCall('/api/college/request-verification', 'POST', {
      collegeName: currentVerifyCollege.name,
      collegeEmail: email
    });

    showMessage('✅ Code sent to ' + email, 'success');

    // Enable OTP section
    const codeSection = document.getElementById('codeSection');
    const verifyCodeInput = document.getElementById('verifyCode');
    const verifyBtn = document.getElementById('verifyBtn');

    if (codeSection) {
      codeSection.classList.remove('disabled-step');
      if (verifyCodeInput) {
        verifyCodeInput.disabled = false;
        verifyCodeInput.focus();
      }
      if (verifyBtn) verifyBtn.disabled = false;
    }
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

async function verifyCollegeCode() {
  const codeInput = document.getElementById('verifyCode');
  if (!codeInput) return;

  const code = codeInput.value.trim();
  if (!code || code.length !== 6) return showMessage('⚠️ Enter 6-digit code', 'error');

  try {
    showMessage('🔐 Verifying...', 'success');
    const data = await apiCall('/api/college/verify', 'POST', { code });

    showMessage('🎉 ' + data.message, 'success');
    currentUser.college = data.college;
    currentUser.registration_number = data.collegeEmail || currentUser.email;
    currentUser.communityJoined = true;
    currentUser.badges = data.badges;
    localStorage.setItem('user', JSON.stringify(currentUser));

    closeModal('verifyModal');

    // If socket already connected, just join the college room
    // Otherwise initialize the socket fresh
    if (typeof socket !== 'undefined' && socket && socket.connected) {
      socket.emit('join_college', data.college);
    } else {
      initializeSocket();
    }

    setTimeout(() => {
      showPage('communities');
      updateLiveNotif('Connected to ' + data.college);
    }, 1500);
  } catch (error) {
    showMessage('❌ ' + error.message, 'error');
  }
}

// ========================================
// SOCKET.IO REAL-TIME
// ========================================

function initializeSocket() {
  if (socket) return;

  socket = io(API_URL);

  socket.on('connect', () => {
    console.log('Socket connected');
    if (currentUser?.college) socket.emit('join_college', currentUser.college);
    socket.emit('user_online', currentUser.id);
  });

  socket.on('message_updated', (message) => updateMessageInChat(message));
  socket.on('message_deleted', ({ id }) => removeMessageFromChat(id));
  socket.on('online_count', (count) => updateOnlineCount(count));

  // ── Real-time: like count ─────────────────────────────────────────────
  socket.on('post_liked', (data) => {
    // Vibe-feed card (identified by data-id on the .vibe-card)
    const card = document.querySelector(`.vibe-card[data-id="${data.postId}"]`);
    if (card) {
      const lbl = card.querySelector('.vibe-action-label');  // first action label = likes
      if (lbl) lbl.textContent = vibeFmt(data.likeCount);
    }
    // Legacy feed fallback
    const el = document.querySelector(`#like-count-${data.postId}`);
    if (el) el.textContent = `❤️ ${data.likeCount}`;
  });

  // ── Real-time: comment count ───────────────────────────────────────────
  socket.on('post_commented', (data) => {
    const card = document.querySelector(`.vibe-card[data-id="${data.postId}"]`);
    if (card) {
      const lbls = card.querySelectorAll('.vibe-action-label');
      if (lbls[1]) lbls[1].textContent = vibeFmt(data.commentCount); // 2nd = comments
    }
    const el = document.querySelector(`#comment-count-${data.postId}`);
    if (el) el.textContent = `💬 ${data.commentCount}`;
  });

  // ── Real-time: share count ─────────────────────────────────────────────
  socket.on('post_shared', (data) => {
    const card = document.querySelector(`.vibe-card[data-id="${data.postId}"]`);
    if (card) {
      const lbls = card.querySelectorAll('.vibe-action-label');
      if (lbls[3]) lbls[3].textContent = vibeFmt(data.shareCount); // 4th = shares
    }
    const el = document.querySelector(`#share-count-${data.postId}`);
    if (el) el.textContent = `🔄 ${data.shareCount}`;
  });

  // ── Real-time: NEW POST from any user → prepend to "For You" feed ─────
  socket.on('new_post', (post) => {
    // If this is our own post — update My Vibes stats/grid (feed already updated optimistically)
    if (currentUser && post.users && post.users.id === currentUser.id) {
      // Update stats counter in header
      _updateMvStats(_mvAllPosts);
      return;
    }

    // Only inject into feed if the "For You" (all) tab is active
    if (vibeActiveTab !== 'all') return;

    const feed = document.getElementById('vibeFeed');
    if (!feed) return;

    // If feed shows a loading/empty placeholder, reload the whole feed instead
    if (feed.querySelector('.vibe-loading') || feed.querySelector('.vibe-empty')) {
      initVibeFeed();
      return;
    }

    // Build and prepend the new card with a slide-in animation
    const existingCards = feed.querySelectorAll('.vibe-card');
    const newIdx = existingCards.length; // append index (visual only)
    const html = buildVibeCard(post, newIdx);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const card = tmp.firstElementChild;
    if (!card) return;
    card.style.cssText += 'animation:vibeSlideIn 0.45s cubic-bezier(.2,1.1,.4,1) both;';
    feed.insertBefore(card, feed.firstChild);

    // Attach tap/double-tap listeners to the new card
    let lastTap = 0;
    card.addEventListener('click', e => {
      if (e.target.closest('.vibe-card-actions') ||
        e.target.closest('.vibe-card-info') ||
        e.target.closest('.vibe-card-delete-btn')) return;
      const now = Date.now();
      if (now - lastTap < 320) vibeDoubleTapLike(card, newIdx);
      lastTap = now;
      const vid = card.querySelector('.vibe-card-bg-video');
      if (vid) vibeToggleVideo(card, newIdx, vid);
    });
  });

  setupEnhancedSocketListeners();
}

function updateMessageInChat(msg) {
  const messageEl = document.getElementById(`msg-${msg.id}`);
  if (!messageEl) return;

  const textEl = messageEl.querySelector('.text');
  if (textEl) {
    textEl.innerHTML = `${msg.content} <span style="font-size:10px;color:#888;">(edited)</span>`;
  }
}

function removeMessageFromChat(id) {
  const messageEl = document.getElementById(`msg-${id}`);
  if (messageEl) messageEl.remove();
}


function openCommunityChat() {
  // Community chat is already open by default
  console.log('Community chat opened');
}

function openAnnouncementsChannel() {
  openExecutiveChat();
}

function searchChatMessages() {
  const query = document.getElementById('chatSearchBox')?.value.toLowerCase() || '';
  const messages = document.querySelectorAll('.whatsapp-message');
  messages.forEach(msg => {
    const text = msg.textContent.toLowerCase();
    msg.style.display = text.includes(query) ? '' : 'none';
  });
}

// ========================================
// PROFILE & SEARCH
// ========================================

function initializeSearchBar() {
  const searchBox = document.getElementById('searchBox');
  const searchResults = document.getElementById('searchResults');

  if (!searchBox) return;

  console.log('✅ Search initialized');

  searchBox.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    const query = e.target.value.trim();
    if (query.length < 2) {
      hideSearchResults();
      return;
    }

    if (searchResults) {
      searchResults.innerHTML = '<div class="no-results">🔍 Searching...</div>';
      searchResults.style.display = 'block';
    }

    searchTimeout = setTimeout(() => performUserSearch(query), 600);
  });

  searchBox.addEventListener('focus', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) performUserSearch(query);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) hideSearchResults();
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
  if (!searchResults) return;

  try {
    console.log('🔍 Searching:', query);
    const data = await apiCall(`/api/search/users?query=${encodeURIComponent(query)}`, 'GET');

    if (!data.success) throw new Error('Search failed');
    displaySearchResults(data.users || []);
  } catch (error) {
    console.error('❌ Search:', error);
    searchResults.innerHTML = '<div class="no-results" style="color:#ff6b6b;">❌ Search failed</div>';
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

  // Pre-seed the profile cache with search result data so clicking is instant
  if (!window._mpcCache) window._mpcCache = {};
  if (!window._mpcCacheTime) window._mpcCacheTime = {};
  users.forEach(u => {
    if (u && u.id && !window._mpcCache[u.id]) {
      window._mpcCache[u.id] = u;
      window._mpcCacheTime[u.id] = Date.now();
    }
  });

  let html = '';
  users.forEach(user => {
    const avatarContent = user.profile_pic ?
      `<img src="${user.profile_pic}" alt="${user.username}">` : '👤';

    html += `
     <div class="search-result-item" onclick="showUserProfile('${user.id}')">
       <div class="search-result-avatar">${avatarContent}</div>
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
  if (searchResults) searchResults.style.display = 'none';
}

async function showUserProfile(userId) {
  hideSearchResults();
  const searchBox = document.getElementById('searchBox');
  if (searchBox) searchBox.value = '';

  // Show cached data INSTANTLY if available (no waiting for network)
  const cached = window._mpcCache && window._mpcCache[userId];
  if (cached) {
    _seedFollowState(userId, cached.isFollowing, cached.followersCount || 0);
    showProfilePage(cached, true);
  }

  try {
    const data = await apiCall(`/api/profile/${userId}`, 'GET');
    if (data.success && data.user) {
      // Seed follow state immediately from this authoritative fetch
      _seedFollowState(userId, data.user.isFollowing, data.user.followersCount || 0);
      // Update cache
      if (!window._mpcCache) window._mpcCache = {};
      window._mpcCache[userId] = data.user;
      // If we already showed cached data, just update counts silently
      if (cached) {
        // Update stats in place without full re-render
        const followersStat = document.getElementById('profileStatFollowers');
        const followingStat = document.getElementById('profileStatFollowing');
        const postsStat = document.getElementById('profileStatPosts');
        if (followersStat) followersStat.textContent = data.user.followersCount || 0;
        if (followingStat) followingStat.textContent = data.user.followingCount || 0;
        if (postsStat) postsStat.textContent = data.user.postCount || 0;
        // Update target user object
        if (window.currentProfileUser) {
          Object.assign(window.currentProfileUser, data.user);
        }
      } else {
        showProfilePage(data.user, true);
      }
    } else if (!cached) {
      showMessage('User not found', 'error');
    }
  } catch (error) {
    console.error('Show profile error:', error);
    if (!cached) {
      showMessage('Failed to load profile', 'error');
    }
  }
}


function showProfilePage(user, _dataAlreadyFresh = false) {
  const targetUser = user || currentUser;
  if (!targetUser) return;
  // Carry the freshness flag so fetchProfileStats can skip re-fetch
  targetUser._dataFresh = _dataAlreadyFresh;

  // Reset cached vibes so we always load the correct user's posts fresh
  _resetMvCache();

  // Store current profile user globally for toggleFollow
  window.currentProfileUser = targetUser;

  // Show the profile page section
  showPage('profile');

  // Populate Header
  const nameEl = document.getElementById('profilePageName');
  const userEl = document.getElementById('profilePageUsername');
  const avatarImg = document.getElementById('profilePageAvatarImg');
  const avatarInitial = document.getElementById('profilePageAvatarInitial');
  const collegeEl = document.getElementById('profileCollege');
  const regNoEl = document.getElementById('profileRegNo');
  const postsStat = document.getElementById('profileStatPosts');
  const followBtn = document.getElementById('followBtn');
  const followersStat = document.getElementById('profileStatFollowers');

  if (nameEl) nameEl.textContent = targetUser.name || targetUser.username;
  if (userEl) userEl.textContent = `@${targetUser.username}`;

  // Ownership Visibility
  const isOwn = currentUser && (targetUser.id === currentUser.id || targetUser.username === currentUser.username);

  // Real User ID Display - only show if viewing own profile
  const userIdEl = document.getElementById('profilePageUserId');
  if (userIdEl) {
    if (isOwn) {
      const shortId = targetUser.id ? targetUser.id.slice(-8).toUpperCase() : '000000';
      userIdEl.textContent = `ID: #${shortId}`;
      userIdEl.style.display = 'block';
    } else {
      userIdEl.style.display = 'none';
    }
  }

  // Avatar
  if (targetUser.profile_pic) {
    if (avatarImg) { avatarImg.src = targetUser.profile_pic; avatarImg.style.display = 'block'; }
    if (avatarInitial) avatarInitial.style.display = 'none';
  } else {
    if (avatarImg) avatarImg.style.display = 'none';
    if (avatarInitial) avatarInitial.style.display = 'block';
  }

  // Real data from database
  if (collegeEl) collegeEl.textContent = targetUser.college || 'No college set';
  if (regNoEl) regNoEl.textContent = targetUser.registration_number || targetUser.email || 'No email';
  if (postsStat) postsStat.textContent = targetUser.postCount || 0;
  if (followersStat) followersStat.textContent = targetUser.followersCount || 0;

  const followingStat = document.getElementById('profileStatFollowing');
  if (followingStat) followingStat.textContent = targetUser.followingCount || 0;

  // Set bio
  const bioEl = document.getElementById('profileBio');
  if (bioEl) bioEl.textContent = targetUser.bio || 'Tell the world about yourself...';

  // Instagram-style Note bubble
  const noteBubble = document.getElementById('profileNoteBubble');
  const noteText = document.getElementById('profileNoteText');
  if (noteBubble && noteText) {
    const isOwnNote = currentUser && (targetUser.id === currentUser.id);
    const userNote = targetUser.note || (isOwnNote ? localStorage.getItem('vibeNote_' + currentUser.id) : null);
    if (userNote) {
      noteText.textContent = userNote;
      noteBubble.style.display = 'block';
    } else if (isOwnNote) {
      noteText.textContent = '💭 Tap to add a note';
      noteBubble.style.display = 'block';
    } else {
      noteBubble.style.display = 'none';
    }
  }

  // Dynamic Badges - based on REAL data
  const badgesEl = document.getElementById('profilePageBadges');
  if (badgesEl) {
    let badges = '';
    // Premium badge
    if (targetUser.isPremium || (targetUser.subscription && targetUser.subscription.plan)) {
      const plan = targetUser.subscription ? targetUser.subscription.plan : 'noble';
      if (plan === 'royal') {
        badges += '<span class="badge-item" style="background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));color:#FFD700;">👑 Royal</span>';
      } else {
        badges += '<span class="badge-item" style="background:rgba(192,192,192,0.2);color:#c0c0c0;">🥈 Noble</span>';
      }
    }
    // Community badge
    if (targetUser.college) {
      badges += `<span class="badge-item">🎓 ${targetUser.college}</span>`;
    }
    // Verified badge (if has email)
    if (targetUser.email || targetUser.registration_number) {
      badges += '<span class="badge-item" style="background:rgba(59,130,246,0.2);color:#60a5fa;">✓ Verified</span>';
    }
    badgesEl.innerHTML = badges || '<span class="badge-item">🆕 New Member</span>';
  }

  // ── Set global so dmBtn can find who to message ──────────────────
  currentProfileUserId = isOwn ? null : (targetUser.id || null);

  document.querySelectorAll('.edit-cover-btn, .avatar-edit-overlay, .btn-micro, .profile-edit-menu-wrap').forEach(btn => {
    btn.style.display = isOwn ? 'block' : 'none';
  });

  // Handle Follow Button
  if (followBtn) {
    if (isOwn) {
      followBtn.style.display = 'none';
    } else {
      followBtn.style.display = 'block';
      const isFollowing = targetUser.isFollowing;
      if (isFollowing) {
        followBtn.innerHTML = '<span class="follow-check-anim">✓</span> Following';
        followBtn.className = 'btn-secondary follow-btn-following';
        followBtn.style.opacity = '1';
      } else {
        followBtn.innerHTML = 'Follow';
        followBtn.className = 'btn-primary follow-btn-not-following';
        followBtn.style.opacity = '1';
      }
    }
  }

  // Handle DM Button — show only when viewing someone else's profile
  const dmBtn = document.getElementById('dmBtn');
  if (dmBtn) {
    dmBtn.style.display = isOwn ? 'none' : 'block';
  }

  // Messages tab — owner-only inbox, hidden when viewing someone else's profile
  const messagesTabBtn = document.getElementById('messagesTabBtn');
  if (messagesTabBtn) {
    messagesTabBtn.style.display = isOwn ? '' : 'none';
  }

  // Admin tab — owner-only and can be restricted to specific users later
  const adminTabBtn = document.getElementById('adminTabBtn');
  if (adminTabBtn) {
    // For now, making it visible to the owner so you can test it!
    adminTabBtn.style.display = isOwn ? 'inline-block' : 'none';
  }

  // Only re-fetch stats if data wasn't already fresh from showUserProfile
  if (!targetUser._dataFresh) {
    fetchProfileStats(targetUser);
  } else {
    // Data is already authoritative - just seed the follow state and sync UI
    _seedFollowState(targetUser.id, targetUser.isFollowing, targetUser.followersCount || 0);
    targetUser._dataFresh = false; // Reset flag
  }

  // Pre-fetch My Vibes silently so it's instant when the tab is clicked
  if (isOwn) {
    setTimeout(() => _prefetchMyVibes(), 600);
  }

  // Load default tab
  switchProfileTab('info');
}

// Track in-flight follow actions to prevent race conditions
let _followInFlight = {}; // userId -> timestamp of last follow action

// Fetch real stats from backend
async function fetchProfileStats(targetUser) {
  if (!targetUser || !targetUser.id) return;
  try {
    const result = await apiCall(`/api/profile/${targetUser.id}`);
    if (result && result.user) {
      const u = result.user;
      // Update DOM counts (counts are always from server - authoritative)
      const followersStat = document.getElementById('profileStatFollowers');
      const followingStat = document.getElementById('profileStatFollowing');
      const postsStat = document.getElementById('profileStatPosts');
      if (followersStat) followersStat.textContent = u.followersCount || 0;
      if (followingStat) followingStat.textContent = u.followingCount || 0;
      if (postsStat) postsStat.textContent = u.postCount || 0;
      // Update counts on target object
      targetUser.followersCount = u.followersCount || 0;
      targetUser.followingCount = u.followingCount || 0;
      targetUser.postCount = u.postCount || 0;

      // Only update follow state if no action is in-flight for this user
      // This prevents a slow fetchProfileStats from overwriting a user's just-clicked follow
      const inFlight = _followInFlight[targetUser.id] || 0;
      const isRecentAction = (Date.now() - inFlight) < 5000; // 5s grace window
      if (!isRecentAction) {
        targetUser.isFollowing = u.isFollowing;
        _seedFollowState(targetUser.id, u.isFollowing, u.followersCount || 0);
        if (window._mpcCache && window._mpcCache[targetUser.id]) {
          window._mpcCache[targetUser.id].isFollowing = u.isFollowing;
          window._mpcCache[targetUser.id].followersCount = u.followersCount || 0;
        }
        if (u.isFollowing !== undefined) {
          const followBtn = document.getElementById('followBtn');
          const isOwnProfile = currentUser && (targetUser.id === currentUser.id);
          if (followBtn && !isOwnProfile && followBtn.style.display !== 'none') {
            if (u.isFollowing) {
              followBtn.innerHTML = '<span class="follow-check-anim">✓</span> Following';
              followBtn.className = 'btn-secondary follow-btn-following';
              followBtn.style.opacity = '1';
            } else {
              followBtn.innerHTML = 'Follow';
              followBtn.className = 'btn-primary follow-btn-not-following';
              followBtn.style.opacity = '1';
            }
            followBtn.disabled = false;
          }
        }
      } else {
        // In-flight action: still update the follower counts (accurate from server)
        // but do NOT touch isFollowing state
        _followState[targetUser.id] = {
          ..._followState[targetUser.id],
          followersCount: u.followersCount || 0
        };
      }
    }
  } catch (e) {
    console.log('Could not fetch profile stats:', e);
  }
}

async function toggleFollow() {
  if (!currentUser || !window.currentProfileUser) return;
  const target = window.currentProfileUser;
  const btn = document.getElementById('followBtn');
  if (btn) {
    btn.disabled = true;
    // Instant visual feedback — pulse animation
    btn.classList.add('follow-btn-pulse');
    setTimeout(() => btn.classList.remove('follow-btn-pulse'), 600);
  }
  const result = await centralToggleFollow(target.id, target.username, { isFollowing: target.isFollowing });
  if (btn) btn.disabled = false;
  // Show a clear toast so user knows something happened
  if (result) {
    const msg = result.isFollowing
      ? `✅ You are now following @${target.username}`
      : `👋 You unfollowed @${target.username}`;
    showMessage(msg, 'success');
  }
}

// ── Instagram-style Note editing ──
function editProfileNote() {
  if (!currentUser || !window.currentProfileUser || window.currentProfileUser.id !== currentUser.id) return;

  const currentNote = localStorage.getItem('vibeNote_' + currentUser.id) || '';

  // Create a beautiful note editor modal
  let existing = document.getElementById('noteEditModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'noteEditModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
  modal.innerHTML = `
    <div style="background:rgba(26,25,51,0.97);border:1px solid rgba(167,139,250,0.25);border-radius:20px;padding:28px;width:320px;max-width:90vw;box-shadow:0 24px 64px rgba(0,0,0,0.8);">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:32px;margin-bottom:8px;">💭</div>
        <h3 style="margin:0;color:#fff;font-size:18px;font-weight:700;">Your Note</h3>
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:4px 0 0;">Like Instagram — others see this on your profile</p>
      </div>
      <input id="noteEditInput" type="text" value="${currentNote.replace(/"/g, '&quot;')}" maxlength="30" placeholder="What's on your mind?"
        style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(167,139,250,0.3);color:#fff;border-radius:12px;padding:12px 16px;font-size:15px;box-sizing:border-box;outline:none;text-align:center;">
      <div style="text-align:right;margin-top:4px;font-size:11px;color:rgba(255,255,255,0.3);" id="noteCharCount">${currentNote.length}/30</div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button onclick="document.getElementById('noteEditModal').remove()"
          style="flex:1;background:rgba(255,255,255,0.07);border:none;color:#fff;border-radius:10px;padding:11px;cursor:pointer;font-size:13px;">Cancel</button>
        <button onclick="saveProfileNote()"
          style="flex:1;background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;color:#fff;border-radius:10px;padding:11px;cursor:pointer;font-weight:600;font-size:13px;">Save Note</button>
      </div>
      ${currentNote ? '<button onclick="clearProfileNote()" style="width:100%;background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;margin-top:8px;padding:6px;">Remove Note</button>' : ''}
    </div>
  `;
  document.body.appendChild(modal);

  const inp = document.getElementById('noteEditInput');
  inp.focus();
  inp.addEventListener('input', () => {
    document.getElementById('noteCharCount').textContent = `${inp.value.length}/30`;
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function saveProfileNote() {
  const inp = document.getElementById('noteEditInput');
  if (!inp || !currentUser) return;
  const note = inp.value.trim().slice(0, 30);
  localStorage.setItem('vibeNote_' + currentUser.id, note);

  // Update the bubble
  const noteText = document.getElementById('profileNoteText');
  if (noteText) noteText.textContent = note || '💭 Tap to add a note';

  // Save to backend if we have an endpoint
  apiCall('/api/profile/note', 'POST', { note }).catch(() => { });

  document.getElementById('noteEditModal')?.remove();
  showMessage(note ? '💭 Note saved!' : '💭 Note cleared', 'success');
}

function clearProfileNote() {
  localStorage.removeItem('vibeNote_' + currentUser?.id);
  const noteText = document.getElementById('profileNoteText');
  if (noteText) noteText.textContent = '💭 Tap to add a note';
  document.getElementById('noteEditModal')?.remove();
  apiCall('/api/profile/note', 'POST', { note: '' }).catch(() => { });
  showMessage('💭 Note removed', 'success');
}

function switchProfileTab(tabName, event) {
  // Update buttons
  document.querySelectorAll('.profile-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (event) {
    event.currentTarget.classList.add('active');
  } else {
    // Find button by text or data-tab if I had it, otherwise just first one or find by onclick
    const btns = document.querySelectorAll('.profile-tab-btn');
    btns.forEach(btn => {
      if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
        btn.classList.add('active');
      }
    });
  }

  // Update content
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const targetPane = document.getElementById('profileTab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (targetPane) targetPane.classList.add('active');

  // Specific tab loading logic
  if (tabName === 'cart') loadCartItems();
  else if (tabName === 'shipping') loadShippingDetails();
  else if (tabName === 'orders') loadOrderHistory();
  else if (tabName === 'vibes') loadMyVibes();
  else if (tabName === 'admin') loadAdminOrders();
}

// ╔══════════════════════════════════════════════════════════════╗
// ║               MY VIBES — Profile Grid + Editor              ║
// ╚══════════════════════════════════════════════════════════════╝

let _mvAllPosts = [];        // full list from API (filtered client-side)
let _mvActiveFilter = 'all'; // current filter chip
let _mvActivePostId = null;  // post open in detail modal
let _mvDetailImgIdx = 0;     // current image index inside detail modal
let _mvRTInterval = null;    // real-time polling handle

// ── Silent background pre-fetch (called when profile page opens) ──
async function _prefetchMyVibes() {
  try {
    // Only pre-fetch for the logged-in user's own profile
    const posts = await _fetchMyPostsFromAPI(currentUser?.id);
    _mvAllPosts = posts;
    _updateMvStats(_mvAllPosts);
    // If the vibes tab is already visible, render it
    const pane = document.getElementById('profileTabVibes');
    if (pane && pane.classList.contains('active')) {
      _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
    }
  } catch (e) { /* silent */ }
}

// ── Reset stale cache whenever opening a new profile ──
function _resetMvCache() {
  _mvAllPosts = [];
  _mvActiveFilter = 'all';
  clearInterval(_mvRTInterval);
}

// ── Fetch helper: fetches posts for a given user ID (or current user) ──
async function _fetchMyPostsFromAPI(userId) {
  if (!currentUser || !currentUser.id) return [];
  const targetId = userId || currentUser.id;
  const isOwnProfile = targetId === currentUser.id;

  try {
    if (isOwnProfile) {
      // Use the fast /api/posts/my endpoint for own profile
      const data = await apiCall('/api/posts/my', 'GET');
      if (data && data.posts) return data.posts;
    } else {
      // Use the per-user endpoint for other profiles
      const data = await apiCall(`/api/posts/user/${targetId}`, 'GET');
      if (data && data.posts) return data.posts;
    }
  } catch (e) {
    if (e.status !== 404 && e.status !== 405) throw e;
  }

  // Fallback: fetch all posts and filter by target user
  try {
    const data = await apiCall('/api/posts', 'GET');
    const all = data.posts || [];
    return all.filter(p => {
      const uid = p.user_id || (p.users && p.users.id);
      return uid === targetId;
    });
  } catch (e2) {
    throw e2;
  }
}

// ── Load & render ───────────────────────────────────────────────
async function loadMyVibes() {
  const grid = document.getElementById('myVibesGrid');
  if (!grid) return;

  // Determine whose profile we're viewing
  const profileUserId = window.currentProfileUser ? window.currentProfileUser.id : (currentUser ? currentUser.id : null);
  const isOwnProfile = currentUser && profileUserId === currentUser.id;

  // If we already have data from the background pre-fetch AND it's our own profile, render immediately
  if (isOwnProfile && _mvAllPosts.length > 0) {
    _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
    _updateMvStats(_mvAllPosts);
    // Still refresh in background to get latest counts
    _silentRefreshMyVibes();
    return;
  }

  // show skeleton
  grid.innerHTML = `<div class="mv-skeleton-grid">
    ${Array(9).fill('<div class="mv-skeleton-cell"></div>').join('')}
  </div>`;

  try {
    const posts = await _fetchMyPostsFromAPI(profileUserId);
    _mvAllPosts = isOwnProfile ? posts : posts; // store only for own profile caching
    _renderMyVibesGrid(_mvFilterPosts(posts, _mvActiveFilter));
    _updateMvStats(posts);

    // only poll for refreshes on own profile
    if (isOwnProfile) {
      clearInterval(_mvRTInterval);
      _mvRTInterval = setInterval(() => _silentRefreshMyVibes(), 30000);
    }

  } catch (err) {
    console.error('My Vibes load error:', err);
    grid.innerHTML = `<div class="mv-empty">
      <div class="mv-empty-icon">🌌</div>
      <p>Couldn't load your vibes.<br><button onclick="loadMyVibes()">Try again</button></p>
    </div>`;
  }
}

async function _silentRefreshMyVibes() {
  try {
    const profileUserId = window.currentProfileUser ? window.currentProfileUser.id : (currentUser ? currentUser.id : null);
    const posts = await _fetchMyPostsFromAPI(profileUserId);
    _mvAllPosts = posts;
    _updateMvStats(_mvAllPosts);
    const pane = document.getElementById('profileTabVibes');
    if (pane && pane.classList.contains('active')) {
      _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
    }
  } catch (e) { /* silent */ }
}

function _mvFilterPosts(posts, filter) {
  if (filter === 'photos') return posts.filter(p =>
    (p.media || []).some(m => m.type === 'image' || (!m.type && m.url)));
  if (filter === 'videos') return posts.filter(p =>
    (p.media || []).some(m => m.type === 'video'));
  if (filter === 'text') return posts.filter(p => !(p.media && p.media.length));
  return posts;
}

function filterMyVibes(filter, btn) {
  _mvActiveFilter = filter;
  document.querySelectorAll('.mv-filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, filter));
}

function _updateMvStats(posts) {
  const totalLikes = posts.reduce((s, p) => s + (p.like_count || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comment_count || 0), 0);
  const withMedia = posts.filter(p => p.media && p.media.length).length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = vibeFmt ? vibeFmt(val) : val;
  };
  setEl('mvStatPosts', posts.length);
  setEl('mvStatLikes', totalLikes);
  setEl('mvStatComments', totalComments);
  setEl('mvStatMedia', withMedia);
  // also update header stat
  const hp = document.getElementById('profileStatPosts');
  if (hp) hp.textContent = posts.length;
}

function _patchMvGridCounts(posts) {
  posts.forEach(p => {
    const lcEl = document.querySelector(`.mv-cell[data-id="${p.id}"] .mv-cell-likes`);
    if (lcEl) lcEl.textContent = vibeFmt ? vibeFmt(p.like_count || 0) : (p.like_count || 0);
  });
}

function _renderMyVibesGrid(posts) {
  const grid = document.getElementById('myVibesGrid');
  if (!grid) return;

  if (!posts.length) {
    grid.innerHTML = `<div class="mv-empty">
      <div class="mv-empty-icon">🌌</div>
      <h3>No vibes yet</h3>
      <p>Posts you share will appear here</p>
    </div>`;
    return;
  }

  grid.innerHTML = `<div class="mv-grid-inner">
    ${posts.map((p, i) => _buildMvCell(p, i)).join('')}
  </div>`;
}

function _buildMvCell(post, idx) {
  const media = Array.isArray(post.media) ? post.media : [];
  const first = media[0];
  const isVideo = first?.type === 'video';
  const isText = !media.length;
  const likes = (vibeFmt ? vibeFmt(post.like_count || 0) : (post.like_count || 0));
  const multi = media.length > 1;
  const timeAgo = (vibeTimeAgo || (() => ''))(post.created_at);

  let thumb = '';
  if (isVideo) {
    thumb = `<video class="mv-cell-media" src="${first.url}" muted preload="metadata" playsinline
               onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video>
             <div class="mv-cell-video-badge">
               <svg viewBox="0 0 24 24" width="10" height="10"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg>
             </div>`;
  } else if (first) {
    thumb = `<img class="mv-cell-media" src="${proxyMediaUrl(first.url || first)}" alt="" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${first.url || first}'}">`;
  } else {
    const grad = (vibeGradient || (() => '#1a1a2e'))(post.id);
    const preview = (post.content || '').slice(0, 40) || '✨';
    thumb = `<div class="mv-cell-text-bg" style="background:${grad}">
               <span class="mv-cell-text-preview">${preview}</span>
             </div>`;
  }

  return `<div class="mv-cell" data-id="${post.id}" data-idx="${idx}"
               onclick="openMvDetail('${post.id}')">
    ${thumb}
    <div class="mv-cell-overlay">
      <span class="mv-cell-likes">
        <svg viewBox="0 0 24 24" width="12" height="12" style="fill:#ff3040;stroke:none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>${likes}
      </span>
      ${multi ? `<span class="mv-cell-multi">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2">
          <rect x="7" y="3" width="14" height="14" rx="2"/><path d="M3 7v14a2 2 0 0 0 2 2h14"/>
        </svg>
      </span>` : ''}
    </div>
    <div class="mv-cell-dest">${post.posted_to === 'community' ? '🎓' : '👤'}</div>
  </div>`;
}

// ── Detail Modal ────────────────────────────────────────────────
function openMvDetail(postId) {
  const post = _mvAllPosts.find(p => p.id === postId || p.id == postId);
  if (!post) return;
  _mvActivePostId = postId;
  _mvDetailImgIdx = 0;

  const modal = document.getElementById('myVibeDetailModal');
  if (!modal) return;

  // Populate
  _populateMvDetail(post);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('mv-modal-open'));
}

function _populateMvDetail(post) {
  const media = Array.isArray(post.media) ? post.media : [];
  _mvDetailImgIdx = 0;

  // Media area
  const mediaEl = document.getElementById('mvDetailMedia');
  if (mediaEl) {
    if (media.length) {
      mediaEl.innerHTML = _buildMvDetailSlide(media, 0);
    } else {
      const grad = (vibeGradient || (() => '#1a1a2e'))(post.id);
      const txt = (post.content || '').slice(0, 120) || '✨';
      mediaEl.innerHTML = `<div class="mv-detail-text-bg" style="background:${grad}">
        <p class="mv-detail-text-body">${txt}</p>
      </div>`;
    }
  }

  // Dots
  const dotsEl = document.getElementById('mvDetailDots');
  if (dotsEl) {
    if (media.length > 1) {
      dotsEl.innerHTML = media.map((_, i) =>
        `<span class="mv-dot ${i === 0 ? 'active' : ''}" onclick="mvSlide(${i})"></span>`
      ).join('');
      dotsEl.style.display = 'flex';
    } else {
      dotsEl.innerHTML = '';
      dotsEl.style.display = 'none';
    }
  }

  // Determine the post author (could be viewing someone else's profile)
  const postAuthor = post.users || {};
  const authorPic = postAuthor.profile_pic || null;
  const authorName = postAuthor.username || currentUser?.username || 'User';

  // Avatar — show POST AUTHOR's avatar, not always currentUser's
  const avEl = document.getElementById('mvDetailAvatar');
  if (avEl) {
    if (authorPic) {
      avEl.innerHTML = `<img src="${authorPic}" alt="">`;
    } else {
      avEl.textContent = authorName.charAt(0).toUpperCase();
    }
  }

  // Meta
  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };
  setT('mvDetailUsername', '@' + authorName);
  setT('mvDetailTime', (vibeTimeAgo || (() => ''))(post.created_at));
  setT('mvDetailDest', post.posted_to === 'community' ? '🎓 College' : '👤 Profile');
  setT('mvDetailCaption', post.content || '');
  setT('mvDetailLikes', vibeFmt ? vibeFmt(post.like_count || 0) : (post.like_count || 0));
  setT('mvDetailComments', vibeFmt ? vibeFmt(post.comment_count || 0) : (post.comment_count || 0));
  setT('mvDetailShares', vibeFmt ? vibeFmt(post.share_count || 0) : (post.share_count || 0));

  // Show Edit/Delete ONLY if current user owns this post
  const isPostOwner = currentUser && (post.user_id === currentUser.id);
  const editBtn = document.getElementById('mvBtnEdit');
  const deleteBtn = document.getElementById('mvBtnDelete');
  if (editBtn) editBtn.style.display = isPostOwner ? '' : 'none';
  if (deleteBtn) deleteBtn.style.display = isPostOwner ? '' : 'none';

  // Reset edit mode
  cancelMvEdit();

  // Swipe support for mobile
  _attachMvSwipe(document.getElementById('mvDetailMedia'), media);
}

function _buildMvDetailSlide(media, idx) {
  const item = media[idx];
  if (!item) return '';
  if (item.type === 'video') {
    return `<video class="mv-detail-slide-video" src="${item.url}" controls playsinline autoplay></video>`;
  }
  return `<img class="mv-detail-slide-img" src="${proxyMediaUrl(item.url || item)}" alt="" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${item.url || item}'}">
          <div class="mv-detail-nav">
            ${idx > 0 ? `<button class="mv-nav-btn mv-nav-prev" onclick="mvSlide(${idx - 1})">‹</button>` : ''}
            ${idx < media.length - 1 ? `<button class="mv-nav-btn mv-nav-next" onclick="mvSlide(${idx + 1})">›</button>` : ''}
          </div>`;
}

function mvSlide(idx) {
  const post = _mvAllPosts.find(p => p.id === _mvActivePostId || p.id == _mvActivePostId);
  if (!post) return;
  const media = Array.isArray(post.media) ? post.media : [];
  _mvDetailImgIdx = idx;

  const mediaEl = document.getElementById('mvDetailMedia');
  if (mediaEl) {
    mediaEl.style.opacity = '0';
    setTimeout(() => {
      mediaEl.innerHTML = _buildMvDetailSlide(media, idx);
      mediaEl.style.opacity = '1';
    }, 150);
  }

  // Update dots
  document.querySelectorAll('.mv-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

// Touch swipe
function _attachMvSwipe(el, media) {
  if (!el || media.length < 2) return;
  let startX = 0;
  el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      const next = _mvDetailImgIdx + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < media.length) mvSlide(next);
    }
  }, { passive: true });
}

function closeMvDetail(event) {
  if (event && event.target !== document.getElementById('myVibeDetailModal')) return;
  closeMvDetailModal();
}
function closeMvDetailModal() {
  const modal = document.getElementById('myVibeDetailModal');
  if (!modal) return;
  modal.classList.remove('mv-modal-open');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    _mvActivePostId = null;
    // stop any playing video
    modal.querySelectorAll('video').forEach(v => { v.pause(); v.src = ''; });
  }, 280);
}

// ── Edit Caption ────────────────────────────────────────────────
function startMvEdit() {
  const post = _mvAllPosts.find(p => p.id === _mvActivePostId || p.id == _mvActivePostId);
  if (!post) return;
  const editArea = document.getElementById('mvCaptionEditArea');
  if (editArea) editArea.value = post.content || '';
  document.getElementById('mvCaptionWrap')?.style && (document.getElementById('mvCaptionWrap').style.display = 'none');
  document.getElementById('mvEditWrap').style.display = 'block';
  document.getElementById('mvBtnEdit').style.display = 'none';
  editArea?.focus();
}

function cancelMvEdit() {
  const cw = document.getElementById('mvCaptionWrap');
  const ew = document.getElementById('mvEditWrap');
  const eb = document.getElementById('mvBtnEdit');
  if (cw) cw.style.display = '';
  if (ew) ew.style.display = 'none';
  if (eb) eb.style.display = '';
}

async function saveMvCaption() {
  const newCaption = document.getElementById('mvCaptionEditArea')?.value.trim() ?? '';
  if (!_mvActivePostId) return;
  const saveBtn = document.querySelector('.mv-edit-save');
  if (saveBtn) { saveBtn.textContent = 'Saving…'; saveBtn.disabled = true; }

  try {
    await apiCall(`/api/posts/${_mvActivePostId}`, 'PATCH', { content: newCaption });

    // Update local cache
    const post = _mvAllPosts.find(p => p.id === _mvActivePostId || p.id == _mvActivePostId);
    if (post) post.content = newCaption;

    // Update modal caption
    const capEl = document.getElementById('mvDetailCaption');
    if (capEl) capEl.textContent = newCaption;

    cancelMvEdit();
    showMessage('✅ Caption updated!', 'success');
  } catch (err) {
    showMessage('❌ ' + (err.message || 'Update failed'), 'error');
  } finally {
    if (saveBtn) { saveBtn.textContent = 'Save'; saveBtn.disabled = false; }
  }
}

// ── Delete ──────────────────────────────────────────────────────
async function deleteMvPost() {
  if (!_mvActivePostId) return;
  if (!confirm('Delete this vibe? This cannot be undone.')) return;

  const delBtn = document.querySelector('.mv-btn-delete');
  if (delBtn) { delBtn.textContent = 'Deleting…'; delBtn.disabled = true; }

  try {
    await apiCall(`/api/posts/${_mvActivePostId}`, 'DELETE');
    showMessage('🗑️ Vibe deleted', 'success');

    // Remove from local cache & re-render
    _mvAllPosts = _mvAllPosts.filter(p => p.id !== _mvActivePostId && p.id != _mvActivePostId);
    closeMvDetailModal();
    _updateMvStats(_mvAllPosts);
    _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
  } catch (err) {
    showMessage('❌ ' + (err.message || 'Delete failed'), 'error');
    if (delBtn) { delBtn.textContent = 'Delete'; delBtn.disabled = false; }
  }
}

// ── Socket real-time: update like counts inside My Vibes ────────
(function _patchMvSocketLike() {
  const _orig = window.socket ? null : null; // wire after socket initialises
  const _onLike = (data) => {
    if (!data || !data.postId) return;
    const post = _mvAllPosts.find(p => p.id === data.postId || p.id == data.postId);
    if (!post) return;
    post.like_count = data.likeCount;
    // patch cell count
    const lcEl = document.querySelector(`.mv-cell[data-id="${data.postId}"] .mv-cell-likes`);
    if (lcEl) lcEl.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" style="fill:#ff3040;stroke:none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${vibeFmt ? vibeFmt(data.likeCount) : data.likeCount}`;
    // patch detail modal
    if (_mvActivePostId === data.postId || _mvActivePostId == data.postId) {
      const el = document.getElementById('mvDetailLikes');
      if (el) el.textContent = vibeFmt ? vibeFmt(data.likeCount) : data.likeCount;
    }
    _updateMvStats(_mvAllPosts);
  };

  // Attach once socket is available
  const _tryAttach = () => {
    if (window.socket) {
      window.socket.on('post_liked', _onLike);
    } else {
      setTimeout(_tryAttach, 2000);
    }
  };
  setTimeout(_tryAttach, 3000);
})();

// ─────────────────────────────────────────────────────────────────

function loadCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const summary = document.querySelector('.cart-summary');
  if (!container) return;

  const cart = [
    { id: 1, name: 'VibeX Premium Hoodie', price: 1499, img: '📦', qty: 1 },
    { id: 2, name: 'Smart Student Pack', price: 499, img: '🎒', qty: 1 }
  ];

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty. Start shopping!</p>
      </div>`;
    if (summary) summary.style.display = 'none';
    return;
  }

  let html = '';
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    html += `
      <div class="cart-item" style="display:flex;align-items:center;gap:20px;padding:20px;background:rgba(255,255,255,0.05);border-radius:15px;margin-bottom:15px;border:1px solid rgba(79,116,163,0.2);">
        <div style="font-size:40px;">${item.img}</div>
        <div style="flex:1;">
          <h4 style="color:white;margin:0 0 5px 0;">${item.name}</h4>
          <p style="color:#8da4d3;margin:0;font-size:14px;">Qty: ${item.qty} • ₹${item.price}</p>
        </div>
        <div style="font-weight:700;color:white;">₹${item.price * item.qty}</div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (summary) {
    summary.style.display = 'block';
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  }
}

function loadShippingDetails() {
  const container = document.getElementById('shippingAddressContent');
  if (!container) return;
  // Mock loading
  container.innerHTML = `
    <p><strong>${currentUser?.username || 'Premium User'}</strong></p>
    <p>Block B, Excellence Residency</p>
    <p>University Main Road, Tech Park</p>
    <p>PIN: 4620XX | India</p>
    <p style="margin-top:10px;font-size:12px;color:#4f74a3;">📞 +91 98765 43210</p>
  `;
}

async function loadOrderHistory() {
  const container = document.getElementById('orderHistoryContainer');
  if (!container) return;

  // Show loading skeleton
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0;">
      ${Array(3).fill(`
        <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
          <div style="height:16px;width:60%;background:rgba(255,255,255,0.06);border-radius:8px;margin-bottom:10px;"></div>
          <div style="height:12px;width:40%;background:rgba(255,255,255,0.04);border-radius:6px;"></div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    const data = await apiCall('/api/shop/orders', 'GET');
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <p>No orders yet.</p>
          <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:4px;">
            Shop on <a href="https://www.vibexpert.shop" target="_blank" style="color:#a78bfa;text-decoration:none;">vibexpert.shop</a> and your orders will appear here.
          </p>
        </div>`;
      return;
    }

    let html = '';
    orders.forEach(order => {
      const statusColors = {
        'paid': '#4ade80',
        'created': '#fbbf24',
        'failed': '#f87171',
        'shipped': '#60a5fa',
        'delivered': '#4ade80'
      };
      const statusLabels = {
        'paid': '✅ Paid',
        'created': '⏳ Pending',
        'failed': '❌ Failed',
        'shipped': '🚚 Shipped',
        'delivered': '📦 Delivered'
      };
      const statusColor = statusColors[order.status] || '#8da4d3';
      const statusLabel = statusLabels[order.status] || order.status;

      let items = [];
      try { items = JSON.parse(order.items); } catch (e) { }
      const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);

      const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      const shortOrderId = order.order_id ? order.order_id.slice(-12) : '—';

      html += `
        <div style="padding:20px;background:rgba(255,255,255,0.04);border-radius:16px;margin-bottom:12px;border:1px solid rgba(79,116,163,0.15);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
            <div>
              <h4 style="color:white;margin:0;font-size:14px;font-weight:700;">Order #${shortOrderId}</h4>
              <span style="color:rgba(255,255,255,0.4);font-size:11px;">${orderDate}</span>
            </div>
            <span style="color:${statusColor};font-weight:600;font-size:12px;background:${statusColor}15;padding:4px 10px;border-radius:20px;border:1px solid ${statusColor}30;">${statusLabel}</span>
          </div>
          ${items.length > 0 ? `
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
              ${items.slice(0, 3).map(i => `
                <div style="display:flex;justify-content:space-between;font-size:12px;">
                  <span style="color:rgba(255,255,255,0.6);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px;">${i.name || 'Item'} × ${i.quantity || 1}</span>
                  <span style="color:rgba(255,255,255,0.8);font-weight:600;">₹${((i.price || 0) * (i.quantity || 1)).toLocaleString()}</span>
                </div>
              `).join('')}
              ${items.length > 3 ? `<span style="font-size:11px;color:rgba(255,255,255,0.3);">+${items.length - 3} more item${items.length - 3 > 1 ? 's' : ''}</span>` : ''}
            </div>
          ` : ''}
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;">
            <span style="color:rgba(255,255,255,0.4);font-size:12px;">${itemCount} ${itemCount === 1 ? 'Item' : 'Items'}</span>
            <span style="color:white;font-weight:700;font-size:15px;">₹${(order.total_amount || 0).toLocaleString()}</span>
          </div>
          ${order.payment_id ? `<div style="font-size:10px;color:rgba(255,255,255,0.2);margin-top:6px;font-family:monospace;">Payment: ${order.payment_id}</div>` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('Load orders error:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <p>Could not load orders.</p>
        <button onclick="loadOrderHistory()" style="margin-top:8px;background:rgba(167,139,250,0.15);border:1px solid rgba(167,139,250,0.3);color:#a78bfa;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;">Retry</button>
      </div>`;
  }
}

// 👑 ADMIN ORDERS DASHBOARD 👑
async function loadAdminOrders() {
  const container = document.getElementById('adminOrdersContainer');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:40px;color:#a855f7;">🔄 Loading store operations...</div>`;

  try {
    const data = await apiCall('/api/admin/shop-orders', 'GET');
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.4);">No orders found in the system yet.</div>`;
      return;
    }

    let html = '';
    orders.forEach(order => {
      let items = [];
      let addr = {};
      try { items = JSON.parse(order.items); } catch (e) { }
      try { addr = JSON.parse(order.shipping_address) || {}; } catch (e) { }

      const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
      const userEmail = order.users?.email || 'N/A';
      const userName = order.users?.username || 'N/A';
      const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const shortOrderId = order.order_id ? order.order_id.slice(-10) : '—';

      const statusColors = {
        'paid': '#10b981',
        'created': '#fbbf24',
        'failed': '#ef4444',
        'shipped': '#3b82f6',
        'delivered': '#8b5cf6'
      };

      const currentStatusColor = statusColors[order.status] || '#94a3b8';

      html += `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;margin-bottom:16px;overflow:hidden;">
          
          <!-- Header -->
          <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.2);">
            <div>
              <div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:4px;">ID: ${order.order_id}</div>
              <div style="color:#f1f5f9;font-weight:700;font-size:15px;">₹${order.total_amount.toLocaleString()} <span style="color:#64748b;font-weight:400;font-size:13px;">— ${itemCount} items</span></div>
            </div>
            <div style="text-align:right;">
              <select 
                onchange="updateOrderStatus('${order.order_id}', this.value)" 
                style="background:${currentStatusColor}15;color:${currentStatusColor};border:1px solid ${currentStatusColor}30;padding:6px 10px;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;outline:none;"
              >
                <option value="created" ${order.status === 'created' ? 'selected' : ''}>Pending Payment</option>
                <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid (Pending Dispatch)</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="failed" ${order.status === 'failed' ? 'selected' : ''}>Failed</option>
              </select>
              <div style="color:#64748b;font-size:11px;margin-top:6px;">${orderDate}</div>
            </div>
          </div>

          <!-- Body -->
          <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            
            <!-- Customer Details -->
            <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
              <h4 style="margin:0 0 10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Customer</h4>
              <div style="color:#f1f5f9;font-size:13px;margin-bottom:4px;"><strong>UID:</strong> @${userName}</div>
              <div style="color:#f1f5f9;font-size:13px;margin-bottom:4px;"><strong>Email:</strong> ${userEmail}</div>
              <hr style="border:0;border-top:1px dashed rgba(255,255,255,0.1);margin:10px 0;">
              <div style="color:#f1f5f9;font-size:13px;margin-bottom:4px;"><strong>Ship To:</strong> ${addr.fullName || '—'}</div>
              <div style="color:#f1f5f9;font-size:13px;margin-bottom:4px;"><strong>Phone:</strong> ${addr.phone || '—'}</div>
              <div style="color:#94a3b8;font-size:12px;line-height:1.4;margin-top:6px;">
                ${addr.street || ''}<br>${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}
              </div>
            </div>

            <!-- Items -->
            <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
              <h4 style="margin:0 0 10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Products</h4>
              <div style="max-height:150px;overflow-y:auto;padding-right:4px;">
                ${items.map(item => `
                  <div style="display:flex;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <img src="${item.image}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;background:#000;">
                    <div style="flex:1;">
                      <div style="color:#f1f5f9;font-size:12px;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${item.name}</div>
                      <div style="color:#94a3b8;font-size:11px;">Qty: ${item.quantity} × ₹${item.price}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
          <div style="padding:10px 16px;background:rgba(0,0,0,0.3);border-top:1px solid rgba(255,255,255,0.05);font-size:11px;color:#64748b;font-family:monospace;">
            Payment Ref: ${order.payment_id || 'Not captured'} | Supabase UID: ${order.user_id}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (error) {
    console.error('Admin Load Error:', error);
    container.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">Failed to load system data!<br><button onclick="loadAdminOrders()" style="margin-top:12px;background:rgba(239,68,68,0.2);color:#ef4444;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Retry</button></div>`;
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await apiCall(`/api/admin/shop-orders/${orderId}/status`, 'PUT', { status: newStatus });
    if (res.success) {
      showMessage('Order status updated successfully!', 'success');
      loadAdminOrders(); // Refresh to update colors
    } else {
      showMessage('Failed to update order status.', 'error');
    }
  } catch (err) {
    console.error('Update status error:', err);
    showMessage('Error communicating with server.', 'error');
  }
}

// PROFILE EDITING & PHOTO UPLOADS
function uploadProfilePic() {
  document.getElementById('profilePicInput').click();
}

function handleProfilePicUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentUser) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    currentUser.profile_pic = dataUrl;

    // Update UI components
    const profileImg = document.getElementById('profilePageAvatarImg');
    const profileInitial = document.getElementById('profilePageAvatarInitial');
    const mainAvatarImg = document.getElementById('profileAvatarImg');
    const mainAvatarInitial = document.getElementById('profileAvatarInitial');

    if (profileImg) {
      profileImg.src = dataUrl;
      profileImg.style.display = 'block';
    }
    if (profileInitial) profileInitial.style.display = 'none';

    if (mainAvatarImg) {
      mainAvatarImg.src = dataUrl;
      mainAvatarImg.style.display = 'block';
    }
    if (mainAvatarInitial) mainAvatarInitial.style.display = 'none';

    saveUserToLocal();
    showMessage('✨ Profile picture updated!', 'success');
  };
  reader.readAsDataURL(file);
}


function showEditProfilePage() {
  if (!currentUser) return;

  // Populate form
  const nameInput = document.getElementById('editName');
  const userInput = document.getElementById('editUsername');
  const bioInput = document.getElementById('editBio');
  const collegeInput = document.getElementById('editCollege');
  const regNoInput = document.getElementById('editRegNo');

  if (nameInput) nameInput.value = currentUser.username || ''; // Standard username as name
  if (userInput) userInput.value = currentUser.username || '';
  if (bioInput) bioInput.value = currentUser.bio || '';
  if (collegeInput) collegeInput.value = currentUser.college || '';
  if (regNoInput) regNoInput.value = currentUser.registration_number || '';

  showPage('editProfile');
}

async function saveProfileChanges() {
  if (!currentUser) return;

  const newName = document.getElementById('editName').value;
  const newUsername = document.getElementById('editUsername').value;
  const newBio = document.getElementById('editBio').value;
  const newCollege = document.getElementById('editCollege').value;
  const newRegNo = document.getElementById('editRegNo').value;

  try {
    showMessage('Saving profile...', 'info');

    const result = await apiCall('/api/profile/update', 'PUT', {
      username: newUsername,
      bio: newBio,
      college: newCollege,
      registration_number: newRegNo
    });

    if (result.success) {
      // Update currentUser with server response
      currentUser = result.user;
      saveUserToLocal();

      // Refresh UI
      const userNameDisplay = document.getElementById('userName');
      if (userNameDisplay) userNameDisplay.textContent = currentUser.username;

      showProfilePage(currentUser);
      showMessage('🚀 Profile updated! VIBE HARD.', 'success');
    }
  } catch (error) {
    console.error('Save profile error:', error);
    showMessage('❌ Failed to save profile', 'error');
  }
}

function editProfileBio() {
  if (!currentUser) return;
  const modal = document.getElementById('bioEditModal');
  const textarea = document.getElementById('modalBioText');
  const userInput = document.getElementById('modalUsernameText');
  const countDisplay = document.getElementById('bioCharCount');

  if (modal) {
    if (textarea) {
      textarea.value = currentUser.bio || '';
      if (countDisplay) countDisplay.textContent = `${textarea.value.length} / 200`;

      // Character counter
      textarea.oninput = () => {
        if (countDisplay) countDisplay.textContent = `${textarea.value.length} / 200`;
      };
    }
    if (userInput) userInput.value = currentUser.username || '';

    modal.style.display = 'flex';
  }
}

function saveBioFromModal() {
  const textarea = document.getElementById('modalBioText');
  const userInput = document.getElementById('modalUsernameText');

  if (currentUser) {
    let changed = false;

    if (textarea) {
      const newBio = textarea.value;
      if (currentUser.bio !== newBio) {
        currentUser.bio = newBio;
        changed = true;
      }
    }

    if (userInput) {
      const newUsername = userInput.value.trim();
      if (newUsername && currentUser.username !== newUsername) {
        currentUser.username = newUsername;
        changed = true;

        // Update global UI elements for username
        const navUsername = document.getElementById('userName');
        if (navUsername) navUsername.textContent = newUsername;
      }
    }

    if (changed) {
      saveUserToLocal();
      showProfilePage(currentUser);
      showMessage('🚀 Profile updated! Looking fresh.', 'success');
    }

    closeModal('bioEditModal');
  }
}

function editShippingAddress() {
  // Can be part of edit profile too, but for now keeping it simple
  const modal = prompt("Enter Shipping Address:", "Excellence Residency, Block B...");
  if (modal) {
    const container = document.getElementById('shippingAddressContent');
    if (container) container.innerHTML = `< p > ${modal}</p > `;
    showMessage('🚚 Shipping info updated!', 'success');
  }
}

function saveUserToLocal() {
  if (currentUser) {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
}


// ========================================
// NAVIGATION
// ========================================

// ==========================================
// HEADER AUTO-HIDE — for communities, posts, realvibe
// ==========================================

let _headerHideTimer = null;

function enableHeaderAutohide() {
  const header = document.querySelector('.header');
  if (!header) return;

  document.body.classList.add('header-autohide');
  header.classList.remove('header-peeking');

  // Immediately expand whatsapp container to full height when header hides
  const chatContainer = document.querySelector('.whatsapp-container');
  if (chatContainer) {
    chatContainer.style.top = '0';
    chatContainer.style.height = '100vh';
  }

  // Create hover zone if not exists
  let zone = document.getElementById('headerHoverZone');
  if (!zone) {
    zone = document.createElement('div');
    zone.id = 'headerHoverZone';
    zone.className = 'header-hover-zone';
    document.body.appendChild(zone);
  }

  // Remove old listeners first
  document.removeEventListener('mousemove', _headerMouseMove);
  zone.removeEventListener('mouseenter', _headerZoneEnter);
  header.removeEventListener('mouseleave', _headerMouseLeave);
  header.removeEventListener('mouseenter', _headerMouseEnter);

  // Show on mouse near top (within 60px)
  document.addEventListener('mousemove', _headerMouseMove);
  // Also show when hovering the zone directly
  zone.addEventListener('mouseenter', _headerZoneEnter);
  // Cancel hide timer when mouse enters header
  header.addEventListener('mouseenter', _headerMouseEnter);
  // Hide when mouse leaves header
  header.addEventListener('mouseleave', _headerMouseLeave);

  // Touch: show on tap near top
  document.addEventListener('touchstart', _headerTouchStart, { passive: true });
}

function disableHeaderAutohide() {
  const header = document.querySelector('.header');
  if (!header) return;

  document.body.classList.remove('header-autohide');
  header.classList.remove('header-peeking');

  // Restore chat container below header
  const chatContainer = document.querySelector('.whatsapp-container');
  if (chatContainer) {
    const headerH = header.offsetHeight || 72;
    chatContainer.style.top = headerH + 'px';
    chatContainer.style.height = `calc(100vh - ${headerH}px)`;
  }

  document.removeEventListener('mousemove', _headerMouseMove);
  document.removeEventListener('touchstart', _headerTouchStart);
  header.removeEventListener('mouseenter', _headerMouseEnter);

  const zone = document.getElementById('headerHoverZone');
  if (zone) zone.remove();

  clearTimeout(_headerHideTimer);
}

function _headerMouseMove(e) {
  const header = document.querySelector('.header');
  if (!header) return;

  if (e.clientY <= 60) {
    // Mouse is near top — show header
    clearTimeout(_headerHideTimer);
    header.classList.add('header-peeking');
    // Shrink container to make room for header
    const cont = document.querySelector('.whatsapp-container');
    if (cont) {
      const hh = header.offsetHeight || 72;
      cont.style.top = hh + 'px';
      cont.style.height = `calc(100vh - ${hh}px)`;
    }
  } else if (e.clientY > 120 && !header.contains(e.target)) {
    // Mouse moved well away AND is not over the header — start hide timer
    clearTimeout(_headerHideTimer);
    _headerHideTimer = setTimeout(() => {
      // Only hide if mouse is still not on the header itself
      if (!header.matches(':hover')) {
        header.classList.remove('header-peeking');
        // Re-expand container when header hides
        const cont = document.querySelector('.whatsapp-container');
        if (cont) { cont.style.top = '0'; cont.style.height = '100vh'; }
      }
    }, 800);
  }
}

function _headerZoneEnter() {
  const header = document.querySelector('.header');
  if (header) {
    clearTimeout(_headerHideTimer);
    header.classList.add('header-peeking');
    // Shrink container to make room
    const cont = document.querySelector('.whatsapp-container');
    if (cont) {
      const hh = header.offsetHeight || 72;
      cont.style.top = hh + 'px';
      cont.style.height = `calc(100vh - ${hh}px)`;
    }
  }
}

function _headerMouseEnter() {
  // Cancel any pending hide timer when mouse enters the header
  clearTimeout(_headerHideTimer);
}

function _headerMouseLeave() {
  _headerHideTimer = setTimeout(() => {
    const header = document.querySelector('.header');
    if (header) header.classList.remove('header-peeking');
  }, 600);
}

function _headerTouchStart(e) {
  const header = document.querySelector('.header');
  if (!header) return;
  const touch = e.touches[0];
  if (touch && touch.clientY <= 60) {
    clearTimeout(_headerHideTimer);
    header.classList.add('header-peeking');
    _headerHideTimer = setTimeout(() => header.classList.remove('header-peeking'), 3000);
  }
}

function showPage(name, e) {
  if (e) e.preventDefault();

  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(name);
  if (page) page.style.display = 'block';

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (e?.target) e.target.classList.add('active');

  if (name === 'home') loadHomeFeed();
  else if (name === 'posts') loadPosts();
  else if (name === 'communities') loadCommunities();
  else if (name === 'vibeshop') loadVibeshopPage();

  // Hide footer on communities, posts, realvibe
  const footer = document.getElementById('mainFooter');
  if (footer) {
    const noFooterPages = ['communities', 'posts', 'realvibe'];
    footer.style.display = noFooterPages.includes(name) ? 'none' : '';
  }

  // Hide "Connected to college" notification on posts and realvibe pages
  const liveNotif = document.getElementById('liveActivityNotif');
  if (liveNotif) {
    const hideNotifPages = ['posts', 'realvibe'];
    liveNotif.style.display = hideNotifPages.includes(name) ? 'none' : '';
  }

  // Auto-hide header on communities, posts, realvibe
  // But NOT on communities when user hasn't joined a college — that page is a static join screen
  const autoHidePages = ['communities', 'posts', 'realvibe'];
  if (autoHidePages.includes(name)) {
    const communityJoined = currentUser && currentUser.communityJoined && currentUser.college;
    if (name === 'communities' && !communityJoined) {
      disableHeaderAutohide();
    } else {
      enableHeaderAutohide();
    }
  } else {
    disableHeaderAutohide();
  }

  // Hide crown button on communities, posts, realvibe only
  const crownBtn = document.querySelector('.premium-crown-btn');
  if (crownBtn) {
    const hideCrownPages = ['communities', 'posts', 'realvibe'];
    crownBtn.style.display = hideCrownPages.includes(name) ? 'none' : '';
  }

  const hamburger = document.getElementById('hamburgerMenu');
  if (hamburger) hamburger.style.display = 'none';

  window.scrollTo(0, 0);
}

function goHome() {
  showPage('home');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const homeLink = document.querySelector('.nav-link[onclick*="home"]');
  if (homeLink) homeLink.classList.add('active');
}
// ══════════════════════════════════════════════════════════════
// HOME FEED — For You (Global Posts, no add button)
// ══════════════════════════════════════════════════════════════
let _homeFeedLoading = false;

async function loadHomeFeed() {
  if (_homeFeedLoading) return;
  _homeFeedLoading = true;

  const container = document.getElementById('homeFeedContainer');
  if (!container) { _homeFeedLoading = false; return; }

  // Show loading spinner
  container.innerHTML = `<div class="home-feed-loading">
    <div class="vibe-spinner-ring"></div><p>Loading posts…</p>
  </div>`;

  try {
    const data = await apiCall('/api/posts', 'GET');
    const allPosts = data.posts || [];
    // Only show OTHER people's posts on home feed
    const posts = allPosts.filter(p => {
      const ownerId = (p.users && p.users.id) || p.user_id;
      return !currentUser || ownerId !== currentUser.id;
    });

    if (!posts.length) {
      container.innerHTML = `<div class="home-feed-empty">
        <div style="font-size:48px;margin-bottom:12px;">📭</div>
        <h3>No posts yet</h3>
        <p>Be the first to post something!</p>
      </div>`;
      return;
    }

    container.innerHTML = posts.map(post => buildHomeFeedCard(post)).join('');
  } catch (err) {
    container.innerHTML = `<div class="home-feed-empty">
      <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
      <h3>Failed to load</h3>
      <p>${err.message || 'Check your connection'}</p>
      <button onclick="loadHomeFeed()" class="action-btn" style="margin-top:12px;">Retry</button>
    </div>`;
  } finally {
    _homeFeedLoading = false;
  }
}

function buildHomeFeedCard(post) {
  const user = post.users || {};
  const username = escapeHtml(user.username || 'Unknown');
  const userId = user.id || '';
  const college = user.college ? `<span class="hf-college">🎓 ${escapeHtml(user.college)}</span>` : '';
  const avatar = user.profile_pic
    ? `<img src="${escapeHtml(user.profile_pic)}" class="hf-avatar" onclick="showUserProfile('${escapeHtml(userId)}')">`
    : `<div class="hf-avatar hf-avatar-fb" onclick="showUserProfile('${escapeHtml(userId)}')">${escapeHtml((user.username || 'U').charAt(0).toUpperCase())}</div>`;

  const content = post.content ? `<p class="hf-content">${escapeHtml(post.content)}</p>` : '';

  // Media
  const media = Array.isArray(post.media) ? post.media : [];
  let mediaHtml = '';
  if (media.length > 0) {
    const m = media[0];
    if (m.type === 'video') {
      mediaHtml = `<video class="hf-media" src="${escapeHtml(m.url)}" controls playsinline></video>`;
    } else if (m.type === 'image') {
      mediaHtml = `<img class="hf-media" src="${escapeHtml(m.url)}" loading="lazy">`;
    }
  }

  const postId = post._id || post.id || '';
  const likes = post.like_count || 0;
  const comments = post.comment_count || 0;
  const isLiked = post.is_liked;
  const isOwn = currentUser && (userId === currentUser.id);
  const isFollowing = post.is_following_author || (_followState[userId] && _followState[userId].isFollowing);

  const followBtn = (!isOwn && userId)
    ? `<button class="hf-follow-btn ${isFollowing ? 'hf-following' : ''}" onclick="homeFeedToggleFollow('${escapeHtml(userId)}', this)">
        ${isFollowing ? '✓ Following' : '+ Follow'}
      </button>`
    : '';

  const time = post.createdAt ? timeAgo(new Date(post.createdAt)) : '';

  return `<div class="hf-card" id="hf-post-${escapeHtml(postId)}">
    <div class="hf-card-header">
      ${avatar}
      <div class="hf-user-info">
        <span class="hf-username" onclick="showUserProfile('${escapeHtml(userId)}')">${username}</span>
        ${college}
        <span class="hf-time">${time}</span>
      </div>
      ${followBtn}
    </div>
    ${content}
    ${mediaHtml}
    <div class="hf-actions">
      <button class="hf-action-btn hf-like-btn ${isLiked ? 'hf-liked' : ''}" onclick="homeFeedToggleLike('${escapeHtml(postId)}', this)">
        <span class="hf-like-icon">${isLiked ? '❤️' : '🤍'}</span>
        <span class="hf-like-count">${likes}</span>
      </button>
      <button class="hf-action-btn" onclick="openCommentModal('${escapeHtml(postId)}')">
        💬 <span>${comments}</span>
      </button>
    </div>
  </div>`;
}

async function homeFeedToggleLike(postId, btn) {
  if (!currentUser) { showMessage('⚠️ Please login first', 'error'); return; }
  try {
    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');
    const liked = data.liked;
    const countEl = btn.querySelector('.hf-like-count');
    const iconEl = btn.querySelector('.hf-like-icon');
    if (iconEl) iconEl.textContent = liked ? '❤️' : '🤍';
    if (countEl) countEl.textContent = data.likeCount ?? (parseInt(countEl.textContent) + (liked ? 1 : -1));
    btn.classList.toggle('hf-liked', liked);
  } catch (err) { showMessage('❌ ' + (err.message || 'Failed'), 'error'); }
}

async function homeFeedToggleFollow(userId, btn) {
  if (!currentUser) { showMessage('⚠️ Please login first', 'error'); return; }
  const isFollowing = btn.classList.contains('hf-following');
  try {
    if (isFollowing) {
      await apiCall(`/api/unfollow/${userId}`, 'POST');
      btn.textContent = '+ Follow';
      btn.classList.remove('hf-following');
    } else {
      await apiCall(`/api/follow/${userId}`, 'POST');
      btn.textContent = '✓ Following';
      btn.classList.add('hf-following');
    }
    if (!_followState[userId]) _followState[userId] = {};
    _followState[userId].isFollowing = !isFollowing;
  } catch (err) { showMessage('❌ ' + (err.message || 'Failed'), 'error'); }
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}



function goToActiveUniversities() {
  showPage('home');
  const section = document.getElementById('active-universities');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ========================================
// POSTS SYSTEM
// ========================================

async function createPost() {
  const postText = document.getElementById('postText')?.value.trim();
  console.log('🚀 Creating post');

  if (!postText && selectedFiles.length === 0 && !selectedMusic && selectedStickers.length === 0) {
    showVibeSelectFirst();
    return;
  }

  if (!currentUser) return showMessage('⚠️ Login required', 'error');

  if (selectedPostDestination === 'community') {
    if (!currentUser.communityJoined || !currentUser.college) {
      showMessage('⚠️ Join university first', 'error');
      setTimeout(() => {
        if (confirm('Join college community?')) {
          showPage('home');
          const homeLink = document.querySelector('.nav-link[onclick*="home"]');
          if (homeLink) homeLink.classList.add('active');
        }
      }, 500);
      return;
    }
  }

  try {
    showMessage('📤 Creating...', 'success');

    const formData = new FormData();
    formData.append('content', postText);
    formData.append('postTo', selectedPostDestination);

    if (selectedMusic) formData.append('music', JSON.stringify(selectedMusic));
    if (selectedStickers.length > 0) formData.append('stickers', JSON.stringify(selectedStickers));

    if (selectedFiles.length > 0) {
      showMessage(`📤 Uploading ${selectedFiles.length} file(s)...`, 'success');
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('media', selectedFiles[i]);
      }
    }

    const data = await apiCall('/api/posts', 'POST', formData);

    if (data.success) {
      // 1. Reset form and close any open post modals immediately
      resetPostForm();
      ['createPostModal', 'vibeUploadModal', 'postCreatorModal'].forEach(id => {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
      });

      // 2. Update local post count
      if (currentUser) {
        currentUser.postCount = (currentUser.postCount || 0) + 1;
        saveUserToLocal();
      }

      // 3. Update My Vibes cache
      if (data.post) {
        _mvAllPosts.unshift(data.post);
        _updateMvStats(_mvAllPosts);
        const pane = document.getElementById('profileTabVibes');
        if (pane && pane.classList.contains('active')) {
          _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
        }
      }

      // 4. Show "Your Vibe is now online" toast (this will also navigate to vibers and refresh feed)
      showVibeOnlineToast();

      // 6. Celebration modal + badge notification
      checkAndUpdateRewards('post');
      const postCount = data.postCount || 1;
      setTimeout(() => showPostCelebrationModal(postCount), 1000);
      if (data.badgeUpdated && data.newBadges?.length > 0) {
        setTimeout(() => showMessage(`🏆 Badge unlocked: ${data.newBadges.join(', ')}`, 'success'), 6000);
      }

    } else {
      showMessage('❌ Failed to post', 'error');
    }
  } catch (error) {
    console.error('❌ Post error:', error);
    if (error.message.includes('timeout')) {
      showMessage('⚠️ Timeout - try smaller images', 'error');
    } else if (error.message.includes('university') || error.message.includes('community')) {
      showMessage('⚠️ Join university first', 'error');
    } else {
      showMessage('❌ Error: ' + error.message, 'error');
    }
  }
}

// ── Post Success: show popup then refresh feed in-place (no hard reload) ──
function showVibePostSuccessAndReload() {
  // Remove any stale copies
  ['vibeOnlineToast', 'vibeSuccessPopup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // Build the success popup
  const popup = document.createElement('div');
  popup.id = 'vibeSuccessPopup';
  popup.innerHTML = `
    < div class= "vsp-bg-glow" ></div >
    <div class="vsp-icon-ring">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" width="26" height="26">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div class="vsp-text">
      <strong>Successfully Posted!</strong>
      <span>Your vibe is now live on Vibers 🚀</span>
    </div>
    <div class="vsp-timer-bar"><div class="vsp-timer-fill"></div></div>
  `;
  document.body.appendChild(popup);

  // Animate in
  requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('vsp-show')));

  // After 1.5s — animate out, then navigate to vibers tab and refresh feed
  setTimeout(() => {
    popup.classList.add('vsp-hide');
    setTimeout(() => {
      popup.remove();
      // Navigate to the vibers/posts page and refresh the feed in-place
      showPage('posts');
      const postsLink = document.querySelector('.nav-link[onclick*="posts"]');
      if (postsLink) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        postsLink.classList.add('active');
      }
      // Refresh the vibe feed
      if (typeof initVibeFeed === 'function') initVibeFeed();
    }, 300);
  }, 1500);
}

// ── Legacy aliases — kept so any old calls still work ──
function showVibeOnlineToast() { showVibePostSuccessAndReload(); }
function showVibeSuccessToast() { showVibePostSuccessAndReload(); }
function showVibeSuccessPopup() { showVibePostSuccessAndReload(); }



function resetPostForm() {
  const postText = document.getElementById('postText');
  if (postText) postText.value = '';

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
}

// ── CHAT NOW: Navigate to user's profile then auto-open DM drawer ─────
async function chatNowWithUser(userId) {
  if (!currentUser) { showMessage("⚠️ Please log in first", "error"); return; }
  if (userId === currentUser.id) return;
  await showUserProfile(userId);
  setTimeout(() => { openDmDrawer(userId); }, 380);
}

// ── POST MESSAGE BUTTON: check mutual follow then open DM ─────────────────
async function handlePostMessageClick(userId, username, event) {
  event && event.stopPropagation();
  if (!currentUser) { showMessage('⚠️ Please log in first', 'error'); return; }
  if (userId === currentUser.id) return;

  // Check mutual follow via profile API (uses cached _mpcCache if available)
  let isMutual = false;
  try {
    let profile = window._mpcCache && window._mpcCache[userId];
    if (!profile) {
      const data = await apiCall('/api/profile/' + userId);
      if (data && data.user) {
        profile = data.user;
        if (!window._mpcCache) window._mpcCache = {};
        window._mpcCache[userId] = profile;
      }
    }
    isMutual = profile && profile.isMutualFollow;
  } catch (e) { console.warn('handlePostMessageClick:', e); }

  if (isMutual) {
    openDmDrawer(userId);
  } else {
    // Show friendly lock popup near button
    showMutualFollowRequired(userId, username, event);
  }
}

// Show a slick "follow each other first" tooltip near the clicked element
function showMutualFollowRequired(userId, username, event) {
  document.querySelectorAll('.mutual-req-popup').forEach(p => p.remove());
  const popup = document.createElement('div');
  popup.className = 'mutual-req-popup';
  popup.innerHTML = `
      < div class= "mrp-inner" >
      <div class="mrp-lock">🔒</div>
      <div class="mrp-title">Follow Each Other First</div>
      <div class="mrp-body">You and <strong>@${username}</strong> both need to follow each other to chat.</div>
      <button class="mrp-follow-btn" onclick="quickFollowForChat('${userId}', '${username}', this)">Follow @${username}</button>
      <button class="mrp-close" onclick="this.closest('.mutual-req-popup').remove()">✕</button>
    </div > `;
  document.body.appendChild(popup);
  // Position near click
  if (event) {
    const r = event.target.getBoundingClientRect();
    let top = r.bottom + 8 + window.scrollY;
    let left = r.left + window.scrollX;
    if (left + 260 > window.innerWidth - 16) left = window.innerWidth - 276;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  }
  // Auto dismiss
  setTimeout(() => popup.remove(), 6000);
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', closePopup); }
  });
}

// Quick follow action from mutual-req popup
async function quickFollowForChat(userId, username, btn) {
  btn.disabled = true;
  btn.textContent = '⏳ Following…';
  const result = await centralToggleFollow(userId, username, { isFollowing: false });
  if (result) {
    btn.textContent = '✓ Followed!';
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    setTimeout(() => {
      btn.closest('.mutual-req-popup')?.remove();
      showMessage(`✨ Following @${username} !Ask them to follow back to start chatting.`, 'success');
    }, 800);
  } else {
    btn.disabled = false;
    btn.textContent = 'Follow @' + username;
  }
}


// ═══════════════════════════════════════════════════════════════
// CENTRAL FOLLOW ENGINE — single source of truth for all follow actions
// Syncs: profile page, vibe cards, mini profile card, _mpcCache
// ═══════════════════════════════════════════════════════════════
const _followState = {}; // userId -> { isFollowing, followersCount }

async function centralToggleFollow(targetUserId, targetUsername, opts = {}) {
  if (!currentUser) { showMessage('⚠️ Please log in first', 'error'); return null; }
  if (!targetUserId || targetUserId === currentUser.id) return null;

  // Mark this userId as having an in-flight action to prevent fetchProfileStats races
  _followInFlight[targetUserId] = Date.now();

  // Read state: prefer _followState (most up-to-date), then opts, then default false
  const cached = _followState[targetUserId] || {};
  const wasFollowing = cached.isFollowing !== undefined
    ? cached.isFollowing
    : (opts.isFollowing !== undefined ? opts.isFollowing : false);
  const endpoint = wasFollowing ? `/ api / unfollow / ${targetUserId} ` : ` / api / follow / ${targetUserId} `;

  // Optimistically update all UIs immediately
  const nowFollowing = !wasFollowing;
  _followState[targetUserId] = {
    isFollowing: nowFollowing,
    followersCount: (cached.followersCount || 0) + (nowFollowing ? 1 : -1)
  };
  _syncAllFollowUI(targetUserId, nowFollowing, _followState[targetUserId].followersCount);

  try {
    const result = await apiCall(endpoint, 'POST');
    if (!result || result.error) throw new Error(result?.error || 'API failed');

    // Use REAL counts from server response
    const realFollowersCount = result.targetFollowersCount !== undefined ? result.targetFollowersCount : _followState[targetUserId].followersCount;
    const realMyFollowing = result.myFollowingCount !== undefined ? result.myFollowingCount : null;

    // Update state with real data
    _followState[targetUserId] = { isFollowing: nowFollowing, followersCount: realFollowersCount };

    // Sync all UIs with real counts
    _syncAllFollowUI(targetUserId, nowFollowing, realFollowersCount);

    // Update currentUser following count
    if (realMyFollowing !== null) {
      currentUser.followingCount = realMyFollowing;
    } else {
      currentUser.followingCount = Math.max(0, (currentUser.followingCount || 0) + (nowFollowing ? 1 : -1));
    }
    saveUserToLocal?.();

    // Update _mpcCache (and reset TTL since we have fresh data)
    const existingCache = _getMpcCache(targetUserId);
    if (existingCache) {
      existingCache.isFollowing = nowFollowing;
      existingCache.followersCount = realFollowersCount;
      _setMpcCache(targetUserId, existingCache);
    }

    // Update currentProfileUser if it's the same person
    if (window.currentProfileUser && window.currentProfileUser.id === targetUserId) {
      window.currentProfileUser.isFollowing = nowFollowing;
      window.currentProfileUser.followersCount = realFollowersCount;
    }

    // Clear in-flight marker after successful action
    delete _followInFlight[targetUserId];

    // Update the "Following" count on the current user's own profile if visible
    const myFollowingStat = document.getElementById('profileStatFollowing');
    if (myFollowingStat && window.currentProfileUser && window.currentProfileUser.id === currentUser.id) {
      myFollowingStat.textContent = currentUser.followingCount || 0;
    }

    return { isFollowing: nowFollowing, followersCount: realFollowersCount };

  } catch (error) {
    console.error('Follow error:', error);
    // Clear in-flight marker on failure too
    delete _followInFlight[targetUserId];
    // Revert on failure
    _followState[targetUserId] = { isFollowing: wasFollowing, followersCount: cached.followersCount || 0 };
    _syncAllFollowUI(targetUserId, wasFollowing, cached.followersCount || 0);
    showMessage('❌ Action failed. Try again.', 'error');
    return null;
  }
}

// Sync every follow button in the DOM for this userId
function _syncAllFollowUI(userId, isFollowing, followersCount) {
  // 1. Profile page follow button
  if (window.currentProfileUser && window.currentProfileUser.id === userId) {
    const btn = document.getElementById('followBtn');
    if (btn && btn.style.display !== 'none') {
      if (isFollowing) {
        btn.innerHTML = '<span class="follow-check-anim">✓</span> Following';
        btn.className = 'btn-secondary follow-btn-following';
        btn.style.opacity = '1';
      } else {
        btn.innerHTML = 'Follow';
        btn.className = 'btn-primary follow-btn-not-following';
        btn.style.opacity = '1';
      }
      btn.disabled = false;
    }
    const stat = document.getElementById('profileStatFollowers');
    if (stat) {
      stat.textContent = followersCount;
      stat.classList.add('stat-pop');
      setTimeout(() => stat.classList.remove('stat-pop'), 400);
    }
  }

  // 2. Vibe feed cards — all buttons for this user
  document.querySelectorAll(`.vibe - follow - btn[data - uid="${userId}"]`).forEach(btn => {
    btn.textContent = isFollowing ? '✓ Following' : '+ Follow';
    btn.classList.toggle('following', isFollowing);
    btn.disabled = false;
  });

  // 3. Mini profile card
  if (window._mpcCurrentUserId === userId) {
    const mpcBtn = document.getElementById('mpcFollowBtn');
    if (mpcBtn) {
      mpcBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
      mpcBtn.style.background = isFollowing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#4f74a3,#7aa3d4)';
    }
    const mpcFollowers = document.getElementById('mpcFollowers');
    if (mpcFollowers) mpcFollowers.textContent = followersCount;
  }
}

// Seed follow state from known data (called when profile/posts load)
function _seedFollowState(userId, isFollowing, followersCount) {
  if (!userId) return;
  _followState[userId] = { isFollowing, followersCount };
}

// ═══════════════════════════════════════════════════════════════
// FOLLOWERS / FOLLOWING LIST MODAL
// ═══════════════════════════════════════════════════════════════
async function showFollowListModal(type) {
  // type = 'followers' or 'following'
  const targetUser = window.currentProfileUser || currentUser;
  if (!targetUser || !targetUser.id) return;

  // Remove any existing modal
  document.getElementById('followListModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'followListModal';
  modal.className = 'follow-list-modal';
  modal.innerHTML = `
      < div class="flm-backdrop" onclick = "closeFollowListModal()" ></div >
        <div class="flm-sheet">
          <div class="flm-header">
            <div class="flm-tabs">
              <button class="flm-tab ${type === 'followers' ? 'active' : ''}" onclick="switchFollowListTab('followers')">
                Followers
              </button>
              <button class="flm-tab ${type === 'following' ? 'active' : ''}" onclick="switchFollowListTab('following')">
                Following
              </button>
            </div>
            <button class="flm-close" onclick="closeFollowListModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flm-body" id="flmBody">
            <div class="flm-loading">
              <div class="flm-spinner"></div>
              <p>Loading...</p>
            </div>
          </div>
        </div>
    `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('flm-open')));

  // Load the list
  await loadFollowList(type);
}

async function loadFollowList(type) {
  const targetUser = window.currentProfileUser || currentUser;
  if (!targetUser) return;

  const body = document.getElementById('flmBody');
  if (!body) return;

  body.innerHTML = '<div class="flm-loading"><div class="flm-spinner"></div><p>Loading...</p></div>';

  try {
    const endpoint = type === 'followers'
      ? `/ api / followers / ${targetUser.id} `
      : `/ api / following / ${targetUser.id} `;
    const data = await apiCall(endpoint, 'GET');

    if (!data.success || !data.users || data.users.length === 0) {
      body.innerHTML = `
      < div class="flm-empty" >
          <div class="flm-empty-icon">${type === 'followers' ? '👥' : '🔍'}</div>
          <p>${type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}</p>
        </div > `;
      return;
    }

    let html = '<div class="flm-list">';
    data.users.forEach(user => {
      const isMe = currentUser && user.id === currentUser.id;
      const avatarHtml = user.profile_pic
        ? `< img src = "${user.profile_pic}" alt = "${user.username}" class="flm-avatar-img" > `
        : '<span class="flm-avatar-placeholder">👤</span>';

      html += `
      < div class="flm-user-row" onclick = "closeFollowListModal();showUserProfile('${user.id}')" >
          <div class="flm-avatar">${avatarHtml}</div>
          <div class="flm-user-info">
            <div class="flm-username">@${user.username}</div>
            ${user.college ? `<div class="flm-college">🎓 ${user.college}</div>` : ''}
            ${user.bio ? `<div class="flm-bio">${user.bio.substring(0, 60)}${user.bio.length > 60 ? '...' : ''}</div>` : ''}
          </div>
          ${!isMe ? `
            <button class="flm-follow-btn ${user.isFollowedByMe ? 'flm-following' : ''}" 
              onclick="event.stopPropagation();flmToggleFollow(this, '${user.id}', '${user.username}', ${user.isFollowedByMe})">
              ${user.isFollowedByMe ? '✓ Following' : 'Follow'}
            </button>` : '<span class="flm-you-badge">You</span>'
        }
        </div > `;
    });
    html += '</div>';
    body.innerHTML = html;
  } catch (error) {
    console.error('Failed to load follow list:', error);
    body.innerHTML = '<div class="flm-empty"><p>❌ Failed to load</p></div>';
  }
}

function switchFollowListTab(type) {
  document.querySelectorAll('.flm-tab').forEach(tab => tab.classList.remove('active'));
  const tabs = document.querySelectorAll('.flm-tab');
  if (type === 'followers' && tabs[0]) tabs[0].classList.add('active');
  if (type === 'following' && tabs[1]) tabs[1].classList.add('active');
  loadFollowList(type);
}

function closeFollowListModal() {
  const modal = document.getElementById('followListModal');
  if (modal) {
    modal.classList.remove('flm-open');
    setTimeout(() => modal.remove(), 300);
  }
}

async function flmToggleFollow(btn, userId, username, wasFollowing) {
  btn.disabled = true;
  btn.classList.add('follow-btn-pulse');
  const result = await centralToggleFollow(userId, username, { isFollowing: wasFollowing });
  btn.classList.remove('follow-btn-pulse');
  if (result) {
    btn.textContent = result.isFollowing ? '✓ Following' : 'Follow';
    btn.classList.toggle('flm-following', result.isFollowing);
    btn.onclick = function (e) { e.stopPropagation(); flmToggleFollow(btn, userId, username, result.isFollowing); };
  }
  btn.disabled = false;
}

function renderPosts(posts) {
  let html = '';

  posts.forEach(post => {
    const author = post.users?.username || 'User';
    const authorId = post.users?.id || '';
    const content = post.content || '';
    const media = post.media || [];
    const time = new Date(post.created_at || post.timestamp).toLocaleString();
    const isOwn = currentUser && authorId === currentUser.id;
    const postedTo = post.posted_to === 'community' ? '🌐 Community' : '👤 Profile';
    const music = post.music || null;
    const stickers = post.stickers || [];
    const likeCount = post.like_count || 0;
    const commentCount = post.comment_count || 0;
    const shareCount = post.share_count || 0;
    const isLiked = post.is_liked || false;

    html += `
      < div class="enhanced-post" id = "post-${post.id}" >
       <div class="enhanced-post-header">
         <div class="enhanced-user-info" onclick="showMiniProfileCard('${authorId}',event)" style="cursor:pointer;">
           <div class="enhanced-user-avatar">
             ${post.users?.profile_pic ?
        `<img src="${post.users.profile_pic}" class="enhanced-user-avatar">` :
        '👤'
      }
           </div>
           <div class="enhanced-user-details">
             <div class="enhanced-username">@${author}</div>
             <div class="enhanced-post-meta">
               <span>${time}</span>
             </div>
           </div>
         </div>
         ${isOwn ? `<button class="post-delete-btn" onclick="deletePost('${post.id}')">🗑️</button>` : ''}
       </div>
       <div class="enhanced-post-content">
         ${content ? `<div class="enhanced-post-text">${content}</div>` : ''}
         ${stickers.length > 0 ?
        `<div class="post-stickers-container">
             ${stickers.map(s => `<span class="post-sticker">${s.emoji || s}</span>`).join('')}
           </div>` : ''
      }
         ${music ?
        `<div class="post-music-container">
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
           </div>` : ''
      }
         ${media.length > 0 ?
        `<div class="enhanced-post-media">
             ${media.map(m =>
          m.type === 'image' ?
            `<div class="enhanced-media-item"><img src="${proxyMediaUrl(m.url)}" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${m.url}'}"></div>` :
            m.type === 'video' ?
              `<div class="enhanced-media-item"><video src="${proxyMediaUrl(m.url)}" controls playsinline preload="metadata" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${m.url}'}"></video></div>` :
              `<div class="enhanced-media-item"><audio src="${proxyMediaUrl(m.url)}" controls preload="metadata"></audio></div>`
        ).join('')}
           </div>` : ''
      }
       </div>
       <div class="enhanced-post-footer">
         <div class="enhanced-post-stats">
           <span id="like-count-${post.id}">❤️ ${likeCount}</span>
           <span id="comment-count-${post.id}">💬 ${commentCount}</span>
           <span id="share-count-${post.id}">🔄 ${shareCount}</span>
         </div>
         <div class="enhanced-post-engagement">
           <button class="engagement-btn ${isLiked ? 'liked' : ''}" id="like-btn-${post.id}" onclick="toggleLike('${post.id}')">
             ${isLiked ? '❤️ Liked' : '❤️ Like'}
           </button>
           <button class="engagement-btn" onclick="openCommentModal('${post.id}')">💬 Comment</button>
           <button class="engagement-btn" onclick="sharePost('${post.id}', '${content.replace(/'/g, "\\'")}', '${author}')">🔄 Share</button>
           ${!isOwn && authorId ? `<button class="engagement-btn post-msg-btn" onclick="handlePostMessageClick('${authorId}', '${author}', event)" data-userid="${authorId}" data-username="${author}" title="Message ${author}">✉️ Message</button>` : ''}
         </div>
       </div >
     </div >
      `;
  });

  return html;
}

async function loadPosts() {
  const feedEl = document.getElementById('postsFeed');
  if (!feedEl) return;

  try {
    feedEl.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">⏳ Loading...</div>';
    const data = await apiCall('/api/posts', 'GET');

    if (!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">📝 No posts yet</div>';
      return;
    }

    feedEl.innerHTML = renderPosts(data.posts);
  } catch (error) {
    console.error('❌ Load posts:', error);
    feedEl.innerHTML = '<div style="text-align:center;padding:40px;color:#ff6b6b;">❌ Failed to load</div>';
  }
}

async function deletePost(postId) {
  if (!confirm('Delete this post?')) return;

  try {
    await apiCall(`/ api / posts / ${postId} `, 'DELETE');
    showMessage('🗑️ Deleted', 'success');

    // Update local post count
    if (currentUser) {
      currentUser.postCount = Math.max(0, (currentUser.postCount || 0) - 1);
      saveUserToLocal();
    }

    const postEl = document.getElementById(`post - ${postId} `);
    if (postEl) postEl.remove();

    setTimeout(() => loadPosts(), 500);
  } catch (error) {
    showMessage('❌ Failed: ' + error.message, 'error');
  }
}

async function toggleLike(postId) {
  if (!currentUser) return showMessage('⚠️ Login to like', 'error');

  try {
    const likeBtn = document.querySelector(`#like - btn - ${postId} `);
    const likeCount = document.querySelector(`#like - count - ${postId} `);

    if (likeBtn) likeBtn.disabled = true;

    const data = await apiCall(`/ api / posts / ${postId}/like`, 'POST');

    if (data.success) {

      if (data.liked) {
        checkAndUpdateRewards('like');
      }
      if (likeBtn) {
        likeBtn.innerHTML = data.liked ? '❤️ Liked' : '❤️ Like';
        if (data.liked) likeBtn.classList.add('liked');
        else likeBtn.classList.remove('liked');
        likeBtn.disabled = false;
      }

      if (likeCount) likeCount.textContent = `❤️ ${data.likeCount}`;
    }
  } catch (error) {
    console.error('❌ Like:', error);
    showMessage('❌ Failed to like', 'error');

    const likeBtn = document.querySelector(`#like-btn-${postId}`);
    if (likeBtn) likeBtn.disabled = false;
  }
}

function openCommentModal(postId) {
  if (!currentUser) return showMessage('⚠️ Login to comment', 'error');

  currentCommentPostId = postId;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'commentModal';
  modal.style.display = 'flex';

  modal.innerHTML = `
   <div class="modal-box" style="max-width:600px;max-height:80vh;overflow-y:auto;">
     <span class="close" onclick="closeCommentModal()">&times;</span>
     <h2>💬 Comments</h2>
     <div id="commentsContainer" style="margin:20px 0;max-height:300px;overflow-y:auto;">
       <div style="text-align:center;padding:20px;color:#888;">⏳ Loading...</div>
     </div>
     <div style="border-top:1px solid rgba(79,116,163,0.2);padding-top:20px;">
       <textarea id="commentInput" placeholder="Write a comment..." 
         style="width:100%;min-height:80px;padding:12px;background:rgba(20,30,50,0.6);
         border:1px solid rgba(79,116,163,0.3);border-radius:10px;color:white;
         font-family:inherit;resize:vertical;"></textarea>
       <button onclick="submitComment('${postId}')" style="width:100%;margin-top:10px;">💬 Post</button>
     </div>
   </div>
 `;

  document.body.appendChild(modal);
  loadComments(postId);
}

function closeCommentModal() {
  const modal = document.getElementById('commentModal');
  if (modal) modal.remove();
  currentCommentPostId = null;
}

async function loadComments(postId) {
  const container = document.getElementById('commentsContainer');
  if (!container) return;

  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'GET');

    if (!data.success || !data.comments || data.comments.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">💬 No comments yet</div>';
      return;
    }

    let html = '';
    data.comments.forEach(comment => {
      const author = comment.users?.username || 'User';
      const time = new Date(comment.created_at).toLocaleString();
      const isOwn = currentUser && comment.user_id === currentUser.id;

      html += `
       <div class="comment-item" style="background:rgba(15,25,45,0.9);border:1px solid rgba(79,116,163,0.2);
         border-radius:12px;padding:15px;margin-bottom:10px;">
         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
           <div style="display:flex;align-items:center;gap:10px;">
             <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4f74a3,#8da4d3);
               display:flex;align-items:center;justify-content:center;font-size:18px;">
               ${comment.users?.profile_pic ?
          `<img src="${comment.users.profile_pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` :
          '👤'
        }
             </div>
             <div>
               <div style="font-weight:600;color:#4f74a3;">@${author}</div>
               <div style="font-size:11px;color:#888;">${time}</div>
             </div>
           </div>
           ${isOwn ?
          `<button onclick="deleteComment('${comment.id}','${postId}')" 
               style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:none;
               padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">🗑️</button>` :
          ''
        }
         </div>
         <div style="color:#e0e0e0;line-height:1.5;">${comment.content}</div>
       </div>
     `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('❌ Load comments:', error);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#ff6b6b;">❌ Failed to load</div>';
  }
}

async function submitComment(postId) {
  const input = document.getElementById('commentInput');
  const content = input?.value.trim();

  if (!content) return showMessage('⚠️ Empty comment', 'error');

  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'POST', { content });

    if (data.success) {
      showMessage('✅ Comment posted!', 'success');
      checkAndUpdateRewards('comment');
      input.value = '';
      loadComments(postId);

      const commentCount = document.querySelector(`#comment-count-${postId}`);
      if (commentCount) {
        const currentCount = parseInt(commentCount.textContent.replace(/\D/g, '')) || 0;
        commentCount.textContent = `💬 ${currentCount + 1}`;
      }
    }
  } catch (error) {
    console.error('❌ Comment:', error);
    showMessage('❌ Failed to post', 'error');
  }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Delete?')) return;

  try {
    await apiCall(`/api/posts/${postId}/comments/${commentId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');
    loadComments(postId);

    const commentCount = document.querySelector(`#comment-count-${postId}`);
    if (commentCount) {
      const currentCount = parseInt(commentCount.textContent.replace(/\D/g, '')) || 0;
      if (currentCount > 0) commentCount.textContent = `💬 ${currentCount - 1}`;
    }
  } catch (error) {
    console.error('❌ Delete comment:', error);
    showMessage('❌ Failed', 'error');
  }
}

function sharePost(postId, postContent = '', author = '') {
  const shareModal = document.createElement('div');
  shareModal.className = 'modal';
  shareModal.id = 'shareModal';
  shareModal.style.display = 'flex';

  const postUrl = `${window.location.origin}/?post=${postId}`;
  const shareText = `Check out @${author} on VibeXpert!`;

  shareModal.innerHTML = `
   <div class="modal-box" style="max-width:500px;">
     <span class="close" onclick="closeShareModal()">&times;</span>
     <h2>🔄 Share</h2>
     <div style="background:rgba(15,25,45,0.9);border:1px solid rgba(79,116,163,0.2);
       border-radius:12px;padding:20px;margin:20px 0;">
       <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;">
         <button onclick="shareVia('copy','${postUrl}')" class="share-option-btn">
           <span style="font-size:32px;">📋</span>
           <span>Copy Link</span>
         </button>
         <button onclick="shareVia('whatsapp','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn">
           <span style="font-size:32px;">💬</span>
           <span>WhatsApp</span>
         </button>
         <button onclick="shareVia('twitter','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn">
           <span style="font-size:32px;">🐦</span>
           <span>Twitter</span>
         </button>
         <button onclick="shareVia('native','${postUrl}','${encodeURIComponent(shareText)}')" class="share-option-btn">
           <span style="font-size:32px;">📤</span>
           <span>More</span>
         </button>
       </div>
     </div>
     <div style="background:rgba(79,116,163,0.1);padding:12px;border-radius:8px;">
       <input type="text" value="${postUrl}" readonly id="shareUrlInput" 
         style="width:100%;background:transparent;border:none;color:#4f74a3;text-align:center;font-size:14px;">
     </div>
   </div>
 `;

  document.body.appendChild(shareModal);
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.remove();
}

async function shareVia(platform, url, text = '') {
  switch (platform) {
    case 'copy':
      try {
        await navigator.clipboard.writeText(url);
        showMessage('✅ Link copied!', 'success');
        closeShareModal();
      } catch (err) {
        const input = document.getElementById('shareUrlInput');
        if (input) {
          input.select();
          document.execCommand('copy');
          showMessage('✅ Link copied!', 'success');
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
            title: 'VibeXpert',
            text: decodeURIComponent(text),
            url
          });
          closeShareModal();
        } catch (err) {
          if (err.name !== 'AbortError') console.error('Share:', err);
        }
      } else {
        showMessage('⚠️ Not supported', 'error');
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
    console.error('Share count:', error);
  }
}

// ========================================
// POST MEDIA FEATURES
// ========================================

function showPostDestinationModal() {
  showModal('postDestinationModal');
}

function selectPostDestination(destination) {
  selectedPostDestination = destination;

  const displayEl = document.getElementById('currentDestination');
  if (displayEl) {
    displayEl.textContent = destination === 'profile' ? 'My Profile' : 'Community Feed';
  }

  closeModal('postDestinationModal');
  showMessage(`✅ Will post to ${destination === 'profile' ? 'Profile' : 'Community'}`, 'success');
}

function openPhotoGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*,audio/*';
  input.multiple = true;

  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    handleMediaFiles(files);
  };

  input.click();
}

function openCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';

  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    handleMediaFiles(files);
  };

  input.click();
}

function handleMediaFiles(files) {
  if (!files || files.length === 0) return;

  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      showMessage('⚠️ File too large (max 10MB)', 'error');
      return;
    }

    selectedFiles.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrls.push(e.target.result);
      updatePhotoPreview();
    };
    reader.readAsDataURL(file);
  });
}

function updatePhotoPreview() {
  const container = document.getElementById('photoPreviewContainer');
  if (!container) return;

  if (previewUrls.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'grid';
  container.innerHTML = '';

  previewUrls.forEach((url, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'media-preview-item';

    const file = selectedFiles[index];
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (isVideo) {
      wrapper.innerHTML = `
       <video src="${url}" controls></video>
       <button class="remove-media-btn" onclick="removeMedia(${index})">&times;</button>
     `;
    } else if (isAudio) {
      wrapper.innerHTML = `
       <div class="audio-preview">🎵 ${file.name}</div>
       <audio src="${url}" controls></audio>
       <button class="remove-media-btn" onclick="removeMedia(${index})">&times;</button>
     `;
    } else {
      wrapper.innerHTML = `
       <img src="${url}" alt="Preview">
       <div class="media-actions">
         <button onclick="openCropEditor(${index})">✂️</button>
         <button onclick="openPhotoEditor(${index})">🎨</button>
         <button onclick="removeMedia(${index})">&times;</button>
       </div>
     `;
    }

    container.appendChild(wrapper);
  });
}

function removeMedia(index) {
  selectedFiles.splice(index, 1);
  previewUrls.splice(index, 1);
  updatePhotoPreview();
  showMessage('✅ Media removed', 'success');
}

// ─────────────────────────────────────────────────────────────────────────────
// MUSIC SELECTOR  — reliable play/pause preview + mini-player bar
// ─────────────────────────────────────────────────────────────────────────────
let _musicPreviewAudio = null;
let _musicPreviewId = null;
let _musicProgressRAF = null;   // requestAnimationFrame handle for progress bar

function openMusicSelector() {
  const modal = document.getElementById('musicSelectorModal');
  if (!modal) return;

  // Build the full modal content fresh each time it opens
  const box = modal.querySelector('.modal-box');
  if (box) {
    box.innerHTML = `
      <span class="close" onclick="closeMusicModal()" style="position:absolute;top:14px;right:18px;font-size:22px;cursor:pointer;color:rgba(255,255,255,0.5);">✕</span>
      <h2 style="margin:0 0 14px;font-size:17px;font-weight:700;color:#fff;">🎵 Add Music to Your Vibe</h2>
      <input id="musicSearchInput" type="text" placeholder="🔍 Search tracks…"
        oninput="_filterMusicList(this.value)"
        style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);
               color:#fff;border-radius:10px;padding:9px 14px;font-size:14px;box-sizing:border-box;
               outline:none;margin-bottom:12px;">
      <!-- mini-player shown while previewing -->
      <div id="musicMiniPlayer" style="display:none;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);
           border-radius:10px;padding:10px 14px;margin-bottom:10px;display:none;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span id="mmpTitle" style="font-size:13px;font-weight:600;color:#22c55e;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></span>
          <button onclick="_stopMusicPreview()" style="background:none;border:none;color:#22c55e;cursor:pointer;font-size:18px;margin-left:8px;flex-shrink:0;">⏹</button>
        </div>
        <div id="mmpProgressBg" style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
          <div id="mmpProgressBar" style="height:100%;width:0%;background:#22c55e;border-radius:2px;transition:width 0.3s linear;"></div>
        </div>
      </div>
      <div id="musicListContainer" style="max-height:340px;overflow-y:auto;padding-right:2px;"></div>`;
  }

  _filterMusicList('');
  showModal('musicSelectorModal');
}

function closeMusicModal() {
  _stopMusicPreview();
  closeModal('musicSelectorModal');
}

function _filterMusicList(query) {
  const container = document.getElementById('musicListContainer');
  if (!container) return;
  const q = (query || '').trim().toLowerCase();
  const filtered = q
    ? musicLibrary.filter(m => m.name.toLowerCase().includes(q) || m.artist.toLowerCase().includes(q))
    : musicLibrary;

  if (!filtered.length) {
    container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.35);padding:24px 0;font-size:13px;">No tracks found</div>';
    return;
  }

  container.innerHTML = filtered.map(m => {
    const isSel = selectedMusic && selectedMusic.id === m.id;
    const isPrev = _musicPreviewId === m.id;
    return `
      <div id="mtrack_${m.id}" class="music-track-row" style="
          display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;
          margin-bottom:4px;cursor:pointer;
          background:${isSel ? 'rgba(79,116,163,0.22)' : 'rgba(255,255,255,0.04)'};
          border:1px solid ${isSel ? 'rgba(79,116,163,0.5)' : 'transparent'};
          transition:background 0.2s;">
        <!-- Play/Pause button -->
        <button id="mplay_${m.id}" onclick="event.stopPropagation();_toggleMusicPreview(${m.id})"
          style="width:38px;height:38px;border-radius:50%;border:none;flex-shrink:0;cursor:pointer;
                 background:${isPrev ? 'rgba(34,197,94,0.25)' : 'rgba(167,139,250,0.15)'};
                 color:${isPrev ? '#22c55e' : '#a78bfa'};font-size:17px;
                 display:flex;align-items:center;justify-content:center;">
          ${isPrev ? '⏸' : m.emoji}
        </button>
        <!-- Track info -->
        <div onclick="selectMusic(${m.id})" style="flex:1;min-width:0;">
          <div style="font-weight:600;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.42);">${m.artist} · ${m.duration}</div>
        </div>
        <!-- Select checkmark -->
        <button onclick="selectMusic(${m.id})" style="
            padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;
            background:${isSel ? 'rgba(79,116,163,0.5)' : 'rgba(255,255,255,0.08)'};
            color:${isSel ? '#fff' : 'rgba(255,255,255,0.5)'};">
          ${isSel ? '✓ Added' : 'Add'}
        </button>
      </div>`;
  }).join('');
}

// Toggle preview play/pause WITHOUT re-rendering the whole list
function _toggleMusicPreview(musicId) {
  const music = musicLibrary.find(m => m.id === musicId);
  if (!music) return;

  // Same track → toggle pause/resume
  if (_musicPreviewId === musicId && _musicPreviewAudio) {
    if (_musicPreviewAudio.paused) {
      _musicPreviewAudio.play().catch(() => { });
      _updatePlayBtnState(musicId, true);
      _startProgressTick();
    } else {
      _musicPreviewAudio.pause();
      _updatePlayBtnState(musicId, false);
      cancelAnimationFrame(_musicProgressRAF);
    }
    return;
  }

  // Different track → stop old, start new
  _stopMusicPreview();
  _musicPreviewAudio = new Audio(music.url);
  _musicPreviewAudio.volume = 0.7;
  _musicPreviewId = musicId;

  _musicPreviewAudio.play()
    .then(() => {
      _updatePlayBtnState(musicId, true);
      _showMiniPlayer(music);
      _startProgressTick();
    })
    .catch(err => {
      console.warn('Music preview error:', err);
      _musicPreviewAudio = null;
      _musicPreviewId = null;
    });

  _musicPreviewAudio.onended = () => {
    _musicPreviewId = null;
    _updatePlayBtnState(musicId, false);
    _hideMiniPlayer();
    cancelAnimationFrame(_musicProgressRAF);
  };
}

function _stopMusicPreview() {
  if (_musicPreviewAudio) {
    _musicPreviewAudio.pause();
    _musicPreviewAudio = null;
  }
  if (_musicPreviewId) {
    _updatePlayBtnState(_musicPreviewId, false);
    _musicPreviewId = null;
  }
  cancelAnimationFrame(_musicProgressRAF);
  _hideMiniPlayer();
}

function _updatePlayBtnState(musicId, isPlaying) {
  const btn = document.getElementById(`mplay_${musicId}`);
  if (!btn) return;
  const music = musicLibrary.find(m => m.id === musicId);
  btn.textContent = isPlaying ? '⏸' : (music?.emoji || '▶');
  btn.style.background = isPlaying ? 'rgba(34,197,94,0.25)' : 'rgba(167,139,250,0.15)';
  btn.style.color = isPlaying ? '#22c55e' : '#a78bfa';
}

function _showMiniPlayer(music) {
  const player = document.getElementById('musicMiniPlayer');
  const title = document.getElementById('mmpTitle');
  const bar = document.getElementById('mmpProgressBar');
  if (!player) return;
  if (title) title.textContent = `${music.emoji} ${music.name} — ${music.artist}`;
  if (bar) bar.style.width = '0%';
  player.style.display = 'block';
}

function _hideMiniPlayer() {
  const player = document.getElementById('musicMiniPlayer');
  if (player) player.style.display = 'none';
}

function _startProgressTick() {
  cancelAnimationFrame(_musicProgressRAF);
  const bar = document.getElementById('mmpProgressBar');
  function tick() {
    if (!_musicPreviewAudio || _musicPreviewAudio.paused) return;
    const pct = _musicPreviewAudio.duration
      ? (_musicPreviewAudio.currentTime / _musicPreviewAudio.duration) * 100
      : 0;
    if (bar) bar.style.width = pct + '%';
    _musicProgressRAF = requestAnimationFrame(tick);
  }
  _musicProgressRAF = requestAnimationFrame(tick);
}

function selectMusic(musicId) {
  const music = musicLibrary.find(m => m.id === musicId);
  if (!music) return;
  _stopMusicPreview();
  selectedMusic = music;
  closeModal('musicSelectorModal');
  if (typeof updateSelectedAssets === 'function') updateSelectedAssets();
  showMessage(`🎵 Added: ${music.name}`, 'success');
  // Update label in vibe upload toolbar
  const vibeLabel = document.getElementById('vibeMusicLabel');
  if (vibeLabel) vibeLabel.textContent = music.name.length > 10 ? music.name.slice(0, 10) + '…' : music.name;
}

function openStickerSelector() {
  const modal = document.getElementById('stickerSelectorModal');
  if (!modal) return;

  let html = '<div class="sticker-categories">';

  Object.keys(stickerLibrary).forEach(category => {
    html += `<h3 style="text-transform:capitalize;color:#4f74a3;margin:20px 0 10px 0;">${category}</h3>`;
    html += '<div class="sticker-grid">';

    stickerLibrary[category].forEach(sticker => {
      const isSelected = selectedStickers.some(s => s.id === sticker.id);
      html += `
       <div class="sticker-item ${isSelected ? 'selected' : ''}" onclick="toggleSticker('${sticker.id}', '${category}')">
         <span class="sticker-emoji">${sticker.emoji}</span>
         <span class="sticker-name">${sticker.name}</span>
       </div>
     `;
    });

    html += '</div>';
  });

  html += '</div>';

  const selector = document.getElementById('stickerSelector');
  if (selector) selector.innerHTML = html;

  showModal('stickerSelectorModal');
}

function toggleSticker(stickerId, category) {
  const sticker = stickerLibrary[category].find(s => s.id === stickerId);
  if (!sticker) return;

  const index = selectedStickers.findIndex(s => s.id === stickerId);

  if (index > -1) {
    selectedStickers.splice(index, 1);
    showMessage('✅ Sticker removed', 'success');
  } else {
    if (selectedStickers.length >= 5) {
      showMessage('⚠️ Max 5 stickers', 'error');
      return;
    }
    selectedStickers.push(sticker);
    showMessage(`✅ Added: ${sticker.name}`, 'success');
  }

  updateSelectedAssets();
  openStickerSelector();
}

function updateSelectedAssets() {
  const container = document.getElementById('selectedAssets');
  if (!container) return;

  if (!selectedMusic && selectedStickers.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  let html = '<div class="selected-assets-wrapper">';

  if (selectedMusic) {
    html += `
     <div class="selected-asset-item">
       <span>${selectedMusic.emoji} ${selectedMusic.name}</span>
       <button onclick="removeMusic()">&times;</button>
     </div>
   `;
  }

  selectedStickers.forEach((sticker, index) => {
    html += `
     <div class="selected-asset-item">
       <span>${sticker.emoji} ${sticker.name}</span>
       <button onclick="removeSticker(${index})">&times;</button>
     </div>
   `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function removeMusic() {
  selectedMusic = null;
  updateSelectedAssets();
  showMessage('✅ Music removed', 'success');
}

function removeSticker(index) {
  selectedStickers.splice(index, 1);
  updateSelectedAssets();
  showMessage('✅ Sticker removed', 'success');
}

function openPhotoEditor(index) {
  currentEditIndex = index;
  const img = document.getElementById('editImage');
  if (img) {
    img.src = previewUrls[index];
    showModal('photoEditorModal');
  }
}

function applyFilter(filterName) {
  const img = document.getElementById('editImage');
  if (!img) return;

  currentFilters = {};

  switch (filterName) {
    case 'normal':
      img.style.filter = 'none';
      break;
    case 'vintage':
      currentFilters = { sepia: 50, contrast: 110, brightness: 90 };
      break;
    case 'clarendon':
      currentFilters = { contrast: 120, saturate: 135 };
      break;
    case 'moon':
      currentFilters = { grayscale: 100, contrast: 110, brightness: 110 };
      break;
    case 'lark':
      currentFilters = { contrast: 90, brightness: 110, saturate: 130 };
      break;
    case 'reyes':
      currentFilters = { sepia: 22, brightness: 110, contrast: 85, saturate: 75 };
      break;
  }

  applyFiltersToImage();
}

function applyFiltersToImage() {
  const img = document.getElementById('editImage');
  if (!img) return;

  let filterString = '';

  if (currentFilters.brightness) filterString += `brightness(${currentFilters.brightness}%) `;
  if (currentFilters.contrast) filterString += `contrast(${currentFilters.contrast}%) `;
  if (currentFilters.saturate) filterString += `saturate(${currentFilters.saturate}%) `;
  if (currentFilters.sepia) filterString += `sepia(${currentFilters.sepia}%) `;
  if (currentFilters.grayscale) filterString += `grayscale(${currentFilters.grayscale}%) `;

  img.style.filter = filterString.trim();
}

function resetFilters() {
  const img = document.getElementById('editImage');
  if (img) img.style.filter = 'none';
  currentFilters = {};
  showMessage('✅ Filters reset', 'success');
}

function saveEditedPhoto() {
  showMessage('✅ Changes saved!', 'success');
  closeModal('photoEditorModal');
}

function openCropEditor(index) {
  currentCropIndex = index;
  const img = document.getElementById('cropImage');

  if (img) {
    img.src = previewUrls[index];
    showModal('cropEditorModal');

    setTimeout(() => {
      if (cropper) cropper.destroy();

      cropper = new Cropper(img, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false
      });
    }, 300);
  }
}

function resetCrop() {
  if (cropper) {
    cropper.reset();
    showMessage('✅ Crop reset', 'success');
  }
}

function rotateImage() {
  if (cropper) {
    cropper.rotate(90);
  }
}

function applyCrop() {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas();
  if (!canvas) return;

  canvas.toBlob((blob) => {
    const file = new File([blob], selectedFiles[currentCropIndex].name, {
      type: 'image/jpeg'
    });

    selectedFiles[currentCropIndex] = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrls[currentCropIndex] = e.target.result;
      updatePhotoPreview();
      closeModal('cropEditorModal');
      showMessage('✅ Crop applied!', 'success');

      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
    };
    reader.readAsDataURL(file);
  }, 'image/jpeg', 0.9);
}

// Setup aspect ratio buttons
document.addEventListener('DOMContentLoaded', () => {
  const aspectBtns = document.querySelectorAll('.aspect-ratio-btn');
  aspectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      aspectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const ratio = btn.getAttribute('data-ratio');
      if (cropper) {
        if (ratio === 'free') {
          cropper.setAspectRatio(NaN);
        } else {
          cropper.setAspectRatio(eval(ratio));
        }
      }
    });
  });
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';

  if (modalId === 'cropEditorModal' && cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function showMessage(text, type) {
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
      if (id === 'liveUsersCount') el.textContent = count + ' Active';
      else el.textContent = count;
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

  if (hamburger) hamburger.style.display = 'none';
  if (menu) menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
}

function toggleHamburgerMenu() {
  const menu = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');

  if (options) options.style.display = 'none';
  if (menu) menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
}

function showComplaintModal() {
  const modal = document.getElementById('complaintModal');
  if (modal) modal.style.display = 'flex';

  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

function showContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.style.display = 'flex';

  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

function showFeedbackModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';

  modal.innerHTML = `
   <div class="modal-box">
     <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
     <h2>📢 Feedback</h2>
     <p style="color:#888;margin-bottom:20px;">We'd love to hear from you!</p>
     <input type="text" id="feedbackSubject" placeholder="Subject" style="margin-bottom:15px;">
     <textarea id="feedbackMessage" placeholder="Your feedback..." 
       style="width:100%;min-height:120px;padding:12px;background:rgba(20,30,50,0.6);
       border:1px solid rgba(79,116,163,0.3);border-radius:10px;color:white;
       font-family:inherit;resize:vertical;"></textarea>
     <button onclick="submitFeedback()" style="width:100%;margin-top:15px;">📤 Send</button>
   </div>
 `;

  document.body.appendChild(modal);

  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
}

async function submitFeedback() {
  const subject = document.getElementById('feedbackSubject')?.value.trim();
  const message = document.getElementById('feedbackMessage')?.value.trim();

  if (!subject || !message) return showMessage('⚠️ Fill all fields', 'error');

  try {
    await apiCall('/api/feedback', 'POST', { subject, message });
    showMessage('✅ Thank you!', 'success');
    document.querySelector('.modal')?.remove();
  } catch (error) {
    showMessage('❌ Failed', 'error');
  }
}

async function submitComplaint() {
  const text = document.getElementById('complaintText')?.value.trim();

  if (text) {
    try {
      await apiCall('/api/complaint', 'POST', { text });
      showMessage('✅ Submitted!', 'success');
      const input = document.getElementById('complaintText');
      if (input) input.value = '';
      closeModal('complaintModal');
    } catch (error) {
      showMessage('❌ Failed', 'error');
    }
  } else {
    showMessage('⚠️ Enter details', 'error');
  }
}

function toggleTheme() {
  const body = document.body;

  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  }

  showMessage('🎨 Theme changed!', 'success');

  const hamburger = document.getElementById('hamburgerMenu');
  const options = document.getElementById('optionsMenu');
  if (hamburger) hamburger.style.display = 'none';
  if (options) options.style.display = 'none';
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

async function loadVibeshopPage() {
  console.log('🛍️ Redirecting to VibeShop with SSO...');

  if (!currentUser) {
    showMessage('⚠️ Please log in first to access VibeShop', 'error');
    return;
  }

  try {
    showMessage('🔐 Preparing secure redirect to VibeShop...', 'success');

    // Generate SSO token from backend
    const data = await apiCall('/api/sso/generate-token', 'POST');

    if (data.success && data.ssoToken) {
      // Redirect to vibexpert.shop with SSO token
      window.open(`https://www.vibexpert.shop/shop?sso_token=${data.ssoToken}`, '_blank');
    } else {
      showMessage('❌ Failed to generate SSO token', 'error');
    }
  } catch (error) {
    console.error('SSO redirect error:', error);
    showMessage('❌ Failed to redirect: ' + error.message, 'error');
    // Fallback: open shop without SSO
    window.open('https://www.vibexpert.shop', '_blank');
  }
}




// ========================================
// REWARDS ROADMAP SYSTEM
// ========================================

const roadmapLevels = {};

function updateRoadmapUI() {
  // Roadmaps removed for VibeShop refactor
}


// ========================================
// CONSOLE LOG - INITIALIZATION COMPLETE
// ========================================

console.log('%c🎉 VibeXpert Enhanced Chat Ready! 🎉', 'color: #4f74a3; font-size: 20px; font-weight: bold;');
console.log('%cFeatures: Real-time chat, Reactions, Typing indicators, Message actions', 'color: #8da4d3; font-size: 14px;');

// ==========================================
// FIREWORKS ANIMATION - BIGGER & FASTER
// ==========================================

function initFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.velocity = {
        x: (Math.random() - 0.5) * 12,  // FASTER (was 8)
        y: (Math.random() - 0.5) * 12   // FASTER (was 8)
      };
      this.alpha = 1;
      this.decay = Math.random() * 0.018 + 0.018;  // SLOWER FADE (was 0.015)
      this.size = Math.random() * 1 + 2;  // BIGGER (was 3 + 2)
    }

    update() {
      this.velocity.x *= 0.98;
      this.velocity.y *= 0.98;
      this.velocity.y += 0.1;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let particles = [];
  // MORE COLORFUL (12 colors instead of 6)
  const colors = [
    '#FFD700', '#FFA500', '#FF6B6B', '#FF1493',
    '#00FF00', '#00FFFF', '#FF00FF', '#4f74a3',
    '#8da4d3', '#C0C0C0', '#FF4500', '#7FFF00'
  ];

  function createFirework(x, y) {
    const particleCount = 60;  // MORE PARTICLES (was 30)
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => {
      particle.update();
      particle.draw();
      return particle.alpha > 0;
    });

    requestAnimationFrame(animate);
  }

  // MORE FREQUENT FIREWORKS (800ms instead of 2000ms)
  setInterval(() => {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    createFirework(x, y);
  }, 800);

  animate();
}

// ==========================================
// REWARDS PROGRESS UPDATE
// ==========================================

function updateRewardsProgress() {
  if (!currentUser) return;

  const userStats = {
    activeHours: currentUser.activeHours || 0,
    weeksActive: currentUser.weeksActive || 0,
    alternativeHours: currentUser.alternativeHours || 0,
    posts: currentUser.postCount || 0,
    views: currentUser.viewCount || 0,
    likes: currentUser.likeCount || 0,
    followers: currentUser.followerCount || 0
  };

  const woodProgress = Math.min(100, (userStats.activeHours / 20) * 100);
  const altWoodProgress = Math.min(100, (userStats.alternativeHours / 50) * 100);
  const progress = Math.max(woodProgress, altWoodProgress);

  const progressBar = document.getElementById('progressBarFill');
  const progressPercent = document.getElementById('progressPercentage');

  if (progressBar) progressBar.style.width = progress + '%';
  if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';

  const tasksEl = document.getElementById('progressTasks');
  if (tasksEl) {
    tasksEl.innerHTML = `
      <div style="margin-top: 15px;">
        <div style="color: ${userStats.activeHours >= 20 ? '#22c55e' : '#888'};">
          ⏱️ Active Hours: ${userStats.activeHours}/20 per week
        </div>
        <div style="color: ${userStats.weeksActive >= 4 ? '#22c55e' : '#888'};">
          📅 Weeks: ${userStats.weeksActive}/4
        </div>
        <div style="color: ${userStats.alternativeHours >= 50 ? '#22c55e' : '#888'};">
          🔥 Alternative: ${userStats.alternativeHours}/50 hours in 10 days
        </div>
      </div>
    `;
  }
}

function updateRewardsCharacterPosition(level) {
  const positions = {
    wood: 80,
    bronze: 480,
    silver: 880,
    gold: 1280
  };

  const emojis = {
    wood: '🚶‍♂️',    // Walking man
    bronze: '🏃‍♂️',   // Running man
    silver: '🤸‍♂️',   // Gymnast
    gold: '👑'       // Crown/King
  };

  const char = document.getElementById('roadmapCharacter');
  if (char) {
    char.style.top = (positions[level] || 80) + 'px';
    char.textContent = emojis[level] || '🚶‍♂️';
  }
}

// Initialize when rewards page loads
document.addEventListener('DOMContentLoaded', () => {
  initFireworks();

  const rewardsPage = document.getElementById('rewards');
  if (rewardsPage) {
    const observer = new MutationObserver(() => {
      if (rewardsPage.style.display !== 'none') {
        updateRewardsProgress();
        updateRewardsCharacterPosition('wood');
      }
    });

    observer.observe(rewardsPage, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});

// PROFILE AVATAR UPDATE
// ==========================================

function updateProfileAvatar() {
  if (!currentUser) return;

  const avatarImg = document.getElementById('profileAvatarImg');
  const avatarInitial = document.getElementById('profileAvatarInitial');
  const userName = document.getElementById('userName');

  if (userName) {
    userName.textContent = currentUser.username || 'User';
  }

  if (currentUser.profile_pic && avatarImg && avatarInitial) {
    avatarImg.src = currentUser.profile_pic;
    avatarImg.style.display = 'block';
    avatarInitial.style.display = 'none';
  } else if (avatarInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    avatarInitial.textContent = initial;
  }
}

// Call this after login
document.addEventListener('DOMContentLoaded', function () {
  if (currentUser) {
    updateProfileAvatar();
  }
});

// ==========================================
// SEARCH BAR IN MENU FUNCTIONALITY
// ==========================================

function initializeMenuSearch() {
  const menuSearchBox = document.getElementById('searchBox');
  const mobileSearchBox = document.getElementById('mobileSearchBox');

  if (menuSearchBox) {
    menuSearchBox.addEventListener('input', (e) => {
      handleMenuSearch(e.target.value, 'searchResults');
    });
  }

  if (mobileSearchBox) {
    mobileSearchBox.addEventListener('input', (e) => {
      handleMenuSearch(e.target.value, 'mobileSearchResults');
    });
  }
}

function handleMenuSearch(query, resultsId) {
  const searchResults = document.getElementById(resultsId);

  if (searchTimeout) clearTimeout(searchTimeout);

  if (query.length < 2) {
    if (searchResults) searchResults.style.display = 'none';
    return;
  }

  if (searchResults) {
    searchResults.innerHTML = '<div class="no-results">🔍 Searching...</div>';
    searchResults.style.display = 'block';
  }

  searchTimeout = setTimeout(() => performUserSearch(query), 600);
}

// Initialize menu search on load
document.addEventListener('DOMContentLoaded', function () {
  initializeMenuSearch();
});

// ==========================================
// REALVIBE — COMPLETE SYSTEM
// ==========================================

let rvMediaFile = null;
let rvMediaType = null;
let rvActiveCommentVibeId = null;
let _rvAllVibes = [];

// ── Open creator — gate check ──────────────────────────────────
async function openRealVibeCreator() {
  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    return;
  }

  // If subscription not yet fetched into memory, fetch it now before checking
  if (!currentUser.subscription && currentUser.isPremium) {
    await fetchSubscriptionStatus();
  }

  const sub = checkSubscriptionStatus();

  if (!currentUser.isPremium || !sub) {
    // Not premium — show gate modal
    const gate = document.getElementById('rvPremiumGate');
    if (gate) gate.style.display = 'flex';
    return;
  }

  // Premium confirmed — show creator
  const plan = sub.plan || 'noble';
  const days = plan === 'royal' ? 25 : 15;
  const badge = document.getElementById('rvCreatorPlanBadge');
  if (badge) {
    badge.textContent = plan === 'royal' ? '👑 Royal' : '🥈 Noble';
    badge.className = 'rv-creator-plan-badge rv-badge-' + plan;
  }
  const expiryDays = document.getElementById('rvExpiryDays');
  if (expiryDays) expiryDays.textContent = days;

  clearRvPreview();
  const captionEl = document.getElementById('rvCaption');
  if (captionEl) captionEl.value = '';
  updateRvCounter();

  const modal = document.getElementById('realVibeCreatorModal');
  if (modal) modal.style.display = 'flex';
}

function closeRvCreator(e) {
  if (e && e.target !== document.getElementById('realVibeCreatorModal')) return;
  closeRvCreatorModal();
}

function closeRvCreatorModal() {
  const modal = document.getElementById('realVibeCreatorModal');
  if (modal) modal.style.display = 'none';
  clearRvPreview();
}

function closeRvGate(e) {
  if (e && e.target !== document.getElementById('rvPremiumGate')) return;
  closeRvGateModal();
}
function closeRvGateModal() {
  const gate = document.getElementById('rvPremiumGate');
  if (gate) gate.style.display = 'none';
}

// ── File picking ───────────────────────────────────────────────
function rvTriggerFilePick() {
  document.getElementById('rvFileInput')?.click();
}

function handleRvFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 50 * 1024 * 1024) { showMessage('⚠️ File too large (max 50MB)', 'error'); return; }

  rvMediaFile = file;
  rvMediaType = file.type.startsWith('video/') ? 'video' : 'image';

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = document.getElementById('rvPreviewImg');
    const vid = document.getElementById('rvPreviewVideo');
    const badge = document.getElementById('rvVideoBadge');
    const idle = document.getElementById('rvDropIdle');
    const prev = document.getElementById('rvDropPreview');

    if (rvMediaType === 'video') {
      if (vid) { vid.src = ev.target.result; vid.style.display = 'block'; }
      if (img) img.style.display = 'none';
      if (badge) badge.style.display = 'flex';
    } else {
      if (img) { img.src = ev.target.result; img.style.display = 'block'; }
      if (vid) vid.style.display = 'none';
      if (badge) badge.style.display = 'none';
    }
    if (idle) idle.style.display = 'none';
    if (prev) prev.style.display = 'flex';

    const btn = document.getElementById('rvPublishBtn');
    if (btn) btn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function clearRvPreview() {
  rvMediaFile = null;
  rvMediaType = null;
  const idle = document.getElementById('rvDropIdle');
  const prev = document.getElementById('rvDropPreview');
  const img = document.getElementById('rvPreviewImg');
  const vid = document.getElementById('rvPreviewVideo');
  const fi = document.getElementById('rvFileInput');
  if (idle) idle.style.display = 'flex';
  if (prev) prev.style.display = 'none';
  if (img) { img.src = ''; img.style.display = 'none'; }
  if (vid) { vid.src = ''; vid.style.display = 'none'; }
  if (fi) fi.value = '';
  const btn = document.getElementById('rvPublishBtn');
  if (btn) btn.disabled = true;
}

function updateRvCounter() {
  const cap = document.getElementById('rvCaption');
  const cnt = document.getElementById('rvCaptionCount');
  if (cap && cnt) cnt.textContent = cap.value.length;
}

// ── Publish ────────────────────────────────────────────────────
async function publishRealVibe() {
  if (!rvMediaFile) { showVibeSelectFirst(); return; }
  if (!currentUser) { showMessage('⚠️ Please login first', 'error'); return; }

  const btn = document.getElementById('rvPublishBtn');
  const originalBtnHTML = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <span style="display:flex;align-items:center;gap:.45rem;">
        <span style="width:13px;height:13px;border:2px solid rgba(0,0,0,.25);border-top-color:#000;
          border-radius:50%;animation:rvSpin .65s linear infinite;display:inline-block;flex-shrink:0;"></span>
        Publishing…
      </span>`;
  }

  try {
    const caption = document.getElementById('rvCaption')?.value.trim() || '';
    const visibility = document.querySelector('input[name="rvVisibility"]:checked')?.value || 'public';

    const formData = new FormData();
    formData.append('media', rvMediaFile);
    formData.append('caption', caption);
    formData.append('visibility', visibility);

    const token = getToken();
    const res = await fetch(`${API_URL}/api/realvibes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      // Handle specific premium/quota errors gracefully
      if (data.code === 'PREMIUM_REQUIRED' || res.status === 403) {
        closeRvCreatorModal();
        const gate = document.getElementById('rvPremiumGate');
        if (gate) gate.style.display = 'flex';
        return;
      }
      if (data.code === 'SUBSCRIPTION_EXPIRED') {
        closeRvCreatorModal();
        showMessage('⚠️ Subscription expired — please renew', 'error');
        setTimeout(() => openSubscriptionPopup(), 600);
        return;
      }
      if (data.code === 'QUOTA_EXCEEDED') {
        showMessage('⚠️ ' + data.error, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHTML; }
        return;
      }
      throw new Error(data.error || `Server error (${res.status})`);
    }

    // ✅ Success
    closeRvCreatorModal();
    showVibeOnlineToast();

    // Prepend to feed immediately
    if (data.vibe) {
      _rvAllVibes.unshift(data.vibe);
      renderRvFeed(_rvAllVibes);
    } else {
      setTimeout(() => loadRealVibes(), 500);
    }

  } catch (err) {
    console.error('❌ Publish RealVibe error:', err);
    showMessage('❌ ' + (err.message || 'Failed to publish. Try again.'), 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHTML; }
  }
}

// ─── "Select Your Vibe First" shake toast ────────────────────────────────────
function showVibeSelectFirst() {
  const old = document.getElementById('vibeSelectFirstToast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'vibeSelectFirstToast';
  toast.innerHTML = `
    <div class="vsf-icon">📁</div>
    <span>Select Your Vibe First</span>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('vsf-show')));

  setTimeout(() => {
    toast.classList.remove('vsf-show');
    setTimeout(() => toast.parentNode && toast.remove(), 400);
  }, 3000);
}

function showRvLiveToast() {
  const old = document.getElementById('rvLiveToast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'rvLiveToast';
  t.innerHTML = `
    <span class="rvlt-icon">✦</span>
    <div class="rvlt-body">
      <strong>RealVibe is live!</strong>
      <span>Your exclusive post is now online</span>
    </div>
    <button onclick="this.closest('#rvLiveToast').remove()">✕</button>
  `;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('rvlt-show')));
  setTimeout(() => {
    t.classList.remove('rvlt-show');
    setTimeout(() => t.parentNode && t.remove(), 450);
  }, 4000);
}

// ── Load feed ──────────────────────────────────────────────────
async function loadRealVibes() {
  const feed = document.getElementById('rvFeed');
  if (!feed) return;

  feed.innerHTML = `<div class="rv-loading"><div class="rv-spinner"></div><p>Loading RealVibes…</p></div>`;

  try {
    const data = await apiCall('/api/realvibes', 'GET');
    _rvAllVibes = data.vibes || [];
    renderRvFeed(_rvAllVibes);
  } catch (err) {
    console.error('Load RealVibes error:', err);
    feed.innerHTML = `<div class="rv-empty">
      <div class="rv-empty-icon">✦</div>
      <h3>Couldn't load RealVibes</h3>
      <p>Check your connection and try again.</p>
      <button class="rv-retry-btn" onclick="loadRealVibes()">Retry</button>
    </div>`;
  }
}

function renderRvFeed(vibes) {
  const feed = document.getElementById('rvFeed');
  if (!feed) return;

  // Update post count badge
  const badge = document.getElementById('rvPostCountBadge');
  if (badge) {
    if (vibes.length > 0) {
      badge.textContent = vibes.length + ' post' + (vibes.length !== 1 ? 's' : '');
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  if (!vibes.length) {
    feed.innerHTML = `<div class="rv-empty">
      <div class="rv-empty-icon">✦</div>
      <h3>No RealVibes Yet</h3>
      <p>Premium members can post exclusive content here.</p>
      <button class="rv-gate-subscribe-btn" style="margin-top:1.2rem;" onclick="openRealVibeCreator()">
        <span>✦ Add Your RealVibe</span>
      </button>
    </div>`;
    return;
  }

  feed.innerHTML = vibes.map(v => buildRvCard(v)).join('');
}

function buildRvCard(vibe) {
  const author = vibe.users || {};
  const name = author.username || 'Unknown';
  const college = author.college || '';
  const isRoyal = vibe.plan_type === 'royal';
  const isOwn = currentUser && vibe.user_id === currentUser.id;
  const isLiked = vibe.is_liked;
  const timeStr = vibeTimeAgo ? vibeTimeAgo(vibe.created_at) : '';
  const expHrs = vibe.hours_left || 0;
  const expStr = expHrs > 24 ? `${Math.ceil(expHrs / 24)}d left` : `${expHrs}h left`;
  const isExpiring = expHrs <= 12;

  // Visibility chip
  const visChip = vibe.visibility === 'community'
    ? `<span class="rv-vis-chip college">\uD83C\uDF93 College</span>`
    : `<span class="rv-vis-chip public">\uD83C\uDF10 Public</span>`;

  // Plan badge
  const planBadge = isRoyal
    ? `<span class="rv-card-plan-badge royal">\uD83D\uDC51 Royal</span>`
    : `<span class="rv-card-plan-badge noble">\uD83E\uDD48 Noble</span>`;

  // Avatar
  const avatarInner = author.profile_pic
    ? `<img src="${author.profile_pic}" alt="${escapeHtml(name)}">`
    : `<span>${name.charAt(0).toUpperCase()}</span>`;

  // Media
  const mediaSrc = proxyMediaUrl(vibe.media_url);
  const directSrc = vibe.media_url || '';
  const media = vibe.media_type === 'video'
    ? `<video class="rv-card-media" src="${mediaSrc}" controls playsinline preload="metadata" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${directSrc}'}"></video>`
    : `<img class="rv-card-media" src="${mediaSrc}" alt="${escapeHtml(vibe.caption || '')}" loading="lazy" onclick="openRvMediaViewer('${mediaSrc.replace(/'/g, "\\\\'")}')" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${directSrc}'}">`;

  // Caption block
  const captionHtml = vibe.caption
    ? `<div class="rv-card-caption-wrap"><p class="rv-card-caption">${escapeHtml(vibe.caption)}</p></div>`
    : '';

  // Expiry progress
  const totalHrs = isRoyal ? 600 : 360;
  const pctLeft = Math.min(100, Math.round((expHrs / totalHrs) * 100));
  const barColor = isExpiring ? '#ff4444' : isRoyal ? '#FFD700' : '#a0a0c0';

  return `
<article class="rv-card ${isRoyal ? 'rv-card-royal' : 'rv-card-noble'}" data-vibe-id="${vibe.id}">

  ${isRoyal ? '<div class="rv-card-crown-stripe"></div>' : ''}

  <div class="rv-card-header">
    <div class="rv-card-author" onclick="event.stopPropagation();showUserProfile('${author.id || ''}')" style="cursor:pointer;">
      <div class="rv-card-avatar ${isRoyal ? 'rv-avatar-royal' : ''}">${avatarInner}</div>
      <div class="rv-card-meta">
        <div class="rv-card-name-row">
          <span class="rv-card-name">${escapeHtml(name)}</span>
          ${planBadge}
        </div>
        <div class="rv-card-sub-row">
          ${college ? `<span class="rv-card-college">\uD83C\uDFDB\uFE0F ${escapeHtml(college)}</span>` : ''}
          <span class="rv-card-time">${timeStr}</span>
          ${visChip}
        </div>
      </div>
    </div>
    <div class="rv-card-header-right">
      ${isOwn ? `<button class="rv-card-delete" onclick="event.stopPropagation();deleteRvPost('${vibe.id}',this)" title="Delete post">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6m4-6v6"/>
        </svg>
      </button>` : ''}
    </div>
  </div>

  <div class="rv-card-media-wrap">${media}</div>

  ${captionHtml}

  <div class="rv-card-footer">
    <div class="rv-card-actions">
      <button class="rv-action-btn rv-like-btn ${isLiked ? 'liked' : ''}" onclick="toggleRvLike('${vibe.id}',this)">
        <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="${isLiked ? '#ff3040' : 'none'}" style="stroke:${isLiked ? '#ff3040' : 'currentColor'}">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.84-7.84a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="rv-like-count">${vibe.like_count || 0}</span>
      </button>
      <button class="rv-action-btn" onclick="openRvComments('${vibe.id}')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>${vibe.comment_count || 0}</span>
      </button>
      <button class="rv-action-btn rv-share-btn" onclick="rvSharePost('${vibe.id}','${escapeHtml(name)}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>Share</span>
      </button>
    </div>
    ${isOwn ? `<div class="rv-expiry-row">
      <span class="rv-expiry-label ${isExpiring ? 'rv-expiry-urgent' : ''}">
        ${isExpiring ? '\uD83D\uDD34' : '\u23F3'} ${expStr}
      </span>
      <div class="rv-expiry-bar-track">
        <div class="rv-expiry-bar-fill" style="width:${pctLeft}%;background:${barColor};"></div>
      </div>
    </div>` : ''}
  </div>

</article>`;
}

// Share helper
function rvSharePost(vibeId, authorName) {
  const text = `Check out ${authorName}'s RealVibe on VibeXpert!`;
  if (navigator.share) {
    navigator.share({ title: 'RealVibe', text, url: window.location.href }).catch(() => { });
  } else {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => showMessage('\uD83D\uDD17 Link copied!', 'success'))
      .catch(() => showMessage('Share not supported on this browser', 'info'));
  }
}


// ── Like ───────────────────────────────────────────────────────
async function toggleRvLike(vibeId, btn) {
  if (!currentUser) { showMessage('Login to like', 'error'); return; }
  const wasLiked = btn.classList.contains('liked');
  const countEl = btn.querySelector('.rv-like-count');
  const svgPath = btn.querySelector('path');

  btn.classList.toggle('liked', !wasLiked);
  const newCount = Math.max(0, parseInt(countEl.textContent || '0') + (wasLiked ? -1 : 1));
  if (countEl) countEl.textContent = newCount;
  if (svgPath) { svgPath.setAttribute('fill', wasLiked ? 'none' : '#ff3040'); svgPath.parentElement.style.stroke = wasLiked ? 'currentColor' : '#ff3040'; }

  try {
    const data = await apiCall(`/api/realvibes/${vibeId}/like`, 'POST');
    if (countEl) countEl.textContent = data.likeCount ?? newCount;
    const vibe = _rvAllVibes.find(v => v.id === vibeId);
    if (vibe) { vibe.is_liked = data.liked; vibe.like_count = data.likeCount; }
  } catch (err) {
    // Revert
    btn.classList.toggle('liked', wasLiked);
    if (countEl) countEl.textContent = newCount + (wasLiked ? 1 : -1);
  }
}

// ── Delete ─────────────────────────────────────────────────────
async function deleteRvPost(vibeId, btn) {
  if (!confirm('Delete this RealVibe? This cannot be undone.')) return;
  try {
    await apiCall(`/api/realvibes/${vibeId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');
    _rvAllVibes = _rvAllVibes.filter(v => v.id !== vibeId);
    renderRvFeed(_rvAllVibes);
  } catch (err) {
    showMessage('❌ Delete failed', 'error');
  }
}

// ── Comments ───────────────────────────────────────────────────
async function openRvComments(vibeId) {
  rvActiveCommentVibeId = vibeId;
  const drawer = document.getElementById('rvCommentsDrawer');
  if (!drawer) return;
  drawer.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const list = document.getElementById('rvCommentsList');
  if (list) list.innerHTML = '<div class="rv-comments-loading">Loading…</div>';

  try {
    const data = await apiCall(`/api/realvibes/${vibeId}/comments`, 'GET');
    renderRvComments(data.comments || []);
  } catch (err) {
    if (list) list.innerHTML = '<p style="padding:1rem;opacity:.5">Failed to load comments</p>';
  }
}

function renderRvComments(comments) {
  const list = document.getElementById('rvCommentsList');
  if (!list) return;
  if (!comments.length) {
    list.innerHTML = '<p class="rv-no-comments">No comments yet. Be first! 💬</p>';
    return;
  }
  list.innerHTML = comments.map(c => {
    const u = c.users || {};
    const av = u.profile_pic ? `<img src="${u.profile_pic}" alt="">` : `<span>${(u.username || 'U').charAt(0).toUpperCase()}</span>`;
    return `<div class="rv-comment-item">
      <div class="rv-comment-avatar">${av}</div>
      <div class="rv-comment-body">
        <span class="rv-comment-author">${escapeHtml(u.username || 'User')}</span>
        <p class="rv-comment-text">${escapeHtml(c.content)}</p>
      </div>
    </div>`;
  }).join('');
}

function closeRvComments() {
  const drawer = document.getElementById('rvCommentsDrawer');
  if (drawer) drawer.style.display = 'none';
  document.body.style.overflow = '';
  rvActiveCommentVibeId = null;
}

async function submitRvComment() {
  if (!rvActiveCommentVibeId) return;
  const input = document.getElementById('rvCommentInput');
  const content = input?.value.trim();
  if (!content) return;
  if (!currentUser) { showMessage('Login to comment', 'error'); return; }

  input.value = '';
  try {
    await apiCall(`/api/realvibes/${rvActiveCommentVibeId}/comments`, 'POST', { content });
    const vibe = _rvAllVibes.find(v => v.id === rvActiveCommentVibeId);
    if (vibe) vibe.comment_count = (vibe.comment_count || 0) + 1;
    // Refresh comments
    const data = await apiCall(`/api/realvibes/${rvActiveCommentVibeId}/comments`, 'GET');
    renderRvComments(data.comments || []);
    // Update count on card
    const card = document.querySelector(`.rv-card[data-vibe-id="${rvActiveCommentVibeId}"]`);
    if (card) {
      const countSpan = card.querySelectorAll('.rv-action-btn span')[1];
      if (countSpan && vibe) countSpan.textContent = vibe.comment_count;
    }
  } catch (err) {
    showMessage('❌ Could not post comment', 'error');
  }
}

// Allow Enter key to submit comment
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('rvCommentInput');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') submitRvComment(); });
});

// ── Media viewer ───────────────────────────────────────────────
function openRvMediaViewer(url) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.94);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
  ov.innerHTML = `<img src="${url}" style="max-width:95vw;max-height:92vh;border-radius:8px;object-fit:contain;">`;
  ov.onclick = () => document.body.removeChild(ov);
  document.body.appendChild(ov);
}

// ── Real-time socket updates ───────────────────────────────────
if (typeof io !== 'undefined') {
  // handled via existing socket connection; listen for events
}

// Expose for socket handler in existing code
function handleRvSocketLike(data) {
  const vibe = _rvAllVibes.find(v => v.id === data.vibeId);
  if (vibe) { vibe.like_count = data.likeCount; }
  const card = document.querySelector(`.rv-card[data-vibe-id="${data.vibeId}"]`);
  if (card) {
    const countEl = card.querySelector('.rv-like-count');
    if (countEl) countEl.textContent = data.likeCount;
  }
}

function handleRvSocketNew(vibe) {
  if (!_rvAllVibes.find(v => v.id === vibe.id)) {
    _rvAllVibes.unshift(vibe);
    renderRvFeed(_rvAllVibes);
  }
}

function handleRvSocketDelete(data) {
  _rvAllVibes = _rvAllVibes.filter(v => v.id !== data.id);
  renderRvFeed(_rvAllVibes);
}

// ── Load when page is shown ────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const realVibePage = document.getElementById('realvibe');
  if (realVibePage) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.target.style.display !== 'none') {
          loadRealVibes();
        }
      });
    });
    observer.observe(realVibePage, { attributes: true, attributeFilter: ['style'] });
  }
});
// ==========================================
// SUBSCRIPTION SYSTEM - RAZORPAY INTEGRATION
// ==========================================

function openSubscriptionPopup() {
  const popup = document.getElementById('subscriptionPopup');
  if (popup) {
    showSubView('subscriptionIntro');
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
    updatePlanPricing();
  }
}

function closeSubscriptionPopup() {
  const popup = document.getElementById('subscriptionPopup');
  if (popup) {
    popup.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

function showSubView(viewId) {
  document.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

function showAllPlansView() {
  showSubView('subscriptionPlansView');
}

function showIntroView() {
  showSubView('subscriptionIntro');
}

function viewAllPlans() {
  showAllPlansView();
}

function updatePlanPricing() {
  const isFirstTime = !currentUser || !currentUser.hasSubscribed;
  const noblePrice = document.getElementById('noblePrice');
  const royalPrice = document.getElementById('royalPrice');
  if (noblePrice) noblePrice.textContent = '₹9';
  if (royalPrice) royalPrice.textContent = '₹25';
}

async function selectPlan(planType) {
  if (!currentUser) {
    showMessage('⚠️ Please login first', 'error');
    closeSubscriptionPopup();
    showAuthPopup();
    return;
  }

  const plans = {
    noble: { name: 'Noble', firstTimePrice: 9, regularPrice: 9, posters: 5, videos: 1, days: 15 },
    royal: { name: 'Royal', firstTimePrice: 25, regularPrice: 25, posters: 5, videos: 3, days: 23 }
  };

  const plan = plans[planType];
  if (!plan) { showMessage('❌ Invalid plan', 'error'); return; }

  const isFirstTime = !currentUser.hasSubscribed;
  const price = isFirstTime ? plan.firstTimePrice : plan.regularPrice;

  // Show processing spinner in popup
  showSubView('subscriptionProcessing');

  try {
    const token = getToken();
    if (!token) {
      showMessage('⚠️ Session expired. Please login again.', 'error');
      closeSubscriptionPopup();
      showAuthPopup();
      return;
    }

    // Step 1: Create order on backend
    const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount: price, planType, isFirstTime })
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.success) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    // Step 2: Open REAL Razorpay Checkout - money goes to YOUR account
    showIntroView(); // Hide processing while Razorpay opens

    const rzpOptions = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount * 100, // Razorpay wants paise
      currency: 'INR',
      name: 'VibeXpert',
      description: `${plan.name} Plan - ${plan.days} Days`,
      image: 'https://vibexpert.online/assets/logo.png',
      order_id: orderData.orderId,
      prefill: {
        name: currentUser.name || currentUser.username || '',
        email: currentUser.email || ''
      },
      theme: { color: '#FFD700' },
      handler: async function (response) {
        // Payment successful on Razorpay's side - now verify on our backend
        showSubView('subscriptionProcessing');
        try {
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // Update local user data
            currentUser.subscription = {
              plan: planType,
              startDate: new Date(),
              endDate: new Date(verifyData.subscription ? verifyData.subscription.endDate : Date.now() + plan.days * 86400000),
              posters: plan.posters,
              videos: plan.videos,
              postersUsed: 0,
              videosUsed: 0
            };
            currentUser.hasSubscribed = true;
            currentUser.isPremium = true;
            localStorage.setItem('user', JSON.stringify(currentUser));

            // Show success in popup
            const successEl = document.getElementById('successPlanDetails');
            if (successEl) {
              successEl.innerHTML = `<strong>${plan.name} Plan</strong> activated!<br>` +
                `📸 ${plan.posters} Posters + 🎥 ${plan.videos} Video${plan.videos > 1 ? 's' : ''}<br>` +
                `⏰ Valid for ${plan.days} days<br>` +
                `<small style="opacity:0.7">Payment ID: ${response.razorpay_payment_id}</small>`;
            }
            showSubView('subscriptionSuccess');
            updatePremiumBadge();
            showMessage('🎉 Subscription activated!', 'success');
          } else {
            throw new Error(verifyData.error || 'Verification failed');
          }
        } catch (vErr) {
          console.error('Payment verification error:', vErr);
          showSubView('subscriptionFailed');
          showMessage('❌ Payment verification failed', 'error');
        }
      },
      modal: {
        ondismiss: function () {
          showIntroView();
          showMessage('Payment cancelled', 'error');
        }
      }
    };

    const rzp = new Razorpay(rzpOptions);
    rzp.on('payment.failed', function (resp) {
      console.error('Razorpay payment failed:', resp.error);
      showSubView('subscriptionFailed');
      showMessage('❌ Payment failed: ' + (resp.error.description || 'Unknown error'), 'error');
    });
    rzp.open();

  } catch (error) {
    console.error('Subscription error:', error);
    showSubView('subscriptionFailed');
    showMessage('❌ ' + (error.message || 'Payment failed. Please try again.'), 'error');
  }
}

function showSubscriptionSuccessModal(plan) {
  const modal = document.createElement('div');
  modal.className = 'modal celebration-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="celebration-modal-content">
      <div class="celebration-emoji">👑</div>
      <h2 class="celebration-title" style="color:#FFD700;">Welcome to ${plan.name}!</h2>
      <p class="celebration-message">You can now advertise your content</p>
      <div class="celebration-stats" style="background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));">
        <div class="celebration-count">${plan.posters} Posters + ${plan.videos} Video${plan.videos > 1 ? 's' : ''}</div>
        <div class="celebration-label"> </div>
      </div>
      <div class="celebration-quote">
        <strong>Duration:</strong> ${plan.days} days<br>
        Your ads will appear in Community & RealVibes sections
      </div>
      <button class="celebration-button" style="background:linear-gradient(135deg,#FFD700,#FFA500);"
        onclick="this.closest('.modal').remove(); showPage('posts');">
        Start Creating Ads 🚀
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  if (typeof createConfetti === 'function') createConfetti();
}

// Check subscription status
function checkSubscriptionStatus() {
  if (!currentUser || !currentUser.subscription) return null;
  const now = new Date();
  const endDate = new Date(currentUser.subscription.endDate);
  if (now > endDate) {
    currentUser.isPremium = false;
    currentUser.subscription = null;
    localStorage.setItem('user', JSON.stringify(currentUser));
    return null;
  }
  return currentUser.subscription;
}

// Display premium badge if user is subscribed
function updatePremiumBadge() {
  const userName = document.getElementById('userName');
  if (!userName || !currentUser) return;
  const subscription = checkSubscriptionStatus();
  if (subscription) {
    const planEmoji = subscription.plan === 'royal' ? '👑' : '🥈';
    const badgeClass = subscription.plan === 'royal' ? 'royal-verified' : 'noble-verified';
    userName.innerHTML = `${planEmoji} Hi, ${currentUser.username} <span class="premium-verification-badge ${badgeClass}">✓</span>`;
  } else {
    userName.textContent = 'Hi, ' + currentUser.username;
  }

  // Crown button: glow+float only for non-subscribers; static gold for subscribers
  const crownBtn = document.querySelector('.premium-crown-btn');
  if (crownBtn) {
    if (subscription) {
      crownBtn.classList.add('subscribed');
    } else {
      crownBtn.classList.remove('subscribed');
    }
  }
}

// Fetch subscription status from backend on login
async function fetchSubscriptionStatus() {
  if (!currentUser) return;
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`${API_URL}/api/subscription/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.subscription) {
      currentUser.subscription = {
        plan: data.subscription.plan,
        startDate: data.subscription.startDate,
        endDate: data.subscription.endDate,
        posters: data.subscription.postersQuota || 5,
        videos: data.subscription.videosQuota || 1,
        postersUsed: 0,
        videosUsed: 0
      };
      currentUser.isPremium = true;
      currentUser.hasSubscribed = true;
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      currentUser.isPremium = false;
      currentUser.subscription = null;
    }
    updatePremiumBadge();
  } catch (err) {
    console.error('Failed to fetch subscription status:', err);
  }
}

// Call this after login
document.addEventListener('DOMContentLoaded', function () {
  if (currentUser) {
    fetchSubscriptionStatus();
  }
});

// TWITTER-STYLE FEED FUNCTIONS
// ==========================================

function toggleTwitterFeed() {
  const twitterPanel = document.getElementById('twitterFeedPanel');
  const whatsappMain = document.getElementById('whatsappMain');

  if (!twitterPanel || !whatsappMain) return;

  if (twitterPanel.style.display === 'none') {
    // Show Twitter feed
    twitterPanel.style.display = 'flex';
    whatsappMain.style.display = 'none';
    loadTwitterFeed();
  } else {
    // Show WhatsApp chat
    twitterPanel.style.display = 'none';
    whatsappMain.style.display = 'flex';
  }
}

async function loadTwitterFeed() {
  const feedEl = document.getElementById('twitterFeed');
  if (!feedEl) return;

  try {
    feedEl.innerHTML = '<div class="loading-spinner">⏳ Loading posts...</div>';

    const data = await apiCall('/api/posts/community', 'GET');

    if (!data.posts || data.posts.length === 0) {
      feedEl.innerHTML = `
        <div class="no-posts-state">
          <div class="no-posts-icon">📸</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
          <button class="create-post-btn" onclick="openCreatePostModal()">Create Post</button>
        </div>
      `;
      return;
    }

    feedEl.innerHTML = renderTwitterPosts(data.posts);
  } catch (error) {
    console.error('Load feed:', error);
    feedEl.innerHTML = '<div class="error-state">❌ Failed to load posts</div>';
  }
}

function renderTwitterPosts(posts) {
  let html = '';

  posts.forEach(post => {
    const author = post.users?.username || 'User';
    const authorId = post.users?.id || '';
    const content = post.content || '';
    const media = post.media || [];
    const time = formatTimeAgo(new Date(post.created_at || post.timestamp));
    const isOwn = currentUser && authorId === currentUser.id;
    const likeCount = post.like_count || 0;
    const commentCount = post.comment_count || 0;
    const shareCount = post.share_count || 0;
    const isLiked = post.is_liked || false;

    html += `
      <div class="twitter-post" id="twitter-post-${post.id}">
        <div class="twitter-post-header">
          <div class="twitter-user-info" onclick="showMiniProfileCard('${authorId}',event)">
            <div class="twitter-avatar">
              ${post.users?.profile_pic ?
        `<img src="${post.users.profile_pic}">` :
        '👤'
      }
            </div>
            <div class="twitter-user-details">
              <span class="twitter-username">@${author}</span>
              <span class="twitter-time">· ${time}</span>
            </div>
          </div>
          ${isOwn ? `<button class="twitter-delete-btn" onclick="deleteTwitterPost('${post.id}')">🗑️</button>` : ''}
        </div>

        <div class="twitter-post-content">
          ${content ? `<p class="twitter-text">${content}</p>` : ''}
          
          ${media.length > 0 ? `
            <div class="twitter-media ${media.length === 1 ? 'single' : 'grid'}">
              ${media.slice(0, 4).map((m, idx) => {
        if (m.type === 'image') {
          return `<img src="${proxyMediaUrl(m.url)}" loading="lazy" onclick="openMediaViewer('${post.id}', ${idx})" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${m.url}'}">`;

        } else if (m.type === 'video') {
          return `<video src="${proxyMediaUrl(m.url)}" controls playsinline preload="metadata" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='${m.url}'}"></video>`;
        }
        return '';
      }).join('')}
              ${media.length > 4 ? `<div class="media-overlay">+${media.length - 4}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="twitter-post-actions">
          <button class="twitter-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleTwitterLike('${post.id}')">
            <span>${isLiked ? '❤️' : '🤍'}</span>
            <span>${likeCount}</span>
          </button>
          <button class="twitter-action-btn" onclick="openTwitterComments('${post.id}')">
            <span>💬</span>
            <span>${commentCount}</span>
          </button>
          <button class="twitter-action-btn" onclick="shareTwitterPost('${post.id}')">
            <span>🔄</span>
            <span>${shareCount}</span>
          </button>
        </div>
      </div>
    `;
  });

  return html;
}

async function toggleTwitterLike(postId) {
  if (!currentUser) return showMessage('⚠️ Login to like', 'error');

  try {
    const btn = document.querySelector(`#twitter-post-${postId} .twitter-action-btn.liked, #twitter-post-${postId} .twitter-action-btn:first-child`);
    if (btn) btn.disabled = true;

    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');

    if (data.success) {
      const postEl = document.getElementById(`twitter-post-${postId}`);
      if (postEl) {
        const likeBtn = postEl.querySelector('.twitter-action-btn:first-child');
        if (likeBtn) {
          likeBtn.classList.toggle('liked', data.liked);
          likeBtn.innerHTML = `
            <span>${data.liked ? '❤️' : '🤍'}</span>
            <span>${data.likeCount}</span>
          `;
          likeBtn.disabled = false;
        }
      }
    }
  } catch (error) {
    showMessage('❌ Failed to like', 'error');
  }
}

function openCreatePostModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:600px;">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>Create Post</h2>
      
      <textarea id="newPostContent" placeholder="What's happening?" 
        style="width:100%;min-height:120px;padding:15px;background:rgba(20,30,50,0.6);
        border:2px solid rgba(79,116,163,0.3);border-radius:12px;color:white;
        font-family:inherit;resize:vertical;margin-bottom:15px;"></textarea>

      <div id="newPostMediaPreview" style="display:none;margin-bottom:15px;"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button onclick="selectPostMedia()" 
          style="background:rgba(79,116,163,0.2);color:#4f74a3;border:2px solid rgba(79,116,163,0.3);
          padding:10px 20px;border-radius:10px;cursor:pointer;">
          📷 Add Photo/Video
        </button>
        <button onclick="submitNewPost()" 
          style="background:linear-gradient(135deg,#4f74a3,#8da4d3);color:white;border:none;
          padding:12px 30px;border-radius:10px;font-weight:700;cursor:pointer;">
          Post
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

let newPostMediaFiles = [];

function selectPostMedia() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.multiple = true;
  input.onchange = (e) => {
    const files = Array.from(e.target.files);
    newPostMediaFiles = files;
    previewNewPostMedia(files);
  };
  input.click();
}

function previewNewPostMedia(files) {
  const preview = document.getElementById('newPostMediaPreview');
  if (!preview) return;

  preview.style.display = 'grid';
  preview.style.gridTemplateColumns = 'repeat(auto-fill,minmax(100px,1fr))';
  preview.style.gap = '10px';
  preview.innerHTML = '';

  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;';

      if (file.type.startsWith('video/')) {
        div.innerHTML = `<video src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;"></video>`;
      } else {
        div.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
      }

      div.innerHTML += `<button onclick="removeNewPostMedia(${idx})" 
        style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.7);color:white;
        border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;">×</button>`;

      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removeNewPostMedia(idx) {
  newPostMediaFiles.splice(idx, 1);
  previewNewPostMedia(newPostMediaFiles);
  if (newPostMediaFiles.length === 0) {
    document.getElementById('newPostMediaPreview').style.display = 'none';
  }
}

async function submitNewPost() {
  const content = document.getElementById('newPostContent')?.value.trim();

  if (!content && newPostMediaFiles.length === 0) {
    return showMessage('⚠️ Add content or media', 'error');
  }

  try {
    showMessage('📤 Creating post...', 'success');

    const formData = new FormData();
    formData.append('content', content);
    formData.append('postTo', 'community');

    newPostMediaFiles.forEach(file => {
      formData.append('media', file);
    });

    await apiCall('/api/posts', 'POST', formData);

    showMessage('✅ Post created!', 'success');
    document.querySelector('.modal').remove();
    newPostMediaFiles = [];
    loadTwitterFeed();
  } catch (error) {
    showMessage('❌ Failed to create post', 'error');
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
  return date.toLocaleDateString();
}

function initWhatsAppFeatures() {
  // Setup typing indicator
  const input = document.getElementById('whatsappInput');
  if (input) {
    let typingTimeout;
    input.addEventListener('input', () => {
      if (socket && currentUser && currentUser.college) {
        socket.emit('typing', {
          collegeName: currentUser.college,
          username: currentUser.username
        });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          socket.emit('stop_typing', {
            collegeName: currentUser.college,
            username: currentUser.username
          });
        }, 2000);
      }
    });
  }
}

function searchChats() {
  const query = document.getElementById('chatSearchBox')?.value.toLowerCase() || '';
  const chatItems = document.querySelectorAll('.chat-item');

  chatItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? 'flex' : 'none';
  });
}

function openChat(chatId) {
  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget?.classList.add('active');
}

function refreshChats() {
  loadWhatsAppMessages();
  showMessage('🔄 Refreshed', 'success');
}

// Update socket listeners for WhatsApp
if (socket) {
  socket.on('new_message', (message) => {
    appendWhatsAppMessage(message);

    // Show notification if not focused
    if (document.hidden) {
      const unreadBadge = document.getElementById('unreadCount');
      if (unreadBadge) {
        const count = parseInt(unreadBadge.textContent || '0') + 1;
        unreadBadge.textContent = count;
        unreadBadge.style.display = 'inline';
      }
    }
  });

  socket.on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username) {
      showTypingIndicator(data.username);
    }
  });

  socket.on('user_stop_typing', (data) => {
    hideTypingIndicator(data.username);
  });
}

function showTypingIndicator(username) {
  let indicator = document.getElementById('typing-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'whatsapp-typing-indicator';
    document.getElementById('whatsappMessages')?.appendChild(indicator);
  }
  // Ghost mode — never reveal real identity, always show anonymous message
  indicator.innerHTML = `
    <div class="typing-bubble">
      <span>👻Have Patience</span>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  scrollToBottom();
}

function hideTypingIndicator(username) {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// ==========================================
// ENHANCED PROFILE FUNCTIONS
// ==========================================

let profilePhotoActionsVisible = false;

// Show enhanced profile modal
function showEnhancedProfile() {
  if (!currentUser) return;

  const modal = document.getElementById('enhancedProfileModal');
  if (modal) {
    modal.style.display = 'flex';
    loadEnhancedProfileData();
  }
}

// Close enhanced profile
function closeEnhancedProfile() {
  const modal = document.getElementById('enhancedProfileModal');
  if (modal) modal.style.display = 'none';
  profilePhotoActionsVisible = false;
}

// Load profile data
async function loadEnhancedProfileData() {
  if (!currentUser) return;

  // Display name and username
  const displayName = document.getElementById('profileDisplayName');
  const username = document.getElementById('profileUsername');

  if (displayName) displayName.textContent = currentUser.username || 'User';
  if (username) username.textContent = '@' + (currentUser.username || 'user');

  // College info
  const collegeEl = document.getElementById('profileCollege');
  if (collegeEl && currentUser.college) {
    collegeEl.textContent = `🎓 ${currentUser.college}`;
  }

  // Profile photo
  updateProfilePhotoDisplay();

  // Bio
  const bioText = document.getElementById('bioText');
  if (bioText) {
    if (currentUser.bio) {
      bioText.textContent = currentUser.bio;
      bioText.style.color = '#e0e0e0';
    } else {
      bioText.textContent = 'Click to add bio...';
      bioText.style.color = '#888';
    }
  }

  // Cover photo
  if (currentUser.coverPhoto) {
    const cover = document.getElementById('profileCover');
    if (cover) {
      cover.style.backgroundImage = `url('${currentUser.coverPhoto}')`;
      cover.style.backgroundSize = 'cover';
      cover.style.backgroundPosition = 'center';
    }
  }

  // Stats
  updateProfileStats();

  // Badges
  updateProfileBadges();
}

// Update profile photo display
function updateProfilePhotoDisplay() {
  const photoImg = document.getElementById('profilePhotoImg');
  const photoInitial = document.getElementById('profilePhotoInitial');

  if (currentUser.profile_pic && photoImg && photoInitial) {
    photoImg.src = currentUser.profile_pic;
    photoImg.style.display = 'block';
    photoInitial.style.display = 'none';
  } else if (photoInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    photoInitial.textContent = initial;
    photoInitial.style.display = 'block';
    if (photoImg) photoImg.style.display = 'none';
  }

  // Also update header avatar
  const headerImg = document.getElementById('profileAvatarImg');
  const headerInitial = document.getElementById('profileAvatarInitial');

  if (currentUser.profile_pic && headerImg && headerInitial) {
    headerImg.src = currentUser.profile_pic;
    headerImg.style.display = 'block';
    headerInitial.style.display = 'none';
  } else if (headerInitial) {
    const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
    headerInitial.textContent = initial;
  }
}

// Toggle photo actions
function togglePhotoActions() {
  const actions = document.getElementById('profilePhotoActions');
  if (!actions) return;

  profilePhotoActionsVisible = !profilePhotoActionsVisible;
  actions.style.display = profilePhotoActionsVisible ? 'flex' : 'none';
}

// Capture photo from camera
function captureProfilePhoto() {
  const input = document.getElementById('profilePhotoCameraInput');
  if (input) input.click();
}

// Upload photo from gallery
function uploadProfilePhoto() {
  const input = document.getElementById('profilePhotoInput');
  if (input) input.click();
}

// Handle photo upload
async function handleProfilePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showMessage('⚠️ Photo too large (max 5MB)', 'error');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showMessage('⚠️ Please select an image file', 'error');
    return;
  }

  try {
    showMessage('📤 Uploading photo...', 'success');

    const formData = new FormData();
    formData.append('profilePhoto', file);

    const data = await apiCall('/api/user/profile-photo', 'POST', formData);

    if (data.success && data.photoUrl) {
      currentUser.profile_pic = data.photoUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));

      updateProfilePhotoDisplay();
      showMessage('✅ Photo updated!', 'success');

      // Hide actions
      const actions = document.getElementById('profilePhotoActions');
      if (actions) actions.style.display = 'none';
      profilePhotoActionsVisible = false;
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    showMessage('❌ Failed to upload photo', 'error');
  }

  // Clear input
  event.target.value = '';
}

// Remove profile photo
async function removeProfilePhoto() {
  if (!confirm('Remove profile photo?')) return;

  try {
    showMessage('🗑️ Removing photo...', 'success');

    const data = await apiCall('/api/user/profile-photo', 'DELETE');

    if (data.success) {
      currentUser.profile_pic = null;
      localStorage.setItem('user', JSON.stringify(currentUser));

      updateProfilePhotoDisplay();
      showMessage('✅ Photo removed', 'success');

      // Hide actions
      const actions = document.getElementById('profilePhotoActions');
      if (actions) actions.style.display = 'none';
      profilePhotoActionsVisible = false;
    }
  } catch (error) {
    console.error('Photo remove error:', error);
    showMessage('❌ Failed to remove photo', 'error');
  }
}

// Edit cover photo
function editCoverPhoto() {
  const input = document.getElementById('coverPhotoInput');
  if (input) input.click();
}

// Handle cover photo upload
async function handleCoverPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showMessage('⚠️ Photo too large (max 5MB)', 'error');
    return;
  }

  if (!file.type.startsWith('image/')) {
    showMessage('⚠️ Please select an image file', 'error');
    return;
  }

  try {
    showMessage('📤 Uploading cover...', 'success');

    const formData = new FormData();
    formData.append('coverPhoto', file);

    const data = await apiCall('/api/user/cover-photo', 'POST', formData);

    if (data.success && data.photoUrl) {
      currentUser.coverPhoto = data.photoUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));

      const cover = document.getElementById('profileCover');
      if (cover) {
        cover.style.backgroundImage = `url('${data.photoUrl}')`;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
      }

      showMessage('✅ Cover updated!', 'success');
    }
  } catch (error) {
    console.error('Cover upload error:', error);
    showMessage('❌ Failed to upload cover', 'error');
  }

  event.target.value = '';
}

// Edit bio
function editBio() {
  const bioDisplay = document.getElementById('bioDisplay');
  const bioEdit = document.getElementById('bioEdit');
  const bioInput = document.getElementById('bioInput');
  const bioCount = document.getElementById('bioCount');

  if (!bioDisplay || !bioEdit || !bioInput) return;

}

console.log('✨ RealVibe features initialized!')



// ========================================
// WHATSAPP CHAT FIXES - JAVASCRIPT
// Scrolling + Typing Indicator Solutions
// ========================================

/**
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. Add these functions to your vibemap.js file
 * 2. Call initWhatsAppChatFixes() when community chat loads
 * 3. Update your existing Socket.IO listeners
 */

// ==========================================
// SCROLL MANAGEMENT
// ==========================================

/**
 * Scroll to bottom of WhatsApp messages
 */
function scrollWhatsAppToBottom(smooth = true) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  if (smooth) {
    messagesEl.scrollTo({
      top: messagesEl.scrollHeight,
      behavior: 'smooth'
    });
  } else {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

/**
 * Check if user is at bottom of chat (within 100px threshold)
 */
function isWhatsAppAtBottom() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return true;

  const threshold = 100;
  const position = messagesEl.scrollTop + messagesEl.clientHeight;
  const bottom = messagesEl.scrollHeight;

  return (bottom - position) < threshold;
}

/**
 * Enhanced appendWhatsAppMessage with smart auto-scroll
 */
// ==========================================
// WHATSAPP-STYLE DATE SEPARATOR HELPERS
// ==========================================

let _lastChatDateLabel = null;

function formatDateLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - msgDay) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 4) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

function insertDateSeparatorIfNeeded(messagesEl, messageTime) {
  const label = formatDateLabel(messageTime);
  if (label === _lastChatDateLabel) return false;
  _lastChatDateLabel = label;
  const sep = document.createElement('div');
  sep.className = 'wa-date-separator';
  sep.setAttribute('data-date-label', label);
  sep.innerHTML = `<span>${label}</span>`;
  messagesEl.appendChild(sep);
  return true;
}

function resetChatDateTracking() {
  _lastChatDateLabel = null;
}

// ==========================================
// WHATSAPP MESSAGE APPEND
// ==========================================

function appendWhatsAppMessage(msg) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  const sender = msg.anon_name || (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || '👻 Ghost';
  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));

  // ✅ CRITICAL: Enhanced duplicate detection
  const existingMsg = document.getElementById(`wa-msg-${messageId}`);
  if (existingMsg && !msg.isTemp) {
    console.log('⚠️ Duplicate detected, skipping:', messageId);
    return;
  }

  // ✅ Remember if user was at bottom
  const wasAtBottom = (messagesEl.scrollTop + messagesEl.clientHeight >= messagesEl.scrollHeight - 100);

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now();

  let messageHTML = '';

  if (!isOwn) {
    messageHTML += `<div class="message-sender-name">${escapeHtml(sender)}</div>`;
  }

  // ✅ FIX: Render media in the base appendWhatsAppMessage function
  let baseMediaHTML = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      baseMediaHTML = `<video class="msg-media" src="${proxyMediaUrl(msg.media_url)}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      baseMediaHTML = `<audio class="msg-media" src="${proxyMediaUrl(msg.media_url)}" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      baseMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      baseMediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      baseMediaHTML = `<img class="msg-media" src="${proxyMediaUrl(msg.media_url)}" alt="image" onclick="openImageViewer(this.src)">`;
    }
  }

  messageHTML += `
    <div class="message-bubble">
      ${baseMediaHTML}
      <div class="message-text">${escapeHtml(msg.text || msg.content || '')}</div>
      <div class="message-meta">
        <span class="message-time">${timeLabel}</span>
        ${isOwn ? `<span class="message-status">${msg.isTemp ? '⏳' : '✓'}</span>` : ''}
      </div>
      ${isOwn ? '<div class="message-tail own-tail"></div>' : '<div class="message-tail other-tail"></div>'}
    </div>
  `;

  wrapper.innerHTML = messageHTML;

  // 📅 WhatsApp-style date separator
  insertDateSeparatorIfNeeded(messagesEl, messageTime);

  messagesEl.appendChild(wrapper);

  // ✅ Smart scroll: only if user was already at bottom OR it's own message
  if (isOwn || wasAtBottom) {
    scrollToBottom();
  }

  if (!isOwn && !msg.isTemp) {
    playMessageSound('receive');
  }
}

// ==========================================
// TYPING INDICATOR
// ==========================================

let typingUsersSet = new Set();
let typingIndicatorTimeout = null;

/**
 * Show typing indicator for a user
 */
function showWhatsAppTypingIndicator(username) {
  if (!username || username === currentUser?.username) return;

  typingUsersSet.add(username);
  updateWhatsAppTypingDisplay();
}

/**
 * Hide typing indicator for a user
 */
function hideWhatsAppTypingIndicator(username) {
  typingUsersSet.delete(username);
  updateWhatsAppTypingDisplay();
}

/**
 * Update typing indicator display
 */
function updateWhatsAppTypingDisplay() {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  // Remove existing indicator
  const existingIndicator = document.getElementById('typing-indicator');
  if (existingIndicator) existingIndicator.remove();

  // If no one is typing, exit
  if (typingUsersSet.size === 0) return;

  // Create typing indicator
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'whatsapp-typing-indicator';

  const usersList = Array.from(typingUsersSet);
  let text = '';

  if (usersList.length === 1) {
    text = `${usersList[0]} is typing`;
  } else if (usersList.length === 2) {
    text = `${usersList[0]} and ${usersList[1]} are typing`;
  } else {
    text = `${usersList.length} people are typing`;
  }

  indicator.innerHTML = `
    <div class="typing-bubble">
      <span>${text}</span>
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  messagesEl.appendChild(indicator);

  // Auto-scroll to show typing indicator
  scrollWhatsAppToBottom(true);
}

/**
 * Handle user typing in input
 */
function handleWhatsAppTyping() {
  if (!socket || !currentUser || !currentUser.college) return;

  const now = Date.now();

  // Emit typing event (throttled to every 2 seconds)
  if (!window.lastWhatsAppTypingEmit || (now - window.lastWhatsAppTypingEmit) > 2000) {
    socket.emit('typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
    window.lastWhatsAppTypingEmit = now;
  }

  // Clear existing timeout
  clearTimeout(typingIndicatorTimeout);

  // Stop typing after 3 seconds of inactivity
  typingIndicatorTimeout = setTimeout(() => {
    socket.emit('stop_typing', {
      collegeName: currentUser.college,
      username: currentUser.username
    });
  }, 3000);
}

// ==========================================
// SOCKET.IO LISTENERS
// ==========================================

/**
 * Setup Socket.IO listeners for WhatsApp chat
 */
function setupWhatsAppSocketListeners() {
  if (!socket) return;

  console.log('✅ Setting up WhatsApp Socket listeners');

  // ✅ Remove old listeners to prevent duplicates
  socket.off('new_message');
  socket.off('user_typing');
  socket.off('user_stop_typing');
  socket.off('message_deleted');
  socket.off('messages_seen');

  // New message received (only from OTHER users - backend excludes sender)
  socket.on('new_message', (message) => {
    console.log('📨 New message received:', message);

    // ✅ Double-check it's not from current user (shouldn't happen with backend fix)
    if (message.sender_id === currentUser?.id) {
      console.log('⚠️ Ignoring own message from socket');
      return;
    }

    appendWhatsAppMessage(message);
  });

  // User started typing
  socket.off('user_typing').on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username) {
      showWhatsAppTypingIndicator(data.username);
    }
  });

  // User stopped typing
  socket.off('user_stop_typing').on('user_stop_typing', (data) => {
    if (data.username) {
      hideWhatsAppTypingIndicator(data.username);
    }
  });

  // Message deleted
  socket.off('message_deleted').on('message_deleted', ({ id }) => {
    const messageEl = document.getElementById(`wa-msg-${id}`);
    if (messageEl) {
      messageEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }
  });

  // ✅ SEEN BY — lifetime tracking (persisted in localStorage, never decreases)
  socket.on('messages_seen', (data) => {
    const { username, avatar, lastMsgId } = data;
    if (!username) return;

    // ── 1. Load lifetime seen store from localStorage ──
    const storeKey = '_vibeSeen_' + (currentUser && currentUser.college ? currentUser.college : 'global');
    let lifeStore = {};
    try { lifeStore = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (e) { lifeStore = {}; }

    // ── 2. Per-message map (in-memory, for popup per specific msg) ──
    if (!window._msgSeenBy) window._msgSeenBy = {};
    if (!window._msgSeenBy[lastMsgId]) window._msgSeenBy[lastMsgId] = [];
    if (!window._msgSeenBy[lastMsgId].find(u => u.username === username)) {
      window._msgSeenBy[lastMsgId].push({ username, avatar: avatar || '👤', seenAt: Date.now() });
    }

    // ── 3. Lifetime user store — add user with timestamp if new ──
    if (!lifeStore[username]) {
      lifeStore[username] = { username, avatar: avatar || '👤', seenAt: Date.now() };
      try { localStorage.setItem(storeKey, JSON.stringify(lifeStore)); } catch (e) { }
    }
    // Also update in-memory lifetime map
    if (!window._seenLifetime) window._seenLifetime = {};
    if (!window._seenLifetime[username]) {
      window._seenLifetime[username] = lifeStore[username];
    }

    // ── 4. Update tick on last own message ──
    const allOwn = document.querySelectorAll('.whatsapp-message.own');
    if (!allOwn.length) return;
    const lastOwnMsg = allOwn[allOwn.length - 1];
    const lastOwnId = lastOwnMsg.id.replace('wa-msg-', '');

    const statusEl = document.getElementById('status-' + lastOwnId);
    if (statusEl) statusEl.innerHTML = '<span class="tick tick-seen" style="color:#a89dfc;font-weight:700;">✓✓</span>';

    // ── 5. Update seen-by avatar chips under last own message ──
    _refreshAllSeenByRows();
  });
}

// ==========================================
// SEEN BY — emit to server when user views chat
// ==========================================

function emitMarkSeen(lastMsgId) {
  if (!socket || !currentUser || !currentUser.college || !lastMsgId) return;
  // Don't emit for temp IDs
  if (String(lastMsgId).startsWith('temp-') || String(lastMsgId).startsWith('tmp-')) return;
  socket.emit('mark_seen', {
    collegeName: currentUser.college,
    username: currentUser.username || 'User',
    avatar: currentUser.avatar || currentUser.profile_pic || '👤',
    lastMsgId: lastMsgId
  });
}

// Also emit mark_seen when user scrolls to bottom of chat
(function () {
  function attachScrollSeen() {
    const container = document.getElementById('whatsappMessages');
    if (!container) return;
    container.addEventListener('scroll', function () {
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
      if (!atBottom) return;
      const msgs = container.querySelectorAll('.whatsapp-message.other');
      if (!msgs.length) return;
      const lastMsg = msgs[msgs.length - 1];
      const lastId = lastMsg.id.replace('wa-msg-', '');
      if (lastId) emitMarkSeen(lastId);
    });
  }
  // Try immediately and also after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachScrollSeen);
  } else {
    attachScrollSeen();
  }
  // Also re-attach whenever community chat loads
  const _orig = window.openCommunityChat;
  if (typeof _orig === 'function') {
    window.openCommunityChat = function () {
      _orig.apply(this, arguments);
      setTimeout(attachScrollSeen, 600);
    };
  }
})();

// ==========================================
// ENHANCED SEND MESSAGE
// ==========================================

/**
 * Enhanced appendWhatsAppMessage to ensure reliable rendering
 */
function appendWhatsAppMessageFixed(msg) {
  const messagesEl = document.getElementById('whatsappMessages');
  if (!messagesEl) return;

  // Determine if it's a temp message based on ID or flag
  const isTemp = msg.isTemp || (msg.id && typeof msg.id === 'string' && (msg.id.startsWith('temp-') || msg.id.startsWith('tmp-')));

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  // Use ghost name — never show real username in community chat
  const sender = msg.anon_name || (msg.users && (msg.users.username || msg.users.name)) || msg.sender_name || '👻 Ghost';

  const messageTime = new Date(msg.created_at || msg.timestamp || Date.now());
  const timeLabel = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const messageId = msg.id || ('tmp-' + Math.random().toString(36).slice(2, 8));


  // ✅ CRITICAL: Enhanced duplicate detection
  const existingMsg = document.getElementById(`wa-msg-${messageId}`);
  if (existingMsg && !isTemp) {
    console.log('⚠️ Duplicate detected, skipping:', messageId);
    return;
  }

  // ✅ Remember if user was at bottom
  const wasAtBottom = (messagesEl.scrollTop + messagesEl.clientHeight >= messagesEl.scrollHeight - 100);

  const wrapper = document.createElement('div');
  wrapper.className = 'whatsapp-message ' + (isOwn ? 'own' : 'other');
  wrapper.id = `wa-msg-${messageId}`;
  wrapper.dataset.timestamp = Date.now();

  let messageHTML = '';

  if (!isOwn) {
    // Ghost avatar + name — real identity never shown
    const displaySender = (msg.anon_name) || sender || 'Ghost';
    const safeSender = typeof escapeHtml === 'function' ? escapeHtml(displaySender) : displaySender;
    // Generate a consistent hue from the ghost name for colour variety
    let hue = 0;
    for (let i = 0; i < displaySender.length; i++) hue = (hue + displaySender.charCodeAt(i) * 37) % 360;
    const avatarBg = `hsl(${hue},55%,28%)`;
    const nameColor = `hsl(${hue},80%,75%)`;
    messageHTML += `
      <div class="community-msg-header" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <div class="ghost-chat-avatar" style="
          width:28px;height:28px;min-width:28px;border-radius:50%;
          background:${avatarBg};
          display:flex;align-items:center;justify-content:center;
          font-size:14px;line-height:1;border:1.5px solid rgba(255,255,255,0.12);">
          👻
        </div>
        <span class="message-sender-name" style="color:${nameColor};font-size:12px;font-weight:600;">${safeSender}</span>
      </div>`;
  }

  const contentRaw = msg.text || msg.content || '';
  const contentText = typeof escapeHtml === 'function' ? escapeHtml(contentRaw) : contentRaw;

  // Reply quote (shown if this message is a reply)
  let replyQuoteHTML = '';
  if (msg.reply_to) {
    const rt = msg.reply_to;
    const rtSender = escapeHtml ? escapeHtml(rt.sender_username || 'User') : (rt.sender_username || 'User');
    let rtContent = '';
    if (rt.content && rt.content.trim()) {
      rtContent = `<span class="rq-text">${escapeHtml ? escapeHtml(rt.content) : rt.content}</span>`;
    } else if (rt.media_type) {
      const mediaLabel = rt.media_type === 'image' ? '🖼️ Image' : rt.media_type === 'video' ? '🎥 Video' : rt.media_type === 'audio' ? '🔊 Audio' : '📎 File';
      rtContent = `<span class="rq-media">${mediaLabel}</span>`;
    } else {
      rtContent = `<span class="rq-text">Message</span>`;
    }
    replyQuoteHTML = `
      <div class="msg-reply-quote" onclick="scrollToReplyMsg('${rt.id}')">
        <span class="rq-sender">${rtSender}</span>
        ${rtContent}
      </div>`;
  }

  // Media (image/video/audio/pdf/document)
  let mediaHTML = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      mediaHTML = `<video class="msg-media" src="${proxyMediaUrl(msg.media_url)}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      mediaHTML = `<audio class="msg-media" src="${proxyMediaUrl(msg.media_url)}" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      mediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      mediaHTML = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      mediaHTML = `<img class="msg-media" src="${proxyMediaUrl(msg.media_url)}" alt="image" onclick="openImageViewer(this.src)">`;
    }
  }

  // Options bar (shown on hover)
  const optionsBar = `
    <div class="msg-options-bar">
      <button class="msg-opt-btn reply-opt" onclick="replyToWhatsAppMsg('${messageId}')" title="Reply">↩️</button>
      ${!isOwn ? `<button class="msg-opt-btn" onclick="showEmojiReactPicker('${messageId}', this)" title="React">😊</button>` : ''}
      ${isOwn ? `<button class="msg-opt-btn" onclick="editChatMsg('${messageId}')" title="Edit">✏️</button>` : ''}
      ${isOwn ? `<button class="msg-opt-btn delete-opt" onclick="deleteChatMsg('${messageId}')" title="Delete">🗑️</button>` : ''}
    </div>
  `;

  // Emoji reaction row
  const reactBar = `<div class="msg-react-bar" id="reacts-${messageId}"></div>`;

  messageHTML += `
    ${optionsBar}
    <div class="message-bubble" id="bubble-${messageId}">
      ${replyQuoteHTML}
      ${mediaHTML}
      <div class="message-text">${contentText}</div>
      <div class="message-meta">
        <span class="message-time">${timeLabel}</span>
        ${isOwn ? `<span class="message-status" id="status-${messageId}" style="margin-left:auto;">${isTemp ? '<span class="tick tick-sending" style="font-size:10px;">⏳</span>' : '<span class="tick tick-sent" style="font-size:10px;">✓</span>'}</span>` : ''}
      </div>
      ${isOwn ? '<div class="message-tail own-tail"></div>' : '<div class="message-tail other-tail"></div>'}
    </div>
    ${reactBar}

    ${isOwn ? `
      <div class="community-msg-header own-header" style="display:flex;align-items:center;gap:6px;justify-content:flex-end;margin-top:3px;">
        <span style="font-size:11px;color:rgba(167,139,250,0.7);">You (👻 ${escapeHtml ? escapeHtml(getGhostName() || 'Ghost') : (getGhostName() || 'Ghost')})</span>
        <div style="width:24px;height:24px;min-width:24px;border-radius:50%;background:#3b2080;display:flex;align-items:center;justify-content:center;font-size:12px;border:1.5px solid rgba(167,139,250,0.3);">👻</div>
      </div>` : ''}
  `;

  wrapper.innerHTML = messageHTML;

  // 📅 WhatsApp-style date separator
  insertDateSeparatorIfNeeded(messagesEl, messageTime);

  messagesEl.appendChild(wrapper);

  // If we received someone else's message and we're at the bottom → mark as seen
  if (!isOwn && !isTemp && wasAtBottom) { emitMarkSeen(messageId); }

  // ✅ Smart scroll: skip during initial bulk load (_ghostChatInitialLoad flag)
  // so loadCommunityMessages can handle the final scroll position itself.
  if (!_ghostChatInitialLoad && (isOwn || wasAtBottom)) {
    if (messagesEl.scrollTo) {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    } else {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  if (!isOwn && !isTemp) {
    if (typeof playMessageSound === 'function') playMessageSound('receive');
  }
}

/**
 * Enhanced sendWhatsAppMessage with proper handling
 */
async function sendWhatsAppMessageFixed() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();

  if (!content) { showMessage('⚠️ Message cannot be empty', 'error'); input?.focus(); return; }
  if (!currentUser) { showMessage('⚠️ Please login first', 'error'); return; }

  // ── SAFETY CHECKS ──────────────────────────────────────────────────
  if (!hasGhostName()) {
    requireGhostName(() => sendWhatsAppMessageFixed());
    return;
  }
  if (!communitySafetyCheck(content)) return; // bad words / mute
  // ───────────────────────────────────────────────────────────────────

  const ghostName = getGhostName();

  try {
    const tempMsg = {
      id: 'temp-' + Date.now(),
      content,
      sender_id: currentUser.id,
      anon_name: ghostName,
      users: { id: currentUser.id, username: ghostName, profile_pic: null },
      timestamp: new Date(),
      text: content,
      isTemp: true
    };

    appendWhatsAppMessageFixed(tempMsg);
    input.value = '';
    input.style.height = 'auto';

    if (socket && currentUser.college) {
      socket.emit('stop_typing', { collegeName: currentUser.college, username: ghostName });
    }

    const response = await apiCall('/api/community/messages', 'POST', { content, anon_name: ghostName });

    if (response.success && response.message) {
      playMessageSound('send');
      const tempEl = document.getElementById(`wa-msg-${tempMsg.id}`);
      if (tempEl) tempEl.remove();
      appendWhatsAppMessageFixed(response.message);
    } else if (response.code === 'GHOST_NAME_TAKEN') {
      showMessage(`👻 ${response.error}`, 'error');
      const tempEl = document.getElementById(`wa-msg-${tempMsg.id}`);
      if (tempEl) tempEl.remove();
      // Force ghost name re-selection
      _ghostName = '';
      localStorage.removeItem('vx_ghost_name');
      setTimeout(() => requireGhostName(() => { }), 500);
    }

  } catch (error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');
    const tempEl = document.querySelector('[id^="wa-msg-temp-"]');
    if (tempEl) tempEl.remove();
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize all WhatsApp chat fixes
 * Call this when community chat is loaded
 */
function initWhatsAppChatFixes() {
  console.log('🔧 Initializing WhatsApp Chat Fixes...');

  // Setup socket listeners
  setupWhatsAppSocketListeners();

  // Setup input handler
  const input = document.getElementById('whatsappInput');
  if (input) {
    // Handle typing indicator
    input.addEventListener('input', handleWhatsAppTyping);

    // Auto-resize textarea
    input.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    });
  }



  console.log('✅ WhatsApp Chat Fixes Initialized!');
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when community page is shown
document.addEventListener('DOMContentLoaded', function () {
  const communitiesPage = document.getElementById('communities');

  if (communitiesPage) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.target.style.display !== 'none') {
          // Wait for WhatsApp chat to be rendered
          setTimeout(() => {
            const whatsappMain = document.getElementById('whatsappMain');
            if (whatsappMain && !whatsappMain.dataset.fixesApplied) {
              whatsappMain.dataset.fixesApplied = 'true';
              initWhatsAppChatFixes();

              // Load messages after initialization
              if (typeof loadWhatsAppMessages === 'function') {
                loadWhatsAppMessages();
              }
            }
          }, 100);
        }
      });
    });

    observer.observe(communitiesPage, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});

// Export for manual initialization
window.initWhatsAppChatFixes = initWhatsAppChatFixes;

console.log('📦 WhatsApp Chat Fixes Module Loaded');

// ==========================================
// FIX: Override existing functions
// ==========================================

// Store original functions
const originalAppendWhatsAppMessage = window.appendWhatsAppMessage;
const originalSendWhatsAppMessage = window.sendWhatsAppMessage;

// Override with fixed versions
window.appendWhatsAppMessage = appendWhatsAppMessageFixed;
window.sendWhatsAppMessage = sendWhatsAppMessageFixed;

console.log('✅ WhatsApp functions overridden with fixed versions');

// ==========================================
// NEW COMMUNITY CHAT LOGIC (5-Day Retention)
// ==========================================

let communitySocketInitialized = false;

function setupCommunitySocketListeners() {
  if (!socket) return;
  // Always re-attach to handle reconnects — remove old listeners first to avoid duplicates
  communitySocketInitialized = true;
  socket.off('new_message');
  socket.off('user_typing');
  socket.off('user_stop_typing');
  socket.off('message_deleted');

  socket.on('new_message', (message) => {
    if (message.sender_id === currentUser?.id) return;
    appendCommunityMessage(message);
  });
  socket.on('user_typing', (data) => {
    if (data.username && currentUser && data.username !== currentUser.username)
      showTypingIndicator(data.username);
  });
  socket.on('user_stop_typing', (data) => {
    if (data.username) hideTypingIndicator(data.username);
  });
  socket.on('message_deleted', ({ id }) => {
    const el = document.getElementById(`wa-msg-${id}`) || document.getElementById(`msg-${id}`);
    if (el) { el.style.animation = 'fadeOut 0.3s ease'; setTimeout(() => el.remove(), 300); }
  });

  // Re-join college room and reload messages on every reconnect
  socket.off('connect');
  socket.on('connect', () => {
    console.log('🔌 Socket reconnected — rejoining college room');
    if (currentUser?.college) {
      socket.emit('join_college', currentUser.college);
      socket.emit('user_online', currentUser.id);
    }
    if (hasGhostName() && currentUser?.college) {
      socket.emit('register_ghost_name', {
        userId: currentUser.id,
        collegeName: currentUser.college,
        ghostName: getGhostName()
      });
    }
    // Reload messages to fill any gap while offline
    setTimeout(() => {
      if (typeof loadCommunityMessages === 'function') loadCommunityMessages();
      else if (typeof loadWhatsAppMessages === 'function') loadWhatsAppMessages();
    }, 400);
  });
}

function initCommunityChat() {
  // Reload user from storage if needed
  if (!currentUser) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) { console.error('Error parsing user', e); }
  }

  // Guard: only run if user has joined a college
  if (!currentUser || !currentUser.college || !currentUser.communityJoined) return;

  // The chat UI is already rendered by loadCommunities() via the whatsapp template.
  // This function handles: ghost name gate, socket join, mute check, message load.
  requireGhostName(() => {
    const gnEl = document.getElementById('chatGhostNameDisplay');
    if (gnEl) gnEl.textContent = `👻 ${getGhostName()}`;

    const title = document.getElementById('communityTitle');
    if (title) title.textContent = `👻 ${currentUser.college} — Anonymous Chat`;

    if (socket) {
      socket.emit('join_college', currentUser.college);
      if (hasGhostName()) {
        socket.emit('register_ghost_name', {
          userId: currentUser.id,
          collegeName: currentUser.college,
          ghostName: getGhostName()
        });
        socket.once('ghost_name_result', (result) => {
          if (!result.success) {
            _ghostName = '';
            localStorage.removeItem('vx_ghost_name');
            showMessage('👻 Your ghost name was taken. Choose a new one!', 'error');
          }
        });
      }
      setupCommunitySocketListeners();
    }

    if (isChatMuted()) showCommunityMutedBanner(muteTimeLeft());

    const messagesArea = document.getElementById('chatMessages') || document.getElementById('whatsappMessages');
    if (messagesArea) {
      if (typeof loadCommunityMessages === 'function') loadCommunityMessages();
      else if (typeof loadWhatsAppMessages === 'function') loadWhatsAppMessages();
    }
  });
}

// Flag: suppresses per-message auto-scroll during bulk initial load
let _ghostChatInitialLoad = false;

async function loadCommunityMessages() {
  try {
    const messagesArea = document.getElementById('chatMessages');
    if (!messagesArea) return;

    // Keep welcome message
    const welcomeMsg = messagesArea.querySelector('.chat-welcome-message');
    messagesArea.innerHTML = '';
    if (welcomeMsg) messagesArea.appendChild(welcomeMsg);

    const data = await apiCall('/api/community/messages');

    if (data.success && data.messages) {
      const lastSeen = localStorage.getItem('lastSeenTime_' + currentUser.college) || 0;
      let firstUnreadEl = null;

      // Suppress per-message auto-scroll while we bulk-append
      _ghostChatInitialLoad = true;

      data.messages.forEach(msg => {
        appendWhatsAppMessageFixed(msg);
        const msgTime = new Date(msg.created_at || 0).getTime();
        const isUnread = msgTime > Number(lastSeen) && msg.sender_id !== currentUser.id;
        if (isUnread && !firstUnreadEl) {
          // Insert unread divider BEFORE the last-appended message
          const el = document.getElementById('whatsappMessages');
          const divider = document.createElement('div');
          divider.className = 'unread-divider';
          divider.textContent = '\u2191 Unread messages';
          if (el && el.lastChild) {
            el.insertBefore(divider, el.lastChild);
            firstUnreadEl = divider;
          }
        }
      });

      _ghostChatInitialLoad = false;

      // Save current time as "last seen"
      localStorage.setItem('lastSeenTime_' + currentUser.college, Date.now());

      // Restore lifetime seen data and refresh avatar chips
      _initSeenLifetime();
      setTimeout(() => _refreshAllSeenByRows(), 150);

      // ── Scroll to unread OR bottom ─────────────────────────────────
      // We retry multiple times because images inflate scrollHeight after paint.
      function _doScroll() {
        const el = document.getElementById('whatsappMessages');
        if (!el) return;
        if (firstUnreadEl) {
          // Position divider ~60px from top of the scroll container
          el.scrollTop = Math.max(0, firstUnreadEl.offsetTop - 60);
        } else {
          el.scrollTop = el.scrollHeight;
        }
      }

      requestAnimationFrame(() => {
        _doScroll();
        setTimeout(_doScroll, 250);   // after first images load
        setTimeout(_doScroll, 800);   // after slow network images
      });

      // Emit mark_seen for the last OTHER message
      const allOtherMsgs = document.querySelectorAll('.whatsapp-message.other');
      if (allOtherMsgs.length) {
        const lastOther = allOtherMsgs[allOtherMsgs.length - 1];
        const lastId = lastOther.id.replace('wa-msg-', '');
        if (lastId) emitMarkSeen(lastId);
      }
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

function appendCommunityMessage(msg) {
  const messagesArea = document.getElementById('chatMessages');
  if (!messagesArea) return;

  const isOwn = msg.sender_id === (currentUser && currentUser.id);
  // Ghost name only — never real name
  const senderName = msg.anon_name || msg.users?.username || '👻 Ghost';
  const time = new Date(msg.created_at || msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${isOwn ? 'right' : 'left'}`;

  let mediaHtml = '';
  if (msg.media_url) {
    if (msg.media_type === 'video') {
      mediaHtml = `<video src="${proxyMediaUrl(msg.media_url)}" class="chat-media-video" controls></video>`;
    } else if (msg.media_type === 'audio') {
      mediaHtml = `<audio src="${proxyMediaUrl(msg.media_url)}" class="chat-media-audio" controls></audio>`;
    } else if (msg.media_type === 'pdf') {
      mediaHtml = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📄 ${msg.media_name || 'Document.pdf'}</a>`;
    } else if (msg.media_type === 'document') {
      mediaHtml = `<a class="msg-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${msg.media_name || 'File'}</a>`;
    } else {
      mediaHtml = `<img src="${proxyMediaUrl(msg.media_url)}" class="chat-media-img" onclick="openImageViewer(this.src)">`;
    }
  }

  msgDiv.innerHTML = `
    ${!isOwn ? `<div class="chat-sender-name" style="color:#a78bfa;">👻 ${senderName}</div>` : ''}
    <div class="chat-bubble">
      ${msg.content || ''}
      ${mediaHtml}
      <div class="message-time">${time}</div>
    </div>
  `;

  messagesArea.appendChild(msgDiv);
  scrollToCommunityBottom();
}

function scrollToCommunityBottom() {
  const messagesArea = document.getElementById('chatMessages');
  if (messagesArea) {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

let selectedChatMedia = null;

function handleChatMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedChatMedia = file;
  const reader = new FileReader();

  const previewContainer = document.getElementById('chatMediaPreview');
  const imgPreview = document.getElementById('chatPreviewImg');
  const videoPreview = document.getElementById('chatPreviewVideo');

  if (previewContainer) {
    reader.onload = function (e) {
      previewContainer.style.display = 'block';

      if (file.type.startsWith('video/')) {
        videoPreview.src = e.target.result;
        videoPreview.style.display = 'block';
        imgPreview.style.display = 'none';
      } else {
        imgPreview.src = e.target.result;
        imgPreview.style.display = 'block';
        videoPreview.style.display = 'none';
      }
    };

    reader.readAsDataURL(file);
  }
}

function clearChatPreview() {
  selectedChatMedia = null;
  const input = document.getElementById('chatMediaInput');
  const preview = document.getElementById('chatMediaPreview');

  if (input) input.value = '';
  if (preview) preview.style.display = 'none';
}
// ==========================================
// CHAT MEDIA EDITOR — Full image/video editor popup
// ==========================================

let selectedWhatsAppMedia = null;

// ── State ─────────────────────────────────────────────────────
const _me = {
  file: null, origImg: null, canvas: null, ctx: null,
  rotation: 0, flipH: false, flipV: false,
  brightness: 0, contrast: 0, saturation: 0,
  filter: 'none',
  drawing: false, drawColor: '#ff3b6b', drawSize: 4,
  isDrawMode: false, isTextMode: false,
  cropMode: false, cropStart: null, cropEnd: null,
  lastX: 0, lastY: 0,
  videoSrc: null
};

const FILTERS = {
  none: { label: 'Original', css: '' },
  vivid: { label: 'Vivid', css: 'saturate(1.8) contrast(1.1)' },
  bw: { label: 'B&W', css: 'grayscale(1)' },
  warm: { label: 'Warm', css: 'sepia(0.4) saturate(1.3)' },
  cool: { label: 'Cool', css: 'hue-rotate(20deg) saturate(1.2)' },
  fade: { label: 'Fade', css: 'opacity(0.85) saturate(0.7)' },
  sharp: { label: 'Sharp', css: 'contrast(1.3) brightness(1.05)' },
  dreamy: { label: 'Dreamy', css: 'blur(0.4px) brightness(1.1) saturate(1.4)' }
};

function handleChatFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // ── INSTITUTE CHAT: 18+ content consent required for photos & videos ──
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
    requireImageConsent().then(agreed => {
      if (!agreed) { event.target.value = ''; return; }
      _me.file = file;
      // Open the media editor for images and videos; send other files directly
      openMediaEditor(file);
    });
    return;
  }
  // ─────────────────────────────────────────────────────────────────────

  _me.file = file;

  // Send audio / documents / PDFs directly (no editor needed)
  selectedWhatsAppMedia = file;
  const bar = document.getElementById('chatFilePreviewBar');
  const img = document.getElementById('chatFilePreviewImg');
  const vid = document.getElementById('chatFilePreviewVideo');
  const nameEl = document.getElementById('chatFilePreviewName');
  if (bar) {
    if (img) img.style.display = 'none';
    if (vid) vid.style.display = 'none';
    if (nameEl) nameEl.textContent = file.name;
    bar.style.display = 'flex';
  }
}

function openMediaEditor(file) {
  // Remove any existing editor
  document.getElementById('mediaEditorOverlay')?.remove();

  const isVideo = file.type.startsWith('video/');

  const overlay = document.createElement('div');
  overlay.id = 'mediaEditorOverlay';
  overlay.className = 'media-editor-overlay';

  overlay.innerHTML = `
    <div class="media-editor-modal">
      <div class="me-header">
        <button class="me-close-btn" onclick="closeMediaEditor()">✕</button>
        <h3 class="me-title">${isVideo ? '🎥 Video Preview' : '🖼️ Edit Photo'}</h3>
        <button class="me-send-btn" onclick="confirmMediaAndSend()">Send ➤</button>
      </div>

      <div class="me-body">
        ${isVideo ? buildVideoEditor() : buildImageEditor()}
      </div>

      ${!isVideo ? `
      <div class="me-toolbar">
        <!-- Tabs -->
        <div class="me-tabs">
          <button class="me-tab active" onclick="meSetTab(this,'filters')">🎨 Filters</button>
          <button class="me-tab" onclick="meSetTab(this,'adjust')">⚡ Adjust</button>
          <button class="me-tab" onclick="meSetTab(this,'transform')">↻ Transform</button>
          <button class="me-tab" onclick="meSetTab(this,'draw')">✏️ Draw</button>
          <button class="me-tab" onclick="meSetTab(this,'text')">T Text</button>
          <button class="me-tab" onclick="meSetTab(this,'crop')">✂️ Crop</button>
        </div>

        <!-- Filters Panel -->
        <div class="me-panel active" id="me-panel-filters">
          <div class="me-filters-row">
            ${Object.entries(FILTERS).map(([k, v]) =>
    `<button class="me-filter-pill ${k === 'none' ? 'active' : ''}" onclick="meApplyFilter('${k}',this)">
                <span class="me-filter-icon">${filterIcon(k)}</span>
                <span>${v.label}</span>
              </button>`
  ).join('')}
          </div>
        </div>

        <!-- Adjust Panel -->
        <div class="me-panel" id="me-panel-adjust">
          <div class="me-slider-row">
            <label>☀️ Brightness</label>
            <input type="range" min="-100" max="100" value="0" oninput="meAdjust('brightness',this.value,this)">
            <span class="me-slider-val">0</span>
          </div>
          <div class="me-slider-row">
            <label>◑ Contrast</label>
            <input type="range" min="-100" max="100" value="0" oninput="meAdjust('contrast',this.value,this)">
            <span class="me-slider-val">0</span>
          </div>
          <div class="me-slider-row">
            <label>🎨 Saturation</label>
            <input type="range" min="-100" max="100" value="0" oninput="meAdjust('saturation',this.value,this)">
            <span class="me-slider-val">0</span>
          </div>
        </div>

        <!-- Transform Panel -->
        <div class="me-panel" id="me-panel-transform">
          <div class="me-btn-grid">
            <button class="me-tool-btn" onclick="meRotate(-90)">↺ Rotate L</button>
            <button class="me-tool-btn" onclick="meRotate(90)">↻ Rotate R</button>
            <button class="me-tool-btn" onclick="meFlip('H')">⇔ Flip H</button>
            <button class="me-tool-btn" onclick="meFlip('V')">⇕ Flip V</button>
            <button class="me-tool-btn danger" onclick="meReset()">↩ Reset All</button>
          </div>
        </div>

        <!-- Draw Panel -->
        <div class="me-panel" id="me-panel-draw">
          <div class="me-draw-controls">
            <label>Color:</label>
            <input type="color" value="#ff3b6b" oninput="_me.drawColor=this.value">
            <label>Size:</label>
            <input type="range" min="2" max="24" value="4" oninput="_me.drawSize=this.value">
            <button class="me-tool-btn ${_me.isDrawMode ? 'active' : ''}" id="meDrawToggle" onclick="meToggleDraw()">
              ${_me.isDrawMode ? '🛑 Stop' : '✏️ Start Draw'}
            </button>
            <button class="me-tool-btn danger" onclick="meUndoDraw()">↩ Undo</button>
          </div>
        </div>

        <!-- Text Panel -->
        <div class="me-panel" id="me-panel-text">
          <div class="me-text-controls">
            <input id="meTextInput" type="text" placeholder="Type text here..." class="me-text-field">
            <input type="color" value="#ffffff" id="meTextColor">
            <input type="range" min="12" max="72" value="28" id="meTextSize">
            <button class="me-tool-btn" onclick="meAddText()">Add Text ➕</button>
          </div>
        </div>

        <!-- Crop Panel -->
        <div class="me-panel" id="me-panel-crop">
          <div class="me-btn-grid">
            <button class="me-tool-btn ${_me.cropMode ? 'active' : ''}" id="meCropToggle" onclick="meToggleCrop()">✂️ Select Area</button>
            <button class="me-tool-btn" onclick="meApplyCrop()">✅ Apply Crop</button>
            <button class="me-tool-btn danger" onclick="meCancelCrop()">✕ Cancel</button>
            <button class="me-tool-btn" onclick="meCropAspect(1,1)">1:1</button>
            <button class="me-tool-btn" onclick="meCropAspect(16,9)">16:9</button>
            <button class="me-tool-btn" onclick="meCropAspect(4,3)">4:3</button>
          </div>
        </div>
      </div>
      ` : `
      <!-- Video caption -->
      <div class="me-toolbar" style="padding:14px;">
        <input id="meVideoCaption" type="text" placeholder="Add a caption (optional)..." class="me-text-field">
      </div>
      `}
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  if (!isVideo) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        _me.origImg = img;
        _me.rotation = 0; _me.flipH = false; _me.flipV = false;
        _me.brightness = 0; _me.contrast = 0; _me.saturation = 0;
        _me.filter = 'none'; _me.isDrawMode = false; _me.isTextMode = false;
        _me.cropMode = false; _me.cropStart = null; _me.cropEnd = null;
        meRenderCanvas();
        meAttachCanvasEvents();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    _me.videoSrc = URL.createObjectURL(file);
    const vid = document.getElementById('meVideoPreview');
    if (vid) vid.src = _me.videoSrc;
  }
}

function buildImageEditor() {
  return `<div class="me-canvas-wrap">
    <canvas id="meCanvas"></canvas>
    <canvas id="meCropCanvas" class="me-crop-canvas" style="display:none;"></canvas>
  </div>`;
}

function buildVideoEditor() {
  return `<div class="me-video-wrap">
    <video id="meVideoPreview" controls playsinline style="max-width:100%;max-height:340px;border-radius:12px;"></video>
  </div>`;
}

function filterIcon(k) {
  const icons = { none: '🌟', vivid: '✨', bw: '⬛', warm: '🌅', cool: '❄️', fade: '🌫️', sharp: '🔍', dreamy: '💜' };
  return icons[k] || '🎨';
}

// ── Rendering ─────────────────────────────────────────────────
function meRenderCanvas() {
  const canvas = document.getElementById('meCanvas');
  if (!canvas || !_me.origImg) return;
  _me.canvas = canvas;
  _me.ctx = canvas.getContext('2d');

  const maxW = canvas.parentElement.clientWidth - 16;
  const maxH = 340;
  const img = _me.origImg;

  const rad = (_me.rotation * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));
  const rotW = img.width * absCos + img.height * absSin;
  const rotH = img.width * absSin + img.height * absCos;

  const scale = Math.min(maxW / rotW, maxH / rotH, 1);
  canvas.width = Math.round(rotW * scale);
  canvas.height = Math.round(rotH * scale);

  const ctx = _me.ctx;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(_me.flipH ? -1 : 1, _me.flipV ? -1 : 1);

  // CSS filter on canvas context (via filter property)
  let f = FILTERS[_me.filter]?.css || '';
  const b = _me.brightness;
  const c = _me.contrast;
  const s = _me.saturation;
  f += ` brightness(${1 + b / 100}) contrast(${1 + c / 100}) saturate(${1 + s / 100})`;
  ctx.filter = f.trim();

  ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
  ctx.restore();
  ctx.filter = 'none';
}

// ── Tab switching ──────────────────────────────────────────────
function meSetTab(btn, panelId) {
  document.querySelectorAll('.me-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.me-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('me-panel-' + panelId)?.classList.add('active');
  if (panelId !== 'draw') { _me.isDrawMode = false; meUpdateDrawBtn(); }
  if (panelId !== 'crop') { _me.cropMode = false; meCancelCrop(); }
}

// ── Filters ───────────────────────────────────────────────────
function meApplyFilter(key, btn) {
  _me.filter = key;
  document.querySelectorAll('.me-filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  meRenderCanvas();
}

// ── Adjust ────────────────────────────────────────────────────
function meAdjust(prop, val, input) {
  _me[prop] = parseFloat(val);
  input.parentElement.querySelector('.me-slider-val').textContent = Math.round(val);
  meRenderCanvas();
}

// ── Transform ─────────────────────────────────────────────────
function meRotate(deg) { _me.rotation = ((_me.rotation + deg) % 360 + 360) % 360; meRenderCanvas(); }
function meFlip(dir) { if (dir === 'H') _me.flipH = !_me.flipH; else _me.flipV = !_me.flipV; meRenderCanvas(); }
function meReset() {
  _me.rotation = 0; _me.flipH = false; _me.flipV = false;
  _me.brightness = 0; _me.contrast = 0; _me.saturation = 0;
  _me.filter = 'none'; _me.isDrawMode = false; _me.cropMode = false;
  _me.cropStart = null; _me.cropEnd = null;
  // Reset sliders
  document.querySelectorAll('#me-panel-adjust input[type=range]').forEach(s => { s.value = 0; s.parentElement.querySelector('.me-slider-val').textContent = '0'; });
  document.querySelectorAll('.me-filter-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.me-filter-pill')?.classList.add('active');
  meRenderCanvas();
}

// ── Draw ──────────────────────────────────────────────────────
let _meDrawHistory = [];
function meToggleDraw() {
  _me.isDrawMode = !_me.isDrawMode;
  _me.isTextMode = false;
  meUpdateDrawBtn();
}
function meUpdateDrawBtn() {
  const btn = document.getElementById('meDrawToggle');
  if (btn) btn.textContent = _me.isDrawMode ? '🛑 Stop' : '✏️ Start Draw';
}
function meUndoDraw() {
  if (!_meDrawHistory.length || !_me.canvas) return;
  const last = _meDrawHistory.pop();
  _me.ctx.putImageData(last, 0, 0);
}

// ── Text ──────────────────────────────────────────────────────
function meAddText() {
  const txt = document.getElementById('meTextInput')?.value.trim();
  if (!txt || !_me.canvas) return;
  const color = document.getElementById('meTextColor')?.value || '#ffffff';
  const size = document.getElementById('meTextSize')?.value || 28;
  const ctx = _me.ctx;
  // Save for undo
  _meDrawHistory.push(ctx.getImageData(0, 0, _me.canvas.width, _me.canvas.height));
  ctx.font = `bold ${size}px sans-serif`;
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.strokeText(txt, _me.canvas.width / 2, _me.canvas.height / 2);
  ctx.fillText(txt, _me.canvas.width / 2, _me.canvas.height / 2);
  document.getElementById('meTextInput').value = '';
}

// ── Crop ──────────────────────────────────────────────────────
let _cropRect = null;
function meToggleCrop() {
  _me.cropMode = !_me.cropMode;
  const btn = document.getElementById('meCropToggle');
  if (btn) btn.textContent = _me.cropMode ? '✕ Stop Select' : '✂️ Select Area';
  if (!_me.cropMode) meCancelCrop();
}
function meCancelCrop() {
  _cropRect = null;
  _me.cropMode = false;
  const cc = document.getElementById('meCropCanvas');
  if (cc) { cc.style.display = 'none'; const ctx = cc.getContext('2d'); ctx.clearRect(0, 0, cc.width, cc.height); }
}
function meCropAspect(w, h) {
  if (!_me.canvas) return;
  _me.cropMode = true;
  const cw = _me.canvas.width, ch = _me.canvas.height;
  const aspect = w / h;
  let rw, rh;
  if (cw / ch > aspect) { rh = ch * 0.8; rw = rh * aspect; } else { rw = cw * 0.8; rh = rw / aspect; }
  const rx = (cw - rw) / 2, ry = (ch - rh) / 2;
  _cropRect = { x: rx, y: ry, w: rw, h: rh };
  meDrawCropOverlay();
}
function meDrawCropOverlay() {
  const cc = document.getElementById('meCropCanvas');
  if (!cc || !_me.canvas || !_cropRect) return;
  cc.width = _me.canvas.width; cc.height = _me.canvas.height;
  cc.style.display = 'block';
  const ctx = cc.getContext('2d');
  ctx.clearRect(0, 0, cc.width, cc.height);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, cc.width, cc.height);
  ctx.clearRect(_cropRect.x, _cropRect.y, _cropRect.w, _cropRect.h);
  ctx.strokeStyle = '#4f74a3';
  ctx.lineWidth = 2;
  ctx.strokeRect(_cropRect.x, _cropRect.y, _cropRect.w, _cropRect.h);
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(_cropRect.x + _cropRect.w * i / 3, _cropRect.y); ctx.lineTo(_cropRect.x + _cropRect.w * i / 3, _cropRect.y + _cropRect.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(_cropRect.x, _cropRect.y + _cropRect.h * i / 3); ctx.lineTo(_cropRect.x + _cropRect.w, _cropRect.y + _cropRect.h * i / 3); ctx.stroke();
  }
}
function meApplyCrop() {
  if (!_cropRect || !_me.canvas || !_me.ctx) return;
  const { x, y, w, h } = _cropRect;
  const imgData = _me.ctx.getImageData(x, y, w, h);
  _me.canvas.width = w; _me.canvas.height = h;
  _me.ctx.putImageData(imgData, 0, 0);
  meCancelCrop();
  // Reset origImg reference to the cropped version so re-renders stay cropped
  const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
  tmp.getContext('2d').putImageData(imgData, 0, 0);
  const ni = new Image(); ni.src = tmp.toDataURL();
  ni.onload = () => { _me.origImg = ni; };
}

// ── Canvas Events (draw + crop drag) ──────────────────────────
function meAttachCanvasEvents() {
  const canvas = document.getElementById('meCanvas');
  const cc = document.getElementById('meCropCanvas');
  if (!canvas) return;

  function getPos(e, el) {
    const r = el.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - r.left, y: cy - r.top };
  }

  // Draw on main canvas
  canvas.addEventListener('mousedown', e => {
    if (!_me.isDrawMode) return;
    _meDrawHistory.push(_me.ctx.getImageData(0, 0, canvas.width, canvas.height));
    _me.drawing = true;
    const p = getPos(e, canvas); _me.lastX = p.x; _me.lastY = p.y;
  });
  canvas.addEventListener('mousemove', e => {
    if (!_me.drawing || !_me.isDrawMode) return;
    const p = getPos(e, canvas);
    _me.ctx.beginPath();
    _me.ctx.moveTo(_me.lastX, _me.lastY);
    _me.ctx.lineTo(p.x, p.y);
    _me.ctx.strokeStyle = _me.drawColor;
    _me.ctx.lineWidth = _me.drawSize;
    _me.ctx.lineCap = 'round';
    _me.ctx.lineJoin = 'round';
    _me.ctx.stroke();
    _me.lastX = p.x; _me.lastY = p.y;
  });
  canvas.addEventListener('mouseup', () => { _me.drawing = false; });
  canvas.addEventListener('mouseleave', () => { _me.drawing = false; });

  // Touch draw
  canvas.addEventListener('touchstart', e => { e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })); }, { passive: false });
  canvas.addEventListener('touchend', () => canvas.dispatchEvent(new MouseEvent('mouseup')));

  // Crop drag on crop-canvas overlay
  if (cc) {
    let dragging = false, startX = 0, startY = 0;
    cc.addEventListener('mousedown', e => {
      if (!_me.cropMode) return;
      dragging = true;
      const p = getPos(e, cc); startX = p.x; startY = p.y;
      _cropRect = null;
    });
    cc.addEventListener('mousemove', e => {
      if (!dragging || !_me.cropMode) return;
      const p = getPos(e, cc);
      _cropRect = { x: Math.min(startX, p.x), y: Math.min(startY, p.y), w: Math.abs(p.x - startX), h: Math.abs(p.y - startY) };
      meDrawCropOverlay();
    });
    cc.addEventListener('mouseup', () => { dragging = false; });
  }
}

// ── Close / Confirm ───────────────────────────────────────────
function closeMediaEditor() {
  document.getElementById('mediaEditorOverlay')?.remove();
  clearChatFilePreview();
}

async function confirmMediaAndSend() {
  const isVideo = _me.file?.type.startsWith('video/');

  if (isVideo) {
    // Use original video file + caption
    selectedWhatsAppMedia = _me.file;
    const caption = document.getElementById('meVideoCaption')?.value.trim() || '';
    document.getElementById('whatsappInput').value = caption;
  } else {
    // Export edited canvas as Blob → File
    const canvas = document.getElementById('meCanvas');
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      selectedWhatsAppMedia = new File([blob], _me.file?.name || 'photo.jpg', { type: 'image/jpeg' });
      // Show small thumbnail in preview bar
      const bar = document.getElementById('chatFilePreviewBar');
      const img = document.getElementById('chatFilePreviewImg');
      if (bar && img) {
        img.src = canvas.toDataURL();
        img.style.display = 'block';
        document.getElementById('chatFilePreviewVideo').style.display = 'none';
        document.getElementById('chatFilePreviewName').textContent = selectedWhatsAppMedia.name;
        bar.style.display = 'flex';
      }
    }, 'image/jpeg', 0.93);
  }

  // Close the editor
  document.getElementById('mediaEditorOverlay')?.remove();

  // For video, also show in preview bar
  if (isVideo) {
    const bar = document.getElementById('chatFilePreviewBar');
    const vid = document.getElementById('chatFilePreviewVideo');
    const img = document.getElementById('chatFilePreviewImg');
    if (bar && vid) {
      vid.src = URL.createObjectURL(_me.file);
      vid.style.display = 'block';
      if (img) img.style.display = 'none';
      document.getElementById('chatFilePreviewName').textContent = _me.file.name;
      bar.style.display = 'flex';
    }
  }
}

function clearChatFilePreview() {
  selectedWhatsAppMedia = null;
  const fileInput = document.getElementById('chatFileInput');
  const bar = document.getElementById('chatFilePreviewBar');
  const img = document.getElementById('chatFilePreviewImg');
  const vid = document.getElementById('chatFilePreviewVideo');
  if (fileInput) fileInput.value = '';
  if (bar) bar.style.display = 'none';
  if (img) { img.src = ''; img.style.display = 'none'; }
  if (vid) { vid.src = ''; vid.style.display = 'none'; }
}

// Send message with optional media
async function sendWhatsAppMessageWithMedia() {
  const input = document.getElementById('whatsappInput');
  const content = input?.value.trim();

  if (!currentUser) { showMessage('⚠️ Please login first', 'error'); return; }

  // ── SAFETY CHECKS ──────────────────────────────────────────────────
  if (!hasGhostName()) { requireGhostName(() => sendWhatsAppMessageWithMedia()); return; }
  if (isChatMuted()) { showCommunityMutedBanner(muteTimeLeft()); return; }
  if (content && !communitySafetyCheck(content)) return;
  // ───────────────────────────────────────────────────────────────────

  if (!content && !selectedWhatsAppMedia) {
    input?.focus();
    return;
  }

  // Optimistic bubble
  const tempId = 'temp-' + Date.now();
  // Capture reply reference BEFORE tempMsg construction (for optimistic reply display)
  const replyToIdForTemp = _replyToMsgId;
  let replyToDataForTemp = null;
  if (replyToIdForTemp) {
    const rqEl = document.getElementById('wa-msg-' + replyToIdForTemp);
    if (rqEl) {
      // Clone bubble and remove nested reply-quote to get only the direct message text
      const rqBubble = rqEl.querySelector('.message-bubble');
      let rqText = '';
      if (rqBubble) {
        const clone = rqBubble.cloneNode(true);
        clone.querySelector('.msg-reply-quote')?.remove(); // strip nested quote
        clone.querySelector('.message-meta')?.remove();
        clone.querySelector('.msg-options-bar')?.remove();
        rqText = clone.querySelector('.message-text')?.textContent?.trim() || '';
      }
      const rqIsOwn = rqEl.classList.contains('own');
      const rqSender = rqIsOwn
        ? (currentUser?.username || 'You')
        : (rqEl.querySelector('.message-sender-name')?.textContent?.trim() || 'User');
      const rqMedia = rqEl.querySelector('.msg-media') ? { type: 'image' } : (rqEl.querySelector('video.msg-media') ? { type: 'video' } : null);
      replyToDataForTemp = {
        id: replyToIdForTemp,
        content: rqText,
        sender_username: rqSender,
        media_type: rqMedia ? rqMedia.type : null
      };
    }
  }

  const _gn = getGhostName();
  const tempMsg = {
    id: tempId,
    content: content || '',
    text: content || '',
    sender_id: currentUser.id,
    anon_name: _gn,
    users: { id: currentUser.id, username: _gn, profile_pic: null },
    timestamp: new Date(),
    isTemp: true,
    reply_to: replyToDataForTemp,
    media_url: selectedWhatsAppMedia ? URL.createObjectURL(selectedWhatsAppMedia) : null,
    media_name: selectedWhatsAppMedia ? selectedWhatsAppMedia.name : null,
    media_type: selectedWhatsAppMedia ? (
      selectedWhatsAppMedia.type.startsWith('video/') ? 'video' :
        selectedWhatsAppMedia.type.startsWith('audio/') ? 'audio' :
          selectedWhatsAppMedia.type === 'application/pdf' ? 'pdf' :
            selectedWhatsAppMedia.type.startsWith('application/') || selectedWhatsAppMedia.type.startsWith('text/') ? 'document' :
              'image'
    ) : null
  };

  // ✅ FIX: Capture media reference BEFORE clearChatFilePreview() nullifies selectedWhatsAppMedia
  const mediaToUpload = selectedWhatsAppMedia;

  appendWhatsAppMessageFixed(tempMsg);
  input.value = '';
  input.style.height = 'auto';
  clearChatFilePreview(); // safe now — we already captured the reference above
  cancelReply(); // clear reply preview

  if (socket && currentUser.college) {
    socket.emit('stop_typing', { collegeName: currentUser.college, username: currentUser.username });
  }

  try {
    let response;
    if (mediaToUpload) {
      const fd = new FormData();
      fd.append('content', content || '');
      fd.append('media', mediaToUpload);
      fd.append('anon_name', getGhostName()); // ghost name required
      if (replyToIdForTemp) fd.append('reply_to_id', replyToIdForTemp);
      response = await apiCall('/api/community/messages', 'POST', fd);
    } else {
      const payload = { content, anon_name: getGhostName() };
      if (replyToIdForTemp) payload.reply_to_id = replyToIdForTemp;
      response = await apiCall('/api/community/messages', 'POST', payload);
    }

    if (response.success && response.message) {
      playMessageSound('send');
      const tempEl = document.getElementById(`wa-msg-${tempId}`);
      if (tempEl) tempEl.remove();
      appendWhatsAppMessageFixed(response.message);
    }
  } catch (error) {
    console.error('Send error:', error);
    showMessage('❌ Failed to send message', 'error');
    const tempEl = document.getElementById(`wa-msg-${tempId}`);
    if (tempEl) tempEl.remove();
  }
}

// ==========================================
// MESSAGE OPTIONS: REACT, EDIT, DELETE, SEEN
// ==========================================

const REACT_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

function showEmojiReactPicker(msgId, btn) {
  // Remove any existing picker
  document.querySelectorAll('.emoji-react-picker').forEach(p => p.remove());

  const picker = document.createElement('div');
  picker.className = 'emoji-react-picker';
  picker.innerHTML = REACT_EMOJIS.map(e =>
    `<button class="react-emoji-btn" onclick="addMsgReaction('${msgId}','${e}',this)">${e}</button>`
  ).join('');

  // Position near button
  const rect = btn.getBoundingClientRect();
  picker.style.position = 'fixed';
  picker.style.top = (rect.top - 55) + 'px';
  picker.style.left = rect.left + 'px';
  document.body.appendChild(picker);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closePicker(ev) {
      if (!picker.contains(ev.target)) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 10);
}

function addMsgReaction(msgId, emoji, btn) {
  const bar = document.getElementById('reacts-' + msgId);
  if (!bar) { btn.closest('.emoji-react-picker')?.remove(); return; }

  // Check if this emoji already exists
  let existing = bar.querySelector(`[data-emoji="${emoji}"]`);
  if (existing) {
    const countEl = existing.querySelector('.react-count');
    countEl.textContent = parseInt(countEl.textContent || 0) + 1;
  } else {
    const pill = document.createElement('button');
    pill.className = 'react-pill';
    pill.dataset.emoji = emoji;
    pill.innerHTML = `${emoji} <span class="react-count">1</span>`;
    pill.onclick = () => {
      const c = pill.querySelector('.react-count');
      const n = parseInt(c.textContent) - 1;
      if (n <= 0) pill.remove(); else c.textContent = n;
    };
    bar.appendChild(pill);
  }

  btn.closest('.emoji-react-picker')?.remove();
}

function editChatMsg(msgId) {
  const bubble = document.getElementById('bubble-' + msgId);
  const textEl = bubble?.querySelector('.message-text');
  if (!textEl) return;

  const current = textEl.textContent;
  const newText = prompt('Edit message:', current);
  if (newText === null || newText.trim() === current) return;

  textEl.textContent = newText.trim();

  // Add "edited" label
  let editedTag = bubble.querySelector('.edited-tag');
  if (!editedTag) {
    editedTag = document.createElement('span');
    editedTag.className = 'edited-tag';
    editedTag.textContent = 'edited';
    const meta = bubble.querySelector('.message-meta');
    if (meta) meta.prepend(editedTag);
  }

  // Fire API silently (best effort)
  apiCall(`/api/community/messages/${msgId}`, 'PATCH', { content: newText.trim() })
    .catch(() => {/* server may not support yet */ });
}

async function deleteChatMsg(msgId) {
  if (!confirm('Delete this message?')) return;

  const el = document.getElementById('wa-msg-' + msgId);
  if (el) { el.style.opacity = '0.4'; el.style.pointerEvents = 'none'; }

  try {
    await apiCall(`/api/community/messages/${msgId}`, 'DELETE');
    if (el) { el.style.animation = 'fadeOut 0.3s ease'; setTimeout(() => el.remove(), 300); }
    showMessage('🗑️ Deleted', 'success');
  } catch (e) {
    if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
    showMessage('❌ Could not delete', 'error');
  }
}

// ── Helper: load lifetime seen users from localStorage + memory ──
function _getLifetimeSeenUsers() {
  const storeKey = '_vibeSeen_' + (currentUser && currentUser.college ? currentUser.college : 'global');
  let lifeStore = {};
  try { lifeStore = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (e) { lifeStore = {}; }
  // Merge with in-memory (in case page just loaded and received new seens not yet in LS)
  if (window._seenLifetime) {
    Object.values(window._seenLifetime).forEach(u => {
      if (!lifeStore[u.username]) lifeStore[u.username] = u;
    });
  }
  return Object.values(lifeStore);
}

// ── Helper: refresh seen-by avatar chips under ALL own messages ──
function _refreshAllSeenByRows() {
  const allSeenUsers = _getLifetimeSeenUsers();
  // Show chips only under the last own message
  const allOwn = document.querySelectorAll('.whatsapp-message.own');
  allOwn.forEach((el, i) => {
    const id = el.id.replace('wa-msg-', '');
    const row = document.getElementById('seenby-' + id);
    if (!row) return;
    if (i === allOwn.length - 1 && allSeenUsers.length > 0) {
      row.innerHTML = allSeenUsers.slice(0, 5).map(u =>
        `<span class="seen-avatar-chip" title="${escapeHtml(u.username)}" onclick="showSeenBy('all')">${u.avatar || '👤'}</span>`
      ).join('') + (allSeenUsers.length > 5 ? `<span class="seen-avatar-chip seen-more-chip" onclick="showSeenBy('all')">+${allSeenUsers.length - 5}</span>` : '');
    } else {
      row.innerHTML = '';
    }
  });
}

// ── On init: load lifetime seen from localStorage into memory ──
function _initSeenLifetime() {
  const storeKey = '_vibeSeen_' + (currentUser && currentUser.college ? currentUser.college : 'global');
  try {
    const lifeStore = JSON.parse(localStorage.getItem(storeKey) || '{}');
    window._seenLifetime = {};
    Object.values(lifeStore).forEach(u => { window._seenLifetime[u.username] = u; });
  } catch (e) { window._seenLifetime = {}; }
}

function showSeenBy(msgId) {
  // Remove any existing popup + overlay
  document.querySelectorAll('.seen-by-popup, .sbp-overlay').forEach(p => p.remove());

  // ── Get lifetime users (never decreases) ──
  const seenUsers = _getLifetimeSeenUsers();

  // ── Build overlay ──
  const overlay = document.createElement('div');
  overlay.className = 'sbp-overlay';
  document.body.appendChild(overlay);

  // ── Build popup ──
  const popup = document.createElement('div');
  popup.className = 'seen-by-popup';

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    if (diffMs < 60000) return 'Just now';
    if (diffMs < 3600000) return Math.floor(diffMs / 60000) + 'm ago';
    if (diffMs < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  popup.innerHTML = `
    <div class="sbp-drag-handle"></div>
    <div class="sbp-header">
      <div class="sbp-title">
        <div class="sbp-title-icon">👁️</div>
        <span class="sbp-title-text">👁️</span>
        ${seenUsers.length > 0 ? `<span class="sbp-title-count">${seenUsers.length}</span>` : ''}
      </div>
      <button class="sbp-close-btn" title="Close">✕</button>
    </div>
    ${seenUsers.length === 0
      ? `<div class="sbp-empty">
           <div class="sbp-empty-icon">👁️</div>
           <div class="sbp-empty-text">No one has seen this message yet</div>
         </div>`
      : `<div class="sbp-list">
           ${seenUsers.map((u, i) => `
             <div class="sbp-user" style="animation-delay:${i * 40}ms">
               <div class="sbp-avatar">${u.avatar || '👤'}</div>
               <div class="sbp-user-info">
                 <span class="sbp-name">${typeof escapeHtml === 'function' ? escapeHtml(u.username) : u.username}</span>
                 ${u.seenAt ? `<span class="sbp-seen-time">Seen ${formatTime(u.seenAt)}</span>` : ''}
               </div>
               <span class="sbp-tick">✓✓</span>
             </div>`).join('')}
         </div>`
    }
  `;

  document.body.appendChild(popup);

  const close = () => {
    popup.style.transition = 'transform 0.28s cubic-bezier(0.32,0.72,0,1)';
    popup.style.transform = 'translateX(-50%) translateY(100%)';
    overlay.classList.remove('sbp-overlay-visible');
    setTimeout(() => { popup.remove(); overlay.remove(); }, 300);
  };

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('sbp-overlay-visible');
    popup.classList.add('sbp-visible');
  });

  // Close on button
  popup.querySelector('.sbp-close-btn')?.addEventListener('click', (e) => { e.stopPropagation(); close(); });

  // Close on overlay click
  overlay.addEventListener('click', close);

  // Swipe-down to dismiss (touch)
  let touchStartY = 0;
  popup.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
  popup.addEventListener('touchend', (e) => {
    if (e.changedTouches[0].clientY - touchStartY > 60) close();
  }, { passive: true });
}

async function sendCommunityMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();

  if (!content && !selectedChatMedia) return;

  // Optimistic UI
  appendCommunityMessage({
    sender_id: currentUser.id,
    content: content,
    created_at: new Date().toISOString(),
    media_url: selectedChatMedia ? URL.createObjectURL(selectedChatMedia) : null,
    media_type: selectedChatMedia ? (
      selectedChatMedia.type.startsWith('video/') ? 'video' :
        selectedChatMedia.type.startsWith('audio/') ? 'audio' :
          selectedChatMedia.type === 'application/pdf' ? 'pdf' :
            (selectedChatMedia.type.startsWith('application/') || selectedChatMedia.type.startsWith('text/')) ? 'document' : 'image'
    ) : null,
    users: { username: currentUser.username }
  });

  const mediaToSend = selectedChatMedia;
  input.value = '';
  clearChatPreview();

  try {
    const formData = new FormData();
    formData.append('content', content);
    if (mediaToSend) {
      formData.append('media', mediaToSend);
    }

    await apiCall('/api/community/messages', 'POST', formData);
    // Success - Socket will handle real message, we rely on optimistic for immediate feedback
  } catch (error) {
    console.error('Send failed:', error);
    showMessage('Failed to send message', 'error');
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendCommunityMessage();
  }
}


function toggleChatInfo() {
  const panel = document.getElementById('chatInfoPanel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function leaveGroup() {
  if (confirm('Are you sure you want to leave the community?')) {
    showMessage('Feature coming soon!', 'success');
  }
}

function toggleNotifications() {
  const status = document.getElementById('notifStatus');
  if (status) status.textContent = status.textContent === 'On' ? 'Off' : 'On';
}

function muteChat() {
  showMessage('🔇 Chat muted!', 'success');
}

function openImageViewer(src) {
  window.open(src, '_blank');
}

function searchInChat() {
  const box = document.getElementById('chatSearchBox');
  if (box) box.focus();
}

// showPage hook — only adds communities chat init, avoids duplicating logic already in showPage()
(function () {
  const _prev = window.showPage;
  window.showPage = function (pageId, ...args) {
    if (typeof _prev === 'function') _prev(pageId, ...args);
    // Init community chat ONLY after user has joined a college
    if (pageId === 'communities' && currentUser && currentUser.college && currentUser.communityJoined) {
      setTimeout(() => initCommunityChat(), 80);
    }
  };
})();


// ============================================================
//  VIBE FEED — Full-Screen Posts · Real-Time Data
//  Connects to existing API: /api/posts, /api/posts/community
//  Uses existing: toggleLike(), openCommentModal(), deletePost()
// ============================================================

let vibeActiveTab = 'community';   // 'all' | 'community'
let vibeActiveSharePostId = null;  // post id for share drawer
let vibeActiveCommentPostId = null;// post id for comments drawer
let vibeDestination = 'profile';   // upload destination
let vibeSelectedFiles = [];        // files chosen in upload modal
let vibeProgressTimers = {};       // per-card auto-advance timers
let vibeCurrentCard = 0;          // index of visible card

// ─── Gradient palettes for text-only posts ───────────────────
const VIBE_GRADIENTS = [
  'linear-gradient(145deg,#0a0a14 0%,#1a0a2e 50%,#2d0a4e 100%)',
  'linear-gradient(145deg,#0d0221 0%,#1a0545 50%,#3a0ca3 100%)',
  'linear-gradient(145deg,#03045e 0%,#0077b6 70%,#00b4d8 100%)',
  'linear-gradient(145deg,#0a0a14 0%,#1b1b2e 40%,#ff6b35 100%)',
  'linear-gradient(145deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
  'linear-gradient(145deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
];
function vibeGradient(id) {
  const str = (id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return VIBE_GRADIENTS[str % VIBE_GRADIENTS.length];
}

// ─── Utility ─────────────────────────────────────────────────
function vibeFmt(n) {
  n = parseInt(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}
function vibeTimeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ─── Init: called from showPage('posts') ─────────────────────
async function initVibeFeed() {
  const feed = document.getElementById('vibeFeed');
  if (!feed) return;

  feed.innerHTML = `<div class="vibe-loading" id="vibeLoading">
    <div class="vibe-spinner-ring"></div><p>Loading vibes…</p>
  </div>`;

  // Stop old timers
  Object.values(vibeProgressTimers).forEach(t => clearInterval(t));
  vibeProgressTimers = {};

  try {
    const endpoint = vibeActiveTab === 'community'
      ? '/api/posts/community'
      : '/api/posts';

    const data = await apiCall(endpoint, 'GET');

    const allPosts = data.posts || [];
    // ── Issue 3 fix: Vibers feed should NOT show user's own posts ──
    const posts = allPosts.filter(p => {
      const postOwnerId = p.users?.id || p.user_id;
      return !currentUser || postOwnerId !== currentUser.id;
    });

    if (!posts.length) {
      feed.innerHTML = `<div class="vibe-empty">
        <div class="vibe-empty-icon">🎬</div>
        <h3>No vibes yet</h3>
        <p>Be the first to share something!</p>
        <button onclick="openVibeUpload()">+ Create Vibe</button>
      </div>`;
      return;
    }

    renderVibeFeed(posts);
    setupVibeObserver();
  } catch (err) {
    console.error('❌ Vibe feed:', err);
    feed.innerHTML = `<div class="vibe-empty">
      <div class="vibe-empty-icon">⚠️</div>
      <h3>Failed to load</h3>
      <p>${err.message || 'Check your connection'}</p>
      <button onclick="initVibeFeed()">Retry</button>
    </div>`;
  }
}

// ─── Render all cards ─────────────────────────────────────────
function renderVibeFeed(posts) {
  const feed = document.getElementById('vibeFeed');
  if (!feed) return;
  // Seed follow state from post data so cards render with correct follow status
  posts.forEach(p => {
    const uid = p.users?.id || p.user_id;
    if (uid && uid !== currentUser?.id) {
      if (!_followState[uid]) {
        _followState[uid] = { isFollowing: !!p.is_following_author, followersCount: 0 };
      }
    }
  });
  feed.innerHTML = posts.map((p, i) => buildVibeCard(p, i)).join('');

  // Attach tap / double-tap listeners
  feed.querySelectorAll('.vibe-card').forEach((card, i) => {
    let lastTap = 0;
    card.addEventListener('click', e => {
      if (e.target.closest('.vibe-card-actions') ||
        e.target.closest('.vibe-card-info') ||
        e.target.closest('.vibe-card-delete-btn')) return;
      const now = Date.now();
      if (now - lastTap < 320) {
        vibeDoubleTapLike(card, i);
      }
      lastTap = now;
      // tap to play/pause video
      const vid = card.querySelector('.vibe-card-bg-video');
      if (vid) vibeToggleVideo(card, i, vid);
    });
  });
}

// ─── Build a single card ─────────────────────────────────────
function buildVibeCard(post, idx) {
  const user = post.users || {};
  const username = user.username || 'Unknown';
  const userId = user.id || '';
  const college = user.college || '';
  const avatar = user.profile_pic;
  const caption = post.content || '';
  const media = Array.isArray(post.media) ? post.media : [];
  const isLiked = !!post.is_liked;
  const likes = vibeFmt(post.like_count || 0);
  const comments = vibeFmt(post.comment_count || 0);
  const shares = vibeFmt(post.share_count || 0);
  const music = post.music;
  const stickers = post.stickers || [];
  const isOwn = currentUser && userId === currentUser.id;
  const dest = post.posted_to === 'community' ? '🎓 College' : '👤 Profile';
  const postTime = vibeTimeAgo(post.created_at || post.timestamp);

  // ── Background layer ──
  const firstMedia = media[0];
  let bgLayer = '';
  if (firstMedia?.type === 'video') {
    const proxiedUrl = proxyMediaUrl(firstMedia.url);
    bgLayer = `<video class="vibe-card-bg-video" src="${proxiedUrl}"
      playsinline muted loop preload="metadata"></video>`;
  } else if (firstMedia?.type === 'image' || (firstMedia?.url && !firstMedia?.type)) {
    const proxiedUrl = proxyMediaUrl(firstMedia.url || firstMedia);
    bgLayer = `<img class="vibe-card-bg-blur" src="${proxiedUrl}" alt="" aria-hidden="true">
      <img class="vibe-card-bg-img" src="${proxiedUrl}" alt="">`;
  } else if (media.length === 0 || firstMedia?.type === 'audio') {
    bgLayer = `<div class="vibe-card-bg-text" style="background:${vibeGradient(post.id)};"></div>
      <div class="vibe-text-content">
        <p class="vibe-text-body">${caption.split('#')[0].trim() || '✨'}</p>
      </div>`;
  }

  // ── Extra images in grid? show first only for cards ──
  const moreMedia = media.length > 1
    ? `<div style="position:absolute;top:56px;right:10px;z-index:12;
         background:rgba(0,0,0,0.5);border-radius:12px;padding:3px 8px;
         font-size:11px;color:#fff;font-weight:700;backdrop-filter:blur(6px);">
         +${media.length - 1} more</div>` : '';

  // ── Avatar HTML ──
  const proxiedAvatar = proxyMediaUrl(avatar);
  const avHtml = proxiedAvatar
    ? `<div class="vibe-card-avatar" onclick="showMiniProfileCard('${userId}',event)">
         <img src="${proxiedAvatar}" alt="${username}" loading="lazy">
       </div>`
    : `<div class="vibe-card-avatar" onclick="showMiniProfileCard('${userId}',event)">
         ${username.charAt(0).toUpperCase() || '😊'}
       </div>`;

  // ── Caption with hashtags ──
  const captionText = caption.replace(/#(\w+)/g,
    '<span class="vibe-card-tag">#$1</span>');
  const shortCap = caption.length > 100;

  // ── Stickers ──
  const stickersHtml = stickers.length
    ? `<div class="vibe-stickers-overlay">${stickers.map(s =>
      `<span class="vibe-sticker">${s.emoji || s}</span>`).join('')}</div>`
    : '';

  // ── Music ──
  const musicHtml = music
    ? `<div class="vibe-music-row">
         <span class="vibe-music-note">🎵</span>
         <span class="vibe-music-name">${music.name} · ${music.artist}</span>
       </div>` : '';

  // ── Delete btn (own posts) ──
  const deleteBtn = isOwn
    ? `<button class="vibe-card-delete-btn" onclick="vibeDeletePost('${post.id}')" title="Delete">🗑️</button>`
    : '';

  return `
  <div class="vibe-card" data-id="${post.id}" data-idx="${idx}">
    ${bgLayer}
    <div class="vibe-card-overlay"></div>
    ${moreMedia}
    ${stickersHtml}
    ${deleteBtn}

    <!-- Tap-to-play hint -->
    <div class="vibe-play-hint" id="vph_${idx}">
      <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </div>

    <!-- Bottom-left: user & caption -->
    <div class="vibe-card-info">
      <div class="vibe-card-user">
        ${avHtml}
        <div class="vibe-card-usernames">
          <div class="vibe-card-username" onclick="showMiniProfileCard('${userId}',event)">
            @${username}
          </div>
        </div>
        ${!isOwn ? `<button class="vibe-follow-btn" id="vfb_${idx}" data-uid="${userId}"
          onclick="vibeToggleFollow('${userId}', '${username}')">${(_followState[userId]?.isFollowing || post.is_following_author) ? '✓ Following' : '+ Follow'}</button>` : ''}
      </div>

      ${caption ? `
      <div class="vibe-card-caption ${shortCap ? '' : 'expanded'}"
           id="vcap_${idx}">${captionText}</div>
      ${shortCap ? `<button class="vibe-caption-more"
          onclick="toggleVibeCaption(${idx})">more</button>` : ''}
      ` : ''}

      ${musicHtml}

      <div class="vibe-card-time">
        ${postTime}
      </div>
    </div>

    <!-- Right action rail -->
    <div class="vibe-card-actions">
      <!-- Like -->
      <div class="vibe-action ${isLiked ? 'vibe-liked' : ''}"
           id="vact_like_${idx}"
           onclick="vibeToggleLike('${post.id}', ${idx})">
        <div class="vibe-action-bubble">
          <svg viewBox="0 0 24 24" ${isLiked ? 'style="fill:#ff3040;stroke:#ff3040"' : ''}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <span class="vibe-action-label" id="vlike_count_${idx}">${likes}</span>
      </div>

      <!-- Comment -->
      <div class="vibe-action" onclick="vibeOpenComments('${post.id}', ${idx})">
        <div class="vibe-action-bubble">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <span class="vibe-action-label" id="vcomment_count_${idx}">${comments}</span>
      </div>

      <!-- Save -->
      <div class="vibe-action" id="vact_save_${idx}"
           onclick="vibeToggleSave('${post.id}', ${idx})">
        <div class="vibe-action-bubble">
          <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        <span class="vibe-action-label">Save</span>
      </div>

      <!-- Share -->
      <div class="vibe-action" onclick="vibeOpenShare('${post.id}', '${caption.replace(/'/g, '')}')">
        <div class="vibe-action-bubble">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
        <span class="vibe-action-label" id="vshare_count_${idx}">${shares}</span>
      </div>

      <!-- Creator disc -->
      <div class="vibe-disc-wrap" onclick="showUserProfile('${userId}')">
        <div class="vibe-disc">
          ${avatar ? `<img src="${avatar}" alt="">` : (username.charAt(0).toUpperCase() || '🎵')}
        </div>
        <div class="vibe-disc-center"></div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="vibe-card-progress">
      <div class="vibe-card-progress-fill" id="vprog_${idx}"></div>
    </div>
  </div>`;
}

// ─── Intersection Observer: auto-play / progress ──────────────
function setupVibeObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const idx = parseInt(entry.target.dataset.idx);
      const vid = entry.target.querySelector('.vibe-card-bg-video');
      if (entry.isIntersecting) {
        vibeCurrentCard = idx;
        if (vid) vid.play().catch(() => { });
        startVibeProgress(idx, vid);
      } else {
        if (vid) { vid.pause(); vid.currentTime = 0; }
        stopVibeProgress(idx);
      }
    });
  }, { threshold: 0.65 });

  document.querySelectorAll('.vibe-card').forEach(c => obs.observe(c));
}

// ─── Progress bar ─────────────────────────────────────────────
function startVibeProgress(idx, vid) {
  stopVibeProgress(idx);
  const bar = document.getElementById('vprog_' + idx);
  if (!bar) return;

  if (vid) {
    // Sync to actual video duration
    const tick = () => {
      if (!vid.duration) return;
      bar.style.width = (vid.currentTime / vid.duration * 100) + '%';
    };
    vibeProgressTimers[idx] = setInterval(tick, 150);
    vid.addEventListener('ended', () => {
      stopVibeProgress(idx);
      scrollToVibeCard(idx + 1);
    }, { once: true });
  } else {
    // Text/image: auto-advance after 6 seconds
    let pct = 0;
    vibeProgressTimers[idx] = setInterval(() => {
      pct += 100 / 60; // 6s at 100ms ticks
      if (pct >= 100) {
        pct = 100;
        bar.style.width = pct + '%';
        stopVibeProgress(idx);
        scrollToVibeCard(idx + 1);
        return;
      }
      bar.style.width = pct + '%';
    }, 100);
  }
}

function stopVibeProgress(idx) {
  clearInterval(vibeProgressTimers[idx]);
  const bar = document.getElementById('vprog_' + idx);
  if (bar) bar.style.width = '0%';
}

function scrollToVibeCard(idx) {
  const cards = document.querySelectorAll('.vibe-card');
  if (idx < cards.length) {
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── Video tap toggle ─────────────────────────────────────────
function vibeToggleVideo(card, idx, vid) {
  const hint = document.getElementById('vph_' + idx);
  if (vid.paused) { vid.play(); } else { vid.pause(); }
  if (hint) {
    hint.querySelector('svg polygon, svg path').setAttribute('points',
      vid.paused ? '5 3 19 12 5 21 5 3' : '');
    hint.classList.remove('hide');
    hint.classList.add('show');
    setTimeout(() => { hint.classList.remove('show'); hint.classList.add('hide'); }, 700);
  }
}

// ─── Double-tap like ──────────────────────────────────────────
function vibeDoubleTapLike(card, idx) {
  const burst = document.createElement('div');
  burst.className = 'vibe-heart-burst';
  burst.textContent = '❤️';
  card.appendChild(burst);
  setTimeout(() => burst.remove(), 750);

  const likeEl = document.getElementById('vact_like_' + idx);
  if (likeEl && !likeEl.classList.contains('vibe-liked')) {
    const postId = card.dataset.id;
    vibeToggleLike(postId, idx);
  }
}

// ─── Like ─────────────────────────────────────────────────────
async function vibeToggleLike(postId, idx) {
  if (!currentUser) return showMessage('⚠️ Login to like', 'error');
  try {
    const data = await apiCall(`/api/posts/${postId}/like`, 'POST');
    if (!data.success) return;
    const el = document.getElementById('vact_like_' + idx);
    const cnt = document.getElementById('vlike_count_' + idx);
    const ico = el?.querySelector('path');
    if (el) el.classList.toggle('vibe-liked', data.liked);
    if (ico) { ico.style.fill = data.liked ? '#ff3040' : 'none'; ico.style.stroke = data.liked ? '#ff3040' : '#fff'; }
    if (cnt) cnt.textContent = vibeFmt(data.likeCount);
    if (data.liked) checkAndUpdateRewards?.('like');
  } catch (e) { console.error('Like err', e); }
}

// ─── Save (client-side only — extend with API when ready) ─────
function vibeToggleSave(postId, idx) {
  const el = document.getElementById('vact_save_' + idx);
  if (!el) return;
  const isSaved = el.classList.toggle('vibe-saved');
  const ico = el.querySelector('path');
  if (ico) { ico.style.fill = isSaved ? '#ffc800' : 'none'; ico.style.stroke = isSaved ? '#ffc800' : '#fff'; }
  showMessage(isSaved ? '🔖 Saved!' : 'Unsaved', 'success');
}

// ─── Follow toggle (calls real API) ──────────────────────────
async function vibeToggleFollow(targetUserId, targetUsername) {
  if (!currentUser) return showMessage('⚠️ Login first', 'error');
  // Read current state from central store
  const cached = _followState[targetUserId] || {};
  await centralToggleFollow(targetUserId, targetUsername, { isFollowing: cached.isFollowing || false });
}

// ─── Caption expand ───────────────────────────────────────────
function toggleVibeCaption(idx) {
  const el = document.getElementById('vcap_' + idx);
  if (!el) return;
  el.classList.toggle('expanded');
  const btn = el.nextElementSibling;
  if (btn) btn.textContent = el.classList.contains('expanded') ? 'less' : 'more';
}

// ─── Delete own post ──────────────────────────────────────────
async function vibeDeletePost(postId) {
  if (!confirm('Delete this vibe?')) return;
  try {
    await apiCall(`/api/posts/${postId}`, 'DELETE');
    showMessage('🗑️ Deleted', 'success');
    if (currentUser) {
      currentUser.postCount = Math.max(0, (currentUser.postCount || 0) - 1);
      saveUserToLocal?.();
    }
    // Also remove from My Vibes data so profile tab stays in sync
    _mvAllPosts = _mvAllPosts.filter(p => p.id !== postId && p.id != postId);
    _updateMvStats(_mvAllPosts);
    const mvPane = document.getElementById('profileTabVibes');
    if (mvPane && mvPane.classList.contains('active')) {
      _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
    }
    setTimeout(() => initVibeFeed(), 400);
  } catch (e) { showMessage('❌ ' + e.message, 'error'); }
}

// ─── Comments Drawer ──────────────────────────────────────────
async function vibeOpenComments(postId, idx) {
  vibeActiveCommentPostId = postId;
  const cnt = document.getElementById('vcomment_count_' + idx);
  const title = document.getElementById('vibeCommentTitle');
  if (title) title.textContent = `Comments (${cnt?.textContent || 0})`;

  // Set my avatar
  const myAv = document.getElementById('vibeCommentMyAvatar');
  if (myAv && currentUser?.profilePic) {
    myAv.innerHTML = `<img src="${currentUser.profilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }

  openVibeDrawer('vibeCommentsDrawer');

  const list = document.getElementById('vibeCommentsList');
  list.innerHTML = '<div class="vibe-drawer-loading">Loading comments…</div>';

  try {
    const data = await apiCall(`/api/posts/${postId}/comments`, 'GET');
    const comments = data.comments || [];
    if (!comments.length) {
      list.innerHTML = '<div class="vibe-drawer-loading">No comments yet. Be first! 💬</div>';
      return;
    }
    list.innerHTML = comments.map(c => {
      const u = c.users || {};
      const av = u.profile_pic
        ? `<div class="vibe-comment-av"><img src="${u.profile_pic}" alt=""></div>`
        : `<div class="vibe-comment-av">${(u.username || '?').charAt(0).toUpperCase()}</div>`;
      return `
      <div class="vibe-comment-item">
        ${av}
        <div class="vibe-comment-body">
          <div class="vibe-comment-username">@${u.username || 'User'}</div>
          <div class="vibe-comment-text">${c.content || ''}</div>
          <div class="vibe-comment-meta">
            <span class="vibe-comment-time">${vibeTimeAgo(c.created_at)}</span>
            <button class="vibe-comment-like">❤️ Like</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    list.innerHTML = '<div class="vibe-drawer-loading">Failed to load comments</div>';
  }
}

async function submitVibeComment() {
  const input = document.getElementById('vibeCommentInput');
  const content = input?.value.trim();
  if (!content || !vibeActiveCommentPostId) return;
  if (!currentUser) return showMessage('⚠️ Login first', 'error');

  input.value = '';
  try {
    const data = await apiCall(`/api/posts/${vibeActiveCommentPostId}/comments`, 'POST', { content });
    if (!data.success) return;

    const u = currentUser;
    const av = u.profilePic
      ? `<div class="vibe-comment-av"><img src="${u.profilePic}" alt=""></div>`
      : `<div class="vibe-comment-av">${(u.username || '?').charAt(0).toUpperCase()}</div>`;

    const newItem = document.createElement('div');
    newItem.className = 'vibe-comment-item';
    newItem.innerHTML = `
      ${av}
      <div class="vibe-comment-body">
        <div class="vibe-comment-username">@${u.username}</div>
        <div class="vibe-comment-text">${content}</div>
        <div class="vibe-comment-meta">
          <span class="vibe-comment-time">just now</span>
          <button class="vibe-comment-like">❤️ Like</button>
        </div>
      </div>`;

    const list = document.getElementById('vibeCommentsList');
    if (list) {
      if (list.querySelector('.vibe-drawer-loading')) list.innerHTML = '';
      list.prepend(newItem);
    }
    checkAndUpdateRewards?.('comment');
  } catch (e) { showMessage('❌ ' + e.message, 'error'); }
}

// ─── Share Drawer ─────────────────────────────────────────────
function vibeOpenShare(postId, caption) {
  vibeActiveSharePostId = postId;
  openVibeDrawer('vibeShareDrawer');
}

function vibeShareWhatsApp() {
  const url = encodeURIComponent(window.location.href + '?post=' + vibeActiveSharePostId);
  window.open('https://wa.me/?text=Check+this+vibe+on+VibeXpert+%F0%9F%94%A5+' + url, '_blank');
  closeVibeDrawer('vibeShareDrawer');
}

function vibeShareCopy() {
  navigator.clipboard?.writeText(window.location.href + '?post=' + vibeActiveSharePostId)
    .then(() => showMessage('🔗 Link copied!', 'success'));
  closeVibeDrawer('vibeShareDrawer');
}

function vibeShareToChat() {
  showMessage('📤 Shared to College Chat!', 'success');
  closeVibeDrawer('vibeShareDrawer');
  // API call to post to community_messages
  if (vibeActiveSharePostId) {
    apiCall('/api/posts/' + vibeActiveSharePostId + '/share', 'POST').catch(() => { });
  }
}

function vibeShareNative() {
  if (navigator.share) {
    navigator.share({
      title: 'Check this on VibeXpert!',
      url: window.location.href + '?post=' + vibeActiveSharePostId
    }).catch(() => { });
  } else {
    vibeShareCopy();
  }
  closeVibeDrawer('vibeShareDrawer');
}

// ─── Drawer helpers ───────────────────────────────────────────
function openVibeDrawer(drawerId) {
  document.getElementById(drawerId)?.classList.add('open');
  const bd = document.getElementById('vibeBackdrop');
  if (bd) bd.classList.add('active');
}
function closeVibeDrawer(drawerId) {
  document.getElementById(drawerId)?.classList.remove('open');
  // Close backdrop only if no other drawer is open
  const anyOpen = document.querySelector('.vibe-drawer.open');
  if (!anyOpen) {
    document.getElementById('vibeBackdrop')?.classList.remove('active');
  }
}
function closeAllVibeDrawers() {
  document.querySelectorAll('.vibe-drawer.open').forEach(d => d.classList.remove('open'));
  document.getElementById('vibeBackdrop')?.classList.remove('active');
}

// ─── Search / filter ─────────────────────────────────────────
function toggleVibeSearch() {
  const bar = document.getElementById('vibeSearchBar');
  if (!bar) return;
  const showing = bar.style.display !== 'none' && bar.style.display !== '';
  bar.style.display = showing ? 'none' : 'block';
  if (!showing) document.getElementById('vibeSearchInput')?.focus();
}

// ─── Scroll arrow helpers ─────────────────────────────────────
function vibeScrollNext() {
  const feed = document.getElementById('vibeFeed');
  if (!feed) return;
  const cards = feed.querySelectorAll('.vibe-card');
  const feedRect = feed.getBoundingClientRect();
  // Find first card whose bottom is below feed center → that's the current card
  let targetCard = null;
  for (const card of cards) {
    const r = card.getBoundingClientRect();
    if (r.bottom > feedRect.top + feedRect.height * 0.5) {
      // next card is the one after
      const allCards = Array.from(cards);
      const idx = allCards.indexOf(card);
      targetCard = allCards[idx + 1] || card;
      break;
    }
  }
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    feed.scrollBy({ top: feed.clientHeight, behavior: 'smooth' });
  }
}

function vibeScrollPrev() {
  const feed = document.getElementById('vibeFeed');
  if (!feed) return;
  const cards = feed.querySelectorAll('.vibe-card');
  const feedRect = feed.getBoundingClientRect();
  let targetCard = null;
  for (const card of cards) {
    const r = card.getBoundingClientRect();
    if (r.bottom > feedRect.top + feedRect.height * 0.5) {
      const allCards = Array.from(cards);
      const idx = allCards.indexOf(card);
      targetCard = allCards[Math.max(0, idx - 1)];
      break;
    }
  }
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    feed.scrollBy({ top: -feed.clientHeight, behavior: 'smooth' });
  }
}

function filterVibeFeed(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.vibe-card').forEach(card => {
    const caption = card.querySelector('.vibe-card-caption')?.textContent || '';
    const user = card.querySelector('.vibe-card-username')?.textContent || '';
    const college = card.querySelector('.vibe-card-college')?.textContent || '';
    card.style.display = (!q || [caption, user, college].some(t => t.toLowerCase().includes(q)))
      ? '' : 'none';
  });
}

// ─── Tab switching ────────────────────────────────────────────
function switchVibeTab(tab, btn) {
  vibeActiveTab = tab;
  // Remove active from both old .vibe-tab and new .vibe-side-tab elements
  document.querySelectorAll('.vibe-tab, .vibe-side-tab').forEach(t => t.classList.remove('active'));
  // Activate all buttons with matching data-tab (handles both side tabs in sync)
  document.querySelectorAll(`.vibe-side-tab[data-tab="${tab}"], .vibe-tab[data-tab="${tab}"]`).forEach(t => t.classList.add('active'));
  initVibeFeed();
}

// ─── Upload Modal ─────────────────────────────────────────────

// ── State for new features ────────────────────────────────────
let vibeMoodTag = null;          // { emoji, label }
let vibeLocationTag = null;      // string
let vibePollData = null;         // { options: [], duration: 1|3|7 }
let vibeGifUrl = null;           // selected gif URL

// ─── Upload Modal ─────────────────────────────────────────────
function openVibeUpload() {
  if (!currentUser) return showMessage('⚠️ Login first', 'error');

  const avEl = document.getElementById('vibeCaptionAvatar');
  if (avEl) {
    if (currentUser.profilePic) {
      avEl.innerHTML = `<img src="${currentUser.profilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      avEl.textContent = (currentUser.name || currentUser.username || '😊')[0].toUpperCase();
    }
  }

  const nameEl = document.getElementById('vibePostUserName');
  if (nameEl) nameEl.textContent = currentUser.name || currentUser.username || 'You';

  // Reset all state
  vibeSelectedFiles = [];
  vibeDestination = 'profile';
  vibeMoodTag = null;
  vibeLocationTag = null;
  vibePollData = null;
  vibeGifUrl = null;

  document.getElementById('vibeCaptionInput').value = '';
  document.getElementById('vibeMediaPreview').style.display = 'none';
  document.getElementById('vibeMediaZone').style.display = 'flex';
  document.getElementById('vibeCharCount').textContent = '500';
  document.getElementById('vibeCharCount').className = 'vibe-char-pill';
  document.getElementById('destRadioProfile').classList.add('active');
  document.getElementById('destRadioCommunity').classList.remove('active');

  // Hide panels
  ['vibeMoodPanel', 'vibeLocPanel', 'vibeGifPanel', 'vibePollBuilder'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('vibeActiveTags').style.display = 'none';
  document.getElementById('vibeActiveTags').innerHTML = '';

  const overlay = document.getElementById('vibePostingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = `<div class="vibe-posting-spinner"></div><p>Posting your vibe…</p>`;
  }

  const btn = document.getElementById('vibePostBtn');
  if (btn) { btn.disabled = false; document.getElementById('vibePostBtnText').textContent = 'Post Vibe'; }

  document.getElementById('vibeUploadModal').style.display = 'flex';
  setTimeout(() => document.getElementById('vibeCaptionInput')?.focus(), 350);
}

function closeVibeUpload() {
  document.getElementById('vibeUploadModal').style.display = 'none';
  vibeSelectedFiles = [];
}

function handleVibeFileSelect(e) {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('video/') || f.type.startsWith('image/'));
  if (!files.length) return;
  vibeSelectedFiles = [...vibeSelectedFiles, ...files];
  showVibeMediaGridPreview();
}

function handleVibeCameraCapture(e) {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('video/') || f.type.startsWith('image/'));
  if (!files.length) return;
  vibeSelectedFiles = [...vibeSelectedFiles, ...files];
  showVibeMediaGridPreview();
}

function handleVibeDrop(e) {
  e.preventDefault();
  document.getElementById('vibeMediaZone').classList.remove('vdz-active');
  const files = Array.from(e.dataTransfer.files).filter(f =>
    f.type.startsWith('video/') || f.type.startsWith('image/'));
  if (!files.length) return;
  vibeSelectedFiles = [...vibeSelectedFiles, ...files];
  showVibeMediaGridPreview();
}

function showVibeMediaGridPreview() {
  const preview = document.getElementById('vibeMediaPreview');
  const zone = document.getElementById('vibeMediaZone');
  const count = Math.min(vibeSelectedFiles.length, 4);

  if (!count) {
    preview.style.display = 'none';
    zone.style.display = 'flex';
    return;
  }

  const cls = `vibe-preview-grid count-${Math.min(count, 4)}`;
  let html = `<div class="${cls}">`;

  for (let i = 0; i < count; i++) {
    const file = vibeSelectedFiles[i];
    const url = URL.createObjectURL(file);
    const isVid = file.type.startsWith('video/');
    html += `<div class="vibe-prev-item">
      ${isVid
        ? `<video src="${url}" muted playsinline></video>`
        : `<img src="${url}" alt="media ${i + 1}">`}
      <button class="vibe-prev-remove" onclick="removeVibeFile(${i})" title="Remove">✕</button>
    </div>`;
  }

  // Add more button if < 4 files
  if (count < 4) {
    html += `<div class="vibe-prev-add-more" onclick="document.getElementById('vibeFileInput').click()">＋</div>`;
  }

  html += '</div>';
  preview.innerHTML = html;
  preview.style.display = 'block';
  zone.style.display = 'none';
}

function removeVibeFile(index) {
  vibeSelectedFiles.splice(index, 1);
  if (!vibeSelectedFiles.length) {
    document.getElementById('vibeMediaPreview').style.display = 'none';
    document.getElementById('vibeMediaZone').style.display = 'flex';
    document.getElementById('vibeFileInput').value = '';
  } else {
    showVibeMediaGridPreview();
  }
}

// Legacy compat
function showVibeMediaPreview(file) { showVibeMediaGridPreview(); }
function clearVibeMedia() {
  vibeSelectedFiles = [];
  vibeGifUrl = null;
  document.getElementById('vibeMediaPreview').style.display = 'none';
  document.getElementById('vibeMediaZone').style.display = 'flex';
  document.getElementById('vibeFileInput').value = '';
}

function setVibeDest(dest, row) {
  vibeDestination = dest;
  document.getElementById('destRadioProfile').classList.toggle('active', dest === 'profile');
  document.getElementById('destRadioCommunity').classList.toggle('active', dest === 'community');
}

function updateVibeCharCount(textarea) {
  const cnt = document.getElementById('vibeCharCount');
  if (!cnt) return;
  const remaining = 500 - textarea.value.length;
  cnt.textContent = remaining;
  cnt.className = 'vibe-char-pill' + (remaining < 20 ? ' limit' : remaining < 60 ? ' warn' : '');
}

// ── Mood picker ───────────────────────────────────────────────
function openVibeMoodPicker() {
  toggleVibePanel('vibeMoodPanel');
}
function setVibeMood(emoji, label) {
  vibeMoodTag = { emoji, label };
  document.getElementById('vibeMoodPanel').style.display = 'none';
  document.getElementById('vibeMoodBtn').classList.add('active-tool');
  renderVibeTags();
  showMessage(`Mood set: ${emoji} ${label}`, 'success');
}

// ── Location picker ───────────────────────────────────────────
function openVibeLocationPicker() {
  toggleVibePanel('vibeLocPanel');
  setTimeout(() => document.getElementById('vibeLocSearch')?.focus(), 150);
}
let _locSearchTimer = null;
function searchVibeLocation(query) {
  clearTimeout(_locSearchTimer);
  const results = document.getElementById('vibeLocResults');
  const q = query.trim();

  // Always show "current location" option
  let baseHtml = `<button class="vlp-result" onclick="vibeGetCurrentLocation()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>
    📍 Use my current location
  </button>`;

  if (q.length < 2) { results.innerHTML = baseHtml; return; }

  // Show quick typed suggestions immediately
  const quickSuggestions = [`📍 ${q} Campus`, `📍 ${q} Canteen`, `📍 ${q} Library`, `📍 ${q} Hostel`];
  let quickHtml = baseHtml + quickSuggestions.map(s =>
    `<button class="vlp-result" onclick="setVibeLocation('${s.replace(/'/g, "\\'")}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ${s}
    </button>`
  ).join('');
  results.innerHTML = quickHtml;

  // Debounced Nominatim search for real places
  _locSearchTimer = setTimeout(() => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=in&accept-language=en`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'VibeXpert/1.0' }
    })
      .then(r => r.json())
      .then(places => {
        if (!places?.length) return; // keep quick suggestions
        const realHtml = places.map(p => {
          const name = p.display_name?.split(',').slice(0, 2).join(', ') || p.name || q;
          const label = `📍 ${name}`;
          return `<button class="vlp-result" onclick="setVibeLocation('${label.replace(/'/g, "\\'")}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${label}
          </button>`;
        }).join('');
        results.innerHTML = baseHtml + realHtml;
      })
      .catch(() => { }); // keep quick suggestions on error
  }, 500);
}
function vibeGetCurrentLocation() {
  if (!navigator.geolocation) return setVibeLocation('📍 Current Location');
  const resultsEl = document.getElementById('vibeLocResults');
  if (resultsEl) resultsEl.innerHTML += `<div style="padding:8px 12px;font-size:12px;color:rgba(255,255,255,0.4);">⏳ Getting location…</div>`;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      // Try reverse geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en`, {
        headers: { 'User-Agent': 'VibeXpert/1.0' }
      })
        .then(r => r.json())
        .then(d => {
          const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || '';
          const state = d.address?.state || '';
          const label = city ? `📍 ${city}${state ? ', ' + state : ''}` : `📍 ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
          setVibeLocation(label);
        })
        .catch(() => setVibeLocation(`📍 ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`));
    },
    () => setVibeLocation('📍 Current Location')
  );
}
function setVibeLocation(location) {
  vibeLocationTag = location;
  document.getElementById('vibeLocPanel').style.display = 'none';
  document.getElementById('vibeLocBtn').classList.add('active-tool');
  renderVibeTags();
  showMessage(`Location added: ${location}`, 'success');
}

// ── Poll ──────────────────────────────────────────────────────
function toggleVibePoll(show) {
  const panel = document.getElementById('vibePollBuilder');
  const btn = document.getElementById('vibePollBtn');
  if (show) {
    panel.style.display = 'block';
    btn.classList.add('active-tool');
    vibePollData = { options: ['', ''], duration: 3 };
  } else {
    panel.style.display = 'none';
    btn.classList.remove('active-tool');
    vibePollData = null;
  }
}
function addVibePollOption() {
  const container = document.getElementById('vibePollOptions');
  const count = container.querySelectorAll('.vpb-option-row').length;
  if (count >= 4) return;
  const div = document.createElement('div');
  div.className = 'vpb-option-row';
  div.innerHTML = `<span class="vpb-opt-num">${count + 1}</span>
    <input type="text" class="vpb-input" placeholder="Option ${count + 1}" maxlength="60">`;
  container.appendChild(div);
  if (count + 1 >= 4) document.getElementById('vpbAddOpt').disabled = true;
}
function getVibePollData() {
  const inputs = document.querySelectorAll('#vibePollOptions .vpb-input');
  const options = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
  const duration = parseInt(document.getElementById('vibePollDuration')?.value || '3');
  return options.length >= 2 ? { options, duration } : null;
}

// ── GIF picker ────────────────────────────────────────────────
// Curated GIFs that always load (direct Giphy CDN links — no API key required)
const _curatedGifs = [
  { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', label: '🔥 Trending' },
  { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', label: '😂 Funny' },
  { url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', label: '😎 Cool' },
  { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', label: '🎉 Party' },
  { url: 'https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif', label: '💯 Agree' },
  { url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', label: '🌟 Amazing' },
  { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', label: '👀 Wow' },
  { url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif', label: '😍 Love' },
  { url: 'https://media.giphy.com/media/26xBwdIuRJiAIqHIA/giphy.gif', label: '🤣 LOL' },
  { url: 'https://media.giphy.com/media/3oKIPnbKgN3bXeVpvy/giphy.gif', label: '✨ Magic' },
  { url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif', label: '🎵 Music' },
  { url: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif', label: '🙏 Thanks' },
];

function openVibeGifPicker() {
  toggleVibePanel('vibeGifPanel');
  // Show curated GIFs immediately on open
  const grid = document.getElementById('vibeGifGrid');
  if (grid && grid.innerHTML.includes('Type to search')) {
    _renderCuratedGifs(grid);
  }
  setTimeout(() => document.getElementById('vibeGifSearch')?.focus(), 150);
}

function _renderCuratedGifs(grid) {
  grid.innerHTML = `
    <div style="font-size:10px;color:rgba(255,255,255,0.35);text-align:center;padding:4px 0 6px;letter-spacing:0.5px;">TRENDING — tap to add, or search above</div>
    ${_curatedGifs.map(g =>
    `<div class="vgp-item" onclick="selectVibeGif('${g.url}','${g.url}')" style="position:relative;">
         <img src="${g.url}" alt="${g.label}" loading="lazy"
              style="width:100%;height:80px;object-fit:cover;border-radius:6px;display:block;"
              onerror="this.parentElement.style.display='none'">
       </div>`
  ).join('')}`;
}

let _gifTimer = null;
function searchVibeGif(query) {
  clearTimeout(_gifTimer);
  const grid = document.getElementById('vibeGifGrid');
  if (!query.trim()) {
    _renderCuratedGifs(grid);
    return;
  }
  _gifTimer = setTimeout(() => _doGifSearch(query), 450);
}

function _doGifSearch(query) {
  const grid = document.getElementById('vibeGifGrid');
  if (!grid || !query.trim()) return;

  grid.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:rgba(255,255,255,0.4);font-size:12px;">
    <div style="width:14px;height:14px;border:2px solid #a78bfa;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
    Searching GIFs…
  </div>`;

  // Use Tenor's anonymous search endpoint — works without any API key
  const tenorUrl = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&limit=12&key=AIzaSyAyimkuYQYF_FXVALexPzFsE9dmD2X&media_filter=tinygif,gif&contentfilter=medium`;

  fetch(tenorUrl)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const results = (data.results || []);
      if (!results.length) throw new Error('empty');
      grid.innerHTML = results.map(r => {
        const preview = r.media_formats?.tinygif?.url || r.media_formats?.nanogif?.url || '';
        const full = r.media_formats?.gif?.url || preview;
        if (!preview) return '';
        return `<div class="vgp-item" onclick="selectVibeGif('${full.replace(/'/g, "\\'")}','${preview.replace(/'/g, "\\'")}')">
          <img src="${preview}" alt="" loading="lazy" style="width:100%;height:80px;object-fit:cover;border-radius:6px;"
               onerror="this.parentElement.style.display='none'">
        </div>`;
      }).filter(Boolean).join('');
      if (!grid.innerHTML.trim()) throw new Error('empty after filter');
    })
    .catch(() => {
      // Always fall back to curated — never show a broken state
      _renderCuratedGifs(grid);
      // Also show a toast so user knows search didn't work
      showMessage('GIF search unavailable — showing trending instead', 'info');
    });
}

function selectVibeGif(gifUrl, previewUrl) {
  vibeGifUrl = gifUrl;
  const displayUrl = previewUrl || gifUrl;
  document.getElementById('vibeGifPanel').style.display = 'none';
  // Show gif in preview
  const preview = document.getElementById('vibeMediaPreview');
  const zone = document.getElementById('vibeMediaZone');
  preview.innerHTML = `<div class="vibe-preview-grid count-1">
    <div class="vibe-prev-item" style="max-height:160px;">
      <img src="${displayUrl}" alt="GIF">
      <button class="vibe-prev-remove" onclick="clearVibeGif()">✕</button>
    </div>
  </div>`;
  preview.style.display = 'block';
  zone.style.display = 'none';
  showMessage('GIF added! 🎉', 'success');
}
function setVibeGifEmoji(emoji) {
  // Emoji-only fallback when Tenor is unavailable
  const caption = document.getElementById('vibeCaptionInput');
  if (caption) caption.value += ' ' + emoji;
  document.getElementById('vibeGifPanel').style.display = 'none';
}
function clearVibeGif() {
  vibeGifUrl = null;
  document.getElementById('vibeMediaPreview').style.display = 'none';
  document.getElementById('vibeMediaZone').style.display = 'flex';
}

// ── Tags bar renderer ──────────────────────────────────────────
function renderVibeTags() {
  const bar = document.getElementById('vibeActiveTags');
  let html = '';
  if (vibeMoodTag) {
    html += `<div class="vibe-active-tag">${vibeMoodTag.emoji} ${vibeMoodTag.label}
      <button onclick="clearVibeMood()">✕</button></div>`;
  }
  if (vibeLocationTag) {
    const short = vibeLocationTag.length > 24 ? vibeLocationTag.slice(0, 22) + '…' : vibeLocationTag;
    html += `<div class="vibe-active-tag">${short}
      <button onclick="clearVibeLocation()">✕</button></div>`;
  }
  if (vibePollData) {
    html += `<div class="vibe-active-tag">📊 Poll <button onclick="toggleVibePoll(false)">✕</button></div>`;
  }
  bar.innerHTML = html;
  bar.style.display = html ? 'flex' : 'none';
}
function clearVibeMood() {
  vibeMoodTag = null;
  document.getElementById('vibeMoodBtn').classList.remove('active-tool');
  renderVibeTags();
}
function clearVibeLocation() {
  vibeLocationTag = null;
  document.getElementById('vibeLocBtn').classList.remove('active-tool');
  renderVibeTags();
}

// ── Panel toggle helper (one open at a time) ──────────────────
function toggleVibePanel(panelId) {
  const panels = ['vibeMoodPanel', 'vibeLocPanel', 'vibeGifPanel'];
  panels.forEach(id => {
    if (id !== panelId) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }
  });
  const target = document.getElementById(panelId);
  if (!target) return;
  target.style.display = target.style.display === 'none' ? 'block' : 'none';
}


// ─── Submit post — wires to real /api/posts ───────────────────
async function submitVibePost() {
  const caption = document.getElementById('vibeCaptionInput')?.value.trim();
  const btn = document.getElementById('vibePostBtn');
  const postingOverlay = document.getElementById('vibePostingOverlay');

  if (!currentUser) return showMessage('⚠️ Login first', 'error');

  if (!vibeSelectedFiles.length) {
    // Shake the post area to indicate required media
    const sheet = document.querySelector('.vibe-upload-sheet');
    if (sheet) { sheet.style.animation = 'shakePost 0.4s ease'; setTimeout(() => sheet.style.animation = '', 400); }
    showVibeSelectFirst();
    return;
  }

  // Fix: treat null/undefined communityJoined as false only when explicitly checking community post
  const isJoined = currentUser.communityJoined || currentUser.community_joined || false;
  if (vibeDestination === 'community' && !isJoined) {
    return showMessage('⚠️ Join your college community first to post there', 'error');
  }

  if (btn) { btn.disabled = true; const t = document.getElementById('vibePostBtnText'); if (t) t.textContent = '⏳ Posting...'; }
  if (postingOverlay) postingOverlay.style.display = 'flex';

  try {
    const formData = new FormData();
    formData.append('content', caption || '');
    formData.append('postTo', vibeDestination);

    // Include music/stickers from existing selectors if they were used
    if (typeof selectedMusic !== 'undefined' && selectedMusic) {
      formData.append('music', JSON.stringify(selectedMusic));
    }
    if (typeof selectedStickers !== 'undefined' && selectedStickers?.length) {
      formData.append('stickers', JSON.stringify(selectedStickers));
    }

    // New features: mood, location, poll, gif
    if (vibeMoodTag) formData.append('mood', JSON.stringify(vibeMoodTag));
    if (vibeLocationTag) formData.append('location', vibeLocationTag);
    if (vibeGifUrl) formData.append('gifUrl', vibeGifUrl);
    if (vibePollData) {
      const pd = getVibePollData();
      if (pd) formData.append('poll', JSON.stringify(pd));
    }

    for (const file of vibeSelectedFiles) {
      formData.append('media', file);
    }

    const data = await apiCall('/api/posts', 'POST', formData);

    if (data && data.success) {
      // ── Success overlay ─────────────────────────────────────────────────
      if (postingOverlay) {
        postingOverlay.innerHTML = `<div class="vibe-post-success-anim">
          <div class="vibe-success-check">✅</div>
          <p>Vibe Posted!</p>
        </div>`;
      }
      if (currentUser) {
        currentUser.postCount = (currentUser.postCount || 0) + 1;
        saveUserToLocal?.();
      }
      checkAndUpdateRewards?.('post');
      if (typeof selectedMusic !== 'undefined') selectedMusic = null;
      if (typeof selectedStickers !== 'undefined') selectedStickers = [];

      // ── Optimistic prepend — poster sees their post immediately ────────
      // (The server already emitted new_post to all OTHER users via Socket.IO)
      const newPost = data.post;

      // ── Always inject into My Vibes data so profile tab is up-to-date ──
      if (newPost) {
        _mvAllPosts.unshift(newPost);
        _updateMvStats(_mvAllPosts);
        const mvPane = document.getElementById('profileTabVibes');
        if (mvPane && mvPane.classList.contains('active')) {
          _renderMyVibesGrid(_mvFilterPosts(_mvAllPosts, _mvActiveFilter));
        }
      }

      if (newPost && vibeActiveTab === 'all') {
        const feed = document.getElementById('vibeFeed');
        if (feed && !feed.querySelector('.vibe-loading') && !feed.querySelector('.vibe-empty')) {
          const idx = feed.querySelectorAll('.vibe-card').length;
          const tmp = document.createElement('div');
          tmp.innerHTML = buildVibeCard(newPost, idx);
          const card = tmp.firstElementChild;
          if (card) {
            card.style.cssText += 'animation:vibeSlideIn 0.45s cubic-bezier(.2,1.1,.4,1) both;';
            feed.insertBefore(card, feed.firstChild);
            // Wire up tap/double-tap on the newly inserted card
            let lastTap = 0;
            card.addEventListener('click', e => {
              if (e.target.closest('.vibe-card-actions') || e.target.closest('.vibe-card-info') || e.target.closest('.vibe-card-delete-btn')) return;
              const now = Date.now();
              if (now - lastTap < 320) vibeDoubleTapLike(card, idx);
              lastTap = now;
              const vid = card.querySelector('.vibe-card-bg-video');
              if (vid) vibeToggleVideo(card, idx, vid);
            });
          }
        }
      }

      // ── Instantly close the modal, then show success popup + hard reload ──
      closeVibeUpload();
      showVibePostSuccessAndReload();
    } else {
      const errMsg = (data && data.error) ? data.error : 'Post failed — please try again';
      showMessage('❌ ' + errMsg, 'error');
      if (postingOverlay) postingOverlay.style.display = 'none';
    }
  } catch (e) {
    console.error('❌ Post err:', e);
    const userMsg = e.status === 401 ? 'Session expired — please log in again'
      : e.status === 400 ? (e.message || 'Invalid post data')
        : e.status === 500 ? 'Server error — please try again in a moment'
          : (e.message || 'Connection failed');
    showMessage('❌ ' + userMsg, 'error');
    if (postingOverlay) postingOverlay.style.display = 'none';
  } finally {
    if (btn) {
      btn.disabled = false;
      const btnText = document.getElementById('vibePostBtnText');
      if (btnText) btnText.textContent = 'Post Vibe';
    }
  }
}

// ─── Hook showPage to init vibe feed ─────────────────────────
// Override the existing showPage shim to trigger initVibeFeed
(function () {
  const _prev = window.showPage;
  window.showPage = function (pageId, ...args) {
    if (_prev) _prev(pageId, ...args);
    if (pageId === 'posts') {
      setTimeout(initVibeFeed, 80);
    }
  };
})();

// Also override the loadPosts function so any existing calls still work
function loadPosts() {
  initVibeFeed();
}
// ================================================================
// VibeXpert — DM System, Mini Profile Card, Ghost Mode, Presence
// ================================================================

// ── State ─────────────────────────────────────────────────────────
let _dmCurrentReceiverId = null;
let _mpcCache = {};           // userId → profile data (auto-expires after 60s)
let _mpcCacheTime = {};       // userId → timestamp of cache entry

function _getMpcCache(userId) {
  const ts = _mpcCacheTime[userId] || 0;
  if (Date.now() - ts > 60000) { // 60s TTL
    delete _mpcCache[userId];
    delete _mpcCacheTime[userId];
    return null;
  }
  return _mpcCache[userId] || null;
}

function _setMpcCache(userId, data) {
  _mpcCache[userId] = data;
  _mpcCacheTime[userId] = Date.now();
}
let _mpcCurrentUserId = null;
let _dmTypingTimeout = null;
let _anonModeActive = false;
let _anonName = localStorage.getItem('vx_anon_name') || '';
if (_anonName) _anonModeActive = true;
// currentProfileUserId is declared as var so showProfilePage (earlier in the file) can write to it
var currentProfileUserId = null;

// ── DM Ping Sound ──────────────────────────────────────────────────
function playDmPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) { /* AudioContext blocked — silent */ }
}

// ── DM Drawer ─────────────────────────────────────────────────────
async function openDmDrawer(userId) {
  // Guard: need a real userId and a logged-in user
  if (!userId || userId === 'null' || userId === 'undefined') {
    showMessage('⚠️ No user selected to message', 'error');
    return;
  }
  if (!currentUser) {
    showMessage('⚠️ Please log in first', 'error');
    return;
  }

  _dmCurrentReceiverId = userId;

  const drawer = document.getElementById('dmDrawer');
  const backdrop = document.getElementById('dmDrawerBackdrop');
  const area = document.getElementById('dmMessagesArea');
  const nameEl = document.getElementById('dmDrawerName');
  const statusEl = document.getElementById('dmDrawerStatus');
  const avatarImg = document.getElementById('dmDrawerAvatarImg');
  const avatarInitial = document.getElementById('dmDrawerAvatarInitial');

  if (!drawer || !area) {
    console.error('DM drawer elements not found in DOM');
    showMessage('❌ DM drawer not ready — please refresh', 'error');
    return;
  }

  // ── Open the floating panel immediately so the user sees something ───────
  // Calculate header height to position panel below it
  const headerEl = document.querySelector('header, #mainHeader, nav, .main-header, [class*="header"]');
  const headerH = headerEl ? headerEl.getBoundingClientRect().bottom : 64;
  const vpH = window.innerHeight;
  const panelH = Math.min(560, vpH - headerH - 32);

  // Restore any saved position or use default (bottom-right)
  const saved = window._dmPanelPos;
  if (saved) {
    drawer.style.left = saved.left || '';
    drawer.style.right = saved.right || '24px';
    drawer.style.top = saved.top || '';
    drawer.style.bottom = saved.bottom || '24px';
  } else {
    drawer.style.right = '24px';
    drawer.style.bottom = '24px';
    drawer.style.left = '';
    drawer.style.top = '';
  }

  // Clamp so panel never overlaps header
  const maxTop = vpH - panelH - 16;
  if (saved && saved.top) {
    const topVal = parseInt(saved.top);
    if (topVal < headerH + 8) {
      drawer.style.top = (headerH + 8) + 'px';
      drawer.style.bottom = '';
    } else if (topVal > maxTop) {
      drawer.style.top = maxTop + 'px';
      drawer.style.bottom = '';
    }
  }

  drawer.style.height = panelH + 'px';
  drawer.style.opacity = '1';
  drawer.style.transform = 'translateY(0) scale(1)';
  drawer.style.pointerEvents = 'auto';
  drawer.classList.add('dm-open');
  drawer.classList.remove('dm-minimized');
  // Re-ensure drag listeners are attached (panel now in body root)
  if (typeof window._attachDmDrag === 'function') window._attachDmDrag();
  // No backdrop, no body overflow lock — app stays fully interactive


  // ── Show loading state ────────────────────────────────────────────
  area.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;padding:32px;text-align:center;color:rgba(255,255,255,0.4);">
    <div style="font-size:32px;animation:spin 1s linear infinite;">⏳</div>
    <div style="font-size:13px;">Loading messages…</div>
  </div>`;
  if (!document.getElementById('dmSpinStyle')) {
    const s = document.createElement('style');
    s.id = 'dmSpinStyle';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  // ── Load profile info (use TTL cache) ─────────────────────────────
  let profile = _getMpcCache(userId);
  if (!profile) {
    try {
      const d = await apiCall(`/api/profile/${userId}`);
      if (d?.user) { profile = d.user; _setMpcCache(userId, profile); }
    } catch (e) { /* profile load failure is non-fatal */ }
  }

  if (profile && nameEl) {
    nameEl.textContent = profile.username || 'User';
    window._dmReceiverName = profile.username || 'User'; // Store for bubble avatar initials
    const online = !profile.last_seen;
    if (statusEl) {
      const statusSpan = statusEl.querySelector('span:last-child');
      if (statusSpan) statusSpan.textContent = online ? 'Online' : (profile.status_text || 'Offline');
      else statusEl.textContent = online ? '● Online' : '● ' + (profile.status_text || 'Offline');
      statusEl.style.color = online ? '#22c55e' : '#a78bfa';
      const ring = document.getElementById('dmOnlineRing');
      if (ring) ring.style.background = online ? '#22c55e' : '#a78bfa';
    }
    if (profile.profile_pic && avatarImg) {
      avatarImg.src = profile.profile_pic;
      avatarImg.style.display = 'block';
      if (avatarInitial) avatarInitial.style.display = 'none';
    } else if (avatarInitial) {
      if (avatarImg) avatarImg.style.display = 'none';
      avatarInitial.style.display = 'flex';
      avatarInitial.textContent = (profile.username || '?')[0].toUpperCase();
    }
  }

  // ── Fetch messages ────────────────────────────────────────────────
  try {
    const data = await apiCall(`/api/dm/messages/${userId}`);

    if (!data || !data.success) {
      throw new Error(data?.error || 'Server returned an error');
    }

    const msgs = data.messages || [];
    if (msgs.length === 0) {
      const name = profile?.username || 'them';
      area.innerHTML = `<div class="dm-empty-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:32px;text-align:center;">
        <div style="font-size:48px;">💬</div>
        <div style="color:rgba(255,255,255,0.8);font-size:15px;font-weight:600;">Start chatting with ${escapeHtml(name)}</div>
        <div style="color:rgba(255,255,255,0.35);font-size:13px;">Your messages are private and secure</div>
      </div>`;
    } else {
      renderDmMessages(msgs, area);
    }
    updateDmBadge(-1, true);

  } catch (e) {
    console.error('DM load error:', e);

    // Give a useful, specific error message
    let errorMsg = 'Could not load messages';
    let hint = '';
    const msg = (e.message || '').toLowerCase();

    if (e.status === 401 || e.status === 403) {
      errorMsg = 'Session expired';
      hint = 'Please log out and log back in.';
    } else if (e.status === 503 || msg.includes('migration') || msg.includes('tables')) {
      errorMsg = 'DM feature not set up';
      hint = 'Run the database.sql migration in Supabase first.';
    } else if (e.status === 404 || msg.includes('not found') || msg.includes('endpoint')) {
      errorMsg = 'DM endpoint not found';
      hint = 'Deploy the updated server.js to your backend.';
    } else if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('abort')) {
      errorMsg = 'Connection failed';
      hint = 'Check your internet connection.';
    } else if (e.status >= 500) {
      errorMsg = 'Server error (' + e.status + ')';
      hint = e.message || 'Check your Render.com logs.';
    }

    area.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:32px;text-align:center;">
      <div style="font-size:40px;">⚠️</div>
      <div style="color:#ef4444;font-size:15px;font-weight:600;">${escapeHtml(errorMsg)}</div>
      ${hint ? `<div style="color:rgba(255,255,255,0.4);font-size:12px;max-width:260px;line-height:1.5;">${escapeHtml(hint)}</div>` : ''}
      <button onclick="openDmDrawer('${userId}')" style="margin-top:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:8px;padding:8px 20px;cursor:pointer;font-size:13px;">🔄 Try again</button>
    </div>`;
  }

  document.getElementById('dmInput')?.focus();
  // Attach scroll-to-bottom button listener
  if (typeof window._dmScrollAttach === 'function') setTimeout(window._dmScrollAttach, 300);
}

function closeDmDrawer() {
  const drawer = document.getElementById('dmDrawer');
  if (drawer) {
    drawer.style.opacity = '0';
    drawer.style.transform = 'translateY(16px) scale(0.96)';
    drawer.style.pointerEvents = 'none';
    setTimeout(() => {
      drawer.style.height = '0';
      drawer.classList.remove('dm-open', 'dm-minimized');
    }, 280);
  }
  // No backdrop to hide, no overflow to reset
  _dmCurrentReceiverId = null;
}

function minimizeDmPanel(event) {
  event && event.stopPropagation();
  const drawer = document.getElementById('dmDrawer');
  const btn = document.getElementById('dmMinimizeBtn');
  if (!drawer) return;
  const isMin = drawer.classList.contains('dm-minimized');
  if (isMin) {
    // Restore
    const headerEl = document.querySelector('header, #mainHeader, nav, .main-header, [class*="header"]');
    const headerH = headerEl ? headerEl.getBoundingClientRect().bottom : 64;
    const panelH = Math.min(560, window.innerHeight - headerH - 32);
    drawer.style.height = panelH + 'px';
    drawer.classList.remove('dm-minimized');
    if (btn) btn.textContent = '—';
  } else {
    drawer.style.height = '54px';
    drawer.classList.add('dm-minimized');
    if (btn) btn.textContent = '▲';
  }
}

// ── DM Panel drag-to-reposition ──────────────────────────────────────
(function initDmDrag() {
  let dragging = false, startX, startY, origLeft, origTop;

  function onMouseDown(e) {
    // Only drag from header, not from buttons
    if (e.target.closest('button')) return;
    const drawer = document.getElementById('dmDrawer');
    if (!drawer || !drawer.classList.contains('dm-open')) return;

    dragging = true;
    const rect = drawer.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origLeft = rect.left;
    origTop = rect.top;

    // Switch to top/left positioning for free dragging
    drawer.style.left = rect.left + 'px';
    drawer.style.top = rect.top + 'px';
    drawer.style.right = 'auto';
    drawer.style.bottom = 'auto';
    drawer.style.transition = 'none';
    drawer.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!dragging) return;
    const drawer = document.getElementById('dmDrawer');
    if (!drawer) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const headerEl = document.querySelector('header, #mainHeader, nav, .main-header, [class*="header"]');
    const headerH = headerEl ? headerEl.getBoundingClientRect().bottom : 64;

    let newLeft = origLeft + dx;
    let newTop = origTop + dy;

    // Clamp within viewport, always below header
    const w = drawer.offsetWidth;
    const h = drawer.offsetHeight;
    newLeft = Math.max(8, Math.min(window.innerWidth - w - 8, newLeft));
    newTop = Math.max(headerH + 8, Math.min(window.innerHeight - h - 8, newTop));

    drawer.style.left = newLeft + 'px';
    drawer.style.top = newTop + 'px';
  }

  function onMouseUp() {
    if (!dragging) return;
    dragging = false;
    const drawer = document.getElementById('dmDrawer');
    if (!drawer) return;
    drawer.style.transition = '';
    drawer.style.cursor = '';
    // Save position
    window._dmPanelPos = { left: drawer.style.left, top: drawer.style.top, right: 'auto', bottom: 'auto' };
  }

  // Touch support
  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    onMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, target: e.target, preventDefault: () => e.preventDefault() });
  }
  function onTouchMove(e) {
    if (e.touches.length !== 1) return;
    onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  }

  function attachDmDragListeners() {
    const header = document.getElementById('dmDrawerHeader');
    if (header && !header._dmDragAttached) {
      header._dmDragAttached = true;
      header.addEventListener('mousedown', onMouseDown);
      header.addEventListener('touchstart', onTouchStart, { passive: false });
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onMouseUp);
  }
  // Expose so openDmDrawer can call it
  window._attachDmDrag = attachDmDragListeners;

  // Attach now if DOM ready, else wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDmDragListeners);
  } else {
    attachDmDragListeners();
  }
})();

function _buildDmBubble(m, isOptimistic) {
  const own = m.sender_id === currentUser?.id;
  const time = isOptimistic ? 'Sending…' : formatDmTime(m.created_at);
  const reactions = m.reactions || {};
  const hasReactions = Object.keys(reactions).length > 0;
  const msgId = m.id || '';

  // Tick indicator for own messages
  let tickHtml = '';
  if (own && !isOptimistic) {
    if (m.is_read) {
      tickHtml = `<span class="dm-tick dm-tick-read" title="Seen">✓✓</span>`;
    } else {
      tickHtml = `<span class="dm-tick dm-tick-sent" title="Sent">✓✓</span>`;
    }
  }

  // Reply preview
  let replyHtml = '';
  if (m.reply_to) {
    const rt = m.reply_to;
    const rtContent = rt.media_type ? `[${rt.media_type}]` : escapeHtml((rt.content || '').slice(0, 60));
    replyHtml = `<div class="dm-reply-preview" onclick="dmScrollToMessage('${rt.id}')">
      <div class="dm-reply-line"></div>
      <div class="dm-reply-content">${rtContent}</div>
    </div>`;
  }

  // Reactions display
  let reactionsHtml = '';
  if (hasReactions) {
    reactionsHtml = `<div class="dm-reactions" data-msgid="${msgId}">` +
      Object.entries(reactions).map(([emoji, users]) => {
        const iMine = users.includes(currentUser?.id);
        return `<button class="dm-react-chip ${iMine ? 'dm-react-mine' : ''}" data-emoji="${emoji}" onclick="dmToggleReact('${msgId}','${emoji}')">${emoji}<span>${users.length}</span></button>`;
      }).join('') + `</div>`;
  }

  // Hover reaction bar (quick-react on hover)
  const hoverReactHtml = isOptimistic ? '' : `<div class="dm-hover-react-bar">
    <button onclick="dmToggleReact('${msgId}','👍')">👍</button>
    <button onclick="dmToggleReact('${msgId}','❤️')">❤️</button>
    <button onclick="dmToggleReact('${msgId}','😂')">😂</button>
    <button onclick="dmToggleReact('${msgId}','😮')">😮</button>
    <button onclick="dmToggleReact('${msgId}','🔥')">🔥</button>
  </div>`;

  // Quick action buttons (reply + react)
  const actionsHtml = isOptimistic ? '' : `<div class="dm-msg-actions ${own ? 'dm-actions-left' : 'dm-actions-right'}">
    <button class="dm-action-btn" title="Reply" onclick="dmSetReply('${msgId}','${escapeHtml((m.content || '').replace(/'/g, "&#39;"))}')">↩</button>
    <button class="dm-action-btn" title="React" onclick="dmShowEmojiPicker('${msgId}',this)">😊</button>
  </div>`;

  // Avatar indicator for received messages (initials + online dot)
  let avatarHtml = '';
  if (!own) {
    const initial = (window._dmReceiverName || '?')[0].toUpperCase();
    avatarHtml = `<div class="dm-avatar-indicator">${initial}</div>`;
  }

  return `<div class="dm-msg-row ${own ? 'dm-own' : 'dm-other'}" id="dm-msg-${msgId}" ${isOptimistic ? 'data-opt="' + msgId + '"' : ''}>
    ${hoverReactHtml}
    ${avatarHtml}
    ${actionsHtml}
    <div class="dm-msg-wrap">
      ${replyHtml}
      <div class="dm-bubble ${own ? 'dm-bubble-own' : 'dm-bubble-other'}">
        ${m.media_url ? renderDmMedia(m) : escapeHtml(m.content || '')}
      </div>
      <div class="dm-msg-meta ${own ? 'dm-meta-own' : 'dm-meta-other'}">
        <span class="dm-msg-time">${time}</span>
        ${tickHtml}
      </div>
    </div>
    ${reactionsHtml}
  </div>`;
}

function renderDmMessages(messages, container) {
  if (!messages.length) {
    container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:32px;text-align:center;"><div style="font-size:48px;">💬</div><div style="color:rgba(255,255,255,0.7);font-size:15px;font-weight:600;">No messages yet</div><div style="color:rgba(255,255,255,0.35);font-size:13px;">Be the first to say hi!</div></div>';
    return;
  }
  container.innerHTML = messages.map(m => _buildDmBubble(m, false)).join('');
  // Scroll to bottom after paint
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
    const last = container.lastElementChild;
    if (last) last.scrollIntoView({ block: 'end' });
  });
}

function renderDmMedia(m) {
  if (!m.media_url) return escapeHtml(m.content || '');
  if (m.media_type === 'image') return `<img src="${proxyMediaUrl(m.media_url)}" style="max-width:100%;border-radius:8px;" loading="lazy">`;
  if (m.media_type === 'video') return `<video src="${proxyMediaUrl(m.media_url)}" controls style="max-width:100%;border-radius:8px;"></video>`;
  return `<a href="${m.media_url}" target="_blank" style="color:#7aa3d4;">${escapeHtml(m.content || 'File')}</a>`;
}

function formatDmTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ── Header height CSS variable — keeps chat/messages below the sticky header ──
function syncHeaderHeight() {
  const h = document.querySelector('.header')?.offsetHeight || 72;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
syncHeaderHeight();
window.addEventListener('resize', syncHeaderHeight);

// ── DM empty-state removal when first message is sent ─────────────────────────
function appendDmMessage(msg) {
  const area = document.getElementById('dmMessagesArea');
  if (!area) return;
  // Clear empty/loading/error state if present
  const isEmpty = area.querySelector('.dm-empty-placeholder');
  if (isEmpty) area.innerHTML = '';

  const isOptimistic = msg.id && msg.id.startsWith('opt_');
  const el = document.createElement('div');
  el.innerHTML = _buildDmBubble(msg, isOptimistic);
  const inner = el.firstElementChild;
  if (isOptimistic) inner.style.opacity = '0.65';
  area.appendChild(inner);

  // Scroll new message into view
  requestAnimationFrame(() => {
    inner.scrollIntoView({ behavior: 'smooth', block: 'end' });
    area.scrollTop = area.scrollHeight;
  });
}

// ── Reply state ────────────────────────────────────────────────────────
let _dmReplyToId = null;
let _dmReplyToText = '';

function dmSetReply(msgId, text) {
  _dmReplyToId = msgId;
  _dmReplyToText = text;
  const bar = document.getElementById('dmReplyBar');
  const preview = document.getElementById('dmReplyPreviewText');
  if (bar) bar.style.display = 'flex';
  if (preview) preview.textContent = text || '[media]';
  document.getElementById('dmInput')?.focus();
}

function cancelDmReply() {
  _dmReplyToId = null;
  _dmReplyToText = '';
  const bar = document.getElementById('dmReplyBar');
  if (bar) bar.style.display = 'none';
}

function dmScrollToMessage(msgId) {
  const el = document.getElementById('dm-msg-' + msgId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('dm-msg-highlight');
    setTimeout(() => el.classList.remove('dm-msg-highlight'), 1500);
  }
}

// ── Emoji picker for reactions ──────────────────────────────────────────────
const DM_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

function dmShowEmojiPicker(msgId, btn) {
  // Remove any existing picker
  document.querySelectorAll('.dm-emoji-picker').forEach(p => p.remove());

  const picker = document.createElement('div');
  picker.className = 'dm-emoji-picker';
  picker.innerHTML = DM_EMOJIS.map(e =>
    `<button onclick="dmToggleReact('${msgId}','${e}');this.closest('.dm-emoji-picker').remove()">${e}</button>`
  ).join('');

  // Append inside the DM drawer so positioning works correctly
  const drawer = document.getElementById('dmDrawer');
  (drawer || document.body).appendChild(picker);

  // Position relative to the button inside the fixed panel
  const btnRect = btn.getBoundingClientRect();
  const drawerRect = drawer ? drawer.getBoundingClientRect() : { left: 0, top: 0 };

  // Place above the button, centered
  const pickerW = 260; // approx width of picker
  let left = btnRect.left - drawerRect.left - pickerW / 2 + 14;
  let top = btnRect.top - drawerRect.top - 52; // 52px = picker height + gap

  // Keep within panel bounds
  left = Math.max(8, Math.min(left, (drawer ? drawer.offsetWidth : window.innerWidth) - pickerW - 8));
  if (top < 8) top = btnRect.bottom - drawerRect.top + 8; // flip below if no room above

  picker.style.position = 'absolute';
  picker.style.left = left + 'px';
  picker.style.top = top + 'px';

  // Animate in
  picker.style.opacity = '0';
  picker.style.transform = 'scale(0.8) translateY(8px)';
  requestAnimationFrame(() => {
    picker.style.transition = 'opacity 0.15s, transform 0.15s';
    picker.style.opacity = '1';
    picker.style.transform = 'scale(1) translateY(0)';
  });

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!picker.contains(e.target) && e.target !== btn) {
        picker.remove();
        document.removeEventListener('click', close);
      }
    });
  }, 10);
}

async function dmToggleReact(msgId, emoji) {
  const row = document.getElementById('dm-msg-' + msgId);
  if (!row) return;

  // Optimistic UI — toggle locally immediately
  let reactDiv = row.querySelector('.dm-reactions');
  if (!reactDiv) {
    reactDiv = document.createElement('div');
    reactDiv.className = 'dm-reactions';
    reactDiv.dataset.msgid = msgId;
    row.appendChild(reactDiv);
  }

  // Check if we already reacted with this emoji
  const existingChip = reactDiv.querySelector(`[data-emoji="${emoji}"]`);
  if (existingChip) {
    existingChip.style.transform = 'scale(0)';
    setTimeout(() => existingChip.remove(), 150);
    if (reactDiv.children.length <= 1) setTimeout(() => {
      if (reactDiv.children.length === 0) reactDiv.remove();
    }, 200);
  } else {
    const chip = document.createElement('button');
    chip.className = 'dm-react-chip dm-react-mine';
    chip.dataset.emoji = emoji;
    chip.onclick = () => dmToggleReact(msgId, emoji);
    chip.innerHTML = `${emoji}<span>1</span>`;
    reactDiv.appendChild(chip);
  }

  // Send to server
  try {
    const data = await apiCall(`/api/dm/react/${msgId}`, 'POST', { emoji });
    if (!data?.success) {
      showMessage('😅 Could not save reaction', 'error');
      return;
    }
    // Re-render reactions from server truth
    const reactions = data.reactions || {};
    if (Object.keys(reactions).length === 0) {
      reactDiv.remove();
      return;
    }
    reactDiv.innerHTML = Object.entries(reactions).map(([e, users]) => {
      const mine = users.includes(currentUser?.id);
      return `<button class="dm-react-chip ${mine ? 'dm-react-mine' : ''}" data-emoji="${e}" onclick="dmToggleReact('${msgId}','${e}')">${e}<span>${users.length}</span></button>`;
    }).join('');
  } catch (e) {
    console.error('React error:', e);
    if (e.message && e.message.includes('column')) {
      showMessage('⚠️ Reactions need a database column — check server logs', 'error', 5000);
    }
  }
}

async function sendDm() {
  const input = document.getElementById('dmInput');
  const text = input?.value.trim();
  if (!text) return;
  if (!_dmCurrentReceiverId) {
    showMessage('\u26a0\ufe0f No conversation open', 'error');
    return;
  }

  const replyToId = _dmReplyToId;
  const replyToText = _dmReplyToText;

  // Clear input + reply bar immediately for snappy UX
  input.value = '';
  cancelDmReply();

  // Step 1: Show optimistic bubble right away
  const optId = 'opt_' + Date.now();
  const optimistic = {
    id: optId,
    sender_id: currentUser?.id,
    receiver_id: _dmCurrentReceiverId,
    content: text,
    created_at: new Date().toISOString(),
    is_read: false,
    reply_to: null
  };

  const area = document.getElementById('dmMessagesArea');
  if (!area) return;

  // Clear empty/loading placeholder if present
  const placeholder = area.querySelector('.dm-empty-placeholder');
  if (placeholder) area.innerHTML = '';

  // Build and insert optimistic bubble
  const tempEl = document.createElement('div');
  tempEl.innerHTML = _buildDmBubble(optimistic, true);
  const optBubble = tempEl.firstElementChild;
  if (optBubble) {
    optBubble.style.opacity = '0.6';
    optBubble.setAttribute('data-opt', optId);
    area.appendChild(optBubble);
    requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
  }

  // Step 2: Send to server
  try {
    const body = { receiverId: _dmCurrentReceiverId, content: text };
    if (replyToId) body.replyToId = replyToId;

    const data = await apiCall('/api/dm/send', 'POST', body);
    if (!data || !data.success) throw new Error(data?.error || 'Send failed');

    // Step 3: Upgrade optimistic bubble to confirmed (in-place, no replaceWith)
    const existing = area.querySelector('[data-opt="' + optId + '"]');

    if (existing) {
      existing.removeAttribute('data-opt');
      existing.style.opacity = '1';

      // Set real message ID
      if (data.dm && data.dm.id) existing.id = 'dm-msg-' + data.dm.id;

      // Update "Sending..." time to real timestamp
      const timeEl = existing.querySelector('.dm-msg-time');
      if (timeEl && data.dm && data.dm.created_at) timeEl.textContent = formatDmTime(data.dm.created_at);

      // Add sent tick (own messages only)
      const metaEl = existing.querySelector('.dm-msg-meta');
      if (metaEl && !metaEl.querySelector('.dm-tick')) {
        const tick = document.createElement('span');
        tick.className = 'dm-tick dm-tick-sent';
        tick.title = 'Sent';
        tick.textContent = '\u2713\u2713';
        metaEl.appendChild(tick);
      }

      // Add reply/react action buttons
      if (data.dm && data.dm.id && !existing.querySelector('.dm-msg-actions')) {
        const own = String(data.dm.sender_id) === String(currentUser?.id);
        const msgId = data.dm.id;
        const safeContent = escapeHtml((data.dm.content || '').replace(/'/g, "&#39;"));
        const actDiv = document.createElement('div');
        actDiv.className = 'dm-msg-actions ' + (own ? 'dm-actions-left' : 'dm-actions-right');
        actDiv.innerHTML =
          '<button class="dm-action-btn" title="Reply" onclick="dmSetReply(\'' + msgId + '\',\'' + safeContent + '\')">&#8617;</button>' +
          '<button class="dm-action-btn" title="React" onclick="dmShowEmojiPicker(\'' + msgId + '\',this)">\ud83d\ude0a</button>';
        const wrap = existing.querySelector('.dm-msg-wrap');
        if (wrap) existing.insertBefore(actDiv, wrap);
      }
    } else if (data.dm) {
      // Fallback: optimistic gone somehow, append confirmed bubble fresh
      const fresh = document.createElement('div');
      fresh.innerHTML = _buildDmBubble(data.dm, false);
      const freshEl = fresh.firstElementChild;
      if (freshEl) {
        area.appendChild(freshEl);
        requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
      }
    }

    // Refresh conversations sidebar if open
    const msgsTab = document.getElementById('profileTabMessages');
    if (msgsTab && msgsTab.classList.contains('active')) {
      setTimeout(loadDmConversations, 400);
    }

  } catch (e) {
    console.error('DM send error:', e);

    // Mark optimistic bubble as failed
    const failEl = area.querySelector('[data-opt="' + optId + '"]');
    if (failEl) {
      failEl.style.opacity = '0.3';
      const timeEl = failEl.querySelector('.dm-msg-time');
      if (timeEl) timeEl.innerHTML = '<span style="color:#ef4444;">Failed \u2715</span>';
    }

    // Restore input so user can retry
    if (input) input.value = text;
    if (replyToId) { _dmReplyToId = replyToId; _dmReplyToText = replyToText; dmSetReply(replyToId, replyToText); }

    const msg = (e.message || '').toLowerCase();
    if (msg.includes('migration') || msg.includes('tables') || e.status === 503) {
      showMessage('\u274c DM tables not set up \u2014 run database.sql in Supabase', 'error', 6000);
    } else if (e.status === 401 || e.status === 403) {
      showMessage('\u274c Session expired \u2014 please log in again', 'error');
    } else {
      showMessage('\u274c Message failed to send. Please retry.', 'error');
    }
  }
}

function handleDmTyping() {
  if (!_dmCurrentReceiverId || !window.socket) return;
  window.socket.emit('dm_typing', { receiverId: _dmCurrentReceiverId });
  clearTimeout(_dmTypingTimeout);
  _dmTypingTimeout = setTimeout(() => {
    window.socket.emit('dm_stop_typing', { receiverId: _dmCurrentReceiverId });
  }, 2000);
}

// ── Scroll-to-bottom button visibility ───────────────────────────────
(function initDmScrollBtn() {
  function attach() {
    const area = document.getElementById('dmMessagesArea');
    const btn = document.getElementById('dmScrollBottomBtn');
    if (!area || !btn) return;
    if (area._dmScrollAttached) return;
    area._dmScrollAttached = true;
    area.addEventListener('scroll', function () {
      const distFromBottom = area.scrollHeight - area.scrollTop - area.clientHeight;
      if (distFromBottom > 120) {
        btn.classList.add('dm-scroll-visible');
      } else {
        btn.classList.remove('dm-scroll-visible');
      }
    });
  }
  // Keep trying to attach until the element exists (DOM may load later)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
  // Also attach when drawer opens
  const origOpen = window.openDmDrawer;
  if (origOpen) {
    // Defer re-attachment after drawer opens
    const _waitAttach = () => setTimeout(attach, 200);
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[onclick*="openDmDrawer"]')) _waitAttach();
    });
  }
  // Re-attach on any drawer open
  window._dmScrollAttach = attach;
})();

// ── Emoji input helper (reuses existing picker logic for input bar emoji button) ──
function dmShowInputEmoji(btn) {
  // Reuse same emoji picker approach as reactions
  document.querySelectorAll('.dm-emoji-picker').forEach(p => p.remove());
  const EMOJIS = ['😊', '😂', '❤️', '😍', '👍', '🔥', '🎉', '💯', '😎', '🥺', '✨', '🙏'];
  const picker = document.createElement('div');
  picker.className = 'dm-emoji-picker';
  picker.style.flexWrap = 'wrap';
  picker.style.maxWidth = '200px';
  picker.innerHTML = EMOJIS.map(e =>
    `<button onclick="document.getElementById('dmInput').value+='${e}';document.getElementById('dmInput').focus();this.closest('.dm-emoji-picker').remove()">${e}</button>`
  ).join('');

  const drawer = document.getElementById('dmDrawer');
  (drawer || document.body).appendChild(picker);

  const btnRect = btn.getBoundingClientRect();
  const drawerRect = drawer ? drawer.getBoundingClientRect() : { left: 0, top: 0 };
  picker.style.position = 'absolute';
  picker.style.left = Math.max(8, btnRect.left - drawerRect.left - 80) + 'px';
  picker.style.top = (btnRect.top - drawerRect.top - 90) + 'px';
  picker.style.opacity = '0';
  picker.style.transform = 'scale(0.8) translateY(8px)';
  requestAnimationFrame(() => {
    picker.style.transition = 'opacity 0.15s, transform 0.15s';
    picker.style.opacity = '1';
    picker.style.transform = 'scale(1) translateY(0)';
  });
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!picker.contains(e.target) && e.target !== btn) { picker.remove(); document.removeEventListener('click', close); }
    });
  }, 10);
}

// ── Media attachment handler (for 📎 button) ────────────────────────
function handleDmMediaSelect(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  // For now, show the filename in the input as a preview
  const input = document.getElementById('dmInput');
  if (input) input.placeholder = '📎 ' + file.name;
  // Store file for sending (future: integrate with sendDm for media upload)
  window._dmPendingFile = file;
  showMessage('📎 File attached: ' + file.name, 'success');
}

function handleIncomingDm(msg) {
  const drawer = document.getElementById('dmDrawer');
  // Use classList not style.right - style.right is '' (not '0px') after browser normalizes '0'
  const isDrawerOpen = drawer && drawer.classList.contains('dm-open');
  const isFromCurrentConv = _dmCurrentReceiverId === msg.sender_id;

  if (isDrawerOpen && isFromCurrentConv) {
    appendDmMessage(msg);
  } else {
    playDmPing();
    const senderName = msg.senderUser?.username || 'Someone';
    showMessage(`💬 ${senderName}: ${(msg.content || '').slice(0, 40)}${(msg.content || '').length > 40 ? '…' : ''}`, 'success', 4000);
    updateDmBadge(1, false);
  }

  // Refresh conversations list if messages tab open
  const msgsTab = document.getElementById('profileTabMessages');
  if (msgsTab && msgsTab.classList.contains('active')) loadDmConversations();
}

// DM unread badge (global)
let _dmTotalUnread = 0;
function updateDmBadge(delta, reset) {
  if (reset) _dmTotalUnread = 0;
  else _dmTotalUnread = Math.max(0, _dmTotalUnread + delta);
  const badge = document.getElementById('dmUnreadBadge');
  if (!badge) return;
  if (_dmTotalUnread > 0) {
    badge.style.display = 'inline';
    badge.textContent = _dmTotalUnread > 99 ? '99+' : _dmTotalUnread;
  } else {
    badge.style.display = 'none';
  }
}

async function loadDmConversations() {
  const container = document.getElementById('dmConversationsList');
  if (!container) return;

  // Show loading skeleton
  container.innerHTML = `<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.35);font-size:13px;">Loading…</div>`;

  try {
    // Run both calls; surface real errors instead of silently returning empty
    let convData = { conversations: [] };
    let mutualData = { mutualFollows: [] };
    let apiError = null;

    try { convData = await apiCall('/api/dm/conversations'); }
    catch (e) {
      console.error('DM conversations API error:', e);
      // Only treat as fatal if NOT a 404 (404 means endpoint not deployed yet — degrade gracefully)
      if (e.status !== 404) apiError = apiError || e.message;
    }

    try { mutualData = await apiCall('/api/dm/mutual-follows'); }
    catch (e) {
      console.error('DM mutual-follows API error:', e);
      // 404 = endpoint not on server yet — silently skip, show conversations-only view
      if (e.status !== 404) apiError = apiError || e.message;
      // else: degrade gracefully, mutual-follows just won't show
    }

    // If we got a debug hint from server, log it
    if (mutualData?.debug) console.log('mutual-follows debug:', mutualData.debug);

    const convs = convData?.conversations || [];
    const mutuals = mutualData?.mutualFollows || [];

    // Users already in conversations
    const convUserIds = new Set(convs.map(c => c.otherUser?.id).filter(Boolean));

    // Mutual follows with no conversation yet
    const newContacts = mutuals.filter(u => !convUserIds.has(u.id));

    // All mutual follow IDs (for enriching conversation cards with "Chat Now")
    const mutualIds = new Set(mutuals.map(u => u.id));

    if (!convs.length && !newContacts.length) {
      if (apiError) {
        // Real error (not a 404) — show error with retry
        container.innerHTML = `
          <div class="dm-empty-state">
            <div class="dm-empty-icon">⚠️</div>
            <div class="dm-empty-title">Could not load contacts</div>
            <div class="dm-empty-sub" style="color:rgba(248,113,113,0.7);">${escapeHtml(apiError)}</div>
            <button onclick="loadDmConversations()" style="margin-top:12px;background:rgba(109,40,217,0.3);border:1px solid rgba(167,139,250,0.3);color:#a78bfa;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:13px;">↻ Retry</button>
          </div>`;
      } else {
        container.innerHTML = `
          <div class="dm-empty-state">
            <div class="dm-empty-icon">💬</div>
            <div class="dm-empty-title">No contacts yet</div>
            <div class="dm-empty-sub">Follow someone and have them follow you back to unlock chat!</div>
          </div>`;
      }
      return;
    }

    let html = '';
    let total = 0;

    // ── Section: Active Conversations ─────────────────────────────
    if (convs.length) {
      if (newContacts.length) {
        html += `<div class="dm-section-label">💬 Conversations</div>`;
      }
      html += convs.map(c => {
        const other = c.otherUser || {};
        total += (c.unreadCount || 0);
        const online = !other.last_seen;
        const unread = c.unreadCount || 0;
        const initials = (other.username || '?')[0].toUpperCase();
        const avatarHtml = other.profile_pic
          ? `<img src="${other.profile_pic}" class="dm-conv-avatar-img" alt="${escapeHtml(other.username || '')}">`
          : `<div class="dm-conv-avatar-init">${initials}</div>`;
        const lastMsg = c.last_message
          ? escapeHtml(c.last_message).slice(0, 45) + (c.last_message.length > 45 ? '…' : '')
          : '';
        const timeAgo = c.last_message_at ? _dmTimeAgo(c.last_message_at) : '';
        return `
          <div class="dm-contact-card ${unread > 0 ? 'dm-contact-unread' : ''}">
            <div class="dm-contact-left" onclick="chatNowWithUser('${other.id}')">
              <div class="dm-conv-avatar-wrap">
                ${avatarHtml}
                <span class="dm-conv-dot ${online ? 'online' : 'offline'}"></span>
              </div>
              <div class="dm-contact-info">
                <div class="dm-contact-name">
                  ${escapeHtml(other.username || 'User')}
                  ${unread > 0 ? `<span class="dm-conv-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
                </div>
                <div class="dm-contact-preview">
                  ${lastMsg ? lastMsg : '<span style="color:rgba(167,139,250,0.6);font-style:italic;">Tap Chat Now to open</span>'}
                  ${timeAgo ? `<span class="dm-contact-time">${timeAgo}</span>` : ''}
                </div>
              </div>
            </div>
            <button class="dm-chat-now-btn" onclick="chatNowWithUser('${other.id}')">
              💬 Chat Now
            </button>
          </div>`;
      }).join('');

      updateDmBadge(total, true);
      _dmTotalUnread = total;
      updateDmBadge(0, false);
    }

    // ── Section: Mutual Follows — not yet messaged ─────────────────
    if (newContacts.length) {
      html += `<div class="dm-section-label" style="margin-top:${convs.length ? '18px' : '0'}">👥 People you can chat with</div>`;
      html += newContacts.map(u => {
        const online = !u.last_seen;
        const initials = (u.username || '?')[0].toUpperCase();
        const avatarHtml = u.profile_pic
          ? `<img src="${u.profile_pic}" class="dm-conv-avatar-img" alt="${escapeHtml(u.username || '')}">`
          : `<div class="dm-conv-avatar-init">${initials}</div>`;
        return `
          <div class="dm-contact-card dm-contact-new">
            <div class="dm-contact-left" onclick="chatNowWithUser('${u.id}')">
              <div class="dm-conv-avatar-wrap">
                ${avatarHtml}
                <span class="dm-conv-dot ${online ? 'online' : 'offline'}"></span>
              </div>
              <div class="dm-contact-info">
                <div class="dm-contact-name">
                  ${escapeHtml(u.username || 'User')}
                  <span class="dm-mutual-tag">Mutual</span>
                </div>
                <div class="dm-contact-preview" style="color:rgba(167,139,250,0.55);font-style:italic;">
                  You follow each other ✓
                </div>
              </div>
            </div>
            <button class="dm-chat-now-btn dm-chat-now-new" onclick="chatNowWithUser('${u.id}')">
              💬 Chat Now
            </button>
          </div>`;
      }).join('');
    }

    container.innerHTML = html;

  } catch (e) {
    container.innerHTML = `<div style="padding:20px;text-align:center;color:rgba(255,100,100,0.7);font-size:13px;">Failed to load messages</div>`;
    console.error('loadDmConversations error:', e);
  }
}


function _dmTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  const d = Math.floor(h / 24);
  if (d < 7) return d + 'd';
  return Math.floor(d / 7) + 'w';
}

// ── Mini Profile Card ──────────────────────────────────────────────
// currentProfileUserId is declared near the top of the DM state block

// ── Profile clicks always redirect to full profile — popup removed ────────
async function showMiniProfileCard(userId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!userId) return;
  showUserProfile(userId);
}


// Stubs kept for backward compat — popup removed, profile always redirects via showMiniProfileCard
function closeMiniProfileCard() { }
function mpcToggleFollow() { }
function mpcOpenDm() { if (typeof _mpcCurrentUserId !== 'undefined' && _mpcCurrentUserId) openDmDrawer(_mpcCurrentUserId); }

// ── Ghost Mode ─────────────────────────────────────────────────────
function openGhostModal() {
  const modal = document.getElementById('ghostModeModal');
  if (modal) { modal.style.display = 'flex'; }
  document.getElementById('ghostNicknameInput').value = _anonName || '';
}

function closeGhostModal() {
  const modal = document.getElementById('ghostModeModal');
  if (modal) modal.style.display = 'none';
}

function activateGhostMode() {
  const name = document.getElementById('ghostNicknameInput')?.value.trim();
  if (!name || name.length < 2) { showMessage('⚠️ Enter a name (min 2 chars)', 'error'); return; }
  _anonName = name;
  _anonModeActive = true;
  localStorage.setItem('vx_anon_name', name);
  closeGhostModal();
  showMessage(`👻 Ghost mode active as "${name}"`, 'success');
}

function deactivateGhostMode() {
  _anonModeActive = false;
  _anonName = '';
  localStorage.removeItem('vx_anon_name');
  showMessage('👤 Back to normal mode', 'success');
}

// Intercept sendWhatsAppMessage to inject anon_name when ghost mode is on
const _origSendWA = window.sendWhatsAppMessage;
window.sendWhatsAppMessage = async function (...args) {
  if (!_anonModeActive) return _origSendWA ? _origSendWA(...args) : undefined;

  const chatInput = document.getElementById('chatInput');
  const content = chatInput?.value?.trim();
  if (!content) return;

  // Build FormData manually to inject anon_name
  try {
    const fd = new FormData();
    fd.append('content', content);
    fd.append('anon_name', _anonName);
    const replyId = window._replyToMsgId;
    if (replyId) fd.append('reply_to_id', replyId);

    if (chatInput) chatInput.value = '';

    const fakeMsg = {
      id: `local_${Date.now()}`,
      sender_id: currentUser?.id,
      content,
      anon_name: _anonName,
      college_name: currentUser?.college,
      created_at: new Date().toISOString(),
      users: { id: currentUser?.id, username: _anonName, profile_pic: null }
    };
    if (typeof appendMessageToChat === 'function') appendMessageToChat(fakeMsg, false);

    await apiCall('/api/community/messages', 'POST', fd);
  } catch (e) {
    showMessage('❌ Send failed', 'error');
  }
};

// ── Achievements Renderer ──────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_vibe', icon: '✨', label: 'First Vibe', desc: 'Post your first vibe', req: p => (p.postCount || 0) >= 1 },
  { id: 'social_butterfly', icon: '🦋', label: 'Social Butterfly', desc: '10+ followers', req: p => (p.followersCount || 0) >= 10 },
  { id: 'explorer', icon: '🗺️', label: 'Explorer', desc: 'Join a college community', req: p => !!p.community_joined },
  { id: 'verified', icon: '✅', label: 'Verified', desc: 'Verified student', req: p => (p.badges || []).includes('verified_student') },
  { id: 'vibe_master', icon: '🔥', label: 'Vibe Master', desc: '50+ vibes posted', req: p => (p.postCount || 0) >= 50 },
  { id: 'popular', icon: '⭐', label: 'Popular', desc: '100+ followers', req: p => (p.followersCount || 0) >= 100 },
  { id: 'premium', icon: '👑', label: 'Premium', desc: 'Subscribed member', req: p => !!p.isPremium },
  { id: 'ghost', icon: '👻', label: 'Ghost', desc: 'Used ghost mode', req: () => !!localStorage.getItem('vx_anon_name') },
  { id: 'og', icon: '🎖️', label: 'OG Member', desc: 'Early adopter', req: () => true },
];

function renderAchievements(profile) {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const earned = a.req(profile || currentUser || {});
    return `<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,${earned ? '0.15' : '0.05'});border-radius:12px;padding:16px 8px;text-align:center;opacity:${earned ? '1' : '0.4'};transition:all 0.2s;">
      <div style="font-size:28px;margin-bottom:6px;">${a.icon}</div>
      <div style="font-size:12px;font-weight:600;color:${earned ? '#fff' : 'rgba(255,255,255,0.5)'};">${a.label}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:3px;">${a.desc}</div>
      ${earned ? '<div style="font-size:10px;color:#22c55e;margin-top:4px;">✓ Earned</div>' : ''}
    </div>`;
  }).join('');
}

function renderActivityHeatmap() {
  const container = document.getElementById('activityHeatmap');
  if (!container) return;
  // Generate 26 weeks × 7 days = 182 cells
  const cells = [];
  for (let i = 0; i < 182; i++) {
    const intensity = Math.random();
    const level = intensity < 0.6 ? 0 : intensity < 0.75 ? 1 : intensity < 0.88 ? 2 : intensity < 0.96 ? 3 : 4;
    const colors = ['rgba(255,255,255,0.05)', '#1a3a5c', '#2d6a9f', '#4f96d9', '#7aa3d4'];
    cells.push(`<div style="aspect-ratio:1;border-radius:2px;background:${colors[level]};"></div>`);
  }
  container.innerHTML = cells.join('');
}

// ── Cover Photo Handler ────────────────────────────────────────────
async function handleCoverPhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('profileCoverImg');
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
  showMessage('Cover photo updated locally (backend storage optional)', 'success');
}

// ── Profile tab switcher patch — handle new tabs ───────────────────
const _origSwitchProfileTab = window.switchProfileTab;
window.switchProfileTab = function (tab, event) {
  // Handle new tabs
  if (tab === 'messages') {
    // Deactivate all panes and buttons
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
    const pane = document.getElementById('profileTabMessages');
    if (pane) pane.classList.add('active');
    if (event?.target) event.target.classList.add('active');
    loadDmConversations();
    return;
  }
  if (tab === 'achievements') {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
    const pane = document.getElementById('profileTabAchievements');
    if (pane) pane.classList.add('active');
    if (event?.target) event.target.classList.add('active');
    renderAchievements(currentUser);
    renderActivityHeatmap();
    return;
  }
  // Fall through to original handler
  if (_origSwitchProfileTab) _origSwitchProfileTab(tab, event);
};

// ── Follow Animator (confetti on follower gain) ────────────────────
function handleFollowerUpdate(data) {
  if (!data || !currentUser) return;
  const isOwnProfile = data.followingId === currentUser.id;
  if (!isOwnProfile) return;

  // Use real count from server if available
  const newCount = data.newFollowersCount !== undefined
    ? data.newFollowersCount
    : (currentUser.followersCount || 0) + 1;

  if (currentUser) currentUser.followersCount = newCount;

  // Update profile stat if we're viewing our own profile
  const countEl = document.getElementById('profileStatFollowers');
  if (countEl && window.currentProfileUser && window.currentProfileUser.id === currentUser.id) {
    countEl.textContent = newCount;
    countEl.style.transition = 'transform 0.3s ease, color 0.3s ease';
    countEl.style.transform = 'scale(1.4)';
    countEl.style.color = '#4f74a3';
    setTimeout(() => { countEl.style.transform = 'scale(1)'; countEl.style.color = '#fff'; }, 400);
    triggerConfetti();
  }

  // Show a notification toast
  if (data.followerUsername) {
    showMessage(`🎉 @${data.followerUsername} started following you!`, 'success', 4000);
  }
}

function handleLostFollow(data) {
  if (!data || !currentUser) return;
  if (data.followingId !== currentUser.id) return;

  const newCount = data.newFollowersCount !== undefined
    ? data.newFollowersCount
    : Math.max(0, (currentUser.followersCount || 0) - 1);

  if (currentUser) currentUser.followersCount = newCount;
  const countEl = document.getElementById('profileStatFollowers');
  if (countEl && window.currentProfileUser && window.currentProfileUser.id === currentUser.id) {
    countEl.textContent = newCount;
  }
}

function triggerConfetti() {
  const colors = ['#4f74a3', '#7aa3d4', '#a78bfa', '#22c55e', '#fff'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;z-index:99999;width:7px;height:7px;border-radius:50%;background:${colors[i % colors.length]};pointer-events:none;top:${30 + Math.random() * 40}%;left:${30 + Math.random() * 40}%;animation:confettiPiece 1s ease forwards;`;
    document.body.appendChild(el);
    el.style.setProperty('--tx', (Math.random() * 200 - 100) + 'px');
    el.style.setProperty('--ty', (Math.random() * -200 - 50) + 'px');
    setTimeout(() => el.remove(), 1200);
  }
}
// Inject confetti keyframes
if (!document.getElementById('confettiStyle')) {
  const s = document.createElement('style');
  s.id = 'confettiStyle';
  s.textContent = `@keyframes confettiPiece{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}`;
  document.head.appendChild(s);
}

// ── Presence & DM socket wiring ────────────────────────────────────
// Wait for socket to be ready then hook events
function wireNewSocketEvents() {
  const sock = window.socket;
  if (!sock) return;

  sock.on('new_dm', (msg) => handleIncomingDm(msg));

  // Blue ticks: mark all visible sent messages as read when other person opens the chat
  sock.on('dm_read', ({ readBy, conversationWith }) => {
    if (_dmCurrentReceiverId === readBy || _dmCurrentReceiverId === conversationWith) {
      const area = document.getElementById('dmMessagesArea');
      if (!area) return;
      area.querySelectorAll('.dm-tick-sent').forEach(tick => {
        tick.classList.remove('dm-tick-sent');
        tick.classList.add('dm-tick-read');
        tick.title = 'Seen';
      });
    }
  });

  // Live reaction updates from the other person
  sock.on('dm_reaction', ({ messageId, reactions }) => {
    const row = document.getElementById('dm-msg-' + messageId);
    if (!row) return;
    let reactDiv = row.querySelector('.dm-reactions');
    if (Object.keys(reactions || {}).length === 0) {
      if (reactDiv) reactDiv.remove();
      return;
    }
    if (!reactDiv) {
      reactDiv = document.createElement('div');
      reactDiv.className = 'dm-reactions';
      row.appendChild(reactDiv);
    }
    reactDiv.innerHTML = Object.entries(reactions).map(([e, users]) => {
      const mine = users.includes(currentUser?.id);
      return `<button class="dm-react-chip ${mine ? 'dm-react-mine' : ''}" onclick="dmToggleReact('${messageId}','${e}')">${e}<span>${users.length}</span></button>`;
    }).join('');
  });

  sock.on('dm_typing', ({ senderId }) => {
    if (senderId === _dmCurrentReceiverId) {
      const el = document.getElementById('dmTypingIndicator');
      if (el) { el.classList.add('dm-typing-active'); el.style.height = '22px'; }
      clearTimeout(window._dmTypingHideTimeout);
      window._dmTypingHideTimeout = setTimeout(() => {
        if (el) { el.classList.remove('dm-typing-active'); el.style.height = '0'; }
      }, 3000);
    }
  });

  sock.on('dm_stop_typing', ({ senderId }) => {
    if (senderId === _dmCurrentReceiverId) {
      const el = document.getElementById('dmTypingIndicator');
      if (el) { el.classList.remove('dm-typing-active'); el.style.height = '0'; }
    }
  });

  sock.on('user_offline', ({ userId }) => {
    if (userId === _dmCurrentReceiverId) {
      const status = document.getElementById('dmDrawerStatus');
      if (status) {
        const sp = status.querySelector('span:last-child');
        if (sp) sp.textContent = 'Offline'; else status.textContent = '● Offline';
        status.style.color = '#a78bfa';
        const ring = document.getElementById('dmOnlineRing');
        if (ring) ring.style.background = '#a78bfa';
      }
    }
    // Invalidate cache so presence updates next load
    if (_mpcCache[userId]) _mpcCache[userId].last_seen = new Date().toISOString();
  });

  sock.on('user_online_broadcast', ({ userId }) => {
    if (userId === _dmCurrentReceiverId) {
      const status = document.getElementById('dmDrawerStatus');
      if (status) {
        const sp = status.querySelector('span:last-child');
        if (sp) sp.textContent = 'Online'; else status.textContent = '● Online';
        status.style.color = '#22c55e';
        const ring = document.getElementById('dmOnlineRing');
        if (ring) ring.style.background = '#22c55e';
      }
    }
    if (_mpcCache[userId]) _mpcCache[userId].last_seen = null;
  });

  // Follower update — if someone follows current user
  sock.on('new_follow', (data) => handleFollowerUpdate(data));
  sock.on('lost_follow', (data) => handleLostFollow(data));
}

// Hook into socket once it's available (retries up to 10s)
(function pollSocket() {
  if (window.socket) { wireNewSocketEvents(); return; }
  let attempts = 0;
  const t = setInterval(() => {
    if (window.socket || ++attempts > 40) {
      clearInterval(t);
      if (window.socket) wireNewSocketEvents();
    }
  }, 250);
})();

// ── Patch showPage to load DM conversations when profile is shown ──
(function () {
  const _prev = window.showPage;
  window.showPage = function (pageId, ...args) {
    if (_prev) _prev(pageId, ...args);
    if (pageId === 'profile' && currentUser) {
      // Prefetch DM convs in background
      setTimeout(loadDmConversations, 300);
    }
  };
})();

// ── Ghost mode toggle button wiring ───────────────────────────────
// Add a ghost button to community chat toolbar if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
  const chatActions = document.querySelector('.chat-actions, .chat-toolbar, #chatToolbar');
  if (chatActions && !document.getElementById('ghostToggleBtn')) {
    const btn = document.createElement('button');
    btn.id = 'ghostToggleBtn';
    btn.title = 'Ghost Mode';
    btn.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;padding:6px;';
    btn.textContent = '👻';
    btn.onclick = () => _anonModeActive ? deactivateGhostMode() : openGhostModal();
    chatActions.appendChild(btn);
  }
});

// ════════════════════════════════════════════════════════════════
// EXECUTIVE CHAT — COMPLETE IMPLEMENTATION
// Gold-themed, full-featured WhatsApp-style group chat
// Real identity: real name + avatar (no ghost names)
// ════════════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────────────────────
let execMessages = [];
let execActiveChat = 'executive'; // 'ghost' | 'executive'
let execTypingUsers = new Set();
let execTypingEmitTimeout = null;
let execMediaRecorder = null;
let execAudioChunks = [];
let execRecording = false;
let execRecordTimer = null;
let execRecordSeconds = 0;
let execReplyTo = null;        // {id, content, senderName}
let execEditingId = null;
let execIsLoading = false;
let execReadObserver = null;
let execUnreadCount = 0;
let execLastDateLabel = '';
let _execSocketListenersRegistered = false;

// ── Helpers ───────────────────────────────────────────────────────────
function execFormatTime(dateStr) {
  const d = new Date(dateStr);
  let h = d.getHours(), m = d.getMinutes(), ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function execDateLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function execFormatDuration(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function execReplyPreviewText(msg) {
  if (!msg) return '';
  if (msg.message_type === 'voice') return '🎤 Voice message';
  if (msg.message_type === 'poll') return '📊 Poll';
  if (msg.media_type === 'image') return '📷 Photo';
  if (msg.media_type === 'video') return '🎥 Video';
  if (msg.media_type === 'audio') return '🎵 Audio';
  if (msg.media_type === 'document' || msg.media_type === 'pdf') return '📎 File';
  return (msg.content || '').slice(0, 60);
}

// ── Panel switching ───────────────────────────────────────────────────
function openExecutiveChat() {
  const panel = document.getElementById('executiveChatPanel');
  if (!panel) {
    // Communities page not loaded yet — navigate there first
    if (typeof showPage === 'function') showPage('communities');
    setTimeout(() => openExecutiveChat(), 500);
    return;
  }

  // Inject full HTML on first open
  if (!panel.querySelector('.exec-header')) {
    panel.innerHTML = execGetPanelHTML();
    panel.style.flexDirection = 'column';
  }

  execActiveChat = 'executive';

  // Update sidebar highlight
  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
  document.getElementById('execSidebarItem')?.classList.add('active');

  // Switch panels
  const ghostPanel = document.getElementById('ghostChatPanel');
  if (ghostPanel) ghostPanel.style.display = 'none';
  panel.style.display = 'flex';

  // Clear unread badge
  const badge = document.getElementById('execUnreadBadge');
  if (badge) badge.style.display = 'none';
  execUnreadCount = 0;

  // Join socket room + register listeners
  if (typeof socket !== 'undefined' && socket && currentUser?.college) {
    socket.emit('join_executive', currentUser.college);
  }
  execRegisterSocketListeners();
  execLoadMessages();
}

function openCommunityChat() {
  execActiveChat = 'ghost';

  document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
  const ghostItem = document.getElementById('ghostChatItem');
  if (ghostItem) ghostItem.classList.add('active');

  const ghostPanel = document.getElementById('ghostChatPanel');
  const execPanel = document.getElementById('executiveChatPanel');
  if (ghostPanel) ghostPanel.style.display = 'flex';
  if (execPanel) execPanel.style.display = 'none';

  // ── Scroll to correct position every time ghost chat is opened ────
  // Must run AFTER display:flex so offsetTop / scrollHeight are valid.
  requestAnimationFrame(() => {
    const el = document.getElementById('whatsappMessages');
    if (!el) return;

    // Find unread divider if present
    const unreadDivider = el.querySelector('.unread-divider');
    if (unreadDivider) {
      // Show divider near top of visible area
      el.scrollTop = Math.max(0, unreadDivider.offsetTop - 60);
    } else {
      // No unreads — jump to very bottom
      el.scrollTop = el.scrollHeight;
    }

    // Retry once after images may have loaded and inflated scrollHeight
    setTimeout(() => {
      const unread = el.querySelector('.unread-divider');
      if (unread) {
        el.scrollTop = Math.max(0, unread.offsetTop - 60);
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }, 300);
  });
}

// ── Socket listeners (registered once) ───────────────────────────────
function execRegisterSocketListeners() {
  if (_execSocketListenersRegistered || typeof socket === 'undefined' || !socket) return;
  _execSocketListenersRegistered = true;

  socket.on('exec_new_message', (msg) => {
    const visible = execActiveChat === 'executive' &&
      document.getElementById('executiveChatPanel')?.style.display !== 'none';
    if (visible) {
      execAppendMessage(msg, false);
      execMarkVisibleAsRead();
    } else {
      execUnreadCount++;
      const badge = document.getElementById('execUnreadBadge');
      if (badge) { badge.textContent = execUnreadCount; badge.style.display = 'flex'; }
    }
    if (typeof playMessageSound === 'function') playMessageSound('receive');
  });

  socket.on('exec_message_edited', ({ id, content }) => {
    const el = document.getElementById(`exec-msg-${id}`);
    if (!el) return;
    const textEl = el.querySelector('.exec-msg-text');
    if (textEl) textEl.textContent = content;
    if (!el.querySelector('.exec-edited-label')) {
      const meta = el.querySelector('.exec-msg-meta');
      if (meta) meta.insertAdjacentHTML('afterbegin', '<span class="exec-edited-label">edited</span>');
    }
  });

  socket.on('exec_message_deleted', ({ id }) => {
    const el = document.getElementById(`exec-msg-${id}`);
    if (!el) return;
    const bubble = el.querySelector('.exec-bubble');
    if (bubble) bubble.innerHTML = '<em class="exec-deleted-text">🚫 This message was deleted</em>';
    el.querySelector('.exec-msg-actions-btn')?.remove();
  });

  socket.on('exec_reaction_update', ({ message_id, reactions }) => {
    const el = document.getElementById(`exec-msg-${message_id}`);
    if (!el) return;
    const rxBar = el.querySelector('.exec-reactions-bar');
    if (rxBar) rxBar.innerHTML = execBuildReactionsHTML(message_id, reactions);
  });

  socket.on('exec_messages_seen', ({ messageIds, readerName }) => {
    (messageIds || []).forEach(mid => {
      const el = document.getElementById(`exec-msg-${mid}`);
      if (!el) return;
      // Update seen-names span
      const namesEl = el.querySelector('.exec-seen-names');
      if (namesEl) {
        namesEl.classList.remove('exec-seen-pending');
        const cur = parseInt(namesEl.dataset.count || '0') + 1;
        namesEl.dataset.count = cur;
        // Append new reader name if we have it
        if (readerName) {
          const existing = namesEl.textContent.replace('👁', '').trim();
          const names = existing && existing !== 'Delivered' ? existing.split(', ') : [];
          names.push(readerName);
          const visible = names.slice(0, 3);
          const more = names.length - 3;
          namesEl.textContent = '👁' + visible.join(', ') + (more > 0 ? ` +${more}` : '');
        } else {
          namesEl.textContent = `👁 ${cur}`;
        }
      }
    });
  });

  socket.on('exec_user_typing', ({ username }) => execShowTyping(username));
  socket.on('exec_user_stop_typing', ({ username }) => execHideTyping(username));

  socket.on('exec_poll_voted', ({ messageId, votes }) => {
    const el = document.getElementById(`exec-msg-${messageId}`);
    if (!el) return;
    const pollEl = el.querySelector('.exec-poll-body');
    if (pollEl) {
      const msgData = execMessages.find(m => m.id === messageId);
      if (msgData?.poll) {
        msgData.poll.executive_poll_votes = votes;
        pollEl.innerHTML = execBuildPollResultsHTML(msgData.poll);
      }
    }
  });
}

// ── Load messages from API ────────────────────────────────────────────
async function execLoadMessages() {
  if (execIsLoading) return;
  execIsLoading = true;

  const container = document.getElementById('execMessages');
  if (!container) { execIsLoading = false; return; }

  try {
    const data = await apiCall('/api/executive/messages', 'GET');
    if (!data?.success) { execIsLoading = false; return; }

    execMessages = data.messages || [];
    container.innerHTML = '';
    execLastDateLabel = '';

    if (execMessages.length === 0) {
      container.innerHTML = `
        <div class="exec-empty-state">
          <div style="font-size:64px;margin-bottom:16px;">🎓</div>
          <h3>Welcome to ${escapeHtml(currentUser?.college || 'Your College')} Executive!</h3>
          <p>Be the first to start the conversation</p>
        </div>`;
    } else {
      const lastSeenExec = localStorage.getItem('exec_lastSeen_' + (currentUser?.college || '')) || 0;
      let firstUnreadMsgId = null;

      execMessages.forEach(msg => {
        execAppendMessage(msg, true);
        // Track first unread message from someone else
        if (!firstUnreadMsgId && (msg.sender_id || msg.users?.id) !== currentUser?.id) {
          const msgTime = new Date(msg.created_at || 0).getTime();
          if (msgTime > Number(lastSeenExec)) {
            firstUnreadMsgId = msg.id;
          }
        }
      });

      // Update last seen AFTER we've identified unread messages
      localStorage.setItem('exec_lastSeen_' + (currentUser?.college || ''), Date.now());

      setTimeout(() => {
        if (firstUnreadMsgId) {
          const firstUnreadEl = document.getElementById('exec-msg-' + firstUnreadMsgId);
          if (firstUnreadEl) {
            // Insert unread divider just before the first unread message
            const divider = document.createElement('div');
            divider.className = 'exec-unread-divider';
            divider.innerHTML = '<span>↑ Unread messages</span>';
            firstUnreadEl.parentNode.insertBefore(divider, firstUnreadEl);
            divider.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            // Fallback
            const msgs = container.querySelectorAll('[id^="exec-msg-"]');
            if (msgs.length) msgs[msgs.length - 1].scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          // No unread — go to bottom
          const msgs = container.querySelectorAll('[id^="exec-msg-"]');
          if (msgs.length) msgs[msgs.length - 1].scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    setTimeout(() => execMarkVisibleAsRead(), 500);
    execSetupReadObserver();
  } catch (err) {
    console.error('❌ execLoadMessages error:', err);
  } finally {
    execIsLoading = false;
  }
}

// ── Date separator ────────────────────────────────────────────────────
function execInsertDateSeparatorIfNeeded(container, dateStr) {
  const label = execDateLabel(dateStr);
  if (label !== execLastDateLabel) {
    execLastDateLabel = label;
    const sep = document.createElement('div');
    sep.className = 'exec-date-separator';
    sep.innerHTML = `<span>${label}</span>`;
    container.appendChild(sep);
  }
}

// ── Render a single message ───────────────────────────────────────────
function execAppendMessage(msg, isInitial = false) {
  const container = document.getElementById('execMessages');
  if (!container) return;
  if (document.getElementById(`exec-msg-${msg.id}`)) return; // duplicate guard

  const isOwn = msg.sender_id === currentUser?.id || msg.users?.id === currentUser?.id;
  const sender = msg.users?.username || 'User';
  const avatar = msg.users?.profile_pic;
  const timeStr = execFormatTime(msg.created_at);
  const readCount = (msg.read_by || []).length;

  execInsertDateSeparatorIfNeeded(container, msg.created_at);

  const wrapper = document.createElement('div');
  wrapper.className = `exec-message-wrapper ${isOwn ? 'exec-own' : 'exec-other'}`;
  wrapper.id = `exec-msg-${msg.id}`;
  wrapper.dataset.msgId = msg.id;
  wrapper.dataset.senderId = msg.sender_id || msg.users?.id || '';
  wrapper.dataset.createdAt = msg.created_at;

  // Avatar
  let avatarHTML = '';
  if (!isOwn) {
    const profileSenderId = msg.sender_id || msg.users?.id || '';
    avatarHTML = `<div class="exec-avatar-wrap" onclick="if('${escapeHtml(profileSenderId)}')showUserProfile('${escapeHtml(profileSenderId)}')" style="cursor:pointer" title="View profile">` +
      (avatar ? `<img class="exec-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(sender)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : '') +
      `<div class="exec-avatar-fallback" style="${avatar ? 'display:none' : ''}">${escapeHtml(sender.charAt(0).toUpperCase())}</div>` +
      `</div>`;
  }

  // Reply quote
  let replyHTML = '';
  if (msg.reply_to) {
    replyHTML = `<div class="exec-reply-quote" onclick="execScrollToMessage('${msg.reply_to.id}')">
      <span class="exec-reply-sender">${escapeHtml(msg.reply_to.sender_username || 'User')}</span>
      <span class="exec-reply-preview">${execReplyPreviewText(msg.reply_to)}</span>
    </div>`;
  }

  // Media
  let mediaHTML = '';
  if (!msg.is_deleted && msg.media_url) {
    if (msg.message_type === 'voice') {
      mediaHTML = `<div class="exec-voice-msg">
        <button class="exec-voice-play" onclick="execPlayVoice(this,'${msg.media_url}')">▶</button>
        <div class="exec-voice-waveform"><div class="exec-voice-bar"></div></div>
        <span class="exec-voice-duration">${execFormatDuration(msg.media_duration || 0)}</span>
      </div>`;
    } else if (msg.media_type === 'video') {
      mediaHTML = `<video class="exec-media-img" src="${proxyMediaUrl(msg.media_url)}" controls playsinline></video>`;
    } else if (msg.media_type === 'audio') {
      mediaHTML = `<audio controls src="${proxyMediaUrl(msg.media_url)}" style="width:100%;margin:4px 0;"></audio>`;
    } else if (msg.media_type === 'pdf' || msg.media_type === 'document') {
      mediaHTML = `<a class="exec-doc-link" href="${msg.media_url}" target="_blank" rel="noopener">📎 ${escapeHtml(msg.media_name || 'Document')}</a>`;
    } else {
      mediaHTML = `<img class="exec-media-img" src="${proxyMediaUrl(msg.media_url)}" alt="media" onclick="openImageViewer && openImageViewer(this.src)" loading="lazy">`;
    }
  }

  // Poll
  let pollHTML = '';
  if (msg.message_type === 'poll' && msg.poll) {
    pollHTML = `<div class="exec-poll-wrap">
      <div class="exec-poll-question">${escapeHtml(msg.poll.question)}</div>
      <div class="exec-poll-body">${execBuildPollResultsHTML(msg.poll)}</div>
    </div>`;
  }

  // React button is now inside 3-dots menu (execShowMessageMenu)
  // Existing reactions bar is shown below bubble for both own and other
  const existingReactions = (msg.reactions || []);
  const reactBtnHTML = '';
  const reactionsHTML = existingReactions.length > 0
    ? `<div class="exec-reactions-bar">${execBuildReactionsHTML(msg.id, existingReactions)}</div>`
    : '';

  // Text
  const textContent = msg.is_deleted
    ? '<em class="exec-deleted-text">🚫 This message was deleted</em>'
    : escapeHtml(msg.content || '');

  // Seen-by (own messages only) — show names inline, click for full popup
  const readers = msg.read_by || [];
  const readerNames = readers.slice(0, 3).map(r => r.username || 'User');
  const moreCount = Math.max(0, readers.length - 3);
  const namesStr = readerNames.length > 0
    ? readerNames.join(', ') + (moreCount > 0 ? ` +${moreCount}` : '')
    : '';
  const readReceiptHTML = isOwn ? `
    <div class="exec-read-receipt" onclick="execShowReadersPopup('${msg.id}',event)"
         title="Click to see who read this" data-count="${readCount}">
      <span class="exec-tick ${readCount > 0 ? 'exec-tick-blue' : ''}">✓✓</span>
      ${readCount > 0
      ? `<span class="exec-seen-names" data-count="${readCount}">👁 ${namesStr}</span>`
      : '<span class="exec-seen-names exec-seen-pending">Delivered</span>'}
    </div>` : '';

  // Actions button
  const actionsBtn = !msg.is_deleted
    ? `<button class="exec-msg-actions-btn" onclick="execShowMessageMenu(event,'${msg.id}',${isOwn})">⋮</button>`
    : '';

  wrapper.innerHTML = `
    ${!isOwn ? avatarHTML : ''}
    <div class="exec-msg-col">
      ${!isOwn ? `<div class="exec-sender-name" onclick="if('${escapeHtml(msg.sender_id || msg.users?.id || '')}')showUserProfile('${escapeHtml(msg.sender_id || msg.users?.id || '')}')" style="cursor:pointer" title="View profile">@${escapeHtml(sender)}</div>` : ''}
      <div class="exec-bubble-wrap">
        <div class="exec-bubble ${isOwn ? 'exec-bubble-own' : 'exec-bubble-other'} ${msg.is_deleted ? 'exec-deleted' : ''}">
          ${replyHTML}${mediaHTML}${pollHTML}
          ${textContent ? `<div class="exec-msg-text">${textContent}</div>` : ''}
          <div class="exec-msg-meta">
            ${msg.is_edited ? '<span class="exec-edited-label">edited</span>' : ''}
            <span class="exec-msg-time">${timeStr}</span>
            ${readReceiptHTML}
          </div>
          ${actionsBtn}
        </div>
        ${reactBtnHTML}
      </div>
      ${reactionsHTML}
    </div>
    ${isOwn ? avatarHTML : ''}`;

  // Right-click: show message menu
  wrapper.addEventListener('contextmenu', e => { e.preventDefault(); execShowMessageMenu(e, msg.id, isOwn); });
  container.appendChild(wrapper);

  if (!isInitial) {
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
    if (isOwn || atBottom) setTimeout(() => wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
  }
}

// ── Poll helpers ──────────────────────────────────────────────────────
function execBuildPollResultsHTML(poll) {
  const votes = poll.executive_poll_votes || [];
  const total = votes.length;
  const myVote = votes.find(v => v.user_id === currentUser?.id)?.option_id;

  return (poll.options || []).map(opt => {
    const count = votes.filter(v => v.option_id === opt.id).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const isMyVote = myVote === opt.id;
    return `<div class="exec-poll-option ${isMyVote ? 'exec-poll-voted' : ''}"
         onclick="execVotePoll('${poll.id}','${opt.id}','${poll.message_id}')">
      <div class="exec-poll-opt-row">
        <span class="exec-poll-opt-text">${escapeHtml(opt.text)}</span>
        <span class="exec-poll-opt-count">${count} vote${count !== 1 ? 's' : ''} · ${pct}%</span>
      </div>
      <div class="exec-poll-bar-bg">
        <div class="exec-poll-bar-fill ${isMyVote ? 'exec-poll-bar-own' : ''}" style="width:${pct}%"></div>
      </div>
    </div>`;
  }).join('') + `<div class="exec-poll-total">${total} total vote${total !== 1 ? 's' : ''}</div>`;
}

async function execVotePoll(pollId, optionId, messageId) {
  try {
    const response = await apiCall(`/api/executive/polls/${pollId}/vote`, 'POST', { option_id: optionId });
    if (!response) return;
    const msg = execMessages.find(m => m.id === messageId);
    if (msg?.poll) msg.poll.executive_poll_votes = response.votes;
    const el = document.getElementById(`exec-msg-${messageId}`);
    const pollBody = el?.querySelector('.exec-poll-body');
    if (pollBody && msg?.poll) pollBody.innerHTML = execBuildPollResultsHTML(msg.poll);
    if (socket && currentUser?.college) {
      socket.emit('exec_poll_voted', { pollId, messageId, votes: response.votes, collegeName: currentUser.college });
    }
  } catch (err) { if (typeof showMessage === 'function') showMessage('Failed to vote', 'error'); }
}

// ── Reactions ─────────────────────────────────────────────────────────
const EXEC_QUICK_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥', '🎉', '👏', '💯', '🙌'];

function execBuildReactionsHTML(messageId, reactions) {
  const counts = {};
  (reactions || []).forEach(r => {
    if (!counts[r.emoji]) counts[r.emoji] = { count: 0, myReacted: false };
    counts[r.emoji].count++;
    if (r.user_id === currentUser?.id) counts[r.emoji].myReacted = true;
  });
  return Object.entries(counts).map(([emoji, data]) =>
    `<button class="exec-reaction-pill ${data.myReacted ? 'exec-reaction-mine' : ''}"
             onclick="execToggleReaction('${messageId}','${emoji}')">${emoji} ${data.count}</button>`
  ).join('');
}

function execShowReactionPicker(event, messageId) {
  document.querySelector('.exec-reaction-picker')?.remove();
  const picker = document.createElement('div');
  picker.className = 'exec-reaction-picker';
  picker.innerHTML = EXEC_QUICK_REACTIONS.map(e =>
    `<button onclick="execToggleReaction('${messageId}','${e}');this.closest('.exec-reaction-picker').remove()">${e}</button>`
  ).join('');
  const x = Math.min(event.clientX, window.innerWidth - 280);
  const y = event.clientY - 60;
  picker.style.cssText = `position:fixed;top:${y}px;left:${x}px;z-index:9999;`;
  document.body.appendChild(picker);
  setTimeout(() => document.addEventListener('click', () => picker.remove(), { once: true }), 100);
}

function execShowReactionPickerById(messageId, event) { execShowReactionPicker(event, messageId); }

async function execToggleReaction(messageId, emoji) {
  try {
    const data = await apiCall('/api/executive/reactions', 'POST', { message_id: messageId, emoji });
    if (!data) return;
    const msg = execMessages.find(m => m.id === messageId);
    if (msg) msg.reactions = data.reactions || [];
    const el = document.getElementById(`exec-msg-${messageId}`);
    if (!el) return;
    let bar = el.querySelector('.exec-reactions-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'exec-reactions-bar';
      el.querySelector('.exec-msg-col')?.appendChild(bar);
    }
    if (data.reactions?.length > 0) {
      bar.innerHTML = execBuildReactionsHTML(messageId, data.reactions);
      bar.style.display = '';
    } else {
      bar.innerHTML = '';
      bar.style.display = 'none';
    }
    if (socket && currentUser?.college) {
      socket.emit('exec_reaction_update', { message_id: messageId, reactions: data.reactions, collegeName: currentUser.college });
    }
  } catch (err) { console.error('Reaction error:', err); }
}

// ── Message action menu ───────────────────────────────────────────────
function execShowMessageMenu(event, messageId, isOwn) {
  event.stopPropagation();
  document.querySelector('.exec-context-menu')?.remove();

  const menu = document.createElement('div');
  menu.className = 'exec-context-menu';
  const items = [
    { label: '↩️ Reply', fn: `execStartReply('${messageId}')` },
    { label: '😊 React', fn: `execShowReactionPickerById('${messageId}',event)` },
  ];
  if (isOwn) {
    items.push(
      { label: '✏️ Edit', fn: `execStartEdit('${messageId}')` },
      { label: '🗑️ Delete', fn: `execDeleteMessage('${messageId}')`, danger: true }
    );
  }
  menu.innerHTML = items.map(i =>
    `<button class="exec-ctx-item ${i.danger ? 'exec-ctx-danger' : ''}"
             onclick="${i.fn};this.closest('.exec-context-menu').remove()">${i.label}</button>`
  ).join('');

  const rect = event.currentTarget.getBoundingClientRect();
  menu.style.cssText = `position:fixed;top:${rect.bottom + 4}px;left:${Math.min(rect.left, window.innerWidth - 180)}px;z-index:9999;`;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 100);
}

// ── Reply ─────────────────────────────────────────────────────────────
function execStartReply(messageId) {
  const msg = execMessages.find(m => m.id === messageId) || { id: messageId, content: '', users: { username: 'User' } };
  execReplyTo = { id: messageId, content: msg.content || '', senderName: msg.users?.username || 'User' };
  const bar = document.getElementById('execReplyBar');
  if (document.getElementById('execReplyBarSender')) document.getElementById('execReplyBarSender').textContent = execReplyTo.senderName;
  if (document.getElementById('execReplyBarText')) document.getElementById('execReplyBarText').textContent = execReplyTo.content.slice(0, 80) || '📎 Media';
  if (bar) bar.style.display = 'flex';
  document.getElementById('execInput')?.focus();
}

function execCancelReply() {
  execReplyTo = null;
  const bar = document.getElementById('execReplyBar');
  if (bar) bar.style.display = 'none';
}

// ── Edit ──────────────────────────────────────────────────────────────
function execStartEdit(messageId) {
  const msg = execMessages.find(m => m.id === messageId);
  if (!msg) return;
  execEditingId = messageId;
  const input = document.getElementById('execInput');
  if (input) { input.value = msg.content; input.focus(); }
  const bar = document.getElementById('execEditBar');
  if (bar) bar.style.display = 'flex';
  if (document.getElementById('execEditBarText')) document.getElementById('execEditBarText').textContent = 'Editing: ' + msg.content.slice(0, 50);
}

function execCancelEdit() {
  execEditingId = null;
  const bar = document.getElementById('execEditBar');
  if (bar) bar.style.display = 'none';
  const input = document.getElementById('execInput');
  if (input) input.value = '';
}

async function execDeleteMessage(messageId) {
  if (!confirm('Delete this message?')) return;
  try {
    await apiCall(`/api/executive/messages/${messageId}`, 'DELETE');
    const el = document.getElementById(`exec-msg-${messageId}`);
    if (el) {
      const bubble = el.querySelector('.exec-bubble');
      if (bubble) bubble.innerHTML = '<em class="exec-deleted-text">🚫 This message was deleted</em>';
      el.querySelector('.exec-msg-actions-btn')?.remove();
    }
    const msg = execMessages.find(m => m.id === messageId);
    if (msg) msg.is_deleted = true;
  } catch (err) { if (typeof showMessage === 'function') showMessage('Failed to delete message', 'error'); }
}

// ── Send message ──────────────────────────────────────────────────────
async function execSendMessage() {
  const input = document.getElementById('execInput');
  const content = input?.value?.trim();

  // Edit mode
  if (execEditingId) {
    if (!content) return;
    try {
      await apiCall(`/api/executive/messages/${execEditingId}`, 'PATCH', { content });
      const el = document.getElementById(`exec-msg-${execEditingId}`);
      if (el) {
        const textEl = el.querySelector('.exec-msg-text');
        if (textEl) textEl.textContent = content;
        if (!el.querySelector('.exec-edited-label')) {
          el.querySelector('.exec-msg-meta')?.insertAdjacentHTML('afterbegin', '<span class="exec-edited-label">edited</span>');
        }
      }
      execCancelEdit();
    } catch (err) { if (typeof showMessage === 'function') showMessage('Failed to edit message', 'error'); }
    return;
  }

  const fileInput = document.getElementById('execFileInput');
  const file = fileInput?.files?.[0];
  if (!content && !file) { input?.focus(); return; }

  if (input) { input.value = ''; input.style.height = 'auto'; }

  // Optimistic message
  const tempId = `temp-${Date.now()}`;
  const tempMsg = {
    id: tempId, sender_id: currentUser?.id, content: content || '',
    message_type: 'text', created_at: new Date().toISOString(),
    is_deleted: false, is_edited: false,
    users: { id: currentUser?.id, username: currentUser?.username, profile_pic: currentUser?.profile_pic },
    reactions: [], read_by: [],
    reply_to: execReplyTo ? { ...execReplyTo, sender_username: execReplyTo.senderName } : null,
    isTemp: true
  };
  execMessages.push(tempMsg);
  execAppendMessage(tempMsg, false);

  const replyId = execReplyTo?.id;
  execCancelReply();
  execClearFilePreview();

  try {
    let response;
    if (file) {
      const fd = new FormData();
      if (content) fd.append('content', content);
      fd.append('media', file);
      if (replyId) fd.append('reply_to_id', replyId);
      response = await apiCall('/api/executive/messages', 'POST', fd);
    } else {
      response = await apiCall('/api/executive/messages', 'POST', { content, reply_to_id: replyId || undefined });
    }

    if (!response?.message) throw new Error('No message returned');

    // Swap temp → real
    document.getElementById(`exec-msg-${tempId}`)?.remove();
    const idx = execMessages.findIndex(m => m.id === tempId);
    if (idx >= 0) execMessages.splice(idx, 1);
    execMessages.push(response.message);
    execAppendMessage(response.message, false);

    if (fileInput) fileInput.value = '';
    execSendStopTyping();
  } catch (err) {
    console.error('Exec send error:', err);
    const tempEl = document.getElementById(`exec-msg-${tempId}`);
    if (tempEl) {
      tempEl.querySelector('.exec-bubble')?.classList.add('exec-send-failed');
      tempEl.querySelector('.exec-msg-meta')?.insertAdjacentHTML('afterbegin', '<span style="color:#ff6b6b;font-size:11px;">⚠ Failed</span>');
    }
    if (typeof showMessage === 'function') showMessage('Failed to send', 'error');
  }
}

// ── File preview ──────────────────────────────────────────────────────
function execHandleFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const previewBar = document.getElementById('execFilePreviewBar');
  const previewImg = document.getElementById('execFilePreviewImg');
  const previewVid = document.getElementById('execFilePreviewVid');
  const previewName = document.getElementById('execFilePreviewName');
  if (previewBar) previewBar.style.display = 'flex';
  if (previewName) previewName.textContent = file.name;
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    if (previewImg) { previewImg.src = url; previewImg.style.display = 'block'; }
    if (previewVid) previewVid.style.display = 'none';
  } else if (file.type.startsWith('video/')) {
    const url = URL.createObjectURL(file);
    if (previewVid) { previewVid.src = url; previewVid.style.display = 'block'; }
    if (previewImg) previewImg.style.display = 'none';
  } else {
    if (previewImg) previewImg.style.display = 'none';
    if (previewVid) previewVid.style.display = 'none';
  }
}

function execClearFilePreview() {
  const bar = document.getElementById('execFilePreviewBar');
  if (bar) bar.style.display = 'none';
  const fi = document.getElementById('execFileInput');
  if (fi) fi.value = '';
}

// ── Voice recording ───────────────────────────────────────────────────
async function execStartVoiceRecord() {
  if (execRecording) { execStopVoiceRecord(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    execAudioChunks = [];

    // Pick a MIME type the browser and server both accept
    const preferredMimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
    const supportedMime = preferredMimes.find(m => MediaRecorder.isTypeSupported(m)) || '';
    execMediaRecorder = supportedMime
      ? new MediaRecorder(stream, { mimeType: supportedMime })
      : new MediaRecorder(stream);

    execMediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) execAudioChunks.push(e.data); };
    execMediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      if (execAudioChunks.length === 0) {
        if (typeof showMessage === 'function') showMessage('No audio captured — try again', 'error');
        return;
      }
      const mimeType = execMediaRecorder.mimeType || supportedMime || 'audio/webm';
      const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(execAudioChunks, { type: mimeType });
      await execSendVoiceMessage(blob, execRecordSeconds, ext);
    };
    execMediaRecorder.onerror = (e) => {
      console.error('MediaRecorder error:', e.error);
      if (typeof showMessage === 'function') showMessage('Recording error: ' + (e.error?.message || 'unknown'), 'error');
      execRecording = false;
      stream.getTracks().forEach(t => t.stop());
    };

    execMediaRecorder.start(250);   // collect chunks every 250ms
    execRecording = true;
    execRecordSeconds = 0;

    const btn = document.getElementById('execVoiceBtn');
    const timer = document.getElementById('execRecordTimer');
    if (btn) { btn.textContent = '⏹'; btn.classList.add('exec-recording-active'); }
    if (timer) timer.style.display = 'flex';

    execRecordTimer = setInterval(() => {
      execRecordSeconds++;
      const timerEl = document.getElementById('execRecordTimerText');
      if (timerEl) timerEl.textContent = execFormatDuration(execRecordSeconds);
      if (execRecordSeconds >= 120) execStopVoiceRecord();
    }, 1000);
  } catch (err) {
    console.error('execStartVoiceRecord error:', err);
    const msg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
      ? 'Microphone access denied — please allow mic in browser settings'
      : err.name === 'NotFoundError'
        ? 'No microphone found on this device'
        : 'Could not start recording: ' + (err.message || err.name);
    if (typeof showMessage === 'function') showMessage(msg, 'error');
  }
}

function execStopVoiceRecord() {
  if (!execRecording || !execMediaRecorder) return;
  clearInterval(execRecordTimer);
  execMediaRecorder.stop();
  execRecording = false;
  const btn = document.getElementById('execVoiceBtn');
  const timer = document.getElementById('execRecordTimer');
  if (btn) { btn.textContent = '🎤'; btn.classList.remove('exec-recording-active'); }
  if (timer) timer.style.display = 'none';
}

async function execSendVoiceMessage(blob, duration, ext = 'webm') {
  try {
    if (!blob || blob.size === 0) {
      if (typeof showMessage === 'function') showMessage('Recording is empty — try again', 'error');
      return;
    }
    const fd = new FormData();
    fd.append('media', blob, `voice_${Date.now()}.${ext}`);
    fd.append('is_voice', 'true');
    fd.append('content', '');
    fd.append('media_duration', String(duration || 0));

    // Show optimistic sending indicator
    if (typeof showMessage === 'function') showMessage('🎤 Sending voice message…', 'info', 2000);

    const response = await apiCall('/api/executive/messages', 'POST', fd);
    if (response?.message) {
      execMessages.push(response.message);
      execAppendMessage(response.message, false);
      if (typeof showMessage === 'function') showMessage('🎤 Voice message sent', 'success', 1500);
    } else if (response) {
      console.warn('Unexpected voice response:', response);
    }
  } catch (err) {
    console.error('execSendVoiceMessage error:', err);
    const msg = err.status === 413 ? 'Voice message too large (max ~50MB)'
      : err.status === 400 ? 'Upload rejected: ' + (err.message || 'invalid file')
        : 'Failed to send voice message — check your connection';
    if (typeof showMessage === 'function') showMessage(msg, 'error');
  }
}

// ── Voice playback ────────────────────────────────────────────────────
const execAudioPlayers = new Map();

function execPlayVoice(btn, url) {
  const id = url;
  let audio = execAudioPlayers.get(id);
  if (!audio) {
    audio = new Audio(proxyMediaUrl(url));
    execAudioPlayers.set(id, audio);
    audio.onended = () => { btn.textContent = '▶'; };
  }
  if (audio.paused) { audio.play(); btn.textContent = '⏸'; }
  else { audio.pause(); btn.textContent = '▶'; }
}

// ── Poll creation modal ───────────────────────────────────────────────
function execOpenPollCreator() {
  const modal = document.getElementById('execPollModal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('execPollQuestion')?.focus();
}

function execClosePollModal() {
  const modal = document.getElementById('execPollModal');
  if (modal) modal.style.display = 'none';
  const q = document.getElementById('execPollQuestion');
  if (q) q.value = '';
  document.querySelectorAll('.exec-poll-opt-input').forEach((el, i) => {
    if (i < 2) el.value = ''; else el.remove();
  });
}

function execAddPollOption() {
  const container = document.getElementById('execPollOptions');
  if (!container) return;
  const count = container.querySelectorAll('.exec-poll-opt-input').length;
  if (count >= 8) { if (typeof showMessage === 'function') showMessage('Max 8 options', 'info'); return; }
  const inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'exec-poll-opt-input exec-input-field';
  inp.placeholder = `Option ${count + 1}`; inp.maxLength = 80;
  container.appendChild(inp);
}

async function execSendPoll() {
  const question = document.getElementById('execPollQuestion')?.value?.trim();
  if (!question) { if (typeof showMessage === 'function') showMessage('Enter a question', 'error'); return; }
  const options = [];
  document.querySelectorAll('.exec-poll-opt-input').forEach((el, i) => {
    const t = el.value.trim();
    if (t) options.push({ id: `opt_${i + 1}`, text: t });
  });
  if (options.length < 2) { if (typeof showMessage === 'function') showMessage('Add at least 2 options', 'error'); return; }
  try {
    const response = await apiCall('/api/executive/messages', 'POST', {
      poll_question: question, poll_options: JSON.stringify(options), content: question
    });
    if (response?.message) { execMessages.push(response.message); execAppendMessage(response.message, false); }
    execClosePollModal();
  } catch (err) { if (typeof showMessage === 'function') showMessage('Failed to create poll', 'error'); }
}

// ── Typing indicator ──────────────────────────────────────────────────
function execHandleTyping() {
  if (typeof socket === 'undefined' || !socket || !currentUser?.college) return;
  socket.emit('exec_typing', { collegeName: currentUser.college, username: currentUser.username, avatar: currentUser.profile_pic });
  clearTimeout(execTypingEmitTimeout);
  execTypingEmitTimeout = setTimeout(() => execSendStopTyping(), 2500);
  const ta = document.getElementById('execInput');
  if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
}

function execSendStopTyping() {
  if (typeof socket !== 'undefined' && socket && currentUser?.college) {
    socket.emit('exec_stop_typing', { collegeName: currentUser.college, username: currentUser.username });
  }
}

function execShowTyping(username) {
  if (username === currentUser?.username) return;
  execTypingUsers.add(username);
  execUpdateTypingDisplay();
}

function execHideTyping(username) {
  execTypingUsers.delete(username);
  execUpdateTypingDisplay();
}

function execUpdateTypingDisplay() {
  const container = document.getElementById('execMessages');
  if (!container) return;
  document.getElementById('exec-typing-indicator')?.remove();
  if (execTypingUsers.size === 0) return;
  const names = Array.from(execTypingUsers);
  const text = names.length === 1 ? `${names[0]} is typing`
    : names.length === 2 ? `${names[0]} and ${names[1]} are typing`
      : `${names.length} people are typing`;
  const el = document.createElement('div');
  el.id = 'exec-typing-indicator'; el.className = 'exec-typing-indicator';
  el.innerHTML = `<span>${text}</span><div class="exec-typing-dots"><span></span><span></span><span></span></div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function execHandleKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); execSendMessage(); }
}

// ── Read receipts ─────────────────────────────────────────────────────
function execSetupReadObserver() {
  if (execReadObserver) execReadObserver.disconnect();
  execReadObserver = new IntersectionObserver((entries) => {
    const visibleIds = entries.filter(e => e.isIntersecting).map(e => e.target.dataset.msgId).filter(Boolean);
    if (!visibleIds.length) return;
    if (socket && currentUser?.college) {
      socket.emit('exec_mark_seen', { collegeName: currentUser.college, userId: currentUser.id, username: currentUser.username, avatar: currentUser.profile_pic, messageIds: visibleIds });
    }
    apiCall('/api/executive/read', 'POST', { message_ids: visibleIds }).catch(() => { });
  }, { threshold: 0.5 });
  document.querySelectorAll('#execMessages [id^="exec-msg-"]').forEach(el => execReadObserver.observe(el));
}

function execMarkVisibleAsRead() {
  const container = document.getElementById('execMessages');
  if (!container) return;
  const visibleIds = [];
  container.querySelectorAll('[id^="exec-msg-"]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) visibleIds.push(el.dataset.msgId);
  });
  if (!visibleIds.length) return;
  apiCall('/api/executive/read', 'POST', { message_ids: visibleIds }).catch(() => { });
  if (socket && currentUser?.college) {
    socket.emit('exec_mark_seen', { collegeName: currentUser.college, userId: currentUser.id, username: currentUser.username, avatar: currentUser.profile_pic, messageIds: visibleIds });
  }
}

// ── Readers popup ─────────────────────────────────────────────────────
async function execShowReadersPopup(messageId, event) {
  event.stopPropagation();
  document.querySelector('.exec-readers-popup')?.remove();
  try {
    const data = await apiCall(`/api/executive/reads/${messageId}`, 'GET');
    const readers = data?.readers || [];
    const popup = document.createElement('div');
    popup.className = 'exec-readers-popup';
    popup.innerHTML = readers.length === 0
      ? '<div class="exec-readers-empty">No one has read this yet</div>'
      : `<div class="exec-readers-header">👁 Seen by ${readers.length}</div>
         <div class="exec-readers-list">
           ${readers.map(r => `<div class="exec-reader-row" onclick="execOpenReaderProfile('${escapeHtml(r.id || '')}', event)" title="View ${escapeHtml(r.username || 'User')}'s profile">
             ${r.profile_pic
          ? `<img src="${escapeHtml(r.profile_pic)}" class="exec-reader-avatar exec-reader-clickable">`
          : `<div class="exec-reader-avatar exec-reader-avatar-fb exec-reader-clickable">${escapeHtml((r.username || 'U').charAt(0).toUpperCase())}</div>`}
             <div>
               <div class="exec-reader-name exec-reader-clickable">@${escapeHtml(r.username || 'User')}</div>
               <div class="exec-reader-time">${execFormatTime(r.read_at)}</div>
             </div>
             <span class="exec-reader-profile-arrow">→</span>
           </div>`).join('')}
         </div>`;
    const rect = event.currentTarget.getBoundingClientRect();
    popup.style.cssText = `position:fixed;bottom:${window.innerHeight - rect.top + 8}px;right:${window.innerWidth - rect.right}px;z-index:9999;`;
    document.body.appendChild(popup);
    setTimeout(() => document.addEventListener('click', () => popup.remove(), { once: true }), 100);
  } catch (err) { console.error('Readers popup error:', err); }
}

// ── Open reader's profile from seen-by popup ──────────────────────────
function execOpenReaderProfile(userId, event) {
  event.stopPropagation();
  // Close the popup first
  document.querySelector('.exec-readers-popup')?.remove();
  // Navigate to their profile
  if (userId && typeof showUserProfile === 'function') {
    showUserProfile(userId);
  }
}

// ── Scroll to reply ───────────────────────────────────────────────────
function execScrollToMessage(messageId) {
  const el = document.getElementById(`exec-msg-${messageId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('exec-highlight');
  setTimeout(() => el.classList.remove('exec-highlight'), 1500);
}

// ── Emoji picker for executive chat ───────────────────────────────────
function execOpenEmojiPicker(event) {
  event.stopPropagation();
  document.querySelector('.exec-emoji-popup')?.remove();

  const EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤',
    '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔',
    '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴',
    '🤤', '😪', '😵', '🫠', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿',
    '👋', '🤚', '🖐️', '✋', '🖖', '🤙', '💪', '🦾', '🖕', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '🤏',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '🤝', '🙏', '✍️', '🤲',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓',
    '🔥', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '⭐', '🌟', '💫', '🌈', '🌸', '🌺', '🌻', '🌹',
    '👑', '💎', '🚀', '💯', '🆗', '💬', '💭', '🗯️', '📢', '📣', '🔔', '🔕', '💤', '💥', '💦', '💨',
    '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',
    '🍕', '🍔', '🍟', '🌮', '🌯', '🍣', '🍜', '🍦', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭',
  ];

  const popup = document.createElement('div');
  popup.className = 'exec-emoji-popup';
  popup.innerHTML = `
    <div class="exec-ep-header">
      <span>Pick an Emoji</span>
      <button onclick="this.closest('.exec-emoji-popup').remove()" class="exec-ep-close">✕</button>
    </div>
    <div class="exec-ep-search">
      <input type="text" placeholder="🔍 Search…" oninput="execEmojiSearch(this.value)" class="exec-ep-input">
    </div>
    <div class="exec-ep-grid" id="execEpGrid">
      ${EMOJIS.map(e => `<button class="exec-ep-btn" onclick="execInsertEmoji('${e}')">${e}</button>`).join('')}
    </div>
  `;
  popup._all = EMOJIS;

  const btn = document.getElementById('execEmojiBtn');
  const rect = btn ? btn.getBoundingClientRect() : { bottom: 200, left: 200 };
  const spaceAbove = rect.top;
  const topPos = spaceAbove > 320 ? (rect.top - 320) : (rect.bottom + 6);

  popup.style.cssText = `position:fixed;bottom:${window.innerHeight - rect.top + 8}px;left:${Math.max(4, rect.left - 60)}px;z-index:10000;`;
  document.body.appendChild(popup);

  setTimeout(() => document.addEventListener('click', function handler(e) {
    if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', handler); }
  }), 100);
}

window.execEmojiSearch = function (query) {
  const grid = document.getElementById('execEpGrid');
  const popup = document.querySelector('.exec-emoji-popup');
  if (!grid || !popup) return;
  const all = popup._all || [];
  const q = query.toLowerCase().trim();
  const filtered = q ? all.filter(e => e.includes(q)) : all;
  grid.innerHTML = filtered.map(e => `<button class="exec-ep-btn" onclick="execInsertEmoji('${e}')">${e}</button>`).join('');
};

window.execInsertEmoji = function (emoji) {
  const ta = document.getElementById('execInput');
  if (!ta) return;
  const s = ta.selectionStart || 0, e = ta.selectionEnd || 0;
  ta.value = ta.value.slice(0, s) + emoji + ta.value.slice(e);
  ta.selectionStart = ta.selectionEnd = s + emoji.length;
  ta.focus();
};

// Keep legacy name working
function execOpenEmojiForExec() { document.getElementById('execEmojiBtn')?.click(); }

// ── Panel HTML (injected on first open) ───────────────────────────────
function execGetPanelHTML() {
  // HTML lives in index.html #vx-tpl-exec-panel
  const college = escapeHtml(currentUser?.college || 'College');
  const _tpl = document.getElementById('vx-tpl-exec-panel');
  if (!_tpl) {
    console.error('[VX] Missing <template id=vx-tpl-exec-panel> in index.html');
    return '';
  }
  return _tpl.innerHTML.replace(/__VX_COLLEGE__/g, college);
}
