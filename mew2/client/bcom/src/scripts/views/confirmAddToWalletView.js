define([
  'views/_confirmAddToWalletView',
  'util/scroll'
], function(ConfirmAddToWalletView, scroll) {
  'use strict';

  var BCOMConfirmAddToWalletView = ConfirmAddToWalletView.extend({

    getOptions: function() {
      var options = { content: '' };

      switch (this.options.identifier) {
      case 'ERROR_OFFER_EXISTS':
        options.content = 'This offer is already in your <a href="/account/wallet?ocwallet=true">bWallet</a> and can be applied at checkout.';
        break;
      case 'ERROR_OFFER_SUPC_ALREADY_USED':
        options.content  = 'Sorry, we were unable to add the offer to your <a href="/account/wallet?ocwallet=true">bWallet</a> because you already used it.';
        break;
      case 'ERROR_SDP_DOWN':
      case 'ERROR_INVALID_OFFER':
        options.content  = 'Sorry, we were unable to add the offer to your <a href="/account/wallet?ocwallet=true">bWallet</a>. Please try again later ';
        options.content += 'or contact Customer Service at <a href="tel://18007770000">1-800-777-0000</a>.';
        break;
      default:
        options.content = '<b>' + this.options.identifier.replace(/\+/g, ' ') + '</b><br/>has been added to your <a href="/account/wallet?ocwallet=true">bWallet</a>.';
        break;
      }

      return options;
    },

    renderTemplate: function() {
      ConfirmAddToWalletView.prototype.renderTemplate.apply(this, arguments);
      scroll.disable();
    },

    close: function() {
      ConfirmAddToWalletView.prototype.close.apply(this, arguments);
      scroll.enable();
    }

  });

  return BCOMConfirmAddToWalletView;
});
