const initExternalLinks = require('./renderer-process/init-external-links')
const initIpcRendererListeners = require('./renderer-process/ipc-renderer-listeners')
const { initUiListeners, initUiData } = require('./renderer-process/ui')


initExternalLinks()

initIpcRendererListeners()

initUiListeners()

initUiData()
