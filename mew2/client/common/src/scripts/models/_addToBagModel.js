define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  return BaseModel.extend({

    idAttribute: 'user_ID',

    urlRoot: '/api/v2/shoppingbag/item',

    url: function() {
      return this.urlRoot;
    },

    addToBag: function(toAddItem) {
      if (!toAddItem) {
        throw new Error('Expected `addToBag` method to receive a toAddItem object with an `userid` property');
      }

      this.clear();

      var bagItem = _.extend(toAddItem, { showBag: true });

      this.save({ additemsrequest: bagItem },
        { success: this.success, error: this.error });
    },

    updateBag: function(toAddItem) {
      if (!toAddItem) {
        throw new Error('Expected `updateBag` method to receive a toAddItem object with an `userid` property');
      }
      this.clear();
      var userid = _.pick(toAddItem, 'userid'),
          bagItem = _.omit(toAddItem, 'userid');

      this.set('user_ID', userid.userid);

      this.save(
        {
          userid: userid.userid,
          updateitemsrequest: bagItem,
          showBag: true
        }, {
          success: this.success,
          error: this.error
        }, {
          type: 'update'
        }
      );
    },

    success: function(model) {
      model.trigger('modelready');
    },

    error: function(model, xhr) {
      var message = xhr.errorMessage;

      model.set('errorMessage', message);
      model.trigger('modelreadyerror');
    }
  });
});
