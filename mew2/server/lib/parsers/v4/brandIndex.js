/**
 * @file brandIndex.js
 *
 * V4 brandIndex parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var url = require('url'),
    _   = require('lodash');

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param request {Object} the node request object
   * @param payload {Object} the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload) {
    _.each(payload.brandIndex, function(obj) {
      delete obj.ozBrandId;
      obj.brandURL = parser.normalizeUrls(obj.brandURL);
    });
    return payload;
  },

  normalizeUrls: function(brandURL) {
    return url.parse(brandURL).path.replace('&edge=hybrid', '');
  }
};

module.exports = parser;
