
define([
  'models/_brandIndexModel'
], function(BrandIndexModel) {
  'use strict';

  var BCOMBrandIndexModel = BrandIndexModel.extend({
    urlRoot: '/api/v4/catalog/category/brandindex',

    defaults: function() {
      return {
        requestParams: {
          id: ''
        }
      };
    },

    url: function() {
      var id = this.attributes.requestParams.id,
          fobCatIds = App.model.get('categoryIndex').menus[id].fobCatId;

      if(fobCatIds) {
        return this.urlRoot + '/' + fobCatIds + '?refcatid=' + id;
      } else {
        return this.urlRoot +'?refcatid=' + id;
      }
    },

    parse: function (response) {
      var index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          brands = {};

      if (response) {
        _.each(response.brandIndex, function(brand){
          var brandLetter = brand.brandName.charAt(0).toUpperCase();

          if(index.indexOf(brandLetter) !== -1){
            if(_.isUndefined(brands[brandLetter])){
              brands[brandLetter] = [];
            }
            brands[brandLetter].push(brand);
          } else{
            if(_.isUndefined(brands['#'])){
              brands['#'] = [];
            }
            brands['#'].push(brand);
          }
        });
        response.designerIndex = brands;
      }
      return response;
    }

  });

  return BCOMBrandIndexModel;
});