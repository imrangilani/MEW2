define([
  'views/_storeEventDetailsModalView',
    'analytics/analyticsTrigger'

], function(StoreEventDetailsModalView, analytics) {
  'use strict';

  var MCOMStoreEventDetailsModalView = StoreEventDetailsModalView.extend({
    events: _.extend(_.clone(StoreEventDetailsModalView.prototype.events), {
      'click .m-j-add-event-to-calendar': 'doAddToCalendarAnalytics'
    }),

    show: function() {
      StoreEventDetailsModalView.prototype.show.apply(this, arguments);
      this.doPageViewAnalytics();
    },

    doAddToCalendarAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'add_to_my_calendar : '+ this.model.get('eventDetails').eventName,
        elementCategory: 'STORES_EVENT',
        att25: this.model.get('storeId')
      });
    },

    doPageViewAnalytics: function(){
      analytics.triggerTag( {
        tagType: 'pageViewTag',
        pageId: 'EVENT: ' + this.model.get('eventDetails').eventName,
        categoryId: 'STORES_EVENT',
        att29: this.model.get('storeId')
      });
    }

  });

  return MCOMStoreEventDetailsModalView;
});
