const { ipcRenderer, shell } = require('electron')

const { IPC_CHANNELS } = require('./constants')

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

// Local mutable state
window.localStateData = {
  loadProgress: {
    local: false,
    remote: false,
  },
  latestPatch: null,
  currentPatch: null,
  registry: {},
  patches: {},
}

const localStateData = window.localStateData

// const userLanguage = window.navigator.language
// console.log('userLanguage', userLanguage)

// open external links in default browser instead electron app
const externalLinks = window.document.querySelectorAll('.external-links a');
externalLinks.forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault()

    if (e.target.nodeName !== 'A') {
      return shell.openExternal(e.target.closest('a').href)
    }

    return shell.openExternal(e.target.href)
  })
})

function getElById(name) {
  return window.document.getElementById(name)
}

const elBtnRunGame = getElById('run-game')
const elBtnRunEditor = getElById('run-editor')
const elBtnUpdateGame = getElById('update-game')
const elProgressBar = getElById('progress-data')
const elProgressValue = getElById('progress-value')
const elVersionText = getElById('game-version')
const elAvailableVersionText = getElById('available-game-version')
const elVersionBlock = window.document.querySelector('.game-versions')

function updateProgressBar(value) {
  if (value === 0) {
    elProgressValue.innerHTML = ''
  } else {
    elProgressValue.innerHTML = value + '%'
  }

  elProgressBar.style.width = value + '%'
}


// fetch remote version
ipcRenderer.send(CHANNEL_GET_REMOTE_DATA, 'get-version')
ipcRenderer.on(CHANNEL_REPLY_GET_REMOTE_DATA, (event, arg) => {
  const latestPatch = Math.max(...Object.keys(arg.patches))

  localStateData.patches = arg.patches
  localStateData.latestPatch = latestPatch
  localStateData.loadProgress.remote = true

  elAvailableVersionText.innerHTML = latestPatch

  checkIfNeedToUpdateBtn();
})

// Get game version with regedit
ipcRenderer.send(CHANNEL_GET_REGISTRY_DATA, 'get-local-version')
ipcRenderer.on(CHANNEL_REPLY_GET_REGISTRY_DATA, (event, arg) => {
  const currentPatch = Object.values(arg)[0].values.Version.value

  localStateData.registry = Object.values(arg)[0].values
  localStateData.currentPatch = currentPatch
  localStateData.loadProgress.local = true

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
      localStateData.loadProgress.local = false
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
    installDir: localStateData.registry.InstallDir.value,
    currentPatch: localStateData.currentPatch,
    patches: localStateData.patches,
  })

  ipcRenderer.on(CHANNEL_REPLY_DOWNLOAD_UPDATE, (event, arg) => {
    updateProgressBar(arg)
  })
})

// Start game
elBtnRunGame.addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_RUN_GAME_EXE, localStateData.registry.InstallDir.value)
  ipcRenderer.on(CHANNEL_REPLY_RUN_GAME_EXE, (event, arg) => {
    console.log(arg)
  })
})

// Start editor
elBtnRunEditor.addEventListener('click', () => {
  ipcRenderer.send(CHANNEL_RUN_EDITOR_EXE, localStateData.registry.InstallDir.value)
  ipcRenderer.on(CHANNEL_REPLY_RUN_EDITOR_EXE, (event, arg) => {
    console.log(arg)
  })
})

function checkIfNeedToUpdateBtn() {
  if(localStateData.loadProgress.local && localStateData.loadProgress.remote) {
    elBtnRunGame.disabled = false
    elBtnUpdateGame.disabled = false

    if (Number(localStateData.latestPatch) === Number(localStateData.currentPatch)) {
      elBtnUpdateGame.classList.add('hidden')
      elVersionBlock.classList.add('latest')
    } else {
      elVersionBlock.classList.remove('latest')
      elBtnUpdateGame.classList.remove('hidden')
    }
  }
}
