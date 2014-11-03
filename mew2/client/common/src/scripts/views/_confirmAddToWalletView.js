define([
  'views/confirmOverlay'
], function(ConfirmOverlay) {
  'use strict';

  var ConfirmAddToWalletView = ConfirmOverlay.extend({
    id: 'mb-confirm-add-to-wallet-overlay',

    init: function() {
      if (!this.options.identifier) {
        throw new Error('"identifier" must be supplied when initializing ConfirmAddToWalletView');
      }
      else {
        this.options = this.getOptions();
        this.options.id = this.id;
        ConfirmOverlay.prototype.init.apply(this, arguments);
      }
    },

    // should be defined by each brand
    getOptions: function() {
      var options = {
        header: '',
        content: ''
      };

      switch (this.options.identifier) {
      case 'ERROR_OFFER_EXISTS':
        options.header = 'offer exists';
        options.content = 'This offer is already in your wallet—use it when you checkout!';
        break;
      case 'ERROR_OFFER_SUPC_ALREADY_USED':
        options.header = 'offer already used';
        options.content  = 'Sorry, but the promo code you entered has already been used. Please try again, ';
        options.content += 'or call Customer Service at <a href="tel://18002896229">1-800-BUY-MACYS</a> (<a href="tel://18002896229">1-800-289-6229</a>).';
        break;
      case 'ERROR_SDP_DOWN':
        options.header = 'technical error';
        options.content = 'Sorry, our system is temporarily unavailable. Please try again later.';
        break;
      case 'ERROR_INVALID_OFFER':
        options.header = 'invalid offer';
        options.content  = 'Sorry, but we don\'t recognize the promo code you entered. Please try again, ';
        options.content += 'or call Customer Service at <a href="tel://18002896229">1-800-BUY-MACYS</a> (<a href="tel://18002896229">1-800-289-6229</a>).';
        break;
      default:
        options.header = 'added to wallet';
        options.content = decodeURIComponent(this.options.identifier) + ', added to your wallet -- use it when you checkout!';
        break;
      }

      options.footer  = '';
      options.footer += '<div class="m-overlay-buttons">';
      options.footer +=   '<a class="m-button black left" href="/account/wallet?ocwallet=true">my wallet</a>';
      options.footer +=   '<button class="mb-j-close m-button right">continue shopping</button>';
      options.footer +=   '<div class="clear"></div>';
      options.footer += '</div>';

      return options;
    }
  });

  return ConfirmAddToWalletView;
});
