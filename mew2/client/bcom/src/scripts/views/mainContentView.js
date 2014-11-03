define([
  // Views
  'views/_mainContentView'
], function(MainContentView) {
  'use strict';

  var BCOMMainContentView = MainContentView.extend({

    initialize: function() {
      this.setPageTitle('Shop Bloomingdale\'s | Designer Dresses, Clothes, Shoes, Handbags, Cosmetics, Home and More');
      this.setCanonical();
      MainContentView.prototype.initialize.apply(this, arguments);
    },

    setCanonical: function() {
      var $url = $.url();
      var host = $url.attr('host');

      if (host.indexOf('bloomingdales.fds.com') !== -1) {
        host = host.replace('m2qa1.', 'www1.').replace('m.', 'www1.');
      }
      else {
        host = 'www1.bloomingdales.com';
      }

      var canonical = $url.attr('protocol') + '://' + host + $url.attr('relative');
      $('link[rel=canonical]').remove();
      $('title').after('<link rel="canonical" href="' + canonical + '" />');
    }

  });

  return BCOMMainContentView;
});
