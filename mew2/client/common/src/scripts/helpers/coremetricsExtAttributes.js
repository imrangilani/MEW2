/**
 * @file
 * A helper for macys coremetrics that allows creation of a string
 * to be passed to cm function from parameters
 * whose position is defined by order and where all positions are separated by '-_-'
 *
 * @return {function} ExtAttributes which will initialize a new {ExtAttributes}
 */
define( [], function(){
  'use strict';

  /**
   * Initialization function
   */
  function ExtAttributes() {

    this.attributes = [];
    this.empty = true;

  }

  /**
   * Adds an attribute the the array in the correct position
   *
   * @param {integer} order represents the position of the attribute
   * @param
   */
  ExtAttributes.prototype.addAttribute = function(order, value) {
    if (order <= 50) {
      this.attributes[order - 1] = value;
      this.empty = false;
    }
  };

  /**
   * Turns the attributes array into a string separated by the identifier expected by coremetrix
   *
   * @return {String} str contains a single string of attributes separated by '-_-'
   */
  ExtAttributes.prototype.createAttributesString = function() {
    if( this.empty ){
      return null;
    }

    // Search for the last coremetrics attribute set and returns it's index
    var cmAttributeLastIndex = _.findLastIndex(this.attributes, function(cmAttr) {
      return typeof(cmAttr) !== 'undefined';
    });

    var str = '';

    for (var i = 0; i < cmAttributeLastIndex + 1; i++ ) {

      if (!_.isUndefined( this.attributes[i])) {
        str += this.attributes[i];
      }
      else {
        str += '';
      }

      // Stops appending '-_-' after the last coremetrics attribute
      i < cmAttributeLastIndex ? str += '-_-' : '';
    }

    return str;
  };

  return ExtAttributes;
});