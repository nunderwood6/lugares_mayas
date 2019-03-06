//////Next Steps
//Change base tileset

//keep map object in global scope
var myMap;
var symbols;
var activeYear = "1980";
var popupContent;
var plot;
var xScale;
var yScale;
var relative = false;
var formatDec = d3.format(".1f");




var topLeft = [46.40756396630067,-79.365234375],
    botRight = [40.094882122321145,-67.19238281249999];

function initialize(){

addMap();
loadJson();
createSlider();
addPlot();
addResymbolize();

}


function loadJson(){

	var snowfallData;

	$.getJSON("data/snow_totals.geojson", function(response){
		snowfallData = response;
		//check data loaded
	  //console.log(snowfallData);
		//add markers
		addMarkers(snowfallData);
    addLines(snowfallData);
		sizeMarkers();

	})
	
}

function addPlot(){

   plot = d3.select("#plot")
              .append("svg")
              .attr("width", "100%")
              .attr("height", "100%");

}

function addLines(snowfallData){

    var plotW = plot.node().getBoundingClientRect().width;
    var plotH = plot.node().getBoundingClientRect().height;
    var yearMin = 1980;
    var yearMax = 2010;
    var snowMin = 0;
    var snowMax = 250;

    //instantiate scales
    xScale = d3.scaleLinear()
               .domain([yearMin, yearMax])
               .range([30,plotW-20]);

    yScale = d3.scaleLinear()
               .domain([snowMin, snowMax]) 
               .range([plotH-20, 10]);

    //line generator
    var line = d3.line()
        .x(function(d) { return xScale(d.year); }) 
        .y(function(d) { return yScale(d.snow); });

    //format data for line chart
    var lineData = [];
    snowfallData.features.forEach(function(site){
      var singleLine = [];

      for(var i = 1980; i < 2011; i++){

          var yearString = i.toString();

          singleLine.push({
            year: i,
            snow: site.properties[yearString],
            name: site.properties["Station Name"]
          });
      }

      lineData.push(singleLine);
    });

    //draw lines
     var lines = plot.selectAll(".lines")
                     .data(lineData)
                     .enter()
                     .append("path")
                     .attr("d", line)
                        .attr("fill", "none")
                        .attr("stroke", "#1175a0")
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.15);

    //draw axes
    plot.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (plotH-20) + ")")
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    plot.append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate(" + 30 + ",0)")
    .call(d3.axisLeft(yScale).ticks(5, d3.format("d")));


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
        return L.circleMarker(latlng, {
        	style: function(feature){
        		return {
        			"radius": feature.properties[activeYear],
        			"fillColor": "#1175a0",
              "opacity": 0.8
        		};
        	}
        });
    }
 }).addTo(myMap);

}

function sizeMarkers(){

console.log(relative);

symbols.eachLayer(function(layer){

    //check measure
    if(!relative){
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
    } else {
      //update radius and popup content
      var diff = formatDec(layer.feature.properties[activeYear] - layer.feature.properties["Average for 1980-2011"]);
      console.log(diff);
      if(diff<0){
          var color = "#ce2525"
          r = Math.sqrt(Math.abs(diff));
      }else if(diff>=0){
          var color = "#1175a0"
          r = Math.sqrt(diff);
      }


      popupContent = "<p><b>Station:</b> " + layer.feature.properties["Station Name"] + "</p><p><b>Inches of snow in "+ activeYear + " compared to average: </b> " + (layer.feature.properties[activeYear] - layer.feature.properties["Average for 1980-2011"]) + "</p>";

      layer.setStyle({
      radius: r,
      weight: 0.5,
      color: color,
      fillOpacity: 0.8
    });

    layer.bindPopup(popupContent);
    layer.getPopup().update();

    }
	

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
}

function addResymbolize(){

  d3.select("#button").on("click", function(){

    if(!relative){
      d3.select(this).html("Raw Totals");
      relative = true;
    } else {
      d3.select(this).html("Relative to<br> Average");
      relative = false
    }

    sizeMarkers();

  })




}




















$(document).ready(initialize);