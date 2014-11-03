define([
	'models/_addToRegistryModel'
], function(AddToRegistryModel) {
	'use strict';

	describe('_addToRegsitryModel', function() {
		// setup here
		var addToRegistryModelInstance;
		var	model;

		// share the scope
		beforeEach(function() {
			addToRegistryModelInstance = new AddToRegistryModel();
			model = new Backbone.Model({});
		});

		describe('#urlRoot', function() {

			it('should have the correct `urlRoot`', function() {
				expect(addToRegistryModelInstance.urlRoot).toBe('/wedding-registry/addtoregistry');
			});
		});

		describe('#url', function() {

			it('should return the `urlRoot`', function() {
				var expected = addToRegistryModelInstance.url();
				expect(expected).toBe(addToRegistryModelInstance.urlRoot);
			});
		});

    describe('#addToRegistry', function() {

      beforeEach(function() {
        spyOn(addToRegistryModelInstance, 'save');
      });

      it('should throw an error if `toAddItem` is not defined', function() {
        expect(function() {
          addToRegistryModelInstance.addToRegistry();
        }).toThrow();
      });

      it('should throw an error if `toAddItem` is defined without required properties', function() {
        expect(function() {
          addToRegistryModelInstance.addToRegistry({ productId: '123', quantity: '123', size: 'L', type: 'Left' });
        }).toThrow();
        expect(function() {
          addToRegistryModelInstance.addToRegistry({ color: 'blue',  quantity: '123', size: 'L', type: 'Left' });
        }).toThrow();
        expect(function() {
          addToRegistryModelInstance.addToRegistry({ color: 'blue', productId: '123',  size: 'L', type: 'Left' });
        }).toThrow();
        expect(function() {
          addToRegistryModelInstance.addToRegistry({ color: 'blue', productId: '123', quantity: '123',  type: 'Left' });
        }).toThrow();
        expect(function() {
          addToRegistryModelInstance.addToRegistry({ color: 'blue', productId: '123', quantity: '123', size: 'L' });
        }).toThrow();
      });

      it('should clear', function() {
        spyOn(addToRegistryModelInstance, 'clear');
        addToRegistryModelInstance.addToRegistry({ color: 'blue', productId: '123', quantity: '123', size: 'L', type: 'Left' });
        expect(addToRegistryModelInstance.clear).toHaveBeenCalled();
      });
    });

		describe('#success', function() {
			it('should trigger the `modelready` event', function() {
				spyOn(model, 'trigger');
				addToRegistryModelInstance.success(model);
				expect(model.trigger).toHaveBeenCalledWith('modelready');
			});
		});
  });
});
