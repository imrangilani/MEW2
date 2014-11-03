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
    var response = {};

    response = payload;

    return response;

  }
};

module.exports = parser;
