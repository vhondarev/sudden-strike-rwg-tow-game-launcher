const { ipcRenderer } = require('electron')

const { IPC_CHANNELS: {
  CHANNEL_RUN_GAME_EXE,
  CHANNEL_RUN_EDITOR_EXE,
  CHANNEL_DOWNLOAD_UPDATE,
  CHANNEL_GET_REMOTE_DATA,
  CHANNEL_GET_REGISTRY_DATA,
} } = require('../shared/constants')

const localStateData = require('./local-state')


function getElById(name) {
  return window.document.getElementById(name)
}

// const userLanguage = window.navigator.language
// console.log('userLanguage', userLanguage)

const elBtnRunGame = getElById('run-game')
const elBtnRunEditor = getElById('run-editor')
const elBtnUpdateGame = getElById('update-game')
const elProgressBar = getElById('progress-data')
const elProgressValue = getElById('progress-value')
const elVersionBlock = window.document.querySelector('.game-versions')

function updateProgressBar(value) {
  if (value === 0) {
    elProgressValue.innerHTML = ''
  } else {
    elProgressValue.innerHTML = value + '%'
  }
  elProgressBar.style.width = value + '%'
}

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

function initUiListeners() {
  // Start game update
  elBtnUpdateGame.addEventListener('click', () => {
    elBtnUpdateGame.disabled = true
    elBtnRunGame.disabled = true

    ipcRenderer.send(CHANNEL_DOWNLOAD_UPDATE, {
      installDir: localStateData.registry.InstallDir.value,
      currentPatch: localStateData.currentPatch,
      patches: localStateData.patches,
    })
  })

  // Start game
  elBtnRunGame.addEventListener('click', () => {
    ipcRenderer.send(CHANNEL_RUN_GAME_EXE, localStateData.registry.InstallDir.value)
  })

  // Start editor
  elBtnRunEditor.addEventListener('click', () => {
    ipcRenderer.send(CHANNEL_RUN_EDITOR_EXE, localStateData.registry.InstallDir.value)
  })
}

function initUiData() {
  ipcRenderer.send(CHANNEL_GET_REMOTE_DATA)
  ipcRenderer.send(CHANNEL_GET_REGISTRY_DATA)
}

module.exports = {
  getElById,
  updateProgressBar,
  checkIfNeedToUpdateBtn,
  initUiListeners,
  initUiData,
}
