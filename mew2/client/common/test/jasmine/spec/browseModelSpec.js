define([
  'models/_browseModel'
], function(BrowseModel) {
  'use strict';

  describe('_browseModel', function() {
    var browseModelInstance = new BrowseModel();

    describe('#setFacetRequestParams', function() {

      beforeEach(function() {
        browseModelInstance.set('requestParams', {
          testKey: 'testVal',
          categoryId: 2
        });
        browseModelInstance.setFacetRequestParams({
          facetName: 'facetValue'
        });
      });

      it('should only retain white-listed keys', function() {
        expect(browseModelInstance.get('requestParams').testKey).toBeFalsy();
        expect(browseModelInstance.get('requestParams').categoryId).toBe(2);
      });

      it('should update the request params with new params from the facet modal', function() {
        expect(browseModelInstance.get('requestParams').facetName).toBe('facetValue');
      });
    });
  });
});
