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
        autostart: false,
        loop: false,
        speed: 1
    },

    initialize: function (latlngs, durations, options) {
        options = options || {};
        L.Marker.prototype.initialize.call(this, latlngs[0], options);

        this._latlngs = latlngs.map(function(e, index) {    
            return L.latLng(e);
        });

        this._durations = durations;
        this._speed = options.speed || 1;
        Object.defineProperty(this, '_currentDuration', {
            set: function(duration) {
                this.__currentDuration = duration;
            },
            get: function() {
                return this.__currentDuration / this._speed;
            }
        });
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
            this._loadLine(0);
            this._startAnimation();
            this.fire('start');    
        } 
    },

    resume: function() {
        if (! this.isPaused()) {
            return;
        }
        // update the current line
        this._startAnimation();
    },

    setSpeed: function(speed) {
        if (! this.isPaused()) {
            this._stopAnimation();
            var speedChangeTime = Date.now();

            this._currentLine[0] = this.getLatLng();
            this._currentDuration = (this._currentDuration - (speedChangeTime - this._startTime))*this._speed;

            this._speed = speed;

            this._startAnimation();
        } else {
            this._speed = speed;
        }
    },

    addLatLng: function(latlng, duration) {
        this._latlngs.push(L.latLng(latlng));
        this._durations.push(duration);
    },

    moveTo: function(latlng, duration) {
        this._stopAnimation();
        this._latlngs = [this.getLatLng(), L.latLng(latlng)];
        this._durations = [duration];
        this._state = L.Marker.MovingMarker.notStartedState;
        this.start();
        this.options.loop = false;
    },

    addStation: function(pointIndex, duration) {
        if (pointIndex > this._latlngs.length - 2 || pointIndex < 1) {
            return;
        }
        var t = this._latlngs[pointIndex];
        this._latlngs.splice(pointIndex + 1, 0, t);
        this._durations.splice(pointIndex, 0, duration);
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

    _resumeAnimation: function() {
        if (! this._animRequested) {
            this._animId = L.Util.requestAnimFrame(function(timestamp) {
                this._animate(timestamp);
            }, this, true );
        }
    },

    _stopAnimation: function() {
        if (this._animRequested) {
            L.Util.cancelAnimFrame(this._animId);
            this._animRequested = false;
        }
    },

    _loadLine: function(index) {
        this._currentIndex = index;
        this._currentDuration = this._durations[index];
        this._currentLine = this._latlngs.slice(index, index + 2);
    },

    /**
     * Load the line where the marker is
     * @param  {Number} timestamp
     * @return {Number} elapsed time on the current line or null if
     * we reached the end or marker is at a station
     */
    _updateLine: function(timestamp) {
        //time elapsed since the last latlng
        var elapsedTime = timestamp - this._startTimeStamp;

        // not enough time to update the line
        if (elapsedTime <= this._currentDuration) {
            return elapsedTime;
        }

        var lineIndex = this._currentIndex;
        var lineDuration = this._currentDuration;

        while (elapsedTime > lineDuration) {
            //substract time of the current line
            elapsedTime -= lineDuration;
            lineIndex++;

            // test if we have reached the end of the polyline
            if (lineIndex >= this._latlngs.length - 1) {

                if (this.options.loop) {
                    lineIndex = 0;
                    this.fire('loop', {elapsedTime: elapsedTime});                        
                } else {
                    // place the marker at the end, else it would be at 
                    // the last position
                    this.setLatLng(this._latlngs[this._latlngs.length-1]);
                    this.stop(elapsedTime);
                    return null;
                }
            }
            lineDuration = this._durations[lineIndex];
        }

        this._loadLine(lineIndex);
        this._startTimeStamp = timestamp - elapsedTime;
        this._startTime = Date.now() - elapsedTime;
        return elapsedTime;
    },

    _animate: function(timestamp, noRequestAnim) {
        // compute the time elapsed since the start of the line
        var elapsedTime; 
        this._animRequested = false;

        //find the next line and compute the new elapsedTime
        elapsedTime = this._updateLine(timestamp);

        if (elapsedTime === null) {
            //we have reached the end
            return;
        }

        // compute the position
        var p = L.interpolatePosition(this._currentLine[0],
            this._currentLine[1],
            this._currentDuration,
            elapsedTime);
        this.setLatLng(p);

        if (! noRequestAnim) {
            this._animId = L.Util.requestAnimFrame(this._animate, this, false);
            this._animRequested = true;
        }
    },

    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);

        if (this.options.autostart && (! this.isStarted())) {
            this.start();
            return;
        }

        if (this.isRunning()) {
            this._resumeAnimation();
        }
    },

    onRemove: function(map) {
        L.Marker.prototype.onRemove.call(this, map);
        this._stopAnimation();
    },

    pause: function() {
        if (! this.isRunning()) {
            return;
        }

        this._pauseStartTime = Date.now();
        this._state = L.Marker.MovingMarker.pausedState;
        this._stopAnimation();
        //force animation to place the marker at the right place
        this._animate(this._startTimeStamp
            + (this._pauseStartTime - this._startTime), true);

        this._currentLine[0] = this.getLatLng();        
        this._currentDuration = (this._currentDuration - (this._pauseStartTime - this._startTime))*this._speed;
    },

    stop: function(elapsedTime) {
        if (this.isEnded()) {
            return;
        }

        this._stopAnimation();

        if (typeof(elapsedTime) === 'undefined') {
            //user call
            elapsedTime = 0;
            // force animation to place the marker at the right place
            this._animate(this._startTimeStamp
                + (Date.now() - this._startTime), true);
        }
        
        this._state = L.Marker.MovingMarker.endedState;
        this.fire('end', {elapsedTime: elapsedTime});
    }
});

L.Marker.movingMarker = function (latlngs, duration, options) {
    return new L.Marker.MovingMarker(latlngs, duration, options);
};