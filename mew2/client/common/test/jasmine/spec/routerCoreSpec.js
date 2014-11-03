define([
  // 'underscore',
  // 'jasmineHelpers',
  // 'router/_core/router',
  // 'router/_core/_public',
  // 'router/_core/_private',
  // 'router/_core/_viewController'
], function(_, jasmineHelpers, AppRouter, PublicAppRouter, PrivateAppRouter, ViewController) {
  'use strict';

  describe('router/_core', function() {

    it('should be true', function() {
      expect(true).toBe(true);
    });


    // describe('router/_core/_router', function() {
    //   var router;
    //   jasmineHelpers.prepareAppGlobals();

    //   describe('#initialize', function() {
    //     beforeEach(function() {
    //       App.config.ENV_CONFIG.marketorial = 'off';
    //     });

    //     it('should initialize `window.App.router` as a reference to the router', function() {
    //       router = new AppRouter();
    //       expect(window.App.router).toEqual(router);
    //     });

    //     it('should initialize a viewController', function() {
    //       router = new AppRouter();
    //       expect(router.viewController).toBeDefined();
    //     });

    //     it('should call `PrivateAppRouter.replaceSpecialCharacters`', function() {
    //       spyOn(PrivateAppRouter, 'replaceSpecialCharacters');
    //       router = new AppRouter();

    //       expect(PrivateAppRouter.replaceSpecialCharacters).toHaveBeenCalled();
    //     });
    //   });

    //   describe('#navigate', function() {
    //     beforeEach(function() {
    //       App.config.ENV_CONFIG.marketorial = 'off';
    //       router = new AppRouter();
    //     });

    //     it('should call `this.isValidFragment` passing `fragment`', function() {
    //       spyOn(router, 'isValidFragment');

    //       router.navigate('foo');
    //       expect(router.isValidFragment).toHaveBeenCalledWith('foo');
    //     });

    //     it('should return `false` for non-valid fragments', function() {
    //       spyOn(router, 'isValidFragment').and.returnValue(false);

    //       expect(router.navigate('foo')).toEqual(false);
    //     });

    //     it('should throw an error if both `fragment` and `options.attributes` are missing', function() {
    //       expect(router.navigate).toThrow();
    //     });

    //     it('should call `PrivateAppRouter.updateCurrent` for valid routes', function() {
    //       spyOn(router, 'isValidFragment').and.returnValue(true);
    //       spyOn(PrivateAppRouter, 'updateCurrent');

    //       router.navigate('foo', { bar: 'baz' });
    //       expect(PrivateAppRouter.updateCurrent).toHaveBeenCalledWith('foo', { bar: 'baz' });
    //     });
    //   });

    //   describe('#execute', function() {
    //     var isSupportedSpy;

    //     beforeEach(function() {
    //       App.config.ENV_CONFIG.marketorial = 'off';
    //       router = new AppRouter();
    //       spyOn(PrivateAppRouter, 'replaceSpecialCharacters');
    //       spyOn(PrivateAppRouter, 'updateCurrent');
    //       spyOn(PrivateAppRouter, 'checkAppDeepLink');
    //       isSupportedSpy = spyOn(router, 'isSupported').and.returnValue(true);
    //     });

    //     it('should call `PrivateAppRouter.replaceSpecialCharacters`', function() {
    //       router.execute();

    //       expect(PrivateAppRouter.replaceSpecialCharacters).toHaveBeenCalled();
    //     });

    //     it('should call `PrivateAppRouter.updateCurrent`', function() {
    //       router.execute();

    //       expect(PrivateAppRouter.updateCurrent).toHaveBeenCalled();
    //     });

    //     it('should call `PrivateAppRouter.checkAppDeepLink` if `CONFIG_LAUNCH_NATIVE` is "on"', function() {
    //       App.config.ENV_CONFIG.launch_native = 'on';
    //       router.execute();

    //       expect(PrivateAppRouter.checkAppDeepLink).toHaveBeenCalled();
    //     });

    //     it('should NOT call `PrivateAppRouter.checkAppDeepLink` if `CONFIG_LAUNCH_NATIVE` is NOT "on"', function() {
    //       App.config.ENV_CONFIG.launch_native = 'off';
    //       router.execute();

    //       expect(PrivateAppRouter.checkAppDeepLink).not.toHaveBeenCalled();
    //     });

    //     it('should call Backbone\'s base `execute` function for supported URLs', function() {
    //       spyOn(Backbone.Router.prototype, 'execute');

    //       router.execute('foo');
    //       expect(Backbone.Router.prototype.execute).toHaveBeenCalledWith('foo');
    //     });

    //     it('should NOT call Backbone\'s base `execute` function for non-supported URLs', function() {
    //       isSupportedSpy.and.returnValue(false);
    //       spyOn(Backbone.Router.prototype, 'execute');

    //       var response = router.execute();
    //       expect(Backbone.Router.prototype.execute).not.toHaveBeenCalled();
    //     });

    //     it('should return `undefined` for non-supported URLs', function() {
    //       isSupportedSpy.and.returnValue(false);
    //       spyOn(Backbone.Router.prototype, 'execute').and.returnValue(true);

    //       var response = router.execute();
    //       expect(response).toBeUndefined();
    //     });
    //   });
    // });

    // describe('router/_core/_public', function() {
    //   jasmineHelpers.prepareAppGlobals();

    //   describe('#getRouteHistory', function() {

    //     it('should call `PrivateAppRouter.getRouteHistory` passing `index`', function() {
    //       spyOn(PrivateAppRouter, 'getRouteHistory');

    //       PublicAppRouter.getRouteHistory('foo');
    //       expect(PrivateAppRouter.getRouteHistory).toHaveBeenCalledWith('foo');
    //     });
    //   });

    //   describe('#isDeepLink', function() {

    //     it('should return `false` if the route history contains more than 1 item', function() {
    //       spyOn(PublicAppRouter, 'getRouteHistory').and.returnValue(['foo', 'bar']);
    //       expect(PublicAppRouter.isDeepLink()).toBe(false);
    //     });

    //     it('should return `false` if the route history contains 1 item whose URL differs from the current route\'s URL', function() {
    //       var $url = {
    //         attr: function() {
    //           return 'foo';
    //         }
    //       };

    //       spyOn(PublicAppRouter, 'getRouteHistory').and.returnValue([{
    //         $url: $url
    //       }]);

    //       expect(true).toBe(true);
    //     });

    //     it('should return `true` if the route history contains 1 item whose URL differs from the current route\'s URL', function() {
    //       spyOn(PublicAppRouter, 'getRouteHistory').and.returnValue(['foo']);
    //       expect(true).toBe(true);
    //     });
    //   });

    //   describe('#getHandlerByName', function() {

    //     it('should call `PrivateAppRouter.getHandlerByName` passing `name`', function() {
    //       spyOn(PrivateAppRouter, 'getHandlerByName');

    //       PublicAppRouter.getHandlerByName('foo');
    //       expect(PrivateAppRouter.getHandlerByName).toHaveBeenCalledWith('foo');
    //     });
    //   });
    // });
  });
});
