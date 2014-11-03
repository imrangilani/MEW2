// [Injects a script into and html file during development](https://github.com/ChrisWren/grunt-inject)
module.exports = {
  dev: {
    scriptSrc: 'build/workflow.js',
    files: {
      '<%= clientDest %>/index.html': '<%= brandSrc %>/src/index.html'
    }
  }
};
