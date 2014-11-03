/**
 * @file transition.js
 *
 * Defines Transition class. There are two ways to define transitions between views:
 *   - Using data-transition attribute in the link. Ex: <a href="/shop" data-transition="slide"></a>
 *   - Explicitly instantiating and starting a transition when some element is clicked. Ex:
 *     var transition = new Transition('slide');
 *     transition.start();
 */

define([
  'backbone',
  'jquery'
], function(Backbone, $) {
  'use strict';

  var Transition = function(type) {
    this.initialize(type);
  };

  _.extend(Transition.prototype, Backbone.Events, {

    initialize: function(type) {
      this.type = type;
      this.$el = $('#b-j-transition-wrapper');
    },

    start: function() {
      this.scrollToTop();
      var $container = this.cloneMainContainer();
      this.$el.addClass('active');
      $('#mb-j-content-container').addClass('transition-' + this.type);
      $('#mb-page-wrapper').removeClass('b-sticky-header');
      this.trigger('beforeTransition', $container, this.$el);

      var transition = this;
      Backbone.once('renderCompleted', function() {
        $('#mb-j-content-container').addClass('active');
        setTimeout(function() {
          transition.cleanup();
        }, 600);
      });
    },

    reverse: function() {
      this.scrollToTop();
      var $container = this.cloneMainContainer();
      this.$el.addClass('reverse');
      $container.addClass('transition-' + this.type + '-reverse');
      $('#mb-page-wrapper').removeClass('b-sticky-header');
      this.trigger('beforeReverseTransition', $container, this.$el);

      var transition = this;
      Backbone.once('renderCompleted', function() {
        $container.addClass('active');
        setTimeout(function() {
          transition.cleanupReverse();
        }, 600);
      });
    },

    cleanup: function() {
      this.$el.empty();
      this.$el.removeClass('active');
      $('#mb-j-content-container').removeClass('transition-' + this.type);
      $('#mb-j-content-container').removeClass('active');
      this.trigger('afterTransition', this.$el);
    },

    cleanupReverse: function() {
      this.$el.empty();
      this.$el.removeClass('reverse');
      this.trigger('afterReverseTransition', this.$el);
    },

    cloneMainContainer: function() {
      var $container = $('<div class="b-j-transition-container"/>').html($('#mb-j-content-container').html());
      this.$el.empty();
      this.$el.append($container);
      return $container;
    },

    scrollToTop: function(timeout, callback) {
      if (_.isUndefined(timeout)) {
        timeout = 300 ;
      }

      $('html, body').animate({ scrollTop: 0 }, timeout, function() {
        if ($.isFunction(callback)) {
          callback();
        }
      });
    }
  });

  return Transition;
});
