define([
  // Views
  'views/_facetBrandSearchModalView',
  'util/crossBrowserHeight',
  'analytics/analyticsData',
  'analytics/analyticsTrigger'
], function (FacetBrandSearchModalView, crossBrowserHeight, analyticsData, analytics) {
  'use strict';

  var BCOMFacetBrandSearchModalView = FacetBrandSearchModalView.extend({

    events: _.extend(_.clone(FacetBrandSearchModalView.prototype.events), {
      'click .mb-j-modalHeader-right': 'done',
      'click .mb-j-modalHeader-left' : 'goBack',
      'click .facet-button-clear': 'clearSearch'
    }),

    renderTemplate: function () {
      FacetBrandSearchModalView.prototype.renderTemplate.apply(this, arguments);

      var headerHeight = $(this.el).find('.mb-modal-header-title').height() + $(this.el).find('.brand-modal-header').height();
      this.$el.find('#facet-brand-search-modal-list-wrapper').css('height', crossBrowserHeight.height() - headerHeight);
    },

    goBack: function(){
      this.destruct();
      this.trigger('brandSearchGoBack');
    },

    done: function(){
      this.destruct();
      this.trigger('brandSearchDone');
    },

    updateBrands: function () {

      //get searched value
      this.model.set('currentValue', $('.brand-search').val());
      var search_string = !_.isEmpty($('.brand-search').val()) ? $('.brand-search').val().toLowerCase() : '';

      //avoid search being empty
      if (search_string === '') {
        $('.brand-search-clear').css('visibility', 'hidden');
        this.model.set('currentValues', _.map(this.model.get('facet').value, function(value) {

          //removing highlight tags
          value.displayname = value.name;
          return value;
        }));

      } else {
      //if user has actually typed something

        //display clear button
        $('.brand-search-clear').css('visibility', 'visible');
        this.model.set('currentValues', _.filter(this.model.get('facet').value, function (value) {

          var valueString = value.values.toLowerCase(),
              matchRegex = new RegExp(search_string, 'i');

          // if this designer is not a match to the search string, we don't add it to the filtered list (return false)
          if (!matchRegex.test(valueString)) {
            return false;
          }

          // if it's a match, we highlight the searched string on the designer's name
          value.displayname = value.name.replace(matchRegex, '<span class="match">$&</span>');
          return true;

        }, this));

        // Store the keyword searched in analytics context
        analyticsData.setCMDesignerFacetSearch(this.model.get('currentValue'));

        // Check if its first letter and trigger coremetrics conversion event tag
        if (search_string.length === 1) {
          this.doSearchBeginAnalytics();
        }
      }
      // Show empty table rows if no matched brands
      this.model.set('pageRows', (crossBrowserHeight.height() - $('.brand-modal-header').height()) / 38 - this.model.get('currentValues').length);
      this.subViews.facetBrandSearchModalListView.render();
    },

    deselectFacetValue: function (e) {
      FacetBrandSearchModalView.prototype.deselectFacetValue.apply(this, arguments);
      this.clearSearch();
    },

    selectFacetValue: function (e) {
      FacetBrandSearchModalView.prototype.selectFacetValue.apply(this, arguments);

      var keyword = analyticsData.getCMDesignerFacetSearch();
      if (!_.isUndefined(keyword)) {
        var facetValue = $(e.currentTarget).data('facet-value').toString();

        // Add the keyword user and the selected facet to the context
        analyticsData.setCMDesignerFacetKeywordMap(keyword, facetValue);

        this.doFacetSelectionAfterSearchAnalytics();
      }

      this.clearSearch();
    },

    doSearchBeginAnalytics: function() {
      analytics.triggerTag({
        tagType: 'conversionEventTag',
        eventId: analyticsData.getCMPageId(),
        eventType: 'conversion_initiate',
        categoryId: 'Designer Facet Search'
      });
    },

    doFacetSelectionAfterSearchAnalytics: function() {
      analytics.triggerTag({
        tagType: 'conversionEventTag',
        eventId: analyticsData.getCMPageId(),
        eventType: 'conversion_complete',
        categoryId: 'Designer Facet Search'
      });
    }

  });

  return BCOMFacetBrandSearchModalView;

});
