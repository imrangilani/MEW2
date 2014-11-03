define([
  'util/util',
  'util/spinner',
  'models/productReviewsModel',
  'views/modalView'
], function(util, spinner, ProductReviewsModel, ModalView) {
  'use strict';

  var RESET_FEEDBACK_TIME = 1; // hours

  var ProductReviewsModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    /**
     * Keep track of the scroll position of the scrolling modal container, each time a new
     * set of reviews is loaded.
     *
     * Used to ensure no new events are triggered unless the user scrolls down sufficiently.
     *
     * @TODO - this can be generalized
     */
    scrollPos: 0,

    /**
     * Set a flag for infinite scroll when the request/rendering for the next
     * page is happening/
     *
     * Ensures multiple requests don't get fired simultaneously
     */
    polling: true,

    events: _.extend(ModalView.prototype.events, {
      'click  #mb-j-reviews-write':                           'showWriteReviewModal',
      'change #m-j-reviews-sortby':                           'sortReviewList',
      'click  .m-j-review-questions-toggle':                  'toggleQuestions',
      'click  .m-j-product-review-thumb.up:not(.disabled,.posted)':   'postThumbsUp',
      'click  .m-j-product-review-thumb.down:not(.disabled,.posted)': 'postThumbsDown'
    }),

    init: function() {
      // dynamically generate requestParams from knowledge of the model
      var requestParamKeys = _.keys(_.result(ProductReviewsModel.prototype, 'defaults').requestParams);

      // Whatever is passed into view.options is broken up into requestParams, and everything else
      this.model = new ProductReviewsModel(_.extend({
        requestParams: _.pick(this.options, requestParamKeys)
      }, _.omit(this.options, requestParamKeys) || {}));

      //Needed for the model to insert error message
      this.model.set('errorContainer', this.$el);
      this.model.set('errorHandler', 'showModal');

      // The template has some shared components that require additional details for rendering
      this.model.set('isReviewsModal', true);

      var rating = this.model.get('rating');
      if (rating) {
        rating.verbose = true;
        this.model.set('rating', rating);
      }

      this.resetInfiniteScroll();

      // Only render template on first request for reviews
      this.listenToOnce(this.model, 'reviewListReady', this.render);
      this.model.fetch();

      this.listenTo(this.model, 'reviewFeedbackSaved', this.updateFeedbackDisplay);
      this.listenTo(this.model, 'reviewFeedbackFailed', this.feedbackError);
    },

    showWriteReviewModal: function() {
      return false;
    },

    /**
     * Reset properties relating to the position and request status of infinite scroll.
     * Useful for when sorting, initializing
     */
    resetInfiniteScroll: function() {
      this.scrollPos = 0;
      this.polling = true;

      this.model.set('requestParams', _.extend(this.model.get('requestParams'), {
        pageNumber: 1
      }));
    },

    /**
     * Bind a scroll event to the modal to handle infinite scroll.
     * Also, set a property on the view to indicate the scroll event has been bound.
     */
    bindScroll: function() {
      $(window).bind('scroll',  _.bind(_.throttle(this.checkScroll, 300), this));
      this.scrollEventBound = true;
    },

    /**
     * Bind a scroll event to the modal to handle infinite scroll.
     * Also, set a property on the view to indicate the scroll event has been bound.
     */
    unbindScroll: function() {
      $(window).unbind('scroll');
      this.scrollEventBound = false;
    },

    renderTemplate: function() {
      // After first request completes, attach an event to render just the reviews section, for all future requests
      this.listenTo(this.model, 'reviewListReady', this.prepareReviews);
      this.$el.html(TEMPLATE.productReviewsModal(this.model.attributes));

      // Allow infinite scroll to poll for new reviews
      this.polling = false;

      // For reviews that have > 1 question, show "more" link
      this.prepareFobQuestions();

            // Show results for previous votes a user has made
      this.prepareFeedback();

      // After first request completes, bind an event to listen for the modal container to scroll
      this.bindScroll();

      // Set modal heights after content renders
      this.setHeights();
    },

    prepareReviews: function() {
      /**
       * At a certain point after scrolling, a request will go out, and the response
       * will not have any more reviews to return.
       *
       * Unbind the scroll event when this happens, so no more requests are made
       */
      if (_.size(this.model.get('reviews')) === 0) {
        this.unbindScroll();
        $('#mb-j-reviews-spinner').remove();
      } else {
        this.renderReviews();
      }
    },

    renderReviews: function() {
      var $reviewList = this.$el.find('#mb-product-reviews-list');

      // Remove the spinner that was added via sort if we aren't appending to an existing list of reviews
      if ($reviewList.is(':empty')) {
        spinner.remove($reviewList);
      } else {
        $('#mb-j-reviews-spinner').remove();
      }

      $reviewList.append(TEMPLATE.productReviewsList(this.model.attributes));

      // Allow infinite scroll to poll for new reviews
      this.polling = false;

      // For reviews that have > 1 question, show "more" link
      this.prepareFobQuestions();

      // Show results for previous votes a user has made
      this.prepareFeedback();

      this.trigger('postRenderReviews');
    },

    // For reviews that have > 1 question, allow toggle of displaying remaining questions
    prepareFobQuestions: function() {
      var view = this;

      // @TODO - don't loop thru all reviews on every request (i.e. infinite scroll)
      this.$el.find('.m-j-product-review').each(function() {
        var $questions = $(this).find('.m-j-product-review-details-questions');

        // If there are more than one fob-specific questions for this review, show only one with "more" link
        if ($questions.children().length > 1) {
          // Check if toggle link is already added
          if (!$questions.find('.m-j-review-questions-toggle').length) {
            // append "more" link
            $questions.append('<div class="m-j-review-questions-toggle m-link">more</div>');

            // show single fob question
            view.showSingleFobQuestion($questions);
          }
        }
      });
    },

    prepareFeedback: function() {
      var view = this;
      var reviews = view.model.get('reviews');

      // @TODO - don't loop thru all reviews on every request (i.e. infinite scroll)
      _.each(reviews, function(review) {
        var reviewId = review.id;
        var feedback = util.storage.retrieve(reviewId + '_Helpfulness');

        // If the user previously selected thumbs up or down, reflect this in the UI
        if (feedback) {
          var feedbackTime = util.storage.retrieve(reviewId + '_time');

          if (review.lastModified && feedbackTime) {
            var lastModifiedISO = new Date(review.lastModified);
            var feedbackTimeISO = new Date(feedbackTime);

            // Increment count on display only if last modified time is older than feedback time
            var increment = (feedbackTimeISO > lastModifiedISO) ? (true) : (false);

            // If the feedback time was > RESET_FEEDBACK_TIME ago, allow user to re-cast their vote
            var resetTime = new Date();
            resetTime.setHours(resetTime.getHours() - RESET_FEEDBACK_TIME);
            var reset = (feedbackTimeISO > resetTime) ? (false) : (true);

            if (reset) {
              // Delete data from storage, since it no longer serves a purpose.
              util.storage.remove(reviewId + '_time');
              util.storage.remove(reviewId + '_Helpfulness');
            }

            view.updateFeedbackDisplay({
              feedbackValue: feedback,
              reviewId: reviewId
            }, increment, reset);
          }
        }
      });
    },

    showSingleFobQuestion: function($questions) {
      // ensure toggle link has correct text, and detach it from the DOM
      var $toggle = $questions.find('.m-j-review-questions-toggle').text('more').detach();

      // Determine the height of the first question in the set of questions
      var $visible = $questions.children(':first');
      var visibleHeight = $visible.height() + parseFloat($visible.css('margin-top').replace('px', ''));

      // Show the "more" link after first question
      $visible.after($toggle);

      // Determine toggle height including padding
      var toggleHeight = $toggle.height() + parseFloat($toggle.css('padding-top').replace('px', ''));

      // Set the height of the questions wrapper to the height of the first question + "more" link
      $questions.height(toggleHeight + visibleHeight);
    },

    showAllFobQuestions: function($questions) {
      // ensure toggle link has correct text, and detach it from the DOM
      var $toggle = $questions.find('.m-j-review-questions-toggle').text('less').detach();

      // Allow the questions wrapper to be full height, and append the "less" link after the final question
      $questions.height('auto').append($toggle);
    },

    toggleQuestions: function(e) {
      var $questions = $(e.currentTarget).closest('.m-j-product-review-details-questions');

      if ($questions.data('allDataShowing')) {
        // all questions are showing; show only one question
        $questions.data('allDataShowing', false);
        this.showSingleFobQuestion($questions);
      } else {
        // only one question is showing; show all questions
        $questions.data('allDataShowing', true);
        this.showAllFobQuestions($questions);
      }
    },

    /**
     * Bound to the modal container to be fired whenever the user scrolls the modal
     */
    checkScroll: function() {
      // Make sure the next page isn't already loading
      if (!this.polling){
        if ($(document).height() - $(window).scrollTop() - $(window).height() < 100) {
          this.loadNextPage();
        }
      }
    },

    loadNextPage: function() {
      // Disable scroll from requesting new reviews while polling
      this.polling = true;

      // Increment the page number on the model
      var requestParams = this.model.get('requestParams');
      requestParams.pageNumber++;
      this.model.set('requestParams', requestParams);

      // Show a div below the bottom review for loading indicator
      this.$el.find('#mb-product-reviews-list').append('<div id="mb-j-reviews-spinner" class="spinner white-30">&nbsp;</div>');

      // Scroll down enough to see the spinner
      $('body').scrollTop($('#mb-j-reviews-spinner').offset().top);

      // Fetch the reviews for the next page - will trigger `renderReviews`
      this.model.fetch();
    },

    sortReviewList: function(e) {
      var $select = $(e.currentTarget);
      var value = $select.val();

      // Make sure scrollPos, etc. are reset for infinite scroll handling
      this.resetInfiniteScroll();

      // Update display of select list
      var display = $select.find('option[value=' + value + ']').text();
      $select.closest('.m-select-wrapper').find('.display').text('sort by ' + display);

      // The reviewListReady event will trigger "prepareReviews", which will append to the review list.
      // Since .append() is called, we want to empty out any reviews that were previously displayed.
      this.$el.find('#mb-product-reviews-list').empty();

      // Update sortOption model data, fetch
      this.model.set('requestParams', _.extend(this.model.get('requestParams'), {
        sortOption: value
      }));

      // There is a possibility that the scroll event was unbound before this sort operation is performed
      // Be sure to re-bind scroll event if this is the case
      if (!this.scrollEventBound) {
        this.listenToOnce(this.model, 'reviewListReady', _.bind(this.bindScroll, this));
      }

      // Empty out whatever reviews might exist, and show spinner after 1 sec
      var $reviewList = this.$el.find('#mb-product-reviews-list').empty();
      spinner.add($reviewList, 'white', 60);

      this.model.fetch();
    },

    postThumbsUp: function(e) {
      this.postFeedback(e, 'Positive');
    },

    postThumbsDown: function(e) {
      this.postFeedback(e, 'Negative');
    },

    postFeedback: function(e, expectedFeedbackValue) {
      var $thumb = $(e.currentTarget);
      var $review = $thumb.closest('.m-j-product-review');

      $review.find('.m-j-product-review-thumb').addClass('disabled');

      var reviewId = $review.data('id');

      var alreadyPosted = util.storage.retrieve(reviewId + '_Helpfulness');
      var feedbackValue = (alreadyPosted === expectedFeedbackValue) ? ('UNDO') : (expectedFeedbackValue);

      var attributes = {
        reviewId: reviewId,
        feedbackValue: feedbackValue
      };

      this.model.save(attributes);
    },

    /**
     * Update the UI for a particualr review feedback
     *
     * @param data {Object} - the feedback data (feedbackValue, reviewId)
     * @param increment {boolean} - whether or not to increment the visible count for the feedbackValue
     * @param reset {boolean} - if true, don't add class to reflect rating or class to make disabled. Allows re-vote
     */
    updateFeedbackDisplay: function(data, increment, reset) {
      var $review = $('.m-j-product-review[data-id="' + data.reviewId + '"]');
      var count = 0;
      var $thumb, thumbDirection;

      $review.find('.m-j-product-review-thumb').removeClass('posted disabled');

      switch (data.feedbackValue) {
      case 'UNDO' :
        if ($review.find('.m-j-product-review-thumb.up.posted').length === 1) {
          // We are undoing a "Positive"
          $thumb = $review.find('.m-j-product-review-thumb.up');
        } else {// We are undoing a "Negative"
          $thumb = $review.find('.m-j-product-review-thumb.down');
        }

        count = parseInt($thumb.text());
        $thumb.text(count - 1);
        break;

      case 'Positive':
        thumbDirection = 'up'; // @TODO - remove if BazaarVoice fixes
        $thumb = $review.find('.m-j-product-review-thumb.up');
        break;

      case 'Negative':
        thumbDirection = 'down'; // @TODO - remove if BazaarVoice fixes
        $thumb = $review.find('.m-j-product-review-thumb.down');
        break;
      }

      if (data.feedbackValue === 'Positive' || data.feedbackValue === 'Negative') {
        // Give the submitted thumb a class to color it red or green
        if (!reset) {
          $thumb.addClass('posted');
        }

        /**
         * BazaarVoice issues force us to only allow users to post one feedback per review.
         * Make the other thumb disabled. e.g. if "up" is posted, "down" is disabled.
         *
         * @TODO - remove if Bazaarvoice fixes
         */
        if (!reset) {
          var oppositeDirection = (thumbDirection === 'up') ? ('down') : ('up');
          $review.find('.m-j-product-review-thumb.' + oppositeDirection).addClass('disabled');
        }

        /**
         * There are situations where the count should not be incremented, e.g.
         * if count from response is valid and we just need to update the UI classes.
         *
         * @see _productReviewsModel.prototype.success()
         * @see this.prepareFeedback()
         */
        if (increment) {
          count = parseInt($thumb.text());
          $thumb.text(count + 1);
        }
      }
    },

    feedbackError: function() {
      // Remove the "disabled" class to let the user try again
      this.$el.find('.m-j-product-review-thumb').removeClass('disabled');
    }

  });

  return ProductReviewsModalView;
});
