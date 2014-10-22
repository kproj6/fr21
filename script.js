'use scrict';

function buildUrl(measure, startLat, startLon, endLat, endLon, depth, date){
   var url = 'http://178.62.233.73:10100/feature/' + measure +
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

var imageLayer = new ol.layer.Image({
    opacity: 0.75,
    source: new ol.source.ImageStatic({
    url: 'http://178.62.233.73:10100/feature/salinity?startLat=65.24&startLon=7.56&endLat=65.42&endLon=9.542&depth=2&time=2013-08-05',
    imageSize: [691, 541], // change to correct size
    projection: map.getView().getProjection(),
    imageExtent: ol.extent.applyTransform(
      [8.12, 63.15, 8.9, 63.85], 
      ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
    })
});

map.addLayer(imageLayer);

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

//fr 2.2 stuff
var debth = document.getElementById('debth');
var measure = document.getElementById('measure');
var date = document.getElementById('date');
var startCoord = document.getElementById('startCoord');
var endCoord = document.getElementById('endCoord');
var startCoordValue;

var dragBox; // global so we can remove it later

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
}

addDragBox();

dragBox.on('boxstart', function(evt){
  startCoordValue = evt.coordinate;
});

dragBox.on('boxend', function(evt){
  startCoord.value = startCoordValue.toString();
  endCoord.value = evt.coordinate.toString();
  var start = startCoord.value.split(',', 2);
  var startLat = start[0]; 
  var startLon = start[1]; 
  var end = endCoord.value.split(',', 2);
  var endLat = end[0];
  var endLon = end[1];
  console.log(buildUrl(measure.value, startLat, startLon, endLat, endLon, debth.value, date.value));
});
