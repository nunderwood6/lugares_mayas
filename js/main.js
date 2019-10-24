//////Next Steps
//add sites

var sitesJson;

//fit to these bounds
var topLeft = [14.93,-91.63],
    botRight = [14.73,-91.43];

//constrain panning to these bounds
var boundTopLeft = [15, -92],
    boundBotRight = [14.5, -91];

var max_bounds = L.latLngBounds(boundTopLeft, boundBotRight);

function initialize(){

addMap();
loadJson();

}

function loadJson(){
	$.getJSON("data/sitios.geojson", function(response){
		sitesJson = response;
    addMarkers(sitesJson);
	})
}

/////////////////////////////////////////////////////////////


function addMap(){
//initialize leaflet map
myMap = L.map('mapid', {maxBounds: max_bounds, maxBoundsViscosity:0.1}).fitBounds([topLeft, botRight]);

//load tile layer

var cartoTiles = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 18,
  className: "cartoTiles"
});

esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  className: "esriTiles",
  maxZoom: 17
});

//default have carto tiles
cartoTiles.addTo(myMap);

var baseTiles = {
  "Carto Base": cartoTiles,
  "Satellite Imagery(ESRI)": esriSat
}

L.control.layers(baseTiles).addTo(myMap);


}


/////////////////////////////////////////////////////////////

function addPopup(feature,layer){
  if(feature.properties && feature.properties.name) {
    layer.bindPopup(`<h3>${feature.properties.name}</h3>
       ${feature.geometry.coordinates[1].toFixed(6)}, 
       ${feature.geometry.coordinates[0].toFixed(6)}<br>
      <b>Altitud</b>: ${feature.properties["ALTURA MSN"]} m <br>
      <a target="_blank" href="https://www.google.com/maps/dir/Parque+Centro+Am%C3%A9rica,+Quezaltenango,+Guatemala/${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}/@${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]},12.53z">Direcciones</a>`);
  }
}


function addMarkers(sitesJson){

  var clusterGroup = L.markerClusterGroup();

  var geojsonMarkerOptions = {
      radius: 12,
      color: "#fff",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };

//create circle markers
  symbols =  L.geoJSON(sitesJson,{
 	pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
  },
  onEachFeature: addPopup
 });

//add to cluster group
  clusterGroup.addLayer(symbols);
  myMap.addLayer(clusterGroup);

  
}

$(document).ready(initialize);