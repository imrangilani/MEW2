define([
  'util/spinner',
  'models/_categoryModel'
], function(Spinner, CategoryModel) {
  'use strict';

  var MCOMCategoryModel = CategoryModel.extend({

    // expected by Spinner.Model
    container: '#mb-j-content-container'

  });

  // Show spinner while content is loading
  _.extend(MCOMCategoryModel.prototype, Spinner.Model);

  MCOMCategoryModel.prototype.success = function(model, resp, options) {
    CategoryModel.prototype.success.call(this, model, resp, options, Spinner.Model.success);
  };

  MCOMCategoryModel.prototype.error = function(model, resp) {
    CategoryModel.prototype.error.call(this, model, resp, arguments, Spinner.Model.error);
  };

  return MCOMCategoryModel;
});
