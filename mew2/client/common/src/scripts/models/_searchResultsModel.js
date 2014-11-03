define([
  // Utilities
  'util/util',

  // Models
  'models/baseModel'
], function(util, BaseModel) {
  'use strict';

  var SearchResultsModel = BaseModel.extend({
    timeout: 60000,

    defaults: function() {
      return {
        requestParams: {
          searchphrase: '',
          show: 'product,facet',
          perpage: 24,
          page: 1,
          facetexpandall: true
        }
      };
    },

    url: function() {
      var requestParams = _.defaults(this.get('requestParams'), _.result(this, 'defaults').requestParams);
      return '/api/v4/catalog/search' + util.buildApiUrl(requestParams) + '&appl=MOBILE&device=PHONE';
    },

    checkForRedirect: function(model, resp, options) {
      var redirectObj = model.get('redirect');

      if (redirectObj) {
        var redirectType = redirectObj.redirecttype,
            prefix = '^(?:\/\/|[^\/]+)*',
            regex = new RegExp(prefix),
            redirectUrl = '';

        switch (redirectType) {
          case 'PDP':
          case 'CATEGORY':
            redirectUrl = redirectObj.locationurl;
            if (redirectUrl.match(regex)) {
              redirectUrl = redirectUrl.replace(regex, '');
            }
            App.router.navigate(redirectUrl, { trigger: true, replace: true });
            break;
          case 'RELATIVE_URL':
            redirectUrl = redirectObj.locationid;
            App.router.navigate(redirectUrl, { trigger: true, replace: true });
            break;
          case 'ABSOLUTE_URL':
            redirectUrl = redirectObj.locationid;
            window.location.replace(redirectUrl);
            break;
          default:
            break;
        }

        if( this.attributes.view && this.attributes.view.setSearchRedirectFlag){
          this.attributes.view.setSearchRedirectFlag();
        }
      }
    }
  });

  // Overriding the success callback to check if there is a redirect to a different page
  SearchResultsModel.prototype.success = function(model, resp, options) {
    if (model.get('redirect')) {
      model.checkForRedirect(model, resp, options);
    } else {
      BaseModel.prototype.success(model, resp, options);
    }
  };

  return SearchResultsModel;
});
