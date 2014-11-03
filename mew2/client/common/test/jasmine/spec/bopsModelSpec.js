define([
  'models/_bopsModel'
], function(BopsModel) {
  'use strict';

  describe('_bopsModel', function() {

    describe('#init', function() {

      it('should have a default `id` value', function() {
        var bopsModel = new BopsModel();
        expect(bopsModel.get('id')).toBeDefined();
      });
    });
  });
});
