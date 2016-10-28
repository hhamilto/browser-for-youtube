
const _ = require('lodash/fp')
const os = require('os')
const path = require('path')
const Promise = require('bluebird')
const fetch = require('node-fetch')
const mkfifo = Promise.promisifyAll(require('mkfifo'))
const fs = Promise.promisifyAll(require('fs-extra'))
const childProcess = require('child_process')
const LOGGER = require('log4js').getLogger('video-fetcher.js')

const VIDEO_URL = process.argv[2]
const FRAME_RATE = process.argv[3]

LOGGER.info('FRAME RATE: ' + FRAME_RATE)

const sendParentImageDirectory = process.send
  ? directory => process.send({
    type: 'images-directory',
    directory
  })
  : _.noop

Promise.all([
  fetch(VIDEO_URL),
  fs.mkdtempAsync(path.join(os.tmpdir(), 'youtube-browser-'))
  .then(tmpDirPath => {
    const IMAGE_DIRECTORY = path.join(tmpDirPath, 'images')
    sendParentImageDirectory(IMAGE_DIRECTORY)
    const PIPE_PATH = path.join(tmpDirPath, 'video-pipe')
    mkfifo.mkfifoSync(PIPE_PATH, 0o644)
    return Promise.all([
      PIPE_PATH,
      fs.mkdirAsync(IMAGE_DIRECTORY).then(() => IMAGE_DIRECTORY)
    ])
  })
])
.then(_.flatten)
.then(_.spread((youtubeResponse, pipePath, imageDirectory) => {
  childProcess.spawn('/usr/bin/ffmpeg', [
    '-i',
    pipePath,
    '-r',
    FRAME_RATE,
    '%06d.jpeg'
  ], {
    cwd: imageDirectory
    // stdio: 'inherit'
  })
  youtubeResponse.body.pipe(fs.createWriteStream(pipePath))
}))
