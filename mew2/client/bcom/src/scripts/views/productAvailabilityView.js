define([
  'handlebars',

  // Views
  'views/_productAvailabilityView'
], function(Handlebars, ProductAvailabilityView) {
  'use strict';

  var BCOMProductAvailabilityView = ProductAvailabilityView.extend({

    renderError: function() {
      // intentionally blank to override rendering the error view at the baseView level
    }
  });

  Handlebars.registerHelper('extractShippingAvailabilityMessage', function(message, part, productId) {
    var inStockRegex = /(in stock|on order|special order|direct from vendor)(:?\s*)(.*)/i,
        usuallyShipsRegex = /within (\d+) business days/i,
        regexResults,
        extractedMessage;

    switch (part) {
      case 'first':
        regexResults = inStockRegex.exec(message);
        if (regexResults && regexResults.length > 1) {
          extractedMessage = regexResults[1];

          // Check if it's "On Order" or "Special Order" to add help icon. Mingle #23581
          if (/(on order)(:?\s*)(.*)/i.test(message)) {
            extractedMessage += '<span id="b-j-product-on-order-help-' + productId + '" class="b-j-product-on-order-help icon icon-question-mark"></span>';
          } else if (/(special order)(:?\s*)(.*)/i.test(message)) {
            extractedMessage += '<span id="b-j-product-special-order-help-' + productId + '" class="b-j-product-special-order-help icon icon-question-mark"></span>';
          }
        }
        break;

      case 'last':
        regexResults = inStockRegex.exec(message);
        if (regexResults && regexResults.length > 3) {
          extractedMessage = regexResults[3];
          if (usuallyShipsRegex.test(extractedMessage)) {
            extractedMessage = extractedMessage.replace(/(\d+)/, '<span class="b-product-bops-shipping-days">$1</span>');
          }
        }
        break;

      default:
      case 'all':
        break;
    }

    return extractedMessage;
  });

  return BCOMProductAvailabilityView;

});
