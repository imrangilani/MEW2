/**
 * @file _forgotPasswordModel.js
 */

define([
  'models/baseModel',
  'util/util',
  'util/httpStatusCodes'
], function(BaseModel, util, httpStatusCodes) {
  'use strict';

  var ERR_CONNECTION_REFUSED_STATUS_CODE = 0;

  var forgotPasswordModel = BaseModel.extend({
    initialize: function() {
      this.requestCodes = {
        hintQuestion: 1,
        hintAnswer: 2,
        resetPassword: 3,
        captcha: 4
      };
    },

    url: function() {
      var requestId = this.get('requestId');

      switch (requestId) {
        case this.requestCodes.hintQuestion:
          return util.getSecureMURL() + '/api/v1/user/hintquestion';
        case this.requestCodes.hintAnswer:
          return util.getSecureMURL() + '/api/v1/user/hintanswer';
        case this.requestCodes.resetPassword:
          return util.getSecureMURL() + '/api/v1/user/resetpassword';
        case this.requestCodes.captcha:
          return util.getSecureMURL() + '/api/v1/captcha';
      };

      throw 'Invalid request id (' + requestId + ')';
    },

    getHintQuestion: function(email, options) {
      this.set('requestId', this.requestCodes.hintQuestion);
      this.set('emailAddress', email);

      this.sendRequest({ emailAddress: email }, _.extend(options, {
        errorCodes: {
          100: 'emailNotFound',
          103: 'serviceUnavailable',
          106: 'lockedAccount',
          111: 'invalidEmail',
          112: 'taggedAccount'
        }
      }));
    },

    checkCaptcha: function(challengeAnswer, options) {
      this.set('requestId', this.requestCodes.captcha);
      var $challengeKey = this.get("challengeKey");
      /*Passing emailAddress for temporarity. Secure-m will change the logic to base on MSID then we will remove the emailAddress*/
      var $emailAddress = this.get("emailAddress");

      this.sendRequest({
        challengeAnswer: challengeAnswer,
        challengeKey: $challengeKey,
        emailAddress: $emailAddress
      }, _.extend(options, {
        errorCodes: {
          107: 'challengeFailed',
          103: 'serviceUnavailable'
        }
      }));
    },

    checkHintAnswer: function(hintAnswer, options) {
      this.set('requestId', this.requestCodes.hintAnswer);

      this.sendRequest({ hintAnswer: hintAnswer }, _.extend(options, {
        errorCodes: {
          100: 'wrongHintAnswer',
          106: 'lockedAccount'
        }
      }));
    },

    resetPassword: function(password, verifyPassword, options) {
      this.set('requestId', this.requestCodes.resetPassword);

      this.sendRequest({
        password: password,
        verifyPassword: verifyPassword
      }, _.extend(options, {
        errorCodes: {
          100: 'passwordMismatch'
        }
      }));
    },

    sendRequest: function(requestParams, options) {
      options = options || {};

      this.save({}, {
        contentType: "application/json",
        data: JSON.stringify(requestParams),
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true,
        success: _.bind(function() {
          if (typeof(options.success) === 'function') {
            options.success.apply(this, arguments);
          }

          this.trigger('modelready');
        }, this),
        error: _.bind(function(model, xhr) {
          this.set('errorCode', model.getErrorCode(xhr, options.errorCodes));
          this.set('errorMessage', model.getErrorMessage(xhr));
          this.set('responseText', xhr.responseText);

          if (typeof(options.error) === 'function') {
            options.error.apply(this, arguments);
          }

          this.trigger('modelerror');
        }, this)
      });
    },

    getErrorCode: function(xhr, errorCodes) {
      var unknowErrorCode = 'unknow';

      switch (xhr.status) {
        case ERR_CONNECTION_REFUSED_STATUS_CODE:
        case httpStatusCodes.ServiceUnavailable:
        case httpStatusCodes.GatewayTimeout:
          return 'serviceUnavailable';
        case httpStatusCodes.BadRequest:
          return 'invalidData';
        case httpStatusCodes.UnprocessableEntity:
          return errorCodes[JSON.parse(xhr.responseText).errorCode] || unknowErrorCode;
      }

      return unknowErrorCode;
    },

    getErrorMessage: function(xhr) {
      var responseJson = JSON.parse(xhr.responseText);
      var errorDetail = responseJson.errorDetail || [];

      if (errorDetail.length) {
        return errorDetail[0];
      }

      return '';
    },

    cleanup: function() {
      var saved = this.get('errorHandler');
      this.clear();
      this.set('errorHandler', saved);
    }

  });

  return forgotPasswordModel;
});
