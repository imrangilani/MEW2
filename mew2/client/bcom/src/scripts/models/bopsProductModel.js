define([
  'models/_bopsProductModel'
], function(BopsProductModel) {
  'use strict';

  return BopsProductModel.extend({
    ignoredMethods: ['EMAIL', 'CALLF', 'CALLM', 'CALLFS']
  });
});
