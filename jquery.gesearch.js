/*!
 * Google Earth Search jQuery Plugin
 *
 * Copyright 2011, Jason Roth
 * Artistic License 2.0
 * http://www.opensource.org/licenses/artistic-license-2.0
 *
 * Date: Sat Feb 12 09:47:06 2011 -0700
**/

(function($){

  GeSearch = function(options, performSearch){

    var ge = GeSearch.instance || window.ge;

    if(!ge){throw "Could not find instance of Google Earth browser plugin";}

    this.geocoder = new google.maps.Geocoder();

    // Initialize options
    var defaults = {
      query: (typeof GeSearch.getQuery == "function") ? GeSearch.getQuery() : "",
      queryType: "address",
      // Immediately perform a search if the query parameter is given, set to
      // false to disable initial search
      performSearch: (performSearch == null) ? true : Boolean(performSearch)
    };

    if(typeof options == "string"){
      this.options = $.extend(defaults, {query: options});
    }
    else if(typeof options == "object"){
      this.options = $.extend(defaults, options);
    }
    else{
      this.options = defaults;
    }

    // Search for something
    this.search = function(query){
      if(query){this.options.query = query;}
      this.geocoder.geocode(this.getRequest(), GeSearch.onGeoResults);
    }

    // Get a request object for geocoding
    this.getRequest = function(){
      var o = new Object;
      o[this.options.queryType] = this.options.query;
      return o;
    }

    if(this.options.performSearch && this.options.query){
      this.search();
    }
  };

  // The Google Earth browser instance
  GeSearch.instance = undefined;

  // Event handler for geocode request
  GeSearch.onGeoResults = function(results, status){
    switch(status) {
      case google.maps.GeocoderStatus.OK:
        GeSearch.gotoResult(results[0]);
        break;
      case google.maps.GeocoderStatus.ZERO_RESULTS:
        GeSearch.notifyZeroResults();
      break;
    }
  }

  // Takes a google.maps.GeocoderResult and moves the Earth viewport there
  // Also relevant: google.maps.GeocoderGeometry, KmlCamera, GEView
  GeSearch.gotoResult = function(geoResult){
    var latitude = geoResult.geometry.location.lat();
    var longitude = geoResult.geometry.location.lng();
    if(geoResult.geometry.bounds) {
      var altitude = GeSearch.getAltitudeFromBounds(geoResult.geometry.bounds);
    }
    else if(geoResult.geometry.location_type == google.maps.GeocoderLocationType.ROOFTOP) {
      var altitude = 250;
    }
    else {
      var altitude = 10000;
    }

    var camera = GeSearch.instance.getView().copyAsCamera(GeSearch.instance.ALTITUDE_RELATIVE_TO_GROUND);
    camera.setLatitude(latitude);
    camera.setLongitude(longitude);
    camera.setAltitude(altitude);
    camera.setHeading(0.0);
    camera.setTilt(0.0);

    GeSearch.instance.getView().setAbstractView(camera);
  }

  // Flash a message to notify users that the geo search produced zero results
  GeSearch.notifyZeroResults = function(){
    var flash = $("<span class='no-results'>Nothing found</span>");
    $("body").prepend(flash);
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

    // NOTE: Sometimes the alt will be a negative number and GE freaks out.
    // TODO: Find a better way of handling this, the problem is likely with the
    //  math above.
    if(alt < 0) {
      alt = 10000000;
    }

    return alt;
  }

  // Function to get the query string for a search
  GeSearch.getQuery = function(){return ""};

  // jQuery implementation of Google Earth search
  $.fn.geSearch = function(options){

    if(!GeSearch.instance){GeSearch.instance = options.gePlugin;}

    function searchMap(){new GeSearch;}

    return $(this).each(function(i, element){
      switch($(element).attr("type")){
        case "text":
        case "search":
          GeSearch.getQuery = function(){return $(element).val();};

          $(element).keypress(function(e){
            if(e.keyCode == 13) {
              searchMap();
              return false;
            }
          });
          break;

        case "button":
        case "submit":
        case "image":
          $(element).click(searchMap);
          break;
      }
    });
  }

})(jQuery);
