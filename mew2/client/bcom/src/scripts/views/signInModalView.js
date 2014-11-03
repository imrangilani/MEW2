define([
  'views/_signInModalView',

  // Util
  'analytics/analyticsTrigger'
], function(SignInModalView, analytics) {
  'use strict';

  var BCOMSignInModalView = SignInModalView.extend({

    events: _.extend(_.clone(SignInModalView.prototype.events), {
      'input #mb-j-signup-email': 'emailChanged',
      'input #mb-j-signup-password': 'passwordChanged',
      'click #b-rememberme-section .b-checkbox-placeholder': 'rememberMeClick',
      'click #mb-j-signup-button': 'createAccount',
      'click #b-account-benefits-section a': 'accountBenefitsClick',
      'click #b-privacy-practices-section a': 'privacyPracticesClick',
      'click #b-forgot-password-section [data-expandable="button"]': 'forgotPasswordClick'
    }),

    renderTemplate: function() {
      SignInModalView.prototype.renderTemplate.apply(this, arguments);
      this.$errorContainer = this.$el.find('#b-signin-general-error .b-error-text');

      this.triggerSignInPageViewAnalytics();
    },

    getForgotPasswordViewOptions: function() {
      var options = SignInModalView.prototype.getForgotPasswordViewOptions.apply(this, arguments) || {};

      return _.extend(options, {
        // Share the common coremetrics methods
        analytics: {
          triggerSignInPageViewAnalytics: this.triggerSignInPageViewAnalytics
        }
      });
    },

    signIn: function() {
      this.triggerSignInAnalytics();
      SignInModalView.prototype.signIn.call(this, arguments);
    },

    signInSuccess: function() {
      SignInModalView.prototype.signInSuccess.apply(this, arguments);
      this.triggerSignInRegistrationAnalytics(this.model.get('email'));
    },

    signInError: function() {
      var errorCode = this.model.get('errorCode'),
          errorMessage = this.model.get('errorMessage'),
          cmAttrValue;

      SignInModalView.prototype.signInError.apply(this, arguments);

      switch (errorCode) {
        case 'unknow':
        case 'serviceUnavailable':
          errorMessage = 'We are unable to retrieve your information due to technical difficulties, please try again.';
          cmAttrValue = 'database_down';
          break;
        case 'invalidCredentials':
          errorMessage = 'That email address/password combination is not in our records. Forgot Your Password? Reset it now';
          cmAttrValue = 'incorrect_password';
          break;
        case 'maxLoginAttemps':
          errorMessage = 'That email address/password combination is not in our records. Forgot Your Password? Reset it now';
          cmAttrValue = 'account_locked';
          break;
        case 'lockedAccount':
          cmAttrValue = 'account_locked';
          break;
        case 'invalidData':
        case 'taggedAccount':
          // For these cases we need to display the same message returned by WSSG service
          break;
      };

      if (errorMessage) {
        this.showErrorMessage(errorMessage);
      }

      if (cmAttrValue) {
        this.triggerSignInPageViewAnalytics(cmAttrValue);
      }

      if (errorCode === 'maxLoginAttemps') {
        this.showForgotPasswordForm();
      }
    },

    back: function() {
      if (!this.success) {
        this.triggerBackAnalytics();
      }

      SignInModalView.prototype.back.call(this, arguments);
    },

    rememberMeClick: function(e) {
      var $target = $(e.currentTarget),
          $input = $target.closest('#b-rememberme-section').find('input');

      // The checkbox hasn't be [un]checked at this moment.
      // In this case, if it is still checked we need to
      // trigger the 'Forgot Me' event (oposite event)
      if ($input.is(':checked')) {
        this.triggerForgetMeAnalytics();
      } else {
        this.triggerRememberMeAnalytics();
      }
    },

    forgotPasswordClick: function(e) {
      var $target = $(e.currentTarget),
          $container = $target.closest('[data-expandable="container"]');

      if ($container.hasClass('b-expandable-closed')) {
        this.scrollToForgotPasswordForm();
        this.triggerForgotPasswordAnalytics();
      }
    },

    // Expand the forgot password section and scroll the page to get it in focus
    showForgotPasswordForm: function() {
      var $forgotPasswordSection = this.$el.find('#b-forgot-password-section');
      var $expandableContainer = $forgotPasswordSection.find('[data-expandable="container"]');
      var $expandableButton = $expandableContainer.find('[data-expandable="button"]');

      // Fill the email field on "Forgot Password" section
      this.$el.find('#mb-j-forgot-password-email').val(this.$el.find('#mb-j-signup-email').val());

      // Expand the "Forgot Password" section
      if ($expandableContainer.hasClass('b-expandable-closed')) {
        // Trigger the event that will be handled by globalEvents
        $expandableButton.trigger('click');
      }

      this.scrollToForgotPasswordForm();
    },

    scrollToForgotPasswordForm: function() {
      var $modalHeader = this.$el.find('.mb-modal-header');
      var $forgotPasswordSection = this.$el.find('#b-forgot-password-section');

      $('html, body').animate({
        scrollTop: this.$el.scrollTop() + $forgotPasswordSection.offset().top - $modalHeader.height()
      }, 500);
    },

    createAccount: function() {
      this.triggerCreateAccountAnalytics();
    },

    accountBenefitsClick: function(e) {
      this.triggerAccountBenefitsAnalytics();
    },

    privacyPracticesClick: function() {
      this.triggerPrivacyPracticesAnalytics();
    },

    emailChanged: function(e) {
      var $target = $(e.currentTarget);

      this.setFieldAsValid($target);
      this.clearRememberMe();
      this.hideErrorMessage();
    },

    passwordChanged: function(e) {
      var $target = $(e.currentTarget);

      this.setFieldAsValid($target);
      this.hideErrorMessage();
    },

    clearRememberMe: function() {
      this.$el.find('#mb-j-signup-rememberme').prop('checked', false);
    },

    isEmailValid: function() {
      var isValid = SignInModalView.prototype.isEmailValid.apply(this, arguments);

      if (!isValid) {
        this.setFieldAsInvalid('#mb-j-signup-email');
        this.triggerSignInPageViewAnalytics('invalid_email');
      }

      return isValid;
    },

    isPasswordValid: function() {
      var isValid = SignInModalView.prototype.isPasswordValid.apply(this, arguments);

      if (!isValid) {
        this.setFieldAsInvalid('#mb-j-signup-password');
        this.triggerSignInPageViewAnalytics('invalid_password');
      }

      return isValid;
    },

    showErrorMessage: function(message) {
      this.$errorContainer.text(message);
      this.$errorContainer.closest('.b-error-container').css('display', 'block');
    },

    hideErrorMessage: function() {
      this.$errorContainer.closest('.b-error-container').css('display', 'none');
    },

    setFieldAsValid: function($field) {
      $field.closest('.form-item').removeClass('b-input-error');
    },

    setFieldAsInvalid: function(fieldSelector) {
      this.$el.find(fieldSelector).closest('.form-item').addClass('b-input-error');
    },

    triggerSignInPageViewAnalytics: function(attributes) {
      var data = {
        tagType: 'pageViewTag',
        pageId: 'Sign In (si-xx-xx-xx.index)',
        categoryId: 'si-xx-xx-xx'
      };

      if (attributes) {
        // If 'attributes' is not an object we need to convert it.
        // This allows users to pass strings or integers when he/she need to pass only one attribute.
        if (!_.isObject(attributes)) {
          attributes = {
            1: attributes
          };
        }

        data.attributes = attributes;
      }

      analytics.triggerTag(data);
    },

    triggerSignInAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'sign_in-sign_in',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerSignInRegistrationAnalytics: function(email) {
      analytics.triggerTag({
        tagType: 'registrationTag',
        email: email
      });
    },

    triggerRememberMeAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'remember_me-sign_in',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerForgetMeAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'forget_me-sign_in',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerForgotPasswordAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'sign_in-forgot_password',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerCreateAccountAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'sign_in-create_account',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerAccountBenefitsAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'benefits-privacy_policy',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerPrivacyPracticesAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'sign_in-privacy_policy',
        elementCategory: 'SIGN_IN'
      });
    },

    triggerBackAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'sign_in-back',
        elementCategory: 'SIGN_IN'
      });
    }

  });

  return BCOMSignInModalView;
});
