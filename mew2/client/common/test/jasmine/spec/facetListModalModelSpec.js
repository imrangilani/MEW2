define([
  'models/_facetListModalModel',
  'models/_baseModel'
], function(FacetListModalModel, BaseModel) {
  'use strict';

  describe('_facetListModalModel', function() {
    var facetListModalModelInstance = new FacetListModalModel();

    describe('#success', function() {

      it('should call normalizeFacets and then call the BaseModel fetch', function() {
        var object = {
          normalizeFacets: function() {},
          container: 'asdf'
        };
        spyOn(object, 'normalizeFacets');
        spyOn(BaseModel.prototype, 'success');
        facetListModalModelInstance.success(object);
        expect(object.normalizeFacets).toHaveBeenCalled();
      });
    });

    describe('#initSelectedFacetValues', function() {

      beforeEach(function() {
        facetListModalModelInstance.set('requestParams', {
          categoryId: 118,
          brand: 'RalphLauren,TommyHilfiger'
        });
        facetListModalModelInstance.initSelectedFacetValues();
      });

      it('should initialize the facet session values', function() {
        expect(facetListModalModelInstance.get('facetSessionValues').brand).toEqual({
          selected: ['RalphLauren', 'TommyHilfiger']
        });
      });

      it('should ignore the categoryId request param', function() {
        expect(facetListModalModelInstance.get('facetSessionValues').categoryId).toBeFalsy();
      });
    });

    describe('#updateRequestParams', function() {

      beforeEach(function() {
        facetListModalModelInstance.set({
          facetSessionValues: {
            facet1: {
              selected: ['val1', 'val2']
            },
            facet2: {
              selected: []
            }
          },
          requestParams: {
            facet2: 'val1'
          }
        });

        facetListModalModelInstance.updateRequestParams();
      });

      it('should add facets with selected values to the request params', function() {
        expect(facetListModalModelInstance.get('requestParams').facet1).toBe('val1,val2');
      });

      it('should remove facets which no longer have selected values', function() {
        expect(facetListModalModelInstance.get('requestParams').facet2).toBeFalsy();
      });
    });

    describe('#removeStaleFacetSelections', function() {

      beforeEach(function() {

        facetListModalModelInstance.set('facetSessionValues', {
          facet1: {
            disabled: [],
            selected: ['testVal']
          },
          facet2: {
            selected: []
          }
        });

        facetListModalModelInstance.removeStaleFacetSelections();
      });

      it('should remove all disabled facet values', function() {
        expect(facetListModalModelInstance.get('facetSessionValues').facet1.disabled).toBeFalsy();
      });

      it('should remove the facet key from the facetSessionValues object if no values are selected', function() {
        expect(facetListModalModelInstance.get('facetSessionValues').facet2).toBeFalsy();
      });
    });

    describe('#getFacetByName', function() {
      var facetFixture = [{
          name: 'SIZE_NORMAL'
        }];

      beforeEach(function() {
        facetListModalModelInstance.set('facets', _.cloneDeep(facetFixture));
      });

      it('should return the info of the facet with the provided name if it exists', function() {
        var result = facetListModalModelInstance.getFacetByName('SIZE_NORMAL') || {};
        expect(result.name).toBe('SIZE_NORMAL');
      });

      it('should return `null` if the provided facet name does not exist', function() {
        var result = facetListModalModelInstance.getFacetByName('INEXISTENT_FACET');
        expect(result).toBeFalsy();
      });
    });

    describe('#normalizeFacets', function() {

      var facetFixture = [{
        name: 'COLOR_NORMAL',
        value: [{
          name: 'Color with no products',
          productcount: 0
        }, {
          name: 'Color with products',
          productcount: 2
        }]
      }, {
        name: 'SIZE_NORMAL',
        value: [{
          name: 'Size with no products',
          productcount: 0
        }, {
          name: 'Size with products',
          productcount: 2
        }]
      }, {
        name: 'CUSTOMER_RATING',
        value: [{
          name: 'Customer rating with no products',
          productcount: 0
        }, {
          name: 'Customer rating with products',
          productcount: 2
        }]
      }, {
        name: 'BRAND',
        value: [{
          name: 'mybrand',
          productcount: 2
        }, {
          name: 'abrand',
          productcount: 1
        }]
      }, {
        name: 'JACKET_STYLE',
        value: [{
          name: 'style1',
          productcount: 0
        }]
      }];

      beforeEach(function() {
        facetListModalModelInstance.set('facetSessionValues', {
          CUSTOMER_RATING: {
            selected: ['Customer rating with no products'],
            disabled: ['Customer rating with products']
          }
        });

        facetListModalModelInstance.set('facets', _.cloneDeep(facetFixture));
        facetListModalModelInstance.normalizeFacets();
      });

      it('should sort brands alphabetically', function() {
        expect(_.find(facetListModalModelInstance.get('facets'), { name: 'BRAND' }).value[0].name).toBe('abrand');
      });

      describe('when a facet value has a productcount of 0', function() {

        describe('if the facet name is COLOR_NORMAL or SIZE_NORMAL', function() {

          it('should not remove the facet value', function() {
            expect(_.find(facetListModalModelInstance.get('facets'), { name: 'COLOR_NORMAL' }).value.length).toEqual(_.find(facetFixture, { name: 'COLOR_NORMAL' }).value.length);
          });
        });

        describe('if the facet name is anything but COLOR_NORMAL or SIZE_NORMAL', function() {

          it('should remove the facet value', function() {
            expect(_.find(facetListModalModelInstance.get('facets'), { name: 'CUSTOMER_RATING' }).value.length).toEqual(_.find(facetFixture, { name: 'CUSTOMER_RATING' }).value.length -1);
          });
        });
      });

      describe('when all of a facet\'s values have a productcount of 0 and the facet name is anything but COLOR_NORMAL or SIZE_NORMAL', function() {

        it('should remove the facet', function() {
          expect(facetListModalModelInstance.get('facets').length).toEqual(facetFixture.length -1);
        });
      });

      describe('when a facet value was previously selected but disabled by additional filtering and now the productcount is greater than 0', function() {

        it('should be moved from disabled to selected in the facetSessionValues object', function() {
          expect(_.contains(facetListModalModelInstance.get('facetSessionValues').CUSTOMER_RATING.selected, 'Customer rating with products')).toBeTruthy();
        });
      });

      describe('when a facet value was previously selected but now the productcount is 0', function() {

        it('should be moved from selected to disabled in the facetSessionValues object', function() {
          expect(_.contains(facetListModalModelInstance.get('facetSessionValues').CUSTOMER_RATING.disabled, 'Customer rating with no products')).toBeTruthy();
        });
      });
    });
  });
});
