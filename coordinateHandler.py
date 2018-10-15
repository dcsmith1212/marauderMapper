from scipy import interpolate
import numpy as np

class mapperCoordinateHandler:

	def __init__(self,imageWidth,imageHeight):
		self.imageWidth, self.imageHeight = imageWidth, imageHeight

	def fracCoordsToAnchor(self,fracCoords):
		"""Converts coordinates in the form of fraction of image to absolute pixel coordinates
		IN: fracCoords = (float x , float y) 0<=x<=1, 0<=y<=1
		OUT: localAnchorCoords = (int xPix, int yPix)
		"""

		coordY = int(fracCoords[0]*self.imageWidth)
		coordX = int(fracCoords[1]*self.imageHeight)
		localAnchorCoords = [(coordX,coordY)]
		return localAnchorCoords
		
	def shiftCoords(self,coordsIn):
		"""PIL indexes from above, this shifts lower-left referenced coords to an upper-right referenced system"""
		shiftedCoords = list(coordsIn[::1])
		shiftedCoords[1] = self.imageHeight - shiftedCoords[1]
		return tuple(shiftedCoords)

	def euclidDist(self,p1,p2):
		"""Returns euclidean distance between two points"""
		return np.linalg.norm(np.array(p1) - np.array(p2))

	def getMinDistance(self,pointsList,testPoint):
		"""finds the smallest distance between a test point and a list of points"""
		minDist = min([self.euclidDist(point,testPoint) for point in pointsList])
		return minDist

	def getLegLengths(self,pointsList):
		"""Given a list of points, returns the distances between sequential points"""
		legLengths = [self.euclidDist(pointsList[pointIndex],pointsList[pointIndex+1]) for pointIndex in range(len(pointsList)-1)]
		return legLengths

	def generateLineData(self,curve, npoints = 30, smooth = 0, periodic = False):
		"""Resample a curve with n points to m equispaced points

		Arguments:
		curve (mxd array): coordinates of the reference points for the curve
		npoints (int): number of resamples equidistant points
		smooth (number): smoothness factor
		periodic (bool): if True assumes the curve is a closed curve

		Returns:
		(nxd array): resampled equidistant points
		"""
		# print(curve)
		cinterp, u = interpolate.splprep(curve.T, u = None, s = smooth, per = periodic)
		
		# dpdt = interpolate.splev(u, cinterp, der = 1);

		# arcLength = 0
		# lastTime = 0.0

		# for time,point in zip(u,np.transpose(dpdt)):
		# 	dt = time - lastTime
		# 	lastTime = time
		# 	arcLength = arcLength + (np.sqrt(point[0]**2 + point[1]**2)) * dt


		# npoints = int(arcLength/spacing)

		if npoints is all: npoints = curve.shape[0];

		us = np.linspace(u.min(), u.max(), npoints)
		curve = interpolate.splev(us, cinterp, der = 0);

		dxdt,dydt = interpolate.splev(us, cinterp, der = 1);
		angles = 180*np.arctan2(dxdt,dydt)/np.pi

		curve = np.vstack(curve).T.astype(int)

		return curve,angles 

	def randomPointsWithin(self,poly,numPoints):
		"""Given a polygon object, return a randomly sampled collection of points within it"""

		#number of pixels to space icons by
		distThresh = 30

		#get bounding box extent to sample from
		bbox = poly.get_window_extent()
		minX, minY, maxX, maxY = bbox.x0,bbox.y0,bbox.x1,bbox.y1

		points = []

		#make sure you don't try forever
		tryIndex = 0

		while len(points) < numPoints:
			randomPoint = [np.random.randint(minX, maxX), np.random.randint(minY, maxY)]
			#check the point is in the polygon
			if poly.contains_point(randomPoint):
				#check that there are other points in the list to compare it to
				if points:
					minDist = self.getMinDistance(points,np.array(randomPoint))
					if minDist<distThresh:

						tryIndex +=1
						if tryIndex > 2000:
							print ("Too many tries!")
							return points
						#break out and try again
						continue
				points.append(randomPoint)
		return points

	def getFenceXcoords(self,coordsList,numCoords = 10):
		""" Given a list of coordinates forming the perimenter of a fence,
			Calculates the total length of a fence and segments it evenly to place x marks on"""

		legLengths = np.array(self.getLegLengths(coordsList))
		#figure out fraction of total line length each leg contributes
		normalizedLegLengths = legLengths/sum(legLengths)

		#create evenly spaced times according to number of Xs desired
		times = np.linspace(0,1,numCoords)

		#accumulate the times to generate timestamps
		timeStamps = list(np.cumsum(normalizedLegLengths))
		timeStamps = [0] + timeStamps
		# return np.transpose([np.interp(timeIn, timeStamps,coordsList[:,variableIndex]) for variableIndex in range(coordsList.shape[1])])

		def getInterpTime(timeIn):
			"""linear interpolate between the line segments according to the timestamps"""
			return np.transpose([np.interp(timeIn, timeStamps,coordsList[:,variableIndex]) for variableIndex in range(coordsList.shape[1])])

		return getInterpTime(times)

# cH = coordinateHandler(100,100)