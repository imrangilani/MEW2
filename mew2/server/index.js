'use strict';
if (process.env.NEW_RELIC_LICENSE_KEY) { require('newrelic'); } // License key required otherwise errors are logged

var Hapi    = require('hapi'),
    pack    = require('./package'),
    moment  = require('moment'),
    Hoek    = require('hoek'),
    cluster = require('cluster');

var server = new Hapi.Server(+process.env.PORT, {
  files: { relativeTo: __dirname + '/public' },
  state: { cookies: { failAction: 'ignore', strictHeader: false }},
  views: {
    engines: {
      hbs: 'handlebars'
    },
    path: __dirname + '/lib/views',
    helpersPath: __dirname + '/lib/views/helpers'
  }
});

var routes = [
  { method: 'GET', path: '/mew20/{path*}',                                       config: require('./lib/assets').mew20 },
  { method: 'GET', path: '/',                                                    config: require('./lib/assets').fallback },
  { method: 'GET', path: '/catalog/index.ognc',                                  config: require('./lib/assets').fallback },
  { method: 'GET', path: '/shop',                                                config: require('./lib/assets').fallback },
  { method: 'GET', path: '/shop/{path*}',                                        config: require('./lib/assets').fallback },
  { method: 'GET', path: '/shop/product',                                        config: require('./lib/assets').pdp },
  { method: 'GET', path: '/shop/product/{path*}',                                config: require('./lib/assets').pdp },
  { method: 'GET', path: '/index.ognc',                                          config: require('./lib/assets').fallback },
  { method: 'GET', path: '/buy/{path*}',                                         config: require('./lib/assets').fallback },
  { method: 'POST',path: '/api/v1/auth/token/userdetails',                       config: require('./lib/signIn') },
  { method: 'POST',path: '/api/v1/wishlist',                                     config: require('./lib/wishlist') },
  { method: 'GET', path: '/api/v3/marketmedia/global',                           config: require('./lib/admedia') },
  { method: 'GET', path: '/api/v3/catalog/category/index',                       config: require('./lib/categoryIndex') },
  { method: 'GET', path: '/api/v4/catalog/category/brandindex',                  config: require('./lib/brandIndex') },
  { method: 'GET', path: '/api/v3/catalog/category/{categoryId}/browseproducts', config: require('./lib/browse') },
  { method: 'GET', path: '/api/v3/catalog/reviews',                              config: require('./lib/reviews') },
  { method: 'POST',path: '/api/v3/catalog/reviews/{reviewId}/feedback',          config: require('./lib/reviews') },
  { method: 'GET', path: '/api/v4/catalog/search',                               config: require('./lib/search') },
  { method: 'GET', path: '/api/v4/catalog/product/{productId}',                  config: require('./lib/product') },
  { method: 'GET', path: '/api/v4/catalog/bops/product/{productId}',             config: require('./lib/bopsProduct') },
  { method: 'GET', path: '/api/v4/catalog/bops/upc/{upcNumber}',                 config: require('./lib/bopsUpc') },
  { method: 'GET', path: '/api/v4/catalog/category/brandindex/{fobCatId}',       config: require('./lib/brandIndex') },
  { method: 'GET', path: '/api/v2/shoppingbag/bagItemCount',                     config: require('./lib/bagCount') },
  { method: 'POST',path: '/api/v2/shoppingbag/item',                             config: require('./lib/addtobag') },
  { method: 'PUT', path: '/api/v2/shoppingbag/item',                             config: require('./lib/addtobag') },
  { method: 'GET', path: '/api/v4/recommendations/product/{productId}',          config: require('./lib/recommendations') },
  { method: 'GET', path: '/api/v3/catalog/reviewtemplate/{productId}',           config: require('./lib/writeReview').get },
  { method: 'POST',path: '/api/v3/catalog/reviews',                              config: require('./lib/writeReview').post },
  { method: 'GET', path: '/api/v2/store/detail',                                 config: require('./lib/store') },
  { method: 'GET', path: '/api/v2/store/detail/{stores}',                        config: require('./lib/store') },
  { method: 'GET', path: '/api/v2/store/focusdetail',                            config: require('./lib/storeDetails') },
  { method: 'GET', path: '/api/v4/catalog/product/sizechart/{canvasId}',         config: require('./lib/sizeCharts') },
  { method: 'GET', path: '/api/{path*}',                                         config: require('./lib/mew10').get },
  { method: 'POST',path: '/wedding-registry/addtoregistry',                      config: require('./lib/addtoregistry') },
  { method: 'GET', path: '/m/campaign/free-shipping/free-shipping-everyday',     config: require('./lib/assets').fallback },
  { method: 'GET', path: '/store/event/calendar/{format}',                       config: require('./lib/storeCalendar') }
];

//Mew 1.0 redirects. Need to figure out how to specify a wedding-registry path for Hapi as a single path.
//Using /shop/wedding-registry/{path*} goes to assets.fallback
routes = routes.concat([
  { method: 'GET', path: '/store/about/visitor/{j}',                             config: require('./lib/mew10').get },
  { method: 'GET', path: '/store/storeavailability/{a}',                         config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/tabletop-builder/set-your-table',                config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/catalog/product/recentlyViewed/',                config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/catalog/product/thumbnail/{a}',                  config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/wedding-registry/{cat}',                         config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/wedding-registry/{cat}/{p}',                     config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/wedding-registry/{cat}/{p}/{t}',                 config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/wedding-registry/{cat}/{p}/{t}/{s}',             config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/registry/wedding/search',                        config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/registry/wedding/',                              config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/search/facetedmeta/{a}',                         config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/search/facetedmeta',                             config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/search/product/thumbnail',                       config: require('./lib/mew10').get },
  { method: 'GET', path: '/buy/all-brands/{cat}',                                config: require('./lib/mew10').get },
  { method: 'GET', path: '/buy/all-brands/{type}/{cat}',                         config: require('./lib/mew10').get },
  { method: 'GET', path: '/buy/all-brands/{type}/{cat}/{s}',                     config: require('./lib/mew10').get },
  { method: 'GET', path: '/EventsWar/events/record/customeraction',              config: require('./lib/mew10').get },
  { method: 'GET', path: '/shop/sales-offers/',                                  config: require('./lib/mew10').get },
  { method: 'GET', path: '/bwallet-faq',                                         config: require('./lib/mew10').get },
  { method: 'GET', path: '/{path*}',                                             config: require('./lib/mew10').get },
  { method: 'POST',path: '/{path*}',                                             config: require('./lib/mew10').post }
]);

/**
 * By default, store pages (i.e. store locator, store details) will be captured in the "/shop/{path*}" route,
 * and redirected to the 1.0 experience.
 *
 * If the feature is disabled by a config property, the 1.0 experience will be presented instead.
 * In this case, set up a route to capture store pages and redirect to the old experience.
 */
if (process.env.CONFIG_STORE_PAGES === 'off') {
  routes = routes.concat([
    { method: 'GET', path: '/store/{path*}',                                    config: require('./lib/mew10').get },
    { method: 'GET', path: '/shop/store',                                       config: require('./lib/mew10').get },
    { method: 'GET', path: '/shop/store/search',                                config: require('./lib/mew10').get },
    { method: 'GET', path: '/shop/store/detail',                                config: require('./lib/mew10').get },
    { method: 'GET', path: '/shop/store/eventsearch',                           config: require('./lib/mew10').get }
  ]);
}
else {
  routes = routes.concat([
    { method: 'GET', path: '/store/{path*}',                                    config: require('./lib/assets').fallback },
    { method: 'GET', path: '/shop/store',                                       config: require('./lib/assets').fallback },
    { method: 'GET', path: '/shop/store/search',                                config: require('./lib/assets').fallback },
    { method: 'GET', path: '/shop/store/detail',                                config: require('./lib/assets').fallback },
    { method: 'GET', path: '/shop/store/eventsearch',                           config: require('./lib/assets').fallback }
  ]);

}

var mew10Routes = require('./lib/parsers/config').mew10Routes;
mew10Routes.forEach(function(routePath) {
  routes = routes.concat({ method: 'GET', path: routePath,                                 config: require('./lib/mew10').get });
});

var staticRoutes = require('./lib/parsers/config').staticRoutes;
staticRoutes.forEach(function(routePath) {
  routes = routes.concat({ method: 'GET', path: routePath,                                 config: require('./lib/assets').fallback });
});

//console.log(routes);
server.route(routes);

server.ext('onPreHandler', function(request, next) {
	var tagsArray = request.route.tags;
	if (tagsArray && tagsArray.indexOf('api') > -1) {
		request.url.protocol = 'http';
		request.url.pathname = request.url.pathname.replace(/^\/api\//, '');
	}
	next();
});

server.ext('onPreResponse', function(request, reply) {
  var response = request.response,
      bytes = 0;

  if (response.on) {
    response.on('peek', function(chunk) {
      bytes += chunk.length;
    });

    response.once('finish', function() {
      request.app.bytes = bytes;
    });
  }

  reply();
});

server.on('response', function(request) {
  if (request.route.tags) {
    var tags = Hoek.mapToObject(request.route.tags);

    if (!tags.static && !tags.response && !tags.handler) {
      var time            = '[' + moment(request.info.received).format('D/MMM/YYYY:HH:mm:ss ZZ') + ']',
          ip              = request.info.remoteAddress,
          keys            = Object.keys(tags).join(', '),
          statusCode      = request.response.statusCode,
          serveTime       = (request._bench.elapsed() / 1e3).toFixed(2), // undocumented method (https://github.com/spumko/hoek/blob/master/lib/index.js#L465)
          protocol        = request.url.protocol || 'HTTP',
          bytes           = request.app.bytes || '-',
          referrer        = request.info.referrer || '-',
          userAgent       = request.headers['user-agent'],
          UidKey          = 'macys_online_uid',
          macysOnlineUid  = request.state[UidKey] ? (UidKey + '=' + request.state[UidKey]) : '-',
          requestID       = request.headers['x-request-id'] ? 'request_id=' + request.headers['x-request-id'] : '-',
          firstLineHeader = request.method.toUpperCase() + ' ' +
            request.url.path + ' ' +
            protocol.toUpperCase() + '/' +
            request.raw.req.httpVersion;

      console.log('Tags:', keys, '~', ip, time, serveTime, firstLineHeader, statusCode, bytes, referrer, userAgent, macysOnlineUid, requestID);
    }
  }
});

// Start of replacing hapi's debug setting to align with SST request
server.on('request', function(request, event, tags) {
  if (tags.error) {
    console.log('Tags:', Object.keys(tags).join(', '), '~', (event.data ? event.data.stack || JSON.stringify(event.data) : ''));
  }
});

server.on('internalError', function(request, err) {
  /* jshint camelcase:false */
  console.error('Error response (500) sent for Macy\'s online UID: ' + request.state.macys_online_uid + ', because: ' + err.message);
});

server.on('log', function(event) {
	console.log(event.data);
});

if (process.env.SWAGGER) {
	var swaggerOptions = { basePath: 'http://localhost:' + server.info.port, apiVersion: pack.version };

	server.pack.require({ 'hapi-swagger': swaggerOptions }, function(err) {

    if (err) { server.log(['error'], 'Plugin "hapi-swagger" load error: ' + err); }

    server.log(['start'], 'swagger interface loaded');
	});
	server.route({ method: 'GET', path: '/swagger', config: {
		tags: ['swagger', 'static'],
		handler: { file: __dirname + '/lib/swagger.html' }
	}});
}

if (process.env.NODE_ENV === 'production') { // Heroku sets this in their environment
  var DYNO = process.env.DYNO_CLUSTERS,
      numCPUs = require('os').cpus().length;

  if (!DYNO || DYNO > numCPUs) {
    console.log('DYNO_CLUSTERS undefined or set too high, using system count:', numCPUs);
  } else {
    numCPUs = DYNO;
  }

  if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', function(worker) {
      console.log('worker ' + worker.process.pid + ' died');
    });
  } else if (cluster.isWorker) {
    server.start(function() {
      console.log('Hapi', Hapi.version, server.info.uri);
    });
  }

  cluster.on('online', function(worker) {
    console.log('worker ' + worker.process.pid + ' is online');
  });

} else {
  server.start(function() {
    console.log('Hapi', Hapi.version, server.info.uri);
  });
}
