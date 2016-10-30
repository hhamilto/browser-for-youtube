const Jimp = require('jimp')
const imageToString = require('./src/image-to-string.js')
const LOGGER = require('log4js').getLogger('terminal-size-monitor.js')


const streamToString = require('stream-to-string')
//const terminalSizeMonitor = require('./src/terminal-size-monitor.js')
const childProcess = require('child_process')
const fileToDisplay = '/tmp/youtube-browser-PEbOUA/images/000060.jpeg'

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
	var termSize = {}
	termSize.cols = Number(lines[0].match(/^COLUMNS=([0-9]+);$/)[1])
	termSize.lines = Number(lines[1].match(/^LINES=([0-9]+);$/)[1])
	
	Jimp.read(fileToDisplay).then(function (frame) {
		console.log(imageToString(frame.bitmap, termSize))
	})


}).catch(e=>LOGGER.error(e))

