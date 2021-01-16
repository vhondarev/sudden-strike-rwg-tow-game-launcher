const fs = require('fs')
const path = require('path')
const FtpClient = require('ftp')

module.exports = function requestFtpDownload(url, progressCallback, callback) {
  // TODO check if file already uploaded

  const { username, password, host, pathname } = new URL(url)
  const PATH_TO_FILE = `${process.env.USERPROFILE}\\Downloads\\${path.basename(pathname)}`

  const ftp = new FtpClient()

  ftp.on('ready', function() {
    ftp.size(pathname, function(err, size) {
      if (err) throw err

      ftp.get(pathname, function(err, stream) {
        let gotten = 0

        if (err) throw err

        stream.once('close', function() {
          ftp.end()
        })

        stream.on('data', function(chunk) {
          gotten += chunk.length;
          progressCallback(gotten, size)
        })

        stream.pipe(fs.createWriteStream(PATH_TO_FILE).on('close', () => callback(PATH_TO_FILE)))
      })
    })
  })

  ftp.connect({ host: host, user: username, password: password })
}
