define([
  'models/baseModel',
  'util/localstorage',
  'util/util'
], function(BaseModel, $localStorage, util) {

  'use strict';

  return BaseModel.extend({

    getKey: function() {
      return $.url().attr('host') + '_catIndex';
    },

    isStoredInLocalStorage: true,

    // 2 hours
    dataLifeSpan: (1000 * 60) * 60 * 2,

    initialize: function() {
      var self = this;
      this.bindEvents();
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
        url: '/api/v3/catalog/category/index?depth=2',
        success: function(response) {
          var currentId, categoryModel;

          currentId = self.getCurrentId();

          $localStorage.set('gn:first2levelsLoaded', true);
          $localStorage.set('gn:first2levelsLoaded' + ':timestamp', new Date().getTime());

          self.set('categoryIndex', self.parse(response).categoryIndex);

          $localStorage.set(key, response);
          $localStorage.set(key + ':timestamp', new Date().getTime());

          categoryModel = App.model.attributes.categoryIndex.menus[currentId];
          if (categoryModel !== undefined && categoryModel.children) {

            if (categoryModel.type !== 'GoTo') {

              if ($localStorage.get('gn:isCategoryIndexLoaded')) {
                Backbone.trigger('categoryIndexLoaded');
              }
            } else {
              return;
            }

          }
          Backbone.trigger('gn:first2levelsLoaded');
        },

        error: function() {
          Backbone.trigger('gn:loadCategoryIndex');
        }

      });
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

      Backbone.trigger('gn:loadFirst2lvls');
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
      } else {
        currentId = 'top';
      }

      return currentId;

    },

    parse: function(response) {
      var map = {
        b: 'brandflyout',
        o: 'overrideUrl',
        i: 'brandIndexURL',
        e: 'passThru',
        n: 'name',
        t: 'type',
        u: 'url',
        v: 'viewless',
        p: 'parent',
        c: 'children',
        g: 'gotoId',
        r: 'remain',
        s: 'secure',
        f: 'fobCatId',
        a: 'cm'
      };

      return {
        categoryIndex: {
          menus: _.each(response, function(menu) {
            return this.mapAliases(menu, map);
          }, this)
        }
      };
    },

    /**
     * Maps minified object keys to attribute properties
     * @param  {Object} object Source object to be transformed
     * @param  {Object} map    Mapping of minified properties to attributes
     * @return {Object}
     */
    mapAliases: function(object, map) {
      _.each(object, function(value, key) {
        if (key in map) {
          object[map[key]] = value;
          delete object[key];
        }
      });
      return object;
    },

    isParentOfTier2Remain: function(categoryId) {
      return this.has('categoryIndex') &&
            this.get('categoryIndex').menus[categoryId] &&
            this.get('categoryIndex').menus[categoryId].children &&
            _.find(this.get('categoryIndex').menus[categoryId].children, function(id) {
              return this.get('categoryIndex').menus[id].remain;
            }, this);
    },

    isTier2Remain: function(categoryId) {
      return this.has('categoryIndex') &&
             this.get('categoryIndex').menus[categoryId] &&
             this.get('categoryIndex').menus[categoryId].remain;
    }
  });

});
