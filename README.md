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

* Let move your markers along a polyline.
* You can zoom in/out, your moving marker will be at the right place ! 
* You can pause or end the animation whenever you want.
* You can deal with events.
* You can make **loop**.
* You can add the the point one by one.
* You can add *station* at some points of the polyline.

Usage
-----
Add this line to your HTML file:
```html
<script type="text/javascript" src="MovingMarker.js"></script>
```

Then add your first MovingMarker:

```javascript
var myMovingMarker = L.Marker.movingMarker([[48.8567, 2.3508],[50.45, 30.523333]],
						[20000]).addTo(map);
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

 - ```autostart```: if ``` true``` the marker will start automatically after it is added to map. Default: ```false```
 - ``` loop```: if ```true``` the marker will start automatically at the beginning of the polyline when the it arrives at the end. Default: ```false```

	
**Methods**

*Getter*

 - ``` isRunning()```: return ```true``` if the marker is currently moving.
 - ```isPaused()```: return ```true``` if the marker is paused
 
 - ``` isEnded()```: return ```true``` if the marker is arrived to the last position or it has been stopped manually
 
 - ```isStarted()```: return ```true``` if the marker has started

**Note**: ```Marker.getLatLng()``` still works and give the current position
 
*Setter*

 - ```start()```:  the marker begins its path or resumes if it is paused.
 - ``` stop()```: manually stops the marker, if you call ```start`` after, the marker starts again the polyline at the beginning.
 - ```pause()```: just pauses the marker
 - ``` resume()```: the marker resumes its animation
 - ```addLatLng(latlng, duration)```: adds a point to the polyline. Useful, if we have to set the path one by one.
 - ``` moveTo(latlng, duration)```: stops current animation and make the marker move to ```latlng``` in ```duration``` ms. 
 - ```addStation(pointIndex, duration)```: the marker will stop at the ```pointIndex```th points of the polyline during ```duration``` ms. You can't add a station at the first or last point of the polyline.
 
*Events*

 - ```start```: fired when the marker starts
 - ``` end```: fired when the marker stops 
 - ```loop```: fired when the marker begin a new loop

**Note**: Event are not synchrone because of the use of ```requestAnimationFrame```.  If you quit the tab where the animation is working, events will be fired when the tab will get back the focus. Events ```end``` and ```loop``` have the attribute ```elapsedTime``` to get the time elapsed since the real end/loop.

How it works
---------------
This plugin internally uses ``` window.requestAnimationFrame``` through the Leaflet function ```L.Util.requestAnimFrame```. When the browser need to repaint, the marker [interpolate](http://ewoken.github.io/Leaflet.MovingMarker) linearly its position thanks to the elapsed time.

**Why do you just not use transitions ?**

If your marker moves very slowly (1-2 min or more for one transition) and you zoom in, your marker will be at the wrong place and take a lot of time to be where it has to be. Moreover, you have to do some hacks to get the current position of the marker during the animation.



Future Features
----------------------

 - Optimizations: clipping

TODO
--------
Tests ;-)

License
----
MIT License

