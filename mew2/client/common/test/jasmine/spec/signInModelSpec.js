define([
  'jasmineHelpers',
  'models/_signInModel',
  'util/httpStatusCodes'
], function(jasmineHelpers, SignInModel, httpStatusCodes) {
  'use strict';

  describe('_signInModel', function() {
    var signInModelInstance;

    // share the scope
    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      App.config.ENV_CONFIG = {
        msecure_url: 'http://secure-m.macys.com'
      };

      signInModelInstance = new SignInModel();
    });

    describe('#url', function() {
      it('should return the right url based', function() {
        var expected = signInModelInstance.url();
        expect(expected).toBe(App.config.ENV_CONFIG.msecure_url + '/api/v1/auth/token/userdetails');
      });
    });

    describe('#signIn', function() {
      it('should throw an exception if `email` is undefined', function() {
        expect(function() {
          signInModelInstance.signIn(undefined, '123456', false);
        }).toThrow();
      });

      it('should throw an exception if `email` is null', function() {
        expect(function() {
          signInModelInstance.signIn(null, '123456', false);
        }).toThrow();
      });

      it('should throw an exception if `email` is empty', function() {
        expect(function() {
          signInModelInstance.signIn('', '123456', false);
        }).toThrow();
      });

      it('should throw an exception if `password` is undefined', function() {
        expect(function() {
          signInModelInstance.signIn('foo@bar.com', undefined, false);
        }).toThrow();
      });

      it('should throw an exception if `password` is null', function() {
        expect(function() {
          signInModelInstance.signIn('foo@bar.com', null, false);
        }).toThrow();
      });

      it('should throw an exception if `password` is empty', function() {
        expect(function() {
          signInModelInstance.signIn('foo@bar.com', '', false);
        }).toThrow();
      });

      it('should set `email` and `rememberMe` before calling `save`', function() {
        spyOn(signInModelInstance, 'save');
        signInModelInstance.signIn('foo@bar.com', '123456', true);

        expect(signInModelInstance.get('email')).toBe('foo@bar.com');
        expect(signInModelInstance.get('rememberMe')).toBe(true);
      });

      it('should not persists the user password in the model', function() {
        var password = '123456789';
        var passwordFound;

        spyOn(signInModelInstance, 'save');
        signInModelInstance.signIn('foo@bar.com', password);

        passwordFound = _.some(signInModelInstance.attributes, function(value, key) {
          return value && value.indexOf && (value.indexOf(password) >= 0);
        });

        expect(signInModelInstance.get('password')).toBeUndefined();
        expect(passwordFound).toBe(false);
      });

      it('should persist the item in the server through json POST method', function() {
        spyOn(signInModelInstance, 'save');
        signInModelInstance.signIn('foo@bar.com', '123456');

        var attributes = signInModelInstance.save.calls.mostRecent().args[0];
        var options = signInModelInstance.save.calls.mostRecent().args[1];

        expect(signInModelInstance.save).toHaveBeenCalled();
        expect(_.isEmpty(options)).toBe(false);
        expect(options.contentType).toBe('application/json');
        expect(options.data).toBeDefined();
      });

    });

    describe('#success', function() {
      it('should set the `success` attribute and trigger the `modelready` event', function() {
        spyOn(signInModelInstance, 'trigger');
        signInModelInstance.success(signInModelInstance);
        expect(signInModelInstance.get('success')).toBe(true);
        expect(signInModelInstance.trigger).toHaveBeenCalledWith('modelready');
      });
    });

    describe('#error', function() {
      it('should set the errorCode, errorMessage and trigger the `modelerror` event', function() {
        var errorCode = 'fooErroCode';
        var errorMessage = 'fooErrorMessage';

        spyOn(signInModelInstance, 'getErrorKey').and.returnValue(errorCode);
        spyOn(signInModelInstance, 'getErrorMessage').and.returnValue(errorMessage);
        spyOn(signInModelInstance, 'trigger');

        signInModelInstance.error(signInModelInstance, { status: '', statusText: '' });

        expect(signInModelInstance.get('errorCode')).toBe(errorCode);
        expect(signInModelInstance.get('errorMessage')).toBe(errorMessage);
        expect(signInModelInstance.trigger).toHaveBeenCalledWith('modelerror');
      });
    });

    describe('#getErrorKey', function() {

      it('should return `serviceUnavailable` for ConnectionRefused error', function() {
        var connectionRefusedStatusCode = 0;
        var errorKey = signInModelInstance.getErrorKey({
          status: connectionRefusedStatusCode
        });

        expect(errorKey).toBe('serviceUnavailable');
      });

      it('should return `serviceUnavailable` for ServiceUnavailable error', function() {
        var errorKey = signInModelInstance.getErrorKey({
          status: httpStatusCodes.ServiceUnavailable
        });

        expect(errorKey).toBe('serviceUnavailable');
      });

      it('should return `serviceUnavailable` for GatewayTimeout error', function() {
        var errorKey = signInModelInstance.getErrorKey({
          status: httpStatusCodes.GatewayTimeout
        });

        expect(errorKey).toBe('serviceUnavailable');
      });

      it('should return `invalidData` for BadRequest error', function() {
        var errorKey = signInModelInstance.getErrorKey({
          status: httpStatusCodes.BadRequest
        });

        expect(errorKey).toBe('invalidData');
      });

      describe('unprocessable entity error codes', function() {

        it('should return `unknow` for unknow errors', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 0 }'
          });

          expect(errorKey).toBe('unknow');
        });

        it('should return `invalidCredentials` for 100 error code', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 100 }'
          });

          expect(errorKey).toBe('invalidCredentials');
        });

        it('should return `serviceUnavailable` for 103 error code', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 103 }'
          });

          expect(errorKey).toBe('serviceUnavailable');
        });

        it('should return `maxLoginAttemps` for 104 error code', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 104 }'
          });

          expect(errorKey).toBe('maxLoginAttemps');
        });

        it('should return `serviceUnavailable` for 105 error code', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 105 }'
          });

          expect(errorKey).toBe('serviceUnavailable');
        });

        it('should return `lockedAccount` for 106 error code', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 106 }'
          });

          expect(errorKey).toBe('lockedAccount');
        });

        it('should return `invalidData` for 111 error code', function() {
          var errorKey = signInModelInstance.getErrorKey({
            status: httpStatusCodes.UnprocessableEntity,
            responseText: '{ "errorCode": 111 }'
          });

          expect(errorKey).toBe('invalidData');
        });
      });
    });
  });
});
