define([
  'jasmineHelpers',
  'util/_transition'
], function(jasmineHelpers, Transition) {
  'use strict';

  describe('_transition', function() {
    var topReached;

    beforeEach(function() {
      jasmineHelpers.loadFixture('transition.html');

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

    describe('#start', function() {

      it('should add the transition class with the type to transition container', function() {
        var transition = new Transition('fade');
        transition.start();
        expect($('#mb-j-content-container').hasClass('transition-fade')).toBeTruthy();
      });

      it('should deactivate the sticky header, if it\'s active', function() {
        var transition = new Transition();
        $('#mb-page-wrapper').addClass('b-sticky-header');
        transition.start();
        expect($('#mb-page-wrapper').hasClass('b-sticky-header')).toBeFalsy();
      });
    });

    describe('#reverse', function() {

      it('should deactivate the sticky header, if it\'s active', function() {
        var transition = new Transition();
        $('#mb-page-wrapper').addClass('b-sticky-header');
        transition.reverse();
        expect($('#mb-page-wrapper').hasClass('b-sticky-header')).toBeFalsy();
      });
    });

    describe('cleanup', function() {

      it('should clean the main transition container', function() {
        $('#b-j-transition-wrapper').html('Not empty');
        var transition = new Transition();
        transition.cleanup();
        expect($('#b-j-transition-wrapper').is(':empty')).toBeTruthy();
      });

      it('should remove active class from main transition container', function() {
        $('#b-j-transition-wrapper').addClass('active');
        var transition = new Transition();
        transition.cleanup();
        expect($('#b-j-transition-wrapper').hasClass('active')).toBeFalsy();
      });

    });

    describe('#cleanupReverse', function() {

      it('should clean the main transition container', function() {
        $('#b-j-transition-wrapper').html('Not empty');
        var transition = new Transition();
        transition.cleanupReverse();
        expect($('#b-j-transition-wrapper').is(':empty')).toBeTruthy();
      });

      it('should remove reverse class from main transition container', function() {
        $('#b-j-transition-wrapper').addClass('reverse');
        var transition = new Transition();
        transition.cleanupReverse();
        expect($('#b-j-transition-wrapper').hasClass('reverse')).toBeFalsy();
      });
    });

    describe('#cloneMainContainer', function() {

      it('should create an exact copy of the main container', function() {
        var transition = new Transition(),
            $transitionContainer,
            $mainContentContainer;

        $mainContentContainer = $('#mb-j-content-container');
        $transitionContainer = transition.cloneMainContainer();

        expect($transitionContainer.html()).toMatch($mainContentContainer.html());
      });
    });

    describe('#scrollToTop', function() {
      var flag, transition;

      beforeEach(function() {
        transition = new Transition();
      });

      it('should scroll the page to top', function(done) {

        flag = false;
        $('body').scrollTop(999);
        transition.scrollToTop();

        setTimeout(function() {
          flag = true;
          done();
        }, 300);

        expect($('body').scrollTop()).toBe(0);
      });

      it('should call the callback function',  function() {
        transition.scrollToTop(0, topReached.log);
        expect(topReached.log).toHaveBeenCalled();
      });
    });
  });
});
