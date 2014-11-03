// [Outputs require.js config to a file](https://github.com/ChrisWren/grunt-requirejs-config)
module.exports = {
  dev: {
    src: '<%= commonSrc %>/src/scripts/main.js',
    dest: '<%= clientDest %>/scripts/main.js',
    options: {
      shim: '<%= shim %>',
      paths: '<%= paths %>',
      map: '<%= map %>'
    }
  }
};
