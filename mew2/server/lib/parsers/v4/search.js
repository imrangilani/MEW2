/**
 * @file search.js
 *
 * V4 search parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _       = require('lodash'),
    nodeUrl = require('url'),
    config  = require('../config');

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request the node request object
   * @param {Object} payload the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload) {
    var response = {
      facets: parser.prepareFacets(request, payload)
    };

    // If we are not requesting only the facets, return remaining search results data
    if (request.query.show !== 'facet') {
      var products;

      // Check for products
      if (payload.searchresultgroups && payload.searchresultgroups[0].products) {
        products = payload.searchresultgroups[0].products.product;

        response.products = parser.parseProducts(products);
        response.totalproducts = payload.searchresultgroups[0].totalproducts;
      }
      if (payload.messages) {
        response.messages = payload.messages;
      }
      if (payload.redirect){
        response.redirect = payload.redirect;
      }
    }

    // Reverts the customer top ratings order
    if (response.facets) {
      var custRatingsIndex = _.findIndex(response.facets, { name: 'CUSTRATINGS' }),
        priceIndex = _.findIndex(response.facets, { name: 'PRICE' });

      if (custRatingsIndex !== -1) {
        response.facets[custRatingsIndex].value = response.facets[custRatingsIndex].value.reverse();
      }

      if (priceIndex !== -1) {
        for (var i = 0, j = response.facets[priceIndex].value.length; i < j; i++) {
          var piece = response.facets[priceIndex].value[i];

          piece.name = piece.valuedisplayname;
          delete piece.valuedisplayname;
        }
      }
    }

    return response;
  }
};

parser.parseProducts = function(products) {
  if (products) {
    // maintain a list of formatted product responses
    var formatted = [];

    _.each(products, function(product) {
      var response = {
        id: product.id,
        name: product.summary.name,
        master: product.summary.iscollection,
        rating: (!product.summary.totalreviews) ? (undefined) : ({
          avg: product.summary.customerrating,
          cnt: product.summary.totalreviews
        }),

        productURL: nodeUrl.parse(product.summary.producturl, true).path,
        badges: product.badges
      };

      // Grab the primary image from the response.
      // Per SA, we can guarantee a primary image always exists
      var primary;

      if (product.summary.iscollection) {
        primary = _.find(product.image, { imagetype: "PRIMARY_IMAGE" });
      } else {
        primary = _.find(product.image, { isPrimaryImage: true });

        if(primary && !primary.imageurl && primary.upcprimaryimage) {
          primary = primary.upcprimaryimage;
        }
      }
      if (primary) {
        response.img = primary.imageurl;
        if (primary.hasMoreColors) {
          response.moreColors = true;
        }
      }

      // Extract swatches urls
      if (product.image) {
        var swatches = [];

        _.each(product.image, function(image) {
          if (image.type === 'colorwayImage' && image.imagetype === 'COLORWAY' && image.swatchimage) {
            swatches.push({
              imageurl: image.swatchimage.imageurl,
              color: image.color,
              sequenceNumber: image.swatchimage.sequenceNumber
            });
          }
        });

        // Only include swatches in the response for this product if there are more than one
        if (swatches.length > 1) {
          response.swatches = swatches;
        }
      }

      response.price = parser.getPrices(product, response.master);

      formatted.push(response);
    });

    return formatted;
  }
};

/**
 * copied from v3/categoryBrowseProducts.js
 */
parser.getPrices = function(product, isMaster) {
  var prices = [];

  function priceSortCompare(a, b) {
    return b.value - a.value ;
  }

  if (product.price){

    // For 'Value price' edge case
    if (product.price.regular && product.price.giftsetvalue) {
      var giftsetvalue = product.price.giftsetvalue;
      var giftSet = {
        label: 'A $' + giftsetvalue + '.00 Value',
        // Don't display value, label has it
        value: ''
      };
      prices.push(parser.getPrice(giftSet, 'giftsetvalue', isMaster));

      // Add 'Only' label if it doesn't exit
      var label = product.price.regular.label;
      var regular = {
        label: label ? label : 'Only',
        value: product.price.regular.value
      };
      prices.push(parser.getPrice(regular, 'regular', isMaster));

    } else if (product.price.regular) {
      prices.push(parser.getPrice(product.price.regular, 'regular', isMaster));
    }

    if (product.price.original) {
      prices.push(parser.getPrice(product.price.original, 'original', isMaster));
    }

    if (product.price.everydayvalue) {
      var price = parser.getPrice(product.price.everydayvalue, 'everydayvalue', isMaster);

      if (!product.price.high) {
        price.label = 'Everyday Value';
      }

      prices.push(price);
    }

    if (product.price.was) {
      prices.push(parser.getPrice(product.price.was, 'was', isMaster));
    }

    if (product.price.sale && product.price.sale.label === 'Your Choice') {
      prices.push(parser.getPrice(product.price.sale, 'yourchoice', isMaster));
      product.onsale = 'sale';

    } else if (product.price.sale) {
      prices.push(parser.getPrice(product.price.sale, 'sale', isMaster));
      product.onsale = 'sale';
    }

    if (product.price.current) {
      prices.push(parser.getPrice(product.price.current, 'current', isMaster));
    }
  }

  // Edge case
  if (product.summary.iscollection && product.summary.onsale) {
    prices = [{
      label: 'On Sale',
      value: '',
      type: 'sale'
    }];
  }

  return prices.sort(priceSortCompare);
};

/**
 * copied from v3/categoryBrowseProducts.js
 */
parser.getPrice = function(obj, type, isMaster) {
  var price = {
    label: obj.label ? obj.label : '',
    type: type
  };

  function formatValue(value) { return '$' + obj[value].toFixed(2); }

  if (obj.value && typeof obj.value === 'number') {
    price.value = formatValue('value');
  } else if (obj.value === '') {
    price.value = '';
  } else {
    if (isMaster && obj.high) {
      price.value =  obj.high === obj.low ? formatValue('high') : formatValue('low') + ' - ' + formatValue('high');
    } else {
      price.value = '$0';
    }
  }

  return price;
};

/**
 * Facet objects can be in one of two formats:
 *
 * V4 FORMAT (used by this endpoint):
 * {
 *   facetname: "SPECIAL_OFFERS",
 *   displayname: "Special Offers",
 *   facetvalues: {
 *     0:  {
 *       value: "Sales & Discounts"
 *       productcount: 1800
 *     }
 *   }
 * }
 *
 * OR
 *
 * V3 FORMAT (not used by this endpoint):
 * {
 *   name: "SPECIAL_OFFERS",
 *   displayname: "Special Offers",
 *   value:
 *     0:  {
 *       name: "Sales & Discounts"
 *       values: "Sales & Discounts"
 *       productcount: 398
 *     }
 *   }
 * }
 *
 * Because v3 format is already expected by client (browse facets done first),
 * Prepare the facets for this v4 response to match the format of the v3 response.
 */
parser.prepareFacets = function(request, payload) {
  var facets = payload.facets || [];
  var bopsFacet;

  payload.facets = facets;

  if (payload.bopsFacetFlag === true && process.env.CONFIG_SEARCHBOPSFACET !== 'off') {
    parser.prepareBopsFacet(request, payload);
  }

  if (process.env.CONFIG_SEARCHBOPSFACET === 'off') {
    var bopsFacetIndex = _.findIndex(facets, { facetname: 'UPC_BOPS_PURCHASABLE' });
    if (bopsFacetIndex !== -1) {
      facets.splice(bopsFacetIndex, 1);
    }
  }

  var sanitized = _.map(facets, function(facet) {
    facet.name = facet.facetname;
    delete facet.facetname;

    facet.value = _.clone(facet.facetvalues, true);
    delete facet.facetvalues;

    _.each(facet.value, function(facetvalue) {
      if (facet.name === 'UPC_BOPS_PURCHASABLE') {
        facetvalue.name = facetvalue.valuedisplayname;
        facetvalue.values = facetvalue.value;
        delete facetvalue.valuedisplayname;
        delete facetvalue.value;
      } else {
        // "name" and "values" are both used by the client, although they appear to be the same.
        facetvalue.values = facetvalue.value;
        facetvalue.name = facetvalue.value;
        delete facetvalue.value;
      }

      if ((facetvalue.name === undefined) && (facet.name === 'PRICE')) {
        var range = facetvalue.range;
        var fromPrice = !range.fromrange || (range.fromrange === 0) ? '*' : range.fromrange;
        var toPrice = !range.torange ? '*' : range.torange;

        facetvalue.name = '[' + fromPrice + ' TO ' + toPrice + ']';
      }
    });

    if (facet.name === 'UPC_BOPS_PURCHASABLE') {
      // We want the bops facet to always appear first (or last) in the list (depending on brand).
      bopsFacet = _.clone(facet);
    }

    return facet;
  });

  if (bopsFacet) {
    _.remove(sanitized, function(facet) {
      return facet.name === 'UPC_BOPS_PURCHASABLE';
    });

    if (config.facets.bopsFacet.position === 'last') {
      sanitized.push(bopsFacet);
    } else {
      sanitized.unshift(bopsFacet);
    }
  }

  return sanitized;
};

parser.prepareBopsFacet = function(request, payload) {
  var facets = payload.facets;
  var facetDisplayName = config.facets.bopsFacet.displayName || 'Pick Up In-Store';
  var bopsFacet = _.find(facets, function(facet) {
    return facet.facetname === 'UPC_BOPS_PURCHASABLE';
  });

  // We don't need to add the BOPS facets when it's returned by the server
  if (!bopsFacet) {
    // If the server didn't return the BOPS facet we need to
    // add it as fixed (without values but visible on facet list)
    bopsFacet = {
      facetname: 'UPC_BOPS_PURCHASABLE',
      displayname: facetDisplayName,
      fixed: true,
      facetvalues: []
    };

    // If UPC_BOPS_PURCHASABLE is in the URL but the facet does not exist,
    // we have a value for this facet
    if (request.url.query.UPC_BOPS_PURCHASABLE) {
      bopsFacet.facetvalues.push({
        value: parseInt(request.url.query.UPC_BOPS_PURCHASABLE)
      });
    }

    if (config.facets.bopsFacet.position === 'last') {
      facets.push(bopsFacet);
    } else {
      facets.unshift(bopsFacet);
    }
  }

  bopsFacet.displayname = facetDisplayName;

  var indexedStores = _.indexBy(payload.stores, 'locationNumber');

  bopsFacet.facetvalues = _.map(bopsFacet.facetvalues, function(facetvalue) {
    var locationNumber = parseInt(facetvalue.value);
    var facetStore = indexedStores[locationNumber];

    if (facetStore) {
      var store = {
        valuedisplayname: facetStore.name
      };

      if (facetStore.address) {
        store.address = {
          city: facetStore.address.city,
          state: facetStore.address.state,
          zipCode: facetStore.address.zipCode
        };
      }

      if (facetStore.distance) {
        store.distance = facetStore.distance.toFixed(1);
      }

      facetvalue = _.extend(facetvalue, store);
    }

    return facetvalue;
  });

  payload.facets = facets;
};

module.exports = parser;
