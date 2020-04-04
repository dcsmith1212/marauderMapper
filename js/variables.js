var icons = ["carousel.png","garden.png","drinks.png","american history.png","natural history.png","washington monument.png","grass.png"];
var lineIcons = ["road.png","footpath.png"];
var backgroundImages = ["Smithsonian.png","papyrus.jpg"];
var fillIcons = ["road.png","footpath.png"];
var toolNames = ["Smithsonian"];


var Map = ol.Map;
var View = ol.View;
var {getCenter} = ol.extent;
var ImageLayer = ol.layer.Image;
var Static = ol.source.ImageStatic;
var Projection = ol.proj.Projection;

var {defaults, OverviewMap} = ol.control;
var defaultControls = defaults;

var {defaults, DragRotateAndZoom} = ol.interaction;
var defaultInteractions = defaults;

var TileLayer = ol.layer.Tile;
var OSM = ol.source.OSM;
var Feature = ol.Feature;
var Overlay = ol.Overlay;
var Point = ol.geom.Point;
var LineString = ol.geom.LineString;
var VectorLayer = ol.layer.Vector;
var Draw = ol.interaction.Draw;
var TileJSON = ol.source.TileJSON;
var VectorSource = ol.source.Vector;

var {Icon, Style} = ol.style;
var {Fill, Stroke, Text} = ol.style

var map;
var projection;

numIconColumns = 20;

// var mapExtent = [0, 0, 1600, 500];
var mapExtent = [0,0,1600,500];

// EDGE ARROW PARAMS
southAnchor = [mapExtent[2]/2, .3 * mapExtent[3]]
northAnchor = [mapExtent[2]/2, .7 * mapExtent[3]]
eastAnchor = [.9 * mapExtent[2], mapExtent[3]/2];
westAnchor = [.1 * mapExtent[2],mapExtent[3]/2];

TEXT_OFFSET = 200;

directionAngles = {
	"NORTH" : 3 * Math.PI / 2,
	"SOUTH" : Math.PI/2,
	"EAST" : 0,
	"WEST" : Math.PI
}

directionAnchors = {
	"NORTH" : northAnchor,
	"SOUTH" : southAnchor,
	"EAST" : eastAnchor,
	"WEST" : westAnchor
}

directionTextOffsets = {
	"NORTH" : [0,-TEXT_OFFSET],
	"SOUTH" : [0,TEXT_OFFSET],
	"EAST" : [0,TEXT_OFFSET],
	"WEST" : [0,TEXT_OFFSET],
}

directionIdMappings = {
	"NORTH" :0,
	"SOUTH" :1,
	"EAST" : 2,
	"WEST" : 3,
}

// COMPASS PARAMS
var compassAnchor = [.9*mapExtent[2],.1*mapExtent[3]];

var activeIcon = false;
var activeRow = "";
var activeElementId;
var activeElement;
var activeIconPath = "img/garden.png";
var activeIconFilename;
var activeIconName = "";
var activeMode;

// STORE CURRENT NUMBER OF FEATURES OF EACH TYPES FOR UNIQUE INDEXING
var newIconIndex = 0;
var newTextIndex = 0;
var newLineIndex = 0;
var newIconLineIndex = 0;
var newFillIndex = 0;


// SHOW/HIDE status of layers
var showText = 1;
var showBackgrounds = 1;
var showLines = 1;
var showIconLines = 1;
var showIcons = 1;
var showLegend = 0;
var showCompass = 0;


 // draw tools made global so we can disable them later
var textDraw;
var iconFillDraw;
var iconLineDraw;
var iconListener;
var lineDraw;

// layers made global
var iconLayer;
var lineLayer;
var backgroundLayers = [];
var textLayer;
var iconLineLayer;
var iconFillLayer;
var edgeArrowLayer;
var compassLayer;


var iconFillStyle;

// setup sources for the types
var iconSource = new VectorSource({
	    // crossOrigin: 'anonymous',
});

var compassSource = new VectorSource({});
var lineSource = new VectorSource({});
var iconLineSource = new VectorSource({});
var iconFillSource = new VectorSource({});
var edgeArrowSource = new VectorSource({});

var textSource = new VectorSource({
		wrapX: false,
	});




var size = 200;


DEFAULT_ICON_POSITION = [100,100];
var BASE_ICON_SIZE = .02;

var DEFAULT_ICON_SIZE = 1 * BASE_ICON_SIZE;

DEFAULT_ICON_TRANSPARENCY = 1;
DEFAULT_ICON_LEGEND = 1;

var backgroundLayers = {};

var mapData;

// for icon fills
var tCnv = document.createElement("canvas");
var tCtx = tCnv.getContext("2d");
var cnv = document.createElement('canvas');
var ctx = cnv.getContext('2d');

// icon fills
var fillImg = new Image();
fillImg.src = 'img/garden.png';

var fillSize = 30;
var spacingSize = 30;

var styleIndex = 0;