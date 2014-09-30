L.interpolatePosition = function(p1, p2, duration, t) {
    var k = t/duration;
    k = (k>0) ? k : 0;
    k = (k>1) ? 1 : k;
    return L.latLng(p1.lat + k*(p2.lat-p1.lat), p1.lng + k*(p2.lng-p1.lng));
};

L.Marker.MovingMarker = L.Marker.extend({

    //state constants
    statics: {
        notStartedState: 0,
        endedState: 1,
        pausedState: 2,
        runState: 3
    },

    options: {
        autostart: false
    },

    initialize: function (latlngs, durations, options) {
        L.Marker.prototype.initialize.call(this, latlngs[0], options);

        this._latlngs = (function(latlngs) {
            return latlngs.map(function(e) {
                return L.latLng(e);
            });
        })(latlngs);

        this._durations = durations;
        this._currentDuration = 0;
        this._currentIndex = 0;

        this._state = L.Marker.MovingMarker.notStartedState;
        this._startTime = 0;
        this._startTimeStamp = 0;
        this._pauseStartTime = 0;
        this._animId = 0;
        this._animRequested = false;
        this._currentLine = [];
    },

    isRunning: function() {
        return this._state === L.Marker.MovingMarker.runState;
    },

    isEnded: function() {
        return this._state === L.Marker.MovingMarker.endedState;
    },

    isStarted: function() {
        return this._state !== L.Marker.MovingMarker.notStartedState;
    },

    isPaused: function() {
        return this._state === L.Marker.MovingMarker.pausedState;
    },

    start: function() {
        if (this.isRunning()) {
            return;
        }

        if (this.isPaused()) {
            this.resume();
        } else {
            this._currentIndex = 0;
            this._currentDuration = this._durations[this._currentIndex];
            this._currentLine = [this._latlngs[this._currentIndex],
                    this._latlngs[this._currentIndex+1]];
            this._startAnimation();
            this.fire('start');    
        }
        
    },

    resume: function() {
        if (! this.isPaused()) {
            return;
        }
        // update the current line
        this._currentLine[0] = this.getLatLng(); 
        this._currentDuration -= (this._pauseStartTime - this._startTime);

        this._startAnimation();
    },

    _startAnimation: function() {
        this._startTime = Date.now();
        this._state = L.Marker.MovingMarker.runState;

        this._animId = L.Util.requestAnimFrame(function(timestamp) {
            this._startTimeStamp = timestamp;
            this._animate(timestamp);
        }, this, true );
        this._animRequested = true;
    },

    _animate: function(timestamp) {
        // compute the time elapsed since the last frame
        var elapsedTime = timestamp - this._startTimeStamp;
        this._animRequested = false;

        //the current line is end
        if (elapsedTime > this._currentDuration) {

            //find the next line
            while (elapsedTime > this._currentDuration) {
                elapsedTime -= this._currentDuration;
                this._currentIndex++;

                // test if we have reach the end of the polyline
                if (this._currentIndex >= this._latlngs.length - 1) {
                    // place the marker at the end, else it would be at 
                    // the last position
                    this.setLatLng(this._latlngs[this._latlngs.length-1]);
                    this.stop();
                    return;
                }
                this._currentDuration = this._durations[this._currentIndex];
            }

            // load the next line
            this._currentDuration -= elapsedTime;
            this._startTimeStamp = timestamp;
            this._currentLine = [this._latlngs[this._currentIndex],
                    this._latlngs[this._currentIndex+1]];
        } 

        // compute the position
        var p = L.interpolatePosition(this._currentLine[0],
            this._currentLine[1],
            this._currentDuration,
            elapsedTime);
        this.setLatLng(p);

        this._animId = L.Util.requestAnimFrame(this._animate, this, false);
        this._animRequested = true;
    },

    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);

        if (this.options.autostart) {
            this.start();
        }
    },    

    _stopAnimation: function() {
        if (this._animRequested) {
            L.Util.cancelAnimFrame(this._animId);
            this._animRequested = false;
        }
    },

    pause: function() {
        if (! this.isRunning()) {
            return;
        }
        this._pauseStartTime = Date.now();
        this._state = L.Marker.MovingMarker.pausedState;
        this._stopAnimation();
    },

    stop: function() {
        if (this.isEnded()) {
            return;
        }
        this._stopAnimation();
        this._state = L.Marker.MovingMarker.endedState;
        this.fire('end');
    }
});

L.Marker.movingMarker = function (latlngs, duration, options) {
    return new L.Marker.MovingMarker(latlngs, duration, options);
};