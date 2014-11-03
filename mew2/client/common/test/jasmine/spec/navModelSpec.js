define([
  'jasmineHelpers',
  'models/_appModel',
  'models/_navModel'
], function(jasmineHelpers, AppModel, NavModel) {
  'use strict';

  describe('_navModel', function() {
    var navModelInstance;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      spyOn(AppModel.prototype, 'initialize');

      App.model = new AppModel();

      App.model.set('categoryIndex', true);

      navModelInstance = new NavModel();
    });

    describe('#fetch', function() {

      it('should populate the NavModel if the categoryIndex data is already present', function() {
        navModelInstance.set('appModel', App.model);

        spyOn(navModelInstance, 'populateModel');

        navModelInstance.fetch();
        expect(navModelInstance.populateModel).toHaveBeenCalled();
      });

      it('should listen to the categoryIndexLoaded event if the categoryIndex data is not present', function() {
        App.model.unset('categoryIndex');
        navModelInstance.set('appModel', App.model);

        spyOn(navModelInstance, 'listenTo');

        navModelInstance.fetch();
        expect(navModelInstance.listenTo).toHaveBeenCalled();
      });

    });

    describe('#setParentMenuItems', function() {

      it('should return the parent menu items when passed in a menu id that has parents', function() {
        navModelInstance.set('menus', {
          testMenu: {
            parent: 'parentMenu'
          }
        });

        spyOn(navModelInstance, 'setParentMenuItems');

        navModelInstance.setParentMenuItems('testMenu');

        expect(navModelInstance.setParentMenuItems).toHaveBeenCalled();
      });
    });

    describe('#setChildMenuItems', function() {

      it('should return the child menu items when passed in a menu id that has children', function() {
        navModelInstance.set('menus', {
          testMenu: {
            children: ['childMenu']
          },
          childMenu: {}
        });

        spyOn(navModelInstance, 'addNavItem');

        navModelInstance.setChildMenuItems('testMenu');

        expect(navModelInstance.addNavItem).toHaveBeenCalled();
      });
    });

    describe('#addNavItem', function() {

      it('should add a true category when the menu id is a GoTo category', function() {
        navModelInstance.set('menus', {
          testMenu: {
            gotoId: 'trueCategory'
          },
          trueCategory: {}
        });
        navModelInstance.navMenuItems = [];
        navModelInstance.addNavItem('testMenu');

        expect(navModelInstance.navMenuItems[0].id).toEqual('trueCategory');
      });
    });
  });
});
