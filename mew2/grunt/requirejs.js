// [Optimizes the javascript files for the build](https://github.com/gruntjs/grunt-contrib-requirejs)
module.exports = {
  compile: {
    options: {
      baseUrl: '<%= clientDest %>/scripts',
      name: 'main',
      out: '<%= clientDest %>/scripts/main.js',
      mainConfigFile: '<%= clientDest %>/scripts/main.js',
      findNestedDependencies: true,
      preserveLicenseComments: false,
      optimize: 'uglify2',
      generateSourceMaps: true
    }
  }
};
