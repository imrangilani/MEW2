// [Opens browser to view server or jasmine tests](https://github.com/onehealth/grunt-open)
module.exports = {
  server: {
    path: 'http://localhost:<%= port %>'
  },
  jasmine: {
    path: 'http://localhost:6767/_SpecRunner.html'
  },
  mocha: {
    path: 'http://127.0.0.1:1338/debug?port=5858'
  },
  sonar: {
    path: '.sonar/issues-report/issues-report.html'
  }
};
