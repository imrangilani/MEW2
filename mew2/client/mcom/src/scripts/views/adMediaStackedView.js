define([
  'views/baseView',
  'models/_admediaModel'
], function(BaseView, AdMediaModel) {
  'use strict';

  var AdMediaStackedView = BaseView.extend({
    init: function() {
      //Initialize the model and render when data is received
      if (this.options.poolId) {
        this.model = new AdMediaModel({ id: this.options.poolId });
        this.listenTo(this.model, 'change', this.render);
      }
    },

    renderTemplate: function() {
      //We are supposed to have only one pool per id, so we get the first one
      var pools = this.model.get('pools');

      if (pools) {
        var adMediaPool = { items: [] };
        var count = 0;

        _.each(pools[0].items, _.bind(function(item) {
          // these twp values are used by coremetrics
          item.seqNumber = count + 1;
          item.cmPageName = this.options.cmPageName;
          if (this.options.cmBreadcrumb) {
            item.cmBreadcrumb = '_' + this.options.cmBreadcrumb;
          }

          adMediaPool.items.push(item);
          count++;
        }, this));

        this.$el.html(TEMPLATE.adMediaStacked(adMediaPool));
      }
    },

    renderError: function() {
      // Show the home page instead
      App.router.viewController.setMainContentView('home');
    }
  });

  return AdMediaStackedView;
});
