const { ipcRenderer } = require('electron')

const { IPC_CHANNELS: {
  CHANNEL_REPLY_GET_REMOTE_DATA,
  CHANNEL_REPLY_RUN_GAME_EXE,
  CHANNEL_REPLY_RUN_EDITOR_EXE,
  CHANNEL_REPLY_DOWNLOAD_UPDATE,
  CHANNEL_REPLY_RUN_GAME_UPDATE_EXE,
  CHANNEL_REPLY_GET_REGISTRY_DATA,
  CHANNEL_GET_REGISTRY_DATA,
} } = require('../shared/constants')
const { getElById, updateProgressBar, checkIfNeedToUpdateBtn } = require('./ui')
const localStateData = require('./local-state')


const elAvailableVersionText = getElById('available-game-version')
const elVersionText = getElById('game-version')

function initIpcRendererListeners() {
  ipcRenderer.on(CHANNEL_REPLY_GET_REMOTE_DATA, (event, arg) => {
    const latestPatch = Math.max(...Object.keys(arg.patches))

    localStateData.patches = arg.patches
    localStateData.latestPatch = latestPatch
    localStateData.loadProgress.remote = true

    elAvailableVersionText.innerHTML = latestPatch

    checkIfNeedToUpdateBtn();
  })

  ipcRenderer.on(CHANNEL_REPLY_DOWNLOAD_UPDATE, (event, arg) => {
    updateProgressBar(arg)
  })

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
    // TODO refactor that listener
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

  ipcRenderer.on(CHANNEL_REPLY_RUN_GAME_EXE, (event, arg) => {
    console.log(arg)
  })

  ipcRenderer.on(CHANNEL_REPLY_RUN_EDITOR_EXE, (event, arg) => {
    console.log(arg)
  })
}

module.exports = initIpcRendererListeners
