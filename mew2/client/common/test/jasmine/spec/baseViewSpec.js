define([
  'jasmineHelpers',
  'views/_baseView'
], function(jasmineHelpers, BaseView) {
  'use strict';

  describe('_baseView', function() {
    var baseViewInstance;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
    });

    describe('#getStateElement', function() {

      it('should throw an error if the state element does not have an id', function() {
        baseViewInstance = new BaseView();
        expect(function() { baseViewInstance.getStateElement({}); })
          .toThrow();
      });

      it('should otherwise return an element using the `e.currentTarget.id` string', function() {
        setFixtures('<div id="image-1">foo</div>');
        baseViewInstance = new BaseView();
        expect(baseViewInstance.getStateElement({
          currentTarget: {
            id: 'image-1'
          }
        })).toEqual($('#image-1'));
      });
    });

    describe('#getNextModalLevel', function() {

      it('should return 1 if there is no level set on the `historyState`', function() {
        baseViewInstance = new BaseView();
        expect(baseViewInstance.getNextModalLevel(undefined)).toBe(1);
      });

      it('should increment the current level if it is set in `historyState`', function() {
        baseViewInstance = new BaseView();
        expect(baseViewInstance.getNextModalLevel({
          level: 1
        })).toBe(2);
      });
    });

    describe('#pushModalState', function() {

      it('should default to passing the `modalShowFunction` ' +
         'and modal level calculated by `this.getNextModalLevel` to pushState', function() {
        baseViewInstance = new BaseView();
        baseViewInstance.getNextModalLevel = function() { return 2; };
        spyOn(window.history, 'pushState');
        baseViewInstance.pushModalState('showModal');
        expect(window.history.pushState.calls.mostRecent().args[0]).toEqual({
          modalShowFunction: 'showModal',
          level: 2
        });
      });

      it('should add the `modalShowData` to the state if it is passed', function() {
        baseViewInstance = new BaseView();
        baseViewInstance.getNextModalLevel = function() { return 2; };
        spyOn(window.history, 'pushState');
        baseViewInstance.pushModalState('showModal', null, {
          storeId: 112
        });
        expect(window.history.pushState.calls.mostRecent().args[0].modalShowData.storeId).toBe(112);
      });

      it('should add the `eventElementId` to the state as a synthetic event object' +
         'with the e.currentTarget.id property', function() {
        baseViewInstance = new BaseView();
        baseViewInstance.getNextModalLevel = function() { return 2; };
        spyOn(window.history, 'pushState');
        baseViewInstance.pushModalState('showModal', 'test');
        expect(window.history.pushState.calls.mostRecent().args[0].e.currentTarget.id).toBe('test');
      });
    });

    describe('#getShownModal', function() {

      it('should return any child modal that is currently shown', function() {
        baseViewInstance = new BaseView();
        baseViewInstance.subViews.testModal = {
          shown: true
        };
        expect(baseViewInstance.getShownModal()).toBe(baseViewInstance.subViews.testModal);
      });
    });
  });
});
