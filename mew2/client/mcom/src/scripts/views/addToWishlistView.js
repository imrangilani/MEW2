define([
  'views/overlayView',
  'models/addToWishlistModel',
  'util/multiValueCookie',
  'util/authentication'
], function(OverlayView, AddToWishlistModel, mvCookie, Authentication) {
  'use strict';
  var product, userId;
  var addToWishlistView = OverlayView.extend({
    id: 'm-addtowishlist-overlay',

    events: _.extend(_.clone(OverlayView.prototype.events), {
      'click #mb-add-to-wish-list-sign-in': 'wishListSignIn'
    }),

    init: function() {
      this.model = new AddToWishlistModel();
      OverlayView.prototype.init.apply(this, arguments);
      this.save();
    },

    save: function() {
      this.model.save(this.newAttributes(), {
        success: function(model) {

          // If macys_online_uid cookie doesn't exist, we get the userid from the addtowishlist response
          // and set it to the macys_online_uid cookie
          if (_.isUndefined(userId)) {
            mvCookie.set(App.config.cookies.onlineUid, model.get('wishlists').wishlist[0].userId, undefined, 10);
          }

          model.trigger('modelready');
        },
        error: this.model.error
      });
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.addToWishlist(this.getViewData()));
      this.$el.removeClass('hide');
      this.options.$button.removeClass('spinner');
    },

    newAttributes: function() {
      product = this.options.product;

      var wishlistAttr = {
        wishlists: {
          wishlist: [{
            fromSource: 'PDP',
            items: [{
              upcId:        product.upcs[product.activeUpc.upcKey].upcid,
              qtyRequested: product.activeQty || 1
            }]
          }]
        }
      };

      userId = mvCookie.get(App.config.cookies.onlineUid);

      if (userId) {
        wishlistAttr.wishlists.wishlist[0].userId = userId;
      }

      return wishlistAttr;
    },

    getViewData: function() {
      var isUserSignedIn = (new Authentication()).isSignedIn();
      return {
        product: product,
        image:   product.images[product.activeImageset][0],
        userId:  userId,
        showSignIn: !isUserSignedIn
      };
    },

    wishListSignIn: function() {
      this.hide();
      this.options.parentView.showSignIn({});
      return false;
    }

  });

  return addToWishlistView;
});
