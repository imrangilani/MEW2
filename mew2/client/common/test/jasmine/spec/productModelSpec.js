define([
  'models/_productModel'
], function(ProductModel) {
  'use strict';

  describe('_productModel', function() {
    var productModelInstance;

    beforeEach(function() {
      productModelInstance = new ProductModel({
        requestParams: {
          productId: 100
        }
      });
    });

    describe('#url', function() {
      it('should use the `urlRoot` and `productID`', function() {
        expect(productModelInstance.url()).toBe('/api/v4/catalog/product/100?viewType=pdp');
      });
    });

    describe('#parse', function() {
      describe('non-master products', function() {
        it('should return response', function() {
          var response = { foo: 'bar', isMaster: false };
          expect(productModelInstance.parse(response)).toEqual(response);
        });
      });

      describe('master products', function() {
        it('should call `_duplicateMultiLatchkeyMembers` with the response', function() {
          var response = { foo: 'bar', isMaster: true };
          spyOn(productModelInstance, '_duplicateMultiLatchkeyMembers');
          productModelInstance.parse(response);
          expect(productModelInstance._duplicateMultiLatchkeyMembers).toHaveBeenCalledWith(response);
        });
      });
    });

    describe('#_duplicateMultiLatchkeyMembers', function() {
      describe('if 1 or fewer latcheyIds, or if latchkeyIds is undefined', function() {
        it('should return the same number of members that were passed in', function() {
          var response = { members: [{ latchkeyIds: [123] }] };
          var result = productModelInstance._duplicateMultiLatchkeyMembers(response);
          expect(result.members.length).toBe(1);
        });
      });

      describe('if 2 or more latchkeyIds', function() {
        it('should return a member for each unique `latchkeyId` for members that were passed in', function() {
          var response = { members: [{ latchkeyIds: [123, 234] }] };
          var result = productModelInstance._duplicateMultiLatchkeyMembers(response);
          expect(result.members.length).toBe(2);

          _.each(result.members, function(member, idx) {
            expect(member.latchkeyIds[0]).toBe(response.members[idx].latchkeyIds[0]);
          });
        });
      });
    });

    describe('#getCategoryId', function() {
      it('should return the categoryId if it`s not set on the url', function() {
        productModelInstance.set('activeCategory', '123')
        expect(productModelInstance.getCategoryId()).toBe('123');
      });
    });

  });
});
