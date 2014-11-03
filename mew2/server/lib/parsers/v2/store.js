/**
 * @file store.js
 *
 * V2 store parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _ = require('lodash'),
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
  _parse: function(request, payload, response) {
    if (!payload.success && response.statusCode === 400) {
      // no stores found on the requested location
      response.statusCode = 200;
      payload.stores = [];
    }
    return {
      stores: _.map(payload.store, function(store) {
        return {
          locationNumber: store.locationNumber,
          storeId: store.storeId,
          storeNumber: store.storeNumber,
          name: store.name,
          address: store.address,
          distance: store.distance,
          location: store.location,
          workingHours: store.workingHours,
          timezone: helpers.getAttribute(store.attributes, 'TIMEZONE'),
          timezoneOffset: parseInt(helpers.getAttribute(store.attributes, 'GMT_OFFSET') || 0),
          attributes: store.attributes
        };
      })
    };
  }
};

module.exports = parser;
