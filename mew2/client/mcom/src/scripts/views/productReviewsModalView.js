define([
  'handlebars',
  'views/_productReviewsModalView',
  'util/tooltip',
  'lscache'
], function(Handlebars, ProductReviewsModalView, tooltip, lscache) {
  'use strict';
  var $errorMessageClickDelegate, $reviewReport, $reviewFeedback, feedbackHeight, reviewId;

  var MCOMProductReviewsModalView = ProductReviewsModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(ProductReviewsModalView.prototype.events, {
      'click .m-j-disable-report a': function() { return false; },
      'click .m-j-product-launch-write-reviews-modal':  'writeProductReview',
      'click .m-j-product-review-report':               'toggleReportReview',
      'click .m-j-product-review-report-form > button': 'submitReportReview'
    }),

    postRender: function() {
      this.disableAfterPost();
      this.listenTo(this, 'postRenderReviews', this.disableAfterPost);
    },

    disableAfterPost: function() {
      this.model.get('reviews').forEach(function(review) {
        if (lscache.get(review.id + '_inappropriate') === 1) {
          $('[data-id=' + review.id + ']').find('a').css('opacity', '0.3').addClass('.m-j-disable-report');
        }
      });
    },

    writeProductReview: function(e) {
      var $reviewButton = $(e.currentTarget),
          $errorMessageClickDelegate = $('#m-product-reviews-modal, .error-tooltip'),
          message = 'Writing a review is currently unavailable on our mobile site. Please submit reviews on your computer or tablet.';

      tooltip($reviewButton, message, 'center', 0, 1, $errorMessageClickDelegate);
    },

    toggleReportReview: function(e) {
      $reviewReport = $(e.currentTarget);
      $reviewFeedback = $reviewReport.parent();
      feedbackHeight = $reviewFeedback.height();
      reviewId = $reviewReport.closest('.m-j-product-review').data('id');

      if (lscache.get(reviewId + '_inappropriate') !== 1) {
        if (feedbackHeight < 100) {
          // Flip the image vertically
          $reviewReport.find('img').css('transform', 'scaleY(-1)');
          $reviewFeedback.height(feedbackHeight + 170);
          $reviewReport.next().show();
        } else {
          this.hideReportReview(feedbackHeight);
        }
      } else {
        $reviewReport.find('a').css('opacity', '0.3').addClass('.m-j-disable-report');
      }

      return false;
    },

    hideReportReview: function(feedbackHeight) {
      $reviewReport.find('img').css('transform', 'none');
      $reviewFeedback.height(feedbackHeight - 170);
      $reviewReport.next().hide();
    },

    submitReportReview: function(e) {
      var feedbackValue = $reviewReport.next().find('textarea').val(),
          message = 'Thank You! You have successfully submitted your feedback for review';

      lscache.set(reviewId + '_inappropriate', 1, 1440); // store for 24 hours
      var reviewerId = this.model.reviewerIdHandler();

      var data = {
        feedbackType: 'inappropriate',
        feedbackValue: feedbackValue,
        reviewerId: reviewerId
      };

      // @TODO - refactor to friendly backbone, rewrite _productReviewModel or create a new model?
      // Via Sandeep: should only test on qa20 and specific products, 77589
      $.ajax({
        type: 'POST',
        url: '/api/v3/catalog/reviews/' + reviewId + '/feedback',
        data: JSON.stringify(data),
        contentType: 'application/json'
      })
        .done(function() {
          tooltip($(e.currentTarget), message, undefined, 2000, 0, $errorMessageClickDelegate);
          $reviewReport.find('a').css('opacity', '0.3').addClass('.m-j-disable-report');
        })
        .fail(function(jqXHR) {
          console.dir(jqXHR);
        });

      feedbackHeight = $reviewFeedback.height();
      this.hideReportReview(feedbackHeight);
      this.doWriteReviewClickAnalytics();
      return false;
    },

    doWriteReviewClickAnalytics: function() {
      var product = this.options.product;
      analytics.triggerTag({
        tagType: 'writeReview',
        eventId: product.categoriesBreadcrumb,
        actionType: '2',
        categoryId: 'PDP WRITE REVIEW'
      });
    }

  });

  Handlebars.registerHelper('ifProductReviewsFeedback', function(options) {
    if (App.config.ENV_CONFIG.feedback === 'on') {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  return MCOMProductReviewsModalView;
});
