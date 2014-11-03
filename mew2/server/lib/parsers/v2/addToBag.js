/**
 * @file addToBag.js
 *
 * V2 add to bag parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */
'use strict';
var config  = require('../config'),
    messages = require('../../messages/' + config.brand + 'Messages');

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

    if (payload.success === false){
      var errorCode = payload.error,
          upcErrorCode,
          message;

      if (payload.messages && payload.messages.length) {
        message = payload.messages[0];
      } else {
        if (payload.shoppingbag && payload.shoppingbag.bagitems && payload.shoppingbag.bagitems.length) {
          var bagItems = payload.shoppingbag.bagitems;

          for (var i = 0, j = bagItems.length; i < j; i++) {
            var cur = bagItems[i];
            if (cur.messages && cur.messages.length) {
              message = cur.messages[0];
              if (cur.errorcodes && cur.errorcodes.length) {
                upcErrorCode = cur.errorcodes[0];
              }
              break;
            }
          }
        }
      }

      if (messages.addToBag) {
        // Look for error first at the response summary level and then individual UPC level
        if (messages.addToBag[errorCode]) {
          message = messages.addToBag[errorCode];
        } else if (messages.addToBag[upcErrorCode] && !payload.messages) {
          message = messages.addToBag[upcErrorCode];
        }
      } else if (message === undefined) {
        //This line for development only to identify error codes that are not specified in the story.
        //Should be replaced with another error messsage when closer to release.
        message = 'Unknown error. ErrorCode: ' + errorCode;
      }

      response.errorMessage = message;
      response.success = false;
    } else {
      response = payload;

      if (request.method === 'put') {
        response.updated = true;
      }
    }

    return response;
  }
};

module.exports = parser;
