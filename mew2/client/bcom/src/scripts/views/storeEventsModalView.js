/**
 * Created by Flavio Coutinho on 7/3/2014.
 */
define([
  // Views
  'views/_storeEventsModalView',
  'analytics/analyticsTrigger'
], function(StoreEventsModalView, analytics) {
  'use strict';

  var COREMETRICS_ELEMENT_ID_PREFIX = 'all_store_events',
      COREMETRICS_CATEGORY_ID = 'ALL_STORE_EVENTS';

  return StoreEventsModalView.extend({
    show: function() {
      StoreEventsModalView.prototype.show.apply(this, arguments);

      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: COREMETRICS_CATEGORY_ID + '-' + this.model.get('storeName'),
        categoryId: COREMETRICS_CATEGORY_ID
      });
    },

    showEventDetailsModal: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX +'-select_event_' + this.model.get('storeName'),
        elementCategory: COREMETRICS_CATEGORY_ID
      });

      StoreEventsModalView.prototype.showEventDetailsModal.apply(this, arguments);
    }
  });
});
