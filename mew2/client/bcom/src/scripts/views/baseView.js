define([
  // Libraries
  'jquery',

  // Views
  'views/_baseView',

  // Analytics
  'analytics/bloomiesCoremetrics',

  // Util
  'util/util',
  'url-parser'
], function($, BaseView, bloomiesCoremetrics, Util) {

  'use strict';

  var BCOMBaseView = BaseView.extend({
    postRender: function() {
      this.generateCoremetricsLinks();
    },

    generateCoremetricsLinks: function() {
      var view = this;

      this.$('[data-cm-link-click]').each(function() {
        view.generateCoremetricsLink(this);
      });
    },

    generateCoremetricsLink: function(link) {
      var sitePromotion = $(link).data('cm-link-click'),
          href =  $(link).attr('href') || document.location.href,
          $href;

      //add URL parameters
      href = href.replace(/cm_sp\=[^&]*/, 'cm_sp=' + sitePromotion);
      $href =  $.url(href);

      if (!$href.param('cm_sp')) {
        href = Util.buildFullUrl({
          protocol: $href.attr('protocol'),
          host: $href.attr('host'),
          port: $href.attr('port'),
          path: $href.attr('path'),
          query: [$href.attr('query'), 'cm_sp=' + sitePromotion],
          fragment: $href.attr('fragment')
        });
      }

      $(link).attr('href', href);
    },

    scrollToTop: function(timeout, callback) {
      if (_.isUndefined(timeout)) {
        timeout = 300;
      }

      $('html, body').animate({ scrollTop: 0 }, timeout, function() {
        if ($.isFunction(callback)) {
          callback();
        }
      });
    }

  });

  return BCOMBaseView;
});
