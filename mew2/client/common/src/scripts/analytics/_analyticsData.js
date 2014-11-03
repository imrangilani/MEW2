/**
 * @file
 * Handles data stored by various components for analytics
 *
 * @return {Object} data object
 */

define([

], function() {
  'use strict';

  var storage = {
    data: {
      //PageId contains category "breadcrumb", pageId in category response test
      pageId: '',
      //Pagename contains logical page name, like 'homepage', 'pdp', 'splash'
      pageName: '',
      //Product selection context contains parameters when
      //a product is selected - from recently viewed, a pool or facets
      //Can be set from whatever place a pool, recently viewed or facets are
      //displayed
      productSelectionContext: null,
      //This context stores browse info when a product is selected
      //- number of products and page number
      browseContext: null,
      productPosition: null,
      //Contains typed in autocomplete string and search keyword
      searchContext: {},

      //True/False indicating whether the path to product started on a shop by brand page
      shopByBrandFlow: false
    },
    setCMPageId: function(pageid) {
      if (pageid) {
        this.data.pageId = pageid;
      }
    },
    getCMPageId: function() {
      return this.data.pageId;
    },
    setCMPanelType: function(pageName) {
      if (pageName) {
        this.data.pageName = pageName;
      }
    },
    getCMPanelType: function() {
      return this.data.pageName;
    },
    setCMProductSelectionContext: function(context) {
      this.data.productSelectionContext = context;
    },
    getCMProductSelectionContext: function() {
      return this.data.productSelectionContext;
    },
    setCMBrowseContext: function(context) {
      this.data.browseContext = context;
    },
    getCMBrowseContext: function() {
      return this.data.browseContext;
    },
    //Position of selected product in a preceding view -
    //browse, splash or search result
    setCMProductSelectionPosition: function(pos) {
      this.data.productPosition = pos;
    },
    getCMProductSelectionPosition: function() {
      return this.data.productPosition;
    },
    //A string entered by a user before selecting a keyword
    //from autocomplete list
    setCMAutocompleteKeyword: function(str) {
      this.data.searchContext.keyword_ac = str;
    },
    getCMAutocompleteKeyword: function() {
      return this.data.searchContext.keyword_ac;
    },
    //A string that was used for a search
    setCMSearchKeyword: function(str) {
      this.data.searchContext.keyword = str;
      if (str){
        this.data.searchContext.rawKeyword = str;
      }
    },
    getCMSearchKeyword: function() {
      return this.data.searchContext.keyword;
    },
    //Search type - site search or autocomplete search
    setCMSearchType: function(str) {
      this.data.searchContext.type = str;
    },
    getCMSearchType: function() {
      return this.data.searchContext.type;
    },
    //Flag indicating if displayed view is a direct redirect from search result (true)
    //or was navigating from other views
    setCMSearchRedirect: function(flag) {
      this.data.searchContext.redirect = flag;
    },
    getCMSearchRedirect: function() {
      return this.data.searchContext.redirect;
    },
    //Whole context object, shortcut for reinitializing
    getCMSearchContext: function() {
      if (this.data.searchContext && this.data.searchContext.type){
        return this.data.searchContext;
      } else {
        return undefined;
      }
    },
    setCMSearchContext: function(obj) {
      if (obj) {
        this.data.searchContext = obj;
      } else {
        this.data.searchContext = {};
      }
    },
    getCMShopByBrandFlow: function() {
      return this.data.shopByBrandFlow;
    },
    // value: true/false
    setCMShopByBrandFlow: function(value) {
      this.data.shopByBrandFlow = value;
    },
    getCMDesignerFacetSearch: function() {
      return this.data.searchContext.designerFacetKeyword;
    },
    setCMDesignerFacetSearch: function(str) {
      this.data.searchContext.designerFacetKeyword = str;
    },
    getCMDesignerFacetKeywordMap: function() {
      return this.data.searchContext.designerFacetKeywordMap;
    },
    setCMDesignerFacetKeywordMap: function(key, value) {
      if (!this.data.searchContext.designerFacetKeywordMap) {
        this.data.searchContext.designerFacetKeywordMap = {};
      }
      this.data.searchContext.designerFacetKeywordMap[key] = value;
    }

  };

  return storage;
});
