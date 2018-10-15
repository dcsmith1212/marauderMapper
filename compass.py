import numpy as np
from PIL import Image, ImageFont, ImageDraw

class compassHandler:

	def __init__(self):
		self.setupCompass()
		self.addCompassText()
		self.addCompassGraphics()

	def setupCompass(self):
		self.offset = np.array([200,200])
		self.compassImage = Image.new('RGBA', (400,400),(0,0,0,0))
		self.draw = ImageDraw.Draw(self.compassImage)

	def rotateCoords(self,coords,angle):
		theta = np.radians(angle)
		c, s = np.cos(theta), np.sin(theta)
		R = np.array(((c,-s), (s, c)))
		
		shiftedCoords = coords - self.offset
		rotCoords = np.round(R.dot(shiftedCoords.T),3).T
		reshiftedCoords = rotCoords + self.offset

		return reshiftedCoords

	def addCompassText(self):
		fpath  = "lordOfTheRings.ttf"
		font = ImageFont.truetype(fpath,40)
		self.draw.text((180, 330),"S",(0,0,0),font=font)
		self.draw.text((180, 0),"N",(0,0,0),font=font)

	def showCompass(self): self.compassImage.show()

	def saveCompass(self): self.compassImage.save("compass.png", "PNG")

	def addGraphicsWithCopies(self,graphicsType,coordsList,numCopies,circleSize = 10):
		coordsList = coordsList + self.offset

		if graphicsType == "arc":
			tupleCoords = map(tuple,coordsList)
			self.draw.arc(tupleCoords,0,359,fill="black")

		circleShift = np.array([[-circleSize,-circleSize],[circleSize,circleSize]])

		copySpacing = 360./numCopies

		for copyNum in range(numCopies):
			copyAngle = copyNum*copySpacing

			rotCoords = self.rotateCoords(coordsList,copyAngle)
			tupleCoords = map(tuple,rotCoords)

			if graphicsType == "ellipse":
				bboxCoords = rotCoords + circleShift
				tupleCoords = map(tuple,bboxCoords)

				self.draw.ellipse(tupleCoords,fill="black")
			if graphicsType == "line": self.draw.line(tupleCoords, fill="black")
			if graphicsType == "polygon": self.draw.polygon(tupleCoords, fill="black")

	def addCompassGraphics(self):
		toothTriangleCoords = np.array([(125,20),(115,0),(125,-20)])
		self.addGraphicsWithCopies("polygon",toothTriangleCoords,12)

		diamondDiagonalCoords = np.array([(10,10),(0,20),(35,35)])
		self.addGraphicsWithCopies("polygon",diamondDiagonalCoords,4)

		diamondDiagonalLineCoords = np.array([(20,0),(35,35)])
		self.addGraphicsWithCopies("line",diamondDiagonalLineCoords,4)

		farOuterCircleCoords =	np.array([(-130,-130),(130,130)])
		self.addGraphicsWithCopies("arc",farOuterCircleCoords,1)

		crossLineCoords = np.array([(15,15),(150,150)])
		self.addGraphicsWithCopies("line",crossLineCoords,4)

		triangleCoords = np.array([(0,20),(0,100),(20,20)])
		hollowTriangleCoords = np.array([(0,20),(0,100),(-20,20)])

		self.addGraphicsWithCopies("line",hollowTriangleCoords,4)
		self.addGraphicsWithCopies("polygon",triangleCoords,4)

		innerCircleCoords =	np.array([(-80,-80),(80,80)])
		self.addGraphicsWithCopies("arc",innerCircleCoords,1)

		inbetweenLines = np.array([(80,0),(100,0)])
		self.addGraphicsWithCopies("line",inbetweenLines,10)

		outerCircleCoords =	np.array([(-100,-100),(100,100)])
		self.addGraphicsWithCopies("arc",outerCircleCoords,1)

		tinyCircleAnchor = np.array([(140,0)])
		self.addGraphicsWithCopies("ellipse",tinyCircleAnchor,8)

# compassHandler().saveCompass()