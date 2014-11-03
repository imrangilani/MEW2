define([
  'models/facetBopsModalModel'
], function(FacetBopsModalModel) {
  'use strict';

  describe('Model:MCOM FacetBops', function() {
    var mcomFacetBopsModelInstance;

    beforeEach(function() {
      mcomFacetBopsModelInstance = new FacetBopsModalModel();
    });

    describe('#verifyHeaders', function() {
      it('should have headers object defined', function() {
        
        expect(mcomFacetBopsModelInstance.header).toBeDefined();
      });
      
      it('should have the id named as \'facet-bops\'', function() {
        
        expect(mcomFacetBopsModelInstance.header.id).toBe('facet-bops');
      });

      it('should have the title named as \'Filter By\'', function() {
        
        expect(mcomFacetBopsModelInstance.header.title).toBe('Filter By');
      });

      it('should have the button titled as \'Done\'', function() {
        
        expect(mcomFacetBopsModelInstance.header.right.title).toBe('done');
      });

    });

    afterEach(function() {
      mcomFacetBopsModelInstance = null;
    });
  });
});
