define([
  'underscore',
  // Models

  // Views
  'views/modalFixedHeightView',
  'views/zoomImageView',
  'util/orientation',
  'util/util'
], function(_, ModalView, ZoomImageViewer, orientation, util) {
  'use strict';

  var ZoomModalView = ModalView.extend({
    id: 'm-j-zoom-container',

    swiper: null,
    zoomImageView: [],
    className: ModalView.prototype.className + ' modal-level-1',
    swiperResizeNeeded: false,
    carouselOptions: {
      slidesPerView: 1,
      calculateHeight: false,
      autoResize: false,
      watchActiveIndex: true,
      followFinger: false,
      mode: 'horizontal',
      centeredSlides: true
    },

    doAnalytics: function() {
    },

    postInitialize: function() {
      ModalView.prototype.postInitialize.call(this, arguments);
      this.carouselOptions.initialSlide = this.options.initImageIndex;
      this.carouselOptions.onSlideChangeEnd = _.bind(function(swiper) {
        this.doAnalytics(swiper.activeLoopIndex);

        $('#mb-j-image-sequence').html(swiper.activeLoopIndex + 1);

        if (!this.zoomImageView[swiper.activeLoopIndex]) {
          this.renderZoomImageView(swiper.activeLoopIndex);
        } else {
          this.zoomImageView[swiper.activeLoopIndex].setZoomStateChange();
        }

        this.initializeSwipeControls();
      }, this);

      this._boundResizeFix = this._boundResizeFix || _.bind(this.resizeFix, this);
      this.listenTo(orientation, 'orientationchange', this._boundResizeFix);
    },

    resizeFix: function() {
      var swiper = this.swiper;
      if (swiper) {
        var imageHeight = this.setRuleZoomViewerHeight();
        this.recalculateSwiperWidth(swiper.slides.length, imageHeight);
        swiper.resizeFix(true);

        // this is needed in case the zooming modal is not currently visible (so recalculating its WIDTH would return 0)
        this.swiperResizeNeeded = true;
      }
    },

    zoomIn: function() {
      this.zoomImageView[this.swiper.activeLoopIndex].zoomIn();
    },
    zoomOut: function() {
      this.zoomImageView[this.swiper.activeLoopIndex].zoomOut();
    },
    zoomReset: function() {
      this.zoomImageView[this.swiper.activeLoopIndex].zoomReset();
    },
    swipePrev: function() {
      this.swiper.swipeTo(this.swiper.activeLoopIndex - 1);
    },
    swipeNext: function() {
      this.swiper.swipeTo(this.swiper.activeLoopIndex + 1);
    },

    //Set css values for scene7 container before scene7 sends a request for an image
    //The container has the size of the image that is calculated based on window size and orientation
    setRuleZoomViewerHeight: function() {
      var imageHeight;

      var ss = document.styleSheets;
      for (var i = 0; i < ss.length; i++) {
        var rules = ss[i].cssRules || ss[i].rules;

        if (rules) {
          for (var j = 0, len = rules.length; j < len; j++) {
            //There should be only one rule for this container -
            if (rules[j].selectorText && (rules[j].selectorText.indexOf('.s7container') !== -1)) {

              var bodyWidth = window.innerWidth,
                  // the width of the image if it can span the whole width of the screen
                  imageFullWidthHeight = bodyWidth * 1.224,
                  // the width of the image if it has to respect the screen height not to overflow vertically
                  imageCappedWidthHeight = window.innerHeight - (this.getModalHeaderHeight() + this.getModalFooterHeight());

              // the height of the image needs to respect the available screen height, but it should be the largest possible (spanning the screen width)
              imageHeight = Math.min(imageFullWidthHeight, imageCappedWidthHeight);

              rules[j].style.height = imageHeight + 'px';
              rules[j].style.width = bodyWidth + 'px';
              break;
            }
          }
        }
      }

      return imageHeight;
    },

    getModalHeaderHeight: function() {
      return this.$('#mb-product-zoom .mb-modal-header').height();
    },

    getModalFooterHeight: function() {
      // method to be implemented in the brand specific version, if necessary
      return 0;
    },

    getZoomingConfig: function() {
      return App.config.zoom || {};
    },

    recalculateSwiperWidth: function(slideCount, imageHeight) {
      var slidrWid = window.innerWidth;

      $('#mb-j-zoom-swiper .swiper-slide').css('height', 'auto');
      $('#mb-j-zoom-swiper .swiper-wrapper').css('width', (slidrWid * slideCount) + 'px');
      $('#mb-j-zoom-swiper .swiper-slide').css('width', slidrWid + 'px');

      if (imageHeight) {
        $('#mb-product-zoom .swiper-slide, #mb-product-zoom .swiper-wrapper').css('height', imageHeight + 'px');
      }
      //Force DOM update
      $('#mb-j-zoom-swiper .swiper-wrapper').hide().show(0);
    },

    displayCarousel: function(imageHeight) {
      var opts = _.extend(_.clone(this.carouselOptions), this.getBrandCarouselOptions());
      this.recalculateSwiperWidth(this.options.images.length, imageHeight);
      this.swiper = $('#mb-j-zoom-swiper').swiper(opts);
      this.initializeSwipeControls();
    },

    initializeSwipeControls: function() {
    },

    getBrandCarouselOptions: function() {
    },

    renderTemplate: function() {
      if (!this.initialized) {
        var model = {
          images: this.options.images,
          currentImageSequence: this.options.initImageIndex + 1
        };

        this.$el.html(TEMPLATE.zoom(model));

        var imageHeight = this.setRuleZoomViewerHeight();
        this.displayCarousel(imageHeight);
        this.renderZoomImageView(this.options.initImageIndex);
        this.initialized = true;
      }
    },

    renderZoomImageView: function(imageIndex) {
      this.zoomImageView[imageIndex] = new ZoomImageViewer({
          filename: this.options.images[imageIndex].image,
          imageIndex: imageIndex,
          swatch: this.options.images[imageIndex].swatch,
          showSwatches: this.options.showSwatches
        }, this.getZoomingConfig());
      this.zoomImageView[imageIndex].init();
    },

    postRender: function() {
    },

    show: function(activeIndex) {
      if (this.swiperResizeNeeded) {
        this.swiperResizeNeeded = false;

        this.$el.css('display', 'block');
        this.recalculateSwiperWidth(this.swiper.slides.length, this.setRuleZoomViewerHeight());
        this.swiper.resizeFix(true);
      }
      this.openModal(activeIndex);
      this.swiper.swipeTo(activeIndex, 100);
    },

    close: function() {
      ModalView.prototype.close.apply(this, arguments);
      if (this.swiper) {
        this.swiper.destroy();
        this.swiper = null;
      }
      this.stopListening(orientation, 'orientationchange', this._boundResizeFix);

      for (var i = 0, len = this.zoomImageView.length; i < len; i++) {
        if (this.zoomImageView[i]) {
          this.zoomImageView[i].close();
          this.zoomImageView[i] = null;
        }
      }

      $('body > span').remove();

      this.initialized = false;
      this.$el.remove();
    },

    openModal: function(activeIndex) {

      ModalView.prototype.show.call(this);
      this.doAnalytics(activeIndex);
      $('#mb-j-image-sequence').html(activeIndex + 1);

    }
  });

  return ZoomModalView;
});
