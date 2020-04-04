'use strict';
function $(el) {return document.getElementById(el.replace(/#/,''));};

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

function appendChildren(parent,childrenArray){
	for (var i=0;i<childrenArray.length;i++){
		parent.appendChild(childrenArray[i]);
	}
}

function createP(className,innerText){
	var pElement = document.createElement("div");
	pElement.innerHTML = innerText;
	pElement.className = className;
	return pElement;
}

function createSlider(sliderId,sliderMin,sliderMax,sliderStep){
	if (!sliderStep) {sliderStep = 1;}

	var sliderContainer = document.createElement("div");
	// sliderContainer.className = "slider";

	var sliderElement = document.createElement("input");
	sliderElement.className = "slider";
	sliderElement.type = "range";
	sliderElement.min = sliderMin;
	sliderElement.step = sliderStep;
	sliderElement.max = sliderMax;
	sliderElement.id = sliderId;

	var oldSliderVal = -1;
    // sliderInput.addEventListener('mousedown', show);
    // sliderInput.addEventListener('mouseup', hide);

	// var sliderValuePrintout = document.createElement("p");
	// sliderValuePrintout.innerHTML =  sliderElement.value; // Display the default slider value
	// sliderValuePrintout.className = "slider";

	// sliderWidth = 470;
	// valueMultiplier = sliderWidth/sliderMax;
	// // Update the current slider value (each time you drag the slider handle)
	// sliderElement.oninput = function() {
 //    	var sliderVal = this.value;
	// 	if(oldSliderVal !== '0' && oldSliderVal !== '100') { 
 //        	bubble.style.left = (valueMultiplier*(sliderVal-1))+(bubble.offsetWidth/2)+'px';        
 //    	}
 //    	bubble.innerHTML = sliderVal;
 //    	oldSliderVal = sliderVal;

	// 	// sliderValuePrintout.innerHTML = this.value;
	// }

	// sliderContainer.appendChild(sliderElement);
	return sliderElement;
}

function createToggleButton(buttonId){
	var toggleButtonContainer = document.createElement("label");
	toggleButtonContainer.className = "switch";

	var sliderInput = document.createElement("input");
	sliderInput.type = "checkbox"
	sliderInput.id = buttonId;

	var sliderSpan = document.createElement("span");
	sliderSpan.className = "toggler";

	appendChildren(toggleButtonContainer,[sliderInput,sliderSpan]);
	return toggleButtonContainer;
}

function createTableHeaderRow(headerNames){
	var tableHeaderRow = document.createElement("tr");

	for (var i=0; i<headerNames.length; i++){
		var entryHeader = document.createElement("th");
		entryHeader.innerHTML = headerNames[i];
		tableHeaderRow.appendChild(entryHeader);
	}
	return tableHeaderRow;
}

function createTableCell(innerText){
	var tableCell = document.createElement("td")
	tableCell.innerHTML = innerText;
	return tableCell;
}

function createTableBackgroundRow(){
	var tableBackgroundEntryContainer = document.createElement("tr")
	
	entryName = createTableCell("Test name");
	entrySize = createTableCell("Icon");
	entryTransparency = createTableCell("40px");

	appendChildren(tableBackgroundEntryContainer,[entryName,entrySize,entryTransparency]);
	return tableBackgroundEntryContainer;
}

function createInput(className){
	var input = document.createElement("input");
	input.className = className;
	return input;
}

function createTable(tableId,headerNames){
	var tableContainer = document.createElement("table");
	tableContainer.id = tableId;

	var tableHeaderRow = createTableHeaderRow(headerNames);
	tableContainer.appendChild(tableHeaderRow)

 //    for (var i = 0; i < tableContainer.rows.length; i++) {
 //        // for (var j = 0; j < tableContainer.rows[i].cells.length; j++)
 //        tableContainer.rows[i].onclick = function () {
 //            tableText(this);
 //        };
 //    }

    return tableContainer;
}

function createDiv(className,id){
	var divElement = document.createElement("div");
	divElement.className = className;
	divElement.id = id;
	return divElement;
}

function getChosenRadioValue(radioButtonId){
	var radioInputs = $("#" + radioButtonId).getElementsByTagName('input');

	for (var i = 0; i < radioInputs.length; i++) {
		var inputDom = radioInputs[i];
		if (inputDom.checked){ return inputDom.id;}
	}
}

function createRadioButtons(optionName,options,checkboxFlag,ensureOneChecked,widthMultiplier){
	var buttonType;

	if (checkboxFlag == 1){buttonType = "checkbox";}
	else {buttonType = "radio";}

	// document.getElementById("checkDefinition").addEventListener("click", ensureOneCheckboxChecked);
	// document.getElementById("checkExample").addEventListener("click", ensureOneCheckboxChecked);

	var radioElement = createDiv("radio",optionName);

	var totalOptionsLength = options.join('').length;
	if (!widthMultiplier) {widthMultiplier = 75;}

	for (var i = 0; i < options.length ;i++) {
		var thisOption = options[i];

		var optionElement = document.createElement("input");
		optionElement.type = buttonType;
		optionElement.id = thisOption;
		optionElement.name = optionName;
		optionElement.value = thisOption;

		var optionLabel = document.createElement("label");
		optionLabel.innerHTML = thisOption;
		var labelWidth = widthMultiplier *(thisOption.length/totalOptionsLength);
		optionLabel.style.width = labelWidth + "%";
		optionLabel.setAttribute("for", thisOption);

		if (ensureOneChecked){
			optionElement.addEventListener("click", ensureOneCriteriaChecked);
			// ensureOneCheckboxChecked(optionName);
		}

		radioElement.appendChild(optionElement);
		radioElement.appendChild(optionLabel);
	}

	optionElement.checked = true;

	return radioElement;
}

function createButton(className,innerText){
	var button = document.createElement("button")
	button.className = className
	button.innerHTML = innerText;
	return button;
}


function splitLineString(geometry, minSegmentLength, options) {

  function calculatePointsDistance(coord1, coord2) {
    var dx = coord1[0] - coord2[0];
    var dy = coord1[1] - coord2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  function calculateSplitPointCoords(startNode, nextNode, distanceBetweenNodes, distanceToSplitPoint) {
    var d = distanceToSplitPoint / distanceBetweenNodes;
    var x = nextNode[0] + (startNode[0] - nextNode[0]) * d;
    var y = nextNode[1] + (startNode[1] - nextNode[1]) * d;
    return [x, y];
  };

  function calculateAngle(startNode, nextNode, alwaysUp) {
    var x = (startNode[0] - nextNode[0]);
    var y = (startNode[1] - nextNode[1]);
    var angle = Math.atan(x/y);
    if (!alwaysUp) {
       angle = y > 0 ? angle + Math.PI : x < 0 ? angle + Math.PI*2 : angle;
    }
    return angle;
  };

  var splitPoints = [];
  var coords = geometry.getCoordinates();

  var coordIndex = 0;
  var startPoint = coords[coordIndex];
  var nextPoint = coords[coordIndex + 1];
  var angle = options.vertices || calculateAngle(startPoint, nextPoint, options.alwaysUp);

  var n = Math.ceil(geometry.getLength()/minSegmentLength);
  var segmentLength = geometry.getLength() / n;
  var midPoints = (options.midPoints && !options.vertices)
  var currentSegmentLength = midPoints ? segmentLength/2 : segmentLength;

  // console.log(n);

  for (var i = 0; i <= n; i++) {

    var distanceBetweenPoints = calculatePointsDistance(startPoint, nextPoint);
    currentSegmentLength += distanceBetweenPoints;

    if (currentSegmentLength < segmentLength) {
      coordIndex++;
      if(coordIndex < coords.length - 1) {
        startPoint = coords[coordIndex];
        nextPoint = coords[coordIndex + 1];
        angle = options.vertices || calculateAngle(startPoint, nextPoint, options.alwaysUp);
        if (options.vertices && (!options.extent || ol.extent.containsCoordinate(options.extent, startPoint))) {
          splitPoints.push(startPoint);
        }
        i--;
        continue;
      } 
      else {
        if (!midPoints) {
          var splitPointCoords = nextPoint;
          if (!options.extent || ol.extent.containsCoordinate(options.extent, splitPointCoords)) {
            if (!options.vertices) { splitPointCoords.push(angle); }
            splitPoints.push(splitPointCoords);
          }
        }
        break;
      }
    } 
    else {
      var distanceToSplitPoint = currentSegmentLength - segmentLength;
      var splitPointCoords = calculateSplitPointCoords(startPoint, nextPoint, distanceBetweenPoints, distanceToSplitPoint);
      startPoint = splitPointCoords.slice();
      if (!options.extent || ol.extent.containsCoordinate(options.extent, splitPointCoords)) {
        if (!options.vertices) { splitPointCoords.push(angle); }
        splitPoints.push(splitPointCoords);
      }
      currentSegmentLength = 0;
    }
  }
  return splitPoints;
};