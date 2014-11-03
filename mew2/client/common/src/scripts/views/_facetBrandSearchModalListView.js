define([
  // Views
  'views/modalView'
], function(ModalView) {
  'use strict';

  var FacetBrandSearchModalView = ModalView.extend({

    renderTemplate: function() {
      $(this.el).html(TEMPLATE.facetBrandSearchModalList(this.model.attributes));
    }
  });

  return FacetBrandSearchModalView;

});
