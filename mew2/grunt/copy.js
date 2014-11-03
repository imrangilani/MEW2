'use strict';
// [File copying task](https://github.com/gruntjs/grunt-contrib-copy)
module.exports = {
  // Copys source server files into the destination
  server: {
    files: [
      // copys all common server files
      {
        expand: true,
        cwd: 'server',
        src: ['**', '!**/{mcom,bcom}**', '!test/**'],
        dest: '<%= serverDest %>'
      },
      // renames prefixed brand files and then copys them
      {
        expand: true,
        cwd: 'server',
        src: ['**/<%= brand %>**'],
        filter: 'isFile',
        dest: '<%= serverDest %>',
        rename: function(dest, src) {
          return dest + '/' + src.replace(process.env.BRAND + '_', '');
        }
      },
      {
        '<%= serverDest %>/package.json': 'package.json'
      }
    ]
  },
  // Copys source server files into a test folder to run mocha tests
  servertest: {
    files: [
      // server common files including tests
      {
        expand: true,
        cwd: 'server',
        src: ['**'],
        dest: 'target/test'
      }, {
        expand: true,
        cwd: 'server',
        src: ['**/<%= brand %>**'],
        filter: 'isFile',
        dest: 'target/test',
        rename: function(dest, src) {
          return dest + '/' + src.replace(process.env.BRAND + '_', '');
        }
      }
    ]
  },
  // Copys the client source code into the target folder
  client: {
    files: [
      // fonts
      {
        expand: true,
        flatten: true,
        src: ['<%= brandSrc %>/src/fonts/*.{woff,svg,eot}'],
        dest: '<%= clientDest %>/styles/fonts'
      },
      // foresee css
      // Since it's a third-party css we need to manually copy them into target
      {
        expand: true,
        flatten: true,
        src: ['<%= brandSrc %>/src/styles/foresee/*.css'],
        dest: '<%= clientDest %>/styles/foresee'
      },
      // common images and scripts except templates and main.js
      // styles and templates get compiled in a separate task
      {
        expand: true,
        cwd: '<%= commonSrc %>/src/',
        src: ['**', '!styles/**', '!templates/**', '!scripts/main.js'],
        dest: '<%= clientDest %>/'
      },
      // brand images and scripts except except templates and fonts
      // styles and templates get compiled in a separate task
      {
        expand: true,
        cwd: '<%= brandSrc %>/src/',
        src: ['**', '!styles/**', '!templates/**', '!fonts/**'],
        dest: '<%= clientDest %>/'
      },
      // for jasmine, the requirejs base path is target/[brand]/[build]/public/scripts
      // therefore, the jasmineHelpers must be within scripts
      // @TODO find a way to keep jasmineHelpers outside of /public/
      {
        expand: true,
        cwd: '<%= commonSrc %>/test/jasmine',
        src: ['jasmineHelpers.js'],
        dest: '<%= clientDest %>/scripts/'
      }
    ]
  },
  // Copys the source scripts from both the brand and common folders
  scripts: {
    files: [
      // common scripts excluding main.js as it is copied via the requirejsconfig task
      {
        expand: true,
        cwd: '<%= commonSrc %>/src/',
        src: ['scripts/**','scripts/**/**', '!scripts/main.js'],
        dest: '<%= clientDest %>/'
      },
      // brand scripts
      {
        expand: true,
        cwd: '<%= brandSrc %>/src/',
        src: ['scripts/**','scripts/**/**'],
        dest: '<%= clientDest %>/'
      }
    ]
  },
  // Copys the generated sprite image to the target folder
  sprite: {
    files: [{
      expand: true,
      cwd: '<%= commonSrc %>/src/images/',
      src: ['icon*.png'],
      dest: '<%= commonSrc %>/images/'
    }]
  },
  // Copys the Procfile to be deployed on heroku
  heroku: {
    files: {
      '<%= serverDest %>/Procfile': 'Procfile'
    }
  }
};
