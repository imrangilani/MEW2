/**
 * @file product.js
 *
 * V4 product parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var helpers = require('../helpers'),
    config  = require('../config'),
    _       = require('lodash'),
    nodeUrl = require('url'),
    brandParser = require('./product_' + config.brand);

var priceType   = { CLOSEOUT1: 16, CLOSEOUT2: 19 } ;

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request the node request object
   * @param {Object} payload the JSON response from the upstream
   * @param {Object} response the response object coming from WSSG
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload, response) {
    if (payload.product.length === 1) {
      if (payload.product[0].productDetails.availability &&
        !payload.product[0].productDetails.availability.available) {
        // this product is unavailable
        response.statusCode = 404;
        return null;
      } else {
        return parser.prepare(payload.product[0]);
      }
    }

    if (payload.product.length > 1) {
      var products = [];

      _.each(payload.product, function(product) {
        products.push(parser.prepare(product));
      });

      return products;
    }

    return null;
  }
};

/**
 * Prepare a product response.
 *
 * @param {Object} product the product information from the WSSG response
 * @param {boolean} childProduct is true when prepare() is called for each product.productDetails.childProducts
 * @param {Object} master a reference of the top-level master product response (exists if childProduct == true)
 *
 * @return response {Object} formatted for client
 *
 * @TODO - preparePDPInfo does a lot of processing that isn't necessary for other viewTypes
 */
parser.prepare = function(product, childProduct, master) {
  var response = parser.preparePDPInfo(product, childProduct, master);

  return response;
};

/**
 * Prepare product details page response data.
 *
 * Note that prepare() is called for all product.productDetails.childProducts
 *
 * Note that "undefined" is used often where "null" or "false" might normally be used;
 * This ensures the keys for any undefined items are ignored when passed to the client,
 * which helps to minimize the size of the response.
 *
 * @param {Object} product the product information from the WSSG response
 * @param {boolean} childProduct is true when prepare() is called for each product.productDetails.childProducts
 * @param {Object} master a reference of the top-level master product response (exists if childProduct == true)
 *
 * @return response {Object} formatted for client
 */
parser.preparePDPInfo = function(product, childProduct, master) {
  // details is referenced often; create a shorthand
  var details = product.productDetails;

  /**
   * Certain logic is based on the PDP template attribute, so create an easy reference to it.
   *
   *
   * Possible values:
   *     - 'Master Swatch Tab'
   *     - 'Master Multi Swatch Tab'
   *     - 'Master No Image'
   *     - 'Master Header' (default)
   */
  var template = parser.getTemplate(details);

  // Prepare the base response object with basic information
  var response = parser.prepareBasicInfo(product, template, childProduct, master);

  parser.prepareSEO(response, product);

  /**
   * Each "prepare" function appends NEW information to the response object,
   * but will not modify information that was added by a previous "prepare" function
   */
  parser.prepareImagesAndColors(response, details, template, childProduct, master);
  parser.prepareSizes(response, details);
  parser.prepareLatchkeys(response, details, template, childProduct, master);
  parser.prepareTypes(response, details);
  parser.prepareUPCs(response, product.upcs);

  // Recursively prepare the response for any child products (for master products only) - up to maxMembers
  if (response.isMaster && details.childProducts && details.childProducts.length) {
    response.members = [];

    _.each(details.childProducts, function(product) {
      // If a child product doesn't have a template, it will inherit the template of it's master collection
      if (!helpers.getAttribute(product.productDetails.attributes, 'USE_TEMPLATE_PDP')) {
        helpers.addAttribute(product.productDetails.attributes, 'USE_TEMPLATE_PDP', template);
      }
      response.members.push(parser.prepare(product, true, response));
    });
  }

  return response;
};

parser.getV4ProductURL = function(details) {
  var responseUrl = nodeUrl.parse(details.summary.productURL, true);
  return responseUrl.path + '&CategoryID=' + details.summary.defaultCategoryId;
};

parser.getCheckoutEnabled = function(details) {
  var phone = helpers.getAttribute(details.attributes, 'PHONE_ONLY');

  // Check if this is an "order by phone" product - if so, checkout is not enabled
  if ((phone && phone !== 'N') || helpers.getAttribute(details.attributes, 'CLICK_TO_CALL') === 'Y') {
    return undefined;
  }

  // The normal case is that checkout is enabled for all products that don't fall into the above logic block.
  return true;
};

/**
 * Determine whether or not a product is registrable
 * This flag is needed by the client to determine whether to display "Add to Registry" button
 */
parser.getIsRegistrable = function(details) {
  var registrable = helpers.getAttribute(details.attributes, 'REGISTRABLE');

  if (registrable === 'Wedding'){
    var notForRegistry = helpers.getAttribute(details.attributes, 'NOT_FOR_WC_REGISTRY');
    if (notForRegistry === 'Y'){
      return undefined;
    }else {
      return true;
    }

  }
  return undefined;
};

/**
 * Determine whether or not a product belongs to beauty FOB
 * This flag is needed by the client to determine how to render swatches.
 */
parser.getIsBeauty = function(product, childProduct, master) {
  if (childProduct) {
    return master.isBeauty;
  }

  var beauty = _.find(product.productCategory, { id: config.categories.beauty, type: 'rootcategory' });
  return (beauty) ? (true) : (undefined);
};

/**
 * Determine whether this product is a virtual/electronic gift card.
 * We use the value from the attributes USE_TEMPLATE or USE_TEMPLATE_PDP.
 * If one of them exists and is equal to "open value", it's a VGC/EGC.
 * @param {string} template the value of the stella attribute USE_TEMPLATE or USE_TEMPLATE_PDP
 * @returns {boolean} true if this product is a VGC/EGC
 */
parser.getIsEGC = function(template) {
  return template && template.toLowerCase() === 'open value';
};

/**
 * Determine whether or not a product is a "Find in store" item, meaning:
 *
 *     1) "phone only" or "click to call"
 *     2) in-store eligible
 *     3) NOT an online exclusive
 *
 * Used to determine display of "Find it in-store" (FIIS) functionality.
 * This flag is needed by the client to determine how to availability messaging.
 */
parser.getIsFIIS = function(response, details) {
  /**
   * response.shipping.phoneOnly is set to TRUE for PHONE_ONLY and CLICK_TO_CALL orders
   * @see getShipping()
   */
  return (response.shipping && response.shipping.phoneOnly && details.summary.checkInStoreEligibility && !response.badges.OnlineExclusive);
};

parser.isOnsale = function(prices) {
  if (!_.isUndefined(prices)) {
    if (!_.isUndefined(prices.onsale)) {
      return prices.onsale;
    }
  }
  return undefined;
};

parser.getPricingPolicyText = function(prices) {
  if (!_.isUndefined(prices)) {
    if (!_.isUndefined(prices.pricingpolicyText)) {
      return prices.pricingpolicyText;
    }
  }
  return undefined;
};

parser.getPriceType = function(prices) {
  if (!_.isUndefined(prices)) {
    if (!_.isUndefined(prices.pricetype)) {
      return prices.pricetype;
    }
  }
  return undefined;
};

parser.getCloseout = function(prices) {
  if (!_.isUndefined(prices)) {
    if (!_.isUndefined(prices.pricetype)) {
      if (prices.pricetype === priceType.CLOSEOUT1 || prices.pricetype === priceType.CLOSEOUT2){
        return prices.pricetype;
      }
    }
  }
  return undefined;
};

parser.getRating = function(product, childProduct) {
  // no rating for members of master
  if (!childProduct) {
    // Average rating should be rounded to one decimal point
    var averageRating = (product.Reviews) ? (Math.round(product.Reviews.averageOverallRating * 10) / 10) : (undefined);
    var reviewCount = (product.Reviews) ? (product.Reviews.totalReviewCount) : (undefined);

    if (averageRating && reviewCount) {
      var recommendedPercentage = 0;

      if (product.Reviews.recommendedCount > 0) {
        var totalRatedCount = product.Reviews.notRecommenedCount + product.Reviews.recommendedCount;
        recommendedPercentage = Math.round(product.Reviews.recommendedCount / totalRatedCount * 100);
      }

      // @TODO service needs `notRecommenedCount`
      product.Reviews.notRecommenedCount = product.Reviews.recommendedCount;

      return {
        avg: averageRating,
        cnt: reviewCount,
        values: parser.prepareRatingValues(product.Reviews.averageRatingValues),
        recommended: recommendedPercentage,
        detailedRatings: parser.prepareDetailedRatings(product.Reviews)
      };
    }
  }

  // No rating
  return undefined; // not necessary; being explicit for clarity
};

// Check for special offers
parser.getSpecials = function(details) {
  var specials = helpers.getAttribute(details.attributes, 'SPECIAL_OFFERS');

  if (!_.isEmpty(specials)) {
    // If specials is a string, return the string in a single-item array
    if (_.isString(specials)) {
      return [specials];
    }

    return _(specials)
        .sortBy('seqnum')
        .map(function(special) {
          return special.value;
        })
        .value();
  }

  return undefined; // not necessary; being explicit for clarity
};

parser.getBadges = function(details) {
  var badges = (details.badges || {});

  _.extend(badges, {
    OnlineExclusive: (helpers.getAttribute(details.attributes, 'ONLINE_EXCLUSIVE') === 'Y') ? (true) : (undefined),
  });

  return badges;
};

parser.getPromotions = function(product) {
  var i, productPromotions = product.promotions, parsedPromotions, promotionAttributes, promotion, offer, parsedGiftOffer;
  var promoTypes = [];
  promoTypes = ['Bundled GWP', 'PWP', 'Threshold GWP', 'Multi Threshold GWP', 'Site-Wide PWP'];

  if (!_.isEmpty(productPromotions)) {
    parsedPromotions = [];
    _.each(productPromotions, function(promotionInfo) {
      promotionAttributes = [];
      if (!_.isEmpty(promotionInfo.attributes)) {
        for (i = 0; i < promotionInfo.attributes.length; i++) {
          var promoAtributeInfo = {
            name: promotionInfo.attributes[i].name,
            value: helpers.getAttribute(promotionInfo.attributes, promotionInfo.attributes[i].name)
          };

          promotionAttributes.push(promoAtributeInfo);
        }
      }

      promotion = {
        id: promotionInfo.promotionID,
        promoType: promotionInfo.promotionType,
        attr: promotionAttributes,
        promoDescription: promotionInfo.description,
        promoOfferDescription: promotionInfo.offerDescription,
        legalDisclaimer: promotionInfo.legalDisclaimer,
        isMarketingPromo: (helpers.getAttribute(promotionInfo.attributes, 'MOBILE_MARKETING_PROMOTION') === 'Y') ? true : (undefined)
      };

      if (!_.isUndefined(promotionInfo.giftOffer) && !_.isUndefined(promotionInfo.giftOffer[0].giftProduct)) {

        parsedGiftOffer = [];
        _.each(promotionInfo.giftOffer, function(giftOffer) {

          offer = {
            shortDescription: giftOffer.giftProduct.productDetails.summary.name,
            longDescription: giftOffer.giftProduct.productDetails.summary.description,
            productUrl: giftOffer.giftProduct.productDetails.summary.productURL,
            bullets: giftOffer.giftProduct.productDetails.summary.bullets,
            warranty: (helpers.getAttribute(giftOffer.giftProduct.productDetails.attributes, 'WARRANTY') === 'Y') ? true : (undefined),
            giftWrappable: giftOffer.giftProduct.productDetails.summary.giftWrappable,
            image: giftOffer.giftProduct.productDetails.primaryImage.imagename,
            typeMap: giftOffer.giftProduct.productDetails.typeMap
          };

          parsedGiftOffer.push(offer);

        });

        _.extend(promotion, {

          giftOffer: parsedGiftOffer

        });

      }

      parsedPromotions.push(promotion);

    });

    return parsedPromotions;
  }
};

parser.getSizeCharts = function(response, details) {
  if (!response.isMaster) {
    var usSizeChart = helpers.getAttribute(details.attributes, 'SIZE_CHART');
    var intlSizeChart = helpers.getAttribute(details.attributes, 'INTL_SIZE_CHART');

    if (usSizeChart || intlSizeChart) {
      return {
        us: usSizeChart,
        intl: intlSizeChart
      };
    }
  }

  return undefined;
};

function deepPluck(collection, property) {
  var index = -1,
      length = collection ? collection.length : 0,
      result = new Array(typeof length === 'number' ? length : 0),
      properties = property.split('.'), propertyIterator;

  while (++index < length) {
    propertyIterator = collection[index];

    for (var i = 0; i < properties.length && !_.isUndefined(propertyIterator[ properties[i] ]); i++) {
      propertyIterator = propertyIterator[ properties[i] ];
    }

    result[index] = propertyIterator;
  }

  return result;
}

parser.getShipping = function(shipping, summary, attributes, upcs, productCategories) {
  var response = {
    giftWrappable: shipping.giftWrappable && summary.giftWrappable,
    surcharge: '',
    stateRestrictions: shipping.excludedStates || [],
    methods: (shipping.shippingMethods && shipping.shippingMethods.length < 3) ? (shipping.shippingMethods) : undefined,
    phoneOnly: false,
    notes: shipping.notes || [],
    returnConstraint: shipping.returnConstraint ? shipping.returnConstraint[0] : '',
    freeShipping: 0,
    specialGiftWrap: 0
  };

  var isGiftCard = _.contains(_.pluck(productCategories, 'id'), config.categories.giftcards);

  // for giftWrappable to be true, all upcs must also have giftWrappable: true
  response.giftWrappable = response.giftWrappable && _.reduce(deepPluck(upcs, 'upcDetails.availability.giftWrappable'), helpers.and);
  // for giftWrappable to be true, the product can't be of a gift cards category
  response.giftWrappable = response.giftWrappable && !isGiftCard;

  // surcharge is only displayed if all upcs have the same value
  response.surcharge = _.reduce(deepPluck(upcs, 'upcDetails.surchargeFee'), helpers.equals) ? upcs[0].upcDetails.surchargeFee : '';

  // if the product has a POBOX_RESTRICTION attribute, it should be included on the stateRestrictions list
  // TODO: this is a macys only req. Would it harm bloomies?
  var poboxAttr = helpers.getAttribute(attributes, 'POBOX_RESTRICTION');
  if (poboxAttr && poboxAttr === 'Y') {
    response.stateRestrictions.unshift('P.O.Box');
  }

  // phoneOnly should be true if the product has either attr as Y: PHONE_ONLY or CLICK_TO_CALL
  var phoneOnlyAttr = helpers.getAttribute(attributes, 'PHONE_ONLY'),
      clickToCallAttr = helpers.getAttribute(attributes, 'CLICK_TO_CALL');

  if ((phoneOnlyAttr && phoneOnlyAttr !== 'N') || (clickToCallAttr && clickToCallAttr !== 'N')) {
    response.phoneOnly = true;
  }

  // freeShipping available? Starting from how much bag value?
  var brandAttr = helpers.getAttribute(attributes, 'BRAND'),
      isCoachProduct = brandAttr && (brandAttr === 'COACH' || (brandAttr.values && (_.any(_.pluck(brandAttr.values, 'value'), 'COACH')))),
      isBeautyProduct = _.contains(_.pluck(productCategories, 'id'), config.categories.beauty);

  if (!response.phoneOnly && !isCoachProduct && !isGiftCard && !isBeautyProduct) {
    response.freeShipping = 99;
  } else if (isBeautyProduct) {
    response.freeShipping = 50;
  }

  // Special gift wrap available? At which price?
  response.specialGiftWrap = summary.giftWrapId === 102 ? (shipping.giftcost || 0) : 0;

  return response;
};

/**
 * Extract the necessary details of the master collection, if the current product is part of one
 * The method receives an array of master products and returns the basic info of the first one
 * The returned information is composed of: the collection id, name, the primary image and the URL
 */
parser.getMasterCollection = function(masterProducts) {

  //make sure we have a master product. If we dont, return undefined.
  if (_.isUndefined(masterProducts) || masterProducts.length < 1) {
    return undefined;
  }

  var collection = masterProducts[0];  //first element is the master collection this product is part of

  //format the collection details
  var collectionInfo = {
    id: collection.id,
    name: collection.productDetails.summary.name,
    image: (collection.productDetails.primaryImage) ? (collection.productDetails.primaryImage.imagename) : (undefined),
    productUrl: '/shop/product/' + helpers.sanitizeUrl(collection.productDetails.summary.name) + '?ID=' + collection.id + '&CategoryID=' + collection.productDetails.summary.defaultCategoryId
  };

  return collectionInfo;
};

/**
 * Extract the template to use to display this product.
 * There are two "Site Experience" attributes in Stella which determine the name of the template to use.
 * MCOM has ['Master Swatch Tab', 'Master Swatch Multi Tab']
 * BCOM has ['Special Master', 'Open Value', 'Chanel', 'Coach']. But only 'Special Master' is in use and it represents the use of latch keys.
 *
 * @param {Object} details the product details section of the response
 *
 */
parser.getTemplate = function(details) {
  var isMaster = !_.isUndefined(details.collection);
  var template = 'Master Header';

  //gets the template the the proper Site Experience attribute in Stella, if it has been set - or just use the default template (Master Header)
  template = helpers.getAttribute(details.attributes, 'USE_TEMPLATE_PDP') || helpers.getAttribute(details.attributes, 'USE_TEMPLATE') || template;

  //on bcom, even if a master product does not have a template attribute set in Stella, but if it has latch key values in it, we need to display them
  //using the latch keys template (Special Master)
  var customerChoice = helpers.getDomainAttribute(details, 'CUSTOMER_CHOICE');
  if (isMaster && !_.isUndefined(customerChoice) && _.size(customerChoice) > 1) {
    template = 'Special Master';
  }

  // treat "Coach" template as "Master Header"
  if (template === 'Coach') {
    template = 'Master Header';
  }

  return template;
};

/**
 * Returns the shipping availability message for a product's UPC.
 * This message depends on the 'order method' for the UPC.
 *
 * @param {Object} details the product details
 *
 * @return - the message to be used on the product detail page for this UPC about shipping information.
 */
parser.getAvailabilityMessage = function(details) {
  // gets the shipping availability message for this UPC.
  // this depends on the 'order method' and is brand-specific
  var message = brandParser.getAvailabilityMessage(details);
  return message;
};

function filterDetails(piece) {
  return (!_.contains(piece, 'javascript'));  // Remove it if it contains 'javascript'
}

parser.prepareBasicInfo = function(product, template, childProduct, master) {
  // details is referenced often; create a shorthand
  var details = product.productDetails;

  // Set up simple key -> value data
  var response = {
    id:                   product.id,
    name:                 details.summary.name,
    productUrl:           parser.getV4ProductURL(details),
    isMaster:             (_.isUndefined(details.collection)) ? (undefined) : (details.collection.iscollection || undefined),
    isMemberOfMaster:     (_.isUndefined(details.collection)) ? (undefined) : (details.collection.incollection && childProduct || undefined),
    isCheckoutEnabled:    parser.getCheckoutEnabled(details),
    isRegistrable:        parser.getIsRegistrable(details),
    isBeauty:             parser.getIsBeauty(product, childProduct, master),
    isEGC:                parser.getIsEGC(template),
    maxQty:               details.summary.maxQuantity,
    activeCategory:       details.summary.defaultCategoryId,
    activeQty:            1,
    rating:               parser.getRating(product, childProduct),
    specials:             parser.getSpecials(details),
    badges:               parser.getBadges(details),
    promotions:           parser.getPromotions(product),
    longDescription:      (helpers.getAttribute(details.attributes, 'PRODUCT_LONG_DESCRIPTION')) ? (helpers.getAttribute(details.attributes, 'PRODUCT_LONG_DESCRIPTION')) : (undefined),
    categoriesBreadcrumb: parser.prepareCategoriesBreadcrumb(product.productCategory),
    rootCategory:         parser.getRootCategory(product.productCategory),
    storeOnlyProduct:     (helpers.getAttribute(details.attributes, 'PRODUCT_DATA_SOURCE')) ? (true) : (undefined),
    warranty:             (helpers.getAttribute(details.attributes, 'WARRANTY') === 'Y') ? true : (undefined),
    rebates:              product.rebates,
    typeName:             details.summary.typeName,
    videoId:              (helpers.getAttribute(details.attributes, 'PRODUCT_VIDEO')) ? helpers.getAttribute(details.attributes, 'PRODUCT_VIDEO') : (undefined),
    brand:                details.brand.brandname
  };

  if (details.shipping) {
    response.shipping = parser.getShipping(details.shipping, details.summary, details.attributes, product.upcs, product.productCategory);
  }

  // one less bullet to be shown on member of master in case theres warranty information
  var numBullets = config.products.memberOfMasterBullets;
  if (response.warranty === true) {
    numBullets = numBullets - 1;
  }

  // Extend the response - this is done because some attributes need access to properties already added to the response, e.g. "response.isMaster"
  var detailsArray;

  if (response.isMemberOfMaster && _.isNumber(config.products.memberOfMasterBullets) && _.isArray(details.summary.bullets)) {
    detailsArray = details.summary.bullets.slice(0, numBullets);
  } else {
    detailsArray = details.summary.bullets;
  }

  response = _.extend(response, {
    prices:            response.isEGC ? undefined : helpers.formatV4Price(details.price), // Don't need prices if gift card
    details:           detailsArray ? detailsArray.filter(filterDetails) : (undefined),
    description:       (!response.isMaster && !response.isMemberOfMaster) ? (details.summary.description) : (undefined),
    sizeCharts:        parser.getSizeCharts(response, details),
    canvasId:          (process.env.CONFIG_HTMLSIZECHART !== 'off' && helpers.getAttribute(details.attributes, 'SIZE_CHART_CANVAS_ID')) ? helpers.getAttribute(details.attributes, 'SIZE_CHART_CANVAS_ID') : (undefined),
    saleEndDate:       !response.isMaster ? (helpers.getSaleEndDate(details.price)) : (undefined),
    onsale:            !response.isMaster ? parser.isOnsale(details.price) : (undefined),
    pricingPolicyText: parser.getPricingPolicyText(details.price),
    priceType:         parser.getPriceType(details.price),
    closeout:          parser.getCloseout(details.price),
    masterCollection:  (!response.isMaster && !response.isMemberOfMaster) ? parser.getMasterCollection(details.masterProducts) : (undefined),
    isFIIS:            parser.getIsFIIS(response, details)
  });

  var bulletDetails = [];
  _.each(response.details, function(detail) {
    bulletDetails.push(detail.replace(/(http:\/\/www\d).(qa\d+code|preprod\d+|)(macys|bloomingdales)(\.fds)?(\.com)/i  , ''));
  });

  response.details = bulletDetails;

  return response;
};

parser.prepareSEO = function(response, product) {
  // This functionality only applies if productCategory has been requested
  if (product.productCategory) {
    var rootCategory = _.find(product.productCategory, { type: 'rootcategory' });
    var homeCategory = _.find(product.productCategory, { type: 'homecategory' });
    var categoryString = '';

    if (homeCategory && homeCategory.name !== rootCategory.name) {
      categoryString += ' - ' + homeCategory.name;
    }

    // Per SA, we can assume rootcategory always exists
    categoryString += ' - ' + rootCategory.name;

    response.seo = {
      title: product.productDetails.summary.name,
      fobCategory: categoryString,
      desc: {
        cat: ((homeCategory) ? (homeCategory.name) : (rootCategory.name)),
        desc: (!_.isUndefined(product.productDetails.summary.description)) ? product.productDetails.summary.description : ''
      }
    };
  }
};

parser.prepareRatingValues = function(values) {
  if (values) {
    var sanitized = [];

    _.each(values, function(value) {
      sanitized.push({
        percentage: value.averageRating / value.ratingDimension.ratingRange * 100,
        label1: value.ratingDimension.label1,
        label2: value.ratingDimension.label2,
        externalId: value.ratingDimension.externalId
      });
    });

    return sanitized;
  }

  return undefined;
};

parser.prepareDetailedRatings = function(reviews) {
  var detailedRatings = {};
  if (reviews) {
    detailedRatings.countFor1Star = (!_.isUndefined(reviews.countFor1Star)) ? (reviews.countFor1Star) : 0;
    detailedRatings.countFor2Star = (!_.isUndefined(reviews.countFor2Stars)) ? (reviews.countFor2Stars) : 0;
    detailedRatings.countFor3Star = (!_.isUndefined(reviews.countFor3Stars)) ? (reviews.countFor3Stars) : 0;
    detailedRatings.countFor4Star = (!_.isUndefined(reviews.countFor4Stars)) ? (reviews.countFor4Stars) : 0;
    detailedRatings.countFor5Star = (!_.isUndefined(reviews.countFor5Stars)) ? (reviews.countFor5Stars) : 0;
  }
  return detailedRatings;
};

parser.prepareCategoriesBreadcrumb = function(categories) {
  var breadcrumb,
      rootCategory,
      homeCategory;

  if (categories && categories.length >= 2) {
    rootCategory = _.find(categories, { type: 'rootcategory' });
    if (rootCategory){
      breadcrumb = rootCategory.name;
      homeCategory = _.find(categories, { type: 'homecategory' });
      if (homeCategory && homeCategory.name !== rootCategory.name){
        breadcrumb += ' - ' + homeCategory.name;
      }
    }
  }

  return breadcrumb;
};

parser.getRootCategory = function(categories){
  var rootCategory,
      category;
  if( categories){
    category = _.find(categories, { type: 'rootcategory' });
    if( category){
      rootCategory = {id: category.id, name: category.name};
    }
  }
  return rootCategory;
},

parser.prepareImagesAndColors = function(response, details, template, childProduct, master) {
  var primaryImage, additionalImages;
  // We can sometimes ignore logic relating to images
  if (childProduct && template === 'Master No Image') {
    return;
  }

  /**
   * response.images will contain multiple arrays, keyed by an imageset id, of sequenced objects containing image and optionally swatch file names.
   * This imageset id is used by colors to determine which images/swatches to display for a given color.
   * response.images will be removed from response if empty at the end of this logic block.
   * The default images will have an imageset id of -1
   */
  response.images = {};

  /**
   * Put top level primary and additional images in memory (store in a variable), being sure to sort additionalImages.
   * Only need to include these images under the following scenarios:
   *
   *   1) for products with at least one color without its own images
   *   2) for products without any colors defined
   *
   * Also - For members of master, if the top level images match the master's top level images, we display a jumbo swatch instead
   * @TODO - not sure if this is going to be a BCOM req. as well.
   */
  var topLevelImages = [],
      topLevelImagesNeeded = false;

  if (details.primaryImage) {
    primaryImage = details.primaryImage;

    additionalImages = _.sortBy((details.additionalImages || []), 'sequenceNumber');
    topLevelImages = helpers.prepareImages(primaryImage, additionalImages);
  }

  // Check if a colorMap exists, and swatches are not suppressed
  if (!_.isUndefined(details.colorMap) && (!response.isMaster || (response.isMaster && helpers.getAttribute(details.attributes, 'SUPPRESS_COLOR_SWATCHES') !== 'Y'))) {
    // Create an array of items in colorMap that have imagetype == 'COLORWAY'
    var colors = _.filter(details.colorMap, function(colorInfo) {
      // @TODO the check for name shouldn't be necessary. Remove after data is fixed
      return colorInfo.imagetype === 'COLORWAY' && colorInfo.color.toUpperCase() !== 'NO COLOR';
    });

    // Attach an object of colors to the response, only if at least one color exists
    if (colors.length) {
      /**
       * response.colors[] will be an array of color objects, with the following keys:
       *   id       : {int} The colorwayid for this particular color (required)
       *   name     : {String} The display name for this color (required)
       *   swatch   : {String} The filepath for the swatch image associated with the color (optional)
       *   imageset : {int} The appropriate set of images to display for the particular color (optional)
       *
       * response.colors[] will be removed from response if empty at the end of this logic block.
       */
      response.colors = [];

      // Create an array of colors that also have a swatch image defined
      var colorsWithSwatches = _.filter(colors, function(colorInfo) {
        return (!_.isUndefined(colorInfo.swatchimage) && colorInfo.swatchimage.imagetype === 'SWATCH');
      });

      if (colors.length === 1 && (colorsWithSwatches.length === 0 || config.images.pdp.selectSingleColor)) {
        // This product has only one color, with no swatches - pass only minimal info needed for the color
        var colorInfo = colors[0];

        response.colors.push({
          id: colorInfo.colorwayid,
          name: colorInfo.color,
          imageset: -1
        });

        // Set default colorway to grab this color/imageset (for non-master)
        if (!response.isMaster) {
          response.activeColor = colorInfo.colorwayid;
        }

        /**
         * If there is only one color available and there is UPC primary image which is not equal to PRIMARY image
         * Then set the UPC_PRIMARY_IMAGE to primary image
         */
        if (details.primaryImage && !response.isMaster) {
          if (colorInfo.upcprimaryimage &&
              colorInfo.upcprimaryimage.imagename !== primaryImage.imagename) {
              primaryImage.imagename = colorInfo.upcprimaryimage.imagename;
          }

          topLevelImages = helpers.prepareImages(primaryImage, additionalImages);
        }

        topLevelImagesNeeded = true;
      } else {
        var hasSwatches = false;

        // Iterate through each color in the array of colorsWithSwatches to process swatches and primary/additional images
        _.each(colorsWithSwatches, function(colorInfo) {
          // prepare the object to be added to response.colors
          var color = {
            id: colorInfo.colorwayid,
            name: colorInfo.color,
            swatch: colorInfo.swatchimage.imagename
          };

          // Set up images for this particular color
          var primaryImage = colorInfo.upcprimaryimage;
          var additionalImages = colorInfo.upcadditionalimage || [];

          //This attribute in Stella can overwrite our jumbo swatch logic
          var supressSwatch = childProduct ? helpers.getAttribute(details.attributes, 'SHOW_MEMBER_IMAGE') === 'Y' : (undefined);

          //This attribute in Stella can overwrite our jumbo swatch logic
          var showSwatch = (!response.isMaster && !response.isMemberOfMaster) ? helpers.getAttribute(details.attributes, 'SHOW_JUMBO_SWATCH') === 'Y' : (undefined);

          // Attach primary/alternative images and swatches to response.images, with the current colorwayid as the imageset
          response.images[colorInfo.colorwayid] = helpers.resolveImages(
            topLevelImages,
            primaryImage,
            additionalImages,
            colorInfo.swatchimage.imagename,
            childProduct,
            master,
            supressSwatch,
            showSwatch
          );

          // Use color id of current color to use this color's images when color is clicked
          color.imageset = colorInfo.colorwayid;

          // The color object is sanitized, and ready to be added to response.colors[]
          response.colors.push(color);

          // If this is the default color, reference it in the top level response object
          if (colorInfo.isdefault && !response.isMaster) {
            response.activeColor = colorInfo.colorwayid;
          }

          //If this color has a swatch, add a flag to top-level response for this product
          if (!hasSwatches && colorInfo.swatchimage.imagename) {
            hasSwatches = true;
            response.hasSwatches = true;
          }
        });

        response.swatchSprites = helpers.buildSwatchSpriteUrls(response.colors);
      }
    } else {
      // No valid colors
      topLevelImagesNeeded = true;
    }
  } else {
    // No colorMap in the response, or swatches suppressed from display
    topLevelImagesNeeded = true;
  }

  if (response.images) {
    if (response.activeColor) {
      response.activeImageset = _.find(response.colors, function(color) {
        return color.id === response.activeColor;
      }).imageset;
    } else {
      //If no default color in the dataset, default to the first color
      //if configured (for mcom only) and not master product
      if (config.images.pdp && config.images.pdp.forceDefaultColor && response.colors && response.colors.length && !response.isMaster){
        response.activeColor = response.colors[0].id;
        response.activeImageset = response.colors[0].id;
      } else {
        response.activeImageset = -1;
        topLevelImagesNeeded = true;
      }
    }
  }

  /**
   * If the top level images are needed, add them to response.images with the default imageset id as the key
   */
  if (topLevelImagesNeeded && !_.isEmpty(topLevelImages)) {
    // Attach primary/alternative images to response.images
    response.images[-1] = _.map(topLevelImages, function(imagename) {
      return { image: imagename };
    });
  }

  // Don't pass response.images if empty
  if (_.isEmpty(response.images)) {
    delete response.images;
  }

  // Don't pass response.colors if empty
  if (_.isEmpty(response.colors)) {
    delete response.colors;
  } else if (!response.activeColor && (response.colors.length === 1)) {
    // If there's only one color the user will not be able to select it.
    // In this case we need to set it as activeColor
    response.activeColor = response.colors[0].id;
  }
};

parser.prepareSizes = function(response, details) {
  // Check to see if a SizeMap exists, and has at least one item in it
  if (!_.isEmpty(details.SizeMap)) {
    response.sizes = [];

    if (details.SizeMap.length === 1) {
      // This product has only one size - Pass only minimal info needed to display the size
      var size = details.SizeMap[0];

      response.sizes.push({
        name: size.sizenormal,
        id: size.sizeid
      });

      response.activeSize = size.sizeid;
    } else {
      // Sort sizes by sequenceNumber
      var sizes = _.sortBy(details.SizeMap, 'sequenceNumber');

      // Iterate through each size in the sorted array and prepare response data
      _.each(sizes, function(sizeInfo) {
        var size = {
          id: sizeInfo.sizeid,
          name: sizeInfo.sizenormal
        };

        // Add the size info to the main response.sizes[]
        response.sizes.push(size);
      });
    }
  }
};

parser.prepareLatchkeys = function(response, details, template, childProduct, master) {
  if (template === 'Master Swatch Tab' || template === 'Master Multi Swatch Tab' || template === 'Special Master') {
    if (!childProduct && !_.isUndefined(details.domainValuesMap) && _.size(details.domainValuesMap.values) >= 1) {
      // This is a master product
      response.latchkeys = details.domainValuesMap.values;

      // If there is a "Queen" latchkey, set this to the default latchkey
      response.activeLatchkey = _.findIndex(response.latchkeys, function(latchkey) {
        return (latchkey === 'Queen');
      }) || 0;

      // If there is no "queen" latchkey, default to the first latchkey
      if (response.activeLatchkey === -1) {
        response.activeLatchkey = 0;
      }
    } else if (childProduct && !_.isUndefined(master.latchkeys) && master.latchkeys.length >= 1) {
      // This is a member of master product, for display on the master template
      // Look for the specific attributes that would contain latchkeys
      var latchkeys = helpers.getAttribute(details.attributes, 'CUSTOMER_CHOICE');
      if (!latchkeys) {
        latchkeys = helpers.getAttribute(details.attributes, 'SPECIAL_SIZE');
      }
      if (!latchkeys) {
        latchkeys = helpers.getAttribute(details.attributes, 'MASTER_PAGE_HEADER');
      }

      if (latchkeys) {
        if (_.isArray(latchkeys)) {
          response.latchkeyIds = _(latchkeys)
              .map(function(latchkey) {
                return _.indexOf(master.latchkeys || [], latchkey.value);
              })
              .value();
        } else {
          // getAttribute returned a single latchkey
          response.latchkeyIds = [_.indexOf(master.latchkeys || [], latchkeys)];
        }
      } else {
        /**
         * This childProduct does not have latchkeys, but the master product has domainValueMaps - associate with "More items"
         * Note that the master product domainValueMaps might already have a "more items" latchkey - if not, we must create it.
         */
        var orphanLatchkey = config.products.latchkeyForOrphanMembers;

        if (orphanLatchkey) {
          var orphanLatchkeyIndex = _.findIndex(master.latchkeys, function(latchkey) {
            return (latchkey === orphanLatchkey);
          });

          if (orphanLatchkeyIndex === -1) {
            orphanLatchkeyIndex = master.latchkeys.length;
            master.latchkeys.push(orphanLatchkey);
          }

          response.latchkeyIds = [orphanLatchkeyIndex];

        } else {
          response.latchkeyIds = _.map(master.latchkeys, function(elem, index) {
            return index;
          });
        }

      }
    }
  }
};

parser.prepareTypes = function(response, details) {
  // Check to see if a TypeMap exists, and has at least one item in it
  if (!_.isEmpty(details.typeMap)) {
    response.types = [];
    var types = details.typeMap;

    if (details.typeMap.length === 1) {
      // This product has only one type - Pass only minimal info needed to display the type
      response.types.push({
        id: types[0].typeId,
        name: types[0].type
      });

      // If there is only one type, set activeType
      response.activeType = types[0].typeId;
    } else {
      // Iterate through each type in the sorted array and prepare response data
      _.each(types, function(typeInfo) {
        var type = {
          id: typeInfo.typeId,
          name: typeInfo.type
        };

        // Add the type info to the main response.types[]
        response.types.push(type);
      });
    }
  }
};

parser.prepareUPCs = function(response, upcs) {
  if (upcs) {
    response.upcs = {};

    _.each(upcs, function(upc) {
      var details = upc.upcDetails; // shorthand

      if (details.active && details.availability.available) {
        parser.prepareUPC(response, upc);
        parser.prepareSizeColorMapping(response, details);
        parser.prepareTypeColorMapping(response, details);
      }
    });
  }

  if (_.isEmpty(response.upcs)) {
    delete response.upcs;
  }
};

parser.prepareUPC = function(response, upc) {
  var details = upc.upcDetails; // shorthand

  /**
   * The part that makes a UPC unique from the app's standpoint is the UPC key generated.
   *
   * There are three possibilities:
   *     1) "colorwayid" - for UPCs with colorwayid and no sizeid
   *     2) "colorwayid-sizeid" - for UPCs with both colorwayid and sizeid
   *     3) "colorwayid-typeId" - for UPCs with both colorwayid and typeId
   *     3) "-1" - for UPCs without either colorwayid or sizeid
   *
   * A single product's UPCs will fall into ONLY ONE of these three patterns, so
   * the client can guarantee a consistent convention for all UPC keys in the response.
   *
   * For UPCs that follow the third pattern (no colorwayid or sizeid), the client
   * can guarantee a SINGLE UPC for that given product (or child product)
   */

  var key = -1;
  if (details.colorwayid) {
    // Look to see if there is a color in the response for this particular colorway id
    // @TODO - this shouldn't be necessary, but there are certain colorwayids that say "No Color" - bad data

    var color = _.find(response.colors, function(color) {
      return color.id === details.colorwayid;
    });

    if (color) {
      key = details.colorwayid;
    }
  }

  if (details.sizeid) {
    if (key !== -1) {
      key += '-' + details.sizeid;
    } else {
      key = details.sizeid.toString();
    }
  }
  else if (details.typeId) {
    if (key !== -1) {
      key += '-';
    }
    key += details.typeId;
  }

  response.upcs[key] = {
    id: upc.upcnumber,
    availMsg: parser.getAvailabilityMessage(details),
    instore: details.availability.inStoreEligibility || undefined,
    method: details.availability.orderMethod || undefined,
    upcid: details.availability.upcId || undefined
  };
};

parser.prepareSizeColorMapping = function(response, details) {
  if (details.colorwayid && details.sizeid) {
    // Map the size to the color
    var color = _.find(response.colors, function(color) {
      return color.id === details.colorwayid;
    });

    if (color) {
      if (_.isUndefined(color.sizeIds)) {
        color.sizeIds = [];
      }

      color.sizeIds.push(details.sizeid);
    }

    // Map the color to the size
    var size = _.find(response.sizes, function(size) {
      return size.id === details.sizeid;
    });

    if (size) {
      if (_.isUndefined(size.colorIds)) {
        size.colorIds = [];
      }

      size.colorIds.push(details.colorwayid);
    }
  }
};

parser.prepareTypeColorMapping = function(response, details) {
  if (details.colorwayid && details.typeId) {
    // Map the type to the color
    var color = _.find(response.colors, function(color) {
      return color.id === details.colorwayid;
    });

    if (color) {
      if (_.isUndefined(color.typeIds)) {
        color.typeIds = [];
      }

      color.typeIds.push(details.typeId);
    }

    // Map the color to the type
    var type = _.find(response.types, function(type) {
      return type.id === details.typeId;
    });

    if (type) {
      if (_.isUndefined(type.colorIds)) {
        type.colorIds = [];
      }

      type.colorIds.push(details.colorwayid);
    }
  }
};

module.exports = parser;
