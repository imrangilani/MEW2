// Gets default environment properties from a given heroku env file
module.exports = function(grunt, file) {
  'use strict';

  var defaultEnv = {};

  if (grunt.file.exists(file)) {
    var envContents = grunt.file.read(file);
    envContents.split('\n')
    .filter(function(envLine) {
      return envLine.indexOf('#') === -1;
    })
    .forEach(function(envLine) {
      var key = envLine.trim().split('=')[0];
      var value = envLine.trim().split('=')[1];
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }

  return defaultEnv;
};
