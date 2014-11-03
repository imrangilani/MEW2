define([
  'models/baseModel',
  'util/util'
], function(BaseModel, util) {

  'use strict';

  return BaseModel.extend({
    urlRoot: '/api/v3/catalog/reviews',

    defaults: function() {
      return {
        requestParams: {
          productId: null,
          sortOption: 'featured',
          numOfReviews: 8,
          pageNumber: 1
        }
      };
    },

    initialize: function() {
      // Generate requestParams by extending the model's default params
      var requestParams = _.defaults(this.get('requestParams'), _.result(this, 'defaults').requestParams);
      this.set('requestParams', requestParams);
    },

    fetch: function() {
      this.set('endpoint', 'list');
      BaseModel.prototype.fetch.apply(this, arguments);
    },

    // @TODO - key should not be treated as just an object, misleading.
    // See source: https://github.com/jashkenas/backbone/blob/master/backbone.js#L463
    // Might be better to do this another way instead of modifing backbone's save or just better naming of variables?
    save: function(key, val, options) {
      this.set('endpoint', 'feedback');

      var reviewerId = this.reviewerIdHandler();

      val = {
        attrs: {
          feedbackType: 'helpfulness',
          feedbackValue: key.feedbackValue || 'Positive',
          reviewerId: reviewerId
        },
        success: this.success,
        error: this.error
      };

      BaseModel.prototype.save.call(this, key, val, options);
    },

    reviewerIdHandler: function() {
      var reviewerId = util.storage.retrieve('reviewerId');
      if (!reviewerId) {
        reviewerId = util.generateGUID();
      }

      // Put reviewerId in storage
      util.storage.store('reviewerId', reviewerId);
      return reviewerId;
    },

    url: function() {
      if (this.get('endpoint') === 'feedback') {
        return this.urlRoot + '/' + this.get('reviewId') + '/feedback';
      }

      // Derive the WSSG URL from these requestParams
      return this.urlRoot + util.buildUrl(this.get('requestParams'));
    },

    /**
     * The server sends back reviews as a flat, sorted array
     *  - add this array as an attribute to our model.
     */
    parse: function(response) {
      return { reviews: response };
    },

    success: function(model, resp, options) {
      if (model.get('endpoint') === 'feedback') {
        if (options.attrs.feedbackValue === 'UNDO') {
          // Delete data pertaining to this
          util.storage.remove(resp.reviewId + '_time');
          util.storage.remove(resp.reviewId + '_Helpfulness');
        } else {
          var date = new Date();
          util.storage.store(resp.reviewId + '_time', date.toISOString());
          util.storage.store(resp.reviewId + '_Helpfulness', options.attrs.feedbackValue);
        }

        model.trigger('reviewFeedbackSaved', {
          reviewId: resp.reviewId,
          feedbackValue: options.attrs.feedbackValue
        }, true);
      } else {
        model.trigger('reviewListReady');
      }

      BaseModel.prototype.success.call(this, model, resp, options);
    },

    error: function(model) {
      if (model.get('endpoint') === 'feedback') {
        model.trigger('reviewFeedbackFailed');
      }

      BaseModel.prototype.error.apply(this, arguments);
    }
  });
});
