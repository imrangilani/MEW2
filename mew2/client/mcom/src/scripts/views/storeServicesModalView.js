define([
  'views/_storeServicesModalView',
  'analytics/analyticsTrigger'
], function(StoreServicesModalView, analytics) {
  'use strict';

  var MCOMStoreServicesModalView = StoreServicesModalView.extend({

    events: _.extend(_.clone(StoreServicesModalView.prototype.events), {
      'click .mb-j-modalHeader-right' : 'apply'
    }),

    apply: function () {
      StoreServicesModalView.prototype.apply.apply(this, arguments);
      this.doFilterStoresAnalytics();
    },

    doFilterStoresAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'filter_by_services',
        elementCategory: 'STORES'
      });
    }

  });

  return MCOMStoreServicesModalView;
});
