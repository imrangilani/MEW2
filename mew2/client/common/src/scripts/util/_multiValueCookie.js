define([
  'jquery',
  'underscore',
  'jquery.cookie'
], function($, _, cookie) {
  'use strict';
  var tokens = {
      SEPARATOR: '3_87_', /* '&' */
      EQUAL:     '1_92_', /* '=' */
      EMPTY:     '4_02_'  /* '' */
    };

  var cookieUtil = {
    domain: undefined,
    getCookieDomain: function() {
      return _.isEmpty(this.domain) ? undefined : this.domain;
    },
    setCookieDomain: function(hostname) {
      if (_.isUndefined(hostname)) {
        this.domain = undefined;
        return;
      }
      //Hostname cannot be set explicitely as 'localhost' in cookie domain
      if (hostname !== 'localhost') {
        var tokens = hostname.split('.');
        //m.brand.com
        if (tokens.length === 3) {
          this.domain = tokens[1] + '.' + tokens[2];

        //m2qa1.qa23codebrand.fds.com
        } else if (tokens.length > 3) {
          //Check if it is an IP address
          if (tokens.length === 4){
            var allDigits = true;
            _.each(tokens, function(token) {
              if (isNaN(token)){
                allDigits = false;
                return;
              }
            });

            if (allDigits) {
              this.domain = hostname;
              return;
            }
          }

          this.domain = '';
          for (var i = tokens.length - 3; i < tokens.length; i++) {
            if (!_.isEmpty(this.domain)) {
              this.domain += '.';
            }
            this.domain += tokens[i];
          }
        } else {
          this.domain = undefined;
        }
      }
    },
    getArgsDomain: function() {
      var args = { path: '/' };

      //If domain to be passed to cookie methods is not yet set
      //set it according to our domain rules
      if (!this.getCookieDomain()) {
        this.setCookieDomain(document.location.hostname);
      }
      //If above operation set it - pass it to the cookie api
      if (this.getCookieDomain()) {
        args.domain = this.getCookieDomain();
      }

      return args;
    },
    get: function(cookieName, multiValueCookieName) {
      //If asking for a simple cookie - return the value
      if (_.isUndefined(multiValueCookieName)) {
        var value = $.cookie(cookieName);
        return value ? value : (undefined);
      } else {
        //If asking to get a subcookie of multi-value cookie
        //get that multi-value cookie first
        var mvcValue = $.cookie(multiValueCookieName);
        if (_.isNull(mvcValue) || mvcValue.indexOf(cookieName) === -1) {
          return undefined;
        }

        //Now extract the value of subcookie.
        var mvcSubs = mvcValue.split(tokens.SEPARATOR);
        //Find the one that has the name specified as a parameter
        for (var i = 0, len = mvcSubs.length; i < len; i++){
          var keyValue = mvcSubs[i].split(tokens.EQUAL);
          if (keyValue[0] === cookieName){
            return keyValue[1] === tokens.EMPTY ? '' : keyValue[1];
          }
        }
      }
      return undefined;
    },
    set: function(cookieName, value, multiValueCookieName, expires) {
      if (multiValueCookieName) {
        var mvcValue = $.cookie(multiValueCookieName);

        var subCookieNew = cookieName + tokens.EQUAL + ((value === '') ? tokens.EMPTY : value);

        if (_.isNull(mvcValue)) {
          //If there's no multi-value cookie - create a new one
          value = subCookieNew;
        } else if (mvcValue.indexOf (cookieName) === -1) {
          //If this cookie does not exist yet as part of multi-face cookie
          //just append it to the end
          value = mvcValue + tokens.SEPARATOR + subCookieNew;
        } else {
          //This cookie exists - need to reset the value
          var mvcSubs = mvcValue.split (tokens.SEPARATOR);
          var newValue = '';

          _.each(mvcSubs, function(subcookie) {
            if (newValue !== ''){
              newValue += tokens.SEPARATOR;
            }
            if (subcookie.split(tokens.EQUAL)[0] === cookieName) {
              newValue +=  subCookieNew;
            } else {
              newValue +=  subcookie;
            }
          });
          value = newValue;
        }

        cookieName = multiValueCookieName;
      }
      //Specify the values of additional parameters that need to be set for cookies api
      var args = this.getArgsDomain();

      if (!_.isUndefined(expires)) {
        args.expires = expires;
      }

      $.cookie(cookieName, value, args);
    },
    remove: function(cookieName, multiValueCookieName) {
      var args = this.getArgsDomain();

      if (multiValueCookieName) {
        var mvcValue = $.cookie (multiValueCookieName);
        if (!_.isNull (mvcValue) && mvcValue.indexOf(cookieName) !== -1) {
          var mvcSubs = mvcValue.split (tokens.SEPARATOR);

          var newValue = '';
          //Iterate through all cookies of multi-value cookie
          //and concat all except for the cookieName specified as parameter
          _.each(mvcSubs, function(subcookie) {
            var keyValue = subcookie.split(tokens.EQUAL);
            if (keyValue[0] !== cookieName){
              if (newValue !== ''){
                newValue += tokens.SEPARATOR;
              }
              newValue += subcookie;
            }
          });

          $.cookie(multiValueCookieName, newValue, args);
        }
      } else {
        $.removeCookie(cookieName, args);
      }
    }
  };

  return cookieUtil;
});
