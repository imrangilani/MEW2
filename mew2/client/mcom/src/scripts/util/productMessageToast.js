define([], function() {
  'use strict';

  var messages = [];

  var buildMessage = function(product) {
    var message = '',
    criteria = '';

    if (product.colors){
      criteria += 'color';

      if (product.sizes){
        if (criteria !== ''){
          criteria += '/';
        }
        criteria += 'size';
      }

      if (product.types){
        if (criteria !== ''){
          criteria += '/';
        }
        criteria += 'type';
      }

      message += 'Sorry, that ' + criteria + ' combination is not available.';
    }

    return message;
  };

  var createToastElement = function(message) {
    var html = TEMPLATE.productMessageToast ({ message: message });
    messages.push($(html).appendTo('#m-product-container'));
  };

  var display = function($touchedElement) {
    var position = $touchedElement.offset();

    var toastTopPosition = position.top - $('#m-product-container').offset().top;
    $('.m-msg-toast').css('top', toastTopPosition);
  };

  var toast = {

    displayAvailabilityMessage: function($touchedElement, product) {
      var message = buildMessage(product);
      if (message) {
        createToastElement(message);
        display($touchedElement);
        var _this = this;
        setTimeout(function() {
          _this.remove();
        }, 1000);
      }

    },
    remove: function() {
      if (messages){
        var $toastToRemove = messages.shift();
        $toastToRemove.css('opacity', 0);
        setTimeout(function() {
          $toastToRemove.remove();
        }, 500);
      }
    }

  };

  return toast;
});
