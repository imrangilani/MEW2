define([
  // Utilities
  'util/spinner',

  // Models
  'models/_searchResultsModel'
], function(Spinner, SearchResultsModel) {
  'use strict';

  var MCOMSearchResultsModel = SearchResultsModel.extend({

    // expected by Spinner.Model
    container: '#mb-j-content-container'
  });

  // Show spinner while content is loading
  _.extend(MCOMSearchResultsModel.prototype, Spinner.Model);

  // Overriding the success callback to check if there is a redirect to a different page
  MCOMSearchResultsModel.prototype.success = function(model, resp, options) {
    if (model.get('redirect')) {
      model.checkForRedirect(model, resp, options);
      _.bind(Spinner.Model._remove, model)();
    } else {
      Spinner.Model.success(model, resp, options);
    }
  };

  return MCOMSearchResultsModel;
});
