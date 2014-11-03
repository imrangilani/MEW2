define([
  'handlebars',

  // Models
  'models/bopsProductModel',

  // Views
  'views/baseView'
], function(Handlebars, BopsProductModel, BaseView) {
  'use strict';

  var ProductAvailabilityView = BaseView.extend({
    events: {
      'click .bops-whats-this-link': 'toggleWhatsThis'
    },

    init: function() {
      var options = this.options;

      this.model = new BopsProductModel({
        id: options.productId,
        product: options.product,
        activeUpc: options.product.activeUpc
      });

      // Certain parts of the template can be rendered immediately
      this.render();

      //Needed for the model to insert error message
      this.model.set('errorHandler', 'ignoreAll');

      // Whenever the bops messaging changes (e.g. when a user selects a new color/size combo),
      // Re-render the availability messaging
      this.listenTo(this.model, 'change:activeUpc', this.renderTemplate);

      if (App.config.ENV_CONFIG.bops_pdp !== 'off') {
        this.listenTo(this.model, 'change:locationNumber', function() {
          // Update the cookie
          this.model.setLocationNumberCookie();

          // we are heavily relying on localStorage here
          // else, on master products, a fetch is called for each member
          this.model.fetch();
        });

        // Only fetch the product availability data (Bops product model data) if location exists.
        // Might not be set in cookie, in which case placeholder message has already been rendered
        if (this.model.get('locationNumber')) {
          // we are heavily relying on localStorage here
          // else, on master products, a fetch is called for each member
          this.model.fetch();
        }

        this.listenTo(this.model, 'modelready', function() {
          this.render();
        });
      }
    },

    toggleWhatsThis: function(e) {
      e.preventDefault();

      var $link = $(e.currentTarget);
      var $content = $link.next('.bops-whats-this-content');

      if ($content.is(':visible')) {
        $content.slideUp();
      } else {
        $content.slideDown();
      }

      return false;
    },

    renderTemplate: function() {
      // We might be re-rendering, and there are events attached to this content.
      // must ensure element events are bound
      this.el = $('#' + this.id);
      this.setElement(this.el, true);

      this.$el.html(TEMPLATE.productAvailability(this.model.attributes));
    }
  });

  Handlebars.registerHelper('upcUnselectedMessage', function(product) {
    var hasColors  = !_.isUndefined(product.colors),
        hasSizes   = !_.isUndefined(product.sizes),
        hasTypes   = !_.isUndefined(product.types);

    if (hasSizes && hasTypes) {
      if (hasColors) {
        return 'color, size and type';
      }
      return 'size and type';
    } else if (hasTypes) {
      if (hasColors) {
        return 'color and type';
      }
      return 'type';
    } else if (hasSizes) {
      if (hasColors) {
        return 'color and size';
      }
      return 'size';
    } else {
      return 'color';
    }
  });

  return ProductAvailabilityView;
});
