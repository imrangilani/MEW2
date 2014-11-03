var fs = require('fs');
var _ = require('lodash');

/**
 * Exports the module to generate require.js source paths
 * @param  {Object} grunt        Reference to grunt
 * @param  {Array} folders        Location of folders to discover source files
 * @return {Object}              Require.js paths config for source files
 */
module.exports = function(grunt, brand) {
  'use strict';

  var paths = {};
  var map = {
    '*': {}
  };

  var folders = ['client/' + brand + '/src/scripts/', 'client/common/src/scripts/'];

  /**
   * Returns the alias of a source script file
   * @param  {String} path Source path of a script file
   * @return {String}
   */
  function getAlias(path) {

    // Extract the file alias by removing the scripts folder and the .js file extension
    var alias = path.slice(path.indexOf('scripts/') + 'scripts/'.length).slice(0, -('.js'.length));
    if (alias[0] === '/') {
      alias = alias.slice(1);
    }
    return alias;
  }

  /**
   * Returns a target destination for a script file with the folder removed
   * @param  {String} path   Source path of a script file
   * @param  {String} folder Folder to strip from file targer
   * @return {String}
   */
  function getTarget(path, folder) {

    // Extract the file target path by removing the src and client folders from the path and the .js file extension
    var targetPath = path.replace(folder, '').slice(0, -('.js'.length));
    if (targetPath[0] === '/') {
      targetPath = targetPath.slice(1);
    }
    return targetPath;
  }

  // Analyze all folders
  _.forEach(folders, function(folder) {

    var isCommon = _.indexOf(folder.split('/'), 'common') !== -1;

    // Analyze custom folder
    if (!isCommon && fs.existsSync(folder)) {
      grunt.file.recurse(folder, function(abspath) {
        var alias = getAlias(abspath);
        var targetPath = getTarget(abspath, folder);
        paths[alias] = targetPath;
      });
    }

    // Analyze common folder
    if (isCommon) {
      grunt.file.recurse(folder, function(abspath) {
        var alias = getAlias(abspath);
        var targetPath = getTarget(abspath, folder);

        paths[alias] = targetPath;

        if (alias.indexOf('_core') !== -1) {
          // check if _app file by the same name exits; if not, set up an alias from _app file to the _core version
          var appPath = abspath.replace('_core', '_app');

          if (!fs.existsSync(appPath)) {
            // the _app version does not exist; set up map from _app to _core
            var appAlias = getAlias(appPath);
            // map['*'][appAlias] = alias;
            map['*'][appAlias] = targetPath;
          }
        }

        // Check if there is a brand-specific version of the same file
        var filename = _.last(alias.split('/'));
        var brandPath = abspath.replace('client/common/src', 'client/' + brand + '/src').replace(filename, filename.replace('_', ''));

        if (!fs.existsSync(brandPath)) {
          // the brand-specific version does not exist; map non-underscore require alias to common version of the file
          var brandAlias = getAlias(brandPath);
          map['*'][brandAlias] = alias;
        }

        // console.log(paths);
        // console.log(map);
      });
    }
  });

  return {
    paths: paths,
    map: map
  };
};
