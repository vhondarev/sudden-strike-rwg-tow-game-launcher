// Local mutable state
const localStateData = {
  loadProgress: {
    local: false,
    remote: false,
  },
  latestPatch: null,
  currentPatch: null,
  registry: {},
  patches: {},
}

window.localStateData = localStateData;

module.exports = localStateData
