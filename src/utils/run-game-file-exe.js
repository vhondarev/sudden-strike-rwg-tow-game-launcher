function runExeFile(event, eventArg, eventChannel, eventResponse, filePath, dirPath) {
  const child = require('child_process').execFile

  child(`${eventArg}${filePath}`, { cwd: dirPath }, (err, data) => {
    if (err) console.error(err)
  });

  event.reply(eventChannel, eventResponse)
}

 module.exports = runExeFile