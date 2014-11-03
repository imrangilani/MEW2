define([
  // Views
  'views/_facetBopsModalView',

  // Util
  'util/localstorage',

  'analytics/analyticsTrigger'
], function(FacetBopsModalView, localStorage, analytics) {
  'use strict';

  // Update the zipcode only if it's available on the first call
  var updateDeepLinkZipCode = _.once(function(zipCode) {
    this.setZipCodeCookie(zipCode);
  });

  var BCOMFacetBopsModalView = FacetBopsModalView.extend({

    events: _.extend(FacetBopsModalView.prototype.events, {
      'input #mb-bops-address': 'addressChange'
    }),

    init: function() {
      FacetBopsModalView.prototype.init.apply(this, arguments);

      // Indicates if user started a search manually
      this.userStartedSearch = false;
    },

    updateExtraData: function(facetListModalModel) {
      FacetBopsModalView.prototype.updateExtraData.apply(this, arguments);

      var zipCode = _.pick(facetListModalModel.get('requestParams'), ['zip']).zip;
      updateDeepLinkZipCode.call(this, zipCode);
    },

    postRender: function() {
      FacetBopsModalView.prototype.postRender.apply(this, arguments);
      this.userStartedSearch = false;
    },

    search: function(requestParams, searchDetails) {
      var radius = this.$el.find('#mb-bops-distance').val();

      FacetBopsModalView.prototype.search.apply(this, arguments);

      // Update the Search Details section
      this.$el.find('#b-bops-search-details-text').html('Stores within ' + radius + ' miles of ' + searchDetails);

    },

    updateStoreList: function() {
      var facetValues = this.getFacetsValues();

      FacetBopsModalView.prototype.updateStoreList.apply(this, arguments);

      if (facetValues.length > 0) {
        this.$el.find('#b-bops-search').addClass('b-bops-details-active');
      }

      if (this.userStartedSearch && this.getFacetsValues().length > 0) {
        // Trigger bops facer search conversion tag
        this.triggerSearchSuccessAnalytics();
      }
    },

    addressChange: function() {
      var address = !_.isEmpty(this.$el.find('#mb-bops-address').val()) ? this.$el.find('#mb-bops-address').val().toLowerCase() : '';
      if (address.length === 1) {
        this.userStartedSearch = true;
        this.triggerSearchStartAnalytics();
      }
    },

    changeSearch: function() {
      FacetBopsModalView.prototype.changeSearch.apply(this, arguments);
      this.$el.find('#b-bops-search').removeClass('b-bops-details-active');
      this.triggerSearchChangeAnalytics();
    },

    clearAll: function() {
      var facetName = this.model.get('facet').name,
          facetStoreName = this.$el.find('.facet-value.facet-value-selected').data('facet-bops-store-name');

      FacetBopsModalView.prototype.clearAll.apply(this, arguments);

      // We trigger the element tag only if we had a selected value
      if (facetStoreName) {
        this.triggerClearAnalytics(facetName, facetStoreName);
      }
    },

    getUserLocation: function() {
      FacetBopsModalView.prototype.getUserLocation.apply(this, arguments);
      this.clearErrors();
    },

    searchByAddress: function() {
      FacetBopsModalView.prototype.searchByAddress.apply(this, arguments);
      this.clearErrors();
    },

    singleSelectFacetValue: function(e) {
      var facetName = this.model.get('facet').name,
          facetStoreName = $(e.currentTarget).data('facet-bops-store-name').toString();

      FacetBopsModalView.prototype.singleSelectFacetValue.call(this, e, false);
      this.triggerSingleSelectAnalytics(facetName, facetStoreName);
    },

    triggerClearAnalytics: function(facetName, facetStoreName) {
      var category = this.model.get('category'),
          categoryId = category ? category.id : 'undefined';

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: categoryId + ' - ' + facetName + ' - ' + facetStoreName,
        elementCategory: 'Clear Facet Selections'
      });
    },

    triggerSearchChangeAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'facet_change_location',
        elementCategory: 'bops'
      });
    },

    triggerSearchStartAnalytics: function() {
      var pageName = this.model.get('category') ? 'browse': 'search';

      analytics.triggerTag({
        tagType: 'conversionEventTag',
        eventId: pageName + ' manual facet input',
        eventType: 'conversion_initiate',
        categoryId: 'bops'
      });
    },

    triggerSearchSuccessAnalytics: function() {
      var pageName = this.model.get('category') ? 'browse': 'search';

      analytics.triggerTag({
        tagType: 'conversionEventTag',
        eventId:  pageName + ' manual facet input',
        eventType: 'conversion_complete',
        categoryId: 'bops'
      });
    },

    triggerSingleSelectAnalytics: function(facetName, facetStoreName) {
      var category = this.model.get('category'),
          categoryId = category ? category.id : 'undefined';

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: categoryId + ' - ' + facetName + ' - ' + facetStoreName,
        elementCategory: 'Facet selection/deselection'
      });
    }

  });

  return BCOMFacetBopsModalView;

});
