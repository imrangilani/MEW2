define([
  'views/mainContentView',
  'views/modalView',
  'views/storeEventDetailsModalView'
], function(MainContentView, ModalView, StoreEventDetailsModalView) {
  'use strict';

  var StoreEventsModalView = ModalView.extend({

    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(_.clone(ModalView.prototype.events), {
      'click .mb-j-events-modal-close': 'back',
      'click .mb-j-store-event-lineitem': 'showEventDetailsModal'
    }),

    init: function() {
      this.render();
    },

    renderTemplate: function() {
      var storeName = $('#mb-store-name').html();
      this.model.set('storeName' , storeName);
      this.$el.html(TEMPLATE.storeEventsModal(this.model.attributes));
    },

    showEventDetailsModal: function(e, triggeredByPopState) {
      var eventId = $(e.currentTarget).data('event');

      var eventDetails = _.find(this.model.attributes.storeEvents, function(event){
        return event.eventId === eventId;
      });

      this.subViews.storeEventDetailsModalView = new StoreEventDetailsModalView({
        model: this.model,
        className: 'mb-modal-wrapper modal-level-2',
        options: { eventDetails: eventDetails }
      });

      if (!triggeredByPopState) {
        this.pushModalState('storeEventDetailsModalView');
      }
      this.subViews.storeEventDetailsModalView.show();
      return false;
    }

  });

  return StoreEventsModalView;
});
