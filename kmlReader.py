from fastkml import kml
import numpy as np
import geopy.distance

class kmlGetter:

	def __init__(self,sourceFilename,verboseMode = 0):
		self.verboseMode = verboseMode
		self.extensionType = ".png"
		self.setupVariables()
		self.importFile(sourceFilename)

	def setupVariables(self):
		self.validFeatures = ["Icon","Line","Fill","Fence","Text"]
		self.featureFunctions = {
			"Fence":self.readFenceFeatures,
			"Icon":self.readIconFeature,
			"Line":self.readLineFeatures,
			"Fill":self.readFillFeature,
			"Text":self.readTextFeature
			}

		self.entryLists = {
			"Fence": [],
			"Icon":[],
			"Line":[],
			"Fill":[],
			"Text":[],
			}

	def importFile(self,filename):
		featuresList = self.importKmlFile(filename)
		self.parseFeaturesList(featuresList)

	def importKmlFile(self,filename):
		"""imports a kml file"""

		fileString = open(filename).read()

		#create a kml reader obj and import file to it
		k = kml.KML() 
		k.from_string(fileString)

		features = list(k.features())

		self.masterName =  features[0].name
		if self.verboseMode: print ("Master file name:", self.masterName)

		featuresList = list(features[0].features())

		numFeatures = len(featuresList)
		if numFeatures < 2:
			print ("NOT ENOUGH FEATURES")
			return

		self.readMetaFeature(featuresList[0])

		return featuresList[1:]

	def parseFeaturesList(self,featuresList):
		"""parses a list of kml features"""

		for feature in featuresList:
			name = feature.name
			featureType,featureName =  name.split("_")

			feature.name = featureName #strip type from name

			if featureType not in self.validFeatures:
				print ("Unknown feature:", name)
				continue

			#get specific parsing function depending on feature type
			featureFn = self.featureFunctions[featureType]

			parsedFeatureData = featureFn(feature)

			self.entryLists[featureType].append(parsedFeatureData)

	def readMetaFeature(self,kmlFeatureIn):
		name = kmlFeatureIn.name
		bbSet = 0
		boundarySet = 0

		featureComponentsList = list(kmlFeatureIn.features())
		for feature in featureComponentsList:
			name = feature.name
			if "\n" in name: name = name[:-1]

			if name == "Bounding Box" :
				bounds = feature.geometry.bounds
				lowerBbox = np.array(bounds[0:2])

				self.origin = lowerBbox[::-1]
				upperBbox = np.array(bounds[2:])

				self.extent = self.transformCoords(upperBbox)
				bbSet = 1

			if name == "Boundary":
				boundingContour = feature.geometry.exterior.coords
				boundaryCoords = np.array(boundingContour)[:,:-1]
				boundarySet = 1

			elif name == "Source Image Upper":
				point = feature.geometry
				pointCoords = np.array([point.x,point.y])
				
				
			elif name == "Source Image Lower":
				point = feature.geometry
				pointCoords = np.array([point.x,point.y])

		if boundarySet:
			localCoords = self.transformCoords(boundaryCoords)
			self.boundaryCoords = localCoords

		if not bbSet:
			print ("Bounding box not set!")

		if self.verboseMode: 
			print ("Metadata:")
			print ("\t Origin:",self.origin)
			print

	def readTextFeature(self,kmlFeatureIn,useMasterName = 0):
		textName,textSize = kmlFeatureIn.name.split(" ")
		textSize = int(textSize)

		featureComponentsList = list(kmlFeatureIn.features())

		featureEntries = []
		for textFeature in featureComponentsList:
			name = textFeature.name

			#remove newline character at end of name
			if "\n" in name: name = name[:-1]

			points = textFeature.geometry

			coords =  np.array(points.coords)[:,:-1]

			# coords = np.flip(coords,1)
			localCoords = self.transformCoords(coords)

			localCoords = np.flip(localCoords,1)
			entry = [name,textSize,localCoords]
			featureEntries.append(entry)

		if self.verboseMode: 
			print ("Text ",featureName)
			for textEntry in featureEntries:
				print ("\t",textEntry)
			print

		return featureEntries


	def readIconFeature(self,kmlFeatureIn,useMasterName = 0):
		"""Called when a layer has the prefix "Icon_"
		Returns the following for each element in the layer
		[iconName.png,(localIconAchorCoords)]"""

		iconName,iconSize = kmlFeatureIn.name.split(" ")
		iconSize = int(iconSize)

		featureComponentsList = list(kmlFeatureIn.features())

		featureEntries = []
		for feature in featureComponentsList:
			name = feature.name

			#remove newline character at end of name
			if "\n" in name: name = name[:-1]
			if useMasterName:
				filename = masterName + self.extensionType
			else:
				filename = name + self.extensionType

			point = feature.geometry
			pointCoords = np.array([point.x,point.y])
			localCoords = self.transformCoords(pointCoords)

			entry = [[filename,iconSize],localCoords]
			featureEntries.append(entry)

		if self.verboseMode: 
			print ("Icon ",featureName)
			for iconEntry in featureEntries:
				print ("\t",iconEntry)
			print
		return featureEntries

	def readFenceFeatures(self,kmlFeatureIn,useMasterName = 0):
			"""Called when a layer has the prefix "Line_"
			Returns the following for each element in the layer
			[iconName.png,(localLineAnchorPoint, localLineAchorPoint)]
			"""

			featureComponentsList = list(kmlFeatureIn.features())

			featureEntries = []
			for lineFeature in featureComponentsList:
				lineFeatureName = lineFeature.name
				points = lineFeature.geometry
				coords =  np.array(points.coords)[:,:-1]
				localCoords = self.transformCoords(coords)

				entry = localCoords
				featureEntries.append(entry)
			if self.verboseMode: 
				print ("Line",masterFeatureName)
				for lineEntry in featureEntries:
					print ("\t",lineEntry[0])
					print ("\t\t",lineEntry[1])
				print

			return featureEntries


	def readLineFeatures(self,kmlFeatureIn,useMasterName = 0):
		"""Called when a layer has the prefix "Line_"
		Returns the following for each element in the layer
		[iconName.png,(localLineAnchorPoint, localLineAchorPoint)]
		"""

		masterFeatureName = kmlFeatureIn.name
		featureComponentsList = list(kmlFeatureIn.features())

		featureEntries = []
		for lineFeature in featureComponentsList:
			lineFeatureName, lineFeatureMetadata = lineFeature.name.split(" ")
			
			lineFeatureMetadata = list(map(float,lineFeatureMetadata.split(",")))
			
			lineIconSize = lineFeatureMetadata[0]
			numPoints = lineFeatureMetadata[1]

			# if "\n" in name: name = name[:-1]

			filename = lineFeatureName + self.extensionType

			points = lineFeature.geometry
			coords =  np.array(points.coords)[:,:-1]

			localCoords = self.transformCoords(coords)
			entry = [[filename,lineIconSize,numPoints],localCoords]
			featureEntries.append(entry)

		if self.verboseMode: 
			print ("Line",masterFeatureName)
			for lineEntry in featureEntries:
				print ("\t",lineEntry[0])
				print ("\t\t",lineEntry[1])
			print
		return featureEntries

	def readFillFeature(self,kmlFeatureIn,useMasterName = 0):
		"""Called when a layer has the prefix "Fill_"
		Returns the following for each element in the layer
		[iconName.png,(boundingCountourPoint, boundingCountourPoint,...)]
		"""

		featureName = kmlFeatureIn.name
		featureComponentsList = list(kmlFeatureIn.features())

		featureEntries = []
		for fillFeature in featureComponentsList:
			fillFeatureName,fillFeatureMetadata = fillFeature.name.split(" ")

			fillFeatureMetadata = list(map(float,fillFeatureMetadata.split(",")))
			fillIconSize = fillFeatureMetadata[0]
			numIcons = fillFeatureMetadata[1]
			showBorder = fillFeatureMetadata[2]

			if "\n" in fillFeatureName: fillFeatureName = fillFeatureName[:-1]
			filename = fillFeatureName+self.extensionType

			boundingContour =  fillFeature.geometry.exterior.coords
			boundingContourCoords = np.array(boundingContour)[:,:-1]
			localCoords = self.transformCoords(boundingContourCoords)

			entry = [[filename,fillIconSize,numIcons,showBorder],localCoords]
			featureEntries.append(entry)

		if self.verboseMode:
			print ("Fill",featureName)
			for fillEntry in featureEntries:
				print ("\t",fillEntry[0])
				print ("\t\t",fillEntry[1])
			print

		return featureEntries

	def transformGPStoLocal(self,gpsCoords):
		gpsCoords = gpsCoords[::-1]

		#calculate absolute y displacement in feet
		dYtestCoord = [self.origin[0],gpsCoords[1]]
		dY = int(geopy.distance.vincenty(self.origin, dYtestCoord).ft)

		#calculate absolute x displacement in feet
		dXtestCoord = [gpsCoords[0],self.origin[1]]
		dX = int(geopy.distance.vincenty(self.origin, dXtestCoord).ft)

		return [dX,dY]

	def transformCoords(self,inputCoords):
		if len(inputCoords.shape) == 1:
			return self.transformGPStoLocal(inputCoords)

		localCoordList = []
		for coord in inputCoords:
			localCoord = self.transformGPStoLocal(coord)
			localCoordList.append(localCoord)
		return localCoordList

def testClass():
	kmlFile = "Smithsonian.kml"
	kmlG = kmlGetter(kmlFile,verboseMode = 0)
# testClass()