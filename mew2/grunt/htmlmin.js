// [Minifies the index.html file for production](https://github.com/gruntjs/grunt-contrib-htmlmin)
module.exports = {
  dist: {
    options: {
      removeComments: true,
      collapseWhitespace: true
    },
    files: {
      '<%= clientDest %>/index.html': '<%= brandSrc %>/src/index.html'
    }
  }
};
