from PIL import Image,ImageFont,ImageDraw
import numpy as np
from coordinateHandler import mapperCoordinateHandler

class curvedTextDrawer:

	def __init__(self,fontSize):
		fpath  = "lordOfTheRings.ttf"
		self.font  = ImageFont.truetype(fpath,fontSize)
		self.textBoxSize = (200,200)
		self.createBlankImage((1000,1000))

	def circleCoords(self,radius,angle=0):
		return (radius*np.array([np.cos(angle),np.sin(angle)])).astype(int)

	def generateTextImage(self,text,angle):
		textImage = Image.new('RGBA', self.textBoxSize,(0,0,0,0))
		draw = ImageDraw.Draw(textImage)

		textSize =  draw.textsize(text, font=self.font)
		textAnchor = np.array(self.textBoxSize)/2 -  (np.array(textSize)/2)

		draw.text(tuple(textAnchor),text,(0,0,0,255),font=self.font)
		textImage = textImage.rotate(angle,expand = 0)
		return textImage

	def createBlankImage(self,masterImSize):
		blankImage = Image.new('RGBA', masterImSize,(255,255,255))
		self.loadImage(blankImage)

	def loadImage(self,imageIn):
		self.masterImage = imageIn
		self.draw = ImageDraw.Draw(self.masterImage)
		self.masterImSize = imageIn.size
		self.cH = mapperCoordinateHandler(self.masterImSize[0],self.masterImSize[1])

	def drawTextAlongContour(self,text,contourPoints):
		textList = list(text)
		numPoints = len(textList)
		shiftedContour = np.array(list(map(self.cH.shiftCoords,contourPoints)))

		linePoints,lineAngles = self.cH.generateLineData(shiftedContour,numPoints,smooth=2)

		# tupleContour = map(tuple,shiftedContour)
		# tupleInterpPoints = map(tuple,linePoints)

		# self.draw.line(tupleInterpPoints,fill="blue",width=10)
		# self.draw.line(tupleContour,fill="black",width=10)

		for anchor,angle,letter in zip(linePoints,lineAngles,textList):
			if angle < 0: angle +=180
			# anchor = self.cH.shiftCoords(anchor)
			textImg = self.generateTextImage(letter,angle - 90)
			iconOffset = (-np.array([textImg.size[0],textImg.size[1]])/2).astype(int)
			self.masterImage.paste(textImg,tuple(anchor+iconOffset),textImg)

		return self.masterImage

	def drawTextAlongArc(self,text,radius,startingAngle,endingAngle):
		angles = np.linspace(startingAngle,endingAngle,10)
		arcCoords = [self.circleCoords(radius,angle) for angle in angles]
		return self.drawTextAlongContour(text,arcCoords)


# cTD = curvedTextDrawer(30)

def testCTD():
	cTD = curvedTextDrawer(30)
	testText = "Test text"

	#Blank image
	cTD.createBlankImage((1000,1000))

	#supplied image
	# testImage = Image.open("antiqued.jpg").convert("RGBA")
	cTD.loadImage(testImage)

	# testLine = np.array([(0,0),(100,150),(200,300),(200,400),(150,500)])
	# testLine = np.array([(100,100),(200,200),(300,300),(500,500),(900,900)])
	# testLine = np.array([(100,400),(200,400),(300,400),(400,400),(800,400)])
	# testLine = np.array([(300,100),(300,200),(300,400),(300,600),(300,800)])
	testLine = np.array([[521, 245], [443, 369], [387, 398], [307, 415], [204, 429]])[::-1]
	cTD.drawTextAlongContour(testText,testLine).show()

	#arc test
	# cTD.drawTextAlongArc(testText,800,-.1 + np.pi/2,.1)
	# cTD.drawTextAlongArc(testText,400,-.1 + np.pi/2,.1)
	# cTD.drawTextAlongArc(testText,1400,-.5 + np.pi/2,.1).show()


# testCTD()