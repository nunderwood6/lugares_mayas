//////Next Steps
//Change base tileset

//keep map object in global scope
var myMap;
var symbols;
var activeYear = "1980";
var popupContent;


var topLeft = [46.40756396630067,-79.365234375],
    botRight = [40.094882122321145,-67.19238281249999];

function initialize(){

addMap();
loadJson();
createSlider();

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
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 18
}).addTo(myMap);


/*
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA",{
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA'
}).addTo(myMap);
*/
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
        			"radius": feature.properties[activeYear],
        			"fillColor": "#1175a0"
        		};
        	}
        });
    }
 }).addTo(myMap);


}

function sizeMarkers(){

symbols.eachLayer(function(layer){

		//update radius and popup content
		var r = Math.sqrt(layer.feature.properties[activeYear]);
		popupContent = "<p><b>Station:</b> " + layer.feature.properties["Station Name"] + "</p><p><b>Inches of snow in "+ activeYear + ":</b> " + layer.feature.properties[activeYear] + "</p>";

		layer.setStyle({
			radius: r,
			weight: 0.5,
			color: "#1175a0",
			fillOpacity: 0.8
		});

		layer.bindPopup(popupContent);
		layer.getPopup().update(); 

	
		


});

}

function createSlider(){


    $("#slider").slider({
      orientation: "horizontal",
      step: 1,
      min: 1980,
      max: 2010,
      value: 1980,
      slide: function(event, ui){

        activeYear = ui.value;
        $("#year").html(ui.value);
        sizeMarkers();

      }
    });

  //  $( "#year" ).val( $( "#slider-vertical" ).slider( "value" ) );









}



$(document).ready(initialize);