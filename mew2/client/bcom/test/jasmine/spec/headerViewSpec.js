define([
  'views/headerView',
  'analytics/bloomiesCoremetrics'
], function (BCOMHeaderView, bloomiesCoremetrics) {
  'use strict';

  describe('headerView', function() {
    var headerViewInstance;

    beforeEach(function() {
      headerViewInstance = new BCOMHeaderView();
    });

    describe('#goHome', function () {

      it('should record a site promotion when clicked', function() {
        spyOn(bloomiesCoremetrics, 'cmCreateManualLinkClickTag');
        spyOn(bloomiesCoremetrics, 'cmCreateManualImpressionTag');

        headerViewInstance.goHome();
        expect(bloomiesCoremetrics.cmCreateManualLinkClickTag).toHaveBeenCalledWith('/?cm_sp=NAVIGATION_MEW-_-TOP_NAV-_-MAINICON-n-n');
        expect(bloomiesCoremetrics.cmCreateManualImpressionTag).toHaveBeenCalledWith('NAVIGATION_MEW-_-TOP_NAV-_-MAINICON-n-n');
      });
    });

    describe('#toggleNav', function () {

      it('should record a site promotion when clicked', function() {
        spyOn(bloomiesCoremetrics, 'cmCreateManualLinkClickTag');
        spyOn(bloomiesCoremetrics, 'cmCreateManualImpressionTag');

        headerViewInstance.toggleNavMenu();
        expect(bloomiesCoremetrics.cmCreateManualLinkClickTag).toHaveBeenCalledWith('/?cm_sp=NAVIGATION_MEW-_-TOP_NAV-_-GLOBALNAVICON-n-n');
        expect(bloomiesCoremetrics.cmCreateManualImpressionTag).toHaveBeenCalledWith('NAVIGATION_MEW-_-TOP_NAV-_-GLOBALNAVICON-n-n');
      });
    });
  });
});
