function createFillPattern(newImagePath, newIconSize,newSpacing){
	
	var strokeSize = 300;

	var fillImg = new Image();
	fillImg.src = newImagePath;

	tCnv.width = newIconSize;
	tCnv.height = newIconSize;
	tCtx.rect(0, 0, newIconSize, newIconSize);
	tCtx.fillStyle = 'rgba(0,0,0,0)';
	tCtx.fill();

	// tCtx.drawImage(fillImg, 0, 0, fillImg.width, fillImg.height, 0, 0, newSize, newSize);
	tCtx.drawImage(fillImg, 0, 0, newSpacing, newSpacing, 0, 0, newIconSize, newIconSize);

	var pattern = ctx.createPattern(tCnv, 'repeat');
	return pattern;
}

var lineStyleFunction = function (feature,resolution) {
	var zoom = map.getView().getZoom();
	var font_size = (5 / resolution) * zoom;

	return [
		new ol.style.Style({
			stroke: new Stroke({
					color: 'black',
					width: feature.values_.size,
					lineDash: [feature.values_.dotSize,feature.values_.spacing],
					lineJoin: "bevel",
				}),
			}),
	];
};

var textStyleFunction = function (feature,resolution) {
	var zoom = map.getView().getZoom();
	
	var fontSize = feature.values_.size * zoom *  Math.pow(resolution,-.5);
	// var font_size = 5  * zoom *  Math.pow(resolution,-.5);
	// var font_size = resolution * 30; // arbitrary value

	return [
		new ol.style.Style({
			text: new ol.style.Text({
				// font: feature.values_.font_size + 'px LOTR',
				font: fontSize + 'px LOTR',
				text: feature.values_.text,
				opacity: feature.values_.opacity,
				overflow: true,
				placement: 'line'
	  		}),
			// stroke: new Stroke({
				// 	color: 'blue',
				// 	width: 1
				// 	}),
			// maxAngle: 1.5*Math.PI,
		})
	];
};

function iconStyleFunction(feature,resolution) {
	var zoom = map.getView().getZoom();
	// var font_size = (5 / resolution) * zoom;
	return [
		new ol.style.Style({
			image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
				anchor: [0.5, 0.5],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				opacity: feature.values_.opacity,
				// anchorYUnits: 'pixels',
				src: feature.values_.path,
				scale: feature.values_.size * zoom *  Math.pow(resolution,-.5),
			}))
		})
	];
};

var iconLineStyleFunction = function(feature, resolution) {
	// turns a linestring into a picture traced out at intervals

	var styles = [
	// new ol.style.Style({
	//   stroke: new ol.style.Stroke({
	//     // color: 'rgba(0,0,0,0.3)',
	//     // width: size
	//   })
	// })
	];

	var mapSize = map.getSize();
	var geom = feature.getGeometry();
	var n = geom.getLength() / (size * resolution);
	// var n = geom.getLength() / (feature.values_.size * resolution);

	// if (n > 1000000) {
	//    n = Math.sqrt(n/100);
	//    var extent = map.getView().calculateExtent([mapSize[0] * n, mapSize[1] * n]);
	//    var splitPoints = splitLineString(geom, size * resolution * n, {extent: extent, vertices: true});
	//    var geom = new ol.geom.LineString(splitPoints);
	// }

	var extent = map.getView().calculateExtent([mapSize[0] + (size*2), mapSize[1] + (size*2)]);
	// var extent = map.getView().calculateExtent([mapSize[0] + (feature.values_.size*2), mapSize[1] + (feature.values_.size*2)]);

	var minSegmentLength = size * resolution * feature.values_.spacing;
	// var minSegmentLength = feature.values_.size * resolution * feature.values_.spacing;

	var splitPoints = splitLineString(geom, minSegmentLength, {alwaysUp: false, midPoints: true, extent: extent});

	splitPoints.forEach( function(point) {
		var randomXDisplacement = feature.values_.random * Math.random();
		var randomYDisplacement =  feature.values_.random * Math.random();
		styles.push(new ol.style.Style({
			geometry: new ol.geom.Point([point[0] + randomXDisplacement,point[1] + randomYDisplacement]),
			image: new ol.style.Icon({
				src: feature.values_.src,
				opacity: feature.values_.opacity,
				scale: feature.values_.size,
				rotation: point[2] + parseFloat(feature.values_.angle)
			})
		}));
	});

	return styles;
}

// used to style edge arrow features
function edgeArrowStyleFunction(feature,resolution){
	var zoom = map.getView().getZoom();

	var fontSize = feature.values_.fontSize * zoom *  Math.pow(resolution,-.5);
	// var font_size = 5  * zoom *  Math.pow(resolution,-.5);
	// var font_size = resolution * 30; // arbitrary value

	return [
		new ol.style.Style({
			geometry: feature.values_.textGeometry,

			text: new ol.style.Text({
				font: fontSize + 'px LOTR',
				text: feature.values_.text,
				// opacity: feature.values_.opacity,
				overflow: true,
				placement: 'point'
	  		}),
			// stroke: new Stroke({
				// 	color: 'blue',
				// 	width: 1
				// 	}),
			// maxAngle: 1.5*Math.PI,
		}),
		new ol.style.Style({
			image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
				anchor: [0.5, 0.5],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				opacity: feature.values_.opacity,
				src: feature.values_.path,
				rotation: feature.values_.angle,
				scale: feature.values_.size * zoom *  Math.pow(resolution,-.5),
			}))
		})
	];
}


	// Shadow style
	// st.push (new ol.style.Style ({
	// 	image: new ol.style.Shadow ({
	// 		radius: 15
	// 	})
	// }));

	// var st1= [];
	// // Font style
	// st.push ( new ol.style.Style ({
	//   image: new ol.style.FontSymbol({
	//     form: "marker", 
	//     glyph: 'fa-car', 
	//     radius: 15, 
	//     offsetY: -15,
	//     fontSize: .7,
	//     color: '#fff',
	//     fill: new ol.style.Fill ({
	//       color: 'blue'
	//     }),
	//     stroke: new ol.style.Stroke ({
	//       color: '#fff',
	//       width: 2
	//     })
	//   }),
	//   stroke: new ol.style.Stroke ({
	//     width: 5,
	//     color: '#f00'
	//   }),
	//   fill: new ol.style.Fill ({
	//     color: [255, 0, 0, 0.6]
	//   })
// 	// }));
// 	return st;
// }