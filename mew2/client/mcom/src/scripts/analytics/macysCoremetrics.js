define([
  'jquery',
  'util/util'
], function ($, util) {
  'use strict';

  var macysCoremetrics = {
    prefix: '',
    tagFileName: '',

    initialize: function(){
      this.prefix = 'MEW_';
    },

    mcmCreatePageviewTag: function( pageID, categoryID, searchString, searchResults, attributes){

      var prefixed_pageID = this.prefix + pageID;
      var prefixed_categoryID = this.prefix + categoryID;


      cmCreatePageviewTag(prefixed_pageID, prefixed_categoryID, searchString, searchResults,
                          this.getMMCVendor(),
                          this.getMMCCategory(),
                          this.getMMCPlacement(),
                          this.getMMCItem(),
                          this.getLinkShareID(),
                          this.getMacysOnlineId(),
                          this.getReferrerURL(),
                          attributes);

    },
    mcmCreateProductviewTag: function( productID, productName, categoryID, attributes){
      var prefixed_categoryID = this.prefix + categoryID;

        cmCreateProductviewTag( productID, productName, prefixed_categoryID,
                              this.getMMCVendor(),
                              this.getMMCCategory(),
                              this.getMMCPlacement(),
                              this.getMMCItem(),
                              this.getLinkShareID(),
                              this.getMacysOnlineId(),
                              this.getReferrerURL(),
                              null, null, null, null, null, attributes);

    },
    mcmCreateTechPropsTag: function( pageID, categoryID, attributes){
      var prefixed_pageID = this.prefix + pageID;
      var prefixed_categoryID = this.prefix + categoryID;

      cmCreateTechPropsTag(prefixed_pageID, prefixed_categoryID,
                          this.getMMCVendor(),
                          this.getMMCCategory(),
                          this.getMMCPlacement(),
                          this.getMMCItem(),
                          this.getLinkShareID(),
                          this.getMacysOnlineId(),
                          this.getReferrerURL(),
                          attributes );

    },
    mcmCreatePageElementTag: function( elementID, elementCategory, attributes){
      var prefixed_elementCategory = this.prefix + elementCategory;
      cmCreatePageElementTag(elementID, prefixed_elementCategory, attributes);
    },
    mcmCreateManualLinkClickTag: function(href, pageID) {
      var prefixed_pageID = this.prefix + pageID;
      cmCreateManualLinkClickTag( href, null, prefixed_pageID);
    },
    mcmCreateConversionEventTag: function(eventID, actionType, conversionCategoryId, points, attributes){
      var prefixed_conversionCategoryId = this.prefix + conversionCategoryId;
      cmCreateConversionEventTag(eventID, actionType, prefixed_conversionCategoryId, points, attributes, null);
    },
    mcmCreateShopAction5Tag: function(productID, productName, productQuantity, productPrice, categoryID, masterProductId, attributes){
      var prefixed_categoryID = this.prefix + categoryID;
      cmCreateShopAction5Tag(productID, productName, productQuantity, productPrice, prefixed_categoryID, '', '', '', '', '', attributes);
      cmDisplayShop5s();
    },
    mcmCreateUserErrorTag: function (pageID, categoryID, mMsgCode, mMsgType, mMsgClass, mMsgDesc){
      var prefixed_pageID = this.prefix + pageID;
      var prefixed_categoryID = this.prefix + categoryID;
      cmCreateUserErrorTag(prefixed_pageID, prefixed_categoryID, mMsgCode, mMsgType, mMsgClass, mMsgDesc,'', '');
    },
    getMMCVendor: function() {
      return util.url.parseLocationQueryParameter('PARTNERID') || '';
    },
    getMMCPlacement: function() {
      return util.url.parseLocationQueryParameter('BANNERID') || this.getMMCVendor();
    },
    getMMCCategory: function() {
      return util.url.parseLocationQueryParameter('TRACKINGCAT') || util.url.parseLocationQueryParameter('CATEGORYID') || '';
    },
    getMMCItem: function() {
      return util.url.parseLocationQueryParameter('ID') || '';
    },
    getLinkShareID: function() {
      return util.url.parseLocationQueryParameter('LINKSHAREID') || '';
    },
    getReferrerURL: function() {
      return util.getCookie('bhrf') || '';
    },
    getMacysOnlineId: function() {
      return util.getCookie('macys_online') || '';
    },
    mcmCreateRegistrationTag: function(customerID, customerEmail, customerCity, customerState, customerZIP, customerGender, newsletterName, subscribe) {
      cmCreateRegistrationTag(customerID, customerEmail, customerCity,
        customerState, customerZIP, customerGender, newsletterName, subscribe);
    }
  };

  macysCoremetrics.initialize();

  return macysCoremetrics;

});
