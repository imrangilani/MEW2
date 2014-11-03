/**
 * Created by Flavio Coutinho on 7/21/2014.
 */
'use strict';
var Hapi = require('hapi'),
    Url = require('url');

module.exports = {
  description: 'generates an iCalendar file describing an event',
  notes: 'Generates an iCalendar/vCalendar (.ics/.vcs) file that describes an event to be added to the calendar by the user',
  tags: ['calendar'],
  handler: function(request, reply) {
    var requestedCalendarFormat = request.params.format,
        supportedCalendarFormats = {
          vcs: 'text/x-vcalendar',
          ics: 'text/calendar'
        },
        error,
        response;

    if (Object.keys(supportedCalendarFormats).indexOf(requestedCalendarFormat) === -1) {
      error = Hapi.error.badRequest('Invalid calendar format requested: ' + requestedCalendarFormat);
      error.output.statusCode = 404;  // Assign a custom error code
      error.reformat();

      reply(error);

      request.log('urlError', {
        statusCode: '404',
        uri: Url.format(request.url)
      });

      return;
    }

    response = reply.view(requestedCalendarFormat, request.query, {
        contentType: supportedCalendarFormats[requestedCalendarFormat]
      })
      .header('Content-Disposition', 'attachment; filename=event.' + requestedCalendarFormat)
      .hold();

    response.send();
  }
};
