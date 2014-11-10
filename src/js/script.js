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
proj4.defs("EPSG:9810", "+proj=stere +lat_ts=60 +lat_0=90 +lon_0=58 +k_0=1.0 +x_0=2412853.25 +y_0=1840933.25 +a=6370000 +b=6370000");
/**
 * Elements that make up the popup.
 */
var popupContainer = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

// when working on the controls it's nice that it pops up it automatically
if(document.getElementById('controls').hasAttribute('debug')){
  document.getElementById('controls').classList.add('showControls');
}

/**
 * @return {boolean} Don't follow the href.
 * Add a click handler to hide the popup.
 */
closer.onclick = function() {
  popupContainer.style.display = 'none';
  closer.blur();
  return false;
};

/**
 * Create an overlay to anchor the popup to the map.
 */
var popupOverlay = new ol.Overlay({
  element: popupContainer
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
    '&time=' + date + "T" + time.value;
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
    overlays: [popupOverlay],
    view: new ol.View({
      center: ol.proj.transform([8.8, 63.75], 'EPSG:4326', 'EPSG:3857'),
      zoom:9
    })
}); 

function updateImage(url){
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
  
  // doesn't work
  //console.log([map.getViewPortPxFromLonLat(ol.LonLat(startLon, startLat)).x - map.getViewPortPxFromLonLat(ol.LonLat(endLon, endLat)).x, map.getViewPortPxFromLonLat(ol.LonLat(endLon, endLat)).y - map.getViewPortPxFromLonLat(ol.LonLat(startLong, startLat)).y]);

  imageLayer = new ol.layer.Image({
    opacity: 0.95,
    source: new ol.source.ImageStatic({
      url: url,
      imageSize: [691, 541], // change to correct size
      //imageSize: [256, 256], // change to correct size
      projection: map.getView().getProjection(),
      /*imageExtent: ol.extent.applyTransform(
        [8.12, 63.15, 8.9, 63.85], 
        ol.proj.getTransform("EPSG:4326", "EPSG:3857"))*/
      imageExtent: ol.extent.applyTransform(
        [parseFloat(startCoord.value.split(',',2)[1]), parseFloat(startCoord.value.split(',',2)[0]), parseFloat(endCoord.value.split(',',2)[1]), parseFloat(endCoord.value.split(',',2)[0])], 
        ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
    })
  });

  map.addLayer(imageLayer);
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
    addLegend(measure.value);
  }else{
    var args = Array.slice(arguments);
    console.error('updateImage() did not get the right parameters');
  }

},false);

/**
 * Add a click handler to the map to render the popup.
 */
map.on('click', function(evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
      coordinate, 'EPSG:3857', 'EPSG:4326'));

  popupOverlay.setPosition(coordinate);
  content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
      '</code>';
  popupContainer.style.display = 'block';

});

// listener for areaSelect tool
areaSelectButton.addEventListener('click', function(evt){
  evt.preventDefault();
  areaSelectActive = !areaSelectActive;
  if(areaSelectActive){
    areaSelectButton.classList.add('buttonActive');
    addDragBox(ol.events.condition.always);
  } else {
    areaSelectButton.classList.remove('buttonActive');
    map.removeInteraction(dragBox);
  }
}, false);

function updateDisplayedTimeSliderValue() {
  var val = parseFloat(document.getElementById('time').value).toFixed(2);
  if (val<10) val = "0" + val;
  document.getElementById('timeslider').value = val;
}

document.getElementById('time').addEventListener('change', updateDisplayedTimeSliderValue);
//document.getElementById('fader').attachEvent('addEventListener', updateDisplayedTimeSliderValue, false);
