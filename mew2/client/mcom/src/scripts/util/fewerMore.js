// Handles necessary height calculations
define([
  // Libraries
  'jquery',
  'underscore'
], function($, _) {
  'use strict';

  var fewerMore = {
    /*
        Initialize the view with all content truncated.
        Appends the 'more' link at the end
    */
    init: function() {
      var $details = $('.mb-modal-content .content');

      $details.dotdotdot({
        ellipsis: '... ',
        wrap:     'word',
        after:    'a.m-j-more',
        watch:    true,
        height:   75
      });
    },

    /* Truncates the text and the 'more' link at the end */
    showFewerProductDetails: function(e) {
      var $details;

      if (e && e.target) {
        e.preventDefault();
        $details = $(e.target).closest('.content');
        $(e.target).remove();
      } else {
        $details = e;
      }

      $details.find('.m-j-more').show();

      if (!$details.triggerHandler('isTruncated')) {
        $details.height(75).dotdotdot({ watch: true, after: 'a.m-j-more' });
      }

    },

    /* Gets back to normal and add the 'less' link at the end */
    showMoreProductDetails: function(e) {
      var $details,
          $lessLink = $('<a class="m-j-less m-link" href="#">less</a>');

      if (e && e.target) {
        e.preventDefault();
        $details = $(e.target).closest('.content');
      } else {
        $details = e;
      }

      // Destroy the truncation process
      $details.trigger('destroy.dot').height('auto');

      $details.find('.m-j-less').remove();
      $details.find('.m-j-more').hide();

      if (!$details.triggerHandler('isTruncated')) {

        // Avoid adding "less" link when the text truncated is equals
        // the text not truncated
        $details.children().last().prev().append($lessLink);
      }

    },

    /* Handle the orientation change. It is needed since we need to
       know if the text is already truncated or not in order to decide
       what should be done: truncate or not?
    */
    handleOrientationChange: function() {
      var $details = $('.mb-modal-content .content');

      _.each($details, function(detail) {
        if ($(detail).triggerHandler('isTruncated')) {
          fewerMore.showFewerProductDetails($(detail));
        } else {
          fewerMore.showMoreProductDetails($(detail));
        }
      });

    }
  };

  return fewerMore;
});
