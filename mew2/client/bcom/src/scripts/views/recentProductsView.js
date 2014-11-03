define([
  'views/_recentProductsView',
  // Analytics
  'analytics/analyticsData',
  'analytics/analyticsTrigger',
  // util
  'util/util',
  'util/orientation',
  'jquery.dotdotdot'
], function(RecentProductsView, analyticsData, analytics, util, orientation) {
  'use strict';

  var recentlyViewedSwiper,
      productsContainer,
      editDoneButton,
      RECENTLY_VIEWED_ECAT = 'Recently_Viewed',
      attributes = {};

  var BCOMRecentProductsView = RecentProductsView.extend({
    el: '#mb-product-recently-viewed',

    editMode: false,
    carouselMode: true,
    slidesPerView: (orientation.getOrientation() === 'portrait') ? 2 : 3,
    activeSlide: 0,

    events: {
      // When Edit Button is clicked
      'click #b-j-product-recently-viewed-edit': 'toogleEditMode',
      'click .b-j-product-recently-viewed-remove': 'removeProduct',
      'click #b-product-recently-viewed-arrow-wrapper-left': 'navigateLeft',
      'click #b-product-recently-viewed-arrow-wrapper-right': 'navigateRight',
      'click .b-product-recently-viewed-product': 'setProductSelectionContext',
      // preventDefault and stopPropagation of links when editing
      'click .editing a': function() { return false; }
    },

    init: function() {
      this.slidesPerView = (orientation.getOrientation() === 'portrait') ? 2 : 3;
      this.activeSlide = 0;
      this.carouselMode = true;
      this.editMode = false;
      if (this.options.currentProduct) {
        attributes['2'] = 'MBL: PRODUCT: {name} ({id})'
          .replace('{name}', this.options.currentProduct.name)
          .replace('{id}', this.options.currentProduct.id);
      }

      RecentProductsView.prototype.init.apply(this);
      /*
       * in case the orientation changes, we need to restart the swiper
       * this is done because the settings are different in "landscape" and "portrait" modes
       */

      this.listenTo(orientation, 'orientationchange', this.reInitializeSwiper);
    },

    postRender: function() {
      this.initializeSwiper();

      productsContainer = this.$('#b-product-recently-viewed-products');
      editDoneButton = this.$('#b-j-product-recently-viewed-edit');

      if (this.editMode) {
        this.turnEditModeOn();
      }

      //truncate names
      this.$el.find('.truncated').dotdotdot();
      this.centerImagesAndArrows();

    },

    initializeSwiper: function(options) {

      var _this = this;

      //swiper arrows
      var arrowLeft = this.$('#b-product-recently-viewed-arrow-left'),
          arrowRight = this.$('#b-product-recently-viewed-arrow-right'),
          //change visibility of arrows according to user interaction
          updateSwiperArrowsVisibility = function(swiperImagesLength) {
            //if there are no more images than those visible, we do not show arrows
            arrowLeft.toggleClass('b-j-off', swiperImagesLength <= _this.slidesPerView);
            arrowRight.toggleClass('b-j-off', swiperImagesLength <= _this.slidesPerView);
          },
          currentUpdateSwiperArrows = function(swiper) {
            /* workaround to fix an idangerous swiper issue
             * details: idangerous swiper clones two slides before and two slides after the actual slides in carousel mode
             * this causes idangerous swiper to return the wrong number of slides and the wrong index
             */
            var numSlides = (_this.carouselMode) ? swiper.slides.length - (_this.slidesPerView * 2) : swiper.slides.length;
            //show/hide arrows
            updateSwiperArrowsVisibility(numSlides);
          };

      //avoid carousel if there are less than 3
      var slides = this.$('#b-product-recently-viewed-swiper .b-product-recently-viewed-product').length;
      if (slides <= _this.slidesPerView) {
        _this.carouselMode = false;
      }

      var swiperSettings = {
        grabCursor: true,
        calculateHeight: true,
        slidesPerView: _this.slidesPerView,
        noSwiping: false,
        loop: _this.carouselMode,
        initialSlide: _this.activeSlide,
        //make sure links work inside slider
        preventLinks: false,
        resizeEvent: (('onorientationchange' in window) ? 'orientationchange' : 'resize'),
        onSlideChangeStart: currentUpdateSwiperArrows,
        onInit: currentUpdateSwiperArrows,
        onSlideClick: function(swiper) {
          this.slideIndex = swiper.clickedSlideIndex;
          //just making sure we go to the top right away
          if (_this.editMode === false) {
            $('html, body').animate({ scrollTop: 0 }, 300);
          }
        }.bind(this)
      };

      //overwrite default swiperSettings with parameters, if they are set
      if (_.isObject(options)) {
        _.extend(swiperSettings, options);
      }

      if (this.$('#b-product-recently-viewed-swiper').length) {
        //new instance of swiper
        recentlyViewedSwiper = $('#b-product-recently-viewed-swiper').swiper(swiperSettings);

        //make sure it renders properly upon orientation change
        this.listenTo(orientation, 'orientationchange', _.bind(this.handleOrientationChange, this));
      }
    },

    handleOrientationChange: function() {
      if (recentlyViewedSwiper) {
        recentlyViewedSwiper.reInit();
      }
      this.centerImagesAndArrows();
      this.$el.find('.truncated').dotdotdot();
    },

    navigateLeft: function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (recentlyViewedSwiper) {
        recentlyViewedSwiper.swipePrev();
      }

      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Left_Arrow',
        elementCategory: RECENTLY_VIEWED_ECAT,
        attributes: attributes
      });
    },

    navigateRight: function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (recentlyViewedSwiper) {
        recentlyViewedSwiper.swipeNext();
      }

      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Right_Arrow',
        elementCategory: RECENTLY_VIEWED_ECAT,
        attributes: attributes
      });
    },

    /*
     * We need to center images using javascript
     */
    centerImagesAndArrows: function() {

      //center images
      var maxImageHeight = $('.b-product-recently-viewed-img-outter').first().outerHeight();
      var images = $('.b-product-recently-viewed-img-wrapper');
      images.each(function() {
        util.waitImagesLoad(this, _.bind(function() {
          var height = $(this).outerHeight();
          var top = (maxImageHeight - height) / 2;
          $(this).css('top', top + 'px');
        }, this));
      });

      //center arrows
      var arrows = $('.b-product-recently-viewed-arrow');
      arrows.each(function() {
        var height = $(this).outerHeight();
        var top = (maxImageHeight - height) / 2;
        $(this).css('top', top + 'px');
      });
    },

    reInitializeSwiper: function() {
      if (recentlyViewedSwiper && recentlyViewedSwiper.slides) {
        //calculate number of slides
        var numSlides = (this.carouselMode) ? recentlyViewedSwiper.slides.length - (this.slidesPerView * 2) : recentlyViewedSwiper.slides.length;
        var newSlidesPerView = (orientation.getOrientation() === 'portrait') ? 2 : 3;
        var newCarouselMode = (numSlides > newSlidesPerView) ? true : false;

        if (numSlides === 0) {
          //destroy references
          recentlyViewedSwiper = null;
          this.destroy();
          return;
        }

        this.activeSlide = (this.carouselMode) ? recentlyViewedSwiper.activeIndex - this.slidesPerView : recentlyViewedSwiper.activeIndex;

        //destroy references
        recentlyViewedSwiper = null;
        this.carouselMode = newCarouselMode;
        this.slidesPerView = newSlidesPerView;

        this.renderTemplate();
        this.postRender();
      }
    },

    toogleEditMode: function() {

      //coremetrics tags
      var eid;

      if (this.editMode) {
        this.turnEditModeOff();
        eid = 'Done';
      } else {
        this.turnEditModeOn();
        eid = 'Edit';
      }

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: eid,
        elementCategory: RECENTLY_VIEWED_ECAT,
        attributes: attributes
      });
    },

    turnEditModeOn: function() {
      this.editMode = true;
      productsContainer.addClass('editing');
      editDoneButton.text('DONE');
      //remove links while editing
      $('.b-product-recently-viewed-product a').each(function() {
        var href = $(this).attr('href');
        $(this).attr('data-href', href);
        $(this).removeAttr('href');
      });
    },

    turnEditModeOff: function() {
      this.editMode = false;
      productsContainer.removeClass('editing');
      editDoneButton.text('EDIT');
      //include links while not editing
      $('.b-product-recently-viewed-product a').each(function() {
        var href = $(this).attr('data-href');
        $(this).attr('href', href);
        $(this).removeAttr('data-href');
      });
      //apply changes
      this.carouselMode = true;
    },

    removeProduct: function(e) {

      var removeProductId = $(e.target).data('product-id');
      var removeProductIndex = this.slideIndex;

      /* workaround to fix an idangerous swiper issue
       * details: idangerous swiper clones two slides before and two slides after the actual slides in carousel mode
       * this causes idangerous swiper to return the wrong number of slides and the wrong index
       */
      var numSlides = (this.carouselMode) ? recentlyViewedSwiper.slides.length - (this.slidesPerView * 2) : recentlyViewedSwiper.slides.length;
      removeProductIndex = (this.carouselMode) ? (numSlides + (removeProductIndex - this.slidesPerView)) % numSlides : removeProductIndex;
      //remove from collection
      this.collection.remove(removeProductId);

      recentlyViewedSwiper.removeSlide(removeProductIndex);

      if ((numSlides - 1) > this.slidesPerView) {
        recentlyViewedSwiper.reInit();
      } else {
        /* workaround for idangerous swiper defect
         * When we call swiper.destroy(), it doesnt remove the slide copies previously created internally for visual purposed
         */
        this.reInitializeSwiper();
      }

      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Remove',
        elementCategory: RECENTLY_VIEWED_ECAT,
        attributes: _.extend({
          25: removeProductId
        }, attributes)
      });
    },

    setProductSelectionContext: function() {
      var context = {
        '4': 'Recview_pdpz1'
      };
      analyticsData.setCMProductSelectionContext(context);
      analyticsData.setCMBrowseContext(null);
    },

    destroy: function() {
      this.$el.remove();
    },

    close: function() {
      RecentProductsView.prototype.close.apply(this);
      if (recentlyViewedSwiper) {
        recentlyViewedSwiper.destroy();
        recentlyViewedSwiper = null;
      }
    }
  });

  return BCOMRecentProductsView;
});
