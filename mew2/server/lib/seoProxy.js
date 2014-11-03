'use strict';

var url      = require('url'),
    _        = require('lodash'),
    seoProxy = {};

seoProxy.shouldShowSEOPage = function(req) {
  var userAgent = req.headers['user-agent'],
      isRequestingSEOPage = false;

  if (!userAgent) { return false; }
  if (req.method.toUpperCase() !== 'GET') { return false; }

  //if it contains _escaped_fragment_, show SEO page
  if (url.parse(req.url, true).query.hasOwnProperty('_escaped_fragment_')) {
    isRequestingSEOPage = true;
  }

  //if it is a bot...show S page
  if (seoProxy.crawlerUserAgents.some(
    function(crawlerUserAgent) {
      return userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1;
    })) {
    isRequestingSEOPage = true;
  }

  //if it is a bot and is requesting a resource...dont return SEO page
  if (seoProxy.extensionsToIgnore.some(
    function(extension) {
      return req.path.indexOf(extension) !== -1;
    })) {
    return false;
  }

  return isRequestingSEOPage;
};

seoProxy.buildApiUrl = function(req) {
  var urlMapping  = seoProxy.getUrlMapping(req),
      host        = process.env.SEO_BROMBONE_HOST || req.info.host,
      queryParams = '',
      proxyUrl;

  if (req.url.search) {
    queryParams = seoProxy.buildQueryParams(urlMapping, req.url.query);
  }

  proxyUrl = process.env.SEO_SERVICE_URL + host + req.path + queryParams;
  console.log('SEO Proxy url: ' + proxyUrl);

  return proxyUrl;
};

seoProxy.buildQueryParams = function(urlMapping, reqUrlQuery) {
  var queryParams  = '',
      validParam   = false;

  for (var key in reqUrlQuery) {
    if (reqUrlQuery.hasOwnProperty(key)) {
      if (seoProxy.isValidParam(urlMapping, key)) {
        validParam = true;
        queryParams += key + encodeURIComponent('=') + reqUrlQuery[key] + encodeURIComponent('&');
      }
    }
  }

  if (validParam) {
    queryParams = encodeURIComponent('?') + queryParams;
  }

  // Remove the last  `&` (%26)
  queryParams = queryParams.substring(0, queryParams.length - 3);

  return queryParams;
};

seoProxy.getUrlMapping = function(req) {
  return _.find(seoProxy.urlMappings, function(urlMapping) {
    return urlMapping.matcher.test(req.url.path);
  });
};

seoProxy.isValidParam = function(urlMapping, key) {
  return urlMapping.parameters.some(function(paramName) {
    return paramName.toLowerCase() == key.toLowerCase();
  });
};

// List of user-agents
seoProxy.crawlerUserAgents = ['google', 'yahoo', 'bing', 'baidu', 'jeeves', 'facebook', 'twitter', 'linkedin'];

//File extensions to be ignored
seoProxy.extensionsToIgnore = ['.js', '.css', '.xml', '.png', '.jpg', '.jpeg', '.gif'];

// Configuration for each url based in a pattern (regular expression matcher).
// Please add more restrict matchers before the general ones.
seoProxy.urlMappings = [{
  // Match any URL
  matcher: /.+/,
  parameters: ['ID']
}];

module.exports = seoProxy;
