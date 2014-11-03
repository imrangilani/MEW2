/**
 * @file _addToRegistryModel.js
 */
define([
  'models/baseModel'
], function(BaseModel) {

  'use strict';

  return BaseModel.extend({
    urlRoot: '/wedding-registry/addtoregistry',
    addToRegistry: function(toAddItem) {
      if (!toAddItem || !toAddItem.productId || !toAddItem.quantity || !toAddItem.color || !toAddItem.type || !toAddItem.size) {
        throw new Error('Expected `addToRegistry` method to be called with toAddItem with productId and quantity object properties set');
      }

      this.cleanup();

      this.set('productId', toAddItem.productId);
      this.set('color', toAddItem.color);
      this.set('size', toAddItem.size);
      this.set('type', toAddItem.type);
      this.set('quantity', toAddItem.quantity);

      //Upstream server expects application/x-www-form-urlencoded as content-type
      //so we have to set this attribute
      Backbone.emulateJSON = true;
      this.save ({}, { data: this.attributes, success: this.success, error: this.error });
    },
    cleanup: function() {
      var saved = this.get('errorHandler');
      this.clear();
      this.set('errorHandler', saved);
    },
    success: function(model) {
      //Reset back the form attribute
      Backbone.emulateJSON = false;
      model.trigger('modelready');
    },
    error: function() {
      Backbone.emulateJSON = false;
      BaseModel.prototype.error.apply(this, arguments);
    }
  });
});
