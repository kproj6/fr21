'use scrict';
var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
for (var z = 0; z < 14; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

var attribution = new ol.Attribution({
  html: 'Tiles &copy; <a href="http://services.arcgisonline.com/arcgis/rest/' +
  'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>'
});

var layer = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'sat'})
});

var usPopDensity = new ol.layer.Tile({
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

var salinityLayer = new ol.layer.Image({
  source: new ol.source.ImageStatic({
    url: 'http://thegraphicsfairy.com/wp-content/uploads/2014/01/Valentine-Fairy-Image-GraphicsFairy.jpg',
    //url: 'http://178.62.233.73:10100/feature/salinity?startLat=65.24&startLon=7.56&endLat=65.42&endLon=9.542&depth=2&time=2013-08-05',
    imageSize: [1663, 1070],
    projection: projection,
    imageExtent: projectionExtent,
    extent: projectionExtent
  })
});

var map = new ol.Map({
  target: 'map',
  layers: [layer, salinityLayer],
  view: new ol.View({
    projection: projection,
    center: [63.411896, 10.430984],  
    zoom:1
  })
});

//bind checkbox to usPopDensity visibility
var visible = new ol.dom.Input(document.getElementById('visible'));
visible.bindTo('checked', usPopDensity, 'visible');

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
