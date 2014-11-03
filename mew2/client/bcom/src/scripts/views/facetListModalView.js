define([
  'models/facetBopsModalModel',
  'views/_facetListModalView',
  'views/facetBopsModalView',
  'analytics/analyticsTrigger',
  'util/crossBrowserHeight'
], function(FacetBopsModalModel, FacetListModalView, FacetBopsModalView, analytics, crossBrowserHeight) {
  'use strict';

  var BCOMFacetListModalView = FacetListModalView.extend({

    renderTemplate: function() {
      FacetListModalView.prototype.renderTemplate.apply(this, arguments);
      this.setHeights();
    },

    setHeights: function() {
      FacetListModalView.prototype.setHeights.apply(this, arguments);

      this.$el.height(crossBrowserHeight.height());
      this.$el.find('.mb-modal-content').css('height', crossBrowserHeight.height());
    },

    getAnalyticsFacetsContext: function() {
      var context = {},
          facetValues = this.model.get('facetSessionValues'),
          priceFacetInformation = this.model.getFacetByName('PRICE'),
          view = this;

      _.each(facetValues, function(sessionValues, facetType) {
        _.each(sessionValues.selected, function(facetValue) {
          if (!_.isEmpty(facetValue)) {
            var facetCaption,
                priceValueInformation,
                catchAll = false,
                token,
                attr;

            switch (facetType) {
              case 'SIZE_NORMAL':
                facetCaption = 'Size: ';
                attr = '6';
                break;
              case 'COLOR_NORMAL':
                facetCaption = 'Color: ';
                attr = '7';
                break;
              case 'BRAND':
                facetCaption = 'Brand: ';
                attr = '8';
                break;
              case 'PRICE':
                facetCaption = 'Price: ';
                if (priceFacetInformation) {
                  priceValueInformation = _.findWhere(priceFacetInformation.value, { name: facetValue });
                  if (priceValueInformation) {
                    facetValue = (priceValueInformation.range.from || priceValueInformation.range.fromrange  || '0') + ' ' +
                                 (priceValueInformation.range.to || priceValueInformation.range.torange || '-1');
                  }
                }
                attr = '9';
                catchAll = true;
                break;
              default:
                facetCaption = view.getPrettyFacetCaption(facetType) + ': ';
                attr = '9';
                catchAll = true;
                break;
            }
            // If it's only one facet value for the type, put only the value (no "Brand:" or "Size:" etc.)
            token = sessionValues.selected.length > 1 || catchAll ? (facetCaption + facetValue) : facetValue;
            context[attr] = context[attr] ? context[attr] + ' | ' + token : token;
          }
        });
      });
      return context;
    },

    getPrettyFacetCaption: function(facetCaption) {
      return facetCaption.replace(/_/g, ' ').replace(/(\w)(\w+)\b/g, function(match, p1, p2) {
        return p1 && p2 ? p1.toUpperCase() + p2.toLowerCase() : match;
      });
    },

    doClearAllAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Clear All',
        elementCategory: 'Sort By'});
    }

  });

  return BCOMFacetListModalView;

});
