/* Listens for coremetrics events trigerred by views through analyticsTrigger
 * and calls an appropriate coremetrics macys wrapper function, passing
 * required parameters in the same order as real coremetrics function requires
 */
define([
  'underscore',
  'backbone',
  'analytics/macysCoremetrics',
  'helpers/coremetricsExtAttributes',
  'analytics/analyticsData',
  'analytics/loader'
], function(_, Backbone, macysCoremetrics, ExtAttributes, analyticsData, analyticsLoader) {
  'use strict';
  var _coremetricsLoaded = $.Deferred();
  analyticsLoader.load( _coremetricsLoaded, false);

  var listener = {
    getDeferred: function(){
      //Needed for unit testing
      return _coremetricsLoaded;
    },

    initialize: function() {
      this.listenTo(Backbone, 'analytics', this.processAnalyticsTagEvent);
      _coremetricsLoaded.done( _.bind( function(){

        //This parameters below should be loaded based on production/non-production configuration
        //parameters
        if (window.ENV_CONFIG.production === 'y' || window.ENV_CONFIG.production === 'Y') {
          cmSetClientID('90067660', false, 'www3.macys.com', 'macys.com');
        } else {
          cmSetClientID('80067660', false, 'testdata.coremetrics.com', 'macys.com');
        }

        //Moving this function from macysCoremetrics.js to here because it needs to be called only after cmcustom.js is loaded so it can overwrite the function
        //A copy of cmCreateProductviewTag from cmcustom.js with platform-specific (web) modified prefix for pi parameter
        //It should be loaded after cmcustom.js to it overwrites the original file

        window.cmCreateProductviewTag = function(productID, productName, categoryID, cm_ven, cm_cat, cm_pla, cm_ite,linkShareID, custID, refURL, cmCrossSell,totalReviewCount,avgRating,numberRatingsOnlyReviews,buyAgainPercentage,attributes) {
          if (attributes){
            var cm_exAttr = [];
            cm_exAttr = attributes.split('-_-');
          }
          if (productName == null) {
            productName = '';
          }
          if (cm_ven){
            this.manual_cm_mmc=cm_ven+'-_-'+cm_cat+'-_-'+cm_pla+'-_-'+cm_ite;
          }
          cmMakeTag(['tid','5','pi','MEW_PRODUCT: ' + productName + ' (' + productID + ')','pr',productID,'pm',productName,'cg',categoryID,
            'pc','Y','cm_vc',cmExtractParameter('cm_vc',document.location.href),'pr1',avgRating,'pv1',custID,'pv2',linkShareID,
            'pv13',cmCrossSell,'cm_exAttr',cm_exAttr,'li',10300,'ps1',productID,'ps2',productName,'ps3',categoryID,'ps4',totalReviewCount,
            'ps5',avgRating,'ps6',numberRatingsOnlyReviews,'ps7',buyAgainPercentage,'pr10',attributes,'cm_exAttr',cm_exAttr]);
        };

      }, this));
    },
    //Redirects processing event based on tag.tagType
    processAnalyticsTagEvent: function(aTag) {
      _coremetricsLoaded.done( _.bind( function(){
          //All tag processing function names follow the pattern: 'process' + tagName
          var name = 'process' + aTag.tagType.charAt(0).toUpperCase() + aTag.tagType.substring(1);
          //Invoke the function and pass parameters
          var invokee = this[name];
          if (invokee) {
            invokee.call(this, aTag);
          } else {
            console.log('Tried to invoke invalid tag: ' + aTag.tagType);
          }
      }, this));
    },

    processPageViewTag: function(aTag) {
      var extAttributes = new ExtAttributes();

      this.specifyABCampaign (extAttributes);

      if (aTag.att9){
        extAttributes.addAttribute(9, aTag.att9);
      }

      if (aTag.att12){
        extAttributes.addAttribute(12, aTag.att12);
      }

      if (aTag.att14){
        extAttributes.addAttribute(14, aTag.att14);
      }

      if( aTag.att22){
        extAttributes.addAttribute(22, aTag.att22);
      }

      if( aTag.att29){
        //set in event details modal
        extAttributes.addAttribute(29, aTag.att29);
      }

      macysCoremetrics.mcmCreatePageviewTag (aTag.pageId,
                                            aTag.categoryId,
                                            aTag.searchString ? aTag.searchString : '',
                                            aTag.searchResults ? aTag.searchResults : '',
                                            extAttributes.createAttributesString());
    },
    processProductViewTag: function(aTag) {
      var extAttributes = new ExtAttributes();

      this.specifyABCampaign (extAttributes);

      //Get product selection context attributes
      //ProductSelectionContext can be set by the product pool OR Recently Viewed
      //OR by Facets selection OR recommendations
      var productSelectionContext = analyticsData.getCMProductSelectionContext();
      if (productSelectionContext){
        _.each(productSelectionContext, function(value, attribute) {
          extAttributes.addAttribute(attribute, value);
        });
      }

      //Get browse page context attributes
      //set by browse
      var browseContext = analyticsData.getCMBrowseContext();
      if (browseContext){
        extAttributes.addAttribute(9, browseContext.totalProducts);
        extAttributes.addAttribute(10, browseContext.pageNumber);
      }

      if (aTag.att16) {
        extAttributes.addAttribute(16, aTag.att16);
      }

      //Product type, set on pdp
      if (aTag.att16) {
        extAttributes.addAttribute(16, aTag.att16);
      }
      //Store product only
      if (aTag.att17) {
        extAttributes.addAttribute(17, aTag.att17);
      }

      if (aTag.att27) {
        extAttributes.addAttribute(27, aTag.att27);
      }

      if (aTag.att28) {
        extAttributes.addAttribute(28, aTag.att28);
      }

      //This value can be 0 and needs to go to the attrs
      if (!_.isUndefined( aTag.att31)) {
        extAttributes.addAttribute(31, aTag.att31);
      }

      macysCoremetrics.mcmCreateProductviewTag (aTag.productID, aTag.productName, aTag.categoryID,
                                               extAttributes.createAttributesString());
    },

    getAction5TrackingInfo: function (aTag){
      return this.getAction5Attributes (aTag);
    },

    getAction5Attributes: function (aTag){
      var extAttributes = new ExtAttributes();

      //Get product selection context attributes
      //ProductSelectionContext can be set by the product pool OR Recently Viewed
      //OR by Facets selection
      var productSelectionContext = analyticsData.getCMProductSelectionContext();
      if (productSelectionContext){
        _.each(productSelectionContext, function(value, attribute) {
          extAttributes.addAttribute(attribute, value);
        });
      }

      //Get browse page context attributes
      //set by browse
      var browseContext = analyticsData.getCMBrowseContext();
      if (browseContext){
        extAttributes.addAttribute(9, browseContext.totalProducts);
        extAttributes.addAttribute(10, browseContext.pageNumber);
      }

      //Product type, set on pdp
      if (aTag.att16) {
        extAttributes.addAttribute(16, aTag.att16);
      }
      //Store product only
      if (aTag.att17) {
        extAttributes.addAttribute(17, aTag.att17);
      }

      if (aTag.att27) {
        extAttributes.addAttribute(27, aTag.att27);
      }

      if (aTag.att28) {
        extAttributes.addAttribute(28, aTag.att28);
      }

      //Number of alt images
      if (!_.isUndefined( aTag.att31)) {
        extAttributes.addAttribute(31, aTag.att31);
      }

      //Number of viewed alt images
      if (!_.isUndefined(aTag.att32)) {
        extAttributes.addAttribute(32, aTag.att32);
      }

      return extAttributes.createAttributesString();
    },

    processShopAction5Tag: function (aTag) {

      var action5Attributes = this.getAction5Attributes(aTag);
      macysCoremetrics.mcmCreateShopAction5Tag (aTag.productID, aTag.productName, aTag.productQuantity, aTag.productPrice, aTag.categoryID,
            aTag.masterProductId, action5Attributes);

    },
    processTechPropertiesTag: function (aTag) {
      var extAttributes = new ExtAttributes();
      this.specifyABCampaign (extAttributes);

      macysCoremetrics.mcmCreateTechPropsTag(aTag.pageId, aTag.categoryId, extAttributes.createAttributesString());
    },
    processPageElementTag: function(aTag) {
      var extAttributes = new ExtAttributes();
      if (aTag.att1) {
        extAttributes.addAttribute(1, aTag.att1);
      }

      if (aTag.att6){
        extAttributes.addAttribute(6, aTag.att6);
      }
      //Give ability to overwrite the default behavior
      //which is to store pageId in coremetricsData, where it is set by the view
      if (!aTag.att7){
        extAttributes.addAttribute(7, analyticsData.getCMPageId());
      } else {
        extAttributes.addAttribute(7, aTag.att7);
      }

      if (aTag.att21){
        extAttributes.addAttribute(21, aTag.att21);
      }
      if (aTag.att22) {
        extAttributes.addAttribute(22, aTag.att22);
      }
      macysCoremetrics.mcmCreatePageElementTag(aTag.elementId, aTag.elementCategory, extAttributes.createAttributesString());
    },
    processPageElementPDPTag: function(aTag) {
      var extAttributes = new ExtAttributes();
      if (aTag.att7){
        extAttributes.addAttribute(7, aTag.att7);
      }

      if (aTag.att8){
        extAttributes.addAttribute(8, aTag.att8);
      }
      //If element id is passed - use it, otherwise set it to the "breadcrumbs"
      var elementId = aTag.elementId ? aTag.elementId : analyticsData.getCMPageId();
      macysCoremetrics.mcmCreatePageElementTag(elementId, aTag.elementCategory, extAttributes.createAttributesString());
    },

    processPageElementConditionalAttrsTag: function(aTag) {
      var extAttributes = new ExtAttributes();
      if (aTag.att1) {
        extAttributes.addAttribute(1, aTag.att1);
      }

      if (aTag.att6){
        extAttributes.addAttribute(6, aTag.att6);
      }

      if (aTag.att25){
        extAttributes.addAttribute(25, aTag.att25);
      }

      macysCoremetrics.mcmCreatePageElementTag(aTag.elementId, aTag.elementCategory, extAttributes.createAttributesString());
    },
    processPageElementGNTag: function(aTag) {
      var elementId = analyticsData.getCMPageId();
      macysCoremetrics.mcmCreatePageElementTag(elementId, aTag.elementCategory, null);
    },
    processPageElementTopGNTag: function(aTag) {
      macysCoremetrics.mcmCreatePageElementTag(aTag.elementId, aTag.elementCategory, null);
    },
    processLinkClickTag: function(aTag) {
      var extAttributes = new ExtAttributes();
      macysCoremetrics.mcmCreateManualLinkClickTag(aTag.urlTarget, aTag.pageId, extAttributes.createAttributesString());
    },
    processManualLinkClickTag: function(aTag) {
      macysCoremetrics.mcmCreateManualLinkClickTag(aTag.urlTarget, aTag.pageId, null);
    },
    processConversionEventTag: function(aTag) {
      var eventID = analyticsData.getCMPanelType();
      macysCoremetrics.mcmCreateConversionEventTag(eventID, aTag.actionType, aTag.categoryId, aTag.points, null);
    },
    processConversionEventWriteReviewTag: function(aTag) {
      macysCoremetrics.mcmCreateConversionEventTag(aTag.eventId, aTag.actionType, aTag.categoryId, null, null);
    },
    processConversionEventTagBops: function(aTag) {
      var  extAttributes = new ExtAttributes();
      if (aTag.att2) {
        extAttributes.addAttribute(2, aTag.att2);
      }

      macysCoremetrics.mcmCreateConversionEventTag(aTag.eventId, aTag.actionType, aTag.categoryId, aTag.points, extAttributes.createAttributesString());
    },
    processConversionEventTagRegistry: function(aTag) {
      var  extAttributes = new ExtAttributes();
      if (aTag.att3) {
        extAttributes.addAttribute(3, aTag.att3);
      }
      if (aTag.att4) {
        extAttributes.addAttribute(4, aTag.att4);
      }
      if (aTag.att5){
        extAttributes.addAttribute(5, aTag.att5);
      }
      macysCoremetrics.mcmCreateConversionEventTag(aTag.eventID, aTag.actionType, aTag.categoryId, aTag.points, extAttributes.createAttributesString());
    },
    processUserErrorTag: function(aTag){
      macysCoremetrics.mcmCreateUserErrorTag(aTag.pageId, aTag.categoryId, aTag.msgCode, 'ERROR', 'PRESENTATION', aTag.msgDesc);

    },

    specifyABCampaign: function( attr){
      if (window.ENV_CONFIG.abtesting_softlaunch === 'on') {
        var campaign = 'Mew2 New:';
        var value = 'None';
        if( $.cookie('m_sl') === '2.0'){
          value = 'B';
        }
        attr.addAttribute (3, campaign + value);
      }
    },

    processRegistrationTag: function(aTag){
      macysCoremetrics.mcmCreateRegistrationTag(aTag.cd, aTag.em);
    }

  };

  _.extend(listener, Backbone.Events);
  listener.initialize();

  return listener;
});

