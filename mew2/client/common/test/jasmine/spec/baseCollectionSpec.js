define([
  'collections/_baseCollection'
], function(BaseCollection) {
  'use strict';

  describe('_baseCollection', function() {

    describe('#fetch', function() {
      var baseCollectionInstance;

      beforeEach(function() {
        baseCollectionInstance = new BaseCollection();

        spyOn(Backbone.Collection.prototype.fetch, 'call');
      });

      it('should set default timeout', function() {
        baseCollectionInstance.fetch();
        expect(Backbone.Collection.prototype.fetch.call.calls.mostRecent().args[1]).toEqual({
          timeout: 2e5
        });
      });

      it('should be configurable', function() {
        baseCollectionInstance.fetch({ timeout: 1e3 });
        expect(Backbone.Collection.prototype.fetch.call.calls.mostRecent().args[1]).toEqual({
          timeout: 1e3
        });
      });
    });
  });
});
