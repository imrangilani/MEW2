define([
  'jasmineHelpers',
  'views/baseView'
], function(jasmineHelpers, BaseView) {
  'use strict';

  describe('baseView', function() {
    var baseViewInstance, topReached;

    beforeEach(function() {
      jasmineHelpers.loadFixture('baseViewMarkup.html', 'bcom');

      // Disable jquery effects
      $.fx.off = true;

      // Spy to test callback functions
      topReached = {
        log: function() {
          console.log('Top reached');
        }
      };

      spyOn(topReached, 'log');
    });

    describe('#scrollToTop', function() {
      var flag;

      it('should scroll the page to top', function(done) {
        baseViewInstance = new BaseView();

        $('body').scrollTop(999);
        baseViewInstance.scrollToTop();

        setTimeout(function() {
          expect($('body').scrollTop()).toBe(0);
          done();
        }, 300);
      });

      it('should call the callback function',  function() {
        baseViewInstance = new BaseView();
        baseViewInstance.scrollToTop(0, topReached.log);
        expect(topReached.log).toHaveBeenCalled();
      });
    });

    describe('#generateCoremetricsLinks', function() {

      it('should add coremetrics parameters in link with coremetrics data attributes without cm_sp', function() {
        baseViewInstance = new BaseView({ el: '.b-footer-container' });
        baseViewInstance.generateCoremetricsLinks();
        var url = $.url($('#b-footer-sign-in-link').attr('href'));
        expect(url.param('cm_sp')).toBe('NAVIGATION-_-BOTTOM_NAV-_-SIGN_IN');
      });

      it('should add coremetrics parameters in link with coremetrics data attributes with cm_sp', function() {
        baseViewInstance = new BaseView({ el: '.b-footer-container' });
        baseViewInstance.generateCoremetricsLinks();
        var url = $.url($('#b-footer-sign-out-link').attr('href'));
        expect(url.param('cm_sp')).toBe('NAVIGATION-_-BOTTOM_NAV-_-SIGN_OUT');
      });
    });
  });
});
