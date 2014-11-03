define([
  'views/_mainContentView'
], function(MainContentView) {
  'use strict';

  describe('_mainContentView', function() {
    var mainContentViewInstance;

    describe('#popstate', function() {

      describe('if `event.state.level` is set', function () {

        describe('if `event.state.level` equals 1', function () {

          it('should hide the product views shown modals shown modal' +
             'if the product view has a shown modal', function() {
            mainContentViewInstance = new MainContentView();
            var obj = {
              hide: function() {}
            };

            mainContentViewInstance.getShownModal = function() {
              return {
                getShownModal: function() {
                  return {
                    hide: obj.hide
                  };
                }
              };
            };
            spyOn(obj, 'hide');
            mainContentViewInstance.popstate({
              state: {
                level: 1,
                modalShowFunction: 'showModal'
              }
            });
            expect(obj.hide).toHaveBeenCalled();
          });

          it('should otherwise call the `event.state.modalShowFunction` with the state data', function() {
            mainContentViewInstance = new MainContentView();
            mainContentViewInstance.showModal = function() {};
            mainContentViewInstance.getShownModal = function() {};
            spyOn(mainContentViewInstance, 'showModal');
            mainContentViewInstance.popstate({
              state: {
                level: 1,
                modalShowFunction: 'showModal',
                e: {
                  key: 'val'
                },
                modalShowData: {}
              }
            });
            expect(mainContentViewInstance.showModal).toHaveBeenCalledWith({ key: 'val' }, true, {});
          });

          it('should call the `event.state.modalShowFunction` in the  product views -> current modal' +
             'with the state data if the `event.state.level` equals 2', function() {
            mainContentViewInstance = new MainContentView();
            var obj = {
              showModal: function() {}
            };
            mainContentViewInstance.getShownModal = function() {
              return obj;
            };
            spyOn(obj, 'showModal');
            mainContentViewInstance.popstate({
              state: {
                level: 2,
                modalShowFunction: 'showModal',
                e: {
                  key: 'val'
                },
                modalShowData: {}
              }
            });
            expect(obj.showModal).toHaveBeenCalledWith({ key: 'val' }, true, {});
          });
        });

        it('should otherwise hide the shownModal if it exists and is currently shown', function() {
          mainContentViewInstance = new MainContentView();
          var obj = {
            hide: function() {}
          };
          mainContentViewInstance.getShownModal = function() {
            return obj;
          };
          spyOn(obj, 'hide');
          mainContentViewInstance.popstate({});
          expect(obj.hide).toHaveBeenCalled();
        });
      });
    });
  });
});
