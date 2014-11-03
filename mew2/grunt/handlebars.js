'use strict';
var path = require('path');

// [Handlebars compilation task](https://github.com/gruntjs/grunt-contrib-handlebars) for template compilation
module.exports = {
  compile: {
    options: {
      // Remove folder path name from file
      processName: function(fileName) {
        return path.basename(fileName, '.hbs');
      },
      // Global object for handlebars templates
      namespace: 'TEMPLATE',
      wrapped: true,
      amd: true,
      partialsUseNamespace: true,
      partialRegex: /.*/,
      partialsPathRegex: /\/partials\//
    },
    // Handlebars files to compile
    files: [{
      src: [
        '<%= commonSrc %>/src/templates/*.hbs',
        '<%= commonSrc %>/src/templates/**/*.hbs',
        '<%= brandSrc %>/src/templates/*.hbs',
        '<%= brandSrc %>/src/templates/**/*.hbs'
      ],
      dest: '<%= clientDest %>/scripts/compTemplates/appTemplates.js'
    }]
  }
};
