define([
  // Utils
  'util/dataMap',

  // Models
  'models/categoryModel',
  'models/catSplashModel',
  'models/browseModel',

  // Views
  'views/baseView',
  'views/catSplashView',
  'views/browseView'
], function(DataMap, CategoryModel, CatSplashModel, BrowseModel,
             BaseView, CatSplashView, BrowseView) {
  'use strict';

  var CategoryView = BaseView.extend({
    init: function() {
      var data = this.options;
      this.legacyPath = this.options.legacyPath;
      delete this.options.legacyPath;

      this.dataMap = new DataMap({
        wssgKeys: ['sortorder'],
        id: 'categoryId',
        productsperpage: 'resultsperpage',
        pageindex: 'currentpage',
        sortby: {
          toWssg: function(navAppValue) {
            switch (navAppValue) {

            case 'PRICE_LOW_TO_HIGH':
              this.sortby = 'price';
              this.sortorder = 'asc';
              break;

            case 'PRICE_HIGH_TO_LOW':
              this.sortby = 'price';
              this.sortorder = 'desc';
              break;

            case 'NEW_ITEMS':
              this.sortby = 'newarrival';
              break;

            case 'TOP_RATED':
              this.sortby = 'customerrating';
              this.sortorder = 'desc';
              break;

            case 'BEST_SELLERS':
              this.sortby = 'bestseller';
              break;

            default:
              this.sortby = navAppValue;
            }
          },
          fromWssg: function(wssgValue, data) {
            switch (wssgValue) {

            case 'price':
              switch (data.sortorder) {

              case 'desc' :
                this.sortby = 'PRICE_HIGH_TO_LOW';
                break;

              case 'asc' :
                this.sortby = 'PRICE_LOW_TO_HIGH';
                break;
              }
              break;

            case 'customerrating':
              this.sortby = 'TOP_RATED';
              break;

            case 'bestseller':
              this.sortby = 'BEST_SELLERS';
              break;

            case 'newarrival':
              this.sortby = 'NEW_ITEMS';
              break;

            default:
              this.sortby = data.sortby;
              break;
            }
          }
        }
      });

      /**
       * We have a chance to cut corners here - if the navigation request has completed,
       * there is a chance that we don't need to make the generalized category request first.
       */
      var category = this.getCategoryFromIndex(data);

      if (category) {
        this.subcat(data, category);
      } else {
        // Generalized category request
        this.fetchGenericModel(data, function() {
          this.subcat(data, null);
        }, this);
      }
    },

    getCategoryFromIndex: function(data) {
      var categoryIndex = App.model.get('categoryIndex');

      if (!categoryIndex) {
        return;
      }

      var menus = categoryIndex.menus;
      var category = menus[data.id];

      if (_.isEmpty(category) || (category.type === 'Flexible Template')) {
        return;
      }

      // No need to do the generalized category request; we already know the view to display
      return category;
    },

    // Generalized category request
    fetchGenericModel: function(data, callback, context) {
      this.model = new CategoryModel({ requestParams: this.dataMap.toWssg(data) });
      this.listenTo(this.model, 'modelready', function() {
        if (!_.isFunction(callback)) {
          return;
        }

        var context = context || this;
        callback.call(context, this);
      });
      this.model.fetch();
    },

    subcat: function(data, category) {
      var View, Model;

      // The category index is loaded, or generalized request has been made. We know which view to display
      var categoryType = (data && !_.isEmpty(category)) ? (category.type) : (this.model.get('category').type);
      var pageType = (!_.isUndefined(this.model)) ? this.model.get('category').pageType : undefined;

      var catId = (!_.isEmpty(category)) ? (category.id) : (this.model.get('category').id);
      var parentCatId = (!_.isEmpty(category)) ? (category.parentCatId) : (this.model.get('category').parentCatId);

      var viewName = this.determineViewName(categoryType, pageType, catId, parentCatId);

      // For legacy URLs, update the browser url to what has been delivered by the service
      if (this.legacyPath) {
        var url = (data && !_.isEmpty(category)) ? (category.url) : (this.model.get('category').url);
        App.router.navigate(url, { trigger: false, replace: true });
      }

      // Create a reference to the appropriate View / Model objects
      switch (viewName) {
        case 'BrowseView' :
          View = BrowseView;
          Model = BrowseModel;
          break;
        case 'CatSplashView' :
          View = CatSplashView;
          Model = CatSplashModel;
          break;
      }

      // The subView will need to know whether or not all of the data is available
      var allDataAvailable = !_.isUndefined(this.model);

      /**
       * For the model initialization, pass any known data:
       *     - If a generalized category request was already made, this data exists in the CategoryModel
       *     - If a generalized category request has not been made, there is no CategoryModel.
       *       In this case, the known data comes from the appModel (navigation JSON) -
       *       which is passed in to this.subcat() and 'category' parameter is not empty.
       */
      var attributes = (allDataAvailable) ? (this.model.attributes) : ({
        requestParams: this.dataMap.toWssg(data),
        category: _.omit(category, ['children', 'parent'])
      });

      var model = new Model(attributes);

      // Initialize the subView (BrowseView, CatSplashView), passing in a reference to the newly-created model
      this.subViews.subcat = new View({ model: model, options: { dataMap: this.dataMap }});

      /**
       * The newly-created view should listen for the model's category data to become available, then
       * set a property on the model. This allows the template to observe model.attributes to determine
       * the availability of data.
       */
      this.subViews.subcat.listenTo(model, 'allDataAvailable', function() {
        this.model.set('allDataAvailable', true);
      });

      /**
       * Trigger the 'allDataAvailable' event for the subView's model, whenever the data becomes available:
       *   - If the generalized category request was already made, trigger the event immediately
       *   - If allDataAvaliable is false, the data is coming from the appModel.
       *     Trigger the 'allDataAvailable' event after the subView's model is done fetching from the server
       */
      if (!allDataAvailable) {
        // We only want to trigger this for initial modelready, not for subsequent modelready (e.g. sorting, filtering)
        var triggered = false;
        model.on('modelready', function() {
          if (!triggered) {
            this.trigger('allDataAvailable');
            triggered = true;
          }
        });

        model.fetch();
      } else {
        model.trigger('allDataAvailable');
      }
    },

    /**
     * determines view name based on category type
     * @param  {string} categoryType
     * @param  {string} pageType
     *
     * @return {string} the view name
     */
    determineViewName: function(categoryType, pageType) {
      var viewName = '';
      var type = pageType || categoryType;

      switch (type) {
      case 'Splash':
      case 'Flexible Template':
      case 'Category Splash':
        viewName = 'CatSplashView';
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

  return CategoryView;
});
