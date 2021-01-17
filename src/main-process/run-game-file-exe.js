/**
 *
 * @param event {IpcMainEvent}
 * @param eventArg {string}
 * @param eventChannel {string}
 * @param eventResponse {string}
 * @param filePath {string}
 * @param dirPath {string}
 */

function runExeFile(event, eventArg, eventChannel, eventResponse, filePath, dirPath) {
  const child = require('child_process').execFile

  child(`${eventArg}${filePath}`, { cwd: dirPath }, (err, data) => {
    if (err) console.error(err)
  });

  event.reply(eventChannel, eventResponse)
}

 module.exports = runExeFile
