define([
  'backbone',

  // Views
  'views/mainContentView'
], function(Backbone, MainContentView) {

  'use strict';

  var NotSupportedView = MainContentView.extend({

    events: {
      'click #continue-shopping': 'continueShopping'
    },

    init: function() {
      this.options.errorCode = 'notSupported';
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.errorView({ errorCode: this.options.errorCode, fullDesktopLink: this.getFullDesktopLink(), type: this.options.blacklisted }));
    },

    continueShopping: function() {
      var continueUrl = '';

      // Take the user to a specific page based on the feature that is not supported
      switch (this.options.blacklisted) {
      case 'chanel':
        continueUrl = 'shop/beauty-perfume-and-makeup?id=669';
        break;
      }

      if (continueUrl) {
        App.router.navigate(continueUrl, { trigger: true, replace: true });
      }
      else {
        App.router.back();
      }
    },

    getFullDesktopLink: function() {
      var $url = $.url();
      var host = $url.attr('host');

      if (host.indexOf('codemacys') !== -1) {
        host = host.replace('m2qa1.', 'www1.').replace('m.', 'www1.');
      }
      else {
        host = 'www1.macys.com';
      }

      var url = $url.attr('protocol') + '://' + host + $url.attr('relative');

      if (url.indexOf('?') !== -1) {
        url += '&stop_mobi=yes';
      }
      else {
        url += '?stop_mobi=yes';
      }

      return url;
    }

  });

  return NotSupportedView;
});
