//////Next Steps
//Change base tileset
//Add slider and symbolize based on active year



//keep map object in global scope
var myMap;
var symbols;
var activeYear = "1980";

var topLeft = [46.40756396630067,-79.365234375],
    botRight = [40.094882122321145,-67.19238281249999];

function initialize(){

addMap();
loadJson();

}


function loadJson(){

	var snowfallData;

	$.getJSON("data/snow_totals.geojson", function(response){
		snowfallData = response;
		//check data loaded
		console.log(snowfallData);
		//add markers
		addMarkers(snowfallData)
		sizeMarkers();

	})
	

}


/////////////////////////////////////////////////////////////


function addMap(){
//initialize leaflet map
myMap = L.map('mapid').fitBounds([topLeft, botRight]);

//load tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA",{
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA'
}).addTo(myMap);

}


/////////////////////////////////////////////////////////////



function addMarkers(jsonData){

//add megacities with default circle marker styling
  symbols =  L.geoJSON(jsonData,{
 	pointToLayer: function (feature, latlng) {
 		console.log("here");
        return L.circleMarker(latlng, {
        	style: function(feature){
        		return {
        			"radius": feature.properties["1980"]
        		};
        	}
        });
    }
 }).addTo(myMap);



}

function sizeMarkers(){

symbols.eachLayer(function(layer){
		console.log(layer.feature.properties);
		var r = Math.sqrt(layer.feature.properties[activeYear]);
		console.log(r);
		layer.setStyle({
			radius: r,
			weight: 0.5,
			fillOpacity: 0.8
		});

});

}



$(document).ready(initialize);