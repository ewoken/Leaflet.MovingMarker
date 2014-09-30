// initialize the map on the "map" div with a given center and zoom
var map = new L.Map('map', {
  center: new L.LatLng(45.19147011,5.71453741),
  zoom: 6,
  minZoom: 1,
});

// create a new tile layer
var tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
layer = new L.TileLayer(tileUrl, 
{
    attribution: 'Maps © <a href=\"www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',
    maxZoom: 18
});

// add the layer to the map
map.addLayer(layer);

var parisKievLL = [[48.8567, 2.3508], [50.45, 30.523333]];
var londonParisRomeBerlinBucarest = [[51.507222, -0.1275], [48.8567, 2.3508], 
[41.9, 12.5], [52.516667, 13.383333], [44.4166,26.1]];


var marker1 = L.Marker.movingMarker(parisKievLL, [100000]).addTo(map);
L.polyline(parisKievLL).addTo(map);
marker1.once('click', function () {
    marker1.start();
    marker1.closePopup();
    marker1.unbindPopup();
    marker1.on('click', function() {
        if (marker1.isRunning()) {
            marker1.pause();
        } else {
            marker1.start();
        }
    });
    setTimeout(function() {
        marker1.bindPopup('<b>Click me to pause !</b>').openPopup();
    }, 2000);
});



marker1.bindPopup('<b>Click me to start !</b>', {closeOnClick: false});
marker1.openPopup();

var marker2 = L.Marker.movingMarker(londonParisRomeBerlinBucarest,
    [3000, 2000, 5000, 3000], {autostart: true}).addTo(map);
L.polyline(londonParisRomeBerlinBucarest, {color: 'red'}).addTo(map);
map.fitBounds(londonParisRomeBerlinBucarest);

marker2.on('end', function() {
    marker2.bindPopup('<b>Welcome to Bucarest !</b><br>GitHub Page: <a target="\\blanck" href="https://github.com/ewoken/Leaflet.MovingMarker"><img src="github.png"></a>', {closeOnClick: false})
    .openPopup();
});

/*
a.on('end', function() {
    a.start();
});*/


