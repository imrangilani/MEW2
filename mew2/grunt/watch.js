// [Watch files and re-compiles them when the specified directory/files changed](https://github.com/gruntjs/grunt-contrib-watch)
module.exports = {
  compass: {
    files: [
      '<%= commonSrc %>/src/styles/**',
      '<%= commonSrc %>/src/images/icon2x/*',
      '<%= brandSrc %>/src/styles/**',
      '<%= brandSrc %>/src/images/icon2x/*'
    ],
    tasks: ['compass:dev', 'copy:sprite', 'notify:compass']
  },
  handlebars: {
    files: [
      '<%= commonSrc %>/src/templates/{,**/}*.hbs',
      '<%= brandSrc %>/src/templates/{,**/}*.hbs'
    ],
    tasks: ['handlebars', 'notify:handlebars']
  },
  assets: {
    files: [
      '<%= commonSrc %>/src/{scripts,fonts,images}/{,*/}*',
      '<%= commonSrc %>/src/scripts/router/**/**',
      '<%= brandSrc %>/src/{scripts,fonts,images}/{,*/}*',
      '!<%= brandSrc %>/src/images/icon2x*',
      '!<%= commonSrc %>/src/scripts/main.js',
      '!<%= brandSrc %>/src/index.html'
    ],
    tasks: ['copy:client', 'notify:assets']
  },
  html: {
    files: [
      '<%= brandSrc %>/src/index.html'
    ],
    tasks: ['inject']
  },
  main: {
    files: [
      '<%= commonSrc %>/src/scripts/main.js'
    ],
    tasks: ['requirejsconfig']
  },
  server: {
    files: [
      'server/**',
      '!server/test/**'
    ],
    tasks: ['copy:server']
  },
  clientReload: {
    // Limit the client reload files to one per type of file to prevent EMFILE error
    files: [
      '<%= clientDest %>/index.html',
      '<%= clientDest %>/scripts/{router/_router.js,compTemplates/appTemplates.js,main.js}',
      '<%= clientDest %>/styles/css/main.css'
    ],
    options: {
      livereload: true
    },
    tasks: ['notify:clientReload']
  },
  serverReload: {
    files: ['.grunt/rebooted'],
    options: {
      livereload: true
    },
    tasks: ['notify:serverReload']
  },
  jasmine: {
    files: ['<%= commonSrc %>/test/jasmine/spec/*', '<%= brandSrc %>/test/jasmine/spec/*'],
    tasks: ['runjasmine:dev']
  },
  mocha: {
    files: ['server/test/**'],
    tasks: ['copy:servertest', 'simplemocha:all']
  },
  // Reload grunt config when files change
  grunt: {
    files: [
      'Gruntfile.js',
      'grunt/**'
    ],
    tasks: ['notify:grunt'],
    options: {
      reload: true
    }
  }
};
