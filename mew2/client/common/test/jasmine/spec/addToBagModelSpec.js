define([
	'models/_addToBagModel'
], function(AddToBagModel) {
	'use strict';

	describe('_addToBagModel', function() {
		var addToBagModelInstance;
		var	model;

		// share the scope
		beforeEach(function() {
			addToBagModelInstance = new AddToBagModel();
			model = new Backbone.Model({});
		});

		describe('#urlRoot', function() {

			it('should have the correct `urlRoot`', function() {
				expect(addToBagModelInstance.urlRoot).toBe('/api/v2/shoppingbag/item');
			});
		});

		describe('#url', function() {

			it('should return the `urlRoot`', function() {
				var expected = addToBagModelInstance.url();
				expect(expected).toBe(addToBagModelInstance.urlRoot);
			});
		});

    describe('#addToBag', function() {

      beforeEach(function() {
        spyOn(addToBagModelInstance, 'save');
      });

      it('should throw an error if `toAddItem` is not defined', function() {
        expect(function() {
          addToBagModelInstance.addToBag();
        }).toThrow();
      });

      it('should clear', function() {
        spyOn(addToBagModelInstance, 'clear');
        addToBagModelInstance.addToBag({ userid: 1 });
        expect(addToBagModelInstance.clear).toHaveBeenCalled();
      });

      it('should persist the item in the server', function() {
        addToBagModelInstance.addToBag({ userid: 1 });
        expect(addToBagModelInstance.save.calls.mostRecent().args[0])
          .toEqual({ additemsrequest: { userid: 1, showBag: true }});
      });

      it('should create an `userid` for the `toAddItem`', function() {
        addToBagModelInstance.addToBag({});
        expect(addToBagModelInstance.save.calls.mostRecent().args[0])
          .toEqual({ additemsrequest: { showBag: true }});
      });
    });

		describe('#success', function() {

			it('should trigger the `modelready` event', function() {
				spyOn(model, 'trigger');
				addToBagModelInstance.success(model);
				expect(model.trigger).toHaveBeenCalledWith('modelready');
			});
		});

    describe('#error', function() {

      it('should trigger the `modelreadyerror` event', function() {
        spyOn(model, 'trigger');
        addToBagModelInstance.error(model, { status: '', statusText: '' });
        expect(model.trigger).toHaveBeenCalledWith('modelreadyerror');
      });

      it('should set the `errorMessage` attribute', function() {
        spyOn(model, 'set').and.callThrough();
        spyOn(model, 'trigger');
        addToBagModelInstance.error(model, { errorMessage: 'error' });
        expect(model.set).toHaveBeenCalledWith('errorMessage', window.jasmine.any(String));
        expect(model.get('errorMessage')).toBeTruthy();
      });
    });
	});
});
