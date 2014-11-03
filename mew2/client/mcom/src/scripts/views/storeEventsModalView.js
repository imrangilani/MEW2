define([
  'views/_storeEventsModalView',
  'analytics/analyticsTrigger',
  'jquery.dotdotdot'
], function(StoreEventsModalView, analytics) {
  'use strict';

  var MCOMStoreEventsModalView = StoreEventsModalView.extend({
    
    renderTemplate: function() {
      StoreEventsModalView.prototype.renderTemplate.apply(this, arguments);
    },

    show: function() {
      StoreEventsModalView.prototype.show.apply(this, arguments);
      this.$('.m-store-events-content .mb-j-store-event-lineitem .m-store-event-name').dotdotdot();

      // used by infinite scroll
      this.currentSet = 1;

      // bind an event to listen for the modal container to scroll
      this.bindScroll();
    },

    hide: function() {
      StoreEventsModalView.prototype.hide.apply(this, arguments);
      this.bindScroll();
    },

    /**
     * Bind a scroll event to the modal to handle infinite scroll.
     * Also, set a property on the view to indicate the scroll event has been bound.
     */
    bindScroll: function() {
      $('.mb-modal-wrapper').bind('scroll',  _.bind(_.throttle(this.checkScroll, 300), this));
      this.scrollEventBound = true;
    },

    /**
     * Bind a scroll event to the modal to handle infinite scroll.
     * Also, set a property on the view to indicate the scroll event has been bound.
     */
    unbindScroll: function() {
      $('.mb-modal-wrapper').unbind('scroll');
      this.scrollEventBound = false;
    },

    /**
     * Bound to the modal container to be fired whenever the user scrolls the modal
     */
    checkScroll: function() {
      // Make sure the next set isn't currently rendering
      if (!this.polling){
        if ($('.mb-modal-content').height() - $('.mb-modal-wrapper').scrollTop() - $(window).height() < 100) {
          this.loadNextSet();
        }
      }
    },

    loadNextSet: function() {
      // Disable scroll from causing runaway event rendering
      this.polling = true;

      var start = (12 * this.currentSet);
      var storeEvents = this.model.get('storeEvents').slice(start, start + 12);

      if (_.size(storeEvents) < 12) {
        this.unbindScroll();
      }

      this.$('.m-store-events-content').append(TEMPLATE.storeEvents({ storeEvents: storeEvents }));

      this.currentSet++;

      // Allow infinite scroll to poll for new reviews
      this.polling = false;
    }
  });

  return MCOMStoreEventsModalView;
});
