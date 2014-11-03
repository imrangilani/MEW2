define([
  'util/util'
], function(util) {
  'use strict';

  var conversionActionTypeMap = {
    conversion_initiate: 1,
    conversion_complete: 2
  };

  var bloomiesCoremetrics = {
    prefix: '',
    currentPageID: '',

    initialize: function() {
      //Set platform-specific prefix (app or web) and cmCreateProductviewTag file name to load
      if (util.getCookie('ishop_app')) {
        this.prefix = 'MAPP: ';
      } else {
        this.prefix = 'MBL: ';
      }
    },

    getMMCVendor: function() {
      return util.url.parseLocationQueryParameter('PartnerID') || '';
    },

    getMMCPlacement: function() {
      return 'N/A';
    },

    getMMCCategory: function() {
      return 'N/A';
    },

    getMMCItem: function() {
      return util.url.parseLocationQueryParameter('BannerID') || this.getLinkshareID();
    },

    getLinkshareID: function() {
      return util.url.parseLocationQueryParameter('LinkshareID') || '';
    },

    getCustomerID: function() {
      return util.getCookie('bloomingdales_online_uid') || '0000000000';
    },

    getMachineID: function() {
      return util.getCookie('bloomingdales_online') || '';
    },

    cmCreateTechPropsTag: function(pageID, categoryID, attributes) {
      var prefixed_pageID = this.prefix + pageID;
      var prefixed_categoryID = this.prefix + categoryID;

      window.cmCreateTechPropsTag(prefixed_pageID, prefixed_categoryID,
              this.getMMCVendor(),
              this.getMMCCategory(),
              this.getMMCPlacement(),
              this.getMMCItem(),
              this.getMachineID(),
              this.getLinkshareID(),
                    attributes);

    },

    cmCreatePageviewTag: function(pageID, categoryID, searchTerm, searchResults, attributes) {
        var prefixed_pageID = this.prefix + pageID;
        this.currentPageID = prefixed_pageID;

      window.cmCreatePageviewTag(prefixed_pageID, categoryID, searchTerm, searchResults,
          this.getMMCVendor(),
          this.getMMCCategory(),
          this.getMMCPlacement(),
          this.getMMCItem(),
          this.getMachineID(),
          this.getLinkshareID(),
                attributes);

    },

    cmCreateManualPageviewTag: function(pageID, categoryID, searchTerm, searchResults, referralURL, attributes) {
        var prefixed_pageID = this.prefix + pageID;
        this.currentPageID = prefixed_pageID;

      if (this.getMMCVendor()) {
        window.manual_cm_mmc = [
          this.getMMCVendor(),
          this.getMMCCategory(),
          this.getMMCPlacement(),
          this.getMMCItem()].join('-_-');
      }
      window.cmMakeTag([
        'tid', '1',
        'pi', prefixed_pageID,
        'cg', categoryID,
        'se', searchTerm,
        'sr', searchResults,
        'rf', referralURL,
        'pv1', this.getMachineID(),
        'pv2', this.getLinkshareID(),
        'cmAttributes', attributes,
        'cmExtraFields', ''
      ]);

    },

    cmCreatePageElementTag: function(categoryID, cmCategory, attributes) {
      var prefixed_categoryID = this.prefix + categoryID;
      cmCategory = this.prefix + cmCategory;
      window.cmCreatePageElementTag(prefixed_categoryID, cmCategory, attributes);
    },

    cmCreateProductviewTag: function(productID, productName, categoryID, attributes) {
      var prefixed_categoryID = categoryID;

      window.cmCreateProductviewTag(
          productID,
          productName,
          prefixed_categoryID,
          this.getMMCVendor(),
          this.getMMCCategory(),
          this.getMMCPlacement(),
          this.getMMCItem(),
          this.getCustomerID(),
          this.getLinkshareID(),
                attributes);

    },

    cmCreateShopAction5Tag: function(productID, productName, productQuantity, productPrice, categoryID, masterProductId, attributes) {
      window.cmCreateShopAction5Tag(
        productID,
        productName.replace(/[,']/g, ''),
        productQuantity.toString(),
        productPrice.toString(),
        categoryID,
        attributes);
      window.cmDisplayShop5s();
    },

    cmCreateConversionEventTag: function(eventID, actionType, categoryID, points, attributes) {
      var prefixed_categoryID = this.prefix + categoryID;

      window.cmCreateConversionEventTag(
          eventID,
          conversionActionTypeMap[actionType] || 1,
          prefixed_categoryID,
          points,
          attributes || '');

    },

    createRegistrationTag: function(emailAddress, city, state, zip, gender, newsletterName, isSubscribed) {
      window.cmCreateRegistrationTag (
          // As per story #24846 we must use user email as customer ID instead of this.getCustomerID()
          emailAddress,
          emailAddress,
          city,
          state,
          zip,
          gender,
          newsletterName,
          isSubscribed,
          '',
          '');

    },

    cmCreateManualLinkClickTag: function(href) {
      window.cmCreateManualLinkClickTag(
          href,
          null,
          this.currentPageID);
    },

    cmCreateManualImpressionTag: function(sitePromotion) {
      window.cmCreateManualImpressionTag(
          this.currentPageID,
          sitePromotion);
    },

    exploreAttributes: function(arg) {
      var _list = [];

      /**
       * @param {Object} obj - An Object of the form {1: "value1", 13: "value13"}, where indexes start from 1.
       */
      this.add = function(obj) {
        for (var ele in obj) {
          _list[ele-1] = obj[ele];
        }
        return this;
      };

      this.toString = function() {
        return(_list.join('-_-'));
      };

      if (arg) {
        this.add(arg);
      }
    }

  };

  bloomiesCoremetrics.initialize();

  return bloomiesCoremetrics;

});
