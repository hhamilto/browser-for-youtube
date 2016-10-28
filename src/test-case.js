
var fs = require('fs')
var childProcess = require('child_process')

console.log('pre-open')
/* fs.open("im-a-pipe", "w", function(err, fd){
	if(err)
		throw err
	console.log("opened")
}) */
console.log('post-open')
childProcess.exec('echo wat')
console.log('YOU CAN NOT SEE MEEE')

