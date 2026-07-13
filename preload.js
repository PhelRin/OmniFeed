const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  toggleLock: (isLocked) => ipcRenderer.invoke('toggle-lock', isLocked),
  resolveKickId: (username) => ipcRenderer.invoke('resolve-kick-id', username),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getTwitchViewers: (username) => ipcRenderer.invoke('get-twitch-viewers', username),
  getKickViewers: (username) => ipcRenderer.invoke('get-kick-viewers', username),
  startTwitchAuth: (clientId) => ipcRenderer.invoke('start-twitch-auth', clientId),
  getSeChannelId: (token) => ipcRenderer.invoke('get-se-channel-id', token),
  onWindowLockChanged: (callback) => {
    const subscription = (event, isLocked) => callback(isLocked);
    ipcRenderer.on('window-lock-changed', subscription);
    return () => ipcRenderer.removeListener('window-lock-changed', subscription);
  }
});
