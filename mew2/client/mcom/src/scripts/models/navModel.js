define([
  'models/_navModel',
  'models/appModel',
  'util/util',
  'util/localstorage',
  'config'
], function(NavModel, AppModel, util, $localStorage, config) {
  'use strict';

  return NavModel.extend({
    fetch: function() {
      // populate the model with the hardcoded menu
      var initialNav = AppModel.prototype.parse(config.menus).categoryIndex.menus;
      this.set('menus', initialNav);
      this.createNavMenu('top');

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
        }
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
          this.createNavMenu(menuId);
        } else {
          if (util.isNavLoadingInProgress() || !this.get('appModel').get('gn:justLoaded')) {
            if (menuId === 'shop' && menuId !== currentId) {
              menuId = currentId;
            }
            this.createNavMenu(menuId);
          } else {
            if (this.get('menus')[menuId] && this.get('menus')[menuId].type === 'GoTo') {
              this.createNavMenu(menuId);
            }
          }
        }
      } else {
        this.createNavMenu('top');
      }
      this.set('gn:isLoading', false);
      util.hideNavLoading();
    },

    getCurrentId: function(categoryID) {
      var query = $.url(window.location).attr('query'), currentId;
      if ((/\d/).test(query)) {
        currentId = query.match(/id=(\d+)|CategoryID=(\d+)/);

        if (currentId) {
          if (!currentId[1]) {
            currentId = currentId[2];
          } else {
            currentId = currentId[1];
          }

        } else {
          // #27046: Adding user case where the categoryID attribute is not present on the URL
          // In this case, we should wait for the PDP call to informe us which is the activeCategory
          // So we can repaint the GN accordingly
          if (categoryID) {
            currentId = categoryID;
          } else {
            currentId = 'top';  
          }
        }

      } else {
        currentId = 'shop';
      }

      return currentId;

    },
    /**
     * Creates a new nav menu
     * @param  {String} menuId Id of the menu to retrieve from the menus object
     */
    createNavMenu: function(menuId) {
      if (menuId !== 'top') {
        menuId = this.getCurrentId(menuId);
      }

      var menu = this.get('menus')[menuId];
      // Validate that the menu exists, otherwise render the top level menu
      if (!menu || menu.type === 'Brand Index') {
        menuId = 'top';
      }

      //Top category is stored for Coremetrics. We cannot rely on dataset because
      //one category can have multiple parents.
      if (menu && menu.parent === 'shop'){
        this.set('topCategory', menu.name);
      }

      this.set('isNewNavMenu', true);
      this.navMenuItems = [];

      this.setParentMenuItems(menuId);
      this.addNavItem(menuId, 'headerRow currentRow');

      this.setChildMenuItems(menuId);

      this.set('newMenuItems', this.navMenuItems);
    },

    /**
     * Sets the child menu items
     * @param  {String} menuId Id of the menu to retrieve from the menus object
     */
    setChildMenuItems: function(menuId) {
      var currentMenu = this.get('menus')[menuId];
      var children = currentMenu.children;

      if (children) {
        if (currentMenu.brandflyout || currentMenu.brandIndexURL) {
          children = children.slice(0, 10);
        }

        if (menuId === '21994') {
          children = children.slice(0, 11);
        }

        //Shop by Category added to the top shop level in config.js
        if (menuId === '63482') {
          children = [];
        }

        var top = [];
        if (App.config.menus) {
          _.each(App.config.menus, function(item, id) {
            if (item.parent === 'top') {
              top.push(id);
            }
          });
        }

        _.each(children, function(id) {
          // Add "child" class if not a top-level menu item
          var classes = (top.indexOf(id) === -1) ? ('child ') : ('');
          this.addNavItem(id, classes);
        }, this);

        if (currentMenu.brandIndexURL) {
          this.set('menus', _.extend(this.get('menus'), {
            seeAllBrands: {
              name: 'See All Brands',
              url: currentMenu.brandIndexURL,
              classes: 'child '
            }
          }));

          this.addNavItem('seeAllBrands', 'child ');
        }
      }
    },

    /**
     * Adds a menu item to the list of menu items
     * @param  {String} menuId  Id of the menu to retrieve from the menus object
     * @param  {String} classes Classes to apply to the menu item
     */
    addNavItem: function(menuId, classes) {
      var menu = this.get('menus')[menuId];

      if (menu) {
        if (menu.gotoId) {
          menuId = menu.gotoId;
          menu.url = menu.overrideUrl;
        }

        if (menuId === 'seeAllBrands') {
          menuId = menu.url.match(/\d+$/g)[0];
        }

        var topLevelCategory;
        //This topCategory is set in _navView on menu click
        if (menu.name !== 'Menu' && menu.parent !== 'top' && menu.parent !== 'more'){
          topLevelCategory = this.get('topCategory');
        }

        this.navMenuItems.push({
          id:       menuId,
          name:     menu.name,
          url:      menu.url,
          classes:  classes || '',
          secure:   menu.secure || (undefined),
          viewless: menu.viewless || (undefined),
          cm:       menu.cm || (undefined),
          cmTopCategory: topLevelCategory
        });
      }
    },

    fetchError: function() {
      this.trigger('gn:fetchError');
    }
  });
});
