define([
  'views/mainContentView',
  'views/modalView'
], function(MainContentView, ModalView) {
  'use strict';

  var StoreServicesModalView = ModalView.extend({

    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(_.clone(ModalView.prototype.events), {
      'click li.service-value:not(.service-value-selected)' : 'selectServiceValue',
      'click li.service-value-selected' : 'deselectServiceValue',
      'click .mb-j-modalHeader-right' : 'apply',
      'click #stores-list-button-clear': 'clearAll'
    }),

    init: function() {
      this.header = {
        id: 'mb-store-services-modal',
        title: 'filter by',
        right: {
          title: 'apply'
        }
      };

      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.storeServicesModal(_.extend({ header: this.header || {} }, this.model.attributes)));
    },

    selectServiceValue: function(e) {
      var $serviceValue = $(e.currentTarget),
          serviceValue = $serviceValue.data('service-value').toString();

      this.model.set('selectedValues', this.model.get('selectedValues').concat([serviceValue]));
      $serviceValue.addClass('facet-value-selected service-value-selected');
      this.$('.mb-modal-content').addClass('facetValueSelected');
    },

    deselectServiceValue: function(e) {
      var $serviceValue = $(e.currentTarget),
           serviceValue = $serviceValue.data('service-value').toString();

      this.model.set('selectedValues', _.without(this.model.get('selectedValues'), serviceValue));
      $serviceValue.removeClass('facet-value-selected service-value-selected');

      if (_.isEmpty(this.model.get('selectedValues'))) {
        this.$('.mb-modal-content').removeClass('facetValueSelected');
      }
    },

    clearAll: function() {
      this.model.set('selectedValues', []);
      this.render();
    },

    apply: function () {
      this.trigger('done', {
        values: this.model.get('selectedValues')
      });
    }

  });

  return StoreServicesModalView;
});
