Google Earth Search jQuery Plugin
=================================

This plugin enables geo-coded searches in the Google Earth browser plugin using the google maps v3 geo coding API.

Initialize Google Earth
-----------------------

    <input type="search" class="ge-search" placeholder="Search Earth!">
    <input type="button" class="ge-search" value="Search">
    <div id="gePlugin" style="width:600px; height:450px;"></div>

    <script src="//www.google.com/jsapi?key=your_key_here"></script>
    <script>
      google.load("earth", "1");

      google.setOnLoadCallback(function() {
        google.earth.createInstance('gePlugin', onInitSuccess, onInitFail);
      });

      function onInitSuccess(instance) {
        // do something awesome
      }

      function onInitFail(errorCode){
        // oops
      }
    </script>

Usage
-----

Defaults, assumes that `window.ge` is the plugin instance.

`$(".ge-search").geSearch();`

Or, you can explicitly set the search instance to whatever you want. The instance is available as `GeSearch.instance`.

`$(".ge-search").geSearch({gePlugin: pluginInstance});`


Search API
----------

All of the heavy lifting for geo-coded searching is done by the `GeSearch` class. To perform a search you can instantiate a new GeSearch object while passing in the string you wish to search for.

    new GeSearch("Boulder, CO");

If you do not wish to search immediately you can send in the option `performSearch` as false. Then you can call the `search` function to perform the search at any time.

    var gs = new GeSearch("Boulder, CO", false);
    gs.search();

### `GeSearch.instance`

### `GeSearch.getQuery`

### `GeSearch.onGeoResults`

### `GeSearch.gotoResult`

### `GeSearch.notifyZeroResults`