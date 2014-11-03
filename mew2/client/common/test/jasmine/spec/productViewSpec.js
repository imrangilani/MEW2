define([
  'views/_productView',
  'models/productModel'
], function(ProductView, ProductModel) {
  'use strict';

  describe('_productView', function() {

    describe('Warranty Modal', function() {
      var productViewInstance,
        $el;

      beforeEach(function() {
        setFixtures('<li class="m-product-details-bullets-warranty">foo</li>');

        spyOn(ProductModel.prototype, 'fetch');

        productViewInstance = new ProductView({
          el: '#contentContainer',
          categoryID: '7554',
          productID: '77589'
        });

        productViewInstance.showWarrantyModal = function() {};

        $el = $('.m-product-details-bullets-warranty');
        $el.on('click', function(e) {
          productViewInstance.showWarrantyModal(e);
        });
      });

      it('should open a modal when user clicks in the bullet', function(){
        spyOn(productViewInstance, 'showWarrantyModal');
        $el.trigger('click');
        expect(productViewInstance.showWarrantyModal).toHaveBeenCalled();
      });
    });
  });
});
