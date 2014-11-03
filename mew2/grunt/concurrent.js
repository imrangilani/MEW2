// [Runs grunt tasks concurrently](https://github.com/sindresorhus/grunt-concurrent)
module.exports = {
  dev: ['nodemon', 'watch', 'node-inspector', 'weinre', 'notify:build'],
  jasmine: ['shell:jasmine', 'delay:1:open:jasmine'],
  mocha: ['node-inspector:mocha', 'shell:mocha', 'delay:1:open:mocha'],
  options: {
    logConcurrentOutput: true
  }
};
