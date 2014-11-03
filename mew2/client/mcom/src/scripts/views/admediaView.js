define([
  'jquery',
  // Views
  'views/baseView',
  // Models
  'models/_admediaModel',
  'analytics/analyticsTrigger',
  'util/orientation',
  'util/localstorage',
  'swiper'

], function ($, BaseView, AdMediaModel, analytics, orientation, localstorage) {

  'use strict';

  var carousel,
      LEFT_SWIPER_PADDING = 10,
      IMAGE_PADDING = 10,
      MIN_PHONE_WIDTH = 320,
      INITIAL_IMAGE_DISPLAY_COUNT = 2;

  var _visibleLoaded = $.Deferred();

  //This view is initialized with pool id that is passed
  //from container view
  //We also pass some attributes of container view for coremetrics
  var adView = BaseView.extend({

    events: {
      'click #m-j-invis-prev': 'swipePrev',
      'click #m-j-invis-next': 'swipeNext'
    },
    size: {},
    init: function() {
      //Initialize the model and render when data is received
      if (this.options.poolId) {
        this.model = new AdMediaModel({ id: this.options.poolId });
        this.listenTo(this.model, 'change', this.render);

        //Even though we in general do not resize images on orientation change we still
        //need it for one particular case when the page was opened in landscape and
        //height is less than screen size because of the browser bar
        this.listenTo(orientation, 'orientationchange', this.rerender);
        //Initialize values that determine image width
        this.setSize();
      }
    },
    setSize: function() {
      if (!this.size.windowWidth){
        this.size.windowWidth = Math.min($(window).height(), $(window).width());
        //On iPhone 4 width could be small if measured when browser's header and footer are displayed
        //so we ensure 320 as a min size
        if( this.size.windowWidth < MIN_PHONE_WIDTH){
          this.size.windowWidth = MIN_PHONE_WIDTH;
        }
        this.size.imageWidth = this.size.windowWidth / 4 * 3;
      } else {
        //In case if orientation is changed from landscape, where height is smaller because of
        //the top browser bar to portrait when we get true screen width - set this new correct width to use
        //in the future
        var resizedWidth = Math.min($(window).height(), $(window).width());
        if (this.size.windowWidth < resizedWidth){
          this.size.windowWidth = resizedWidth;
          this.size.imageWidth = this.size.windowWidth / 4 * 3;
        }
      }
    },
    rerender: function() {
      this.setSize();
      this.recalculateWidth(this.model.get('pools')[0].items.length);
      carousel.resizeFix(true);
    },
    recalculateWidth: function(slideCount) {
      //When something gets changed in layout we need to recalculate carousel width
      //We don't need this from layout perspective, but we are setting it to fix swiper defect
      //when it cannot calculate containerWidth when its width set to 100% in some cases of initialization

      $('.swiper-container').width( $(window).width());
      var imageWidth = this.size.imageWidth;

      var slidrWid = imageWidth;
      if (slideCount > 1){
        slidrWid +=  IMAGE_PADDING;
      }

      $('#m-ad-container .swiper-slide').height ('auto');
      $('#m-ad-container .swiper-wrapper').width (slidrWid * slideCount + 10);
      $('#m-ad-container .swiper-slide').width (slidrWid);
      $('#m-ad-container .swiper-slide img').width (imageWidth);
      //Force DOM update
      $('#m-ad-container .swiper-wrapper').hide().show(0);
    },
    displayCarousel: function(adMediaPool) {
      carousel = $('#m-ad-swiper-container').swiper({
        slidesPerView: 'auto',
        initialSlide: 0,
        calculateHeight: true,
        autoResize: false,
        offsetPxBefore: LEFT_SWIPER_PADDING,
        centeredSlides: adMediaPool.items.length === 1 ? true : false,
        onSlideChangeEnd: _.bind(function(swiper) {
          if (adMediaPool.items.length > 2){
            //Shift an imahe to the right a little to display a slice of image on the left
            //Needs to be enhanced with calculation depending on window width
            if (swiper.activeIndex > 0 && swiper.activeIndex < (adMediaPool.items.length - 1)){

              var leftWidth = (adMediaPool.items.length - swiper.activeIndex) * $('#m-ad-container .swiper-slide').width();
              if ($(window).width() < leftWidth){
                var x = swiper.getWrapperTranslate('x');
                var bouceback = (this.size.windowWidth - this.size.imageWidth - IMAGE_PADDING * 2) / 2;
                x += bouceback;
                swiper.setWrapperTranslate(x,0,0);
              }
            }
          }
        }, this)
      });
    },

    swipePrev: function() {
      carousel.swipeTo(carousel.activeIndex - 1);
    },
    swipeNext: function() {
      carousel.swipeTo(carousel.activeIndex + 1);
    },

    displayDeferredImages: function(){
      //In case if gn 2level loaded before swiper is displayed - wait for it to be displayed
      _visibleLoaded.done(
        _.bind( function(){
          if( this.deferredPoolItems){

            _.each( this.deferredPoolItems, function(poolItem){

              var slideHtml = TEMPLATE.adMediaSlide( poolItem);
              carousel.appendSlide(slideHtml);

            });

            this.recalculateWidth(this.model.get('pools')[0].items.length);
            carousel.resizeFix(true);
          }
        }, this ));
    },

    getVisibleIconNumber: function(){
      return INITIAL_IMAGE_DISPLAY_COUNT;
    },

    renderTemplate: function() {
      //We are supposed to have only one pool per id, so we get the first one
      var pools = this.model.get('pools');

      if (pools) {
        var catIndexLoaded = localstorage.get('gn:first2levelsLoaded'),
            adMediaPool = { items : []},
            count = 0,
            visibleIconCount = this.getVisibleIconNumber();

        this.deferredPoolItems = [];

        _.each( pools[0].items, _.bind( function(item){
          //these twp values are used by coremetrics
          item.seqNumber = count + 1;
          item.cmPageName = this.options.cmPageName;
          if (this.options.cmBreadcrumb){
            item.cmBreadcrumb = '_' + this.options.cmBreadcrumb;
          }
          //Split into two array - what is displayed immediately and what
          //after category index is loaded
          if( count >= visibleIconCount && !catIndexLoaded){
            this.deferredPoolItems.push( item );
          } else {
            adMediaPool.items.push(item);
          }
          count++;
        }, this));

        //If anything is displayed later - listen for event to trigger
        //that later display
        if( this.deferredPoolItems.length > 0){
          this.listenTo(Backbone, 'gn:first2levelsLoaded', this.displayDeferredImages);
        }

        //Insert the images into dom. They have to be present for the carousel to initialize
        var html = TEMPLATE.adMedia(adMediaPool);
        this.$el.html(html);

        $('img.m-banner-img').bind( 'load', _.bind( function(){
          //Initialize carousel on the first image load event
          this.recalculateWidth( adMediaPool.items.length);

          this.displayCarousel( adMediaPool);
          $('img.m-banner-img').unbind( 'load' );
          _visibleLoaded.resolve();
        }, this));

        var _this = this;
        $('img.m-banner-img').bind('error', function() {
          // Carousel container
          var divElement = $(this).parent().parent();
          // When there are no images, display the 'evergreen' banner
          if (adMediaPool.name === 'MEW2_HP_MB') {
            divElement.html(TEMPLATE.recovery({id: 'm-recovery-banner'}));
          } else {
            divElement.remove();
          }

          _this.recalculateWidth(adMediaPool.items.length);
          if (carousel) {
            carousel.resizeFix(true);
          }
        });
      }
    },

    renderError: function() {
      if (this.model.id === 'MEW2_HP_MB') {
        $('#m-ad-container').html(TEMPLATE.recovery({id: 'm-recovery-banner'}));
      }
    },
    //TO DO: call this method from parent view when it is destroyed
    close: function(){
      this.stopListening( orientation);
      if (carousel) {
        $('img.m-banner-img').unbind('error');
        carousel.destroy();
        carousel = null;
      }
    }
  });

  return adView;
});
