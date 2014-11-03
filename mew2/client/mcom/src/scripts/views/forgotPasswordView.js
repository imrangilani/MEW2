define([
  // Views
  'views/_forgotPasswordView',
  'util/tooltip'

], function(ForgotPasswordView, tooltip) {
  'use strict';

  var MCOMForgotPasswordView = ForgotPasswordView.extend({
    events: _.extend(_.clone(ForgotPasswordView.prototype.events), {
      'change #mb-j-forgot-password-email': 'emailChanged',
      'change #mb-j-forgot-password-new-password': 'passwordChanged',
      'change #mb-j-forgot-password-verify-password': 'passwordVerifyChanged',
      'input #mb-forgot-password-view-container': 'removeBtnMask',
      'click #mb-forgot-password-captcha-refresh': 'captchaRefresh',
      'keyup input': 'keyup'
    }),

    init: function() {
      ForgotPasswordView.prototype.init.apply(this, arguments);

      this.errorMessages = {
        // Model error Codes
        serviceUnavailable: {
          message: 'We are unable to retrieve your information due to technical difficulties, please try again.'
        },
        invalidEmail: {
          inputField: 'mb-j-forgot-password-email',
          message: 'Your email address must be entered in this format: jane@company.com',
          errorField: 'm-j-forgot-password-email-label'
        },
        emailNotFound: {
          inputField: 'mb-j-forgot-password-email',
          message: 'We were not able to locate a Macy\'s account ' +
                   'associated with that email address. Please try again.',
          errorField: 'm-j-forgot-password-email-label'
        },
        lockedAccount: {
          inputField: 'mb-j-forgot-password-email',
          message: 'We’re sorry. Your account has been suspended due to incorrect sign-in attempts. ' +
                   'For more details, please contact Customer Service at 1-800-777-0000.',
          errorField: 'm-j-forgot-password-email-label'
        },
        challengeFailed: {
          inputField: 'mb-j-forgot-password-captcha',
          message: 'Challenge failed. Try a new challeng.',
          errorField: 'mb-j-forgot-password-captcha'
        },
        challengeInvalid: {
          inputField: 'mb-j-forgot-password-captcha',
          message: 'Please enter the Challenge code.',
          errorField: 'mb-j-forgot-password-captcha'
        },
        wrongHintAnswer: {
          inputField: 'mb-j-forgot-password-hint-answer',
          message: 'The answer you provided to the selected security question does not match what we have on file. Please try again.',
          errorField: 'mb-j-forgot-password-hint-answer-label'
        },
        wrongHintAnswerInvalid: {
          inputField: 'mb-j-forgot-password-hint-answer',
          message: 'Please enter the Answer.',
          errorField: 'mb-j-forgot-password-hint-answer-label'
        },
        passwordMismatch: {
          inputField: 'mb-j-forgot-password-verify-password',
          message: 'We\'re sorry, Passwords does not match. Please try again.',
          errorField: 'mb-forgot-password-view-container'
        },

        // Local error codes
        invalidPassword: {
          inputField: 'mb-j-forgot-password-new-password',
          message: 'Your password must be between 5–16 alphanumeric characters, and cannot include spaces. Example: jane47. Please try again.',
          errorField: 'm-j-forgot-password-new-password-label'
        },
        invalidVerifyPassword: {
          inputField: 'mb-j-forgot-password-verify-password',
          message: 'Your password must be between 5–16 alphanumeric characters, and cannot include spaces. Example: jane47. Please try again.',
          errorField: 'm-j-forgot-password-verify-password-label'
        }
      };

    },

    renderTemplate: function() {
      ForgotPasswordView.prototype.renderTemplate.apply(this, arguments);
    },

    isEmailValid: function(e) {
      var isValid = this.checkValidation('isEmailValid', arguments, 'invalidEmail');
      if (isValid) {
        var $button = $(e.currentTarget);
        $button.addClass('spinner');
      }

      return isValid;
    },

    isCaptchaValid: function(e) {
      var isValid = this.checkValidation('isCaptchaValid', arguments, 'challengeInvalid');
      if (isValid) {
        var $button = $(e.currentTarget);
        $button.addClass('spinner');
      }
      return isValid;
    },

    isSecurityAnswerValid: function(e) {
      var isValid = this.checkValidation('isSecurityAnswerValid', arguments, 'wrongHintAnswerInvalid');
      if (isValid) {
        var $button = $(e.currentTarget);
        $button.addClass('spinner');
      }
      return isValid;
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

    emailChanged: function() {
      this.checkValidation('isEmailValid', null, 'invalidEmail');
    },

    checkValidation: function(methodName, args, errorMessageKey) {
      var isValid = ForgotPasswordView.prototype[methodName].apply(this, args);
      var errorMessage = this.errorMessages[errorMessageKey];

      if (!isValid) {
        this.setFieldAsInvalid('#' + errorMessage.inputField, errorMessage.message);
        var arrow = 1;
        if (errorMessageKey === 'passwordMismatch'){
          arrow = 0;
        }
        this.showMessage([errorMessage.message], '#' + errorMessage.errorField, arrow);
      }else {
        this.setFieldAsValid('#' + errorMessage.inputField, errorMessage.message);
      }

      return isValid;
    },

    passwordChanged: function() {
      return this.checkValidation('isPasswordValid', arguments, 'invalidPassword');
    },

    passwordVerifyChanged: function() {
      return this.checkValidation('isConfirmPasswordValid', arguments, 'invalidVerifyPassword');
    },

    setFieldAsValid: function(field) {
      $(field).closest('.form-item').removeClass('empty-field');
    },

    setFieldAsInvalid: function(field) {
      $(field).closest('.form-item').addClass('empty-field');
    },

    showMessage: function(messages, element, arrow) {
      var message = '';
      _.each(messages, function(idx) {
        message+=idx + '\n';
      });

      message = message || 'We\'re sorry. Due to a technical difficulty we cannot proceed ahead. Please try again.';

      tooltip($(element), message, arrow, 0, 1, $('#mb-j-login-modal-container'));
    },

    renderError: function() {
      var errorCode = this.model.get('errorCode');
      var errorMessage = this.errorMessages[errorCode] || '';
      var errorMsg = '';
      var inputField = '';
      var showArrow = 0;
      if (errorCode === 'unknow') {
        errorMsg = JSON.parse(this.model.get('responseText')).errorDetail;
        inputField = 'mb-forgot-password-view-container';
      } else {
        errorMsg = [errorMessage.message];
        inputField = errorMessage.inputField;
        showArrow = 1;
      }
      if (!inputField) {
        inputField = 'mb-forgot-password-view-container';
        showArrow = 0;
      }
      if (errorMsg) {
        var responseText = this.model.get('responseText');
        errorMsg = JSON.parse(responseText).errorDetail;
      }
      if (errorCode === 'taggedAccount'){
        errorMsg = ['Your Macy\'s account was locked and you\'ll need to create a new password for security reasons. ' +
                    'A time-sensitive email was just sent to ' + this.$el.find('#mb-j-forgot-password-email').val() + 
                    ' with a link and instructions on how to change your password.'];
      }
      if (errorMsg) {
        $('#mb-forgot-password-view-container button').removeClass('spinner');
        if (errorMessage.errorField) {
          this.setFieldAsInvalid($('#' + inputField), errorMsg);
          var domField = $('#' + errorMessage.errorField);
          if (!domField.length){
            domField = $('.m-forgot-password-view-title');
            showArrow = 0;
          }
          this.showMessage(errorMsg, domField, showArrow);
        } else {
          this.showMessage(errorMsg, $('#' + inputField), showArrow);
        }
      }
    },

    resetPassword: function(e) {
      
      var isValid = this.isPasswordValid();
      if (!isValid){
        return false;
      }
      isValid = this.isConfirmPasswordValid() && isValid;
      if (!isValid){
        return false;
      }
      isValid = this.isPasswordMatching() && isValid;

      if (isValid) {
        var $button = $(e.currentTarget);
        $button.addClass('spinner');
      }
      ForgotPasswordView.prototype.resetPassword.apply(this, arguments);
    },

    removeBtnMask: function() {
      $('#mb-forgot-password-view-container button').removeAttr('disabled');
      $('#mb-forgot-password-view-container button').removeClass('m-sign-in-deactivate');
    },

    captchaRefresh: function() {
      $('#mb-forgot-password-captcha-refresh').removeClass('m-j-captcha-refresh').addClass('spinner');
      ForgotPasswordView.prototype.captchaRefresh.apply(this, arguments);
    },

    keyup: function(evt) {
      //GO button tap detection from iOS keypad
      if (evt.keyCode === 13) {
        $('#mb-forgot-password-view-container button').trigger('click');
        $('input').blur();
        return false;
      }
    },

    postRender: function(){
      ForgotPasswordView.prototype.postRender.apply(this, arguments);
      var templateName = 'forgotPassword' + this.currentView[0].toUpperCase() + this.currentView.substring(1);
      if(templateName !== 'forgotPasswordCheckEmail'){
        $(window).scrollTop($('#form-collapsible-forgot-password').offset().top - 50);
      }
      
    }
  });

  return MCOMForgotPasswordView;
});
