from PIL import Image,ImageFont,ImageDraw
import numpy as np

from coordinateHandler import mapperCoordinateHandler

class curvedTextDrawer:

	def __init__(self):
		self.fpath  = "lordOfTheRings.ttf"
		self.textBoxSize = (200,200)

	def circleCoords(self,angle):
		return (800*np.array([np.cos(angle),np.sin(angle)])).astype(int)

	def generateTextImage(self,text,angle):
		textImage = Image.new('RGBA', self.textBoxSize,(0,0,0,0))

		draw = ImageDraw.Draw(textImage)
		font = ImageFont.truetype(self.fpath,100)
		textSize =  draw.textsize(text, font=font)
		
		textAnchor = np.array(self.textBoxSize)/2 -  (np.array(textSize)/2)

		draw.text(tuple(textAnchor),text,(255,0,255,255),font=font)
		textImage = textImage.rotate(angle,expand = 0)

		# a white image same size as rotated image
		fff = Image.new('RGBA', textImage.size, (255,)*4)
		# create a composite image using the alpha layer of rot as a mask
		# textImage = Image.composite(textImage, fff, textImage)

		return textImage

	def createBlankImage(self):
		self.masterImSize = (1000,1000)
		self.cH = mapperCoordinateHandler(self.masterImSize[0],self.masterImSize[1])
		self.masterImage = Image.new('RGBA', self.masterImSize,(255,255,255))
		self.draw = ImageDraw.Draw(self.masterImage)
	def loadImage(self,imageIn):
		self.masterImage = imageIn

	def drawTextAlongContour(self,text,contourPoints):
		textList = list(text)
		numPoints = len(textList)
		shiftedContour = np.array(map(self.cH.shiftCoords,contourPoints))

		linePoints,lineAngles = self.cH.generateLineData(shiftedContour,numPoints,smooth=1)

		tupleContour = map(tuple,shiftedContour)
		tupleInterpPoints = map(tuple,linePoints)

		self.draw.line(tupleInterpPoints,fill="blue",width=10)
		self.draw.line(tupleContour,fill="black",width=10)

		for anchor,angle,letter in zip(linePoints,lineAngles,textList):
			if angle < 0: angle +=180
			# anchor = self.cH.shiftCoords(anchor)
			textImg = self.generateTextImage(letter,angle - 90)
			iconOffset = -np.array([textImg.size[0],textImg.size[1]])/2
			self.masterImage.paste(textImg,tuple(anchor+iconOffset),textImg)

		return self.masterImage

	def drawTextAlongArc(self,text,startingAngle,endingAngle):
		angles = np.linspace(startingAngle,endingAngle,10)
		arcCoords = map(self.circleCoords,angles)
		return self.drawTextAlongContour(text,arcCoords)

cTD = curvedTextDrawer()
cTD.createBlankImage()

# testLine = np.array([(0,0),(100,150),(200,300),(200,400),(150,500)])
# testLine = np.array([(100,100),(200,200),(300,300),(500,500),(900,900)])
# testLine = np.array([(100,400),(200,400),(300,400),(400,400),(800,400)])
# testLine = np.array([(300,100),(300,200),(300,400),(300,600),(300,800)])[::-1]
# testLine = (np.array([[8779, 288], [8631, 6492], [8508, 6572], [8299, 6616], [8083, 6628], [7874, 6579], [7696, 6473], [7474, 6350]])/2)
# print cTD.circleCoords(1.6)
# testLine = map(cTD.circleCoords,np.linspace(0.05,(np.pi/2) - .1,5))[::-1]
testText = "High Meadows"
# cTD.drawTextAlongContour(testText,testLine).show()
cTD.drawTextAlongArc(testText,np.pi/2,.1).show()
# testImage = Image.open("antiqued.jpg").convert("RGBA")
# cTD.loadImage(testImage)

# startingAngle = 0
# endingAngle = np.pi/2
# text = "Meadowssssss"

# imgOut = cTD.drawTextAlongArc(text,startingAngle,endingAngle)
# imgOut.show()

# # # cTD.generateTextImage("W",0).show()