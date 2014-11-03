/**
 * @file signIn.js
 *
 * V1 sign in parser - takes JSON response from upstream data source (SECURE HOST),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request The node request object
   * @param {Object} payload The JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload) {
    // Just for debug purpose
    // console.log('payload: ', payload);

    return payload;
  }
};

module.exports = parser;
