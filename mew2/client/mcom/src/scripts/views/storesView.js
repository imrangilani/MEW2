define([
  'views/_storesView',
  'views/storeFavoritesView',
  'models/storeFavoritesModel',
  'widgets/toggleSelect',
  'util/tooltip',
  'util/spinner',
  'analytics/analyticsTrigger'
], function(StoresView, StoreFavoritesView, StoreFavoritesModel, ToggleSelect, tooltip, spinner, analytics) {
  'use strict';

  var MCOMStoresView = StoresView.extend({

    init: function() {
      // Set up a single instance of the store favorites model for re-use
      this.storeFavoritesModel = new StoreFavoritesModel();

      $('#mb-j-search-container').hide();
      StoresView.prototype.init.apply(this, arguments);

      // Inject META tag that will prevent SEO bots from crawling this page
      $('head title').after('<meta name="robots" content="noindex">');
    },

    events: _.extend(_.clone(StoresView.prototype.events), {
      //Weird selector to differentiate from the same element in the base class
      'click .m-stores-search-form #mb-j-stores-nearme': 'doNearMeAnalytics',
      'click #mb-j-stores-map-view .call' : 'doStoreMapPhoneAnalytics'
    }),

    displayErrorMessage: function(message) {
      if (this.$spinner) {
        spinner.remove(this.$spinner);
      }

      tooltip(
        $('#mb-j-location-input'),       // element: The swatch tapped
        message,                         // content
        0,                               // arrowPosition: No arrow
        0,                               // ttl (time-to-live): Stay on forever
        5                                // marginBottom
      );
    },

    getMarkerOptions: function(store) {
      var newLatLong = new google.maps.LatLng(store.location.latitude, store.location.longitude);

      // if the store is in the user favorites, use a different pin icon
      var icon = (store.isInFavorites) ? ('/mew20/images/icon-map_pin-favorites.svg') : ('/mew20/images/icon-map_pin-default.svg');

      return {
        position: newLatLong,
        map: this.map,
        icon: icon
      };
    },

    // triggered when info window is dom-prepareed
    infoWindowReady: function($content) {
      var $container = $content.parent('.gm-style-iw').css('width', '245px').prev();

      $container
        .css('opacity', 0.92)
      .find('> div:eq(2) div div') // triangle half
        .css('box-shadow', 'none')
        .end()
      .find('> div:eq(3)') // UI window
        .css('border-radius', '10px')
        .css('width', '269px')
        .end()
      .find('> div:eq(1)') // shadow
        .remove()
        .end()
      .parent() // wrapper
        .css('width', '269px')
      .find('> div:eq(2)') // "close" button
        .remove();

      return;
    },

    toggleListMapView: function() {
      StoresView.prototype.toggleListMapView.apply(this, arguments);

      var clicked = this.$('#m-j-toggle-view input.mb-j-toggleselect-value').val();
      this.options.display = clicked;

      var $url = $.url();
      var replace = (!_.isEmpty($url.param())) ? (true) : (false);

      var url = $url.attr('relative');

      if (replace) {
        url = url.replace('&display=list', '').replace('&display=map', '');
      }

      url += '&display=' + clicked;

      App.router.navigate(url, { replace: replace, trigger: false });

      if (this.options.display === 'map') {
        this.doViewToggleMapAnalytics();
      }
    },

    prepareBrowserUrl: function(base) {
      var extra = '';

      if (base.indexOf('display=') === -1) {
        if (!this.options.display) {
          this.options.display = 'list';
        }

        extra += '&display=' + this.options.display;
      }

      return StoresView.prototype.prepareBrowserUrl.call(this, base) + extra;
    },

    renderTemplate: function() {
      StoresView.prototype.renderTemplate.apply(this, arguments);

      if (this.options.isLandingPage) {
        this.subViews.storeFavoritesView = new StoreFavoritesView({
          el: '#mb-j-stores-favorites',
          model: this.storeFavoritesModel
        });

        this.doInitialPageViewAnalytics();
      }
      else {
        // apply toggle widget for list/map view
        new ToggleSelect({
          el: this.$('#m-j-toggle-view'),
          options: {
            value1: {
              label: 'list view',
              class: 'mb-j-stores-latchkey current',
              value: 'list'
            },
            value2: {
              label: 'map view',
              class: 'mb-j-stores-latchkey',
              value: 'map'
            }
          }
        });

        // trigger widget click; if on map view, should stay on map view
        var toggle = this.options.display || 'list';

        if (toggle === 'map') {
          this.$('#m-j-toggle-view .mb-j-toggleselect-item[data-value="' + toggle + '"]').trigger('click');
        }
      }
    },

    renderResultsTemplate: function() {
      // Before rendering results, tag favorite stores
      this.storeFavoritesModel.parseFavorites(this.model.get('stores'));

      // render the results
      StoresView.prototype.renderResultsTemplate.apply(this, arguments);

      this.$('.mb-store-list .mb-j-store-list-entry .m-store-list-entry-name').dotdotdot();

      spinner.remove(this.$spinner);

      this.doListPageViewAnalytics();
    },

    renderSpinner: function() {
      if (!this.$spinner) {
        this.$spinner = this.$('#mb-j-stores-list-view');
      }

      this.$spinner.empty();
      spinner.add(this.$spinner, 'white', 60);
    },

    doInitialPageViewAnalytics: function(){
      analytics.triggerTag( {
        tagType: 'pageViewTag',
        pageId: 'STORES_SEARCH',
        categoryId: 'STORES'
      });
    },

    doListPageViewAnalytics: function(){
      analytics.triggerTag( {
        tagType: 'pageViewTag',
        pageId: 'STORES_RESULT',
        categoryId: 'STORES'
      });
    },

    doNearMeAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'near_me',
        elementCategory: 'STORES'
      });
    },

    doFilterStoresAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'filter_by_services',
        elementCategory: 'STORES'
      });
    },

    doViewToggleMapAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'map_view',
        elementCategory: 'STORES'
      });
    },

    doStoreMapPhoneAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'map_phone_number',
        elementCategory: 'STORES'
      });
    },

    close: function() {
      $('#mb-j-search-container').show();
      $('head meta[name="robots"]').remove();
      StoresView.prototype.close.apply(this, arguments);
    }

  });

  return MCOMStoresView;
});
