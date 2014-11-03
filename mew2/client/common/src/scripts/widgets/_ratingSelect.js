/**
 * @file _ratingSelect.js
 *
 * Allow a user to select a rating value in a form
 */

define([
  'widgets/widget'
], function(Widget) {
  'use strict';

  var RatingSelect = Widget.extend({
    template: TEMPLATE.ratingSelectWidget,
    className: 'mb-ratingselect-widget',

    // Every instance gets initialized with these options by default.
    // Can be overwritten when constructing
    options: {
      maxRating: 5,
      name: 'rating-select'
    },

    events: {
      'click .mb-j-ratingselect-item': 'updateRating'
    },

    updateRating: function(e) {
      var $clicked = $(e.currentTarget);
      var $widget = $clicked.closest('.mb-ratingselect-widget');
      var rating = $clicked.index() + 1;

      // Update UI with new rating
      $widget.find('.mb-j-ratingselect-item').removeClass('active').filter(':lt(' + rating + ')').addClass('active');

      // Update hidden input with new rating
      $widget.find('.mb-j-ratingselect-value').val(rating);
    }
  });

  return RatingSelect;
});
