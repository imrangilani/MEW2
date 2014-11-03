window.ENV_CONFIG.production = 'N';

define([
  'jasmineHelpers',
  'analytics/analyticsListener',
  'analytics/macysCoremetrics',
  'analytics/analyticsData',
  'helpers/coremetricsExtAttributes'
], function(jasmineHelpers, analyticsListener, macysCoremetrics, analyticsData, ExtAttributes) {
  'use strict';

  describe('analyticsListener', function() {

    analyticsListener.getDeferred().resolve();

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
    });

    afterEach(function() {
      analyticsData.data.browseContext = null;
      analyticsData.data.productSelectionContext = null;
    });

    describe('#processAnalyticsTagEvent', function() {

      it('should call mcom wrapper for page view tag when called with pageViewTag tag type', function() {
        spyOn(analyticsListener, 'processPageViewTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'pageViewTag' });

        expect(analyticsListener.processPageViewTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for product view tag when called with productViewTag tag type', function() {
        spyOn(analyticsListener, 'processProductViewTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'productViewTag' });

        expect(analyticsListener.processProductViewTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for tech properties tag when called with techPropertiesTag tag type', function() {
        spyOn(analyticsListener, 'processTechPropertiesTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'techPropertiesTag' });

        expect(analyticsListener.processTechPropertiesTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for page element tag when called with pageElementTag tag type', function() {
        spyOn(analyticsListener, 'processPageElementTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'pageElementTag' });

        expect(analyticsListener.processPageElementTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for PDP page element tag when called with pageElementPDPTag tag type', function() {
        spyOn(analyticsListener, 'processPageElementPDPTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'pageElementPDPTag' });

        expect(analyticsListener.processPageElementPDPTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for GN page element tag when called with pageElementGNTag tag type', function() {
        spyOn(analyticsListener, 'processPageElementGNTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'pageElementGNTag' });

        expect(analyticsListener.processPageElementGNTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for GN page element tag when called with pageElementTopGNTag tag type', function() {
        spyOn(analyticsListener, 'processPageElementTopGNTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'pageElementTopGNTag' });

        expect(analyticsListener.processPageElementTopGNTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for link click tag when called with linkClickTag tag type', function() {
        spyOn(analyticsListener, 'processLinkClickTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'linkClickTag' });

        expect(analyticsListener.processLinkClickTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for conversion event tag when called with conversionEventTag tag type', function() {
        spyOn(analyticsListener, 'processConversionEventTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'conversionEventTag' });

        expect(analyticsListener.processConversionEventTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for conversion event tag when called with conversionEventWriteReviewTag tag type', function() {
        spyOn(analyticsListener, 'processConversionEventWriteReviewTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'conversionEventWriteReviewTag' });

        expect(analyticsListener.processConversionEventWriteReviewTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for Registry conversion event tag when called with conversionEventTagRegistry tag type', function() {
        spyOn(analyticsListener, 'processConversionEventTagRegistry');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'conversionEventTagRegistry' });

        expect(analyticsListener.processConversionEventTagRegistry).toHaveBeenCalled();
      });
    });

    describe('#processPageViewTag', function() {

      it('should call mcom wrapper for bops conversion event tag when called with conversionEventTagBops tag type', function() {
        spyOn(analyticsListener, 'processConversionEventTagBops');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'conversionEventTagBops' });

        expect(analyticsListener.processConversionEventTagBops).toHaveBeenCalled();
      });

      it('should call mcom wrapper for user error event tag when called with userErrorTag tag type', function() {
        spyOn(analyticsListener, 'processUserErrorTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'userErrorTag' });

        expect(analyticsListener.processUserErrorTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for registration tag when called with userErrorTag tag type', function() {
        spyOn(analyticsListener, 'processRegistrationTag');

        analyticsListener.processAnalyticsTagEvent({ tagType: 'registrationTag' });
        expect(analyticsListener.processRegistrationTag).toHaveBeenCalled();
      });

      it('should call mcom wrapper for shopAction5 tag when called with shopAction5Tag tag type', function() {
        spyOn(analyticsListener, 'processShopAction5Tag');

        analyticsListener.processAnalyticsTagEvent({ tagType: 'shopAction5Tag' });
        expect(analyticsListener.processShopAction5Tag).toHaveBeenCalled();
      });

      it('should call macysCoremetrics wrapper for page view tag when called with pageViewTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageviewTag');
        analyticsListener.processPageViewTag(
          { tagType: 'pageViewTag',
            pageId: 'index_xxx',
            categoryId: 'category_xxx' });

        expect(macysCoremetrics.mcmCreatePageviewTag).toHaveBeenCalledWith( 'index_xxx', 'category_xxx', '', '', null);
      });

      it('should call macysCoremetrics wrapper for page view tag when called with pageViewTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageviewTag');
        analyticsListener.processPageViewTag(
          { tagType: 'pageViewTag',
            pageId: 'index_xxx',
            categoryId: 'category_xxx',
            att12: 'attr12',
            att14: 'attr14' });

        expect(macysCoremetrics.mcmCreatePageviewTag).toHaveBeenCalledWith( 'index_xxx', 'category_xxx', '', '', '-_--_--_--_--_--_--_--_--_--_--_-attr12-_--_-attr14');
      });

      it('should call macysCoremetrics wrapper for page view tag when called with pageViewTag tag type and pass parameters of search', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageviewTag');
        analyticsListener.processPageViewTag(
          { tagType: 'pageViewTag',
            pageId: 'index_xxx',
            categoryId: 'category_xxx',
            searchString: 'search_xxx',
            searchResults:  'results_xxx' });

        expect(macysCoremetrics.mcmCreatePageviewTag).toHaveBeenCalledWith('index_xxx', 'category_xxx', 'search_xxx', 'results_xxx', null);
      });

      it('should call macysCoremetrics wrapper for page view tag when called with pageViewTag tag type and att9 and att22', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageviewTag');
        analyticsListener.processPageViewTag(
          { tagType: 'pageViewTag',
            pageId: 'index_xxx',
            categoryId: 'category_xxx',
            att9: 'jea',
            att22:  'Silver Jeans',
            att29: 'attr29' });

        expect(macysCoremetrics.mcmCreatePageviewTag).toHaveBeenCalledWith('index_xxx', 'category_xxx', '', '', '-_--_--_--_--_--_--_--_-jea-_--_--_--_--_--_--_--_--_--_--_--_--_-Silver Jeans-_--_--_--_--_--_--_-attr29');
      });

      it('should call macysCoremetrics wrapper for product view tag when called with productViewTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateProductviewTag');

        analyticsData.data.browseContext = { totalProducts: 111,
                                              pageNumber: 3 };
        analyticsData.data.productSelectionContext = { 22: 'value_22',
                                                       23: 'value_23'};
        analyticsListener.processProductViewTag(
          { tagType: 'productViewTag',
            productID: '123456',
            productName: 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer',
            categoryID: '7654321',
            att16: 'attr16',
            att17: 'attr17' });

        expect(macysCoremetrics.mcmCreateProductviewTag).toHaveBeenCalledWith('123456', 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer', '7654321', '-_--_--_--_--_--_--_--_-111-_-3-_--_--_--_--_--_-attr16-_-attr17-_--_--_--_--_-value_22-_-value_23');
      });
    });

    describe('#processProductViewTag', function() {

	  //This method is actually tested from macysCoremetrics but for sonar reporting we're putting it here too
      it('should call overwritten cmCreateProductviewTag product view tag when called with productViewTag tag type and pass parameters', function() {
        spyOn(window, 'cmMakeTag');

        // analyticsData.data.browseContext = { totalProducts: 111,
        //                                       pageNumber: 3 };
        analyticsData.data.productSelectionContext = {};
        analyticsListener.processProductViewTag(
          { tagType: 'productViewTag',
            productID: '123456',
            productName: 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer',
            categoryID: '7654321',
            att16: 'attr16',
            att17: 'attr17' });

        expect(window.cmMakeTag).toHaveBeenCalledWith([ 'tid', '5', 'pi', 'MEW_PRODUCT: KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer (123456)', 'pr', '123456', 'pm', 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer', 'cg', 'MEW_7654321', 'pc', 'Y', 'cm_vc', null, 'pr1', null, 'pv1', '', 'pv2', '', 'pv13', null, 'cm_exAttr', [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'attr16', 'attr17' ], 'li', 10300, 'ps1', '123456', 'ps2', 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer', 'ps3', 'MEW_7654321', 'ps4', null, 'ps5', null, 'ps6', null, 'ps7', null, 'pr10', '-_--_--_--_--_--_--_--_--_--_--_--_--_--_--_-attr16-_-attr17', 'cm_exAttr', [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'attr16', 'attr17' ] ]  );
        	//'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer', 'MEW_7654321', '', '', '', '', '', '', '', null, null, null, null, null, '-_--_--_--_--_--_--_--_--_--_--_--_--_--_--_-attr16-_-attr17');
      });


      it('should call macysCoremetrics wrapper for product view tag when called with productViewTag tag type and pass additional parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateProductviewTag');

        analyticsData.data.browseContext = { totalProducts: 111,
                                              pageNumber: 3 };
        analyticsData.data.productSelectionContext = { 22: 'value_22',
                                                       23: 'value_23'};
        analyticsListener.processProductViewTag(
          { tagType: 'productViewTag',
            productID: '123456',
            productName: 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer',
            categoryID: '7654321',
            att27: 'attr27',
            att28: 'attr28',
            att31: 'attr31' });

        expect(macysCoremetrics.mcmCreateProductviewTag).toHaveBeenCalledWith('123456', 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer', '7654321', '-_--_--_--_--_--_--_--_-111-_-3-_--_--_--_--_--_--_--_--_--_--_--_-value_22-_-value_23-_--_--_--_-attr27-_-attr28-_--_--_-attr31');
      });
    });

    describe('#processTechPropertiesTag', function() {

      it('should call macysCoremetrics wrapper for tech properties tag when called with techPropertiesTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateTechPropsTag');
        analyticsListener.processTechPropertiesTag(
          { tagType: 'techPropertiesTag',
            pageId: 'index_xxx',
            categoryId: 'category_xxx' });

        expect(macysCoremetrics.mcmCreateTechPropsTag).toHaveBeenCalledWith('index_xxx', 'category_xxx', null);
      });
    });

    describe('#processPageElementTag', function() {

      it('should call macysCoremetrics wrapper for page element tag when called with pageElementTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageElementTag');

        analyticsData.data.browseContext = { totalProducts: 111,
                                              pageNumber: 3 };

        analyticsListener.processPageElementTag(
          { tagType: 'pageElementTag',
            elementId: '123456',
            elementCategory: 'KitchenAid',
            att1:  'attr1',
            att6:  'attr6',
            att7:  'attr7',
            att21: 'attr21',
            att22: 'attr22' });

        expect(macysCoremetrics.mcmCreatePageElementTag).toHaveBeenCalledWith('123456', 'KitchenAid', 'attr1-_--_--_--_--_-attr6-_-attr7-_--_--_--_--_--_--_--_--_--_--_--_--_--_-attr21-_-attr22');
      });

      it('should call macysCoremetrics wrapper for page element tag when called with pageElementTag tag type and pass parameters and no attr7', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageElementTag');

        analyticsData.data.browseContext = { totalProducts: 111,
                                              pageNumber: 3 };
        analyticsData.data.pageId = 'pageId_xxx';

        analyticsListener.processPageElementTag(
          { tagType: 'pageElementTag',
            elementId: '123456',
            elementCategory: 'KitchenAid',
            att1:  'attr1',
            att21: 'attr21',
            att22: 'attr22' });

        expect(macysCoremetrics.mcmCreatePageElementTag).toHaveBeenCalledWith('123456', 'KitchenAid', 'attr1-_--_--_--_--_--_-pageId_xxx-_--_--_--_--_--_--_--_--_--_--_--_--_--_-attr21-_-attr22');
      });
    });

    describe('#processPageElementPDPTag', function() {

      it('should call macysCoremetrics wrapper for PDP page element tag when called with pageElementPDPTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageElementTag');
        analyticsListener.processPageElementPDPTag(
          { tagType: 'pageElementPDPTag',
            elementId: 'element_xxx',
            elementCategory: 'elementCategory_xxx',
            att7: 'attr7',
            att8: 'attr8' });

        expect(macysCoremetrics.mcmCreatePageElementTag).toHaveBeenCalledWith('element_xxx', 'elementCategory_xxx', '-_--_--_--_--_--_-attr7-_-attr8');
      });

      it('should call macysCoremetrics wrapper for element tag when called with pageElementConditionalAttrsTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageElementTag');
        analyticsListener.processPageElementConditionalAttrsTag(
          { tagType: 'pageElementConditionalAttrsTag',
            elementId: 'element_xxx',
            elementCategory: 'elementCategory_xxx',
            att1: 'attr1',
            att6: 'attr6',
            att25:'attr25' });

        expect(macysCoremetrics.mcmCreatePageElementTag).toHaveBeenCalledWith('element_xxx', 'elementCategory_xxx', 'attr1-_--_--_--_--_-attr6-_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_--_-attr25');
      });
    });

    describe('#processPageElementGNTag', function() {
      it('should call macysCoremetrics wrapper for GN page element tag when called with pageElementGNTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageElementTag');
        analyticsData.data.pageId = 'pageId_xxx';

        analyticsListener.processPageElementGNTag(
          { tagType: 'pageElementGNTag',
            elementCategory: 'elementCategory_xxx' });

        expect(macysCoremetrics.mcmCreatePageElementTag).toHaveBeenCalledWith('pageId_xxx', 'elementCategory_xxx', null);
      });
    });

    describe('#processPageElementTopGNTag', function() {

      it('should call macysCoremetrics wrapper for GN page element tag when called with pageElementTopGNTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreatePageElementTag');
        analyticsData.data.pageId = 'pageId_xxx';

        analyticsListener.processPageElementTopGNTag(
          { tagType: 'pageElementTopGNTag',
            elementId: 'pageId_xxx',
            elementCategory: 'elementCategory_xxx' });

        expect(macysCoremetrics.mcmCreatePageElementTag).toHaveBeenCalledWith('pageId_xxx', 'elementCategory_xxx', null);
      });
    });

    describe('#processLinkClickTag', function() {

      it('should call macysCoremetrics wrapper for link click tag when called with linkClickTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateManualLinkClickTag');

        analyticsListener.processLinkClickTag(
          { tagType: 'linkClickTag',
            pageId: 'pageId_xxx',
            urlTarget: 'target' });

        expect(macysCoremetrics.mcmCreateManualLinkClickTag).toHaveBeenCalledWith('target', 'pageId_xxx', null);
      });
    });

    describe('#processManualLinkClickTag', function() {

      it('should call macysCoremetrics wrapper for link click tag when called with manualLinkClickTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateManualLinkClickTag');

        analyticsListener.processManualLinkClickTag(
          { tagType: 'manualLinkClickTag',
            pageId: 'pageId_xxx',
            urlTarget: 'target' });

        expect(macysCoremetrics.mcmCreateManualLinkClickTag).toHaveBeenCalledWith('target', 'pageId_xxx', null);
      });
    });

    describe('#processConversionEventTag', function() {

      it('should call macysCoremetrics wrapper for conversion event tag when called with conversionEventTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateConversionEventTag');
        analyticsData.data.pageName = 'panelName_xxx';

        analyticsListener.processConversionEventTag(
          { tagType: 'conversionEventTag',
            actionType: 2,
            categoryId: 'Women - Dresses',
            points: 3 });

        expect(macysCoremetrics.mcmCreateConversionEventTag).toHaveBeenCalledWith('panelName_xxx', 2, 'Women - Dresses', 3, null);
      });
    });


    describe('#processConversionEventTagRegistry', function() {

      it('should call macysCoremetrics wrapper for registry conversion event tag when called with conversionEventTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateConversionEventTag');

        analyticsListener.processConversionEventTagBops(
          { tagType: 'conversionEventTagBops',
            eventId: '123456',
            actionType: 2,
            categoryId: 'Shoes - Boots',
            points: 1,
            att2: 'attr2' });

        expect(macysCoremetrics.mcmCreateConversionEventTag).toHaveBeenCalledWith('123456', 2, 'Shoes - Boots', 1, '-_-attr2');
      });

      it('should call macysCoremetrics wrapper for registry conversion event tag when called with conversionEventTag tag type and pass parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateConversionEventTag');

        analyticsListener.processConversionEventTagRegistry(
          { tagType: 'conversionEventTag',
            eventID: '123456',
            actionType: 2,
            categoryId: 'Shoes - Boots',
            points: 1,
        	att3: 'attr3',
        	att4: 'attr4',
        	att5: 'attr5'});

        expect(macysCoremetrics.mcmCreateConversionEventTag).toHaveBeenCalledWith('123456', 2, 'Shoes - Boots', 1, '-_--_-attr3-_-attr4-_-attr5');
      });

      it('should call macysCoremetrics wrapper for registry conversion event tag when called with conversionEventTag tag type and pass extra attributes parameters', function() {
        spyOn(macysCoremetrics, 'mcmCreateConversionEventTag');

        analyticsListener.processConversionEventWriteReviewTag(
          { tagType: 'conversionEventTag',
            eventId: '123456',
            actionType: 2,
            categoryId: 'Shoes - Boots' });

        expect(macysCoremetrics.mcmCreateConversionEventTag).toHaveBeenCalledWith('123456', 2, 'Shoes - Boots', null, null);
      });

      it('should call macysCoremetrics wrapper for user error tag when called with userErrorTag tag type', function() {
        spyOn(macysCoremetrics, 'mcmCreateUserErrorTag');
        analyticsListener.processUserErrorTag(
          { tagType: 'pageViewTag',
            pageId: 'index_xxx',
            categoryId: 'category_xxx',
            msgCode: '12345',
            msgDesc: 'Huge error' });

        expect(macysCoremetrics.mcmCreateUserErrorTag).toHaveBeenCalledWith( 'index_xxx', 'category_xxx', '12345', 'ERROR', 'PRESENTATION', 'Huge error');
      });

      it('should call macysCoremetrics wrapper for registration tag when called with registrationTag tag type', function() {
        spyOn(macysCoremetrics, 'mcmCreateRegistrationTag');
        analyticsListener.processRegistrationTag(
          { tagType: 'registrationTag',
            cd: 'cdValue',
            em: 'emValue'});

        expect(macysCoremetrics.mcmCreateRegistrationTag).toHaveBeenCalledWith( 'cdValue', 'emValue');
      });

      it('should call macysCoremetrics wrapper for shopAction5 tag when called with shopAction5Tag tag type', function() {
        spyOn(macysCoremetrics, 'mcmCreateShopAction5Tag');
        analyticsListener.processShopAction5Tag(
          { tagType: 'shopAction5Tag',
            productID: 4567890,
            productName: 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer',
            productQuantity: 5,
            productPrice: 12.34,
            categoryID: 123,
            masterProductId: 345
        });

        expect(macysCoremetrics.mcmCreateShopAction5Tag).toHaveBeenCalledWith( 4567890, 'KitchenAid KSM150PS Artisan 5 Qt. Stand Mixer', 5, 12.34, 123, 345, null);
      });


      it('should call macysCoremetrics wrapper for registration tag when getAction5TrackingInfo is called', function() {
        spyOn(analyticsListener, 'getAction5Attributes');
        analyticsListener.getAction5TrackingInfo(
          { att: 'attr',
            cd: 'cdValue',
            em: 'emValue'});

        expect(analyticsListener.getAction5Attributes).toHaveBeenCalledWith( {
        	att: 'attr',
            cd: 'cdValue',
            em: 'emValue' });
      });

      it('should create shop5Action extended attributes string ', function() {
        analyticsData.data.browseContext = { totalProducts: 111,
                                              pageNumber: 3 };
        analyticsData.data.productSelectionContext = { 22: 'value_22',
                                                       23: 'value_23' };

        var extAttributes = analyticsListener.getAction5Attributes(
          { att16: 'attr16',
            att17: 'attr17',
            att27: 'attr27',
            att28: 'attr28',
            att31: 'attr31',
            att32: 'attr32'});

        expect(extAttributes).toBe( '-_--_--_--_--_--_--_--_-111-_-3-_--_--_--_--_--_-attr16-_-attr17-_--_--_--_--_-value_22-_-value_23-_--_--_--_-attr27-_-attr28-_--_--_-attr31-_-attr32');
      });

      it('should set attribute 3 of ext attributes to campaign and value when specifyABCampaign is called and m_sl cookie is not set to 2.0', function() {
        var extAttributes = new ExtAttributes();
        window.ENV_CONFIG.abtesting_softlaunch = 'on';

        analyticsListener.specifyABCampaign(extAttributes);

        expect(extAttributes.attributes[2]).toBe('Mew2 New:None');
      });

      it('should set attribute 3 of ext attributes to campaign and value when specifyABCampaign is called and m_sl cookie is set to 2.0', function() {
        var extAttributes = new ExtAttributes();
        window.ENV_CONFIG.abtesting_softlaunch = 'on';
        $.cookie('m_sl', '2.0');
        analyticsListener.specifyABCampaign(extAttributes);

        expect(extAttributes.attributes[2]).toBe('Mew2 New:B');
      });

      it('should not set attribute 3 of ext attributes to campaign and value when specifyABCampaign is called and abtesting_softlaunch killswitch is not set', function() {
        var extAttributes = new ExtAttributes();
        window.ENV_CONFIG.abtesting_softlaunch = undefined;
        $.cookie('m_sl', '2.0');
        analyticsListener.specifyABCampaign(extAttributes);

        expect(extAttributes.attributes[2]).toBeUndefined();
      });
    });
  });
});
