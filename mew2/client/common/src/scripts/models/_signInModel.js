define([
  'models/baseModel',
  'config',
  'util/httpStatusCodes',
  'util/util'
], function(BaseModel, config, httpStatusCodes, util) {
  'use strict';

  var ERR_CONNECTION_REFUSED_STATUS_CODE = 0;

  var SignInModel = BaseModel.extend({
    initialize: function() {
      // 106:lockedAccount can represent a 'Locked Account' or 'Tagged Account'
      this.errorCodes = {
          0: 'unknow',
        100: 'invalidCredentials',
        103: 'serviceUnavailable',
        104: 'maxLoginAttemps',
        105: 'serviceUnavailable',
        106: 'lockedAccount',
        111: 'invalidData',
        112: 'taggedAccount'
      };
    },

    url: function() {
      return util.getSecureMURL() + '/api/v1/auth/token/userdetails';
    },

    signIn: function(email, password, rememberMe) {
      if (!email || !password) {
        throw new Error('Expected `signIn` method to be called with `email` and `password` parameters');
      }

      this.cleanup();

      this.set('email', email);
      this.set('rememberMe', rememberMe || false);

      this.save({}, {
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          emailAddress: email,
          password: password
        }),
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true,
        success: this.success,
        error: this.error
      });
    },

    cleanup: function() {
      var saved = this.get('errorHandler');
      this.clear();
      this.set('errorHandler', saved);
    },

    success: function(model, xhr) {
      model.set('success',  true);
      model.trigger('modelready');
    },

    error: function(model, xhr) {
      model.set('errorCode', model.getErrorKey(xhr));
      model.set('errorMessage', model.getErrorMessage(xhr));
      model.set('responseText', xhr.responseText);
      model.trigger('modelerror');
    },

    getErrorKey: function(xhr) {
      switch (xhr.status) {
        case ERR_CONNECTION_REFUSED_STATUS_CODE:
        case httpStatusCodes.ServiceUnavailable:
        case httpStatusCodes.GatewayTimeout:
          return 'serviceUnavailable';
        case httpStatusCodes.BadRequest:
          return 'invalidData';
        case httpStatusCodes.UnprocessableEntity:
          return this.getErrorKeyFromJson(JSON.parse(xhr.responseText));
      }
    },

    getErrorKeyFromJson: function(response) {
      var erroKey = this.errorCodes[response.errorCode];
      if (!erroKey) {
        erroKey = this.errorCodes[0];
      }

      return erroKey;
    },

    getErrorMessage: function(xhr) {
      var responseJson = JSON.parse(xhr.responseText);
      var errorDetail = responseJson.errorDetail || [];

      if (errorDetail.length) {
        return errorDetail[0];
      }

      return '';
    }
  });

  return SignInModel;
});
