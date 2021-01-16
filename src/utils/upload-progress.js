/**
 *
 * @param gotten {number}
 * @param size {number}
 * @returns {number}
 */

function calcDownloadProgress(gotten, size) {
  return Math.round((gotten * 100) / size)
}

module.exports = calcDownloadProgress
