define([
  'views/_zoomImageView'
  ], function(ZoomImage){
  'use strict';



  ZoomImage.prototype.getModalHeaderHeight = function() {
    return $('#mb-product-zoom .mb-modal-header').height();
  };

  ZoomImage.prototype.resetControlsButtons = function( zoomState){
    $('#m-zoom-controls span.m-j-state').removeClass('m-disabled-icon');

    if( !zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_IN) ){
      $('#m-zoom-controls span.m-icon-plus-sign').addClass('m-disabled-icon');
    }

    if( !zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_OUT)){
      $('#m-zoom-controls span.m-icon-minus-sign').addClass('m-disabled-icon');
    }

    if( !zoomState.hasCapability(s7sdk.ZoomCapabilityState.ZOOM_RESET)){
      $('#m-zoom-controls span.m-icon-refresh').addClass('m-disabled-icon');
    }
  };

  ZoomImage.prototype.initZoomSwatch = function() {
    if( this.showSwatches){
      var str = '<img src="' + this.serverUrl + '/' + this.serverImagesPath + this.swatch + '" class="m-zoom-swatch" />';
      $('#mb-zoom-img-' + this.imageIndex).append( str);
    }
  };

  return ZoomImage;
});