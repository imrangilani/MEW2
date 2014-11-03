'use strict';

var parser = {};

parser.getAvailabilityMessage = function (details) {
  var message = '';

  switch (details.availability.orderMethod) {
  case 'STR0':
  case 'STR1':
  case 'DIS1':
  case 'POOL':
  case 'ORDR':
  case 'DROP':
  case 'SPEC':
  case 'FACS':
    message = details.availability.upcAvailabilityMessage;
    break;
  case 'STNA':
  case 'DIS0':
  case 'NA':
    message = 'This item is not available';
    break;
  case 'CALLF':
  case 'CALLFS':
  case 'CALLM':
    message = '';
    break;
  default:
    message = '';
    break;
  }

  return message;
};

module.exports = parser;