module.exports = {
  jasmine: {
    command: 'python -m SimpleHTTPServer 6767'
  },
  mocha: {
    command: 'node --debug-brk $(which grunt) runmocha'
  }
};
