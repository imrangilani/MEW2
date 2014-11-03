/**
/**
 * @file _facetSelectionModalModel.js
 */

/**
 * attributes:
 *
 * - facet
 * - header
 */

define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  var FacetSelectionModalModel = BaseModel.extend({
    defaults: {
      selectedValues: [],
      selectedRangeValues: [],
      header: {
        id: 'facet-selection',
        title: 'Filter by',
        left: {
          title: 'cancel'
        },
        right: {
          title: 'done'
        }
      }
    }
  });

  return FacetSelectionModalModel;
});
