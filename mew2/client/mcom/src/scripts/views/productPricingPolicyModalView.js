define([
  'jquery',
  // Views
  'views/modalView'
], function ($, ModalView) {
  'use strict';

  var ProductPricingPolicyModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    renderTemplate: function () {

      var pricingPolicyText, majorOccurrence, model = this.options.model;

      // If it's a master product and it doesn't have a pricing policy Text
      // we need to search its members and find the major occurrence of priceType
      if (model.get('isMaster') && _.isUndefined(model.get('pricingPolicyText'))) {

        // Gets the major occurrence of a specific pricetype
        majorOccurrence = getMajorOccurrence(model.get('members'), 'priceType');

        if (majorOccurrence) {
          pricingPolicyText = majorOccurrence.pricingPolicyText;
        }
         
      } else {
        pricingPolicyText = model.get('pricingPolicyText');
      }

      this.$el.html(TEMPLATE.productPricingPolicyModal({pricingPolicy: pricingPolicyText}));
    }

  });


  /* Finds the element with major occurrence inside a collection based on an object attribute */
  var getMajorOccurrence = function(collection, baseArgument) {
    var elementOccurrences, key, model;

    if (!_.isUndefined(collection) && !_.isEmpty(collection)) {
      // Count the number of occurrencies of each baseArgument
      elementOccurrences = _.countBy(collection, function(element) { return element[baseArgument];});

      if (!_.isUndefined(elementOccurrences)) {

        // Gets the value of the biggest occurrency
        key = _.findKey(elementOccurrences, function(occurrence) {
          return occurrence === _.max(elementOccurrences);
        });

        model = _.find(collection, function(element) { return element[baseArgument] == key;});
        if (_.isUndefined(model.pricingPolicyText)) {
          model = _.find(collection, function(item) {return item.pricingPolicyText;});
        }

        // Returns the bigges occurrency object from the list
        return model;
      }
      
    }

    return undefined;

  };

  return ProductPricingPolicyModalView;
});
