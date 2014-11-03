define([
  'jasmineHelpers',
  'models/_brandIndexModel',
  'models/_appModel'
], function(jasmineHelpers, BrandIndexModel, AppModel) {
  'use strict';

  describe('_brandIndexModel', function() {
    var brandIndexServiceUrl = '/api/v4/catalog/category/brandindex/';

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      spyOn(AppModel.prototype, 'initialize');

      App.model = new AppModel({ categoryIndex: {
        menus: {
          118: {
            fobCatId: ['612', '200']
          },
          420: {
            fobCatId: ['100']
          }
        }
      }});
    });

    describe('BrandIndex service url', function() {
      it('should return the Brand Index endpoint using the `fobCatId` comma separated', function() {
        var brandIndexModelInstance = new BrandIndexModel({
          requestParams: {
            id: '118'
          }
        });
        var expectedUrl = brandIndexModelInstance.url();
        expect(expectedUrl).toBe(brandIndexServiceUrl + '612,200?refcatid=118');
      });

      it('should not put comma if there is just one `fobCatId`', function() {
        var brandIndexModelInstance = new BrandIndexModel({
          requestParams: {
            id: '420'
          }
        });
        var expectedUrl = brandIndexModelInstance.url();
        expect(expectedUrl).toBe(brandIndexServiceUrl + '100?refcatid=420');
      });
    });

    describe('BrandIndex response validation', function() {
      it('Expecting the Brand Name', function() {
        var modelA = new BrandIndexModel({ categoryName: 'foo' });
        var categoryName = modelA.get('categoryName');
        expect(categoryName).toBeDefined();
      });

      it('Expecting the Brands array', function() {
        var modelA = new BrandIndexModel({ brandIndex: [] });
        var brandsArray = modelA.get('brandIndex');
        expect(brandsArray).not.toBe(null);
      });
    });
  });
});
