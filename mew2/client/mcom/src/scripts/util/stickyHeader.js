

define([
  'util/util'
], function(util) {
  'use strict';

  var $touchArea,
      $header,
      $navPlaceholder,
      cachedY = 0;      //saved y coordinate, used to figure out swipe direction - up or down

  var getPointerEvent = function(event) {
    return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
  };

  var threshold = util.hasPositionSticky() ? 0 : 1000;



  //StickyHeader object has only three public methods:
  // removeFixedNavigation() to remove it from view, register() that gets as a parameter id of an original header, and
  // unregister() that cleans up DOM from the fixed header elements
  var stickyHeader = {
    removeFixedNavigation: function() {
      if (util.hasPositionSticky()) {
        $header.removeClass('m-sticky-nav');
      } else {
        $navPlaceholder.css('height', 0);
        $header.removeClass('m-sticky-nav-shim');
      }
    },
    _addFixedNavigation: function(){
      if (util.hasPositionSticky()) {
        $header.addClass('m-sticky-nav');
      } else {
        $navPlaceholder.css('height', $header.css('height'));
        $header.addClass('m-sticky-nav-shim');
      }
    },
    register: function($browseNav ) {
      $touchArea = $('#mb-j-content-container');
      $header = $browseNav;

      if(!util.hasPositionSticky()) {
        $navPlaceholder = $touchArea.find('.m-nav-placeholder');
      }

      //setting the events listeners
      $touchArea.on('touchstart.sticky', _.throttle(function(e) {
          cachedY = getPointerEvent(e).pageY;
        }, 300));

      //Identifies swipe position and direction and invokes hide/show function
      $touchArea.on('touchmove.sticky', _.throttle( _.bind( function(e) {
        if (getPointerEvent(e).pageY > cachedY &&
            getPointerEvent(e).pageY > $touchArea.offset().top + threshold) {
          this._addFixedNavigation();
        } else {
          this.removeFixedNavigation();
        }
      }, this), 300));
    },
    unregister: function() {
      if( $touchArea){
        $touchArea.off('touchstart.sticky');
        $touchArea.off('touchmove.sticky');
      }
    }

  };

  return stickyHeader;
});
