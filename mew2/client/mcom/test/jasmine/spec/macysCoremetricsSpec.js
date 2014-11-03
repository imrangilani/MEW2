define([
  'util/util',
  'analytics/analyticsListener',
  'analytics/macysCoremetrics',
  'analytics/analyticsData'
], function(util, analyticsListener, macysCoremetrics) {
  'use strict';

  describe('macysCoremetrics', function() {

    describe('#initialize', function() {

      it('should initialize mobile prefix MEW_', function() {
        macysCoremetrics.initialize();

        expect(macysCoremetrics.prefix).toBe('MEW_');
      });
    });

    describe('#cmCreatePageviewTag', function() {

      it('should call coremetrics cmCreatePageviewTag when mcmCreatePageviewTag is invoked', function() {
        spyOn(window, 'cmCreatePageviewTag');

        macysCoremetrics.mcmCreatePageviewTag('pageId_zzz', 'categoryId_zzz', 'searchStr_zzz', 'searchResults_zzz', 'attributes_zzz');

        expect(window.cmCreatePageviewTag).toHaveBeenCalled();//('MEW_pageId_zzz', 'MEW_caregoryId_zzz', 'searchStr_zzz', 'searchResults_zzz', '', '', '', '', '', '', '', 'attributes_zzz');
      });
    });

    describe('#cmCreateProductviewTag', function() {

      it('should call coremetrics cmCreateProductviewTag when mcmCreateProductviewTag is invoked', function() {
        macysCoremetrics.initialize();
        spyOn(window, 'cmCreateProductviewTag');

        macysCoremetrics.mcmCreateProductviewTag('productId_zzz', 'productName_zzz', 'categoryId_zzz', 'attributes_zzz');

        expect(window.cmCreateProductviewTag).toHaveBeenCalledWith('productId_zzz', 'productName_zzz', 'MEW_categoryId_zzz', '','','','','','','', null,null,null,null,null, 'attributes_zzz');
      });
    });

    describe('#cmCreateTechPropsTag', function() {

      it('should call coremetrics cmCreateTechPropsTag when mcmCreateTechPropsTag is invoked', function() {
        spyOn(window, 'cmCreateTechPropsTag');

        macysCoremetrics.mcmCreateTechPropsTag('pageId_zzz', 'categoryId_zzz', 'attributes_zzz');

        expect(window.cmCreateTechPropsTag).toHaveBeenCalled();//With('MEW_pageId_zzz', 'MEW_caregoryId_zzz', '', '', '', '', '', '', '', 'attributes_zzz');
      });
    });

    describe('#cmCreatePageElementTag', function() {

      it('should call coremetrics cmCreatePageElementTag when mcmCreatePageElementTag is invoked', function() {
        spyOn(window, 'cmCreatePageElementTag');

        macysCoremetrics.mcmCreatePageElementTag('elementId_zzz', 'elementCategory_zzz', 'attributes_zzz');

        expect(window.cmCreatePageElementTag).toHaveBeenCalledWith('elementId_zzz', 'MEW_elementCategory_zzz', 'attributes_zzz');
      });
    });

    describe('#cmCreateManualLinkClickTag', function() {

      it('should call coremetrics  cmCreateManualLinkClickTag when mcmCreateManualLinkClickTag is invoked', function() {
        spyOn(window, 'cmCreateManualLinkClickTag');

        macysCoremetrics.mcmCreateManualLinkClickTag('href_zzz', 'pageId_zzz');

        expect(window.cmCreateManualLinkClickTag).toHaveBeenCalledWith('href_zzz', null, 'MEW_pageId_zzz');
      });
    });

    describe('#cmCreateConversionEventTag', function() {

      it('should call coremetrics cmCreateConversionEventTag when mcmCreateConversionEventTag is invoked', function() {
        spyOn(window, 'cmCreateConversionEventTag');

        macysCoremetrics.mcmCreateConversionEventTag('eventId_zzz', 'actionType_zzz', 'categoryId_zzz', 3, 'attributes_zzz');

        expect(window.cmCreateConversionEventTag).toHaveBeenCalledWith('eventId_zzz', 'actionType_zzz', 'MEW_categoryId_zzz', 3, 'attributes_zzz', null);
      });
    });

    describe('#cmCreateConversionEventTag', function() {

      it('should call coremetrics cmCreateShopAction5Tag when mcmCreateShopAction5Tag is invoked', function() {
        spyOn(window, 'cmCreateShopAction5Tag');

        macysCoremetrics.mcmCreateShopAction5Tag('productID', 'productName', 'productQuantity', 'productPrice', 'categoryID', '', 'attrs');

        expect(window.cmCreateShopAction5Tag).toHaveBeenCalledWith('productID', 'productName', 'productQuantity', 'productPrice', 'MEW_categoryID', '', '', '', '', '', 'attrs');
      });
    });
  });

  describe('uses correct query parameter names to get values for T) DO get names parameters', function() {

    it('returns whatever parseLocationQueryParameter returns for PARTNERID parameter', function() {

      spyOn(util.url, 'parseLocationQueryParameter').and.returnValue('PARTNERIDVALUE');
      var ret = macysCoremetrics.getMMCVendor();
      expect(util.url.parseLocationQueryParameter).toHaveBeenCalledWith('PARTNERID');
      expect(ret).toBe('PARTNERIDVALUE');
    });

    it('returns whatever parseLocationQueryParameter returns for  BANNERID', function() {
      spyOn(util.url, 'parseLocationQueryParameter').and.returnValue('BANNERIDVALUE');
      var ret = macysCoremetrics.getMMCPlacement();
      expect(util.url.parseLocationQueryParameter).toHaveBeenCalledWith('BANNERID');
      expect(ret).toBe('BANNERIDVALUE');
    });

    it('returns whatever parseLocationQueryParameter returns for TRACKINGCAT parameter', function() {
      spyOn(util.url, 'parseLocationQueryParameter').and.returnValue('TRACKINGCATVALUE');
      var ret = macysCoremetrics.getMMCCategory();
      expect(util.url.parseLocationQueryParameter).toHaveBeenCalledWith('TRACKINGCAT');
      expect(ret).toBe('TRACKINGCATVALUE');
    });

    it('returns whatever parseLocationQueryParameter returns for ID parameter', function() {
      spyOn(util.url, 'parseLocationQueryParameter').and.returnValue('IDVALUE');
      var ret = macysCoremetrics.getMMCItem();
      expect(util.url.parseLocationQueryParameter).toHaveBeenCalledWith('ID');
      expect(ret).toBe('IDVALUE');
    });

    it('returns whatever parseLocationQueryParameter returns for LINKSHAREID parameter', function() {
      spyOn(util.url, 'parseLocationQueryParameter').and.returnValue('LINKSHAREIDVALUE');
      var ret = macysCoremetrics.getLinkShareID();
      expect(util.url.parseLocationQueryParameter).toHaveBeenCalledWith('LINKSHAREID');
      expect(ret).toBe('LINKSHAREIDVALUE');
    });

    it('returns whatever util.getCookie returns for bhrf cookie', function() {
      spyOn(util, 'getCookie').and.returnValue('bhrfValue');
      var ret = macysCoremetrics.getReferrerURL();
      expect(util.getCookie).toHaveBeenCalledWith('bhrf');
      expect(ret).toBe('bhrfValue');
    });

    it('returns whatever util.getCookie returns for  macys_online cookie', function() {
      spyOn(util, 'getCookie').and.returnValue('macysOnlineValue');
      var ret = macysCoremetrics.getMacysOnlineId();
      expect(util.getCookie).toHaveBeenCalledWith('macys_online');
      expect(ret).toBe('macysOnlineValue');
    });
  });
});
