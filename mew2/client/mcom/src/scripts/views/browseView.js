define([
  // Utilities
  'util/util',
  'util/pagination',
  'analytics/analyticsTrigger',
  'util/orientation',
  'util/BTDataDictionary',
  // Views
  'views/_browseView',
  'views/productPoolView',
  'util/crossBrowserHeight',
  'util/stickyHeader',
  'foresee/foresee-trigger'
], function(util, paginator, analytics, orientation, BTDataDictionary, BrowseView, ProductPoolView, crossBrowserHeight, stickyHeader, FSR) {
  'use strict';

  var MCOMBrowseView = BrowseView.extend({
    events: {
      // When the sort is changed, trigger new request
      'change select#m-browse-select-sortby': 'sort',
      // When paging is used, jump to the top of the container
      'click #m-browse-paging a': 'scrollToTop',
      'click #m-browse-buttons-filterby': 'showFacetListModalView',
      'click #m-browse-results-list': 'setCMProductPosition',
      'click .m-product-grid-anchor': 'updateBopsFacetStore'
    },

    init: function(data) {
      BrowseView.prototype.init.call(this, data);
      this.listenTo(orientation, 'orientationchange', function() {
        this.$el.find('.m-header-truncated').dotdotdot({ watch: true });
      });

      this.listenTo(this.model, 'allDataAvailable', function() {
        this.setAnalyticsContext();
        this.doViewAnalytics();
      });

      this.listenTo(this.model, 'modelready', function() {
        this.setAnalyticsContext();
      });

    },

    setCanonical: function() {
      var $url = $.url();
      var host = $url.attr('host');

      if (host.indexOf('codemacys') !== -1) {
        host = host.replace('m2qa1.', 'www1.').replace('m.', 'www1.');
      } else {
        host = 'www1.macys.com';
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
        } else if (keyword) {
          relativePath += 'keyword=' + keyword;
        }
      }

      var canonical = $url.attr('protocol') + '://' + host + relativePath;

      $('link[rel=canonical]').remove();
      $('title').after('<link rel="canonical" href="' + canonical + '" />');
    },

    prepareBreadcrumbValues: function() { return; },

    // Remove window scroll listener when view is closed
    close: function() {
      $(window).off('.browse');
      BrowseView.prototype.close.apply(this, arguments);
      stickyHeader.unregister();
    },

    sort: function(e) {
      // Grab user-selected sort value - may be "sortby" or "sortby,sortorder"
      var sorts = $('#m-browse-select-sortby').val().split(','),
          sortby = sorts[0],
          sortorder;

      if (sorts.length === 2) {
        // This sort also has a sort order
        sortorder = sorts[1];
      } else {
        sortorder = null;
      }

      var requestParams = _.extend(this.model.get('requestParams'), {
        sortby: sortby,
        sortorder: sortorder,
        currentpage: 1 // reset page on sort
      });

      /**
       * In Android native browser, there is a bug that prevents select from being closed automatically after sort,
       * due to the fact that the select element is removed from the page and re-rendered.
       * blur() will force the select element in Android native browser to close.
       */
      $(e.currentTarget).blur();

      this.model.set('requestParams', requestParams);
      this.model.fetch();
      App.router.navigate(null, { attributes: this.options.dataMap.fromWssg(_.omit(this.model.get('requestParams'), 'show')) });

      var category = this.model.get('category'),
          selectedValue = $('#m-browse-select-sortby>option:selected').html();

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: selectedValue,
        elementCategory: 'Faceted Sort By',
        att1: category.pageId
      });

      this.scrollToTop();
    },

    // When the modal animates into view, begin by scrolling the window to the top
    scrollToTop: function() {
      $('body').animate({ scrollTop: $('#mb-content-wrapper').offset().top }, 500);
    },

    /**
     * Shows facet list modal view
     * @param  {Object} event
     * @param  {Boolean} triggeredByPopState If specified as true, push state
     */
    showFacetListModalView: function(event, triggeredByPopState) {
      if (!triggeredByPopState) {
        this.pushModalState('showFacetListModalView');
      }

      this.subViews.facetListModalView.startFacetSession();

      // Delay Android to allow browser chrome to disappear
      setTimeout(_.bind(function() {
        crossBrowserHeight.updateHeight();
        this.subViews.facetListModalView.show();
        this.subViews.facetListModalView.render();
      }, this), util.isAndroid() && util.keyboardIsShown ? 200 : 0);
    },

    //Initializes pagination data, pagination template partial and a render helper
    initializePagination: function() {

      Handlebars.registerHelper('formatPageUrl', function(pageNumber) {
        return this.preparePageUrl(pageNumber);
      }.bind(this));

      this.pagination = paginator.prepare(this.model.get('category').totalproducts, this.model.get('currentpage'));
    },

    //mcom render passes additional data to the template - pagination
    renderTemplate: function() {
      var seo = this.model.get('seo');

      if (seo) {
        var titleTag = this.model.get('seo').title;
        if (!titleTag) {
           titleTag = this.model.get('category').name;
        }
        this.setPageTitle(titleTag + ' - Macy\'s');
        this.setPageDesc(this.model.get('seo').desc);
      }

      $(this.el).html(TEMPLATE.browse(this.model.attributes));

      this.listenTo(this.model, 'allDataAvailable', this.renderDataDependent);

      stickyHeader.register(this.$el.find('.m-browse-nav'));

      // Adding Foresee calls
      // Since Foresee is based on number of page views and our app is a single view app, we call
      // manually FSR.run() to increase the page view number. As soon as it reaches out the 2, the
      // Foresse survery pops out.
      FSR.run();
    },

    renderDataDependent: function() {
      $(this.el).find('#m-browse-totalproducts').html(TEMPLATE.totalProducts(this.model.attributes.category));
      $(this.el).find('#m-browse-results').html(TEMPLATE.browseResults(this.model.attributes));
      $(this.el).find('.truncated').dotdotdot();
      $(this.el).find('.m-header-truncated').dotdotdot();

      if (this.pagination && this.pagination.tokenList.length !== 0) {
        $(this.el).find('#m-browse-paging').show().html(TEMPLATE.pagination(this.pagination));
      } else {
        this.$el.find('#m-browse-paging').hide();
      }

      // Check if we are on page 1 and default sort, with no facets applied
      var requestParams = this.model.get('requestParams'),
          currentpage = parseInt(requestParams.currentpage),
          // Create an object of all params but the default, to check for facets
          remainingParams = _.omit(requestParams, ['categoryId', 'currentpage', 'resultsperpage', 'show']);

      // In case we revert sorting back to default state, we should rebuild the remainingParams so we have only
      // the facet one. Once the user sorts the products, the sortby and sortorder are always present in the object
      if (remainingParams.sortby === '') {
        remainingParams = _.omit(requestParams, ['categoryId', 'currentpage', 'resultsperpage', 'show', 'sortby', 'sortorder']);
      }

      // Checks if we still have parameters. If so, it's because a Facet is selected and we should hide the product pool
      if (_.isEmpty(remainingParams)) {
        // Checks if we are in the first page of browse
        if (currentpage === 1 || _.isNaN(currentpage)) {
          // Checks if we have a product pool to be displayed
          if (this.model.attributes.productpool.length) {
            // If there are no product pool views instantiated we do it here. Otherwise, we just show the existing one
            if (_.isEmpty($('#mb-content-wrapper').find('#m-product-pool'))) {
              $('#m-browse-results').before('<section id="m-product-pool"></section>');

              this.subViews.productPoolView = new ProductPoolView({ el: '#m-product-pool', model: this.model });
              this.subViews.productPoolView.render();
            } else {
              $('#m-product-pool').show();
            }
          }
        }
      // Hides the product pool whenever we have a facet or a valid sorting method
      } else {
        $('#m-product-pool').hide();
      }

      if ($.url().param('modal')) {
        this.showFacetListModalView(false);
      }
    },

    removeFixedNavigation: function() {
      stickyHeader.removeFixedNavigation();
    },

    defineBTDataDictionary: function() {
      BrowseView.prototype.setBTDataDictionary.call(this);
    },

    setCMProductPosition: function(event) {
      //This value will be used by CM on PDP
      var clickTarget = event.target;
      var pos = $(clickTarget).closest('li').data('position') + 1;
      this.setCMProductSelectionPosition(pos);
    },
    setAnalyticsFacetsContext: function() {
      var attr,
          token,
          context = {},
          facetValues = this.subViews.facetListModalView.model.get('facetSessionValues');

      _.each(facetValues, function(sessionValues, facetType) {
        _.each(sessionValues.selected, function(facetValue) {
          if (!_.isEmpty(facetValue)) {
            token = facetType + ':' + facetValue;
            switch (facetType){
              case 'COLOR_NORMAL':
                attr = '8';
                break;
              case 'SIZE_NORMAL':
                attr = '6';
                break;
              case 'BRAND':
                attr = '5';
                break;
              case 'PRICE':
                attr = '4';
                break;
              default:
                attr = '7';
            }
            context[attr] = context[attr] ? context[attr] + '|' + token : token;
          }
        });
      });
      return context;
    },
    setAnalyticsContext: function() {
      //Set global CM values used by multiple tags here and on PDP
      this.setCMPageId(this.model.attributes.category.pageId);
      this.setCMPanelType('BROWSE');

      this.setCMBrowseContext({
        totalProducts: this.model.get('category').totalproducts,
        pageNumber: this.model.get('currentpage')
      });

      this.setCMProductSelectionContext(this.setAnalyticsFacetsContext());
      this.setCMProductSelectionPosition(undefined);
    },
    doViewAnalytics: function() {
      var category = this.model.get('category'),
          productpools = this.model.get('productpool'),
          poolnames = '';

      if (!_.isEmpty(productpools)) {
        _.each(productpools, function(pool) {
          if (!_.isEmpty(pool.products)) {
            if (poolnames) {
              poolnames += '|';
            }
            poolnames += pool.poolname;
          }
        });
      }

      if (!_.isEmpty(poolnames)){
        poolnames = 'product-pool: ' + poolnames;
      }

      //Check out Search COntext and see if they overwrite navigation contex
      var categoryId, keyword, keyword_ac, redirectType;
      var searchContext = this.getCMSearchContext();

      if (searchContext) {
        categoryId = searchContext.type;
        redirectType = 'Browse Page';
        keyword = searchContext.keyword;
        keyword_ac = searchContext.keyword_ac;
        if (!searchContext.redirect) {
          keyword = undefined;
          keyword_ac = undefined;
          redirectType = undefined;
        }
      }

      //only business values are passed to the tag
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: category.pageId,
        categoryId: categoryId ? categoryId : category.id,
        searchString: keyword,
        att9: redirectType,
        att12: category.pageId,
        att14: poolnames,
        att22: keyword_ac
      });
      //We need this value only when we are here as the direct redirect from search results
      //and now we can delete it to identify further position in search path
      this.setCMSearchRedirect(false);
      return this;
    }
  });

  return MCOMBrowseView;
});
