// Wrapper around localStorage to provide error handling and conversion from
// Objects to Strings and viceversa
// Inspired by LinkedIn's blog post: http://engineering.linkedin.com/mobile/linkedin-ipad-using-local-storage-snappy-mobile-apps
define([
  'underscore',
  'config',
  'util/util'
], function(_, config, util) {
  'use strict';

  var $localStorage = {
    config: config
  };

  /**
   * Retreives a value from local storage, reseting localStorage if its\
   * storage version is out of date and normalizing the extraction of objects vs strings
   *
   * @param  {String} key Key to retreive from local storage
   * @return {String}
   */
  $localStorage.get = function(key) {
    if(!$localStorage.isAvailable) {
      return true;
    }
    var value = window.localStorage.getItem(key);
    if (window.localStorage.getItem('storageversion') !== this.config.localStorage.storageversion) {
      window.localStorage.clear();
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };

  /**
   * Sets data in localStorage, catching the quota exceeded error, and reseting when necessary
   * @param {String} key   Key to set
   * @param {Object/String} value Value to to set
   */
  $localStorage.set = function(key, value) {
    try {
      if(!$localStorage.isAvailable) {
        return true;
      }
      if (typeof value === 'object') {
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      this.reset();
      this.set.call(this, arguments);
    }
  };

  /**
   * Resets localStorage by extracting all keys, clearing, then re-setting
   * non-volatile keys
   */
  $localStorage.reset = function() {

    // Add timestamps
    var savedKeys = config.localStorage.savedKeys.concat(config.localStorage.savedKeys.map(function(savedKey) {
      return savedKey + ':timestamp';
    }));

    // Stores saved data
    var savedData = {};
    _.each(savedKeys, function(savedKey) {
      if (this.get(savedKey)) {
        savedData[savedKey] = this.get(savedKey);
      }
    }, this);

    window.localStorage.clear();

    // Re-sets saved data
    _.each(savedData, function(value, key) {
      this.set(key, value);
    }, this);

  };

  /**
   * Sets up localstorage by checking browser support and guaranteeing a storage version is set
   * @return {Object/Boolean} Returns localStorage wrapper or false if localStorage isn't supported
   */
  $localStorage.setup = function() {
    if($localStorage.isAvailable) {
      if (!window.localStorage.getItem('storageversion')) {
        window.localStorage.setItem('storageversion', this.config.localStorage.storageversion);
      }
    }
    return this;
  };

  /**
   * Check the localstorage build version against the config / api response build version.
   * If they differ, clear out localstorage.
   *
   * @param buildVersion - the build verison to check current localstorage against.
   *                       If null, build version will be CONFIG_BUILD_VERSION from .env
   *
   * @return true if build version has changed, else false.
   */
  $localStorage.checkBuildVersion = function(buildVersion) {
    if (!buildVersion) {
      buildVersion = App.config.ENV_CONFIG.build_version;
    }

    if (buildVersion !== $localStorage.get('build_version') && $localStorage.isAvailable) {
      //localStorage.clear();
      //$localStorage.setup();
      $localStorage.set('build_version', buildVersion);
      return true;
    }

    return false;
  };

  $localStorage.isAvailable = (function() {
    try {
      window.localStorage.setItem('app:test:storage', 'testval');
      window.localStorage.removeItem('app:test:storage');
      return true;
    } catch (err) {
      return false;
    }
  })();

  return $localStorage.setup();
});
