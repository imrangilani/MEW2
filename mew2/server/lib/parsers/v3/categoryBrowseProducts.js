/**
 * @file categoryBrowseProducts.js
 *
 * V3 category product parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */
'use strict';

var _       = require('lodash'),
    nodeUrl = require('url'),
    helpers = require('../helpers'),
    hapi    = require('hapi'),
    config  = require('../config');

var VGC_CAT_ID = 30668;

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
    // some categories should not be visible on the Global Navigation:
    //  - mobilePublish === 'N' or
    //  - categorytype === 'Hide'
    // if they are deep-linked, MCOM returns 404 and BCOM shows the products normally
    // EDIT: now return products for MCOM
    if (!helpers.keepCategory(payload.category[0].summary, config.categories.options.allowDeepLinkIfNotMobilePublished)) {
      return hapi.error.notFound();
    }

    var struct = {
      resultsperpage: payload.resultsperpage,
      currentpage: payload.currentpage,
      responsetime: payload.resptime,
      category: {
        id: payload.category[0].id,
        name: payload.category[0].summary.mobileName || payload.category[0].summary.name,
        type: payload.category[0].summary.categorytype,
        url: parser.normalizeUrl(payload.category[0].summary.categorypageurl),
        totalproducts: payload.category[0].totalproducts,
        pageId: payload.category[0].summary.pageId,
        pageType: payload.category[0].summary.pageType,
        overrideUrl: payload.category[0].summary.overrideUrl,
        clickable: payload.category[0].summary.clickable,
        parentCatId: this.getParentCatId(payload.category[0]),
        parentCatName: this.getParentCatName(payload.category[0]),
        parentUrl: this.getParentUrl(payload.category[0])
      },
      facets: this.prepareFacets(request, payload),
      productpool: []
    };

    if (struct.category.id === VGC_CAT_ID) {
      struct.category.isEGC = true;
    }

    struct.seo = {
      title: payload.category[0].summary.pageTitle || '',
      desc: payload.category[0].summary.metaDesc || ''
    };

    // Reverts the customer top ratings order
    if (struct.facets) {
      for (var i = 0; i < struct.facets.length; i++) {
        if (struct.facets[i].name === 'CUSTRATINGS') {
          struct.facets[i].value = struct.facets[i].value.reverse();
        }
      }
    }

    if (payload.category[0].product) {
      struct.products = parser.parseHelper(payload, struct);
    }

    // Parses product pool products (Currently being used on Splash and Sub-splash pages)
    if (payload && payload.category[0] && payload.category[0].productpool) {
      parser.productPoolParser(payload, struct);
    }

    return struct;
  },

  prepareFacets: function(request, payload) {
    var category = payload.category[0],
        facets = category.facet || [],
        bopsFacetIndex,
        bopsFacet;

    payload.category[0].facet = facets;

    if (category.bopsfacetavailable === true && process.env.CONFIG_BROWSEBOPSFACET !== 'off') {
      this.prepareBopsFacet(request, payload);
    }

    bopsFacetIndex = _.findIndex(facets, { name: 'UPC_BOPS_PURCHASABLE' });

    if (bopsFacetIndex !== -1) {
      if (process.env.CONFIG_BROWSEBOPSFACET === 'off') {
        facets.splice(bopsFacetIndex, 1);
      } else {
        bopsFacet = facets[bopsFacetIndex];
      }
    }

    if (bopsFacet) {
      _.remove(facets, function(facet) {
        return facet.name === 'UPC_BOPS_PURCHASABLE';
      });

      if (config.facets.bopsFacet.position === 'last') {
        facets.push(bopsFacet);
      } else {
        facets.unshift(bopsFacet);
      }
    }

    return facets;
  },

  prepareBopsFacet: function(request, payload) {
    var facets = payload.category[0].facet,
        stores = payload.stores;

    var indexedStores;
    var facetDisplayName = config.facets.bopsFacet.displayName || 'Pick Up In-Store';
    var bopsFacet = _.find(facets, function(facet) {
      return facet.name === 'UPC_BOPS_PURCHASABLE';
    });

    // We don't need to add the BOPS facets when it's returned by the server
    if (!bopsFacet) {
      // If the server didn't return the BOPS facet we need to
      // add it as fixed (without values but visible on facet list)
      bopsFacet = {
        name: 'UPC_BOPS_PURCHASABLE',
        displayname: facetDisplayName,
        fixed: true,
        value: []
      };

      // If UPC_BOPS_PURCHASABLE is in the URL but the facet does not exist,
      // we have a value for this facet
      if (request.url.query.UPC_BOPS_PURCHASABLE) {
        bopsFacet.value.push({
          values: parseInt(request.url.query.UPC_BOPS_PURCHASABLE)
        });
      }

      if (config.facets.bopsFacet.position === 'last') {
        facets.push(bopsFacet);
      } else {
        facets.unshift(bopsFacet);
      }
    }

    bopsFacet.displayname = facetDisplayName;
    indexedStores = _.indexBy(stores, 'locationNumber');

    bopsFacet.value = _.map(bopsFacet.value, function(facetvalue) {
      var locationNumber,
          facetStore;

      locationNumber = parseInt(facetvalue.values);
      facetStore = indexedStores[locationNumber];

      // Add the store details to the facet
      if (facetStore) {
        var store = {
          name: facetStore.name
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

    payload.category[0].facet = facets;
  },

  getParentUrl: function(category) {

    var parentUrl;

    if (category.parentcategory &&
      category.parentcategory.summary &&
      category.parentcategory.summary.categorypageurl) {

      parentUrl = category.parentcategory.summary.categorypageurl.replace(/^(?:\/\/|[^\/]+)*\//, '');
    }

    return parentUrl;
  },

  getParentCatId: function(category) {
    var parentCatId;

    if (category.parentcategory) {
      parentCatId = category.parentcategory.id;
    }

    return parentCatId;
  },

  getParentCatName: function(category) {
    var parentCatName;

    if (category.parentcategory && category.parentcategory.summary) {
      parentCatName = category.parentcategory.summary.name;
    }

    return parentCatName;
  }
};

parser.normalizeUrl = function(data) {
  return nodeUrl.parse(data).path.replace('&edge=hybrid', '');
};

parser.parseHelper = function(payload, struct, productPool) {
  var length, serviceProduct;

  function findPrimary(imageSet) {
    return imageSet.isPrimaryImage && imageSet.isPrimaryImage === true;
  }

  function findCollectionPrimary(imageSet) {
    return imageSet.imagetype === 'PRIMARY_IMAGE';
  }

  function findUpcPrimaryImage(imageSet) {
    return imageSet.hasOwnProperty('upcprimaryimage') && imageSet.isPrimaryImage === true;
  }

  function priceSortCompare(a, b) {
    return b.value - a.value ;
  }

  var products = [];

  if (productPool) {
    length = productPool.product ? productPool.product.product.length : 0;
    // if we are parsing a product pool, we limit the number of products to 12
    if (length > 12) {
      length = 12;
    }
  } else {
    length = payload.category[0].product.product.length;
  }


  var isGiftCard = (payload.category[0].id === VGC_CAT_ID);

  for (var i = 0; i < length; i++) {
    var prices = [];

    if (productPool) {
      serviceProduct = productPool.product.product[i];
    } else {
      serviceProduct = payload.category[0].product.product[i];
    }

    var product = {
      id: serviceProduct.id,
      name: serviceProduct.summary.name,
      master: serviceProduct.summary.iscollection,
      isOnSale: serviceProduct.summary.onsale,

      //Todo extended characters like Lancome
      productURL: parser.getV3ProductURL(serviceProduct, payload),
      badges: serviceProduct.badges
    };

    if (!isGiftCard) {
      product.rating = (!serviceProduct.summary.totalreviews) ? (undefined) : ({
        avg: serviceProduct.summary.customerrating,
        cnt: serviceProduct.summary.totalreviews
      });
    }

    // Find first object with primary image
    // Per SA, we can guarantee a primary image always exists
    var primary;

    if (serviceProduct.summary.iscollection) {
      primary = serviceProduct.image.filter(findCollectionPrimary)[0];
    } else if (serviceProduct.image) {
      primary = serviceProduct.image.filter(findPrimary)[0];

      if (primary && !primary.imageurl && primary.upcprimaryimage) {
        primary = primary.upcprimaryimage;
      }
    }

    if (primary) {
      product.img = primary.imageurl;
      if (primary.hasMoreColors) {
        product.moreColors = true;
      }
    }

    if (serviceProduct.price && !isGiftCard) {
      try {
        if (serviceProduct.price.regular && serviceProduct.price.giftsetvalue) {
          var giftsetvalue = serviceProduct.price.giftsetvalue;
          var giftSet = {
            label: 'A $' + giftsetvalue + '.00 Value',
            // Don't display value, label has it
            value: ''
          };
          prices.push(parser.getPrice(giftSet, 'giftsetvalue', product.master));

          // Add 'Only' label if it doesn't exit
          var label = serviceProduct.price.regular.label;
          var regular = {
            label: label ? label : 'Only',
            value: serviceProduct.price.regular.value
          };
          prices.push(parser.getPrice(regular, 'only', product.master));

        } else if (serviceProduct.price.regular) {
          prices.push(parser.getPrice(serviceProduct.price.regular, 'regular', product.master));
        }

        if (serviceProduct.price.original) {
          prices.push(parser.getPrice(serviceProduct.price.original, 'original', product.master));
        }

        if (serviceProduct.price.everydayvalue) {
          var price = parser.getPrice(serviceProduct.price.everydayvalue, 'everydayvalue', product.master);
          if (!serviceProduct.price.high) {
            price.label = 'Everyday Value';
          }
          prices.push(price);
        }

        if (serviceProduct.price.was) {
          prices.push(parser.getPrice(serviceProduct.price.was, 'was', product.master));
        }

        if (serviceProduct.price.sale && serviceProduct.price.sale.label === 'Your Choice') {
          prices.push(parser.getPrice(serviceProduct.price.sale, 'yourchoice', product.master));
          product.onsale = 'sale';

        } else if (serviceProduct.price.sale) {
          prices.push(parser.getPrice(serviceProduct.price.sale, 'sale', product.master));
          product.onsale = 'sale';
        }

        if (serviceProduct.price.current) {
          prices.push(parser.getPrice(serviceProduct.price.current, 'current', product.master));
        }
      } catch (exp) {
        console.log('Product:' + serviceProduct.id + 'Parsing Browse Prices' + exp);
      }

      prices.sort(priceSortCompare);
    }

    // Edge case
    if (product.master && product.isOnSale) {
      prices = [{
        label: 'On Sale',
        value: '',
        type: 'sale'
      }];
    }

    product.price = prices;

    if (isGiftCard) {
      delete product.price;
    }

    //Extract swatches urls
    if (serviceProduct.image){
      var swatches = [];
      for (var j = 0, len = serviceProduct.image.length; j < len; j++){

        if (serviceProduct.image[j].type === 'colorwayImage' && serviceProduct.image[j].imagetype === 'COLORWAY' && serviceProduct.image[j].swatchimage){
          swatches.push({
            imageurl: serviceProduct.image[j].swatchimage.imageurl,
            color: serviceProduct.image[j].color,
            sequenceNumber: serviceProduct.image[j].swatchimage.sequenceNumber
          });
        }
      }

      if (swatches.length > 1) {
        product.swatches = swatches;
      }
    }

    products.push(product);
  }

  return products;

};

// Parses Product Pools for both Splash and Subsplash pages
parser.productPoolParser = function(payload, struct) {
  var i, productPools = payload.category[0].productpool;

  var prioritySortCompare = function(a, b) {
    return a.priority - b.priority;
  };

  // Product Pool structure
  var PoolStruct = function(poolname, products, shopall, priority, poolType, shopAllText) {
    this.poolname = poolname;
    this.products = products;

    if (shopall) {
      // full absolute URL. return relative url
      this.shopall = parser.normalizeUrl(shopall);
    }

    this.priority = priority;
    this.poolType = poolType;
    this.shopAllText = shopAllText;
  };

  // Set the priority levels defined by business
  var priority = function(productPoolType) {

    var priorityLevels = ['PRODUCT_PANEL_POOL', 'PRODUCT_PANEL_CATEGORY_FACET', 'PRODUCT_PANEL_CATEGORY', 'RECENTLY_REVIEWED'];

    return priorityLevels.indexOf(productPoolType);
  };

  // Create product pool objects and set them to the main object structure
  for (i = 0; i < payload.category[0].productpool.length; i++) {
    struct.productpool.push(new PoolStruct(productPools[i].poolDisplayName,
      parser.parseHelper(payload, struct, productPools[i]),
      productPools[i].shopall,
      priority(productPools[i].poolname),
      productPools[i].poolname,
      productPools[i].shopAllText));
  }

  // Order the product pools based on their business priority
  // The array has the bigger priority in the first position
  struct.productpool.sort(prioritySortCompare);
};

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

parser.getV3ProductURL = function(serviceProduct, payload) {
  var responseUrl = nodeUrl.parse(serviceProduct.summary.producturl, true);
  return responseUrl.path + '&CategoryID=' + payload.category[0].id;
};

parser.normalizeUrl = function(data) {
  return nodeUrl.parse(data).path.replace('&edge=hybrid', '');
};

module.exports = parser;
