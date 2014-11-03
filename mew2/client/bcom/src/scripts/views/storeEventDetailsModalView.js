/**
 * Created by Flavio Coutinho on 7/3/2014.
 */
define([
  // Views
  'views/_storeEventDetailsModalView',
  'analytics/analyticsTrigger'
], function(StoreEventDetailsModalView, analytics) {
  'use strict';

  var COREMETRICS_ELEMENT_ID_PREFIX = 'event_details',
      COREMETRICS_CATEGORY_ID = 'EVENT_DETAILS';

  return StoreEventDetailsModalView.extend({
    events: _.extend(_.clone(StoreEventDetailsModalView.prototype.events), {
      'click .b-j-add-event-to-calendar': 'addToCalendarAnalytics'
    }),

    show: function() {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: COREMETRICS_CATEGORY_ID + '-' + this.model.get('storeName'),
        categoryId: COREMETRICS_CATEGORY_ID
      });

      StoreEventDetailsModalView.prototype.show.apply(this, arguments);
    },

    addToCalendarAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX +'-add_to_calendar-' + this.model.get('storeName'),
        elementCategory: COREMETRICS_CATEGORY_ID
      });
    }
  });
});
