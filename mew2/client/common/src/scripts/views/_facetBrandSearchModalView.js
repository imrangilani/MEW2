define([
  // Views
  'views/modalView',
  'views/facetBrandSearchModalListView',
  'util/crossBrowserHeight'
], function (ModalView, FacetBrandSearchModalListView, crossBrowserHeight) {
  'use strict';

  var FacetBrandSearchModalView = ModalView.extend({

    id: 'mb-facetBrandSearchModal-container',

    className: ModalView.prototype.className + ' no-transition modal-level-3',

    events: {
      'input .brand-search': 'updateBrands',
      'submit .brand-search': 'preventDefaultAction',
      'submit .brand-search-form': 'submitForm',
      'click .mb-j-modalHeader-right': 'destruct',
      'click li.facet-value-selected': 'deselectFacetValue',
      'click li.facet-value:not(.facet-value-selected,.facet-value-empty)': 'selectFacetValue',
      'touchstart li.facet-value': 'blurSearch',
      'touchstart .brand-search-clear': 'clearSearch',
      'click .brand-search-clear': 'clearSearch',
      'click #m-j-return-to-filter': 'returnToFilter'
    },

    renderTemplate: function () {
      $(this.el).html(TEMPLATE.facetBrandSearchModal(this.model.attributes));
      this.subViews.facetBrandSearchModalListView = new FacetBrandSearchModalListView({
        el: '#facet-brand-search-modal-list',
        model: this.model
      });

      this.subViews.facetBrandSearchModalListView.render();
    },

    updateBrands: function () {
      this.model.set('currentValue', $('.brand-search').val());
      if (this.model.get('currentValue') === '') {
        $('.brand-search-clear').css('visibility', 'hidden');
        this.model.set('currentValues', this.model.get('facet').value);
      } else {
        $('.brand-search-clear').css('visibility', 'visible');
        this.model.set('currentValues', _.filter(this.model.get('facet').value, function (value) {
          return value.values.toLowerCase().indexOf(this.model.get('currentValue').toLowerCase()) === 0;
        }, this));
      }
      // Show empty table rows if no matched brands
      this.model.set('pageRows', (crossBrowserHeight.height() - $('.brand-modal-header').height()) / 38 - this.model.get('currentValues').length);
      this.subViews.facetBrandSearchModalListView.render();
    },

    preventDefaultAction: function (event) {
      $(event).preventDefault();
    },

    submitForm: function() {
      $('.brand-search').blur();
      return false;
    },

    destruct: function () {
      this.trigger('searchComplete', false);
    },

    deselectFacetValue: function (e) {
      var $facetValue = $(e.currentTarget);
      var facetValue = $facetValue.data('facet-value').toString();
      this.trigger('searchComplete', facetValue, false);
    },

    blurSearch: function () {
      $('.brand-search').blur();
    },

    selectFacetValue: function (e) {
      var $facetValue = $(e.currentTarget);
      var facetValue = $facetValue.data('facet-value').toString();
      this.trigger('searchComplete', facetValue, true);
    },

    clearSearch: function () {
      $('.brand-search').blur();
      $('.brand-search').focus();
      $('.brand-search').val('');

      this.updateBrands();
    }

  });

  return FacetBrandSearchModalView;

});
