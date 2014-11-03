define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  // Currently only supports one spinner at a time
  var spinner = {};

  // configure the delay a request should wait before displaying a spinner (in milliseconds)
  spinner.delay = 1000;

  /**
   * Display a spinner on a particular $obj after spinner.delay seconds
   *
   * @param $obj a jQuery object that will adopt the spinner classes
   * @param color defines what color of spinner ot use. Possible values white, black
   * @param size defines what size of spinner to use. Possible values 30, 60
   */
  spinner.add = function($obj, color, size) {
    var extraClass = color + '-' + size;
    this.spinnerTimer = setTimeout(function() {
      $obj.addClass('spinner ' + extraClass);
    }, spinner.delay);
  };

  /**
   * Hide any spinners on a particular $obj and kill the internal spinnerTimer
   *
   * @param $obj a jQuery object that has adopted the spinner classes
   */
  spinner.remove = function($obj) {
    if (this.spinnerTimer) {
      clearTimeout(this.spinnerTimer);
      delete this.spinnerTimer;
    }

    $obj.removeClass('spinner white-30 white-60 black-30 black-60');
  };

  /**************************************** spinner.Model ****************************************/

  /**
   * Backbone models can extend this object if thier corresponding MainContentView
   * needs to display a spinner during the main request.
   *
   * assumes $container is defined within the model that extends this one
   */
  spinner.Model = {
    // Create a single spinner object that will be displayed during requests and detached once completed
    $spinner: $('<div id="mb-j-spinner"></div>')
  };

  spinner.Model.getContainer = function() {
    if (!this.container) {
      throw new Error('Expects `container` to be set for the model');
    }

    var $container = $(this.container);

    return $container;
  };

  /**
   * Determine the height of the content area below the header/search.
   * Only do this once, then store the calculated height in memory
   */
  spinner.Model._getContentHeight = function() {
    // Check if the calculation has already happened, else determine content height
    if (!spinner.Model._contentHeight) {
      var headerHeight = $('#mb-region-header').height();
      var searchHeight = $('#mb-j-search-container').height();
      spinner.Model._contentHeight = $(window).height() - (headerHeight + searchHeight);
    }

    return spinner.Model._contentHeight;
  };

  /**
   * Remove any displaying spinner, and re-show the content
   */
  spinner.Model._remove = function() {
    var $container = _.bind(spinner.Model.getContainer, this)();

    // Remove the spinner classes from the spinner wrapper
    spinner.remove(spinner.Model.$spinner);

    // Remove the spinner wrapper
    spinner.Model.$spinner.detach();

    // Show the content container
    $container.show();
  };

  // Override Backbone fetch()
  spinner.Model.fetch = function() {
    var $container = _.bind(spinner.Model.getContainer, this)();

    var contentHeight = spinner.Model._getContentHeight();

    // Set the height of the spinner container to the height of the content area below the header/search.
    // Position the spinner in the center of that content.
    spinner.Model.$spinner.height(contentHeight).css({ 'backgroundPosition' : (contentHeight / 2) + ' center' });

    // Hide the content container, and show the spinner container
    $container.hide().after(spinner.Model.$spinner);

    // Add the spinner classes to the spinner container, after spinner.delay seconds
    spinner.add(spinner.Model.$spinner, 'white', 60);

    // Call the BaseModel's fetch()
    BaseModel.prototype.fetch.apply(this, arguments);
  };

  // Override Backbone success()
  spinner.Model.success = function(model) {
    _.bind(spinner.Model._remove, model)();
    BaseModel.prototype.success.apply(this, arguments);
  };

  // Override Backbone error()
  spinner.Model.error = function(model) {
    _.bind(spinner.Model._remove, model)();
    BaseModel.prototype.error.apply(this, arguments);
  };

  return spinner;
});
