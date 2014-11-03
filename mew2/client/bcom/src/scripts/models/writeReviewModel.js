
define([
  'models/_writeReviewModel'
], function(WriteReviewModel) {
  'use strict';

  var BCOMWriteReviewModel = WriteReviewModel.extend({

    getDefaultAttributes: function() {
      return {
        isrecommended: 'false'
      };
    }

  });

  return BCOMWriteReviewModel;
});