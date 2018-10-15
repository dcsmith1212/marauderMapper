from mapper import mapper


smithsonianMetadata = {
	"filename" : "Smithsonian.kml",
		"fenceThickness" : 2,
		"fontSize" : 80,
		"iconSize" : 100,
	"titleText" : "National Mall",
		"titleTextAnchor" : (0,0),
		"titleFontSize" : 90,
	"showEdgeArrows" : 1,
	"showLegend" : 1,
		"legendSize" : (800,600),
		"legendAnchor" : (.07,.2),
	"showBoundary" : 0,
	"showCompass" : 1,
		"compassSize" : (600,600),
		"compassAnchor": (.95,.3),
	"showScale" : 1,
		"scaleSize" : (100,20),
		"scaleAnchor" : (.9,.93),
	}


mp = mapper(smithsonianMetadata)

mp.addEntries(1,0,0,0,0)
mp.addEntries(0,1,0,0,0)
mp.addEntries(0,0,1,0,0)
# mp.addEntries(0,0,0,1,0)
mp.addEntries(0,0,0,0,1)
# mp.addEntries(1,1,1,1,1)

# mp.masterImage.save("output.png","PNG")
mp.show()