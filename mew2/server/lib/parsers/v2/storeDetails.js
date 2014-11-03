/**
 * @file storeDetails.js
 *
 * V2 store parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _  = require('lodash'),
    moment = require('moment'),
    helpers = require('../helpers'),
    config = require('../config');

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
      payload.store = [];
    }

    var store = payload.store[0];

    var result = {
      locationNumber: store.locationNumber,
      storeId: store.storeId,
      storeNumber: store.storeNumber,
      name: store.name,
      address: store.address,
      distance: store.distance,
      location: store.location,
      timezone: helpers.getAttribute(store.attributes, 'TIMEZONE'),
      timezoneOffset: parseInt(helpers.getAttribute(store.attributes, 'GMT_OFFSET') || 0),
      hours: parser.getHours(store.workingHours),
      workingHours: store.workingHours,
      phone: store.phone,
      restaurants: parser.buildStoreInfo(store.attributes, 'RESTAURANT_INFO'),
      services: parser.buildStoreInfo(store.attributes, 'SERVICES')
    };

    if (store.storeEvents) {
      result.storeEvents = _.map(store.storeEvents, function(storeEvent) {
        return {
          eventId: storeEvent.eventId,
          storeId: storeEvent.storeId,
          eventName: storeEvent.name,
          shortDesc: storeEvent.shortDesc,
          startDate: parser.getDate(storeEvent.startDate, helpers.getAttribute(storeEvent.attributes, 'START_TIME')),
          finishDate: parser.getDate(storeEvent.finishDate, helpers.getAttribute(storeEvent.attributes, 'END_TIME'))
        };
      });
    }

    return result;
  }
};

parser.buildStoreInfo = function(attributes, name) {
  if (config.brand === 'mcom') {
    return parser.buildStoreInfoMCOM(attributes);
  }

  var attribute = _.find(attributes, { name : name });

  if (attribute && !_.isEmpty(attribute.serviceAttributeMap)) {
    return attribute.serviceAttributeMap[0].serviceAttributeValues;
  }
};

parser.buildStoreInfoMCOM = function(attributes) {
  var services = [],
      attribute;

  attribute = helpers.getAttribute(attributes, 'SL_BRIDAL');
  if (attribute) {
    services.push('Wedding & Gift Registry');
  }

  attribute = helpers.getAttribute(attributes, 'SL_MATTRESS');
  if (attribute) {
    services.push('Mattresses');
  }

  attribute = helpers.getAttribute(attributes, 'SL_FURNITURE');
  if (attribute) {
    services.push('Furniture Gallery');
  }

  attribute = helpers.getAttribute(attributes, 'SL_SHOPPER');
  if (attribute) {
    services.push('Personal Shopper');
  }

  attribute = helpers.getAttribute(attributes, 'SL_VISITOR');
  if (attribute) {
    services.push('Visitor Services');
  }

  attribute = helpers.getAttribute(attributes, 'SL_RESTAURANT');
  if (attribute) {
    services.push('Restaurants');
  }

  if (!_.isEmpty(services)) {
    return services;
  }

  return undefined;
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

  var daysHours = [];

  // Create a new date object that represents today's date
  var date = new Date();

  // Get a string representation of today's date
  var today = parser.getDateString(date);

  // Find the location in the array that has the store hours info for today's date
  var todayIndex = _.findIndex(storeworkinghours, function (hours) {
    return hours.date === today;
  });

  if (todayIndex !== -1) {
    if (storeworkinghours[todayIndex].storeopenhour && storeworkinghours[todayIndex].storeclosehour) {
      for (var i = 0; i < 7; i++) {
        if (storeworkinghours[todayIndex + i]) {
          if (storeworkinghours[todayIndex + i].storeopenhour && storeworkinghours[todayIndex + i].storeclosehour) {
            daysHours[i] = parser.getHoursString(storeworkinghours[todayIndex + i]);
          }
        }
      }
    }
  }

  var days = [config.hours.labelToday || 'Today\'s hours',
              config.hours.labelTomorrow || 'Tomorrow\'s hours',
              parser.getDayName((date.getDay() + 2) % 7),
              parser.getDayName((date.getDay() + 3) % 7),
              parser.getDayName((date.getDay() + 4) % 7),
              parser.getDayName((date.getDay() + 5) % 7),
              parser.getDayName((date.getDay() + 6) % 7)];

  var dates = {};

  for (var i = 0; i < days.length; i++){
    dates[days[i]] = daysHours[i];
  }

  if (daysHours) {
    return dates;
  }
};

parser.getDayName = function(day) {
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[day];
};

parser.getDate = function(rawDate, rawTime) {
  var dateTime = rawDate.split(' '),
      date = dateTime[0],
      time;

  if (rawTime) {
    time = rawTime.replace(' AM', 'AM').replace(' PM', 'PM');
  }

  if (time === '12:00AM' || time === '11:59PM') {
    time = '';
  }

  return {
    date: moment(date).format('MMMM D'),
    time: time,
    datetime: date
  };
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
 *                          `date`
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
    var amPm = hours24 > 11 ? 'PM' : 'AM';
    var minutes = militaryTime.substring(3);

    return hours + ':' + minutes + amPm;
};


module.exports = parser;
