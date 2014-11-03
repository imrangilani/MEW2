define([
  'jasmineHelpers',
  'views/_headerView'
], function (jasmineHelpers, HeaderView) {
  'use strict';

  describe('_headerView', function () {
    var HeaderViewInstance;

    beforeEach(function () {
      jasmineHelpers.prepareAppGlobals();
      HeaderViewInstance = new HeaderView();
    });

    describe('initialize', function () {

      it('should immediately render the view', function() {
        spyOn(HeaderViewInstance, 'render');
        HeaderViewInstance.initialize();
        expect(HeaderViewInstance.render).toHaveBeenCalled();
      });
    });
  });
});
