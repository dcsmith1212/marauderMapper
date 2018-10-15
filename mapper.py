import numpy as np
from scipy import interpolate
from matplotlib.patches import Polygon
from PIL import Image,ImageFont, ImageDraw, ImageOps

import kmlReader
from dotDashDrawer import dashDotDrawer
from coordinateHandler import mapperCoordinateHandler
from ribbon import makeRibbon
from curvedTextDrawer import curvedTextDrawer

class mapper:
	"""Creates an image using location data derived from a google-maps KML file"""
	def __init__(self,metadata):
		self.iconDirectory = "icons/"
		self.backgroundDirectory = "backgrounds/"
		self.fontPath  = "lordOfTheRings.ttf"

		filename = metadata["filename"]
		self.importKmlFile(filename)
		self.setupVariables(metadata)

		self.createMasterImage()

	def importKmlFile(self,filename):
		"""Imports a class derived from a google-maps KML file containing 
			point, line, fills
			each with a filename and location data"""

		kmlGetter = kmlReader.kmlGetter(filename,verboseMode = 0)

		#Use name of file to source background map name
		self.backgroundName = filename.split(".")[0] + ".png"
		self.extent = kmlGetter.extent
		self.aspectRatio = self.extent[1]/float(self.extent[0])

		self.origin = kmlGetter.origin
		try:
			self.boundaryCoords = kmlGetter.boundaryCoords
		except:
			print ("No boundary in KML file")
		entryLists = kmlGetter.entryLists

		entryTypes = entryLists.keys()
		if "Fence" in entryTypes: self.fences = entryLists["Fence"]
		if "Icon" in entryTypes: self.icons = entryLists["Icon"]
		if "Fill" in entryTypes: self.fills = entryLists["Fill"]
		if "Line" in entryTypes: self.lines = entryLists["Line"]
		if "Text" in entryTypes: self.texts = entryLists["Text"]

	def setupVariables(self,metadata):
		self.titleText = metadata["titleText"]
		self.titleTextAnchor = metadata["titleTextAnchor"]
		self.titleFontSize = metadata["titleFontSize"]

		self.showCompass = metadata["showCompass"]
		self.compassSize = metadata["compassSize"]
		self.compassAnchor = metadata["compassAnchor"]

		self.showScale = metadata["showScale"]
		self.scaleAnchor = metadata["scaleAnchor"]
		self.scaleSize = metadata["scaleSize"]

		self.showLegend = metadata["showLegend"]
		self.legendSize = metadata["legendSize"]
		self.legendAnchor = metadata["legendAnchor"]

		self.showEdgeArrows = metadata["showEdgeArrows"]
		self.showBoundary= metadata["showBoundary"]

		self.fontSize = metadata["fontSize"]
		self.iconSize = metadata["iconSize"]
		self.fenceThickness = metadata["fenceThickness"]

		self.imageHeight = self.extent[0]
		self.imageWidth = int(self.aspectRatio*self.imageHeight)

		self.coordinateHandler = mapperCoordinateHandler(self.imageWidth,self.imageHeight)

		#import the lord of the rings font
		self.titleFont = ImageFont.truetype(self.fontPath,self.titleFontSize)
		self.scaleFont = ImageFont.truetype(self.fontPath,self.fontSize)

	def addBoundary(self):
		boundaryLineCoords = self.boundaryCoords
		ddd = dashDotDrawer()
		message = "This is a message in morse code and it is represented on a fence"*4
		ddd.loadImage(self.masterImage)
		ddd.drawDotDash(message,boundaryLineCoords)
		self.masterImage = ddd.masterImage

	def createMasterImage(self):
		#create the master image in PIL
		# self.masterImage = Image.new('RGB', (self.imageHeight,self.imageHeight),"white")
		self.masterImage = Image.open(self.backgroundDirectory + "papyrus.jpg")
		self.masterImage = self.masterImage.convert('RGBA').resize((self.imageWidth,self.imageHeight),1)
		self.addMapBackground()

		#create a tool to draw on top of the image
		self.draw = ImageDraw.Draw(self.masterImage)

		self.addTitleText()
		if self.showScale: self.addScale()
		if self.showCompass: self.importCompass()
		if self.showBoundary: self.addBoundary()
		if self.showLegend: self.addLegend()
		if self.showEdgeArrows: self.addEdgeArrows()

	def addLegend(self):
		legendFilename = "legend.png"

		legendAnchorCoords = self.coordinateHandler.fracCoordsToAnchor(self.legendAnchor)

		legendIm = self.importIcon(legendFilename,self.legendSize)
		self.addIcons(legendIm,legendAnchorCoords)

	def addTitleText(self):
		# titleTextRibbon = makeRibbon(self.titleText,(800,500))
		titleRibbonAnchorCoords = self.coordinateHandler.fracCoordsToAnchor(self.titleTextAnchor)[0]
		print(titleRibbonAnchorCoords)
		# self.addIcons(titleTextRibbon,titleRibbonAnchorCoords)
		self.draw.text(titleRibbonAnchorCoords,self.titleText,fill=(0,0,0,24),font=self.titleFont)

	def importCompass(self):
		compassFilename = "compass.png"
		compassIm = self.importIcon(compassFilename,size=self.compassSize)
		compassAnchorCoords = self.coordinateHandler.fracCoordsToAnchor(self.compassAnchor)
		self.addIcons(compassIm,compassAnchorCoords)

	def addScale(self):
		rectWidth, rectHeight = self.scaleSize[0],self.scaleSize[1]
		rectOffset = np.array(self.scaleSize)

		scaleOriginX = int(self.scaleAnchor[0]*self.imageWidth)
		scaleOriginY = int(self.scaleAnchor[1]*self.imageHeight)

		endLineHeight = rectHeight * 4
		endLineWidth = rectHeight
		numRectangles = 5

		totalScaleLength = numRectangles*rectWidth
		scaleText = str(totalScaleLength) + "ft."

		for i in range(int((numRectangles/2)+1)):
			singleRectCoords = np.array([scaleOriginX + 2*i*rectWidth,scaleOriginY])

			self.draw.rectangle((tuple(singleRectCoords), tuple(singleRectCoords + rectOffset)), fill="black")
		for i in range(int(numRectangles/2)):
			doubleRectLowCoords = np.array([scaleOriginX + rectWidth + 2*i*rectWidth,scaleOriginY-rectHeight])
			self.draw.rectangle((tuple(doubleRectLowCoords), tuple(doubleRectLowCoords + rectOffset)), fill="black")
			
			doubleRectHighCoords = np.array([scaleOriginX + rectWidth + 2*i*rectWidth,scaleOriginY+rectHeight])
			self.draw.rectangle((tuple(doubleRectHighCoords), tuple(doubleRectHighCoords + rectOffset)), fill="black")

		lineYOrigin = scaleOriginY + rectHeight/2

		leftLineCoords = [(scaleOriginX,lineYOrigin-endLineHeight/2),(scaleOriginX,lineYOrigin+endLineHeight/2)]
		self.draw.line(leftLineCoords, fill="black",width=endLineWidth)
		
		self.draw.text(leftLineCoords[1],"0",(0,0,0),font=self.scaleFont)

		rightLineCoords = [(scaleOriginX + 5*rectWidth,lineYOrigin-endLineHeight/2),(scaleOriginX + 5 * rectWidth,lineYOrigin+endLineHeight/2)]
		self.draw.line(rightLineCoords, fill="black",width=endLineWidth)

		#put right text at the bottom of the right line
		rightTextCoords = [rightLineCoords[1][0] - rectWidth/2,rightLineCoords[1][1] ]#- rectWidth/2]
		self.draw.text(rightTextCoords,scaleText,(0,0,0),font=self.scaleFont)

	def addBorder(self):
		borderSize = 10
		self.masterImage = ImageOps.expand(self.masterImage,border=borderSize,fill='black')

	def addMapBackground(self):
		mapFilename = self.backgroundDirectory + self.backgroundName
		mapImg = Image.open(mapFilename).resize((self.imageWidth,self.imageHeight),1)
		# self.masterImage.paste(mapImg,(0,0),mapImg)
		# self.masterImage = Image.alpha_composite(self.masterImage, mapImg)
		self.masterImage = Image.blend(self.masterImage, mapImg, .2)
	
	def addEdgeArrows(self):
		edgeArrowDict = {"North.png":(.5,.93),"East.png":(.97,.5),"South.png":(.5,.08),"West.png":(.03,.5)}

		edgeArrowSize = (300,300)
		for edgeArrowFilename,edgeArrowAnchor in edgeArrowDict.items():
			edgeArrowIcon = self.importIcon(edgeArrowFilename,size=edgeArrowSize)
			edgeArrowAnchorCoords = self.coordinateHandler.fracCoordsToAnchor(edgeArrowAnchor)
			self.addIcons(edgeArrowIcon,edgeArrowAnchorCoords)

	def addEntries(self,addIcons=1,addLines=1,addFills=1,addFences=1,addText=1):
		if addIcons: self.addFeatureList(self.icons,featureType="Icon")
		if addLines: self.addFeatureList(self.lines,featureType="Line")
		if addFills: self.addFeatureList(self.fills,featureType="Fill")
		if addFences: self.addFeatureList(self.fences,featureType="Fence")
		if addText: self.addFeatureList(self.texts,featureType="Text")

	def addIcons(self,icon,anchors,angles=0):
		"""Adds an icon list to the master image according the anchors and angles"""
		iconOffset = (np.array([icon.size[0],-icon.size[1]])/2).astype(int)

		anchors = np.flip(anchors,1)
		anchors = anchors - iconOffset
		anchors[:,1] = self.imageHeight - anchors[:,1]

		if type(angles) is not int:
			for anchor,angle in zip(anchors,angles):
				# # rotated image
				rotIcon = icon.rotate(angle, expand=1)
				self.masterImage.paste(rotIcon, tuple(anchor),rotIcon)
		else:
			for anchor in anchors:
				self.masterImage.paste(icon, tuple(anchor.astype(int)),icon)

	def traceIconAlongPath(self,curveCoords,icon,numPoints):
		points,angles = self.coordinateHandler.generateLineData(curveCoords,npoints=numPoints, smooth = 0, periodic = False)
		self.addIcons(icon,points,angles)

	def fillAreaWithIcon(self,icon,mask,density):
		points = self.coordinateHandler.randomPointsWithin(mask,density)
		self.addIcons(icon,points)

	def drawText(self,text,textSize,coords):
		cTD = curvedTextDrawer(textSize)
		cTD.loadImage(self.masterImage)
		self.masterImage = cTD.drawTextAlongContour(text,coords)

	def drawLine(self,lineCoords):
		lineCoords = np.flip(lineCoords,1)
		lineCoords[:,1] = self.imageHeight - lineCoords[:,1]

		tuplePoints = list(map(tuple,lineCoords))
		self.draw.line(tuplePoints, fill="black",width=self.fenceThickness)

	def addBoundaryLine(self):
		boundaryCoords = self.boundaryCoords
		self.drawLine(boundaryCoords)

	def drawFenceX(self,anchor):
		xSize = self.fenceThickness+2

		anchor = np.flip(anchor,0)
		# anchors = anchors - iconOffset
		anchor[1] = self.imageHeight - anchor[1]

		forwardSlashCoords = [anchor + [-xSize,xSize], anchor - [-xSize,xSize] ]
		backSlashCoords = [anchor + [xSize,xSize] , anchor - [xSize,xSize] ]

		forwardTuples = map(tuple,forwardSlashCoords)
		backwardTuples = map(tuple,backSlashCoords)

		self.draw.line(forwardTuples, fill="black",width=self.fenceThickness)
		self.draw.line(backwardTuples, fill="black",width=self.fenceThickness)

	def addFeatureList(self,featureList,featureType):
		for featureData in featureList:
			for individualFeatureData in featureData:

				if featureType == "Fence":

					lineCoords = np.array(individualFeatureData)

					fenceCoords = self.coordinateHandler.getFenceXcoords(lineCoords)
					for coord in fenceCoords:
						self.drawFenceX(coord)
					self.drawLine(lineCoords)
					continue

				if featureType == "Text":
					text = individualFeatureData[0]
					textSize = individualFeatureData[1]
					textCoords = np.array(individualFeatureData[2])

					self.drawText(text,textSize,textCoords)
					continue

				featureMetadata = individualFeatureData[0]

				iconFilename = featureMetadata[0]
				iconSize = int(featureMetadata[1] * self.iconSize)
				icon = self.importIcon(iconFilename,iconSize)

				if featureType == "Icon":
					iconAnchor = [individualFeatureData[1]]
					self.addIcons(icon,iconAnchor)

				if featureType == "Line":
					numPoints = featureMetadata[2]
					lineCoords = np.array(individualFeatureData[1])
					self.traceIconAlongPath(lineCoords,icon,numPoints)

				if featureType == "Fill":
					numFillIcons = featureMetadata[2]
					showBorder = featureMetadata[3]

					fillContour = individualFeatureData[1]
					fillPolygon = Polygon(fillContour)

					if showBorder:
						arrayContour = np.array(fillContour)
						newContour,angles = self.coordinateHandler.generateLineData(arrayContour,30,periodic=True)
						self.drawLine(newContour)

					self.fillAreaWithIcon(icon,fillPolygon,numFillIcons)

	def importIcon(self,filename,size=0):
		im = Image.open(self.iconDirectory + filename).convert("RGBA")
		if size:
			if type(size) is int or type(size) is float:
				if size == -1:
					return im
				im = im.resize((size,size),1)
			else:
				im = im.resize(size)
		return im

	def show(self):
		self.masterImage.show()