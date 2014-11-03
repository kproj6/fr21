'use scrict';
var imageLayer; // global so we can removed it later
var depth = document.getElementById('depth');
var measure = document.getElementById('measure');
var date = document.getElementById('date');
var startCoord = document.getElementById('startCoord');
var endCoord = document.getElementById('endCoord');
var submit = document.getElementById('submit');
var form = document.getElementById('form');
var infoBar = document.getElementById('infoBar');
var startCoordValue;

// this function needs to be altered so it inserts 'area' and 'verticalProfile'
// when needed
function buildUrl(measure, startLat, startLon, endLat, endLon, depth, date){
   var url = 'http://178.62.233.73:10100/feature/' + measure + '/area' +
    '?startLat=' + startLat + 
    '&startLon=' + startLon + 
    '&endLat=' + endLat +
    '&endLon=' + endLon + 
    '&depth=' + depth + 
    '&time=' + date;
    return url;
}

var map = new ol.Map({
  target: 'map',  // The DOM element that will contains the map
    renderer: 'canvas', // Force the renderer to be used
    layers: [
      // Add a new Tile layer getting tiles from OpenStreetMap source
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.transform([8.8, 63.75], 'EPSG:4326', 'EPSG:3857'),
      zoom:9
    })
}); 

function updateImage(url){
  if(map.getLayers().remove(imageLayer)){
    map.getLayers().remove(imageLayer);
  }
  imageLayer = new ol.layer.Image({
    opacity: 0.95,
    source: new ol.source.ImageStatic({
      url: url,
      imageSize: [691, 541], // change to correct size
      projection: map.getView().getProjection(),
      imageExtent: ol.extent.applyTransform(
        [8.12, 63.15, 8.9, 63.85], 
        ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
    })
  });

  map.addLayer(imageLayer);
}

//toggle custom Controls
var toggleControls = document.getElementById('toggleControls');
var controls = document.getElementById('controls');
toggleControls.addEventListener('click', function(){
  var cl = controls.classList;
  if(cl.contains('showControls')){
    cl.remove('showControls');
  } else {
    cl.add('showControls');
  }
},false);

function addDragBox() {
  dragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.shiftKeyOnly,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 0, 0, 1]
      })
    })
  });
  map.addInteraction(dragBox);
  dragBox.on('boxstart', function(evt){
    startCoordValue = evt.coordinate;
  });
  dragBox.on('boxend', function(evt){
    console.log("Before projecting: "+startCoordValue+" - "+evt.coordinate);

    //startCoord.value = ol.proj.transform(startCoordValue, 'EPSG:3857', 'EPSG:4326');
    //endCoord.value = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
    proj4.defs("WGS84", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");

    startCoord.value = proj4('EPSG:3785', 'WGS84', startCoordValue).reverse();
    endCoord.value = proj4('EPSG:3785', 'WGS84', evt.coordinate).reverse();
    console.log("After projecting: "+startCoord.value+" - "+endCoord.value);

    proj4.defs("EPSG:9810", "+proj=stere +lat_0=0 +lat_ts=0 +lon_0=0 +k=0 +x_0=0 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +no_defs");
    var polarCoord = proj4('EPSG:3785', 'EPSG:9810', startCoordValue);
    console.log("After projecting to PS-A: "+polarCoord);
    console.log("After projecting back again: "+ proj4('EPSG:9810', 'WGS84', polarCoord));

  });
}

function displayInfo(){
  infoBar.innerHTML =
  '<span>Feature: </span>' + measure.value +
  '<span>Depth: </span>' + depth.value +
  '<span>Date: </span>' + date.value +
  '<span>Start Coords: </span>' + startCoord.value +
  '<span>End Coords: </span>' + endCoord.value
}

addDragBox();

submit.addEventListener('click', function(evt){
  evt.preventDefault();
  var start = startCoord.value.split(',', 2);
  var startLat = start[0]; 
  var startLon = start[1]; 
  var end = endCoord.value.split(',', 2);
  var endLat = end[0];
  var endLon = end[1];
  var url = buildUrl(measure.value, startLat, startLon, endLat, endLon, depth.value, date.value);
  if(form.checkValidity()){
    console.log(url);
    displayInfo();
    updateImage(url);
  }else{
    console.log('updateImage() did not get the right parameters');
  }

},false)

