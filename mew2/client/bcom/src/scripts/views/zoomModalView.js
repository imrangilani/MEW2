define([
  // Views
  'views/_zoomModalView'
], function(ZoomModalView) {
  'use strict';

  var SWIPER_PAGINATION_HEIGHT = 16,
      SWIPER_PAGINATION_VMARGIN = 7;

  var BCOMZoomModalView = ZoomModalView.extend({
    id: 'b-j-zoom-container',
    events: _.extend(_.clone(ZoomModalView.prototype.events), {
      'click .b-zoom-control-icon-plus': 'zoomIn',
      'click .b-zoom-control-icon-minus': 'zoomOut',
      'click .b-zoom-control-icon-reset': 'zoomReset'
    }),

    getBrandCarouselOptions: function() {
      return {
        pagination: '#b-j-zoom-container .b-j-pdp-img-pagination',
        loop: this.options.images.length > 1,
        onInit: function(swiper) {
          // if a single image, hide the pagination and turn off the looped images
          var $pagination = $(swiper.paginationContainer),
              numberOfSlides = swiper.slides.length - (swiper.loop ? 2 : 0);
          $pagination.toggleClass('b-j-invisible', numberOfSlides === 1);
        },
        onSlideTouch: function(swiper) {
          swiper.lastTouchedSlideIndex = swiper.clickedSlideIndex;
        },
        onSwiperCreated: this.displaySlideContent,
        onSlideChangeStart: this.displaySlideContent
      };
    },

    displaySlideContent: function(swiper) {
      var slide = swiper.getSlide((swiper.activeIndex + swiper.slides.length) % swiper.slides.length);
      var slideImageIndex = slide.data('image-index');
      var $slideContent = $('#mb-zoom-img-' + slideImageIndex);

      $(slide).empty().append($slideContent);
    },

    doAnalytics: function(imageIndex) {
      this.trigger('imageShown', imageIndex);
    },

    getModalFooterHeight: function() {
      return this.options.images.length > 1 ? SWIPER_PAGINATION_HEIGHT + SWIPER_PAGINATION_VMARGIN : 0;
    },

    openModal: function() {
      ZoomModalView.prototype.openModal.apply(this, arguments);
      if (this.swiper) {
        this.displaySlideContent(this.swiper);
      }
    }

  });

  return BCOMZoomModalView;
});
