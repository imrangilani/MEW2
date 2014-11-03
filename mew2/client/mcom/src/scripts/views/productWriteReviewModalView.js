define([
  'views/_productWriteReviewModalView',
  'views/confirmOverlay',
  'widgets/toggleSelect',
  'widgets/slider',
  'views/termsModalView',
  'views/guidelinesModalView',
  'views/rulesModalView',
  'analytics/analyticsTrigger',
  'util/tooltip'
], function(ProductWriteReviewModalView, ConfirmOverlay, ToggleSelect, Slider, TermsModalView, GuidelinesModalView, RulesModalView, analytics, tooltip) {
  'use strict';

  var MCOMProductWriteReviewModalView = ProductWriteReviewModalView.extend({
    events: _.extend(ProductWriteReviewModalView.prototype.events, {
      // @TODO this should probably be in a more global scope, for reuse
      'click .form-collapsible-label': 'toggleCollapsible',

      'touchstart #mb-rate-macys-slider .slider:not(".active")': 'addCurrent',
      'mousedown  #mb-rate-macys-slider .slider:not(".active")': 'addCurrent',
      'click #mb-j-write-review-cancel': 'back',
      'click #m-j-terms': 'showTermsModal',
      'click #m-j-guidelines': 'showGuidelinesModal',
      'click #m-j-rules': 'showRulesModal'
    }),

    addCurrent: function(e) {
      $(e.currentTarget).closest('#rate-macys-form-item').find('#mb-j-rate-macys-current').addClass('current');
    },

    updateRateMacysSlider: function(e) {
      var $slider = $(e.currentTarget);
      var $formItem = $slider.closest('#rate-macys-form-item');

      var rating = parseInt($slider.val());

      if (rating > 0 && rating < 10) {
        var left = (rating / 10) * 100;
        var marginLeft = -((rating - 5) * 2 + 10);

        $formItem.find('.left,.right').removeClass('current');
        $formItem.find('#mb-j-rate-macys-current').text(rating).css('left', left + '%').css('margin-left', marginLeft + 'px');
      } else {
        $formItem.find('#mb-j-rate-macys-current').text('');
        $formItem.find('div[data-rating="' + rating + '"]').addClass('current');
      }
    },

    renderWidgets: function() {
      var $recommend = this.$el.find('#mb-recommend-toggle');
      if ($recommend.length) {
        new ToggleSelect({
          el: $recommend,
          options: {
            name: 'isrecommended',
            value1: {
              label: 'yes',
              value: 'true'
            },
            value2: {
              label: 'no',
              value: 'false'
            }
          }
        });
      }

      var $rateMacys = this.$el.find('#mb-rate-macys-slider');
      if ($rateMacys.length) {
        new Slider({
          el: $rateMacys,
          options: {
            name: 'netpromoterscore',
            onChange: this.updateRateMacysSlider
          }
        });
      }

      ProductWriteReviewModalView.prototype.renderWidgets.apply(this, arguments);
    },

    renderAboutSelf: function() {
      // Render the user location field
      var $fieldsWrapper = this.$el.find('#form-collapsible-about-self').find('.form-collapsible-content');

      var $fieldWrapper = $(TEMPLATE.formTextInput({
        name: 'userlocation',
        label: 'Location',
        smallText: 'e.g. New York'
      }));

      $fieldsWrapper.append($fieldWrapper);

      ProductWriteReviewModalView.prototype.renderAboutSelf.apply(this, arguments);
    },

    checkClientErrors: function() {
      var errors = ProductWriteReviewModalView.prototype.checkClientErrors.apply(this, arguments);

      if (!_.isEmpty(errors)) {

        var top = errors[0].$el.position().top + 35;
        var message = 'Please correct highlighted areas to proceed.';
        var $toast = $('<div class="m-toast" style="top: ' + top + 'px">' + message + '</div>');

        this.$el.find('#mb-write-review-form').append($toast);

        $('body').one('touchstart click', function() {
          $toast.remove();
        });
      }

      return errors;
    },

    handleDuplicate: function() {
      $('.m-j-product-launch-write-reviews-modal').removeClass('spinner');

      tooltip(
        $('.m-j-product-launch-write-reviews-modal'),             // element
        'You have already submitted a review for this product',   // content
        0,                                                        // arrowPosition: No arrow
        0,                                                        // ttl (time-to-live): Stay on forever
        10                                                        // marginBottom
      );
    },

    scrollToError: function(error) {
      $('body').animate({
        scrollTop: error.$el.position().top + 45 // 45 for header and margin
      });
    },

    processSubmitResponse: function() {
      ProductWriteReviewModalView.prototype.processSubmitResponse.apply(this, arguments);

      var writeReviewConfirmOverlay = new ConfirmOverlay({
        options: {
          header: 'Thanks For Your Review',
          content: TEMPLATE.writeReviewSuccessMessage(),
          footer: '<div class="m-button mb-j-close">return to product</div>'
        }
      });

      $('#m-j-review-success').on('click', function(e) {
        e.preventDefault();
        this.options.parentView.showRulesModal();
        writeReviewConfirmOverlay.close();
      }.bind(this));

      this.doWriteReviewClickAnalytics();

      return false;
    },

    showTermsModal: function(e, triggeredByPopState) {
      this.subViews.termsModal = new TermsModalView({ id: 'm-j-terms-modal-container' });

      if (!triggeredByPopState) {
        this.pushModalState('showTermsModal');
      }

      this.subViews.termsModal.render();
      this.subViews.termsModal.show();

      return false;
    },

    showGuidelinesModal: function(e, triggeredByPopState) {
      this.subViews.guidelinesModal = new GuidelinesModalView({ id: 'm-j-guidelines-modal-container' });

      if (!triggeredByPopState) {
        this.pushModalState('showGuidelinesModal');
      }

      this.subViews.guidelinesModal.render();
      this.subViews.guidelinesModal.show();

      return false;
    },

    showRulesModal: function(e, triggeredByPopState) {
      if(!this.subViews.rulesModal){
        this.subViews.rulesModal = new RulesModalView({ id: 'm-j-rules-modal-container', className: 'mb-modal-wrapper modal-level-2' });
      }else{
        this.subViews.rulesModal.render();
      }
      var view = this.subViews.rulesModal;
      if (!triggeredByPopState) {
        this.pushModalState('showRulesModal');
      }
      view.show();

      return false;
    },

    /**
     * Returns errors messages for write review modal.
     * @return {Object} Error messages object.
     */
    getClientErrorMessages: function() {
      return {
        INVALID_OVERALL_RATING: 'You must enter a value for overall rating.',
        EMPTY_HEADLINE:         'You must enter a headline.',
        SMALL_REVIEW:           'You must write at least 50 characters for this field.',
        SMALL_NICKNAME:         'You must enter a nickname that is at least 4 characters long.',
        INVALID_NICKNAME:         'Nickname can only contain letters and numbers'
      };
    },

    doWriteReviewClickAnalytics: function() {
    analytics.triggerTag({
          tagType: 'conversionEventWriteReviewTag',
          eventId: this.options.categoriesBreadcrumb,
          actionType: '2',
          categoryId: 'PDP WRITE REVIEW'
      });
    }

  });

  return MCOMProductWriteReviewModalView;
});
