define([
  'util/spinner',
  'models/_facetListModalModel'
], function(Spinner, FacetListModalModel) {
  'use strict';

  var MCOMFacetListModalModel = FacetListModalModel.extend({

    // expected by Spinner.Model
    container: '#mb-j-content-container'
  });

  // Show spinner while content is loading
  _.extend(MCOMFacetListModalModel.prototype, Spinner.Model);

    // Override success after extending Spinner.Model
  MCOMFacetListModalModel.prototype.success = function(model, resp, options) {
    model.normalizeFacets();
    Spinner.Model.success(model, resp, options);
  };

  return MCOMFacetListModalModel;
});
