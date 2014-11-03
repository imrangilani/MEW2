define([
  'jasmineHelpers',
  'models/_appModel',
  'util/_localstorage'
], function(jasmineHelpers, AppModel, $localStorage) {
  'use strict';

  describe('_appModel', function() {

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals(true);
      spyOn(AppModel.prototype, 'initialize');
      App.model = new AppModel();
    });

    describe('#parse', function() {

      it('should reformat the reponse and call mapAliases on each menu', function() {
        spyOn(App.model, 'mapAliases').and.callFake(function(menu) {
          menu.name = menu.n;
          delete menu.n;
        });

        expect(App.model.parse({
          118: {
            n: 'Women'
          },
          1: {
            n: 'Men'
          }
        })).toEqual({
          categoryIndex: {
            menus: {
              118: {
                name: 'Women'
              },
              1: {
                name: 'Men'
              }
            }
          }
        });
      });
    });

    describe('#mapAliases', function() {

      it('should map object keys to another set of keys', function() {
        expect(App.model.mapAliases({
          key1: 'val1',
          key2: 'val2',
          key3: 'val3'
        }, {
          key1: 'key1map',
          key2: 'key2map'
        })).toEqual({
          key1map: 'val1',
          key2map: 'val2',
          key3: 'val3'
        });
      });
    });

    describe('#isParentOfTier2Remain', function() {

      it('should return true if the category id is the parent of a tier 2 remain category', function() {
        App.model.set('categoryIndex', {
          menus: {
            1: {
              children: [2, 3]
            },
            2: {
              remain: true
            },
            3: {}
          }
        });

        expect(App.model.isParentOfTier2Remain(1)).toBeTruthy();
      });
    });

    describe('#isTier2Remain', function() {

      it('should return true if the category id is a tier 2 remain category', function() {
        App.model.set('categoryIndex', {
          menus: {
            2: {
              remain: true
            }
          }
        });

        expect(App.model.isTier2Remain(2)).toBeTruthy();
      });
    });
  });
});
