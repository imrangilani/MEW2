define([
  // Models
  'models/navModel',

  // Views
  'views/baseView',

  'config/config',
  'toggleNav',
  'util/util',
  'util/url',
  'views/errorOverlay',
  'util/localstorage'
], function(NavModel, BaseView, config, toggleNav, util, url, ErrorOverlay, $localStorage) {

  'use strict';

  // Singleton instance of the nav view so that it isn't re-instantiated
  var NavViewInstance;

  var NavView = BaseView.extend({

    el: '#mb-j-nav-menu',

    events: {
      'click li > a': 'menuClicked'
    },

    init: function() {

      // Menu is not initially animating
      this.animating = false;

      // Attribute for QE tests
      this.$el.attr('data-animating', 'false');

      this.model =  new NavModel({
        appModel: this.options.appModel,
        menuId: this.options.menuId
      });

      this.listenTo(this.model,'change:newMenuItems', this.render);
      this.listenTo(this.model, 'gn:fetchError', this.renderError);
      this.model.fetch();

    },

    render: function() {
      if (!this.animating && !this.model.get('isNewNavMenu')) {
        var view = this;
        this.animateNavMenu(function() {
          view.postRender();
        });
      } else {
        this.$el.html(TEMPLATE.nav(this.model.toJSON()));
        this.animating = false;
        this.postRender();
        $('#mb-nav-loading').addClass('mb-nav-loading-spinner');
      }
    },

    // Responds to a menu item being clicked by routing within the app or closing the nav
    menuClicked: function(event) {

      var $clickedMenuItem = $(event.currentTarget),
          cmElement = $clickedMenuItem.data('cm-element');

      // ignores the item click if currently animating
      if (this.animating) {
        return;
      }

      if (cmElement) {
        this.model.set('gn:actualMenuId', cmElement.toLowerCase());
      } else {
        //this.model.set('gn:actualMenuId', url.getMenuIdFromUrl($clickedMenuItem.attr('href')));
      }

      if ($clickedMenuItem.parent().hasClass('currentRow')) {
        toggleNav.toggle();
      }

      //Top category is stored for mcom Coremetrics. We cannot rely on dataset because
      //one category can have multiple parents. So we have to hack it using the displayed
      //menu as data source
      var selectedCatId = $clickedMenuItem.parent().attr('id');

      if (this.model.get('menus')[selectedCatId]) {
        if (selectedCatId === 'shop'){
          this.model.set('topCategory', selectedCatId);
        }

        if (this.model.get('menus')[selectedCatId].parent === 'shop'){
          this.model.set('topCategory', this.model.get('menus')[selectedCatId].name);
        }
      }

      // applies to nav items which lack a content view of their own
      if ($clickedMenuItem.attr('href') === 'javascript:void(0);') {
        this.viewlessId = $clickedMenuItem.parent().attr('id').toLowerCase().trim();
        this.options.menuId = this.viewlessId;
        this.options.$selectedRow = $('#' + this.viewlessId);
        this.model.updateNavMenu(this.viewlessId);
      }
      // If the menu is currently animating, prevent the animation
      if (this.animating) {
        event.preventDefault();
      }

      if (this.onMenuSelection){
        this.onMenuSelection(event);
      }
    },

    // Determines if the nav is currently visible on the page
    navIsVisible: function() {
      return $('body').hasClass('nav-toggle');
    },

    // Animates the new nav menu by updating the current nav item, removing old nav items, and adding new nav items
    animateNavMenu: function(callback) {

      // Exit if selected row is already the current row
      if (this.options.$selectedRow.hasClass('currentRow')) {
        return;
      }

      this.animating = true;

      // Attribute for QE tests
      this.$el.attr('data-animating', 'true');

      var $navMenu = $('#mb-j-nav-menu li');
      var depth;

      // Checks if the user has selected a header row and is going back up the menu hierarchy
      if (this.options.$selectedRow.hasClass('headerRow')) {
        depth = $navMenu.index(this.options.$selectedRow);
      } else {
        // Else go one level deeper into the nav hierarchy
        depth = $navMenu.index($('.currentRow')) + 1;
      }

      // The 'nth-child' node index of the navigation list
      var nthChildDepth = depth + 1;
      this.updateCurrentNavItem();
      this.removeOldNavItems(nthChildDepth, $navMenu);

      setTimeout(_.bind(function() {
        this.addNavItems(nthChildDepth + 1);
        if ($.isFunction(callback)) {
          callback();
        }
      }, this),
      config.animations.menuAnimateDelay);
    },

    // Updates the current nav item by adding the currentRow and headerRow clases and
    // removing the currentRow class from the previous current item
    updateCurrentNavItem: function() {
      $('.currentRow').removeClass('currentRow');
      this.options.$selectedRow.addClass('headerRow currentRow').removeClass('child');
    },

    /**
     * Remove old nav items from the menu list excluding the selected row
     * @param  {Number} nthChildIndex Index of the current menu depth
     * @param  {Object} $navMenu      Reference to nav menu unordered list
     */
    removeOldNavItems: function(nthChildIndex, $navMenu) {
      $('#mb-j-nav-menu').find('li:not(".headerRow"),li:gt(' + this.options.$selectedRow.prevAll().length + ')').remove();
    },

    addNavItems: function() {
      var newNavItems = TEMPLATE.nav(this.model.toJSON());
      var totalListHeight = 0;

      // If there are no list items to be added or there was a menu rendered during the animation, don't animate the menu
      if (newNavItems.indexOf('li') === -1 || this.animating === false) {

        // Close the nav menu if there are no items to be added
        if (newNavItems.indexOf('li') === -1) {

          if (!this.model.get('gn:isLoading')) {
            setTimeout(function() {
              toggleNav.toggle();
            }.bind(this),
            config.animations.menuCloseDelay);
          } else {
            util.showNavLoading();
            if ($localStorage.get('gn:categoryIndexLoaded') === false) {
              util.hideNavLoading();
            }
          }
        }

        this.$el.attr('data-animating', 'false');
        this.animating = false;
      } else {
        $('#mb-j-nav-menu').append(newNavItems);

        setTimeout(function() {
          var $items = $('#mb-j-nav-menu li');
          $items.css('position', '');
          $items.removeClass('mb-j-hidden-list-item');
          this.$el.attr('data-animating', 'false');
          this.animating = false;
        }.bind(this), 500);

        // Sets the height of each navigation item to the previous item's height and then adds the current item's height to the total height
        $('#mb-j-nav-menu li').each(function() {
          var $this = $(this);
          $this.css('top', totalListHeight);
          totalListHeight += $this.outerHeight();
        });
      }
    },

    // If GlobalNav full request fails, we:
    // - Hide the spinner
    // - Close the GlobalNav
    // - Display an overlay with an option to refresh the page
    renderError: function() {
      var errorOverlay = new ErrorOverlay({ options: { errorCode: 'globalNavError' }});

      util.hideNavLoading();

      errorOverlay.render();

      if (util.isNavLoadingInProgress()) {
        util.showNavItems();
      }
    }
  });

  //Because of the way global nav is implemented we cannot extend it to have
  //brand specific message handling. This method, which is optional parameter,
  //allows mcom to add additional processing for menu click to reset
  //coremetrics search context
  var registerMenuSelect = function(f) {
    if (!NavViewInstance) {
      NavView = NavView.extend({
        onMenuSelection: function() {
          f();
        }
      });
    } else {
      NavViewInstance.onMenuSelection = f;
    }
  };

  /**
   * Initializes a single instance of the Nav View
   * @param  {String} menuId the ID of the active menu item
   * @return {Object}        Nav View Instance
   */
  var initialize = function(menuId) {

    // If the nav menu hasn't been created, assign it a new view instance
    if (!NavViewInstance) {
      NavViewInstance = new NavView({
        options: {
          appModel: App.model,
          $selectedRow: $(menuId),
          menuId: menuId
        }
      });
    } else {

      if (!NavViewInstance.model.get('menus')) {
        NavViewInstance.model.set('menuId', menuId);
      } else {
        NavViewInstance.options.$selectedRow = $('#' + menuId);

        // If the nav is visible, the nav is not animating, and the new menu's list item is present in the menu list, update the nav menu
        // If the user navigates via the backward/forward browser button and the new item doesn't exist, create the nav menu instead of animating it
        if (NavViewInstance.navIsVisible() &&
            !NavViewInstance.animating &&
            $('#' + menuId).length !== 0) {
          if (NavViewInstance.model.get('menus')[menuId]) {
            NavViewInstance.model.updateNavMenu(menuId);
          }

        } else {
          if (!NavViewInstance.options.$selectedRow.hasClass('currentRow')) {
            // Otherwise create the nav menu from scratch
            NavViewInstance.model.createNavMenu(menuId);
          }

        }
      }
    }

    // Based on url param, show the nav
    if (App.config.ENV_CONFIG.nav_autoexpand_param !== 'off'
     && !App.router.isDeepLink() && !NavViewInstance.navIsVisible()
     && $.url().param('aen')) {
      toggleNav.toggle();
    }

    return NavViewInstance;
  };

  return { initialize: initialize,
           registerMenuSelect: registerMenuSelect };

});
