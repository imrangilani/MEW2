define([
  'backbone',

  // Views
  'views/mainContentView'
], function(Backbone, MainContentView) {

  'use strict';

  var errorView = MainContentView.extend({

    events: {
      'click #continue-shopping': 'continueShopping'
    },

    init: function() {
      this.model = new Backbone.Model({
        errorCode: this.getErrorCode(this.options)
      });
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.errorView(this.model.attributes));
    },

    continueShopping: function() {
      App.router.back();
    },

    getErrorCode: function() {
      if (this.options && this.options.statusCode && this.options.statusCode !== 404) {
        return 'unexpectedError';
      } else if (this.options && this.options.statusCode === 404 && /shop\/product/.test(this.options.relativeUrl)) {
        return 'productNotFound';
      } else {
        return 'notFound';
      }
    }

  });

  return errorView;
});
