define([
  'views/baseView',
  'models/geoCodeModel'
], function(BaseView, GeoCodeModel) {
  'use strict';

  var MIN_QUERY_LENGTH = 2;
  return BaseView.extend({
    el: '#mb-j-store-autocomplete-container',

    events: {

    },

    init: function() {
      this.model = new GeoCodeModel({
        errorHandler: 'ignoreAll'
      });
      this.listenTo(this.model, 'modelready change:results', this.render);
    },

    triggerAutoComplete: function(query) {
      this.triggerAutoComplete = _.debounce(function(query) {
        if (this.model.get('clearedResults')) {
          this.model.unset('clearedResults');
          return;
        }
        if (query.length < MIN_QUERY_LENGTH) {
          return;
        }

        this.model.set('requestParams', {
          predictionsQuery: query
        });

        this.model.fetch();
      }, App.config.search.autoCompletePulseRate);
      this.triggerAutoComplete(query);
    },

    clearAutoComplete: function() {
      this.model.set('results', []);
      this.model.set('clearedResults', true);
    },

    renderTemplate: function() {
      $('#mb-j-store-autocomplete-container').html(TEMPLATE.storeAutoComplete(this.model.toJSON()));
    }
  });
});
