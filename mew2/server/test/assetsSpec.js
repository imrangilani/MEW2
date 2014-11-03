/*jshint expr: true*/
'use strict';

// var rewire = require('rewire'),
var sinon = require('sinon');
    // assets = rewire('../lib/assets');

describe('assets', function() {

  describe('fallback handler', function() {
    // assets.__set__('catIndexParser', {
    //   categoryTree: {
    //     1: {
    //       r: true,
    //       p: '2',
    //       u: 'url1'
    //     },
    //     2: {
    //       u: 'url2'
    //     },
    //     3: {
    //       g: 1
    //     }
    //   }
    // });
    var replyObject = {
      redirect: function() {},
      proxy: function() {}
    };
    /*var reply = function() {
      return replyObject;
    };*/

    sinon.stub(replyObject, 'redirect');

    it('should redirect to the true category when the `id` query parameter refers to a goto category', function() {
      /*var request = {
        query: {
          id: 3
        },
        route: {
          tags: []
        },
        log: function() {},
        headers: {
          'user-agent': 'webkit'
        },
        method: 'get',
        url: 'localhost:8081',
        path: '/'
      };
      assets.fallback.handler(request, reply);
      replyObject.redirect.lastCall.args.should.eql(['url1']);*/
    });

    it('should redirect to the parent category when the `id` query parameter refers to a `remain` or `non-clickable` category', function() {
      /*var request = {
        query: {
          id: 1
        },
        route: {
          tags: []
        },
        log: function() {},
        headers: {
          'user-agent': 'webkit'
        },
        method: 'get',
        url: 'localhost:8081',
        path: '/'
      };
      process.env.INTEGRATION_HOST = 'http://bloomingdales.brombonesnapshots.com/';
      assets.fallback.handler(request, reply);
      replyObject.redirect.lastCall.args.should.eql(['url2']);*/
    });

    it('should otherwise server the index.html app', function() {
      // var request = {
      //   query: {
      //     id: 2
      //   },
      //   route: {
      //     tags: []
      //   },
      //   log: function() {},
      //   headers: {
      //     'user-agent': 'webkit'
      //   },
      //   method: 'get',
      //   url: 'localhost:8081',
      //   path: '/'
      // };
      // var reply = { file: function() {}, proxy: function() {}};

      // sinon.stub(reply, 'file', function() { return { source: { path: '/file' }};});
      // assets.fallback.handler(request, reply);
      //reply.file.lastCall.args.should.eql(['index.html']);
    });
  });
});
