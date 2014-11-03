'use strict';
var seoProxy = require('./seoProxy'),
    Nipple   = require('nipple'),
    fs       = require('fs'),
    cheerio  = require('cheerio'),
    mew10    = require('./mew10'),
    mewProxy = require('./mewProxy'),
    config   = require('./parsers/config');

if (process.env.NEW_RELIC_LICENSE_KEY) { var newrelic = require('newrelic'); }

module.exports = {
  mew20: {
    description: 'Server static assets',
    notes: 'All requests that begin with /mew20 are assumed to be static assets in /public',
    tags: ['static'],
    handler: {
      directory: {
        path: './'
      }
    }
  },
  pdp: {
    description: 'Serve pdp page',
    notes: 'This is temporary redirect based on product name for gift cards which go to 1.0',
    tags: ['fallback', 'pdp'],

    handler: function(request, reply) {
      var isMew10 = false;
      var selectedHandler;

      if (config.mew10ProductPattern) {
        config.mew10ProductPattern.forEach(function(value) {
          if (request.path.indexOf(value) !== -1) {
            isMew10 = true;
          }
        });
      }

      if (isMew10) {
        selectedHandler = mew10.get.handler;
      } else {
        selectedHandler = module.exports.fallback.handler;
      }

      selectedHandler(request, reply);
    }
  },
  fallback: {
    description: 'Serve index page or brombone generated snapshot',
    notes: 'This is the default fallback route if not explicitly captured',
    tags: ['fallback', 'static'],
    handler: function(request, reply) {
      // Check if the request is coming from the search engine
      var isRequestFromBot;

      if (process.env.CONFIG_BYPASS_BROMBONE_DARKLAUNCH === 'on') {
        isRequestFromBot = false;
      } else {
        isRequestFromBot = seoProxy.shouldShowSEOPage(request);
      }

      // If the request is from bot, proxy the request to an upstream endpoint (3rd party - brombone)
      if (isRequestFromBot) {
        var mapper = function(request, callback) {
          callback(null, seoProxy.buildApiUrl(request), null);
        };

        var handleResponse = function(err, res, request, reply) {

          if (err) {
            return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload);
          }

          if(res.statusCode == 403) {
            module.exports.asset.handler(request, reply);
          } else {
            Nipple.read(res, function(err, payload) {
              if (err) {
                return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload);
              }

              console.log('Response body  ' + payload);
              var uri = request.info.host + request.url.format(request.url);
              //Start setting response headers
              var response = reply(payload)
                .code(res.statusCode)
                .header('Upstream-Host', uri)
                .header('Content-Type', 'text/html; charset=utf-8')
                .hold();

              //Send response
              response.send();
            });
          }
        };

        reply.proxy({
          mapUri: mapper,
          onResponse: handleResponse
        });

      } else {
        /*var categoryTree = catIndexParser.categoryTree;

        // Redirect if goto or tier 2 remain category
        if (request.query.id && /^\d+$/.test(request.query.id) && categoryTree) {
          var reqCat = categoryTree[request.query.id];

          if (reqCat && reqCat.r) {
            return reply().redirect(categoryTree[reqCat.p].u);

          } else if (reqCat && reqCat.g && categoryTree[reqCat.g]) {
            return reply().redirect(categoryTree[reqCat.g].u);
          }
        }*/
        // Request is from the browser, process normally
        module.exports.asset.handler(request, reply);

      }
    }
  },
  asset: {
    description: 'Serve index page',
    notes: 'This is the default fallback route if not explicitly captured',
    tags: ['fallback', 'indexPage'],

    handler: function(request, reply) {
      // Pull in index and inject config properties
      fs.readFile(__dirname + '/../public/index.html', function(err, data) {
        // Better to at least throw the error than do nothing with it
        if (err) { throw err; }

        // generate an object of all config properties set up
        var config = {};

        // Node way of iterating an object
        Object.keys(process.env).forEach(function(key) {
          if (key.indexOf('CONFIG_') === 0) {
            config[key.toLowerCase().replace('config_', '')] = process.env[key];
          }
        });

        var configStr = '';
        // Check that its not empty
        if (Object.getOwnPropertyNames(config)) {
          configStr = 'var ENV_CONFIG = (function() { return ' + JSON.stringify(config) + '; })();';
        }

        // create a cheerio object from the index.html
        var $ = cheerio.load(data + '');

        // https://docs.newrelic.com/docs/agents/nodejs-agent/supported-features/page-load-timing-nodejs
        if (process.env.NEW_RELIC_LICENSE_KEY) {
          $('meta[charset=utf-8]').after(newrelic.getBrowserTimingHeader());
        }

        // If we have config properties to pass to the client, inject after main HTML content
        if (configStr) {
          $('#mb-page-wrapper').after('<script type="text/javascript">' + configStr + '</script>');
        }

        request.log(request.route.tags, { uri: reply($.html()).source.path });
      });
    }
  }
};
