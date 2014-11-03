define([
  'views/_browseView',
  'models/_browseModel'
], function (BrowseView, BrowseModel) {
  'use strict';

  describe('_browseView', function() {
    var browseViewInstance = new BrowseView({
      model: new BrowseModel({
        category: {
          name: 'test'
        }
      })
    });

    describe('#popstate', function() {

      it('should otherwise trigger the wentBack event', function() {
        browseViewInstance.subViews.facetListModalView = {
          shown: true,
          cancelFacetSelection: function() {},
          hide: function() {}
        };
        spyOn(browseViewInstance, 'trigger');
        browseViewInstance.applyingFacets = true;
        browseViewInstance.popstate({
          state: {}
        });
        expect(browseViewInstance.trigger).toHaveBeenCalledWith('wentBack');
      });

      it('should cancel the facet selection if the user hit back in the browser', function() {
        browseViewInstance.subViews.facetListModalView = {
          shown: true,
          cancelFacetSelection: function() {},
          hide: function() {}
        };
        browseViewInstance.applyingFacets = false;
        spyOn(browseViewInstance.subViews.facetListModalView, 'cancelFacetSelection');
        browseViewInstance.popstate({
          state: {}
        });
        expect(browseViewInstance.subViews.facetListModalView.cancelFacetSelection).toHaveBeenCalled();
      });
    });
  });
});
