define([
  'jasmineHelpers',
  'models/_baseModel',
  'models/_geoCodeModel',
  'util/_geoCode',
  'util/_util'
], function(jasmineHelpers, BaseModel, GeoCodeModel, GeoCode, util) {
  'use strict';

  describe('_geoCodeModel', function() {
    var geoCodeModelInstance;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      App.config.mapsApi = { serverUrl: {
        productionUrl: '',
        nonproductionUrl: ''
      }};

      geoCodeModelInstance = new GeoCodeModel();
    });

    describe('#initialize', function() {

      it('should initialize GeoCode', function() {
        var geoCodeMock = {};

        spyOn(GeoCode, 'init').and.returnValue(geoCodeMock);
        spyOn(geoCodeModelInstance, 'listenTo');

        geoCodeModelInstance.initialize();

        expect(GeoCode.init).toHaveBeenCalled();
      });

      it('should listen to GeoCode event', function() {
        var geoCodeMock = {};

        spyOn(GeoCode, 'init').and.returnValue(geoCodeMock);
        spyOn(geoCodeModelInstance, 'listenTo');

        geoCodeModelInstance.initialize();

        expect(geoCodeModelInstance.listenTo).toHaveBeenCalledWith(geoCodeMock, 'geoCodeLoaded', geoCodeModelInstance.geoCodeLoaded);
      });
    });

    describe('#geoCodeLoaded', function() {

      it('should trigger `geoCodeLoaded` event', function() {
        spyOn(geoCodeModelInstance, 'trigger');
        geoCodeModelInstance.geoCodeLoaded();
        expect(geoCodeModelInstance.trigger).toHaveBeenCalledWith('geoCodeLoaded');
      });
    });

    describe('#fetch', function() {

      beforeEach(function() {
        spyOn(GeoCode, 'getPlacePredictions');
        spyOn(GeoCode, 'getLatLngByPlacesReference');
        spyOn(GeoCode, 'getLatLngByTextQuery');
        spyOn(GeoCode, 'getLocalLatLng');
      });

      it('should not do anything if `requestParams` is null', function() {
        geoCodeModelInstance.fetch();

        expect(GeoCode.getPlacePredictions).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByPlacesReference).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByTextQuery).not.toHaveBeenCalled();
        expect(GeoCode.getLocalLatLng).not.toHaveBeenCalled();
      });

      it('should search for place lat/lng through Google Autocomplete Service when `predictionsQuery` is provided', function() {
        geoCodeModelInstance.set('requestParams', {
          predictionsQuery: 'foo'
        });

        geoCodeModelInstance.fetch();

        expect(GeoCode.getPlacePredictions).toHaveBeenCalled();
        expect(GeoCode.getLatLngByPlacesReference).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByTextQuery).not.toHaveBeenCalled();
        expect(GeoCode.getLocalLatLng).not.toHaveBeenCalled();
      });

      it('should search for place lat/lng through Google Places API when `reference` is provided', function() {
        geoCodeModelInstance.set('requestParams', {
          reference: 'foo'
        });

        geoCodeModelInstance.fetch({
          mapContainer: {}
        });

        expect(GeoCode.getPlacePredictions).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByPlacesReference).toHaveBeenCalled();
        expect(GeoCode.getLatLngByTextQuery).not.toHaveBeenCalled();
        expect(GeoCode.getLocalLatLng).not.toHaveBeenCalled();
      });

      it('should search for place\'s lat/lng through Google GeoCode Service when `query` is provided', function() {
        geoCodeModelInstance.set('requestParams', {
          query: 'foo'
        });

        geoCodeModelInstance.fetch();

        expect(GeoCode.getPlacePredictions).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByPlacesReference).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByTextQuery).toHaveBeenCalled();
        expect(GeoCode.getLocalLatLng).not.toHaveBeenCalled();
      });

      it('should search for current lat/lng through Google GeoLocation Service when `nearby` is provided', function() {
        geoCodeModelInstance.set('requestParams', {
          nearby: 'foo'
        });

        geoCodeModelInstance.fetch();

        expect(GeoCode.getPlacePredictions).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByPlacesReference).not.toHaveBeenCalled();
        expect(GeoCode.getLatLngByTextQuery).not.toHaveBeenCalled();
        expect(GeoCode.getLocalLatLng).toHaveBeenCalled();
      });
    });

    describe('#parse', function() {

      it('should return the results as an object', function() {
        var result = [1, 2, 3, 4],
            obj;

        obj = geoCodeModelInstance.parse(result);

        expect(obj).toBeTruthy();
        expect(obj.results).toBe(result);
      });

    });

    describe('#success', function() {

      it('should set the response in the model', function() {
        spyOn(util, 'hideLoading');
        spyOn(geoCodeModelInstance, 'trigger');

        geoCodeModelInstance.success({
          foo: 123,
          bar: 'string value'
        });

        expect(geoCodeModelInstance.get('results').foo).toBe(123);
        expect(geoCodeModelInstance.get('results').bar).toBe('string value');
      });

      it('should hide the loading', function() {
        spyOn(util, 'hideLoading');
        spyOn(geoCodeModelInstance, 'trigger');

        geoCodeModelInstance.success({ foo: 'bar' });

        expect(util.hideLoading).toHaveBeenCalled();
      });

      it('should trigger `modelready` event', function() {
        spyOn(util, 'hideLoading');
        spyOn(geoCodeModelInstance, 'trigger');

        geoCodeModelInstance.success({ foo: 'bar' });

        expect(geoCodeModelInstance.trigger).toHaveBeenCalledWith('modelready');
      });
    });

    describe('#error', function() {

      it('should call `error` on BaseModel', function() {
        spyOn(BaseModel.prototype, 'error');
        geoCodeModelInstance.error();
        expect(BaseModel.prototype.error).toHaveBeenCalled();
      });
    });
  });
});
