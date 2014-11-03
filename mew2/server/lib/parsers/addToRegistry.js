/**
 * @file addToRegistry.js
 *
 * V2 add to bag parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';
var util    = require('util'),
    config  = require('./config'),
    messages = require('../messages/' + config.brand + 'Messages');

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

    if (payload.nonRegistrableCount && payload.nonRegistrableUPCs){
        //If an item cannot be registered - replace upstream error with our error
      if (payload.nonRegistrableCount === 1) {
        response.errorMessage = messages.addToRegistry.UNREGISTRABLE_ONE;
      } else {
        var message = messages.addToRegistry.UNREGISTRABLE_MANY;

        response.errorMessage = util.format(message,  payload.nonRegistrableCount);
      }
    } else if (payload.LIMIT_EXCEEDED){
        //If limit exceeded - replace upstream error with our error
      response.errorMessage = messages.addToRegistry.LIMIT_EXEEDED;
    } else if (payload.REDIRECT){
      response.REDIRECT = payload.REDIRECT;
    } else if (payload.HAS_REGISTRY && payload.HAS_REGISTRY === 'NO'){
      response.noRegistry = true;
      response.success = true;
    } else if (payload.ERROR_MSG) {
        //If this error is specified - use error message from upstream response
      response.errorMessage = payload.ERROR_MSG;
    } else if (payload.BVR_MESSAGE) {
      response.message = payload.BVR_MESSAGE;
      response.registrant = payload.registrantInfo.registrantName;
      response.coregistrant = payload.registrantInfo.coRegistrantName;
      response.success = true;
    } else {
      //Catch all error message
      response.errorMessage = messages.addToRegistry.GENERIC;
    }

    return response;
  }
};

module.exports = parser;
