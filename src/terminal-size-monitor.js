
const childProcess = require('child_process')
const streamToString = require('stream-to-string')
const LOGGER = require('log4js').getLogger('terminal-size-monitor.js')

LOGGER.setLevel('info')

const termSize = {
  cols: 1,
  lines: 1
}

const terminalSizeUpdateTask = setInterval(() => {
  const resizeProcess = childProcess.spawn('resize')
  resizeProcess.on('error', e=>{
    LOGGER.error(e)
  })
  resizeProcess.on('exit', code=>{
    LOGGER.debug('resize exited with code: ' + code)
  })
  streamToString(resizeProcess.stdout)
  .then(output => {
    if(output == ''){
      return //ignore it (happens if user is typing sometimes)
    }
    var lines = output.split('\n')
    if(lines.length != 4)
      throw new Error('unexpected output: ' + output)
    termSize.cols = Number(lines[0].match(/^COLUMNS=([0-9]+);$/)[1])
    termSize.lines = Number(lines[1].match(/^LINES=([0-9]+);$/)[1])
  }).catch(e=>LOGGER.error(e))
}, 500)

module.exports = {
  getTerminalSize: () => termSize
}
