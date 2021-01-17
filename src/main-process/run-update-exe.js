const Shell = require('node-powershell')
const path = require('path')

/**
 *
 * @param filePath {string}
 * @param callback
 */

function runUpdateExe(filePath, callback) {
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true
  });

  ps.addCommand(`Start-Process RunAs -FilePath ${filePath}`);

  function checkIfProcessAlive() {
    ps.addCommand(`Get-Process ${path.parse(filePath).name} | select -expand id`)
    return ps.invoke()
  }

  const watchUpdateProcess = (period) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        checkIfProcessAlive()
          .then((data) => {
            if (data === undefined) {
              clearInterval(interval);
              callback()
              resolve('finished')
            }
          })
          .catch((err) => {
            clearInterval(interval)
            callback()
            console.error('Promise interval rejected', err.name)
          })
      }, period)
    })
  }

  ps.invoke()
    .then((output) => {
      return watchUpdateProcess(2000)
    })
    .catch((err) => {
      console.error('output ERROR !!! \n', err.name)
      callback()
    });
}

module.exports = runUpdateExe
