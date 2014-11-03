define([
  // Models
  'models/facetListModalModel',

  // Views
  'views/_searchResultsView',
  'views/facetListModalView',
  'views/browseView',

  // Analytics
  'analytics/analyticsTrigger',
  'analytics/analyticsData',

  // Util
  'util/transition',
  'util/multiValueCookie',
  'util/productListWatcher',
  'util/orientation',
  'util/util'
], function(FacetListModalModel, SearchResultsView, FacetListModalView, BrowseView, analytics,
            analyticsData, Transition, mvCookie, ProductListWatcher, orientation, util) {
  'use strict';

  var boundWindowScroll;

  var BCOMSearchResultsView = SearchResultsView.extend({

    events: _.extend(_.clone(SearchResultsView.prototype.events), {
      // When the sort is changed, trigger new request
      'click li.mobileSortButton': 'sortProducts',

      // When the page number changed, trigger new request
      'change select#b-browse-pagination': 'paginate',

      // when clicked on facet-X on the results page
      'click span.b-breadcrumb': 'deleteBreadcrumb',

      // When pagination left is clicked
      'click #b-search-paging a.left': 'paginateLeft',

      // When pagination right is clicked
      'click #b-search-paging a.right': 'paginateRight',

      // When the back-to-top is clicked, scroll to the top of the page
      'click div#b-back-to-top': 'backToTop',

      // When click on a product, animate to PDP
      'click #b-productlist a': 'transitionToPdp',

      // When a product is clicked, we need to keep it's position for coremetrics purposes on the PDP
      'click .b-browse-product a': 'setProductPosition',

      // Zero results page latch key listeners
      'click .b-search-latchkeys .b-j-product-latchkey:not(.selected)': 'setActiveLatchkey'
    }),

    init: function() {
      SearchResultsView.prototype.init.call(this);

      this.initProductListWatcher();

      // Store the previous pageId before  we reset analytics context
      var previousPageId = analyticsData.getCMPageId();
      this.resetAnalyticsContext();

      this.listenTo(this.model, 'change:requestParams', this.renderSortBy);
      this.listenTo(this.model, 'modelready', function() {

        if (this.model.get('products')) {
          this.initializePagination(this.model.attributes);
          this.prepareBreadcrumbValues();

          if (!this.subViews.facetListModalView) {
            // Build request params for the facet list modal by omitting non-facet requestParams
            var requestParams = _.clone(_.omit(this.model.get('requestParams'), this.nonFacetKeys));

            requestParams = _.extend(requestParams, {
              // The request REQUIRES the 'searchphrase' parameter to be set, even if we are only
              // requesting products and not search results
              searchphrase: this.model.get('requestParams').searchphrase,
              zip: this.model.get('requestParams').zip,
              facetexpandall: true
            });

            if (!requestParams.zip) {
              delete requestParams.zip;
            }

            this.subViews.facetListModalView = new FacetListModalView({
              model: new FacetListModalModel({
                context: 'search',
                facets: this.model.get('facets'),
                requestParams: _.clone(requestParams)
              })
            });

            this.listenTo(this.subViews.facetListModalView.model, 'refineProducts', this.refineProducts);
          }
        }

        this.render();
        this.setAnalyticsContext();
      });

      this.model.on('change:requestParams', this.prepareBreadcrumbValues, this);

      this.listenTo(this.model, 'fetchError', function() {
        this.resetAnalyticsContext();
      });

      this.listenToOnce(this.model, 'modelready', function() {
        var totalProdCount = this.model.get('totalproducts'),
            isAutocomplete = !_.isUndefined(analyticsData.getCMAutocompleteKeyword()),
            cmPageID       = (totalProdCount) ?  (isAutocomplete ? 'search_results_autocomplete' : 'search_results') : 'no_results',
            searchKeyword  = (this.options.isDesignerIndexResults ? 'DI_' : '') + this.model.get('requestParams').searchphrase,
            totalProducts  = (totalProdCount) ? totalProdCount : 0;

        var tag = {
          tagType: 'pageViewTag',
          pageId: cmPageID,
          categoryId: 'onsite_search',
          searchString: searchKeyword,
          searchResults: totalProducts,
          attributes: {}
        };

        if (isAutocomplete) {
          tag.attributes[8] = analyticsData.getCMAutocompleteKeyword();
        }

        // Fill attribute 26 with the previous pageId (Mingle #21997)
        tag.attributes[26] = previousPageId;

        analyticsData.setCMPageId(cmPageID);
        analytics.triggerTag(tag);
      });

      this.model.fetch();
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
      SearchResultsView.prototype.close.apply(this, arguments);

      $(window).off('scroll', boundWindowScroll);
    },

    refineProducts: function(facetModalRequestParams) {
      SearchResultsView.prototype.refineProducts.apply(this, arguments);
      this.triggerFacetSelectionCoremetrics(facetModalRequestParams);
    },

    filterResults: function() {
      this.showFacetListModalView();
      this.fireFilterResultsTag();
    },

    fireFilterResultsTag: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Filter Results',
        elementCategory: 'Sort By'
      });
    },

    triggerFacetSelectionCoremetrics: function(selectedFacets) {
      var keyword = analyticsData.getCMDesignerFacetSearch(),
          attributes = {};

      // Remove some non-facets values like `zip` parameter from BOPS facet
      selectedFacets = _.omit(selectedFacets, this.nonFacetKeys);

      if (!_.isEmpty(selectedFacets)) {

        _.each(_.keys(selectedFacets), function(name) {
          var values = selectedFacets[name].split(',');

          _.each(values, function(value, valueIndex) {
            // Check if its a Designer facets and user searched for a keyword and
            // only put the keyword in context if its the last facet selected
            if (name === 'BRAND' && !_.isUndefined(keyword) && (valueIndex === values.length - 1)) {
              attributes[26] = keyword;
            }

            var cmCategoryId = 'undefined' + ' - ' + name + ' - ' + value;
            analytics.triggerTag({
              tagType: 'pageElementTag',
              elementId: cmCategoryId,
              elementCategory: 'Faceted Navigation',
              attributes: attributes
            });
          });
        });

      } else {
        analytics.triggerTag({
          tagType: 'pageElementTag',
          elementId: 'undefined - None - No Facet',
          elementCategory: 'Faceted Navigation'
        });
      }
    },

    renderSortBy: function() {
      this.$('.b-header-option').html(TEMPLATE.searchSortby(_.pick(this.model.attributes, 'requestParams')));
      return this;
    },

    renderTemplate: function() {
      $(this.el).html(TEMPLATE.searchResultsPage(_.extend(this.model.attributes, {
        pagination: this.pagination,
        breadcrumbs: this.breadcrumbs
      })));

      $(this.el).find('#b-search-results').html(TEMPLATE.searchResultsList(this.model.attributes));

      if (this.pagination) {
        var paginationModel = _.pick(_.clone(this.model.attributes), 'pagination');
        paginationModel.pagination  = this.pagination;
        if (this.model.get('totalproducts') > this.model.get('requestParams').perpage){
          $(this.el).find('#b-search-paging').html(TEMPLATE.pagination(paginationModel));
        }
      }

      this.setPageTitle(this.model.get('requestParams').searchphrase + ' | Bloomingdales\'s');
      this.setPageDesc('Shop for and buy ' + this.model.get('requestParams').searchphrase + ' online at Bloomingdale\'s. Find ' + this.model.get('requestParams').searchphrase + ' at Bloomingdale\'s');

      $(this.el).find('.truncated').dotdotdot();
      Backbone.trigger('postRender');
    },

    //Initializes pagination data, pagination template partial and a render helper
    initializePagination: function() {
      var _view = this;

      Handlebars.registerHelper('formatPageUrl', function(pageNumber) {
        return _view.preparePageUrl(pageNumber, _view.model ? _view.model.get('requestParams').sortorderby : undefined);
      });

      this.pagination = this.preparePagination();
    },

    //prepares parameters to build pagination
    preparePagination: function() {
      var totalProducts  = this.model.get('totalproducts');
      var resultsPerPage = Math.floor(this.model.get('requestParams').perpage);
      var currentPage    = Math.floor(this.model.get('requestParams').page);
      var totalPages     = Math.floor(totalProducts / resultsPerPage);
      var pages = {};

      if (totalProducts % resultsPerPage !== 0) {
        ++totalPages;
      }

      pages.currentPage = currentPage;
      pages.totalPages = [];
      for (var i = 0; i < totalPages; i++) {
        pages.totalPages[i] = {
          number: i + 1
        };
      }

      pages.nextPage = currentPage < totalPages ? currentPage + 1 : 1 ;
      pages.previousPage = currentPage - 1 === 0 ? totalPages : currentPage - 1;

      return pages;
    },

    paginate: function() {
      var pageIndex = $('#b-browse-pagination').val();
      if (!_.isUndefined(pageIndex)) {
        pageIndex = Math.floor(pageIndex);

        var requestParams = _.extend(_.clone(this.model.get('requestParams')), {
            page: pageIndex
          });
        this.model.set('requestParams', requestParams);
        this.model.fetch();


        App.router.navigate(null, { attributes: this.dataMap.fromWssg(_.omit(this.model.get('requestParams'), 'show', 'facetexpandall')) });

        this.scrollToTop();
      }

      // Coremetrics
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'onsite_search' + ' - ' + 'JumpTo' + ' - ' + pageIndex,
        elementCategory: 'Pagination'
      });
    },

    sortProducts: function(event) {
      var target = $(event.currentTarget)[0],
          sortby = target.id.replace(/\s+/g, ''),
          sortbyVal = this.model.get('requestParams').sortorderby,
          currentlyOnPriceSorting = sortbyVal === 'PRICE_ASCENDING' || sortbyVal === 'PRICE_DESCENDING',
          cmElementId;

      switch (target.id) {
        case 'PRICE_ASCENDING':
          sortby =  currentlyOnPriceSorting ? 'PRICE_DESCENDING' : 'PRICE_ASCENDING';
          cmElementId = currentlyOnPriceSorting ? 'Price high to low' : 'Price low to high';
          break;
        case 'PRICE_DESCENDING':
          sortby =  currentlyOnPriceSorting ? 'PRICE_ASCENDING' : 'PRICE_DESCENDING';
          cmElementId = currentlyOnPriceSorting ? 'Price low to high' : 'Price high to low';
          break;
        case 'BEST_SELLERS':
          cmElementId = 'Best Sellers';
          break;
        case 'NEWNESS':
          cmElementId = 'New Arrivals';
          break;
        default:
          cmElementId = 'Our Top Picks';
          break;
      }

      var requestParams = _.extend(_.clone(this.model.get('requestParams')), {
            sortorderby: sortby,
            // page gets reset to 1 on every sort
            page: 1
          });

      this.model.set('requestParams', requestParams);
      this.model.fetch();
      App.router.navigate(null, { attributes: this.dataMap.fromWssg(_.omit(this.model.get('requestParams'), this.nonUrlKeys)) });
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: cmElementId,
        elementCategory: 'Sort By'
      });
    },

    // Scroll to top of the page
    scrollToTop: function(callback) {
      $('html, body').animate({ scrollTop: 0 }, 'slow', function() {
        if ($.isFunction(callback)) {
          callback();
        }
      });
    },

    getFacetValues: function() {
      var excludeFromReqParam = ['searchphrase','facetexpandall','page','currentpage','perpage','show','sortorderby','zip','radius'];
      return _.omit(this.model.get('requestParams'), excludeFromReqParam);
    },

    // Preapare facet breadcrumb values to be displayed on browse page
    prepareBreadcrumbValues: function() {
      BrowseView.prototype.prepareBreadcrumbValues.apply(this, arguments);
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

      this.prepareBreadcrumbValues();
      this.model.fetch();

      App.router.navigate(null, { attributes: this.dataMap.fromWssg(_.omit(browseRequestParams, this.nonUrlKeys)) });
    },

    resetAnalyticsContext: function() {
      analyticsData.setCMProductSelectionPosition(undefined);
      analyticsData.setCMBrowseContext(undefined);
      analyticsData.setCMProductSelectionContext(undefined);
    },

    setAnalyticsContext: function() {
      //Set global CM values used by multiple tags here and on PDP
      analyticsData.setCMBrowseContext({
        totalProducts: this.model.get('totalproducts') || 0,
        pageNumber: this.model.get('requestParams').page || 1
      });

      if (this.subViews.facetListModalView) {
        analyticsData.setCMProductSelectionContext(this.subViews.facetListModalView.getAnalyticsFacetsContext());
        analyticsData.setCMProductSelectionPosition(undefined);
      }
    },

    setProductPosition: function(e) {
      //This value will be used by CM on PDP
      var pos = $(e.target).closest('li.b-browse-product').data('position') + 1;
      analyticsData.setCMProductSelectionPosition(pos);
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
        $transitionContainer.fadeOut('fast');
        view.animateProductImage($transitionWrapper, $productImageClone, productImagePosition);
      };

      // Custom animation when returning from PDP
      var beforeReverseTransition = function ($transitionContainer) {
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
        var $productInSearch = $(view.el).find('[data-product_id="' + productId + '"]');
        $productInSearch.addClass('highlighted');
        $('html, body').animate({ scrollTop: $productInSearch.position().top}, 300, 'swing', function () {
          $productInSearch.removeClass('highlighted');
        });
      };

      // Create the transition, set custom animations and add it to the router
      var transition = new Transition('fade');
      transition.on('beforeTransition', beforeTransition);
      transition.on('beforeReverseTransition', beforeReverseTransition);
      transition.on('afterReverseTransition', afterReverseTransition);
      App.transitions.set(transition);
    },

    setActiveLatchkey: function() {
      $('.b-search-latchkeys .b-j-product-latchkey').toggleClass('selected');
      $('#b-featured-categories').toggleClass('selectedLatchKey');
      $('#b-featured-desginers').toggleClass('selectedLatchKey');
    },

    animateProductImage: function($container, $productImageCopy, productImagePosition) {

      // calculates the animation effect
      // we basically move the image copy to the exact center and scale it up
      var overlay_borderX = 15,
          overlay_borderY = 0;

      var overlay_container_width = $container.width() - 2 * overlay_borderX;

      var image_width = $productImageCopy.width(),
          image_height = $productImageCopy.height();

      var scale_factor = overlay_container_width / image_width;

      //calculating final x and y positions before scaling
      var x_pos = ((overlay_container_width - image_width) / 2) - productImagePosition.left + overlay_borderX,
          y_pos = 70 + (((image_height * scale_factor) - image_height) / 2) - productImagePosition.top + overlay_borderY;

      // we use translate3d and scale3d because they are hardware accelerated
      $productImageCopy.css({
        transform: 'translate3d(' + x_pos + 'px,' + y_pos + 'px,0px) scale3d(' + scale_factor + ',' + scale_factor + ',1)'
      });
    },

    backToTop: function() {
      this.scrollToTop();
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: analyticsData.getCMPageId(),
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
        elementId: 'onsite_search' + ' - ' + facetType + ' - ' + facetName,
        elementCategory: 'Pagination'});
    },

    setCanonical: function() {
      BrowseView.prototype.setCanonical.apply(this, arguments);
    }

  });

  return BCOMSearchResultsView;
});
