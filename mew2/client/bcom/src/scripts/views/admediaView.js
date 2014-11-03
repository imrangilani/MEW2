define([
  'jquery',
  // Views
  'views/baseView',
  'views/mainContentView',
  // Models
  'models/_admediaModel',
  'util/orientation',
  'swiper'

], function ($, BaseView, MainContentView, AdMediaModel, orientation) {

  'use strict';

  var admediaView = BaseView.extend({

    init: function () {
      //Initialize the model and render when data is received
      if( this.options.poolId){
        this.model = new AdMediaModel( {id: this.options.poolId} );
        this.model.set('swipable' , this.options.swipable);
        this.listenTo( this.model, 'change', this.render);
      }

    },

    renderTemplate: function () {
      //We are supposed to have only one pool per id, so we get the first one
      var pools = this.model.get('pools');
      var adMediaPool = {};
      if (pools) {
        if (pools[0]) {
          //Always display first 10 assets from astra if more than 10 returned
          adMediaPool = pools[0];
          adMediaPool.items = _.first(adMediaPool.items, 10);
        }
        adMediaPool.swipable = this.model.get('swipable');

        //Insert the images into dom. They have to be present for the carousel to initialize
        var html = TEMPLATE.adMedia(adMediaPool);
        this.$el.html(html);
      }
    },

    postRender: function () {
      $('img.b-banner-img').bind('error', function () {
        $(this).parent().remove();
      });

      this.initSwiper();
      BaseView.prototype.postRender.call(this);
    },

    initSwiper: function() {
      var swipable = this.model.get('swipable');
      var pools = this.model.get('pools');
      var adMediaPool = pools && pools.length > 0 ? pools[0].items : null;

      // Because not all ad-pools are displayed as carousel, so check the flag swipable that's set in the respective view
      if (swipable && (adMediaPool && adMediaPool.length > 1)) {
        var mySwiper = this.$('.swiper-container').swiper({
          pagination: '.b-j-banners-pagination',
          loop: true,
          grabCursor: true,
          calculateHeight: true,
          resizeReInit: true
        });

        this.listenTo(orientation, 'orientationchange', function() {
          mySwiper.reInit();
        });
      }
    },

    renderError: function() {
      if (this.model.id === 'MEW2_HP_PROMOS') {
        this.$el.html(TEMPLATE.adMedia({ items: '' }));
      }
    }

  });

  return admediaView;
});
