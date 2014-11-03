
define([
  'handlebars',

  // Utilities
  'util/util',
  'util/authentication',
  'util/multiValueCookie',
  'util/dataMap',
  'util/localstorage',

  // Models
  'models/productModel',

  // Views
  'views/mainContentView',
  'views/productWriteReviewModalView'
], function(Handlebars, util, authentication, mvCookie, DataMap, $localStorage, ProductModel, MainContentView, ProductWriteReviewModalView) {
  'use strict';

  var productView = MainContentView.extend({

    init: function() {
      // If the user refreshes in a modal state, return them to the
      // Product View
      this.dataMap = new DataMap({
        id: 'productId',
        categoryid: 'categoryId'
      });

      this.model = new ProductModel({ requestParams: this.dataMap.toWssg(this.options) });
      this.listenTo(this.model, 'modelready', this.render);
      this.model.fetch();
    },

    showWriteReviewModal: function(e, triggeredByPopState) {
      var signInParams,
          bazaarVoiceId,
          justCreated,
          productView,
          modalView;

      /**
       * Multiple possibilities:
       *    1) if user is not signed in, redirect them to the sign-in page
       *    2) if user is signed in, check for bazaarvoice id:
       *          a) if bazaarvoice id does not exist, sign out the user and redirec them to the sign-in page
       *          b) if bazaarvoice id does exist, show write review modal
       */

      signInParams = {
        force: !mvCookie.get('BazaarVoiceId', 'GCs'),
        success: _.bind(this.showWriteReviewModal, this)
      };

      // Returns if the sign-in modal was opened (user not signed in)
      if (this.showSignIn(signInParams)) {
        return;
      }

      bazaarVoiceId = mvCookie.get('BazaarVoiceId', 'GCs');

      /**
       * User is signed in, and bazaarvoiceId exists; check for duplicate submission.
       *    1) if no duplicate, show modal
       *    2) if already submitted, show message toast
       */

      // First, create the view if it does not exist yet
      justCreated = false;
      if (!this.subViews.productWriteReviewModalView) {
        this.subViews.productWriteReviewModalView = new ProductWriteReviewModalView({
          id: 'm-j-write-review-modal-container',
          options: {
            productId: this.model.get('id'),
            bazaarVoiceId: bazaarVoiceId,
            categoriesBreadcrumb: this.model.get('categoriesBreadcrumb'),
            parentView: this
          }
        });

        justCreated = true;
      }

      productView = this;
      modalView = productView.subViews.productWriteReviewModalView;

      $('.m-j-product-launch-write-reviews-modal').addClass('spinner');

      modalView.model.duplicateCheck(function(isDuplicate) {
        $('.m-j-product-launch-write-reviews-modal').removeClass('spinner');

        if (isDuplicate) {
          modalView.handleDuplicate();
        } else {
          if (justCreated) {
            // Fetch the review template data
            modalView.model.fetch();
          } else {
            // If it's already instantiated, we render again to clean errors and messages
            modalView.render();
            modalView.renderDataDependent();
          }

          if (!triggeredByPopState) {
            productView.pushModalState('showWriteReviewModal');
          }

          modalView.show();
        }
      });

      return false;
    },

    triggerPDPGlobalNavUpdate: function() {
      Backbone.trigger('pdp:updateGN', this.model.get('activeCategory'));
    },

    hasCategoryIDonURL: function() {
      return (this.model.get('requestParams') && !_.isUndefined(this.model.get('requestParams').categoryId));
    },

    // #27046: Adding user case where the categoryID attribute is not present on the URL
    // In this case, we the PDP call will informe the Global Navigation which is the activeCategory
    // So we can repaint the GN accordingly
    updatePDPGlobalNav: function() {
      if (!this.hasCategoryIDonURL()) {

        if ($localStorage.get('gn:categoryIndexLoaded') && App.model.get('categoryIndex')) {

          this.triggerPDPGlobalNavUpdate();

        } else {
          this.listenTo(Backbone, 'categoryIndexLoaded', this.updatePDPGlobalNav);
        }

      }
    }

  });

  Handlebars.registerHelper('productCurrentPrice', function(prices, options) {
    return options.fn(_.last(prices));
  });

  Handlebars.registerHelper('productColorName', function(colors, activeColor, noSelectionText) {
    if (activeColor) {
      return _.find(colors, function(color) {
        return color.id === activeColor;
      }).name;
    }

    return noSelectionText || 'Please select';
  });

  Handlebars.registerHelper('ifColorUnavailable', function(product, colorId, options) {
    if (ProductModel.isColorAvailable(product, colorId)) {
      return options.inverse(this);
    }

    // This color is unavailable for the active size selected
    return options.fn(this);
  });

  Handlebars.registerHelper('ifSizeUnavailable', function(product, sizeId, options) {
    if (ProductModel.isSizeAvailable(product, sizeId)) {
      return options.inverse(this);
    }

    // This size is unavailable for the active color selected
    return options.fn(this);
  });
  return productView;
});
