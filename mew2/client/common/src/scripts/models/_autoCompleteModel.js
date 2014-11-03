define([
  'models/baseModel',
  'util/util'
], function(BaseModel, util) {
  'use strict';

  var jsonCallbackPrefix = 'autoCompleteCallback_';

  return BaseModel.extend({
    isLoadingImageDisabled: true,

    isCrossDomain: function() {
      return !this.isValidDesktopHost(this.getCurrentUrlHost());
    },

    defaults: function() {
      return {
        requestParams: {
          prefix: '',
          maxSuggestions: 10
        }
      };
    },

    jsonpCallback: function() {
      return jsonCallbackPrefix + this.get('requestParams').prefix.trim().replace(/\s/g, '_');
    },

    validDesktopHostRegex: /(?:[^\.]*)\.(qa\d+code|preprod\d+|)(macys|bloomingdales)(\.fds)?(\.com)/i,

    isValidDesktopHost: function(host) {
      return this.validDesktopHostRegex.test(host);
    },

    getCurrentUrlHost: function() {
      return $.url().attr('host');
    },

    // returns the url to appolo in a desktop environment
    // if we are in prod or in preprodX, it returns the appolo path
    // on the respective desktop environment.
    // else, it returns a fallback desktop environment that is set
    // on the .env file (CONFIG_AUTOCOMPLETE_HOST)
    url: function() {
      var requestParams = _.defaults(this.get('requestParams'), _.result(this, 'defaults').requestParams),
          host = this.getCurrentUrlHost(),
          config = App.config.search.autoCompleteHost,
          autoCompleteHost,
          autoCompleteUrl,
          hostRegexResults;

      if (this.isValidDesktopHost(host)) {
        hostRegexResults = host.match(this.validDesktopHostRegex);
        autoCompleteHost = hostRegexResults.slice(1).join('');
      } else {
        autoCompleteHost = App.config.ENV_CONFIG.autocomplete_host;
      }
      autoCompleteUrl = config.protocol + config.subdomain + autoCompleteHost + config.path;

      return autoCompleteUrl + util.buildUrl(requestParams) + '&bypass_redirect=yes&shippingCountry=US';
    }
  });
});
