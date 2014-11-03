define([
  'backbone',
  'jquery',
  'underscore'
], function(Backbone, $, _) {
  'use strict';

  var _mapsApiLoaded = $.Deferred();

  window.initMapsApi = function() {
    _mapsApiLoaded.resolve();
    delete window.initMapsApi;
  };

  var geoCode = _.extend(Backbone.Events, {
    //Load google maps API
    init: function() {
      //-------------------------------------------
      //Explicit loading of google api counts as a hit on our usage.
      //It is much preferred do not initialize it until user hits control
      //that really requires making geo api call.
      //-------------------------------------------
      //Both production and non-prod urls are specified in config.js
      //The key is specified in env configuration property CONFIG_GEOKEY
      var configUrl,
          url,
          key = App.config.ENV_CONFIG.geokey;

      var geo = this;

      if (!this.initialized) {
        if (App.config.ENV_CONFIG.production === 'Y') {
          configUrl = App.config.mapsApi.serverUrl.productionUrl;
        } else {
          configUrl = App.config.mapsApi.serverUrl.nonproductionUrl;
        }

        url = configUrl.replace('$key$', key);

        require([url + '&callback=initMapsApi'], function() {
        });

        _mapsApiLoaded.done(function() {
          geo.initialized = true;
          geo.trigger('geoCodeLoaded');
        });
      }

      return geo;
    },
    //Determines zip code based on current location
    getLocalZipCode: function(callbackSuccess, callbackError) {
      this.init();
      _mapsApiLoaded.done(_.bind(function() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(_.bind(function(position) {
            this.getZipCodeByLocation(position.coords.latitude, position.coords.longitude, callbackSuccess, callbackError);
          }, this), callbackError);
        }
      }, this));
    },
    //Determines zip code based on longatitue and latitude
    //The callbackError is called when there's something wrong with accessing services.
    //The callbackSuccess is called when we can access service. But we pass undefined instead of zip code
    //when we for some reason cannot get that zip - it's not US, or not part of the returned data
    getZipCodeByLocation: function(latitude, longitude, callbackSuccess, callbackError) {
      this.init();
      _mapsApiLoaded.done(_.bind(function() {
        var location = new google.maps.LatLng(latitude, longitude);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ latLng: location },
          _.bind(function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              var result = results[0];
              //Find 'postal_code' field among all returned components of the address
              var addressComponent = this.getResultByType(result.address_components, 'postal_code');
              var countryComponent = this.getResultByType(result.address_components, 'country');
              //If both postal code and country are present but it's not US
              if( !_.isUndefined(addressComponent) && !_.isUndefined(countryComponent)){
                if( countryComponent.short_name === "US"){
                  //This is the postal code we want
                  callbackSuccess(addressComponent.long_name);
                } else {
                  callbackSuccess(undefined);
                }
              } else {
                callbackSuccess(undefined);
              }
            } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
              callbackSuccess(undefined);
            } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              callbackError(status);
            }
          }, this),
          function(positionError) {
            // positionError.code eq 1 Permission denied
            // positionError.code eq 2 Position unavailable - internal error retrieval position
            // positionError.code eq 3 Timeout getting position
            callbackError(positionError);
          },
          {
            maximumAge:    0,
            timeout:       App.config.mapsApi.timeout,
            enableHighAccuracy: true
          }
        );
      }, this));
    },

    getLocalLatLng: function(callbackSuccess, callbackError) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          callbackSuccess({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }, callbackError);
      } else {
        callbackError('Geolocation not supported on this device.');
      }
    },

    getMapLatLng: function( location, callbackSuccess){

      this.init();
      _mapsApiLoaded.done(function() {

        //Define map parameters
        var latlng = new google.maps.LatLng(location.latitude, location.longitude);
        callbackSuccess(latlng);
      });
    },


    getLatLngByTextQuery: function(query, callbackSuccess, callbackError, allowZeroResults) {
      var self = this;

      this.init();
      _mapsApiLoaded.done(function() {
        var geocoder = new google.maps.Geocoder(),
            request = {
              address: query
            };
        geocoder.geocode(request, function(results, status) {
          switch (status) {
            case google.maps.GeocoderStatus.OK:
              var result = results[0];
              var zipCodeData = self.getResultByType(result.address_components, 'postal_code');

              callbackSuccess({
                latitude: result.geometry.location.lat(),
                longitude: result.geometry.location.lng(),
                zipCode: zipCodeData ? zipCodeData.long_name : undefined
              });
              break;

            case google.maps.GeocoderStatus.ZERO_RESULTS && allowZeroResults:
              callbackSuccess(undefined);
              break;

            case google.maps.GeocoderStatus.ZERO_RESULTS && !allowZeroResults:
              /* falls through */
            case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
              /* falls through */
            default:
              callbackError(status);
              break;
          }
        });
      });
    },

    getLatLngByPlacesReference: function(reference, mapContainer, callbackSuccess, callbackError) {
      this.init();
      _mapsApiLoaded.done(function() {
        var map = new google.maps.Map(mapContainer),
            service = new google.maps.places.PlacesService(map);
        this.getLatLngByPlacesReference = function(reference, mapContainer, callbackSuccess, callbackError) {
          var request = { reference: reference };
          service.getDetails(request, function(place, status) {
            var location;
            switch (status) {
              case google.maps.places.PlacesServiceStatus.OK:
                location = place.geometry.location;
                callbackSuccess({
                  latitude: location.lat(),
                  longitude: location.lng()
                });
                break;
              default:
                callbackError(status);
                break;
            }
          });
        };
        this.getLatLngByPlacesReference(reference, mapContainer, callbackSuccess, callbackError);
      });
    },

    //Extract a value of typeName from an array of objects
    getResultByType: function(results, typeName) {
      var result = _.find(results, function(result) {
        var type = _.find(result.types, function(type) {
          return type === typeName;
        });
        return !_.isUndefined(type);
      });
      return result;
    },

    getPlacePredictions: function(query, callbackSuccess, callbackError) {
      this.init();
      _mapsApiLoaded.done(function() {
        var service = new google.maps.places.AutocompleteService();
        this.getPlacePredictions = function(query) {
          var request = {
            input: query,
            types: ['geocode'],
            componentRestrictions: { country: 'us' }
          };
          service.getPlacePredictions(request, function(predictions, status) {
            switch (true) {
              case status === google.maps.places.PlacesServiceStatus.NO_RESULTS:
                predictions = [];
                /* falls through */
              case status === google.maps.places.PlacesServiceStatus.OK:
                callbackSuccess(predictions);
                break;
              default:
                callbackError(status);
                break;
            }
          });
        };
        this.getPlacePredictions(query);
      });
    }
  });

  return geoCode;
});
