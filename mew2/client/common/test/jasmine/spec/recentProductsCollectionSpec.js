define([
  'jasmineHelpers',
  'collections/_recentProductsCollection'
], function(jasmineHelpers, RecentProductsCollection) {
  'use strict';

  describe('_recentProductsCollection', function() {
    var recentProductsCollection, modelAttributesMock, modelAttributesMock2,
        modelAttributesMock3;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
      App.config.pdp = { recentlyViewedCount: 10 };

      modelAttributesMock = {
        id: 1439335,
        activeImageset: 1292238,
        name: 'Ray-Ban Sunglasses, RB4179',
        productUrl: '/shop/product/ray-ban-sunglasses-rb4179?ID=1439335&CategoryID=58128',
        images: { 1292238: [{ image: '.tif' }] },
        prices: [{ amt: '$219.95' }]
      };

      recentProductsCollection = new RecentProductsCollection();
      recentProductsCollection.reset();
    });

    describe('#initialize', function() {
      it('should bind events', function() {
        expect(recentProductsCollection._events.add[0].callback).toEqual(recentProductsCollection._addProductModel);
      });

      it('should listen for sync', function() {
        spyOn(recentProductsCollection, 'on').and.callThrough();
        spyOn(recentProductsCollection, 'trigger');
        recentProductsCollection.fetch();
        expect(recentProductsCollection.trigger).toHaveBeenCalledWith('dataRefresh');
      });

      it('should read productids from cookies', function() {
        expect(recentProductsCollection.readCookie()).toEqual(jasmine.any(Object));
      });
    });

    describe('#triggerDataRefresh', function() {
      it('should trigger the data refresh', function() {
        spyOn(recentProductsCollection, 'trigger');
        recentProductsCollection.triggerDataRefresh();
        expect(recentProductsCollection.trigger).toHaveBeenCalledWith('dataRefresh');
      });
    });

    describe('#url', function() {
      it('should set the server url based on ProductModel\'s urlRoot', function() {
        recentProductsCollection.expired = [1439335];
        expect(recentProductsCollection.url()).toEqual('/api/v4/catalog/product/1439335?viewType=recentlyViewed');
      });
    });

    describe('#prepend', function() {
      it('should move product to the beginning', function() {
        modelAttributesMock2 = {
          id: 1438242
        };
        modelAttributesMock3 = { id: 676941 };
        recentProductsCollection.add(modelAttributesMock2);
        recentProductsCollection.add(modelAttributesMock3);
        recentProductsCollection.prepend(modelAttributesMock);
        recentProductsCollection.prepend(modelAttributesMock);
        expect(recentProductsCollection.at(0).id).toBe(1439335);
      });
    });

    describe('#remove', function() {
      it('remove the product and update the cookies', function() {
        recentProductsCollection.add(modelAttributesMock);
        recentProductsCollection.remove(modelAttributesMock.id);
        expect(recentProductsCollection.models.length).toBe(0);
      });
    });

    describe('#hasId', function() {
      it('should return true if product id exists', function() {
        recentProductsCollection.add(modelAttributesMock);
        expect(recentProductsCollection.hasId(1439335)).toBeTruthy();
      });
    });
  });
});
