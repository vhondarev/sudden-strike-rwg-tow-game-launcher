const { app, BrowserWindow } = require('electron')
const initIpcMainListeners = require('./main-process/ipc-main-listeners')
const getVpnIp = require('./main-process/get-vpn-ip')


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '\\assets\\igra.ico',
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile( __dirname + '\\index.html')

  // open chrome devTools
  // win.webContents.openDevTools()
}

// Create window
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

initIpcMainListeners();

// TODO render IP address on ui
console.log(getVpnIp());
