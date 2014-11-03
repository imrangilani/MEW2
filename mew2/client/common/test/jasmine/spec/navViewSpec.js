define([
  'jasmineHelpers',
  'models/_appModel',
  'views/_navView'
], function(jasmineHelpers, AppModel, NavView) {
  'use strict';

  describe('_navView', function() {
    var navViewInstance;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();
      spyOn(AppModel.prototype, 'initialize');

      App.model = new AppModel();
    });

    describe('#initialize', function() {

      beforeEach(function() {
        App.router.isDeepLink = function() { return true; };
        navViewInstance = NavView.initialize('shop', false);
      });

      it('should return a reference to the navViewInstance', function() {
        expect(navViewInstance).toBeTruthy();
      });

      /*it('should initialize the nav model', function() {
        expect(navViewInstance.model).toBeTruthy();
      });

      it('should set the isCategoryMenu property  in the nav model', function() {
        expect(navViewInstance.model.get('isCategoryMenu')).toBeFalsy();
      });*/

    });

    describe('#renderTemplate', function() {

      beforeEach(function() {
        navViewInstance.$el = $('#element');
      });

      describe('when called for the first time', function() {

        beforeEach(function() {
          spyOn(navViewInstance.$el, 'html');
          navViewInstance.animating = false;
          navViewInstance.model.set('isNewNavMenu', true);
          navViewInstance.render();
        });

        it('should be inserted without animating', function() {
          expect(navViewInstance.$el.html).toHaveBeenCalled();
        });
      });

      describe('when called during an animation', function() {

        beforeEach(function() {
          spyOn(navViewInstance.$el, 'html');
          navViewInstance.model.set('isNewNavMenu', false);
          navViewInstance.animating = true;
          navViewInstance.render();
        });

        it('should render immediately onto the page', function() {
          expect(navViewInstance.$el.html).toHaveBeenCalled();
        });
      });

      describe('when called after the initial rendering and there is no animation occurring', function() {

        beforeEach(function() {
          spyOn(navViewInstance, 'animateNavMenu');
          spyOn(navViewInstance, 'updateCurrentNavItem');
          navViewInstance.model.set('isNewNavMenu', false);
          navViewInstance.animating = false;
          navViewInstance.render();
        });

        it('should animate onto the page', function() {
          expect(navViewInstance.animateNavMenu).toHaveBeenCalled();
        });
      });
    });

    describe('#animateNavMenu', function() {

      beforeEach(function() {
        spyOn(navViewInstance, 'updateCurrentNavItem');
        spyOn(navViewInstance, 'removeOldNavItems');
        spyOn(navViewInstance, 'addNavItems');
        navViewInstance.animateNavMenu(1, {}, $('#shop'));
      });

      it('should update the currently active nav item', function() {
        expect(navViewInstance.updateCurrentNavItem).toHaveBeenCalled();
      });

      it('should remove old nav items', function() {
        expect(navViewInstance.removeOldNavItems).toHaveBeenCalled();
      });
    });

    describe('#updateCurrentNavItem', function() {

      beforeEach(function() {
        navViewInstance.options.$selectedRow = $('#shop');
        navViewInstance.updateCurrentNavItem();
      });

      it('the old currently selected nav item is no longer the currently selected nav item', function() {
        expect($('#mb-j-nav-menu li:nth-child(1)').hasClass('currentRow')).toBeFalsy();
      });
    });

    describe('#addNavItems', function() {

      it('should update that it is loaded if there are no items to add', function() {
        navViewInstance.model.set('newMenuItems', []);
        navViewInstance.addNavItems(1);
        expect(Backbone.animating).toBeFalsy();
      });
    });
  });
});
