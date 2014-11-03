define([
  'models/_facetBopsModalModel',
  'util/_util'
], function(FacetBopsModalModel, util) {
  'use strict';

  describe('_facetBopsModalModel', function() {
    var facetBopsModelInstance;

    var defaultRequestParams = {
      appl: 'MOBILE',
      device: 'PHONE',
      show: 'facet',
      expand: 'stores'
    };

    describe('BrandIndex service url for search ', function() {
      beforeEach(function() {
        facetBopsModelInstance = new FacetBopsModalModel({
          context: 'search'
        });
      });

      it('should return the BOPS search url which contains the parameters', function() {

        facetBopsModelInstance.addRequestParams({ first: 'foo' }, true);
          var expectedUrl = facetBopsModelInstance.url();
          var defaultParams = util.buildApiUrl(defaultRequestParams);
         expect(expectedUrl).toBe('/api/v4/catalog/search' + defaultParams + '&first=foo');
      });

      afterEach(function(){
        facetBopsModelInstance = null;
      });
    });

    describe('BrandIndex service url for browse ', function() {
      beforeEach(function() {
        facetBopsModelInstance = new FacetBopsModalModel();
      });

      it('should return the BOPS browse url which contains the parameters ', function() {

        facetBopsModelInstance.addRequestParams({ categoryId: '1234' }, true);
          var expectedUrl = facetBopsModelInstance.url();
          var defaultParams = util.buildApiUrl(defaultRequestParams);
         expect(expectedUrl).toBe('/api/v3/catalog/category/1234/browseproducts?show=facet&expand=stores');
      });

      afterEach(function(){
        facetBopsModelInstance = null;
      });
    });

    beforeEach(function() {
      facetBopsModelInstance = new FacetBopsModalModel();
    });

    describe('#verifyDefaults', function() {
      it('should have defaults object defined', function() {

        expect(facetBopsModelInstance.defaults).toBeDefined();
      });
    });

    describe('#addRequestParams', function() {

      it('should add the param in `requestParams` collection', function() {
        var requestParams;

        facetBopsModelInstance.addRequestParams({ first: 'foo' }, true);
        facetBopsModelInstance.addRequestParams({ second: 'bar', third: 'foobar' });

        requestParams = facetBopsModelInstance.get('requestParams');

        expect(requestParams.first).toBe('foo');
        expect(requestParams.second).toBe('bar');
        expect(requestParams.third).toBe('foobar');
      });

      it('should add the param in `requestParams` collection and in the `fixedRequestParams`', function() {
        var fixedRequestParams;

        facetBopsModelInstance.addRequestParams({ first: 'foo' }, true);
        facetBopsModelInstance.addRequestParams({ second: 'bar', third: 'foobar' }, false);

        fixedRequestParams = facetBopsModelInstance.get('fixedRequestParams');

        expect(fixedRequestParams.first).toBe('foo');
        expect(fixedRequestParams.second).toBeUndefined();
        expect(fixedRequestParams.third).toBeUndefined();
      });

    });

    describe('#clearRequestParams', function() {

      it('should clear `requestParams` and `fixedRequestParams`', function() {
        var requestParams,
            fixedRequestParams;

        facetBopsModelInstance.addRequestParams({ first: 'foo' });
        facetBopsModelInstance.addRequestParams({ second: 'bar' }, true);
        facetBopsModelInstance.clearRequestParams();

        requestParams = facetBopsModelInstance.get('requestParams');
        fixedRequestParams = facetBopsModelInstance.get('fixedRequestParams');

        expect(requestParams.first).toBeUndefined();
        expect(requestParams.second).toBeUndefined();
        expect(fixedRequestParams.second).toBeUndefined();
      })

    });

    describe('#resetRequestParams', function() {

      it('should reset `requestParams` and preserve `fixedRequestParams`', function() {
        var requestParams,
            fixedRequestParams;

        facetBopsModelInstance.addRequestParams({ first: 'foo' });
        facetBopsModelInstance.addRequestParams({ second: 'bar' }, true);
        facetBopsModelInstance.resetRequestParams();

        requestParams = facetBopsModelInstance.get('requestParams');
        fixedRequestParams = facetBopsModelInstance.get('fixedRequestParams');

        expect(requestParams.first).toBeUndefined();
        expect(requestParams.second).toBe('bar');
        expect(fixedRequestParams.second).toBe('bar');
      })

    });

    afterEach(function() {
      facetBopsModelInstance = null;
    });
  });
});
