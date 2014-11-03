define([], function() {
  'use strict';

  var urlModule = {
    getMenuIdFromUrl: function(fullURL) {
      var url = $.url(fullURL),
          result;

      if ((/\d/).test(fullURL)) {
        result = url.attr('query').match(/id=(\d+)/)[1];
      }
      return result;
    }
  };

  return urlModule;

});
