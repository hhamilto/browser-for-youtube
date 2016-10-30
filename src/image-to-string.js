const _ = require('lodash')

paints = ['#', '=', '-', ' ']
// cusor size: 9x18
var charWidthScreenPixels = 9
var charHeightScreenPixels = 18



module.exports = function (pictureInfo, termInfo) {
	const CHAR_WIDTH_EMS = 1
	const CHAR_HEIGHT_EMS = (charHeightScreenPixels/charWidthScreenPixels)
	const termWidthEms = termInfo.cols
	const termHeightEms = termInfo.lines*CHAR_HEIGHT_EMS

	const ratioWidthPxToEm = pictureInfo.width/termWidthEms
	const ratioHeightPxToEm = pictureInfo.height/termHeightEms

	// used in all future scaling operations. Math.max chooses the ratio that constrains us more (relation of video aspect ratio to terminal aspect ratio)
	// to say it a different way, we need to scale a bunch of pixels into a char, and we don't want to scale too few

	const pixelsPerEm = Math.max(ratioWidthPxToEm, ratioHeightPxToEm)
	const charWidthPx = pixelsPerEm * CHAR_WIDTH_EMS
	const charHeightPx = pixelsPerEm * CHAR_HEIGHT_EMS
	const imageWidthChars = Math.floor(pictureInfo.width / charWidthPx)
	const imageHeightChars = Math.floor(pictureInfo.height / charHeightPx)

/*	console.log('termWidthEms: ' + termWidthEms)
	console.log('termHeightEms: ' + termHeightEms)
	console.log('pictureInfo.width: ' + pictureInfo.width)
	console.log('pictureInfo.height: ' + pictureInfo.height)
	console.log(ratioWidthPxToEm, ratioHeightPxToEm)
*/
	var getPixelValue = function (x, y) {
		var baseOffSet = (y * pictureInfo.width + x) * 4
		ans = [pictureInfo.data[baseOffSet], pictureInfo.data[baseOffSet + 1], pictureInfo.data[baseOffSet + 2]]
		return ans
	}

	var averageCharPixel = (column, line) => {
		const topOffsetPx = Math.floor(line*pixelsPerEm*CHAR_HEIGHT_EMS)
		const leftOffsetPx = Math.floor(column*pixelsPerEm*CHAR_WIDTH_EMS)
		var charPixel = [0,0,0]
		var pixelValue // block scope is slow in this old version of node I wrote this in
		for (i = leftOffsetPx; i<leftOffsetPx+charWidthPx; i++)
			for (j = topOffsetPx; j<topOffsetPx+charHeightPx; j++) {
				pixelValue = getPixelValue(i,j)
				charPixel[0]+=pixelValue[0]
				charPixel[1]+=pixelValue[1]
				charPixel[2]+=pixelValue[2]
			}
		charPixel[0] /= charWidthPx*charHeightPx*255
		charPixel[1] /= charWidthPx*charHeightPx*255
		charPixel[2] /= charWidthPx*charHeightPx*255
		return charPixel
	}


	var prefix = '\n\n\n\n\n\n\n\n\n'
/*
	console.log('imageWidthChars: ' + imageWidthChars)
	console.log('imageHeightChars: ' + imageHeightChars)
	console.log(averageCharPixel(0,0))
	console.log(averageCharPixel(1,0))
	process.exit()
*/

	charsToDisplay = new Array(imageHeightChars)
	for (lineIndex = 0; lineIndex < charsToDisplay.length; lineIndex++) {
		var line = new Array(imageWidthChars)
		for (colIndex = 0; colIndex < line.length; colIndex++) {
			var charPixel = averageCharPixel(colIndex, lineIndex)
			var strToWrite = ''
			var value = _.sum(charPixel) / 3
			var colored = true
			if (charPixel[0] > (charPixel[1] + charPixel[2]) / 1.26) // red
				strToWrite += '\x1b[31m' 
			else if (charPixel[1] > (charPixel[0] + charPixel[2]) / 1.3) // green
				strToWrite += '\x1b[32m' 
			else if (charPixel[2] > (charPixel[0] + charPixel[1]) / 1.6) // blue
				strToWrite += '\x1b[34m' 
			else
				colored = false
			
//IDEA: "White balance" style correction to keep image from getting washed out or blacked out. ie. dynamically adjust breakpoints for paint char usage to get good balance.
			if (value > 0.75) {
				strToWrite += paints[0]
			} else if (value > 0.5) {
				strToWrite += paints[1]
			} else if (value > 0.25) {
				strToWrite += paints[2]
			} else {
				strToWrite += paints[3]
			}
			
			if (colored)
				strToWrite += '\x1b[0m'
			
			line[colIndex] = strToWrite
			//process.stdout.write(strToWrite)
		}
		charsToDisplay[lineIndex] = line.join('')
		//process.exit()
	}
	
	return prefix + charsToDisplay.join('\n')
}
