/**
 * @file _facets.js
 *
 * Router functionality related specifically to managing facets in the url.
 */

define([
  'util/util'
], function(util) {
  'use strict';

  var facets = {};

  /**
   * Prepare an object of facets by normalizing facetKeys and facetValues
   *
   * @param facetKeys {String} comma-separated list of facet keys
   * @param facetKeys {String} comma-separated list of facet keys
   * @return facets {Object} normalized key->value facet mapping
   *
   * @see normalizeFacets()
   */
  facets.prepare = function(facetKeys, facetValues) {
    return normalizeFacets.call(this, decodeFacetUrl(facetKeys, facetValues));
  };

  /**
   * Build a full url given the facet data and url base
   *
   * @param attributes {Object} key->value list of facet attributes for URL generation
   * @param base {String} the URL base
   * @return url {String} full URL, including facet parameters
   */
  facets.buildUrl = function(attributes, base) {
    base = base || '/';

    // queryParamKeys are stripped from attributes, and appended to the URL as query parameters
    var queryParamKeys = ['id', 'keyword'];

    /**
     * endSegmentKeys are added to the END of the comma-separated keys (rest are sorted)
     * As of today, we are sorting all facet keys alphabetically.
     * Leaving this functionality in place, b.c. good chance it's needed on a future date.
     */
    var endSegmentKeys = [];

    var queryParams = {};
    var segmentParams = {};
    var endSegmentParams = {};

    // Compose three objects containing different keys and values based on the param type
    _.each(attributes, function(value, key) {
      // Capitalize only first letter of key; rest is lowercase
      var lowerCaseKey = key.toLowerCase();
      var formattedKey = lowerCaseKey.charAt(0).toUpperCase() + lowerCaseKey.slice(1);

      if (_.contains(queryParamKeys, lowerCaseKey)) {
        // Query params use original key
        queryParams[lowerCaseKey] = value;
      } else if (_.contains(endSegmentKeys, key)) {
        // url segments use formatted key
        endSegmentParams[formattedKey] = value;
      } else {
        segmentParams[formattedKey] = convertLegacyFacet(value, formattedKey);
      }
    });

    // Grab all extra query params (edge, coremetrics, etc) that aren't defined
    if (!_.isEmpty(this.currentRoute.$url.param())) {
      var allParams = _.clone(this.currentRoute.$url.param());

      _.each(queryParamKeys, function(queryParamKey) {
        if (allParams[queryParamKey]) {
          delete allParams[queryParamKey];
        }
      });

      if (_.size(allParams) >= 1) {
        queryParams = _.extend(queryParams, allParams);
      }
    }

    // Sort all of the facet keys, and uppercase only the first letter
    var facetKeys = _(segmentParams)
                      .keys()
                      .value()
                      .sort();

    // Go through the facet values and replace the , with %2C to create a distinction between
    // a group of facet values versus two values within a facet value group
    var facetValues = _(facetKeys)
                        .map(function(value) {
                          var facetValue = segmentParams[value];
                          if (_.isString(facetValue) && facetValue.indexOf(',') !== -1) {
                            // Look for "," and split to extract individual facet values
                            var splitValues = facetValue.split(',');

                            // Sort the multi-selected values alphabetically
                            splitValues.sort();

                            // Join sorted facetValues on "|"
                            return splitValues.join('|');
                          }
                          return facetValue;
                        })
                        .concat(_.values(endSegmentParams))
                        .value();

    // Create the url using the provided base then adding a segment of comma separated keys
    // and a segment of comma separated values
    return base + facetKeys.concat(_.keys(endSegmentParams)).join(',')
                    .replace(/&/g, '%26')
                    .replace(/\//g, '%2F') + '/' +
                  facetValues.join(',')
                    .replace(/&/g, '%26')
                    .replace(/\//g, '%2F')
                    .replace(/\?/g, '%3F') +
                  // Finally add the query parameters
                  util.buildUrl(queryParams);
  };

  /**
   * Take URL facetKeys and facetValues and create a decoded facet object.
   *
   * @param facetKeys {String} comma-separated list of facet keys
   * @param facetKeys {String} comma-separated list of facet keys
   * @return facets {Object} decoded key->value facet mapping
   */
  var decodeFacetUrl = function(facetKeys, facetValues) {
    var keys, values;

    if (_.isString(facetKeys)) {
      keys = facetKeys.split(',');

      if (_.isString(facetValues)) {
        values = facetValues.split(',');
      }
    }

    if (!keys || !values) {
      return {};
    }

    // nonFacetKeys are left alone
    var nonFacetKeys = ['pageindex', 'productsperpage', 'sortby'];

    keys = _(keys)
            .map(function(key) {
              if (_.isString(key)) {
                return key.toLowerCase();
              }
            })
            .map(function(key) {
              if (!_.contains(nonFacetKeys, key)) {
                // All facet keys should be capitalized
                return key.toUpperCase();
              }

              return key;
            })
            .value();

    return _.object(keys, _.map(values, function(segment) {
      return decodeURIComponent(segment);
    }));
  };

  /**
   * Normalize facet values considering conversions that need to be done to allow desktop urls
   *
   * @param facets {Object} key->value set of decoded facet components
   * @return facets {Object} the normalized facet object
   */
  var normalizeFacets = function(facets) {
    var changed = false,
        custratingRegex = /(\d(\.\d)?)\|(\d(\.\d)?|\*)/,
        priceRegularRegex = /(\d+(\.\d+)?)\|(\d+(\.\d+)?)/,
        priceOverRegex = /(\d+(\.\d+)?)\|(\*|\-1)/,
        priceUnderRegex = /^0\|(\d+(\.\d+)?)/,
        priceRoundedDecimalPlaceRegex = /(\d+)(\.0)$/;

    var overwritePriceUnder = false; //Indicates if it should overwrite price 'from' value if its 'under' case (overwrites with *).

    if (this.currentRoute.name === 'category') {
      overwritePriceUnder = true;
    }

    _.each(facets, function(facetValue, facetKey) {
      var custratingFacet, lowerValue;
      facetValue = decodeURIComponent(facetValue);

      // Normalize custratings facets
      if (facetKey.toUpperCase() === 'CUSTRATINGS') {

        // Check if custrating facet is in the new desktop format (* stars and up)
        if (facetValue.indexOf('stars') > -1) {
          custratingFacet = facetValue.split('|');

          // Check if its multi-select custrating facet, select the lower and ignore others
          if (custratingFacet.length > 1) {
            _.each(custratingFacet, function(custrating) {
              var stars = parseFloat(custrating.split(' ')[0]);
              if (!lowerValue || stars < lowerValue) {
                lowerValue = stars;
                facetValue = custrating;
              }
            });

            facets[facetKey] = facetValue;
            changed = true;
          }

        // Check if custrating facet is in the regular desktop format
        } else if (custratingRegex.test(facetValue)) {
          custratingFacet = facetValue.split('|');

          // Check if its multi-select custrating facet, select the lower and ignore others
          if (custratingFacet.length > 2) {
            for (var i = 0; i < custratingFacet.length; i += 2) {
              if (!lowerValue || (parseFloat(custratingFacet[i]) < lowerValue)) {
                lowerValue = parseFloat(custratingFacet[i]);
                facetValue = custratingFacet[i] + '|' + custratingFacet[i + 1];
              }
            }
          }

          facets[facetKey] = facetValue.replace(custratingRegex, '[$1 TO $3]');
          changed = true;
        }

      // Normalize price facets
      // Check if price facet has a pipe, what indicates that is a deeplink
      } else if (facetKey.toUpperCase() === 'PRICE' && (/\|/g).test(facetValue)) {

        facets[facetKey] = '';
        var priceFacet = facetValue.split('|');

        // Check if its a multi-select price facet
        for (var j = 0; j < priceFacet.length; j += 2) {

          // Round price value if it has any decimal places (remove .0)
          facetValue = priceFacet[j].replace(priceRoundedDecimalPlaceRegex, '$1') + '|' + priceFacet[j + 1].replace(priceRoundedDecimalPlaceRegex, '$1');

          if (priceOverRegex.test(facetValue)) {
            facetValue = facetValue.replace(priceOverRegex, '[$1 TO *]');
          } else if (priceUnderRegex.test(facetValue)) {
            facetValue = facetValue.replace(priceRegularRegex, overwritePriceUnder ? '[* TO $3]' : '[0 TO $3]');
          } else if (priceRegularRegex.test(facetValue)) {
            facetValue = facetValue.replace(priceRegularRegex, '[$1 TO $3]');
          }

          facets[facetKey] += (j !== 0 ? '|' : '') + facetValue;
          changed = true;
        }


      }

      // In Mew2 we separate multi-value facets with comma
      if (facets[facetKey] && _.isString(facets[facetKey])) {
        facets[facetKey] = facets[facetKey].replace(/,/g, '%2C').replace(/\|/g, ',');
      }

    });

    // Check if any facets was changed and changes the url
    if (changed) {
      this.navigate(null, { attributes: facets, replace: true });
    }

    return facets;
  };

  /*
   * Converts deeplinked facets to app format.
   * @param {String} facetValue Facet value.
   * @param {String} facetName Facet name.
   * @returns {String} Facet value converted to app format.
   */
  var convertLegacyFacet = function(facetValue, facetName) {
    var custratingRegex = /\[(\d+(\.\d+)?|\*)\sTO\s(\d+(\.\d+)?|\*|\-1)\]/i,
        priceRegularRegex = /\[(\d+(\.\d+)?|\*)\sTO\s(\d+(\.\d+)?)\]/i,
        priceOverRegex = /\[(\d+(\.\d+)?)\sTO\s(\*|\-1)\]/i,
        priceUnderRegex = /\[(\*|0|0\.0)\sTO\s(\d+(\.\d+)?)\]/i;

    switch (facetName) {
      case 'Custratings':
        facetValue = facetValue.split(',').map(function(splittedValue) {
          return encodeURIComponent(splittedValue.replace(custratingRegex, '$1|$3'));
        }).join('|');
        break;
      case 'Price':
        facetValue = facetValue.split(',').map(function(splittedValue) {
            if (priceOverRegex.test(splittedValue)) {
              return encodeURIComponent(splittedValue.replace(priceOverRegex, '$1|-1'));
            } else if (priceUnderRegex.test(splittedValue)) {
              return encodeURIComponent(splittedValue.replace(priceUnderRegex, '0|$2'));
            } else if (priceRegularRegex.test(splittedValue)) {
              return encodeURIComponent(splittedValue.replace(priceRegularRegex, '$1|$3'));
            } else {
              return encodeURIComponent(splittedValue);
            }

          }).join('|');
        break;
    }

    return facetValue;
  };

  return facets;
});
