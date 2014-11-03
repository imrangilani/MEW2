define([
  // Views
  'views/modalView'
], function(ModalView) {
  'use strict';
  var BrandIndexSearchResultsView = ModalView.extend({
    renderTemplate: function() {
      this.$el.html(TEMPLATE.brandIndexSearchResults(this.model.toJSON()));
    }
  });

  return BrandIndexSearchResultsView;
});