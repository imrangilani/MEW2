define([
  'jquery',
  'underscore'
], function($, _) {

  'use strict';

  function HorizontalSpacer() {
  }

  _.extend(HorizontalSpacer.prototype, {
    update: function(container) {
      var $container = $(container);
      var hSpacingData = $container.data('horizontal-spacing');
      var hSpacingTokens;

      if (hSpacingData && (hSpacingTokens = hSpacingData.match(/(^\d+)(\D*$)/))) {
        var containerWidth = $container.width();
        var hSpacingValue = parseFloat(hSpacingTokens[1], 10);
        var hSpacingMeasure = hSpacingTokens[2] || 'px';

        if (hSpacingMeasure === '%') {
          hSpacingValue = (hSpacingValue / 100) * containerWidth;
        }

        var $children = $container.children();
        var buttonWidth = (containerWidth - (($children.length - 1) * hSpacingValue)) / $children.length;

        $children.each(function() {
          $(this).css('width', buttonWidth);
        });
      }
    }
  });

  return new HorizontalSpacer();
});
