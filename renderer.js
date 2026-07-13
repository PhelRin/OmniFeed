// DOM Element References
const appContainer = document.getElementById('app');
const chatMessages = document.getElementById('chat-messages');
const chatViewport = document.getElementById('chat-viewport');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsToggle = document.getElementById('settings-toggle');
const closeSettings = document.getElementById('close-settings');
const saveSettings = document.getElementById('save-settings');
const supportBtn = document.getElementById('support-btn');

// Settings Inputs
const twitchChannelInput = document.getElementById('twitch-channel');
const twitchClientIdInput = document.getElementById('twitch-client-id');
const devTwitchLink = document.getElementById('dev-twitch-link');
const kickChannelInput = document.getElementById('kick-channel');
const kickChatroomIdInput = document.getElementById('kick-chatroom-id');
const resolveKickBtn = document.getElementById('resolve-kick-btn');
const resolveStatus = document.getElementById('resolve-status');
const twitchLoginBtn = document.getElementById('twitch-login-btn');
const twitchAuthStatus = document.getElementById('twitch-auth-status');
const seTokenInput = document.getElementById('se-token');
const seDashboardLink = document.getElementById('se-dashboard-link');

const opacitySlider = document.getElementById('opacity-slider');
const opacityVal = document.getElementById('opacity-val');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeVal = document.getElementById('font-size-val');
const fadeSlider = document.getElementById('fade-slider');
const fadeVal = document.getElementById('fade-val');

const showBadgesCb = document.getElementById('show-badges-cb');
const showIconsCb = document.getElementById('show-icons-cb');
const disableSystemMessagesCb = document.getElementById('disable-system-messages-cb');
const enableSoundsCb = document.getElementById('enable-sounds-cb');
const soundTypeSelect = document.getElementById('sound-type-select');
const testSoundBtn = document.getElementById('test-sound-btn');

const ttsModeSelect = document.getElementById('tts-mode-select');
const ttsTriggerSelect = document.getElementById('tts-trigger-select');
const ttsVolumeSlider = document.getElementById('tts-volume-slider');
const ttsVolumeVal = document.getElementById('tts-volume-val');

const themeSelect = document.getElementById('theme-select');
const viewerCountSelect = document.getElementById('viewer-count-select');
const viewerWidget = document.getElementById('viewer-widget');

// Global State
let config = {};
let twitchWS = null;
let kickWS = null;
let twitchReconnectTimer = null;
let kickReconnectTimer = null;
const MAX_MESSAGE_COUNT = 100;

// SVG Icons Constants
const TWITCH_ICON = `<svg class="platform-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M11.571 4.714h1.715v5.143H11.57zm3.001 0H16.29v5.143h-1.714zm5.143-3h-15.43L2 6.429v13.714h5.143v2.572l2.571-2.572h3.43l6-6V1.714zM18 13.714l-3.428 3.429h-3.858l-2.57 2.571v-2.571H5.143V3.857H18V13.714z"/></svg>`;
const KICK_ICON = `<svg class="platform-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2.2 13h-2.1l-2.7-3.8V16H10V8h2v3.8l2.5-3.8h2.3l-3.3 5 3.3 5z"/></svg>`;
const SE_ICON = `<svg class="platform-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;

const BADGE_SVGS = {
  broadcaster: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style="margin-right:2px; vertical-align:middle;"><path d="M2 19h20v2H2v-2ZM2 5l5 3.5L12 2l5 6.5L22 5v12H2V5Z"/></svg>`,
  moderator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style="margin-right:2px; vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
  vip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style="margin-right:2px; vertical-align:middle;"><path d="M12 2 2 12l10 10 10-10L12 2Z"/></svg>`,
  subscriber: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style="margin-right:2px; vertical-align:middle;"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"/></svg>`
};

// Initialize Application
async function init() {
  // Load Config from Main Process
  config = await window.electronAPI.getConfig();
  
  // Set Window Visual State based on config
  applyConfigVisuals(config);
  updateLockUI(config.isLocked);
  
  // Connect to Chats & WebSockets
  connectTwitch();
  connectKick();
  connectEventSub();
  connectStreamElements();

  // Populate Settings Inputs
  populateSettingsForm();

  // Start viewer count polling
  updateViewerWidgetDisplay();
}

// Populate UI form inputs from config object
function populateSettingsForm() {
  twitchChannelInput.value = config.twitchChannel || '';
  twitchClientIdInput.value = config.twitchClientId || '';
  kickChannelInput.value = config.kickChannel || '';
  kickChatroomIdInput.value = config.kickChatroomId || '';
  
  opacitySlider.value = config.theme.opacity * 100;
  opacityVal.textContent = `${Math.round(config.theme.opacity * 100)}%`;
  
  fontSizeSlider.value = config.theme.fontSize;
  fontSizeVal.textContent = `${config.theme.fontSize}px`;
  
  fadeSlider.value = config.theme.messageFade;
  fadeVal.textContent = config.theme.messageFade === 0 ? 'Never Fades' : `${config.theme.messageFade}s`;
  
  showBadgesCb.checked = config.theme.showBadges;
  showIconsCb.checked = config.theme.showPlatformIcons;
  disableSystemMessagesCb.checked = config.theme.disableSystemMessages || false;
  enableSoundsCb.checked = config.theme.enableSounds || false;
  soundTypeSelect.value = config.theme.soundType || 'chime';
  ttsModeSelect.value = config.theme.ttsMode || 'disabled';
  ttsTriggerSelect.value = config.theme.ttsTrigger || 'all';
  ttsVolumeSlider.value = Math.round((config.theme.ttsVolume !== undefined ? config.theme.ttsVolume : 0.8) * 100);
  ttsVolumeVal.textContent = `${Math.round((config.theme.ttsVolume !== undefined ? config.theme.ttsVolume : 0.8) * 100)}%`;
  themeSelect.value = config.theme.themeName || 'glassmorphism';
  viewerCountSelect.value = config.theme.viewerCountMode || 'combined';

  // Populate Twitch Connection status
  if (config.twitchToken && config.twitchAuthUsername) {
    twitchAuthStatus.textContent = `Connected as ${config.twitchAuthUsername}`;
    twitchAuthStatus.style.color = '#10b981'; // Green
    twitchLoginBtn.textContent = 'Disconnect';
  } else {
    twitchAuthStatus.textContent = 'Not Connected';
    twitchAuthStatus.style.color = '#ef4444'; // Red
    twitchLoginBtn.textContent = 'Connect Twitch';
  }
  
  seTokenInput.value = config.seToken || '';
}

// Apply Styles to DOM/CSS Variables
function applyConfigVisuals(cfg) {
  document.documentElement.style.setProperty('--font-size', `${cfg.theme.fontSize}px`);
  document.documentElement.style.setProperty('--locked-bg-opacity', cfg.theme.opacity);
  
  // Set Theme Class on app container
  appContainer.classList.remove('theme-glassmorphism', 'theme-minimalist', 'theme-retro');
  const activeTheme = cfg.theme.themeName || 'glassmorphism';
  appContainer.classList.add(`theme-${activeTheme}`);
}

// Toggle Lock UI Classes
function updateLockUI(isLocked) {
  if (isLocked) {
    appContainer.classList.remove('unlocked');
    appContainer.classList.add('locked');
    settingsOverlay.classList.add('hidden'); // Close settings if open
  } else {
    appContainer.classList.remove('locked');
    appContainer.classList.add('unlocked');
  }
}

// Listen to Lock State Changes from Main Process Hotkey
window.electronAPI.onWindowLockChanged((isLocked) => {
  config.isLocked = isLocked;
  updateLockUI(isLocked);
  addSystemMessage(`Overlay ${isLocked ? 'LOCKED' : 'UNLOCKED'}`);
});

/* Settings Modal Handlers */
settingsToggle.addEventListener('click', () => {
  populateSettingsForm();
  settingsOverlay.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
  settingsOverlay.classList.add('hidden');
});

supportBtn.addEventListener('click', () => {
  window.electronAPI.openExternal('https://www.patreon.com/c/phelrin');
});

devTwitchLink.addEventListener('click', (e) => {
  e.preventDefault();
  window.electronAPI.openExternal('https://dev.twitch.tv/console');
});

seDashboardLink.addEventListener('click', (e) => {
  e.preventDefault();
  window.electronAPI.openExternal('https://streamelements.com/dashboard/account/channels');
});

testSoundBtn.addEventListener('click', () => {
  playSynthSound(soundTypeSelect.value);
});

// Update Sliders dynamically in UI
opacitySlider.addEventListener('input', (e) => {
  opacityVal.textContent = `${e.target.value}%`;
});

fontSizeSlider.addEventListener('input', (e) => {
  fontSizeVal.textContent = `${e.target.value}px`;
});

fadeSlider.addEventListener('input', (e) => {
  fadeVal.textContent = e.target.value === '0' ? 'Never Fades' : `${e.target.value}s`;
});

ttsVolumeSlider.addEventListener('input', (e) => {
  ttsVolumeVal.textContent = `${e.target.value}%`;
});

// Auto-resolve Kick ID Button
resolveKickBtn.addEventListener('click', async () => {
  const username = kickChannelInput.value.trim();
  if (!username) {
    updateResolveStatus('Error: Enter a Kick username first', 'error');
    return;
  }
  
  updateResolveStatus('Resolving ID... (may take 5s)', 'loading');
  resolveKickBtn.disabled = true;
  
  const resolvedId = await window.electronAPI.resolveKickId(username);
  
  resolveKickBtn.disabled = false;
  if (resolvedId) {
    kickChatroomIdInput.value = resolvedId;
    updateResolveStatus('Successfully resolved chatroom ID!', 'success');
  } else {
    updateResolveStatus('Failed to resolve. Input manually or retry.', 'error');
  }
});

function updateResolveStatus(text, type) {
  resolveStatus.textContent = text;
  resolveStatus.className = 'status-text ' + type;
}

// Twitch Login / Disconnect Button Listener
twitchLoginBtn.addEventListener('click', async () => {
  // If already connected, do disconnect flow
  if (config.twitchToken && config.twitchAuthUsername) {
    config = await window.electronAPI.saveConfig({
      twitchToken: null,
      twitchAuthUsername: null,
      twitchClientId: null
    });
    
    // Disconnect authenticated connections
    if (twitchWS) {
      twitchWS.close();
    }
    if (eventSubWS) {
      eventSubWS.close();
    }
    
    addSystemMessage('Twitch account disconnected successfully.');
    connectTwitch(); // Reconnect anonymously
    populateSettingsForm();
    return;
  }
  
  // Connect flow
  const clientId = twitchClientIdInput.value.trim();
  if (!clientId) {
    alert('Please enter your Twitch Client ID first. You can get one by registering an app on dev.twitch.tv.');
    return;
  }
  
  try {
    twitchAuthStatus.textContent = 'Awaiting browser login...';
    twitchAuthStatus.style.color = '#eab308'; // Orange
    twitchLoginBtn.disabled = true;
    
    const token = await window.electronAPI.startTwitchAuth(clientId);
    if (!token) throw new Error('Authorization canceled or failed');
    
    // Fetch profile details
    const usersResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!usersResponse.ok) throw new Error('Failed to fetch Twitch profile details. Verify your Client ID is correct.');
    
    const usersJson = await usersResponse.json();
    if (!usersJson.data || usersJson.data.length === 0) throw new Error('No user data returned from Twitch');
    
    const displayName = usersJson.data[0].display_name;
    
    // Auto-update twitch channel field in Settings form
    twitchChannelInput.value = displayName;
    
    config = await window.electronAPI.saveConfig({
      twitchToken: token,
      twitchAuthUsername: displayName,
      twitchClientId: clientId,
      twitchChannel: displayName // Automatically match their connection channel!
    });
    
    addSystemMessage(`Twitch account connected successfully! Welcome, ${displayName}.`);
    
    // Re-init connections
    connectTwitch();
    connectEventSub();
    populateSettingsForm();
  } catch (err) {
    console.error('Twitch Login Error:', err);
    addSystemMessage('Failed to connect Twitch account: ' + err.message, true);
    populateSettingsForm();
  } finally {
    twitchLoginBtn.disabled = false;
  }
});

// Save Settings Handler
saveSettings.addEventListener('click', async () => {
  const newTwitch = twitchChannelInput.value.trim();
  const newTwitchClientId = twitchClientIdInput.value.trim() || null;
  const newKick = kickChannelInput.value.trim();
  let newKickId = kickChatroomIdInput.value.trim() || null;
  if (newKickId) newKickId = parseInt(newKickId, 10);
  const newSeToken = seTokenInput.value.trim() || null;
  
  const isTwitchChanged = newTwitch !== config.twitchChannel;
  const isTwitchClientIdChanged = newTwitchClientId !== config.twitchClientId;
  const isKickChanged = newKick !== config.kickChannel;
  const isKickIdChanged = newKickId !== config.kickChatroomId;
  const isSeTokenChanged = newSeToken !== config.seToken;
  
  const newConfig = {
    twitchChannel: newTwitch,
    twitchClientId: newTwitchClientId,
    kickChannel: newKick,
    kickChatroomId: newKickId,
    seToken: newSeToken,
    theme: {
      opacity: parseFloat(opacitySlider.value) / 100,
      fontSize: parseInt(fontSizeSlider.value, 10),
      messageFade: parseInt(fadeSlider.value, 10),
      showBadges: showBadgesCb.checked,
      showPlatformIcons: showIconsCb.checked,
      disableSystemMessages: disableSystemMessagesCb.checked,
      enableSounds: enableSoundsCb.checked,
      soundType: soundTypeSelect.value,
      ttsMode: ttsModeSelect.value,
      ttsTrigger: ttsTriggerSelect.value,
      ttsVolume: parseFloat(ttsVolumeSlider.value) / 100,
      themeName: themeSelect.value,
      viewerCountMode: viewerCountSelect.value
    }
  };
  
  // Save to disk
  config = await window.electronAPI.saveConfig(newConfig);
  applyConfigVisuals(config);
  updateViewerWidgetDisplay();
  settingsOverlay.classList.add('hidden');
  addSystemMessage('Settings saved successfully.');
  
  // Reconnect if channel settings changed
  if (isTwitchChanged) {
    addSystemMessage(`Twitch channel changed to: ${config.twitchChannel}`);
    connectTwitch();
  }
  if (isKickChanged || isKickIdChanged) {
    addSystemMessage(`Kick channel changed to: ${config.kickChannel}`);
    connectKick();
  }
  if (isSeTokenChanged) {
    addSystemMessage('StreamElements integration token updated.');
    connectStreamElements();
  }
});

/* Twitch IRC Integration */
function connectTwitch() {
  if (twitchWS) {
    twitchWS.close();
  }
  clearTimeout(twitchReconnectTimer);
  
  if (!config.twitchChannel) {
    addSystemMessage('Twitch channel not configured. Skipping connection.');
    return;
  }
  
  const channel = config.twitchChannel.toLowerCase();
  addSystemMessage(`Connecting to Twitch chat: #${channel}...`);
  
  // Twitch IRC WS endpoint
  twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
  
  twitchWS.onopen = () => {
    console.log('Twitch WS Connected');
    addSystemMessage('Twitch Chat Connected!');
    
    // Request tags for color, badges, emotes
    twitchWS.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
    // Login anonymously (highly stable read-only connection)
    const anonymousNick = `justinfan${Math.floor(Math.random() * 800000 + 100000)}`;
    twitchWS.send(`PASS oauth:anonymous`);
    twitchWS.send(`NICK ${anonymousNick}`);
    twitchWS.send(`JOIN #${channel}`);
  };
  
  twitchWS.onmessage = (event) => {
    const lines = event.data.split('\r\n');
    for (const line of lines) {
      if (!line) continue;
      
      // Ping-pong to keep connection alive
      if (line.startsWith('PING ')) {
        twitchWS.send(line.replace('PING', 'PONG'));
        continue;
      }
      
      const parsed = parseTwitchMessage(line);
      if (parsed) {
        displayMessage(parsed);
      }
    }
  };
  
  twitchWS.onclose = () => {
    console.warn('Twitch WS Closed');
    addSystemMessage('Twitch Chat Disconnected. Reconnecting...');
    twitchReconnectTimer = setTimeout(connectTwitch, 5000);
  };
  
  twitchWS.onerror = (err) => {
    console.error('Twitch WS Error:', err);
  };
}

function parseTwitchMessage(raw) {
  const isPrivmsg = raw.includes('PRIVMSG');
  const isUsernotice = raw.includes('USERNOTICE');
  if (!isPrivmsg && !isUsernotice) return null;
  
  let tags = {};
  let remaining = raw;
  
  if (raw.startsWith('@')) {
    const spaceIndex = raw.indexOf(' ');
    const tagsStr = raw.slice(1, spaceIndex);
    remaining = raw.slice(spaceIndex + 1);
    
    const tagParts = tagsStr.split(';');
    for (const part of tagParts) {
      const [key, val] = part.split('=');
      if (val) {
        tags[key] = val
          .replace(/\\s/g, ' ')
          .replace(/\\:/g, ':')
          .replace(/\\r/g, '\r')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\');
      } else {
        tags[key] = '';
      }
    }
  }
  
  if (isUsernotice) {
    const systemMsg = tags['system-msg'];
    if (systemMsg) {
      const cleanText = systemMsg.replace(/\\s/g, ' ');
      displayEventNotification('twitch', cleanText);
    }
    return null; // Handle notification, skip standard chat rendering
  }
  
  const match = remaining.match(/^:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.*)$/);
  if (!match) return null;
  
  const rawUsername = tags['display-name'] || match[1];
  const messageText = match[2];
  const color = tags['color'] || null;
  
  // Format badges
  const badgesList = [];
  if (tags.badges) {
    const badgePairs = tags.badges.split(',');
    for (const pair of badgePairs) {
      const [badgeName] = pair.split('/');
      if (badgeName === 'broadcaster' || badgeName === 'moderator' || badgeName === 'vip' || badgeName === 'subscriber') {
        badgesList.push(badgeName);
      }
    }
  }
  
  // Emotes replacement
  let processedMessage = messageText;
  if (tags.emotes) {
    const replacements = [];
    const emoteParts = tags.emotes.split('/');
    for (const part of emoteParts) {
      const [id, rangesStr] = part.split(':');
      const ranges = rangesStr.split(',');
      for (const range of ranges) {
        const [start, end] = range.split('-').map(Number);
        replacements.push({ id, start, end });
      }
    }
    // Sort in reverse order so replacements do not offset indices of preceding emotes
    replacements.sort((a, b) => b.start - a.start);
    
    for (const r of replacements) {
      const emoteName = messageText.substring(r.start, r.end + 1);
      const imgHtml = `<img src="https://static-cdn.jtvnw.net/emotes/v2/${r.id}/default/dark/1.0" alt="${emoteName}" title="${emoteName}" class="chat-emote" />`;
      processedMessage = processedMessage.substring(0, r.start) + imgHtml + processedMessage.substring(r.end + 1);
    }
  }
  
  const isCustomReward = tags['custom-reward-id'] !== undefined;
  const isHighlight = tags['msg-id'] === 'highlighted-message';
  const isRedemption = isCustomReward || isHighlight;
  let redemptionName = '';
  if (isHighlight) {
    redemptionName = 'Highlight Message';
  } else if (isCustomReward) {
    redemptionName = 'Custom Reward';
  }
  
  return {
    platform: 'twitch',
    username: rawUsername,
    color: color,
    contentHTML: processedMessage,
    rawText: messageText,
    badges: badgesList,
    isRedemption: isRedemption,
    redemptionName: redemptionName
  };
}

/* Kick Pusher Integration */
async function connectKick() {
  if (kickWS) {
    kickWS.close();
  }
  clearTimeout(kickReconnectTimer);
  
  if (!config.kickChannel) {
    addSystemMessage('Kick channel not configured. Skipping connection.');
    return;
  }
  
  // If we don't have the chatroom ID, we must resolve it
  let chatroomId = config.kickChatroomId;
  if (!chatroomId) {
    addSystemMessage(`Resolving Kick Chatroom ID for ${config.kickChannel}...`);
    chatroomId = await window.electronAPI.resolveKickId(config.kickChannel);
    if (chatroomId) {
      // Save for future uses
      config = await window.electronAPI.saveConfig({ kickChatroomId: chatroomId });
    } else {
      addSystemMessage('Failed to resolve Kick Chatroom ID. Kick chat will not connect. Fill it manually in settings.');
      return;
    }
  }
  
  addSystemMessage(`Connecting to Kick chat (Room: ${chatroomId})...`);
  
  // Kick's Pusher URL
  const pusherUrl = `wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.2&flash=false`;
  kickWS = new WebSocket(pusherUrl);
  
  kickWS.onopen = () => {
    console.log('Kick WS Connected');
    addSystemMessage('Kick Chat Connected!');
    
    // Subscribe to chatroom
    const subscribeMsg = {
      event: 'pusher:subscribe',
      data: {
        auth: '',
        channel: `chatrooms.${chatroomId}.v2`
      }
    };
    kickWS.send(JSON.stringify(subscribeMsg));
  };
  
  kickWS.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    
    // Pusher ping-pong
    if (payload.event === 'pusher:ping') {
      kickWS.send(JSON.stringify({ event: 'pusher:pong' }));
      return;
    }
    
    if (payload.event === 'App\\Events\\ChatMessageEvent') {
      const data = JSON.parse(payload.data);
      const msg = parseKickMessage(data);
      if (msg) {
        displayMessage(msg);
      }
    } else if (payload.event === 'App\\Events\\FollowEvent') {
      try {
        const data = JSON.parse(payload.data);
        const follower = data.username || data.user?.username || 'A user';
        displayEventNotification('kick', `🟢 ${follower} is now following on Kick!`);
      } catch (e) {
        console.error('Failed to parse Kick FollowEvent:', e);
      }
    } else if (payload.event === 'App\\Events\\SubscriptionEvent') {
      try {
        const data = JSON.parse(payload.data);
        const subscriber = data.username || data.user?.username || 'A user';
        const months = data.months || data.months_subscribed || 1;
        displayEventNotification('kick', `⭐ ${subscriber} subscribed on Kick! (Month ${months})`);
      } catch (e) {
        console.error('Failed to parse Kick SubscriptionEvent:', e);
      }
    } else if (payload.event === 'App\\Events\\GiftedSubscriptionsEvent') {
      try {
        const data = JSON.parse(payload.data);
        const gifter = data.gifter_username || data.gifter?.username || 'A user';
        const count = data.gifted_count || (data.gifted_usernames ? data.gifted_usernames.length : 1);
        displayEventNotification('kick', `🎁 ${gifter} gifted ${count} subscription(s) on Kick!`);
      } catch (e) {
        console.error('Failed to parse Kick GiftedSubscriptionsEvent:', e);
      }
    }
  };
  
  kickWS.onclose = () => {
    console.warn('Kick WS Closed');
    addSystemMessage('Kick Chat Disconnected. Reconnecting...');
    kickReconnectTimer = setTimeout(connectKick, 5000);
  };
  
  kickWS.onerror = (err) => {
    console.error('Kick WS Error:', err);
  };
}

function parseKickMessage(data) {
  const username = data.sender?.username || 'Anonymous';
  const color = data.sender?.identity?.color || null;
  const messageText = data.content || '';
  
  // Extract badges
  const badgesList = [];
  const rawBadges = data.sender?.identity?.badges || [];
  for (const badge of rawBadges) {
    if (badge.type === 'broadcaster' || badge.type === 'moderator' || badge.type === 'vip' || badge.type === 'subscriber') {
      badgesList.push(badge.type);
    }
  }
  
  // Parse Kick Emotes: [emote:ID:Name]
  // Kick emote CDN URL format: https://files.kick.com/emotes/{id}/fullsize
  const emoteRegex = /\[emote:(\d+):([^\]]+)\]/g;
  const processedHTML = messageText.replace(emoteRegex, (match, id, name) => {
    return `<img src="https://files.kick.com/emotes/${id}/fullsize" alt="${name}" title="${name}" class="chat-emote" />`;
  });
  
  return {
    platform: 'kick',
    username,
    color,
    contentHTML: processedHTML,
    rawText: messageText,
    badges: badgesList
  };
}

/* UI Formatting & Message Display */
function displayMessage({ platform, username, color, contentHTML, rawText, badges, isRedemption, redemptionName }) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('chat-message', platform);
  
  if (isRedemption) {
    messageEl.classList.add('redemption');
  }
  
  // Apply glowing highlight style if streamer is mentioned
  if (hasMention(rawText)) {
    messageEl.classList.add('highlighted');
  }
  
  // Generate user color
  const finalColor = color || getUsernameColor(username);
  
  // Platform Icon
  let platformIconHtml = '';
  if (config.theme.showPlatformIcons) {
    platformIconHtml = `<span class="platform-icon ${platform}">${platform === 'twitch' ? TWITCH_ICON : KICK_ICON}</span>`;
  }
  
  // Badges
  let badgesHtml = '';
  if (config.theme.showBadges && badges && badges.length > 0) {
    for (const badge of badges) {
      const svg = BADGE_SVGS[badge] || '';
      badgesHtml += `<span class="badge ${badge}" title="${badge}">${svg}${badge.slice(0, 3)}</span>`;
    }
  }
  
  let redemptionHeader = '';
  if (isRedemption) {
    redemptionHeader = `<div class="redemption-badge">🪙 ${redemptionName || 'Reward Redeemed'}</div>`;
  }
  
  messageEl.innerHTML = `
    <div class="message-meta">
      ${platformIconHtml}
      ${badgesHtml}
      <span class="username" style="color: ${finalColor}">${username}</span>
    </div>
    <div class="message-content">${redemptionHeader}${contentHTML}</div>
  `;
  
  // Append and Scroll
  chatMessages.appendChild(messageEl);
  limitMessageCount();
  scrollToBottom();
  
  // Play sound if enabled
  if (config.theme.enableSounds) {
    playSynthSound(config.theme.soundType);
  }
  
  // Trigger TTS if enabled
  triggerTTS(rawText, badges);
  
  // Setup Message Fadeout Timer if configured
  if (config.theme.messageFade > 0) {
    setTimeout(() => {
      messageEl.classList.add('fade-out');
      // Remove element after transition finishes
      messageEl.addEventListener('transitionend', () => {
        messageEl.remove();
      });
    }, config.theme.messageFade * 1000);
  }
}

// Displays a local system message (e.g. status/errors)
function addSystemMessage(text, isError = false) {
  // If system info messages are disabled and this is not a vital error, skip it
  if (config.theme.disableSystemMessages && !isError) {
    return;
  }

  const messageEl = document.createElement('div');
  messageEl.classList.add('chat-message', 'system');
  if (isError) messageEl.classList.add('error');
  
  messageEl.innerHTML = `
    <div class="message-content">${text}</div>
  `;
  
  chatMessages.appendChild(messageEl);
  limitMessageCount();
  scrollToBottom();
  
  // System messages always fade out after 10s to keep overlay clean
  setTimeout(() => {
    messageEl.classList.add('fade-out');
    messageEl.addEventListener('transitionend', () => {
      messageEl.remove();
    });
  }, 10000);
}

// Limits DOM children count
function limitMessageCount() {
  while (chatMessages.children.length > MAX_MESSAGE_COUNT) {
    chatMessages.removeChild(chatMessages.firstChild);
  }
}

// Scroll state tracking to allow pausing chat on scroll
let isUserScrolledUp = false;

chatViewport.addEventListener('scroll', () => {
  const threshold = 15;
  const distanceFromBottom = chatViewport.scrollHeight - chatViewport.scrollTop - chatViewport.clientHeight;
  isUserScrolledUp = distanceFromBottom > threshold;
});

// Force scroll to bottom if user is not looking at history
function scrollToBottom() {
  if (!isUserScrolledUp) {
    chatViewport.scrollTop = chatViewport.scrollHeight;
  }
}

// Generate pastel hsl color based on string hash (for consistent usernames coloring)
function getUsernameColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Clamp hue, set saturation 85%, lightness 65% for readability
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 85%, 65%)`;
}

// Web Audio API Synthesizer for notifications
let audioCtx = null;

function playSynthSound(type) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    if (type === 'chime') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now);
      
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } 
    else if (type === 'pop') {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.09);
    } 
    else if (type === 'blip') {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.setValueAtTime(400, now + 0.05);
      
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    console.error('Failed to play synthesizer sound:', err);
  }
}

// Text-To-Speech (TTS) Engine
function triggerTTS(text, badges) {
  if (!text) return;
  if (!config.theme.ttsMode || config.theme.ttsMode === 'disabled') return;
  
  // Privilege checks for subs mode
  if (config.theme.ttsMode === 'subs') {
    const isPrivileged = badges && (
      badges.includes('subscriber') ||
      badges.includes('broadcaster') ||
      badges.includes('moderator') ||
      badges.includes('vip')
    );
    if (!isPrivileged) return;
  }
  
  let speechText = text.trim();
  
  // Trigger Prefix Command Check
  if (config.theme.ttsTrigger === 'command') {
    if (!speechText.toLowerCase().startsWith('!tts')) {
      return;
    }
    // Strip !tts / !TTS command name
    speechText = speechText.replace(/^!tts\s*/i, '').trim();
    if (!speechText) return;
  }
  
  // Speak text
  speakText(speechText);
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    // Optionally cancel currently speaking voice if you want to skip,
    // but queueing is standard for stream chats.
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = config.theme.ttsVolume !== undefined ? config.theme.ttsVolume : 0.8;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// Streamer Mention Highlight Helper
function hasMention(text) {
  if (!text) return false;
  const usernameMentions = [];
  if (config.twitchChannel) usernameMentions.push(config.twitchChannel.toLowerCase());
  if (config.kickChannel) usernameMentions.push(config.kickChannel.toLowerCase());
  
  if (usernameMentions.length === 0) return false;
  
  const lowerText = text.toLowerCase();
  return usernameMentions.some(name => {
    // Check if user is mentioned (with @ prefix or by itself as a word boundary)
    const regex = new RegExp(`(@|\\b)${name}\\b`, 'i');
    return regex.test(lowerText);
  });
}

// Live Viewers Polling System
let viewerPollTimer = null;
let twitchViewerCount = 0;
let kickViewerCount = 0;

async function pollViewerCounts() {
  const mode = config.theme.viewerCountMode || 'combined';
  if (mode === 'hidden') {
    updateViewerWidgetUI();
    return;
  }

  // Poll Twitch viewers
  if (config.twitchChannel) {
    try {
      twitchViewerCount = await window.electronAPI.getTwitchViewers(config.twitchChannel);
    } catch (e) {
      console.error('Twitch viewer poll failed:', e);
      twitchViewerCount = 0;
    }
  } else {
    twitchViewerCount = 0;
  }

  // Poll Kick viewers
  if (config.kickChannel) {
    try {
      kickViewerCount = await window.electronAPI.getKickViewers(config.kickChannel);
    } catch (e) {
      console.error('Kick viewer poll failed:', e);
      kickViewerCount = 0;
    }
  } else {
    kickViewerCount = 0;
  }

  updateViewerWidgetUI();
}

function updateViewerWidgetUI() {
  const mode = config.theme.viewerCountMode || 'combined';
  if (mode === 'hidden') {
    viewerWidget.classList.add('hidden');
    return;
  }

  viewerWidget.classList.remove('hidden');

  if (mode === 'combined') {
    const total = twitchViewerCount + kickViewerCount;
    viewerWidget.innerHTML = `<span>👥 ${total}</span>`;
  } else if (mode === 'separate') {
    viewerWidget.innerHTML = `
      <span class="twitch-viewers">${TWITCH_ICON} ${twitchViewerCount}</span>
      <span class="divider">|</span>
      <span class="kick-viewers">${KICK_ICON} ${kickViewerCount}</span>
    `;
  }
}

function startViewerPolling() {
  stopViewerPolling();
  pollViewerCounts(); // Immediate initial poll
  viewerPollTimer = setInterval(pollViewerCounts, 60000); // Poll every 60s
}

function stopViewerPolling() {
  if (viewerPollTimer) {
    clearInterval(viewerPollTimer);
    viewerPollTimer = null;
  }
}

function updateViewerWidgetDisplay() {
  const mode = config.theme.viewerCountMode || 'combined';
  if (mode === 'hidden') {
    stopViewerPolling();
    viewerWidget.classList.add('hidden');
  } else {
    startViewerPolling();
  }
}

// Display Special platform events (subs, follows, raids)
function displayEventNotification(platform, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('event-notification', platform);
  
  const icon = platform === 'twitch' ? TWITCH_ICON : (platform === 'kick' ? KICK_ICON : SE_ICON);
  messageEl.innerHTML = `
    <div class="message-content">
      <span class="platform-icon ${platform}">${icon}</span>
      <strong>${text}</strong>
    </div>
  `;
  
  chatMessages.appendChild(messageEl);
  limitMessageCount();
  scrollToBottom();
  
  // Play sound if enabled
  if (config.theme.enableSounds) {
    playSynthSound(config.theme.soundType);
  }
}

// Twitch EventSub WebSocket Connection
let eventSubWS = null;
let eventSubReconnectTimer = null;

function connectEventSub() {
  if (eventSubWS) {
    eventSubWS.close();
  }
  clearTimeout(eventSubReconnectTimer);
  
  if (!config.twitchToken || !config.twitchChannel) {
    console.log('Twitch OAuth token or channel name not configured. Skipping EventSub connection.');
    return;
  }
  
  console.log('Connecting to Twitch EventSub WebSocket...');
  eventSubWS = new WebSocket('wss://eventsub.wss.twitch.tv/ws');
  
  eventSubWS.onopen = () => {
    console.log('EventSub WebSocket Connected');
  };
  
  eventSubWS.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      
      if (msg.metadata.message_type === 'session_welcome') {
        const sessionId = msg.payload.session.id;
        await registerEventSubscriptions(sessionId);
      } else if (msg.metadata.message_type === 'notification') {
        handleEventSubNotification(msg.payload);
      }
    } catch (err) {
      console.error('Error handling EventSub message:', err);
    }
  };
  
  eventSubWS.onclose = () => {
    console.warn('EventSub WebSocket Closed. Reconnecting in 10s...');
    eventSubReconnectTimer = setTimeout(connectEventSub, 10000);
  };
  
  eventSubWS.onerror = (err) => {
    console.error('EventSub WebSocket Error:', err);
  };
}

async function registerEventSubscriptions(sessionId) {
  try {
    // 1. Get Broadcaster ID
    const usersResponse = await fetch('https://api.twitch.tv/helix/users?login=' + config.twitchChannel.toLowerCase(), {
      headers: {
        'Client-ID': config.twitchClientId,
        'Authorization': 'Bearer ' + config.twitchToken
      }
    });
    if (!usersResponse.ok) throw new Error('Failed to fetch Twitch user profile for ID resolution');
    const usersJson = await usersResponse.json();
    if (!usersJson.data || usersJson.data.length === 0) throw new Error('No user data returned from Twitch');
    const broadcasterId = usersJson.data[0].id;
    
    console.log(`Resolved Broadcaster ID for EventSub: ${broadcasterId}`);
    
    // Helper to register subscriptions
    async function subscribe(type, version, condition) {
      const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: 'POST',
        headers: {
          'Client-ID': config.twitchClientId,
          'Authorization': 'Bearer ' + config.twitchToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: type,
          version: version,
          condition: condition,
          transport: {
            method: 'websocket',
            session_id: sessionId
          }
        })
      });
      if (!response.ok) {
        const errJson = await response.json();
        console.error(`Failed to register EventSub topic ${type}:`, errJson);
      } else {
        console.log(`Successfully registered EventSub topic: ${type}`);
      }
    }
    
    // Follow alerts (requires moderator:read:followers scope)
    await subscribe('channel.follow', '2', {
      broadcaster_user_id: broadcasterId,
      moderator_user_id: broadcasterId
    });
    
    // Channel points redemptions (requires channel:read:redemptions scope)
    await subscribe('channel.channel_points_custom_reward_redemption.add', '1', {
      broadcaster_user_id: broadcasterId
    });
    
  } catch (err) {
    console.error('Error resolving broadcaster ID or subscribing to EventSub:', err);
  }
}

function handleEventSubNotification(payload) {
  const type = payload.subscription.type;
  const event = payload.event;
  
  if (type === 'channel.follow') {
    displayEventNotification('twitch', `🟢 ${event.user_name} is now following on Twitch!`);
  } else if (type === 'channel.channel_points_custom_reward_redemption.add') {
    // Only display event notification if it's a non-text reward (to avoid duplicating text rewards in chat)
    if (!event.user_input) {
      displayEventNotification('twitch', `🪙 ${event.user_name} redeemed: ${event.reward.title}`);
    }
  }
}

// StreamElements Integration (Astro WebSocket Client)
let seWS = null;
let seReconnectTimer = null;

async function connectStreamElements() {
  if (seWS) {
    seWS.close();
  }
  clearTimeout(seReconnectTimer);
  
  if (!config.seToken) {
    console.log('StreamElements token not configured. Skipping StreamElements connection.');
    return;
  }
  
  console.log('Connecting to StreamElements Astro WebSocket...');
  seWS = new WebSocket('wss://astro.streamelements.com');
  
  seWS.onopen = () => {
    console.log('StreamElements Astro Connected');
  };
  
  seWS.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      
      if (msg.type === 'welcome') {
        // Resolve Room (Channel) ID via Token
        const seChannelId = await window.electronAPI.getSeChannelId(config.seToken);
        if (!seChannelId) {
          addSystemMessage('Failed to resolve StreamElements Channel ID. Verify token is correct.', true);
          return;
        }
        
        console.log(`Resolved StreamElements Channel ID: ${seChannelId}`);
        
        // Subscribe to activities topic
        seWS.send(JSON.stringify({
          type: 'subscribe',
          nonce: 'se-sub-' + Math.random().toString(36).substring(2, 9),
          data: {
            topic: 'channel.activities',
            room: seChannelId,
            token: config.seToken,
            token_type: 'jwt'
          }
        }));
      } else if (msg.type === 'message' && msg.topic === 'channel.activities') {
        handleStreamElementsEvent(msg.data);
      }
    } catch (err) {
      console.error('Error handling StreamElements message:', err);
    }
  };
  
  seWS.onclose = () => {
    console.warn('StreamElements Astro Closed. Reconnecting in 10s...');
    seReconnectTimer = setTimeout(connectStreamElements, 10000);
  };
  
  seWS.onerror = (err) => {
    console.error('StreamElements Astro Error:', err);
  };
}

function handleStreamElementsEvent(activity) {
  if (!activity) return;
  
  // We only look for tip (donation) events
  if (activity.type === 'tip') {
    const tipData = activity.data;
    const username = tipData.username || tipData.displayName || 'Anonymous';
    const amount = tipData.amount;
    const currency = tipData.currency || 'USD';
    const msg = tipData.message || '';
    
    let currencySymbol = currency;
    if (currency === 'USD') currencySymbol = '$';
    else if (currency === 'EUR') currencySymbol = '€';
    else if (currency === 'GBP') currencySymbol = '£';
    else if (currency === 'CAD') currencySymbol = 'C$';
    else if (currency === 'AUD') currencySymbol = 'A$';
    
    const alertText = `${username} tipped ${currencySymbol}${amount.toFixed(2)}${msg ? `: "${msg}"` : ''}`;
    
    // Display event card
    displayEventNotification('streamelements', alertText);
    
    // Speak tip if TTS is active
    if (config.theme.ttsMode !== 'disabled') {
      speakText(`${username} donated ${amount} ${currency}${msg ? ` saying: ${msg}` : ''}`);
    }
  }
}

// Start
init();
