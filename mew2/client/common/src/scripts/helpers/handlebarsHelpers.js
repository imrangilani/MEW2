/**
 * @file
 * Register helpers to be used by the handlebars template library.
 *
 * @see http://handlebarsjs.com/block_helpers.html
 */

define([
  'handlebars',
  'moment',
  'util/util'
], function(Handlebars, moment, util) {
  'use strict';

  /**
   * Slice an array, and return the context of that subset.
   *
   * Similar to Array.prototype.slice(), accepts "start" and "end" params.
   * @see http://www.w3schools.com/jsref/jsref_slice_array.asp
   *
   * start: Follows prototype rules. In addition, accepts the following keyword(s):
   *          - "half" - Starts grabbing from second half of the array. If the array
   *            length is odd, starts from the element following the exact center
   *                ex:
   *                  arr = [1, 2, 3, 4, 5];
   *                  {{#slice arr start="half"}} // [4, 5]
   *       If "start" is not provided, it will default to "0" since slice() requires start
   * end:  Follows prototype rules. In addition, accepts the following keyword(s):
   *          - "half" - Ends grabbing at the array's halfway mark. If the array
   *            length is odd, ends at the exact center element
   *                ex:
   *                  arr = [1, 2, 3, 4, 5];
   *                  {{#slice arr start="0" end="half"}} // [1, 2, 3]
   */
  Handlebars.registerHelper('slice', function(context, options) {
    var start = options.hash.start;
    if (start) {
      if (start === 'half') {
        start = Math.ceil(context.length / 2.0);
      } else {
        start = parseInt(start);
      }
    } else {
      start = 0;
    }

    var end = options.hash.end;
    if (end) {
      if (end === 'half') {
        end = Math.ceil(context.length / 2.0) ;
      } else {
        end = parseInt(end);
      }
    }

    return options.fn(context.slice(start, end));
  });

  /**
   * Check the size of a collection
   * ex:
   *   {{#ifSize colors}}
   *     -> checks that colors exists and has at least one item
   *
   *   {{#ifSize colors compare='2'}}
   *     -> checks that colors exists and has exactly 2 items
   *
   *   {{#ifSize colors compare="1" operator=">"}}
   *     -> checks that colors exists and has more than 1 item
   */
  Handlebars.registerHelper('ifSize', function(context, options) {
    var size = _.size(context);

    var operator = options.hash.operator || '===';

    var compare = 0;
    if (options.hash.compare) {
      compare = parseInt(options.hash.compare);
    }

    var truthy = false;

    switch (operator) {
    case '==' :
    case '===' :
      truthy = (size === compare);
      break;
    case '>':
      truthy = (size > compare);
      break;
    case '<':
      truthy = (size < compare);
      break;
    case '<=':
      truthy = (size <= compare);
      break;
    case '>=':
      truthy = (size >= compare);
      break;
    }

    if (truthy) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  /**
   * Return the size of a collection (object, array, etc)
   *
   * @see http://lodash.com/docs#size
   */
  Handlebars.registerHelper('size', function(collection) {
    return _.size(collection);
  });

  /**
   * Convert a rating value into a percentage
   *
   * @param {integer} ratingValue the customerrating from WSSG
   *
   * @return {float} percentage a decimal percentage conversion of the ratingValue
   */
  Handlebars.registerHelper('formatRatings', function(ratingValue) {
    var percentage = 100.0 / 5.0 * parseFloat(ratingValue);
    return percentage;
  });

  /**
   * Calculate the aspect ratio given the width and heigt
   *
   * @param {integer} width
   *
   * @param {integer} height
   *
   * @return {float} percentage a decimal percentage conversion of the ratingValue
   */
  Handlebars.registerHelper('aspectRatio', function(width, height) {
    var ratio = height / width * 100.0;
    return ratio;
  });

  /**
   * Get an item at a particluar index
   *
   * Ex:
   *   {{#get details index="1"}}
   *     {{this}}
   *   {{/get}}
   */
  Handlebars.registerHelper('get', function(context, options) {
    return options.fn(context[options.hash.index]);
  });

  /**
   * Join an array on a specified delimiter
   *
   * Ex:
   *   {{join myArray delimiter=", "}}
   */
  Handlebars.registerHelper('join', function(context, block) {
    return context.join(block.hash.delimiter);
  });

  /**
   * Determines whether or not a set of prices contains a sale price
   *
   * @poram {Object} prices contains the price data for a given product from WSSG
   *
   * @return {boolean} true if one of the prices has a "type" of "sale", else false
   */
  Handlebars.registerHelper('getSalePrice', function(prices) {
    if (prices && prices.length > 0) {
      for (var i = 0, len = prices.length; i < len; i++) {
        if (prices[i].type === 'sale') {
          return true;
        }
      }
    }
    return false;
  });

  /**
   * If Equals
   * if_eq this compare=that
   */
  Handlebars.registerHelper('if_eq', function(context, options) {
    if (context == options.hash.compare) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  /**
   * If Equals
   * if_eq this compare=that
   */
  Handlebars.registerHelper('if_neq', function(context, options) {
    if (context !== options.hash.compare) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  /**
   * If Less Than
   * if_lt this compare=that
   */
  Handlebars.registerHelper('if_lt', function(context, options) {
    if (context < options.hash.compare) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  /**
   * Unless Less Than
   * unless_lt this compare=that
   */
  Handlebars.registerHelper('unless_lt', function(context, options) {
    if (context < options.hash.compare){
      return options.inverse(this);
    }

    return options.fn(this);
  });

  /**
   * If Greater Than
   * if_gt this compare=that
   */
  Handlebars.registerHelper('if_gt', function(context, options) {
    if (context > options.hash.compare) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  /**
   * Unless Greater Than
   * unless_gt this compare=that
   */
  Handlebars.registerHelper('unless_gt', function(context, options) {
    if (context > options.hash.compare) {
      return options.inverse(this);
    }
    return options.fn(this);
  });

  /**
   * If Less Than or Equal To
   * if_lteq this compare=that
   */
  Handlebars.registerHelper('if_lteq', function(context, options) {
    if (context <= options.hash.compare){
      return options.fn(this);
    }
    return options.inverse(this);
  });

  /**
   * If Greater Than or Equal To
   * if_gteq this compare=that
   */
  Handlebars.registerHelper('if_gteq', function(context, options) {
    if (context >= options.hash.compare){
      return options.fn(this);
    }
    return options.inverse(this);
  });

  /**
   * If is contained
   * if_contained this list=that
   */
  Handlebars.registerHelper('if_contained', function(context, options) {
    if (options.hash.list && options.hash.list.split(',').indexOf(context) !== -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  /**
   * If is not contained
   * if_not_contained this list=that
   */
  Handlebars.registerHelper('if_not_contained', function(context, options) {
    if (options.hash.list && options.hash.list.split(',').indexOf(context) === -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  /**
   * If this string contains a `search` string (string.indexOf(`search`) !== -1)
   * if_string_contains this search=to_search
   */
  Handlebars.registerHelper('if_string_contains', function(context, options) {
    if (options.hash.search && context.indexOf(options.hash.search) !== -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    var operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    };

    var result = operators[operator](lvalue,rvalue);
    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

  });

  Handlebars.registerHelper('math', function(lvalue, operator, rvalue, options) {
    if (arguments.length < 4) {
      // Operator omitted, assuming '+'
      options = rvalue;
      rvalue = operator;
      operator = '+';
    }

    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue
      }[operator];
  });

  Handlebars.registerHelper('if_or', function(v1, v2, v3, options) {
    if (!options) {
      // only 2 params were passed, and v3 is options
      options = v3;
      if (v1 || v2) {
        return options.fn(this);
      }
    }
    else {
      if (v1 || v2 || v3) {
        return options.fn(this);
      }
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('if_and', function(v1, v2, options) {
    if (v1 && v2) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  /**
    * {{#each_with_index records}}
    *     <li class="legend_item{{index}}"><span></span>{{Name}}</li>
    * {{/each_with_index}}
    */

  Handlebars.registerHelper('each_with_index', function(array, fn) {
    var total = array.length;
    var buffer = '';
    for (var i = 0, j = array.length; i < j; i++) {
      var item = array[i];

      // stick an index property onto the item, starting with 1, may make configurable later
      item.index = i + 1;
      item.total = total;
      // show the inside of the block
      buffer += fn(item);
    }

    // return the finished buffer
    return buffer;

  });

  /**
    * {{#each_upto this 5}}
    *     <li>{{Name}} -- {{value}}</li>
    * {{/each_upto}}
    */

  Handlebars.registerHelper('each_upto', function(ary, max, options) {
    if(!ary || ary.length == 0) {
      return options.inverse(this);
    }
    var result = [ ];
    for(var i = 0; i < max && i < ary.length; ++i) {
      result.push(options.fn(ary[i]));
    }
    return result.join('');
  });

  /**
   * Remove the dot from the PRICE label (Orig.) that's sent from WSSG
   * @param {string} priceLabel from WSSG
   * @return {string} preceLabel without dot at the end
   */
  Handlebars.registerHelper('removeDot', function(priceLabel) {
    return priceLabel.replace(/\./g, '');
  });

  /**
   * Strip out non-alphanumeric characters
   * @param {String} raw the string that may contain special characters
   * @return {String} sanitized the string with all non-alphanumeric characters removed
   */
  Handlebars.registerHelper('stripNonAlpha', function(raw) {
    var string = raw || '';
    return string.toString().replace(/[^A-Za-z0-9]/g, '');
  });

  Handlebars.registerHelper('ifSelectedValue', function(facetSelectionModalModel, value, options) {
    if (_.contains(facetSelectionModalModel.selectedValues, value)) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('ifNotSelectedValue', function(facetSelectionModalModel, value, options) {
    if (!_.contains(facetSelectionModalModel.selectedValues, value)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('ifSelectedRangeOrValue', function(facetSelectionModalModel, range, value, options) {
    var selectedValues;

    // If we are comparing range values, we round all the values before
    // comparing to avoid mismatches from deeplink urls
    if (range) {
      selectedValues = facetSelectionModalModel.selectedRangeValues.map(function(selectedValue) {

        var rangeFrom = Math.round(selectedValue.from) || Math.round(selectedValue.fromrange) || '*';
        var rangeTo = Math.round(selectedValue.to) || Math.round(selectedValue.torange) || '*';
        return '[' + rangeFrom + ' TO ' + rangeTo + ']';
      });

      var from = Math.round(range.from) || Math.round(range.fromrange) || '*';
      var to = Math.round(range.to) || Math.round(range.torange) || '*';
      value = '[' + from + ' TO ' + to + ']';

    } else {
      selectedValues = facetSelectionModalModel.selectedValues;
    }

    if (_.contains(selectedValues, value)) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('ifNotSelectedRangeOrValue', function(facetSelectionModalModel, range, value, options) {
    if (!Handlebars.helpers.ifSelectedRangeOrValue.apply(this, arguments)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('ifUnavailableValues', function(facetSelectionModalModel, options) {
    if (_.find(facetSelectionModalModel.facet.value, { productcount: 0 })) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('ifDisabledValue', function(facetSelectionModalModel, value, options) {
    if (_.contains(facetSelectionModalModel.disabledValues, value)) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('isSingleSelectionFacet', function(name, options) {
    var singleSelectionFacets = ['CUSTRATINGS', 'UPC_BOPS_PURCHASABLE'];
    if (_.contains(singleSelectionFacets, name)) {
      return options.fn(this);
    } else {
      options.inverse(this);
    }
  });

  Handlebars.registerHelper('displayFacetSessionValues', function(facetSessionValues, facetName, options) {
    return options.fn(facetSessionValues[facetName]);
  });

  Handlebars.registerHelper('displaySortedFacetSessionValues', function(facetSessionValues, facetName, options) {
    if (facetName === 'BRAND'){
      if ((typeof facetSessionValues[facetName] !== 'undefined') &&
        ((typeof facetSessionValues[facetName].selected !== 'undefined' && facetSessionValues[facetName].selected.length))) {
        facetSessionValues[facetName].selected = _.sortBy(facetSessionValues[facetName].selected, function(facetValue) {
          return facetValue.toLowerCase();
        });
        return options.fn(facetSessionValues[facetName]);
      }
    }

    return options.fn(facetSessionValues[facetName]);
  });

  Handlebars.registerHelper('productImageScale', function(src, options) {
    if (src.indexOf('wid=') !== -1) {
      return src.replace(/wid=\d+(\&|$)/, 'wid=' + options.hash.width + '$1');
    }

    return src;
  });

  Handlebars.registerHelper('bopsFacetStoreName', function(facetName, facets, stores, storeNumber) {
    var name, store;

    var bopsFacet = _.find(facets, function(facet) {
      return facet.name === 'UPC_BOPS_PURCHASABLE';
    });

    if (bopsFacet) {
      store = _.find(bopsFacet.value, function(value) {
        return value.values.toString() === storeNumber.toString();
      });

      if (store && store.name) {
        name = store.name;
      }
    }

    return name || storeNumber;
  });

  Handlebars.registerHelper('eachAvailableValue', function(facetValues, options) {
    var ret = '';
    _(facetValues)
      .filter('productcount')
      .each(function(value) {
        ret += options.fn(value);
      });

    return ret;
  });

  Handlebars.registerHelper('eachUnavailableValue', function(facetValues, options) {
    var ret = '';
    _(facetValues)
      .filter({ productcount: 0 })
      .each(function(value) {
        ret += options.fn(value);
      });

    return ret;
  });

  Handlebars.registerHelper('ifHasFacetSessionValues', function(facetSessionValues, facetName, options) {
    if ((typeof facetSessionValues[facetName] !== 'undefined') &&
      (typeof facetSessionValues[facetName].selected !== 'undefined' && facetSessionValues[facetName].selected.length ||
      typeof facetSessionValues[facetName].disabled !== 'undefined' && facetSessionValues[facetName].disabled.length)) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('ifSpecialFacetBlock', function(facetName, options) {
    if (facetName === 'COLOR_NORMAL' || facetName === 'SIZE_NORMAL' || facetName === 'PRODUCT_COLOR') {
      return options.fn(this);
    }
  });

  /**
   * Normalize PRICE facet values (like this: $100 - $200)
   * @param {String} facetName - the facet name (PRICE)
   * @param {String} facetValue - the price string that needs to be normalized (ex: [100 TO 199.99])
   * @return {String} normalized string with the required format ($100 - $200)
   */
  Handlebars.registerHelper('normalizeIfPrice', function(facetName, facetValue, brand) {
    if (facetName === 'PRICE') {
      var facetPriceValues = facetValue.replace(/\[|\]/g, '').split(' TO ');
      facetValue = '';

      if (facetPriceValues[0] === '*' || facetPriceValues[0] === '0' || facetPriceValues[0] === '0.0') {
        facetValue = 'Under $' + Math.round(facetPriceValues[1]);
      } else if (facetPriceValues[1] === '*' || facetPriceValues[1] === '-1') {

        if (brand && brand === 'mcom') {
          facetValue = 'Over $' + Math.round(facetPriceValues[0]);
        } else {
          facetValue = '$' + Math.round(facetPriceValues[0]) + ' and Over';
        }

      } else {
        _.forEach(facetPriceValues, function(facetPriceValue) {
          if (facetValue === '') {
            facetValue = facetValue + '$' + Math.round(facetPriceValue) + ' - ';
          } else {
            facetValue = facetValue + '$' + Math.round(facetPriceValue);
          }
        });
      }
    }
    return facetValue;
  });

  Handlebars.registerHelper('displayPrice', function(price, isMasterPDP) {
    if (isMasterPDP) {
      var priceRange = price.split('-');
      if (priceRange[0] && priceRange[1]) {
        return priceRange[0] + '- ' + priceRange[1].replace(/ /g,'');
      } else {
        return price;
      }
    } else {
      return price;
    }
  });

  Handlebars.registerHelper('formatNumber', function(number, decimalPoints) {
    return parseFloat(number).toFixed(arguments.length > 2 ? decimalPoints : 2);
  });

  Handlebars.registerHelper('prettyList', function(list, separator) {
    return list.join(arguments.length > 2 ? separator : ', ');
  });

  Handlebars.registerHelper('hideIfEmpty', function(facet) {
    var result = 'show';

    if ((!facet.fixed) && (facet.value.length === 0)) {
      return 'hide';
    }

    return result;
  });

  Handlebars.registerHelper('displayConfig', function(options) {
    return options.fn(App.config);
  });

  /**
   * Check if a particular feature is enabled via "CONFIG_[feature]" in the .env file.
   *    1) First, checks that the value does not indicate the feature is "disabled".
   *       Defaults to "off", but can be passed in i.e. {{#ifFeatureEnabled feature disabled="ignore"}}
   *    2) Next, checks if "enabled" was passed in i.e. {{#ifFeatureEnabled feature enabled="on"}}
   *         * If "enabled" is supplied, the config property must match this value to return `true`
   *         * If "enabled" is not passed in, `true` will be returned if the first condition passed
   */
  Handlebars.registerHelper('ifFeatureEnabled', function(feature, options) {
    var disabled = options.hash.disabled || 'off';
    var enabled = options.hash.enabled;

    if (App.config.ENV_CONFIG[feature] !== disabled) {
      if (enabled) {
        if (App.config.ENV_CONFIG[feature] === enabled) {
          return options.fn(this);
        }
      }
      else {
        return options.fn(this);
      }
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('ifCategoryIdLoaded', function(productModel, options) {
    var categoryMenu,
        defaultCategoryId = productModel.activeCategory,
        categoryId = productModel.requestParams.categoryId,
        categoryIndexModel = App.model.get('categoryIndex');

    if (categoryIndexModel) {
      if (categoryId) {
        categoryMenu = categoryIndexModel.menus[categoryId];
      } else if (defaultCategoryId) {
        categoryMenu = categoryIndexModel.menus[defaultCategoryId];
      }
    }

    //Category url is set only when we navigate to pdp from browse with facets
    //when catalog index is already loaded
    if (categoryMenu && productModel.categoryUrl) {
      categoryMenu.url = productModel.categoryUrl;
    }

    if (categoryMenu) {
      return options.fn(categoryMenu);
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('times', function(n, options) {
    var accum = '', data;

    for (var i = 0; i < n; ++i) {
      if (options.data) {
        data = Handlebars.createFrame(options.data || {});
        data.current = i + 1;
      }

      accum += options.fn(this, { data: data });
    }

    return accum;
  });

  Handlebars.registerHelper('encode', function(str) {
    return encodeURIComponent(str);
  });

  //Makes relative urlPath a full secure url using current url
  //domain name
  Handlebars.registerHelper('secureUrl', function(urlPath) {
    var secureUrl = 'https://' + window.location.host + urlPath;
    return secureUrl;
  });

  // MEW 1.0 and MEW 2.0 secure urls for sign-in and sign-out
  Handlebars.registerHelper('mSecureUrl', function(urlName) {
    var signInExperience = App.config.ENV_CONFIG.signin_in_experience || '1.0';
    var signInConfig = App.config.signIn.experiences[signInExperience];
    var url = signInConfig.urls[urlName];

    if (signInExperience === '2.0') {
      return !url ? '/' : util.getSecureMURL() + url;
    }

    return 'https://' + window.location.host + url;
  });

  Handlebars.registerHelper('viewlessUrl', function(urlPath) {
    var viewlessUrl = 'javascript:void(0);';
    return viewlessUrl;
  });

  Handlebars.registerHelper('relativeUrl', function(urlPath) {
    var relativeUrl, $url = $.url(urlPath), host = $url.attr('host');

    relativeUrl = $url.attr('source').replace($url.attr('base'), '');

    return relativeUrl;
  });

  Handlebars.registerHelper('absoluteUrl', function(urlPath) {
    var absoluteUrl, $url = $.url(urlPath), host = $url.attr('host');

    // If it is a relative Url, we absolutize it by prepending the host
    // If it is not a relative Url (third-part urls such as customerservice,
    // social, circularhub), we only return it. No need to prepend the host
    // on it
    if (_.isEmpty(host) || _.isUndefined(host)) {
      absoluteUrl = $.url().attr('base') + urlPath;
    } else {
      absoluteUrl = urlPath;
    }

    return absoluteUrl;
  });

  Handlebars.registerHelper('baseUrl', function() {
    return $.url().attr('base');
  });

  Handlebars.registerHelper('spriteSwatchPosition', function(index) {
    var urlIndex = Math.ceil((index + 1) / App.config.pdp.swatchesPerSprite);
    var indexInUrl = index - (urlIndex - 1) * App.config.pdp.swatchesPerSprite;
    return -App.config.pdp.swatchWidth * indexInUrl;
  });

  Handlebars.registerHelper('getSwatchSpriteUrl', function(urlList, index) {
    var urlIndex = Math.ceil((index + 1) / App.config.pdp.swatchesPerSprite);
    return urlList[urlIndex - 1];
  });

  /* useful helper to debug values in handlebars templates  */
  Handlebars.registerHelper('debug', function(optionalValue) {
    console.log('Current Context');
    console.log('====================');
    console.log(this);

    if (optionalValue) {
      console.log('Value');
      console.log('====================');
      console.log(optionalValue);
    }
  });

  Handlebars.registerHelper('eachSortedBy', function(array, options) {
    var result = '',
        sortKey = options.hash.key;

    if (array.length > 0) {
      if (!_.isUndefined(sortKey) && !_.isUndefined(array[0][sortKey])) {
        array = _.sortBy(array, sortKey);
      }
      _.each(array, function(value) {
        result += options.fn(value);
      });
    }

    return result;
  });

  /**
    * HELPER: #key_value
    *
    * Iterate over an object, setting 'key' and 'value' for each property in
    * the object.
    */

  Handlebars.registerHelper('key_value', function(obj, options) {
    var buffer = '',
        key;

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        buffer += options.fn({ key: key, value: obj[key] });
      }
    }
    return buffer;
  });

  // Helper that returns the current year
  // Usefull in footer where we constantly need to update the current year
  Handlebars.registerHelper('getCurrentYear', function() {
    return new Date().getFullYear();
  });

  Handlebars.registerHelper('formatDate', function(date, format) {
    return moment(date).format(arguments.length > 2 ? format : 'MMM D, YYYY');
  });

  Handlebars.registerHelper('formatDateISO', function(date, time, inputFormat) {
    var parsedDate = inputFormat ? moment(date + ' ' + time, inputFormat) : moment(date + ' ' + time);
    return parsedDate.toISOString();
  });

  // Provide valid date for SEO schema
  Handlebars.registerHelper('priceValidDate', function(date) {
    return date ? moment(date, 'M/DD/YYYY').toISOString() : moment().add(1, 'week').toISOString();
  });

  Handlebars.registerHelper('prepareSitePromoString', function(topCategory, id, category) {
    if( topCategory === 'shop'){
      topCategory = category;
    }
    var cm_sp = topCategory.replace(/ /g, '-');
    cm_sp += '-_-' + id + '_';
    cm_sp += category.replace(/ /g, '-');

    return encodeURIComponent(cm_sp).toLowerCase();
  });

  Handlebars.registerHelper('useUrlParamConnector', function(url) {
    var $url = $.url(url);
    var connector;

    if (_.values( $url.param()).length > 0){
      connector = '&';
    } else {
      connector = '?';
    }
    return connector;
  });

  function makeFractionHtml(value){
    var str = '';

    if (value.w) {
      str = value.w;
    }

    if (value.num) {
      str += ' <span class="mb-fraction-num">' + value.num + '</span><span class="mb-fraction-denom">' + value.denom + '</span>';
    }

    return str;
  }

  Handlebars.registerHelper('fractionValue', function(value) {
    var str = '';
    if( value ){
      //If we have min and max - it's a range
      if( value.min){
         str = makeFractionHtml(value.min) + ' - ' + makeFractionHtml(value.max);
      } else {
        str = makeFractionHtml(value);
      }
    }

    if (value.w === 'NA' || value.w === 'N/A') {
      str = '&nbsp';
    }
    return str;
  });


  Handlebars.registerHelper('jsonstringify', function(obj) {
    return JSON.stringify(obj);
  });

  Handlebars.registerHelper('calculateColumnWidth', function(columnsTotal, columnsSpan) {
    var columnWidth = $(window).width()/columnsTotal;
    if( columnWidth < 70 ){
      if( columnsSpan >= 1){
        return 70*columnsSpan + 'px';
      }

      return '70px';
    } else {

      columnWidth = 100/columnsTotal;
      if( columnsSpan >= 1){
        return columnWidth*columnsSpan + '%';
      } else {
        return columnWidth + '%';
      }
    }

  });

  Handlebars.registerHelper('getCountryName', function(code) {
    var name;
    code = code.toString();

    _.each(App.config.countries, function(country) {
      for (var key in country) {
        if (country.hasOwnProperty(key)) {
          if (key === code.toString()) {
            name = country[key];
          }
        }
      }
    });
    return name;
  });

  Handlebars.registerHelper('searchAndBrowseProductImageOptimize', function(src) {
    var width = 138 * window.devicePixelRatio;

    return util.productImageOptimized(src, width);
  });

});
