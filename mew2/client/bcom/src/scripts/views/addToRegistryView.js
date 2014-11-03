define([
  'jquery',
  // Views
  'views/_addToRegistryView',
  // Analytics
  'analytics/analyticsTrigger',
  // Util
  'util/util',
  'util/productMessageToast',
  'util/scroll',
  'util/orientation',
  'util/horizontalSpacer'
], function($, AddToRegistryView, analytics, util, MessageToast, scroll, orientation, horizontalSpacer) {

  'use strict';

  var exploreAttributes = {},
      categoryId;

  var addToRegistryView = AddToRegistryView.extend({
    id: 'b-atr-overlay',
    init: function() {
      AddToRegistryView.prototype.init.apply(this, arguments);

      this.listenTo(orientation, 'orientationchange', function() {
        this.updateButtonsWidth();
      });
    },
    getViewData: function() {
      var product = this.model.product;
      var itemQuantity = product.activeQty;
      var prices = product.prices;
      var itemPrice = parseFloat(prices[prices.length - 1].amt.replace(/[\$,]/g, ''));
      var totalPrice = itemQuantity * itemPrice;
      var itemImage = this.model.product.images[this.model.product.activeImageset][0];

      var data = {
        product: this.model.product,
        itemPrice: util.formatMoney(itemPrice),
        itemQuantity: itemQuantity,
        totalPrice: util.formatMoney(totalPrice),
        image: itemImage,
        registry: this.model.attributes
      };

      return data;
    },

    show: function($productWrapper, product, categoryId) {
      AddToRegistryView.prototype.show.call(this, product);
      this.$productWrapper = $productWrapper;
      this.setAnalyticsContext(product, categoryId);
      this.buttonClickCoremetrics(product);
    },

    renderTemplate: function() {
      AddToRegistryView.prototype.renderTemplate.call(this);

      if (this.hasModelError()) {
        return;
      }

      // Show page header
      $('#mb-page-wrapper').addClass('b-sticky-header');

      this.updateButtonsWidth();
      scroll.disable();
    },

    hide: function() {
      AddToRegistryView.prototype.hide.apply(this, arguments);
      scroll.enable();
    },

    showMessage: function(message) {
      var messageToast = MessageToast.displayMessage(message, $('.b-j-product-add-registry', this.$productWrapper), {
        uniqueId: 'addToRegistry.message',
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

    setAnalyticsContext: function(product, catId) {
      var productPrice = parseFloat(product.prices[product.prices.length - 1].amt.replace('$', '')),
          quantity = parseInt(this.model.get('quantity'), 10),
          totalPrice = productPrice * quantity;

      categoryId = catId;
      exploreAttributes = {
        3: product.prices[product.prices.length - 1].amt.replace('$', ''),
        4: 'BWEDD_' + categoryId,
        5: product.name,
        6: totalPrice
      };
    },

    buttonClickCoremetrics: function(product) {
      analytics.triggerTag({
        tagType: 'conversionEventTag',
        eventId: product.id,
        actionType: 'conversion_initiate',
        categoryId: 'Item added to Registry',
        points: 0,
        attributes: exploreAttributes
      });
    },

    fireCoremetrics: function(product) {
      analytics.triggerTag({
        tagType: 'addToRegistry',
        productId: product.id,
        categoryId: 'BWEDD_' + categoryId,
        productQuantity: parseInt(this.model.get('quantity'), 10),
        attributes: exploreAttributes
      });
    }
  });

  return addToRegistryView;
});