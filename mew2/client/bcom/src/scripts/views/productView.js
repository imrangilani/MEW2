define([
  'jquery',
  'underscore',
  'handlebars',

  // Views
  'views/_productView',
  'views/recentProductsView',
  'views/zoomModalView',
  'views/productAvailabilityView',
  'views/productWarrantyModalView',
  'views/productOffersModalView',
  'views/bopsLearnMoreModalView',
  'views/giftCardsTermsModalView',
  'views/productBopsModalView',
  'views/addToBagView',
  'views/addToRegistryView',
  'views/productReviewsModalView',
  'views/productRecommendationsView',
  'views/productSizeChartHtmlModalView',
  'views/orderMethodOnOrderModalView',
  'views/orderMethodSpecialOrderModalView',

  // Models
  'models/productSizeChartHtmlModel',

  // Analytics
  'analytics/analyticsTrigger',
  'analytics/analyticsData',

  // Util
  'util/util',
  'util/productMessageToast',
  'util/orientation',
  'util/transition',

  'jquery.dotdotdot',
  'util/swiperAfterLoop'

], function($, _, Handlebars, ProductView, RecentProductsView, ZoomModalView, ProductAvailabilityView, ProductWarrantyModalView,
            ProductOffersModalView, BopsLearnMoreModalView, GiftCardsTermsModalView, ProductBopsModalView, AddToBagView,
            AddToRegistryView, ProductReviewsModalView, ProductRecommendationsView, ProductSizeChartHtmlModalView, OrderMethodOnOrderModalView,
            OrderMethodSpecialOrderModalView, ProductSizeChartHtmlModel, analytics, analyticsData, util, MessageToast, orientation, Transition) {
  'use strict';

  var categoryId,
      productId,
      PRODUCT_VIEW_CM_ELEMID,
      mySwiper,
      NUMBER_OF_MEMBERS_TO_LOAD = 5,
      numberOfMembersDisplayed;

  var BCOMProductView = ProductView.extend({

    events: {
      'doubletap  .b-pdp-image-wrapper': 'showZoomModal',
      'click      #b-pdp-images-zoom-icon': 'showZoomModal',

      'click      .b-j-product-swatch:not(.selected)': 'setActiveSwatch',
      'change     .b-j-product-color-names': 'setActiveSwatch',
      'click      .b-j-product-size:not(.selected)': 'setActiveSize',
      'change     .b-j-product-qty-values': 'setActiveQty',
      'click      .b-j-product-latchkey:not(.selected)': 'setActiveLatchkey',
      'click      .b-j-product-add-bag': 'addToBag',
      'click      .b-j-product-add-registry': 'addToRegistry',
      'click      .b-j-product-update-bag': 'updateBag',
      'click      .b-j-product-phone': 'orderByPhone',
      'click      .b-j-product-size-chart-link': 'showSizeChartModal',
      'click      .b-j-product-show-hide-link': 'toggleColorSection',
      'click      #mb-j-product-show-members': 'showMoreMembersButton',
      'click      #b-pdp-shipping-returns': 'shippingReturnsAnalytics',
      'click      .b-product-member-of-master [data-expandable="button"]': 'trackMemberSectionState',
      'click      .b-j-product-collection-details-button': 'toggleCollectionInfoSection',
      'click      .b-product-warranty-link': 'showWarrantyInfoModal',
      'click      .unavailable': 'displayErrorMessage',
      'click      .b-pdp-offers': 'showOffersModal',
      'click      .b-j-product-bops-learn-more': 'showBopsLearnMoreModal',
      'click      .b-j-gift-cards-terms-link': 'showGiftCardsTermsModal',
      'click      .b-j-bops-store-lookup': 'showBopsModal',
      'click      .b-j-product-member-link': 'transitionToMember',
      'click      .b-j-read-reviews': 'showReviewsModal',
      'click      .b-j-write-review': 'showWriteReviewModal',
      'click      #b-product-upper .b-pdp-rating': 'showReviewsModal',
      'click      .b-j-product-partofcollection-btn': 'viewMasterCollection',
      'click      #b-j-product-collection-colors-toggler': 'toggleMasterColorSection',
      'focus      .b-pdp-form-control-group input': 'removeControlGroupErrorStyling',
      'click      .b-j-product-on-order-help': 'showOrderMethodOnOrderModal',
      'click      .b-j-product-special-order-help': 'showOrderMethodSpecialOrderModal'
    },

    init: function() {
      ProductView.prototype.init.apply(this, arguments);

      // resets the number of displayed products
      numberOfMembersDisplayed = NUMBER_OF_MEMBERS_TO_LOAD;

      //make sure member product names are truncated in PDPmas
      this.listenTo(orientation, 'orientationchange', function() {
        var truncated = this.$el.find('.truncated');
        this.truncate(truncated);

        // Truncate the member of master details to display maximum of 5 lines
        truncated = this.$el.find('.b-product-member-details-buy-content .b-details-truncated');
        this.truncate(truncated);

        // Recalculates the number of visible rows of swatches for master pdp swatches
        this.postRenderCollectionDetails();
        this.updateCollectionInfoState();
      });

      this.listenToOnce(this.model, 'modelready', function() {
        this.setCMElementId();
        this.fireProductViewTag();
      });

      this.listenTo(this.model, 'activeUpcChanged', function() {
        this.hideUPCValidationMessage();
      });

      this.initializeAnalyticsData();
    },

    setCMElementId: function() {
      categoryId = this.model.attributes.requestParams.categoryId;
      productId = this.model.attributes.requestParams.productId;

      // a pdp might not have a category id on the url. In that case, we need
      // to set it from the product response so that CM tags can use it
      categoryId = categoryId || this.model.attributes.activeCategory;
      PRODUCT_VIEW_CM_ELEMID = categoryId + ' - ' + productId;
    },

    fireProductViewTag: function() {
      analytics.triggerTag({
        tagType: 'productViewTag',
        productId: productId,
        productName: this.model.get('name'),
        categoryId: analyticsData.getCMProductViewCategory(this.model.attributes),
        attributes: analyticsData.getCMProductViewContext(this.model.attributes)
      });

      // Set pageId in analytics context for future uses
      var pageId = 'PRODUCT: {name} ({id})'
        .replace('{name}', this.model.get('name'))
        .replace('{id}', productId);
      analyticsData.setCMPageId(pageId);

    },

    initializeAnalyticsData: function() {
      var $url = $.url(),
          linkType = $url.param('LinkType');

      // the 'LinkType' url parameter on the PDP indicates the page/component that
      // led the user to this PDP
      if (linkType) {
        analyticsData.setCMProductSelectionContext({
          '4': linkType
        });
      }
    },

    showWarrantyInfoModal: function(e, triggeredByPopState) {
      this.showModal(e, triggeredByPopState, 'productWarrantyModalView', 'showWarrantyInfoModal');
    },

    showBopsLearnMoreModal: function(e, triggeredByPopState) {
      this.showModal(e, triggeredByPopState, 'bopsLearnMoreModalView', 'showBopsLearnMoreModal');

      // coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'PDP_learn_more',
        elementCategory: 'bops'
      });
    },

    showOrderMethodOnOrderModal: function(e, triggeredByPopState) {
      if (!this.subViews.orderMethodOnOrderModalView) {
        this.subViews.orderMethodOnOrderModalView = new OrderMethodOnOrderModalView(); }
      this.showModal(e, triggeredByPopState, 'orderMethodOnOrderModalView', 'showOrderMethodOnOrderModal');
    },

    showOrderMethodSpecialOrderModal: function(e, triggeredByPopState) {
      if (!this.subViews.orderMethodSpecialOrderModalView) {
        this.subViews.orderMethodSpecialOrderModalView = new OrderMethodSpecialOrderModalView(); }
      this.showModal(e, triggeredByPopState, 'orderMethodSpecialOrderModalView', 'showOrderMethodSpecialOrderModal');
    },

    showGiftCardsTermsModal: function(e, triggeredByPopState) {
      // this is attached to an <a> tag and we can't let it execute
      if (e.preventDefault) {
        e.preventDefault();
      }
      this.showModal(e, triggeredByPopState, 'giftCardsTermsModalView', 'showGiftCardsTermsModal');
    },

    showOffersModal: function(e, triggeredByPopState) {
      var self = this;
      this.showModal(e, triggeredByPopState, 'productOffersModalView', 'showOffersModal', {
        beforeShow: function(view) {
          view.options.promotions = self.model.get('promotions');
        }
      });

      // coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: PRODUCT_VIEW_CM_ELEMID,
        elementCategory: 'pdp_bonus_offer'
      });
    },

    showBopsModal: function(e, triggeredByPopState) {
      var self = this;

      this.showModal(e, triggeredByPopState, 'productBopsModalView', 'showBopsModal', {
        beforeShow: function(view, $stateElement) {
          var $productWrapper = $stateElement.closest('.b-product-wrapper'),
              product = self.getProductReference($productWrapper);

          view.model.set('product', product);
          // Additionally, set the default location for the modal view,
          // if it has been set for the particular product availability view.
          var productAvailabilityView = this.subViews['productAvailabilityView_' + product.id];
          if (productAvailabilityView.model.get('bops')) {
            var store = productAvailabilityView.model.get('bops').store;
            if (store) {
              view.model.set('defaultZipCode', store.address.zipCode);
            }
          }
        }
      });

      // coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'change_store',
        elementCategory: 'bops'
      });
    },

    showReviewsModal: function(e, triggeredByPopState) {

      if (!this.subViews.productReviewsModalView) {
        this.subViews.productReviewsModalView = new ProductReviewsModalView({
          id: 'b-j-reviews-modal-container',
          options: {
            productId: this.model.get('id'),
            rating: this.model.get('rating')
          }
        });
      }

      if (!triggeredByPopState) {
        this.pushModalState('showReviewsModal');
      }

      this.subViews.productReviewsModalView.show();

      // coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: PRODUCT_VIEW_CM_ELEMID,
        elementCategory: 'ratings_modal'
      });

      return false;
    },

    showZoomModal: function(e, triggeredByPopState, modalShowData) {
      // if this is an e-gift card pdp, do not show the zoom modal, as they don't have zooming
      if (this.model.get('isEGC')) {
        return;
      }

      // this method is called upon 'click' and 'doubletap' (jquery.finer) events. For the latter, the second argument will be
      // the 'jquery original event', so we need to account for that possibility when using triggeredByPopState
      if (typeof triggeredByPopState !== 'undefined' && typeof triggeredByPopState !== 'boolean') {
        triggeredByPopState = false;
      }

      var activeImageIndex = triggeredByPopState ? modalShowData.index : (mySwiper ? mySwiper.activeLoopIndex : 0);

      this.showModal(e, triggeredByPopState, 'zoomModalView', 'showZoomModal', {
        modalState: {
          index: activeImageIndex
        }
      });
    },

    showSizeChartModal: function(e, triggeredByPopState) {
      var $stateElement = this.getStateElement(e),
          view = this,
          $target = $(e.currentTarget),
          product,
          $productWrapper;

      if (this.sizeChartsModalOpening) {
        return false;
      }

      // TODO: refactor modalview to avoid opening modal twice and to be able to load model before show
      this.sizeChartsModalOpening = true;

      $productWrapper = $stateElement.closest('.b-product-wrapper');
      product = this.getProductReference($productWrapper);

      if (!triggeredByPopState) {
        this.pushModalState('showSizeChartModal', e.currentTarget.id);
      }

      var options = {
        product: product,
        categoryId: categoryId,
        canvasId: product.canvasId
      };

      if (!this.subViews.productSizeChartModalView || this.subViews.productSizeChartModalView.options.canvasId != product.canvasId) {
        var productSizeChartHtmlModel = new ProductSizeChartHtmlModel({requestParams: options});
        view.listenTo(productSizeChartHtmlModel, 'modelready', function() {
          view.subViews.productSizeChartModalView = new ProductSizeChartHtmlModalView({
            id: 'b-j-sizechart-modal-container',
            model: productSizeChartHtmlModel,
            options: options
          });
          view.subViews.productSizeChartModalView.render();
          view.subViews.productSizeChartModalView.show();
          delete this.sizeChartsModalOpening;
        });
        productSizeChartHtmlModel.fetch();

      } else {
        this.subViews.productSizeChartModalView.show();
        delete this.sizeChartsModalOpening;
      }
    },

    // options: beforeShow, modalState
    showModal: function(e, triggeredByPopState, viewName, showMethodName, options) {
      var view = this.subViews[viewName],
          $stateElement = this.getStateElement(e);

      options = options || {};
      options.modalState = options.modalState || {};

      if (!view) {
        console.log('Modal not yet constructed, but required to show.');
        return;
      }

      if (options.beforeShow) {
        options.beforeShow.call(this, view, $stateElement);
      }

      // If the modal wrapper isn't in the DOM, append it to the body
      if (!view.elementInDOM()) {
        $('body').append(view.$el);
      }

      this.currentModalView = view;

      if (!triggeredByPopState) {
        this.pushModalState(showMethodName, e.currentTarget.id, options.modalState);
      }

      view.render();
      view.show.apply(view, _.values(options.modalState));

      return false;
    },

    updateCollectionInfoState: function() {
      var $collectionContainer = this.$el.find('.b-product-collection-details'),
          $expandableContainer = $collectionContainer.find('[data-expandable="container"]'),
          $content = $collectionContainer.find('.b-j-product-color-wrapper'),
          swatchesSectionNewHeight = 0;

      if ($expandableContainer.length !== 0) {
        if ($expandableContainer.hasClass('b-expandable-closed')) {
          swatchesSectionNewHeight = $content.data('collapsed-height');
        } else {
          swatchesSectionNewHeight = $content.data('expanded-height');
        }
        $content.stop().animate({
          height: swatchesSectionNewHeight
        });
      }
    },

    toggleCollectionInfoSection: function() {
      // updates the color swatches height
      this.updateCollectionInfoState();
    },

    viewMasterCollection: function() {
      // the button to the master collection is a link, so we don't need to redirect there
      // we only throw a page element tag when it's clicked
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'shop_the_look',
        elementCategory: 'pdp_member'
      });
    },

    initZoomFramework: function() {
      /* global s7sdk */
      require(['http://s7d5.scene7.com/s7sdk/2.5/js/s7sdk/utils/Utils.js'], function() {
        s7sdk.Util.lib.include('s7sdk.image.ZoomView');
        s7sdk.Util.lib.include('s7sdk.common.Container');
        s7sdk.Util.getObjPos = function(obj) {
          var rect = obj.getBoundingClientRect(),
              x = rect.left + s7sdk.Util.getScrollXY().x || 0,
              y = rect.top + s7sdk.Util.getScrollXY().y || 0;

          return {
            x: x,
            y: y
          };
        };

        // Initialize the SDK
        s7sdk.Util.init();
      });
    },

    initZoomView: function() {
      var allImages = this.model.get('images');
      if (allImages) {
        // Grab the default images from the response
        var imageset = this.model.get('activeImageset'),
            images = allImages[imageset];

        if (this.subViews.zoomModalView) {
          this.subViews.zoomModalView.close();
          this.subViews.zoomModalView = null;
        }

        this.subViews.zoomModalView = new ZoomModalView({
          id: 'b-j-zoom-container',
          options: {
            images: images,
            initImageIndex: 0
          }
        });
        this.listenTo(this.subViews.zoomModalView, 'imageShown', this.doZoomAnalytics);
      }
    },

    renderTemplate: function() {
      var seo = this.model.get('seo');
      if (seo) {
        this.setPageTitle(seo.title + ' | Bloomingdales\'s');
        this.setPageDesc('Shop for ' + seo.title + ' online at Bloomingdales.com. ' + seo.desc.desc);
      }

      this.$el.html(TEMPLATE.product(this.model.attributes));
    },

    postRender: function() {
      ProductView.prototype.postRender.apply(this);
      if (!this.model.get('isEGC')) {
        // electronic gift cards should not have zoom
        this.initZoomFramework();
      }
      this.postRenderImages();
      this.postRenderMemberProducts();
      this.postRenderInfoSections();
      this.postRenderCollectionDetails();
      this.postRenderRecentlyViewed();
      this.postRenderWarrantyInfo();
      this.postRenderOffersInfo();
      this.postRenderProductSwatches();
      this.postRenderProductAvailability();
      this.postRenderBopsLearnMore();
      this.postRenderGiftCardsTerms();
      this.postRenderGiftCardsFeatures();
      this.postRenderAddToBag();
      this.postRenderAddToRegistry();
      this.positionHeader();
      this.preSelectSizeColor();
      this.postRenderProdRecommendations();

      // #27046: Adding user case where the categoryID attribute is not present on the URL
      // In this case, we the PDP call will informe the Global Navigation which is the activeCategory
      // So we can repaint the GN accordingly
      this.updatePDPGlobalNav();
    },

    postRenderProdRecommendations: function() {
      // Create a subview for product recommendations
      this.subViews.productRecommendationsView = new ProductRecommendationsView(this.model);
    },

    positionHeader: function() {
      // Fix for header positioning when device is in landscape
      this.listenToOnce(orientation, 'orientationchange', function() {
        var currentPosition = $(window).scrollTop();
        $('html, body').animate({ scrollTop: currentPosition - 15 }, 200);
      });

      // Scroll window to the top of the content header
      $('html, body').animate({ scrollTop: $('#mb-content-wrapper').offset().top }, 500);
    },

    postRenderWarrantyInfo: function() {
      // Create a subview for warranty information
      this.subViews.productWarrantyModalView = new ProductWarrantyModalView({ id: 'b-j-warranty-modal-container' });
    },

    postRenderOffersInfo: function() {
    // Create a subview for offers modal
      this.subViews.productOffersModalView = new ProductOffersModalView({ id: 'b-j-offers-modal-container' });
    },

    postRenderBopsLearnMore: function() {
      this.subViews.bopsLearnMoreModalView = new BopsLearnMoreModalView();
    },

    postRenderGiftCardsTerms: function() {
      this.subViews.giftCardsTermsModalView = new GiftCardsTermsModalView();
    },

    /**
     * Initialize the e-gift card mask for the amount input ($ 000.00).
     */
    postRenderGiftCardsFeatures: function() {
      var isEGC = this.model.get('isEGC');
      if (isEGC) {
        require(['jquery-maskmoney'], _.bind(function() {
          this.$el.find('#b-j-gift-card-amount').maskMoney();
        }, this));
      }
    },

    postRenderAddToBag: function() {
      this.subViews.addToBagView = new AddToBagView({
        parentProduct: this.model.attributes
      });
      this.listenTo(this.subViews.addToBagView, 'messageShown', function(messageToast) {
        this.listenToOnce(this.model, 'activeUpcChanged', function(/*product*/) {
          messageToast.hide();
        });
      });
    },

    postRenderAddToRegistry: function() {
      this.subViews.addToRegistryView = new AddToRegistryView();
      this.listenTo(this.subViews.addToRegistryView, 'messageShown', function(messageToast) {
        this.listenToOnce(this.model, 'activeUpcChanged', function(/*product*/) {
          messageToast.hide();
        });
      });
    },

    postRenderSizeChart: function() {
      // the size chart has been pulled out of the initial release
    },

    //what to do after images are rendered
    postRenderImages: function() {
      this.initializeSwiper();
      if (!this.model.get('isEGC')) {
        // e-gift cards do not need to have zoom
        this.initZoomView();
      }
    },

    //hides the collapsible sections that are supposed to be hidden (.b-expandable-closed) at start
    postRenderInfoSections: function() {
      this.$el.find('[data-expandable="container"].b-expandable-closed [data-expandable="content"]').hide();
    },

    // on the master pdp, we need to keep track of the height of the color swatches in collapsed state (1 row)
    // and on expanded state (1 or more rows) so when we expand/collapse, we know the proper height value
    // to target.
    // this also needs to be recalculated when the orientation changes (we might display more/less rows of swatches)
    postRenderCollectionDetails: function() {
      var $masterColorSwatches = this.$el.find('.b-product-collection-details .b-j-product-color-wrapper');
      // we set the collapsed height of the colors only once
      if (!$masterColorSwatches.data('collapsed-height')) {
        $masterColorSwatches.data('collapsed-height', $masterColorSwatches.height());
      }
      $masterColorSwatches.data('expanded-height', $masterColorSwatches.find('ul.b-swatches-list').height());
    },

    postRenderMemberProducts: function() {
      //makes sure member products names are truncated
      var truncated = this.$el.find('.truncated');
      this.truncate(truncated);

      //truncate the member of master details to display maximum of 5 lines
      truncated = this.$el.find('.b-product-member-details-buy-content .b-details-truncated');
      this.truncate(truncated);
    },

    postRenderRecentlyViewed: function() {
      this.subViews.recentProductsView = new RecentProductsView({ options: { currentProduct: _.pick(this.model.attributes, ['id', 'name'] ) }});
      // Add the current product to recently viewed
      // Pass model attributes, as opposed to a reference to the model itself, to ensure a clone
      this.subViews.recentProductsView.collection.prepend(this.model.attributes);
    },

    postRenderProductAvailability: function() {
      var view = this;

      if (view.model.get('isCheckoutEnabled')) {
        var productAvailabilityViews = [];

        if (view.model.get('isMaster')) {
          var master = view.model.attributes;

          // For master products, create a new product availability view for each member.
          _.each(view.model.attributes.members, function(product) {
            // If defaults come back from server, no user interactions have occurred, yet a
            // upc may already be ready
            view.setActiveUpc(product);

            var subView = view.subViews['productAvailabilityView_' + product.id];

            // If the view already exists, simply render it
            if (subView) {
              subView.render();
            } else {
              view.subViews['productAvailabilityView_' + product.id] = new ProductAvailabilityView({
                id: 'b-j-product-availability-container-' + product.id,

                options: {
                  // use the master product id so the fetch grabs data from memory / cache
                  productId: master.id,
                  product: product
                }
              });

              productAvailabilityViews.push(view.subViews['productAvailabilityView_' + product.id]);
            }
          });
        } else {
          var product = view.model.attributes;

          // If defaults come back from server, no user interactions have occurred, yet a
          // upc may already be ready
          view.setActiveUpc(product);

          // If the view already exists, simply render it
          if (view.subViews['productAvailabilityView_' + product.id]) {
            view.render();
          } else {
            // Create a single product availability view
            view.subViews['productAvailabilityView_' + product.id] = new ProductAvailabilityView({
              id: 'b-j-product-availability-container',

              options: {
                productId: product.id,
                product: product
              }
            });

            productAvailabilityViews.push(view.subViews['productAvailabilityView_' + product.id]);
          }
        }

        // Create a new bops modal view
        view.subViews.productBopsModalView = new ProductBopsModalView({
          id: 'mb-j-product-bops-modal-container',
          product: this.model.attributes
        });

        // When the bops modal view's locationNumber changes (e.g. someone selects a location in the bops results),
        // update each product availability model as well
        view.subViews.productBopsModalView.listenTo(view.subViews.productBopsModalView.model, 'change:locationNumber', function() {
          var newLocationNumber = this.model.get('locationNumber');

          _.each(productAvailabilityViews, function(productAvailabilityView) {
            productAvailabilityView.model.set('locationNumber', newLocationNumber);
          });
        });
      }
    },

    postRenderProductSwatches: function() {
      var view = this;

      // Considers that all swatches in the page are equal and that
      // we have at least one visible swatch in the page.
      this.visibleSwatchWidth = $('.b-j-product-swatch:visible').eq(0).outerWidth(true);

      view.toggleHideColorsLink();
      $(window).resize(function() {
        view.toggleHideColorsLink();
      });
    },

    toggleHideColorsLink: function() {
      var view = this;

      // Calculates the number of visible rows of swatches to decide wheter or not show the "Hide Colors" link.
      $('.b-product-swatches').each(function() {
        var visileSwatchesContainer = $(this).closest('.b-product-wrapper');
        var items = $(this).find('.b-j-product-swatch');
        var lines = view.countWrappedProductSwatchesLines(visileSwatchesContainer, items);
        $(this).find('.b-j-product-show-hide-link').toggle(lines >= 5);
        $(this).find('#b-j-product-collection-colors-toggler').toggle(lines >= 1);
      });
    },

    //we initialize the swiper based on the images we have in the .swiper-container element
    initializeSwiper: function() {
      //swiper coremetrics are fired
      var allImages = this.model.get('images');
      if (!allImages) {
        this.trigger('imagesLoaded');
        return;
      }

      var _this = this,
          activeImageset = this.model.get('activeImageset'),
          activeImages = allImages[activeImageset],
          numberOfActiveImages = activeImages ? activeImages.length : 0,
          swiperAnalytics = function(currentSwiperImageIndex) {
            // only get alt images (index > 0)
            if (currentSwiperImageIndex > 0) {
              analytics.triggerTag({
                tagType: 'pageElementTag',
                elementId: PRODUCT_VIEW_CM_ELEMID + ' - altImage_' + currentSwiperImageIndex,
                elementCategory: 'pdp_alt_view_swipe'
              });
            }
          };

      // cleans up the previous swiper to free resources:
      // attached event listeners, touch events on wrapper, and mouse events on document
      if (mySwiper) {
        mySwiper.destroy(true);
        mySwiper = null;
        this.$el.find('.b-j-pdp-img-pagination').empty();
      }

      if (numberOfActiveImages > 1) {
        //new instance of swiper
        mySwiper = _this.$el.find('#b-pdp-images-wrapper').swiper({
            calculateHeight: true,
            updateOnImagesReady: true,
            loop: true,
            pagination: '.b-j-pdp-img-pagination',
            resizeEvent: (('onorientationchange' in window) ? 'orientationchange' : 'resize'),
            onInit: function(swiper) {
              // if a single image, hide the pagination and turn off the looped images
              var $pagination = $(swiper.paginationContainer),
                  numberOfSlides = swiper.slides.length - (swiper.loop ? 2 : 0);
              $pagination.toggleClass('b-j-invisible', numberOfSlides === 1);

              // adds a unique id for each slide, as that's required for any element that spawns a modal
              $(swiper.container).find('.b-pdp-image-wrapper').each(function(i) {
                $(this).attr('id', 'b-j-product-image-' + i);
              });
            },
            onSlideChangeEnd: function(swiper) {
              // thows a page element tag for alternative images
              swiperAnalytics(swiper.activeLoopIndex);
            },
            onImagesReady: function() {
              _this.trigger('imagesLoaded');
            },
            afterLoop: {
              callback: function(swiper) {
                // adds a class to the cloned slides (because of loop:true) for QE automation
                var clonedClass = 'b-j-swiper-slide-cloned';
                $(swiper.getSlide(0)).addClass(clonedClass);
                $(swiper.getSlide(swiper.slides.length - 1)).addClass(clonedClass);
              }
            }
          });

        //make sure it renders properly upon orientation change
        $(window).resize(function() {
          _this.$el.find('#b-pdp-images-wrapper').css('height', '');
          if (mySwiper) {
            mySwiper.reInit();
          }
        });
      } else {
        var $pdpImagesWrapper = this.$('#b-pdp-images-wrapper');

        this.executeAfterPdpImageLoad($pdpImagesWrapper, function() {
          _this.trigger('imagesLoaded');
        });

        // Adds a unique id on the image for the zoom modal to show correctly and save its state
        $pdpImagesWrapper.find('.b-pdp-image-wrapper').attr('id', 'b-j-product-image-0');
      }

    },

    toggleColorSection: function(e) {
      var $target = $(e.currentTarget);
      var $swatchSection = $target.closest('.b-product-swatches').children('.b-j-product-color-wrapper');

      // expands/collapses the colors section
      $swatchSection.animate({
        height: 'toggle'
      });

      var $productWrapper = $target.closest('.b-product-wrapper');
      var product = this.getProductReference($productWrapper);

      // throws coremetrics page element tag
      var ecat;

      if ($target.html() === 'Show Colors') {
        $target.html('Hide Colors');
        ecat = 'show_colors';
      } else {
        $target.html('Show Colors');
        ecat = 'hide_colors';
      }
      //throw Coremetrics element tagging
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: categoryId + ' - ' + product.id,
        elementCategory: ecat
      });
    },

    toggleMasterColorSection: function(e) {
      var $target = $(e.currentTarget),
          $swatchSection = $target.closest('.b-product-swatches').children('.b-j-product-color-wrapper'),
          coremetricsElementCategory;

      if ($target.html() === 'More Colors') {
        $swatchSection.animate({
          height: '100%'
        });
        $target.html('Less Colors');
        coremetricsElementCategory = 'show_colors';
      } else {
        $swatchSection.animate({
          height: '50'
        });
        $target.html('More Colors');
        coremetricsElementCategory = 'hide_colors';
      }

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: PRODUCT_VIEW_CM_ELEMID,
        elementCategory: coremetricsElementCategory,
        attributes: {
          23: 'Master Swatch'
        }
      });
    },

    /**
     * Remove error styling from the e-gift card input field that had its <input> focused.
     * @param e jQuery focus event
     */
    removeControlGroupErrorStyling: function(e) {
      var $controlGroup = this.$(e.currentTarget).closest('.b-pdp-form-control-group');
      // remove the error styling if it has one
      $controlGroup.removeClass('b-j-input-error');
    },


    /**
     * When user taps a color swatch, the following changes should take place:
     * 1) Color should be set to active
     * 2) Image set should be updated, with the new selected color
     * 3) Swiper should be initialized and zoom view should be updated as well.
     */
    setActiveSwatch: function(e) {
      var $swatch = $(e.currentTarget);
      // used for coremetrics
      var ecat = 'pdp_swatch_tap';

      // This event callback might have been called for a select element, in which case
      // we need to update the reference to the option that matches the select's new val()
      if ($swatch.prop('tagName') === 'SELECT') {
        $swatch = $swatch.find('option[data-id="' + $swatch.val() + '"]');
        ecat = 'pdp_swatch_dropdown';
      }

      var $productWrapper = $swatch.closest('.b-product-wrapper');

      var product = this.getProductReference($productWrapper);
      var colorId = $swatch.data('id');

      product.activeColor = colorId;

      var $swatchesWrapper = $swatch.closest('.b-product-swatches');
      $swatchesWrapper.find('li.b-j-product-swatch').removeClass('selected');
      $swatchesWrapper.find('li.b-j-product-swatch[data-id="' + colorId + '"]').addClass('selected');
      $swatchesWrapper.find('select.b-j-product-color-names').val(colorId);

      if (product.activeColor === 'Select a Color') {
        return;
      }

      var colorName = _.find(product.colors, function(color) {
              return color.id === colorId;
            }).name;
      $swatchesWrapper.find('.b-j-product-color-name').text(colorName);
      var colorGroup = _.find(product.colors, function(color) {
            return color.id === colorId;
          });
      var totalColors = product.colors.length;
      var selectedColorOrder = _.indexOf(product.colors, colorGroup) + 1;

      // For products that also have images, we need to display the imageset associated with the color chosen
      if (product.images) {
        // Calling this method async because Android devices were not getting colors dropdown updated
        setTimeout(_.bind(function() {
          this.updateProductImage($productWrapper, product, colorGroup);
        }, this), 1);
      }

      // For products that also have sizes, re-render these as well
      if (product.sizes) {
        $productWrapper.find('.b-product-sizes').replaceWith(TEMPLATE.productSizes(product));
      }

      //fire coremetrics
      var attributes = {
        24: selectedColorOrder + '|' + totalColors
      };

      if (product.isMaster) {
        attributes['23'] = 'Master Swatch';
      }

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: categoryId + ' - ' + product.id,
        elementCategory: ecat,
        attributes: attributes
      });

      this.setActiveUpc(product);
      return false;
    },

    updateProductImage: function($productWrapper, product, colorGroup) {
      var template, selector, imageSelector, imageWrapperSelector;
      var imageset = colorGroup.imageset;

      product.activeImageset = imageset;

      if (product.isMemberOfMaster) {
        template = TEMPLATE.productImagesMember;
        selector = '.b-product-member-images';
        imageSelector = '.b-product-img';
        imageWrapperSelector = '.b-product-member-images';
      } else {
        template = TEMPLATE.productImages;
        selector = '#b-pdp-images-wrapper';
        imageSelector = '.b-pdp-image';
        imageWrapperSelector = '#b-pdp-images-wrapper';
      }

      //Set the height on image conta  iner to avoid flicker of resizing when an image is replaced
      var $productImageWrapper = $productWrapper.find(imageWrapperSelector);
      product.imageHeight = $productImageWrapper.outerHeight(true);

      $productImageWrapper.replaceWith(template(product));

      // Finding the image wrapper element added to the DOM
      $productImageWrapper = $productWrapper.find(imageWrapperSelector);

      // if this changed the imageset from the pdp carousel, we need to reinit the carousel itself
      // and keep the carousel height to avoid shifting the page up/down
      if (!product.isMemberOfMaster) {
        this.postRenderImages();
      }

      $productImageWrapper.css('height', product.imageHeight);

      this.executeAfterPdpImageLoad($productImageWrapper, function() {
        $productImageWrapper.css('height', '');

        var $swiperWrapper = $productImageWrapper.find('.swiper-wrapper');
        if ($swiperWrapper.length) {
          $swiperWrapper.css('height', '');
        }
      });
    },

    setActiveSize: function(e) {
      var $size = $(e.currentTarget);
      var $productWrapper = $size.closest('.b-product-wrapper');

      var product = this.getProductReference($productWrapper);
      var sizeId = $size.data('id');

      product.activeSize = sizeId;

      $productWrapper.find('.b-product-sizes .selected').removeClass('selected');
      $size.addClass('selected');

      $productWrapper.find('#b-j-product-size-name').text(_.find(product.sizes, function(size) {
                                                                      return size.id === sizeId;
                                                                    }).name);

      // For products that also have swatches, re-render these as well
      if (product.colors) {
        $productWrapper.find('.b-product-swatches').replaceWith(TEMPLATE.productSwatches(product));
      }

      //fire coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: categoryId + ' - ' + product.id,
        elementCategory: 'pdp_size_selection'
      });

      this.setActiveUpc(product);
    },

    /*
     * Pre-select the UPC (size and color) and quantity when product URL is clicked from the BAG page
     */
    preSelectSizeColor: function() {
      var $productWrapper = $('.b-product-wrapper');
      var product = this.getProductReference($productWrapper);

      //check if the PDP is clicked on from BAG page
      if(product.requestParams.extra_parameter === 'BAG') {
        var selectedUPC = product.requestParams.upc_id;
        var upcValue;

        for (var key in product.upcs) {
          if (product.upcs.hasOwnProperty(key)) {
            if (product.upcs[key].upcid === parseInt(selectedUPC)) {
              upcValue = key;
            }
          }
        }

        upcValue = upcValue.split('-');
        var colorId  = parseInt(upcValue[0]),
            sizeId   = parseInt(upcValue[1]);

        product.activeColor = colorId;
        product.activeSize  = sizeId;
        product.activeQty   = parseInt(product.requestParams.quantity);

        //Set the color swatch
        if (product.colors) {
          $productWrapper.find('.b-product-swatches').replaceWith(TEMPLATE.productSwatches(product));
        }
        //Set the size value
        if (product.sizes) {
          $productWrapper.find('.b-product-sizes').replaceWith(TEMPLATE.productSizes(product));
        }
        //Set the quantity
        $productWrapper.find('.b-product-qty').replaceWith(TEMPLATE.productQuantity(product));

        var colorGroup = _.find(product.colors, function(color) {
              return color.id === colorId;
            });

        // For products that also have images, we need to display the imageset associated with the color chosen
        if (product.images) {
          var imageset = colorGroup.imageset,
              imageWrapperSelector = '#b-pdp-images-wrapper';

          product.activeImageset = imageset;

          //Set the height on image conta  iner to avoid flicker of resizing when an image is replaced
          var $productImageWrapper = $productWrapper.find(imageWrapperSelector);
          product.imageHeight = $productImageWrapper.outerHeight(true);

          $productImageWrapper.replaceWith(TEMPLATE.productImages(product));

          // Finding the image wrapper element added to the DOM
          $productImageWrapper = $productWrapper.find(imageWrapperSelector);

          // if this changed the imageset from the pdp carousel, we need to reinit the carousel itself
          // and keep the carousel height to avoid shifting the page up/down
          if (!product.isMemberOfMaster) {
            this.postRenderImages();
          }

          $productImageWrapper.css('height', product.imageHeight);

          this.executeAfterPdpImageLoad($productImageWrapper, function() {
            $productImageWrapper.css('height', '');

            var $swiperWrapper = $productImageWrapper.find('.swiper-wrapper');
            if ($swiperWrapper.length) {
              $swiperWrapper.css('height', '');
            }
          });
        }

        //Set active UPC that will update BOPS messaging
        this.setActiveUpc(product);
      }
    },

    setActiveQty: function(e) {
      var $qty = $(e.currentTarget);
      var $productWrapper = $qty.closest('.b-product-wrapper');

      var product = this.getProductReference($productWrapper);
      var qty = parseInt($qty.val());

      product.activeQty = qty;
    },

    loadLatchkeyMembers: function(latchkeyId) {
      this.model.set('activeLatchkey', latchkeyId);
      this.$('#b-product-members').replaceWith(TEMPLATE.productMembers(this.model.toJSON()));
    },

    setActiveLatchkey: function(e) {
      var $latchkey = this.$(e.currentTarget),
          latchkeyId = $latchkey.data('id');

      this.loadLatchkeyMembers(latchkeyId);
    },

    setActiveUpc: function(product) {
      var upc = this.getUpc(product);

      product.activeUpc = upc;

      // Create a reference to the appropriate productAvailabilityView.
      // Might be multiple subViews for master pdp
      var view = this.subViews['productAvailabilityView_' + product.id];

      // setActiveUpc might get called before productAvailabilityView is initialized,
      // so check that it exists before calling model.set
      if (view) {
        view.model.set('activeUpc', upc);
      }

      this.model.trigger('activeUpcChanged', product);

      return upc;
    },

    getUpc: function(product) {
      var upc = {
        upcKey: -1,
        error: false
      };

      var upcKey = -1;

      if (product.colors) {
        upc.error = '';

        if (product.activeColor) {
          upcKey = product.activeColor;

          if (product.sizes) {

            if (product.activeSize) {
              upcKey += '-' + product.activeSize;
            } else {
              upc.error += 'No size selected. ';
            }
          }

        } else {
          upc.error = 'No color selected.';
        }
      } else if (product.sizes) {
        // Product without colors but with sizes scenario (#451591 - Jo Malone Blue Agava & Cacao Cologne)
        upc.error = '';

        if (product.activeSize) {
          upcKey = product.activeSize;
        } else {
          upc.error += 'No size selected.';
        }
      }

      if (!upc.error) {
        upc.upcKey = upcKey;
      }

      return upc;
    },

    /**
     * Reads on the rendered DOM for the master PDP what is the currently selected latchKey and
     * saves it on the model.
     * This is necessary so that when the user is on a (this) master PDP, coming back from a member,
     * we can have the previously selected latchkey selected again.
     */
    readActiveLatchKeyFromDom: function() {
      var $selectedLatchkey = this.$('.b-j-product-latchkey.selected');
      if ($selectedLatchkey.length > 0) {
        console.log('set activeLatchkey to ' + $selectedLatchkey.index() + ' on view cid=' + this.cid);
        this.model.set('activeLatchkey', $selectedLatchkey.index());
      }
    },

    /**
     * Given a jQuery reference to a product wrapper (a DOM element with the .b-product-wrapper class),
     * returns a reference to the proper product model based on whether or not the wrapper is for a member product.
     *
     * It uses the data-id attribute of the product wrapper to get the member product id. Additionally, it also checks
     * the currently selected latchkey to select the product model for that particular latchkey, in case it is a
     * master product with latchkeys enabled (usually bedding products, e.g., 798374).
     *
     * @param {Object} $productWrapper A jQuery selector to the product container.
     * @return {Object} The model for the member object for a member product or the whole model for a master or a simple product.
     */
    getProductReference: function($productWrapper) {
      var productId = $productWrapper.data('id'),
          activeLatchkey = this.model.get('activeLatchkey'),
          // already sets the return value to be the "page product"
          productData = this.model.attributes;

      // if it is a reference to a member product, we need to iterate over all members and check
      // if the id AND the latchkey match
      if ($productWrapper.data('member')) {
        productData = _.find(this.model.get('members'), function(product) {
          var productIdMatches = product.id === productId;
          var latchkeyMatches = _.isUndefined(product.latchkeyIds) || product.latchkeyIds[0] === activeLatchkey;

          return productIdMatches && latchkeyMatches;
        });

        // if productData is undefined, we update the current activeLatchkey using the data on the DOM (ugly :( )
        // and call this.getProductReference again.
        // the reason why this might be necessary is for when we are on a master PDP, coming back from a member
        // and the current latchkey value in our this.model is not the same that was previously selected
        if (_.isUndefined(productData) && !arguments[1]) {
          this.readActiveLatchKeyFromDom();
          productData = this.getProductReference($productWrapper, true);
        }
      }

      return productData;
    },

    /**
     * There are several scenarios that could prevent a user from adding a product to their bag:
     *
     *   1) The user has not selected a potentially necessary color, or potentially necessary size
     *   2) The user has attempted to add more than the total allowed for this particular product
     *   3) The user has attempted to add more than the total allowed in the bag
     *   4) If it's an e-gift card, the user attempted to add it without filling in properly the required fields
     */
    addToBag: function(e) {
      var $productWrapper = $(e.currentTarget).closest('.b-product-wrapper'),
          product = this.getProductReference($productWrapper),
          eGiftCardParams;

      this.setActiveUpc(product);

      if (this.showUPCValidationMessage(e, $productWrapper, product)) {
        return;
      }

      // if the product being added is an electronic gift card, we validate if the required fields were provided
      if (product.isEGC) {
        eGiftCardParams = this.validateGiftCardFields($productWrapper);
        if (_.isUndefined(eGiftCardParams)) {
          return;
        }
      }

      if (!this.subViews.addToBagView.elementInDOM()) {
        $('body').append(this.subViews.addToBagView.$el);
      }

      this.subViews.addToBagView.show($productWrapper, product, null, this.model.attributes, eGiftCardParams);
    },

    updateBag: function(e) {
      var $productWrapper = $(e.currentTarget).closest('.b-product-wrapper'),
          product = this.getProductReference($productWrapper),
          eGiftCardParams;

      if (!this.subViews.addToBagView.elementInDOM()) {
        $('body').append(this.subViews.addToBagView.$el);
      }

      // if the product being added is an electronic gift card, we validate if the required fields were provided
      if (product.isEGC) {
        eGiftCardParams = this.validateGiftCardFields($productWrapper);
        if (_.isUndefined(eGiftCardParams)) {
          return;
        }
      }

      this.subViews.addToBagView.show($productWrapper, product, 'PDPUPDATE', this.model.attributes, eGiftCardParams);
    },

    addToRegistry: function(e) {
      var $productWrapper = $(e.currentTarget).closest('.b-product-wrapper');
      var product = this.getProductReference($productWrapper);

      this.setActiveUpc(product);

      if (this.showUPCValidationMessage(e, $productWrapper, product)) {
        return;
      }

      if (!this.subViews.addToRegistryView.elementInDOM()) {
        $('body').append(this.subViews.addToRegistryView.$el);
      }

      this.subViews.addToRegistryView.show($productWrapper, product, categoryId);
    },

    orderByPhone: function(e) {
      // the link already has an href='tel:...', so we just need to throw a CM page element tag
      var $productWrapper = $(e.currentTarget).closest('.b-product-wrapper'),
          product = this.getProductReference($productWrapper);

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Click to call-PDP',
        elementCategory: 'Click to Call',
        attributes: {
          29: product.id
        }
      });
    },

    loadMoreMembers: function(newNumberOfMembersToDisplay) {
      if (_.isUndefined(newNumberOfMembersToDisplay)) {
        // determines the new number of member products to display and re-renders the section
        numberOfMembersDisplayed = Math.min(this.model.get('members').length, numberOfMembersDisplayed + NUMBER_OF_MEMBERS_TO_LOAD);
      } else {
        numberOfMembersDisplayed = newNumberOfMembersToDisplay;
      }

      this.$('#b-product-members').replaceWith(TEMPLATE.productMembers(this.model.attributes));
      this.postRenderMemberProducts();
      this.postRenderProductAvailability();
    },

    showMoreMembersButton: function() {
      this.loadMoreMembers();

      // throws page element tag
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'view_more_from_this_collection',
        elementCategory: 'Master_PDP'
      });
    },

    trackMemberSectionState: function(e) {
      var $productWrapper = $(e.currentTarget).closest('.b-product-wrapper'),
          product = this.getProductReference($productWrapper);

      if (typeof product.expanded === 'undefined') {
        product.expanded = false;
      }
      product.expanded = !product.expanded;
    },

    doZoomAnalytics: function(imageIndex) {
      //throw Coremetrics element tagging whenever an image is displayed on the zoom view
      var eid = PRODUCT_VIEW_CM_ELEMID;

      if (imageIndex > 0) {
        eid += ' - altImage_' + imageIndex;
      }

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: eid,
        elementCategory: 'PDP ZOOM'
      });
    },

    displayErrorMessage: function(e) {
      var $productWrapper = $(e.currentTarget).closest('.b-product-wrapper');
      var product = this.getProductReference($productWrapper);

      this.hideUPCValidationMessage();

      MessageToast.displayAvailabilityMessage($(e.currentTarget), product);
    },

    shippingReturnsAnalytics: function() {
      // throw coremetrics page element tag
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: PRODUCT_VIEW_CM_ELEMID,
        elementCategory: 'PDP_SHIP_RETURN_TAB'
      });
    },

    truncate: function(content) {
      if (content) {
        content.dotdotdot({ watch: true });
      }
    },

    showUPCValidationMessage: function(e, $productWrapper, product) {
      // The previous message must be removed if the user click on an unavailable color/size twice
      this.hideUPCValidationMessage();

      var messageResult = MessageToast.displayUPCMessage($(e.currentTarget), $productWrapper, product);
      if (messageResult !== false) {
        this.upcValidationMessage = messageResult;
        return true;
      }

      return false;
    },

    hideUPCValidationMessage: function() {
      if(this.upcValidationMessage) {
        this.upcValidationMessage.hide();
        this.upcValidationMessage = null;
      }
    },

    /**
     * Check if the e-gift cards input fields are properly filled in (1).
     * Besides, returns the input fields values in such a way that is expected for the AddToBag call (2).
     *
     * About 1)
     *   - The amount (#b-j-gift-card-amount) is a required field and should be a float between 10.00 and 1000.00.
     *   - The recipient (#b-j-gift-card-recipient) is a required field and should be a valid email.
     * About 2)
     *   - customprice: the amount of the e-gift card entered by the user
     *   - recipientemail: the email address for whom this e-gift card will be sent
     *   - to: the name of the person who will receive the e-gift card
     *   - message: a message to be included on the email
     *   - from: the name of the person who is giving the e-gift card
     * @param $productWrapper
     * @returns {customprice: *, recipientemail: *, to: *, message: *, from: *} the values of the input fields in the
     * format expected by the AddToBag call or {undefined} if errors were found.
     */
    validateGiftCardFields: function($productWrapper) {
      // hides previous error messages related to the e-gift card fields
      this.hideGiftCardValidationMessage();

      // gets the values from the form inputs
      var amount = this.$el.find('#b-j-gift-card-amount').maskMoney('unmasked')[0],
          $recipientEl = this.$el.find('#b-j-gift-card-recipient'),
          recipient = $.trim($recipientEl.val()),
          messageTo = $.trim(this.$el.find('#b-j-gift-card-message-to').val()),
          messageText = $.trim(this.$el.find('#b-j-gift-card-message-text').val()),
          messageFrom = $.trim(this.$el.find('#b-j-gift-card-message-from').val()),
          hasErrors = false;

      // test the amount for its presence and to check its bounds (10 <= amount <= 1000)
      if (_.isUndefined(amount) || amount < 10 || amount > 1000) {
        $productWrapper.find('.b-j-gift-card-error-amount').removeClass('hide');
        $productWrapper.find('#b-j-gift-card-amount').closest('.b-pdp-form-control-group').addClass('b-j-input-error');
        hasErrors = true;
      }
      // test the recipient email for its presence and its format (valid email address)
      // note: as the recipient is an input[type=email], we can leverage the html5 validation (validity.valid)
      if (recipient === '' || !$recipientEl[0].validity.valid) {
        $productWrapper.find('.b-j-gift-card-error-no-recipient').removeClass('hide');
        $productWrapper.find('#b-j-gift-card-recipient').closest('.b-pdp-form-control-group').addClass('b-j-input-error');
        hasErrors = true;
      }

      // if there are errors, return undefined and scroll to the beginning of the e-gift cards section
      if (hasErrors) {
        $('html, body').animate({ scrollTop: this.$('.b-electronic-gift-cards-container').position().top }, 300, 'swing');
        return undefined;
      }


      // if the values are ok, return the values of the inputs in a format that is expected by the AddToBag call
      var result = {
        customprice: amount,
        recipientemail: recipient,
        to: messageTo,
        message: messageText,
        from: messageFrom
      };

      // remove parameters that are empty - otherwise WSSG will complain
      if (result.to === '') {
        delete result.to;
      }
      if (result.message === '') {
        delete result.message;
      }
      if (result.from === '') {
        delete result.from;
      }

      return result;
    },

    /**
     * Hide eventual error messages from the validation of the e-gift cards form fields.
     */
    hideGiftCardValidationMessage: function() {
      this.$el.find('.b-input-field-error-explanation').addClass('hide');
      this.$el.find('.b-pdp-form-control-group').removeClass('b-j-input-error');
    },

    /**
     * Counts the number of wrapped lines of elements based on floated elements.
     * For the method work properly, we should pass a visible container, because we
     * can't calculate offset properties of hidden elements.
     *
     * @param {Object} $visibleContainer A jQuery object the first visible parent container where
     * the items will be floated. The width used to calculate how many objects per line will be
     * based on this object's width.
     * @param {Object} $items A jQuery object thet represents a set of DOM elements.
     * @return int The number of wrapped lines.
     */
    countWrappedProductSwatchesLines: function($visibleContainer, $items) {
      // Gets the container, without the padding
      var visibleContainerWidth = $visibleContainer.width();

      var itemsPerLine = Math.floor(visibleContainerWidth / this.visibleSwatchWidth);
      return Math.ceil($items.length / itemsPerLine);
    },

    /**
     * Expands a member product section on a master PDP. This is useful for when
     * we are coming back from a member PDP into its master, so that the user
     * will keep track of the exact member product he just navigated from.
     *
     * 3 possible scenarios:
     *   1. The member is already visible on the initial state of the master PDP
     *   2. The member is hidden because the user had to click on "Show more members" to see it
     *   3. The member is hidden because the user selected a latchkey different than the initial state one
     * @param produtId the id of the member product that we want to expand.
     * @param activeLatchKey the index of the latchKey that should be selected. Optional, as most products do not have
     * latchKeys.
     */
    expandMemberProductSection: function(productId, activeLatchkey) {
      var members = this.model.get('members');
      if (!members || members.length === 0) {
        return;
      }

      var memberIndex = _.findIndex(members, { id: productId });

      if (memberIndex === -1) {
        // the productId is not a member of this master PDP
        return;
      }

      // do we need to activate a latchKey to see this member on the master PDP (scenario 3)?
      if (!_.isUndefined(activeLatchkey)) {
        this.loadLatchkeyMembers(activeLatchkey);
      }
      // do we need to show more members than those that are already visible (scenario 2)?
      else if (memberIndex > numberOfMembersDisplayed - 1) {
        var numberOfMembersToDisplay = Math.ceil((memberIndex + 1) / NUMBER_OF_MEMBERS_TO_LOAD) * NUMBER_OF_MEMBERS_TO_LOAD;
        this.loadMoreMembers(numberOfMembersToDisplay);
      }

      // expands the appropriate member section
      var $productExpandableContainer = this.$('[data-id="' + productId + '"]').find('[data-expandable="container"]');
      $productExpandableContainer.removeClass('b-expandable-closed');
      $productExpandableContainer.find('[data-expandable="content"]').show();
   },

    /**
     * Create the transition from Master to Member pages, and create a custom animation
     * when returning from member to scroll page to the same Member within collection.
     */
    transitionToMember: function(e) {
      var view = this,
          activeLatchkey = this.model.get('activeLatchkey');

      // Custom animation after returning from Member
      var afterReverseTransition = function () {
        var productId = $(e.currentTarget).closest('.b-product-member-of-master').data('id');
        view.expandMemberProductSection(productId, activeLatchkey);
        var productTop = view.$('[data-id="' + productId + '"]').position().top;
        var headerHeight = $('#mb-region-header').height();
        $('html, body').scrollTop(productTop + headerHeight);

        // disposes of the old PDP master view so the garbage collector can clean it
        view = null;
      };

      // Create the transition, set custom animations and add it to the router
      var transition = new Transition('slide');
      transition.on('afterReverseTransition', afterReverseTransition);
      App.transitions.set(transition);
    },

    /**
     * Overriding MainContentView renderCompleted event triggering to just trigger it
     * when all images are completely loaded.
     */
    notifyRenderCompleted: function() {
      this.listenToOnce(this, 'imagesLoaded', function() {
        Backbone.trigger('renderCompleted');
      });
    },

    executeAfterPdpImageLoad: function($container, callback) {
      util.waitImagesLoad($container, callback, '.b-pdp-image');
    }

  });

  Handlebars.registerHelper('productTypeClass', function(product) {
    var productTypeClass;

    if (product.isMaster) {
      productTypeClass = 'b-product-master';
    } else if (product.masterCollection) {
      productTypeClass = 'b-product-member';
    }

    return productTypeClass || 'b-product-single';
  });

  Handlebars.registerHelper('productSizeName', function(sizes, activeSize, noSelectionText) {
    if (activeSize) {
      return _.find(sizes, function(size) {
        return size.id === activeSize;
      }).name;
    }

    if (sizes.length === 1) {
      return sizes[0].name;
    }

    var sizeCount = 0,
        sizeName = '';

    _.forEach(sizes, function(size) {
      if (size.colorIds) {
        sizeCount++;
        sizeName = size.name;
      }
    });

    if (sizeCount === 1) {
      return sizeName;
    }

    return noSelectionText || 'Select a Size';
  });

  Handlebars.registerHelper('ifSizeColorAssociationGtOne', function(sizes, options) {
    // If there is only one Size that has colorIds associated, then do not display size button
    var sizeCount = 0;
    _.forEach(sizes, function(size) {
      if (size.colorIds){
        sizeCount++;
      }
    });
    if (sizeCount > 1) {
      return options.fn(this);
    }
    return false;
  });

  Handlebars.registerHelper('latchkeyDisplayName', function(name) {
    if (name.toLowerCase() === 'california king') {
      return 'Cal King';
    }
    return name;
  });

  Handlebars.registerHelper('productViewMoreMembers', function(members) {
    if (numberOfMembersDisplayed < members.length) {
      // There are more members available than what are currently displaying
      return new Handlebars.SafeString('<button id="mb-j-product-show-members">See more from this collection</button>');
    }

    return '';
  });

  Handlebars.registerHelper('ifProductMemberVisible', function(member, latchkeys, activeLatchkey, index, options) {
    // If there are no latchkeys, display products by
    if (!latchkeys) {
      var lastMemberToDisplay = numberOfMembersDisplayed - 1;
      if (index <= lastMemberToDisplay) {
        return options.fn(this);
      }

      return options.inverse(this);
    }

    // If there are latchkeys, the product member is visible if it is associated with the active latchkey
    if (_.contains((member.latchkeyIds || []), activeLatchkey)) {
      return options.fn(this);
    }

    // This member should not be displayed
    return options.inverse(this);
  });

  Handlebars.registerHelper('whichOffer', function(promotions, isRecent) {
    // If there only one offer, find out which one (bonus or special)
    var PWP = ['PWP', 'Site-Wide PWP'],
        GWP = ['Bundled GWP', 'Threshold GWP', 'Multi Threshold GWP'];

    if (promotions.length === 1) {
      if (_.contains(PWP, promotions[0].promoType)) {
        return 'Special Offer';
      } else if (_.contains(GWP, promotions[0].promoType)){
        return 'Bonus Offer';
      } else if(isRecent === true) {
        return promotions[0].promoOfferDescription;
      }
    } else if (promotions.length > 1) {
      return 'Bonus Offer';
    }
  });

  Handlebars.registerHelper('offersCount', function(promotions) {
    // return number of promotions the product eligible for
    var promoTypes = ['Bundled GWP', 'PWP', 'Threshold GWP', 'Multi Threshold GWP', 'Site-Wide PWP'],
        promoLength = 0;

    _.forEach(promotions, function(promotion) {
      if (_.contains(promoTypes, promotion.promoType)) {
        promoLength++;
      }
    });

    if (promoLength !== 1) {
      return ' (' + promoLength + ')';
    }

    return false;
  });

  Handlebars.registerHelper('isValidPromoType', function(promotions, options) {
    // Because the server returns all possbile promo types, loop thru to identify the once that are needed
    // Return true if it belongs to one of the 5 defined promo types
    var promoTypes = ['Bundled GWP', 'PWP', 'Threshold GWP', 'Multi Threshold GWP', 'Site-Wide PWP'],
        promoLength = 0;

    _.forEach(promotions, function(promotion) {
      if (_.contains(promoTypes, promotion.promoType)) {
        promoLength++;
      }
    });

    // return true if atleast one found
    if (promoLength > 0){
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('isValidPromo', function(promotion, options) {
    var promoTypes = ['Bundled GWP', 'PWP', 'Threshold GWP', 'Multi Threshold GWP', 'Site-Wide PWP'];

    if (_.contains(promoTypes, promotion.promoType)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('ifNotGiftCard', function(product, options) {
    var giftCardPatterns = App.config.products.giftCard.urlPatterns;
    var productUrl = product.productURL;
    var isGiftCard = _.some(giftCardPatterns, function(text) {
      return productUrl.indexOf(text) !== -1;
    });

    if (!isGiftCard) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('formatRatingsHistogram', function(reviewCnt, totalReviews) {
    return (reviewCnt / totalReviews) * 100.0;
  });

  Handlebars.registerHelper('pdpImageWidthOptimize', function() {
    var width = 290 * window.devicePixelRatio;

    return util.productImageOptimized('', width);
  });

  return BCOMProductView;

});
