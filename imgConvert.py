from PIL import Image

directory = "icons/"

def convertToPng(inputFilename):
	outputFilename = inputFilename.split(".")[0] + "png"
	masterImage = Image.open(directory + filename)
	outputImage = masterImage.save(directory + outputFilename)

def resize(inputFilename,ratio):
	image = Image.open(inputFilename)
	imageSize = image.size
	newSize = tuple(map(int,(imageSize[0]/ratio,imageSize[1]/ratio)))
	print (newSize)
	outImg = image.resize(newSize)
	outImg.save("Resized "+inputFilename)


# filename = "output.PNG"
# resize(filename,3)