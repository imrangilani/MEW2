define([
  'models/_bopsUpcModel'
], function(BopsUpcModel) {
  'use strict';

  describe('_bopsUpcModel', function() {

    describe('#init', function() {

      it('should have default `requestParams` values and `locationNumber` and `defaultZipCode`', function() {
        var bopsModel = new BopsUpcModel();
        expect(bopsModel.get('requestParams')).toBeDefined();
        expect(bopsModel.get('locationNumber')).toBeDefined();
        expect(bopsModel.get('defaultZipCode')).toBeDefined();
      });

      it('should have a url for fetching that contains the requestParams', function() {
        var bopsModel = new BopsUpcModel({
          id: 555,
          requestParams: {
            zipcode: 111111,
            city: 'New York',
            state: 'NY',
            distance: 5
          }
        });
        expect(bopsModel.url).toBeDefined();
        var fetchUrl = bopsModel.url();
        expect(fetchUrl).toMatch('zipcode');
        expect(fetchUrl).toMatch('city');
        expect(fetchUrl).toMatch('state');
        expect(fetchUrl).toMatch('distance');
      });
    });
  });
});
