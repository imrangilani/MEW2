define([
  'util/util',
  'util/dataMap',
  'util/BTDataDictionary',
  'util/stickyHeader',

  'models/brandIndexModel',

  'views/mainContentView',
  'views/brandIndexSearchView'
], function(util, DataMap, BTDataDictionary, stickyHeader, BrandIndexModel, MainContentView, BrandIndexSearchView) {
  'use strict';

  var brandIndexView = MainContentView.extend({
    events: {
      'click .box-search': 'showSearch',
      'focus .box-search': 'showSearch'
    },

    init: function() {
      this.threshold = util.hasPositionSticky() ? 0 : 1000;
      this.dataMap = new DataMap({
        id: 'id'
      });

      this.model = new BrandIndexModel({
        requestParams: this.dataMap.toWssg(this.options)
      });

      if (App.model.has('categoryIndex')) {
        this.model.fetch();
      } else {
        this.listenTo(Backbone, 'categoryIndexLoaded', function() {
          this.model.fetch();
        });
      }

      this.listenTo(this.model, 'sync', this.render);
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.brandIndex(this.model.toJSON()));
      stickyHeader.register(this.$el.find('.brand-modal-header'));
    },

    defineBTDataDictionary: function() {
      var categoryName = this.model.get('categoryName');
      var categoryId = this.model.get('requestParams').id;

      BTDataDictionary.setNavigation('', categoryId, '');
      BTDataDictionary.setCategory(categoryId, categoryName);
    },

    cancel: function() {
      $(document.body).removeClass('m-toggle-state--brandindex');
      this.subViews.brandIndexSearchView.undelegateEvents();
      this.delegateEvents();
      this.render();
    },

    showSearch: function() {
      this.undelegateEvents();
      this.subViews.brandIndexSearchView = new BrandIndexSearchView({
        el: this.el,
        model: this.model
      });
      this.subViews.brandIndexSearchView.render();
      $('.box-search').focus();

      $(document.body).addClass('m-toggle-state--brandindex');
      setTimeout(function() {
        $(window).scrollTop(0);
      }, 0);

      window.onpopstate = function() {
        $(document.body).removeClass('m-toggle-state--brandindex');
        setTimeout(function() {
          $(window).scrollTop(0);
        }, 0);
      };

      this.listenToOnce(this.subViews.brandIndexSearchView, 'searchComplete', this.cancel);
    },

    close: function() {
      stickyHeader.unregister();
      MainContentView.prototype.close.apply(this, arguments);
    }
  });

  return brandIndexView;
});
