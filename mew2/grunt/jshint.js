// [Lints JavaScript code to maintain coding standards](https://github.com/gruntjs/grunt-contrib-jshint)
module.exports = {
  options: {
    jshintrc: '.jshintrc'
  },
  all: [
    '*.js',
    'build/*.js',
    'server/**/**.js',
    '<%= commonSrc %>/test/jasmine/spec/*.js',
    '<%= commonSrc %>/src/scripts/**/**.js'
  ],
  jasmine: [
    '<%= commonSrc %>/test/jasmine/spec/*.js',
    '<%= brandSrc %>/test/jasmine/spec/*.js'
  ],
  mocha: [
    'server/test/*.js'
  ]
};
