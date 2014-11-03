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
      stores: {
        /**
         * BOPS-ENABLED STORES:
         * bopsAvailable = true, bopsEligible = true
         */
        bops: [],

        /**
         * NON BOPS-ENABLED STORES, PICKUP AVAILABLE:
         * bopsAvailable = false, storeAvailable = true
         */
        pickup: [],

        /**
         * NON BOPS-ENABLED STORES, PICKUP NOT AVAILABLE:
         * bopsAvailable = false, storeAvailable = false
         */
        unavailable: []
      }
    };

    var upcAvailability = payload.upcs[0].upcAvailability;

    _.each(payload.stores, function (store) {
      // Don't add outlets stores in the response
      if (helpers.isOutlet(store)) {
        return;
      }

      // The response sent to the client will only have a subset of that from upstream
      var storeResponse = {
        locationNumber: store.locationNumber,
        name: store.name,
        address: store.address,
        phone: store.phone,
        distance: store.distance.toFixed(2),
        units: store.units,
        hours: parser.getHours(store.storeworkinghours),
        location: store.location
      };

      var raw = _.find(upcAvailability, function (obj) {
        return obj.locationNumber === store.locationNumber;
      });

      var bopsAvailability = helpers.getBopsAvailability(raw);

      if (bopsAvailability.bopsAvailable && bopsAvailability.bopsEligible) {
        // BOPS-ENABLED STORES
        response.stores.bops.push(storeResponse);
      }
      else if (!bopsAvailability.bopsAvailable && bopsAvailability.storeAvailable) {
        // NON BOPS-ENABLED STORE, PICKUP AVAILABLE
        response.stores.pickup.push(storeResponse);
      }
      else if (!bopsAvailability.bopsAvailable && !bopsAvailability.storeAvailable) {
        // NON BOPS-ENABLED STORE, PICKUP NOT AVAILABLE
        response.stores.unavailable.push(storeResponse);
      }
    });

    // Remove empty data sets from response
    if (_.isEmpty(response.stores.bops)) {
      delete response.stores.bops;
    }

    if (_.isEmpty(response.stores.pickup)) {
      delete response.stores.pickup;
    }

    if (_.isEmpty(response.stores.unavailable)) {
      delete response.stores.unavailable;
    }

    return response;
  }
};

/**
 * Prepare an object of store hours information that the client is interested in.
 *
 * @param storeworkinghours {Array} : array of raw store hours objects from the upstream response
 *
 * @return hours {Object} : keyed by:
 *    - `today`    - a string representing today's store hours
 *    - `tomorrow` - a string representing tomorrow's store hours
 */
parser.getHours = function (storeworkinghours) {
  var hoursToday, hoursTomorrow;

  // Create a new date object that represents today's date
  var date = new Date();

  // Get a string representation of today's date
  var today = parser.getDateString(date);

  // Find the location in the array that has the store hours info for today's date
  var todayIndex = _.findIndex(storeworkinghours, function (hours) {
    return hours.storeoperationdate === today;
  });

  if (todayIndex !== -1) {
    // some data is corrupt; ignore hours unless it has all of the information we need
    if (storeworkinghours[todayIndex].storeopenhour && storeworkinghours[todayIndex].storeclosehour) {
      // Today's store hours exist in the response
      hoursToday = parser.getHoursString(storeworkinghours[todayIndex]);

      // We can assume tomorrow's store hours to be the next element in the array
      if (storeworkinghours[todayIndex + 1]) {
        // some data is corrupt; ignore hours unless it has all of the information we need
        if (storeworkinghours[todayIndex + 1].storeopenhour && storeworkinghours[todayIndex + 1].storeclosehour) {
          // Tomorrow's store hours exist in the response
          hoursTomorrow = parser.getHoursString(storeworkinghours[todayIndex + 1]);
        }
      }
    }
  }

  if (hoursToday || hoursTomorrow) {
    return {
      today: hoursToday,
      tomorrow: hoursTomorrow
    };
  }
};

/**
 * Generate a date string for comparision against the upstream store hours dates
 *
 * @param date {Date} : a js date object to use for the string generation
 */
parser.getDateString = function (date) {
  var curr_year = date.getFullYear();

  // months are zero based (+1), and forces leading zero (slice)
  var curr_month = ('0' + (date.getMonth() + 1)).slice(-2);

  // forces leading zero (slice)
  var curr_date = ('0' + date.getDate()).slice(-2);

  return curr_year + '-' + curr_month + '-' + curr_date;
};

/**
 * Generate a human-readable string for the store hours for this particular date,
 * using the upstream service as the source of data.
 *
 * @param obj {Object} : the raw hours object from the upstream data source,
 *                       with the following keys:
 *                          `storeoperationdate`
 *                          `storeopenhour`
 *                          `storeclosehour`
 */
parser.getHoursString = function (obj) {
  return parser.getFormattedTime(obj.storeopenhour) + ' - ' + parser.getFormattedTime(obj.storeclosehour);
};

/**
 * Return a time string formatted with am / pm
 *
 * @param militaryTime {String} : a military time string, e.g. '10:00'
 *    ** Assumption is that this string is exactly 5 characters, always
 */
parser.getFormattedTime = function (militaryTime) {
    // Hack to prevent error when WSSG doesn't have all the data in the response
    if (!militaryTime) {
      return;
    }
    var hours24 = parseInt(militaryTime.substring(0, 2), 10);
    var hours = ((hours24 + 11) % 12) + 1;
    var amPm = hours24 > 11 ? 'pm' : 'am';
    var minutes = militaryTime.substring(3);

    return hours + ':' + minutes + amPm;
};

module.exports = parser;
