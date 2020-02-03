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
        if(i<9){
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

  if(feature.properties && feature.properties["NOMBRE DE ALTAR"]) {
    
    var popupContent = `<div
      class="content"><h3><span class="siteNumber">${feature.properties.ID})</span> ${feature.properties["NOMBRE DE ALTAR"]}</h3>
       <p><img class="mayaIcon" src="img/Maya_1.svg"><b>Significado del Nombre</b>: ${feature.properties["Significado del Nombre"]}<br>
       <img class="mayaIcon" src="img/Maya_2.svg"><b>Función</b>: ${feature.properties["Función"]}<br>
       <img class="mayaIcon" src="img/Maya_3.svg"><b>Contenido</b>: ${feature.properties["Contenido"]}<br>
       <img class="mayaIcon" src="img/Maya_4.svg"><b>Localización</b>: ${feature.properties["Localización"]}<br>
       <img class="mayaIcon" src="img/Maya_5.svg"><b>Ubicación</b>: ${feature.properties["Ubicación"]}<br>
       <img class="mayaIcon" src="img/Maya_6.svg"><b>Distancia del parque central</b>: ${feature.properties["Distancia del parque central de la cabecera municipal al lugar del fuego"]}<br>
       <img class="mayaIcon" src="img/Maya_7.svg"><b>Coordenadas</b>:
       ${feature.geometry.coordinates[1].toFixed(6)}, 
       ${feature.geometry.coordinates[0].toFixed(6)}<br>
       <img class="mayaIcon" src="img/Maya_8.svg"><b>Altitud</b>: ${feature.properties["ALTURA MSNM"]} m <br></p>
      <a target="_blank" href="https://www.google.com/maps/dir/Parque+Centro+Am%C3%A9rica,+Quezaltenango,+Guatemala/${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}/@${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]},12.53z">Direcciones</a>
      <img class="sitePhoto" src="img/${feature.properties.uniqueId}.jpg">
      <img class="closeIcon" src="img/close.svg">`;

      //special cases for multiphoto sites
      if(feature.properties.uniqueId == 15){
        popupContent +=`<h3 class="auxilary">IMOX</h3>
                        <img class="sitePhoto" src="img/15_1.jpg">
                        <h3 class="auxilary">KAME</h3>
                        <img class="sitePhoto" src="img/15_2.jpg">`
      }
      if(feature.properties.uniqueId == 50){          
        popupContent +=`<h3 class="auxilary">AUXILIAR</h3>
                        <img class="sitePhoto" src="img/50_1.jpg">`
      }
      if(feature.properties.uniqueId == 51){
        popupContent +=`<h3 class="auxilary">AUXILIAR</h3>
                        <img class="sitePhoto" src="img/51_1.jpg">`
      }
      //add closing tag
      popupContent += "</div>";

    popupContainer.style("opacity", 0);
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
      spiderfyOnMaxZoom: false,
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
      className: feature.properties["NOMBRE DE ALTAR"].replace(/ /g, "_")
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
  var siteNumber;
  //check for parentheses, if so split and use name+id to find
  //one name without duplicates has parentheses, check
  if(siteName.includes("(") && siteName != "TZ'A'M PORTA (TZ'A'M CHI 'JA')"){
    console.log("has parentheses");
    console.log(siteName);
    [siteName,siteNumber] = siteName.split("(");
    siteNumber = siteNumber.replace(")","");

    for(var site of sitesJson.features){
      if(site.properties["NOMBRE DE ALTAR"] == siteName && site.properties["ID"] == siteNumber){
        targetSite = site;
        var coords = site.geometry.coordinates;
        break;
      }
    }
  }
  else{
      //use only name
      for(var site of sitesJson.features){
          if(site.properties["NOMBRE DE ALTAR"] == siteName){
              targetSite = site;
              var coords = site.geometry.coordinates;
              break; //end for loop once we find coordinates
          }
      }
  }

  

  myMap.flyTo([coords[1],coords[0]], 17); //accepts lat/long
  //then open popup after flyTo event is done
  setTimeout(function(){
      openPopup(targetSite);
  },1700);
  
}

$(document).ready(initialize);