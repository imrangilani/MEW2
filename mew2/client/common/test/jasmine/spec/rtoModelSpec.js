define([
  'jasmineHelpers',
  'models/_baseModel',
  'models/_rtoModel'
], function(jasmineHelpers, BaseModel, RTOModel) {
  'use strict';

  var recommendationsModel = { attributes: { categoryId: 12345 } };
  var recommendationsSlider = { visibleSlides:[] };
  var rtoModel = new RTOModel(null, { recommendations: recommendationsModel, slider: recommendationsSlider });

  //This method creates a mock visibleSlides array in the same manner as swiper.js does
  //The fixture contains two swiper containers - the initial one and the 'scrolled' one
  //We load them in appropriate times to prepare the data for informant calls

  function setVisibleSlidesArray(containerId){
    var wrapper = document.getElementById(containerId);
    recommendationsSlider.visibleSlides = [];
    for (var i = 0; i < wrapper.childNodes.length; i++) {
      var _className = wrapper.childNodes[i].className;
      if (_className){
        var _slideClasses = _className.split(' ');
        for (var j = 0; j < _slideClasses.length; j++) {
          if (_slideClasses[j] === 'swiper-slide-visible') {
            wrapper.childNodes[i].data = getDataAttr;
            recommendationsSlider.visibleSlides.push(wrapper.childNodes[i]);
          }
        }
      }
    }
  }

  var getDataAttr = function(name) {
    return this.getAttribute('data-' + name);
  };

  describe('Model: Informant calls model', function() {

    describe('#url', function() {
      it('should use the `urlRoot`', function() {
        expect(rtoModel.url()).toBe('/EventsWar/events/record/customeraction');
      });
    });
  });

  describe('Model: Informant calls model should do business methods', function() {

    jasmineHelpers.loadFixture('rtoVisibleSlides.html');
    setVisibleSlidesArray('wrapper');

    beforeEach(function() {});

    afterEach(function() {});

    describe('#getProductIds', function() {

      it('should return list of visible product ids', function() {
        expect(rtoModel.getProductIds()).toEqual(['664162', '362114', '80994']);
      });

      it('should store the list of visible product ids', function() {
        expect(rtoModel.getStoredProductIds()).toEqual(['664162', '362114', '80994']);
      });

    });

    describe('#getChoiceIds', function() {

      it('should return list choice-ids of visible product ids', function() {
        expect(rtoModel.getChoiceIds()).toEqual(['cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904%40H5%40you%20might%20also%20like...%2453630%24664162',
          'cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904%40H5%40you%20might%20also%20like...%2453630%24362114',
          'cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904%40H5%40you%20might%20also%20like...%2453630%2480994']);
      });
    });

    describe('#should not duplicate product ids after scroll:: ', function() {

      beforeEach(function() {
        //Imitate visial scroll action by loading 'scrolled' container divs
        jasmineHelpers.loadFixture('rtoVisibleSlides.html');
        setVisibleSlidesArray('wrapper-scrolled');
      });

      it('should return list of only new visible product ids', function() {
        expect(rtoModel.getProductIds()).toEqual(['80987']);
      });

      it('should store the new list of visible product ids', function() {
        expect(rtoModel.getStoredProductIds()).toEqual(['664162', '362114', '80994', '80987']);
      });

    });

    describe('#clearInformantCallMemory', function() {

      it('should clear saved visible product ids', function() {
        rtoModel.clearInformantCallMemory();
        expect(rtoModel.getStoredProductIds()).toEqual([]);
      });
    });

    describe('#should persist values on the server ', function() {
      beforeEach(function() {
        rtoModel.clearInformantCallMemory();
        //This fixture has 3 visible divs under wrapper-scrolled container
        jasmineHelpers.loadFixture('rtoVisibleSlides.html');
        setVisibleSlidesArray('wrapper-scrolled');
      });

      it('for presented items', function() {
        spyOn(rtoModel, 'save');
        rtoModel.sendInformantCall('Presented');
        expect(rtoModel.save.calls.mostRecent().args[0]).toEqual({});

        var sentData = rtoModel.save.calls.mostRecent().args[1].data;
        expect(sentData.categoryId).toBe(12345);
        expect(sentData.choiceIds).toBe('cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904@H5@you might also like...$53630$362114|cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904@H5@you might also like...$53630$80994|cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904@H5@you might also like...$53630$80987');
        expect(sentData.context).toBe('PDP_ZONE_B');
        expect(sentData.productIds).toBe('362114|80994|80987');
        expect(sentData.responseType).toBe('Presented');
        expect(sentData.sender).toBe('MCOM-MMEW');
        expect(sentData.visitorId).toBeDefined();
      });

    });

    describe('#should persist values on the server ', function() {
      beforeEach(function() {
        jasmineHelpers.loadFixture('rtoVisibleSlides.html');
        setVisibleSlidesArray('wrapper-scrolled');
      });

      it('for clicked item', function() {
        spyOn(rtoModel, 'save');
        rtoModel.sendInformantCall('Clicked', recommendationsSlider.visibleSlides[1]);
        expect(rtoModel.save.calls.mostRecent().args[0]).toEqual({});

        var sentData = rtoModel.save.calls.mostRecent().args[1].data;
        expect(sentData.categoryId).toBe(12345);
        expect(sentData.choiceIds).toBe('cidKA0011-2039b439-d00f-4ef3-9f9b-a8c1f9ec9904@H5@you might also like...$53630$80994');
        expect(sentData.context).toBe('PDP_ZONE_B');
        expect(sentData.productIds).toBe('80994');
        expect(sentData.responseType).toBe('Clicked');
        expect(sentData.sender).toBe('MCOM-MMEW');
        expect(sentData.visitorId).toBeDefined();
      });
    });

    describe('#should persist values on the server ', function() {
      beforeEach(function() {
      });

      it('for addToBag item', function() {
        spyOn(rtoModel, 'save');
        rtoModel.sendInformantCall('AddToBag', {
            productIds: 34567,
            choiceIds:  '234abcd...234',
            categoryId: 12345
        });

        expect(rtoModel.save.calls.mostRecent().args[0]).toEqual({});

        var sentData = rtoModel.save.calls.mostRecent().args[1].data;
        expect(sentData.categoryId).toBe(12345);
        expect(sentData.choiceIds).toBe('234abcd...234');
        expect(sentData.context).toBe('PDP_ZONE_B');
        expect(sentData.productIds).toBe('34567');
        expect(sentData.responseType).toBe('AddToBag');
        expect(sentData.sender).toBe('MCOM-MMEW');
        expect(sentData.visitorId).toBeDefined();
      });
    });

    describe('#success', function() {
      it('should reset back global Backbone emulateJSON option and doesnot propagete to BaseModel', function() {
        spyOn(BaseModel.prototype, 'success');
        rtoModel.success();
        expect(Backbone.emulateJSON).toBe(false);
        expect(BaseModel.prototype.success).not.toHaveBeenCalled();
      });
    });

    describe('#error', function() {
      it('should reset backglobal Backbone emulateJSON option and calls BaseModel error implementation', function() {
        spyOn(BaseModel.prototype, 'error');
        rtoModel.error();
        expect(Backbone.emulateJSON).toBe(false);
        expect(BaseModel.prototype.error).toHaveBeenCalled();
      });
    });
  });
});
