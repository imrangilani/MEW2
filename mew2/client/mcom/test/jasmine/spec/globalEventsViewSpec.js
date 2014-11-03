define([
  'jasmineHelpers',
  'views/globalEventsView',
  'analytics/analyticsTrigger'
], function(jasmineHelpers, GlobalEventsView, analytics) {
  'use strict';

  describe('globalEventsView', function() {
    var globalEventsView;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      jasmineHelpers.loadFixture('linkClickMarkup.html', 'mcom');
      globalEventsView = new GlobalEventsView();
    });

    describe('$(".m-j-cm-link").click', function() {

      it('should invoke coremetrics trigger when clicked on href that has .m-j-cm-link class', function() {

        spyOn(analytics, 'triggerTag');
        $('#m-test-link').click();

        expect(analytics.triggerTag).toHaveBeenCalledWith({
          tagType: 'linkClickTag',
          urlTarget: '/shop/kitchen/cuisinart?id=7560&cm_sp=text-_-to_pass',
          pageId: 'pageId_xxx'
        });

      });

      it('should not invoke coremetrics trigger when click on href that does not have .m-j-cm-link class', function() {
        spyOn(analytics, 'triggerTag');
        $('#m-notest-link').click();
        expect(analytics.triggerTag).not.toHaveBeenCalled();
      });
    });
  });
});
