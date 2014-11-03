define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  var BrandIndexModel = BaseModel.extend({
    defaults: {
      requestParams: {
        id: ''
      },
      searchResults: []
    },

    url: function() {
      var categoryId = this.get('requestParams').id,
          menu = App.model.get('categoryIndex').menus[categoryId],
          fobCatIds = menu.fobCatId,
          categoryName = menu.name;

      this.set('categoryName', categoryName);

      return '/api/v4/catalog/category/brandindex/' + fobCatIds.join(',') + '?refcatid=' + categoryId;
    }
  });

  return BrandIndexModel;
});
