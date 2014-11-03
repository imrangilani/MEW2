define([
  'util/pagination',

  // Models
  'models/facetListModalModel',

  // Views
  'views/mainContentView',
  'views/browseView',
  'views/_searchResultsView',
  'views/facetListModalView',
  'views/shopCategoriesPanelView',
  //util
  'analytics/analyticsTrigger',
  'util/BTDataDictionary',
  'util/stickyHeader'
], function(paginator, FacetListModalModel, MainContentView, BrowseView, SearchResultsView, FacetListModalView, ShopCategoriesPanelView,
            analytics, BTDataDictionary, stickyHeader) {
  'use strict';

  var MCOMSearchResultsView = SearchResultsView.extend({
    events: _.extend(SearchResultsView.prototype.events, {
      'change select#mb-search-select-sortby': 'sort',
      'click #m-search-paging a': 'scrollToTop',
      'click #m-search-results-list': 'setCMProductPosition',
      'click .m-product-grid-anchor': 'updateBopsFacetStore'
    }),

    init: function () {
      SearchResultsView.prototype.init.call(this);

      // Create an array of wssg requestParams that are ignored during url construction
      this.nonUrlKeys = ['show', 'facetexpandall', 'zip', 'radius'];

      Handlebars.registerHelper('formatPageUrl', function(pageNumber) {
        return this.preparePageUrl(pageNumber);
      }.bind(this));

      //Reset coremetrics
      //If it's search - we don't need any previously stored context
      this.setCMProductSelectionPosition(undefined);
      this.setCMBrowseContext(undefined);
      this.setCMProductSelectionContext(undefined);
      //Assume positive outcome for now - To DO: clean search context on error
      //Keywords are set in autoCompleteView.js or SearchView.js
      //We set search type here because we can get to this view through browser back button or direct url as well
      //not only search. When we get through back button we fire same tag again - Snehal is okay with that
      if (this.options.cm_kws_ac) {
        if (!this.getCMAutocompleteKeyword()){
          //keyword_ac is set only when we get here from autocompleteView, not back button
          //In this case we need to set keyword
          this.setCMAutocompleteKeyword( this.options.cm_kws_ac);
        }
        this.setCMSearchType('onsite_search_autocomplete');
      } else {
        this.setCMSearchType('onsite_search');
      }
      this.setCMSearchKeyword(this.options.keyword);


      this.listenTo(this.model, 'modelready', function() {

        if (this.model.get('products')) {
          this.initializePagination(this.model.attributes);

          if (!this.subViews.facetListModalView) {
            // Build request params for the facet list modal by omitting non-facet requestParams
            var requestParams = _.clone(_.omit(this.model.get('requestParams'), this.nonFacetKeys));

            // The request REQUIRES the 'searchphrase' parameter to be set, even if we are only
            // requesting products and not search results
            requestParams.searchphrase = this.model.get('requestParams').searchphrase;

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
        stickyHeader.register( this.$el.find('.m-search-nav'));
      });

      this.model.fetch();
    },

    sort: function(){
      //Do analytics
      var pageId,
          selectedValue = $('#mb-search-select-sortby>option:selected').html();

      var searchContext = this.getCMSearchContext();
      if( searchContext.type === 'onsite_search_autocomplete'){
        pageId = 'search_results_autocomplete';
      } else {
        pageId = 'search_results';
      }

      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: selectedValue,
        elementCategory: 'Faceted Sort By',
        att1: 'MEW_' + pageId,
        att6: searchContext.keyword
      });

      SearchResultsView.prototype.sort.call(this);
    },

    setCanonical: function() {
      BrowseView.prototype.setCanonical.apply(this, arguments);
    },

    scrollToTop: function() {
      $('body').animate({ scrollTop: $('#mb-content-wrapper').offset().top }, 500);
    },

    //Initializes pagination data, pagination template partial and a render helper
    initializePagination: function() {
      var prodCount = this.model.get('totalproducts') ? this.model.get('totalproducts') : 0;
      this.pagination = paginator.prepare(prodCount, this.model.get('requestParams').page);
    },

    renderTemplate: function() {
      $(this.el).html(TEMPLATE.searchResultsPage(_.extend(this.model.attributes, {
        pagination: this.pagination
      })));

      $(this.el).find('#m-search-results').html(TEMPLATE.searchResultsList(this.model.attributes));

      if (this.pagination) {
        $(this.el).find('#m-search-paging').html(TEMPLATE.pagination(this.pagination));
      }

      $(this.el).find('.truncated').dotdotdot();

    },

    postRender: function() {
      if (!this.model.get('products')) {
        // no results
        this.subViews.shopCategoriesPanelView = new ShopCategoriesPanelView({
          el: '#m-search-results-categories',

          options: {
            poolId: 'MEW2_HP_CATS'
          }
        });
      }

      //We send this tag only when user navif=gates to this page
      //If view refreshed as result of 4 x facets selection or sorting
      //we don't do it
      if( _.isUndefined( this.oldView)){
        this.doAnalytics();
        this.oldView = true;
      }

      MainContentView.prototype.postRender.apply(this);
    },

    removeFixedNavigation: function(){
      stickyHeader.removeFixedNavigation();
    },

    // Remove window scroll listener when view is closed
    close: function() {
      SearchResultsView.prototype.close.apply(this, arguments);
      stickyHeader.unregister();
    },

    setCMProductPosition: function(event){
      //This value will be used by CM on PDP
      if( event){
        var clickTarget = event.target;
        var pos = $(clickTarget).closest('li').data('position') + 1;
        this.setCMProductSelectionPosition(pos);
      }
    },

    defineBTDataDictionary: function(){
      //At this point searchContext has both autocomplete string, set by autocompleteView
      //and a keyword from search results
      var searchContext = this.getCMSearchContext();

      //If search was triggered by selection from autocomplete results list
      if( searchContext.type === 'onsite_search_autocomplete'){
        //Here searchContext.keyword_ac should be empty and keyword should be empty if
        //it is not the original search result but here when user clicked on back button
        BTDataDictionary.setNavigation( 'search_results_autocomplete', 'onsite_search_autocomplete', this.model.get('requestParams').searchphrase);
      } else {

        if( this.model.get('totalproducts') && this.model.get('totalproducts') > 0){
          BTDataDictionary.setNavigation( 'search_results', 'onsite_search', this.model.get('requestParams').searchphrase);
        } else {
          BTDataDictionary.setNavigation( 'no_results', 'onsite_search', this.model.get('requestParams').searchphrase);
        }
      }

    },

    doAnalytics: function() {
      if (!_.isUndefined (this.oldView)) {
        //Facets change or sorting
        return;
      }
      this.oldView = true;

      //At this point searchContext has both autocomplete string, set by autocompleteView
      //and a keyword from search results
      var searchContext = this.getCMSearchContext();
      var productCount;
      if (searchContext.keyword) {
        //Don't submit this number if we're here from back button
        productCount = this.model.get('totalproducts') ? this.model.get('totalproducts') : '0';
      }
      //If search was triggered by selection from autocomplete results list
      if (searchContext.type === 'onsite_search_autocomplete') {
        //Here searchContext.keyword_ac should be empty and keyword should be empty if
        //it is not the original search result but here when user clicked onn back button
        analytics.triggerTag({
          tagType: 'pageViewTag',
          pageId: 'search_results_autocomplete',
          categoryId: searchContext.type,
          searchString: searchContext.keyword,
          att22: searchContext.keyword_ac,
          searchResults: productCount
        });
      } else {
        
        if (this.model.get('totalproducts') > 0) {
          analytics.triggerTag({
            tagType: 'pageViewTag',
            pageId: 'search_results',
            categoryId: searchContext.type,
            searchString: searchContext.keyword,
            searchResults: productCount
          });
        } else {
          analytics.triggerTag({
            tagType: 'pageViewTag',
            pageId: 'no_results',
            categoryId: 'onsite_search',
            searchString: searchContext.keyword,
            searchResults: productCount
          });
        }
      }
    },
    //This is the only place where we set this flag to true
    //This method is called only before redirect happens
    setSearchRedirectFlag: function() {
      this.setCMSearchRedirect(true);
    }

  });

  return MCOMSearchResultsView;
});
