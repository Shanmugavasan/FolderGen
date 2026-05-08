const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'), // Add an icon file later
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // During development, point to your local web server
  // For the final build, point to the build/index.html file
  win.loadFile('index.html'); 
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});