// [Runs nodemon to restart the server when .js files change](https://github.com/ChrisWren/grunt-nodemon)
module.exports = {
  dev: {
    options: {
      'web-port': 1337
    }
  },
  mocha: {
    options: {
      'web-port': 1338
    }
  }
};
