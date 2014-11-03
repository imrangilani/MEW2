require([
  'util/orientation',
  'models/appModel',
  'router/_core/router',
  'config',
  'fastclick',

  // Global listeners
  'views/globalEventsView',
  'util/util',
  'util/localstorage',
  'util/transitions',
  'util/heightEqualizer',
  'analytics/analyticsListener',
  'url-parser'
], function(orientation, AppModel, AppRouter, config, FastClick, GlobalEventsView, util, $localStorage, Transitions) {
  /*jshint nonew:false*/
  'use strict';

  // Globally namespaced objects, please keep to absolute minimum
  window.App = {};
  App.config = config;

  // Add reference to ENV_CONFIG from .env file - all variables that start with "CONFIG_"
  App.config.ENV_CONFIG = {};
  if (window.ENV_CONFIG) {
    App.config.ENV_CONFIG = window.ENV_CONFIG;
  }

  $localStorage.checkBuildVersion();

  App.model = new AppModel();
  new AppRouter();
  App.transitions = new Transitions();

  // Recover from a refresh inside of a modal microstate
  if (window.history.state && window.history.state.level) {
    window.history.go(-window.history.state.level);
  }

  $(function() {
    // Remove 300ms click delay
    FastClick.attach(document.body);
    var $body = $('body');

    // When the document is ready, set the body class to indicate the device orientation
    $body.addClass('layout-' + orientation.getOrientation());

    // when the orientation changes, set the body class to indicate the new orientation
    orientation.on('orientationchange', function() {
      $body.addClass('layout-' + this.getOrientation());
    });

    new GlobalEventsView();

  });

  if (App.config.BrightTag.siteId){
    require(['//s.btstatic.com/tag.js#site=' + App.config.BrightTag.siteId]);
  }

  var started = Backbone.history.start({
    pushState: true,
    urlRoot: '/'
  });
});
