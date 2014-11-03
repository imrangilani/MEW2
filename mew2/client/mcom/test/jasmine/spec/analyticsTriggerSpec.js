define([
  'jasmineHelpers',
  'analytics/analyticsTrigger'
], function (jasmineHelpers, analytics) {
  'use strict';

  describe('analyticsTrigger', function() {

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
    });

    describe('#triggerTag', function() {

      it('should trigger a tag when invoked with a valid tag', function () {

        var beObj = { beCalled: function(){}};
        spyOn( beObj,'beCalled');
        var obj = _.extend({}, Backbone.Events);

        obj.listenTo(Backbone, 'analytics', beObj.beCalled);

        analytics.triggerTag({ tagType: 'pageViewTag' });

        expect(beObj.beCalled).toHaveBeenCalled();
      });

      it('should not trigger a tag when invoked with an invalid tag', function () {

        var beObj = { beCalled: function(){}};
        spyOn( beObj,'beCalled');
        var obj = _.extend({}, Backbone.Events);

        obj.listenTo(Backbone, 'analytics', beObj.beCalled);

        analytics.triggerTag({ someField: 'someValue' });

        expect(beObj.beCalled).not.toHaveBeenCalled();
      });
    });
  });
});
