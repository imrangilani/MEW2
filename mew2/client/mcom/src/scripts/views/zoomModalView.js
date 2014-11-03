define([
  // Views
  'views/_zoomModalView',
  //Utils
  'analytics/analyticsTrigger',
  'jquery-hammerjs'
], function (ZoomModalView, analytics) {
  'use strict';

  var isPinchingOut = false,
      maxZoom = false;

  var MCOMZoomModalView = ZoomModalView.extend({
    id: 'm-j-zoom-container',
    events: _.extend(_.clone(ZoomModalView.prototype.events), {
      'click #mb-product-zoom span.m-icon-chevron-sign-left': 'swipePrev',
      'click #mb-product-zoom span.m-icon-chevron-sign-right': 'swipeNext',
      'click #mb-product-zoom span.m-icon-plus-sign': 'zoomIn',
      'click #mb-product-zoom span.m-icon-minus-sign': 'zoomOut',
      'click #mb-product-zoom span.m-icon-refresh': 'zoomReset',
      'doubletap .s7zoomview': 'doDblTap',
      'pinchout .s7zoomview': 'doPinchOut',
      'release .s7zoomview' : 'catchPinchEnd'
    }),
    doDblTap: function(){
      //For double tap fire the tag only when zooming in,
      //When image reached max zoom state we don't do anything
      var view = this.zoomImageView[this.swiper.activeIndex];
      var state = view.imageZoomView.getCapabilityState();
      if( state.hasCapability( s7sdk.ZoomCapabilityState.ZOOM_IN)){
        this.doZoomAnalytics();
      }
    },
    doZoomAnalytics: function(){
      if( this.options.parentView && _.isUndefined( this.options.parentView.model.get('zoomAnalyticsCompleted'))){
        analytics.triggerTag({
          tagType: 'pageElementPDPTag',
          elementCategory: 'PDP ZOOM'
        });

        this.options.parentView.model.set('zoomAnalyticsCompleted', true);
      }
    },
    doPinchOut: function(){
      //If pinchout gesture just started - detect if zoom-in capability is available
      //so we can review this initial state when the gesture ended.
      if( !isPinchingOut){
        var view = this.zoomImageView[this.swiper.activeIndex];
        var state = view.imageZoomView.getCapabilityState();
        maxZoom = state.hasCapability( s7sdk.ZoomCapabilityState.ZOOM_IN) ? false : true;
      }
      isPinchingOut = true;
    },
    catchPinchEnd: function(){
      if( isPinchingOut){
        isPinchingOut = false;
        //If zoom-in was available when the gesture started - fire the tag
        if( !maxZoom){
          this.doZoomAnalytics();
        }
      }
    },

    initializeSwipeControls: function() {
      if( this.swiper.activeIndex === 0){
        $('#m-zoom-controls span.m-icon-chevron-sign-left').addClass('m-disabled-icon');
      }
      else{
        $('#m-zoom-controls span.m-icon-chevron-sign-left').removeClass('m-disabled-icon');
      }

      if( this.swiper.activeIndex === this.swiper.slides.length - 1){
        $('#m-zoom-controls span.m-icon-chevron-sign-right').addClass('m-disabled-icon');
      }
      else{
        $('#m-zoom-controls span.m-icon-chevron-sign-right').removeClass('m-disabled-icon');
      }
      //Enable hammer touch events
      $('#mb-j-zoom-swiper').hammer();
    }

  });

  return MCOMZoomModalView;
});
