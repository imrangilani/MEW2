define([
  'util/_dataMap'
], function(DataMap) {
  'use strict';

  describe('_dataMap', function() {

    describe('#toWssg', function() {

      it('should map a string url param key to a wssg key', function() {
        var dataMapInstance = new DataMap({
          key1: 'mappedKey1'
        });
        expect(dataMapInstance.toWssg({ key1: 'val1' })).toEqual({ mappedKey1: 'val1' });
      });

      it('should call the toWssg method of the map to perform a more complex mapping', function() {
        var map = {
          key2: {
            toWssg: function() {}
          }
        };
        spyOn(map.key2, 'toWssg');
        var dataMapInstance = new DataMap(map);
        dataMapInstance.toWssg({ key2: 'val2' });
        expect(map.key2.toWssg).toHaveBeenCalledWith('val2');
      });

      it('should leave unmapped keys untouched', function() {
        var dataMapInstance = new DataMap({
          key2: 'mappedKey1'
        });
        expect(dataMapInstance.toWssg({ key1: 'val1' })).toEqual({ key1: 'val1' });
      });
    });

    describe('#fromWssg', function() {

      it('should map a wssg key to a string url param key', function() {
        var dataMapInstance = new DataMap({
          key1: 'mappedKey1'
        });
        expect(dataMapInstance.fromWssg({ mappedKey1: 'val1' })).toEqual({ key1: 'val1' });
      });

      it('should call the fromWssg method of the map to perform a more complex mapping', function() {
        var map = {
          key2: {
            fromWssg: function() {}
          }
        };
        spyOn(map.key2, 'fromWssg');
        var dataMapInstance = new DataMap(map);
        var data = { key2: 'val2' };
        dataMapInstance.fromWssg(data);
        expect(map.key2.fromWssg).toHaveBeenCalledWith('val2', data);
      });

      it('should leave unmapped keys untouched', function() {
        var dataMapInstance = new DataMap({
          key2: 'mapping'
        });
        expect(dataMapInstance.fromWssg({ mappedKey1: 'val1' })).toEqual({ mappedKey1: 'val1' });
      });

      it('should remove wssgKeys from the data', function() {
        var dataMapInstance = new DataMap({
          wssgKeys: ['testWssgkey'],
          key2: 'mapping'
        });
        expect(dataMapInstance.fromWssg({ mappedKey1: 'val1', testWssgkey: 'testval' })).toEqual({ mappedKey1: 'val1' });
      });
    });
  });
});
