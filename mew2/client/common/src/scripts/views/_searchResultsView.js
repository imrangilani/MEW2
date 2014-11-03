define([
  // Utils
  'util/util',
  'util/dataMap',
  'util/crossBrowserHeight',
  'util/multiValueCookie',

  // Models
  'models/searchResultsModel',

  // Views
  'views/mainContentView',

  'url-parser'
], function (util, DataMap, CrossBrowserHeight, mvCookie, SearchResultsModel, MainContentView) {
  'use strict';

  var SearchResultsView = MainContentView.extend({
    events: {
      'change select#mb-search-select-sortby': 'sort',
      'click #mb-search-buttons-filterby': 'filterResults'
    },

    init: function () {
      // Create an array of wssg requestParams that are ignored during url construction
      this.nonUrlKeys = ['show', 'facetexpandall'];

      // Create an array of wssg requestParams that are ignored during facet creation
      this.nonFacetKeys =  [
        'searchphrase',
        'show',
        'perpage',
        'page',
        'facetexpandall',
        'sortorderby'
      ];

      this.dataMap = new DataMap({
        keyword: 'searchphrase',
        productsperpage: 'perpage',
        pageindex: 'page',
        sortby: {
          toWssg: function (navAppValue) {
            switch (navAppValue) {

            case 'NEW_ITEMS':
              this.sortorderby = 'NEWNESS';
              break;

            case 'ORIGINAL':
              this.sortorderby = 'DEFAULT';
              break;

            case 'PRICE_LOW_TO_HIGH':
              this.sortorderby = 'PRICE_ASCENDING';
              break;

            case 'PRICE_HIGH_TO_LOW':
              this.sortorderby = 'PRICE_DESCENDING';
              break;

            case 'TOP_RATED':
              this.sortorderby = 'CUSTOMER_RATING';
              break;

            default:
              this.sortorderby = navAppValue;
            }
          }
        },
        sortorderby: {
          fromWssg: function (wssgValue, data) {
            switch (wssgValue) {

            case 'CUSTOMER_RATING':
              this.sortBy = 'TOP_RATED';
              break;

            case 'DEFAULT':
              this.sortBy = 'ORIGINAL';
              break;

            case 'NEWNESS':
              this.sortBy = 'NEW_ITEMS';
              break;

            case 'PRICE_DESCENDING' :
              this.sortBy = 'PRICE_HIGH_TO_LOW';
              break;

            case 'PRICE_ASCENDING' :
              this.sortBy = 'PRICE_LOW_TO_HIGH';
              break;

            default:
              this.sortBy = data.sortorderby;
              break;
            }
          }
        }
      });

      // nonRequestParams should contain any view.options that should not be treated as requestParams for the searchResultsModel
      var nonRequestParams = ['cm_kws_ac', 'isDesignerIndexResults'];
      this.model = new SearchResultsModel({ requestParams: this.dataMap.toWssg(_.omit(this.options, nonRequestParams)), view: this });
    },

    // Event handler triggered when a popstate event occurs
    popstate: function(event) {
      MainContentView.prototype.popstate.apply(this, arguments);
      if (!event.state || !event.state.level) {
        this.trigger('wentBack');
        if (!this.applyingFacets && this.subViews.facetListModalView) {
          this.subViews.facetListModalView.cancelFacetSelection();
        }
        this.applyingFacets = false;
      }
    },

    refineProducts: function (facetModalRequestParams) {
      // get all non-facet requestParams
      var requestParams = _.extend(_.pick(this.model.get('requestParams'), this.nonFacetKeys), {
        page: 1
      });

      var facetSessionRangeValues = this.subViews.facetListModalView.getFacetSessionRangeValues();
      var facetUrlParameters = this.subViews.facetListModalView.getFacetUrlParameters();

      // Set request params by extending on the facetModalRequestParams
      this.model.set('requestParams', _.extend(requestParams, facetModalRequestParams, facetUrlParameters));

      this.model.fetch();
      this.applyingFacets = true;
      this.listenToOnce(this, 'wentBack', function () {
        // navigate should be called only with requestParams that should appear in the URL
        var params = _.omit(_.extend(this.model.get('requestParams'), facetSessionRangeValues, facetUrlParameters), this.nonUrlKeys);
        App.router.navigate(null, { attributes: this.dataMap.fromWssg(params) });
      });

      setTimeout(_.bind(function () {
        if (this.scrollToTop) {
          this.scrollToTop();
        } else {
          this.backToTop();
        }
      }, this), 1000);

      this.removeFixedNavigation();
    },

    removeFixedNavigation: function(){
      //Placeholder for mcom
    },

    sort: function() {
      // Grab user-selected sort value
      var sortorderby = $('#mb-search-select-sortby').val();

      var requestParams = _.extend(this.model.get('requestParams'), {
        sortorderby: sortorderby,
        page: 1
      });

      this.model.set('requestParams', requestParams);
      this.model.fetch();

      App.router.navigate(null, { attributes: this.dataMap.fromWssg(_.omit(this.model.get('requestParams'), this.nonUrlKeys)) });

      this.scrollToTop();
    },

    scrollToTop: function () {
      // Must be defined by each brand (since DOM nodes differ)
    },

    /**
     * Shows facet list modal view
     * @param  {Object} event
     * @param  {Boolean} triggeredByPopState If specified as true, push state
     * @return {[type]}        [description]
     */
    showFacetListModalView: function (event, triggeredByPopState) {
      if (!triggeredByPopState) {
        this.pushModalState('showFacetListModalView');
      }
      this.subViews.facetListModalView.startFacetSession();

      // Delay Android to allow browser chrome to disappear
      setTimeout(_.bind(function() {
        CrossBrowserHeight.updateHeight();
        this.subViews.facetListModalView.show();
        this.subViews.facetListModalView.render();
      }, this), util.isAndroid() ? 200 : 0);
    },

    // Prepares url to be used as href for pagination link for fghfhg a particular pageNumber
    preparePageUrl: function (pageNumber) {
      var requestParams = _.extend(_.clone(this.model.get('requestParams')), {
        page: pageNumber
      });

      return App.router.buildUrl(this.dataMap.fromWssg(_.omit(requestParams, this.nonUrlKeys)));
    },

    updateBopsFacetStore: function() {
      var storeNumber = util.storage.retrieve('bops_location_number');

      if (storeNumber) {
        mvCookie.set('BOPSPICKUPSTORE', storeNumber, 'MISCGCs', 30);
      }
    },

    // When user clicks on "Filter results" button
    filterResults: function() {
      this.showFacetListModalView();
    }
  });

  return SearchResultsView;
});
