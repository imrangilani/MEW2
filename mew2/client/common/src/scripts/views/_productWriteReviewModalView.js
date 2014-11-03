define([
  'views/modalView',
  'models/writeReviewModel',
  'widgets/ratingSelect',
  'widgets/characterCount',
  'widgets/toggleSelect',
  'widgets/slider',
  'widgets/select'
], function(ModalView, WriteReviewModel, RatingSelect, CharacterCount, ToggleSelect, Slider, Select) {
  'use strict';

  var ProductWriteReviewModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(ModalView.prototype.events, {
      'touchstart .fit-slider .slider:not(".active")': 'removeNotSelected',
      'mousedown  .fit-slider .slider:not(".active")': 'removeNotSelected',

      'click #mb-j-write-review-submit.inactive': 'noop',
      'click #mb-j-write-review-submit:not(".inactive")': 'submit'
    }),

    init: function() {
      this.options = this.options || {};

      // Much of the UI can be rendered immediately
      this.render();

      // When the view is first initialized, we grab all review data.
      this.model = new WriteReviewModel({
        productId: this.options.productId,
        bazaarVoiceId: this.options.bazaarVoiceId
      });

      // Needed for the model to insert error message
      this.model.errorContainer = this.$el;

      /**
       * After the very first (and only) fetch() request completes
       * successfully, all data-dependent UI will be rendered.
       * Additionally, bind callback for future responses
       */
      this.listenToOnce(this.model, 'modelready', function() {
        this.renderDataDependent();
        this.listenTo(this.model, 'modelready', this.processSubmitResponse);
        this.listenTo(this.model, 'serverError', this.handleServerError);
      });

      this.setSlideVerticalDirection();
    },

    noop: function() {
      return false;
    },

    // @TODO this should probably be in a more global scope, for reuse
    toggleCollapsible: function(e) {
      $(e.currentTarget).closest('.form-collapsible').toggleClass('expanded');
    },

    removeNotSelected: function(e) {
      $(e.currentTarget).closest('.fit-slider-wrapper')
        .find('.fit-slider-value-display').removeClass('not-selected').end()
        .find('.slider').trigger('change');
    },

    updateFitSlider: function(e) {
      var $slider = $(e.currentTarget);
      var $sliderWrapper = $slider.closest('.fit-slider-wrapper');

      var index = parseInt($slider.val());
      var value = this.options.values[index];

      $sliderWrapper
        .find('.fit-slider-value-display').text(value.label).end()
        .find('.fit-slider-value').val(value.value);
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.productWriteReviewModal(this.options));
      this.renderWidgets();
    },

    renderWidgets: function() {
      var $rating = this.$el.find('#mb-write-review-rating');
      if ($rating.length) {
        new RatingSelect({
          el: $rating,
          options: {
            name: 'rating'
          }
        });
      }

      var $review = this.$el.find('#reviewtext-form-item');
      if ($review.length) {
        new CharacterCount({
          el: $review,
          options: {
            $display: $review.find('span.mb-j-character-count')
          }
        });
      }
    },

    renderDataDependent: function() {
      // Remove the inactive class from the submit button to allow form submission
      this.$el.find('#mb-j-write-review-submit').removeClass('inactive');

      this.populateNickname();
      this.renderFitSliders();
      this.renderAboutSelf();
    },

    renderFitSliders: function() {
      var view = this;
      var sliders = view.model.get('sliders');

      // If the service returns sliders, show the section and render all content
      if (sliders) {
        var $fitSliderWrapper = view.$el.find('#form-collapsible-fit-rating').removeClass('hide').find('.form-collapsible-content').removeClass('spinner');

        _.each(sliders, function(slider) {
          // Set up a new DOM element for the slider
          var $sliderWrapper = $(TEMPLATE.fitSlider({
            name: 'rating_' + slider.name,
            label: slider.label
          }));

          // Append the new DOM element to the fit slider container
          $fitSliderWrapper.append($sliderWrapper);

          // Create a new slider widget with the values from the service
          var maxValue = slider.values.length - 1; // -1, since indexed at 0
          new Slider({
            el: $sliderWrapper.find('.fit-slider'),
            options: {
              name: 'ignore',
              values: slider.values,
              maxValue: maxValue,
              defaultValue: Math.ceil(maxValue / 2),
              onChange: view.updateFitSlider
            }
          });
        });
      } else {
        // No sliders returned; remove the section all together
        view.$el.find('#form-collapsible-fit-rating').remove();
      }
    },

    renderAboutSelf: function() {
      var view = this;
      var fields = view.model.get('fields');

      // If the service returns fields, hide the loader and render all content
      if (fields) {
        var $fieldsWrapper = view.$el.find('#form-collapsible-about-self').find('.form-collapsible-content').removeClass('spinner');

        _.each(fields, function(field) {
          var $fieldWrapper;

          // Set up a different DOM element based on field type
          switch (field.type) {
          case 'select':
            $fieldWrapper = $(TEMPLATE.formSelect({
              name: 'contextvalue_' + field.name
            }));
            break;
          case 'text':
          default:
            $fieldWrapper = $(TEMPLATE.formTextInput({
              name: 'contextvalue_' + field.name,
              label: field.label
            }));
            break;
          }

          // Append the new DOM element to the dynamic fields container
          $fieldsWrapper.append($fieldWrapper);

          // Select elements require a widget (to display the selected value in the DOM)
          if (field.type === 'select') {
            // Create a new select widget with the values from the service
            new Select({
              el: $fieldWrapper,
              options: {
                label: field.label,
                name: 'contextvalue_' + field.name,
                values: field.values
              }
            });
          }
        });
      } else {
        // No fields returned; collapse the section by removing it all together
        view.$el.find('#form-collapsible-about-self').remove();
      }
    },

    // If the request returned a nickname, auto-populate the nickname field and disable it
    populateNickname: function() {
      var nickname = this.model.get('nickname') || this.model.getNickname();

      if (nickname) {
        this.$el.find('#displayName-form-item input').val(nickname).prop('disabled', true);
      }
    },

    /**
     * Do error-checking against fields that can be done all on the client.
     * All fields are just character length checks, with the exception of nickname.
     * So this will check all fields other than nickname.
     *
     * @TODO move widget validation to within the widget itself?
     * @TODO in the future, there will be an individual AJAX request to check just nickname.
     */
    checkClientErrors: function() {
      var errors = [],
          $formItem, value;

      // Get rid of any error messaging that already exists
      this.$el.find('.form-item.error').removeClass('error');
      this.$el.find('.mb-j-write-review-error-msg').remove();

      var messages = this.getClientErrorMessages();

      // Ensure a review rating has been selected
      $formItem = this.$el.find('#rating-form-item');
      value = parseInt($formItem.find('input').val());
      if (value === 0) {
        errors.push({
          $el: $formItem,
          message: messages.INVALID_OVERALL_RATING
        });
      }

      // Ensure a review headline has been populated (max length cannot be surpassed due to maxlength html property)
      $formItem = this.$el.find('#title-form-item');
      value = $formItem.find('input').val();
      if (!value) {
        errors.push({
          $el: $formItem,
          message: messages.EMPTY_HEADLINE
        });
      }

      // Ensure the review is >= 50 characters (max length cannot be surpassed due to maxlength html property)
      $formItem = this.$el.find('#reviewtext-form-item');
      value = $formItem.find('textarea').val();
      if (value.length < 50) {
        errors.push({
          $el: $formItem,
          message: messages.SMALL_REVIEW
        });
      }

      // Ensure the nickname is >= 4 characters (max length cannot be surpassed due to maxlength html property)
      $formItem = this.$el.find('#displayName-form-item');
      value = $formItem.find('input').val();

      if (!/^[a-z0-9]+$/i.test(value)) {
        errors.push({
          $el: $formItem,
          message: messages.INVALID_NICKNAME
        });
      } else if (value.length < 4) {
        errors.push({
          $el: $formItem,
          message: messages.SMALL_NICKNAME
        });
      }

      if (!_.isEmpty(errors)) {
        _.each(errors, function(error) {
          error.$el.addClass('error');
          error.$el.append('<div class="mb-j-write-review-error-msg form-error">' + error.message + '</div>');
        });
      }

      return errors;
    },

    /**
     * Capture and handle known errors in the client.
     * Currently, only 400 errors will get here.
     * Theoretically, the only 400 error will be issue with nickname, or duplicate submission.
     */
    handleServerError: function(payload) {
      this.$el.find('#mb-j-write-review-submit').removeClass('spinner');

      if (payload.field === 'duplicate') {
        // duplicate submisison response.
        this.hide();
        this.handleDuplicate();
      }
      else {
        var $field = (payload.field) ? ($('#' + payload.field + '-form-item')) : (undefined);

        var error = {
          $el: (!_.isEmpty($field.length)) ? ($field) : (this.$el.find('#displayName-form-item')), // assume nickname if field not supplied
          message: payload.message
        };

        error.$el.addClass('error');

        if (error.message) {
          error.$el.append('<div class="mb-j-write-review-error-msg form-error">' + error.message + '</div>');
        }

        $('body').animate({
          scrollTop: error.$el.offset().top - 55 // 55 for header and margin
        });
      }
    },

    handleDuplicate: function() {
      // should be handled by specific brand
      this.hide();
    },

    submit: function(e) {
      var errors = this.checkClientErrors();

      if (_.isEmpty(errors)) {
        var view = this;
        var $submit = $(e.currentTarget);
        var $form = $submit.closest('form#mb-write-review-form');

        $submit.addClass('spinner');

        // Find disabled inputs, and remove the "disabled" attribute. This is done so that .serializeArray() captures all inputs.
        var disabled = $form.find(':input:disabled').removeAttr('disabled');

        // Get an array of all elements in the form (unless they are to be ignored)
        var formItems = _.filter($form.serializeArray(), function(formItem) {
          return formItem.name !== 'ignore' && !_.isEmpty(formItem.value);
        });

        // re-disabled the set of inputs that were previously enabled
        disabled.attr('disabled','disabled');

        // Clear all perviously existing attributes on the model
        view.model.clear();

        // Set form values on the model
        _.each(formItems, function(formItem) {
          view.model.set(formItem.name, formItem.value);
        });

        // Save the model
        view.model.save();
      } else {
        // Scroll the page to the first error
        this.scrollToError(errors[0]);
      }

      return false;
    },

    processSubmitResponse: function() {
      this.$el.find('#mb-j-write-review-submit').removeClass('spinner');
      window.history.back();

      this.model.storeNickname();
      this.model.addToLocalStorage();

      return false;
    }
  });

  return ProductWriteReviewModalView;
});
