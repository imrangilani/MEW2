define([
  'util/util'
], function(util) {
  'use strict';

  /**
   * Initialization function
   */
  function ZoomImage( params, config) {

    this.zoomView;
    this.container;
    this.params;
    this.filename = params.filename;
    this.imageIndex = params.imageIndex;
    this.swatch = params.swatch;
    this.showSwatches = params.showSwatches;

    this.resize;
    this.stateChange;
    this.initViewer;

    this.serverUrl = config.serverUrl ;
    this.serverImagesPath = config.serverImagesPath;
    this.iconEffect = config.iconEffect;
    this.zoomStep = config.zoomStep;
  }

  ZoomImage.prototype.init = function() {
      //Listener that gets invoked whenever zoom state of image changes (in, out, reset)
      //We use it to reset state of visible zoom controls
      var onZoomViewerStateChange = _.bind(function() {
        var zoomState = this.imageZoomView.getCapabilityState();
        this.resetControlsButtons(zoomState);
      }, this);

      var resizeImageZoomViewer = _.bind(function() {
        //It looks like this event continues to be send when modal is not displayed
        if (this.imageZoomView) {
          var bodyWidth = window.innerWidth,
              windowHeight = window.innerHeight,
              imageHeight;

          if (bodyWidth < windowHeight){ //Portrait
            //Image height is calulated based on the width of the window
            imageHeight = bodyWidth * 1.224;
          } else {
            //In landscape image is shown to the whole height except the header
            imageHeight = windowHeight - this.getModalHeaderHeight();
          }

          this.container.resize(bodyWidth, imageHeight);
          this.imageZoomView.resize(bodyWidth, imageHeight);
        }
      }, this);

      var initImageZoomViewer = _.bind(function() {
        var containerId = 's7container' + this.imageIndex;

        this.container = new s7sdk.Container('mb-zoom-img-' + this.imageIndex, this.params, containerId);
        this.container.addEventListener(s7sdk.ResizeEvent.WINDOW_RESIZE, resizeImageZoomViewer, false);

        //Create ZoomView componenent.
        this.imageZoomView = new s7sdk.ZoomView(containerId, this.params, "mb-ZoomView-" + this.imageIndex);

        // Add an event listener for zoom capability state changes
        this.imageZoomView.addEventListener(s7sdk.event.CapabilityStateEvent.NOTF_ZOOM_CAPABILITY_STATE, onZoomViewerStateChange);

        if (this.swatch) {
          this.initZoomSwatch.call(this);
        }
      }, this);

      this.params = new s7sdk.ParameterManager();

      this.params.push('serverurl', this.serverUrl);
      this.params.push('ZoomView.asset', this.serverImagesPath + this.filename );
      this.params.push('iconeffect', this.iconEffect);
      this.params.push('zoomstep', this.zoomStep);

      this.params.addEventListener(s7sdk.Event.SDK_READY, initImageZoomViewer,false);
      this.params.init();

      //Save pointers to these functions so we can remove them as events attached to scene7 components
      //This code is temporary until Adobe comes up with view cleanup code as they promised
      this.resize = resizeImageZoomViewer;
      this.stateChange = onZoomViewerStateChange;
      this.initViewer = initImageZoomViewer;
    };

    ZoomImage.prototype.initZoomSwatch = function() {
      // brand-specific implementation
    };

    ZoomImage.prototype.getModalHeaderHeight = function() {
      util.abstractMethod(true);
    };

    ZoomImage.prototype.setZoomStateChange = function() {
      if( this.imageZoomView){
        var zoomState = this.imageZoomView.getCapabilityState();
        this.resetControlsButtons( zoomState);
      }
    };

    ZoomImage.prototype.close = function(){
      //This code is temporary until Adobe comes up with view cleanup code
      this.container.removeEventListener(s7sdk.ResizeEvent.WINDOW_RESIZE, this.resize);
      if( this.imageZoomView ){
        //For some reason on iPhone this event happens sometimes after this.imageZoomView is null
        this.imageZoomView.removeEventListener(s7sdk.event.CapabilityStateEvent.NOTF_ZOOM_CAPABILITY_STATE, this.stateChange);
      }
      this.params.removeEventListener( s7sdk.Event.SDK_READY, this.initViewer );

      $('#mb-zoom-img-' + this.imageIndex).remove();
      this.imageZoomView = null;
    };

    ZoomImage.prototype.zoomIn = function(event){
      this.imageZoomView.zoomIn();
    };

    ZoomImage.prototype.zoomOut = function(event){
      this.imageZoomView.zoomOut();
    };

    ZoomImage.prototype.zoomReset = function(event) {
      this.imageZoomView.zoomReset();
    };

    ZoomImage.prototype.resetControlsButtons = function( zoomState){
      util.abstractMethod(true);
    };

  return ZoomImage;
});