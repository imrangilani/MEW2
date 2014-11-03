define([
  'views/_categoryView',
  'views/catSplashView'
], function(CategoryView, CatSplashView) {
  'use strict';

  var MCOMCategoryView = CategoryView.extend({
   /**
     * determines view name based on category type
     * @param  {string} categoryType
     * @param  {string} pageType
     * @param  {int}    catId
     * @param  {int}    parentCatId
     *
     * @return {string} the view name
     */
    determineViewName: function(categoryType, pageType, catId, parentCatId) {
      var viewName = '';
      var type = pageType || categoryType;

      switch (type) {
      case 'Splash':
      case 'Flexible Template':
      case 'Category Splash':
        var pool;

        if (catId) {
          // First, check if this catsplash has a poolmap defined for its id
          pool = CatSplashView.prototype.poolMap[catId];

          // Next, check if this catsplash has a poolmap defined for its parent's id
          if (!pool && parentCatId) {
            pool = CatSplashView.prototype.poolMap[parentCatId];
          }
        }

        // Only treat as catsplash if there is an admedia pool set up for this category or its direct parent
        if (pool) {
          viewName = 'CatSplashView';
        } else {
          // If this cat id and its parent cat id are not in poolmap, treat as browse
          viewName = 'BrowseView';
        }
        break;
      case 'Browse':
      case 'GoTo':
      case 'Brand Sub Splash':
        /* falls through */
      default:
        viewName = 'BrowseView';
        break;
      }

      return viewName;
    }
  });

  return MCOMCategoryView;
});
