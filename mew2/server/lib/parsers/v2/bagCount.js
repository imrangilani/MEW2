/**
 * @file bagCount.js
 *
 * V2 bag count parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

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
    var response = { shoppingbag: { bagItemsCount: payload.bagItemCount }};
    return response;
  }
};

module.exports = parser;
