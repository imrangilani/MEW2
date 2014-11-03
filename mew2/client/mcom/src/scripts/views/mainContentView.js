//Every Mcom "page" that generates LinkCLick tag
//should have CMPageId set
define([
  // Views
  'views/_mainContentView',
  'analytics/analyticsData',
  'util/BTDataDictionary'
], function(MainContentView, analyticsData, BTDataDictionary) {
  'use strict';

  var MCOMMainContentView = MainContentView.extend({

    initialize: function() {
      this.setPageTitle('Macy\'s - Shop Fashion Clothing & Accessories - Official Site - Macys.com');

      this.setCanonical();

      MainContentView.prototype.initialize.apply(this, arguments);
    },

    setCanonical: function() {
      var $url = $.url();
      var host = $url.attr('host');

      if (host.indexOf('codemacys') !== -1) {
        host = host.replace('m2qa1.', 'www1.').replace('m.', 'www1.');
      } else {
        host = 'www1.macys.com';
      }

      var canonical = $url.attr('protocol') + '://' + host + $url.attr('relative');
      $('link[rel=canonical]').remove();
      $('title').after('<link rel="canonical" href="' + canonical + '" />');
    },

    setBTDataDictionary: function(){
      var category = this.model.get('category');
      var searchContext = this.getCMSearchContext();

      if (searchContext){
        var categoryId = searchContext.type;
        BTDataDictionary.setNavigation(category.pageId, categoryId, searchContext.eyword);
      } else {
        BTDataDictionary.setNavigation(category.pageId, category.id, '');
      }

      var fobCategoryId,
          fobCategoryName,
          fobCategory = BTDataDictionary.helpers.getDomFobCategory();
      if( fobCategory){
        fobCategoryId = fobCategory.id;
        fobCategoryName = fobCategory.name;
      }

      BTDataDictionary.setCategory (category.id, category.name, fobCategoryId, fobCategoryName);
    },

    postRender: function() {
      if (this.scrollPastHeader) {
        this.scrollToTop();
      }

      MainContentView.prototype.postRender.apply(this, arguments);
    },

    scrollToTop: function() {
      var height = $('#mb-region-header').height() + $('#mb-j-search-container').height();
      $('html,body').animate({ scrollTop: height + 'px' });
    },

    setCMPageId: function(pageId) {
      analyticsData.setCMPageId(pageId);
    },
    getCMPageId: function() {
      return analyticsData.getCMPageId();
    },
    setCMPanelType: function(panelType) {
      analyticsData.setCMPanelType(panelType);
    },
    getCMPanelType: function() {
      return analyticsData.getCMPanelType();
    },
    setCMBrowseContext: function(context) {
      analyticsData.setCMBrowseContext(context);
    },
    setCMProductSelectionContext: function(context) {
      analyticsData.setCMProductSelectionContext(context);
    },
    setCMProductSelectionPosition: function(pos) {
      analyticsData.setCMProductSelectionPosition(pos);
    },
    getCMProductSelectionPosition: function() {
      return analyticsData.getCMProductSelectionPosition();
    },
    setCMAutocompleteKeyword: function(str) {
      analyticsData.setCMAutocompleteKeyword(str);
    },
    getCMAutocompleteKeyword: function() {
      return analyticsData.getCMAutocompleteKeyword();
    },
    setCMSearchKeyword: function(str) {
      analyticsData.setCMSearchKeyword(str);
    },
    getCMSearchKeyword: function() {
      analyticsData.getCMSearchKeyword();
    },
    setCMSearchType: function(str) {
      analyticsData.setCMSearchType(str);
    },
    getCMSearchType: function() {
      return analyticsData.getCMSearchType();
    },
    getCMSearchContext: function() {
      return analyticsData.getCMSearchContext();
    },
    setCMSearchContext: function(obj) {
      analyticsData.setCMSearchContext(obj);
    },
    getCMSearchRedirect: function() {
      return analyticsData.getCMSearchRedirect();
    },
    setCMSearchRedirect: function(flag) {
      analyticsData.setCMSearchRedirect(flag);
    }
  });

  return MCOMMainContentView;
});
