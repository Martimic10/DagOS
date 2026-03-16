const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000/app/dashboard';
const LOGIN_URL     = 'http://localhost:3000/login';

// ── Single-instance lock (Windows / Linux deep link support) ──────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// ── Custom protocol ───────────────────────────────────────────────────────────
// Registers dagos:// so the OS opens this app when a dagos:// link is clicked.
app.setAsDefaultProtocolClient('dagos');

// ── Safe IPC send — guards against destroyed webContents ─────────────────────
function safeSend(win, channel, ...args) {
  if (!win || win.isDestroyed()) return;
  if (!win.webContents || win.webContents.isDestroyed()) return;
  win.webContents.send(channel, ...args);
}

// ── Deep link handler ─────────────────────────────────────────────────────────
function handleAuthDeepLink(url) {
  try {
    const parsed = new URL(url);

    // dagos://auth-refresh — fired by the Stripe success page.
    // Tells the renderer to re-check the plan from Supabase (is_pro just flipped).
    if (parsed.hostname === 'auth-refresh') {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
        safeSend(win, 'plan:refresh');
      }
      return;
    }

    if (parsed.hostname !== 'auth') return;

    const accessToken  = parsed.searchParams.get('access_token');
    const refreshToken = parsed.searchParams.get('refresh_token');
    if (!accessToken || !refreshToken) return;

    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;

    // Bring window to front
    if (win.isMinimized()) win.restore();
    win.focus();

    // Send session tokens to the renderer via preload bridge
    safeSend(win, 'auth:session', { access_token: accessToken, refresh_token: refreshToken });
  } catch {
    // Invalid URL — ignore
  }
}

// Windows / Linux: deep link arrives as a second-instance argument
app.on('second-instance', (_event, commandLine) => {
  const url = commandLine.find((arg) => arg.startsWith('dagos://'));
  if (url) handleAuthDeepLink(url);

  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// macOS: deep link arrives via open-url event
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleAuthDeepLink(url);
});

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'DagOS',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
  });

  win.loadURL(DASHBOARD_URL);

  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools();
  });

  // Open external links in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // macOS: handle deep link that arrives before the window is ready
  app.on('open-url', (event, url) => {
    event.preventDefault();
    // Wait for the page to fully load before sending the session
    win.webContents.once('did-finish-load', () => handleAuthDeepLink(url));
    handleAuthDeepLink(url);
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Check if app was launched via a deep link (macOS cold start)
  const deepLinkUrl = process.argv.find((arg) => arg.startsWith('dagos://'));
  if (deepLinkUrl) {
    app.once('browser-window-created', () => handleAuthDeepLink(deepLinkUrl));
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── App menu — enables cut/copy/paste/undo in all text fields ─────────────────
const menuTemplate = [
  ...(process.platform === 'darwin' ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  }] : []),
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  },
];

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
