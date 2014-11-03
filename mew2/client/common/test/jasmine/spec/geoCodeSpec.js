define([
  'underscore',
  'util/_geoCode'
], function(_, GeoCode) {
  'use strict';

  describe('_geoCode', function() {
    var appConfig = window.App;
    var requireFn = window.require;
    var googleNs = window.google;
    var geoLocation = window.navigator.geolocation;

    beforeEach(function() {
      window.App = {
        config: {
          mapsApi:{
            serverUrl:  {
              nonproductionUrl: 'http://non-prod.maps.google.com/maps/api/js?client=$key$',
              productionUrl: 'http://prod.maps.google.com/maps/api/js?client=$key$'
            },
            timeout: 1000
          },
          ENV_CONFIG: {
            production: 'Y',
            geokey: 'AIzaSyCvMUBWpPsPexmgBNMH2SF6jcr804h7oTU'
          }
        }
      };

      window.require = function() {
        window.initMapsApi();
      };

      window.google = {
        maps: {
          LatLng: function(latitude, longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
          },
          GeocoderStatus: {
            ZERO_RESULTS: 0,
            OK: 1,
            OVER_QUERY_LIMIT: 2
          },
          Geocoder: (function() {
            var googleGeocoder = function() { };

            _.extend(googleGeocoder.prototype, {
              data: [{
                latitude: '40.71',
                longitude: '-74.00',
                data: [{
                  address_components: [{
                    types: ['postal_code'],
                    long_name: '10007'
                  }, {
                    types: ['country'],
                    short_name: 'US'
                  }]
                }]
              }, {
                latitude: '41.00',
                longitude: '-123.05',
                data: [{
                  address_components: [{
                    postal_code: {
                      long_name: '96048'
                    },
                    country: {
                      short_name: 'US'
                    }
                  }]
                }]
              }, {
                latitude: '-19.91',
                longitude: '-43.96',
                data: [{
                  address_components: [{
                    types: ['postal_code'],
                    long_name: '30710'
                  }, {
                    types: ['country'],
                    short_name: 'BR'
                  }]
                }]
              }],
              geocode: function(request, success) {
                var location = request.latLng;
                var latitude = location.latitude.toFixed(2);
                var longitude = location.longitude.toFixed(2);
                var status;
                var data;

                var result = _.find(this.data, function(item) {
                  return (item.latitude === latitude) && (item.longitude === longitude);
                });

                if (result) {
                  data = result.data;
                  status = window.google.maps.GeocoderStatus.OK;
                } else {
                  status = window.google.maps.GeocoderStatus.ZERO_RESULTS;
                }

                success(data, status);
              }
            });

            return googleGeocoder;
          })()
        }
      };

      // navigator.geolocation is null during unit tests
      window.navigator.geolocation = {
        getCurrentPosition: function() { }
      };
    });

    afterEach(function() {
      window.App = appConfig;
      window.require = requireFn;
      window.google = googleNs;
      navigator.geolocation = geoLocation;
    });

    describe('#init', function() {

      it('should requires geocode script for non-production environment when `production` is not set to `Y`', function() {
        var geoCodeKey = window.App.config.ENV_CONFIG.geokey;
        var geoCodeUrl = window.App.config.mapsApi.serverUrl.nonproductionUrl.replace('$key$', geoCodeKey) + '&callback=initMapsApi';

        window.App.config.ENV_CONFIG.production = 'N';

        spyOn(window, 'require');

        GeoCode.init();

        expect(window.require.calls.mostRecent().args[0][0]).toBe(geoCodeUrl);
      });

      it('should requires geocode script for production environment when `production` is set to `Y`', function() {
        var geoCodeKey = window.App.config.ENV_CONFIG.geokey;
        var geoCodeUrl = window.App.config.mapsApi.serverUrl.productionUrl.replace('$key$', geoCodeKey) + '&callback=initMapsApi';

        window.App.config.ENV_CONFIG.production = 'Y';

        spyOn(window, 'require');

        GeoCode.init();

        expect(window.require.calls.mostRecent().args[0][0]).toBe(geoCodeUrl);
      });

      it('should finish initialization after loading its dependencies', function() {
        spyOn(GeoCode, 'trigger');

        GeoCode.init();

        expect(GeoCode.initialized).toBe(true);
        expect(GeoCode.trigger).toHaveBeenCalled();
      });

    });

    describe('#getZipCodeByLocation', function() {

      it('should returns a zip code for a location in US', function() {
        var callbacks = {
          geoLocationSuccess: jasmine.createSpy('successCallback'),
          geoLocationError: jasmine.createSpy('errorCallback')
        };

        // NY
        GeoCode.getZipCodeByLocation(40.71, -74.00, callbacks.geoLocationSuccess, callbacks.geoLocationError);

        expect(callbacks.geoLocationSuccess).toHaveBeenCalledWith('10007');
        expect(callbacks.geoLocationError).not.toHaveBeenCalled();
      });

      it('should not returns a zip code for a location outside US', function() {
        var callbacks = {
          geoLocationSuccess: jasmine.createSpy('successCallback'),
          geoLocationError: jasmine.createSpy('errorCallback')
        };

        GeoCode.getZipCodeByLocation(-19.91, -43.96, callbacks.geoLocationSuccess, callbacks.geoLocationError);

        expect(callbacks.geoLocationSuccess).toHaveBeenCalledWith(undefined);
        expect(callbacks.geoLocationError).not.toHaveBeenCalled();
      });

      it('should not returns a zip code for a invalid zip code', function() {
        var callbacks = {
          geoLocationSuccess: jasmine.createSpy('successCallback'),
          geoLocationError: jasmine.createSpy('errorCallback')
        };

        GeoCode.getZipCodeByLocation(0, 0, callbacks.geoLocationSuccess, callbacks.geoLocationError);

        expect(callbacks.geoLocationSuccess).toHaveBeenCalledWith(undefined);
        expect(callbacks.geoLocationError).not.toHaveBeenCalled();
      });

    });

    describe('#getLocalLatLng', function() {

      it('should get users location through navigator API', function() {
        var callbacks = {
          success: jasmine.createSpy('successCallback'),
          error: jasmine.createSpy('errorCallback')
        };

        spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(function(success) {
          success({
            coords: {
              latitude: 1.23,
              longitude: 4.56
            }
          });
        });

        GeoCode.getLocalLatLng(callbacks.success, callbacks.error);

        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
        expect(callbacks.success.calls.mostRecent().args[0].latitude).toBe(1.23);
        expect(callbacks.success.calls.mostRecent().args[0].longitude).toBe(4.56);
        expect(callbacks.error).not.toHaveBeenCalled();
      });

      it('should call `error` method when geoLocation API is not available', function() {
        var callbacks = {
          success: jasmine.createSpy('successCallback'),
          error: jasmine.createSpy('errorCallback')
        };

        delete navigator.geolocation;
        GeoCode.getLocalLatLng(callbacks.success, callbacks.error);

        expect(callbacks.success).not.toHaveBeenCalled();
        expect(callbacks.error).toHaveBeenCalled();
      });

    });

    describe('#getMapLatLng', function() {

      it('should initialize itself', function() {
        var successCallback = jasmine.createSpy('successCallback');
        var latLng = {
          latitude: 1.23,
          longitude: 4.56
        };

        spyOn(GeoCode, 'init').and.callThrough();
        GeoCode.getMapLatLng(latLng, successCallback);

        expect(GeoCode.init).toHaveBeenCalled();
      });

      it('should convert latlng object into Google Maps LatLng', function() {
        var successCallback = jasmine.createSpy('successCallback');
        var latLng = {
          latitude: 1.23,
          longitude: 4.56
        };

        GeoCode.getMapLatLng(latLng, successCallback);

        expect(successCallback).toHaveBeenCalled();
        expect(successCallback.calls.mostRecent().args[0] instanceof window.google.maps.LatLng).toBe(true);
        expect(successCallback.calls.mostRecent().args[0].latitude).toBe(1.23);
        expect(successCallback.calls.mostRecent().args[0].longitude).toBe(4.56);
      });

    });

    describe('#getLatLngByTextQuery', function() {
      // TO DO
    });

    describe('#getLatLngByPlacesReference', function() {
      // TO DO
    });

    describe('#getResultByType', function() {
      var address_components;

      beforeEach(function() {
        address_components = [{
          types: ['postal_code'],
          long_name: '10007'
        }, {
          types: ['country'],
          short_name: 'US'
        }];
      });

      it('should return undefined for invalid address components', function() {
        var result = GeoCode.getResultByType(address_components, 'foo');

        expect(result).not.toBeDefined();
      });

      it('should return the right address component', function() {
        var result = GeoCode.getResultByType(address_components, 'country');

        expect(result).toBeDefined();
        expect(result.short_name).toBe('US');
      });
    });

    describe('#getPlacePredictions', function() {
      // TO DO
    });
  });
});
