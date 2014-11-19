'use scrict';
var imageLayer; // global so we can removed it later
var depth = document.getElementById('depth');
var measure = document.getElementById('measure');
var date = document.getElementById('date');
var time = document.getElementById('timeslider');
var startCoord = document.getElementById('startCoord');
var endCoord = document.getElementById('endCoord');
var submit = document.getElementById('submit');
var form = document.getElementById('form');
var infoBar = document.getElementById('infoBar');
var areaSelectButton = document.getElementById('areaSelect');
var startCoordValue;
var areaSelectActive = false;
var dragBox;
var toggleControls = document.getElementById('toggleControls');
var controls = document.getElementById('controls');

/** when working on the controls it's nice that it pops up it automatically */
if(document.getElementById('controls').hasAttribute('debug')){
  document.getElementById('controls').classList.add('showControls');
}

/** this function needs to be altered so it inserts 'area' and 'verticalProfile' 
  * when needed */
function buildUrl(measure, startLat, startLon, endLat, endLon, depth, date){
   var url = 'http://178.62.233.73:10100/feature/' + measure + '/area' +
    '?startLat=' + startLat + 
    '&startLon=' + startLon + 
    '&endLat=' + endLat +
    '&endLon=' + endLon + 
    '&depth=' + depth + 
    '&time=' + date + "T" + time.value;
    return url;
}

var map = L.map('map').setView([63.69913944135562, 8.00751220703125], 9);
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});       
map.addLayer(osm);

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    draw : {
        position : 'topleft',
        polygon : false,
        polyline : false,
        rectangle : true,
        circle : false,
        marker : false
    },
    edit : {featureGroup: drawnItems, edit: false, remove: false}
});
map.addControl(drawControl);
var lastLayer;
var lastImageOverlay;
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    drawnItems.addLayer(layer);
    startCoord.value = e.layer.getLatLngs()[0].lat+","+e.layer.getLatLngs()[0].lng;
    endCoord.value = e.layer.getLatLngs()[2].lat+","+e.layer.getLatLngs()[2].lng;
    lastLayer=layer;
});

function updateImage(url){
  var imageUrl = url;
  var start = startCoord.value.split(',', 2);
  var startLat = start[1]; 
  var startLon = start[0]; 
  var end = endCoord.value.split(',', 2);
  var endLat = end[1];
  var endLon = end[0];

  if (lastImageOverlay!==undefined) // remove previous image
      map.removeLayer(lastImageOverlay);
  imageBounds = [[startLon, startLat], [endLon, endLat]];
  lastImageOverlay = L.imageOverlay(imageUrl, imageBounds)
  lastImageOverlay.addTo(map);
  drawnItems.removeLayer(lastLayer);
  console.log(ol.extent.applyTransform(
    [parseFloat(startCoord.value.split(',',2)[1]), parseFloat(startCoord.value.split(',',2)[0]), parseFloat(endCoord.value.split(',',2)[1]), parseFloat(endCoord.value.split(',',2)[0])],
    ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
  );
  console.log(ol.extent.applyTransform(
    [parseFloat(startCoord.value.split(',',2)[1]), parseFloat(startCoord.value.split(',',2)[0]), parseFloat(endCoord.value.split(',',2)[1]), parseFloat(endCoord.value.split(',',2)[0])],
    ol.proj.getTransform("EPSG:4326", "EPSG:9810"))
  );
  if(map.getLayers().remove(imageLayer)){
    map.getLayers().remove(imageLayer);
  }
  var startLat = startCoord.value.split(',',2)[1];
  var startLon = startCoord.value.split(',',2)[0];
  var endLat = endCoord.value.split(',',2)[1];
  var endLon = endCoord.value.split(',',2)[0];
  
  var selectorExtent = selector.getGeometry().getExtent();
  var bottomLeftPoint = map.getPixelFromCoordinate([selectorExtent[0], selectorExtent[1]]);
  console.log("Bottom Left point: "+bottomLeftPoint);
  var topRightPoint = map.getPixelFromCoordinate([selectorExtent[2], selectorExtent[3]]);
  console.log("Top Right point: "+topRightPoint);
  var imageResolution = [Math.abs(Math.floor(topRightPoint[0] - bottomLeftPoint[0])), Math.abs(Math.floor(topRightPoint[1] - bottomLeftPoint[1]))];
  console.log("Requested image resolution: "+imageResolution);

  imageLayer = new ol.layer.Image({
    opacity: 0.95,
    source: new ol.source.ImageStatic({
      url: url,
      imageSize: [256, 256],
      projection: map.getView().getProjection(),
      /*imageExtent: ol.extent.applyTransform(
        [8.12, 63.15, 8.9, 63.85], 
        ol.proj.getTransform("EPSG:4326", "EPSG:3857"))*/
      imageExtent: ol.extent.applyTransform(
        [parseFloat(startLat), parseFloat(startLon), parseFloat(endLat), parseFloat(endLon)], 
        ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
    })
  });
>>>>>>> 8b67fd7854df65eda0450ef5b961e1bc19f1f5cd

}

//toggle custom Controls
toggleControls.addEventListener('click', function(){
  var cl = controls.classList;
  if(cl.contains('showControls')){
    cl.remove('showControls');
  } else {
    cl.add('showControls');
  }
},false);

/** Displays info in the status bar about the current location */
// function to handle the area select tool
function addDragBox(conditionObj) {
  var conditionObj = conditionObj || ol.events.condition.never;
  dragBox = new ol.interaction.DragBox({
    condition: conditionObj,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 0, 0, 1]
      })
    })
  });
  map.addInteraction(dragBox);
  dragBox.on('boxstart', function(evt){
    startCoordValue = evt.coordinate;
    if (typeof selector != "undefined") {
        selectorLayer.getSource().removeFeature(selector);
        selector = undefined;
    }
  });
  dragBox.on('boxend', function(evt){
    console.log("Before projecting: " + startCoordValue + " - " + evt.coordinate);

    //startCoord.value = ol.proj.transform(startCoordValue, 'EPSG:3857', 'EPSG:4326');
    //endCoord.value = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
    proj4.defs("WGS84", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");

    endCoord.value = proj4('EPSG:3785', 'WGS84', evt.coordinate).reverse();
    startCoord.value = proj4('EPSG:3785', 'WGS84', startCoordValue).reverse();
    console.log("After projecting to LatLong: " + startCoord.value + " - " + endCoord.value);
    console.log("After projecting to LatLong: "+startCoord.value+" - "+endCoord.value);

    var drawnRectangle = this.getGeometry();
    selector = new ol.Feature(drawnRectangle);
    selectorLayer.getSource().addFeature(selector);

/*
    proj4.defs("EPSG:9810", "+proj=stere +lat_ts=60 +lat_0=90 +lon_0=58 +k_0=1.0 +x_0=2412853.25 +y_0=1840933.25 +a=6370000 +b=6370000");
    var startPolarCoord = proj4('EPSG:3785', 'EPSG:9810', startCoordValue);
    var endPolarCoord = proj4('EPSG:3785', 'EPSG:9810', evt.coordinate);
    console.log("After projecting from EPSG:3785 to PS-A: "+startPolarCoord+" - "+endPolarCoord);
    console.log("After projecting back again to EPSG:3785: "+ proj4('EPSG:9810', 'EPSG:3785', startPolarCoord) + " - " + proj4('EPSG:9810', 'EPSG:3785', endPolarCoord) );

    var startPolarCoord = proj4('EPSG:4326', 'EPSG:9810', proj4('EPSG:3785', 'EPSG:4326', startCoordValue));
    var endPolarCoord = proj4('EPSG:4326', 'EPSG:9810', proj4('EPSG:3785', 'EPSG:4326', evt.coordinate));
    console.log("After projecting from WGS84 to PS-A: "+startPolarCoord+" - "+endPolarCoord);
    console.log("After projecting back again to WGS84: "+ proj4('EPSG:9810', 'EPSG:4326', startPolarCoord).reverse() + " - " + proj4('EPSG:9810', 'EPSG:4326', endPolarCoord).reverse() );
*/
  });
}

>>>>>>> 8b67fd7854df65eda0450ef5b961e1bc19f1f5cd
function displayInfo(){
  infoBar.innerHTML =
  '<span>Feature: </span>' + measure.value +
  '<span>Depth: </span>' + depth.value +
  '<span>Date: </span>' + date.value +
  '<span>Start Coords: </span>' + startCoord.value +
  '<span>End Coords: </span>' + endCoord.value
}

/** It adds the legend of the colors in the overlays */
function addLegend(feature) {
  var container = document.getElementById('container');
  var imageSrc = 'img/legends/';
  var max;
  var min;
  if(document.getElementById('legend')) {
    container.removeChild(document.getElementById('legend'));
  }
  switch(feature) {
    case 'salinity':
      imageSrc += 'salinity.png';
      max = 36;
      min = 26;
      break;
    case 'temperature':
      imageSrc += 'temperature.png';
      max = 20;
      min = 0;
      break;
    case 'current-magnitude':
      imageSrc += 'current_magnitude.png';
      max = 1;
      min = 0;
      break;
    case 'current-direction':
      break;
    case 'depth':
      imageSrc += 'depth.png'
      max = 1000;
      min = 0;
      break;
    default: 
      console.error('No such feature:' + feature);
  }
  var legend = document.createElement('div');
  legend.setAttribute('id', 'legend');
  var img = document.createElement('img');
  img.setAttribute('src', imageSrc);
  var maxSpan = document.createElement('span');
  maxSpan.classList.add('legendMax');
  maxSpan.innerHTML = max;
  var minSpan = document.createElement('span');
  minSpan.classList.add('legendMin');
  minSpan.innerHTML = min;
  legend.appendChild(img);
  legend.appendChild(maxSpan);
  legend.appendChild(minSpan);
  container.appendChild(legend);

}

//listener for submit button
submit.addEventListener('click', function(evt){
  evt.preventDefault();
  var start = startCoord.value.split(',', 2);
  var startLat = parseFloat(start[0]); 
  var startLon = parseFloat(start[1]); 
  var end = endCoord.value.split(',', 2);
  var endLat = parseFloat(end[0]);
  var endLon = parseFloat(end[1]);
  var url = buildUrl(measure.value, startLat+0.022, startLon+0.01, endLat+0.022, endLon+0.01, depth.value, date.value);
  if(form.checkValidity()){
    console.log(url);
    displayInfo();
    updateImage(url);
    addLegend(measure.value);
  }else{
    var args = Array.slice(arguments);
    console.error('updateImage() did not get the right parameters');
  }
},false);

function updateDisplayedTimeSliderValue() {
  var val = parseFloat(document.getElementById('time').value).toFixed(2);
  if (val<10) val = "0" + val;
  document.getElementById('timeslider').value = val;
}

document.getElementById('time').addEventListener('change', updateDisplayedTimeSliderValue);
