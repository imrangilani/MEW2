define([
  'views/_productRecommendationsView',
  'util/util',
  'util/orientation',
  'analytics/analyticsData',
  'analytics/analyticsTrigger',
  'jquery.dotdotdot'
], function(ProductRecommendationsView, util, orientation, analyticsData, analytics) {
  'use strict';

  var recommendationsSwiper,
      PRODUCT_RECOMMENDATIONS_ECAT = 'Product_recommendations';

  var BCOMproductRecommendationsView = ProductRecommendationsView.extend({

    carouselMode: true,
    slidesPerView: (orientation.getOrientation() === 'portrait') ? 2 : 3,
    activeSlide: 0,

    events: {
      'click #mb-product-recommendations-arrow-left': 'navigateLeft',
      'click #mb-product-recommendations-arrow-right': 'navigateRight',
      'click .mb-product-recommendations-product a': 'setProductSelectionContext'
    },

    init: function() {
      this.slidesPerView = (orientation.getOrientation() === 'portrait') ? 2 : 3;
      this.activeSlide = 0;
      this.carouselMode = true;

      ProductRecommendationsView.prototype.init.apply(this, arguments);
      this.listenTo(orientation, 'orientationchange', this.reInitializeSwiper);
    },

    renderTemplate: function() {
      // WSSG/PROS is sending more than 6 products though the call is made with maxRecommendations=6
      // This fix on the UI will make sure we always display up to 6 products. (Mingle #25109)
      this.model.attributes.recommendedproducts = _.first(this.model.attributes.recommendedproducts, 6);
      ProductRecommendationsView.prototype.renderTemplate.apply(this);
    },

    postRender: function() {
      if (!!this.model.get('recommendedproducts') && this.model.get('recommendedproducts').length > 0) {
        this.initializeSwiper();
        this.$el.find('.truncated').dotdotdot();
        this.centerImagesAndArrows();
        this.doRecommendationsAnalytics();
      }
    },

    doRecommendationsAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: 'RECPRESENT -  ' + 'PRODUCT: ' + this.model.attributes.productName + ' (' + this.model.attributes.productId + ')',
        categoryId: 'PROS',
        attributes: {
          4:  'prodrec_PDPZB',
          41: '(NULL|NULL|prodrec_PDPZB|PROS)'
        }
      });
    },

    navigateLeft: function(e) {
      e.preventDefault();
      if (recommendationsSwiper) {
        recommendationsSwiper.swipePrev();
      }
      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Left_Arrow',
        elementCategory: PRODUCT_RECOMMENDATIONS_ECAT
      });
    },

    navigateRight: function(e) {
      e.preventDefault();
      if (recommendationsSwiper) {
        recommendationsSwiper.swipeNext();
      }
      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Right_Arrow',
        elementCategory: PRODUCT_RECOMMENDATIONS_ECAT
      });
    },

    initializeSwiper: function(options) {
      if(!$('#mb-product-recommendations-swiper').length) {
        return;
      }

      var _this = this;

      //swiper arrows
      var arrowLeft = this.$('#mb-product-recommendations-arrow-left'),
          arrowRight = this.$('#mb-product-recommendations-arrow-right'),
          //change visibility of arrows according to user interaction
          updateSwiperArrowsVisibility = function(swiperImagesLength) {
            //if there are no more images than those visible, we do not show arrows
            arrowLeft.toggleClass('mb-j-off', swiperImagesLength <= _this.slidesPerView);
            arrowRight.toggleClass('mb-j-off', swiperImagesLength <= _this.slidesPerView);
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
      var slides = $('#mb-product-recommendations-swiper .mb-product-recommendations-product').length;
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

      //new instance of swiper
      recommendationsSwiper = $('#mb-product-recommendations-swiper').swiper(swiperSettings);

      //make sure it renders properly upon orientation change
      $(window).resize(function() {
        recommendationsSwiper.reInit();
        _this.centerImagesAndArrows();
        _this.$el.find('.truncated').dotdotdot();
      });

    },

    reInitializeSwiper: function() {
      if(!recommendationsSwiper) {
        return;
      }

      if (recommendationsSwiper) {
        //calculate number of slides
        var numSlides = (this.carouselMode) ? recommendationsSwiper.slides.length - (this.slidesPerView * 2) : recommendationsSwiper.slides.length;
        var newSlidesPerView = (orientation.getOrientation() === 'portrait') ? 2 : 3;
        var newCarouselMode = (numSlides > newSlidesPerView) ? true : false;

        if (numSlides === 0) {
          //destroy references
          recommendationsSwiper = null;
          this.destroy();
          return;
        }

        this.activeSlide = (this.carouselMode) ? recommendationsSwiper.activeIndex - this.slidesPerView : recommendationsSwiper.activeIndex;

        //destroy references
        recommendationsSwiper = null;
        this.carouselMode = newCarouselMode;
        this.slidesPerView = newSlidesPerView;

        this.renderTemplate();
        this.postRender();
      }
    },

    centerImagesAndArrows: function() {
      //center images
      var maxImageHeight = $('.mb-product-recommendations-img-outter').first().outerHeight();
      var images = $('.mb-product-recommendations-img-wrapper');

      images.each(function() {
        util.waitImagesLoad(this, _.bind(function() {
          var height = $(this).outerHeight();
          var top = (maxImageHeight - height) / 2;
          $(this).css('top', top + 'px');
        }, this));
      });

      //center arrows
      var arrows = $('.mb-product-recommendations-arrow');
      arrows.each(function() {
        var height = $(this).outerHeight();
        var top = (maxImageHeight - height) / 2;
        $(this).css('top', top + 'px');
      });
    },

    setProductSelectionContext: function(e) {
      analyticsData.setCMBrowseContext(undefined);
      analyticsData.setCMProductSelectionPosition(undefined);

      var product = $(e.target).closest('div.mb-product-recommendations-product');
      var productIndex = parseInt(product.data('index')) + 1;
      analyticsData.setCMProductSelectionContext({
        4: 'prodrec_PDPZB',
        20: 'rec-' + productIndex,
        41: '(NULL|NULL|prodrec_PDPZB|PROS)'
      });
    }

  });

  return BCOMproductRecommendationsView;
});
