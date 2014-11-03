define([
  'models/_bopsProductModel',
  'util/multiValueCookie'
], function(BopsProductModel, mvCookie) {
  'use strict';

  describe('_bopsProductModel', function() {
    var mock = {
      id: 1,
      locationNumber: 100,
      product: {
        upcs: {
          '-1': {
            id: 101010
          }
        }
      },
      bops: {
        availability: {
          101010: {
            bopsEligible: true
          }
        }
      },
      activeUpc: {
        upcKey: '-1'
      }
    };

    function getCompleteModel() {
      return new BopsProductModel(mock);
    }

    describe('#getKey', function() {
      var modelA,
          modelB,
          modelC,
          modelD,
          modelE;

      beforeEach(function() {
        modelA = new BopsProductModel({ id: 1, locationNumber: 100 });
        modelB = new BopsProductModel({ id: 2, locationNumber: 200 });
        modelC = new BopsProductModel({ id: 1, locationNumber: 900 });
        modelD = new BopsProductModel({ id: 9, locationNumber: 100 });
        modelE = new BopsProductModel({ id: 1, locationNumber: 100 });
      });

      it('should return the same key for models with the same \'id\' and \'locationNumber\'', function() {
        expect(modelA.getKey()).toEqual(modelA.getKey());
        expect(modelA.getKey()).toEqual(modelE.getKey());
      });

      it('should return a different key for different values of \'id\' and \'locationNumber\'', function() {
        expect(modelA.getKey()).not.toEqual(modelB.getKey());
        expect(modelA.getKey()).not.toEqual(modelC.getKey());
        expect(modelA.getKey()).not.toEqual(modelD.getKey());
      });
    });

    describe('#defaults', function() {

      it('should return empty defaults', function() {
        var modelA = getCompleteModel();
        expect(modelA.get('activeUpc')).toBeDefined();
      });
    });

    describe('#url', function() {

      it('should return a url string with the \'id\' and \'locationNumber\'', function() {
        var modelA = getCompleteModel(),
            url = modelA.url();
        expect(url).toMatch(/product\/1/);
        expect(url).toMatch(/locationNumber=100/);
      });
    });

    describe('#getLocationNumberCookie', function() {

      it('should return \'null\' if there is no cookie yet', function() {
        spyOn(mvCookie, 'get').and.returnValue(null);
        var modelA = getCompleteModel();
        expect(modelA.getLocationNumberCookie()).toBe(null);
      });

      it('should return the value of the cookie, if there is one', function() {
        spyOn(mvCookie, 'get').and.returnValue(100);
        var modelA = getCompleteModel();
        expect(modelA.getLocationNumberCookie()).toMatch(100);
      });
    });

    describe('#setLocationNumberCookie', function() {

      it('should set the \'locationNumber\' in the proper cookie for bops', function() {
        var modelA = getCompleteModel();
        spyOn(modelA, 'get').and.returnValue(100);
        spyOn(mvCookie, 'set');

        modelA.setLocationNumberCookie();
        expect(mvCookie.set).toHaveBeenCalledWith('BOPSPICKUPSTORE', 100, 'MISCGCs', 30);
      });
    });

    describe('#updateAvailability', function() {
      var modelA;

      beforeEach(function() {
        modelA = getCompleteModel();
      });

      it('should expose a property in the model (\'activeUpcData\' with the details of the currently active upc', function() {
        var modelA = getCompleteModel();
        modelA.set('bops', mock.bops);
        var activeUpcData = modelA.get('activeUpcData');
        expect(activeUpcData).toBeDefined();
      });

      // it('should expose a property in the model (\'activeAvailability\' with the details of the currently active upc', function() {
      //   modelA.updateAvailability();
      //   var activeAvailability = modelA.get('activeAvailability');
      //   expect(activeAvailability).toBeDefined();
      //   expect(activeAvailability.bopsEligible).toBeDefined();
      //   expect(activeAvailability.bopsAvailable).toBeDefined();
      //   expect(activeAvailability.storeAvailable).toBeDefined();
      // });
    });
  });
});
