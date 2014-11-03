define( [], function(){
  'use strict';

  var dataDictionary = {
    prefix: 'MEW_',
    getDataDictionary: function(){
      if (_.isUndefined (window.MACYS)) {
        window.MACYS = {};
      }

      if( _.isUndefined( window.MACYS.brightTag)){
        window.MACYS.brightTag = { };
      }

      return window.MACYS.brightTag;
    },
    clearAll: function(){
      var dd = this.getDataDictionary();
      if( dd.category){
        delete dd.category;
      }
      if( dd.product){
        delete dd.product;
      }
    },
    setNavigation: function( pageName, pageId, keyword){
      var dd = this.getDataDictionary();

      this.clearAll();

      dd.navigation = {
        pageName: this.prefix + pageName,
        pageID: this.prefix + pageId,
        keywordSearch: keyword ? keyword : '',
        registryMode: 'NO'
      };
    },
    setCategory: function( categoryId, categoryName, fobCategoryId, fobCategoryName){
      this.clearAll();
      var dd = this.getDataDictionary();

      dd.category = {
        categoryID: categoryId,
        categoryName: categoryName,
        fobCategoryID: fobCategoryId ? fobCategoryId : '',
        fobCategoryName: fobCategoryName ? fobCategoryName : ''
      };
    },
    setProduct: function( productId, productName, productType, categoryId, topCategoryId, topCategoryName){
      this.clearAll();
      var dd = this.getDataDictionary();

      dd.product = {
        productID: productId,
        productName: productName,
        productType: productType,
        productCategoryID: categoryId ? categoryId : '',
        topLevelCategoryID: topCategoryId ? topCategoryId : '',
        topLevelCategoryName: topCategoryName ? topCategoryName : ''
      };
    },
    helpers: {
      //In this hacky way we obtain fob category id because wssg cannot provide it for us.
      //Per SA instructions we extract it from DOM - the item right under 'Shop' will be our fob.
      //However we cannot wait until real GN is loaded (can be too slow), 
      getDomFobCategory: function(){
        var fobCategory;

        var fobCategoryItem = $('#mb-j-nav-menu #shop').next();
        if( fobCategoryItem.length ){
          var itemId = fobCategoryItem.attr('id');
          //If it's not a number it can be some other menu item, not fob
          if( _.isNumber( itemId - 0)){
            fobCategory = { id: fobCategoryItem.attr('id'), name : fobCategoryItem.find('a').text().trim()};
          }
        }

        return fobCategory;
      }
    }
  };

  return dataDictionary;

 });