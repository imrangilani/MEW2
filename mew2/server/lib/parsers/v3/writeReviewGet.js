/**
 * @file writeReviewGet.js
 *
 * V3 GET writeReview parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _ = require('lodash');

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request - the node request object
   * @param {Object} payload - the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload) {
    if (request.url.query.checkduplicate) {
      return {
        isDuplicate: payload.isDuplicate
      };
    }

    var response = {
      nickname: payload.userNickName,
      fields: parser.getFields(payload),
      sliders: parser.getSliders(payload)
    };

    return response;
  }
};

/**
 * Get all of the dynamic FOB-specific fields,
 * based on a known pattern.
 */
parser.getFields = function(payload) {
  return parser.prepareFields(payload, 'contextdatavalue_');
};

/**
 * Get all of the dynamic fit slider fields,
 * based on a known pattern.
 */
parser.getSliders = function(payload) {
  return parser.prepareFields(payload, 'rating_');
};

/**
 * Prepare an array of fields that is ready to be consumed by the client,
 * based on a known pattern.
 */
parser.prepareFields = function(payload, pattern) {
  var fields = [];

  // Grab all field names from the entire list of field names, that start with `pattern`
  var fieldNames = _.filter(payload.FieldsOrder, function(fieldName) {
    return fieldName.indexOf(pattern) === 0;
  });

  // For each valid field name, prepare a mobile-friendly payload for this field
  _.each(fieldNames, function(fieldName) {
    var field = _.find(payload.fields, { Id: fieldName });
    var name = field.Id.replace(pattern, '');

    var idx = fields.push({
      name: name,
      type: field.Type.toLowerCase().replace('input', ''),
      label: field.Label
    });

    // Array.push() returns `idx`, the length of the array after the new element is added.
    // We must decrement this value to get the index of the newly-added item
    idx--;

    if (fields[idx].type === 'select') {
      fields[idx].values = [];

      _.each(field.Options, function(option) {
        // Only include the option if it has a value
        if (option.Value) {
          fields[idx].values.push({
            label: option.Label || option.Value,
            value: option.Value
          });
        }
      });
    }
  });

  if (!_.isEmpty(fields)) {
    return fields;
  }

  return undefined;
};

module.exports = parser;
