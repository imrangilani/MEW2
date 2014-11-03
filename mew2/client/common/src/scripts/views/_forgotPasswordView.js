define([
  // Views
  'views/baseView',

  // Models
  'models/forgotPasswordModel'

], function(BaseView, ForgotPasswordModel) {
  'use strict';

  var ForgotPasswordView = BaseView.extend({
    events: {
      'click #mb-j-forgot-password-button-show-hint-question': 'showHintQuestion',
      'click #mb-j-forgot-password-button-check-hint-answer': 'checkHintAnswer',
      'click #mb-j-forgot-password-button-reset-password': 'resetPassword',
      'click #mb-j-forgot-password-button-check-captcha': 'checkCaptcha',
      'click #mb-forgot-password-captcha-refresh': 'captchaRefresh'
    },

    init: function() {
      this.model = new ForgotPasswordModel();
      this.model.set('errorHandler', 'ignoreAll');

      this.listenTo(this.model, 'modelready', this.render);
      this.listenTo(this.model, 'modelerror', this.renderError);

      this.reset();
      this.render();
    },

    // Reset the modal's state and delete all sensitive data
    reset: function() {
      this.currentView = 'checkEmail';
      this.model.cleanup();
    },

    // Render one of the following "Forgot Password" views based on `this.currentView`.
    //   - forgotPasswordCheckEmail
    //   - forgotPasswordCaptcha
    //   - forgotPasswordEmailConfirmation
    //   - forgotPasswordHintQuestion
    //   - forgotPasswordResetPassword
    renderTemplate: function() {
      var templateName = 'forgotPassword' + this.currentView[0].toUpperCase() + this.currentView.substring(1);

      if (!this.$viewContainer) {
        this.$el.html(TEMPLATE.forgotPassword());
        this.$viewContainer = this.$el.find('#mb-forgot-password-view-container');
      }
      
      this.$viewContainer.html(TEMPLATE[templateName](this.model.attributes));
    },

    showHintQuestion: function(e) {
      var email = this.$el.find('#mb-j-forgot-password-email').val();

      if (!this.isEmailValid(e)) {
        return;
      }

      this.model.getHintQuestion(email, {
        success: _.bind(function() {
          // SDP will send a captcha for users that don't have a secret question
          if (this.model.get('challengeKey')) {
            this.currentView = 'captcha';
          } else {
            this.currentView = 'hintQuestion';
          }
        }, this)
      });
    },

    checkCaptcha: function(e) {
      var captcha = this.$el.find('#mb-j-forgot-password-captcha').val();

      if (!this.isCaptchaValid(e)) {
        return;
      }
      
      this.model.checkCaptcha(captcha, {
        success: _.bind(function() {
          this.currentView = 'emailConfirmation';

          if (_.isFunction(this.resetPasswordEmailSent)) {
            this.resetPasswordEmailSent();
          }
        }, this)
      });
    },

    captchaRefresh: function() {
      this.model.getHintQuestion(this.model.get("emailAddress"), {
        success: _.bind(function() {
          // SDP will send a captcha for users that don't have a secret question
          this.currentView = 'captcha';
        }, this)
      });
    },

    checkHintAnswer: function(e) {
      var hintAnswer = this.$el.find('#mb-j-forgot-password-hint-answer').val();

      if (!this.isSecurityAnswerValid(e)) {
        return;
      }
      
      this.model.checkHintAnswer(hintAnswer, {
        success: _.bind(function() {
          this.currentView = 'resetPassword';
        }, this)
      });
    },

    resetPassword: function() {
      var password = this.$el.find('#mb-j-forgot-password-new-password').val(),
          verifyPassword = this.$el.find('#mb-j-forgot-password-verify-password').val();

      var isValid = this.isPasswordValid();
          isValid = this.isConfirmPasswordValid() && isValid;
          isValid = this.isPasswordMatching() && isValid;

      if (!isValid) {
        return;
      }

      this.model.resetPassword(password, verifyPassword, {
        success: _.bind(function() {
          this.trigger('passwordReset', {
            email: this.model.get('emailAddress'),
            password: password
          });

          this.reset();
        }, this)
      });
    },

    isEmailValid: function() {
      var $email = this.$el.find('#mb-j-forgot-password-email');

      return ($email.val() !== "") && $email.get(0).validity.valid;
    },

    isCaptchaValid: function() {
      var $captcha = this.$el.find('#mb-j-forgot-password-captcha');
      
      return $captcha.val().length > 0;
    },

    isSecurityAnswerValid: function() {
      var $answer = this.$el.find('#mb-j-forgot-password-hint-answer');
      
      return $answer.val().length > 0;
    },

    isPasswordValid: function() {
      var $password = this.$el.find('#mb-j-forgot-password-new-password');

      return this.options.passwordMatcher.test($password.val());
    },

    isConfirmPasswordValid: function() {
      var $password = this.$el.find('#mb-j-forgot-password-verify-password');

      return this.options.passwordMatcher.test($password.val());
    },

    isPasswordMatching: function() {
      var $passwordOne = this.$el.find('#mb-j-forgot-password-new-password').val();
      var $passwordTwo = this.$el.find('#mb-j-forgot-password-verify-password').val();
      
      return (($passwordOne != null) && ($passwordTwo != null) && ($passwordOne === $passwordTwo));
    }

  });

  return ForgotPasswordView;
});
