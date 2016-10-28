
const jsdom = require('jsdom')
const fetch = require('node-fetch')
const _ = require('lodash/fp')
const LOGGER = require('log4js').getLogger('url-viewer')
const path = require('path')
const player = require('./image-displayer.js')

module.exports = url => {
  fetch(url)
  .then(_.invoke('text'))
  .then(htmlString => {
    LOGGER.debug('html fetched')

    const virtualConsole = jsdom.createVirtualConsole()

    const cookieJar = jsdom.createCookieJar()

    const document = jsdom.jsdom(htmlString, {
      url: url,
      virtualConsole,
      cookieJar,
      features: {
        FetchExternalResources: ['script', 'frame', 'iframe', 'link', 'img'],
        ProcessExternalResources: ['script'],
        SkipExternalResources: false
      }
    })
    const window = document.defaultView

    window.HTMLMediaElement.prototype.load = function load () {} // default jsdom impl throws in these methods. Change behavior to sullen and silent.
    window.HTMLMediaElement.prototype.pause = function pause () {}

    window.HTMLMediaElement.prototype.canPlayType = function canPlayType (type) {
      if(type.includes('video/mp4'))
        return "probably"
      return ""
    }

    window.HTMLMediaElement.prototype.play = function play () {
      LOGGER.debug('Play video attempted')
      LOGGER.debug('attempting to play src attr: ' + this.src)
        // escape jsdom page exection context so that errors thrown my my code crash the browser
      setImmediate(_.partial(startPlayer, [this.src]))
    }

    window.HTMLElement.prototype.clientHeight = 0 // youtube checks this and cries if its void 0

    window.addEventListener('DOMContentLoaded', (e) => {
      LOGGER.debug('DOMContentLoaded')
    })

    window.addEventListener('load', () => {
      LOGGER.debug('load event')
    })

  })
}

childProcess = require('child_process')

const FRAME_RATE = 2 // in fps. Gotta name that better...

const startPlayer = url => {
  const downloader = childProcess.fork(path.join(__dirname, 'video-fetcher.js'), [
    url,
    FRAME_RATE
  ], {
    //silent: true
  })
  downloader.on('message', message => {
    if (message.type == 'directory-info') {
      player(FRAME_RATE)(message.directories)
    } else {
      throw new Error('Unrecognized message type from cp')
    }
  })
}

