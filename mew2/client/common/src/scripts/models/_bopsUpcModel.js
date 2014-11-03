/**
 * @file _bopsUpcModel.js
 */

define([
  'models/bopsModel',
  'util/util'
], function(BopsModel, util) {

  'use strict';

  return BopsModel.extend({
    defaults: function() {
      return _.extend(BopsModel.prototype.defaults(), {
        requestParams: {
          zipCode: null,
          latitude: null,
          longitude: null,
          distance: null
        },

        // Hold information about the default location (used to auto-populate inputs)
        locationNumber: null,
        defaultZipCode: null,
        locationZipCode: null,
        // Without specifying them here resetModel will remove them
        errorContainer: this.$el,
        errorHandler: 'showModal'
      });
    },

    url: function() {
      return this.urlRoot + '/upc/' + this.attributes.id + util.buildUrl(this.get('requestParams'));
    },

    resetRequestParams: function() {
      var defaultAttrs = _.union(_.keys(this.defaults()), ['product']);
      var removableAttrs = _.difference(_.keys(this.attributes), defaultAttrs);

      _.each(removableAttrs, function(attrName) {
        this.unset(attrName, { silent: true });
      }.bind(this));
    }
  });
});
