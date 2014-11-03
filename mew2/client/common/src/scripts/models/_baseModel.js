/**
 * Provides a generic request timeout value, error handling for fetchs, and
 * localStorage caching by implementing the following methods and properties:
 *
 * isStoredInLocalStorage
 * Boolean
 *
 * getKey
 * Function
 * Returns a unique identifier for the resource
 *
 * dataLifeSpan
 * Number
 * How long the resource should be cached
 *
 * isCrossDomain
 * Boolean
 * To set the JSONP
 *
 */
define([
  'backbone',
  'views/errorOverlay',
  //utilities
  'util/localstorage',
  'util/util',
  'url-parser'
], function(Backbone, ErrorOverlay, $localStorage, util) {
  'use strict';

  var errorHandlerType = ['ignoreAll', 'showModal', 'showOverlay'];

  return Backbone.Model.extend({

    // Default time(in ms) to wait before rendering a timeout error
    timeout: 200000,

    sync: function(method, model, options) {
      var key, now, timestamp, success;

      if (!_.result(this, 'isLoadingImageDisabled')) {
        util.showLoading();
      }

      // To hit a REST service that is not in WSSG
      // Set JSONP and provice the full url in the corresponding model
      if (_.result(this, 'isCrossDomain')) {
        this.configureJsonp(options);
      }

      // only override sync if it is a fetch('read') request and the model/collection
      // is stored in local storage
      if (method === 'read' && $localStorage && this.isStoredInLocalStorage) {
        // get the unique key which identfies this resource
        key = this.getKey();
        now = new Date().getTime();
        timestamp = $localStorage.get(key + ':timestamp');
        if (!timestamp || ((now - timestamp) > this.dataLifeSpan)) {

          // make a network request and store result in local storage
          success = options.success;
          options.success = function(resp, status, xhr) {

            // Add data and timestamp to localStorage
            $localStorage.set(key, resp);
            $localStorage.set(key + ':timestamp', new Date().getTime());
            success(resp, status, xhr);
          };
          // call normal backbone sync
          Backbone.sync(method, model, options);
        } else {
          // provide data from local storage instead of a network call
          var data = $localStorage.get(key);
          // simulate a normal async network call
          setTimeout(function() {
            options.success(data, 'success', null);
          }, 0);
        }
      } else {
        // Global position to display/hide loading image for POST and PUT calls
        // Override the success and error methods form the model
        success = options.success;
        var error   = options.error;
        options.success = function(resp, status, xhr) {
          util.hideLoading();
          success(resp, status, xhr);
        };
        options.error = function(resp, status, xhr) {
          util.hideLoading();
          error(resp, status, xhr);
        };
        Backbone.sync(method, model, options);
      }
    },

    fetch: function(options) {
      options = options || {};

      Backbone.Model.prototype.fetch.call(this, {
        success: options.success || this.success,
        error: options.error || this.error,
        timeout: options.timeout || this.timeout
      });
    },

    save: function(key, val, options) {
      var attrs;

      if (key === null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({
        success: this.success,
        error: this.error,
        timeout: this.timeout
      }, options);

      Backbone.Model.prototype.save.call(this, attrs, options);
    },

    configureJsonp: function(options) {
      options.dataType = 'jsonp';

      var jsonpCallback = _.result(this, 'jsonpCallback');
      if (jsonpCallback) {
        options.jsonpCallback = jsonpCallback;
      }
    },

    setErrorHandler: function(type) {
      if (_.indexOf(errorHandlerType, type) !== -1) {
        this.set('errorHandler', type);
      } else {
        throw new Error ('Invalid error handler type passed as parameter');
      }
    },

    setErrorContainer: function($container) {
      this.set('errorContainer', $container);
    },

    getErrorCode: function(status) {
      var errorCode;
      if (status === 404){
        errorCode = 'notFound';
      } else {
        errorCode = 'unexpectedError';
      }

      return errorCode;
    },

    /**
     * Default error handler for all Backbone Models
     * @param  {Object} model    Model which produced error
     * @param  {Object} response XHR response object
     *
     * Depending on how error handling behavior is defined (through setErrorHandler) will
     * pass the error to the errorView (default), display an overlay or a modal.
     *
     */
    error: function(model, response) {
      util.hideLoading();

      var errorHandler = model.get('errorHandler');
      switch (errorHandler) {
        case 'ignoreAll':
          return;
        case 'showOverlay':
          model.showErrorOverlay(model, response);
          break;
        // This handler will display errorModal template in the container that is passed,
        //usually replacing modal's html
        case 'showModal':
          var $container = model.get('errorContainer');
          var html = TEMPLATE.errorModal({ errorCode: model.getErrorCode(response.status) });
          $container.html(html);
          break;
        default:
          model.trigger('fetchError', response);
      }
    },

    showErrorOverlay: function(model, response) {
      var errorOverlay = new ErrorOverlay({ options: { errorCode: model.getErrorCode(response.status) }});
      errorOverlay.render();
    },

    /**
     * Default success handler after model has returned successfully
     */
    success: function(model, resp, options) {
      util.hideLoading();

      /**
       * If the api request detects a different build version for the env config, refresh the page.
       * The refresh needs to get a clean version of index.html from the server,
       * with the new env config properties.
       */
      if (options && options.xhr) {
        var headerBuild = options.xhr.getResponseHeader('Env-Config-Build');

        var changed = $localStorage.checkBuildVersion(headerBuild);

        if (headerBuild && changed) {
          window.location.reload(true);
        }
      }

      model.trigger('modelready');
    }

  });

});
