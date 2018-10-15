from PIL import Image

directory = "icons/"

def convertToPng(inputFilename):
	outputFilename = inputFilename.split(".")[0] + "png"
	masterImage = Image.open(directory + filename)
	outputImage = masterImage.save(directory + outputFilename)