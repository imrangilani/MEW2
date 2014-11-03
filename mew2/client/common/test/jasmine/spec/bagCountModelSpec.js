define([
  'backbone',
  'models/_bagCountModel'
], function(Backbone, BagCountModel) {
  'use strict';

  describe('_bagCountModel', function() {
    var bagCountModelInstance;

    // share the scope
    beforeEach(function() {
      bagCountModelInstance = new BagCountModel();
    });

    describe('#urlRoot', function() {
      it('should have the correct `urlRoot`', function() {
        expect(bagCountModelInstance.urlRoot).toBe('/api/v2/shoppingbag/bagItemCount');
      });
    });

    describe('#url', function() {
      it('should contain either a bagid or a userid param', function() {
        bagCountModelInstance.set('userId', 'myUserId');
        var expected = bagCountModelInstance.url();
        expect(expected).toEqual('/api/v2/shoppingbag/bagItemCount?userid=myUserId');
      });
    });

    describe('setBagCount', function() {
      it('should change the item count and trigger this change for interested listeners', function() {
        spyOn(bagCountModelInstance, 'set');
        bagCountModelInstance.attributes.shoppingbag = { bagItemsCount: 5 };

        bagCountModelInstance.setBagCount();
        expect(bagCountModelInstance.set).toHaveBeenCalledWith('bagItemsCount', 5);
      });
    });
  });
});
