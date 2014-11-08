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

/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  container.style.display = 'none';
  closer.blur();
  return false;
};

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay({
  element: container
});

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
    overlays: [overlay],
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
    console.log("After projecting to LatLong: "+startCoord.value+" - "+endCoord.value);

    proj4.defs("EPSG:9810", "+proj=stere +lat_ts=60 +lat_0=90 +lon_0=58 +k_0=1.0 +x_0=2412853.25 +y_0=1840933.25 +a=6370000 +b=6370000");
    var startPolarCoord = proj4('EPSG:3785', 'EPSG:9810', startCoordValue);
    var endPolarCoord = proj4('EPSG:3785', 'EPSG:9810', evt.coordinate);
    console.log("After projecting from EPSG:3785 to PS-A: "+startPolarCoord+" - "+endPolarCoord);
    console.log("After projecting back again to EPSG:3785: "+ proj4('EPSG:9810', 'EPSG:3785', startPolarCoord) + " - " + proj4('EPSG:9810', 'EPSG:3785', endPolarCoord) );
    
    var startPolarCoord = proj4('EPSG:4326', 'EPSG:9810', proj4('EPSG:3785', 'EPSG:4326', startCoordValue));
    var endPolarCoord = proj4('EPSG:4326', 'EPSG:9810', proj4('EPSG:3785', 'EPSG:4326', evt.coordinate));
    console.log("After projecting from WGS84 to PS-A: "+startPolarCoord+" - "+endPolarCoord);
    console.log("After projecting back again to WGS84: "+ proj4('EPSG:9810', 'EPSG:4326', startPolarCoord).reverse() + " - " + proj4('EPSG:9810', 'EPSG:4326', endPolarCoord).reverse() );

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

},false);


/**
 * Add a click handler to the map to render the popup.
 */
map.on('click', function(evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
      coordinate, 'EPSG:3857', 'EPSG:4326'));

  overlay.setPosition(coordinate);
  content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
      '</code>';
  container.style.display = 'block';

});

document.querySelector('#fader').addEventListener('change', function() {
  document.querySelector('#timeslider').value = document.querySelector('#fader').value.fix(2);
});
        