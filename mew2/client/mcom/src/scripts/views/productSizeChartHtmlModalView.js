define([
  // Views
  'views/modalView',
    // Models
  'models/productSizeChartHtmlModel',
  'util/orientation'
], function (ModalView, ProductSizeChartHtmlModel, orientation) {
  'use strict';

  var ProductSizeChartModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(ModalView.prototype.events, {
      'change .m-select-locale': 'updateCountryColumn',
      'click .m-measure-system a': 'toggleMeasurement',
      'click .m-section-category': 'toggleSectionCollapse'

    }),
    init: function() {
      this.model = new ProductSizeChartHtmlModel({requestParams: this.options});
      this.listenTo(this.model, 'modelready', this.reviewResponse);
      this.model.set('errorHandler', 'showModal');
      this.model.set('errorContainer', this.$el);
      this.model.fetch();

      this.listenTo(orientation, 'orientationchange', function() {
        _.each ($('.m-chart-container'), function(scrollable) {
          var $content = $(scrollable).find('table');
          if ($content.width() > $(window).width()){
            $(scrollable).css('-webkit-overflow-scrolling', 'auto');
            window.setTimeout(function() {
              $(scrollable).css('-webkit-overflow-scrolling', 'touch');
            }, 50);
          }
        });
      });


      ModalView.prototype.init.call(this);
    },
    reviewResponse: function(){
      if (this.model.attributes.charts){
        var charts = this.model.attributes.charts;
        if (charts.categories && charts.categories.length && charts.categories[0].chart){
          this.options.parentView.showHtmlSizeChart();
        } else if(this.options.product.sizeCharts){
          this.options.parentView.showImageSizeChart(this.options.product);
        } else {
          this.options.parentView.showHtmlSizeChart();
        }
      }
    },
    updateCountryColumn: function(e){
      var $select = $(e.currentTarget);
      var selected = $select.val();
      var display = $select.find('option[value=' + selected + ']').text();
      $select.closest('.m-select-wrapper').find('div.display').text(display);


      var table = $select.closest('.m-chart-container').find('table');
      table.find( 'th[class^="m-locale-"]').addClass('m-invisible');
      table.find( 'td[class^="m-locale-"]').addClass('m-invisible');
      if( selected !== 'US'){
        table.find('.m-locale-' + selected).removeClass('m-invisible');
      }

      if( selected !== 'NONE'){
        $select.closest('.m-chart-section').find('a[data-display="Metric"]').click();
      }
    },
    toggleMeasurement: function(e){
      var $clicked = $(e.currentTarget);
      $clicked.closest('.m-measure-system').find('.selected').removeClass('selected');
      $clicked.addClass('selected');

      var display = $clicked.data('display');
      var table = $clicked.closest('.m-chart-container').find('table');
      table.find( 'th[class^="m-measuresystem-"]').addClass('m-invisible');
      table.find( 'td[class^="m-measuresystem-"]').addClass('m-invisible');
      table.find( '.m-measuresystem-' + display).removeClass('m-invisible');

      e.preventDefault();
      e.stopPropagation();
    },
    toggleSectionCollapse: function(e){
      var $clicked = $(e.currentTarget);
      $clicked.closest('.m-chart-section').find('.m-chart-container').toggleClass('m-collapsed');
      var indicator = $clicked.find('.m-expand-sign');
      indicator.toggleClass('m-expanded');
    },
    preprocessResponse: function(charts){
      if( charts ){
        var categories = charts.categories;
        _.each( categories, function(category){
          if( category.chart){

            //Figure default system
            if(category.systems && category.systems.length === 1){
              category.defaultSystem = category.systems[0].system;
            } else {
              category.defaultSystem = 'English';
            }

                        //calculateInitialColumnNumber
            var header = category.chart.header;
            var sizeColumns = _.filter( header.sizes, {locale:'NONE'});
            var measureColumns = _.filter( header.measurements, {system: category.defaultSystem});
            header.columnsTotal = sizeColumns.length + measureColumns.length;
          }
        });
      }

    },
    renderTemplate: function () {

      this.preprocessResponse(this.model.attributes.charts);


      var html = TEMPLATE.productSizeChartHtmlModal({charts: this.model.attributes.charts, product: this.options.product});
      this.$el.html(html);
    },

    postRender: function () {
      if (!App.model.get('categoryIndex')) {
        this.listenTo(Backbone, 'categoryIndexLoaded', this.renderCategoryName);
      }
      else {
        this.renderCategoryName();
      }

      if( this.model.get('charts').categories && this.model.get('charts').categories.length > 1){
        var $firstTab = $(this.$el.find('.m-chart-section')[0]);
        $firstTab.find('.m-chart-container').toggleClass('m-collapsed');
        $firstTab.find('.m-expand-sign').toggleClass('m-expanded');
      }
    },

    renderCategoryName: function () {
      if (this.options.categoryId) {
        var menus = App.model.get('categoryIndex').menus;
        this.$el.find('.m-size-chart-category').html(menus[this.options.categoryId].name);
      }
    }
  });

  return ProductSizeChartModalView;
});
