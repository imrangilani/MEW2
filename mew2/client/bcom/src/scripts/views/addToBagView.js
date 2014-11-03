define([
  'jquery',
  // Views
  'views/_addToBagView',
  // Analytics
  'analytics/analyticsTrigger',
  'analytics/analyticsListener',
  'analytics/analyticsData',
  // Util
  'util/util',
  'util/multiValueCookie',
  'util/productMessageToast',
  'util/scroll',
  'util/orientation',
  'util/horizontalSpacer'
], function($, AddToBagView, analytics, analyticsListener, analyticsData, util, mvCookie, MessageToast, scroll, orientation, horizontalSpacer) {

  'use strict';

  var BCOMAddToBagView = AddToBagView.extend({
    id: 'b-atb-overlay',

    init: function() {
      AddToBagView.prototype.init.apply(this, arguments);

      this.listenTo(orientation, 'orientationchange', function() {
        this.updateButtonsWidth();
      });
    },

    getViewModel: function() {
      var bag = this.model.get('shoppingbag');

      var bagTotal = parseFloat(bag.merchandisetotal);
      var product = this.model.product;
      var itemQuantity = (this.model.get('additemsrequest')) ? this.model.get('additemsrequest').quantity : this.model.get('updateitemsrequest').quantity;
      var bagItemWithoutGift = _.filter(bag.bagitems, function(item){ return item.isgift == false; }) ;
      var bagItem = _.last(bagItemWithoutGift);
      var prices = product.prices;
      var username = mvCookie.get('UserName', 'GCs');
      var updated = this.model.get('updated') || false;

      var itemPrice = bagItem.customprice ? bagItem.customprice : bagItem.retailprice;
      product.itemPrice = itemPrice;
      var totalPrice = itemQuantity * itemPrice;
      var youSaved = 0;

      if (prices && prices.length > 1) {
        var highPrice = parseFloat(prices[0].amt.replace(/[\$,]/g, ''));
        youSaved = (highPrice - itemPrice) * itemQuantity;
      }

      return {
        bag: bag,
        product: product,
        username: username,
        itemQuantity: itemQuantity,
        itemPrice: util.formatMoney(itemPrice),
        totalPrice: util.formatMoney(totalPrice),
        bagTotal: util.formatMoney(bagTotal),
        youSaved: youSaved > 0 ? util.formatMoney(youSaved) : '',
        updated: updated
      };
    },

    show: function($productWrapper, product, type, pageProduct, eGiftCardParams) {
      this.$productWrapper = $productWrapper;
      this.dateCarted = new Date().toUTCString();
      AddToBagView.prototype.show.call(this, product, type, pageProduct, eGiftCardParams);
    },

    renderTemplate: function() {
      AddToBagView.prototype.renderTemplate.call(this);

      if (this.hasModelError()) {
        return;
      }

      // Show page header
      $('#mb-page-wrapper').addClass('b-sticky-header');

      this.updateButtonsWidth();
      scroll.disable();
    },

    postRender: function() {
      AddToBagView.prototype.postRender.apply(this, arguments);
      $(this.el).find('.truncated').dotdotdot({ wrap: 'letter', watch: true });
    },

    hide: function() {
      AddToBagView.prototype.hide.apply(this, arguments);
      scroll.enable();
    },

    showMessage: function(message) {
      message = message || "Sorry, we are experiencing technical issues. Please contact Customer Service at +1-800-777-0000 for immediate assistance or try again later.";

      var messageToast = MessageToast.displayMessage(message, $('.b-j-product-add-bag', this.$productWrapper), {
        uniqueId: 'addToBag.message',
        targetMargin: 'auto',
        timeout: 30000,
        style: {
          fgColor: '#FFF',
          bgColor: '#ED0000'
        }
      });

      this.trigger('messageShown', messageToast);
    },

    updateButtonsWidth: function() {
      if (!this.elementInDOM() || this.$el.hasClass('hide')) {
        return;
      }

      if (orientation.getOrientation() === 'portrait') {
        $('.b-overlay-buttons').children().each(function() {
          $(this).css('width', '');
        });
      } else {
        horizontalSpacer.update('.b-overlay-buttons');
      }
    },

    getShop5TrackingInfo: function(product) {
      var productAttributes = this.getCoremetricsExploreAttributes(product),
          exploreAttributes = analyticsListener.fillPdpExploreAttributes(_.defaults(productAttributes || {}, analyticsListener.getABTestingExploreAttributes()));
      return 'cmexplore=' + exploreAttributes.toString();
    },

    getShop5TrackingCategory: function() {
      return analyticsData.getCMProductViewCategory(this.pageProduct);
    },

    getCoremetricsExploreAttributes: function(product) {
      var attrs = analyticsData.getCMProductViewContext(product),
          productType;

      // Overwrite type of product
      if (this.pageProduct.isMaster) {
        productType = 'MASTER';
      } else if (this.pageProduct.masterCollection) {
        productType = 'MEMBER';
      } else {
        productType = 'SINGLE ITEM';
      }
      attrs['18'] = productType;

      // Date carted - now
      attrs['26'] = this.dateCarted;

      return attrs;
    },

    fireCoremetrics: function(product) {
      var attrs = this.getCoremetricsExploreAttributes(product),
          cmCategoryId = analyticsData.getCMProductViewCategory(this.pageProduct);

      analytics.triggerTag({
        tagType: 'addToBag',
        productId: product.id,
        productName: product.name,
        productQuantity: this.model.get('additemsrequest').quantity,
        productPrice: product.itemPrice,
        categoryId: cmCategoryId,
        masterProductId: product.master,
        attributes: attrs
      });
    }
  });

  return BCOMAddToBagView;
});
