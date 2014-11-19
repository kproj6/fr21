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
