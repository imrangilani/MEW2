define([
  // Models
  'models/productModel',

  // Util
  'util/MessageToast'
], function(ProductModel, MessageToast) {
  'use strict';

  function display(message, $target, options) {
    options = _.merge(options, {
      mainRegionSelector: '#mb-j-region-main',
      containerSelector: '#b-product-container'
    });

    return MessageToast.display(message, $target, options);
  }

  var messageBuilders = {

    buildAvailabilityMessage: function(product) {
      var message = '',
      criteria = '';

      if (product.colors){
        criteria += 'color';

        if (product.sizes){
          if(criteria !== ''){
            criteria += ' and ';
          }
          criteria += 'size';
        }

        message += 'Sorry, this ' + criteria + ' combination is not available.';
      }

      return message;
    },
    buildUPCMessage: function(product) {
      var messageTokens = [];

      // If no colors and sizes are selected or both are unavailable
      // we need to show the message over color header (hight priority)
      var containers = {
        color: {
          priority: 1,
          selector: ['.color-wrapper .b-select-wrapper', '#b-product-color-name > .b-product-text'],
          enabled: false
        },
        size: {
          priority: 2,
          selector: '.b-product-size-name-wrapper',
          enabled: false
        }
      };

      if (product.colors) {
        if (!product.activeColor || (product.activeColor === 'Select a Color')) {
          containers['color'].enabled = true;
          messageTokens.push('a color');
        } else if (!ProductModel.isColorAvailable(product, product.activeColor)) {
          containers['color'].enabled = true;
          messageTokens.push('an available color');
        }
      }

      if (product.sizes) {
        if (!product.activeSize) {
          containers['size'].enabled = true;
          messageTokens.push('a size');
        } else if (!ProductModel.isSizeAvailable(product, product.activeSize)) {
          containers['size'].enabled = true;
          messageTokens.push('an available size');
        }
      }

      var errorCount = messageTokens.length;
      if (errorCount === 0) {
        return;
      }

      // If we have more than 02 elements (e.g.: ['a size', 'a color', 'a type']) we will add
      // the ' and ' string between the last two element ( e.g.: ['a size', 'a color and a type'])
      if (errorCount > 1) {
        messageTokens[errorCount - 2] = messageTokens[errorCount - 2] + ' and ' + messageTokens[errorCount - 1];
        messageTokens.pop();
      }

      var container = _.chain(containers)
      .sortBy(function(container) {
        return container.priority;
      }).find(function(container) {
        return container.enabled;
      }).value();

      return {
        text: 'Please select ' + messageTokens.join(', ') + '.',
        containerSelector: container.selector,
        errorCount: errorCount
      };
    }
  };

  var toast = {

    displayMessage: function(message, $target, options) {
      return display(message, $target, options);
    },
    displayAvailabilityMessage: function($element, product, options) {
      var message = messageBuilders.buildAvailabilityMessage(product);

      // Create a new `options` object to preserve the original one
      options = _.merge({}, options, {
        uniqueId: 'product.availability'
      });

      return display(message, $element, options);
    },
    displayUPCMessage: function($target, $productWrapper, product, options) {
      var $container = $target;
      var message = messageBuilders.buildUPCMessage(product);

      if (!message) {
        return false;
      }

      // Get the valid container.
      // We need to display the message above the select box with the color names 
      // for beauty products and above the color name (label) for others products.
      if ($.isArray(message.containerSelector)) {
        for (var i = 0; i < message.containerSelector.length; i++) {
          $container = $productWrapper.find(message.containerSelector[i]);

          if ($container.length === 1) {
            break;
          }
        }
      } else {
        $container = $productWrapper.find(message.containerSelector);
      }

      if ($container.length !== 1) {
        $container = $target;
      }

      // Create a new `options` object to preserve the original one
      options = _.merge({}, options, {
        uniqueId: 'product.upc',
        showArrow: message.errorCount < 2,
        timeout: 0
      });

      return display(message.text, $container, options);
    }
  };

  return toast;
});
