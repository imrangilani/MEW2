define( [], function(){
  'use strict';

  var dataDictionary = {
    prefix: 'MEW_',
    getDataDictionary: function() {
      if (_.isUndefined (window.BLOOMIES)) {
        window.BLOOMIES = {};
      }

      if( _.isUndefined( window.BLOOMIES.brightTag)){
        window.BLOOMIES.brightTag = { };
      }

      return window.BLOOMIES.brightTag;
    },
    clearAll: function() {
      var dd = this.getDataDictionary();
      if( dd.category){
        delete dd.category;
      }
      if( dd.product){
        delete dd.product;
      }
    },
    setNavigation: function( pageName, pageId, keyword) {
      var dd = this.getDataDictionary();

      this.clearAll();

      dd.navigation = {
        pageName: this.prefix + pageName,
        pageID: this.prefix + pageId,
        keywordSearch: keyword ? keyword : '',
        registryMode: 'NO'
      };
    },
    setCategory: function( categoryId, categoryName) {
      this.clearAll();
      var dd = this.getDataDictionary();

      dd.category = {
        categoryID: categoryId,
        categoryName: categoryName
      };
    },
    setProduct: function( productId, productName, productType, categoryId) {
      this.clearAll();
      var dd = this.getDataDictionary();

      dd.product = {
        productID: productId,
        productName: productName,
        productType: productType,
        productCategoryID: categoryId ? categoryId : ''
      };
    }
  };

  return dataDictionary;

 });