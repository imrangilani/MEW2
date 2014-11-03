/**
 * @file _hooks.js
 *
 * Extend common hooks file
 *
 * @see _core/_hooks
 */

define([
  'router/_core/hooks'
], function(commonHooks) {
  'use strict';

  var hooks = {
    preExecute: {},
    preValidate: {}
  };

  _.extend(hooks.preExecute, _.clone(commonHooks.preExecute), { });

  _.extend(hooks.preValidate, _.clone(commonHooks.preValidate), {
    /**
     * @TODO - check data.pageid to work for search and browse
     *          var killswitch = (data.pageid === 'search') ? ('searchbopsfacet') ('browsebopsfacet');
     *          if (App.config.ENV_CONFIG[killswitch] === 'off') ...
     */
    killswitchBopsFacet: function(data) {
      /**
       * Disable bops facet based on killswitch
       */
      var killswitch = (this.currentHandler.name === 'category') ? (App.config.ENV_CONFIG.browsebopsfacet) : (null);
      if (!killswitch) {
        killswitch = (this.currentHandler.name === 'search') ? (App.config.ENV_CONFIG.searchbopsfacet) : (null);
      }

      if (killswitch === 'off') {
        var updateUrl = false;
        if (data.UPC_BOPS_PURCHASABLE) {
          updateUrl = true;
          delete data.UPC_BOPS_PURCHASABLE;
        }

        if (updateUrl) {
          this.navigate(null, { attributes: data, replace: true });
        }
      }
    }
  });

  return hooks;
});
