/*!
 * Google Earth Search jQuery Plugin
 *
 * Copyright 2011, Jason Roth
 * Artistic License 2.0
 * http://www.opensource.org/licenses/artistic-license-2.0
 *
 * Date: Sat Feb 12 09:47:06 2011 -0700
**/

GeSearch = function(options, performSearch){

  // This ensures that the Google Maps api v3 is loaded by detecting the
  // Geocoder class. Check this first because it's a prerequisite.
  if(!(google.maps && google.maps.Geocoder)){throw "Could not find the Google Maps Geocoder."}

  // Ensure that jQuery is loaded.
  // TODO: Make the GeSearch class not depend on jQuery
  if(!(jQuery)){throw "Could not find the jQuery library."}

  // Initialize options
  var defaults = {

    // The query to perform
    query: (typeof GeSearch.getQuery == "function") ? GeSearch.getQuery.apply(this) : "",

    // Immediately perform a search if the query parameter is given, set to
    // false to disable initial search
    performSearch: true,

    // GEPlugin instance
    gePlugin: null,

    // Callback when geocoded results are recieved
    onResults: null,

    // Takes a GeocoderResult object and moves the map there
    gotoResult: null,

    // Flash a message that there are zero results
    notifyZeroResults: null
  };

  // Create an options object out of a string if that is the argument method.
  if(typeof options == "string"){
    options = {
      // The query to geocode
      query: options,

      // With this method the second argument should be a performSearch boolean.
      // If it is not specified then treat is as undefined, in which case the
      // jQuery extend will use defaults.performSearch
      performSearch: (performSearch == undefined) ? undefined : Boolean(performSearch)
    };
  }

  // Set the options instance variable
  this.options = jQuery.extend(defaults, options);

  // Set the instance plugin. By default all of the callbacks and functions
  // used by this instance will have access to this variable. If those
  // functions are overwritten or modified then that may not be true.
  this.gePlugin = this.options.gePlugin || GeSearch.gePlugin || window.gePlugin;

  // This ensures that the plugin can be found (set above).
  if(!this.gePlugin || !this.gePlugin.getView){throw "Could not find the Google Earth plugin.";}

  // Search for something.
  this.search = function(query){

    // Store this instance of the GeSearch in a variable for the callback
    // functions.
    var gs = this;

    // If the query argument is given then it will overwrite the default
    if(query){this.options.query = query;}

    // The callback used by the search function. It is scoped to this GeSearch
    // instance. The actual callback function can be overwritten by defining
    // the searchCallback function in the GeSearch options, or by overwriting
    // the GeSearch.onResults class function.
    var callback = function(results, status){
      var f = gs.options.onResults || GeSearch.onResults;
      f.apply(gs, [results, status]);
    }

    // The request sent to the Geocoder; it conforms to the the v3 spec:
    // http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderRequest
    var request = {address:this.options.query};
    var geocoder = new google.maps.Geocoder;

    // Go. Search.
    geocoder.geocode(request, callback);
  }


  // Perform the search unless told otherwise
  if(this.options.performSearch && this.options.query){
    this.search();
  }
};

// The Google Earth browser instance
GeSearch.gePlugin = null;

// Event handler for geocode request
GeSearch.onResults = function(results, status){
  // Ensure that there is an options object
  var options = this.options || {};

  switch(status) {
    case google.maps.GeocoderStatus.OK:
      var f = options.gotoResult || GeSearch.gotoResult;
      f.apply(this, [results[0]]);
      break;

    case google.maps.GeocoderStatus.ZERO_RESULTS:
      var f = options.notifyZeroResults || GeSearch.notifyZeroResults;
      f.apply(this);
      break;

    default:
      throw "Bad google.maps.GeocoderStatus: " + status;
  };
}

// Takes a google.maps.GeocoderResult and moves the Earth viewport there
// Also relevant: google.maps.GeocoderGeometry, KmlCamera, GEView
GeSearch.gotoResult = function(geocoderResult){
  var latitude = geocoderResult.geometry.location.lat();
  var longitude = geocoderResult.geometry.location.lng();
  if(geocoderResult.geometry.bounds) {
    var altitude = GeSearch.getAltitudeFromBounds(geocoderResult.geometry.bounds);
  }
  else if(geocoderResult.geometry.location_type == google.maps.GeocoderLocationType.ROOFTOP) {
    var altitude = 250;
  }
  else {
    var altitude = 10000;
  }

  var camera = this.gePlugin.getView().copyAsCamera(this.gePlugin.ALTITUDE_RELATIVE_TO_GROUND);
  camera.setLatitude(latitude);
  camera.setLongitude(longitude);
  camera.setAltitude(altitude);
  camera.setHeading(0.0);
  camera.setTilt(0.0);

  this.gePlugin.getView().setAbstractView(camera);
}

// Flash a message to notify users that the geo search produced zero results
GeSearch.notifyZeroResults = function(){
  var flash = jQuery("<span class='no-results'>Nothing found</span>");
  jQuery("body").prepend(flash);
  flash.delay(3000).fadeOut();
}

// Takes a google.maps.LatLngBounds object
// Returns altitude in meters suitable for KmlAbstractView
// Thanks to: http://stackoverflow.com/questions/3247751/google-earth-determining-zoom-level-from-bounding-box
GeSearch.getAltitudeFromBounds = function(bounds){
  ne = bounds.getNorthEast();
  sw = bounds.getSouthWest();

  var lat1 = sw.lat();
  var lat2 = ne.lat();
  var lng1 = ne.lng();
  var lng2 = sw.lng();

  // Approx. Radius of the earh.
  var r = 6378700;

  // Field of view
  var fov = 32;

  // determine if the rectangle is portrait or landscape
  var dy = Math.max(lat1, lat2) - Math.min(lat1, lat2);
  var dx = Math.max(lng1, lng2) - Math.min(lng1, lng2);

  // find the longest side
  var d = Math.max(dy, dx);

  // convert the longest side degrees to radians
  d = d * Math.PI/180.0;

  // find half the chord length
  var dist = r * Math.tan(d / 2);

  // get the altitude using the chord length
  var alt = dist/(Math.tan(fov * Math.PI / 180.0));

  // FIXME: Sometimes the alt will be a negative number and GE freaks out and
  //  this isn't exactly an elegant fix...
  if(alt < 0) {alt = 10000000;}

  return alt;
}

// jQuery implementation of Google Earth search
jQuery.fn.geSearch = function(options){

  var searchText = jQuery(this).filter("input[type=text], input[type=search]").first();
  var getQuery = function(){return searchText.val();};

  if(!searchText){throw "No Google Earth search field found";}

  // Loop through all elements and attach search capabilies
  // NOTE: for now only input text, search and button elements are supported
  //  as jQuery widgets. All other elements are skipped and left unscathed.
  return jQuery(this).each(function(i, element){

    switch(jQuery(element).attr("type")){

      case "text":
      case "search":

        // Enable keyboard actions for these elements; if the enter key is
        // pressed then trigger a search
        jQuery(element).keypress(function(e){
          if(e.keyCode == 13) {
            options.query = getQuery();
            new GeSearch(options);
            return false;
          }
        });
        break;

      case "button":
      case "submit":
      case "image":
        // Simply perform a search on the click actions, return false to
        // prevent form submissions.
        jQuery(element).click(function(e){
          options.query = getQuery();
          new GeSearch(options);
          return false;
        });
        break;
    }
  });
}
