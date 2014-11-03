define([
  'views/_productRecommendationsView',
  'util/orientation',
  'analytics/analyticsData',
  'models/rtoModel',
  'jquery.dotdotdot'
], function(ProductRecommendationsView, orientation, analyticsData, RTOModel) {
  'use strict';

  var MCOMproductRecommendationsView = ProductRecommendationsView.extend({
    events: {
      'click .m-product-recommended-product': 'doRecommendationsAnalytics'
    },

    init: function() {
      this.listenTo(orientation, 'orientationchange', this.resizeFix);
      ProductRecommendationsView.prototype.init.apply(this, arguments);
    },

    postRender: function() {
      if (this.recommendedProducts) {
        this.productRecommendationsSlider = $('#m-product-recommended-swiper').swiper({
          // Default slide class was interfering with other swipers on PDP
          slideClass: 'm-product-recommended-product',
          slidesPerView: 'auto',
          initialSlide: 0,
          autoResize: false,
          calculateHeight: true
        });

        this.$('.m-product-recommended-name').dotdotdot();

        if (App.config.ENV_CONFIG.pros_informant_calls !== 'off') {
          if (!_.isEmpty(this.productRecommendationsSlider)) {
            if (_.isEmpty(this.rtoModel)) {
              this.rtoModel = new RTOModel(null, { recommendations: this.model, slider: this.productRecommendationsSlider });
              this.productRecommendationsSlider.params.onSlideChangeEnd = _.bind(this.fireInformantSlideChangeCall, this);
              this.listenTo(orientation, 'orientationchange', _.bind(this.fireInformantSlideChangeCall, this));
              this.fireInformantSlideChangeCall();
            }
          }
        }
      }
    },

    fireInformantClickedCall: function(clickedSlide) {
      this.rtoModel.sendInformantCall(this.rtoModel.getInformantCallTypes().CLICKED, clickedSlide);
    },

    fireInformantSlideChangeCall: function() {
      this.rtoModel.sendInformantCall(this.rtoModel.getInformantCallTypes().PRESENTED);
    },

    doRecommendationsAnalytics: function(e) {

      if (App.config.ENV_CONFIG.pros_informant_calls !== 'off') {
        this.fireInformantClickedCall (this.productRecommendationsSlider.activeSlide());
      }

      var seqId = $(e.target).closest('.m-product-recommended-product').attr('recommended-prod-seq-id');
      analyticsData.setCMProductSelectionContext({ 1: 'PDPZ2_Pos' + seqId });
      analyticsData.setCMBrowseContext(undefined);
      analyticsData.setCMSearchContext(undefined);
      analyticsData.setCMProductSelectionPosition(undefined);
    }
  });

  return MCOMproductRecommendationsView;

});
