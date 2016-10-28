
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

const sendParent = process.send ? process.send.bind(process) : _.noop


Promise.all([
  fetch(VIDEO_URL),
  fs.mkdtempAsync(path.join(os.tmpdir(), 'youtube-browser-'))
  .then(tmpDirPath => {
    const IMAGE_DIRECTORY = path.join(tmpDirPath, 'images')
    const AUDIO_DIRECTORY = path.join(tmpDirPath, 'audio')
    sendParent({
      type: 'directory-info',
      directories: {
        images: IMAGE_DIRECTORY,
        audio: AUDIO_DIRECTORY
      }
    })
    const VIDEO_PIPE_PATH = path.join(tmpDirPath, 'video-pipe')
    const AUDIO_PIPE_PATH = path.join(tmpDirPath, 'audio-pipe')
    mkfifo.mkfifoSync(VIDEO_PIPE_PATH, 0o644)
    mkfifo.mkfifoSync(AUDIO_PIPE_PATH, 0o644)
    return Promise.all([
      VIDEO_PIPE_PATH,
      AUDIO_PIPE_PATH,
      fs.mkdirAsync(IMAGE_DIRECTORY).then(() => IMAGE_DIRECTORY),
      fs.mkdirAsync(AUDIO_DIRECTORY).then(() => AUDIO_DIRECTORY)
    ])
  })
])
.then(_.flatten)
.then(_.spread((youtubeResponse, videoPipePath, audioPipePath, imageDirectory, audioDirectory) => {
  childProcess.spawn('/usr/bin/ffmpeg', [
    '-i',
    videoPipePath,
    '-r',
    FRAME_RATE,
    '%06d.jpeg'
  ], {
    cwd: imageDirectory
    // stdio: 'inherit'
  })//*/
  //ffmpeg -i sample.avi -q:a 0 -map a sample.mp3
  childProcess.spawn('/usr/bin/ffmpeg', [
    '-i',
    audioPipePath,
    '-vn',
    '-acodec',
    'pcm_s16le',
    '-map',
    'a',
    'audio.wav'
  ], {
    cwd: audioDirectory
    //, stdio: 'inherit'
  })//*/
  youtubeResponse.body.pipe(fs.createWriteStream(videoPipePath))
  youtubeResponse.body.pipe(fs.createWriteStream(audioPipePath))
}))
