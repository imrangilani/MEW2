window.ENV_CONFIG.production = 'N';

define([
  'analytics/analyticsListener',
  'analytics/analyticsData'
], function(analyticsListener, analyticsData) {
  'use strict';

  describe('analyticsListener', function() {

    afterEach(function() {
      analyticsData.data.browseContext = null;
    });

    describe('#processAnalyticsTagEvent', function() {

      it('should call page element tag handler when called with pageElementTag tag type', function() {
        spyOn(analyticsListener, 'processPageElementTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'pageElementTag' });

        expect(analyticsListener.processPageElementTag).toHaveBeenCalled();
      });

      it('should call tech properties tag handler when called with techPropertiesTag tag type', function() {
        spyOn(analyticsListener, 'processTechPropertiesTag');
        analyticsListener.processAnalyticsTagEvent({ tagType: 'techPropertiesTag' });

        expect(analyticsListener.processTechPropertiesTag).toHaveBeenCalled();
      });
    });
  });
});
