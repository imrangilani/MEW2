define([
  'models/baseModel',
  'util/geoCode',
  'util/util'
], function(BaseModel, GeoCode, util) {
  'use strict';

  return BaseModel.extend({
    initialize: function() {
      this.geo = GeoCode.init();
      this.listenTo(this.geo, 'geoCodeLoaded', this.geoCodeLoaded);
    },

    geoCodeLoaded: function() {
      this.trigger('geoCodeLoaded');
    },

    fetch: function(options) {
      var requestParams = this.get('requestParams'),
          errorHandler = options && options.error || _.bind(this.error, this),
          allowZeroResults = options && options.allowZeroResults || true;

      if (requestParams) {
        switch (true) {
          case !!requestParams.predictionsQuery:
            GeoCode.getPlacePredictions(requestParams.predictionsQuery, _.bind(this.success, this), errorHandler);
            break;

          case !!requestParams.reference:
            GeoCode.getLatLngByPlacesReference(requestParams.reference, options.mapContainer, _.bind(this.success, this), errorHandler);
            break;

          case !!requestParams.query:
            GeoCode.getLatLngByTextQuery(requestParams.query, _.bind(this.success, this), errorHandler, allowZeroResults);
            break;

          case !!requestParams.nearby:
            GeoCode.getLocalLatLng(_.bind(this.success, this), errorHandler);
            break;
        }
      }
    },

    parse: function(response) {
      return {
        results: response
      };
    },

    success: function(response) {
      this.set(this.parse(response));
      util.hideLoading();
      this.trigger('modelready');
    },

    error: function(response) {
      BaseModel.prototype.error.apply(this, [this, response]);
    }
  });
});