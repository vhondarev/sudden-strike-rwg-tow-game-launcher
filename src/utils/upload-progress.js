function calcDownloadProgress(gotten, size) {
  return Math.round((gotten * 100) / size)
}

module.exports = calcDownloadProgress