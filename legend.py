import numpy as np
from PIL import Image, ImageFont, ImageDraw, ImageOps

class legendHandler:

	def __init__(self,iconsList):
		self.numIcons = len(iconsList)

		self.setupLegendVariables()
		self.setupLegendImage()
		self.addLegendTitle()
		self.addIconList(iconsList)
		self.addBorder()

	def setupLegendVariables(self):
		self.borderSize = 10

		self.titleFontSize = 50
		self.fontSize = 30
		self.iconSize = 80

		self.numCols = 2
		self.numRows = int(.5 + self.numIcons/self.numCols)

		self.itemDims = (300,100)
		
		self.iconOrigin = np.array([0,self.itemDims[1]*self.numRows])
		self.textOrigin = self.iconOrigin + [self.iconSize+10,-10]
		
		self.columnSpacing = np.array([0,self.itemDims[1]])
		self.rowSpacing = np.array([self.itemDims[0],0])

		self.iconDirectory = "icons/"

	def setupLegendImage(self):
		self.imageWidth,self.imageHeight = self.itemDims[0]*self.numCols,self.itemDims[1]*(self.numRows+1)
		self.titleAnchor = (self.imageWidth/2-150,self.itemDims[1] *(self.numRows+1))

		self.legendImage = Image.new('RGBA', (self.imageWidth,self.imageHeight),(0,0,0,0))
		self.draw = ImageDraw.Draw(self.legendImage)

		fontPath  = "lordOfTheRings.ttf"
		self.titleFont = ImageFont.truetype(fontPath,self.titleFontSize)
		self.scaleFont = ImageFont.truetype(fontPath,self.fontSize)

	def importIcon(self,filename,size=80):
		return Image.open(self.iconDirectory + filename).resize((size,size),1).convert("RGBA")

	def getRowCol(self,index):
		row = int(index/self.numRows)
		col = index%self.numRows
		return row,col

	def addIconList(self,iconList):
		for iconIndex,iconFilename in enumerate(iconList):
			row,col = self.getRowCol(iconIndex)

			#add icon to image
			iconAnchor = self.iconOrigin + (row * self.rowSpacing) - (col * self.columnSpacing)

			icon = self.importIcon(iconFilename,self.iconSize)
			self.addIcon(icon,self.shiftCoords(iconAnchor))

			# Remove extension from filename for text to display
			legendEntryText = iconFilename.split(".")[0]

			iconTextAnchor = self.textOrigin + row * self.rowSpacing - col * self.columnSpacing
			#long text wraps to 2 lines
			if len(legendEntryText) > 10:
				#offset anchor to center inbetween lines to middle of icon
				iconTextAnchor[1] += 30
				#replace spaces with newlines to work with multiline_text
				legendEntryText = legendEntryText.replace(" ","\n")
				self.draw.multiline_text(self.shiftCoords(iconTextAnchor), legendEntryText, fill=(0,0,0,255), font=self.scaleFont, anchor=None, spacing=10, align="left")
			#single line text
			else:
				self.draw.text(self.shiftCoords(iconTextAnchor),legendEntryText,fill=(0,0,0,255),font=self.scaleFont)

	def shiftCoords(self,coordsIn):
		shiftedCoords = list(coordsIn[::1])
		shiftedCoords[1] = self.imageHeight - shiftedCoords[1]
		return tuple(map(int,shiftedCoords))

	def addLegendTitle(self):
		legendTitleText = "Legend"
		self.draw.text(self.shiftCoords(self.titleAnchor),legendTitleText,fill=(0,0,0,255),font=self.titleFont)

	def addIcon(self,icon,anchor):
		# iconOffset = np.array([icon.size[0],-icon.size[1]])/2
		self.legendImage.paste(icon, tuple(anchor))

	def addBorder(self):
		self.legendImage = ImageOps.expand(self.legendImage,border=self.borderSize,fill='black')

	def showLegend(self):
		nonTransparentLegend = Image.new("RGB", self.legendImage.size, (255, 255, 255))
		nonTransparentLegend.paste(self.legendImage, mask=self.legendImage.split()[3]) # 3 is the alpha channel
		nonTransparentLegend.show()

	def saveLegend(self):
		self.legendImage.save(self.iconDirectory + "legend.PNG","PNG")


allIcons = ["american history.png","art.png","washington monument.png","natural history.png","castle.png","air and space.png"]


lg = legendHandler(allIcons)

# lg.saveLegend()
# lg.showLegend()