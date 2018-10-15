# # from PIL import Image
# # from PIL import ImageFont
# # from PIL import ImageChops
# # import PIL.ImageOps
# directory = "icons/"
# # im = Image.open(directory + filename)

# # bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
# # diff = ImageChops.difference(im, bg)
# # diff = ImageChops.add(diff, diff, 2.0, -100)

# # bbox = diff.getbbox()
# # cropped = im.crop(bbox)
# # cropped.show()

# from PIL import Image, ImageChops

# def trim(im):
#     bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
#     diff = ImageChops.difference(im, bg)
#     diff = ImageChops.add(diff, diff, 2.0, -100)
#     # diff.show()

#     bbox = diff.getbbox()
#     if bbox:
#         return im.crop(bbox)
#     print 1
# im = Image.open(directory + filename)
# im = trim(im)
# # im.show()

import numpy as np


def euclidDist(p1,p2):
	dp = np.array(p1) - np.array(p2)
	return np.linalg.norm(dp)

def getLegLengths(pointsList):
	legLengths = []

	for pointIndex in range(len(pointsList)-1):
		p1 = pointsList[pointIndex]
		p2 = pointsList[pointIndex+1]

		legLength = euclidDist(p1,p2)
		legLengths.append(legLength)

	return legLengths

def getXcoords(coordsList,numCoords = 10):
	legLengths = np.array(getLegLengths(coordsList))

	times = np.linspace(0,1,numCoords)

	normalizedLegLengths = legLengths/sum(legLengths)

	timeStamps = list(np.cumsum(normalizedLegLengths))
	timeStamps = [0] + timeStamps

	def getInterpTime(timeIn):
		return np.transpose([np.interp(timeIn, timeStamps,coordsList[:,variableIndex]) for variableIndex in range(coordsList.shape[1])])

	print getInterpTime(times)

coordsList = np.array([[0,0],[1,1],[2,0],[3,1]])

getXcoords(coordsList,5)

# def getFenceMarkSpots(coordsList):
# 	xp = [1, 2, 3]
# 	fp = [3, 2, 0]
# 	print np.interp(2.5, xp, fp)


# getFenceMarkSpots(1)

