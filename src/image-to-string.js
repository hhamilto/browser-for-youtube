const _ = require('lodash')

paints = ['#', '$', '=', '-', ' ']
// cusor size: 9x18
var charWidthScreenPixels = 9
var charHeightScreenPixels = 18

module.exports = function (pictureInfo, termInfo) {
  var height = pictureInfo.height
  var width = pictureInfo.width
  var data = pictureInfo.data
  var lines = termInfo.lines
  var cols = termInfo.cols

  var imagePixelsPerLine = Math.floor(height / lines)
  var imagePixelsPerColumn = Math.floor(imagePixelsPerLine / 2)
  var imageColumns = Math.floor(width / imagePixelsPerColumn)

  console.log(imageColumns)
  if (imageColumns > cols)
		{ ; }// throw Error("fuck")

  var getPixelValue = function (x, y) {
    var baseOffSet = (y * width + x) * 4
    ans = [data[baseOffSet], data[baseOffSet + 1], data[baseOffSet + 2]]
    return ans
  }

  var pixelOffsetsPerChar = _.flatten(_.map(_.times(imagePixelsPerColumn), function (x) {
    return _.map(_.times(imagePixelsPerLine), function (y) {
      return [x, y]
    })
  }))

  var strToWrite = '\n\n\n\n\n\n\n\n\n'
  var charray = _.each(_.times(lines), function (line) {
    last = -1
    _.each(_.times(Math.floor(width / imagePixelsPerColumn)), function (col) {
      var topLeftPixel = [col * imagePixelsPerColumn, line * imagePixelsPerLine]
      total = _.reduce(_.map(pixelOffsetsPerChar, function (coords) {
        pixelValue = getPixelValue(topLeftPixel[0] + coords[0], topLeftPixel[1] + coords[1])
        return pixelValue
      }), function (prev, cur) {
        prev[0] += cur[0]
        prev[1] += cur[1]
        prev[2] += cur[2]
        return prev
      })
      total[0] = total[0] / (charWidthScreenPixels * charHeightScreenPixels) / 255
      total[1] = total[1] / (charWidthScreenPixels * charHeightScreenPixels) / 255
      total[2] = total[2] / (charWidthScreenPixels * charHeightScreenPixels) / 255

      var value = _.sum(total) / 3
      if (total[0] > (total[1] + total[2]) / 1.26) // red
  { strToWrite += '\x1b[31m' }
      else if (total[1] > (total[0] + total[2]) / 1.3) // green
  { strToWrite += '\x1b[32m' }
      else if (total[2] > (total[0] + total[1]) / 1.6) // blue
  { strToWrite += '\x1b[34m' }
      else
				{ strToWrite += '\x1b[0m' }

      if (value > 0.3) {
        strToWrite += paints[0]
      } else if (value > 0.2) {
        strToWrite += paints[1]
      } else if (value > 0.10) {
        strToWrite += paints[2]
      } else if (value > 0.04) {
        strToWrite += paints[3]
      } else {
        strToWrite += paints[4]
      }
    })
    strToWrite += '\n'
  })
  return strToWrite.substr(0, strToWrite.length - 1)
}
