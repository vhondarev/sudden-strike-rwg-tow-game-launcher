const { ipcRenderer, shell } = require('electron')

const { IPC_CHANNELS } = require('./constants')

// Local mutable state
window.loadProgress = {
  local: false,
  remote: false,
}

window.data = {
  latestPatch: null,
  currentPatch: null,
  registry: {},
  patches: {},
}

const userLanguage = window.navigator.language

// console.log('userLanguage', userLanguage)

const externalLinks = window.document.querySelectorAll('.external-links a');
externalLinks.forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.nodeName !== 'A') {
      return shell.openExternal(e.target.closest('a').href)
    }

    return shell.openExternal(e.target.href)
  })
})

function getElById(name) {
  return window.document.getElementById(name);
}

const elBtnRunGame = getElById('run-game')
const elBtnRunEditor = getElById('run-editor')
const elBtnUpdateGame = getElById('update-game')
const elProgressBar = getElById('progress-data')
const elProgressValue = getElById('progress-value')
const elVersionText = getElById('game-version')
const elAvaliableVersionText = getElById('avaliable-game-version')
const elVersionBlock = window.document.querySelector('.game-versions')

function updateProgressBar(value) {
  if (value === 0) {
    elProgressValue.innerHTML = '';
  } else {
    elProgressValue.innerHTML = value + '%'
  }

  elProgressBar.style.width = value + '%'
}

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
} = IPC_CHANNELS;

let SYNC_UPDATE = false

// fetch remote version
ipcRenderer.send(CHANNEL_GET_REMOTE_DATA, 'get-version')
ipcRenderer.on(CHANNEL_REPLY_GET_REMOTE_DATA, (event, arg) => {
  const latestPatch = Math.max(...Object.keys(arg.patches))

  window.data.patches = arg.patches
  window.data.latestPatch = latestPatch
  window.loadProgress.remote = true

  elAvaliableVersionText.innerHTML = latestPatch

  checkIfNeedToUpdateBtn();

  if (SYNC_UPDATE) {
    SYNC_UPDATE = false
    ipcRenderer.send(CHANNEL_DOWNLOAD_UPDATE, {
      installDir: window.data.registry.InstallDir.value,
      currentPatch: window.data.currentPatch,
      patches: window.data.patches,
    })
  }
})

// Get game version with regedit
ipcRenderer.send(CHANNEL_GET_REGISTRY_DATA, 'get-local-version')
ipcRenderer.on(CHANNEL_REPLY_GET_REGISTRY_DATA, (event, arg) => {
  const currentPatch = Object.values(arg)[0].values.Version.value

  window.data.registry = Object.values(arg)[0].values
  window.data.currentPatch = currentPatch
  window.loadProgress.local = true

  elVersionText.innerHTML = currentPatch

  checkIfNeedToUpdateBtn()

  console.log('REGISTRY IS UPDATED')
})

ipcRenderer.on(CHANNEL_REPLY_RUN_GAME_UPDATE_EXE, (event, arg) => {
  console.log(CHANNEL_REPLY_RUN_GAME_UPDATE_EXE)
  console.log(arg)

  switch (arg) {
    case 'start':
      return

    case 'end':
      console.log('UPDATING REGEDIT')
      window.loadProgress.local = false
      updateProgressBar(0)
      ipcRenderer.send(CHANNEL_GET_REGISTRY_DATA, 'get-local-version')
      return

    default:
      return

  }
})

// Start game update
elBtnUpdateGame.addEventListener('click', () => {
  elBtnUpdateGame.disabled = true
  elBtnRunGame.disabled = true

  ipcRenderer.send(CHANNEL_DOWNLOAD_UPDATE, {
    installDir: window.data.registry.InstallDir.value,
    currentPatch: window.data.currentPatch,
    patches: window.data.patches,
  })

  ipcRenderer.on(CHANNEL_REPLY_DOWNLOAD_UPDATE, (event, arg) => {
    updateProgressBar(arg)
  })
})

// Start game
elBtnRunGame.addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_RUN_GAME_EXE, window.data.registry.InstallDir.value)
  ipcRenderer.on(CHANNEL_REPLY_RUN_GAME_EXE, (event, arg) => {
    console.log(arg)
  })
})

// Start editor
elBtnRunEditor.addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_RUN_EDITOR_EXE, window.data.registry.InstallDir.value)
  ipcRenderer.on(CHANNEL_REPLY_RUN_EDITOR_EXE, (event, arg) => {
    console.log(arg)
  })
})

function checkIfNeedToUpdateBtn() {
  if(window.loadProgress.local && window.loadProgress.remote) {
    elBtnRunGame.disabled = false
    elBtnUpdateGame.disabled = false

    if (Number(window.data.latestPatch) === Number(window.data.currentPatch)) {
      elBtnUpdateGame.classList.add('hidden')
      elVersionBlock.classList.add('latest')
    } else {
      elVersionBlock.classList.remove('latest')
      elBtnUpdateGame.classList.remove('hidden')
    }
  }
}