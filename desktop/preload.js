const { contextBridge, ipcRenderer } = require('electron');

/**
 * Safe API exposed to the renderer (dashboard).
 *
 * Future additions go here:
 *   - ollamaStatus: () => ipcRenderer.invoke('ollama:status')
 *   - systemInfo:   () => ipcRenderer.invoke('system:info')
 *   - installModel: (name) => ipcRenderer.invoke('model:install', name)
 *   - openFilePicker: () => ipcRenderer.invoke('dialog:open')
 */
contextBridge.exposeInMainWorld('dagosDesktop', {
  isDesktop: true,

  /**
   * Register a callback for when the main process receives a dagos://auth deep link.
   * The callback receives { access_token, refresh_token }.
   * Returns an unsubscribe function.
   */
  onAuthSession: (callback) => {
    const handler = (_event, session) => callback(session);
    ipcRenderer.on('auth:session', handler);
    return () => ipcRenderer.removeListener('auth:session', handler);
  },

  /**
   * Register a callback for when the Stripe success page fires dagos://auth-refresh.
   * The renderer should re-fetch the plan from Supabase.
   * Returns an unsubscribe function.
   */
  onPlanRefresh: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('plan:refresh', handler);
    return () => ipcRenderer.removeListener('plan:refresh', handler);
  },
});
