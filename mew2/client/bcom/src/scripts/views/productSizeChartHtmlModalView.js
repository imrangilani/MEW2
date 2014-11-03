define([
  // Views
  'views/modalView',

  // Models
  'models/productSizeChartHtmlModel',
  'util/orientation',

  // Analytics
  'analytics/analyticsTrigger'

], function (ModalView, ProductSizeChartHtmlModel, orientation, analytics) {
  'use strict';

  var ProductSizeChartModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(ModalView.prototype.events, {
      'change .b-j-select-locale': 'toggleConversionTable',
      'click  .b-size-chart-measure-switcher input': 'toggleMeasurement',
      'click  #b-size-chart-modal [data-expandable="button"]': 'toggleExpandables'
    }),

    init: function() {
      this.model.set('errorHandler', 'showModal');
      this.model.set('errorContainer', this.$el);
      ModalView.prototype.init.call(this);
    },

    toggleExpandables: function(e) {
      var title = $(e.currentTarget).data('size-chart-category-title');
      var $container = $(e.currentTarget).parent();
      var view = this;

      // Animate the modal to the expandable if opening
      setTimeout(function() {
        if (!$container.hasClass('b-expandable-closed')) {
          $('html, body').animate({ scrollTop:  view.$el.scrollTop() + $container.position().top - 44 });
        }
      }, 500);

      this.closeExpandables(e);
      this.triggerToggleExpandableAnalytics(title);
    },

    closeExpandables: function(e) {
      var $clicked = $(e.currentTarget),
          $parent = $clicked.closest('.b-expandable');
      $('#b-size-chart-modal').find('.b-expandable').not($parent).not('.b-expandable-closed').find('[data-expandable="button"]').click();
    },

    show: function() {
      ModalView.prototype.show.apply(this, arguments);
      this.triggerShowAnalytics();
    },

    toggleMeasurement: function(e){
      var $clicked = $(e.currentTarget),
          display = $clicked.data('display'),
          $container = $clicked.closest('.b-size-chart-container'),
          $sizingTable = $container.find('.b-size-chart-sizing-table');

      $sizingTable.find('th[class^="b-measuresystem-"], td[class^="b-measuresystem-"]').hide();
      $sizingTable.find('.b-measuresystem-' + display).show();
      this.triggerToggleMeasurementAnalytics();
    },

    triggerShowAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: this.options.categoryId,
        categoryId: 'PDP_size_chart',
        attributes: { 3: this.options.product.id }
      });
    },

    triggerToggleMeasurementAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'convert_to_centimeters',
        elementCategory: 'PDP_size_chart',
        attributes: { 29: this.options.product.id }
      });
    },

    isIntimate: function() {
      return this.model.attributes.charts.layout === 'INTIMATES';
    },

    triggerToggleConversionTableAnalytics: function(country, chartTitle) {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'international_sizes-' + (this.isIntimate() ? chartTitle + '-' : '') + country,
        elementCategory: 'PDP_size_chart',
        attributes: { 29: this.options.product.id }
      });
    },

    triggerToggleExpandableAnalytics: function(title) {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'size_chart-' + title,
        elementCategory: 'PDP_size_chart',
        attributes: { 29: this.options.product.id }
      });
    },

    toggleConversionTable: function(e){
        var $select = $(e.currentTarget),
            $container = $select.closest('.b-size-chart-container'),
            $conversionTable = $container.find('.b-size-chart-conversion-table'),
            selected = $select.val(),
            view = this;

        if (selected !== 'NONE'){
            // We delay a little the animation to avoid select issues on chrome android
            setTimeout(function() {
                $conversionTable.find('th[class^="b-locale-"], td[class^="b-locale-"]').hide();
                $conversionTable.find('.b-locale-' + selected).show();
                $conversionTable.show();
                $('html, body').animate({ scrollTop:  view.$el.scrollTop() + $select.parent().position().top - 60 });
                view.triggerToggleConversionTableAnalytics(selected, $container.data('size-chart-title'));
            }, 100);
        } else {
            $conversionTable.hide();
        }
        return true;
    },

    renderTemplate: function () {
      var html = TEMPLATE.productSizeChartHtmlModal({charts: this.model.attributes.charts, product: this.options.product});
      this.$el.html(html);
    }

  });

  /*
   * Helper to display custom metric system for bcom,
   * @param (String) system System to be converted.
   * @return {String} Converted string.
   */
  Handlebars.registerHelper('displayBcomMeasurementSystem', function(system) {
    switch(system.toLowerCase()) {
      case 'english':
        return 'Inches';
      case 'metric':
        return 'Centimeters';
      default:
        return system;
    }
  });

  /*
   * Helper to wrap the unit in a new line.
   * @param {String} text Text to search for the unit.
   * @return {String} Text with the unit wrapped.
   */
  Handlebars.registerHelper('wrapMeasurementUnit', function(text) {
    return text.replace(/^(.+)\s((\(lbs\))|(\(lb\))|(\(kgs\))|(\(kg\))|(\(in\))|(\(cm\))|(\(mm\)))$/i, '$1<br/>$2');
  });

  return ProductSizeChartModalView;
});
