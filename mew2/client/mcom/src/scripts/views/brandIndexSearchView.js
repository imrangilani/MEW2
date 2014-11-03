define([
  'util/util',
  'views/modalView',
  'views/brandIndexSearchResultsView'
], function(util, ModalView, BrandIndexSearchResultsView) {
  'use strict';
  var BrandIndexSearchView = ModalView.extend({
    events: {
      'input .box-search': 'updateBrands',
      'click #brand-modal-button-right': 'cancel',
      'click .facet-value': 'cancel',
      'touchstart .brand-search-clear': 'clearSearch',
      'click .brand-search-clear': 'clearSearch',
      'submit .brand-search-form': 'preventDefault',
      // TODO(ciro): DRY sticky navigation
      'touchstart': 'touchstartHandler',
      'touchmove': 'handleTouch'
    },

    init: function() {
      this.threshold = util.hasPositionSticky() ? 0 : 1000;
    },

    getPointerEvent: function(event) {
      return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
    },


    removeFixedNavigation: function() {
      var $header = $('.brand-modal-header');
      if (util.hasPositionSticky()) {
        $header.removeClass('m-sticky-nav');
      } else {
        $header.removeClass('m-sticky-nav-shim');
      }
    },

    touchstartHandler: _.throttle(function(e) {
      this.cachedY = this.getPointerEvent(e).pageY;
    }, 300),

    handleTouch: _.throttle(function(e) {
      var $header = $('.brand-modal-header');
      if (this.getPointerEvent(e).pageY > this.cachedY &&
          this.getPointerEvent(e).pageY > ($('#mb-j-content-container').offset().top + this.threshold)) {
        if (util.hasPositionSticky()) {
          $header.addClass('m-sticky-nav');
        } else {
          $header.addClass('m-sticky-nav-shim');
        }
      } else {
        this.removeFixedNavigation();
      }
    }, 300),

    preventDefault: function(e) {
     e.preventDefault();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.brandIndexSearch(this.model.toJSON()));
      this.$brandIndexList = $('#brandIndex-list');
      this.$brandIndexSearchResults = $('#brandIndex-search-results');
      this.$brandIndexSearchResults.css('display', 'none');
    },

    updateBrands: function() {
      this.model.set('currentValue', $('.brand-search').val());

      if (this.model.get('currentValue') !== '') {
        this.model.set('searchResults', _.filter(this.model.get('brandIndex'), function(value) {
          return value.brandName.toLowerCase().indexOf(this.model.get('currentValue').toLowerCase()) === 0;
        }, this));
        $('.brand-search-clear').css('visibility', 'visible');
        this.$brandIndexList.css('display', 'none');
        this.$brandIndexSearchResults.css('display', 'block');
      } else {
        $('.brand-search-clear').css('visibility', 'hidden');
        this.model.set('searchResults', []);
        this.$brandIndexSearchResults.css('display', 'none');
        this.$brandIndexList.css('display', 'block');
      }

      this.subViews.brandIndexSearchResultsView = new BrandIndexSearchResultsView({
        el: '#brandIndex-search-results',
        model: this.model
      });

      this.subViews.brandIndexSearchResultsView.render();
      $('.box-search').focus();
    },

    cancel: function() {
      this.trigger('searchComplete');
    },

    clearSearch: function() {
      $('.brand-search').blur();
      $('.brand-search').focus();
      $('.brand-search').val('');

      this.updateBrands();
    }
  });

  return BrandIndexSearchView;
});
