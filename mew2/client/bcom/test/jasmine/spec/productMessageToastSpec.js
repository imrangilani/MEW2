define([
  'util/productMessageToast',
], function(MessageToast) {
  'use strict';

  describe('productMessageToast', function() {
    var $target;
    var defaultOptions;

    beforeEach(function() {
      setFixtures('<div id="mb-page-wrapper"><div id="mb-j-region-main">' +
                  '<div id="b-product-container" class="b-product-wrapper">' +
                  '<div id="b-product-color-name"><div class="b-product-text"></div>' +
                  '<div class="b-product-size-name-wrapper"><div id="target">' +
                  '</div></div></div></div>');

      $target = $('#target');
      defaultOptions = { show: false };
    });

    describe('#displayMessage', function() {

      it('should return `false` when message is undefined', function() {
        var result = MessageToast.displayMessage();
        expect(result).toBe(false);
      });

      it('should return `false` when message is null', function() {
        var result = MessageToast.displayMessage(null, $target, defaultOptions);
        expect(result).toBe(false);
      });

      it('should return `false` when message is empty', function() {
        var result = MessageToast.displayMessage('', $target, defaultOptions);
        expect(result).toBe(false);
      });

      it('should return a valid messageToast when message is valid', function() {
        var messageToast = MessageToast.displayMessage('Foo', $target, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Foo');
      });

    });

    describe('#displayAvailabilityMessage', function() {

      it('should returns false when `colors` and `sizes` are not defined', function() {
        var product = {};
        var result = MessageToast.displayAvailabilityMessage($target, product);

        expect(result).toBe(false);
      });

      it('should set the correct message when `colors` is defined', function() {
        var product = { colors: []};
        var messageToast = MessageToast.displayAvailabilityMessage($target, product);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Sorry, this color combination is not available.');
      });

      it('should set the correct message when `colors` and `sizes` are defined', function() {
        var product = { colors: [], sizes: []};
        var messageToast = MessageToast.displayAvailabilityMessage($target, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Sorry, this color and size combination is not available.');
      });

    });

    describe('#displayUPCMessage', function() {
      var $productWrapper;

      beforeEach(function() {
        $productWrapper = $('.b-product-wrapper');
      });

      it('should returns false when `colors` and `sizes` are undefined', function() {
        var product = {};
        var result = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(result).toBe(false);
      });

      it('should set the correct message when `activeColor` and `activeSize` are undefined', function() {
        var product = { colors: [], sizes: []};
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a color and a size.');
      });

      it('should set the correct message when `activeColor` and `activeSize` are null', function() {
        var product = { colors: [], activeColor: null, sizes: [], activeSize: null };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a color and a size.');
      });

      it('should set the correct message when `activeColor` and `activeSize` are empty', function() {
        var product = { colors: [], activeColor: '', sizes: [], activeSize: '' };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a color and a size.');
      });

      it('should set the correct message when `activeColor` is undefined', function() {
        var product = { colors: [] };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a color.');
      });

      it('should set the correct message when `activeColor` is null', function() {
        var product = { colors: [], activeColor: null };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a color.');
      });

      it('should set the correct message when `activeColor` is empty', function() {
        var product = { colors: [], activeColor: '' };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a color.');
      });

      it('should set the correct message when `activeSize` is undefined', function() {
        var product = { sizes: []};
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a size.');
      });

      it('should set the correct message when `activeSize` is null', function() {
        var product = { sizes: [], activeSize: null };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a size.');
      });

      it('should set the correct message when `activeSize` is empty', function() {
        var product = { sizes: [], activeSize: '' };
        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select a size.');
      });

      it('should set the correct message when `activeColor` is not available for the selected size', function() {
        var product = {
          activeColor: 7462,
          activeSize: 8273,
          colors: [{
            id: 7462,
            sizeIds: [8273]
          }],
          sizes: [{
            id: 8273,
            colorIds: []
          }]
        };

        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select an available color.');
      });

      it('should set the correct message when `activeSize` is not available for the selected color', function() {
        var product = {
          activeColor: 7462,
          activeSize: 8273,
          colors: [{
            id: 7462,
            sizeIds: []
          }],
          sizes: [{
            id: 8273,
            colorIds: [7462]
          }]
        };

        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select an available size.');
      });

      it('should set the correct message when `activeColor` and `activeSize` combination is not available', function() {
        var product = {
          activeColor: 7462,
          activeSize: 8273,
          colors: [{
            id: 7462,
            sizeIds: []
          }],
          sizes: [{
            id: 8273,
            colorIds: []
          }]
        };

        var messageToast = MessageToast.displayUPCMessage($target, $productWrapper, product, defaultOptions);

        expect(messageToast).toBeDefined();
        expect(messageToast.message).toBe('Please select an available color and an available size.');
      });
    });
  });
});
