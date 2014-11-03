define([
  'jquery',
  // Views
  'views/baseView',
  // Models
  'models/_admediaModel',
  'analytics/analyticsTrigger',
  'util/localstorage',
  'swiper'

], function ($, BaseView, AdMediaModel, analytics, localstorage) {

  'use strict';

  var carousel;
  var CAT_ICON_WIDTH = 75;
  var visibleLoaded = $.Deferred();

  //This view is initialized with pool id that is passed
  //from container view
  var categoryListView = BaseView.extend({

    events: {
      'click #m-j-invis-cat-prev': 'swipePrev',
      'click #m-j-invis-cat-next': 'swipeNext'
    },

    init: function() {
      //Initialize the model and render when data is received
      if (this.options.poolId) {
        this.model = new AdMediaModel({ id: this.options.poolId });
        this.model.set ('errorHandler', 'ignoreAll');
        this.listenTo(this.model, 'change', this.render);
      }
    },

    displayCarousel: function(adMediaPool) {
      $('.swiper-container').width( $(window).width());
      carousel = $('#m-cat-container').swiper({
        slidesPerView: 'auto',
        calculateHeight: true
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
      visibleLoaded.done(
        _.bind( function(){
          if( this.deferredPoolItems){

            _.each( this.deferredPoolItems, function(poolItem){

              var slideHtml = TEMPLATE.catListSlide( poolItem);
              carousel.appendSlide(slideHtml);

            });
          }
      }, this ));
    },

    getVisibleIconNumber: function(){
      var screenWidth = $(window).width();
      return Math.floor(screenWidth/CAT_ICON_WIDTH) + 1;
    },

    renderTemplate: function() {
      //We are supposed to have only one pool per id, so we get the first one
      var pools = this.model.get('pools');
      var view = this;

      if (pools) {
        var catIndexLoaded = localstorage.get('gn:first2levelsLoaded'),
            categoriesPool = { items : [] },
            count = 0,
            visibleIconCount = this.getVisibleIconNumber();

        this.deferredPoolItems = [];

        _.each(pools[0].items, _.bind(function(item) {
          //these twp values are used by coremetrics
          item.seqNumber = count + 1;
          item.cmPageName = this.options.cmPageName;

          if (App.config.ENV_CONFIG.nav_autoexpand_param !== 'off') {
            item.url += '&aen=true';
          }

          //Split into two array - what is displayed immediately and what
          //after category index is loaded
          if (count >= visibleIconCount && !catIndexLoaded) {
            this.deferredPoolItems.push(item);
          } else {
            categoriesPool.items.push(item);
          }
          count++;
        }, this));

        //If anything is displayed later - listen for event to trigger
        //that later display
        if (this.deferredPoolItems.length > 0) {
          this.listenTo(Backbone, 'gn:first2levelsLoaded', this.displayDeferredImages);
        }

        //Insert the images into dom. They have to be present for the carousel to initialize
        var html = TEMPLATE.categoryList(categoriesPool);
        this.$el.html(html);

        this.displayCarousel(categoriesPool);
        visibleLoaded.resolve();

        $('img.m-category-img').bind('error', function() {
          var divElement = $(this).parent().parent();
          divElement.remove();
        });
      }
    },
    renderError: function(){
      //Don't do anything
    },

    //TO DO: call this method from parent view when it is destroyed
    close: function() {
      if (carousel) {
        $('img.m-category-img').unbind('error');
        carousel.destroy();
        carousel = null;
      }
    }

  });

  return categoryListView;
});
