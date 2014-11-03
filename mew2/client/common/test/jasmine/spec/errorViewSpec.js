define([
  'jasmineHelpers',
  'views/_errorView'
], function(jasmineHelpers, ErrorView) {
  'use strict';

  describe('_errorView', function() {

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
    });

    describe('#getErrorCode', function() {

      it('should return an unexpected error code if the error is not specially treated', function() {
        var errorView = new ErrorView({
          options: {
            statusCode: 403
          }
        });
        expect(errorView.getErrorCode()).toEqual('unexpectedError');
      });

      it('should return a "product not found" error if a 404 and on PDP', function() {
        var errorView = new ErrorView({
          options: {
            statusCode: 404,
            relativeUrl: '/shop/product/aaaa?ID=1111'
          }
        });
        expect(errorView.getErrorCode()).toEqual('productNotFound');
      });

      it('should return a general error code for generic errors', function() {
        var errorView = new ErrorView({
          options: {
            statusCode: 404
          }
        });
        expect(errorView.getErrorCode()).toEqual('notFound');
      });
    });

    describe('#continueShopping', function() {

      it('should go back to the previous page', function() {
        App.router.back = function() { return true; };
        spyOn(App.router, 'back');

        var errorView = new ErrorView({ statusCode: 404 });
        errorView.continueShopping();

        expect(App.router.back).toHaveBeenCalled();
      });
    });
  });
});
