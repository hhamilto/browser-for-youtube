const fs = require('fs-extra')
const path = require('path')
const readline = require('readline')
const urlViewer = require('./url-viewer.js')

console.log(fs.readFileSync(path.join(__dirname, '..', 'banner-texts', '120col.txt')).toString())

if (false && true) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('What youtube url do you want to watch? ', (answer) => {
    urlViewer(answer)
    rl.close()
  })
} else
  { urlViewer('https://www.youtube.com/watch?v=d9TpRfDdyU0') }
