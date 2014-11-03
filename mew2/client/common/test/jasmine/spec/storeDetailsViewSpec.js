define([
  'jasmineHelpers',
  'views/_storeDetailsView',
  'models/storeDetailsModel'
], function (jasmineHelpers, StoreDetailsView, StoreDetailsModel) {
  'use strict';

  describe('_storeDetailsView', function() {

    beforeEach(function() {
      spyOn(StoreDetailsModel.prototype, 'fetch');
    });

    describe('#init', function() {
      it('should define a model of the type StoreDetailsModel', function() {
        var storeDetailsView = new StoreDetailsView({ options: { locno: 5000 }});
        expect(storeDetailsView.model).toBeDefined();
        expect(storeDetailsView.model).toEqual(jasmine.any(StoreDetailsModel));
      });

      it('should construct a model with locno when provided', function() {
        var storeDetailsView = new StoreDetailsView({ options: { locno: 5000 }});
        expect(storeDetailsView.model.get('locnbr')).toBe(5000);
      });

      it('should construct a model with storeid when provided', function() {
        var storeDetailsView = new StoreDetailsView({ options: { storeid: 3000 }});
        expect(storeDetailsView.model.get('storeid')).toBe(3000);
      });
    });

    describe('#renderTemplate', function() {
      it('should render the storeDetails template', function() {
        var storeDetailsView = new StoreDetailsView({ options: { storeid: 3000 }});
        spyOn(TEMPLATE, 'storeDetails');
        storeDetailsView.renderTemplate();
        expect(TEMPLATE.storeDetails).toHaveBeenCalled();
      });
    });
  });
});
