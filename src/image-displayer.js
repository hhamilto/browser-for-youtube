const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
// const _ = require('lodash/fp')
const Jimp = require('jimp')
const LOGGER = require('log4js').getLogger('image-displayer.js')
const imageToString = require('./image-to-string.js')
const terminalSizeMonitor = require('./terminal-size-monitor.js')

module.exports = frameRate => directory => {
  const msPerFrame = 1 / frameRate * 1000
  var frameFileList = []

  const frameListUpdateTask = setInterval(() => {
    fs.readdirAsync(directory).then(fileList => {
      frameFileList = fileList.sort()
    })
  }, msPerFrame)
  var displayedFrame = 0
  const frameDisplayTask = setInterval(() => {
    if (frameFileList.length == 0)
			{ return }
    if (displayedFrame == frameFileList.length - 1)
			{ return }
    const fileToDisplay = path.join(directory, frameFileList[displayedFrame++])
    Jimp.read(fileToDisplay).then(function (frame) {
      console.log(imageToString(frame.bitmap, terminalSizeMonitor.getTerminalSize()))
    })
  }, msPerFrame)

  LOGGER.info('img dir:' + directory)
}
