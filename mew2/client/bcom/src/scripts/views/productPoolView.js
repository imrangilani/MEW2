define([
  'jquery',
  // Views
  'views/baseView',
  // Models
  'models/_admediaModel',
  'jquery.dotdotdot'

], function ($, BaseView) {

  'use strict';

  //This view is initialized with pool id that is passed
  //from container view
  var productPoolView = BaseView.extend({

    render: function () {
      var pools = this.model.attributes.productpool;
      if ( pools && pools.length > 0 ) {
        var priorityPool = pools[0];
        //Always display first 6 assets from astra if more than 6 returned
        priorityPool.products       = _.first(priorityPool.products, 6);
        priorityPool.parentCategory = this.model.attributes.category.name;
        var html = TEMPLATE.productPool(priorityPool);
        this.$el.html(html );
        this.$el.find('.truncated').dotdotdot();
      }
    }

  });

  return productPoolView;
});
