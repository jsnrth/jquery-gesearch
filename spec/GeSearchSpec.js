describe("GeSearch", function() {

  it("Should instantiate just fine", function(){
    new GeSearch;
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