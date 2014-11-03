define([
  'views/mainContentView',
  'views/modalView',
  'util/util'
], function(MainContentView, ModalView, util) {
  'use strict';

  var StoreEventDetailsModalView = ModalView.extend({
    events: _.extend(_.clone(ModalView.prototype.events), {
      'click .mb-j-event-details-modal-close': 'back'
    }),

    init: function() {
      this.model.set('eventDetails' , this.options.eventDetails);
      this.render();
    },

    renderTemplate: function() {
      this.model.attributes.eventDetails.shortDesc = this.model.attributes.eventDetails.shortDesc.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');

      this.$el.html(TEMPLATE.storeEventDetailsModal(
        _.defaults(this.model.attributes.eventDetails, { addToCalendarLink: this.generateAddToCalendarLink() }
      )));
    },

    generateAddToCalendarLink: function() {
      var eventDetails = this.model.get('eventDetails'),
          calendarFormat = util.isAndroid() ? 'vcs' : 'ics';

      return '/store/event/calendar/{format}{query}'
        .replace('{format}', calendarFormat)
        .replace('{query}', util.buildUrl({
          productId: App.config.stores.calendarProductId,
          uniqueId: eventDetails.eventId,
          creationDateTime: new Date(),
          startDateTime: eventDetails.startDate.datetime,
          endDateTime: eventDetails.finishDate.datetime,
          eventName: eventDetails.eventName,
          shortDesc: eventDetails.shortDesc.replace(/\<br\/\>/g, '\\n'),
          location: this.getAddressString(this.model.get('address'))
        })
      );
    },

    getAddressString: function(addressObject) {
      var addressList = [
            // 504 Broadway
            addressObject.line1,
            // 5th floor, New York, NY
            [addressObject.line2, addressObject.city, addressObject.state].join(', '),
            // 10012
            addressObject.zipCode,
            // USA
            addressObject.countryCode];

      // 504 Broadway 5th floor, New York, NY 10012 USA
      return addressList.join(' ');
    }
  });

  return StoreEventDetailsModalView;
});
