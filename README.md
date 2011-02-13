Google Earth Search jQuery Plugin
=================================

This plugin enables geo-coded searches in the Google Earth browser plugin using the google maps v3 geo coding API.

The [Google Earth](http://code.google.com/apis/earth/) and [Google Maps v3](http://code.google.com/apis/maps/documentation/javascript/) APIs must be loaded for this plugin to work.

All HTML elements related to the search (i.e. text input, buttons, etc) should share the same class. Use that class to initialize the jQuery.geSearch plugin. 

The plugin will attempt to discover the text input and the submit buttons automatically. If no search text is found then an error will be thrown. Valid search text fields are `input[type=text]` or `input[type=search]`. If more than one search field exists in the set then only the first will be used.

    <input type="search" class="ge-search" placeholder="Search Earth!">
    <input type="button" class="ge-search" value="Search">

    <div id="gePlugin" style="width:600px; height:450px;"></div>

    <script src="//www.google.com/jsapi?key=your_key_here"></script>
    <script>

      google.load("earth", "1");
      google.load("maps", "3", {other_params:"sensor=true"});

      google.setOnLoadCallback(function() {
        google.earth.createInstance('gePlugin', function(instance){
          $(".ge-search").geSearch();
        });
      });

    </script>

Options
-------

**query** _String_:  The address/location to search for

**performSearch** _Boolean_:  Perform a search immediately if query is provided, default `true`

**gePlugin** _GEPlugin_:  The Google Earth plugin instance to use. If not provided as an option then the search will attempt to use `GeSearch.gePlugin`, then `window.gePlugin`. If no plugin is found an exception will be raised.

**onResults** _function(results, status)_:  Event handler for [`google.maps.Geocoder.geocode()`](http://code.google.com/apis/maps/documentation/javascript/reference.html#Geocoder) function. If not provided as an option then `GeSearch.onResults` will be used. Within this handler, `this` refers to the current GeSearch instance. By default this function will call `gotoResult` using the first result or `notifyNoResults` if nothing is found.

**gotoResult** _function(geocoderResult)_:  Takes a [`google.maps.GeocoderResult`](http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult) object and causes the map to fly to that location. If not provided as an option then `GeSearch.gotoResults` will be used.

**notifyZeroResults** _function_:  Flashes a message reading "Nothing found". If not provided as an option then `GeSearch.notifyZeroResults` will be used.


Search API
----------

All of the heavy lifting for geo-coded searching is done by the `GeSearch` class. To perform a search you can instantiate a new GeSearch object while passing in the string you wish to search for.

    new GeSearch("Boulder, CO");

If you do not wish to search immediately you can send in the option `performSearch` as false. Then you can call the `search` function to perform the search at any time.

    var gs = new GeSearch("Boulder, CO", false);
    gs.search();

The GeSearch class takes the same options as the jQuery plugin above. You can also overwrite the functions of the GeSearch class to change the behavior for all instances.

By default all of the class functions are applied to the current GeSearch instance (i.e. within the functions `this` will refer to the current GeSearch instance).

    var options = {query: "Los Angeles", onResults: function(){...}};
    new GeSearch(options);


### GeSearch.gePlugin

Stores the [GEPlugin](http://code.google.com/apis/earth/documentation/reference/interface_g_e_plugin.html) instance.

Initializing a jQuery.geSearch will use either the `gePlugin` option, the `GeSearch.gePlugin` class variable, or `window.gePlugin`. An error is thrown if no `GEPlugin` instance if found.


### GeSearch.onResults

Handler for the [`google.maps.GeocoderResult`](http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult) function call.


### GeSearch.gotoResult

Takes a [`google.maps.GeocoderResult`](http://code.google.com/apis/maps/documentation/javascript/reference.html#GeocoderResult) object and causes the map to fly to that location.

### GeSearch.notifyZeroResults

Flashes a message reading "Nothing found".
