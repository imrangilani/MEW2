define([
  'views/_zoomImageView'
  ], function(ZoomImage){
  'use strict';


  ZoomImage.prototype.getModalHeaderHeight = function() {
    return $('.mb-modal-header').height();
  };

  ZoomImage.prototype.resetControlsButtons = function( zoomState) {
    $('.b-zoom-control-icon-plus').toggleClass('zoom-plus', zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_IN));
    $('.b-zoom-control-icon-plus').toggleClass('zoom-plus-disabled', !zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_IN));

    $('.b-zoom-control-icon-minus').toggleClass('zoom-minus', zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_OUT));
    $('.b-zoom-control-icon-minus').toggleClass('zoom-minus-disabled', !zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_OUT));

    $('.b-zoom-control-icon-reset').toggleClass('zoom-reset', zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_RESET));
    $('.b-zoom-control-icon-reset').toggleClass('zoom-reset-disabled', !zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_RESET));
  };

  return ZoomImage;
});