define([
  // Views
  'views/modalView',
  'views/facetBrandSearchModalView',
  //Coremetrics
  'analytics/analyticsTrigger',
  'util/crossBrowserHeight'
], function(ModalView, FacetBrandSearchModalView, analytics, crossBrowserHeight) {
  'use strict';

  var FacetSelectionModalView = ModalView.extend({

    id: 'mb-facetSelectionModal-container',

    className: ModalView.prototype.className + ' modal-level-2',

    events: _.extend(_.clone(ModalView.prototype.events), {
      'click ul:not(.facet-single) li.facet-value:not(.facet-value-selected,.facet-value-none,.facet-value-disabled)' : 'selectFacetValue',
      'click ul.facet-single li.facet-value:not(.facet-value-selected,.facet-value-disabled)': 'singleSelectFacetValue',
      'click li.facet-value-selected' : 'deselectFacetValue',
      'click .mb-j-modalHeader-left' : 'cancel',
      'click .mb-j-modalHeader-right' : 'done',
      'click #facet-selection-button-clear': 'clearAll',
      'click .mb-j-brand-search': 'showBrandSearchModal'
    }),

    updateExtraData: function(/* facetListModalModel */) {
      // abstract method, intentionally left blank
    },

    deselectFacetValue: function(e) {
      var $facetValue = $(e.currentTarget),
          facetRangeFrom = $facetValue.data('facet-range-from'),
          facetRangeTo = $facetValue.data('facet-range-to'),
          facetValue = $facetValue.data('facet-value').toString();

      if ($facetValue.hasClass('facet-value-disabled')) {
        this.model.set('disabledValues', _.without(this.model.get('disabledValues'), facetValue));
      } else {
        this.model.set('selectedValues', _.without(this.model.get('selectedValues'), facetValue));

        if (!_.isUndefined(facetRangeFrom) || !_.isUndefined(facetRangeTo)) {
          this.model.set('selectedRangeValues', _.reject(this.model.get('selectedRangeValues'),
            function(range) {
              return range.from == facetRangeFrom && range.to == facetRangeTo;
            }));
        }
      }

      $facetValue.removeClass('facet-value-selected');
      this.toggleSelectionModalButtons();
    },

    selectFacetValue: function(e) {
      var $facetValue = $(e.currentTarget),
          facetRangeFrom = $facetValue.data('facet-range-from'),
          facetRangeTo = $facetValue.data('facet-range-to'),
          facetValue = $facetValue.data('facet-value').toString();

      if (!_.isUndefined(facetRangeFrom) || !_.isUndefined(facetRangeTo)) {
        this.model.set('selectedRangeValues', this.model.get('selectedRangeValues').concat([{ from: facetRangeFrom, to: facetRangeTo }]));
      }
      this.model.set('selectedValues', this.model.get('selectedValues').concat([facetValue]));
      $facetValue.addClass('facet-value-selected');
      this.toggleSelectionModalButtons();
    },

    singleSelectFacetValue: function (e, close) {
      close = typeof(close) === 'boolean' ? close : true;

      $('li.facet-value').removeClass('facet-value-selected');
      this.model.set('selectedValues', []);
      this.model.set('selectedRangeValues', []);

      this.selectFacetValue(e);

      if (close) {
        this.done();
      }
    },

    clearAll: function() {
      this.model.set('selectedValues', []);
      this.model.set('selectedRangeValues', []);
      this.model.set('disabledValues', []);

      this.$el.find('.facet-selection-items .facet-value').each(function() {
        $(this).removeClass('facet-value-selected');
      });

      this.doClearAllAnalytics();
    },

    doClearAllAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: this.model.get('facet').name,
        elementCategory: 'Facet: Clear'
      });
    },

    cancel: function() {
      window.history.back();

      var facetName = this.model.get('facet').name;

      if (facetName === 'COLOR_NORMAL' || facetName === 'SIZE_NORMAL'){
        analytics.triggerTag({
          tagType: 'pageElementTag',
          elementId: facetName,
          elementCategory: 'Facet: Collapse'
        });
      }

    },

    done: function() {
      this.trigger('done', {
        name: this.model.get('facet').name,
        values: this.model.get('selectedValues'),
        rangeValues: this.model.get('selectedRangeValues'),
        disabledValues: this.model.get('disabledValues'),
        urlParams: this.model.get('urlParams')
      });

      window.history.back();
    },

    renderTemplate: function() {
      $(this.el).html(TEMPLATE.facetSelectionModal(this.model.attributes));
      this.toggleSelectionModalButtons();
      this.initialScroll = $(window).scrollTop();
    },

    show: function() {
      ModalView.prototype.show.apply(this, arguments);

      // For the brand facet modal, set the height of the list view so it will scroll
      if (this.model.get('facet').name === 'BRAND') {
        this.$('.facet-selection-items').height($(window).height() - this.$('.facet-selection-items').offset().top - 10);
      }
    },

    // Show CLEAR button if atleast one facet value is selected
    toggleSelectionModalButtons: function() {
      if (typeof this.model.get('selectedValues') !== 'undefined' && this.model.get('selectedValues').length >= 1) {
        this.$el.addClass('facetValueSelected');
      } else if (this.$el.hasClass('facetValueSelected')) {
        this.$el.removeClass('facetValueSelected');
      }
    },

    showBrandSearchModal: function() {

      // Assign this view's element to the newly created brand search modal
      this.undelegateEvents();
      this.subViews.facetBrandSearchModalView = new FacetBrandSearchModalView({
        el: this.el,
        model: new Backbone.Model({
          facet: this.model.get('facet'),
          currentValues: this.model.get('facet').value,
          selectedValues: this.model.get('selectedValues') || []
        })
      });

      // Render the brand search modal in this element, then focus on the input field
      this.subViews.facetBrandSearchModalView.render();
      $('.brand-search').focus();

      // Upon the selection or de-selection of a brand, update the selected values
      this.listenToOnce(this.subViews.facetBrandSearchModalView, 'searchComplete', function(facetValue, selected) {
        if (selected === true) {
          this.model.set('selectedValues', this.model.get('selectedValues').concat([facetValue]));
        } else if (selected === false) {
          this.model.set('selectedValues', _.without(this.model.get('selectedValues'), facetValue));
        }

        // Re-assign this view its element which was used in the brand search modal
        this.subViews.facetBrandSearchModalView.undelegateEvents();
        this.delegateEvents();
        this.render();

        var $brandList = this.$('.facet-selection-items');

        // Re-set the height of the <ul> for scrolling
        if (!_.isEmpty($brandList)) {
          $brandList.height($(window).height() - $brandList.offset().top - 10);

          // Jump down to make the list item visible that was just changed
          var listItemOffset = parseInt($(this.$('.facet-value')[_.findIndex(this.model.get('facet').value, { name: facetValue })]).offset().top);
          $brandList.scrollTop(listItemOffset - $brandList.offset().top);
        }
      });
    }

  });

  /*
   * Helper to check if the facet is a Custratings facet with display option
   * @param (String) facetName Facet name.
   * @param {Object} facetValeu Facet value.
   */
  Handlebars.registerHelper('ifIsCustratingDisplayFacet', function(facetName, facetValue, options) {
    if (facetName == 'CUSTRATINGS' && facetValue.display) {
      return options.fn(this);
    }
    return options.inverse(this);
  });


  return FacetSelectionModalView;
});
