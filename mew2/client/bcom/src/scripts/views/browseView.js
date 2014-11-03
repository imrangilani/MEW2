define([
  'handlebars',

  // utils
  'util/util',
  'util/transition',

  // Views
  'views/mainContentView',
  'views/_browseView',

  // Analytics
  'analytics/analyticsData',
  'analytics/analyticsTrigger',
  'util/productListWatcher',
  'util/orientation'
], function(Handlebars, util, Transition, MainContentView, BrowseView, analyticsData, analytics, ProductListWatcher, orientation) {
  'use strict';

  var ORIGINAL          = 'original',
      PRICE_LOW_TO_HIGH = 'price-low-high',
      PRICE_HIGH_TO_LOW = 'price-high-low',
      BEST_SELLER       = 'bestseller',
      NEW_ARRIVAL       = 'newarrival',
      PRICE             = 'price',
      ASCENDING         = 'asc',
      DESCENDING        = 'desc',
      EMPTY             = '';

  var boundWindowScroll;

  var BCOMBrowseView = BrowseView.extend({
    events: {
      // When the sort is changed, trigger new request
      'click li.mobileSortButton': 'sortProducts',

      // When the page number changed, trigger new request
      'change select#b-browse-pagination': 'paginate',

      // When pagination left is clicked
      'click #b-browse-paging a.left': 'paginateLeft',

      // When agination right is clicked
      'click #b-browse-paging a.right': 'paginateRight',

      // When filter results is clicked
      'click .b-j-filter-results': 'showFacetListModalView',

      'click div#b-back-to-top': 'backToTop',

      'click span.b-breadcrumb': 'deleteBreadcrumb',

      'click .b-browse-product a': 'setProductPosition',

      'click #b-productlist a': 'transitionToPdp'
    },

    init: function() {
      BrowseView.prototype.init.apply(this, arguments);

      this.initProductListWatcher();

      this.model.on('change:requestParams', this.renderPagination, this);
      this.model.on('change:requestParams', this.renderSortBy, this);
      this.model.on('change:requestParams', this.prepareBreadcrumbValues, this);
      this.listenTo(this.model, 'modelready', function() {
        this.setAnalyticsContext();
      });
    },

    initProductListWatcher: function() {
      this.productListWatcher = new ProductListWatcher({
        containerSelector: '#b-productlist',
        itemSelector: '.b-browse-product',
        itemIdAttrName: 'data-product_id'
      });

      this.listenTo(orientation, 'orientationchange', _.bind(function() {
        this.productListWatcher.scrollToCurrent();
      }, this));

      boundWindowScroll = _.bind(function() {
        this.productListWatcher.update();
      }, this);

      $(window).on('scroll', boundWindowScroll);
    },

    close: function() {
      BrowseView.prototype.close.apply(this, arguments);

      $(window).off('scroll', boundWindowScroll);
    },

    refineProducts: function(facetModalRequestParams) {
      BrowseView.prototype.refineProducts.apply(this, arguments);
      this.triggerFacetSelectionCoremetrics(facetModalRequestParams);
    },

    showFacetListModalView: function(event, triggeredByPopState) {
      if (!triggeredByPopState) {
        this.pushModalState('showFacetListModalView');
      }

      this.subViews.facetListModalView.startFacetSession();
      setTimeout(_.bind(function() {
        this.subViews.facetListModalView.show();
        this.subViews.facetListModalView.render();
      }, this), util.isAndroid() && util.keyboardIsShown ? 200 : 0);

      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Filter Results',
        elementCategory: 'Sort By'
      });
    },

    renderPagination: function() {
      var paginationModel = _.pick(_.clone(this.model.attributes), 'pagination');
      paginationModel.pagination.currentPage = this.model.get('requestParams').currentpage;

      this.$('#b-pagination-container').html(TEMPLATE.pagination(paginationModel));

      return this;
    },

    renderSortBy: function() {
      this.$('.b-header-option').html(TEMPLATE.sortby(_.pick(this.model.attributes, 'requestParams')));

      return this;
    },

    //bcom render passes additional data to the template - pagination
    renderTemplate: function() {
      this.renderSEOTags();
      this.listenTo(this.model, 'allDataAvailable', function() {
        this.renderDataDependent();
        this.setAnalyticsContext();

        // Event announcing that the view has been loaded
        Backbone.trigger('postRender');

        analytics.triggerTag({
          tagType: 'pageViewTag',
          pageId: this.model.get('category').pageId,
          categoryId: this.model.get('category').id
        });
      });
    },

    renderSEOTags: function() {
      var seo = this.model.get('seo');
      if (seo) {
        var titleTag = seo.title,
            metaDesc = seo.desc;

        if(!titleTag) {
          var $url = $.url();
          // Assuming the parent category always exist in the browse page URL
          var parentCategory = $url.attr('path').split('/')[2];
          if (!_.isUndefined(parentCategory)) {
            parentCategory.replace(parentCategory[0], parentCategory[0].toUpperCase());
          } else {
            parentCategory = '';
          }

          titleTag = this.model.get('category').name + ' - ' + parentCategory;

          this.setPageTitle(titleTag + ' | Bloomingdale\'s');
        } else {
          this.setPageTitle(titleTag + ' - Bloomingdale\'s');
        }

        if(!metaDesc) {
          if(seo.title) {
            metaDesc =  'shop online for ' + seo.title + ' with Free Shipping and Free Returns. Bloomingdale\'s like no other store in the world.';
          } else {
            metaDesc = 'Shop online. Bloomingdale\'s. Like no other store in the world.';
          }
        }
        this.setPageDesc(metaDesc);
      }
    },

    // TODO - This method is being called twice when you reach this page navigating
    // through the menu after 'modelready' and 'allDataAvailable' events.
    renderDataDependent: function() {
      $(this.el).html(TEMPLATE.browse(_.extend(this.model.attributes, {
        pagination: this.pagination,
        breadcrumbs: this.breadcrumbs
      })));

      if ($.url().param('modal')) {
        this.showFacetListModalView(false);
      }

      MainContentView.prototype.postRender.apply(this);
    },

    //Initializes pagination data, pagination template partial and a render helper
    initializePagination: function() {
      var _view = this;

      Handlebars.registerHelper('formatPageUrl', function(pageNumber) {
        return _view.preparePageUrl(pageNumber, _view.model ? _view.model.get('requestParams').sortby : undefined);
      });

      this.pagination = this.preparePagination();
    },

    sortProducts: function(event) {
      // Grab user-selected sort value - may be "sortby" or "sortby,sortorder"
      var target = $(event.currentTarget)[0],
          sortby = target.id,
          sortorder,
          cmElementId;

      var currentlyOnPriceSorting = this.model.get('requestParams').sortby === PRICE;

      // Prepare sortBy and sortOrder parameters
      switch(target.id) {
        case ORIGINAL:
          sortby = EMPTY;
          sortorder = EMPTY;
          cmElementId = 'Our Top Picks';
          break;
        case PRICE_LOW_TO_HIGH:
          sortby = PRICE;
          sortorder = currentlyOnPriceSorting ? DESCENDING : ASCENDING;
          cmElementId = currentlyOnPriceSorting ? 'Price high to low' : 'Price low to high';
          break;
        case PRICE_HIGH_TO_LOW:
          sortby = PRICE;
          sortorder = currentlyOnPriceSorting ? ASCENDING : DESCENDING;
          cmElementId = currentlyOnPriceSorting ? 'Price low to high' : 'Price high to low';
          break;
        case BEST_SELLER:
          cmElementId = 'Best Sellers';
          break;
        case NEW_ARRIVAL:
          cmElementId = 'New Arrivals';
          break;
        default:
          sortorder = EMPTY;
          break;
      }

      var requestParams = _.extend(_.clone(this.model.get('requestParams')), {
          sortby: sortby,
          sortorder: sortorder,
          currentpage: 1 // page gets reset to 1 on every sort
        });
      this.model.set('requestParams', requestParams);
      this.model.fetch();
      App.router.navigate(null, { attributes: this.options.dataMap.fromWssg(_.omit(this.model.get('requestParams'), 'show')) });
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: cmElementId,
        elementCategory: 'Faceted Sort By'
      });
    },

    paginate: function() {
      var pageIndex = $('#b-browse-pagination').val();
      if (!_.isUndefined(pageIndex)) {
        pageIndex = Math.floor(pageIndex);

        var requestParams = _.extend(_.clone(this.model.get('requestParams')), {
            currentpage: pageIndex
          });
        this.model.set('requestParams', requestParams);
        this.model.fetch();


        App.router.navigate(null, { attributes: this.options.dataMap.fromWssg(_.omit(this.model.get('requestParams'), 'show')) });

        this.scrollToTop();
      }

      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: this.model.get('category').id + ' - ' + 'JumpTo' + ' - ' + pageIndex,
        elementCategory: 'Pagination'});
    },

    // Prepares parameters to build pagination
    preparePagination: function() {
      var totalProducts  = this.model.get('category').totalproducts;
      var resultsPerPage = this.model.get('resultsperpage');
      var currentPage    = Math.floor(this.model.get('currentpage'));
      var totalPages     = Math.floor(totalProducts / resultsPerPage);
      var pages = {};

      if (totalProducts % resultsPerPage !== 0) {
        ++totalPages;
      }

      pages.currentPage = currentPage;
      pages.totalPages = [];
      for (var i = 0; i < totalPages; i++) {
        pages.totalPages[i] = { number: i + 1 };
      }

      pages.nextPage = currentPage < totalPages ? currentPage + 1 : 1 ;
      pages.previousPage = currentPage - 1 === 0 ? totalPages : currentPage - 1;

      return pages;
    },

    getFacetValues: function() {
      var excludeFromReqParam = ['categoryId','currentpage','resultsperpage','show','sortby','sortorder','zip','radius', 'redirect'];
      return _.omit(this.model.get('requestParams'), excludeFromReqParam);
    },

    // Preapare facet breadcrumb values to be displayed on browse page
    prepareBreadcrumbValues: function() {
      var facetValues = this.getFacetValues();
      var breadcrumbValues = [];
      var i = 0;

      _.each(facetValues, function(value, key) {
        breadcrumbValues[i]               = {};
        breadcrumbValues[i].facetName     = key;
        breadcrumbValues[i++].facetValues = value.split(',').map(function(val) { return decodeURIComponent(val); });
      });

      this.breadcrumbs = breadcrumbValues;
      return this;
    },

    // Delete selected facet value from browse page
    deleteBreadcrumb: function(e) {
      var $breadcrumbValue    = $(e.currentTarget);
      var breadcrumbValue     = $breadcrumbValue.data('breadcrumb-value').toString();
      var facetName           = $breadcrumbValue.data('facet');
      var browseRequestParams = this.model.get('requestParams');
      var facetRequestparams  = this.subViews.facetListModalView.model.get('requestParams');
      var facetSessionParams  = this.subViews.facetListModalView.model.get('facetSessionValues');
      var facetValues     = browseRequestParams[facetName].split(',').map(function(value){
          return value.replace(/%2C/g, ',');
      });

      facetValues = _.without(facetValues, breadcrumbValue);

      if (facetValues.length > 0) {
        browseRequestParams[facetName] = facetValues.toString();
        facetRequestparams[facetName]  = facetValues.toString();
        facetSessionParams[facetName].selected  = facetValues;
      } else {
        delete browseRequestParams[encodeURIComponent(facetName)];
        delete facetRequestparams[encodeURIComponent(facetName)];
        delete facetSessionParams[encodeURIComponent(facetName)];
      }

      this.model.set('requestParams', browseRequestParams);
      this.subViews.facetListModalView.model.set('requestParams', facetRequestparams);
      this.subViews.facetListModalView.model.set('facetSessionValues', facetSessionParams);
      this.subViews.facetListModalView.model.fetch();

      this.prepareBreadcrumbValues();
      this.model.fetch();
      App.router.navigate(null, { attributes: this.options.dataMap.fromWssg(_.omit(browseRequestParams, 'show')) });
    },

    setProductPosition: function(e) {
      // This value will be used by CM on PDP
      var pos = $(e.target).closest('li.b-browse-product').data('position') + 1;
      analyticsData.setCMProductSelectionPosition(pos);
    },

    setAnalyticsContext: function() {
      // Set global CM values used by multiple tags here and on PDP
      analyticsData.setCMPageId(this.model.attributes.category.pageId);
      analyticsData.setCMPanelType('BROWSE');

      analyticsData.setCMBrowseContext({
        totalProducts: this.model.get('category').totalproducts,
        pageNumber: this.model.get('currentpage')
      });

      analyticsData.setCMProductSelectionContext(this.subViews.facetListModalView.getAnalyticsFacetsContext());
      analyticsData.setCMProductSelectionPosition(undefined);
      analyticsData.setCMShopByBrandFlow(false);
    },

    transitionToPdp: function(e) {
      var view = this;

      this.updateBopsFacetStore();

      // Custom animation before the transition
      var beforeTransition = function($transitionContainer, $transitionWrapper) {
        var $productImage = $(e.currentTarget).closest('.b-browse-product').find('.b-browse-img');
        var productImagePosition = $productImage.position();
        var $productImageClone = $productImage.clone().css({
          position: 'absolute',
          top: productImagePosition.top,
          left: productImagePosition.left,
          width: $productImage.width(),
          transition: 'all',
          transitionDuration: '500ms',
          transitionTimingFunction: 'ease'
        }).appendTo($transitionWrapper);
        // Fades out the cloned content
        $transitionContainer.fadeOut('slow');
        view.animateProductImage($transitionWrapper, $productImageClone, productImagePosition);
      };

      // Custom animation when returning from PDP
      var beforeReverseTransition = function($transitionContainer) {
        function getProductImageCopy() {
          // gets the position of the copy of the product image
          var $productImagesContainer = $transitionContainer.find('#b-pdp-images-wrapper');
          var $productImage = $productImagesContainer.find('.swiper-slide-active > .b-pdp-image');
          var imagePosition = $productImagesContainer.position();

          // creates a new copy of the image and positions it at the same exact place
          var $productImageCopy = $productImage.clone().css({
            position: 'absolute',
            top: imagePosition.top,
            left: imagePosition.left,
            width: $productImage.width(),
            transition: 'all',
            transitionDuration: '500ms',
            transitionTimingFunction: 'ease'
          });

          // hides the original one so that we don't see it fading out
          $productImage.css({
            visibility: 'hidden'
          });
          return $productImageCopy;
        }

        function animateProductImage($container, $productImageCopy) {
          // puts the copied image in the DOM and animates it
          $productImageCopy.appendTo($container);

          setTimeout(function() {
            $productImageCopy.css({
              transform: 'scale3d(0.5,0.5,1)',
              opacity: 0
            });
          }, 10);
        }

        // if can't find $productImagesContainer, this animation shouldn't have been triggered.
        if ($transitionContainer.find('#b-pdp-images-wrapper').length === 0) {
          return;
        }

        var $productImageCopy = getProductImageCopy();
        animateProductImage($transitionContainer, $productImageCopy);
      };

      // Custom animation after returning from PDP
      var afterReverseTransition = function () {
        var productId = $(e.currentTarget).parents('.b-browse-product').data('product_id');
        var $productInBrowse = $(view.el).find('[data-product_id="' + productId + '"]');
        if ($productInBrowse.length > 0) {
          $productInBrowse.addClass('highlighted');
          $('html, body').animate({ scrollTop: $productInBrowse.position().top }, 300, 'swing', function() {
            $productInBrowse.removeClass('highlighted');
          });
        }
      };

      // Create the transition, set custom animations and add it to the router
      var transition = new Transition('fade');
      transition.on('beforeTransition', beforeTransition);
      transition.on('beforeReverseTransition', beforeReverseTransition);
      transition.on('afterReverseTransition', afterReverseTransition);
      App.transitions.set(transition);
    },

    triggerFacetSelectionCoremetrics: function(facetModalRequestParams) {
      var categoryId = this.model.get('category').id;

      // get the search keyword map used for facet selection in facet search modal
      var map = analyticsData.getCMDesignerFacetKeywordMap();

      _.each(_.keys(facetModalRequestParams), function(name) {
        var values = facetModalRequestParams[name].split(',');

        _.each(values, function(value) {
          var attributes = {};

          // Check if its a Designer facets and user searched for a keyword
          if (name === 'BRAND') {
            _.each(map, function(facetValue, key) {
              // Check if the facet is in the map of the facet search modal
              if (facetValue === value) {
                attributes[26] = key;
              }
            });
          }

          analytics.triggerTag({
            tagType: 'pageElementTag',
            elementId: categoryId + ' - ' + name + ' - ' + value,
            elementCategory: 'Facet selection/deselection',
            attributes: attributes
          });
        });
      });
    },

    animateProductImage: function($container, $productImageCopy, productImagePosition) {
      // Calculates the animation effect
      // Basically move the image copy to the exact center and scale it up
      var overlayBorderX = 15,
          overlayBorderY = 0;

      var overlayContainerWidth = $container.width() - 2 * overlayBorderX;

      var imageWidth = $productImageCopy.width(),
          imageHeight = $productImageCopy.height();

      var scaleFactor = overlayContainerWidth / imageWidth;

      // Calculating final x and y positions before scaling
      var xPos = ((overlayContainerWidth - imageWidth) / 2) - productImagePosition.left + overlayBorderX,
          yPos = 62 + (((imageHeight * scaleFactor) - imageHeight) / 2) - productImagePosition.top + overlayBorderY;

      // We use translate3d and scale3d because they are hardware accelerated
      $productImageCopy.css({
        transform: 'translate3d(' + xPos + 'px,' + yPos + 'px,0px) scale3d(' + scaleFactor + ',' + scaleFactor + ',1)'
      });
    },

    backToTop: function() {
      this.scrollToTop();
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: this.model.attributes.category.pageId,
        elementCategory: 'Back to Top'});
    },

    paginateLeft: function() {
      this.scrollToTop();
      this.doPaginateAnalytics();
    },

    paginateRight: function() {
      this.scrollToTop();
      this.doPaginateAnalytics();
    },

    doPaginateAnalytics: function() {
      var facetValues = this.getFacetValues(),
          facetType,
          facetName;

      if (_.isEmpty(facetValues)) {
        facetType = 'None';
        facetName = 'No Facet';
      } else {
        facetType = _.last(_.keys(facetValues));
        facetName = _.last(_.values(facetValues));
      }

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: this.model.get('category').id + ' - ' + facetType + ' - ' + facetName,
        elementCategory: 'Pagination'});
    },

    setCanonical: function() {
      var $url = $.url();
      var host = $url.attr('host');

      if (host.indexOf('bloomingdales.fds.com') !== -1) {
        host = host.replace('m2qa1.', 'www1.').replace('m.', 'www1.');
      }
      else {
        host = 'www1.bloomingdales.com';
      }

      var relativePath = $url.attr('relative');

      /**
       * Since this model deals with facets, make the canonical URL only include the
       * base category URL. This is an interim solution until #18768 is played in R2
       */
      relativePath = '/' + $url.segment(1) + '/' + $url.segment(2);

      // If this url has both parent category and category, ensure full URL
      // If has both segment 3 and 4, then we have facets. ignore
      if ($url.segment(3) && !$url.segment(4)) {
        relativePath += '/' + $url.segment(3);
      }

      // From query string, include ID / keyword but no other params
      // Assumes either ID (browse) or keyword (Search), not both
      var id = $url.param('id');
      var keyword = $url.param('keyword');
      if (id || keyword) {
        relativePath += '?';
        if (id) {
          relativePath += 'id=' + id;
        }
        else if (keyword) {
          relativePath += 'keyword=' + keyword;
        }
      }

      var canonical = $url.attr('protocol') + '://' + host + relativePath;

      $('link[rel=canonical]').remove();
      $('title').after('<link rel="canonical" href="' + canonical + '" />');
    }

  });

  return BCOMBrowseView;
});
