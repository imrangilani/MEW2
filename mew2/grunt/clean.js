// [Cleans the build folder](https://github.com/gruntjs/grunt-contrib-clean)
module.exports = {
  all: ['target'],
  build: '<%= serverDest %>',
  options: {
    force: true
  }
};
