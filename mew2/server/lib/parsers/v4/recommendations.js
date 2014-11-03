/**
 * @file recommendations.js
 *
 * V4 Recommendations parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _   = require('lodash'),
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
  _parse: function(request, payload) {
    var response = {
      zoneName: payload.zoneName,
      recommendedproducts: []
    };

    _.each(payload.recommendedproducts, function(obj) {
      if (obj.productprice && !_.isEmpty(obj.productprice)) {
        obj.productprice = helpers.formatV4Price(obj.productprice);
        obj.productURL = (obj.productURL) ? helpers.relativeURL(obj.productURL) : undefined;


        if(process.env.CONFIG_PROS_INFORMANT_CALLS !== 'off'){
          obj.productURL = (obj.productURL &&  obj.choiceid ) ? obj.productURL + '&choiceId=' + encodeURIComponent(obj.choiceid) : undefined;
        }

        response.recommendedproducts.push(obj);
      }
    });

    return response;
  }
};

module.exports = parser;
