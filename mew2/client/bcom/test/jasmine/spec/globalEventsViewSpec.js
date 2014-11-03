define([
  'jasmineHelpers',
  'views/globalEventsView'
], function(jasmineHelpers, GlobalEventsView) {
  'use strict';

  describe('globalEventsView', function() {
    var globalEventsViewInstance;

    beforeEach(function() {
      jasmineHelpers.loadFixture('globalEventsViewMarkup.html', 'bcom');
    });

    describe('#enableStickyHeader', function() {
      it('should enable sticky header', function() {
        globalEventsViewInstance = new GlobalEventsView();
        globalEventsViewInstance.enableStickyHeader();
        expect($('#mb-page-wrapper').hasClass('b-sticky-header')).toBeTruthy();
      });
    });
  });
});
