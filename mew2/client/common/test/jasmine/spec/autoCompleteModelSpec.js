define([
  'jasmineHelpers',
  'models/_autoCompleteModel'
], function(jasmineHelpers, AutoCompleteModel) {
  'use strict';

  describe('_autoCompleteModel', function() {
    var model;

    beforeEach(function() {
      model = new AutoCompleteModel();
    });

    describe('#isValidDesktopHost', function() {

      it('should white-list any preprod or production environment for m.com and b.com', function() {
        var validDomains = [
          'm.preprod6bloomingdales.fds.com',
          'm.preprod10macys.fds.com',
          'm.bloomingdales.com',
          'm.macys.com'
        ];

        _.each(validDomains, function(item) {
          expect(model.isValidDesktopHost(item)).toBeTruthy();
        });
      });

      it('should black-list any url that is not a preprod or production environment for m.com and b.com', function() {
        var invalidDomains = [
          'qa6bloomingdales.com',
          'qa20macys.com',
          'm2qa1bcomci.herokuapp.com',
          'm2qa1mcomci.herokuapp.com',
          'localhost',
          'www.cnn.com'
        ];

        _.each(invalidDomains, function(item) {
          expect(model.isValidDesktopHost(item)).toBeFalsy();
        });
      });
    });

    describe('#url', function() {

      beforeEach(function() {
        jasmineHelpers.prepareAppGlobals();

        App.config.search = { autoCompleteHost: {
          protocol: 'http://',
          subdomain: 'm2local.',
          path: '/suggester'
        }};

        App.config.ENV_CONFIG.autocomplete_host = 'defaultHost';
      });

      it('should point to a default desktop environment in case the current url does not point to a valid desktop environment', function() {
        spyOn(model, 'getCurrentUrlHost').and.returnValue('localhost:8080');
        expect(model.url()).toMatch('defaultHost');
      });

      it('should point to the same domain in case we are in one that is a valid desktop environment', function() {
        spyOn(model, 'getCurrentUrlHost').and.returnValue('defaultHost');
        expect(model.url()).toMatch('http:\/\/m2local\.defaultHost\/suggester');
      });
    });

    describe('#isCrossDomain', function() {
      // TODO: currently CORS is not enabled for test environments. Hence, isCrossDomain should always return true
      // it('should evaluate to true if the current domain is NOT a valid desktop environment', function() {
      //   spyOn(model, 'getCurrentUrlHost').and.returnValue('localhost');
      //   expect(model.isCrossDomain()).toBeTruthy();
      // });

      // it('should evaluate to false if the current domain IS a valid desktop environment', function() {
      //   spyOn(model, 'getCurrentUrlHost').and.returnValue('m2local.qa10codebloomingdales.fds.com');
      //   expect(model.isCrossDomain()).toBeFalsy();
      // });
    });
  });
});
