define([
  'models/baseModel',
  'models/appModel',
  'util/util',
  'util/localstorage',
  'config'
], function(BaseModel, AppModel, util, $localStorage, config) {

  'use strict';

  return BaseModel.extend({

    fetch: function() {
      util.showNavLoading();
      if (this.get('appModel').get('categoryIndex')) {
        this.populateModel();
      } else {
        this.set('gn:isLoading', true);
        this.set('gn:areFirst2levelsLoading', true);

        this.listenTo(Backbone, 'categoryIndexLoaded', this.notifyLoaded);
        this.listenTo(Backbone, 'gn:first2levelsLoaded', this.notifyFirst2lvlsLoaded);
        this.listenTo(Backbone, 'gn:fetchError', this.fetchError);
        this.listenTo(Backbone, 'pdp:updateGN', this.createNavMenu);
      }
    },

    /**
     * Populates the model once the category index has been receieved in the AppModel
     */
    populateModel: function() {
      var menuId = this.get('gn:actualMenuId') || this.get('menuId');
      this.set('menus', this.get('appModel').get('categoryIndex').menus);
      this.createNavMenu(menuId);
    },

    notifyFirst2lvlsLoaded: function() {
      var menuId = this.get('gn:actualMenuId') || this.get('menuId');
      this.set('menus', this.get('appModel').get('categoryIndex').menus);
      if (this.get('appModel').get('categoryIndex').menus[menuId]) {
        if (this.get('appModel').get('categoryIndex').menus[menuId].children) {
          util.showNavItems();
          util.hideNavLoading();
          this.createNavMenu(menuId);
          this.get('appModel').set('hasCategoryOn2Level', true);
        }

      } else {
        this.get('appModel').set('hasCategoryOn2Level', false);
      }

      this.set('gn:areFirst2levelsLoading', false);
    },

    notifyLoaded: function() {
      var menuId = this.get('gn:actualMenuId') || this.get('menuId'), currentId;

      this.set('menus', this.get('appModel').get('categoryIndex').menus);

      // We get the current category user has clicked
      currentId = this.getCurrentId(menuId);

      // This logic happens when user starts to interact with 2 levels' GlobalNav. The idea is avoid re-rendering
      // the globalNav (happens when we get the full GlobalNav) if user is already interacting with the
      // 2 levels' GlobalNav. In case he interacts with the items already loaded, we don't re-rendered the GlobalNav.
      // In case he interacts with a deeper level, then we show the spinning until full level comes in.
      if (menuId) {
        if (this.get('menuId') !== 'shop' && !(/\d/).test(this.get('menuId'))) {
          if (menuId === 'top') {
            menuId = currentId;
          }
          this.createNavMenu(menuId);
        } else {
          if (util.isNavLoadingInProgress() || !this.get('appModel').get('gn:justLoaded')) {
            if (menuId === 'shop' && menuId !== currentId) {
              menuId = currentId;
            }
            this.createNavMenu(menuId);
          }
        }
      } else {
        this.createNavMenu('top');
      }

      this.set('gn:isLoading', false);
      util.hideNavLoading();
    },

    /**
     * Creates a new nav menu
     * @param  {String} menuId Id of the menu to retrieve from the menus object
     */
    createNavMenu: function(menuId) {
      // Validate that the menu exists, otherwise render the top level menu
      if (!this.get('menus')[menuId]) {
        menuId = 'top';
      }
      this.set('isNewNavMenu', true);
      this.navMenuItems = [];

      if (menuId !== 'top' && menuId !== 'stores') {
        menuId = this.getCurrentId(menuId);
      }

      this.setParentMenuItems(menuId);
      this.addNavItem(menuId, 'headerRow currentRow');
      this.setChildMenuItems(menuId);

      this.set('newMenuItems', this.navMenuItems);
    },

    getCurrentId: function(menuId) {
      var query = $.url(window.location).attr('query'),
          currentId, gotoId;

      if (this.get('appModel').get('categoryIndex').menus[menuId]) {
        gotoId = this.get('appModel').get('categoryIndex').menus[menuId].gotoId;
      }

      if (gotoId) {
        currentId = gotoId;
      } else {
        if ((/\d/).test(query)) {
          currentId = query.match(/id=(\d+)|CategoryID=(\d+)/);

          if (currentId) {
            if (!currentId[1]) {
              currentId = currentId[2];
            } else {
              currentId = currentId[1];
            }

            if (menuId !== currentId) {
              menuId = currentId;
            }

          } else {
            // #27046: Adding user case where the categoryID attribute is not present on the URL
            // In this case, we should wait for the PDP call to informe us which is the activeCategory
            // So we can repaint the GN accordingly
            if (menuId) {
              currentId = menuId;
            } else {
              currentId = 'top';
            }
          }

        }
      }

      return currentId;

    },

    /**
     * Updates an existing nav menu with the menu id's children
     * @param  {String} menuId Id of the menu to retrieve from the menus object
     */
    updateNavMenu: function(menuId) {
      this.set('isNewNavMenu', false);
      this.navMenuItems = [];

      this.setChildMenuItems(menuId);

      this.set('newMenuItems', this.navMenuItems);

      // If user tapped any category, we check if the full depth categoryIndex
      // has loaded. In case it didn't, we throw an error overlay message everytime
      // he tries to reach a deeper level.
      // In case he is trying to access any non-category menu item, we check if
      // second level was already loaded. We do this check, because the full depth
      // may have failed and user may have only depth:2 level menu to interact with
      if (!isNaN(menuId)) {
        if ($localStorage.get('gn:categoryIndexLoaded') === false &&
          this.navMenuItems.length === 0) {
          this.fetchError();
        }

      } else {
        if (!$localStorage.get('gn:first2levelsLoaded') &&
          $localStorage.get('gn:categoryIndexLoaded') === false &&
          this.navMenuItems.length === 0) {
          this.fetchError();
        }
      }

    },

    /**
     * Sets a parent menu item
     * @param  {String} menuId Id of the menu to retrieve from the menus object
     */
    setParentMenuItems: function(menuId) {
      var menu = this.get('menus')[menuId];
      if (menu.parent) {
        this.setParentMenuItems(menu.parent);
        this.addNavItem(menu.parent, 'headerRow');
      }
    },

    /**
     * Sets the child menu items
     * @param  {String} menuId Id of the menu to retrieve from the menus object
     */
    setChildMenuItems: function(menuId) {
      var menu = this.get('menus')[menuId];
      if (menu.children) {

        var top = [];
        if (App.config.menus) {
          _.each(App.config.menus, function(item, id) {
            if (item.parent === 'top') {
              top.push(id);
            }
          });
        }

        _.each(menu.children, function(id) {
          var classes = (top.indexOf(id) === -1) ? ('child ') : ('');
          this.addNavItem(id, classes);
        }, this);
      }
    },

    /**
     * Adds a menu item to the list of menu items
     * @param  {String} menuId  Id of the menu to retrieve from the menus object
     * @param  {String} classes Classes to apply to the menu item
     */
    addNavItem: function(menuId, classes) {
      var menu = this.get('menus')[menuId],
          fobSitePromotions = this.getFobSitePromotions(),
          originalMenuId = menuId,
          sitePromotion;

      if (menu) {
        if (menu.gotoId) {
          menuId = menu.gotoId;
          menu.url = menu.overrideUrl;
        }

        sitePromotion = fobSitePromotions[menuId] || menu.cm || this.getSubFobSitePromotion(originalMenuId);

        this.navMenuItems.push({
          id:      menuId,
          name:    menu.name,
          url:     menu.url,
          classes: classes || '',
          secure:  menu.secure || (undefined),
          viewless: menu.viewless || (undefined),
          sitePromotion: sitePromotion
        });
      }
    },

    /**
     * Return an array of sitePromotion tags for Fobs
     * @return {Array} Array of sitePromotion tags
     */
    getFobSitePromotions: function() {
      return {};
    },

    /**
     * Get the sitePromotion tag for the sub FOBs
     * @returns {String} sitePromotion tag
     */
    getSubFobSitePromotion: function() {
      // Should be implemented in the brand specific code
      return (undefined);
    },

    fetchError: function() {
      if (!$localStorage.get('gn:first2levelsLoaded')) {
        // populate the model with the hardcoded menu
        var initialNav = AppModel.prototype.parse(config.menus).categoryIndex.menus;
        this.set('menus', initialNav);
      }

      if ($('#mb-j-nav-menu').children().length === 0) {
        this.createNavMenu('top');
      }

      this.trigger('gn:fetchError');
    }

  });
});
