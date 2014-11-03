/**
 * @file
 * Handles validation and triggering of analytics
 *
 * @return {Object} analytics contains a set of analytics functions
 */

define([
  'backbone'
], function (Backbone) {
  'use strict';

  var validateAnalyticsTagEvent = function(aTag) {
    if (aTag.hasOwnProperty('tagType')) {
      return true;
    }
    return false;
  };

  var analytics = {
    /**
     * Validate an analytics "tag" and trigger the "analytics" event
     *
     * @param {Object} aTag contains the analytics "tag" data, e.g. (from _browseView.js):
     *        {
     *          tagType       : tagType,
     *          pageId        : pageId,
     *          categoryId    : categoryId,
     *          categoryName  : categoryName,
     *          searchTerm    : searchTerm,
     *          searchResults : searchResults
     *        }
     */
    triggerTag: function(aTag) {
      if (validateAnalyticsTagEvent(aTag)) {
        Backbone.trigger('analytics', aTag);
        return true;
      }

      return false;
    }
  };

  return analytics;
});
