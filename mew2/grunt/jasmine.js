// [Jasmine unit testing](https://github.com/gruntjs/grunt-contrib-jasmine) using the [requirejs template](https://github.com/jsoverson/grunt-template-jasmine-requirejs)

var grunt = require('grunt');
var requirejs = require('requirejs');

module.exports = {
  all: {
    src: [
      '<%= clientDest %>/scripts/**/**.js',
      '!<%= clientDest %>/scripts/lib/**.js',
      '!<%= clientDest %>/scripts/compTemplates/**.js',
      '!<%= clientDest %>/scripts/coremetrics/**.js',
      '!<%= clientDest %>/scripts/foresee/**.js',
      '!<%= clientDest %>/scripts/router/**.js'
    ],
    options: {
      junit: {
        path: 'jasminexml'
      },
      keepRunner: true,
      // display: 'full',
      display: 'short',
      summary: true,
      specs: ['<%= commonSrc %>/test/jasmine/spec/*Spec.js', '<%= brandSrc %>/test/jasmine/spec/*Spec.js'],
      template: require('grunt-template-jasmine-istanbul'),
      templateOptions: {
        replace: false,
        template: require('grunt-template-jasmine-requirejs/src/template-jasmine-requirejs'),
        coverage: 'bin/coverage/coverage.json',
        report: [{
          type: 'html',
          options: {
            dir: 'bin/coverage/html'
          }
        }, {
          type: 'lcov',
          options: {
            dir: 'bin/coverage/lcov'
          }
        }, {
          type: 'lcovonly',
          options: {
            dir: 'bin/coverage/lcovonly'
          }
        }],
        templateOptions: {
          requireConfig: {
            baseUrl: '<%= clientDest %>/scripts/',
            shim: '<%= shim %>',
            paths: '<%= paths %>',
            map: '<%= map %>',
            config: {
              instrumented: {
                src: grunt.file.expand('target/' + process.env.BRAND + '/' + process.env.ENV + '/public/scripts/**/**.js')
              }
            },
            callback: function() {
              'use strict';
              define('instrumented', ['module'], function(module) {
                return module.config().src;
              });
              require(['instrumented'], function(instrumented) {
                var oldLoad = requirejs.load;
                requirejs.load = function(context, moduleName, url) {

                  // Ignore handlebars templates and libraries when reporting code coverage
                  if (url.indexOf('compTemplates') !== -1 || url.indexOf('scripts/lib') !== -1) {
                    return oldLoad.apply(this, [context, moduleName, url]);
                  }
                  // normalize paths
                  if (url.substring(0, 1) === '/') {
                    url = url.substring(1);
                  } else if (url.substring(0, 2) === './') {
                    url = url.substring(2);
                  }
                  // redirect
                  if (instrumented.indexOf(url) > -1) {
                    url = '.grunt/grunt-contrib-jasmine/' + url;
                  }
                  return oldLoad.apply(this, [context, moduleName, url]);
                };
              });
            }
          }
        }
      }
    }
  }
};
