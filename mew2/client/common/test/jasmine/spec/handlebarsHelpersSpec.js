define([
  'handlebars'
], function(Handlebars) {
  'use strict';

  describe('handlebarsHelpers', function() {

    describe('#eachSortedBy', function() {
      var array,
          commaConcatFn = function(value) {
            return value.name + ',';
          };

      beforeEach(function() {
        array = [
          { name: 'zzz' },
          { name: 'bbb' },
          { name: 'aaa' },
          { name: 'ccc' },
          { name: 'ddd' }
        ];
      });

      it('should be defined', function() {
        expect(Handlebars.helpers.eachSortedBy).toBeDefined();
      });

      it('should sort an array of elements according to the provided key', function() {
        var result = Handlebars.helpers.eachSortedBy(array, {
          hash: {
            key: 'name'
          },
          fn: commaConcatFn
        });
        expect(result).toEqual('aaa,bbb,ccc,ddd,zzz,');
      });

      it('should not change the order in case no key is specified or it does not exist', function() {
        var result = Handlebars.helpers.eachSortedBy(array, {
          hash: {
            key: 'does_not_exist'
          },
          fn: commaConcatFn
        });
        expect(result).toEqual('zzz,bbb,aaa,ccc,ddd,');
      });
    });
  });
});
