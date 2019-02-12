//keep map object in global scope
var myMap;

function initialize(){

addMap();
loadJson();

}


function loadJson(){

	var megaCities;

	$.getJSON("data/megacities.geojson", function(response){
		megaCities = response;
		//check data loaded
		console.log(megaCities);
		//add markers
		addMarkers(megaCities)

	})
	

}

function addMap(){
//initialize leaflet map
myMap = L.map('mapid').setView([0,0], 1);

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