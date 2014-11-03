'use strict';
var rewire = require('rewire'),
    proxy = rewire('../lib/mewProxy');

describe('proxy', function() {

  describe('getHost', function() {

    it('when run in a dev environment, should return a URL using the environment API_SUBDOMAIN and the endpoint\'s context.host', function() {
      process.env.NODE_ENV = 'dev';
      process.env.API_SUBDOMAIN = 'api';
      proxy.getHost({
        headers: {
          host: 'http://m.macys.com'
        }
      }, 'qa13codemacys.fds.com').should.eql('api.qa13codemacys.fds.com');
    });

    it('when run in a production environment and requested from a "herokuapp.com" host, should return a URL using the environment API_SUBDOMAIN and the endpoint\'s context.host', function() {
      process.env.NODE_ENV = 'production';
      process.env.API_SUBDOMAIN = 'services';
      proxy.getHost({
        headers: {
          host: 'http://m2qa1.herokuapp.com'
        }
      }, 'qa13codemacys.fds.com').should.eql('services.qa13codemacys.fds.com');
    });

    it('when run in a production environment and requested from a dynamic host, should return a URL using the environment API_SUBDOMAIN and the extracted host', function() {
      process.env.NODE_ENV = 'production';
      process.env.API_SUBDOMAIN = 'api';
      proxy.getHost({
        headers: {
          host: 'http://m2qa1.qa15codemacys.fds.com'
        }
      }, undefined).should.eql('api.qa15codemacys.fds.com');
    });
  });

  describe('getHeaders', function() {
    it('should extract the subdomain from an explicitly specified host url and return the corresponding header object', function() {
      process.env.API_SUBDOMAIN = 'services';
      process.env.SERVICES_KEY = 'test';
      proxy.getHeaders(null, 'mykey').should.eql({
        accept: 'application/json',
        'Content-Type': 'application/json',
        'x-macys-webservice-client-id': 'test',
        'x-macys-customer-id': 'test'
      });
    });

    it('should use the environment\'s subdomain if `default` is set as the host and return the corresponding header object', function() {
      process.env.API_SUBDOMAIN = 'api';
      process.env.CATALOGCATEGORYBROWSEPRODUCTV3_KEY = 'test';
      proxy.getHeaders(null, 'mykey').should.eql({
        accept: 'application/json',
        'Content-Type': 'application/json',
        'x-macys-webservice-client-id': 'mykey'
      });
    });
  });
});
