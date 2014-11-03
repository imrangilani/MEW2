define([
  'util/_multiValueCookie'
], function(mvcookie) {
  'use strict';

  describe('_multiValueCookie', function() {
    $.removeCookie('MVCookie', { path: '/' });

    describe('#setCookieDomain', function() {
      afterEach(function() {
        mvcookie.setCookieDomain();
      });

      it('explicit setting domain as localhost should not change cookie api call domain ', function() {
        mvcookie.setCookieDomain('localhost');
        expect(mvcookie.getArgsDomain().domain).toBeUndefined();
      });

      it('setting host as www.macys.com should store cookie domain as macys.com', function() {
        mvcookie.setCookieDomain('www.macys.com');
        expect(mvcookie.getArgsDomain().domain).toEqual('macys.com');
      });

      it('setting host as m2qa1.qa20codemacys.fds.com should store cookie domain as qa20codemacys.fds.com', function() {
        mvcookie.setCookieDomain('m2qa1.qa20codemacys.fds.com');
        expect(mvcookie.getArgsDomain().domain).toEqual('qa20codemacys.fds.com');
      });

      it('setting host as macys.com should not store cookie domain', function() {
        mvcookie.setCookieDomain('macys.com');
        expect(mvcookie.getArgsDomain().domain).toBeUndefined();
      });

      it('setting host as IP address should store cookie domain as that IP address', function() {
        mvcookie.setCookieDomain('11.22.123.234');
        expect(mvcookie.getArgsDomain().domain).toEqual('11.22.123.234');
      });
    });

    describe('#set', function() {

      beforeEach(function() {
        $.cookie('MVCookie',
          'FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_FurnitureDeliveryZipOptOut1_92_false',
          { path: '/' });
      });

      it('should update the value of subcookie when it\'s in the beginning of the mv cookie', function() {
        mvcookie.set('FurnitureDeliveryZip', '99999', 'MVCookie');
        var cookie = $.cookie('MVCookie');
        expect(cookie)
          .toEqual('FurnitureDeliveryZip1_92_999993_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_FurnitureDeliveryZipOptOut1_92_false');
      });

      it('should update the value of subcookie when it\'s in the middle of the mv cookie', function() {
        mvcookie.set('ProfileZip', '99999', 'MVCookie');
        expect($.cookie('MVCookie'))
          .toEqual('FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_999993_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_FurnitureDeliveryZipOptOut1_92_false');
      });

      it('should update the value of subcookie when it\'s in the end of the mv cookie', function() {
        mvcookie.set('FurnitureDeliveryZipOptOut', 'true', 'MVCookie');
        expect($.cookie('MVCookie'))
          .toEqual('FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_FurnitureDeliveryZipOptOut1_92_true');
      });

      it('should add a new cookie to a multi-value cookie', function() {
        mvcookie.set('XXXXX', '12345', 'MVCookie');
        expect($.cookie('MVCookie'))
          .toEqual('FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_FurnitureDeliveryZipOptOut1_92_false3_87_XXXXX1_92_12345');
      });
    });

    describe('#get', function() {

      beforeEach(function() {
        $.cookie('MVCookie',
          'FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_EmptyValue1_92_3_87_FurnitureDeliveryZipOptOut1_92_false',
          { path: '/' });
      });

      it('should get the value of subcookie when it\'s in the beginning of the mv cookie', function() {
        expect(mvcookie.get('FurnitureDeliveryZip', 'MVCookie')).toEqual('94103');
      });

      it('should get the value of subcookie when it\'s in the middle of the mv cookie', function() {
        expect(mvcookie.get('FurnitureSampleZip', 'MVCookie')).toEqual('94605');
      });

      it('should get the value of subcookie when it\'s in the end of the mv cookie', function() {
        expect(mvcookie.get('FurnitureDeliveryZipOptOut', 'MVCookie')).toEqual('false');
      });

      it('should get the value of subcookie when it\'s empty string', function() {
        expect(mvcookie.get('EmptyValue', 'MVCookie')).toEqual('');
      });

      it('should return undefined when getting the value of subcookie which doesn\'t exist', function() {
        expect(mvcookie.get('XXXX', 'MVCookie')).toBeUndefined();
      });

    });

    describe('#remove', function() {

      beforeEach(function() {
        $.cookie('MVCookie',
          'FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_EmptyValue1_92_3_87_FurnitureDeliveryZipOptOut1_92_false',
          { path: '/' });
      });

      it('should remove the value of subcookie when it\'s in the beginning of the mv cookie', function() {
        mvcookie.remove('FurnitureDeliveryZip', 'MVCookie');
        expect($.cookie('MVCookie')).toEqual('ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_EmptyValue1_92_3_87_FurnitureDeliveryZipOptOut1_92_false');
      });

      it('should remove the value of subcookie when it\'s in the middle of the mv cookie', function() {
        mvcookie.remove('ProfileZip', 'MVCookie');
        expect($.cookie('MVCookie')).toEqual('FurnitureDeliveryZip1_92_941033_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_EmptyValue1_92_3_87_FurnitureDeliveryZipOptOut1_92_false');
      });

      it('should remove the value of subcookie when it\'s in the end of the mv cookie', function() {
        mvcookie.remove('FurnitureDeliveryZipOptOut', 'MVCookie');
        expect($.cookie('MVCookie')).toEqual('FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_EmptyValue1_92_');
      });

      it('should remove the value of subcookie when it\'s empty string', function() {
        mvcookie.remove('EmptyValue', 'MVCookie');
        expect($.cookie('MVCookie'))
          .toEqual('FurnitureDeliveryZip1_92_941033_87_ProfileZip1_92_946053_87_FurnitureSampleZip1_92_946053_87_InStoreZip1_92_946053_87_FurnitureDeliveryZipOptOut1_92_false');
      });

    });

    $.removeCookie('MVCookie', { path: '/' });
  });
});
