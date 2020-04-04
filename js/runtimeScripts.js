// todo
// colorOption
// background select
// icon categories
// map extent
// export pdf
// welcome page

'use strict';

function createIconPicker(iconSet){
	var pickerRowContainer = document.createElement("div");
	pickerRowContainer.className = "row";

	var numImages = iconSet.length;
	var numRows = Math.ceil(numImages/numIconColumns);

	var imgIndex = 0;

	for (var colIndex=0;colIndex<numIconColumns;colIndex++){
		var listContainer = document.createElement("div");
		listContainer.className = "column";

		for (var rowIndex=0;rowIndex<numRows;rowIndex++){
			var img = document.createElement("img")

			imgIndex = (colIndex * numRows) + rowIndex;
			if (imgIndex==numImages){break;}

			img.src = "img/" + iconSet[imgIndex];
			img.onclick = iconClick;
			listContainer.appendChild(img);
		}
		
		pickerRowContainer.appendChild(listContainer);
		if (imgIndex==numImages){break;}
	}

	return pickerRowContainer;
}

function iconClick(element){
	activeIconPath = element.target.src;

	var splitPath = activeIconPath.split("/");

	activeIconFilename = splitPath[splitPath.length-1];

	// if an icon row is clicked, update its icon
	if (activeRow){
		activeRow.children[1].children[0].src = "img/" + activeIconFilename;
		mapData[activeMode][activeElementId]["PATH"] = activeIconPath;

		// depending on the mode (ICON or LINE ICON), update the source
		if (activeMode == "ICON"){
			iconSource.getFeatureById(activeElementId).values_.path = activeIconPath;
			iconLayer.changed();
		}
		if (activeMode == "ICONLINE") {
			iconLineSource.getFeatureById(activeElementId).values_.src = activeIconPath;
			iconLineLayer.changed();
		}
		if (activeMode == "FILL"){
			var pattern = createFillPattern(activeIconPath,mapData[activeMode][activeElementId]["SIZE"],mapData[activeMode][activeElementId]["SPACING"]);
			iconFillStyle.stroke_.color_ = pattern;
			iconFillLayer.changed();
		}
	}
}

function load(){
	createMap();
	updateMapExtent(mapExtent);

	createToolDropdown();

	$("#NoJS").style.display = "none";
	$("#InstructionText").style.display = "block";
}

function exportMapToPDF(element){
	element.target.disabled = true;
	document.body.style.cursor = 'progress';

	// var dims = {
	// 	a0: [1189, 841],
	// 	a1: [841, 594],
	// 	a2: [594, 420],
	// 	a3: [420, 297],
	// 	a4: [297, 210],
	// 	a5: [210, 148]
	// };

	// var format = "a0";
	// var format = [width,height];
	var resolution = 120;

	// var format = document.getElementById('format').value;
	// var resolution = document.getElementById('resolution').value;

	// var dim = dims[format];
	// var width = Math.round(dim[0] * resolution / 25.4);
	// var height = Math.round(dim[1] * resolution / 25.4);

	// var width = mapExtent[2];
	// var height = mapExtent[3];

	// var dim = [width,height];
	// var format = [width,height];
	// projection.setExtent(mapExtent);
	projection = new Projection({
		code: 'test',
		units: 'pixels',
		extent: mapExtent
	});

	map.setView(new View({
		// projection: map.getView().getProjection(),
		projection: projection,

		center: getCenter(mapExtent),
		zoom: 0,
		maxZoom: 6,
		minZoom: 0,
		extent:mapExtent
	})
	);

	var viewResolution = map.getView().getResolution();

	// if (viewResolutio)
	var size = map.getSize();

	map.setSize([2*size[0],2*size[1]]);
	var size = map.getSize();

	var width = viewResolution * size[0];
	var height = viewResolution * size[1];

	var pdfSize = [width,height];
	var imageSize = [width,height];

	// console.log(size);
	// console.log("RES",viewResolution);

	// map.on('precompose', function(event) {
	// 	event.context.fillStyle = 'white';
	// 	event.context.fillRect(0, 0, event.context.canvas.width, event.context.canvas.height);
	// });
	// map.once('rendercomplete', function(event) {
	// 	console.log(event);
	// 	console.log(map);
		// var canvas = event.context.canvas;
		// var data = canvas.toDataURL('image/jpeg');
		// var pdf = new jsPDF('landscape', undefined, format);
		// pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
		// pdf.save('map.pdf');
		// map.setSize(size);
		// // map.getView().fit(extent, size);  //edit2: not needed
		// mapView.setZoom(currZoom);  // edit2: set original zoom
	// });

	// console.log($("#map").children[0]);


	map.once('rendercomplete', function() {
		var mapCanvas = document.createElement('canvas');
		mapCanvas.width = width;
		mapCanvas.height = height;
		var mapContext = mapCanvas.getContext('2d');
		mapContext.globalAlpha = 1;

		console.log("HERE");
		Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
			if (canvas.width > 0 & canvas.height >0) {
				// console.log(canvas.style);
				var transform = canvas.style.transform;

				// console.log(transform);
				// // Get the transform parameters from the style's transform matrix
				var matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);

				// Apply the transform to the export map context
				CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);

				mapContext.drawImage(canvas, 0, 0);
			}
		});
		console.log("THERE");
		var pdf = new jsPDF('landscape', 'mm', pdfSize);
		var newThing = mapCanvas.toDataURL('image/jpg');

		// pdf.addImage(newThing, 'JPEG', 0, 0, 1189, 841);

		pdf.addImage(newThing, 'JPEG', 0, 0, imageSize[0],imageSize[1]);
		pdf.save('map.pdf');

		// Reset original map size
		// map.setSize(size);
		// map.getView().setResolution(viewResolution);

		element.target.disabled = false;
		document.body.style.cursor = 'auto';
	});

	// Set print size (in pixels of the map)

	// console.log(map.getSize());
	// console.log()
	// var printSize = [width, height];
	// map.setSize(printSize);

	// console.log(map.getView().extent, mapViewExtent);
	// map.getView().extent = mapViewExtent;

	// map.getView().setResolution(4);
	// var scaling = Math.min(width / size[0], height / size[1]);
	// console.log(scaling);
	// map.getView().setResolution(viewResolution / scaling);
};


function flatCoordsToCoordPairs(flatCoordsIn){
	var coordPairs = [];
	for (var coordIndex=0;coordIndex<(flatCoordsIn.length/2);coordIndex++){
		coordPairs.push([flatCoordsIn[2*coordIndex],flatCoordsIn[(2*coordIndex)+1]]);
	}
	return coordPairs;
}


function createMap(){
	// Creates an openLayers map and adds in all the layers that might be used, sets up drawing tools
	setupMapVariables();

	var mapContainer = document.createElement("div");
	mapContainer.className = "map";
	mapContainer.id = "map";

	$("#mapContainer").appendChild(mapContainer);

	// Map views always need a projection.  Here we just want to map image
	// coordinates directly to map coordinates, so we create a projection that uses
	// the image extent in pixels.

	projection = new Projection({
		code: 'test',
		units: 'pixels',
		extent: mapExtent
	});

	// line setup
	lineLayer = new VectorLayer({
		source: lineSource,
		style: lineStyleFunction
	});


	// icon line setup
	iconLineLayer = new VectorLayer({
		source: iconLineSource,
		style: iconLineStyleFunction
	});

	// icons
	iconLayer = new VectorLayer({
		source: iconSource,
		updateWhileAnimating: true,
		updateWhileInteracting: true,
	});

	var pattern = createFillPattern(activeIconPath,fillSize,spacingSize);

	iconFillStyle = new ol.style.Style({
		stroke: new ol.style.Stroke({
			// color: pattern,
			width: fillSize
		})
	});

	iconFillStyle.stroke_.color_ = pattern;

	iconFillLayer = new VectorLayer({
		source: iconFillSource,
		style: iconFillStyle
	});

	// text setup
	textLayer = new VectorLayer({
		source: textSource,
	    style: textStyleFunction,
		updateWhileAnimating: true,
		updateWhileInteracting: true,
	});

	// arrow setup
	edgeArrowLayer = new VectorLayer({
		source: edgeArrowSource,
	    style: edgeArrowStyleFunction,
		updateWhileAnimating: true,
		updateWhileInteracting: true,
	});

	// compass setup
	compassLayer = new VectorLayer({
		source: compassSource,
		updateWhileAnimating: true,
		updateWhileInteracting: true,
	});

	backgroundLayers = {
		};

	var mapLayers = [
		textLayer,
		iconLayer,
		lineLayer,
		iconFillLayer,
		iconLineLayer,
		edgeArrowLayer,
		compassLayer,
		];

	map = new Map({
		layers: mapLayers,
		target: 'map',
		view: new View({
			projection: projection,
			center: getCenter(mapExtent),
			zoom: 2,
			maxZoom: 6,
			minZoom: 2,
			extent:mapExtent
		})
	});

	// setup line drawing
	lineDraw = new ol.interaction.Draw({
			source: lineSource,
			type: 'LineString'
		});

	map.addInteraction(lineDraw);

	lineDraw.addEventListener("drawend", function(event) {
		// called after a user ends drawing a LINE

		// if a feature is already active, move it to the new location
		if (activeRow){
			activeElement.values_.geometry = event.feature.values_.geometry;
			// update the stored data
			mapData["LINE"][activeElementId]["GEOMETRY"] = flatCoordsToCoordPairs(event.feature.values_.geometry.flatCoordinates);
			lineLayer.changed();
			return;
		}

		var lineFeature = event.feature;

		var lineSpacing = document.getElementById("spacingSlider").value;
		var lineSize = document.getElementById("sizeSlider").value;
		var dotSize = document.getElementById("dotSizeSlider").value;
		var lineGeometry = flatCoordsToCoordPairs(lineFeature.values_.geometry.flatCoordinates);

		lineFeature.values_.spacing = lineSpacing;
		lineFeature.values_.size = lineSize;
		lineFeature.values_.dotSize = dotSize;

		lineFeature.setId(newLineIndex);

		// create a JSON entry to store the new line info in
		var lineEntry = {"ID" : newLineIndex, "SIZE": lineSize, "SPACING":lineSpacing, "DOTSIZE":dotSize,"GEOMETRY":lineGeometry};

		mapData["LINE"][newLineIndex] = lineEntry;

		var newLineRow = createTableLineRow(lineEntry);
		document.getElementById("lineTable").appendChild(newLineRow);
		
		newLineIndex += 1;
	});

	lineDraw.setActive(false);


	// setup icon fills
	iconFillDraw = new Draw({
		source: iconFillSource,
		type: 'LineString'
	});

	map.addInteraction(iconFillDraw);

	iconFillDraw.setActive(false);

	// setup tools for area fill drawing
	iconFillDraw.addEventListener("drawend", function(event) {
		// if a feature is already active, move it to the new location
		if (activeRow){
			// console.log(activeElement.values_.geometry);

			activeElement.values_.geometry = event.feature.values_.geometry;

			// update the stored data
			mapData["FILL"][activeElementId]["GEOMETRY"] = flatCoordsToCoordPairs(event.feature.values_.geometry.flatCoordinates);
			iconFillLayer.changed();
			return;
		}

		var fillFeature = event.feature;

		var fillSize = document.getElementById("sizeSlider").value;
		var fillSpacing = document.getElementById("spacingSlider").value;
		var fillGeometry = flatCoordsToCoordPairs(fillFeature.values_.geometry.flatCoordinates);

		var pattern = createFillPattern(activeIconPath,fillSize,spacingSize);
		iconFillStyle.stroke_.color_ = pattern;

		var fillEntry = {"ID":newFillIndex, "PATH":activeIconPath, "SIZE":fillSize, "SPACING" : fillSpacing, "GEOMETRY":fillGeometry};
		mapData["FILL"][newFillIndex] = fillEntry;

		event.feature.setId(newFillIndex);
		newFillIndex += 1;

		var newFillRow = createTableFillRow(fillEntry);
		addFillRow(newFillRow);
	});

	// setup tools for text drawing
	textDraw = new Draw({
		source: textSource,
		type: "LineString"
	});

	textDraw.addEventListener("drawend", function(event) {
		// called on end of drawing while TEXT is active

		// if a feature is already active, move it to the new location
		if (activeRow){
			activeElement.values_.geometry = event.feature.values_.geometry;
			// update the stored data
			mapData["TEXT"][activeElementId]["GEOMETRY"] = flatCoordsToCoordPairs(event.feature.values_.geometry.flatCoordinates);
			textLayer.changed();
			return;
		}

		var text = document.getElementById("nameInput").value;
		var textSize = document.getElementById("sizeSlider").value;
		var textGeometry = flatCoordsToCoordPairs(event.feature.values_.geometry.flatCoordinates);

		event.feature.values_.text = text;
		event.feature.values_.size = textSize;

		var textEntry = {"ID":newTextIndex, "TEXT":text,"SIZE":textSize, "GEOMETRY":textGeometry}
		mapData["TEXT"][newTextIndex] = textEntry;

		event.feature.setId(newTextIndex);
		newTextIndex += 1;

		var newTextRow = createTableTextRow(textEntry);
		addTextRow(newTextRow);
		activeRow = null;
		}
	);

	map.addInteraction(textDraw);
	textDraw.setActive(false);

	// setup tools for ICON LINE drawing
	iconLineDraw = new ol.interaction.Draw({
		source: iconLineSource,
		type: 'LineString'
	});

	map.addInteraction(iconLineDraw);

	iconLineDraw.addEventListener("drawend", function(event) {
		// called after a user ends drawing an ICON LINE

		// if a feature is already active, move it to the new location
		if (activeRow){
			activeElement.values_.geometry = event.feature.values_.geometry;
			// update the stored data
			mapData["ICONLINE"][activeElementId]["GEOMETRY"] = flatCoordsToCoordPairs(event.feature.values_.geometry.flatCoordinates);
			iconLineLayer.changed();
			return;
		}

		var iconLineFeature = event.feature;

		activeIcon = true;

		var lineName = $("#nameInput").value;
		var lineSpacing = $("#spacingSlider").value;
		var lineSize = $("#sizeSlider").value;
		var lineAngle = $("#angleSlider").value;
		var lineTransparency = $("#transparencySlider").value;
		var lineRandom = $("#randomSlider").value;
		var includeInLegend = $("#includeInLegendToggle").checked;
		var lineGeometry = flatCoordsToCoordPairs(event.feature.values_.geometry.flatCoordinates);

		iconLineFeature.values_.src = activeIconPath;
		iconLineFeature.values_.spacing = lineSpacing;
		iconLineFeature.values_.size = lineSize;
		iconLineFeature.values_.angle = lineAngle;
		iconLineFeature.values_.random = lineRandom;
		iconLineFeature.values_.opacity = lineTransparency;

		iconLineFeature.setId(newIconLineIndex);

		// create a JSON entry to store the new line info in
		var iconLineEntry = {"ID" : newIconLineIndex, "PATH" : activeIconPath, "SIZE": lineSize, "SPACING":lineSpacing, "ANGLE":lineAngle, "TRANSPARENCY":lineTransparency,"RANDOM":lineRandom,"NAME":lineName, "LEGEND":includeInLegend, "GEOMETRY":lineGeometry};

		mapData["ICONLINE"][newIconLineIndex] = iconLineEntry;

		var newIconLineRow = createTableIconLineRow(iconLineEntry);
		document.getElementById("iconLineTable").appendChild(newIconLineRow);
		
		newIconLineIndex += 1;
	});

	iconLineDraw.setActive(false);

	// add the compass
	addCompassToMap();

}

function toggleBackgroundLayer(element){
	showBackgrounds = 1 - showBackgrounds;

	for (var backgroundId of Object.keys(backgroundLayers)) {
		backgroundLayers[backgroundId].setVisible(showBackgrounds);
	}

	if (showBackgrounds){element.target.innerHTML = "Hide Backgrounds";}
	else{element.target.innerHTML = "Show backgrounds";}
}

function toggleIconLineLayer(element){
	showIconLines = 1 - showIconLines;
	iconIconLayer.setVisible(showLines);
	if (showLines){element.target.innerHTML = "Hide Lines";}
	else{element.target.innerHTML = "Show Lines";}
}

function toggleIconLayer(element){
	showIcons = 1 - showIcons;
	iconLayer.setVisible(showIcons);
	if (showIcons){element.target.innerHTML = "Hide Icons";}
	else{element.target.innerHTML = "Show Icons";}
}

function toggleTextLayer(element){
	showText = 1 - showText;
	textLayer.setVisible(showText);
	if (showText){element.target.innerHTML = "Hide Text";}
	else{element.target.innerHTML = "Show Text";}
}

function createToolDropdown(){
	var dropdownContainer = createDiv("dropdown","dropdown");

	var dropdownButton = createButton("dropbtn","Select Tool");
	dropdownButton.onclick = dropdownButtonClick;
	var dropdownElementContainer = createDiv("dropdown-content","toolDropdown");

	var toolNames = ["Map","Background","Icon","Line","Icon Line","Fill","Text","Edge Arrow"];
	for (var toolIndex=0;toolIndex<toolNames.length;toolIndex++){
		var toolEntry = document.createElement("a");
		toolEntry.innerText = toolNames[toolIndex];
		toolEntry.onclick = toolClick;
		dropdownElementContainer.appendChild(toolEntry);
		}

	dropdownContainer.appendChild(dropdownButton);
	dropdownContainer.appendChild(dropdownElementContainer);

	document.getElementById("InstructionText").appendChild(dropdownContainer);

	var layerToolsContainer = createDiv("layerChooser","layerChooser");

	// a container to store the active layer controls in
	var layerControlsContainer = createDiv("layerControls row","layerControls");
	layerToolsContainer.appendChild(layerControlsContainer);

	document.getElementById("controlsContainer").appendChild(layerToolsContainer);

	// Close the dropdown menu if the user clicks outside of it
	window.onclick = function(event) {
		if (!event.target.matches('.dropbtn')) {
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if (openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				}
			}
		}
	} 
}

function toolClick(element){
	var selectedTool = element.target.innerText;

	if (selectedTool=="Map"){showMapControls();}
	if (selectedTool=="Background"){showBackgroundControls()};
	if (selectedTool=="Icon"){showIconControls()};
	if (selectedTool=="Line"){showLineControls()};
	if (selectedTool=="Icon Line"){showIconLineControls()};
	if (selectedTool=="Text"){showTextControls()};
	if (selectedTool=="Fill"){showAreaFillControls()};
	if (selectedTool=="Edge Arrow"){showEdgeArrowControls()};
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropdownButtonClick() {
  document.getElementById("toolDropdown").classList.toggle("show");
}


function clearLayerControls(){
	// remove all children in the container
	var container = document.getElementById("layerControls");
	var childrenToRemove = container.children.length;

	activeRow = null;

	for (var i=0;i<childrenToRemove;i++){
		container.removeChild(container.children[0]);
	}

	// disable the text/fill/line drawing tools
	textDraw.setActive(false);
	iconLineDraw.setActive(false);
	iconFillDraw.setActive(false);
	lineDraw.setActive(false);

	// remove the listener for icon clicks
	document.getElementById("map").removeEventListener('click',iconListener);
}

// GENERIC ELEMENT CONTROL FUNCTIONS

// called on click of a table row
function rowClickCallback(rowElement){
	// if an active row was already clicked, turn it black so its deactivated
	if (activeRow){
		activeRow.style.color = "black";
		// if the already active row was clicked, deactivate it
		if (activeRow == rowElement){ 
			activeRow = null;
			// iconFeature = null;
			return;
		}
	}

	activeRow = rowElement;

	// set all text to red to indicate its been clicked
	rowElement.style.color = "red";

	activeElementId = rowElement.children[0].innerHTML;
	var activeElementInfo = mapData[activeMode][activeElementId];

	if (activeMode=="BACKGROUND"){
		activeElement = backgroundLayers[activeElementId];

		// update all the control values to the active icon's values
		$("#transparencySlider").value = activeElementInfo["TRANSPARENCY"];
	}

	if (activeMode=="ICON"){
		// set the active feature so it can be modified
		activeElement = iconSource.getFeatureById(activeElementId);

		// update all the control values to the active icon's values 
		$("#nameInput").value = activeElementInfo["NAME"];
		$("#includeInLegendToggle").checked = activeElementInfo["LEGEND"];
		$("#sizeSlider").value = activeElementInfo["SIZE"];
		$("#transparencySlider").value = activeElementInfo["TRANSPARENCY"];
	}

	if (activeMode=="LINE"){
		activeElement = lineSource.getFeatureById(activeElementId);
		// update all the control values to the active icon's values
		$("#sizeSlider").value = activeElementInfo["SIZE"];
		$("#spacingSlider").value = activeElementInfo["SPACING"];
		$("#dotSizeSlider").value = activeElementInfo["DOTSIZE"];
	}

	if (activeMode=="ICONLINE"){
		activeElement = iconLineSource.getFeatureById(activeElementId);

		// update all the control values to the active icon's values
		$("#nameInput").value = activeElementInfo["NAME"];
		$("#spacingSlider").value = activeElementInfo["SPACING"];
		$("#angleSlider").value = activeElementInfo["ANGLE"];
		$("#sizeSlider").value = activeElementInfo["SIZE"];
		$("#transparencySlider").value = activeElementInfo["TRANSPARENCY"];
		$("#randomSlider").value = activeElementInfo["RANDOM"];
	}

	if (activeMode == "FILL"){
		activeElement = iconFillSource.getFeatureById(activeElementId);

		// update all the control values to the active icon's values 
		$("#sizeSlider").value = activeElementInfo["SIZE"];
		$("#spacingSlider").value = activeElementInfo["SPACING"];
	}

	if (activeMode == "TEXT"){
		activeElement = textSource.getFeatureById(activeElementId);

		// update all the control values to the active icon's values 
		$("#nameInput").value = activeElementInfo["TEXT"];
		$("#sizeSlider").value = activeElementInfo["SIZE"];
	}

	if (activeMode == "ARROW"){
		activeElementId = directionIdMappings[activeElementId];
		activeElement = edgeArrowSource.getFeatureById(activeElementId);
		activeElementInfo = mapData[activeMode][activeElementId];

		// update all the control values to the active icon's values
		$("#nameInput").value = activeElementInfo["TEXT"];
		$("#sizeSlider").value = activeElementInfo["SIZE"];
	}
}

function nameInputCallback(element){
	// called on change of a name input
	if (activeRow){updateActiveElementName(element.value);}
}

function updateActiveElementName(newName){
	mapData[activeMode][activeElementId]["NAME"] = newName;

	if (activeMode == "ICON"){
		activeRow.children[5].innerHTML = newName;
	}
	if (activeMode == "ICONLINE"){
		activeRow.children[7].innerHTML = newName;
	}

	if (activeMode == "TEXT"){
		activeElement.values_.text = newName;
		activeRow.children[1].innerHTML = newName;
		textLayer.changed();
	}
	if (activeMode == "ARROW"){
		activeElement.values_.text = newName;
		activeRow.children[1].innerHTML = newName;
		edgeArrowLayer.changed();
	}
}

function includeInLegendToggleCallback(element){
	if (activeRow){updateActiveElementLegend(element.checked);}
}

function updateActiveElementLegend(newLegend){
	mapData[activeMode][activeElementId]["LEGEND"] = newLegend;
	if (activeMode=="ICON"){
		activeRow.children[6].innerHTML = newLegend;
	}
	if (activeMode=="ICONLINE"){
		activeRow.children[8].innerHTML = newLegend;
	}
}

function transparencySliderCallback(element){
	// CALLED ON CHANGE OF A TRANSPARENCY SLIDER
	if (activeRow) {updateActiveElementTransparency(element.value);}
}

function updateActiveElementTransparency(newTransparency){
	mapData[activeMode][activeElementId]["TRANSPARENCY"] = newTransparency;
	activeElement.values_.opacity = newTransparency;

	if (activeMode=="ICON"){
		activeRow.children[4].innerHTML = newTransparency;
		iconLayer.changed();
	}

	if (activeMode=="BACKGROUND"){
		activeRow.children[1].innerHTML = newTransparency;
		activeElement.changed();
	}

	if (activeMode=="ICONLINE"){
		activeRow.children[5].innerHTML = newTransparency;
		iconLineLayer.changed();
	}
}

function sizeSliderCallback(element){
	// called on update of the icon size slider
	if (activeRow) {updateActiveElementSize(element.value);}
}

function updateActiveElementSize(newSize){
	mapData[activeMode][activeElementId]["SIZE"] = newSize;
	activeElement.values_.size = newSize;

	if (activeMode=="ICON"){
		activeRow.children[3].innerHTML = newSize;
		iconLayer.changed();
	}
	if (activeMode=="LINE"){
		activeRow.children[1].innerHTML = newSize
		lineLayer.changed();
	}
	if (activeMode=="ICONLINE"){
		activeRow.children[2].innerHTML = newSize
		iconLineLayer.changed();
	}
	if (activeMode=="FILL"){
		activeRow.children[2].innerHTML = newSize;

		var pattern = createFillPattern(activeIconPath,newSize,mapData["FILL"][activeElementId]["SPACING"]);
		iconFillStyle.stroke_.color_ = pattern;
		iconFillLayer.changed();
	}
	if (activeMode=="TEXT"){
		activeRow.children[2].innerHTML = newSize
		textLayer.changed();
	}
	if (activeMode=="ARROW"){
		activeRow.children[2].innerHTML = newSize
		edgeArrowLayer.changed();
	}
}

function randomSliderCallback(element){
	// called on update of the icon size slider
	if (activeRow) {updateActiveElementRandom(element.value);}
}

function updateActiveElementRandom(newRandom){
	mapData[activeMode][activeElementId]["RANDOM"] = newRandom;
	activeElement.values_.random = newRandom;

	if (activeMode=="ICONLINE"){
		activeRow.children[6].innerHTML = newRandom
		iconLineLayer.changed();
	}
}

function fontSizeSliderCallback(element){
	// called on update of the icon size slider
	if (activeRow) {updateActiveElementFontSize(element.value);}
}

function updateActiveElementFontSize(newFontSize){
	mapData[activeMode][activeElementId]["FONTSIZE"] = newFontSize;
	activeElement.values_.fontSize = newFontSize;

	if (activeMode=="ARROW"){
		activeRow.children[3].innerHTML = newFontSize;
		edgeArrowLayer.changed();
	}
}

function angleSliderCallback(element){
	// called on update of an angle slider
	if (activeRow){updateActiveElementAngle(element.value);}
}

function updateActiveElementAngle(newAngle){
	mapData[activeMode][activeElementId]["ANGLE"] = newAngle;
	activeElement.values_.angle = newAngle

	if (activeMode=="ICONLINE"){
		activeRow.children[4].innerHTML = newAngle;
		iconLineLayer.changed();
	}
}

function spacingSliderCallback(element){
	// called on update of a spacing slider
	if (activeRow) {updateActiveElementSpacing(element.value);}
}

function updateActiveElementSpacing(newSpacing){
	mapData[activeMode][activeElementId]["SPACING"] = newSpacing;
  	activeElement.values_.spacing = newSpacing;
	
	if (activeMode == "LINE"){
		activeRow.children[2].innerHTML = newSpacing;
		lineLayer.changed();
	}
	if (activeMode == "ICONLINE"){
		activeRow.children[3].innerHTML = newSpacing;
		iconLineLayer.changed();
	}
	if (activeMode == "FILL"){
		activeRow.children[3].innerHTML = newSpacing;

		var pattern = createFillPattern(activeIconPath,mapData["FILL"][activeElementId]["SIZE"],newSpacing);
		iconFillStyle.stroke_.color_ = pattern;
		iconFillLayer.changed();
	}
}

function createIconTableCell(iconPath){
	var entryImg = document.createElement("img")
	entryImg.src = iconPath;
	entryImg.className = "tableImage";

	var entryIcon = createTableCell("");
	entryIcon.appendChild(entryImg);
	return entryIcon;
}

function deleteElementCallback(element){
	if (activeRow){deleteActiveElement();}
}

function deleteActiveElement(){
	delete mapData[activeMode][activeElementId];

	if (activeMode == "ICON"){
		document.getElementById("iconTable").removeChild(activeRow);
		iconSource.removeFeature(iconSource.getFeatureById(activeElementId));
	}

	if (activeMode == "LINE"){
		document.getElementById("lineTable").removeChild(activeRow);
		lineSource.removeFeature(lineSource.getFeatureById(activeElementId));
	}

	if (activeMode == "ICONLINE"){
		document.getElementById("iconLineTable").removeChild(activeRow);
		iconLineSource.removeFeature(activeElement);
	}

	if (activeMode == "TEXT"){
		document.getElementById("textTable").removeChild(activeRow);
		textSource.removeFeature(activeElement);
	}

	if (activeMode == "BACKGROUND"){
		// rmeove the background from the list of layers and from the metadata
		map.removeLayer(activeElement);
		document.getElementById("backgroundTable").removeChild(activeRow);
		delete backgroundLayers[activeElementId];
	}
	if (activeMode == "FILL"){
		document.getElementById("fillTable").removeChild(activeRow);
		iconFillSource.removeFeature(activeElement);		
	}

	activeRow = null;
}

function createLabeledTextInput(){
	var nameInputLabel = createP("controlLabel","Name");
	var nameInput = createInput();
	nameInput.addEventListener("input", function() {nameInputCallback(this);})
	nameInput.id = "nameInput";
	return [nameInputLabel,nameInput];
}

function createLabelledIncludeInLegendToggler(){
	var includeInLegendLabel = createP("controlLabel","Include in legend:");
	var includeInLegendToggle = createToggleButton("includeInLegendToggle");
	includeInLegendToggle.children[0].addEventListener("change", function() {includeInLegendToggleCallback(this)})
	return [includeInLegendLabel,includeInLegendToggle];
}

function createLabeledTransparencySlider(){
	var transparencySliderLabel = createP("controlLabel","Transparency");
	var transparencySlider = createSlider("transparencySlider",0,1,.01);
	transparencySlider.addEventListener("input", function() {transparencySliderCallback(this)})
	return [transparencySliderLabel,transparencySlider];
}

function createLabeledSizeSlider(){
	var sizeSliderLabel = createP("controlLabel","Size");
	var sizeSlider = createSlider("sizeSlider",0,40,.01);
	sizeSlider.addEventListener("input", function() {sizeSliderCallback(this);})
	return [sizeSliderLabel,sizeSlider];
}

function createLabeledRandomSlider(){
	var randomSliderLabel = createP("controlLabel","Random");
	var randomSlider = createSlider("randomSlider",0,40,.01);
	randomSlider.addEventListener("input", function() {randomSliderCallback(this);})
	return [randomSliderLabel,randomSlider];
}

function createLabeledFontSizeSlider(){
	var fontSizeSliderLabel = createP("controlLabel","Font Size");
	var fontSizeSlider = createSlider("fontSizeSlider",0,40,.01);
	fontSizeSlider.addEventListener("input", function() {fontSizeSliderCallback(this);})
	return [fontSizeSliderLabel,fontSizeSlider];
}

function createLabeledSpacingSlider(){
	var spacingSliderLabel = createP("controlLabel","Spacing");
	var spacingSlider = createSlider("spacingSlider",.01,100,.04);
	spacingSlider.addEventListener("input", function() {spacingSliderCallback(this);})
	return [spacingSliderLabel,spacingSlider];
}

function createLabeledAngleSlider(){
	var angleSliderLabel = createP("controlLabel","Angle");
	var angleSlider = createSlider("angleSlider",0,6.28,.1);
	angleSlider.addEventListener("input", function() {angleSliderCallback(this);})
	return [angleSliderLabel,angleSlider];
}

// INDIVIDUAL LAYER CONTROLS

function createKmlDropdown(){
	var dropdownContainer = createDiv("kmlDropdown","dropdown");

	var dropdownButton = createButton("dropbtn","Select Pre-existing KML File");
	dropdownButton.onclick = kmlDropdownButtonClick;
	var dropdownElementContainer = createDiv("dropdown-content","kmlDropdown");

	for (var toolIndex=0;toolIndex<toolNames.length;toolIndex++){
		var toolEntry = document.createElement("a");
		toolEntry.innerText = toolNames[toolIndex];
		toolEntry.onclick = kmlFileClick;
		dropdownElementContainer.appendChild(toolEntry);
		}

	dropdownContainer.appendChild(dropdownButton);
	dropdownContainer.appendChild(dropdownElementContainer);

	return dropdownContainer;
}

function kmlFileClick(event){
	resetMap();
	var selectedKmlFile = event.target.innerText;

	var filePath = "kml/" + selectedKmlFile + ".kml";

    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", filePath, false);
    rawFile.onreadystatechange = function (){
		if(rawFile.readyState === 4){
			if(rawFile.status === 200 || rawFile.status == 0){
				var allText = rawFile.responseText;
				parse(allText);
			}
		}
	}
	rawFile.send(null);
}

function kmlDropdownButtonClick(element){
	document.getElementById("kmlDropdown").classList.toggle("show");
}

//  MAP control handlers
function showMapControls(element){
	// creates controls for adding ICONS to the map
	clearLayerControls();
	activeMode = "MAP";

	var mapControlsContainer = createDiv("mapControls");

	var kmlDropdown = createKmlDropdown();
	var importFileLabel = createP("controlLabel","Upload Custom KML File");

	var filenameInput = createInput();
	filenameInput.id= 'file-input';
	filenameInput.type = 'file';

	filenameInput.addEventListener('change', readSingleFile, false);

	var resetMapButton = createButton("controlButton","Reset map");
	resetMapButton.onclick = resetMap;

	var addLegendButton = createButton("controlButton","Show legend");
	addLegendButton.onclick = legendButtonCallback;

	var addCompassButton = createButton("controlButton","Show Compass");
	addCompassButton.onclick = compassButtonCallback;

	var exportPdfButton = createButton("controlButton","Export PDF");
	exportPdfButton.id = 'export-pdf';
	exportPdfButton.onclick = exportMapToPDF;

	var saveMapButton = createButton("controlButton","Save map to cookies");
	saveMapButton.onclick = saveMapToCookies;

	var loadMapButton = createButton("controlButton","Load map from cookies");
	loadMapButton.onclick = loadMapFromCookies;

	appendChildren(mapControlsContainer,[kmlDropdown,importFileLabel,filenameInput,resetMapButton,addLegendButton,addCompassButton, exportPdfButton,saveMapButton,loadMapButton]);
	appendChildren($("#layerControls"),[mapControlsContainer]);
}

function saveMapToCookies(event){
	for (var featureType of Object.keys(mapData)) {
		setCookie(featureType,JSON.stringify(mapData[featureType]));
	}
}

function updateMapExtent(newExtent){
	var size = map.getSize();
	var viewResolution = map.getView().getResolution();

	// console.log("SIZE",size);
	// console.log("RES",viewResolution);
	relocateCompass(newExtent);


	// map.getView().fit(newExtent , map.getSize());

	// // var newProjection = new Projection({
	// // 	code: 'test',
	// // 	units: 'pixels',
	// // 	extent: newExtent
	// // });

	var mapViewOffset = Math.max(...newExtent)/30;
	// console.log(mapViewOffset);
	var mapViewExtent = [-mapViewOffset,-mapViewOffset,newExtent[2]+mapViewOffset,newExtent[3]+mapViewOffset];
	// projection.setExtent(mapExtent);
	// map.getView().getProjection().setExtent(mapViewExtent);
	var mapView = new View({
		// projection: map.getView().getProjection(),
		projection: projection,

		center: getCenter(newExtent),
		zoom: 0,
		maxZoom: 6,
		minZoom: 0,
		extent:mapViewExtent
	})

	DEFAULT_ICON_SIZE = (Math.max(...newExtent)/600) * BASE_ICON_SIZE;

	var mapMaxWidth = 1300;
	var mapMaxHeight = 700;

	var newMapAspectRatio = newExtent[2]/newExtent[3];

	// if height is bigger than width, set height to max, and width to aspect
	if (newMapAspectRatio<1.0){
		var newHeight = mapMaxHeight;
		var newWidth = newMapAspectRatio * mapMaxHeight;

	}
	// if width is bigger than height, set width to max and height to aspect scaled
	else{
		var newWidth = mapMaxWidth;
		var newHeight = (mapExtent[3]/mapExtent[2]) * mapMaxWidth;
	}

	var mapContainer = $("#map");
	mapContainer.style.height = newHeight + "px";
	mapContainer.style.width = newWidth + "px";

	// // var mapView = map.getView();
	// // mapView.getProjection().setExtent([0, 0, 100000,10000]);

	map.setView(mapView);
	map.updateSize();
}

function loadMapFromCookies(event){
	for (var featureType of Object.keys(mapData)) {
		var featureData = JSON.parse(getCookie(featureType));
		// console.log(featureData);
		if (!featureData){continue};

		mapData[featureType] = featureData;

		if (featureType == "MAP"){
			mapExtent = featureData["EXTENT"];
			updateMapExtent(mapExtent);
		}
		else{
			loadFeaturesFromJson(featureType,featureData);
		}
	}
}

function loadFeaturesFromJson(featureType,features){
	for (var featureId of Object.keys(features)) {
		var featureEntry = features[featureId];

		if (featureType=="ICON"){
			activeIconPath = featureEntry["PATH"];
			addIconToMap(featureEntry["ID"],featureEntry["POSITION"],featureEntry["SIZE"]);
		}
		if (featureType=="LINE"){
			addLineToMap(featureEntry["GEOMETRY"],featureEntry["SIZE"],featureEntry["SPACING"],featureEntry["DOTSIZE"],featureEntry["ID"]);
		}
		if (featureType=="ICONLINE"){
			addIconLineToMap(featureEntry["PATH"],featureEntry["GEOMETRY"],featureEntry["SIZE"],featureEntry["SPACING"], featureEntry["ANGLE"],featureEntry["TRANSPARENCY"],featureEntry["RANDOM"],featureEntry["ID"]);
		}
		if (featureType=="TEXT"){
			addTextToMap(featureEntry["TEXT"],featureEntry["SIZE"],featureEntry["GEOMETRY"],featureEntry["ID"]);
		}
		if (featureType=="BACKGROUND"){
			var backgroundPath = featureEntry["PATH"];
			// mapData["BACKGROUND"][backgroundPath] = featureEntry;

			var newBackground = createBackgroundLayer(backgroundPath,featureEntry["TRANSPARENCY"],projection,mapExtent);
			backgroundLayers[backgroundPath] = newBackground;

			map.addLayer(newBackground);
		}
	}
}

function setupMapVariables(){
	mapData = {
		"MAP" : {"LEGEND":0,"COMPASS":0,"EXTENT":mapExtent},
		"ICON" : {},
		"LINE" : {},
		"ICONLINE" : {},
		"FILL" : {},
		"ARROW" : {},
		"TEXT" : {},
		"BACKGROUND" : {}
		};

	newIconIndex = 0;
	newTextIndex = 0;
	newLineIndex = 0;
	newIconLineIndex = 0;
	newFillIndex = 0;
}

function resetMap(element){
	// deletes all features from the map and resets the mapData JSON

	for (var backgroundId of Object.keys(backgroundLayers)) {
		map.removeLayer(backgroundLayers[backgroundId]);
	}

	iconSource.clear();
	lineSource.clear();
	iconLineSource.clear();
	iconFillSource.clear();
	edgeArrowSource.clear();
	textSource.clear();

	setupMapVariables();

}

// LEGEND functions
function createLegendTable(){
	return createTable("legendTable", []);
}

function createLegendRow(legendEntries){
	var legendEntryContainer = document.createElement("tr");

	for (var i=0; i<legendEntries.length; i++){
		var entryName = createTableCell(legendEntries[i]["NAME"]);
		var entryIcon = createIconTableCell(legendEntries[i]["PATH"]);
		appendChildren(legendEntryContainer,[entryName,entryIcon]);
	}

	return legendEntryContainer;
}

function addLegendRowToTable(newRow){
	$("#legendTable").appendChild(newRow);
}

function buildLegend(){
	var legendTitleRow = document.createElement("tr");
	legendTitleRow.innerHTML = "Legend"
	legendTitleRow.style.width = "99%";
	addLegendRowToTable(legendTitleRow);

	var allLegendEntries = [];

	// loop through every icon, line, and fill and add those with LEGEND flag set to 1
	// now load all the pre-existing icons that have already been added
	var preexistingIcons = mapData["ICON"];
	for (var iconId of Object.keys(preexistingIcons)) {
		if (preexistingIcons[iconId]["LEGEND"]){
			allLegendEntries.push({"NAME":preexistingIcons[iconId]["NAME"],"PATH":preexistingIcons[iconId]["PATH"]});
		}
	}

	var preexistingIconLines = mapData["ICONLINE"];
	for (var iconLineId of Object.keys(preexistingIconLines)) {
		if (preexistingIconLines[iconLineId]["LEGEND"]){
			allLegendEntries.push({"NAME":preexistingIconLines[iconLineId]["NAME"],"PATH":preexistingIconLines[iconLineId]["PATH"]});
		}
	}

	var preexistingFills = mapData["FILL"];
	for (var fillId of Object.keys(preexistingFills)) {
		if (preexistingFills[fillId]["LEGEND"]){
			allLegendEntries.push({"NAME":preexistingFills[fillId]["NAME"],"PATH":preexistingFills[fillId]["PATH"]});
		}
	}

	var entriesPerRow = 2;
	var numRows = Math.ceil(allLegendEntries.length/2);

	for (var i=0; i< numRows; i++){
		var legendEntries = [];
		for (var colNum=0;colNum<entriesPerRow;colNum++){
			var indexToTake = (i*entriesPerRow) + colNum;
			if (indexToTake == allLegendEntries.length){
				break;
			}

			legendEntries.push(allLegendEntries[indexToTake]);
		}
		var legendRow = createLegendRow(legendEntries);
		addLegendRowToTable(legendRow);
	}
}

function addLegendToMap(){
	var legendTable = createLegendTable();
	document.body.appendChild(legendTable);
}

function showLegendTable(){
	addLegendToMap();
	buildLegend();
}

function hideLegendTable(){
	$("#legendTable").remove();
}

function legendButtonCallback(element){
	showLegend = 1 - showLegend;
	if (showLegend){
		element.target.innerHTML = "Hide Legend"
		showLegendTable();
	}
	else {
		element.target.innerHTML = "Show Legend";
		hideLegendTable();
	}
}

// COMPASS controls
function addCompassToMap(){
	var compassFeature = new Feature({
		geometry: new Point(compassAnchor),
		path: "img/compass.png",
		size: .01,
		opacity: 1,
		// style: iconStyleFunction,
	});

	compassFeature.setId(0);
	compassFeature.setStyle(iconStyleFunction);
	compassSource.addFeature(compassFeature);
}

function relocateCompass(newExtent){
	compassAnchor = [.9*newExtent[2],.1*newExtent[3]];
	compassSource.getFeatureById(0).values_.geometry.flatCoordinates = compassAnchor;
	// console.log(compassAnchor);
	// console.log(mapExtent);
	compassLayer.changed();
}

function compassButtonCallback(element){
	showCompass = 1 - showCompass;

	// // if the compass hasnt been drawn yet, add it
	// if (compassSource.getFeatures().length == 0){
	// }

	compassLayer.setVisible(showCompass);
	if (showCompass){element.target.innerHTML = "Hide Compass"}
	else {element.target.innerHTML = "Show Compass";}
}

// ICON handlers
function createTableIconRow(iconEntry){
	// creates a row entry for an ICON to be added to the map
	var tableIconEntryContainer = document.createElement("tr")
	tableIconEntryContainer.onclick = function () {rowClickCallback(this)};

	var entryId = createTableCell(iconEntry["ID"]);
	var entryIcon = createIconTableCell(iconEntry["PATH"]);
	var entryPosition = createTableCell(iconEntry["POSITION"]);
	var entryTransparency = createTableCell(iconEntry["TRANSPARENCY"]);
	var entrySize = createTableCell(iconEntry["SIZE"]);
	var entryName = createTableCell(iconEntry["NAME"]);
	var entryLegend = createTableCell(iconEntry["LEGEND"]);

	appendChildren(tableIconEntryContainer,[entryId, entryIcon,entryPosition,entryTransparency,entrySize,entryName,entryLegend]);
	return tableIconEntryContainer;
}

function createIconTable(){
	// creates an empty table to store ICON entries in
	return createTable("iconTable",["ID","Icon","Pos","Size","Transparency","Name","Legend"]);
}

// called on click of an icon row
function setActiveIconRow(element){
	rowClickCallback(element);
}

function addIconCallback(){
	// called on click of the "ADD ICON" button, adds an icon to the map and an entry to the table of icons
	var iconName = $("#nameInput").value
	var includeInLegend = $("#includeInLegendToggle").checked;

	var newIconEntry = {"ID": newIconIndex, "PATH": activeIconPath, "POSITION": DEFAULT_ICON_POSITION, "TRANSPARENCY": DEFAULT_ICON_TRANSPARENCY, "SIZE":DEFAULT_ICON_SIZE,"LEGEND":includeInLegend,"NAME":iconName}

	// add the icon entry to the global dataset
	mapData["ICON"][newIconIndex] = newIconEntry;

	addIconToMap(newIconIndex,DEFAULT_ICON_POSITION,DEFAULT_ICON_SIZE);

	var newIconRow = createTableIconRow(newIconEntry);
	document.getElementById("iconTable").appendChild(newIconRow);
	setActiveIconRow(newIconRow);

	newIconIndex += 1;
}

function showIconControls(element){
	// creates controls for adding ICONS to the map
	clearLayerControls();
	activeMode = "ICON";

	var iconLabel = createP("controlLabel","Icon");
	var iconPicker = createIconPicker(icons);

	var iconControlsContainer = createDiv("iconControls");

	// document.getElementById("layerControls").appendChild();
	iconControlsContainer.appendChild(iconPicker);

	appendChildren(iconControlsContainer,createLabeledTextInput());
	appendChildren(iconControlsContainer,createLabelledIncludeInLegendToggler());
	appendChildren(iconControlsContainer,createLabeledSizeSlider());
	appendChildren(iconControlsContainer,createLabeledTransparencySlider());

	var deleteButton = createButton("controlButton","Delete Icon");
	deleteButton.onclick = deleteElementCallback;

	var addNewButton = createButton("controlButton","Add New Icon");
	addNewButton.onclick = addIconCallback;

	appendChildren(iconControlsContainer,[deleteButton,addNewButton]);

	appendChildren($("#layerControls"),[iconControlsContainer,createIconTable()]);

	// now load all the pre-existing icons that have already been added
	var preexistingIcons = mapData["ICON"];

	for (var iconId of Object.keys(preexistingIcons)) {
		var newIconRow = createTableIconRow(preexistingIcons[iconId]);
		document.getElementById("iconTable").appendChild(newIconRow);
		setActiveIconRow(newIconRow);
	}

	// setup a callback on click of the map to add an icon when its clicked
	var mapContainer = document.getElementById("map");

	// icon drawing
	iconListener = mapContainer.addEventListener('click', function(event) {iconMapClick(event);})

	// mousePixel = map.getEventPixel(event);

	// var feature = map.forEachFeatureAtPixel(mousePixel,
	// 	function(feature) {
	// 		return feature;
	// 	}
	// );

	// if (feature) {
	// 	iconSource.removeFeature(feature);
	// 	// var coordinates = feature.getGeometry().getCoordinates();
	// 	return;
	// }
}

function iconMapClick(event){
	// called on click of the map when ICON tools are active, if an ICON is active it will move its location to the clicked location
	if (activeMode != "ICON"){return;}
	if (activeRow){
		var clickLocation = map.getEventCoordinate(event);

		// round the click location to the nearest 2 decimals
		clickLocation[0] = clickLocation[0].toFixed(2);
		clickLocation[1] = clickLocation[1].toFixed(2);

		mapData["ICON"][activeElementId]["POSITION"] = clickLocation;

		// update the coordinates for the active icon
		iconSource.getFeatureById(activeElementId).values_.geometry.flatCoordinates = clickLocation;
		iconLayer.changed();

		updateIconRowLocation(clickLocation);		
	}
}

function updateIconRowLocation(newLocation){
	// updates the location entry for the active ICON row
	activeRow.children[2].innerHTML = newLocation;	
}

function addIconToMap(featureId,featureLocation,scaleFactor){
	var iconFeature = new Feature({
		geometry: new Point(featureLocation),
		path: activeIconPath,
		size: scaleFactor,
		opacity: 1,
		// style: iconStyleFunction,
	});

	iconFeature.setId(featureId);

	iconFeature.setStyle(iconStyleFunction);
	iconSource.addFeature(iconFeature);
}


//  LINE FUNCTIONS
function addLineToMap(coords,size,spacing,dotSize,featureId){
	var lineFeature = new Feature({
		geometry: new LineString(coords),
		size: size,
		spacing: spacing,
		dotSize: Number(dotSize),
	});

	lineFeature.setId(featureId);
	lineSource.addFeature(lineFeature);
}
function createLineTable(){
	// returns an HTML table with column titles for adding an icon line
	return createTable("lineTable",["ID","Size","Spacing","Dot Size"])
}

function createTableLineRow(lineEntry){
	// creates a row entry for a LINE ICON to be added to the map
	var tableLineEntryContainer = document.createElement("tr");
	tableLineEntryContainer.onclick = function () {rowClickCallback(this)};
	
	var entryId = createTableCell(lineEntry["ID"]);
	var entrySize = createTableCell(lineEntry["SIZE"]);
	var entrySpacing = createTableCell(lineEntry["SPACING"]);
	var entryDotSize = createTableCell(lineEntry["DOTSIZE"]);

	appendChildren(tableLineEntryContainer,[entryId,entrySize,entrySpacing,entryDotSize]);
	return tableLineEntryContainer;
}

function dotSizeSliderCallback(element){
	var newDotSize = element.value;
	if (activeRow){
		activeElement.values_.dotSize = newDotSize;
		lineLayer.changed();
	}
}

function showLineControls(element){
	clearLayerControls();
	activeMode = "LINE";

	var lineControlsContainer = createDiv("lineControls");

	var lineInstructions = createP("controlLabel","Hold SHIFT to draw smooth lines");

	appendChildren(lineControlsContainer,[lineInstructions]);

	// dotDashImageButtons = createRadioButtons("radio",["Dot","Dash"])

	appendChildren(lineControlsContainer,createLabeledSizeSlider());
	appendChildren(lineControlsContainer,createLabeledSpacingSlider());

	var dotSizeSliderLabel = createP("controlLabel","Dash size");
	var dotSizeSlider = createSlider("dotSizeSlider",.1,100,.04);
	dotSizeSlider.addEventListener("input", function() {dotSizeSliderCallback(this);})

	appendChildren(lineControlsContainer,[dotSizeSliderLabel,dotSizeSlider]);


	var deleteLineButton = createButton("controlButton","Delete line");
	deleteLineButton.onclick = deleteElementCallback;
	lineControlsContainer.appendChild(deleteLineButton);

	appendChildren($("#layerControls"),[lineControlsContainer,createLineTable()]);

	var preexistingLines = mapData["LINE"];

	for (var lineId of Object.keys(preexistingLines)) {
		var newLineRow = createTableLineRow(preexistingLines[lineId]);
		document.getElementById("lineTable").appendChild(newLineRow);
	}

	lineDraw.setActive(true);
}




// LINE ICON functions
function addIconLineToMap(iconPath,coords,scaleFactor,spacing,angle,transparency,random,featureId){
	var iconLineFeature = new Feature({
		geometry: new LineString(coords),
		src: iconPath,
		size: scaleFactor,
		spacing: spacing,
		angle: angle,
		opacity: transparency,
		random: random
	});

	iconLineFeature.setId(featureId);
	iconLineSource.addFeature(iconLineFeature);
}

function createIconLineTable(){
	// returns an HTML table with column titles for adding an icon line
	return createTable("iconLineTable",["ID","Icon","Size","Spacing","Angle","Transparency","Random","Name","Legend"])
}

function createTableIconLineRow(iconLineEntry){
	// creates a row entry for a LINE ICON to be added to the map
	var tableIconLineEntryContainer = document.createElement("tr");
	tableIconLineEntryContainer.onclick = function () {rowClickCallback(this)};
	
	var entryId = createTableCell(iconLineEntry["ID"]);
	var entryIcon = createIconTableCell(iconLineEntry["PATH"]);
	var entrySpacing = createTableCell(iconLineEntry["SPACING"]);
	var entryAngle = createTableCell(iconLineEntry["ANGLE"]);
	var entrySize = createTableCell(iconLineEntry["SIZE"]);
	var entryTransparency = createTableCell(iconLineEntry["TRANSPARENCY"]);
	var entryRandom = createTableCell(iconLineEntry["RANDOM"]);
	var entryName = createTableCell(iconLineEntry["NAME"]);
	var entryLegend = createTableCell(iconLineEntry["LEGEND"]);

	appendChildren(tableIconLineEntryContainer,[entryId,entryIcon,entrySize,entrySpacing,entryAngle,entryTransparency,entryRandom,entryName,entryLegend]);
	return tableIconLineEntryContainer;
}

function showIconLineControls(element){
	clearLayerControls();
	activeMode = "ICONLINE";

	var iconLineControlsContainer = createDiv("iconLineControls");

	var iconLineInstructions = createP("controlLabel","Hold SHIFT to draw smooth lines");
	var iconLabel = createP("controlLabel","Icon");
	var iconLineIconPicker = createIconPicker(lineIcons);

	appendChildren(iconLineControlsContainer,[iconLineInstructions,iconLabel,iconLineIconPicker]);

	// dotDashImageButtons = createRadioButtons("radio",["Dot","Dash","Image"])

	appendChildren(iconLineControlsContainer,createLabeledTextInput());
	appendChildren(iconLineControlsContainer,createLabelledIncludeInLegendToggler());
	appendChildren(iconLineControlsContainer,createLabeledRandomSlider());
	appendChildren(iconLineControlsContainer,createLabeledSizeSlider());
	appendChildren(iconLineControlsContainer,createLabeledSpacingSlider());
	appendChildren(iconLineControlsContainer,createLabeledAngleSlider());
	appendChildren(iconLineControlsContainer,createLabeledTransparencySlider());

	var deleteIconLineButton = createButton("controlButton","Delete line");
	deleteIconLineButton.onclick = deleteElementCallback;
	iconLineControlsContainer.appendChild(deleteIconLineButton);

	appendChildren($("#layerControls"),[iconLineControlsContainer,createIconLineTable()]);

	// now load all the pre-existing lines that have already been added
	var preexistingIconLines = mapData["ICONLINE"];

	for (var iconLineId of Object.keys(preexistingIconLines)) {
		var newIconLineRow = createTableIconLineRow(preexistingIconLines[iconLineId]);
		document.getElementById("iconLineTable").appendChild(newIconLineRow);
		// setActiveLineIconRow(newLineRow);
	}

	iconLineDraw.setActive(true);
}


// AREA FILL handlers
function createAreaFillTable(){
	// returns an HTML table with column titles for adding an icon line
	return createTable("fillTable",["ID","Icon","Size","Spacing","Angle","Transparency","Name","Legend"])
}

function createTableFillRow(fillEntry){
	var tableFillEntryContainer = document.createElement("tr");
	tableFillEntryContainer.onclick = function () {rowClickCallback(this)};

	var entryId = createTableCell(fillEntry["ID"]);
	var entryIcon = createIconTableCell(fillEntry["PATH"]);
	var entrySize = createTableCell(fillEntry["SIZE"]);
	var entrySpacing = createTableCell(fillEntry["SPACING"]);

	appendChildren(tableFillEntryContainer,[entryId,entryIcon,entrySize,entrySpacing]);
	return tableFillEntryContainer;
}

function addFillRow(newFillRow){
	document.getElementById("fillTable").appendChild(newFillRow);
}

function showAreaFillControls(element){
	clearLayerControls();
	activeMode = "FILL";

	var areaFillControlsContainer = createDiv("areaFillControls");

	// <br> NOTE ON AREA FILL: "SCRATCH IN" THE AREA YOU WANT FILLED

	var iconLabel = createP("controlLabel","Icon");
	var areaFillIconPicker = createIconPicker(fillIcons);

	appendChildren(areaFillControlsContainer,[iconLabel,areaFillIconPicker]);
	appendChildren(areaFillControlsContainer,createLabeledSizeSlider());
	appendChildren(areaFillControlsContainer,createLabeledSpacingSlider());
	appendChildren(areaFillControlsContainer,createLabeledAngleSlider());

	var deleteFillButton = createButton("controlButton","Delete fill");
	deleteFillButton.onclick = deleteElementCallback;

	areaFillControlsContainer.appendChild(deleteFillButton);

	appendChildren($("#layerControls"),[areaFillControlsContainer,createAreaFillTable()]);

	// load all the pre-existing fills that have already been added
	var preexistingFills = mapData["FILL"];

	for (var fillId of Object.keys(preexistingFills)) {
		var newFillRow = createTableFillRow(preexistingFills[fillId]);
		document.getElementById("fillTable").appendChild(newFillRow);
	}

	iconFillDraw.setActive(true);
}


function updateActiveFillSize() {}


// TEXT handlers
function addTextToMap(text,fontSize,coords,featureId){
	var textFeature = new Feature({
		geometry: new LineString(coords),
		text: text,
		size: fontSize
	});

	textFeature.setId(featureId);
	textSource.addFeature(textFeature);
}

function showTextControls(element){
	clearLayerControls();
	activeMode = "TEXT";

	// creates a text table and controls to add the text
	var textControlsContainer = createDiv("textControls");

	appendChildren(textControlsContainer,createLabeledTextInput());
	appendChildren(textControlsContainer,createLabeledSizeSlider());

	var removeTextButton = createButton("controlButton","Remove Text");
	removeTextButton.onclick = deleteElementCallback;

	textControlsContainer.appendChild(removeTextButton);

	var textTable = createTextTable();
	textTable.className = "textTable"

	appendChildren($("#layerControls"),[textControlsContainer,textTable]);

	// now load all the pre-existing TEXTs that have already been added
	var preexistingText = mapData["TEXT"];

	for (var textId of Object.keys(preexistingText)) {
		var newTextRow = createTableTextRow(preexistingText[textId]);
		document.getElementById("textTable").appendChild(newTextRow);
	}

	textDraw.setActive(true);
}

function addTextRow(newTextRow){
	document.getElementById("textTable").appendChild(newTextRow);
}

function createTableTextRow(textEntry){
	var tableTextEntryContainer = document.createElement("tr");
	tableTextEntryContainer.onclick = function () {rowClickCallback(this)};

	var entryId = createTableCell(textEntry["ID"]);
	var entryText = createTableCell(textEntry["TEXT"]);
	var entrySize = createTableCell(textEntry["SIZE"]);

	appendChildren(tableTextEntryContainer,[entryId,entryText,entrySize]);
	return tableTextEntryContainer;
}

function createTextTable(){
	return createTable("textTable",["ID","Text","Size"])
}

// BACKGROUND functions
function createBackgroundTable(){
	return createTable("backgroundTable",["Name","Transparency"]);
}

function createTableBackgroundRow(backgroundEntry){
	var tableBackgroundEntryContainer = document.createElement("tr");
	tableBackgroundEntryContainer.onclick = function () {rowClickCallback(this)};

	var entryPath = createTableCell(backgroundEntry["PATH"]);
	var entryTransparency = createTableCell(backgroundEntry["TRANSPARENCY"]);

	appendChildren(tableBackgroundEntryContainer,[entryPath,entryTransparency]);
	return tableBackgroundEntryContainer;
}

function addBackgroundRow(newBackgroundRow){
	document.getElementById("backgroundTable").appendChild(newBackgroundRow);
}


function setActiveBackgroundRow(rowElement){
	rowClickCallback(rowElement)
}
// 	activeElementId = rowElement.children[0].innerHTML;
// 	activeElement = backgroundLayers[activeElementId];
// 	// update all the control values to the active icon's values
// 	document.getElementById("backgroundTransparency").value = mapData["BACKGROUND"][activeElementId]["TRANSPARENCY"];
// }

function showBackgroundControls(element){
	clearLayerControls();
	activeMode = "BACKGROUND";

	var backgroundControlsContainer = createDiv("controlsContainer");

	var backgroundImagesButtons = createRadioButtons("backgroundRadio",backgroundImages);

	backgroundControlsContainer.appendChild(backgroundImagesButtons);
	appendChildren(backgroundControlsContainer,createLabeledTransparencySlider());

	var addBackgroundButton = createButton("controlButton","Add background");
	addBackgroundButton.onclick = addBackground;

	var removeBackgroundButton = createButton("controlButton","Remove background");
	removeBackgroundButton.onclick = deleteElementCallback;

	appendChildren(backgroundControlsContainer,[addBackgroundButton,removeBackgroundButton])

	var backgroundTable = createBackgroundTable();
	appendChildren($("#layerControls"),[backgroundControlsContainer,backgroundTable]);

	// now load all the pre-existing TEXTs that have already been added
	var preexistingBackgrounds = mapData["BACKGROUND"];

	for (var backgroundId of Object.keys(preexistingBackgrounds)) {
		var newBackgroundRow = createTableBackgroundRow(preexistingBackgrounds[backgroundId]);
		addBackgroundRow(newBackgroundRow);
	}
}

function addBackground(element){
	// adds the chosen background to the map with the chosen paremeters
	var backgroundPath = getChosenRadioValue("backgroundRadio");

	// check if this one had already been added
	if (mapData["BACKGROUND"][backgroundPath]){
		return;
	}

	var backgroundTransparency = Number($("#transparencySlider").value);

	var backgroundEntry = {"PATH": backgroundPath, "TRANSPARENCY": backgroundTransparency};

	mapData["BACKGROUND"][backgroundPath] = backgroundEntry;

	var newBackground = createBackgroundLayer(backgroundPath,backgroundTransparency,projection,mapExtent);
	backgroundLayers[backgroundPath] = newBackground;

	var backgroundRow = createTableBackgroundRow(backgroundEntry);
	addBackgroundRow(backgroundRow);
	setActiveBackgroundRow(backgroundRow);

	// newBackground.setId(100);
	map.addLayer(newBackground);

	// createBackgroundLayer("papyrus.jpg",.75,projection,mapExtent)
}

function createBackgroundLayer(imageName,opacity,backgroundProjection,backgroundExtent){
	return new ImageLayer({
		source: new Static({
			url: "backgrounds/" + imageName,
			projection: backgroundProjection,
			imageExtent: backgroundExtent,
		}),
		opacity: Number(opacity),
		zIndex: -1
	})
}


// EDGE ARROW HANDLERS
function createArrowTable(){
	return createTable("arrowTable",["Direction","Text","Size","Font Size"]);
}

function showEdgeArrowControls(element){
	// clears control container and adds the legend controls
	clearLayerControls();
	activeMode = "ARROW";

	var edgeArrowsControlsContainer = createDiv("edgeArrowsControls");

	var arrowDirectionButtons = createRadioButtons("arrowDirectionButtons",["NORTH","SOUTH","EAST","WEST"]);

	appendChildren(edgeArrowsControlsContainer,createLabeledTextInput());
	appendChildren(edgeArrowsControlsContainer,createLabeledSizeSlider());
	appendChildren(edgeArrowsControlsContainer,createLabeledFontSizeSlider());

	var addArrowButton = createButton("controlButton","Add arrow");
	addArrowButton.onclick = addArrowCallback;

	var removeArrowButton = createButton("controlButton","Remove arrow");

	appendChildren(edgeArrowsControlsContainer,[arrowDirectionButtons,addArrowButton]);

	var arrowTable = createArrowTable();
	appendChildren($("#layerControls"),[edgeArrowsControlsContainer,arrowTable]);

	// now load all the pre-existing lines that have already been added
	// preexistingArrows = mapData["ARROW"];

	// for (var lineId of Object.keys(preexistingLines)) {
	// 	newLineRow = createTableIconRow(preexistingLines[lineId]);
	// 	document.getElementById("lineTable").appendChild(newLineRow);
	// }
}

function createTableArrowRow(arrowEntry){
	var tableArrowEntryContainer = document.createElement("tr");
	tableArrowEntryContainer.onclick = function () {rowClickCallback(this)};

	var entryDirection = createTableCell(arrowEntry["DIRECTION"]);
	var entryText = createTableCell(arrowEntry["TEXT"]);
	var entrySize = createTableCell(arrowEntry["SIZE"]);
	var entryFontSize = createTableCell(arrowEntry["FONTSIZE"]);

	appendChildren(tableArrowEntryContainer,[entryDirection,entryText,entrySize,entryFontSize]);
	return tableArrowEntryContainer;
}

function addArrowRow(newArrowRow){
	document.getElementById("arrowTable").appendChild(newArrowRow);
}

function addArrowCallback(element){
	var chosenDirection = getChosenRadioValue("arrowDirectionButtons");

	var arrowId = directionIdMappings[chosenDirection];
	var enteredText = $("#nameInput").value;
	var arrowSize = $("#sizeSlider").value;
	var fontSize = $("#fontSizeSlider").value;

	var arrowEntry = {"DIRECTION": chosenDirection, "TEXT" : enteredText, "SIZE": arrowSize,"FONTSIZE":fontSize};

	mapData["ARROW"][arrowId] = arrowEntry;
	var arrowRow = createTableArrowRow(arrowEntry);
	addArrowRow(arrowRow);

	addEdgeArrowToMap(chosenDirection, fontSize,arrowSize,enteredText);
}

function addEdgeArrowToMap(direction, fontSize,arrowSize,text){
	var elementId = directionIdMappings[direction];
	var arrowAnchor = directionAnchors[direction];
	var textAnchor = [arrowAnchor[0] + directionTextOffsets[direction][0], arrowAnchor[1] + directionTextOffsets[direction][1]];
	var directionAngle = directionAngles[direction];

	var edgeArrowFeature = new Feature({
		geometry: new Point(arrowAnchor),
		textGeometry: new Point(textAnchor),
		path: 'img/arrow.png',
		fontSize: fontSize,
		size: arrowSize,
		text: text,
		opacity: 1,
		angle: directionAngle
	});

	// edgeArrowFeature.setStyle(edgeArrowStyleFunction);

	edgeArrowFeature.setId(elementId);
	edgeArrowSource.addFeature(edgeArrowFeature);
}

function geoDistance(lat1, lon1, lat2, lon2, unit) {
	// South latitudes are negative, east longitudes are positive                                                                         
	// lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)
	// lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)
	//  unit = the unit you desire for results                             
	//    where: 'M' is statute miles (default)                       

	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;

		// return distance in feet
		return dist*5280/2;
		// if (unit=="K") { dist = dist * 1.609344 }
		// if (unit=="N") { dist = dist * 0.8684 }
		// return dist;
	}
}

function gpsToLocal(siteOrigin, gpsCoordIn){
	// hold latitude fixed to calculate delta X
	var delX = Number(geoDistance(siteOrigin[0],siteOrigin[1],siteOrigin[0], gpsCoordIn[1]).toFixed(2));
	// hold longitude fixed to calculate delta Y
	var delY = Number(geoDistance(siteOrigin[0],siteOrigin[1],gpsCoordIn[0], siteOrigin[1]).toFixed(2));
	return [delX, delY];
}

function readSingleFile(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}

	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		parse(contents);
	};
	reader.readAsText(file);
}

var xmlDoc;

function getXMLTag(parent,tag){
	return parent.getElementsByTagName(tag);
}

function parse(content){
	var parser = new DOMParser();

	xmlDoc = parser.parseFromString(content,"text/xml")

	var kmlDoc = getXMLTag(getXMLTag(xmlDoc,"kml")[0],"Document")[0];
	var kmlLayers = getXMLTag(kmlDoc,"Folder");

	var kmlInfo = {}

	for (var layerIndex=0; layerIndex<kmlLayers.length; layerIndex++){
		var mapLayer = kmlLayers[layerIndex];

		var layerNameData = getXMLTag(mapLayer,"name")[0].innerHTML.split("_");

		if (layerNameData.length>1){
			var layerName = layerNameData[0], layerMetadata = layerNameData[1].split(",");
		}
		else{
			var layerName = layerNameData[0];
		}

		var layerXMLFeatures = [];
		var layerFeatures = [];

		if (layerName == "Icon"){
			layerMetadata = {
				"SIZE": Number(layerMetadata[0]),
				"TRANSPARENCY" : Number(layerMetadata[1]),
				"LEGEND" : Number(layerMetadata[2])
			}
		}

		if (layerName=="Icon" || layerName=="IconLine" || layerName=="Line" || layerName=="Text" || layerName=="Background" || layerName == "Meta"){
			layerXMLFeatures = getXMLTag(mapLayer,"Placemark");	
		}

		var siteOrigin;

		for (var featureIndex=0; featureIndex<layerXMLFeatures.length; featureIndex++){
			var featureEntry = {};

			if (layerName == "Meta"){
				featureEntry = parseMetadataFeature(layerXMLFeatures[featureIndex]);

				// mapExtent = [0, 0, 5000,5000];
				mapExtent = [0, 0, featureEntry["EXTENT"][0],featureEntry["EXTENT"][1]];
				// console.log("EXT",mapExtent);
				mapData["MAP"]["EXTENT"] = mapExtent;
				// var size = map.getSize();
				// var viewResolution = map.getView().getResolution();
				updateMapExtent(mapExtent);

				siteOrigin = featureEntry["ORIGIN"];
			}

			if (layerName == "Background"){
				featureEntry = parseBackgroundFeature(layerXMLFeatures[featureIndex]);

				var backgroundPath = featureEntry["PATH"];
				mapData["BACKGROUND"][backgroundPath] = featureEntry;

				var newBackground = createBackgroundLayer(backgroundPath,featureEntry["TRANSPARENCY"],projection,mapExtent);
				backgroundLayers[backgroundPath] = newBackground;

				map.addLayer(newBackground);
			}

			if (layerName == "Icon"){
				featureEntry = parseIconFeature(layerXMLFeatures[featureIndex],siteOrigin);
				featureEntry["SIZE"] = (featureEntry["SIZE"] * layerMetadata["SIZE"]).toFixed(2);
				featureEntry["LEGEND"] = layerMetadata["LEGEND"];
				featureEntry["TRANSPARENCY"] = layerMetadata["TRANSPARENCY"];
				featureEntry["ID"] = newIconIndex;
				newIconIndex+= 1;
				activeIconPath = featureEntry["PATH"];

				mapData["ICON"][featureEntry["ID"]] = featureEntry;
				addIconToMap(featureEntry["ID"],featureEntry["POSITION"],featureEntry["SIZE"]);
			}

			if (layerName == "Line"){
				featureEntry = parseLineFeature(layerXMLFeatures[featureIndex],siteOrigin);
				featureEntry["ID"] = newLineIndex;
				newLineIndex+= 1;

				mapData["LINE"][featureEntry["ID"]] = featureEntry;

				addLineToMap(featureEntry["GEOMETRY"],featureEntry["SIZE"],featureEntry["SPACING"],featureEntry["DOTSIZE"],featureEntry["ID"]);
			}

			if (layerName == "IconLine"){
				featureEntry = parseIconLineFeature(layerXMLFeatures[featureIndex],siteOrigin);
				featureEntry["ID"] = newIconLineIndex;
				newIconLineIndex+= 1;

				mapData["ICONLINE"][featureEntry["ID"]] = featureEntry;
				addIconLineToMap(featureEntry["PATH"],featureEntry["GEOMETRY"],featureEntry["SIZE"],featureEntry["SPACING"], featureEntry["ANGLE"],featureEntry["TRANSPARENCY"],featureEntry["RANDOM"],featureEntry["ID"]);
			}

			if (layerName == "Text"){
				featureEntry = parseTextFeature(layerXMLFeatures[featureIndex],siteOrigin);
				featureEntry["ID"] = newTextIndex;
				newTextIndex+= 1;

				featureEntry["SIZE"] = Number(layerMetadata[0]);

				mapData["TEXT"][featureEntry["ID"]] = featureEntry;
				addTextToMap(featureEntry["TEXT"],featureEntry["SIZE"],featureEntry["GEOMETRY"],featureEntry["ID"]);
			}
		}
	}
}

function parseBackgroundFeature(backgroundXml,siteOrigin){
	var featureInfo = getXMLTag(backgroundXml,"name")[0].innerHTML.replace("\n","").split(",");

	var featureName = featureInfo[0];
	var featureTransparency = featureInfo[1];

	// convert the icon data to marauder mapper format
	var featureEntry = {
		"PATH": featureName,
		"TRANSPARENCY": featureTransparency,
	}

	return featureEntry;
}

function parseIconFeature(iconXML,siteOrigin){
	var featureName = getXMLTag(iconXML,"name")[0].innerHTML.replace("\n","");
	var featureLocation = getXMLTag(iconXML,"Point")[0].textContent.trim().split(",");

	// the format is lat,long
	var iconGPS = [Number(featureLocation[1]), Number(featureLocation[0])];

	// convert the icon data to marauder mapper format
	var featureEntry = {
		"PATH": "img/" + featureName.toLowerCase() + ".png",
		"POSITION" : gpsToLocal(siteOrigin,iconGPS),
		"TRANSPARENCY": DEFAULT_ICON_TRANSPARENCY,
		"SIZE": DEFAULT_ICON_SIZE,
		"LEGEND" : DEFAULT_ICON_LEGEND,
		"NAME": featureName
	}

	return featureEntry;
}


function parseLineFeature(lineXml,siteOrigin){
	var featureInfo = getXMLTag(lineXml,"name")[0].innerHTML.replace("\n","");

	var featureMetadata = featureInfo.split(",");

	// line features can be polygons or linestrings, so test which one
	var featureBase = getXMLTag(lineXml,"Polygon");
	if (featureBase.length == 0){
		featureBase = getXMLTag(lineXml,"LineString");
	}
	// console.log(featureBase);
	// var featureCoords = getXMLTag(lineXML,"LineString")[0];//.textContent.replace(" ","").replace("\t","").split("\n");
	var featureCoords = getXMLTag(featureBase[0],"coordinates")[0].textContent.split("\n");

	var lineCoords = [];

	for (var coordIndex=0; coordIndex<featureCoords.length; coordIndex++){
		var lineCoord = featureCoords[coordIndex].trim();
		if (!lineCoord){continue;}
		lineCoord = lineCoord.split(",");

		// the format is lat,long
		var lineGpsCoord =  [Number(lineCoord[1]), Number(lineCoord[0])];
		lineCoords.push(gpsToLocal(siteOrigin,lineGpsCoord));
	}

	var featureEntry = {
		"SIZE" : featureMetadata[0],
		"SPACING" : featureMetadata[1],
		"DOTSIZE" : featureMetadata[2],
		"GEOMETRY" : lineCoords,
	}

	return featureEntry;
}

function parseIconLineFeature(iconLineXml,siteOrigin){
	var featureInfo = getXMLTag(iconLineXml,"name")[0].innerHTML.replace("\n","").split(" ");

	var featureName = featureInfo[0];
	var featureMetadata = featureInfo[1].split(",");

	// var featureCoords = getXMLTag(lineXML,"LineString")[0];//.textContent.replace(" ","").replace("\t","").split("\n");
	var featureCoords = getXMLTag(getXMLTag(iconLineXml,"LineString")[0],"coordinates")[0].textContent.split("\n");

	var lineCoords = [];

	for (var coordIndex=0; coordIndex<featureCoords.length; coordIndex++){
		var lineCoord = featureCoords[coordIndex].trim();
		if (!lineCoord){continue;}
		lineCoord = lineCoord.split(",");

		// the format is lat,long
		var lineGpsCoord =  [Number(lineCoord[1]), Number(lineCoord[0])];
		lineCoords.push(gpsToLocal(siteOrigin,lineGpsCoord));
	}

	// convert the icon data to marauder mapper format
	var featureEntry = {
		"PATH": "img/" + featureName.toLowerCase() + ".png",
		"TRANSPARENCY": .8,
		"SIZE": (DEFAULT_ICON_SIZE * Number(featureMetadata[0])).toFixed(2),
		"SPACING": featureMetadata[1],
		"ANGLE" : featureMetadata[2],
		"RANDOM" : Number(featureMetadata[3]),
		"NAME" : featureName,
		"LEGEND" : Number(featureMetadata[4]),
		"GEOMETRY" : lineCoords
	}

	return featureEntry
}

function parseTextFeature(textXML,siteOrigin){
	var featureInfo = getXMLTag(textXML,"name")[0].innerHTML.replace("\n","").split("_");

	var featureName = featureInfo[0];
	// console.log(featureInfo);
	// var featureSize = Number(featureInfo[1]);

	// var featureCoords = getXMLTag(lineXML,"LineString")[0];//.textContent.replace(" ","").replace("\t","").split("\n");
	var featureCoords = getXMLTag(getXMLTag(textXML,"LineString")[0],"coordinates")[0].textContent.split("\n");

	var textCoords = [];

	for (var coordIndex=0; coordIndex<featureCoords.length; coordIndex++){
		var textCoord = featureCoords[coordIndex].trim();
		if (!textCoord){continue;}
		textCoord = textCoord.split(",");

		// the format is lat,long
		var textGpsCoord =  [Number(textCoord[1]), Number(textCoord[0])];
		textCoords.push(gpsToLocal(siteOrigin,textGpsCoord));
	}

	// convert the icon data to marauder mapper format
	var featureEntry = {
		"GEOMETRY": textCoords,
		// "SIZE": featureSize,
		"TEXT": featureName
	}

	return featureEntry;
}

function parseMetadataFeature(metaXML){
	var boundingBoxCoords = getXMLTag(metaXML,"Polygon")[0].textContent.split("\n");

	var bottomLeftCoord;
	var upperRightCoord;

	for (var coordIndex=0; coordIndex<boundingBoxCoords.length; coordIndex++){
		var bbCoord  = boundingBoxCoords[coordIndex].trim();
		if (!bbCoord || bbCoord.length < 3){continue;}
		bbCoord = bbCoord.split(",");

		// the format is lat,long
		var bbGpsCoord = [Number(bbCoord[1]), Number(bbCoord[0])];

		if (!bottomLeftCoord){
			bottomLeftCoord = [Number(bbCoord[1]), Number(bbCoord[0])];
			upperRightCoord = [Number(bbCoord[1]), Number(bbCoord[0])];
		}

		else {
			// check if new bb latitude is outside known bounds
			if (bbGpsCoord[0] < bottomLeftCoord[0]){ bottomLeftCoord[0] = bbGpsCoord[0];}
			if (bbGpsCoord[0] > upperRightCoord[0]){ upperRightCoord[0] = bbGpsCoord[0];}

			// check if the new longitude is outside known bounds
			if (bbGpsCoord[1] < bottomLeftCoord[1]){ bottomLeftCoord[1] = bbGpsCoord[1];}
			if (bbGpsCoord[1] > upperRightCoord[1]){ upperRightCoord[1] = bbGpsCoord[1];}
		}
	}

	var siteExtent = gpsToLocal(bottomLeftCoord,upperRightCoord);
	return {"ORIGIN": bottomLeftCoord,"EXTENT":siteExtent};
}