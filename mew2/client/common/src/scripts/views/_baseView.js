define([
  // Libraries
  'backbone',
  'config',
  'util/authentication',

  // Helpers
  'helpers/handlebarsHelpers',

  // Templates
  'compTemplates/appTemplates'
], function(Backbone, config, Authentication) {

  'use strict';

  var BaseView = Backbone.View.extend({

    initialize: function(data) {
      this._configure(data);
      this.subViews = {};
      this.init.apply(this, arguments);
      this.postInitialize();
    },

    // Performs the initial configuration of a View with a set of options.
    // Derived from Backbone 1.0.0 source code
    _configure: function(data) {
      var options = _.result(data, 'options') || {};
      if (this.options) {
        options = _.extend({}, _.result(this, 'options'), options);
      }
      this.options = options;
    },

    init: function() {},

    postInitialize: function() {
      if (this.model) {
        this.listenTo(this.model, 'fetchError', this.renderError);
      }
    },

    close: function() {
      this.stopListening();
      this.undelegateEvents();
      _.each(this.subViews, function(subView) {
        subView.close();

        // If the Sub View is a MainContentView, empty it, otherwise remove it
        if (subView.$el.attr('id') === 'mb-j-content-container') {
          subView.$el.empty();
        } else {
          subView.$el.remove();
        }
      });
    },

    render: function() {
      this.renderTemplate();
      this.postRender();
    },

    postRender: function() {},

    // Standard way for views to handle standard model error data response - 404, timeouts etc.
    renderError: function(error) {
      if (App.router && App.router.viewController) {
        App.router.viewController.route('error', {
          el: this.el,
          statusCode: error.status,
          relativeUrl: $.url().attr('relative')
        });
      }
    },

    elementInDOM: function() {
      return $.contains(document.documentElement, this.$el[0]);
    },

    /**
     * Retrieves a state element when showing modal microstates via event handlers
     * @param  {Object} e jQuery object or a pushstate event state Object
     * @return {jQuery Object} jQuery object of the state element
     */
    getStateElement: function(e) {
      if (!e.currentTarget.id) {
        throw new Error('State element must have an id so that it can be accessed via popstate.');
      }
      return $('#' + e.currentTarget.id);
    },

    /**
     * Retrieves the next modal level based on the history state
     * @param  {Object} historyState window.history.state
     * @return {Number}              Level for new modal
     */
    getNextModalLevel: function(historyState) {
      if (!historyState || !historyState.level) {
        return 1;
      } else {
        return historyState.level + 1;
      }
    },

    /**
     * Pushes a modal into the history state using the provided data
     * @param {String} modalShowFunction Function to be called when showing the modal via a popstate event
     * @param {String} eventElementId Id of the event element which allows retrieval of the event element during a popstate triggering
     * @param  {Object} modalShowData data needed to show modal without using eventElementId
     */
    pushModalState: function(modalShowFunction, eventElementId, modalShowData) {
      var state = {
        level: this.getNextModalLevel(window.history.state),
        modalShowFunction: modalShowFunction
      };

      if (eventElementId) {
        state.e = {
          currentTarget: {
            id: eventElementId
          }
        };
      }

      if (modalShowData) {
        state.modalShowData = modalShowData;
      }

      window.history.pushState(state, document.title, '');
    },

    // Gets currently shown modal of view
    getShownModal: function() {
      return _.find(this.subViews, { shown: true });
    },

    showSignIn: function(options) {
      var authentication = new Authentication();

      if (authentication.isSignedIn()) {
        if (options.force) {
          authentication.logout();
        } else {
          return false;
        }
      }

      authentication.authenticate(_.extend(options, {
        currentView: this
      }));

      return true;
    }
  });

  return BaseView;

});
