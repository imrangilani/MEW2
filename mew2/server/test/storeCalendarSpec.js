/**
 * Created by Flavio Coutinho on 7/23/2014.
 */
'use strict';

var sinon  = require('sinon'),
    storeCalendar = require('../lib/storeCalendar');

require('should');


describe('storeCalendar', function() {
  /*jshint expr: true*/
  /*jshint es5: true */
  describe('handler', function() {
    var request,
        reply;

    beforeEach(function() {
      request = { log: function() {} };
      reply = sinon.spy();
      reply.view = sinon.stub().returns({
        header: function() { return this; },
        hold: function() { return this; },
        send: function() { return this; }
      });
    });

    it('should not fail for requests with missing query parameters', function() {
      request.params = { format: 'vcs' };
      var f = function() { storeCalendar.handler(request, reply); };
      f.should.not.throw();
    });

    it('should accept the .vcs (1.0, vCalendar) format', function() {
      request.params = {
        format: 'vcs',
        query: {
          productId: 'a',
          startDateTime: '20001010T000000Z',
          endDateTime: '20001010T000000Z',
          uniqueId: '1',
          eventName: 'n',
          shortDesc: 'd',
          location: 'l'
        }
      };
      storeCalendar.handler(request, reply);

      reply.view.called.should.be.ok;
    });

    it('should accept the .ics (2.0, iCalendar) format', function() {
      request.params = {
        format: 'ics',
        query: {
          productId: 'a',
          startDateTime: '20001010T000000Z',
          endDateTime: '20001010T000000Z',
          uniqueId: '1',
          eventName: 'n',
          shortDesc: 'd',
          location: 'l'
        }
      };
      storeCalendar.handler(request, reply);

      reply.view.called.should.be.ok;
    });

    it('should fail for unknown calendar formats and respond with an error', function() {
      request.params = {
        format: 'UNKNOWWNNNNNFORMAT'
      };
      storeCalendar.handler(request, reply);

      reply.called.should.be.ok;
    });
  });
});

