define([
  'backbone',
  'views/baseView',
  'util/authentication'
], function(Backbone, BaseView, Authentication) {
  'use strict';

  var FooterView = BaseView.extend({

    id: 'mb-footer-container',

    init: function() {
      this.listenTo(Backbone, 'userSignedIn', this.userSignedIn);
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.footer(this.options));
    },

    userSignedIn: function() {
      this.options.signedIn = true;
      this.render();
    },

    logout: function() {
      var authentication = new Authentication();
      authentication.logout();

      this.options.signedIn = false;
      this.render();
    }

  });

  return FooterView;
});
