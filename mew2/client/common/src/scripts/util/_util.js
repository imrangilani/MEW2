define([
  'jquery',
  'underscore'
], function($, _) {

  'use strict';

  var loading,
      navLoading;

  var util = {

    isAndroid: function() {
      return !!navigator.userAgent.match(/Android/i);
    },

    isiOS: function() {
      return !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },

    isiOS7: function() {
      return !!navigator.userAgent.match(/iPhone OS 7|iPad OS 7|iPod OS 7/i);
    },

    isiOS8: function() {
      return !!navigator.userAgent.match(/iPhone OS 8|iPad OS 8|iPod OS 8/i);
    },

    // Modernizr's test says iOS6 has support, but it is buggy, so opting for iOS7 only for now
    // https://github.com/Modernizr/Modernizr/blob/06d79fb179e95f35d509afbe7e209403e3791be9/feature-detects/css/positionsticky.js
    hasPositionSticky: function() {
      return util.isiOS7() || util.isiOS8();
    },

    hideNavItems: function() {
      $('#mb-j-nav-menu').addClass('is-hidden');
    },

    showNavItems: function() {
      $('#mb-j-nav-menu').removeClass('is-hidden');
    },

    showLoading: function() {
      clearTimeout(this.timer);
      if (!this.isLoadingInProgress()) {
        if (!loading) {
          loading = $('#mb-loading');
        }
        this.timer = setTimeout(_.bind(function() {
          loading.css('display', 'block');
        }, this), 1000);
      }
    },

    hideLoading: function() {
      clearTimeout(this.timer);
      if (this.isLoadingInProgress()) {
        setTimeout(function() {
          loading = $('#mb-loading');
          loading.css('display','none');
        }, 5);
      }
    },

    isLoadingInProgress: function() {
      if (!loading) {
        loading = $('#mb-loading');
      }
      if (loading.css('display') === 'block') {
        return true;
      }
      return false;
    },

    showNavLoading: function() {
      if (!this.isNavLoadingInProgress()) {
        if (!navLoading) {
          navLoading = $('#mb-nav-loading');
        }
        navLoading.css('display', 'block');
      }
    },

    hideNavLoading: function() {
      clearTimeout(this.timer);
      if (this.isNavLoadingInProgress()) {
        setTimeout(function() {
          navLoading = $('#mb-nav-loading');
          navLoading.css('display','none');
        }, 5);
      }
    },

    isNavLoadingInProgress: function() {
      if (!navLoading) {
        navLoading = $('#mb-nav-loading');
      }
      if (navLoading.css('display') === 'block') {
        return true;
      }
      return false;
    },

    // sometimes images take so long to load and render, they aren't even seen. especially on ios.
    // example: spinners, welcome marketorial
    preloadImages: function() {
      var images = [];

      for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = arguments[i];
      }

      return images;
    },

    // Determines if the request is coming from a Native app by checking if a cookie is set
    getCookie: function(cookieName) {
      var cookieArray = document.cookie.split('; ');
      for (var i = 0; i < cookieArray.length; i++) {
        if (cookieArray[i].split('=')[0] === cookieName) {
          return cookieArray[i].split('=')[1];
        }
      }
      return false;
    },

    getCurrentTimestamp: function() {
      var date = new Date();
      return Math.ceil(date.getTime() / 1000);
    },

    buildUrl: function(params) {
      var str = '';
      var key;

      for (key in params) {
        if (params.hasOwnProperty(key) && params[key]) {
          if (str.length === 0) {
            str += '?';
          } else {
            str += '&';
          }
          str += encodeURIComponent(key)
            .replace('&', '%26')
            .replace('/', '%2F') + '=' + encodeURIComponent(params[key])
            .replace('&', '%26')
            .replace('/', '%2F');
        }
      }
      return str;
    },

    /**
     * Method used to make custom url encoding for API request, e.g., to not encode commas.
     */
    buildApiUrl: function(params) {
      var str = '',
          key;

      for (key in params) {
        if (params.hasOwnProperty(key) && params[key]) {
          if (str.length === 0) {
            str += '?';
          } else {
            str += '&';
          }
          str += encodeURIComponent(key).replace('&', '%26').replace('/', '%2F') + '=';
          str += (params[key].toString()).split(',').map(function(value) {
            return encodeURIComponent(value.replace(/%2C/g, ','));
          }).join().replace('&', '%26').replace('/', '%2F');
        }
      }
      return str;
    },

    /**
     * Constructs a URL, provided an object containing its parts.
     * Note that the parts are optional, but it should contain at least the ones
     * to build a meaningful URL: just the host, just the path etc.
     *
     * @param options An object with each part of a URL:
     *  - protocol: e.g., 'http', 'mailto', 'https'
     *  - host: e.g., 'www.bloomingdales.com'
     *  - port: e.g., '8080', '80'
     *  - path: e.g., '/shop'
     *  - query: e.g., 'ID=2222&CategoryID=1111'
     *  - hash: e.g., '!fn=jkfajskf'
     */
    buildFullUrl: function(options) {
      var urlString = '{-PROTOCOL-}{-HOST-}{-PORT-}{-PATH-}{-QUERY-}{-FRAGMENT-}',
          parts = _.defaults(options, {
        protocol: '',
        host: '',
        port: '',
        path: '',
        query: '',
        fragment: ''
      });

      if (_.isArray(parts.query) && !_.isEmpty(parts.query)) {
        parts.query = _.filter(parts.query, function(str) {
          return $.trim(str).length > 0;
        }).join('&');
      }
      if (parts.query.length > 0 && parts.query.indexOf('?') !== 0) {
        parts.query = '?' + parts.query;
      }
      if (parts.path.indexOf('/') !== 0) {
        parts.path = '/' + parts.path;
      }

      return urlString
        .replace('{-PROTOCOL-}', parts.protocol && !_.isEmpty(parts.protocol) ?
          parts.protocol + '://' : '')
        .replace('{-HOST-}', parts.host)
        .replace('{-PORT-}', parts.port && !_.isEmpty(parts.port) ?
          ':' + parts.port : '')
        .replace('{-PATH-}', parts.path)
        .replace('{-QUERY-}', parts.query)
        .replace('{-FRAGMENT-}', parts.fragment && !_.isEmpty(parts.fragment) ?
          '#' + parts.fragment : '');
    },

    //Extracts values for url parameters specified in paramMap
    url: {
      // Extract a single parameter from  url
      parseLocationQueryParameter: function(paramName) {
        var paramMap = { value: paramName };
        var result = this.parseLocationQueryParameters(paramMap);

        return result.value;
      },
      parseLocationQueryParameters: function(paramMap) {
        var url = document.location.href;
        return this.parseUrlQueryParameters(url, paramMap);
      },
      parseUrlQueryParameters: function(url, paramMap) {
        var dataMap = {};
        _.each(paramMap, function(urlParam, dataKey) {
          dataMap[dataKey] = $.url(url).param(urlParam);
        });
        return dataMap;
      }
    },

    /**
     * Constructs a new object like the original, but replacing the property names
     * with the ones privded on the propertyNameMap.
     * If a property on the original object does not have an entry on the propertyNameMap,
     * it will be copied using the same property name as in the original.
     *
     * @param original A source object to have its property names changed.
     * @param propertyNameMap a map of current property names to new property names.
     * @returns the new object with the replaced property names, but the same values.
     */
    renameProperties: function(original, propertyNameMap) {
      if (!propertyNameMap) {
        return _.clone(original);
      }

      var compacted = {};

      _.each(original, function(value, key) {
        var newKey = propertyNameMap[key] || key;
        compacted[newKey] = original[key];
      });

      return compacted;
    },

    abstractMethod: function(shouldFail) {
      var msg = 'This functionwas not meant to be called from a "common" context. Please, override it in a brand-specific context.';
      if (shouldFail) {
        throw msg;
      } else {
        console.log(msg);
      }
    },

    capitalizeString: function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    formatMoney: function(number, digits) {
      digits = isNaN(digits = Math.abs(digits)) ? 2 : digits;

      return number.toFixed(digits).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },

    generateGUID: function() {
      var S4 = function() {
        var d = new Date();
        return ( ((d.getTime()+Math.random()) *0x10000)|0).toString(16).substring(1);
      };
      return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
    },

    makeCookieDomainName: function(hostname) {
      var cookieDomain;
      var tokens = hostname.split('.');

      //Please note that you cannot set cookie domain to localhost
      //and need additional special processing before setting
      if (hostname === 'localhost') {
        return hostname;
      }

      if (tokens.length > 2) {
        //Check if it is an IP address
        if (tokens.length === 4){
          var allDigits = true;
          _.each(tokens, function(token) {
            if (isNaN(token)){
              allDigits = false;
              return (undefined);
            }
          });

          if (allDigits) {
            return hostname;
          }
        }

        cookieDomain = '';
        for (var i = 1; i < tokens.length; i++) {
          cookieDomain += '.';
          cookieDomain += tokens[i];
        }
      }

      return cookieDomain;
    },

    setForwardPageCookie: function(encode, targetUrl) {
      var cookieDomain = util.makeCookieDomainName(document.location.hostname);
      if (cookieDomain) {
        if (cookieDomain === 'localhost') {
          cookieDomain = undefined;
        }
        //If we are creating cookie for an href - it will be passed as a parameter
        //otherwise we are creating it for current page (deep link)
        var pageUrl = targetUrl ? targetUrl : document.location.href;
        var previousEncodingValue = $.cookie.raw;
        $.cookie.raw = !encode;
        $.cookie( 'FORWARDPAGE_KEY', pageUrl, { domain: cookieDomain, path: '/'});
        $.cookie.raw = previousEncodingValue;
      }
    },

    isInPrivateMode: function() {
      if (!window.navigator.cookieEnabled) {
        return true;
      }
      if (!window.sessionStorage) {
        return true;
      }
      try {
        window.sessionStorage.setItem('testkey', 'testvalue');
        window.sessionStorage.removeItem('testkey');
        return false;
      } catch (a) {
        return true;
      }
    },

    waitImagesLoad: function(container, callback, imageSelector) {
      var $container = $(container);
      var $images = $container.find(imageSelector || 'img');
      var remaining = $images.length;
      var triggered = false;
      var triggerLoaded = function() {
        if (!triggered) {
          setTimeout(callback, 1);
          triggered = true;
        }
      };

      $images.each(function() {
        if (this.complete) {
          remaining--;
        } else {
          $(this).load(function() {
            remaining--;

            if (remaining === 0) {
              triggerLoaded();
            }
          });
        }
      });

      // All images are already loaded
      if (remaining === 0) {
        triggerLoaded();
      }
    },

    productImageOptimized: function(srcImg, width) {
      if (srcImg) {
        if (srcImg.indexOf('wid=') !== -1) {
          return srcImg.replace(/wid=\d+(\&|$)/, 'wid=' +  width + '$1');
        } else {
          var srcImgParts = srcImg.split('?');
          if (srcImgParts.length >= 2 && srcImgParts[1].length !== 0) {
            return srcImgParts[0] + '?wid=' + width + '&' + srcImgParts[1];
          } else {
            return srcImgParts[0] + '?wid=' + width;
          }
        }
      } else {
        return '?wid=' + width;
      }
    },
    /**
    function to get secure-m subdomain so that environment specific secure-m url will be constructed
    using property from .ENV
    Geritt failing because of window.app property hence adding a condition and else block
    **/
    getSecureMURL: function() {
      var SECURE_M_URL = 'http://secure-m.macys.com';

      if (App.config.ENV_CONFIG.msecure_url) {
        var host = window.location.host;
        SECURE_M_URL = App.config.ENV_CONFIG.msecure_url + host.substr(host.indexOf('.'));
      }

      return SECURE_M_URL;
    }
  };

  util.storage = {
    store: function(key, value, expires) {
      localStorage.setItem(key, value);

      if (expires) {
        localStorage.setItem(key + ':timestamp', new Date().getTime());
      }
    },
    remove: function(key) {
      localStorage.removeItem(key);
      localStorage.removeItem(key + ':timestamp');
    }
  };

  util.storage.retrieve = function(key, dataLifeSpan) {
    if (dataLifeSpan) {
      var timestamp = localStorage.getItem(key + ':timestamp');
      var now = new Date().getTime();

      if (timestamp) {
        timestamp = parseInt(timestamp);
      }

      if (!timestamp || ((now - timestamp) > dataLifeSpan)) {
        // item has expired from localStorage
        util.storage.remove(key);
        return;
      }
    }

    return localStorage.getItem(key);
  };

  return util;
});
