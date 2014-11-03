define([
  'views/errorView'
], function(ErrorView) {
  'use strict';

  var handler = {
    name: 'notFound',
    paths: ['*actions'],

    hooks: {
      preValidate: ['checkLegacyCategoryURL']
    },

    view: {
      ViewConstructor: ErrorView
    }
  };

  return handler;
});