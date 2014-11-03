// [Runs mocha tests against the node.js server code](https://github.com/yaymukund/grunt-simple-mocha)
module.exports = {
  options: {
    timeout: 3000,
    ignoreLeaks: false,
    ui: 'bdd',
    reporter: 'spec'
  },
  all: {
    src: ['target/test/test/*Spec.js']
  }
};
