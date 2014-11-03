define([
  // Views
  'views/mainContentView',
  'views/storeEventsModalView',
  'views/storeEventDetailsModalView',

  // Models
  'models/storeDetailsModel',

  'moment'
], function(MainContentView, StoreEventsModalView, StoreEventDetailsModalView, StoreDetailsModel, moment) {
  'use strict';

  var StoreDetailsView = MainContentView.extend({
    events: {
      // When filter results is clicked
      'click #mb-j-store-viewall-events': 'viewAllEvents',
      'click .mb-j-store-event-lineitem': 'showEventDetailsModal',
      'click .mb-j-back': 'back'
    },

    init: function() {
      var data;

      if (this.options.locno && this.options.locno !== 'legacy') {
        data = { locnbr: this.options.locno };
      } else if (this.options.storeid) {
        data = { storeid: this.options.storeid };
      }

      // Initialize STORE-DETAILS VIEW/MODEL
      this.model = new StoreDetailsModel(data);
      this.listenTo(this.model, 'modelready', this.render);

      // Fetch the MODELS
      this.model.fetch();
    },

    back: function() {
      if (App.router.isDeepLink()) {
        App.router.navigate('shop/store/search', { trigger: true, replace: true });
      }
      else {
        MainContentView.prototype.back.apply(this, arguments);
      }
    },

    getViewData: function() {
      return this.model.attributes;
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.storeDetails(this.getViewData()));

      this.subViews.storeEventsModalView = new StoreEventsModalView({
        model: this.model
      });
    },

    viewAllEvents: function(e, triggeredByPopState) {
      if (!this.subViews.storeEventsModalView) {
        this.subViews.storeEventsModalView = new StoreEventsModalView({
          model: this.model
        });
      }
      if (!triggeredByPopState) {
        this.pushModalState('storeEventsModalView');
      }
      this.subViews.storeEventsModalView.show();
      return false;
    },

    showEventDetailsModal: function(e, triggeredByPopState) {
      var eventId = $(e.currentTarget).data('event');

      var eventDetails = _.find(this.model.attributes.storeEvents, function(event){
        return event.eventId === eventId;
      });

      this.subViews.storeEventDetailsModalView = new StoreEventDetailsModalView({
        model: this.model,
        className: 'mb-modal-wrapper modal-level-1',
        options: { eventDetails: eventDetails }
      });

      if (!triggeredByPopState) {
        this.pushModalState('storeEventDetailsModalView');
      }
      this.subViews.storeEventDetailsModalView.show();
      return false;
    }
  });

  Handlebars.registerHelper('checkToHide', function(attributeName) {
    if (attributeName === 'orphan') {
      return '';
    }

    return attributeName;
  });

  Handlebars.registerHelper('isPhoneNumber', function(attributeValue, options) {
    var prefix = '^\\+?[0-9\\-]+\\*?$',
        regex = new RegExp(prefix);

    if (attributeValue.match(regex)) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('eventMonth', function(startDate) {
    return moment(startDate.datetime).format('MMM');
  });

  Handlebars.registerHelper('eventDay', function(startDate) {
    return moment(startDate.datetime).format('DD');
  });

  Handlebars.registerHelper('eventDateTime', function(startDate, endDate) {
    var eventDate;

    if (startDate && endDate) {
      if (startDate.date === endDate.date) {
        eventDate = '<span>' + startDate.date;
      } else {
        eventDate = '<span>' + startDate.date + ' - ' + endDate.date;
      }

      if (startDate.time) {
        eventDate += ', ' + startDate.time;

        if (!_.isEmpty(endDate.time) && endDate.time !== startDate.time) {
          eventDate += ' - ' + endDate.time;
        }

        eventDate += '</span>';
      } else {
        eventDate += '</span>';
      }
    }

    return new Handlebars.SafeString(eventDate);
  });

  Handlebars.registerHelper('formatDateForEvent', function(startDate) {
    var eventDate = startDate.split(','),
        finalDate;

    if(eventDate && eventDate[0]) {
      finalDate = eventDate[0].split(' ');
      finalDate[0] = finalDate[0].substring(0,3);
    }
    return finalDate[0] + ' ' + finalDate[1];
  });

  return StoreDetailsView;
});
