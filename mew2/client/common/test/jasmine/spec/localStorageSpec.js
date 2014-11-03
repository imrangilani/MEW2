define([
  'jasmineHelpers',
  'util/_localstorage'
], function (jasmineHelpers, $localStorage) {
  'use strict';

  describe('_localstorage', function () {
    jasmineHelpers.prepareAppGlobals();

    describe('#get', function () {

      it('should reset localStorage if the storageversion doesn\'t match the version in the config', function () {
        spyOn(window.localStorage, 'clear');
        $localStorage.config.localStorage.storageversion = '2';
        window.localStorage.storageversion = '1';
        $localStorage.get('test');
        expect(window.localStorage.clear).toHaveBeenCalled();
      });

      it('should return a parsed object if the key refers to a value which is a stringified object', function () {
        window.localStorage.testObjectGet = '{"key":"val"}';
        expect($localStorage.get('testObjectGet')).toEqual({ key: 'val' });
      });

      it ('should return a string if the key refers to a value which is anything but a stringified object', function () {
        window.localStorage.testKey = 'value';
        expect($localStorage.get('testKey')).toEqual('value');
      });
    });

    describe('#set', function () {

      it('should stringify a value if it is an object and store it in localStorage', function () {
        $localStorage.set('testObjectSet', { key: 'val' });
        expect(window.localStorage.testObjectSet).toBe('{"key":"val"}');
      });

      it('should set any other value as a string', function () {
        $localStorage.set('testStringSet', 'value');
        expect(window.localStorage.testStringSet).toBe('value');
      });

      it('should catch a QUOTA_EXCEEDED_ERR and reset localStorage then call itself to re-set the value', function () {
        spyOn($localStorage, 'reset');
        var repeat = function(str, x) { return new Array(x+1).join(str); };
        var too_big = repeat('x', 12*1024*1024/2);

        $localStorage.set('testException', too_big);

        expect($localStorage.reset).toHaveBeenCalled();
        window.localStorage.clear();
      });
    });

    describe('#reset', function () {

      it('should reset all keys that aren\'t listed as savedKeys in the config file', function () {
        $localStorage.config.localStorage.savedKeys = ['savedKey'];
        window.localStorage.notSavedKey = 'notSavedValue';
        window.localStorage.savedKey = 'savedValue';
        $localStorage.config.localStorage.storageversion = '1';
        window.localStorage.storageversion = '1';

        $localStorage.reset();

        expect(window.localStorage.savedKey).toBe('savedValue');
        expect(window.localStorage.notSavedKey).toBeFalsy();
      });
    });

    describe('#setup', function () {

      it('if no storageversion is set in localStorage, should set it to the version specified in the config', function () {
        window.localStorage.clear();
        $localStorage.config.localStorage.storageversion = '2';

        $localStorage.setup();
        expect(window.localStorage.storageversion).toBe('2');
      });
    });
  });
});
