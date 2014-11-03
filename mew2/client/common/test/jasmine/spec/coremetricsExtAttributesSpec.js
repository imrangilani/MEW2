define([
  'underscore',
  'helpers/coremetricsExtAttributes'
], function(_, ExtAttributes) {
  'use strict';

  describe('coremetricsExtAttributes', function () {

    describe('#createAttribtuesString', function() {
      var extAttributes;

      beforeEach(function () {
        extAttributes = new ExtAttributes();
      });

      afterEach( function(){
        extAttributes = null;
      });

      it('should add attribute in position 1', function () {
        extAttributes.addAttribute(1, 'aaa');
        expect(extAttributes.createAttributesString()).toEqual('aaa');
      });

      it('should add attribute in positions 1 and 10', function () {
        extAttributes.addAttribute(1, 'aaa');
        extAttributes.addAttribute(10, 'bbb');

        expect(extAttributes.createAttributesString()).toEqual('aaa-_--_--_--_--_--_--_--_--_-bbb');
      });
    });
  });
});
