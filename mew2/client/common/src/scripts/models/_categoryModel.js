define([
  // Utilities
  'util/util',
  'util/localstorage',
  // Models
  'models/baseModel'
], function(util, $localStorage, BaseModel) {
  'use strict';

  var CategoryModel = BaseModel.extend({

    initialize: function(param) {
      this.attributes.requestParams = _.defaults(this.attributes.requestParams, this.defaults);
      var suggester = window.App.config.ENV_CONFIG['suggester'];
      if (suggester && suggester === 'on') {
        this.attributes.requestParams.redirect = true;
      }
    },

    defaults: {
      currentpage: 1,
      resultsperpage: 24,
      show: 'product,facet,productpool'
    },

    url: function() {
      var categoryId = this.attributes.requestParams.categoryId;
      return '/api/v3/catalog/category/' + categoryId + '/browseproducts' + this.getQueryString();
    },

    getQueryString: function(includeCatId) {
      var requestParams = {};

      if (includeCatId) {
        requestParams = this.attributes.requestParams;
      } else {
        requestParams = _.omit(this.attributes.requestParams, 'categoryId');
      }

      return util.buildApiUrl(requestParams);
    },

    // Check if one of the categoryIndex completed (sencond level and full index)
    // If not, we wait for them to complete so we can look into the categoryModel object and
    // check if the category is a 'goTo' category.
    error: function(model, resp, arg, callback) {
      if (_.isUndefined(resp) || resp.status === 404 || _.isUndefined(resp.status)) {
        if (util.storage.retrieve('gn:categoryIndexLoaded', $localStorage.get('gn:categoryIndexLoaded:timestamp')) === "true"
          || util.storage.retrieve('gn:first2levelsLoaded', $localStorage.get('gn:first2levelsLoaded:timestamp')) === "true") {
          model.goToLogic(model, arguments, null, callback);
        } else {
          model.listenTo(Backbone, 'categoryIndexLoaded', _.bind(model.fullLevelError, this, model));
          model.listenTo(Backbone, 'gn:first2levelsLoaded', _.bind(model.secLevelError, this, model));
          model.listenTo(Backbone, 'gn:fetchError', _.bind(model.fullLevelError, this, model));

          if ($localStorage.get('gn:categoryIndexLoaded') === false) {
            if (callback) {
              callback.apply(this, model.length ? model : arguments);
            } else {
              CategoryModel.__super__.error.apply(this, model.length ? model : arguments);
            }
          }
        }
      } else {
        // Feat(27388): If the response status is 301, then WSSG will provide a redirectUrl we should
        // use to take the user to. It's a recommended URL in case there's a 404 or an outdated URL in place
        if (window.App.config.ENV_CONFIG['suggester'] === 'on' && resp.status === 301) {
          // We parse the responseText and we get the URL the app should redirect to
          var redirectUrl, category, redirectUrlObj, categoryParsed;

          try {
            categoryParsed =  JSON.parse(resp.responseText);
            if (categoryParsed) {
              category = JSON.parse(resp.responseText).category;

              redirectUrl = category ? category[0].summary.categorypageurl : undefined;
          
              if (redirectUrl) {
                redirectUrlObj = new URL(redirectUrl);
                App.router.navigate(redirectUrlObj.pathname + redirectUrlObj.search, {trigger: true, replace: true});
              }
            }

          } catch(e) {
            if (callback) {
              callback.apply(this, model.length ? model : arguments);
            } else {
              CategoryModel.__super__.error.apply(this, model.length ? model : arguments);
            }

          }

        } else {
          if (callback) {
            callback.apply(this, model.length ? model : arguments);
          } else {
            CategoryModel.__super__.error.apply(this, model.length ? model : arguments);
          }
        }
      }

      // Sometimes the depth:2 call comes before the browse category 404
      // In this case we need to apply one more time the listeners to the model
      if ($localStorage.get('gn:categoryIndexLoaded') === false || $localStorage.get('gn:first2levelsLoaded') === true) {
        model.listenTo(Backbone, 'categoryIndexLoaded', _.bind(model.fullLevelError, this, model));
        model.listenTo(Backbone, 'gn:fetchError', _.bind(model.fullLevelError, this, model));
      }
    },

    // Check if one of the categoryIndex completed (sencond level and full index)
    // If not, we wait for them to complete so we can look into the categoryModel object and
    // check if the category is a 'goTo' category.
    success: function(model, resp, options, callback) {
      if (model.get('category') && model.get('category').type === 'GoTo') {
        var overrideUrl = model.get('category').overrideUrl;
        // If the URL doesn't contain '/shop/' we are heading to a 1.0 page
        if (overrideUrl.indexOf('\/shop\/') !== -1) {
          App.router.navigate(model.get('category').overrideUrl, { trigger: true, replace: true });
        } else {
          window.location.href = model.get('category').overrideUrl;
        }
      // We check if the category is clickable='Browse Hide'. If so, we navigate to it's parent url
      } else if (model.get('category') && model.get('category').clickable === 'Browse\u0020Hide') {
        if (model.get('category').parentUrl) {
          App.router.navigate(model.get('category').parentUrl, { trigger: true, replace: true });
        } else {
          if (callback) {
            callback.apply(this, arguments, options);
          } else {
            CategoryModel.__super__.success.apply(this, arguments, options);
          }
        }
      } else {
        if (callback) {
          callback.apply(this, arguments, options);
        } else {
          CategoryModel.__super__.success.apply(this, arguments, options);
        }
      }
    },

    // Here we check if the category is a 'goTo' category. If so, we check its 'overrideUrl' attribute
    // and navigate to this new url.
    goToLogic: function(model, args, options, callback) {
      var currentCategory;

      var callHandler = function(model, args) {
        if (callback) {
          callback.apply(this, model.length ? model : args);
        } else {
          CategoryModel.__super__.error.apply(this, model.length ? model : args);
        }
      };

      // When model category is undefined, it means an error handler has called goToLogic
      if (_.isUndefined(model.get('category'))) {

        if (!App.model.get('categoryIndex')) {
          callHandler(model, arguments);
        } else {
          // We look for the category object
          currentCategory = App.model.get('categoryIndex').menus[model.get('requestParams').categoryId];

          // We check if this is a 'GoTo' category. If so, we redirect app to its category overrideUrl
          // If it's not a 'GoTO' category, then we just call the error handler
          // In case 'currentCategory' is undefined, we wait for the fullLevelCategory to be loaded so we can
          // call the error handler.
          if (currentCategory) {
            if (currentCategory.type === 'GoTo') {
              $localStorage.set('gn:gotosucceed', true);
              if (currentCategory.overrideUrl.indexOf('\/shop\/') !== -1) {
                App.router.navigate(currentCategory.overrideUrl, { trigger: true, replace: true });
              } else {
                window.location.href = currentCategory.overrideUrl;
              }

            } else {
              if ($localStorage.get('gn:categoryIndexLoaded') === false || $localStorage.get('gn:categoryIndexLoaded') === true) {
                callHandler(model, arguments);
              }
            }

          } else {
            if ($localStorage.get('gn:categoryIndexLoaded') === false || $localStorage.get('gn:categoryIndexLoaded') === true) {
              callHandler(model, arguments);
            }
          }

        }

      }

    },

    secLevelError: function(model, resp, options, callback) {
      if ($localStorage.get('gn:first2levelsLoaded')) {
        model.error(model, arguments, options, callback);
      }
    },

    fullLevelError: function(model, resp, options, callback) {
      model.error(model, arguments, options, callback);
    }

  });

  return CategoryModel;
});
