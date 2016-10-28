const jsdom = require('jsdom')
const fetch = require('node-fetch')
const _ = require('lodash/fp')
const LOGGER = require('log4js').getLogger('index')
const url = require('url')
const fs = require('fs-extra')

const tamperedBaseJS = ''//fs.readFileSync('tamperedBase.js')
/*
parsedURL = url.parse('//s.ytimg.com/yts/jsbin/www-en_US-vflYdU1dj/base.js')
console.log(parsedURL.path)
process.exit()
*/

fetch('https://www.youtube.com/watch?v=6C6CzEEKaXQ')
// fetch('https://www.youtube.com/watch?v=q4rVYegPglg')
.then(_.invoke('text'))
.then(html => {
  LOGGER.info('html fetched')

  var virtualConsole = jsdom.createVirtualConsole()

  var cookieJar = jsdom.createCookieJar()

  var resourceLoader = (resource, callback) => {
		// gotta love a resouce loader
    if (false && resource.url.path.search(/\/yts\/jsbin\/player-en_US-[^/]*\/base\.js/) != -1) {
      setTimeout(() => {
        callback(null, tamperedBaseJS)
      })
    } else {
      var formatted = url.format(resource.url)
      console.log('Fetching: ' + (formatted.length > 60 ? formatted.substr(0, 57) + ' ...' : formatted))
      return resource.defaultFetch(callback)
    }
  }

  virtualConsole.on('log', function (...messages) {
    console.log('BROWSER console.log called:')
    console.log(...messages)
    console.log()
  })

  virtualConsole.on('error', function (message) {
    console.log('console.error called ->', message)
  })

  var document = jsdom.jsdom(html, {
    url: 'https://www.youtube.com/watch?v=q4rVYegPglg',
    virtualConsole,
    resourceLoader,
    cookieJar,
    features: {
      FetchExternalResources: ['script', 'frame', 'iframe', 'link', 'img'],
      ProcessExternalResources: ['script'],
      SkipExternalResources: false
    }
  })

  virtualConsole.on('jsdomError', (error) => {
    if (error.stack.toString().includes('__ytRIL'))
			{ return }
    console.log('jsdomee')
    console.error(error.stack)
    console.error(error.detail)
		// process.exit()
    console.log('ee')
  })

  var window = document.defaultView

  window.HTMLMediaElement.prototype.load = function load () {
    console.log('load')
    console.log('src=' + this.src)
  }
  window.HTMLMediaElement.prototype.pause = function pause () {
    console.log('pause')
  }

  window.HTMLMediaElement.prototype.play = function play () {
    LOGGER.info('Play video attempted')
    LOGGER.info('attempting to play src attr: ' + this.src)
    downloadAndProcessVideo(this.src)
  }

  window.HTMLElement.prototype.clientHeight = 0
/*
	window.addEventListener('error', (error)=>{
		console.log("ee")
		console.error(error.error.stack)
		console.error(error.error.fileName)
		console.log(document._currentScript)
		console.log("ee")
	})
*/
  window.addEventListener('DOMContentLoaded', (e) => {
    LOGGER.info('DOMContentLoaded!')
  })

  window.addEventListener('load', (e) => {
    LOGGER.info('load')
		/*
		console.log(document.getElementsByTagName('video').length)
		var attrs = document.getElementsByTagName('video')[0].attributes
		var output = ""
		for(var i = attrs.length - 1; i >= 0; i--) {
			output += attrs[i].name + "->" + attrs[i].value+'\n'
		}
		LOGGER.info('attrs: ')
		LOGGER.info(output) */
  })
})

var downloadAndProcessVideo = _.once((url) => {
  process.exit()
  fetch(url)
	.then(res => {
  writeFile = fs.createWriteStream('videoprocessing/videopipe.mp4')
  res.body.pipe(writeFile)
})
})

setInterval(_.noop, 10000)
