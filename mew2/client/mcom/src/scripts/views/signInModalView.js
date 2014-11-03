define([
  'views/_signInModalView',
  'util/tooltip',
  'analytics/analyticsTrigger',
  'util/util',
  'widgets/toggleSelect'
], function(SignInModalView, tooltip, analytics, util) {
  'use strict';

  var MCOMSignInModalView = SignInModalView.extend({

    events: _.extend(_.clone(SignInModalView.prototype.events), {
      //'change #mb-j-signup-email': 'emailChanged',
      //'change #mb-j-signup-password': 'passwordChanged',
      'keyup #mb-j-signup-email, #mb-j-signup-password': 'keyup',
      'click .form-collapsible-label': 'toggleCollapsible',
      'click #m-sign-in-reset-passowrd': 'resetPassword',
      'input #mb-j-signup-email, #mb-j-signup-password': 'removeBtnMask',
      'click #mb-j-signin-create-account-button': 'doCreateAccountClickAnalytics',
      'click .m-checkbox > .m-checkbox-placeholder': 'triggerCustomCheckboxClick'
    }),

    emailInvalidMsg: 'Your email address must be entered in this format: jane@company.com',
    passwordInvalidMsg: 'Your password must be between 5–16 alphanumeric characters, and cannot include spaces. Example: jane47. Please try again.',

    toggleCollapsible: function(e) {
      var $email = this.$el.find('#mb-j-signup-email').val();
      var $formCollapsible = $(e.currentTarget).closest('.form-collapsible');
      $formCollapsible.toggleClass('expanded');
      this.$el.find('#mb-j-forgot-password-email').val($email);
      if ($email) {
        var $forgotPasswordViewContainer = $('#mb-forgot-password-view-container button');
        $forgotPasswordViewContainer.removeAttr('disabled');
        $forgotPasswordViewContainer.removeClass('m-sign-in-deactivate');
      }

      $('#mb-login-modal-form div').removeClass('empty-field');
      $('.m-sigin-in-field-error').html('');
      var $forgotPasswordBtnDisable = $('.m-button-disable-forgot-password-active');
      if ($formCollapsible.hasClass('expanded')) {
        this.doForgotPasswordClickAnalytics();
        
        $forgotPasswordBtnDisable.attr('disabled', 'disabled');
        $('#mb-j-signin-create-account-button').css({ 'pointer-events': 'none' });
        $forgotPasswordBtnDisable.addClass('m-sign-in-deactivate');
        setTimeout(_.bind(function() {
          this.resetPassword();
        }, this), 500);
      }else {
        $(window).scrollTop(0);
        $forgotPasswordBtnDisable.removeAttr('disabled');
        $('#mb-j-signin-create-account-button').css({ 'pointer-events': 'auto' });
        $forgotPasswordBtnDisable.removeClass('m-sign-in-deactivate');
      }
    },

    resetPassword: function() {
      $(window).scrollTop(this.$('#form-collapsible-forgot-password').offset().top - 50);
    },

    renderTemplate: function() {
      SignInModalView.prototype.renderTemplate.apply(this, arguments);
      this.$errorContainer = this.$('#mb-j-general-error-messages');

      $('#m-sign-in-reset-passowrd').live('click', _.bind(function() {
        this.$('.form-collapsible-label').trigger('click');
      }, this));

      this.doInitialPageViewAnalytics();
    },

    keyup: function(evt) {
      //GO button tap detection from iOS keypad
      $('.m-sigin-in-field-error').html('');
      if (evt.keyCode === 13) {
        this.signIn();
        $('input').blur();
        return false;
      }
    },

    emailChanged: function(evt) {
      var nEmail = $(evt.target).val();
      var email = this.restoreUserEmail();
      if (email === nEmail) {
        this.updateRememberMe(true);
      }else {
        this.updateRememberMe(false);
      }
      var isEmailValid = this.isEmailValid();
      if (!isEmailValid) {
        this.setFieldAsInvalid($(evt.target));
        this.showMessage([{ 'errorMsg': this.emailInvalidMsg,'efield': 'm-j-login-email-errormsg', 'field': 'mb-j-signup-email-label'}], $('#mb-j-signup-email-label'), 1);
      }else {
        this.setFieldAsValid($(evt.target));
        //this.hideMessage();
      }

      return false;
    },

    passwordChanged: function(evt) {
      var isPasswordValid = this.isPasswordValid();
      if (!isPasswordValid) {
        this.setFieldAsInvalid($(evt.target));
        this.showMessage([{'errorMsg': this.passwordInvalidMsg, 'efield': 'm-j-login-password-errormsg', 'field': 'mb-j-signup-password-label'}], $('#mb-j-signup-password-label'), 1);
      }else {
        this.setFieldAsValid($(evt.target));
        //this.hideMessage();
      }
      return false;
    },

    signIn: function(e) {
      var isEmailValid = this.isEmailValid();
      var isPasswordValid = this.isPasswordValid();
      var errorDetails = [];
      if (!isEmailValid) {
        errorDetails.push({'errorMsg': this.emailInvalidMsg, 'efield': 'm-j-login-email-errormsg', 'field': 'mb-j-signup-email-label'});
      }
      if (!isPasswordValid) {
        errorDetails.push({'errorMsg': this.passwordInvalidMsg, 'efield': 'm-j-login-password-errormsg', 'field': 'mb-j-signup-password-label'});
      }

      !isEmailValid ? $('#mb-j-signup-email-label').addClass('empty-field') : $('#mb-j-signup-email-label').removeClass('empty-field');
      !isPasswordValid ? $('#mb-j-signup-password-label').addClass('empty-field') : $('#mb-j-signup-password-label').removeClass('empty-field');

      if (errorDetails.length === 0) {
        if (e) {
          var $button = $(e.currentTarget);
          $button.addClass('spinner');
        }
        SignInModalView.prototype.signIn.apply(this);
      } else {
        this.showMessage(errorDetails, $('#mb-login-modal-form'), 0);
      }

    },

    signInSuccess: function() {
      SignInModalView.prototype.signInSuccess.apply(this, arguments);
      this.doSignInRegistrationAnalytics(this.model.get('email'));
    },

    signInError: function() {
      var errorCode = this.model.get('errorCode'),
          errorMessage = this.model.get('errorMessage');

      if (!errorCode) {
        var responseText = this.model.get('responseText');
        errorMessage = JSON.parse(responseText).errorDetail;
      }

      SignInModalView.prototype.signInError.apply(this, arguments);

      switch (errorCode) {
        case 'unknow':
        case 'serviceUnavailable':
          errorMessage = 'We are unable to retrieve your information due to technical difficulties, please try again.';
          break;
        case 'invalidData':
          errorMessage = 'Your email address must be entered in this format \'jane@company.com\' and ' +
                         'your password must be between 5–16 alphanumeric characters, and cannot include spaces. ' +
                         'Example: jane47. Please try again.';
          break;
        case 'invalidCredentials':
        case 'maxLoginAttemps':
          errorMessage = 'That email address/password combination is not in our records.';
          break;
        case 'lockedAccount':
        case 'taggedAccount':
          errorMessage = 'Your Macy\'s account was locked and you\'ll need to create a new password for security reasons. <br/>' +
                        'A time-sensitive email was just sent to ' + this.$el.find('#mb-j-signup-email').val()  + 
                        ' with a link and instructions on how to change your password.';
          
          break;
      }
      
      if (errorMessage) {
        this.showMessage([errorMessage], $('#mb-login-modal-form'), 0, errorCode);
      }
      
      if (errorCode === 'maxLoginAttemps') {
        this.$('.form-collapsible-label').trigger('click');
      }
      $('#mb-login-modal-form button').removeClass('spinner');
    },

    showMessage: function(messages, element, arrow, errorCode) {
      var message = '';
      if (messages.length > 1){
        message = 'Please correct the highlighted areas to proceed.';
        _.each(messages, function(idx) {
          if (_.isObject(idx)) {
            $('#' + idx.efield).html(idx.errorMsg).css({'padding': '5px 0 5px 0' });
          } else {
            message = message + '<br/>';
          }
        });
        $('#mb-login-modal-form').on('touchstart mouseup', _.bind(function() {
          $('.m-sigin-in-field-error').html('').removeAttr('style');
          $('#mb-login-modal-form').off('touchstart mouseup');
        }, this));
      }else {
          var obj = messages[0];
          if (_.isObject(obj)) {
            message += obj.errorMsg + '<br/>';
            if (obj.field) {
              arrow = 1;
              element = $('#' + obj.field);
            }
         } else {
            message = obj;
          }
      }
      

      message = message || 'We\'re sorry. Due to a technical difficulty we cannot proceed ahead. Please try again.';
      var ttel = tooltip(element, message, arrow, 0, -1, $('#mb-j-login-modal-container'));
      if (arrow === 0) {
        ttel.css({
          top: 25
        });
      }
      ttel.css({
        width: '94%',
        'margin-left': '3%'
      }).find('.tt-content').css({padding: '10px 0'});
      
    },

    hideMessage: function() {
      this.$errorContainer.closest('div').parent().removeClass('error-messages-show');
    },

    setFieldAsValid: function($field) {
      $field.closest('.form-item').removeClass('empty-field');
    },

    setFieldAsInvalid: function($field) {
      $field.closest('.form-item').addClass('empty-field');
    },

    updateRememberMe: function(value) {
      this.$el.find('#mb-j-signup-rememberme').prop('checked', value);
    },

    postRenderForgotPassword: function() {
      SignInModalView.prototype.postRenderForgotPassword.apply(this, arguments);
    },

    removeBtnMask: function() {
      var $signInButton = $('#mb-j-signin-button');
      $signInButton.removeAttr('disabled');
      $signInButton.removeClass('m-sign-in-deactivate');
    },

    doInitialPageViewAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: 'Sign In (si-xx-xx-xx.index)',
        categoryId: 'si-xx-xx-xx.index'
      });
    },

    doForgotPasswordClickAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Forgot PW Link',
        elementCategory: 'Sign In'
      });
    },

    doCreateAccountClickAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'button_create_new_account',
        elementCategory: 'Sign In'
      });
    },

    doSignInRegistrationAnalytics: function(email) {
      analytics.triggerTag({
        tagType: 'registrationTag',
        cd: email,
        em: email
      });
    },

    /**
    *Need to move this to global events
    **/
    triggerCustomCheckboxClick: function(e) {
      var $checkbox = $(e.currentTarget).parent().find('input[type=checkbox]').eq(0);
      $(e.currentTarget).toggleClass('checked', !$checkbox.is(':checked'));
      if (!$checkbox.is(':disabled')) {
        $checkbox.prop('checked', !$checkbox.is(':checked'));
      }
    }

  });

  Handlebars.registerHelper('getDomainURL', function() {
    return 'https://' + document.location.hostname;
  });

  return MCOMSignInModalView;
});
