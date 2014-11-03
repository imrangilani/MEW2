'use strict';
module.exports = {
  src: [
    '<%= commonSrc %>/src/scripts/router/_app/handlers/*.js'
  ],
  options: {
    outputFile: '<%= clientDest %>/scripts/router/_handlers.js',
  }
};
