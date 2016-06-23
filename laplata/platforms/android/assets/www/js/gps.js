var GPS = {

  init: function() {
  	
  	
  	this.watchID = null;

  	this.options = {
	  enableHighAccuracy: true,
	  timeout: 5000,
	  maximumAge: 15000,
    desiredAccuracy: Config.gps_max_acc,
    maxWait: Config.gps_max_time * 1000, 
    saltarError: true
	  };


  },

  cb_fail: function(e) 
  {      app.notificar();
      app.waitStop();
      app.showAlert("Error al guardar, asegurese de que el GPS tenga señal e intente nuevamente.");
  },
  cb_prog: function(p) 
  {
      //alert("prog. " + p.coords.accuracy);
  },

  geoAndThen: function(func)
  {
        console.log("GPS.geoAndThen.....");
        if (navigator.geolocation && Config.gps_activado)
        {
          navigator.geolocation.getAccurateCurrentPosition(func, this.cb_fail, this.cb_prog, this.options);
        }
        else
        {
          a = {};
          a.coords = {};
          a.coords.latitude = 0;
          a.coords.longitude = 0;
          a.coords.accuracy = 0;
            
          func(a);
        }        

  },

  startWatch: function(cb_ok, cb_fail)
  {
  	if(this.watchID != null)
  		return;

  	if(navigator.geolocation)
  		this.watchID = navigator.geolocation.watchPosition( cb_ok , cb_fail, this.options);

  },

  stopWatch: function()
  {
  	if(navigator.geolocation && this.watchID != null) 
  	{
  		  navigator.geolocation.clearWatch(this.watchID);
  		  this.watchID = null;
  	}
  },
  distancia: function (lat1,lon1, lat2, lon2, unit )
    {
      if(lat2 == null)
        return null;

      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var radlon1 = Math.PI * lon1/180;
      var radlon2 = Math.PI * lon2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit=="K") { dist = dist * 1.609344; }
      if (unit=="M") { dist = dist * 1.609344 * 1000; }
      if (unit=="N") { dist = dist * 0.8684; }
      
      //alert(lat1 + ":" + lon1 + '   ' + lat2 + ':' + lon2 + ' --> '+ dist);
      return dist;
    },

};




navigator.geolocation.getAccurateCurrentPosition = function (geolocationSuccess, geolocationError, geoprogress, options) {
    var lastCheckedPosition,
        locationEventCount = 0,
        watchID,
        timerID;

    options = options || {};

    var checkLocation = function (position) {


        lastCheckedPosition = position;
        locationEventCount = locationEventCount + 1;
        // We ignore the first event unless it's the only one received because some devices seem to send a cached
        // location even when maxaimumAge is set to zero
        if ((position.coords.accuracy <= options.desiredAccuracy) && (locationEventCount > 1)) {
            clearTimeout(timerID);
            navigator.geolocation.clearWatch(watchID);
            foundPosition(position);
        } else {
            geoprogress(position);
            console.log("geoprogress");
        }
    };

    var stopTrying = function () {
        console.log("ERROR!! Retornando ultima posicion encontrada")
        navigator.geolocation.clearWatch(watchID);
        foundPosition(lastCheckedPosition);
    };

    var onError = function (error) {
        console.log('navigator.geolocation.getAccurateCurrentPosition :: ERROR!');
        clearTimeout(timerID);
        navigator.geolocation.clearWatch(watchID);
        geolocationError(error);
        if(options.saltarError) {
            a = {};
            a.coords = {};
            a.coords.latitude = 0;
            a.coords.longitude = 0;
            a.coords.accuracy = 0;
            console.log('llama a '+geolocationSuccess);
            console.log(a);
            geolocationSuccess(a);
        }

    };

    var foundPosition = function (position) {
        console.log("foundPosition");
        //console.log("position.coords.latitude="+position.coords.latitude);
        //console.log("position.coords.longitude="+position.coords.longitude);
        //console.log("position.coords.accuracy="+position.coords.accuracy);
        geolocationSuccess(position);
    };

    if (!options.maxWait) options.maxWait = 10000; // Default 10 seconds
    if (!options.desiredAccuracy) options.desiredAccuracy = 20; // Default 20 meters
    if (!options.timeout) options.timeout = options.maxWait; // Default to maxWait

    options.maximumAge = 0; // Force current locations only
    options.enableHighAccuracy = true; // Force high accuracy (otherwise, why are you using this function?)

    watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
    timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
};


