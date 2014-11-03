define([
  'models/baseModel',
  'models/storeResultsModel',
  'util/util'
], function(BaseModel, StoreResultsModel, util) {
  'use strict';

  var MAX_FAVORITES = 15;

  var MCOMStoreFavoritesModel = BaseModel.extend({
    FAVORITE_EXISTS: -1,
    FAVORITE_EXCEEDS_MAX: -2,

    initialize: function() {
      this._hasFavorites = false;

      // Grab an array of favorites from localstorage, if they exist
      var stored = util.storage.retrieve('favoriteStores');
      this._favorites = [];

      if (!_.isEmpty(stored)) {
        this._favorites = _.map(stored.split(','), function(locationNumber) {
          return parseInt(locationNumber);
        });

        if (!_.isEmpty(this._favorites)) {
          this._hasFavorites = true;
        }
      }
    },

    hasFavorites: function() {
      return this._hasFavorites;
    },

    inFavorites: function(id) {
      return (_.indexOf(this._favorites, parseInt(id)) !== -1);
    },

    addFavorite: function(id) {
      var numFavorites = _.size(this._favorites);

      if (numFavorites < MAX_FAVORITES) {
        id = parseInt(id);

        if (!this.inFavorites(id)) {
          this._favorites.push(id);
          util.storage.store('favoriteStores', this._favorites);
          this._hasFavorites = true;
          return true;
        }
        else {
          return this.FAVORITE_EXISTS;
        }
      }

      return this.FAVORITE_EXCEEDS_MAX;
    },

    removeFavorite: function(id) {
      _.remove(this._favorites, function(favoriteId) {
        return favoriteId === id;
      });

      if (_.isEmpty(this._favorites)) {
        util.storage.remove('favoriteStores');
        this._hasFavorites = false;
      }
      else {
        util.storage.store('favoriteStores', this._favorites);
      }
    },

    url: function() {
      return '/api/v2/store/detail/' + this._favorites.join(',');
    },

    parse: function(response) {
      this.parseFavorites(response.stores, true);
      return StoreResultsModel.prototype.parse.call(this, response);
    },

    parseFavorites: function(stores, forceTrue) {
      // For the storeFavoritesModel, we know all stores are in favorites, so forceTrue to avoid unneeded logic.
      // However, parseFavorites can be called directly, in which case real-time checking occurs.
      _.each(stores, _.bind(function(store) {
        store.isInFavorites = forceTrue || this.inFavorites(store.locationNumber);
      }, this));
    },

    isOpenNow: function() {
      return StoreResultsModel.prototype.isOpenNow.apply(this, arguments);
    }
  });

  return MCOMStoreFavoritesModel;
});
