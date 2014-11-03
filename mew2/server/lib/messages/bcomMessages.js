'use strict';

var messages = {
  addToBag: {
    ERROR_101_BAGSERVICE_UNAVAILABLEUPC_ERRORCODE: 'We\'re sorry. This product is currently unavailable.',
    ERROR_102_BAGSERVICE_ITEMQUANTITYMAXED_ERRORCODE: 'You reached the limit for this item; select another color/size.',
    ERROR_137_BAGSERVICE_ITEMINBAG_EXCEEDS_IS_MAX_QUANTITY: 'You\'ve reached the limit for this item. If you\'d like to proceed, please select another size or color.',
    ERROR_200_ADDBAG_ERROR: 'Your bag is full (max 100 items). Please proceed to checkout or remove an item.',
    103: 'We are sorry. You must select at least one item from our catalog. Please try again.'
  },
  addToRegistry: {
		UNREGISTRABLE_ONE: 'We\'re sorry. 1 item has not been added to your registry because it is not available for registry.',
		UNREGISTRABLE_MANY: 'We\'re sorry. %d items have not been added to your registry because they are not available for registry.',
		LIMIT_EXEEDED: 'You\'ve reached the limit for this item. Please select another color/size.',
		GENERIC: 'We\'re sorry. The item you selected has not been added to your registry. Please try again.'
  }
};

module.exports = messages;
