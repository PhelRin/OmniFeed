const { app, BrowserWindow, globalShortcut, ipcMain, shell, net } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('http');

const configPath = path.join(app.getPath('userData'), 'config.json');

// Default Configuration
const DEFAULT_CONFIG = {
  twitchChannel: 'PhelRin',
  kickChannel: 'PhelRin',
  kickChatroomId: null,
  twitchToken: null,
  twitchAuthUsername: null,
  twitchClientId: null,
  seToken: null,
  windowBounds: { width: 400, height: 600, x: undefined, y: undefined },
  isLocked: false,
  theme: {
    fontSize: 16,
    opacity: 0.8,
    messageFade: 0,
    showBadges: true,
    showPlatformIcons: true,
    enableSounds: false,
    soundType: 'chime',
    ttsMode: 'disabled',
    ttsTrigger: 'all',
    ttsVolume: 0.8,
    themeName: 'glassmorphism',
    viewerCountMode: 'combined',
    disableSystemMessages: false
  }
};

let config = loadConfig();
let mainWindow = null;

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error loading config, using defaults:', e);
  }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(newConfig) {
  try {
    config = { ...config, ...newConfig };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.windowBounds.width,
    height: config.windowBounds.height,
    x: config.windowBounds.x,
    y: config.windowBounds.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  // Set initial lock state
  setWindowLockState(config.isLocked);

  // Save bounds on resize/move when unlocked
  mainWindow.on('resize', () => {
    if (!config.isLocked) {
      const bounds = mainWindow.getBounds();
      saveConfig({
        windowBounds: {
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y
        }
      });
    }
  });

  mainWindow.on('move', () => {
    if (!config.isLocked) {
      const bounds = mainWindow.getBounds();
      saveConfig({
        windowBounds: {
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y
        }
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setWindowLockState(isLocked) {
  if (!mainWindow) return;
  
  saveConfig({ isLocked });
  
  // Set ignore mouse events.
  // Under Windows/Linux, if true, clicks will pass through the window.
  // We don't use { forward: true } because we want it completely click-through when locked.
  mainWindow.setIgnoreMouseEvents(isLocked);
  
  // Inform the renderer process so it can hide/show window borders and headers
  mainWindow.webContents.send('window-lock-changed', isLocked);
}

app.whenReady().then(() => {
  createWindow();

  // Register Global Lock Shortcut
  const ret = globalShortcut.register('Ctrl+Shift+L', () => {
    const nextLockState = !config.isLocked;
    console.log(`Global Hotkey: Toggling lock state to: ${nextLockState}`);
    setWindowLockState(nextLockState);
  });

  if (!ret) {
    console.warn('Registration failed for global shortcut Ctrl+Shift+L');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  // Unregister global shortcut
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler Registrations
ipcMain.handle('get-config', () => {
  return config;
});

ipcMain.handle('save-config', (event, newConfig) => {
  saveConfig(newConfig);
  return config;
});

ipcMain.handle('toggle-lock', (event, isLocked) => {
  setWindowLockState(isLocked);
  return config.isLocked;
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (err) {
    console.error('Failed to open external URL:', err);
  }
});

ipcMain.handle('get-twitch-viewers', async (event, username) => {
  try {
    const response = await net.fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `query($login: String) { user(login: $login) { stream { viewersCount } } }`,
        variables: { login: username.toLowerCase() }
      })
    });
    if (!response.ok) return 0;
    const json = await response.json();
    return json[0]?.data?.user?.stream?.viewersCount || json.data?.user?.stream?.viewersCount || 0;
  } catch (err) {
    console.error('Error fetching Twitch viewers:', err);
    return 0;
  }
});

ipcMain.handle('get-kick-viewers', async (event, username) => {
  try {
    // net.fetch() has Chrome TLS fingerprint so it passes Cloudflare WAF checks cleanly
    const response = await net.fetch(`https://kick.com/api/v2/channels/${username.toLowerCase()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) return 0;
    const json = await response.json();
    return json.livestream?.viewer_count || 0;
  } catch (err) {
    console.error('Error fetching Kick viewers:', err);
    return 0;
  }
});

ipcMain.handle('resolve-kick-id', async (event, username) => {
  console.log(`Resolving Kick Chatroom ID for username: ${username}`);
  let tempWin = null;
  try {
    tempWin = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    // Load the Kick channel page to pass Cloudflare context
    const kickUrl = `https://kick.com/${username}`;
    await tempWin.loadURL(kickUrl);

    // Wait for the page load and brief pause for Cloudflare challenges
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Run fetch in page context to bypass CORS and use browser cookies
    const data = await tempWin.webContents.executeJavaScript(`
      fetch('/api/v2/channels/${username.toLowerCase()}')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch channel details. Status: ' + res.status);
          return res.json();
        })
        .then(json => ({ id: json.chatroom?.id || null }))
        .catch(err => ({ error: err.message }))
    `);

    if (data.error) {
      console.error(`Error inside Page JS execution: ${data.error}`);
      return null;
    }

    console.log(`Successfully resolved Kick Chatroom ID for ${username}: ${data.id}`);
    return data.id;
  } catch (err) {
    console.error(`Exception while resolving Kick ID: ${err.message}`);
    return null;
  } finally {
    if (tempWin) {
      tempWin.destroy();
    }
  }
});

let authServer = null;

ipcMain.handle('start-twitch-auth', (event, clientId) => {
  return new Promise((resolve, reject) => {
    if (authServer) {
      try { authServer.close(); } catch(e){}
    }
    
    authServer = http.createServer((req, res) => {
      const url = req.url;
      
      if (url === '/' || url === '') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Authorizing Stream Chat Overlay...</title></head>
            <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; text-align: center; padding-top: 50px;">
              <h2>Authorizing Stream Chat Overlay...</h2>
              <p>Completing connection. Please wait...</p>
              <script>
                const hash = window.location.hash;
                if (hash) {
                  const params = new URLSearchParams(hash.substring(1));
                  const token = params.get('access_token');
                  if (token) {
                    fetch('/save-token?token=' + token)
                      .then(() => {
                        document.body.innerHTML = '<h2>Connection Successful!</h2><p>You can close this tab now and return to the overlay.</p>';
                      })
                      .catch(err => {
                        document.body.innerHTML = '<h2>Connection Failed</h2><p>' + err.message + '</p>';
                      });
                  }
                } else {
                  document.body.innerHTML = '<h2>Connection Failed</h2><p>No token found in response.</p>';
                }
              </script>
            </body>
          </html>
        `);
      } else if (url.startsWith('/save-token')) {
        const urlObj = new URL(req.url, 'http://localhost:3000');
        const token = urlObj.searchParams.get('token');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        
        if (token) {
          resolve(token);
        } else {
          reject(new Error('No token captured'));
        }
        
        setTimeout(() => {
          if (authServer) {
            authServer.close();
            authServer = null;
          }
        }, 1000);
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    
    authServer.listen(3000, () => {
      console.log('OAuth helper server listening on port 3000');
      shell.openExternal('https://id.twitch.tv/oauth2/authorize' + 
        '?client_id=' + encodeURIComponent(clientId) +
        '&redirect_uri=http://localhost:3000' +
        '&response_type=token' +
        '&scope=chat:read+channel:read:redemptions+moderator:read:followers'
      );
    });
    
    authServer.on('error', (err) => {
      reject(err);
    });
  });
});

ipcMain.handle('get-se-channel-id', async (event, token) => {
  try {
    const response = await net.fetch('https://api.streamelements.com/kappa/v2/channels/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to resolve StreamElements channel. Status: ${response.status}`);
    }
    const json = await response.json();
    return json._id;
  } catch (err) {
    console.error('Error resolving StreamElements Channel ID:', err.message);
    return null;
  }
});

