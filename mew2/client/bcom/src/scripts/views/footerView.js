define([
  'views/_footerView'
], function(FooterView) {
  'use strict';

  var BCOMFooterView = FooterView.extend({
    events: {
      'click #b-footer-sign-in-out #b-footer-sign-out-link': 'logout'
    },

    userSignedIn: function() {
      var $link;

      FooterView.prototype.userSignedIn.apply(this, arguments);

      $link = this.$el.find('#b-footer-sign-in-out #b-footer-sign-out-link');
      this.generateCoremetricsLink($link);
    }

  });

  return BCOMFooterView;

});
