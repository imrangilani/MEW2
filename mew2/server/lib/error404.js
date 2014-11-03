var Hapi = require('hapi'),
Url      = require('url');

module.exports = {
  description: 'generates 404 response',
  notes: 'Generates 404 for url without route',
  tags: ['error', 'error404'],
  handler: function(request, reply) {

    var error = Hapi.error.badRequest('Invalid api url');
    error.output.statusCode = 404;  // Assign a custom error code
    error.reformat();

    reply(error);

    request.log( 'urlError', {
      statusCode: '404',
      uri: Url.format(request.url)
    });
  }
};
