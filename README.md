# marauderMapper
Produce olde-style maps from kml files

## Requirements:
* A KML file with the correct format
* A metadata dictionary
* transparent PNGs for every feature
* Satellite picture of region to be mapped
* python3

### Libraries:
    pillow
    geopy
    scipy
    numpy
    fastkml

## Prerequisites:

### KML File:
The map is based on a georeferenced KML file.  It must have a specific format to be compatible with this tool (see below). These can be generated from Google maps.

### Metadata dictionary:
This determines the map data not available in the KML file.  It has the following format:

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

### Transparent PNGs:
  
  Every feature in the source KML file is referenced to an icon file.  To look best, icons must be somewhat high resolution and must have transparent backgrounds.  Put them all in the "icons" folder, and name them with the same name as the corrosponding feature in the KML file.
  
### Background image:

  To create the transparent overlay effect with the papyrus, a background image must be supplied that overlaps with the region to be mapped.  Put it in the "backgrounds" folder with the same name as the KML file.
  
## Features:

### Individual icon placement

Layers within the source KML file with the "Icon_" prefix are interpreted as individual icons to place.  The format for icons is

    Icon_ClassName SizeMultiplier
      Icon Name
      ...
      Icon Name
 
 A sample icon layer might look like
 
     Icon_Monuments 2
        Washington
        Tomb of Unknown

The name of the icon corresponds to its icon name.  In the example above, "Washington" maps to "Washington.png" and "Korean War" would map to "Tomb of Unknown.png"  The location of the icon on the map is set by its coordinates in the KML file.  The size of the icon is equal to the size multier set in the layer name (SizeMultiplier) times the default icon size set in the metadata dciontary (iconSize).  An "Icon" layer can contain an arbitrary number of icons, all with the same size.  To support different icon sizes on the same map, simply create a new layer with a different SizeMultipklier.

### Icon line tracing

Layers within the source KML file with the "Line_" prefix are interpreted as path to trace an icon along.  The format for icon lines is

    Line_ClassName
      Name IconSizeMultiplier,NumIconsToTrace
      ...
      Name IconSizeMultiplier,NumIconsToTrace
      
      
 A sample icon line layer might look like
 
     Line_Paths
       Footpath 1,10
       Road 2,20
 
 The name of the feature corresponds to its icon name.  Coordinates for the path are encoded within the KML file.  In the example above, "Footpath" maps to a line traced out using "Footpath.png" with 10 icons along the path and an icon size multiplier of 1.  "Road" maps to a line traced out using "Road.png" with 20 icon copies along the path and an icon size multiplier of 2.  Each line layer can contain an arbitrary number of icon lines.

### Area fill

Layers within the source KML file with the "Fill_" prefix are interpreted as regions to fill with an icon.  The format for fills is

    Fill_ClassName IconSizeMultiplier
      Name NumberIconsToFill,ShowBoundary
      ...
      Name NumberIconsToFill,ShowBoundary

### Text along line

Layers within the source KML file with the "Text_" prefix are interpreted as text to trace along a path.  The format for text is

    Text_ClassName FontSize
      Text String
      ...
      Text String
 
 Eg A sample text layer might look like
 
     Text_Labels 20
        Washington Monument
        Capitol Hill
 
 

## Base Map features:
    
### Legend:
Generates a legend according to included icons

### Compass:
Generates a fancy looking compass

### Scale:
Draws a scale (in ft)

### Next region over arrows:
Draws arrows in the 4 directions indicating whats just over the horizon in each direction

## Boundaries

Each KML must at minimum contain a layer with the prefix "Meta_" prefix to be interpreted as the boundaries of the map. The meta layer contain a few features:
* Bounding Box (mandatory)
* Boudnary (optional)

### Bounding Box:

This layer determeins the absolute lower-left and upper-right cooridinates to include in the map (and thus the absolute position of icons on the map).  The cooridnates should align with the satellite picture provided as the map background.  It must have the name "Bounding Box" and must be a closed contour.

### Region Boundary:

This layer can be used to delimit a certain region on the map, like a property line.
 
## To do:

### General:
* aligned background source map
* ribbon with names by the footsteps
* label inside of the fills
* label of the title of the map in a fancy snake laden sealy looking ribbon
* include the humungous text for broad regions
* high transparency grid lines over long/lat seconds
* scale - ticks every rectangle and miles above

### Custom:
* Footsteps fill animal area
* Use the word realm somewhere
* Find all images
* Label maps thoroughly
* Find a good trench representation
