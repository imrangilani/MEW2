/**
 * @file _dataMap.js
 */

define([
  'underscore'
], function(_) {
  'use strict';

  var DataMap = function(map) {
    this._map = map;
  };

  _.extend(DataMap.prototype, {
    toWssg: function(data) {
      var sanitized = {};

      _.each(data, function(value, key) {
        if (typeof this._map[key] === 'string') {
          sanitized[this._map[key]] = value;
        } else if (typeof this._map[key] === 'object') {
          this._map[key].toWssg.call(sanitized, value);
        } else {
          sanitized[key] = value;
        }
      }, this);

      return sanitized;
    },

    fromWssg: function(data) {
      var sanitized = {};
      var invertedMap = {};
      _.each(this._map, function(value, key) {
        if (typeof value === 'string') {
          invertedMap[value] = key;
        }
      }, this);

      _.each(data, function(value, key) {
        if (typeof invertedMap[key] === 'string') {
          sanitized[invertedMap[key]] = value;
        } else if (typeof this._map[key] === 'object') {
          this._map[key].fromWssg.call(sanitized, value, data);
        } else {
          sanitized[key] = value;
        }
      }, this);

      _.each(this._map.wssgKeys, function(key) {
        delete sanitized[key];
      });

      return sanitized;
    }
  });

  return DataMap;
});
