from PIL import Image, ImageFont, ImageDraw
import numpy as np

def makeRibbon(text,outputSize):
	directory = "icons/"
	ribbonFilename = "ribbon.png"
	ribbonImage = Image.open(directory + ribbonFilename).convert("RGBA")
	offsetAnchor = (50,20)
	fpath  = "lordOfTheRings.ttf"
	ribbonFont = ImageFont.truetype(fpath,30)
	draw = ImageDraw.Draw(ribbonImage)
	draw.text(offsetAnchor,text,(0,0,0,0),font=ribbonFont)
	ribbonImage = ribbonImage.resize(outputSize,1)
	return ribbonImage