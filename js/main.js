//keep map object in global scope
var myMap;

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

	})
	

}

function addMap(){
//initialize leaflet map
myMap = L.map('mapid').setView([43.674753, -72.191216], 6);

//load tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA",{
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA'
}).addTo(myMap);

}

function addMarkers(jsonData){

//add megacities with default circle marker styling
 L.geoJSON(jsonData,{
 	pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    }
 }).addTo(myMap);


}


$(document).ready(initialize);