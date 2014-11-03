define([
  'jasmineHelpers',
  'views/brandIndexView',
  'models/appModel',
  'analytics/analyticsTrigger'
], function(jasmineHelpers, BCOMBrandIndexView, AppModel, analytics) {
  'use strict';

  describe('brandIndexView', function() {
    var brandIndexViewInstance,
        previousCategoryIndex;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
      spyOn(AppModel.prototype, 'initialize');
      App.model = new AppModel();
      previousCategoryIndex = App.model.get('categoryIndex');
    });

    afterEach(function() {
      App.model.set('categoryIndex', previousCategoryIndex);
    });

    describe('#renderTemplate', function() {

      beforeEach(function() {
        brandIndexViewInstance = new BCOMBrandIndexView();
        spyOn(TEMPLATE, 'brandIndex').and.callThrough();
        spyOn(TEMPLATE, 'allDesignersDropdown').and.callThrough();
      });

      it('should render the proper templates', function() {
        brandIndexViewInstance.renderTemplate();
        expect(true).toBe(true);
        expect(TEMPLATE.brandIndex).toHaveBeenCalled();
        expect(TEMPLATE.allDesignersDropdown).toHaveBeenCalled();
      });
    });

    describe('#postRender', function() {

      it('should call for any analytics tags that need to be thrown', function() {
        spyOn(analytics, 'triggerTag');
        brandIndexViewInstance = new BCOMBrandIndexView({ options: { id: 1001344 } });
        brandIndexViewInstance.postRender();
        expect(analytics.triggerTag).toHaveBeenCalledWith({
          tagType: 'pageViewTag',
          pageId: 'MBL: DESIGNER_INDEX_HOME',
          categoryId: 1001344
        });
      });
    });

    describe('#loadDesigners', function() {

      beforeEach(function() {
        App.router.navigate = function() { return true; };
        setFixtures('<select id="b-designers-fob-list"><option value="aUrl" selected></select>');
        spyOn(App.router, 'navigate');
        brandIndexViewInstance = new BCOMBrandIndexView();
      });

      it('should call for navigation on the router to the proper url', function() {
        brandIndexViewInstance.loadDesigners();
        expect(App.router.navigate.calls.mostRecent().args[0]).toBe('aUrl');
      });
    });
  });
});
