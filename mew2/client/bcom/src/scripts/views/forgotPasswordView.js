define([
  // Views
  'views/_forgotPasswordView'

], function(ForgotPasswordView) {
  'use strict';

  var BCOMForgotPasswordView = ForgotPasswordView.extend({
    events: _.extend(_.clone(ForgotPasswordView.prototype.events), {
      'input #mb-j-forgot-password-email': 'clearFieldError',
      'input #mb-j-forgot-password-hint-answer': 'clearFieldError',
      'input #mb-j-forgot-password-new-password': 'clearFieldError',
      'input #mb-j-forgot-password-verify-password': 'clearFieldError',
      'input #mb-j-forgot-password-captcha': 'clearFieldError'
    }),

    init: function() {
      ForgotPasswordView.prototype.init.apply(this, arguments);

      // Set common analytics methods from SignIn view
      this.triggerSignInPageViewAnalytics = this.options.analytics.triggerSignInPageViewAnalytics;

      this.errorConfig = {
        // Model error Codes
        serviceUnavailable: {
          message: 'We are unable to retrieve your information due to technical difficulties, please try again.'
        },
        invalidEmail: {
          inputField: 'mb-j-forgot-password-email',
          message: 'Your email address must be entered in this format: jane@company.com'
        },
        emailNotFound: {
          inputField: 'mb-j-forgot-password-email',
          message: 'We were not able to locate a Bloomingdale\'s account ' + 
                   'associated with that email address. Please try again.'
        },
        lockedAccount: {
          inputField: 'mb-j-forgot-password-hint-answer',
          cmAttrValue: 'account_locked'
        },
        taggedAccount: {
          inputField: 'mb-j-forgot-password-email',
          cmAttrValue: 'account_locked'
        },
        challengeFailed: {
          inputField: 'mb-j-forgot-password-captcha',
          message: 'Please enter the characters displayed in the image.',
          messagePriority: ['server', 'client']
        },
        wrongHintAnswer: {
          inputField: 'mb-j-forgot-password-hint-answer',
          message: 'The answer you provided to the selected security question does not match what we have on file. Please try again.',
          messagePriority: ['server', 'client']
        },
        passwordMismatch: {
          inputField: 'mb-j-forgot-password-verify-password',
          message: 'We\'re sorry, Passwords does not match. Please try again.'
        },

        // Local error codes
        invalidPassword: {
          inputField: 'b-forgot-password-error-invalid-new-password',
          message: 'Your password must be between 5–16 alphanumeric characters, and cannot include spaces. Example: jane47. Please try again.'
        },
        invalidVerifyPassword: {
          inputField: 'mb-j-forgot-password-verify-password',
          message: 'Your password must be between 5–16 alphanumeric characters, and cannot include spaces. Example: jane47. Please try again.'
        }
      };

    },

    renderTemplate: function() {
      ForgotPasswordView.prototype.renderTemplate.apply(this, arguments);

      this.$errorContainer = this.$el.find('#b-forgot-password-general-error');
    },

    renderError: function() {
      var errorCode = this.model.get('errorCode');
      var errorConfig = this.errorConfig[errorCode] || {};
      var errorMessage = this.getErrorMessage(this.model, errorConfig);
      var cmAttrValue = errorConfig.cmAttrValue;

      if (errorMessage) {
        if (errorConfig.inputField) {
          this.setFieldAsInvalid('#' + errorConfig.inputField, errorMessage);
        } else {
          this.showGeneralErrorMessage(errorMessage);
        }
      }

      if (cmAttrValue) {
        this.triggerSignInPageViewAnalytics(cmAttrValue);
      }
    },

    getErrorMessage: function(model, errorConfig) {
      var message,
          messagePriority = errorConfig.messagePriority || ['client', 'server'],
          messageGetters = {
            server: function() {
              return model.get('errorMessage');
            },
            client: function() {
              return errorConfig.message;
            }
          };

      _.each(messagePriority, function(priorityName) {
        if (message) {
          return;
        }

        message = _.result(messageGetters, priorityName);
      });

      return message;
    },

    resetPasswordEmailSent: function() {
      this.triggerSignInPageViewAnalytics('password_email_sent');
    },

    isEmailValid: function() {
      return this.checkValidation('isEmailValid', arguments, 'invalidEmail');
    },

    isCaptchaValid: function() {
      return this.checkValidation('isCaptchaValid', arguments, 'challengeFailed');
    },

    isSecurityAnswerValid: function() {
      return this.checkValidation('isSecurityAnswerValid', arguments, 'wrongHintAnswer');
    },

    isPasswordValid: function() {
      return this.checkValidation('isPasswordValid', arguments, 'invalidPassword');
    },

    isConfirmPasswordValid: function() {
      return this.checkValidation('isConfirmPasswordValid', arguments, 'invalidVerifyPassword');
    },

    isPasswordMatching: function() {
      return this.checkValidation('isPasswordMatching', arguments, 'passwordMismatch');
    },

    checkValidation: function(methodName, args, errorMessageKey) {
      var isValid = ForgotPasswordView.prototype[methodName].apply(this, args);
      var errorMessage = this.errorConfig[errorMessageKey];

      if (!isValid) {
        this.setFieldAsInvalid('#' + errorMessage.inputField, errorMessage.message);
      }

      return isValid;
    },

    clearFieldError: function(e) {
      var $target = $(e.currentTarget);

      this.setFieldAsValid($target);
      this.hideErrorMessage();
    },

    showGeneralErrorMessage: function(message) {
      this.$errorContainer.text(message);
      this.$errorContainer.css('display', 'block');
    },

    hideErrorMessage: function() {
      this.$errorContainer.css('display', 'none');
    },

    setFieldAsValid: function($field) {
      $field.closest('.form-item').removeClass('b-input-error');
    },

    setFieldAsInvalid: function(fieldSelector, message) {
      var $target = this.$el.find(fieldSelector);
      var $formItem = $target.closest('.form-item');
      var $errorText = $formItem.find('.b-input-field-error .b-input-field-error-text');

      $formItem.addClass('b-input-error');

      if (message) {
        $errorText.html(message);
        $errorText.css('display', 'block');
      } else {
        $errorText.css('display', 'none');
      }
    }

  });

  return BCOMForgotPasswordView;
});
