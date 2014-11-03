'use strict';

var parser = {};

parser.getAvailabilityMessage = function (details) {
  var message = '', colonPos = '', tail = '';

  switch (details.availability.orderMethod) {
  case 'STR0':
  case 'STR1':
  case 'DIS1':
  case 'POOL':
    message = 'in stock';
    break;
  case 'STNA':
  case 'DIS0':
  case 'NA':
    message = 'This item is not available';
    break;
  case 'CALLF':
  case 'CALLFS':
  case 'CALLM':
    message = details.availability.upcAvailabilityMessage;
    break;
  case 'SPEC':
    colonPos = details.availability.upcAvailabilityMessage.indexOf(':');
    tail = details.availability.upcAvailabilityMessage.substring(colonPos);
    message = 'special order ' + tail;
    break;
  case 'ORDR':
    colonPos = details.availability.upcAvailabilityMessage.indexOf(':');
    tail = details.availability.upcAvailabilityMessage.substring(colonPos);
    message = 'backorder ' + tail;
    break;
  case 'DROP':
    message = details.availability.upcAvailabilityMessage;
    break;
  default:
    message = '';
    break;
  }

  return message;
};

module.exports = parser;