define([
  // models
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  var ProductModel = BaseModel.extend({
    urlRoot: '/api/v4/catalog/product',

    url: function() {
      var productId = this.attributes.requestParams.productId;
      return this.urlRoot + '/' + productId + '?viewType=pdp';
    },

    /**
     * Transforms the response received from the server. It duplicates member products that contain
     * more than one latchkey (e.g., pillows inside bedding collections usually span 2 latchkeys: product id 798374).
     *
     * @param {Object} response The raw response received from the server for the product model.
     * @return {Object} The parsed response.
     */
    parse: function(response) {
      if (response.isMaster) {
        return this._duplicateMultiLatchkeyMembers(response);
      }
      return response;
    },

    /**
     * Iterates over the members products and for those that have more than 1 latchkey assigned,
     * it duplicates the product once for each latchkey and sets its latchkey to a single value.
     *
     * This way, the product view can keep the interaction of size, color (etc.) for every product
     * using the model, no matter if the product is shared by more than one latchkey group.
     *
     * Note: this method has side effects: it returns the parsed response but the response provided
     * as an argument is also changed (to avoid the cloning overhead).
     *
     * @param  {Object} response The response coming from the server for the product model.
     * @return {Object} The parsed response containing the duplicated members, if any fell in the filter.
     */
    _duplicateMultiLatchkeyMembers: function(response) {
      var duplicatedMembers = [];

      // go through all members and, if they have multiple latchkeys, duplicate them (one copy for each latchkey)
      _.each(response.members, function(member) {

        if (_.isUndefined(member.latchkeyIds) || member.latchkeyIds.length <= 1) {
          // this member has no latchkeys or only a single one. we just keep it
          duplicatedMembers.push(member);
        } else {
          // this is a member that displays in more than one latchkey
          // we need to clone it for each latchkey value

          _.each(member.latchkeyIds, function(latchkey) {
            var memberDuplicate = _.clone(member);
            memberDuplicate.latchkeyIds = [latchkey];

            duplicatedMembers.push(memberDuplicate);
          });
        }
      });

      response.members = duplicatedMembers;
      return response;
    },

    // Check the URL for a category ID; else, use the activeCategory from response
    getCategoryId: function() {
      var categoryId = $.url().param('CategoryID');

      if (!categoryId) {
        categoryId = this.get('activeCategory');
      }

      return categoryId;
    }
  });

  ProductModel.isColorAvailable = function(product, colorId) {
    // All swatches are available if no active size is selected
    if (!product.activeSize) {
      return true;
    }

    // Create a reference to the particular size for the selected active size
    var size = _.find(product.sizes, function(size) {
      return size.id === product.activeSize;
    });

    // If the current colorId exists in size.colorIds, the color is available for this size
    if (_.contains((size.colorIds || []), colorId)) {
      return true;
    }

    // This color is unavailable for the active size selected
    return false;
  };

  ProductModel.isSizeAvailable = function(product, sizeId) {
    // All sizes are available if no active color is selected
    if (!product.activeColor) {
      return true;
    }

    // Create a reference to the particular color for the selected active color
    var color = _.find(product.colors, function(color) {
      return color.id === product.activeColor;
    });

    // If the current sizeId exists in color.sizeIds, the size is available for this color
    if (_.contains((color.sizeIds || []), sizeId)) {
      return true;
    }

    // This size is unavailable for the active color selected
    return false;
  };

  return ProductModel;
});
