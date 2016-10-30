const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const _ = require('lodash/fp')
const Jimp = require('jimp')
const LOGGER = require('log4js').getLogger('image-displayer.js')
const imageToString = require('./image-to-string.js')
const terminalSizeMonitor = require('./terminal-size-monitor.js')

module.exports = frameRate => directories => {
  const msPerFrame = 1 / frameRate * 1000
  var frameFileList = []

  const frameListUpdateTask = setInterval(() => {
    fs.readdirAsync(directories.images).then(fileList => {
      frameFileList = fileList.sort()
    })
  }, msPerFrame)
  var displayedFrame = -1
  const frameDisplayTask = setInterval(() => {

    if (frameFileList.length == 0)
      return
    if (displayedFrame == frameFileList.length - 1)
      return
    //only start audio when we have the video to start
    const fileToDisplay = path.join(directories.images, frameFileList[++displayedFrame])
    Jimp.read(fileToDisplay).then(function (frame) {

      var start = Date.now()
      var toDisplay = imageToString(frame.bitmap, terminalSizeMonitor.getTerminalSize())
      console.log(toDisplay)
      var end = Date.now()
      console.log(end-start)

      beginAudioPlayback(directories.audio)
    })
  }, msPerFrame)

  const beginAudioPlayback = _.once((directory) => {
    childProcess.spawn('aplay', [
      'audio.wav'
    ], {
      cwd: directory
      , stdio: 'inherit'
    })//*/
  })

  LOGGER.info('img dir:' + directories.images)
}
