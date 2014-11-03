define([
  'jasmineHelpers',
  'models/_forgotPasswordModel',
  'util/httpStatusCodes'
], function(jasmineHelpers, ForgotPasswordModel, httpStatusCodes) {
  'use strict';

  describe('_forgotPasswordModel', function() {
    var forgotPasswordModelInstance;
    var requestCodes;

    // share the scope
    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
      App.config.ENV_CONFIG.msecure_url = 'http://foo.bar';

      forgotPasswordModelInstance = new ForgotPasswordModel();
      requestCodes = forgotPasswordModelInstance.requestCodes;
    });

    describe('#url', function() {

      it('should return the right `hintQuestion` url based on requestId', function() {
        forgotPasswordModelInstance.set('requestId', requestCodes.hintQuestion);

        var expected = forgotPasswordModelInstance.url();
        expect(expected).toBe(App.config.ENV_CONFIG.msecure_url + '/api/v1/user/hintquestion');
      });

      it('should return the right `hintAnswer` url based on requestId', function() {
        forgotPasswordModelInstance.set('requestId', requestCodes.hintAnswer);

        var expected = forgotPasswordModelInstance.url();
        expect(expected).toBe(App.config.ENV_CONFIG.msecure_url + '/api/v1/user/hintanswer');
      });

      it('should return the right `resetPassword` url based on requestId', function() {
        forgotPasswordModelInstance.set('requestId', requestCodes.resetPassword);

        var expected = forgotPasswordModelInstance.url();
        expect(expected).toBe(App.config.ENV_CONFIG.msecure_url + '/api/v1/user/resetpassword');
      });

      it('should return the right `captcha` url based on requestId', function() {
        forgotPasswordModelInstance.set('requestId', requestCodes.captcha);

        var expected = forgotPasswordModelInstance.url();
        expect(expected).toBe(App.config.ENV_CONFIG.msecure_url + '/api/v1/captcha');
      });

      it('should throw an exception for invalid request id', function() {
        forgotPasswordModelInstance.set('requestId', 1234);

        expect(function() {
          forgotPasswordModelInstance.url();
        }).toThrow();
      });

    });

    describe('#getHintQuestion', function() {

      it('should set the model attributes and call `sendRequest`', function() {
        var emailAddress = 'foo@bar.com';

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.getHintQuestion(emailAddress, {});

        expect(forgotPasswordModelInstance.get('requestId')).toBe(requestCodes.hintQuestion);
        expect(forgotPasswordModelInstance.get('emailAddress')).toBe(emailAddress);
        expect(forgotPasswordModelInstance.sendRequest).toHaveBeenCalled();
      });

      it('should extend `options` before calling `sendRequest`', function() {
        var emailAddress = 'foo@bar.com',
            options;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.getHintQuestion(emailAddress, {
          foo: 'bar'
        });

        options = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[1];

        expect(options.foo).toBe('bar');
      });

      it('should call `sendRequest` passing the correct `requestParams` object', function() {
        var emailAddress = 'foo@bar.com',
            requestParams;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.getHintQuestion(emailAddress, {});

        requestParams = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[0];

        expect(requestParams.emailAddress).toBe(emailAddress);
      });

    });

    describe('#checkCaptcha', function() {

      it('should set the model attributes and call `sendRequest`', function() {
        var challengeAnswer = 'foobar';

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkCaptcha(challengeAnswer, {});

        expect(forgotPasswordModelInstance.get('requestId')).toBe(requestCodes.captcha);
        expect(forgotPasswordModelInstance.sendRequest).toHaveBeenCalled();
      });

      it('should extend `options` before calling `sendRequest`', function() {
        var challengeAnswer = 'foobar',
            options;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkCaptcha(challengeAnswer, {
          foo: 'bar'
        });

        options = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[1];

        expect(options.foo).toBe('bar');
      });

      it('should call `sendRequest` passing the correct `requestParams` object', function() {
        var challengeAnswer = 'foobar',
            requestParams;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkCaptcha(challengeAnswer, {});

        requestParams = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[0];

        expect(requestParams.challengeAnswer).toBe(challengeAnswer);
      });

    });

    describe('#checkHintAnswer', function() {

      it('should set the model attributes and call `sendRequest`', function() {
        var hintAnswer = 'foobar';

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkHintAnswer(hintAnswer, {});

        expect(forgotPasswordModelInstance.get('requestId')).toBe(requestCodes.hintAnswer);
        expect(forgotPasswordModelInstance.sendRequest).toHaveBeenCalled();
      });

      it('should extend `options` before calling `sendRequest`', function() {
        var hintAnswer = 'foobar',
            options;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkHintAnswer(hintAnswer, {
          foo: 'bar'
        });

        options = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[1];

        expect(options.foo).toBe('bar');
      });

      it('should call `sendRequest` passing the correct `requestParams` object', function() {
        var hintAnswer = 'foobar',
            requestParams;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkHintAnswer(hintAnswer, {});

        requestParams = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[0];

        expect(requestParams.hintAnswer).toBe(hintAnswer);
      });

      it('should not persists the `hintAnswer` in the model', function() {
        var hintAnswer = 'foobar',
            hintAnswerFound;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.checkHintAnswer(hintAnswer, {});

        hintAnswerFound = _.some(forgotPasswordModelInstance.attributes, function(value, key) {
          return value && value.indexOf && (value.indexOf(hintAnswer) >= 0);
        });

        expect(hintAnswerFound).toBe(false);
      });

    });

    describe('#resetPassword', function() {

      it('should set the model attributes and call `sendRequest`', function() {
        var password = '123456',
            verifyPassword = '654321';

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.resetPassword(password, verifyPassword, {});

        expect(forgotPasswordModelInstance.get('requestId')).toBe(requestCodes.resetPassword);
        expect(forgotPasswordModelInstance.sendRequest).toHaveBeenCalled();
      });

      it('should extend `options` before calling `sendRequest`', function() {
        var password = '123456',
            verifyPassword = '654321',
            options;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.resetPassword(password, verifyPassword, {
          foo: 'bar'
        });

        options = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[1];

        expect(options.foo).toBe('bar');
      });

      it('should call `sendRequest` passing the correct `requestParams` object', function() {
        var password = '123456',
            verifyPassword = '654321',
            requestParams;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.resetPassword(password, verifyPassword, {});

        requestParams = forgotPasswordModelInstance.sendRequest.calls.mostRecent().args[0];

        expect(requestParams.password).toBe(password);
        expect(requestParams.verifyPassword).toBe(verifyPassword);
      });

      it('should not persists user`s password', function() {
        var password = '123456',
            verifyPassword = '654321',
            passwordFound;

        spyOn(forgotPasswordModelInstance, 'sendRequest');
        forgotPasswordModelInstance.resetPassword(password, verifyPassword, {});

        passwordFound = _.some(forgotPasswordModelInstance.attributes, function(value, key) {
          return value && value.indexOf && (value.indexOf(password) >= 0);
        });

        expect(passwordFound).toBe(false);
      });

    });

    describe('#getErrorCode', function() {

      it('should return `serviceUnavailable` for ConnectionRefused error', function() {
        var connectionRefusedStatusCode = 0;
        var errorKey = forgotPasswordModelInstance.getErrorCode({
          status: connectionRefusedStatusCode
        });

        expect(errorKey).toBe('serviceUnavailable');
      });

      it('should return `serviceUnavailable` for ServiceUnavailable error', function() {
        var errorKey = forgotPasswordModelInstance.getErrorCode({
          status: httpStatusCodes.ServiceUnavailable
        });

        expect(errorKey).toBe('serviceUnavailable');
      });

      it('should return `serviceUnavailable` for GatewayTimeout error', function() {
        var errorKey = forgotPasswordModelInstance.getErrorCode({
          status: httpStatusCodes.GatewayTimeout
        });

        expect(errorKey).toBe('serviceUnavailable');
      });

      it('should return `invalidData` for BadRequest error', function() {
        var errorKey = forgotPasswordModelInstance.getErrorCode({
          status: httpStatusCodes.BadRequest
        });

        expect(errorKey).toBe('invalidData');
      });

      describe('unprocessable entity error codes', function() {

        it('should return `unknow` for unknow errors', function() {
          var errorKey = forgotPasswordModelInstance.getErrorCode({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 0 }'
          }, {
            100: 'foo',
            101: 'bar',
            102: 'foobar'
          });

          expect(errorKey).toBe('unknow');
        });

        it('should return the correct error code', function() {
          var errorKey = forgotPasswordModelInstance.getErrorCode({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 101 }'
          }, {
            100: 'foo',
            101: 'bar',
            102: 'foobar'
          });

          expect(errorKey).toBe('bar');
        });

      });
    });
  });
});
