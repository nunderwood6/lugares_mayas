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
var currentSite;

var rScale = d3.scaleSqrt()
                .domain([0,250])
                .range([0,25]);




var topLeft = [46.40756396630067,-79.365234375],
    botRight = [40.094882122321145,-67.19238281249999];

function initialize(){

addMap();
loadJson();
createSlider();
addPlot();
addResymbolize();
buildLegend();

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
    addDots(snowfallData);
		sizeMarkers();

	})
	
}

function addDots(data){

console.log(data.features);

  for(site of data.features){
      var name = site.properties["Station Name"];
      for(var i = 1980; i <2011; i++){

        plot.append("circle")
              .attr("id", `${i.toString()+name}`)
              .attr("cx", function(){
                return xScale(i);
              })
              .attr("cy", function(){
                return yScale(site.properties[i]);
              })
              .attr("r", 5)
              .attr("fill", "#000")
              .attr("opacity", 0);
      }
  }

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
                     .attr("site", function(d){
                        return d[0].name;
                     })
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

}


/////////////////////////////////////////////////////////////

function addMarkers(jsonData){

//add circle markers
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
    },
  onEachFeature: function(layer, feature){

    feature.on("popupopen", function(){
        var name = this.feature.properties["Station Name"];
            currentSite = this.feature.properties["Station Name"];
        plot.select(`[site='${name}']`).classed("highlight", true);

        var dot = plot.selectAll(`[id='${activeYear.toString()+name}']`);
        dot.attr("opacity", 1);

        //
     
        console.log(dot);
        dot.attr("opacity", 1);
    });

    feature.on("popupclose", function(){
        var name = this.feature.properties["Station Name"];
          currentSite = null;
        plot.select(`[site='${name}']`).classed("highlight", false);

        var dot = plot.selectAll(`[id='${activeYear.toString()+name}']`);
        dot.attr("opacity", 0);
       
    });

  }
 }).addTo(myMap);

  
}

function sizeMarkers(){


symbols.eachLayer(function(layer){

    //check measure
    if(!relative){
     //update radius and popup content
     var r = rScale(layer.feature.properties[activeYear]);
    //var r = Math.sqrt(layer.feature.properties[activeYear])*1.2;
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
      var diff = layer.feature.properties[activeYear] - layer.feature.properties["Average for 1980-2011"];
      if(diff<0){
          var color = "#ce2525";
          r = rScale(Math.abs(diff));
          //r = Math.sqrt(Math.abs(diff))*1.2;
      }else if(diff>=0){
          var color = "#1175a0"
          r = rScale(diff);
      }


      popupContent = "<p><b>Station:</b> " + layer.feature.properties["Station Name"] + "</p><p><b>Inches of snow in "+ activeYear + " compared to average: </b> " + formatDec(layer.feature.properties[activeYear] - layer.feature.properties["Average for 1980-2011"]) + "</p>";

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
        plot.selectAll("circle").attr("opacity", 0);
        var dot = plot.selectAll(`[id='${activeYear.toString()+currentSite}']`);
        dot.attr("opacity", 1);

      }
    });
}

function addResymbolize(){

  d3.selectAll("#button p").on("click", function(){

    var on = d3.select("p.on");
    var off = d3.select("p.off");

    on.classed("on", false);
    on.classed("off", true);

    off.classed("on", true);
    off.classed("off", false);

    relative = !relative;
    sizeMarkers();

  })

}

function buildLegend(){

var legend = d3.select("div#legend")
                .append("svg")
                .attr("width", "125px")
                .attr("height", "160px")
                .attr("overflow", "visible");


var legendAmounts = ["250", "150", "50", "10"];
//var legendAmounts = ["10", "50","150","250"];

var legendTitle = legend.append("text")
                            .attr("x", 0)
                            .attr("y", 14.5)
                            .attr("font-size", "16px")
                            .text("Inches of Snow")


var legendCircles = legend.selectAll("legendCircle")
                            .data(legendAmounts)
                            .enter()
                            .append("circle")
                                .attr("r", function(d){
                                  console.log(d);
                                  return rScale(+d);
                                })
                                .attr("cx", 35)
                                .attr("cy", function(d,i){

                                var above = 0
                                 for(var j = i; j>0; j--){
                                    var jump = rScale([legendAmounts[j-1]])+ rScale([legendAmounts[j]])+ 5;
                                    above+=jump
                                 }
                                  return  above+50;
                                })
                                .attr("stroke", "#555")
                                .attr("fill", "none");

var legendText = legend.selectAll("legendText")
                          .data(legendAmounts)
                          .enter()
                          .append("text")
                              .attr("opacity", 0.6)
                              .attr("font-size", "12px")
                              .attr("x", 65)
                              .attr("y", function(d,i){
                                    var above = 0
                                 for(var j = i; j>0; j--){
                                    var jump = rScale([legendAmounts[j-1]])+ rScale([legendAmounts[j]])+ 5;
                                    above+=jump
                                 }
                                  return  above+55;

                              })
                              .text(function(d){
                                return d;
                              });



}




$(document).ready(initialize);