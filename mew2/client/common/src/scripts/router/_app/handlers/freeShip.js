define([
  'views/freeShipView'
], function(FreeShipView) {
  'use strict';

  var handler = {
    name: 'freeShip',
    paths: ['m/campaign/free-shipping/free-shipping-everyday'],

    view: {
      ViewConstructor: FreeShipView
    }
  };

  return handler;
});