Leaflet.MovingMarker
====================
----------


A Leaflet plug-in to create moving marker. Very useful to represent transportations or other movable things !

Demos
--------
Follow this link: [here](http://ewoken.github.io/Leaflet.MovingMarker)

Compatibility with Leaflet Versions
-----------------------------------

Compatible with the latest stable Leaflet version `leaflet-0.7.2`.

Browser Compatibility
-----------------------------------
This plugin internally uses ``` window.requestAnimationFrame``` through the Leaflet function ```L.Util.requestAnimFrame```

Features
--------

* Let move your markers !
* You can zoom in/out, your moving marker will be at the right place ! 
* You can pause or end the animation whenever you want.
* Deals with events.

Usage
-----
Add this line to your HTML file:
```html
<script type="text/javascript" src="MovingMarker.js"></script>
```

Then add your first MovingMarker:

```javascript
var myMovingMarker = L.Marker.movingMarker([[48.8567, 2.3508], [50.45, 30.523333]], [20000]).addTo(map);
//...
myMovingMarker.start();
```

API
----

**Factory**
```
L.movingMarker(<LatLng[]> latlngs, <Number[]> durations [,<Object> options]);
```

**durations**: Array of duration in ms.

Note: As Leaftlet's other functions, it also accept them in a simple Array form and simple object form ([see Leaflet docs](http://leafletjs.com/reference.html#latlng)).

**Options**
All the marker's options are available.

 - ```autostart```: if ``` true``` the marker will start automatically after it is added to map. 

	
**Methods**

*Getter*

 - ``` isRunning()```: return ```true``` if the marker is currently moving.
 - ```isPaused()```: return ```true``` if the marker is 
 
 - ``` isEnded()```: return ```true``` if the marker is arrived to the last position or it has been stopped manually
 
 - ```isStarted()```: return ```true``` if the marker has started
 
*Setter*

 - ```start()```:  the marker begins its path
 - ``` stop()```: manually stop the marker
 
*Events*

 - ```start```: fired when the marker starts
 - ``` end```: fired when the marker stops 

How it works
---------------
This plugin internally uses ``` window.requestAnimationFrame``` through the Leaflet function ```L.Util.requestAnimFrame```. When the browser need to repaint, the marker [interpolate](http://ewoken.github.io/Leaflet.MovingMarker) linearly its position thanks to the elapsed time.

**Why do you just not use transitions ?**

If your marker moves very slowly (1-2 min or more for one transition) and you zoom in, your marker will be at the wrong place and take a lot of time to be where it has to be. 



Future Features
----------------------

 - Make loop
 - Asynchronous interaction such as adding LatLng to the polyline during the animation.
 - Polyline animation
 - Optimizations: clipping

TODO
--------
Tests ;-)

License
----
MIT License
