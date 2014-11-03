define([
  'models/baseModel',
  'util/util'
], function(BaseModel, util) {
  'use strict';

  var METHOD_GET  = 1,
      METHOD_POST = 2,
      METHOD_DUP  = 3;

  var STORAGE_LIFESPAN = (1000 * 60) * 60 * 48; // 1 min * 60 * 48 = 48 hours

  return BaseModel.extend({
    /**
     * This model is used to get and set review data.
     * The "_currentMethod" property is used to determine
     * which URL and AJAX method to use.
     *
     * @see this.fetch()
     * @see this.save()
     * @see this.url()
     */
    _currentMethod: undefined,

    duplicateCheck: function(callback) {
      // First, check localStorage for this productId/bazaarVoiceId combo
      var isDuplicate = this.checkLocalStorage();

      // If no evidence of duplicate from localStorage, make network call
      if (!isDuplicate) {
        this.once('duplicateCheckCompleted', function(response) {
          callback(response.isDuplicate);
        });

        this.fetch(METHOD_DUP);
      }
      else {
        callback(isDuplicate);
      }
    },

    checkLocalStorage: function() {
      return util.storage.retrieve('review_' + this.productId + '_' + this.bazaarVoiceId, STORAGE_LIFESPAN);
    },

    addToLocalStorage: function() {
      util.storage.store('review_' + this.productId + '_' + this.bazaarVoiceId, 1, true);
    },

    storeNickname: function() {
      var nickname = this.get('reviewSubmit').displayName;

      if (nickname) {
        util.storage.store('reviewNickname', nickname, true);
      }
    },

    getNickname: function() {
      return util.storage.retrieve('reviewNickname', STORAGE_LIFESPAN);
    },

    initialize: function() {
      var productId = this.get('productId');
      var bazaarVoiceId = this.get('bazaarVoiceId');

      // Requires to be initialized with productId and bazaarVoiceId
      if (!productId || !bazaarVoiceId) {
        throw new Error('WriteReviewModel must be initialized with `productId` and `bazaarVoiceId`');
      }

      // Set productId and bazaarVoiceId as direct properties of the model (they don't change)
      this.productId = productId;
      this.bazaarVoiceId = bazaarVoiceId;

      // Clean up expired localStorage keys for past reviews
      var keys = _.filter(_.keys(localStorage), function(key) {
        return key.indexOf('review_') !== -1 && key.indexOf(':timestamp') === -1;
      });

      if (!_.isEmpty(keys)) {
        _.each(keys, function(key) {
          util.storage.retrieve(key, STORAGE_LIFESPAN); // will automatically delete if past expiration
        });
      }
    },

    url: function() {
      var url;

      switch (this._currentMethod) {
      case METHOD_GET:
        url = '/api/v3/catalog/reviewtemplate/' + this.productId + '?userid=' + this.bazaarVoiceId;
        break;
      case METHOD_POST:
        url = '/api/v3/catalog/reviews?productId=' + this.productId;
        break;
      case METHOD_DUP:
        url = '/api/v3/catalog/reviewtemplate/' + this.productId + '?userid=' + this.bazaarVoiceId + '&checkduplicate=true';
        break;
      }

      return url;
    },

    fetch: function(method) {
      this._currentMethod = method || METHOD_GET;
      BaseModel.prototype.fetch.apply(this, arguments);
    },

    save: function() {
      this._currentMethod = METHOD_POST;

      // Format the model data into what the service expects
      var reviewSubmit = {
        reviewerId: this.bazaarVoiceId,
        displayName: this.get('displayName'),
        reviewSubmitAttributes: []
      };

      // All model attributes get saved in reviewSubmitAttributes, with the exception of displayName
      var attributes = _.extend(this.getDefaultAttributes(), _.omit(this.attributes, 'displayName'));
      _.each(attributes, function(value, name) {
        reviewSubmit.reviewSubmitAttributes.push({
          attributeName: name,
          attributeValue: value
        });
      });

      this.clear();
      this.set('reviewSubmit', reviewSubmit);

      BaseModel.prototype.save.apply(this, arguments);
    },

    success: function(model, resp) {
      if (model._currentMethod === METHOD_DUP) {
        model.trigger('duplicateCheckCompleted', resp);
      }
      else {
        BaseModel.prototype.success.apply(this, arguments);
      }
    },

    error: function(model, resp) {
      // 400 means bad nickname
      // @see server/WriteReview.responseCallback()
      if (resp.status === 400) {
        var payload = $.parseJSON(resp.responseText);

        if (payload.field === 'duplicate') {
          model.addToLocalStorage();
        }

        model.trigger('serverError', payload);
      }
      else {
        model.set('errorHandler', 'showModal');
        model.set('errorContainer', model.errorContainer);
        BaseModel.prototype.error.apply(this, arguments);
      }
    },

    getDefaultAttributes: function() {
      return {};
    }
  });
});
