
///Quick Start Tutorial

//initialize leaflet map
var myMap = L.map('mapid').setView([51.505, -0.09], 13);

//load tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA",{
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoibnVuZGVyd29vZDYiLCJhIjoiY2o2aDQ5NWN0MDVmcjMybG00Mm9icml4ZSJ9.jgZOCzIY9h-gZnpdsGjiQA'
}).addTo(myMap);

//add marker
var marker = L.marker([51.505, -0.09]).addTo(myMap);

//add circle
var circle = L.circle([51.508, -0.11], {
	color: "red",
	fillColor: "#f03",
	fillOpacity: 0.5,
	radius: 500
}).addTo(myMap);

//add polygon
var polygon = L.polygon([
	[51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
	]).addTo(myMap);

//add popups to objects on map
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//add popup as layer
var popup = L.popup();

//open popup wherever user clicks
function onMapClick(e) {

	popup.setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(myMap);
}
//add event listener
myMap.on("click", onMapClick);




//////////////////////////////////////////////////////////////////////////
//Using GeoJSON with Leaflet Tutorial
//center map on Colorado
myMap.setView([39.75621,-104.99404], 13);

//add popup to feature if feature has popup content
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}



//simple geoJSON feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//create geoJSON layer and add to map
L.geoJSON(geojsonFeature, {
	onEachFeature: onEachFeature
}).addTo(myMap);

//can be passed as array of valid geoJSON objects
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//can create geoJSON layer then add feature to layer
/*
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(geojsonFeature);
*/

//create style for all lines
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//add lines with myStyle
L.geoJSON(myLines, {
    style: myStyle
}).addTo(myMap);

//create create features to style based on property
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//add features and style based on their property
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(myMap);

//create style
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


//create some geojson point features
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];


// create geojson layer for point features
//use circle markers instead of default markers
//filter to control visibility of features based on attribute
L.geoJSON(someFeatures, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(myMap);












    