define([
  'analytics/_analyticsData'
], function(analyticsData) {
  'use strict';

  describe('_analyticsData', function() {

    afterEach(function(){
      analyticsData.data.pageId = '';
      analyticsData.data.pageName = '';
      analyticsData.data.productSelectionContext = null;
      analyticsData.data.browseContext = null;
    });

    describe('#setCMPageId', function() {

      it('should store Page Id if specified', function() {
        analyticsData.setCMPageId('McomPageIdA');
        expect(analyticsData.data.pageId).toEqual('McomPageIdA');
      });

      it('should not modify Page Id if passed parameter is not defined', function() {
        analyticsData.data.pageId = 'McomPageIdB';

        var pageId;
        analyticsData.setCMPageId(pageId);

        expect(analyticsData.data.pageId).toEqual('McomPageIdB');
      });

      it('should store Panel Type if specified', function() {
        analyticsData.setCMPanelType('McomPanelTypeA');
        expect(analyticsData.data.pageName).toEqual('McomPanelTypeA');
      });

      it('should not modify Panel Type if passed parameter is not defined', function() {
        analyticsData.data.pageName = 'McomPanelTypeB';

        var pageName;
        analyticsData.setCMPanelType(pageName);

        expect(analyticsData.data.pageName).toEqual('McomPanelTypeB');
      });
    });

    describe('#getCMPageId', function() {

      it('should return Page Id when retrieved', function() {
        analyticsData.data.pageId = 'McomPageIdC';
        expect(analyticsData.getCMPageId()).toEqual('McomPageIdC');
      });
    });

    describe('#getCMPanelType', function() {

      it('should return Panel Type when retrieved', function() {
        analyticsData.data.pageName = 'McomPanelTypeC';
        expect(analyticsData.getCMPanelType()).toEqual('McomPanelTypeC');
      });
    });

    describe('#setCMProductSelectionContext', function() {

      it('should store Product Selection context', function() {
        analyticsData.setCMProductSelectionContext('McomProductContextA');
        expect(analyticsData.data.productSelectionContext).toEqual('McomProductContextA');
      });
    });

    describe('#getCMProductSelectionContext', function() {

      it('should return Product Selection context', function() {
        analyticsData.data.productSelectionContext = 'McomProductContextB';
        expect(analyticsData.getCMProductSelectionContext()).toEqual('McomProductContextB');
      });
    });

    describe('#setCMBrowseContext', function() {

      it('should store Browse context', function() {
        analyticsData.setCMBrowseContext('McomBrowseContextA');
        expect(analyticsData.data.browseContext).toEqual('McomBrowseContextA');
      });
    });

    describe('#getCMBrowseContext', function() {

      it('should return Browse context', function() {
        analyticsData.data.browseContext = 'McomBrowseContextB';
        expect(analyticsData.getCMBrowseContext()).toEqual('McomBrowseContextB');
      });
    });

    describe('#setCMSearchContext', function() {

      it('should store Search context', function() {
        analyticsData.setCMSearchContext({ keyword: 'abc'});
        expect(analyticsData.data.searchContext).toEqual({keyword:'abc'});
      });

      it('should return undefined when there is no Search context', function() {
        analyticsData.setCMSearchContext(null);
        expect(analyticsData.getCMSearchContext()).toBeUndefined();
      });
    });

    describe('#getCMSearchContext', function() {

      it('should return Search context', function() {
        analyticsData.data.searchContext = { keyword: 'abc', type: 'onsite_search'};
        expect(analyticsData.getCMSearchContext()).toEqual({ keyword: 'abc', type: 'onsite_search'});
      });
    });

    describe('#setCMAutocompleteKeyword', function() {

      it('should store autocomplete search word', function() {
        analyticsData.setCMAutocompleteKeyword('McomKeyword');
        expect(analyticsData.data.searchContext.keyword_ac).toEqual('McomKeyword');
      });
    });

    describe('#getCMAutocompleteKeyword', function() {

      it('should return autocomplete search word', function() {
        analyticsData.data.searchContext.keyword_ac = 'McomKeyword';
        expect(analyticsData.getCMAutocompleteKeyword()).toEqual('McomKeyword');
      });
    });

    describe('#setCMSearchKeyword', function() {

      it('should store site search word', function() {
        analyticsData.setCMSearchKeyword('McomKeyword');
        expect(analyticsData.data.searchContext.keyword).toEqual('McomKeyword');
      });

      it('should return site search word', function() {
        analyticsData.data.searchContext.keyword = 'McomKeyword';
        expect(analyticsData.getCMSearchKeyword()).toEqual('McomKeyword');
      });
    });

    describe('#setCMSearchType', function() {

      it('should store search type', function() {
        analyticsData.setCMSearchType('McomSearchType');
        expect(analyticsData.data.searchContext.type).toEqual('McomSearchType');
      });

      it('should return site search type', function() {
        analyticsData.data.searchContext.type = 'McomSearchType';
        expect(analyticsData.getCMSearchType()).toEqual('McomSearchType');
      });
    });

    describe('#setCMSearchRedirect', function() {

      it('should store search context redirect flag', function() {
        analyticsData.setCMSearchRedirect(true);
        expect(analyticsData.data.searchContext.redirect).toBe(true);
      });

      it('should return search context redirect flag', function() {
        analyticsData.data.searchContext.redirect = true;
        expect(analyticsData.getCMSearchRedirect()).toBe(true);
      });
    });

    describe('#setCMShopByBrandFlow', function() {

      it('should store shopByBrandFlow', function() {
        analyticsData.setCMShopByBrandFlow('abc');
        expect(analyticsData.data.shopByBrandFlow).toEqual('abc');
      });
    });

    describe('#getCMShopByBrandFlow', function() {

      it('should return shopByBrandFlow when retrieved', function() {
        analyticsData.data.shopByBrandFlow = 'abcd';
        expect(analyticsData.getCMShopByBrandFlow()).toEqual('abcd');
      });
    });

    describe('#setCMDesignerFacetSearch', function() {

      it('should store designer facet search', function() {
        analyticsData.setCMSearchContext();
        analyticsData.setCMDesignerFacetSearch('designerFacet');
        expect(analyticsData.data.searchContext.designerFacetKeyword).toEqual('designerFacet');
      });
    });

    describe('#getCMDesignerFacetSearch', function() {

      it('should return designer facet search', function() {
        analyticsData.data.searchContext = {designerFacetKeyword:'designerFacetKeyword'};
        expect(analyticsData.getCMDesignerFacetSearch()).toEqual('designerFacetKeyword');
      });
    });

    describe('#setCMDesignerFacetKeywordMap', function() {

      it('should store designer facet keyword map', function() {
        analyticsData.setCMSearchContext();
        analyticsData.setCMDesignerFacetKeywordMap('theKey', 'theValue');
        expect(analyticsData.data.searchContext.designerFacetKeywordMap).toEqual({'theKey' : 'theValue'});
      });
    });

    describe('#getCMDesignerFacetKeywordMap', function() {

      it('should return designer facet keyword map', function() {
        analyticsData.data.searchContext = { designerFacetKeywordMap: {'theKey' : 'theValue'}};
        expect(analyticsData.getCMDesignerFacetKeywordMap()).toEqual({'theKey' : 'theValue'});
      });
    });

    describe('#setCMProductSelectionPosition', function() {

      it('should store product selection position', function() {
        analyticsData.setCMProductSelectionPosition(3);
        expect(analyticsData.data.productPosition).toEqual(3);
      });

      it('should return product selection position', function() {
        analyticsData.data.productPosition = 3;
        expect(analyticsData.getCMProductSelectionPosition()).toEqual(3);
      });
    });
  });
});
