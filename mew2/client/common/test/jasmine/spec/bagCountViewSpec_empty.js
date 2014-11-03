/*define([
  'views/_bagCountView'
], function(BagCountView) {
  'use strict';

  describe('_bagCountView', function() {
    var bagCountView;

    describe('#init', function() {

      beforeEach(function() {
        bagCountView = new BagCountView();
      });

      it('should render immediately', function() {
        spyOn(bagCountView, 'render');
        bagCountView.initialize();
        expect(bagCountView.render).toHaveBeenCalled();
      });

      it('should have the \'bag cookie\' set after initialization', function() {
        bagCountView.initialize();
        var bagCookie = $.cookie('GCs');
        expect(bagCookie).toBeDefined();
        expect(bagCookie).toMatch(/CartItem/);
        expect(bagCookie).toMatch(/UserName/);
      });
    });

    describe('#onBagCountChange', function() {

      beforeEach(function() {
        bagCountView = new BagCountView();
      });

      it('should be triggered when the model changes', function() {
        spyOn(bagCountView, 'onBagCountChange');
        bagCountView.initialize();
        bagCountView.model.set('bagItemsCount', 5);
        expect(bagCountView.onBagCountChange).toHaveBeenCalled();
      });

    });

    describe('#renderTemplate', function() {

      it('should be called whenever the bag count changes', function() {
        bagCountView = new BagCountView();
        spyOn(bagCountView, 'renderTemplate');
        bagCountView.initialize();
        expect(bagCountView.renderTemplate).toHaveBeenCalled();

        bagCountView.model.set('bagItemsCount', 5);
        expect(bagCountView.renderTemplate).toHaveBeenCalled();
      });
    });
  });
});
*/
