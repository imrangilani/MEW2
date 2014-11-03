'use strict';
var helpers = exports;

var config     = require('./config'),
    accounting = require('accounting'),
    moment     = require('moment'),
    url        = require('url'),
    _          = require('lodash');

// This method is used to handle optional parameters passed in from a query parameter
helpers.optionalParameter = function(argument, parameter) {
  return parameter ? argument + parameter : '';
};

helpers.sanitizeUrl = function(raw) {
  return raw.replace(/[^\w\s\-]/gi, '').replace(/\s{2,}/gi, ' ').replace(/\s/gi, '-').toLowerCase();
};

//Prepares array of image/swatch objects for one colorway
//Uses product level images, colorway primary and alternative images and colorway swatch image to figure out what to display
helpers.resolveImages = function(topLevelImages, primaryImage, additionalImages, swatchImagename, childProduct, master, supressSwatch, showSwatch) {

  //The result stack
  var formattedImages = [];

  //Object to hold one image name and, if needed, a swatch
  var colorImageSet = {};

  // memberReplaceSwatch is configured for mcom only
  var replaceSwatch = config.images.pdp && config.images.pdp.memberReplaceSwatch;
  if (childProduct && replaceSwatch && topLevelImages[0] === master.images[master.activeImageset][0].image &&
      !supressSwatch){
      colorImageSet.image = swatchImagename;
  } else {
    //if colorway has a primary image - use it as primary image to be displayed
    if (primaryImage){
      colorImageSet.image = primaryImage.imagename;

      if (showSwatch){
        colorImageSet.swatch = swatchImagename;
      }
    } else { //Use product level primary image with color swatch
      colorImageSet.image = topLevelImages[0];
      colorImageSet.swatch = swatchImagename;
    }
  }

  formattedImages.push(colorImageSet);

  //Now iterate through all colorway additional images and add them to the list to be displayed
  //if they are not there yet. Colorway alternative images have no swatches.
  _.each(additionalImages, function(image) {
    //if ((_.filter( formattedImages, {image: image.imagename} )).length === 0) {
      formattedImages.push({ image: image.imagename });
    //}
  });

  //Now iterate through all product level alternative images and add them if they not yet added through
  //colorway alternative images
  for (var i = 1, len = topLevelImages.length; i < len; i++){
    if (_.filter(formattedImages, { image: topLevelImages[i] }).length === 0) {
      colorImageSet = {};
      colorImageSet.image = topLevelImages[i];
      colorImageSet.swatch = swatchImagename;

      formattedImages.push(colorImageSet);
    }
  }

  return formattedImages;
};

helpers.prepareImages = function(primaryImage, additionalImages) {
  var formattedImages = [];

  // Sort any additional images that exist by sequenceNumber
  //var images = _.sortBy(_.clone(additionalImages || []), 'sequenceNumber');
  var images = _.clone(additionalImages || []);

  // Create an array of all images - primary and additional (should already be sorted)
  images.unshift(primaryImage || {});

  // Iterate through array of images, and send back only data needed by client
  _.each(images, function(image) {
    formattedImages.push(image.imagename);
  });

  return formattedImages;
};

helpers.buildSwatchSpriteUrls = function(colors) {
  var urlCount = Math.ceil(colors.length / config.images.pdp.swatchesPerSprite);
  var urlList = [];
  var swatchSize = config.images.pdp.swatchSize + ',' + config.images.pdp.swatchSize;

  for (var i = 0; i < urlCount; i++){
    var url = '?&$b=' + config.images.pdp.brand + '/swatches/&layer=0&size=';

    var urlSwatchCount;
    if (i === urlCount - 1) {
      urlSwatchCount = colors.length - i * config.images.pdp.swatchesPerSprite;
    } else {
      urlSwatchCount = config.images.pdp.swatchesPerSprite;
    }

    url += config.images.pdp.swatchSize * urlSwatchCount + ',' + config.images.pdp.swatchSize + '&cropN=0,0,' + urlSwatchCount + ',1&anchor=0,0';

    for (var k = 0; k < config.images.pdp.swatchesPerSprite && k < urlSwatchCount; k++){
      var index = i * config.images.pdp.swatchesPerSprite + k;
      url += '&src=is{$b$9/optimized/' + colors[index].swatch + '}&anchor=0,0&posN=' + helpers.calculateSwatchPosition(k, urlSwatchCount) + ',0&layer=' + (parseInt(k) + 1) + '&size=' + swatchSize;

    }

    url += '&op_sharpen=1&fmt=jpeg&qlt=90,0&hei=' + config.images.pdp.swatchSize;

    urlList.push(url);
  }

  return urlList;
};

helpers.calculateSwatchPosition = function(index, total) {
  var position = index * (1 / total);
  return position.toFixed(6);
};

helpers.getPrice = function(obj, type) {
  var price = {
    label: (obj.label) ? (obj.label) : '',
    type: type
  };

  if (obj.value) {
    price.value = obj.value.toFixed(2);
  } else if (obj.high) {
    price.value = obj.low.toFixed(2) + ' - ' + obj.high.toFixed(2);
  } else {
    price.value = 0;
  }

  return price;
};

/**
 * @return either a {String} or {Array} of {Objects}
 */
helpers.getAttribute = function(attributes, name) {
  if (attributes) {
    var attribute = _.find(attributes, { name: name });

    if (attribute) {
      if (attribute.values.length === 1) {
        if (attribute.values[0].value) {
          return attribute.values[0].value;
        }

        return attribute.values[0];
      }

      return attribute.values;
    }
  }

  return undefined;
};

/**
 * Returns the value of the specified domain attribute if it exists or undefined.
 * @return either an {Array} of {strings} or undefined.
 */
helpers.getDomainAttribute = function(productDetail, domainPropertyName) {
  if (!_.isUndefined(productDetail.domainValuesMap) && productDetail.domainValuesMap.domainAttribute === domainPropertyName) {
    return productDetail.domainValuesMap.values;
  }

  return undefined;
};

helpers.addAttribute = function(attributes, name, values) {
  if (_.isString(values)) {
    values = [{
      value: values
    }];
  }

  var attribute = {
    name: name,
    values: values
  };

  if (_.isArray(attributes)) {
    attributes.push(attribute);
  }

  return attribute;
};

helpers.formatV4Price = function(prices) {
  if (!_.isUndefined(prices)) {
    // Keep track of valid prices to avoid duplication
    var priceHistory = [];

    // There are four tiers of pricing from WSSG that we need to examine
    return _([prices.retail, prices.intermediate, prices.intermediatePrice, prices.original, prices.giftValue])
        .map(function(price) {
          return {
            label: (_.isUndefined(price)) ? (undefined) : (price.pricelabel),
            amt: (function() {
              if (_.isUndefined(price) || _.isUndefined(price.pricevalue) || price.pricevalue.low <= 0) {
                return -1;
              }

              //specify prefixes for low and high prices
              var lowPricePrefix = config.prices.lowPricePrefix || '$';
              var highPricePrefix = config.prices.highPricePrefix || '';

              var amt = accounting.formatMoney(price.pricevalue.low, lowPricePrefix);

              if (!_.isUndefined(price.pricevalue.high) && price.pricevalue.high > price.pricevalue.low) {
                amt += ' - ' + accounting.formatMoney(price.pricevalue.high, highPricePrefix);
              }

              // If this particular price has already been set for a different tier, we will not include it.
              if (_.contains(priceHistory, amt)) {
                // Set amt to -1 so it will be filtered out later
                return -1;
              }

              // We have a valid price that hasn't been included.
              priceHistory.push(amt);
              return amt;
            }()),
            //salePrice: (!_.isUndefined(price) && _.contains(salePrices, price.pricelabel)) ? (true) : (undefined)
          };
        })
        .filter(function(price) {
          // giftValue shows the price in the label so don't need to show the amt
          if (/value$/.test(price.label)) {
            price.amt = '';
          }
          // If a particular tier doesn't have a valid amount, ignore it
          return price.amt !== -1;
        })
        .value()
        .reverse(); // We want original, then intermediatePrice, then retail. (giftValue is an edge case)
  }

  return undefined;
};

helpers.getSaleEndDate = function(prices) {
  if (!_.isUndefined(prices)) {
    if (!_.isUndefined(prices.saleends)){
      return moment(prices.saleends.substring(0,10)).format('M/DD/YYYY');
    }
  }
  return undefined;
};

helpers.isOutlet = function(store) {
  return _.some(store.attributes, function(attribute) {
    return (attribute.attributeName === 'STORE_TYPE_DESC') && (attribute.attributeValue === 'OUT');
  });
};

helpers.getBopsAvailability = function(availability) {
  return {
    bopsEligible: (availability.bopsEligibilityStatus === 'ELIGIBLE'),
    bopsAvailable: (availability.bopsAvailabilityStatus === 'AVAILABLE' || availability.bopsAvailabilityStatus === 'LIMITED'),
    storeAvailable: (availability.storeAvailabilityStatus === 'AVAILABLE' || availability.storeAvailabilityStatus === 'LIMITED')
  };
};

helpers.and = function(value1, value2) {
  return value1 && value2;
};

helpers.or = function(value1, value2) {
  return value1 || value2;
};

helpers.equals = function(value1, value2) {
  return value1 === value2;
};

helpers.relativeURL = function(fullURL) {
  return url.parse(fullURL, true).path;
};

helpers.keepCategory = function(category, allowHiddenOnMobile) {
  return category.categorytype !== 'Hide' && (category.mobilePublish !== 'N' || allowHiddenOnMobile);
};
