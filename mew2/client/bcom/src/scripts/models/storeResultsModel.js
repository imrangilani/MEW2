define([
  'util/util',
  'models/_storeResultsModel'
], function(util, StoreResultsModel) {
  'use strict';

  return StoreResultsModel.extend({
    parse: function (response) {
      StoreResultsModel.prototype.parse.apply(this, arguments);

      var selectedValues = _(this.get('urlParams')).keys().value(),
          newServiceValues = [],
          newStoreList = [],
          servicesNameMap = {
            'mattress': 'SL_MATTRESS',
            'wifi' : 'SL_THISIT',
            'studio' : 'SL_RESTAURANT',
            'visitor': 'SL_DESIGN',
            'restaurant': 'SL_SHOPPER',
            'outlet' : 'SL_MATERNITY',
            'shopper': 'SL_VISITOR',
            'bridal': 'SL_BRIDAL',
            'furniture' : 'SL_FURNITURE',
            'bops': 'BOPS_ELIGIBILITY'
          };

      if(!_.isEmpty(selectedValues)) {
        _.each(selectedValues, function(value) {
          newServiceValues.push(servicesNameMap[value]);
        });

        _.each(response.stores, function(store){
          _.each(store.attributes, function(attr) {
            if((attr.name.indexOf('SL_') !== -1 || attr.name.indexOf('BOPS_ELIGIBILITY') !== -1) && attr.values[0] === "TRUE") {
              if(_.contains(newServiceValues, attr.name)) {
                newStoreList.push(store);
              }
            }
          });
        });
        response.stores = newStoreList;
      }

      return response;
    }

  });
});
