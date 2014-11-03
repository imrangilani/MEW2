define([
  'jasmineHelpers',
  'models/_searchResultsModel',
  'models/_baseModel'
], function(jasmineHelpers, SearchResultsModel, BaseModel) {
  'use strict';

  describe('_searchResultsModelSpec', function() {
    var searchResultsModel;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
      searchResultsModel = new SearchResultsModel();
    });

    describe('#success', function() {
      describe('`redirect` flag is set on the model', function() {
        it('should call `checkForRedirect`, passing model', function() {
          searchResultsModel.set('redirect', true);
          spyOn(searchResultsModel, 'checkForRedirect');
          searchResultsModel.success(searchResultsModel, undefined, undefined);
          expect(searchResultsModel.checkForRedirect).toHaveBeenCalledWith(searchResultsModel, undefined, undefined);
        });
      });

      describe('`redirect` flag is not set on the model', function() {
        it('should call the BaseModel `success` method, passing model', function() {
          searchResultsModel.set('redirect', false);
          spyOn(BaseModel.prototype, 'success');
          searchResultsModel.success(searchResultsModel, undefined, undefined);
          expect(BaseModel.prototype.success).toHaveBeenCalledWith(searchResultsModel, undefined, undefined);
        });
      });
    });

    describe('#checkForRedirect', function() {

      beforeEach(function() {
        App.router.navigate = function() { return true; };
      });

      describe('model has `redirect` object with `redirecttype`: PDP', function() {

        it('should navigate to the `locationurl` set for the `redirect`', function() {
          searchResultsModel.set('redirect', {
            redirecttype: 'PDP',
            locationurl:  'http://www1.macys.com/shop/product/foobar?ID=123'
          });

          spyOn(App.router, 'navigate');
          searchResultsModel.checkForRedirect(searchResultsModel);

          expect(App.router.navigate).toHaveBeenCalledWith('/shop/product/foobar?ID=123', { trigger: true, replace: true });
        });
      });

      describe('model has `redirect` object with `redirecttype`: CATEGORY', function() {

        it('should navigate to the `locationurl` set for the `redirect`', function() {
          searchResultsModel.set('redirect', {
            redirecttype: 'CATEGORY',
            locationurl:  'http://www1.macys.com/shop/category/foobar?ID=123'
          });

          spyOn(App.router, 'navigate');
          searchResultsModel.checkForRedirect(searchResultsModel);

          expect(App.router.navigate).toHaveBeenCalledWith('/shop/category/foobar?ID=123', { trigger: true, replace: true });
        });
      });

      describe('model has `redirect` object with `redirecttype`: RELATIVE_URL', function() {

        it('should navigate to the `locationid` set for the `redirect`', function() {
          searchResultsModel.set('redirect', {
            redirecttype: 'RELATIVE_URL',
            locationid:  '/relative/url/foobar?ID=123'
          });

          spyOn(App.router, 'navigate');
          searchResultsModel.checkForRedirect(searchResultsModel);

          expect(App.router.navigate).toHaveBeenCalledWith('/relative/url/foobar?ID=123', { trigger: true, replace: true });
        });
      });
    });
  });
});
