/**
 * @file transitions.js
 *
 * Listen for router changes, and animate accordingly.
 */

define([
  'backbone',
  'underscore'
], function(Backbone, _) {

  var nextRouteTransition;
  var nextRouteTransitionReverse;

  var transitionHistory = [];

  var Transitions = function() {
    this.initialize();
  };

  _.extend(Transitions.prototype, Backbone.Events, {
    initialize: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      this.listenTo(App.router, 'routeHistory:add', this.next);
      this.listenTo(App.router, 'routeHistory:remove', this.prev);
    },

    /**
     * Sets the transition for the next view. After executed, the transition is cleaned.
     * @param {Transition} transition that will be executed.
     * @param {boolean} reverse Boolean indicating if transition should be reverse.
     */
    set: function(transition, reverse) {
      nextRouteTransition = transition;
      nextRouteTransitionReverse = reverse;
    },

    next: function() {
      transitionHistory.push(transition());
    },

    prev: function(previousRoute, isPopstate) {
      var previousTransition = transitionHistory.pop();

      if (isPopstate && previousTransition) {
        previousTransition.reverse();
      }
    }
  });

  /**
   * Handle route transitions
   *
   * @return a reference to the active transition
   */
  var transition = function() {
    var transition = nextRouteTransition;

    // Regular route call
    if (transition) {
      if (nextRouteTransitionReverse) {
        transition.reverse();
      } else {
        transition.start();
      }
    }

    // Clean the transition for the next route
    nextRouteTransition = null;
    nextRouteTransitionReverse = false;

    return transition;
  };

  return Transitions;
});
