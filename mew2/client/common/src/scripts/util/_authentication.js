/**
 * @file _authentication.js
 */

define([
  'config',
  'util/util'
], function(config, util) {
  'use strict';

  var Authentication = function() {
    this.defaults = {
      force: false,
      experience: config.ENV_CONFIG.signin_in_experience || '1.0',
      success: function() { /* no-op */ },
      error: function() { /* no-op */ }
    };
  };

  _.extend(Authentication.prototype, {
    /**
     * Check whether or not a user is signed in
     *
     * @return 0 or 1, depending on sign in status
     */
    isSignedIn: function() {
      // Can't just be an anon. single-return func; we want to check every time
      return $.cookie('SignedIn') === '1';
    },

    /**
     * Authenticate a user.
     *
     * param options {Object} contains any of the following authentication options:
     *    experience: Which authentication experience to display. Possible values: '1.0', '2.0'. Defaults to '1.0'
     *         *NOTE* currently only '1.0' is supported; this option is to provide extensibility in the future
     *    forwardUrl: A url to redirect to after authentication
     *         *NOTE* _mainContentView sets this in postRender; only set here to override (if different than current URL)
     */
    authenticate: function(options) {
      var $url = $.url();

      options = _.defaults((options || {}), this.defaults);

      // Delete nickname cookie
      $.removeCookie('nickname');

      if (options.experience === '1.0') {
        if (options.forwardUrl) {
          // Set forward page
          util.setForwardPageCookie(config.cookies.FORWARDPAGE_KEY.encode, options.forwardUrl);
        }

        // Redirect to 1.0 sign-in page
        var host = $url.attr('host');

        // On port 8080, assume development setup, and force sign-in host to be m.macys.com
        if ($url.attr('port') === '8080') {
          host = 'm.macys.com';
        }

        window.location = 'https://' + host + '/account/signin';
      } else if (options.experience === '2.0') {
        this.showSignInModal(false, options);
      }
    },

    logout: function() {
      // Delete nickname cookie
      $.removeCookie('nickname');
      var $cookieDomain = util.makeCookieDomainName(document.location.hostname);
      // Be sure to pass "domain" and "path" for cookies set on 1.0 experience
      $.removeCookie('SignedIn', { domain: $cookieDomain, path: '/' });
      $.removeCookie('secure_user_token', { domain: $cookieDomain, path: '/' });
    },

    showSignInModal: function(triggeredByPopState, options) {
      require(['views/signInModalView'], function(SignInModalView) {
        var currentView = options.currentView,
            signInModalView;

        if (!currentView.subViews.signInModal) {
          currentView.subViews.signInModal = new SignInModalView({
            id: 'mb-j-login-modal-container'
          });
        }

        signInModalView = currentView.subViews.signInModal;
        signInModalView.render();

        if (!triggeredByPopState) {
          currentView.pushModalState('showSignInModal');
        }

        signInModalView.show()
          .done(options.success)
          .fail(options.error);
      });
    }
      
  });

  return Authentication;
});
