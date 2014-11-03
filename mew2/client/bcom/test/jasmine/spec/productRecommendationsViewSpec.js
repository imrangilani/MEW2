define([
  'jasmineHelpers',
  'views/productRecommendationsView',
  'models/productRecommendationsModel'
], function(jasmineHelpers, ProductRecommendationsView, ProductRecommendationsModel){
  'use strict';

  describe('productRecommendationsView', function () {
    var productRecommendationsModel, productRecommendationsView, recommendationsSwiper, jasmine;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      App.config.recommendations = {
        requester: 'BCOM-BMEW',
        context: 'PDP_ZONE_A',
        maxRecommendations: 6
      };

      spyOn(ProductRecommendationsModel.prototype, 'fetch');

      productRecommendationsModel = new ProductRecommendationsModel({
        productId: 11111,
        visitorId: 'b75eb40b759fb0b75dab0b75e590b75e120b751960b756fd0b758620'
      });

      productRecommendationsView = new ProductRecommendationsView(productRecommendationsModel);

      jasmine =  window.jasmine;
    });

    describe('#init', function () {

      it('should initialize the model', function () {
        expect(typeof productRecommendationsView.init).toBe('function');
        expect(productRecommendationsView.renderTemplate()).toBeUndefined();
      });
    });

    describe('#postRender', function () {

      it('should render after render is called', function () {
        spyOn(productRecommendationsView, 'initializeSwiper');
        spyOn(productRecommendationsView, 'centerImagesAndArrows');
        productRecommendationsView.render();
        expect(productRecommendationsView.initializeSwiper).not.toHaveBeenCalled();
        expect(productRecommendationsView.centerImagesAndArrows).not.toHaveBeenCalled();
      });
    });

    describe('#initializeSwiper', function () {

      it('should initialize the swiper settings', function () {
        productRecommendationsView.initializeSwiper();
        expect(recommendationsSwiper).not.toBe(null);
      });
    });

    describe('#reInitializeSwiper', function () {

      it('should reinitialize the swiper settings on orientation change', function () {
        spyOn(productRecommendationsView, 'renderTemplate');
        spyOn(productRecommendationsView, 'postRender');
        productRecommendationsView.initializeSwiper();
        expect(recommendationsSwiper).not.toBe(null);
        //productRecommendationsView.reInitializeSwiper();
        //expect(recommendationsSwiper).toBe(null);
        //expect(productRecommendationsView.renderTemplate).toHaveBeenCalled();
        //expect(productRecommendationsView.postRender).toHaveBeenCalled();
      });
    });
/*
    describe('#navigateLeft', function () {

      beforeEach(function() {
        jasmine.getFixtures().set(
          '<div><div id="b-product-recently-viewed-arrow-left"></div>' +
          '<div id="b-product-recently-viewed-arrow-right"></div></div>'
        );
      });

      it('should navigate to the previous product thumbnail', function () {
        var e = jasmine.createSpyObj('e', [ 'preventDefault' ]);
        $('#b-product-recently-viewed-arrow-left').click();
        productRecommendationsView.navigateLeft(e);
        expect(e.preventDefault).toHaveBeenCalled();
        spyOn(recommendationsSwiper, 'swipePrev');
        productRecommendationsView.navigateLeft();
        expect(recommendationsSwiper.swipePrev).toHaveBeenCalled();
      });
    });

    describe('#navigateRight', function () {

      beforeEach(function() {
        jasmine.getFixtures().set(
          '<div><div id="b-product-recently-viewed-arrow-left"></div>' +
          '<div id="b-product-recently-viewed-arrow-right"></div></div>'
        );
      });

      it('should navigate to the next product thumbnail', function () {
        var e = jasmine.createSpyObj('e', [ 'preventDefault' ]);
        $('#b-product-recently-viewed-arrow-right').click();
        productRecommendationsView.navigateRight(e);
        expect(e.preventDefault).toHaveBeenCalled();
        spyOn(recommendationsSwiper, 'swipeNext');
        productRecommendationsView.navigateRight();
        expect(recommendationsSwiper.swipeNext).toHaveBeenCalled();
      });
    });
*/
  });
});
