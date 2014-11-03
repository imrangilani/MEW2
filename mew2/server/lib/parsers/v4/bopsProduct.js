/**
 * @file bops.js
 *
 * V4 bops parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _       = require('lodash'),
    config  = require('../config'),
    helpers = require('../helpers');

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
  _parse: function (request, payload) {
    var response = {
      bops: {
        store: {},
        availability: {}
      }
    };

    // Currently the request specifies locationId, so we can
    // guarantee the first store in the response is the store we want
    // @TODO only include needed info from the store object
    response.bops.store = payload.stores[0];

    _.each(payload.upcs, function (upc) {
      response.bops.availability[upc.upcNumber] = helpers.getBopsAvailability(upc.upcAvailability[0]);
    });

    return response;
  }
};

module.exports = parser;
