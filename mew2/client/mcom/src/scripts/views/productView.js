// @TODO - much more performant ways to handle truncation
define([
  // Libraries
  'jquery',
  'underscore',
  'backbone',
  'handlebars',

  // Utilities
  'util/util',
  'analytics/analyticsTrigger',
  'util/stickyHeader',
  'util/orientation',
  'util/productMessageToast',
  'util/multiValueCookie',
  'util/fewerMore',
  'util/tooltip',
  'util/BTDataDictionary',
  'util/BCvideo',
  'util/localstorage',

  // Models
  'models/bopsModel',

// Views
  'views/mainContentView',
  'views/_productView',
  'views/recentProductsView',
  'views/productRecommendationsView',
  'views/zoomModalView',
  'views/productAvailabilityView',
  'views/productSizeChartModalView',
  'views/productSizeChartHtmlModalView',
  'views/productShippingReturnsModalView',
  'views/productRebatesModalView',
  'views/productSpecialOffersModalView',
  'views/productWarrantyModalView',
  'views/productReviewsModalView',
  'views/productBopsModalView',
  'views/productPricingPolicyModalView',
  'views/addToBagView',
  'views/addToRegistryView',
  'views/addToWishlistView',
  'views/rulesModalView',

  'foresee/foresee-trigger',

  'views/shareOverlayView',

  'swiper',
  // Templates
  'compTemplates/appTemplates',
  'views/baseView',
  'jquery.dotdotdot'
], function($, _, Backbone, Handlebars, util, analytics, stickyHeader, orientation, messageToast, mvCookie, fewerMore, tooltip, BTDataDictionary, BCvideo, $localStorage, BopsModel,
              MainContentView, ProductView, RecentProductsView, ProductRecommendationsView, ZoomModalView, ProductAvailabilityView,
              ProductSizeChartModalView, ProductSizeChartHtmlModalView, ProductShippingReturnsModalView, ProductRebatesModalView, ProductSpecialOffersModalView, ProductWarrantyModalView,
              ProductReviewsModalView, ProductBopsModalView, ProductPricingPolicyModalView, AddToBagView, AddToRegistryView, AddToWishlistView, RulesModalView, FSR, ShareOverlayView) {

  'use strict';
  var carousel;
  var LEFT_PEAK = 25;
  var membersShowing, allMembers, allDetailsShowing, productDetailsHeight;
  var INITIAL_MEMBER_DISPLAY_COUNT = 2;
  var MORE_MEMBERS_DISPLAY_COUNT = 5;

  /*
    For each facet, mutliple properties can exist:
    selector: Required. The selector of the element to turn red and place the error message above.
    article: Optional. The word to place before the facet. Should be 'the', 'a', or 'an'. Defaults to 'a'.
    listProperty: Optional. The property on the product object where the list lives. Defaults to the facet name + 's' (i.e. 'color' => 'colors')
    activeProperty: Optional. The property on the product object where the active facet lives. Defaults to 'active' + ucfirst(facet name) (i.e. 'color' => 'activeColor')
  */
  var FACETVALIDATION = {
    size: {
      selector: '#m-product-size-name .m-facet-name-reference'
    },
    color: {
      selector: '.m-product-color-name .m-facet-name-reference'
    },
    type: {
      selector: '#m-product-type-name .m-facet-name-reference'
    }
  };

  // Set up FACETVALIDATION defauts right now to avoid unnecessary overhead later.
  for (var i in FACETVALIDATION) {
    if (FACETVALIDATION.hasOwnProperty(i)) {
      var cur = FACETVALIDATION[i];

      cur.article = cur.article || 'a';
      cur.listProperty = cur.listProperty || i + 's';
      cur.activeProperty = cur.activeProperty || 'active' + i[0].toUpperCase() + i.slice(1);
    }
  }

  var isBackButtonRendered = false;

  var MCOMProductView = ProductView.extend({
    init: function() {
      this.allDetailsContent = undefined;

      ProductView.prototype.init.call(this);

      this.listenTo(orientation, 'orientationchange', function() {
        if (allDetailsShowing) {
          this.showMoreProductDetails();
        } else {
          this.showFewerProductDetails();
        }

        this.$el.find('.truncated').dotdotdot({ watch: true });

        //To fix iOS defect of overflow scroll while changing orientation we need
        //to reset the attribute on scroll containers
        var scrollables = $('.m-scrollable');
        _.each (scrollables, function(scrollable) {

          var $content = $(scrollable).find('.m-j-overflows');
          if ($content.width() > $(window).width()){
            $(scrollable).css('-webkit-overflow-scrolling', 'auto');
            window.setTimeout(function() {
              $(scrollable).css('-webkit-overflow-scrolling', 'touch');
            }, 50);
          }
        });

        /**
         * There is an iOS defect that prevents vertical scrolling after orientationchange
         * from portrait -> landscape -> portrait (if container in landscape fits in viewport).
         * Because of this, we just re-apply webkit scroll properties
         */
        // var $content = $('#m-product-latchkeys .m-scrollable');
        // if ($content.length && $content.width() > $(window).width()) {
        //   $(scrollable).css('-webkit-overflow-scrolling', 'auto');
        //   window.setTimeout(function() {
        //     $(scrollable).css('-webkit-overflow-scrolling', 'touch');
        //   }, 50);
        // }
      });

      this.setCMPanelType('PDP');

    },

    events: {
      'click  #m-j-invis-prev': 'swipePrev',
      'click  #m-j-invis-next': 'swipeNext',

      'click  .m-j-product-swatch:not(.selected)': 'setActiveSwatch',
      'change .m-j-product-color-names': 'setActiveSwatch',
      'click  .m-j-product-swatch': 'doSwatchAnalytics',
      'click  .m-j-product-size:not(.selected)': 'setActiveSize',
      'click  .m-j-product-size.selected': 'deselectSize',
      'change .m-j-product-qty-values': 'setActiveQty',
      'click  .m-j-product-latchkey:not(.selected)': 'setActiveLatchkey',
      'click  .m-j-product-type:not(.selected)': 'setActiveType',

      'click  .m-product-swatch-display li a:not(.selected)': 'toggleSwatchDisplay',
      'click  .m-product-swatch-display li a.selected': 'preventDefault',
      'click  .m-j-product-details-more': 'showMoreProductDetails',
      'click  .m-j-product-details-less': 'showFewerProductDetails',

      'click  .m-j-product-add-bag': 'addToBag',
      'click  .m-j-product-add-registry': 'addToRegistry',
      'click  .m-j-product-add-wishlist': 'addToWishlist',
      'click  .m-product-prices.single': 'scrollToPriceDetails',

      'click  .swiper-slide': 'showZoomModal',

      'click  .m-j-product-launch-write-reviews-modal': 'showWriteReviewModal',
      'click  .m-j-product-size-chart-link,#m-j-product-size-chart-clickable': 'showSizeChartModal',
      'click  #mb-j-product-show-members': 'showMoreMembers',
      'click  #m-j-product-shipping-returns': 'showShippingReturnsModal',
      'click  .m-product-rebate span': 'showRebatesModal',
      'click  .m-j-product-phone': 'doOrderByPhoneAnalytics',
      'click  .m-product-promotion .m-clickable, #m-j-product-special-offers': 'showSpecialOffersModal',
      'click  .bops-store-lookup': 'showBopsModal',
      'click  .m-product-details-bullets-warranty': 'showWarrantyModal',
      'click  .m-j-launch-reviews-modal': 'showReviewsModal',
      'click  .m-pricing-policy': 'showPricingPolicyModal',

      'click  #m-j-pdp-back': 'back',
      'click #product-share-email-link': 'doShareEmailAnalytics',

      'click .m-view-details': 'saveCurrentMemberID',
      'click #m-view-collection': 'clearCurrentMemberID',
      'click #m-watch-video': 'watchVideo',
      'click #m-video-label': 'toggleVideo',

      'click #product-share': 'shareOverlay'
    },

    saveCurrentMemberID: function(e) {
      var $container = $(e.target).closest('.m-product-wrapper');
      Backbone.trigger('pdp:memberClicked', $container[0].id);
    },

    clearCurrentMemberID: function() {
      Backbone.trigger('pdp:clearMember');
    },
    // Prevent default behavior.
    // @TODO should this be more global?
    preventDefault: function(e) {
      e.preventDefault();
      return false;
    },

    swipePrev: function() {
      carousel.swipeTo(carousel.activeIndex - 1);
    },

    swipeNext: function() {
      carousel.swipeTo(carousel.activeIndex + 1);
    },

    setActiveSwatch: function(e) {
      var $swatch = $(e.currentTarget);
      var $productWrapper = $swatch.closest('.m-product-wrapper');
      var sel = FACETVALIDATION.color.selector;

      if ($swatch.hasClass('unavailable')) {
        tooltip(
          $productWrapper.find(sel),                                    // element: The color label in the current product wrapper
          'Sorry, that color/size(type) combination is not available',  // content
          'left',                                                       // arrowPosition
          1000,                                                         // ttl (time-to-live): 1 second
          1                                                             // marginBottom
        );                                                              // -ekever

        return false;
      }

      $(sel).removeClass('m-is-erroneous');

      // This event callback might have been called for a select element, in which case
      // we need to update the reference to the option that matches the select's new val()
      if ($swatch.prop('tagName') === 'SELECT') {
        $swatch = $swatch.find('option[data-id="' + $swatch.val() + '"]');
      }

      var product = this.getProductReference($productWrapper);
      var colorId = $swatch.data('id');

      product.activeColor = colorId;

      $productWrapper.find('.m-product-swatches:first li.m-j-product-swatch').removeClass('selected');
      $productWrapper.find('.m-product-swatches:first li.m-j-product-swatch[data-id="' + colorId + '"]').addClass('selected');
      $productWrapper.find('.m-product-swatches:first select.m-j-product-color-names').val(colorId);

      if (!product.members){
        $productWrapper
          .find('.m-selected-color')
          .text(_.find(product.colors, function(color) {
            return color.id === colorId;
          }).name);

          $productWrapper.find('.m-select-button .display').text($productWrapper.find('.m-selected-color').text());
      } else {

        $productWrapper.find('.m-select-button .display').text($swatch.text());
      }

      // For products that also have images, we need to display the imageset associated with the color chosen
      if (product.images) {
        var imageset = _.find(product.colors, function(color) {
          return color.id === colorId;
        }).imageset;

        product.activeImageset = imageset;
        //Used by template to figure out to display swatch for master or not
        //where we show it when there's selected color and don't when these's not
        product.showSwatches = true;

        var template, selector;
        if (product.isMemberOfMaster){
          template = TEMPLATE.productImagesMember;
          selector = '.m-product-member-images';
        } else {
          template = TEMPLATE.productImages;
          selector = '#m-product-images';
        }

        //Set the height on image container to avoid flicker of resizing
        //when an image is replaced
        var imageWrapper = $productWrapper.find(selector);
        imageWrapper.css('height', imageWrapper.css('height'));
        var html = template(product);
        $productWrapper.find('.m-product-images:first').replaceWith(html);

        this.postRenderImages(product.activeColor);
        this.model.set('viewedImages', undefined);
        this.addViewedImage(product.images[product.activeImageset][0].image);
      }

      // For products that also have sizes, re-render these as well
      if (product.sizes) {
        this.doSizeAvailability($productWrapper);
      }

      if (product.types) {
        this.doTypeAvailability($productWrapper);
      }

      this.setActiveUpc(product);
      return false;
    },

    setActiveSize: function(e) {
      var $size = $(e.currentTarget);
      var $productWrapper = $size.closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);
      var sel = FACETVALIDATION.size.selector;

      if ($size.hasClass('unavailable')) {
        tooltip(
          $productWrapper.find(sel),                                    // element: The size label inside of the current product wrapper
          'Sorry, that color/size(type) combination is not available',  // content
          'left',                                                       // arrowPosition
          1000,                                                         // ttl (time-to-live): 1 second
          1                                                             // marginBottom
        );
                                                                        // -ekever
        this.deselectSize (e);
        return false;
      }

      $(sel).removeClass('m-is-erroneous');
      var sizeId = $size.data('id');

      product.activeSize = sizeId;
      $productWrapper.find('.m-product-sizes:first .selected').removeClass('selected');
      $size.addClass('selected');

      $productWrapper.find('.m-selected-size-name')
        .text(_.find(product.sizes, function(size) {
          return size.id === sizeId;
        }).name);

      // For products that also have swatches, re-render these as well
      if (product.colors) {
        this.doColorAvailability($productWrapper, 'sizes', sizeId);
      }

      this.setActiveUpc(product);
    },

    deselectSize: function(e) {
      var $size = $(e.currentTarget);
      var $productWrapper = $size.closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);

      product.activeSize = undefined;

      $productWrapper.find('.m-product-sizes:first .selected').removeClass('selected');
      $productWrapper.find('.m-selected-size-name').text('Please select');

      // For products that also have swatches, re-render these as well
      if (product.colors) {
        this.doColorAvailability ($productWrapper, 'sizes');
      }

      this.displayProductAvailability();
    },
    doColorAvailability: function($productWrapper, triggerEntity, activeId) {
      var product = this.getProductReference($productWrapper);

      var $swatches = $productWrapper.find('.m-swatches-scroll:first .m-j-product-swatch');
      $swatches.removeClass('unavailable');

      if (activeId) {
        var selectedObj = _.find(product[triggerEntity], function(triggerObj) {
          return triggerObj.id === activeId;
        });

        if (selectedObj.colorIds){
          _.each($swatches, function(swatch) {
            var colorId = $(swatch).data('id');
            if (!_.contains(selectedObj.colorIds, colorId)) {
              $(swatch).addClass('unavailable');
            }
          });
        }
      }
    },
    doSizeAvailability: function($productWrapper) {
      var product = this.getProductReference($productWrapper);

      var $sizes = $productWrapper.find('.m-sizes-scroll:first .m-j-product-size');
      $sizes.removeClass('unavailable');

      var selectedColor = _.find(product.colors, function(color) {
        return color.id === product.activeColor;
      });

      if (selectedColor.sizeIds){
        _.each($sizes, function(size) {
          var sizeId = $(size).data('id');
          if (!_.contains(selectedColor.sizeIds, sizeId)) {
            $(size).addClass('unavailable');
          }
        });
      }
    },
    doTypeAvailability: function($productWrapper) {
      var product = this.getProductReference($productWrapper);

      var $types = $productWrapper.find('.m-types-scroll:first .m-j-product-type');
      $types.removeClass('unavailable');

      var selectedColor = _.find(product.colors, function(color) {
        return color.id === product.activeColor;
      });

      if (selectedColor.typeIds){
        _.each($types, function(type) {
          var typeId = $(type).data('id');
          if (!_.contains(selectedColor.typeIds, typeId)) {
            $(type).addClass('unavailable');
          }
        });
      }
    },
    setActiveQty: function(e) {
      var $qty = $(e.currentTarget);
      var $productWrapper = $qty.closest('.m-product-wrapper');

      var product = this.getProductReference($productWrapper);
      var qty = $qty.val();

      product.activeQty = parseInt(qty, 10);

      $productWrapper.find('.m-product-qty').replaceWith(TEMPLATE.productQuantity(product));
    },

    setActiveLatchkey: function(e) {
      var $latchkey = $(e.currentTarget);
      var $productWrapper = $latchkey.closest('.m-product-wrapper');

      var product = this.getProductReference($productWrapper);
      var latchkeyId = $latchkey.data('id');

      product.activeLatchkey = latchkeyId;

      $productWrapper.find('#m-product-members').replaceWith(TEMPLATE.productMembers(product));
      $productWrapper.find('#m-product-latchkeys .selected').removeClass('selected');
      $latchkey.addClass('selected');

      /**
       * There is an issue in iOS where spinner gif is too slow to load when user hits "add to bag" or "add to registry".
       * Because of this, the button appears "blank" for the first time it is tapped, as the gif is still loading.
       * To work around this, we render the buttons initially with the "spinner" class, so that the gif is cached by the browser.
       * We must then remove this class during this phase, to show the button text.
       */
      $('.m-j-product-add-bag,.m-j-product-add-registry').removeClass('spinner');

      this.initializeScrolls();
      this.displayProductAvailability();

      this.$el.find('.truncated').dotdotdot();
    },

    setActiveType: function(e) {
      var $type = $(e.currentTarget);
      var $productWrapper = $type.closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);
      var sel = FACETVALIDATION.type.selector;

      if ($type.hasClass('unavailable')) {
        tooltip(
          $productWrapper.find(sel),                                    // element: The type label in the current product wrapper
          'Sorry, that color/size(type) combination is not available',  // content
          'left',                                                       // arrowPosition
          1000,                                                         // ttl (time-to-live): 1 second
          1                                                             // marginBottom
        );                                                              // -ekever

        return false;
      }

      $(sel).removeClass('m-is-erroneous');

      var typeId = $type.data('id');

      product.activeType = typeId;

      $productWrapper.find('.m-selected-type-name')
        .text(_.find(product.types, function(type) {
          return type.id === typeId;
        }).name);

      $productWrapper.find('.m-product-types .selected').removeClass('selected');
      $type.addClass('selected');

      if (product.colors) {
        this.doColorAvailability($productWrapper, 'types', typeId);
      }

      this.setActiveUpc(product);
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
    },

    toggleSwatchDisplay: function(e) {
      var $clicked = $(e.currentTarget);
      var display = $clicked.data('display');
      var $productWrapper = $clicked.closest('.m-product-wrapper');

      $clicked.closest('.m-product-swatch-display').find('a').removeClass('selected').end().end().addClass('selected');

      $productWrapper
        .find('.color-wrapper')
        .addClass('not-visible')
        .end()
        .find('.color-wrapper[data-display="' + display + '"]')
        .removeClass('not-visible');

      if (display === 'swatch'){
        this.scrollSelectedIntoView('ul.m-swatches-scroll', '.m-j-product-swatch', $productWrapper);
      } else if (display === 'name') {
        $productWrapper.find('.m-select-button .display').text($($productWrapper.find('.m-swatches-scroll')[0]).find('.selected .m-swatch-img').attr('alt'));
      }
      return false;
    },

    /**
     * This events is triggered when the "more" link is clicked in the product details section.
     *
     * Render full product details / description text, which is stored in memory.
     *
     * Additionally, if can be truncated, display a "more" link which will display all product details.
     */
    showMoreProductDetails: function(e) {
      // When this is triggered by the click event, be sure to prevent the default behavior for the anchor element
      if (e) {
        e.preventDefault();
      }

      // Remove any "less" link, and hidden content
      $('.m-j-product-details-less,.m-j-product-details-remaining').remove();

      // Grab a reference to the product details section
      var $details = $('#m-product-details .content');

      if (!allDetailsShowing) {
        // Destroy any previous dotdotdot delegation to prevent re-applying truncation.
        // This will re-apply any height that was previously set, so remove the height as well
        $details.trigger('destroy.dot').height('auto');

        // Display full product details with a "less" link
        $details.empty().append(this.allDetailsContent);
      }

      var maxHeight = this.getProductDetailsHeight();

      if ($details.height() > maxHeight) {
        // Create a link that will be used to show fewer product details
        var $lessLink = $('<a class="m-j-product-details-less m-link" href="#">less</a>');

        $details.append($lessLink);
      }

      allDetailsShowing = true;

      return false;
    },

    /**
     * This function is triggered under several scenarios:
     *    1) on page load
     *    2) when "less" link is clicked in the product details section
     *    3) on orientationchange, if description text was truncated before orientationchange.
     *
     * Truncate product description text if more than `n` lines, where:
     *    - `n` = 1 for master products
     *    - `n` = 10 for simple / member products
     *
     * Additionally, if truncated, display a "more" link which will display all product details.
     */
    showFewerProductDetails: function() {
      // Remove any "less" link
      $('.m-j-product-details-less').remove();

      var $details = $('#m-product-details .content');

      // Destroy any previous dotdotdot delegation to prevent re-applying truncation.
      // This will re-apply any height that was previously set, so remove the height as well
      $details.trigger('destroy.dot').height('auto');

      // If dotdotdot has previously been applied to this section of text, replace with original contents
      // This is needed because content might be truncated differently on orientationchange
      if (!allDetailsShowing && this.allDetailsContent) {
        // Display full product details
        $details.empty().append(this.allDetailsContent);
        $details = $('#m-product-details .content');
      }

      var maxHeight = this.getProductDetailsHeight();

      if ($details.height() > maxHeight) {
        var $description = $details.find('.m-product-details-description');
        var $moreLink = $('<a class="m-j-product-details-more m-link" href="#">more</a>');

        // Store the original content in memory
        if (!this.allDetailsContent) {
          this.allDetailsContent = $details.html();
        }

        // Apply dotdotdot() to truncate the text to the appropriate height
        $details.height(maxHeight).dotdotdot();

        // because we have both a <ul> and <p>, dotdotdot() puts the dots in the wrong place.
        // Strip them out; we will add them manually.
        // Assumption is that "..." does not appear elewhere in copy intentionally
        $details.html($details.html().replace('...', ''));

        // Now that dotdotdot() has truncated the text, we can remove the fixed height.
        // This is done so that there are no issues on orientationchange
        $details.height('auto');

        // Add custom "more" link.
        // Can't use jQuery dotdotdot for this, since we have multiple content containers
        $description = $details.find('.m-product-details-description');
        var $node; // will be a reference to one of two jQuery DOM elements

        // If dotdotdot didn't completely cut out description, we append more link to description
        if ($description.length) {
          $node = $description;
        } else {
          // reference the final li in the list of bullets (no description)
          $node = $details.find('.m-product-details-bullets ul li:last');
        }

        // Grab the text from the details bullets / description paragraph
        var trailingText = $node.text();

        // Take out characters to ensure the "more" string will fit on the same line
        var moreLength = 4;
        var spaceLength = 4;

        var slice = moreLength + spaceLength; // 4 characters for "more", four for extra spaces
        var truncatedTrailingText = trailingText.substring(0, trailingText.length - slice);

        // Set html to the truncated text with the "more" link
        $node.html(truncatedTrailingText + '... ').append($moreLink);

        // All of the remaining text needs to exist in the DOM, but hidden (for SEO)
        var plainText = $(this.allDetailsContent).text();
        var remaining = $.trim(plainText.slice(plainText.indexOf(truncatedTrailingText) + truncatedTrailingText.length));
        $details.append('<div class="m-j-product-details-remaining hide">' + remaining + '</div>');

        allDetailsShowing = false;
      } else {
        // There are 10 or fewer lines, so we can ensure all product details are already showing
        allDetailsShowing = true;
      }

      return false;
    },

    getProductDetailsHeight: function() {
      // Product details height only needs to be calculated once (based on line height and max rows)
      if (!productDetailsHeight) {
        var $details = $('#m-product-details .content');

        // The business requirement is that master products show only one line of description text; members show 10
        var isMaster = $('#m-product-container').hasClass('m-product-master');
        var maxRows = (isMaster) ? (1) : (10);
        var lineHeight = parseInt($details.css('line-height'), 10);

        productDetailsHeight = (maxRows * lineHeight) + 10; // be sure to include margin between bullets and description for edge cases
      }

      return productDetailsHeight;
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
        } else {
          upc.error += 'No color selected. ';
        }
      }

      if (!upc.error && product.sizes) {

        if (product.activeSize) {
          if (upcKey !== -1) {
            upcKey += '-';
          }
          upcKey += product.activeSize;
        } else {
          upc.error += 'No size selected. ';
        }
      }

      if (!upc.error && product.types) {

        if (product.activeType) {
          if (upcKey !== -1) {
            upcKey += '-';
          }
          upcKey += product.activeType;
        } else {
          upc.error += 'No type selected. ';
        }
      }

      if (!upc.error) {
        upc.upcKey = upcKey;
      }

      return upc;
    },

    /**
     * There are several scenarios that could prevent a user from adding a product to their bag:
     *
     *   1) The user has not selected a potentially necessary color, or potentially necessary size
     *   2) The user has attempted to add more than the total allowed for this particular product
     *   3) The user has attempted to add more than the total allowed in the bag
     */
    addToBag: function(e) {
      var $button = $(e.currentTarget);
      var $productWrapper = $button.closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);
      var issues = this.facetsNotSelected(product);
      var eGiftCardParams;

      if (product.isEGC) {
        eGiftCardParams = this.validateGiftCardFields();
        if (!eGiftCardParams) { return false; }
      }

      if (issues.length) {
        this.displayFacetErrors(issues, $productWrapper);
        return false;
      }

      $button.addClass('spinner');

      this.setActiveUpc(product);

      //Pass category id value to the Coremetrics shop5 tag fired from addToBagView.
      var searchContext = this.getCMSearchContext();
      if (searchContext) {
        product.cmCategoryId = searchContext.type;
      } else {
        product.cmCategoryId = this.model.get('requestParams') && this.model.get('requestParams').categoryId ? this.model.get('requestParams').categoryId : this.model.get('activeCategory');
      }

      if (!this.subViews.addToBagView){
        this.subViews.addToBagView = new AddToBagView();
        if (!this.subViews.addToBagView.elementInDOM()) {
          $('body').append(this.subViews.addToBagView.$el);
        }
      }

      var prosChoiceId = App.config.ENV_CONFIG.pros_informant_calls !== 'off' ? $.url().param('choiceId') : undefined;
      this.subViews.addToBagView.show(product, this.model.attributes, $button, eGiftCardParams, prosChoiceId);
    },

    addToRegistry: function(e) {
      var $button = $(e.currentTarget);
      var $productWrapper = $button.closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);
      var issues = this.facetsNotSelected(product);

      if (issues.length) {
        this.displayFacetErrors(issues, $productWrapper);

        return false;
      }

      $button.addClass('spinner');

      if (_.isUndefined(product.categoriesBreadcrumb)) {
        //We need this for analytics
        product.categoriesBreadcrumb = this.model.attributes.categoriesBreadcrumb;
      }

      if (!this.subViews.addToRegistryView){
        this.subViews.addToRegistryView = new AddToRegistryView();
        if (!this.subViews.addToRegistryView.elementInDOM()) {
          $('body').append(this.subViews.addToRegistryView.$el);
        }
      }

      this.subViews.addToRegistryView.invoke(product);
    },

    addToWishlist: function(e) {
      var $button = $(e.currentTarget),
          $productWrapper = $button.closest('.m-product-wrapper'),
          product = this.getProductReference($productWrapper),
          issues = this.facetsNotSelected(product);

      if (issues.length) {
        this.displayFacetErrors(issues, $productWrapper);
        return false;
      }

      $button.addClass('spinner');
      var _this = this;

      if (!this.subViews.addToWishlistView) {
        this.subViews.addToWishlistView = new AddToWishlistView({
          options: { product: product, $button: $button, parentView: _this }
        });
        if (!this.subViews.addToWishlistView.elementInDOM()) {
          $('body').append(this.subViews.addToWishlistView.$el);
        }
      } else {
        this.subViews.addToWishlistView.save();
      }
      this.doWishlistAnalytics();
    },

    facetsNotSelected: function(product) {
      var issues = [];

      for (var i in FACETVALIDATION) {
        if (FACETVALIDATION.hasOwnProperty(i)) {
          var cur = FACETVALIDATION[i];

          if (product[cur.listProperty] && !product[cur.activeProperty]) {
            issues.push(i);
          }
        }
      }

      return issues;
    },

    displayFacetErrors: function(issues, element) {
      var issuesCopy = issues.slice(0),             // Get a copy of the issues array
        last = issues.pop(),                        // Grab the element (`issues` is now one element less)
        ilength = issues.length,                    // Cache `issues.length` since we're going to be using it often
        errorMessage = 'Please select ' +           // Initial part of the error message
          FACETVALIDATION[issuesCopy[0]].article +  // Get the article for the first issue
          ' ' +                                     // I don't know what this line does I think it's magic
          issues.join(', ') +                       // Join the issues together, separated by a comma
          (ilength > 1 ? ',' : '') +                // If there's more than one issue (meaning over 2 issues total), add the Oxford comma (there is no other way)
          (ilength ? ' and ' : '') +                // If there's any issues (meaning over 1 issue total), add and
          last +                                    // Toss the last element on
          '.',                                      // I don't know what this line does either I think it's more magic
        issueElements = $();                        // Empty jQuery object to house issue elements
                                                    // -ekever
      for (var i in FACETVALIDATION) {
        if (FACETVALIDATION.hasOwnProperty(i) && ~issuesCopy.indexOf(i)) {  // If one of the issues is the current `FACETVALIDATION` index
          issueElements = issueElements.add(element.find(FACETVALIDATION[i].selector));   // Add its selector to `issueElements` to highlight
        }                                                                   // -ekever
      }

      issueElements.addClass('m-is-erroneous');

      tooltip(
        issueElements.last(),      // element: Get the last element of the issues array
        errorMessage,              // content: The error message we so magically built
        ilength ? false : 'left',  // arrowPosition: If there's more than one issue, no arrow, otherwise, point to the issue
        0,                         // ttl (time-to-live): Stay on forever
        1                          // marginBottom: padding between the issue element and the arrow
      );                           // -ekever

      this.doErrorCoremetrics (issuesCopy, element, errorMessage);
    },

    doErrorCoremetrics: function(issues, element, errorMessage) {
      for (var j = 0, len = issues.length; j < len; j++){
        if (issues[j] === 'size'){
          var categoryId = this.model.get('requestParams') && this.model.get('requestParams').categoryId ? this.model.get('requestParams').categoryId : this.model.get('activeCategory');
          var product = this.getProductReference(element);
          analytics.triggerTag({
            tagType: 'userErrorTag',
            pageId: 'PRODUCT: ' + product.name + ' (' + product.id + ')',
            categoryId: categoryId,
            msgCode: '902000006',
            msgDesc: errorMessage
          });
        }
      }
    },

    showMoreMembers: function(e) {
      // create a reference to the button that was clicked on
      var $button = $(e.currentTarget);

      // grab the next members to display
      this.model.set('members', allMembers.slice(membersShowing, (membersShowing + MORE_MEMBERS_DISPLAY_COUNT)));

      // Determine how many members are now displaying.
      // max membersShowing is allMemebers.length
      membersShowing = Math.min(allMembers.length, (membersShowing + MORE_MEMBERS_DISPLAY_COUNT));

      // Append the next set of members to the member container
      $button.closest('#m-product-members').find('#m-product-members-of-master').append(TEMPLATE.productMembersOfMaster(this.model.attributes));

      // Check if we need to update button text, or remove the button completely
      if (allMembers.length === membersShowing) {
        // button needs to be removed
        $button.remove();
      } else if (allMembers.length <= (membersShowing + MORE_MEMBERS_DISPLAY_COUNT)) {
        // button text needs to be updated for "view remaining members"
        $button.replaceWith(TEMPLATE.productViewMoreMembers());
      }

      /**
       * There is an issue in iOS where spinner gif is too slow to load when user hits "add to bag" or "add to registry".
       * Because of this, the button appears "blank" for the first time it is tapped, as the gif is still loading.
       * To work around this, we render the buttons initially with the "spinner" class, so that the gif is cached by the browser.
       * We must then remove this class during this phase, to show the button text.
       */
      $('.m-j-product-add-bag,.m-j-product-add-registry').removeClass('spinner');

      this.initializeScrolls();
      this.$el.find('.truncated').dotdotdot();
      this.displayProductAvailability();
    },

    scrollToPriceDetails: function(e) {
      var $priceDetails = $(e.currentTarget).closest('.m-product-wrapper').find('.m-product-prices.tiered:first');
      $(window).scrollTop($priceDetails.offset().top);
    },

    showZoomModal: function(e, triggeredByPopState) {

      if (!this.subViews.zoomModalView.elementInDOM()) {
        $('body').append(this.subViews.zoomModalView.$el);
      }
      var $stateElement = this.getStateElement(e);

      if (!triggeredByPopState) {
        this.pushModalState('showZoomModal', e.currentTarget.id);
      }

      this.subViews.zoomModalView.render();
      this.subViews.zoomModalView.show($stateElement.index());
    },

    //Called from ProductSizeChartHtmlModalView after receiving wssg chart response
    //and deciding based on available data what chart to display
    showImageSizeChart: function(product) {
      var view;
      //If product has image chart
      if (product.sizeCharts){
        //Close htmlChartView if it's already opened
        if (this.subViews.productSizeChartModalView){
          this.subViews.productSizeChartModalView.close();
        }
        view = this.subViews.productSizeChartModalView = new ProductSizeChartModalView({ id: 'm-j-sizechart-modal-container' });
        view.options.sizeCharts = product.sizeCharts;
        view.options.appModel = this.model.get('appModel');
        view.options.categoryId = this.model.get('requestParams').categoryId || this.model.get('activeCategory');
        view.render();
        view.show();
      }
    },
    //Called from ProductSizeChartHtmlModalView after receiving wssg chart response
    //and deciding based on available data what chart to display
    showHtmlSizeChart: function() {
      this.subViews.productSizeChartModalView.render();
      this.subViews.productSizeChartModalView.show();
    },

    showSizeChartModal: function(e, triggeredByPopState) {
      var $stateElement = this.getStateElement(e);

      if (!triggeredByPopState) {
        this.pushModalState('showSizeChartModal', e.currentTarget.id);
      }

      var $productWrapper = $stateElement.closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);

      //If size chart was opened before - close it.
      if (this.subViews.productSizeChartModalView){
        this.subViews.productSizeChartModalView.close();
        this.subViews.productSizeChartModalView.$el.remove();
      }

      if (product.canvasId){
        //Create the view that will initialize the model so we can decide what chart to display
        this.subViews.productSizeChartModalView = new ProductSizeChartHtmlModalView(
          { id: 'm-j-sizechart-modal-container',
            options:
              { id: 'm-j-sizechart-modal-container',
                product: product,
                canvasId: product.canvasId,
                parentView: this
        }});
      } else {
        //display image size chart. otherwise the link will not be displayed
        this.showImageSizeChart(product);
      }

      this.doSizeChartAnalytics(product);
    },

    showShippingReturnsModal: function(e, triggeredByPopState) {
      var view = this.subViews.productShippingReturnsModalView;
      var $stateElement = this.getStateElement(e);

      if (!triggeredByPopState) {
        this.pushModalState('showShippingReturnsModal', e.currentTarget.id);
      }

      var $productWrapper = $stateElement.closest('.m-product-wrapper');

      var product = this.getProductReference($productWrapper);

      view.options.isMaster = product.isMaster;
      view.options.shipping = product.shipping;
      view.options.typeName = product.typeName;

      view.render();
      view.show();

      this.doShippingReturnsAnalytics();
    },

    showRebatesModal: function(e, triggeredByPopState) {
      var view = this.subViews.productRebatesModalView;
      var $stateElement = this.getStateElement(e);

      if (!triggeredByPopState) {
        this.pushModalState('showRebatesModal');
      }

      var $productWrapper = $stateElement.closest('.m-product-wrapper');

      var product = this.getProductReference($productWrapper);

      view.options.rebate = product.rebates[0];

      view.render();
      view.show();

      this.doRebatesAnalytics();
    },

    showSpecialOffersModal: function(e, triggeredByPopState) {
      var $stateElement = this.getStateElement(e);
      var view;

      view = this.subViews.productSpecialOffersModalView;

      if (!triggeredByPopState) {
        this.pushModalState('showSpecialOffersModal', e.currentTarget.id);
      }

      var $productWrapper = $stateElement.closest('.m-product-wrapper');

      var product = this.getProductReference($productWrapper);

      view.options.product = product;

      view.render();
      view.show();

      fewerMore.init();

      this.doOffersAnalytics();
    },

    showBopsModal: function(e, triggeredByPopState, modalShowData) {
      var cmCheckType, product;
      var $stateElement = this.getStateElement(e);
      var view = this.subViews.productBopsModalView;

      if (!triggeredByPopState) {
        var $productWrapper = $stateElement.closest('.m-product-wrapper');
        product = this.getProductReference($productWrapper);
        var store;
        cmCheckType = 'check_availability';

        view.model.set('product', product);

        // Additionally, set the default location for the modal view,
        // if it has been set for the particular product availability view.
        var productAvailabilityView = this.subViews['productAvailabilityView_' + product.id];
        if (productAvailabilityView.model.get('bops')) {

          store = productAvailabilityView.model.get('bops').store;
          if (store) {
            view.model.set('defaultZipCode', store.address.zipCode);
            cmCheckType = 'check_other_stores';
          }
        }

        this.pushModalState('showBopsModal', e.currentTarget.id, {
          product: product,
          store: store
        });

      } else {
        view.model.set(modalShowData);
        if (view.model.get('defaultZipCode')){
          cmCheckType = 'check_other_stores';
        }
      }

      if (product.isFIIS){
        this.doFiisAnalytics();
      } else {
        this.doBopsAnalytics(cmCheckType);
      }

      view.render();
      view.show();

      return false;
    },

    showRulesModal: function(e, triggeredByPopState) {
      if(!this.subViews.rulesModal){
        this.subViews.rulesModal = new RulesModalView({ id: 'm-j-rules-modal-container', className: 'mb-modal-wrapper modal-level-1' });
      }else{
        this.subViews.rulesModal.render();
      }
      var view = this.subViews.rulesModal;
      if (!triggeredByPopState) {
        this.pushModalState('showRulesModal');
      }

      this.subViews.rulesModal.render();
      view.show();

      return false;
    },

    doBopsAnalytics: function(type) {
      analytics.triggerTag({
          tagType: 'conversionEventTagBops',
          eventId: type,
          actionType: '1',
          categoryId: 'bops_pdp',
          points: '0'
      });
    },

    doFiisAnalytics: function() {
      analytics.triggerTag({
          tagType: 'conversionEventTagBops',
          eventId: 'Check Store Availability',
          actionType: '1',
          categoryId: 'Find It In Store',
          points: '0'
      });
    },

    showWarrantyModal: function(e, triggeredByPopState) {
      var view;
      if (this.subViews.productWarrantyModalView) {
        this.subViews.productWarrantyModalView.remove();
      }

      this.subViews.productWarrantyModalView = new ProductWarrantyModalView({ id: 'm-j-warranty-modal-container' });
      view = this.subViews.productWarrantyModalView;

      if (!triggeredByPopState) {
        this.pushModalState('showWarrantyModal');
      }

      view.render();
      view.show();

      return false;
    },

    showReviewsModal: function(e, triggeredByPopState) {

      if (!this.subViews.productReviewsModalView || this.subViews.productReviewsModalView.failed) {
        this.subViews.productReviewsModalView = new ProductReviewsModalView({
          id: 'm-j-reviews-modal-container',
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
      this.doReviewsAnalytics();

      return false;
    },

    showPricingPolicyModal: function(e, triggeredByPopState) {
      var view = this.subViews.productPricingPolicyModalView;

      if (!triggeredByPopState) {
        this.pushModalState('showPricingPolicyModal');
      }

      view.options.model = this.model;
      view.render();
      view.show();

      return false;
    },

    renderTemplate: function() {

      var seo = this.model.get('seo');
      if (seo) {
        this.setPageTitle(seo.title + seo.fobCategory + ' - Macy\'s');
        this.setPageDesc('Shop for ' + seo.desc.cat + ' online at Macys.com. ' + seo.desc.desc);
        this.setShareMetaTags(seo);
      }

      // For master pages without latchkeys, slice only the initial members to display, and store the rest in memory
      var members = this.model.get('members');
      allMembers = _.clone(members);
      if (members && !this.model.get('latchkeys') && (allMembers.length > INITIAL_MEMBER_DISPLAY_COUNT)) {
        membersShowing = INITIAL_MEMBER_DISPLAY_COUNT;
        this.model.set('members', allMembers.slice(0, INITIAL_MEMBER_DISPLAY_COUNT));
        this.model.set('showMoreMembersButton', true);
      }

      this.$el.html(TEMPLATE.product(this.model.attributes));
      this.$el.find('.truncated').dotdotdot();

      this.setCMPageId(this.model.attributes.categoriesBreadcrumb);

      // If we are not deeplinking to PDP, show back button immediately
      if (App.router.isDeepLink()) {
        // deeplink; determine category for product, and wait for nav to complete before rendering button
        var categoryId = this.model.getCategoryId();

        if (categoryId) {

          if ($localStorage.get('gn:categoryIndexLoaded') && App.model.get('categoryIndex')) {
            this.renderBackButton(categoryId);
          } else {
            this.listenTo(Backbone, 'categoryIndexLoaded', _.bind(this.renderBackButton, this, categoryId));
            this.listenTo(Backbone, 'gn:first2levelsLoaded', _.bind(this.renderBackButton, this, categoryId));
          }
        }
      } else {
        // not a deeplink; show back button immediately
        this.$el.find('.m-header-first').html('<div id="m-j-pdp-back" class="m-back">&nbsp;</div>');
      }

      this.doEnableDefaultVideo();

      // Adding Foresee calls
      // Since Foresee is based on number of page views and our app is a single view app, we call
      // manually FSR.run() to increase the page view number. As soon as it reaches out the 2, the
      // Foresse survery pops out.
      FSR.run();
    },

    renderBackButton: function(categoryId) {

      var backButtonUrl, url;
      // We can guarantee the nav has been loaded; grab the URL for this particular categoryId
      if (!isBackButtonRendered) {
        backButtonUrl = App.model.get('categoryIndex').menus[categoryId];
        if (_.isUndefined(backButtonUrl)) {
          isBackButtonRendered = false;
        } else {
          url = backButtonUrl.url;
          this.$el.find('.m-header-first').html('<div class="m-back link"><a href="' + url + '">&nbsp;</a></div>');
          isBackButtonRendered = true;
        }
      }

    },

    displayMessageToast: function(e) {
      var $productWrapper = $(e.currentTarget).closest('.m-product-wrapper');
      var product = this.getProductReference($productWrapper);

      messageToast.displayAvailabilityMessage($(e.currentTarget), product);
    },

    postRender: function() {
      this.initializeScrolls();

      // Fix for header positioning when device is in landscape
      this.listenToOnce(orientation, 'orientationchange', function() {
        var currentPosition = $(window).scrollTop();

        $('html, body').animate({ scrollTop: currentPosition - 15 }, 200);
      });

      //Scroll window to the top of the content header
      if (!App.router.isDeepLink()){
        $('html, body').animate({ scrollTop: $('#mb-content-wrapper').offset().top }, 500);
      }

      if (this.model.get('images')) {
        //Load scene7 zoom library after everything else is done so we are ready
        //to zoom when user clicks on "+"
        require(['http://s7d5.scene7.com/s7sdk/2.5/js/s7sdk/utils/Utils.js'], function() {
          s7sdk.Util.lib.include('s7sdk.image.ZoomView');
          s7sdk.Util.lib.include('s7sdk.common.Container');

          s7sdk.Util.init();

          //Temporary fix for adobe bug that should be fixed in their January dot release.
          //Then this code should be removed.
          s7sdk.Util.getObjPos = function(obj) {
            var x = 0;
            var y = 0;
            var rect = obj.getBoundingClientRect();
            x = rect.left + s7sdk.Util.getScrollXY().x;
            y = rect.top + s7sdk.Util.getScrollXY().y;
            return { x: x, y: y };
          };

        });

        this.postRenderImages();

      }

      // Create a subview for a potential size chart modal. Might be one at top level or member level
      //this.subViews.productSizeChartModalView = new ProductSizeChartModalView({ id: 'm-j-sizechart-modal-container' });

      // Create a subview for a potential shipping and returns modal.
      this.subViews.productShippingReturnsModalView = new ProductShippingReturnsModalView({ id: 'm-j-shippingreturns-modal-container' });

      // Create a subview for a rebates modal.
      this.subViews.productRebatesModalView = new ProductRebatesModalView({ id: 'm-j-rebates-modal-container' });

      // Create a subview for a Special Offers modal.
      this.subViews.productSpecialOffersModalView = new ProductSpecialOffersModalView({ id: 'm-j-specialoffers-modal-container' });

       // Create a subview for a pricing policy modal.
      this.subViews.productPricingPolicyModalView = new ProductPricingPolicyModalView({ id: 'm-j-pricing-policy-modal-container' });

      this.doViewAnalytics();

      //Create invisible fixed header in DOM
      stickyHeader.register(this.$el.find('#m-product-header'));

      this.showFewerProductDetails();

      util.hideLoading();

      this.postRenderGiftCardsFeatues();
      this.postRenderRecommended();
      this.postRenderRecentlyViewed();
      this.displayProductAvailability();

      /**
       * There is an issue in iOS where spinner gif is too slow to load when user hits "add to bag" or "add to registry".
       * Because of this, the button appears "blank" for the first time it is tapped, as the gif is still loading.
       * To work around this, we render the buttons initially with the "spinner" class, so that the gif is cached by the browser.
       * We must then remove this class during this phase, to show the button text.
       */
      $('.m-j-product-add-bag,.m-j-product-add-registry').removeClass('spinner');

      MainContentView.prototype.postRender.call(this);

      this.$el.find('.truncated').dotdotdot({ watch: true });

      Backbone.trigger('pdp:loaded');

      // #27046: Adding user case where the categoryID attribute is not present on the URL
      // In this case, we the PDP call will informe the Global Navigation which is the activeCategory
      // So we can repaint the GN accordingly
      this.updatePDPGlobalNav();
    },

    defineBTDataDictionary: function() {
      var product = this.model.attributes;
      var pageName = product.categoriesBreadcrumb;

      var searchContext = this.getCMSearchContext();

      if (searchContext){
        if (searchContext.type === 'onsite_search' && searchContext.redirect === true){
          pageName = product.name + ' - ' + product.categoriesBreadcrumb;
        }
        BTDataDictionary.setNavigation(pageName, searchContext.type, searchContext.rawKeyword);
      } else {
        pageName = 'PRODUCT: ' + product.name + '(' + product.id + ')';
        BTDataDictionary.setNavigation(pageName, product.id, '');
      }

      var type = 'SINGLE ITEM';
      if (product.isMaster){
        type = 'MASTER';
      } else if (product.masterCollection){
        type = 'MEMBER';
      }
      var categoryId = this.model.get('requestParams').categoryId ? this.model.get('requestParams').categoryId : this.model.get('activeCategory');
      var topCategory = this.model.get('rootCategory'),
          topCategoryId, topCategoryName;
      if (topCategory) {
        topCategoryId = topCategory.id;
        topCategoryName = topCategory.name;
      }

      BTDataDictionary.setProduct(product.id, product.name, type, categoryId, topCategoryId, topCategoryName);
    },

    postRenderImages: function(selectedColor) {
      var allImages = this.model.get('images');
      if (allImages) {
        // Grab the active images from the response
        var images = allImages[this.model.get('activeImageset')];
        this.carousel(images);

        if (this.subViews.zoomModalView){
          this.subViews.zoomModalView.close();
        }

        //If master product and user did not select a color yet - do not show swatches on zoom
        var showSwatches = this.model.get('isMaster') && _.isUndefined(selectedColor) ? false : true;

        this.subViews.zoomModalView = new ZoomModalView({
          id: 'm-j-zoom-container',
          options: {
            images: images,
            initImageIndex: 0,
            showSwatches: showSwatches,
            parentView: this
          }
        });
        //Store the first image in the list of viewed - need for CM
        this.addViewedImage(images[0].image);
      }
    },

    addViewedImage: function(image) {
      var viewed = this.model.get('viewedImages');
      if (!viewed){
        viewed = [];
      }

      viewed.push(image);
      this.model.set('viewedImages', viewed);
    },

    watchVideo: function() {
      var $videoContainer = $('#m-product-video');
      if ($videoContainer.children().length === 0){
        //Setup listener for video ready event
        this.listenTo(Backbone, 'videoready', function() {
          $('#m-video-mask').removeClass('spinner white-30').css('height', '0px');
        });
        //Make TemplateReady callback globally available so BC components
        //can call it. It is exposed to them through the video template
        if (!window.MACYS){
          window.MACYS = {};
        }
        window.MACYS.onTemplateReady = BCvideo.onTemplateReady;

        //Initiate video display
        BCvideo.play($videoContainer, this.model.get('videoId'));
        //Display a spinner until video triggers 'videoready' event
        $('#m-video-mask').addClass('spinner white-30');

        this.doVideoAnalytics();

      } else {
        if (!$videoContainer.hasClass('m-expanded-marker')){
          if (!util.isiOS()){
            BCvideo.pause();
          }
        }
        $videoContainer.toggleClass('m-expanded-marker');
      }
    },

    toggleVideo: function(e) {
      $(e.currentTarget).closest('#m-watch-video').toggleClass('m-video-expanded');
    },

    toggleErrorLabel: function($selector, $error, $delegate) {
      $selector.prev().addClass('m-gift-error-label');
      $error.show();
      $delegate.one('touchstart click', function() {
        $selector.prev().removeClass('m-gift-error-label');
        $error.hide();
        this.giftError = false;
      }.bind(this));
      this.giftError = true;
    },

    validateGiftCardFields: function() {
      var $amount   = this.$('#m-j-gift-card-amount'),
          amount    = $amount.maskMoney('unmasked')[0],
          $email    = this.$('#m-j-gift-card-recipients'),
          to        = this.$('#m-j-gift-card-message-to').val(),
          message   = this.$('#m-j-gift-card-message-text').val(),
          from      = this.$('#m-j-gift-card-message-from').val(),
          result    = { customprice: amount, recipientemail: $email.val() },
          errMsg    = 'Please correct highlighted areas to proceed.',
          $delegate = $('#mb-page-wrapper');

      if (!amount) {
        this.toggleErrorLabel($amount, this.$('#m-j-gift-error-amt-empty'), $delegate);
        tooltip(this.$('label[for=m-j-gift-card-amount]'), errMsg, 0, 0, 10, $delegate);
      } else if (amount < 10 || amount > 1000) {
        if (!this.giftError) { tooltip(this.$('label[for=m-j-gift-card-amount]'), errMsg, 0, 0, 10, $delegate); }
        this.toggleErrorLabel($amount, this.$('#m-j-gift-error-amt-btw'), $delegate);
      }
      if (!$email.val()) {
        if (!this.giftError) { tooltip(this.$('label[for=m-j-gift-card-recipients]'), errMsg, 0, 0, 10, $delegate); }
        this.toggleErrorLabel($email, this.$('#m-j-gift-error-email-empty'), $delegate);
      } else if (!$email[0].checkValidity()) {
        if (!this.giftError) { tooltip(this.$('label[for=m-j-gift-card-recipients]'), errMsg, 0, 0, 10, $delegate); }
        this.toggleErrorLabel($email, this.$('#m-j-gift-error-email-frm'), $delegate);
      }

      if (to) { result.to = to; } // WSSG no likey empty fields
      if (from) { result.from = from; }
      if (message) { result.message = message; }

      return this.giftError ? undefined : result;
    },

    postRenderGiftCardsFeatues: function() {
      var isEGC = this.model.get('isEGC');
      if (isEGC) {
        require(['jquery-maskmoney'], function() {
          this.$el.find('#m-j-gift-card-amount').maskMoney();
        }.bind(this));
      }
    },

    postRenderRecommended: function() {
      this.subViews.productRecommendationsView = new ProductRecommendationsView(this.model);
    },

    postRenderRecentlyViewed: function() {
      this.subViews.recentProductsView = new RecentProductsView({ options: { currentProduct: this.model.attributes.id, parentView: this }});
      var view = this;

      // add the current product
      // template hides it from the recently viewed tab
      this.subViews.recentProductsView.collection.add(view.model.attributes, { at: 0 });
    },

    displayProductAvailability: function() {
      var view = this;
      var productAvailabilityViews = [];

      if (view.model.get('isMaster')) {
        var master = view.model.attributes;

        // For master products, create a new product availability view for each member.
        _.each(master.members, function(product) {
          // If defaults come back from server, no user interactions have occurred, yet a
          // upc may already be ready
          view.setActiveUpc(product);

          var subView = view.subViews['productAvailabilityView_' + product.id];

          // If the view already exists, simply render it
          if (subView) {
            // setActiveUpc() will trigger render(), so nothing to do here
            //subView.render();
          } else {
            view.subViews['productAvailabilityView_' + product.id] = new ProductAvailabilityView({
              id: 'm-j-product-availability-container-' + product.id,

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

        var subView = view.subViews['productAvailabilityView_' + product.id];

        // If the view already exists, simply render it
        if (subView) {
          // setActiveUpc() will trigger render(), so nothing to do here
          //subView.render();
        } else {
          // Create a single product availability view
          view.subViews['productAvailabilityView_' + product.id] = new ProductAvailabilityView({
            id: 'm-j-product-availability-container',

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
    },

    writeProductReview: function(e) {
      var $reviewButton = $(e.currentTarget);

      tooltip(
        $reviewButton,
        'Writing a review is currently unavailable on our mobile site. Please submit reviews on your computer or tablet.',
        'center',
        0,
        1
      );

      return false;
    },

    carousel: function(images) {
      if (images.length) {

        var centered = false;

        if (images.length === 1) {
          centered = true;
          $('#m-j-images-swiper div.swiper-slide').css('padding-right', '0px');
        }

        $('#m-j-images-swiper').swiper({
          slidesPerView: 'auto',
          offsetPxBefore: 10,
          centeredSlides: centered,
          calculateHeight: true,
          updateOnImagesReady: true,
          onSlideChangeEnd: function(swiper) {
            // Shift an image to the right a little to display a slice of image on the left
            if (swiper.activeIndex > 0 && swiper.activeIndex < (images.length - 1)) {
              var x = swiper.getWrapperTranslate('x');
              x += LEFT_PEAK;

              swiper.setWrapperTranslate(x, 0, 0);
            }
          },
          onSlideChangeStart: function(swiper) {
            this.addViewedImage(images[swiper.activeIndex].image);
          }.bind(this)
        });
      }
    },
    popstate: function() {
      this.doAnalyticsPopstate();
      ProductView.prototype.popstate.apply(this, arguments);
    },
    doAnalyticsPopstate: function() {
      var previousRoute = App.router.getRouteHistory(-1);
      if (!this.getShownModal() && previousRoute){
        var trackedRoutes = [
          'shop/:categoryString',
          'shop/:parentCategoryName/:categoryString(/:facetKeys)(/:facetValues)',
          'shop/search(/:facetKeys)(/:facetValues)(?*querystring)'
        ];
        _.each(trackedRoutes, _.bind(function(route) {
          if (route === previousRoute.path){
            this.doBackButtonAnalytics();
          }
        }, this));
      }
    },
    doVideoAnalytics: function() {
      var product = this.model.attributes;
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementId: this.model.attributes.categoriesBreadcrumb,
        elementCategory: 'PDP VIDEO',
        att8: product.id
      });
    },
    doBackButtonAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementId: this.model.attributes.categoriesBreadcrumb,
        elementCategory: 'PDP BACK TO RESULTS'
      });
    },

    doOrderByPhoneAnalytics: function() {
      var product = this.model.attributes;
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementId: product.id,
        elementCategory: 'PDP ORDER BY PHONE'
      });
    },
    doShippingReturnsAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementCategory: 'PDP SHIP RETURN'
      });
    },
    doSizeChartAnalytics: function(product) {
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementCategory: 'PDP SIZE CHART',
        att8: product.id
      });
    },
    doOffersAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementCategory: 'PDP SPEC OFFER'
      });
    },
    doRebatesAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementCategory: 'PDP SPEC OFFER REBATE'
      });
    },
    doReviewsAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementCategory: 'PDP REVIEWS'
      });
    },
    doShareEmailAnalytics: function() {
      var product = this.model.attributes;
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementId: 'share email',
        elementCategory: 'pdpshare',
        att7: product.categoriesBreadcrumb,
        att8: product.id
      });
    },
    doSwatchAnalytics: function(e) {
      var $swatch = $(e.currentTarget);

      // This event callback might have been called for a select element, in which case
      // we don't send the tag
      if ($swatch.prop('tagName') !== 'OPTION') {

        var $productWrapper = $swatch.closest('.m-product-wrapper');

        var product = this.getProductReference($productWrapper);
        var colorId = $swatch.data('id');

        // For products that also have images, we need to display the imageset associated with the color chosen
        if (product.images) {
          var imagesetid = _.find(product.colors, function(color) {
            return color.id === colorId;
          }).imageset;

          var imageSet = product.images[imagesetid];
          var category = 'PDP CLICKABLE SWATCH';
          //If the first image of the imageset has a swatch field
          //it means the image is not colorized
          if (!_.isUndefined(imageSet[0].swatch)){
            category = 'PDP NONCLICKABLE SWATCH';
          }
          analytics.triggerTag({
            tagType: 'pageElementPDPTag',
            elementCategory: category
          });
        }
      }
    },

    doViewAnalytics: function() {
      var product = this.model.attributes;
      var type = 'SINGLE ITEM';
      if (product.isMaster){
        type = 'MASTER | ' + product.id;
      } else if (product.masterCollection){
        type = 'MEMBER';
      }

      var numofAltImages = product.images ? product.images[product.activeImageset].length - 1 : undefined;

      var categoryId = this.model.get('requestParams') && this.model.get('requestParams').categoryId ? this.model.get('requestParams').categoryId : this.model.get('activeCategory');

      //Overwrite categoryId if we got here from search
      var searchCategoryId, searchString, productPosition;
      var searchContext = this.getCMSearchContext();
      if (searchContext) {

        searchCategoryId = searchContext.type;
        //This one is set only for the original redirect browse/spalsh page
        productPosition = this.getCMProductSelectionPosition();

        if (searchContext.type === 'onsite_search_autocomplete'){
          searchString = 'Autocomplete: ' + searchContext.keyword + ' | ac: ' + searchContext.keyword_ac;
        } else {
          searchString = searchContext.keyword;
        }

        if (searchContext.type === 'onsite_search' && searchContext.redirect === true){
          var redirectType = 'Product Page';

          analytics.triggerTag({
            tagType: 'pageViewTag',
            pageId: product.name + ' - ' + product.categoriesBreadcrumb,
            categoryId: searchContext.type,
            searchString: searchContext.keyword,
            att9: redirectType
          });
        }
      }

      //There are additional attributes, but they are stored in Context variables of analyticsData,
      //which are retrieved right before the tag is sent
      analytics.triggerTag({
        tagType: 'productViewTag',
        productID: product.id,
        productName: product.name,
        categoryID: searchCategoryId ? searchCategoryId : categoryId,
        att16: type,
        att17: product.storeOnlyProduct ? 'store_only_product' : '',
        att27: searchString,
        att28: productPosition,
        att31: numofAltImages
      });

     //Reset it - it is not needed after this tag is fired
     // this.setCMProductSelectionPosition(null);
    },

    /**
     * Given a jQuery reference to a product wrapper (a DOM element with the .m-product-wrapper class),
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
      var productId = $productWrapper.data('id');
      var activeLatchkey = this.model.get('activeLatchkey');

      if ($productWrapper.data('member')) {
        return _.find(allMembers, function(product) {
          var productIdMatches = product.id === productId;
          var latchkeyMatches = _.isUndefined(product.latchkeyIds) || product.latchkeyIds[0] === activeLatchkey;

          return productIdMatches && latchkeyMatches;
        });
      }

      return this.model.attributes;
    },

    initializeScrolls: function() {
      this.initializeSwatches();
      this.initializeSizes();
    },
    initializeSwatches: function() {
      this.initializeScrollableWidth('ul.m-swatches-scroll', '.m-j-product-swatch');
      this.scrollSelectedIntoView('ul.m-swatches-scroll', '.m-j-product-swatch');
    },
    initializeSizes: function() {
      this.initializeScrollableWidth('ul.m-sizes-scroll', '.m-j-product-size');
      this.scrollSelectedIntoView('ul.m-sizes-scroll', '.m-j-product-size');
    },

    initializeScrollableWidth: function(scrollableContainerSelector, elementSelector) {
      //Goes though all scrollable lists of the class to set the width
      var $scrollableLists = $(scrollableContainerSelector);

      _.each($scrollableLists, function(list) {

        var width = 0;
        _.each($(list).find(elementSelector), function(elm) {
          width += $(elm).outerWidth(true) + 1;
        });

        $(list).width(width);
      });
    },

    scrollSelectedIntoView: function(scrollableContainerSelector, elementSelector, context) {
      var $scrollableLists;
      if (context) {
        $scrollableLists = context.find(scrollableContainerSelector);
      } else {
        $scrollableLists = $(scrollableContainerSelector);
      }

      //We don't need the exact value here - approximation is fine
      var elementWidth = $(elementSelector).outerWidth(true) + 1;

      _.each($scrollableLists, function(list) {
        //Find the selected element
        var $selectedElement = $(list).find('.selected');
        if ($selectedElement.length){
          var selectedElement = $selectedElement.eq(0);
          //If it is positioned outside of the visible area - scroll it to the left
          if (selectedElement.position().left > $(list).parent().innerWidth() - elementWidth * 2 || $(list).position().left - selectedElement.position().left){
            $(list).parent().scrollLeft(selectedElement.position().left - elementWidth * 1.5);

          }
        }
      });
    },

    close: function() {

      if (carousel) {
        carousel.destroy();
        carousel = null;
      }

      stickyHeader.unregister();
      ProductView.prototype.close.apply(this);

      this.setCMSearchRedirect(false);
      this.setCMProductSelectionPosition(null);
    },

    showWriteReviewModal: function() {
      this.doWriteReviewClickAnalytics();
      ProductView.prototype.showWriteReviewModal.apply(this, arguments);
    },

    doWriteReviewClickAnalytics: function() {
      var product = this.model.attributes;
      analytics.triggerTag({
        tagType: 'writeReview',
        eventId: product.categoriesBreadcrumb,
        actionType: '1',
        categoryId: 'PDP WRITE REVIEW'
      });
    },

    doEnableDefaultVideo: function() {
      /*Story ID: 22653*/
      var enableVideo = this.options.initial;
      if (enableVideo && enableVideo.toLowerCase() === 'video') {
        this.$el.find('#m-video-label').trigger('click');
      }

      if (this.$el.find('#m-watch-video').hasClass('m-video-expanded')) {
        this.listenTo(orientation, 'orientationchange', function() {
          var currentPosition = $(window).scrollTop();
          if (currentPosition < 100) {
            /*
            In Landscape orientation, the video to be appear on the screen. Hence, realligning the scroll position so that
            video is visible on screen.
            */
            if (window.orientation === 90 || window.orientation === -90) {
              $(window).scrollTop($('#m-product-container h1').offset().top);
            }
          }
        });
        if (window.orientation === 90 || window.orientation === -90) {
          $(window).scrollTop($('#m-product-container h1').offset().top);
        }
      }
    },

    shareOverlay: function() {
      if (!this.subViews.shareOverlayView){
        this.subViews.shareOverlayView = new ShareOverlayView({ options: this.model.attributes });
        if (!this.subViews.shareOverlayView.elementInDOM()) {
          $('body').append(this.subViews.shareOverlayView.$el);
        }
      }
      this.subViews.shareOverlayView.show();
    },
    /**
    This META tags are needed for FB and G+ because it crawls the page for the meta details to be shared.
    **/
    setShareMetaTags: function(seo) {
      var imageUrl = '';
      var product = this.model.attributes;
      var imageset = product.activeImageset;
      var $url = $.url();
      var urlPrefix = $url.attr('base');
      var productURL = urlPrefix + product.productUrl;
      if (product.images[imageset]) {
        imageUrl = App.config.paths.product.image + product.images[imageset][0].image;
      }

      $('meta[property="og:type"]').remove();
      $('meta[property="og:title"]').remove();
      $('meta[property="og:descripton"]').remove();
      $('meta[property="og:image"]').remove();
      $('meta[property="og:url"]').remove();
      $('title').after('<meta property="og:type" content="website"/>');
      $('title').after('<meta property="og:title" content="' + seo.title + ' | macys.com' + '" />');
      $('title').after('<meta property="og:descripton" content="' + seo.desc.desc + '" />');
      $('title').after('<meta property="og:image" content="' + imageUrl + '" />');
      $('title').after('<meta property="og:url" content="' + productURL + '" />');
    },

    doWishlistAnalytics: function() {
      var product = this.model.attributes;
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementCategory: "PDP WISHLIST",
        elementId: 'PDP ADD TO WISHLIST',
        att7: product.categoriesBreadcrumb
      });
    }
  });

  Handlebars.registerHelper('productSizeName', function(sizes, activeSize) {
    if (activeSize) {
      return _.find(sizes, function(size) {
        return size.id === activeSize;
      }).name;
    }

    return 'Please select';
  });

  Handlebars.registerHelper('productTypeName', function(types, activeType) {
    if (activeType) {
      return _.find(types, function(type) {
        return type.id === activeType;
      }).name;
    } else if (types.length === 1) {
      return types[0].name;
    }

    return 'Please select';
  });

  // Iterates over promotion object in order to find the promotion of 'BADGE_TEXT' label
  Handlebars.registerHelper('productBadgePromotion', function(promotions, options) {
    var promoBadge;

    _.each(promotions, function(promo) {
      promoBadge = _.find(promo.attr, function(promoAttr) {
        return promoAttr.name === 'BADGE_TEXT';
      });

      return promoBadge && promoBadge.name !== 'BADGE_TEXT';
    });

    return promoBadge ? options.fn(promoBadge) : '';
  });

  Handlebars.registerHelper('productViewMoreMembersText', function() {
    if (allMembers.length > membersShowing) {
      // There are more members available than what are currently displaying
      var remaining = allMembers.length - membersShowing;
      var text = (remaining < MORE_MEMBERS_DISPLAY_COUNT) ? ('View remaining products (' + remaining + ')') : ('View ' + MORE_MEMBERS_DISPLAY_COUNT + ' more');
      return text;
    }

    return '';
  });

  Handlebars.registerHelper('ifProductMemberVisible', function(member, latchkeys, activeLatchkey, index, options) {
    // If there are no latchkeys, only the first INITIAL_MEMBER_DISPLAY_COUNT members are visible, unless allMembersShowing is true
    if (!latchkeys) {
      return options.fn(this);
    }

    // If there are latchkeys, the product member is visible if it is associated with the active latchkey
    if (_.contains((member.latchkeyIds || []), activeLatchkey)) {
      return options.fn(this);
    }

    // This member should not be displayed
    return options.inverse(this);
  });

  Handlebars.registerHelper('productShareEmailLink', function(product) {
    var $url = $.url();
    var urlPrefix = $url.attr('base');
    var ios = util.isiOS();

    var subject = encodeURIComponent(product.name + ' at macys.com!');

    var body = 'Hi! I found this at macys.com and wanted to share with you!' + '\n\n';

    var fullProductUrl = urlPrefix + product.productUrl + '&cm_mmc=email-_-pdpshare-_-n-_-n';

    if (ios) {
      body += '<a href="' + fullProductUrl + '">' + product.name + '</a>\n\n';
    } else {
      body += product.name + '\n\n' + fullProductUrl + '\n\n';
    }

    if (ios) {
      var imageset = product.activeImageset;
      if (product.images[imageset]) {
        body += '<a href="' + fullProductUrl + '"><img src="' + App.config.paths.product.image + product.images[imageset][0].image + '?wid=300" /></a>\n\n';
      }
    }

    var offerText = 'Sign up for exclusive email-only offers and get 15 PERCENT OFF';
    var offerUrl = 'https://prefcenter.email.macys.com/Macyscom/subscribe/Registration.asp?rdn=1500&aff_src=60';

    if (ios) {
      body += '<a href="' + offerUrl + '">' + offerText + '</a>\n\n';
    } else {
      body += offerText + '\n\n' + offerUrl + '\n\n';
    }

    return 'mailto:?subject=' + subject + '&body=' + encodeURIComponent(body);
  });

  // Look if at least of of the member products are onsale
  Handlebars.registerHelper('isAnyMemberOnSale', function(options) {

    if (_.find(allMembers, { onsale: true })) {
      return options.fn(true);
    }

    return false;
  });

  return MCOMProductView;

});
