//////Next Steps
var myMap;
var sitesJson;
var popupContainer = d3.select(".popupContainer .inner");
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
    //add index as attribute
    for(var i = 0; i < sitesJson.features.length; i++){
      sitesJson.features[i].properties["uniqueId"] = i+1;
        if(i<10){
          sitesJson.features[i].properties["uniqueId"] = "0" + (i+1);
        }
    }

    addMarkers(sitesJson);
	})
}
/////////////////////////////////////////////////////////////

function addMap(){
//initialize leaflet map
myMap = L.map('mapid', {maxBounds: max_bounds, maxBoundsViscosity:0.1, scrollWheelZoom: false}).fitBounds([topLeft, botRight]);

//load tile layer
var cartoTiles = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 17,
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
//add option to use satellite imagery
L.control.layers(baseTiles).addTo(myMap);
}

function openPopup(feature){
  d3.select(".popupContainer").style("pointer-events", "auto");

  if(feature.properties && feature.properties.name) {

    var popupContent = `<div
      class="content"><h3>${feature.properties.name}</h3>
       <p>${feature.geometry.coordinates[1].toFixed(6)}, 
       ${feature.geometry.coordinates[0].toFixed(6)}<br>
      <b>Altitud</b>: ${feature.properties["ALTURA MSN"]} m <br></p>
      <a target="_blank" href="https://www.google.com/maps/dir/Parque+Centro+Am%C3%A9rica,+Quezaltenango,+Guatemala/${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}/@${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]},12.53z">Direcciones</a>
      <img class="sitePhoto" src="img/${feature.properties.uniqueId}.jpg">
      <img class="closeIcon" src="img/close.svg">`;

      //special cases for multiphoto sites
      if(feature.properties.uniqueId == 15){
        popupContent +=`<img class="sitePhoto" src="img/15_1.jpg">
                        <img class="sitePhoto" src="img/15_2.jpg">`
      }
      if(feature.properties.uniqueId == 50){
        popupContent +=`<img class="sitePhoto" src="img/50_1.jpg>`
      }
      if(feature.properties.uniqueId == 51){
        popupContent +=`<img class="sitePhoto" src="img/51_1.jpg>`
      }
      //add closing tag
      popupContent += "</div>";

    popupContainer.style("opacity", 0);
    console.log(popupContent);
    popupContainer.html(popupContent);
    popupContainer.transition().duration(1000).style("opacity", 1);

    d3.select(".closeIcon").on("click", removePopup);

  }

}

function removePopup(feature,layer){

    popupContainer.html("");

  d3.select(".popupContainer").style("pointer-events", "none");
}

function addPopupListener(feature,layer) {
  layer.on("click", function(){
    removePopup();
    openPopup(this.feature);
  })

}

/////////////////////////////////////////////////////////////

function addMarkers(sitesJson){

  var clusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 17
  });

//create circle markers
  symbols =  L.geoJSON(sitesJson,{
 	pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
      radius: 12,
      color: "#fff",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      className: feature.properties["name"].replace(/ /g, "_")
    });
  },
  onEachFeature: addPopupListener
 });

//add to cluster group
  clusterGroup.addLayer(symbols);
  myMap.addLayer(clusterGroup);

  //also remove popups when user pans and zooms
myMap.on("movestart", removePopup);

}

//execute from search input
function zoomToSite(siteName){
  var targetSite;
  //search data for location with matching name
  for(var site of sitesJson.features){
      //console.log(site);
      if(site.properties["name"] == siteName){
          targetSite = site;
          var coords = site.geometry.coordinates;
          break; //end for loop once we find coordinates
      }
  }

  myMap.flyTo([coords[1],coords[0]], 17); //accepts lat/long
  //then open popup after flyTo event is done
  setTimeout(function(){
      openPopup(targetSite);
  },1700);
  
}

$(document).ready(initialize);