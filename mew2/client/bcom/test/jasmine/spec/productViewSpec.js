define([
  // Views
  'views/productView',
  'views/addToBagView',
  'views/addToRegistryView',
  // Models
  'models/productModel'
], function(ProductView, AddToBagView, AddToRegistryView, ProductModel) {
  'use strict';

  describe('productView', function() {
    var productViewInstance;

    beforeEach(function() {
      spyOn(ProductModel.prototype, 'fetch');
      productViewInstance = new ProductView();
    });

    afterEach(function() {
      productViewInstance = null;
    });

    describe('#getProductReference', function() {

      describe('when it is a master product', function() {
        var $productWrapper;

        beforeEach(function() {
          setFixtures('<article data-id="12345" data-member="false" class="b-product-wrapper"></article>');
          $productWrapper = $('.b-product-wrapper');
        });

        it('should return the view model', function() {
          productViewInstance.model = new ProductModel({
            id: 12345,
            name: 'foo'
          });

          var returnedProduct = productViewInstance.getProductReference($productWrapper);
          expect(returnedProduct).toEqual(productViewInstance.model.attributes);
        });
      });

      describe('when it is a member product', function() {
        var $productWrapper;

        beforeEach(function() {
          setFixtures('<article data-id="2222" data-member="true" class="b-product-wrapper"></article>');
          $productWrapper = $('.b-product-wrapper');
        });

        it('should be true', function() {
          expect(true).toBe(true);
        });

        it('should return the correct member product (w/o latchkeys)', function() {
          productViewInstance.model = new ProductModel({
            id: 12345,
            name: 'foo',
            members: [
              { id: 1111, name: 'foo' },
              { id: 2222, name: 'bar' },
              { id: 3333, name: 'baz' }
            ]
          });

          var returnedProduct = productViewInstance.getProductReference($productWrapper);
          expect(returnedProduct).toEqual(productViewInstance.model.attributes.members[1]);
        });

        it('should return `undefined` when member product ID mismatch (w/o latchkeys)', function() {
          productViewInstance.model = new ProductModel({
            id: 12345,
            name: 'foo',
            members: [
              { id: 4444, name: 'foo' },
              { id: 5555, name: 'bar' },
              { id: 6666, name: 'baz' }
            ]
          });

          var returnedProduct = productViewInstance.getProductReference($productWrapper);
          expect(returnedProduct).not.toBeDefined();
        });

        it('should return the correct member product containing the same latchkey', function() {
          productViewInstance.model = new ProductModel({
            id: 12345,
            name: 'foo',
            activeLatchkey: 999,
            members: [
              { id: 1111, name: 'foo' },
              { id: 2222, name: 'bar', latchkeyIds: [999] },
              { id: 3333, name: 'baz' }
            ]
          });

          var returnedProduct = productViewInstance.getProductReference($productWrapper);
          expect(returnedProduct).toEqual(productViewInstance.model.attributes.members[1]);
        });

        it('should return `undefined` when the member product does not contains the correct latchkey', function() {
          productViewInstance.model = new ProductModel({
            id: 12345,
            name: 'foo',
            activeLatchkey: 999,
            members: [
              { id: 1111, name: 'foo' },
              { id: 2222, name: 'bar', latchkeyIds: [888] },
              { id: 3333, name: 'baz' }
            ]
          });

          var returnedProduct = productViewInstance.getProductReference($productWrapper);
          expect(returnedProduct).not.toBeDefined();
        });
      });
    });

    describe('#addToBag', function() {
      var productInstance;
      var $productWrapper;
      var addToBagEvent;

      describe('When product is a master product', function() {

        beforeEach(function() {
          setFixtures('<article data-id="12345" data-member="false" class="b-product-wrapper"><button class="b-j-product-add-bag"></button></article>');
          $productWrapper = $('.b-product-wrapper');
          addToBagEvent = { currentTarget: $('.b-j-product-add-bag') };

          productInstance = new ProductModel({
            id: 12345,
            name: 'foo'
          });

          productViewInstance.subViews.addToBagView = new AddToBagView({});

          spyOn(productViewInstance, 'getProductReference').and.returnValue(productInstance);
          spyOn(productViewInstance, 'setActiveUpc');
        });

        afterEach(function() {
          addToBagEvent = null;
          productInstance = null;
        });

        describe('and showUPCValidationMessage returns TRUE', function() {

          beforeEach(function() {
            spyOn(productViewInstance, 'showUPCValidationMessage').and.returnValue(true);
          });

          it('should call `getProductReference` before passing the expected parameters', function() {
            productViewInstance.addToBag(addToBagEvent);

            expect(productViewInstance.getProductReference).toHaveBeenCalled();
            expect(productViewInstance.getProductReference.calls.mostRecent().args[0].attr('id')).toBe($productWrapper.attr('id'));
          });

          it('should call `setActiveUpc`', function() {
            productViewInstance.addToBag(addToBagEvent);

            expect(productViewInstance.setActiveUpc).toHaveBeenCalled();
          });

          it('should call `setActiveUpc` passing the expected parameters', function() {
            productViewInstance.addToBag(addToBagEvent);

            expect(productViewInstance.setActiveUpc.calls.mostRecent().args[0]).toBe(productInstance);
          });

          it('should call `showUPCValidationMessage`', function() {
            productViewInstance.addToBag(addToBagEvent);

            expect(productViewInstance.showUPCValidationMessage).toHaveBeenCalled();
          });

          it('should call `showUPCValidationMessage` passing the expected parameters', function() {
            productViewInstance.addToBag(addToBagEvent);

            expect(productViewInstance.showUPCValidationMessage).toHaveBeenCalled();
            expect(productViewInstance.showUPCValidationMessage.calls.mostRecent().args[0]).toBe(addToBagEvent);
            expect(productViewInstance.showUPCValidationMessage.calls.mostRecent().args[1].attr('id')).toBe($productWrapper.attr('id'));
            expect(productViewInstance.showUPCValidationMessage.calls.mostRecent().args[2]).toBe(productInstance);
          });

          it('should returns and not call `addToBagView.elementInDOM`', function() {
            spyOn(productViewInstance.subViews.addToBagView, 'elementInDOM');

            productViewInstance.addToBag(addToBagEvent);

            expect(productViewInstance.showUPCValidationMessage).toHaveBeenCalled();
            expect(productViewInstance.subViews.addToBagView.elementInDOM).not.toHaveBeenCalled();
          });
        });

        describe('when showUPCValidationMessage returns FALSE', function() {

          beforeEach(function() {
            productInstance.activeUpc = { upcKey: 'upc-key-123' };
            spyOn(productViewInstance, 'showUPCValidationMessage').and.returnValue(false);
          });

          describe('and the DOM does not contains the addToBag element', function() {

            beforeEach(function() {
              spyOn(productViewInstance.subViews.addToBagView, 'elementInDOM').and.returnValue(false);
            });

            it('should append the #b-atb-overlay in the DOM', function() {
              spyOn(productViewInstance.subViews.addToBagView, 'show');
              productViewInstance.addToBag(addToBagEvent);
              expect($('#b-atb-overlay').length).toBe(1);
            });
          });

          describe('and the DOM already contains the addToBag element', function() {

            beforeEach(function() {
              spyOn(productViewInstance.subViews.addToBagView, 'elementInDOM').and.returnValue(true);
            });

            it('should call `show` method on addToBag view', function() {
              spyOn(productViewInstance.subViews.addToBagView, 'show');
              productViewInstance.addToBag(addToBagEvent);
              expect(productViewInstance.subViews.addToBagView.show).toHaveBeenCalled();
            });

            it('should call `show` method on addToBag view passing the expected parameters', function() {
              spyOn(productViewInstance.subViews.addToBagView, 'show');
              productViewInstance.addToBag(addToBagEvent);
              expect(productViewInstance.subViews.addToBagView.show).toHaveBeenCalled();
              expect(productViewInstance.subViews.addToBagView.show.calls.mostRecent().args[0].attr('id')).toBe($productWrapper.attr('id'));
              expect(productViewInstance.subViews.addToBagView.show.calls.mostRecent().args[1]).toBe(productInstance);
            });
          });
        });
      });
    });

    describe('#addToRegistry', function() {
      var productInstance;
      var $productWrapper;
      var addToRegistryEvent;

      describe('When product is a master product', function() {

        beforeEach(function() {
          setFixtures('<article data-id="12345" data-member="false" class="b-product-wrapper"><button class="b-j-product-add-registry"></button></article>');
          $productWrapper = $('.b-product-wrapper');
          addToRegistryEvent = { currentTarget: $('.b-j-product-add-registry') };

          productInstance = new ProductModel({
            id: 12345,
            name: 'foo'
          });

          productViewInstance.subViews.addToRegistryView = new AddToRegistryView({});

          spyOn(productViewInstance, 'getProductReference').and.returnValue(productInstance);
          spyOn(productViewInstance, 'setActiveUpc');
        });

        afterEach(function() {
          addToRegistryEvent = null;
          productInstance = null;
        });

        describe('and showUPCValidationMessage returns TRUE', function() {

          beforeEach(function() {
            spyOn(productViewInstance, 'showUPCValidationMessage').and.returnValue(true);
          });

          it('should call `getProductReference` before passing the expected parameters', function() {
            productViewInstance.addToRegistry(addToRegistryEvent);

            expect(productViewInstance.getProductReference).toHaveBeenCalled();
            expect(productViewInstance.getProductReference.calls.mostRecent().args[0].attr('id')).toBe($productWrapper.attr('id'));
          });

          it('should call `setActiveUpc`', function() {
            productViewInstance.addToRegistry(addToRegistryEvent);

            expect(productViewInstance.setActiveUpc).toHaveBeenCalled();
          });

          it('should call `setActiveUpc` passing the expected parameters', function() {
            productViewInstance.addToRegistry(addToRegistryEvent);

            expect(productViewInstance.setActiveUpc.calls.mostRecent().args[0]).toBe(productInstance);
          });

          it('should call `showUPCValidationMessage`', function() {
            productViewInstance.addToRegistry(addToRegistryEvent);

            expect(productViewInstance.showUPCValidationMessage).toHaveBeenCalled();
          });

          it('should call `showUPCValidationMessage` passing the expected parameters', function() {
            productViewInstance.addToRegistry(addToRegistryEvent);

            expect(productViewInstance.showUPCValidationMessage).toHaveBeenCalled();
            expect(productViewInstance.showUPCValidationMessage.calls.mostRecent().args[0]).toBe(addToRegistryEvent);
            expect(productViewInstance.showUPCValidationMessage.calls.mostRecent().args[1].attr('id')).toBe($productWrapper.attr('id'));
            expect(productViewInstance.showUPCValidationMessage.calls.mostRecent().args[2]).toBe(productInstance);
          });

          it('should returns and not call `addToRegistryView.elementInDOM`', function() {
            spyOn(productViewInstance.subViews.addToRegistryView, 'elementInDOM');

            productViewInstance.addToRegistry(addToRegistryEvent);

            expect(productViewInstance.showUPCValidationMessage).toHaveBeenCalled();
            expect(productViewInstance.subViews.addToRegistryView.elementInDOM).not.toHaveBeenCalled();
          });
        });

        describe('and showUPCValidationMessage returns FALSE', function() {

          beforeEach(function() {
            spyOn(productViewInstance, 'showUPCValidationMessage').and.returnValue(false);
          });

          describe('and the DOM does not contains the addToRegistry element', function() {

            beforeEach(function() {
              spyOn(productViewInstance.subViews.addToRegistryView, 'elementInDOM').and.returnValue(false);
            });

            it('should append the #b-atr-overlay in the DOM', function() {
              spyOn(productViewInstance.subViews.addToRegistryView, 'show');
              productViewInstance.addToRegistry(addToRegistryEvent);
              expect($('#b-atr-overlay').length).toBe(1);
            });
          });

          describe('and the DOM already contains the addToRegistry element', function() {

            beforeEach(function() {
              spyOn(productViewInstance.subViews.addToRegistryView, 'elementInDOM').and.returnValue(true);
            });

            it('should call `show` method on addToRegistry view', function() {
              spyOn(productViewInstance.subViews.addToRegistryView, 'show');
              productViewInstance.addToRegistry(addToRegistryEvent);
              expect(productViewInstance.subViews.addToRegistryView.show).toHaveBeenCalled();
            });

            it('should call `show` method on addToRegistry view passing the expected parameters', function() {
              spyOn(productViewInstance.subViews.addToRegistryView, 'show');
              productViewInstance.addToRegistry(addToRegistryEvent);
              expect(productViewInstance.subViews.addToRegistryView.show).toHaveBeenCalled();
              expect(productViewInstance.subViews.addToRegistryView.show.calls.mostRecent().args[0].attr('id')).toBe($productWrapper.attr('id'));
              expect(productViewInstance.subViews.addToRegistryView.show.calls.mostRecent().args[1]).toBe(productInstance);
            });
          });
        });
      });
    });
  });
});
