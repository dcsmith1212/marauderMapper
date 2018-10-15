import numpy as np
from PIL import ImageDraw, Image

class dashDotDrawer:

	def __init__(self):
		self.dashThickness = 4
		self.dashStride = 30
		self.dashSpacing = 30
		self.dotSize = 8

	def loadImage(self,imageIn):
		self.masterImage = imageIn
		self.draw = ImageDraw.Draw(self.masterImage)

	def generateDotBoundingBoxCoords(self,anchor,size):
		arrayAnchor = np.array(anchor)
		offset = size/2
		llCoord = arrayAnchor - offset
		urCoord = arrayAnchor + offset

		boundingBox = list(map(tuple,[llCoord,urCoord]))
		return boundingBox

	def generateDashBoundingBoxCoords(self,anchor,width,height):
		arrayAnchor = np.array(anchor)
		offset = np.array([width,height])/2
		llCoord = arrayAnchor - offset
		urCoord = arrayAnchor + offset

		boundingBox = list(map(tuple,[llCoord,urCoord]))
		return boundingBox

	def textToMorse(self,textIn):
		CODE = {
			'A': '.-',     'B': '-...',   'C': '-.-.', 
			'D': '-..',    'E': '.',      'F': '..-.',
			'G': '--.',    'H': '....',   'I': '..',
			'J': '.---',   'K': '-.-',    'L': '.-..',
			'M': '--',     'N': '-.',     'O': '---',
			'P': '.--.',   'Q': '--.-',   'R': '.-.',
			'S': '...',    'T': '-',      'U': '..-',
			'V': '...-',   'W': '.--',    'X': '-..-',
			'Y': '-.--',   'Z': '--..',

			'0': '-----',  '1': '.----',  '2': '..---',
			'3': '...--',  '4': '....-',  '5': '.....',
			'6': '-....',  '7': '--...',  '8': '---..',
			'9': '----.' 
			}

		validChars = CODE.keys()

		outString = ""
		for character in textIn:
			upperChar = character.upper()
			if upperChar in validChars:	outString += CODE[upperChar]
		return outString

	def euclidDist(self,p1,p2):
		return np.linalg.norm(np.array(p1) - np.array(p2))

	def drawDotDash(self,textIn,path):
		"""Given a text string and a list of points, draws a morse code 
		string along the path"""

		dotDashString = self.textToMorse(textIn)

		currentPathIndex = 0
		saturationIndex = 0
		currentAnchor = np.array(path[currentPathIndex])
		nextPathCoord = path[currentPathIndex + 1]

		t = 15
		w = 4
		r = 9

		ogDashToDashSpacing = np.array((t+4,0))
		ogDotToDotSpacing = np.array((2*r,0))
		ogDashToDotSpacing = np.array((t+r/2,0))

		dashToDashSpacing = ogDashToDashSpacing
		dotToDotSpacing = ogDotToDotSpacing
		dashToDotSpacing = ogDashToDotSpacing

		for characterIndex in range(len(dotDashString)-1):
			distToNextWayPoint = self.euclidDist(currentAnchor,nextPathCoord)

			if distToNextWayPoint < 25 and saturationIndex > 5:
				temp = t
				t = w
				w = temp

				currentPathIndex += 1
				saturationIndex = 0
				if currentPathIndex >= (len(path) - 1):
					print ("Too long")
					return masterImage

				nextPathCoord = path[currentPathIndex+1]

				dx,dy = nextPathCoord[0] - currentAnchor[0] , nextPathCoord[1] - currentAnchor[1]

				if abs(dx) < 50: dx = 0
				if abs(dy) < 50: dy = 0

				signX,signY =  np.sign(dx),np.sign(dy)

				if signX:
					if signX == -1:
						pathMultiplier = -1
					else:
						pathMultiplier = 1

					dashToDashSpacing = pathMultiplier*ogDashToDashSpacing
					dotToDotSpacing = pathMultiplier*ogDotToDotSpacing
					dashToDotSpacing = pathMultiplier*ogDashToDotSpacing
				
				if signY:
					if signY == -1:
						pathMultiplier = -1
					else:
						pathMultiplier = 1

					dashToDashSpacing = pathMultiplier*ogDashToDashSpacing[::-1]
					dotToDotSpacing = pathMultiplier*ogDotToDotSpacing[::-1]
					dashToDotSpacing = pathMultiplier*ogDashToDotSpacing[::-1]

			saturationIndex += 1
			character = dotDashString[characterIndex]
			nextCharacter = dotDashString[characterIndex+1]

			if character == "-":

				bbCoords = self.generateDashBoundingBoxCoords(currentAnchor,t,w)
				self.draw.rectangle(bbCoords, fill="black")

				if nextCharacter == "-" : currentAnchor = np.add(currentAnchor,dashToDashSpacing)
				if nextCharacter == "." : currentAnchor = np.add(currentAnchor,dashToDotSpacing)
		
			elif character == ".":
				bbCoords = self.generateDotBoundingBoxCoords(currentAnchor,r)
				self.draw.ellipse(bbCoords, fill="black", outline=None)

				if nextCharacter == "-" : currentAnchor += dashToDotSpacing
				if nextCharacter == "." : currentAnchor += dotToDotSpacing
		
		if nextCharacter == "-":
			bbCoords = self.generateDashBoundingBoxCoords(currentAnchor,t,w)
			self.draw.rectangle(bbCoords, fill="black")

		if nextCharacter == ".":
			bbCoords = self.generateDotBoundingBoxCoords(currentAnchor,r)
			self.draw.ellipse(bbCoords, fill="black", outline=None)		

		return self.masterImage


def testDDD():
	text = "This is a test custom string which is being placed into a morse coded fence"
	masterImage = Image.new('RGB', (1000,1000),"white")

	path = [
		(100,100),
		(900,100),
		(900,300),
		(300,300),
		(300,600),
		(900,600),
		(900,900),
		(100,900),
		(100,100)
		]

	ddd = dashDotDrawer()
	ddd.loadImage(masterImage)
	morseImage = ddd.drawDotDash(text,path)
	morseImage.show()

# testDDD()