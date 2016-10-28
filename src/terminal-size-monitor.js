
const childProcess = require('child_process')
const streamToString = require('stream-to-string')

const termSize = {
  cols: 1,
  lines: 1
}

const terminalSizeUpdateTask = setInterval(() => {
  const resizeProcess = childProcess.spawn('resize')
  streamToString(resizeProcess.stdout)
	.then(output => {
  var lines = output.split('\n')
  termSize.cols = Number(lines[0].match(/^COLUMNS=([0-9]+);$/)[1])
  termSize.lines = Number(lines[1].match(/^LINES=([0-9]+);$/)[1])
})
}, 500)

module.exports = {
  getTerminalSize: () => termSize
}
