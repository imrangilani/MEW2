define([
  'backbone',
  'jquery',
  'underscore',

  // Util
  'util/orientation'
], function(Backbone, $, _, orientation) {
  'use strict';

  function MessageToast(message, target, options) {
    this.$el = null;
    this.$target = $(target);
    this.$mainRegion = null;
    this.$container = null;
    this.message = message;
    this.active = false;
    this.position = 'top';
    this.cache = {
      target: {
        margins: {
          original: null,
          current: {
            top: 0,
            bottom: 0
          }
        }
      },
      message: {
        margins: {
          top: 0,
          bottom: 0
        }
      }
    };
    this.options = _.merge({}, MessageToast.defaults.options, options);

    this.initialize();
  }

  _.extend(MessageToast.prototype, Backbone.Events, {

    initialize: function() {
      if (!_.contains(['element', 'container'], this.options.target)) {
        throw 'Target `' + this.options.target + '` not allowed';
      }

      this.$el = $(TEMPLATE.productMessageToast({ message: this.message }));
      this.debug = this.options.mainRegionSelector;
      this.$mainRegion = $(this.options.mainRegionSelector);
      this.$container = this.$mainRegion.find(this.options.containerSelector);

      if (this.options.target === 'container') {
        var $closest = this.$target.closest('.b-j-message-toaster');
        if ($closest) {
          this.$target = $closest;
        }
      }
    },

    show: function(callback) {
      var opacityTransitionDuration = this.getOpacityTransitionDuration();

      if (this.active) {
        return;
      }

      this.active = true;
      this.hidePrevious();

      if (this.options.uniqueId) {
        MessageToast.cache[this.options.uniqueId] = this;
      }

      // The element must be added on the DOM before calling `update()` otherwise outerHeight will return zero.
      this.$container.append(this.$el);

      this.update();

      this.listenTo(orientation, 'orientationchange', function() {
        setTimeout(function() {
          this.update();
        }.bind(this), 1);
      });

      // We have to change the css display before calling `setFocus`
      // because the `offset().top` returns a differente value than expected
      this.$el.css('display', 'block');

      this.setFocus(function() {
        this.$el.css('opacity', 1);

        // Waiting for completing the transition effect
        setTimeout(function() {
          if ($.isFunction(callback)) {
            callback();
          }

          // In this case the message will not be hidden automatically
          if (this.options.timeout <= 0) {
            return;
          }

          setTimeout(function() {
            this.hide();
          }.bind(this), this.options.timeout);
        }.bind(this), opacityTransitionDuration);
      }.bind(this));
    },

    hide: function(callback) {
      var opacityTransitionDuration = this.getOpacityTransitionDuration();

      if (!this.active) {
        return;
      }

      this.active = false;
      this.stopListening();

      if ((this.options.uniqueId) && (MessageToast.cache[this.options.uniqueId] === this)) {
        MessageToast.cache[this.options.uniqueId] = null;
      }

      this.restoreTargetElementMargin();
      this.$el.css('opacity', 0);

      setTimeout(function() {
        this.$el.css('display', 'none');
        this.$el.remove();

        if ($.isFunction(callback)) {
          callback();
        }
      }.bind(this), opacityTransitionDuration);
    },

    hidePrevious: function() {
      if (!this.options.uniqueId) {
        return;
      }

      var previousMessage = MessageToast.cache[this.options.uniqueId];
      if (previousMessage) {
        previousMessage.hide();
      }
    },

    getHeight: function() {
      return this.$el.outerHeight() + this.getArrowSize().height;
    },

    getArrowSize: function() {
      var $arrow = this.$el.find('.b-j-msg-toast-arrow:first');
      var width = Math.sqrt(2 * ($arrow.width() * $arrow.width())); // Pythagoras' Theorem
      var height = width / 2;

      return {
        width: width,
        height: height
      };
    },

    update: function() {
      this.restoreTargetElementMargin();

      this.applyStyle();

      // The message must has the same size of the product container
      this.$el.css('width', this.$container.width());

      this.setTargetElementMargin();

      // After setting the width we knows the exaclty message
      // height and now we are able to calculate its position
      this.setMessagePosition();
    },

    applyStyle: function() {
      var $arrows = $('.b-j-msg-toast-arrow', this.$el);

      if (this.options.style.fgColor) {
        this.$el.css('color', this.options.style.fgColor);
      }

      if (this.options.style.bgColor) {
        this.$el.css('background-color', this.options.style.bgColor);
        $arrows.css('background-color', this.options.style.bgColor);
      }

      if (this.options.style.borderColor) {
        this.$el.css('border-color', this.options.style.borderColor);
        $arrows.css('border-top-color', this.options.style.borderColor);
        $arrows.css('border-right-color', this.options.style.borderColor);
      }
    },

    setMessagePosition: function() {
      var messageMargin = 10;
      var targetMargins = this.cache.target.margins.current;
      var left = ((this.$container.outerWidth() - this.$container.width()) / 2) + this.$container.offset().left;
      var top = this.$target.position().top - this.$el.outerHeight() - messageMargin + targetMargins.top;
      var minTop = MessageToast.parseNumber(this.$mainRegion.css('padding-top')) +
                   MessageToast.parseNumber(this.$mainRegion.css('margin-top'));
      var arrowname = 'downarrow';

      if (((this.options.position === 'auto') && (top < minTop)) || (this.options.position === 'bottom')) {
        arrowname = 'uparrow';
        this.position = 'bottom';
        top = this.$target.position().top + this.$target.outerHeight() + messageMargin - targetMargins.bottom;
      }

      this.$el.css('top', top);
      this.$el.css('left', left);

      this.setArrowPosition(arrowname);
    },

    setArrowPosition: function(arrowname) {
      // Hiding both arrows (up and down)
      $('.b-j-msg-toast-arrow', this.$el).hide();

      if (this.options.showArrow === false) {
        return;
      }

      var $arrow = $('.b-j-msg-toast-' + arrowname, this.$el);
      var arrowSize = this.getArrowSize();
      var targetCenter = this.$target.offset().left + (this.$target.outerWidth() / 2);
      var maxArrowX = this.$el.width() - arrowSize.width;
      var arrowOffsetLeft = this.$el.offset().left + ((this.$el.outerWidth() - this.$el.width()));
      var arrowX = targetCenter - arrowOffsetLeft - (arrowSize.width / 2);

      if (arrowX < 0) {
        arrowX = 0;
      } else if (arrowX > maxArrowX) {
        arrowX = maxArrowX;
      }

      $arrow.css('display', 'block');
      $arrow.css('margin-left', arrowX);
    },

    setTargetElementMargin: function() {
      var messageMargins = this.getMessageMargins();
      var targetMargins = this.cache.target.margins.original ?
                            this.cache.target.margins.original :
                            (this.cache.target.margins.original = MessageToast.getMargins(this.$target));

      var newTargetTopMargin = targetMargins.top + messageMargins.top;
      var newTargetBottomMargin = targetMargins.bottom + messageMargins.bottom;

      this.$target.css('margin-top', newTargetTopMargin + 'px');
      this.$target.css('margin-bottom', newTargetBottomMargin + 'px');

      // Put these margins in the cache to restore them later
      this.cache.message.margins = messageMargins;
      this.cache.target.margins.current = {
        top: newTargetTopMargin,
        bottom: newTargetBottomMargin
      };
    },

    restoreTargetElementMargin: function() {
      // We can't only cache the `targetMargins` and restore it back because a second messages
      // can be displayed concurrently for the same target when the first one is on `hide` process.
      // In this case we will get a wrong value for the target element.

      var messageMargins = this.cache.message.margins;
      if (!messageMargins || ((messageMargins.top === 0) && (messageMargins.bottom === 0))) {
        return;
      }

      var targetMargins = MessageToast.getMargins(this.$target);
      var prevTopMargin = targetMargins.top -  messageMargins.top;
      var prevBottomMargin = targetMargins.bottom -  messageMargins.bottom;

      this.$target.css('margin-top', prevTopMargin + 'px');
      this.$target.css('margin-bottom', prevBottomMargin + 'px');
    },

    getMessageMargins: function() {
      var topMargin = 0;
      var rightMargin = 0;
      var bottomMargin = 0;
      var leftMargin = 0;

      switch (this.options.targetMargin) {
        case 'none':
          break;
        case 'auto':
          topMargin = this.position === 'top' ? this.getHeight() : 0;
          bottomMargin = this.position === 'bottom' ? this.getHeight() : 0;
          break;
        default:
          topMargin = this.position === 'top' ? parseInt(this.options.targetMargin.replace(/\D/g), 10) : 0;
          bottomMargin = this.position === 'bottom' ? parseInt(this.options.targetMargin.replace(/\D/g), 10) : 0;
      }

      return {
        top: topMargin,
        right: rightMargin,
        bottom: bottomMargin,
        left: leftMargin
      };
    },

    setFocus: function(callback) {
      var scrollSpacing = 15;
      var headerHeight = MessageToast.getHeaderHeight();

      var boundaries = {
        top: this.$el.offset().top - headerHeight - scrollSpacing,
        bottom: this.$el.offset().top + this.$el.outerHeight() + scrollSpacing
      };

      var scrollTo = this.position === 'top' ? boundaries.top : boundaries.bottom - $(window).height();
      var hasToScroll = (boundaries.top < $(window).scrollTop()) ||
                        (boundaries.bottom > $(window).scrollTop() + $(window).height());

      if (!hasToScroll) {
        callback();
        return;
      }

      $('body').animate({ scrollTop: scrollTo }, this.options.scrollTimeout, function() {
        if ($.isFunction(callback)) {
          callback();
        }
      });
    },

    getOpacityTransitionDuration: function() {
      return 1000 * (parseFloat(this.$el.css('-webkit-transition-duration'), 10) || 0.5);
    }
  });

  MessageToast.cache = {};

  // Defatul MessageToast options
  MessageToast.defaults = {
    options: {
      // Element that will be used to calculate the top limit value,
      // considering its margin-top and padding-top.
      mainRegionSelector: null,

      // HTML container selector where the message element will be appended.
      // It must be a `masterRegionSelector`s child element.
      containerSelector: null,

      // `position`
      //   - auto: above or bellow the $element based on window area
      //   - top: above the $element
      //   - bottom: bellow the $element
      position: 'auto',

      // `target`
      //   - element: the message will be showed above/below the $element
      //   - container: the message will be showed above/below the closest $element
      //     parent that contains the `b-j-message-toaster` class
      target: 'element',

      // If exists a message with the same uniqueId it will be
      // hidden before displaying a new one
      uniqueId: '',

      // `targetMargin`
      //   - none: no margin will be added to the target element.
      //     In this case the message can overlap any element above/below the target.
      //   - auto: the margin will be equal to the message height
      //   - fixed value (pixels): the margin will be the same passed by the user
      targetMargin: 'none',

      // `showArrow`
      //   - true: show the message ballon   arrow
      //   - false: don't show the message ballon arrow.
      showArrow: true,

      timeout: 2000,
      scrollTimeout: 500,
      style: {
        fgColor: null,
        bgColor: null,
        borderColor: null
      }
    }
  };

  MessageToast.display = function(message, $target, options) {
    var showMessage = false;

    if (!message) {
      return false;
    }

    // Create a new `options` object to preserve the original one
    options = _.merge({}, options);

    if ((options.show === undefined) || (options.show === true)) {
      showMessage = true;
      delete options.show;
    }

    var messageToast = new MessageToast(message, $target, options);

    if (showMessage) {
      messageToast.show();
    }

    return messageToast;
  };

  MessageToast.getHeaderHeight = function() {
    return $('#mb-page-wrapper').hasClass('b-sticky-header') ? $('#mb-region-header').outerHeight() : 0;
  };

  MessageToast.parseNumber = function(value) {
    return parseInt('0' + (value || '0').replace(/\D/g, ''), 10);
  };

  MessageToast.getMargins = function($element) {
    return {
      top: parseInt($element.css('margin-top').replace(/[^0-9.,]/g, '')),
      right: parseInt($element.css('margin-right').replace(/[^0-9.,]/g, '')),
      bottom: parseInt($element.css('margin-bottom').replace(/[^0-9.,]/g, '')),
      left: parseInt($element.css('margin-left').replace(/[^0-9.,]/g, ''))
    };
  };

  return MessageToast;
});
