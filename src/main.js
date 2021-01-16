const { app, BrowserWindow, ipcMain, net  } = require('electron')
const fs = require('fs')
const path = require('path')
const regedit = require('regedit')

const axios = require('./utils/request')
const runUpdateExe = require('./utils/run-update-exe.js')
const calcDownloadProgress = require('./utils/upload-progress')
const requestFtpDownload = require('./utils/request-ftp-download')
const runExeFile = require('./utils/run-game-file-exe')

const {
  VERSIONS_URL,
  IPC_CHANNELS,
} = require('./constants')

const {
  CHANNEL_GET_REMOTE_DATA,
  CHANNEL_REPLY_GET_REMOTE_DATA,
  CHANNEL_GET_REGISTRY_DATA,
  CHANNEL_REPLY_GET_REGISTRY_DATA,
  CHANNEL_RUN_GAME_EXE,
  CHANNEL_REPLY_RUN_GAME_EXE,
  CHANNEL_RUN_GAME_UPDATE_EXE,
  CHANNEL_REPLY_RUN_GAME_UPDATE_EXE,
  CHANNEL_RUN_EDITOR_EXE,
  CHANNEL_REPLY_RUN_EDITOR_EXE,
  CHANNEL_DOWNLOAD_UPDATE,
  CHANNEL_REPLY_DOWNLOAD_UPDATE,
} = IPC_CHANNELS

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

// Request external version data
ipcMain.on(CHANNEL_GET_REMOTE_DATA, (event, arg) => {
  axios(VERSIONS_URL).then(async (response) => {
    event.reply(CHANNEL_REPLY_GET_REMOTE_DATA, await response.data)
  })
})

// Get regsitry values
ipcMain.on(CHANNEL_GET_REGISTRY_DATA, (event, arg) => {
  const RWG_REG_PATH = (process.arch === 'x64')
  ? 'HKLM\\SOFTWARE\\Wow6432Node\\RWG-team\\RWG-ToW'
  : 'HKLM\\SOFTWARE\\RWG-team\\RWG-ToW'

  regedit.list([RWG_REG_PATH], (err, result) => event.reply(CHANNEL_REPLY_GET_REGISTRY_DATA, result))
})

// Download update
ipcMain.on(CHANNEL_DOWNLOAD_UPDATE, async (event, arg) => {
  const fwin = BrowserWindow.getFocusedWindow()

  // workaround for 0.90 { ... }
  const avaliablePatches = {
    '0.9': {
      next: "0.91",
      resources: {
        ftp: 'ftp://rwg-ftp:rwg-2013@srv2.realwargame.ru/Temp/Update_RWG_090.exe'
      }
    },
    ...arg.patches,
  }

  // get next version and then resource patch link of upcoming update
  const resourcePath = avaliablePatches[avaliablePatches[arg.currentPatch].next]?.resources?.ftp

  const updateUiOnProgress = (gotten, size) => {
    event.reply(CHANNEL_REPLY_DOWNLOAD_UPDATE, calcDownloadProgress(gotten, size))
  }

  const runExeCallback = (filePath) => {
    fwin.setProgressBar(-1, { mode: "none" })
    event.reply(CHANNEL_REPLY_RUN_GAME_UPDATE_EXE, 'start')
    runUpdateExe(filePath, () => event.reply(CHANNEL_REPLY_RUN_GAME_UPDATE_EXE, 'end'))
  }

  fwin.setProgressBar(0.5, { mode: "indeterminate" });

  const {pathname} = new URL(resourcePath);
  const PATH_TO_FILE = `${process.env.USERPROFILE}\\Downloads\\${path.basename(pathname)}`

  if (fs.existsSync(PATH_TO_FILE)) {
    return runExeCallback(PATH_TO_FILE)
  }

  requestFtpDownload(resourcePath, updateUiOnProgress, runExeCallback)
})

// Start game
ipcMain.on(CHANNEL_RUN_GAME_EXE, (event, arg) => {
  const GAME_EXE_PATH = '\\Dat\\Release\\rwg-tow.exe'

  runExeFile(event, arg, CHANNEL_REPLY_RUN_GAME_EXE, 'game is running', GAME_EXE_PATH, arg)
})

// Start editor
ipcMain.on(CHANNEL_RUN_EDITOR_EXE, (event, arg) => {
  const EDITOR_EXE_PATH = '\\Editor\\RWG-ToW.exe'
  const FOLDER_EXE_PATH = `${arg}\\Editor`

  runExeFile(event, arg, CHANNEL_REPLY_RUN_EDITOR_EXE, 'editor is running', EDITOR_EXE_PATH, FOLDER_EXE_PATH)
})

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
