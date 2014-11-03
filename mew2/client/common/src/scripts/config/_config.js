define([], function() {
  'use strict';

  var config = {
    apiUrls: {
      browse: '/api/catalog/category/browse/product/v3'
    },
    animations: {

      // The number of ms before the selected menu item animates into place and the new menu items are added
      menuAnimateDelay: 300,

      // The number of ms before the menu closes when a bottom level category is reached
      menuCloseDelay: 700

    }
  };

  return config;
});
