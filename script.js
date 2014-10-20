'use scrict';

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

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);

for (var z = 0; z < 14; ++z) {
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
var attribution = new ol.Attribution({
  html: 'Tiles &copy; <a href="http://services.arcgisonline.com/arcgis/rest/' +
  'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>'
});

var wmts = new ol.layer.Tile({
  opacity: 0.7,
    extent: projectionExtent,
    source: new ol.source.WMTS({
      attributions: [attribution],
    url: 'http://services.arcgisonline.com/arcgis/rest/' +
      'services/Demographics/USA_Population_Density/MapServer/WMTS/',
    layer: '0',
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
      origin: ol.extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
    }),
    style: 'default'
  })
});

map.addLayer(wmts);

//bind checkbox to imageLayer visibility
var visible = new ol.dom.Input(document.getElementById('visible'));
visible.bindTo('checked', imageLayer, 'visible');

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
