describe("GeSearch", function() {

  it("Should instantiate just fine", function(){
    new GeSearch;
  });

  it("Should make a geocoder call when instantiated with a string", function(){
    var spy = spyOn(google.maps.Geocoder.prototype, "geocode");
    new GeSearch("Boulder, CO");
    expect(google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
    expect(spy.mostRecentCall.args[0]).toEqual({address:"Boulder, CO"});
  });

  it("Should NOT make a geocoder call when instantiated and performSearch is false", function(){
    var spy = spyOn(google.maps.Geocoder.prototype, "geocode");
    new GeSearch("Boulder, CO", false);
    expect(google.maps.Geocoder.prototype.geocode).not.toHaveBeenCalled();
  });

  it("Should accept geocode the query option", function(){
    var spy = spyOn(google.maps.Geocoder.prototype, "geocode");
    new GeSearch({query: "Boulder, CO"});
    expect(google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
    expect(spy.mostRecentCall.args[0]).toEqual({address:"Boulder, CO"});
  });

  it("Should accept geocode the query and performSearch options", function(){
    var spy = spyOn(google.maps.Geocoder.prototype, "geocode");
    new GeSearch({query: "Boulder, CO", performSearch: false});
    expect(google.maps.Geocoder.prototype.geocode).not.toHaveBeenCalled();
  });

  it("Should search and call GeSearch.onResults.apply with the results", function(){

    var geocodeFake = function(request, callback){
      callback.call();
    }

    var spy1 = spyOn(google.maps.Geocoder.prototype, "geocode").andCallFake(geocodeFake);
    var spy2 = spyOn(GeSearch.onResults, "apply");

    var gs = new GeSearch("Memphis, TN");

    expect(google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
    // TODO: figure out how to check for the correct arguments
    expect(GeSearch.onResults.apply).toHaveBeenCalled();
  });

  it("Should search and call optional onResults.apply with the results", function(){

    var geocodeFake = function(request, callback){
      callback.call();
    }

    spyOn(google.maps.Geocoder.prototype, "geocode").andCallFake(geocodeFake);
    spyOn(GeSearch.onResults, "apply");

    var gs = new GeSearch("Memphis, TN");

    expect(google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
    // TODO: figure out how to check for the correct arguments
    expect(GeSearch.onResults.apply).toHaveBeenCalled();
  });

  describe("GeSearch.onResults", function(){

    it("Should throw an error if status is not OK or ZERO_RESULTS", function(){
      expect(function(){
        GeSearch.onResults(null, null);
      }).toThrow("Bad google.maps.GeocoderStatus: null");

      expect(function(){
        GeSearch.onResults();
      }).toThrow("Bad google.maps.GeocoderStatus: undefined");

      expect(function(){
        GeSearch.onResults(null, "Not Valid");
      }).toThrow("Bad google.maps.GeocoderStatus: Not Valid");
    });

    it("Should call GeSearch.notifyZeroResults.apply if ZERO_RESULTS", function(){
      spyOn(GeSearch.notifyZeroResults, "apply");

      GeSearch.onResults(null, google.maps.GeocoderStatus.ZERO_RESULTS);

      expect(GeSearch.notifyZeroResults.apply).toHaveBeenCalled();
    });

    it("Should call optional notifyZeroResults.apply if ZERO_RESULTS", function(){
      var obj = {
        options:{
          notifyZeroResults:function(){var fake=true;}
        }
      };

      spyOn(obj.options.notifyZeroResults, "apply");

      GeSearch.onResults.apply(obj, [null, google.maps.GeocoderStatus.ZERO_RESULTS]);

      expect(obj.options.notifyZeroResults.apply).toHaveBeenCalled();
    });
  });


  describe("Without google.earth", function(){

    it("Should throw an error if the earth plugin isn't found", function(){
      var ge = window.gePlugin;
      window.gePlugin = undefined;

      expect(function(){
        new GeSearch
      }).toThrow("Could not find the Google Earth plugin.")

      window.gePlugin = ge;
    });

    it("Should throw an error if the wrong earth plugin if found", function(){
      var ge = window.gePlugin;
      window.gePlugin = {};
      
      expect(function(){
        new GeSearch
      }).toThrow("Could not find the Google Earth plugin.")

      window.gePlugin = ge;
    });

  });

  describe("Without google.maps", function(){

    it("Should throw an error if maps isn't found", function(){
      var maps = google.maps;
      google.maps = undefined;


      expect(function(){
        new GeSearch
      }).toThrow("Could not find the Google Maps Geocoder.");

      google.maps = maps;
    });

    it("Should throw an error if geocoder isn't found", function(){
      var geocoder = google.maps.Geocoder;
      google.maps.Geocoder = undefined;

      expect(function(){
        new GeSearch
      }).toThrow("Could not find the Google Maps Geocoder.");

      google.maps.Geocoder = geocoder;
    });

  });

  describe("Without jquery", function(){

    it("Should throw an error if jquery isn't", function(){
      var jq = jQuery;
      jQuery = undefined;

      expect(function(){
        new GeSearch
      }).toThrow("Could not find the jQuery library.");

      jQuery = jq;
    });

  });

});