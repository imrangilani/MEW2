define([
  'backbone'
], function(Backbone) {
  'use strict';

  return Backbone.Collection.extend({

    // Default time(in ms) to wait before rendering a timeout error
    timeout: 2e5,

    fetch: function(options) {
      options = options || {};
      options = _.extend(options, {
        timeout: options.timeout || this.timeout
      });
      Backbone.Collection.prototype.fetch.call(this, options);
    }
  });

});
