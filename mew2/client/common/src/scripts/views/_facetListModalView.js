define([
  // Models
  'models/_facetSelectionModalModel',
  'models/facetBopsModalModel',

  // Views
  'views/modalView',
  'views/facetSelectionModalView',
  'views/facetBopsModalView',

  //Coremetrics
  'analytics/analyticsTrigger'
], function(FacetSelectionModalModel, FacetBopsModalModel, ModalView, FacetSelectionModalView, FacetBopsModalView, analytics) {
  'use strict';

  var FacetListModalView = ModalView.extend({

    id: 'mb-facetListModal-container',

    className: ModalView.prototype.className + ' modal-level-1',

    events: _.extend(_.clone(ModalView.prototype.events), {
      'click .mb-j-modalHeader-right': 'applyFacets',
      'click .facet-list-item .select': 'clickFacetListItem',
      'click ul.remove-items li': 'removeFacetValue',
      'click #facet-list-button-clear': 'clearAll'
    }),

    init: function() {
      this.model.normalizeFacets();
      this.model.initSelectedFacetValues();
      this.render();

      this.listenTo(this.model, 'modelready', this.render);
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.facetListModal(this.model.attributes));
      this.toggleListModalButtons();
      this.$el.find('.truncated').dotdotdot();
    },

    applyFacets: function() {
      this.model.removeStaleFacetSelections();
      this.model.updateRequestParams();
      this.model.trigger('refineProducts', _.omit(this.model.get('requestParams'), this.model.get('nonFacetKeys')));
      window.history.back();
    },

    updateSelectionModalModel: function(subview, facet) {
      subview.model.set('facet', facet);

      var facetSessionValues = this.model.get('facetSessionValues');
      if (typeof facetSessionValues[facet.name] === 'undefined') {
        facetSessionValues[facet.name] = {
          selected: [],
          disabled: [],
          selectedRange: [],
          urlParams: []
        };
      }

      // Update the selection modal with the selected and disabled
      subview.model.set('selectedValues', facetSessionValues[facet.name].selected || []);
      subview.model.set('disabledValues', facetSessionValues[facet.name].disabled || []);
      subview.model.set('selectedRangeValues', facetSessionValues[facet.name].selectedRange || []);
      subview.model.set('urlParams', facetSessionValues[facet.name].urlParams || []);

      subview.updateExtraData(this.model);
    },

    clickFacetListItem: function(e, triggeredByPopstate) {
      var $stateElement = this.getStateElement(e);

      var facetName = $stateElement.closest('.facet-list-item').data('facet-name');
      var facet = _.find(this.model.get('facets'), function(facet) {
        return facet.name === facetName;
      });
      var subview = this.getSubView(facetName);

      this.updateSelectionModalModel(subview, facet);
      subview.render();
      if (!triggeredByPopstate) {
        this.pushModalState ('clickFacetListItem', e.currentTarget.id);
      }
      subview.show();

      if (facetName === 'COLOR_NORMAL' || facetName === 'SIZE_NORMAL') {
        analytics.triggerTag ({tagType: 'pageElementTag',
          elementId: facetName,
          elementCategory: 'Facet: Expand'});
      }
    },

    /**
     * Updates the selected facets after a user interacts with the seleciton modal
     * @param  {Object} facetData Object which contains selected and disabled facet values
     */
    updateFacets: function(facetData) {
      var facetSessionValues = this.model.get('facetSessionValues');

      if (!facetSessionValues[facetData.name]) {
        facetSessionValues[facetData.name] = {};
      }

      facetSessionValues[facetData.name].selected = facetData.values || [];
      facetSessionValues[facetData.name].disabled = facetData.disabledValues || [];
      facetSessionValues[facetData.name].selectedRange = facetData.rangeValues || [];
      facetSessionValues[facetData.name].urlParams = facetData.urlParams || [];

      this.model.set('facetSessionValues', facetSessionValues);

      /**
       * Why would we re-render the facet selection modal view here?
       * Selected class gets added by click callback. @see _facetSelectionModalView.
       *
       * This render() is causing a duplicate network request for bops facet, which
       * makes a call to WSSG (and google API) in it's postRender() function.
       *
       * Commenting out for now; will discuss with dev and remove
       *
       * @see _facetBopsModalView's postRender()
       */
      // var subview = this.getSubView(facetData.name);
      // subview.render();

      this.model.updateRequestParams();
      this.model.fetch();
    },

    getFacetSessionRangeValues: function() {
      var sessionRangeValues = [],
          rangeFrom,
          rangeTo;
      _.each(this.model.get('facetSessionValues'), function(sessionValues, facetName) {
        if (sessionValues.selectedRange && (sessionValues.selectedRange.length > 0)) {
          sessionRangeValues[encodeURIComponent(facetName)] = sessionValues.selectedRange.map(function(range) {

            // For custratings facet we need to force one decimal place
            if (facetName.toUpperCase() === 'CUSTRATINGS') {
              rangeFrom = _.isEmpty(range.from.toString()) ? '0.0' : ((range.from % 1) ? range.from : range.from.toFixed(1));
              rangeTo = _.isEmpty(range.to.toString()) ? '-1' : ((range.to % 1) ? range.to : range.to.toFixed(1));
            } else {
              rangeFrom = _.isEmpty(range.from.toString()) ? '0' : range.from;
              rangeTo = _.isEmpty(range.to.toString()) ? '-1' : range.to;
            }
            return '[' + rangeFrom + ' TO ' + rangeTo + ']';
          }).join(',');
        }
      });
      return sessionRangeValues;
    },

    getFacetUrlParameters: function() {
      var urlParams = {};

      _.each(this.model.get('facetSessionValues'), function(sessionValues, facetName) {
        _.each(sessionValues.urlParams, function(param) {
          urlParams[param.name] = param.value;
        });
      });

      return urlParams;
    },

    removeFacetValue: function(e) {
      var $facetValue = $(e.currentTarget);
      var $facetListItem = $facetValue.closest('.facet-list-item');

      var facetName = $facetListItem.data('facet-name');
      var facetSessionValues = this.model.get('facetSessionValues');
      var facet = facetSessionValues[facetName];

      var facetValue = $facetValue.data('facet-value').toString();

      // Clicked on item is disabled
      if ($facetValue.hasClass('facet-value-disabled')) {

        // This facet is only here for display
        var disabledValue = _.find(facet.disabled, function(value) {
          return facetValue === value;
        });

        facet.disabled = _.without(facet.disabled, disabledValue);
        this.render();

      // Clicked on item is currently selected
      } else {
        // We also need to delete facet range
        facet.selectedRange.splice(_.indexOf(facet.selected, facetValue), 1);

        // This facet will affect requestParams when removed
        facet.selected = _.without(facet.selected, facetValue);

        if (facet.selected.length === 0 &&
            facet.disabled &&
            facet.disabled.length === 0) {
          delete facetSessionValues[encodeURIComponent(facetName)];
        }
        this.model.updateRequestParams();

        this.model.fetch();
      }
    },

    // Clears all currently selected facets
    clearAll: function() {
      this.model.set('facetSessionValues', {});
      this.render();
      this.model.updateRequestParams();
      this.model.fetch();
      this.doClearAllAnalytics();
    },

    getSubView: function(facetName) {
      var subviewFactory = this.getSubViewFactory(facetName);

      if (!this.subViews[subviewFactory.viewName]) {
        var subView = subviewFactory.factory();
        this.listenTo(subView, 'done', this.updateFacets);

        this.subViews[subviewFactory.viewName] = subView;
      }

      return this.subViews[subviewFactory.viewName];
    },

    getSubViewFactory: function(facetName) {
      var context = this.model.get('context');

      var subviewFactory = {
        // Uncomment these lines when BOPS facet is implemented on MCOM
        // and remove the same method from BCOM specific view (overridden)

        'UPC_BOPS_PURCHASABLE': {
          viewName: 'facetBopsModalView',
          factory: function() {
            return new FacetBopsModalView({
              model: new FacetBopsModalModel({
                context: context
              })
            });
          }
        },
        '*': {
          viewName: 'facetSelectionModalView',
          factory: function() {
            return new FacetSelectionModalView({
              model: new FacetSelectionModalModel({
                context: context
              })
            });
          }
        }
      };

      return subviewFactory[facetName] ? subviewFactory[facetName] : subviewFactory['*'];
    },

    doClearAllAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Clear All',
        elementCategory: 'Facet: Clear'
      });
    },

    // Records initial state of facets when user enters modal
    startFacetSession: function() {
      this.model.set('previousAttributes',  _.cloneDeep(this.model.attributes));

      this.model.set ('errorContainer', this.$el);
      this.model.set ('errorHandler', 'showModal');
    },

    // Cancels the current selection by restoring the facets to the original state
    cancelFacetSelection: function() {
      this.model.set(this.model.get('previousAttributes'));
    },

    // Show CLEAR ALL button if atleast one facet is selected
    toggleListModalButtons: function() {
      var facetSelected = false;

      _.forEach(_.values(this.model.get('facetSessionValues')), function(facet) {
        if (facet.selected.length > 0) {
          facetSelected = true;
        }
      });

      if (facetSelected) {
        this.$el.addClass('facetSelected');
      } else if (this.$el.hasClass('facetSelected')){
        this.$el.removeClass('facetSelected');
      }
    }

  });

  Handlebars.registerHelper('displayRangeTo', function(range) {
    return range.to || range.torange;
  });

  Handlebars.registerHelper('displayRangeFrom', function(range) {
    return range.from || range.fromrange;
  });

  return FacetListModalView;
});
