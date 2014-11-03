define([
  'util/MessageToast'
], function(MessageToast) {
  'use strict';

  describe('MessageToast', function() {
    var $target;
    var messageText = 'MessageToast test message';

    var defaultOptions = {
      mainRegionSelector: '#mainRegion',
      containerSelector: '#product-container'
    };

    describe('constructor', function() {

      beforeEach(function() {
        spyOn(MessageToast.prototype, 'initialize');
        spyOn(TEMPLATE, 'productMessageToast');
      });

      it('should copy the default options', function() {
        var messageToast = new MessageToast(messageText, $target, {});

        expect(messageToast.options).toEqual(MessageToast.defaults.options);
      });

      it('should merge the options passed as parameter with the default options', function() {
        var options = {
          timeout: 345,
          uniqueId: 'foo.bar'
        };

        var messageToast = new MessageToast(messageText, $target, options);
        var expectedOptions = _.merge({}, MessageToast.defaults.options, options);

        expect(messageToast.options).toEqual(expectedOptions);
      });
    });

    describe('#initialize', function() {
      beforeEach(function() {
        setFixtures('<div id="mainRegion">' +
                    '  <div id="product-container">' +
                    '    <div id="targetParent" class="b-j-message-toaster">' +
                    '      <div id="target"></div>' +
                    '    </div>' +
                    '  </div>' +
                    '</div>');
        $target = $('#target');
      });

      it('should call `initialize`', function() {
        spyOn(MessageToast.prototype, 'initialize');
        var messageToast = new MessageToast(messageText, $target, {});
        expect(MessageToast.prototype.initialize).toHaveBeenCalled();
      });

      it('should parse the template', function() {
        var messageToast = new MessageToast(messageText, $target, {});

        expect(messageToast.$el).toBeDefined();
        expect(messageToast.$el.length).toBe(1);
      });

      it('should set the $mainRegion', function() {
        var messageToast = new MessageToast(messageText, $target, defaultOptions);

        expect(messageToast.$mainRegion).toBeDefined();
        expect(messageToast.$mainRegion.length).toBe(1);
      });

      it('should set the $container', function() {
        var messageToast = new MessageToast(messageText, $target, defaultOptions);

        expect(messageToast.$container).toBeDefined();
        expect(messageToast.$container.get(0)).toBe($('#product-container').get(0));
      });

      it('should set the $target to the closest element that contains `.b-j-message-toaster`', function() {
        var messageToast = new MessageToast(messageText, $target, _.extend({}, defaultOptions, {
          target: 'container'
        }));

        expect(messageToast.$target).toBeDefined();
        expect(messageToast.$target.get(0)).toBe($('#targetParent').get(0));
      });
    });


    describe('instance', function() {
      var $target;
      var messageToast;

      beforeEach(function() {
        setFixtures('<div id="mainRegion">' +
                    '  <div id="product-container">' +
                    '    <div id="targetParent" class="b-j-message-toaster">' +
                    '      <div id="target"></div>' +
                    '    </div>' +
                    '  </div>' +
                    '</div>');
        $target = $('#target');
        messageToast = new MessageToast(messageText, $target, defaultOptions);
      });

      describe('#show', function() {

        beforeEach(function() {
          spyOn(messageToast, 'hidePrevious');
          spyOn(messageToast, 'update');
          spyOn(messageToast, 'setFocus');
        });

        it('should not set message toast as active', function() {
          messageToast.show();
          expect(messageToast.active).toBe(true);
        });

        it('should hide all previous messages', function() {
          messageToast.show();
          expect(messageToast.hidePrevious).toHaveBeenCalled();
        });

        it('should append the $el to the container', function() {
          messageToast.show();

          var $messageToast = $('.b-msg-toast');

          expect($messageToast.length).toBe(1);
          expect($messageToast.parent().get(0)).toEqual($(defaultOptions.containerSelector).get(0));
        });

        it('should update the message style', function() {
          messageToast.show();
          expect(messageToast.update).toHaveBeenCalled();
        });

        it('should set the focus on the focus on the messagetoast', function() {
          messageToast.show();
          expect(messageToast.setFocus).toHaveBeenCalled();
        });
      });

    //   describe('#hide', function() {

    //     it('should not set message toast as inactive', function() {
    //       messageToast.active = true;
    //       messageToast.hide();
    //       expect(messageToast.active).toBe(false);
    //     });

    //     it('should not call the callback function when the message toast is inactive', function() {
    //       var callback = jasmine.createSpy('hideCallback');
    //       messageToast.hide(callback);

    //       expect(callback).not.toHaveBeenCalled();
    //     });

    //     it('should call the callback', function(done) {
    //       messageToast.active = true;
    //       messageToast.getOpacityTransitionDuration = function() {
    //         return 1;
    //       };

    //       messageToast.hide(function() {
    //         expect(true).toBe(true);
    //         done();
    //       });
    //     });
    //   });
    });
  });
});
