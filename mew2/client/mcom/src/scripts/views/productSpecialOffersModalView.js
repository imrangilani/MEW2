define([
  'jquery',
  'handlebars',
  'util/orientation',
  'util/fewerMore',
  // Views
  'views/modalView'
], function($, Handlebars, orientation, fewerMore, ModalView) {
  'use strict';

  var ProductSpecialOffersModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    init: function() {

      this.listenTo(orientation, 'orientationchange', function() {

        fewerMore.handleOrientationChange();

      });
    },

    events: {
      'click  .m-j-more': 'showMoreProductDetails',
      'click  .m-j-less': 'showFewerProductDetails',
      'click  .mb-j-modalHeader-left': 'back'
    },

    showMoreProductDetails: function(e) {
      fewerMore.showMoreProductDetails(e);
    },

    showFewerProductDetails: function(e) {
      fewerMore.showFewerProductDetails(e);
    },

    renderTemplate: function() {

      var product = this.options.product, numberOfBadgeNotWP = 0;

      var promoBadge, promoBadgeList = [];
      _.each(product.promotions, function(promo) {

        promoBadge = _.filter(promo.attr, function(promoAttr) {
          return promoAttr.name === 'BADGE_TEXT';
        });

        if (!_.isEmpty(promoBadge)) {
          promoBadgeList.push(promo);

          if (!_.contains([
            'Bundled GWP',
            'PWP',
            'Threshold GWP',
            'Multi Threshold GWP',
            'Site-Wide PWP'
          ], promo.promoType)) {
            numberOfBadgeNotWP++;
          }
        }

      });

      product.promotions = promoBadgeList;

      this.$el.html(TEMPLATE.productSpecialOffersModal({ product: product, numberOfBadgeNotWP: numberOfBadgeNotWP }));

    },

    back: function() {
      window.history.back();
    }

  });

  // Iterates over promotion object in order to find the promotion of 'BADGE_TEXT' label
  Handlebars.registerHelper('badgeText', function(promotions, options) {
    var promoBadge;

    promoBadge = _.find(promotions.attr, function(promoAttr) {
      return promoAttr.name === 'BADGE_TEXT';
    });

    return promoBadge ? options.fn(promoBadge) : '';
  });

  Handlebars.registerHelper('if_pwp_promotions', function(promoType, options) {
    var giftWithPurchasePromotionList = ['Bundled GWP', 'PWP', 'Threshold GWP', 'Multi Threshold GWP', 'Site-Wide PWP'];

    return options.fn(_.contains(giftWithPurchasePromotionList, promoType));

  });

  return ProductSpecialOffersModalView;
});
