module.exports = {
  build: {
    options: {
      title: 'Build complete',
      message: 'All the grunt tasks are finished.'
    }
  },
  mocha: {
    options: {
      title: 'PASSED',
      message: 'All Mocha server tests passed'
    }
  },
  jasmine: {
    options: {
      title: 'PASSED',
      message: 'All client-side Jasmine tests passed'
    }
  },
  compass: {
    options: {
      title: 'Compass',
      message: 'Tasks complete'
    }
  },
  handlebars: {
    options: {
      title: 'Handlebars',
      message: 'Tasks complete'
    }
  },
  assets: {
    options: {
      title: 'Assets',
      message: 'Client assets copy complete'
    }
  },
  clientReload: {
    options: {
      title: 'Client LiveReload',
      message: 'Reload complete'
    }
  },
  serverReload: {
    options: {
      title: 'Server LiveReload',
      message: 'Reload complete'
    }
  },
  grunt: {
    options: {
      title: 'Grunt',
      message: 'Grunt config change complete'
    }
  }
};
