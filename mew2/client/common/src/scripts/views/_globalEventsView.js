define([
  'backbone',
  'util/transition',
  'util/util',
  'config',
  'toggleNav'
], function(Backbone, Transition, util, config, toggleNav) {
  'use strict';

  var globalEventsView = Backbone.View.extend({
    el: $('body'),

    initialize: function() {
      var NEWTAB_PATTERN = /(^customerservice\.|^social\.|\.circularhub\.)/;
      var SCRIPT_PATTERN = /^javascript/;
      var thisView = this;

      $(document).on('click', 'area[href]:not([href^=#]),a[href]:not([href^=#])', function(e) {
        var targetURL = e.currentTarget.href,
            hostname = $.url(targetURL).attr('host');

        if (NEWTAB_PATTERN.test(hostname)) {
          if ($('body').hasClass('nav-toggle')) {
            toggleNav.toggle();
          }

          window.open(targetURL);
          return false;
        }

        // Can't set the cookie when user clicks on a link that calls a javascript method (eg.: javascript:void(0))
        if(!SCRIPT_PATTERN.test(targetURL)) {
          thisView.setForwardPageCookie(targetURL);
        }

        // All relative urls and full urls that have the same hostname as the app's current hostname
        // and have a matching route are processed within the app
        if (window.location.hostname === $.url(this.href).attr('host') && window.location.protocol === 'http:') {
          if (_.isFunction(App.transitions.set)) {
            // Check if a transition is required for the route
            var transition = $(e.currentTarget).data('transition');
            if (typeof transition !== 'undefined') {
              var reverse = ($(e.currentTarget).data('transition-direction') === 'reverse');
              App.transitions.set(new Transition(transition), reverse);
            }
          }

          // Hack to force Backbone to strip query params so that routes are matched properly
          if (App.router.navigate($.url(this.href).attr('relative'), { trigger: true })) {
            // Successfully found a 2.0 route for this url
            e.preventDefault();
            return false;
          }
        }
      });
    },
    setForwardPageCookie: function(targetUrl) {
      var path = $.url(targetUrl).attr('path');
      if (path.indexOf('/account/signin') !== 0 && path.indexOf('/signin') !== 0){
        util.setForwardPageCookie(config.cookies.FORWARDPAGE_KEY.encode, targetUrl);
      }

    },
    remove: function() { }
  });

  return globalEventsView;
});
