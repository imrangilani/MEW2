define([
  'jasmineHelpers',
  'views/_addToBagView',
  'util/_multiValueCookie'
], function(jasmineHelpers, AddToBagView, mvCookie) {
  'use strict';

  describe('_addToBagView', function() {
    var addToBagViewInstance;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
      App.config.cookies = { onlineUid: 1 };

      addToBagViewInstance = new AddToBagView();
    });

    describe('#init', function() {

      it('should instantiate the `AddToBagModel`', function() {
        addToBagViewInstance.init();
        expect(addToBagViewInstance.model).toBeDefined();
      });

      it('should render on `modelready`', function() {
        spyOn(addToBagViewInstance, 'listenTo');
        addToBagViewInstance.init();
        expect(addToBagViewInstance.listenTo).toHaveBeenCalledWith(
          addToBagViewInstance.model, 'modelready', addToBagViewInstance.render
        );
      });

      it('should renderError on `modelreadyerror`', function() {
        spyOn(addToBagViewInstance, 'listenTo');
        addToBagViewInstance.init();
        expect(addToBagViewInstance.listenTo).toHaveBeenCalledWith(
          addToBagViewInstance.model, 'modelreadyerror', addToBagViewInstance.renderError
        );
      });
    });

    describe('#setUserIdIfNotRegistered', function() {

      it('should set the `onlineUid` for the current `userid`', function() {
        addToBagViewInstance.model.set('registered', false);
        addToBagViewInstance.model.set('userid', App.config.cookies.onlineUid);
        spyOn(mvCookie, 'set');
        addToBagViewInstance.setUserIdIfNotRegistered();
        expect(mvCookie.set).toHaveBeenCalledWith(1, 1);
      });
    });

    describe('#show', function() {
      var product;

      beforeEach(function() {
        spyOn(addToBagViewInstance.model, 'addToBag');
        spyOn(addToBagViewInstance.model, 'updateBag');

        product = {
          activeQty: 1,
          activeUpc: {
            upcKey: 'foo'
          },
          upcs: {
            foo: { upcid: 1 }
          },
          requestParams: {
            seqno: 1
          }
        };
      });

      it('should define the product', function() {
        addToBagViewInstance.show(product);
        expect(addToBagViewInstance.model.product).toEqual(product);
      });

      it('should add the product to the bag', function() {
        spyOn(mvCookie, 'get').and.returnValue(1);

        addToBagViewInstance.show(product);

        expect(addToBagViewInstance.model.addToBag).toHaveBeenCalledWith({
          quantity: product.activeQty,
          upcid: product.upcs.foo.upcid,
          userid: 1,
          trackingInfo: '',
          trackingCategory: ''
        });
      });

      it('should update the product in the bag', function() {
        spyOn(mvCookie, 'get').and.returnValue(1);

        addToBagViewInstance.show(product, 'PDPUPDATE');

        expect(addToBagViewInstance.model.updateBag).toHaveBeenCalledWith({
          quantity: product.activeQty,
          upcid: product.upcs.foo.upcid,
          userid: 1,
          itemseq: product.requestParams.seqno,
          trackingInfo: '',
          trackingCategory: ''
        });
      });
    });

    describe('#renderTemplate', function() {

      it('should do nothing if `showModelErrorMessage` is true', function() {
        spyOn(addToBagViewInstance, 'showModelErrorMessage').and.returnValue(true);
        var result = addToBagViewInstance.renderTemplate();
        expect(result).toBeUndefined();
      });

      describe('when there is no error messages', function() {

        beforeEach(function() {
          spyOn(addToBagViewInstance, 'showModelErrorMessage').and.returnValue(false);
          spyOn(addToBagViewInstance, 'setUserIdIfNotRegistered');
          spyOn(addToBagViewInstance, 'updateBagCount');
          spyOn(addToBagViewInstance, 'getViewModel');
          spyOn(TEMPLATE, 'addToBag');
          addToBagViewInstance.renderTemplate();
        });

        it('should set the user id if not registered', function() {
          expect(addToBagViewInstance.setUserIdIfNotRegistered).toHaveBeenCalled();
        });

        it('should update the bag count', function() {
          expect(addToBagViewInstance.updateBagCount).toHaveBeenCalled();
        });

        it('should get the `viewModel`', function() {
          expect(addToBagViewInstance.getViewModel).toHaveBeenCalled();
        });

        it('should create the TEMPLATE', function() {
          expect(TEMPLATE.addToBag).toHaveBeenCalled();
        });
      });
    });

    describe('#postRender', function() {

      it('should do nothing if the model has errors', function() {
        spyOn(addToBagViewInstance, 'hasModelError').and.returnValue(true);
        var result = addToBagViewInstance.postRender();
        expect(result).toBeUndefined();
      });
    });

    describe('#hasModelError', function() {

      it('should return if model has no errors', function() {
        spyOn(addToBagViewInstance.model, 'get').and.returnValue(false);
        var result = addToBagViewInstance.hasModelError();
        expect(result).toBeTruthy();
      });

      it('should return if model has errors', function() {
        spyOn(addToBagViewInstance.model, 'get').and.returnValue(true);
        var result = addToBagViewInstance.hasModelError();
        expect(result).toBeFalsy();
      });
    });

    describe('#showModelErrorMessage', function() {

      it('should do nothing if model has no errors', function() {
        spyOn(addToBagViewInstance, 'hasModelError').and.returnValue(false);
        var result = addToBagViewInstance.showModelErrorMessage();
        expect(result).toBeFalsy();
      });

      describe('when there is errors', function() {

        beforeEach(function() {
          spyOn(addToBagViewInstance, 'hasModelError').and.returnValue(true);
          spyOn(addToBagViewInstance.model, 'get').and.returnValue('foo');
          spyOn(addToBagViewInstance, 'showMessage');
        });

        it('should get the error message', function() {
          addToBagViewInstance.showModelErrorMessage();
          expect(addToBagViewInstance.model.get).toHaveBeenCalled();
        });

        it('should call `showMessage` passing the model `errorMessage`', function() {
          addToBagViewInstance.showModelErrorMessage();
          expect(addToBagViewInstance.showMessage).toHaveBeenCalledWith('foo');
        });
      });
    });

    describe('#renderError', function() {

      it('should call showMessage passing the model `errorMessage`', function() {
        spyOn(addToBagViewInstance, 'showMessage');
        addToBagViewInstance.model.set('errorMessage', 'Model error message');
        addToBagViewInstance.renderError();
        expect(addToBagViewInstance.showMessage).toHaveBeenCalledWith('Model error message');
      });
    });

    describe('#updateBagCount', function() {

      it('should throw an error if bag has not total', function() {
        spyOn(addToBagViewInstance.model, 'get').and.returnValue({});
        expect(function() {
          addToBagViewInstance.updateBagCount();
        }).toThrow();
      });

      describe('when have a total', function() {
        beforeEach(function() {
          spyOn(addToBagViewInstance.model, 'get').and.returnValue({ totalquantity: 1 });
        });

        it('should get the shoppingbag', function() {
          addToBagViewInstance.updateBagCount();
          expect(addToBagViewInstance.model.get).toHaveBeenCalledWith('shoppingbag');
        });

        it('should set the cookie for the total quantity of items', function() {
          spyOn(mvCookie, 'set');
          addToBagViewInstance.updateBagCount();
          expect(mvCookie.set).toHaveBeenCalledWith('CartItem', 1, 'GCs');
        });

        it('should trigger the `bagItemCountUpdate` event', function() {
          spyOn(Backbone, 'trigger');
          addToBagViewInstance.updateBagCount();
          expect(Backbone.trigger).toHaveBeenCalledWith('bagItemCountUpdate');
        });
      });
    });
  });
});
