define([
  'util/_url'
], function(url) {
  'use strict';

    describe('_url', function() {

      describe('#getMenuIdFromUrl', function() {

        it('should return the menuId based on the url', function() {
          var sampleURL = '/shop/womens-clothing/womens-clothing?id=22006';
          expect(url.getMenuIdFromUrl(sampleURL)).toBe('22006');
        });
      });
    });
});
