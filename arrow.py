from PIL import Image, ImageFont, ImageDraw
import numpy as np

fpath  = "lordOfTheRings.ttf"
directory = "icons/"
arrowFilename = "arrow.png"

directionMappings = {
	"North" : [90,(150,700),(-75,0),(600,900)],
	"East" : [0,(80,0),(100,-100),(1000,400)],
	"South" : [-90,(100,0),(-75,150),(600,950)],
	"West" : [180,(100,0),(100,-100),(1000,400)]
	}

def rotateSourceArrow(filename,angle):
	arrowImage = Image.open(directory + filename).convert("RGBA").rotate(angle,expand=1)
	arrowImage.save(directory+"arrow.png","PNG")

def createEdgeArrow(text,direction,show=0):
	rot,textAnchor,arrowAnchor,masterImSize = directionMappings[direction]
	# offsetAnchor = (100,-100)
	# masterImSize = (1000,400)

	arrowImage = Image.open(directory + arrowFilename).convert("RGBA").rotate(rot,expand=1)

	if show: masterImage = Image.new('RGBA', masterImSize,(255,255,255))
	else: masterImage = Image.new('RGBA', masterImSize,(0,0,0,0))

	masterImage.paste(arrowImage, arrowAnchor,arrowImage)

	draw = ImageDraw.Draw(masterImage)
	font = ImageFont.truetype(fpath,60)

	if direction == "North" or direction == "South":
		splitText = text.split(" ")
		topLine = splitText[0]
		bottomLine = " ".join(splitText[1:])
		bottomAnchor = np.add(textAnchor,[0,80])
		# print(textAnchor)
		# print(bottomAnchor)
		draw.text(textAnchor,topLine,(0,0,0),font=font)
		draw.text(bottomAnchor,bottomLine,(0,0,0),font=font)

	else:
		draw.text(textAnchor,text,(0,0,0),font=font)

	return masterImage

def createSaveEdgeArrow(text,direction):
	saveSize = (1000,1000)
	arrowImg = createEdgeArrow(text,direction).resize(saveSize)
	arrowImg.save(directory+direction+".png","PNG")


def createEdgeArrows(directionDict):
	for arrowDirection,arrowText in directionDict.items():
		createSaveEdgeArrow(arrowText,arrowDirection)

		# img = createEdgeArrow(arrowText,arrowDirection,1)
		# img.show()

arrowDict ={
	"North" : "White House",
	"South" : "National Harbor",
	"East" : "Coast of Atlantic",
	"West" :"Sands of Potomac"
	}

# createEdgeArrows(arrowDict)