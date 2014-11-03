define([
  'jquery'
], function($) {
  'use strict';

  var acc = 0;

  return function($element, content, arrowPosition, ttl, marginBottom, $delegate, animationTime) {
        $delegate = $delegate || $('body');
    var positionStyle = { display: 'none' },
        zIndex = 11,
        prev;

    if (arrowPosition) {
      positionStyle = { textAlign: arrowPosition };
    }

    // Triggered from a modal
    if (!$delegate.is('body')) {
      zIndex = 101;
    }

    while ((prev = $element.prev()).hasClass('tooltip')) {
      prev.remove();
      prev = null;
    }

    $('body').prepend(TEMPLATE.tooltip({ acc: ++acc, content: content }));

    var ttel = $('#tooltip' + acc),
        ttheight = ttel.height();

    ttel.css({
      top: $element.offset().top -
        ttheight -
        (arrowPosition ? 9 : 0) -
        (marginBottom || 0),
      zIndex: zIndex
    }).find('.tt-arrow').css(positionStyle);

    $('html, body').animate({
      scrollTop: ttel.offset().top -
        ($(window).height() / 2) +
        (ttheight / 2)
    }, 'fast', 'swing');

    function removeElement() {
      if (ttel) {
        ttel.fadeOut(animationTime || 'fast', function() {
          ttel.remove();
          ttel = null;
        });

        $delegate.off('touchstart click', removeElement);
      }
    }

    $delegate.on('touchstart click', removeElement);

    if (ttl) {
      setTimeout(removeElement, ttl);
    }

    return ttel;
  };
});
