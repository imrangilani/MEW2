define([
  // Views
  'views/_bagCountView'
], function(BagCountView) {

  'use strict';

  var BCOMBagCountView = BagCountView.extend({

    onBagCountChange: function() {
      BagCountView.prototype.onBagCountChange.apply(this, arguments);
      this.render();
    }

  });

  return BCOMBagCountView;
});
