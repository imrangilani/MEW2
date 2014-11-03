/**
 * Created by Flavio Coutinho on 7/21/2014.
 */

var moment = require('moment');

module.exports = function(date, options) {
  var momented = options.hash.format ? moment(date, options.hash.format) : moment(date);
  return momented.format('YYYYMMDD') + 'T' + momented.format('HHmmss') + 'Z';
};
