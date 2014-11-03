define([
  'models/_appModel',
  'util/localstorage',
  'util/util'
], function(AppModel, $localStorage, util) {

  'use strict';

  return AppModel.extend({

    initialize: function() {
      var self = this;
      self.bindEvents();

      setTimeout(function() {
        self.doThreeStepsChecking();
      }, 200);
    },

    bindEvents: function() {
      Backbone.on('gn:loadCategoryIndex', this.loadCategoryIndex, this);
      Backbone.on('gn:loadFirst2lvls', this.loadFirst2lvls, this);
    },

    loadCategoryIndex: function() {
      var self = this,
          key = self.getKey();

      $.ajax({
        url: '/api/v3/catalog/category/index',
        success: function(response) {
          $localStorage.set('gn:categoryIndexLoaded', true);
          $localStorage.set('gn:categoryIndexLoaded' + ':timestamp', new Date().getTime());

          self.set('categoryIndex', self.parse(response).categoryIndex);

          $localStorage.set(key, response);
          $localStorage.set(key + ':timestamp', new Date().getTime());

          self.set('gn:justLoaded', true);

          if (!self.get('gn:isCategoryIndexLoaded')) {
            self.set('gn:isCategoryIndexLoaded', true);
            Backbone.trigger('categoryIndexLoaded');
            util.showNavItems();
            util.hideNavLoading();
          }

          Backbone.trigger('gn:createNav');
        },

        error: function() {
          $localStorage.set('gn:categoryIndexLoaded', false);
          Backbone.trigger('gn:fetchError');
        }
      });
    },

    loadFirst2lvls: function() {
      var self = this,
        key = self.getKey();
      $.ajax({
        url: '/api/v3/catalog/category/index' +
             '?id=118,1,13247,544,26846,669,23930,5991,16904,7495,7497,22672,29391,3536' +
             '&depth=2',
        success: function(response) {
          if (!$localStorage.get('gn:isCategoryIndexLoaded')) {
            var currentId, categoryModel;

            currentId = self.getCurrentId();

            $localStorage.set('gn:first2levelsLoaded', true);
            $localStorage.set('gn:first2levelsLoaded' + ':timestamp', new Date().getTime());

            self.set('categoryIndex', self.parse(response).categoryIndex);

            $localStorage.set(key, response);
            $localStorage.set(key + ':timestamp', new Date().getTime());

            categoryModel = self.get('categoryIndex').menus[currentId];

            if (categoryModel !== undefined && categoryModel.children) {
              if (categoryModel.type !== 'GoTo') {
                if ($localStorage.get('gn:isCategoryIndexLoaded')) {
                  Backbone.trigger('categoryIndexLoaded');
                }
              } else {
                Backbone.trigger('gn:first2levelsLoaded');
                return;
              }

            }
            Backbone.trigger('gn:first2levelsLoaded');
          }
        },

        error: function() {
          Backbone.trigger('gn:loadCategoryIndex');
        }
      });
    },

    getCurrentId: function() {
      var query = $.url(window.location).attr('query'), currentId;

      if ((/\d/).test(query)) {
        currentId = query.match(/id=(\d+)|CategoryID=(\d+)/);

        if (currentId) {
          if (!currentId[1]) {
            currentId = currentId[2];
          } else {
            currentId = currentId[1];
          }
        } else {
          currentId = 'top';
        }
      }

      return currentId;

    },

    doThreeStepsChecking: function() {
      var isCategoryIndexLoaded = util.storage.retrieve('gn:categoryIndexLoaded', this.dataLifeSpan),
          areFirst2lvlsLoaded,
          key = this.getKey();

      if (isCategoryIndexLoaded) {
        this.set('categoryIndex', {
          menus: $localStorage.get(key)
        });
        this.set('gn:justLoaded', false);
        this.set('gn:isCategoryIndexLoaded', true);

        Backbone.trigger('categoryIndexLoaded');

        return;
      } else {
        localStorage.removeItem('gn:categoryIndexLoaded');
      }

      this.listenTo(Backbone, 'gn:first2levelsLoaded', this.loadCategoryIndex);

      areFirst2lvlsLoaded = util.storage.retrieve('gn:first2levelsLoaded', this.dataLifeSpan);

      if (areFirst2lvlsLoaded) {
        this.set('categoryIndex', {
          menus: $localStorage.get(key)
        });
        Backbone.trigger('gn:first2levelsLoaded');
        return;
      }

      if ($.url(window.location).attr('path') !== '/') {
        util.hideNavItems();
        util.showNavLoading();
      }

      Backbone.trigger('gn:loadFirst2lvls');
    }
  });
});
