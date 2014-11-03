define([
  // Utils
  'util/util',
  'util/multiValueCookie',

  // Models
  'models/facetListModalModel',

  // Views
  'views/mainContentView',
  'views/facetListModalView',

  'url-parser'
], function(util, mvCookie, FacetListModalModel, MainContentView, FacetListModalView) {
  'use strict';

  var BrowseView = MainContentView.extend({
    /**
     * For performance reasons, the model may or may not initially contain everything necessary for the view.
     * If the category index request completes before reaching this point of code execution, this view
     * is initialized with whatever data exists for that category in the global appModel.
     *
     * If data other than what exists in appModel is necessary, listen for this view model's 'allDataAvailable' event.
     */
    init: function(data) {
      // If the user refreshes in a modal state, return them to the
      // Browse View
      this.listenTo(this.model, 'allDataAvailable', function() {
        this.initializePagination(data);
        this.prepareBreadcrumbValues();
        if (!this.subViews.facetListModalView) {
          this.subViews.facetListModalView = new FacetListModalView({
            model: new FacetListModalModel({
              facets: this.model.get('facets'),
              requestParams: _.clone(_.omit(this.model.get('requestParams'), ['resultsperpage', 'show', 'sortby', 'sortorder', 'currentpage']))
            })
          });
        }
        this.listenTo(this.subViews.facetListModalView.model, 'refineProducts', this.refineProducts);
      });

      // When the model data is available, initialize the pager, FacetModalView, and render.
      this.listenTo(this.model, 'modelready', function() {
        if (!this.subViews.facetListModalView) {
          this.subViews.facetListModalView = new FacetListModalView({
            model: new FacetListModalModel({
              context: 'browse',
              facets: this.model.get('facets'),
              requestParams: _.clone(_.omit(this.model.get('requestParams'), ['resultsperpage', 'show', 'sortby', 'sortorder', 'currentpage']))
            })
          });
        }
        this.initializePagination(this.model.attributes);
        this.renderDataDependent();
      });

      // Render immediately; the brand-specific renderTemplate functions and hbs templates should be responsible for rendering the data based on availability
      this.render();
    },

    renderTemplate: function() {},

    updateBopsFacetStore: function() {
      var storeNumber = util.storage.retrieve('bops_location_number');

      if (storeNumber) {
        mvCookie.set('BOPSPICKUPSTORE', storeNumber, 'MISCGCs', 30);
      }
    },

    // Event handler triggered when a popstate event occurs
    popstate: function(event) {
      MainContentView.prototype.popstate.apply(this, arguments);
      if (!event.state || !event.state.level) {
        this.trigger('wentBack');
        if (!this.applyingFacets) {
          this.subViews.facetListModalView.cancelFacetSelection();
        }
        this.applyingFacets = false;
      }
    },

    refineProducts: function(facetModalRequestParams) {
      var facetSessionRangeValues = this.subViews.facetListModalView.getFacetSessionRangeValues();

      this.model.setFacetRequestParams(facetModalRequestParams);
      this.model.fetch();
      this.applyingFacets = true;

      // Push new browse url once the modal state has been returned from
      this.listenToOnce(this, 'wentBack', function() {
        App.router.navigate(null, { attributes: this.options.dataMap.fromWssg(_.extend(_.omit(this.model.get('requestParams'), 'show'), facetSessionRangeValues)) });
      });

      this.removeFixedNavigation();

      // After modal is closed, scroll to top
      setTimeout(_.bind(function() {
        this.scrollToTop();
      }, this), 1000);
    },

    removeFixedNavigation: function() {},

    //Prepares url to be used as href for pagination link for fghfhg a particular pageNumber
    preparePageUrl: function(pageNumber) {
      var requestParams = _.extend(_.clone(this.model.get('requestParams')), {
        currentpage: pageNumber
      });

      return App.router.buildUrl(this.options.dataMap.fromWssg(_.omit(requestParams, 'show')));
    }
  });

  return BrowseView;
});
