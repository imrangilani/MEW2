/**
 * @file _hooks.js
 *
 * General route handler callback hooks for use across multiple route handlers.
 * Allows route handlers to hook into various steps of route handler callback execution.
 *
 * @see _core/_handlers
 */

define([
], function() {
  'use strict';

  var hooks = {
    /**
     * Called at the very begining of the route callback, before any data setup.
     *
     * A good use-case for preExecute is to manipulate the current route early,
     * i.e. Hooks.preExecute.convertHashbangURL() - before data is set up.
     *
     * {this} is a reference to the router
     */
    preExecute: {
      // Convert a legacy (hashbang) url into the corresponding pushState URL that the app understands
      convertHashbangURL: function() {
        var keys = [], values = [];

        // Extract info from URL for reconstruction
        var fragment = this.currentRoute.$url.attr('fragment'),
            id       = this.currentRoute.params.id,
            keyword  = this.currentRoute.params.keyword;

        // Check for legacy "hashbang"
        if (fragment.indexOf('!fn=') === 0) {
          // Strip out any extra non-WSSG params from the fragment
          var extra = '';
          var strpos = fragment.indexOf('&');
          if (strpos !== -1) {
            extra = fragment.slice(strpos + 1);
          }

          var legacyString = decodeURIComponent(fragment.replace('!fn=', '').replace('&' + extra, ''));

          // The facet keys/values might have '&' in the string, so must replace with token before splitting apart attributes
          // Also, "Style&co." must be handled uniquely due to the ampersand without surrounding spaces
          var attributes = legacyString.replace(/ \& /g, '{ AND }').replace('Style&co.', '{sc}').split('&');
          attributes = _.map(attributes, function(attribute) {
            return attribute.replace(/\{ AND \}/g, ' & ').replace('{sc}', 'Style&co.');
          });

          /**
           * attributes is now an array, with each item in the following format:
           *    key=value
           * Parse the keys and values into individual arrays
           *
           * nonFacetKeys from fragment need case conversion
           */
          var nonFacetKeys = ['pageIndex', 'productsPerPage', 'sortBy'];
          _.each(attributes, function(attribute) {
            var obj = attribute.split('='),
                key = obj[0];

            // Handle case conversion for non-facet keys
            if (_.contains(nonFacetKeys, key)) {
              var lowerCaseKey = key.toLowerCase();
              key = lowerCaseKey.charAt(0).toUpperCase() + lowerCaseKey.slice(1);
            }

            // the fragment uses `;;` to separate multi-value facets; we use `,`
            var val = obj[1].replace(/;;/g, ',');

            keys.push(key);
            values.push(val);
          });

          attributes = _.object(keys, values);

          // Add key attributes before navigating
          if (id) {
            attributes.id = id;
          }
          if (keyword) {
            attributes.keyword = keyword;
          }

          // Update URL without triggering router, while replacing history entry
          this.navigate(null, { attribues: attributes, replace: true });
        }
      }
    },

    /**
     * Called after data is set up, right before it is validated. Gives the route
     * handler a chance to manipulate the data before validation/routing.
     *
     * A good use-case for preValidate is to append information to the data object,
     * Or check for legacy data. i.e. if (data.categoryid) { data.id = data.categoryid }
     *
     * @params data {Object} a reference to the current data object. Can be changed by each preValidate hook and defaults
     *                       to the combination of the requiredKeys' data and optionalKeys' data, as well as facet data
     *
     * {this} is a reference to the router
     */
    preValidate: {
      /**
       * Certain routes that have info about products per page need to be normalized for mobile.
       * On mobile, we show a maximum of 24 products on a single page.
       *
       * @param {Object} data values contains key-value pairs of all values extracted from the url
       */
      normalizeProductsPerPage: function(data) {
        if (data.productsperpage) {
          var perpage = parseInt(data.productsperpage);
          if (perpage > 24) {
            data.productsperpage = 24;
            this.navigate(null, { attributes: data, replace: true });
          }
        }
      },

      /**
       * Legacy "/shop" Category URLs can be identified by the following pattern:
       *
       *     /shop/[legacy]/../?id=[categoryId]
       *
       * Where "/../" can be 0 or more additional URL segments, and "legacy" is one of the following:
       *
       *    var legacy = ['womens', 'mens', 'beauty', 'juniors', 'kids', 'plus-sizes']
       *
       * If any URL fits this criteria, navigate to /shop?id=[categoryId] and trigger router
       */
      checkLegacyCategoryURL: function() {
        // Load legacy urls from config
        var legacy = App.config.legacyUrls;

        if (this.currentRoute.$url.segment(1) === 'shop' && this.currentRoute.params.id && _.indexOf(legacy, this.currentRoute.$url.segment(2)) !== -1) {
          this.navigate('shop?id=' + this.currentRoute.params.id, { trigger: true, replace: true });
          return false;
        }

        return true;
      }
    }
  };

  return hooks;
});
