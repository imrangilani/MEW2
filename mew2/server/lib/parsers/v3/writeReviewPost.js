/**
 * @file writeReviewPost.js
 *
 * V3 POST writeReview parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _       = require('lodash');

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request - the node request object
   * @param {Object} payload - the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload) {
    return payload;
  }
};

module.exports = parser;
