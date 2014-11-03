define([
  'models/_navModel'
], function(NavModel) {
  'use strict';

  return NavModel.extend({

    /**
     * Return an array of sitePromotion tags for Fobs.
     * @return {Array} Array of sitePromotion tags.
     */
    getFobSitePromotions: function() {
      return {
        1001351:      'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-DESIGNERS-n',
        2910:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-WOMEN-n',
        16961:        'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-SHOES-n',
        16958:        'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-HANDBAGS-n',
        3376:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-JEWELRY-%26-ACCESSORIES-n',
        2921:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-BEAUTY-n',
        3864:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-MEN-n',
        3866:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-KIDS-n',
        3865:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-HOME-n',
        3948:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-GIFTS-n',
        3977:         'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-SALE-n'
      };
    },

    /**
     * Get the sitePromotion tag for the sub FOBs
     * @param {String} menuId Id of the sub FOB
     * @returns {String} sitePromotion tag
     */
    getSubFobSitePromotion: function(menuId) {
      if (this.isSubFob(menuId)) {
        var menu = this.get('menus')[menuId],
            parent = this.get('menus')[menu.parent],
            name = menu.name.replace('\'', '%27').replace('+', '%2B').replace('&', ' ').replace('-',' ').replace(/\s+/g, ' ').split(' ').join('_');

        // Check if the grandparent is "shop", so it's a sub FOB
        if (parent.parent === 'shop') {
          return 'NAVIGATION_MEW-_-SIDE_NAV-_-' + menu.parent + '-' + name;
        } else {
          return this.getSubFobSitePromotion(menu.parent) + '-' + name;
        }
      } else {
        return (undefined);
      }
    },

    /**
     * Check if the menu is under the top level silos in the GN.
     * @param {String} menuId Id of the sub FOB
     * @returns {Boolean} indicating if it's a sub FOB menu
     */
    isSubFob: function(menuId) {
      var menu = this.get('menus')[menuId];
      var parent = this.get('menus')[menu.parent];
      return (!_.isUndefined(parent)) && ((parent.parent === 'shop') || this.isSubFob(menu.parent));
    }

  });
});
