define([
  'views/modalView',
  'views/forgotPasswordView',
  'models/signInModel',
  'util/multiValueCookie',
  'util/localstorage'
], function(ModalView, ForgotPasswordView, SignInModel, mvCookie, localStorage) {
  'use strict';

  var passwordMatcher = /^[a-zA-Z0-9]{5,16}$/;

  var SignInModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(_.clone(ModalView.prototype.events), {
      'click #mb-j-signin-button': 'signIn',
      'click #mb-j-forgot-password-button': 'forgotPassword'
    }),

    init: function() {
      this.success = false;

      this.model = new SignInModel();
      this.model.set('errorHandler', 'showOverlay');

      this.listenTo(this.model, 'modelready', this.signInSuccess);
      this.listenTo(this.model, 'modelerror', this.signInError);

      this.setSlideVerticalDirection();
    },

    show: function(options) {
      ModalView.prototype.show.apply(this, arguments);

      return this.$deferred = $.Deferred();
    },

    renderTemplate: function() {
      var email = this.restoreUserEmail();

      this.$el.html(TEMPLATE.signInModal());
      this.$el.find('#mb-j-signup-email').val(email);
      this.$el.find('#mb-j-signup-rememberme').prop('checked', !!email);
    },

    postRender: function() {
      ModalView.prototype.postRender.apply(this);
      this.postRenderForgotPassword();

      this.success = false;

      setTimeout(_.bind(function() {
        this.$el.find('#mb-j-signup-email').focus();
      }, this), 1000);
    },

    postRenderForgotPassword: function() {
      
      this.subViews.forgotPasswordView = new ForgotPasswordView({
        el: this.$el.find('#mb-j-forgot-password-container'),
        options: this.getForgotPasswordViewOptions()
      });

      this.listenTo(this.subViews.forgotPasswordView, 'passwordReset', function(credentials) {
        // User must be authenticated after reseting her/his password
        this.$el.find('#mb-j-signup-email').val(credentials.email);
        this.$el.find('#mb-j-signup-password').val(credentials.password);

        this.signIn();
      });
    },

    getForgotPasswordViewOptions: function() {
      return {
        passwordMatcher: passwordMatcher
      };
    },

    signIn: function() {
      var email = this.$el.find('#mb-j-signup-email').val(),
          password = this.$el.find('#mb-j-signup-password').val(),
          rememberMe = this.$el.find('#mb-j-signup-rememberme').is(':checked');

      if (this.isDataValid()) {
        this.model.signIn(email, password, rememberMe);
      }
    },

    signInSuccess: function() {
      this.success = this.model.get('success') || false;

      if (!this.success) {
        return false;
      }

      if (this.model.get('rememberMe')) {
        this.storeUserEmail(this.model.get('email'));
      } else {
        this.storeUserEmail('');
      }

      // Clear the form fields after login
      this.$el.find('#mb-j-signup-email').val();
      this.$el.find('#mb-j-signup-password').val();

      this.back();

      this.$deferred.resolve();
      Backbone.trigger('userSignedIn');

      return true;
    },

    signInError: function() {
      // abstract
    },

    forgotPassword: function() {
      // abstract
    },

    isDataValid: function() {
      var isValid = this.isEmailValid();
      isValid = this.isPasswordValid() && isValid;

      return isValid;
    },

    isEmailValid: function() {
      var $email = this.$el.find('#mb-j-signup-email');
      return ($email.val() !== "") && $email.get(0).validity.valid;
    },

    isPasswordValid: function() {
      var $password = this.$el.find('#mb-j-signup-password');

      return passwordMatcher.test($password.val());
    },

    storeUserEmail: function(email) {
      localStorage.set('userEmail', email);
    },

    restoreUserEmail: function() {
      return localStorage.get('userEmail') || '';
    },

    back: function() {
      ModalView.prototype.back.apply(this);

      this.trigger('done', { success: this.success });

      if (!this.success) {
        this.$deferred.reject();
      }
    }

  });

  return SignInModalView;
});
