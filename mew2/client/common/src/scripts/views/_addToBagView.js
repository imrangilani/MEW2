define([
  'jquery',
  // Views
  'views/overlayView',
  // Models
  'models/addToBagModel',
  // Util
  'util/util',
  'util/multiValueCookie'
], function($, OverlayView, AddToBagModel, util, mvCookie) {
  'use strict';

  var addToBagView = OverlayView.extend({
    init: function() {
      this.model = new AddToBagModel();
      this.listenTo(this.model, 'modelready', this.render);
      this.listenTo(this.model, 'modelreadyerror', this.renderError);
    },

    renderTemplate: function() {
      if (this.showModelErrorMessage()) {
        return;
      }

      this.setUserIdIfNotRegistered();
      this.updateBagCount();

      var viewModel = this.getViewModel();
      var html = TEMPLATE.addToBag(viewModel);

      this.$el.html(html);

      this.$el.removeClass('hide');
      this.showMask();
    },

    show: function(product, type, pageProduct, eGiftCardParams, prosChoiceId) {
      var upcKey = product.activeUpc.upcKey;
      this.model.product = product;
      this.pageProduct = pageProduct;
      var bagModelParams = {
        quantity: product.activeQty || 1,
        upcid: product.upcs[upcKey].upcid,
        userid: mvCookie.get(App.config.cookies.onlineUid),
        trackingInfo: this.getShop5TrackingInfo(product),
        trackingCategory: this.getShop5TrackingCategory()
      };
      if (product.isEGC && eGiftCardParams) {
        _.defaults(bagModelParams, eGiftCardParams);
      }

      if (prosChoiceId){
        bagModelParams.choiceId = decodeURIComponent(prosChoiceId);
      }

      if (type && type === 'PDPUPDATE') {
        bagModelParams.itemseq = parseInt(product.requestParams.seqno);
        this.model.updateBag(bagModelParams);
      } else {
        this.model.addToBag(bagModelParams);
      }
    },

    getShop5TrackingInfo: function() {
      //placeholder, implemented in brand view
      return '';
    },

    getShop5TrackingCategory: function() {
      return '';
    },

    postRender: function() {
      if (this.hasModelError()) {
        return;
      }

      this.fireCoremetrics(this.model.product);
    },

    hasModelError: function() {
      return this.model.get('success') !== true;
    },

    showMessage: function(message) {
      window.alert(message);
    },

    showModelErrorMessage: function() {
      if (!this.hasModelError()) {
        return false;
      }

      var message = this.model.get('errorMessage');
      this.showMessage(message);

      return true;
    },

    getViewModel: function() {
      util.abstractMethod(true);
    },

    setUserIdIfNotRegistered: function() {
      var registered = this.model.get('registered');

      if (!registered) {
        mvCookie.set(App.config.cookies.onlineUid, this.model.get('userid'));
      }
    },

    updateBagCount: function() {
      var bag = this.model.get('shoppingbag');

      if (_.isUndefined(bag.totalquantity)) {
        throw new Error('');
      }

      mvCookie.set('CartItem', bag.totalquantity, 'GCs');
      Backbone.trigger('bagItemCountUpdate');
    },

    fireCoremetrics: function() {
      // Abstract method
    },

    renderError: function() {
      var message = this.model.get('errorMessage');
      this.showMessage(message);
    }
  });

  return addToBagView;
});
