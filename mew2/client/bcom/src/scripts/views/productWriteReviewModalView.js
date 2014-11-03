define([
  'views/_productWriteReviewModalView',
  'util/MessageToast'
], function(ProductWriteReviewModalView, MessageToast) {
  'use strict';

  var BCOMProductWriteReviewModalView = ProductWriteReviewModalView.extend({

    events: _.extend(_.clone(ProductWriteReviewModalView.prototype.events), {
      'click .mb-j-events-modal-close': 'back',
      'click #mb-j-write-review-confirm-continue': 'back',
      'blur .form-item input, .form-item textarea': 'handleFormChange',
      'click #mb-write-review-rating': 'handleFormChange'
    }),

    handleFormChange: function() {
      if (this.isSubmitted) {
        this.checkClientErrors();
      }
    },

    submit: function() {
      this.isSubmitted = true;
      return ProductWriteReviewModalView.prototype.submit.apply(this, arguments);
    },

    scrollToError: function(error) {
      var $modalContainer = $('#m-j-write-review-modal-container');
      $('html, body').animate({
        scrollTop:  $modalContainer.scrollTop() + error.$el.position().top - 45 // 45 for header and margin
      });
    },

    handleDuplicate: function() {
      var message = 'You have already submitted a review for this product';
      var $target = $('#b-pdp-reviews .b-j-write-review');

      return MessageToast.display(message, $target, {
        mainRegionSelector: '#mb-j-region-main',
        containerSelector: '#b-product-container'
      });
    },

    /**
     * Returns errors messages for write review modal.
     * @return {Object} Error messages object.
     */
    getClientErrorMessages: function() {
      return {
        INVALID_OVERALL_RATING: 'Please enter an overall rating value.',
        EMPTY_HEADLINE:         'Please enter a review title.',
        SMALL_REVIEW:           'Reviews must be at least 50 characters.',
        SMALL_NICKNAME:         'Your nickname must be at least 4 characters.',
        INVALID_NICKNAME:       'Nickname can only contain letters and numbers'
      };
    },

    processSubmitResponse: function() {
      this.model.storeNickname();
      this.model.addToLocalStorage();

      this.$el.find('.mb-modal-content').html(TEMPLATE.productWriteReviewConfirm());

      return false;
    },

    renderTemplate: function() {
      ProductWriteReviewModalView.prototype.renderTemplate.apply(this, arguments);
      this.isSubmitted = false;
    }

  });

  return BCOMProductWriteReviewModalView;
});
