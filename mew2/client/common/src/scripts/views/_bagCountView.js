define([
  // Libraries
  'jquery',
  'underscore',
  'backbone',

  // Views
  'views/baseView',

  //Models
  'models/bagCountModel',

  // Utils
  'util/multiValueCookie',
  'analytics/analyticsTrigger',
  'config'
], function($, _, Backbone, BaseView, BagCountModel, mvCookie, analytics, config) {

  'use strict';

  var BagCountView = BaseView.extend({
    el: '#mb-bag-count-container',

    init: function() {
      //Render the bag icon and empty canvas for the bag count
      this.render();
      //Initialize model and listeners
      this.model = new BagCountModel();
      this.listenTo(this.model, 'change:bagItemsCount', this.onBagCountChange);
      this.listenTo(Backbone, 'bagItemCountUpdate', this.retrieveBagCount);

      if (_.isUndefined(mvCookie.get('CartItem', 'GCs')) && _.isUndefined(mvCookie.get(config.cookies.onlineUid))){
        mvCookie.set('CartItem', 0, 'GCs');
        mvCookie.set('UserName', '', 'GCs');
      }

      //Retrieve the value of the bag count which will trigger ui update
      this.retrieveBagCount();
    },

    renderTemplate: function() {
      //Render the bag icon and empty canvas for the bag count
      this.$el.html(TEMPLATE.bagCount(this.model ? this.model.attributes : {}));
    },

    retrieveBagCount: function() {
      //Bag count can be initialized either from the GCs cookie
      //or retrieved from service call if user id is set in previous sessions
      //If there's no user id - no count is displayed until it is created during addToBag
      var bagItemsCount = mvCookie.get('CartItem', 'GCs');
      //If CartItem cookie is not set
      if (_.isUndefined(bagItemsCount)) {
        var userId = mvCookie.get(config.cookies.onlineUid);
        //If userId cookie is not set - do not display cart count
        if (_.isUndefined(userId)) {
          //Testing only until AddToBag sets (macys|bloomingdales)_online_uid cookie
          return;
        } else {
          //If userId cookie is set - get bag count from the service
          this.model.set('userId', userId);
          this.model.fetch();
        }
      } else {
        //Use cookie-stored value to display
        this.model.set('bagItemsCount', bagItemsCount);
      }

    },

    onBagCountChange: function() {
      var bagItemsCount = this.model.get('bagItemsCount');
      if (bagItemsCount > 0) {
        if (_.isUndefined(mvCookie.get('CartItem', 'GCs'))) {
          //If we are here it means we retrieved item count from service
          //and need to store the items in the cookie
          mvCookie.set('CartItem', bagItemsCount, 'GCs');
          mvCookie.set('UserName', '', 'GCs');
        }
      }
    }

  });

  return BagCountView;
});
