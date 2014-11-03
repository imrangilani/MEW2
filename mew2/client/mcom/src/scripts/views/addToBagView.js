define([
  'jquery',
  // Views
  'views/_addToBagView',
  // models
  'models/rtoModel',
  //util
  'util/multiValueCookie',
  'util/tooltip',
  'analytics/analyticsTrigger',
  'analytics/analyticsListener',
  'analytics/analyticsData'

], function($, AddToBagView, RTOModel, mvCookie, tooltip, analytics, analyticsListener, analyticsData) {

  'use strict';

  var addToBagView = AddToBagView.extend({
    id: 'm-addtobag-overlay',

    postRender: function() {
      // remove spinner from add to bag buttons
      $('.m-j-product-add-bag').removeClass('spinner');

      $('#mb-mask').on('click.mask', _.bind(function() {
        this.close();
      }, this));

      AddToBagView.prototype.postRender.call(this);

      if( this.prosChoiceId){
        var rtoModel = new RTOModel();
        rtoModel.sendInformantCall(
          rtoModel.getInformantCallTypes().ADDTOBAG,
          { productIds: this.pageProduct.id,
            choiceIds:  this.prosChoiceId,
            categoryId: this.model.product.activeCategory
          }
        );
      }
    },

    renderError: function() {
      // remove spinner from add to bag buttons
      $('.m-j-product-add-bag').removeClass('spinner');

      AddToBagView.prototype.renderError.call(this);
    },

    getViewModel: function() {
      var bag = this.model.get('shoppingbag');
      var itemQuantity = this.model.get('additemsrequest').quantity;
      var cookieName = mvCookie.get('UserName', 'GCs');
      var prices = this.model.product.prices;
      var egcPrice;
      var youSaved;

      if (this.model.product.isEGC) {
        egcPrice = { amt: '$' + parseFloat(this.giftCard.customprice).toFixed(2), label: '' };
      }

      if (prices && prices.length > 1) {
        var highPrice = parseFloat(prices[0].amt.replace('$', '').replace(',', ''));
        var lowPrice = parseFloat(prices[ prices.length - 1].amt.replace('$', '').replace(',', ''));

        youSaved = highPrice - lowPrice;
        if (youSaved > 0) {
          youSaved = parseFloat(youSaved * itemQuantity).toFixed(2);
        }
      }

      var image = this.model.product.images[this.model.product.activeImageset][0];

      return {
        bag: this.model.get('shoppingbag'),
        product: this.model.product,
        image: image,
        itemQuantity: itemQuantity,
        youSaved: youSaved,
        bagTotal: parseFloat(bag.merchandisetotal).toFixed(2),
        userName: cookieName ? cookieName + '\'s' : 'your',
        egcPrice: egcPrice
      };
    },

    show: function(product, pageProduct, $button, eGiftCardParams, prosChoiceId) {
      this.pageProduct = pageProduct;
      this.$addToBagButton = $button;
      //Save gift card amount to be used in coremetrics and for confirmation display
      if (product.isEGC && eGiftCardParams) {
        this.giftCard = eGiftCardParams;
      }
      this.prosChoiceId = prosChoiceId;
      AddToBagView.prototype.show.apply(this, [product, undefined, pageProduct, eGiftCardParams, prosChoiceId]);
    },

    showMessage: function(message) {
      message = message || 'We\'re sorry. Due to a technical difficulty we were unable to capture your color, size or item type selection. Please try again.';

      tooltip(this.$addToBagButton, message, 0, 0, 1);
    },

    close: function() {
      $('#mb-mask').off('click.mask');
      this.hide();
    },

    getShop5TrackingInfo: function(product) {
      var tagObj = this.createShop5ActionObject (product);
      var date = new Date();
      var today = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();

      var explore = 'cmexplore=' + analyticsListener.getAction5TrackingInfo (tagObj) + '&&BagDate=' + today;

      var searchContext = analyticsData.getCMSearchContext();
      var pseudoCat;
      if (searchContext) {
         pseudoCat = searchContext.type;
      } else {
        pseudoCat = product.cmCategoryId;
      }
      explore += '&PseudoCat=' + pseudoCat;

      return explore;
    },

    getShop5TrackingCategory: function() {
      var searchContext = analyticsData.getCMSearchContext();
      if (searchContext){
        return searchContext.type;
      }
      return parseInt(this.model.product.cmCategoryId);
    },

    fireCoremetrics: function(product) {
      var tagObj = this.createShop5ActionObject (product);
      analytics.triggerTag(tagObj);
    },

    createShop5ActionObject: function(product) {
      var price,
          categoryId,
          numofAltImages,
          numofViewedImages,
          searchContext = analyticsData.getCMSearchContext(),
          searchString,
          slotNumber;

      if (searchContext) {
        categoryId = searchContext.type;

        if (searchContext.type === 'onsite_search_autocomplete'){
          searchString = 'Autocomplete: ' + searchContext.keyword + ' | ac: ' + searchContext.keyword_ac;
        } else {
          searchString = searchContext.keyword;
        }
      } else {
        categoryId = this.model.product.cmCategoryId;
      }

      slotNumber = analyticsData.getCMProductSelectionPosition();

      var type = 'SINGLE ITEM';
      if (this.pageProduct){
        if (this.pageProduct.isMaster) {
          type = 'MASTER | ' + this.pageProduct.id;
        } else if (this.pageProduct.masterCollection){
          type = 'MEMBER';
        }
      }

      if (type === 'SINGLE ITEM' || type === 'MEMBER'){
        numofAltImages = product.images ? product.images[product.activeImageset].length - 1 : undefined;
        numofViewedImages = _.uniq(product.viewedImages).length - 1;
      }

      if (product.isEGC) {
        price = parseFloat(this.giftCard.customprice);
      } else {
        var prices = this.model.product.prices;
        price = parseFloat(prices[ prices.length - 1].amt.replace('$', ''));
      }

      return {
        tagType: 'shopAction5Tag',
        productID: this.model.product.id + '',
        productName: this.model.product.name,
        productQuantity: this.model.product.activeQty,
        productPrice: price,
        categoryID: categoryId,
        att16: type,
        att17: product.storeOnlyProduct ? 'store_only_product' : '',
        att27: searchString,
        att28: slotNumber,
        att31: numofAltImages,
        att32: numofViewedImages
      };
    }
  });
  return addToBagView;
});
