/**
 * @file generate-route-handlers
 * a grunt plugin that dynamically writes to _handlers.js
 *
 * @author Justin Helmer
 */

module.exports = function (grunt) {
  'use strict';

  grunt.registerMultiTask(
    'generate-route-handlers',
    'dynamically writes to _handlers.js with a list of all handlers',
    function () {
      var files = this.filesSrc;
      var outputFile = this.options().outputFile;

      if (!files.length) {
        grunt.log.writeln('\nNo files found to import.');
      }

      grunt.log.writeln('\nWriting to ' + outputFile.yellow + ':');

      var define = [];
      var prototype = [];

      var cnt = 0;
      var numFiles = files.length;
      files.forEach(function (filepath) {
        // Strip out beginning of filepath and extension
        var requirePath = filepath.replace(/^.*(router\/_app\/handlers\/\w+)\.js$/, '$1');
        var module = requirePath.replace(/^router\/_app\/handlers\/(\w+)$/, '$1');

        var extra = '';
        if (++cnt < numFiles) {
          extra = ',';
        }

        // Write requirePath to file
        grunt.log.writeln('Importing ' + requirePath.cyan);

        define.push('  \'' + requirePath + '\'' + extra);
        prototype.push('  ' + module + extra);
      });

      var lines = [
        // Header
        '// This variable `list` is automatically generated by the grunt generate-route-handlers grunt task.',
        '// Do not directly modify.',
        '',
        'define(['
      ];

      lines = lines.concat(define);
      lines = lines.concat([
        '], function('
      ]);
      lines = lines.concat(prototype);
      lines = lines.concat([
        ') {',
        '  return ['
      ]);
      lines = lines.concat(prototype);
      lines = lines.concat([
        '  ];',
        '});'
      ]);

      // Turn array of lines into single string, and write to file
      grunt.file.write(outputFile, lines.join('\n'));
    }
  );
};
