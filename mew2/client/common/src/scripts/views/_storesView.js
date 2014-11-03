define([
  'util/util',

  // Models
  'models/storeResultsModel',
  'models/storeServiceSelectionModel',
  'models/geoCodeModel',
  // Views
  'views/mainContentView',
  'views/storeServicesModalView',
  'views/storeAutoCompleteView'
], function(util, StoreResultsModel, StoreServiceSelectionModel, GeoCodeModel, MainContentView, StoreServicesModalView, StoreAutoCompleteView) {
  'use strict';

  var StoresView = MainContentView.extend({

    events: {
      // When filter results is clicked
      'click .mb-j-filter-results': 'showStoreServicesModalView',
      'submit #mb-j-stores-form': 'findStoresNearMyTextQuery',
      'click #mb-j-stores-nearme': 'findStoresNearMe',
      'input #mb-j-location-input': 'triggerAutoComplete',
      'click #mb-j-stores-search-clear': 'clearSearchField',
      'click a.mb-select-autocomplete': 'findStoresAtSuggestedPlace',
      'click .mb-j-stores-latchkeys .mb-j-stores-latchkey:not(.current)': 'toggleListMapView',
      'click .mb-store-list:not(.editing) .mb-j-store-list-entry': 'selectStoreDetails',
      'click #mb-j-stores-map-view .mb-j-store-list-entry': 'selectStoreDetails',
      'click .mb-j-back': 'back'
    },

    init: function() {
      this.map = null;
      this.mapMarkers = [];
      this.model = new StoreResultsModel({ requestParams: _.omit(this.options, ['pageid','cm_sp']) });
      this.coordinatesPrecision = App.config.geolocation.coordinates.precision;
      this.listenTo(this.model, 'modelready', this.renderResultsTemplate);

      this.subViews.storeServicesModalView = new StoreServicesModalView({
        model: new StoreServiceSelectionModel({
          selectedValues: _.keys(_.omit(this.options, ['pageid', 'cm_sp', 'reference', 'location', 'nearby', 'display', 'isLandingPage']))
        })
      });

      // Attach flag directly to stores model to indicate if results are "filtered" -  used by template and error handler
      this.model.set('filtered', !_.isEmpty(this.subViews.storeServicesModalView.model.attributes.selectedValues));

      this.listenTo(this.subViews.storeServicesModalView, 'done', this.refineResults);
      this.listenTo(this.model, 'processResultsError', this.processResultsError);

      this.geoCodeModel = new GeoCodeModel();
      var view = this;

      // Handle "back" case, where geo library is initialized already
      if (this.geoCodeModel.geo.initialized) {
        view.geoCodeReady();
      }

      // Wait for geo library to initialize before rendering
      this.geoCodeModel.once('geoCodeLoaded', function() {
        view.geoCodeReady();
      });
    },

    geoCodeReady: function() {
      // initial render
      this.render();

      this.findStoresDeepLink();

      // page view tag
      this.pageViewAnalytics();
    },

    back: function() {
      if (App.router.isDeepLink()) {
        App.router.navigate('shop/store/search', { trigger: true, replace: true });
      }
      else {
        window.history.back();
      }
    },

    pageViewAnalytics: function() {
      // brand specific
      util.abstractMethod(false);
    },

    // renders the main template (header) for the view
    renderTemplate: function() {
      if (!this.options.nearby && !this.options.location && !this.options.reference) {
        this.options.isLandingPage = true;
      }

      this.$el.html(TEMPLATE.stores(_.extend(_.clone(this.options), { filtered: this.model.get('filtered') })));
    },

    postRender: function() {
      if (!this.subViews.autoCompleteView) {
        this.subViews.autoCompleteView = new StoreAutoCompleteView();
      }

      MainContentView.prototype.postRender.apply(this, arguments);
    },

    // renders only the list of stores template
    renderResultsTemplate: function(stores) {
      stores = stores || this.model.get('stores');

      if (_.isEmpty(stores)) {
        if (!this.model.get('triggeredByBoundsChange')) {
          this.processResultsError();
        }
      }
      else {
        // Render results in list format
        this.$('#mb-j-stores-list-view').html(TEMPLATE.storeResultsList(this.model.toJSON()));

        // The map only exists if the user was on the "map view" at least once
        if (this.map) {
          // Render results as markers on map
          this.renderStoresOnMap(stores);
        }
      }
    },

    renderSpinner: function() {
      // no-op
    },

    // the call to the geocode model to get the lat/lng and then the list of matched stores
    findStores: function(geoCodeRequestParams, options) {
      this.clearErrorMessage();

      if (this.subViews.autoComplete) {
        this.subViews.autoCompleteView.clearAutoComplete();
      }

      // If coming from a main page to a search results page, re-render the page
      if (this.options.isLandingPage) {
        delete this.options.isLandingPage;
        this.render();
      }

      this.renderSpinner();

      this.geoCodeModel.set('requestParams', geoCodeRequestParams);

      this.listenToOnce(this.geoCodeModel, 'modelready', _.bind(function() {
        var location = this.geoCodeModel.get('results');
        if (location) {
          this.model.unset('radius');
          this.model.set('triggeredByBoundsChange', false);
          delete this.bounds;
          this.findStoresNearLatLng(location.latitude, location.longitude);
        }
      }, this));

      this.geoCodeModel.fetch(_.defaults(options || {}, {
        mapContainer: $('#mb-j-dummy-google-map')[0]
      }));
    },

    findStoresDeepLink: function() {
      var requestParams = this.model.get('requestParams');

      // if deep-linking with a search already made, execute the search method
      if (!!requestParams.location || !!requestParams.reference || !!requestParams.nearby) {
        // renaming the 'location' querystring param to 'query' to comply with the geoCodeModel expectations
        requestParams.query = requestParams.location;
        delete requestParams.location;
        this.model.set('requestParams', requestParams);

        this.findStores(requestParams,  {
          allowZeroResults: false,
          error: _.bind(this.processResultsError, this)
        });

        return true;
      }

      return false;
    },

    // submits a text search to get the stores matching the query on the single input field
    findStoresNearMyTextQuery: function(e) {
      e.preventDefault();
      var query = this.$('#mb-j-location-input').blur().val();

      // Set up view options to include location, but not nearby flag. used by template
      this.options = _.extend(_.omit(this.options, 'nearby'), { location : query });

      // fetch the results - list of stores that matched the query
      this.findStores({
        query: query
      }, {
        allowZeroResults: false,
        error: _.bind(this.processResultsError, this)
      });

      // dismisses the autocomplete view
      if (this.subViews.autoCompleteView) {
        this.subViews.autoCompleteView.clearAutoComplete();
      }

      // saves the search on the browser history
      App.router.navigate(this.prepareBrowserUrl('/shop/store/search?location=' + encodeURIComponent(query)), { trigger: false });
    },

    // the call to WSSG to fetch the near stores given a lat/lng
    findStoresNearLatLng: function(latitude, longitude) {
      latitude = (_.isNumber(latitude)) ? latitude.toFixed(this.coordinatesPrecision) : latitude;
      longitude = (_.isNumber(longitude)) ? longitude.toFixed(this.coordinatesPrecision) : longitude;

      this.model.set('requestParams', {
        latitude: latitude,
        longitude: longitude
      });

      this.model.set('urlParams', _.extend(_.omit(this.options, ['pageid','location','reference','nearby','cm_sp', 'toggle', 'display', 'isLandingPage']), this.model.get('urlParams') || {}));
      this.model.fetch();
    },

    findStoresNearMe: function() {
      // Set up view options to include nearby flag, but not location. used by template
      this.options = _.extend(_.omit(this.options, 'location'), { nearby: true });

      this.findStores({
        nearby: true
      }, {
        error: _.bind(this.processGeoLocationError, this)
      });

      this.$('#mb-j-location-input').val('');

      // dismisses the autocomplete view
      if (this.subViews.autoCompleteView) {
        this.subViews.autoCompleteView.clearAutoComplete();
      }

      App.router.navigate(this.prepareBrowserUrl('/shop/store/search?nearby=true'), { trigger: false });
    },

    findStoresAtSuggestedPlace: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var autoCompleteLocationName = $(e.currentTarget).data('name'),
          autoCompleteLocationReference = $(e.currentTarget).data('reference');

      this.subViews.autoCompleteView.clearAutoComplete();
      this.$('#mb-j-location-input').val(autoCompleteLocationName);

      // Set up view options to include location, but not nearby flag. used by template
      this.options = _.extend(_.omit(this.options, 'nearby'), { location : autoCompleteLocationName });

      // fetch the results - list of stores near the referenced google location
      this.findStores({
        reference: autoCompleteLocationReference
      });

      // saves the search on the browser history
      App.router.navigate(this.prepareBrowserUrl('/shop/store/search?reference=' + autoCompleteLocationReference), { trigger: false });
    },

    processResultsError: function(result) {
      var message;

      if (result === 'ZERO_RESULTS') {
        // google api could not find a location that matched the user input
        message = 'This is not a recognized location, please try again.';

        // Get rid of any previous latitude/longitude set
        this.model.set('requestParams', {});
      } else {
        if (this.model.get('filtered')) {
          message = 'No stores found with the selected services near this area, please try again.';
        }
        else {
          message = 'No stores found near this area, please try again.';
        }

        // Center map on current lat/long
        this.autoCenterMap();
      }

      // Get rid of any previous stores set
      this.model.set('stores', []);

      this.displayErrorMessage(message);

      // Empty list view, and clear map markers
      this.$('#mb-j-stores-list-view').empty();
      this.clearMapMarkers();
    },

    processGeoLocationError: function(error) {
      if (error) {
        this.displayErrorMessage('We are unable to determine your location. Please enable Location Service access in your phone\'s settings.');
      }
    },

    displayErrorMessage: function(message) {
      this.$('#mb-j-stores-error-message').html(message).closest('#mb-j-stores-error-container').show();
    },

    clearErrorMessage: function() {
      this.$('#mb-j-stores-error-message').html('').closest('#mb-j-stores-error-container').hide();
    },

    triggerAutoComplete: function(e) {
      // checks if we should display the clear button
      this.toggleSearchClearVisibility();

      // calls autocomplete view, providing the value of the single input field as a query
      var query = $.trim(this.$(e.target).val());
      this.subViews.autoCompleteView.triggerAutoComplete(query);
    },

    // toggles the display of the search clear icon "x" based on the presence of user-supplied search terms
    toggleSearchClearVisibility: function() {
      var searchTermsEmpty = this.$('#mb-j-location-input').val() === '';
      this.$('#mb-j-stores-search-clear').toggleClass('visible', !searchTermsEmpty);
      if (searchTermsEmpty) {
        this.subViews.autoCompleteView.clearAutoComplete();
      }
    },

    clearSearchField: function() {
      // clears the single input field
      this.$('#mb-j-location-input').val('');
      // clears the search button and the autocomplete view
      this.toggleSearchClearVisibility();

      this.$('#mb-j-location-input').focus();
    },

    showStoreServicesModalView: function(e, triggeredByPopState) {
      if (!triggeredByPopState) {
        this.pushModalState('storeServicesModalView');
      }

      this.subViews.storeServicesModalView.show();

      return false;
    },

    toggleListMapView: function(e) {
      var clicked = ($(e.currentTarget).hasClass('value-1')) ? ('list') : ('map');
      this.options.display = clicked;

      this.$('.mb-j-stores-latchkeys .mb-j-stores-latchkey').toggleClass('current');
      this.$('#mb-j-stores-map-view').toggleClass('selectedLatchKey');
      this.$('#mb-j-stores-list-view').toggleClass('selectedLatchKey');

      if (clicked === 'map') {
        if (!this.map) {
          this.showMap();
        }
        else {
          this.autoCenterMap();
        }
      }
    },

    // Event handler triggered when a popstate event occurs
    popstate: function(event) {
      MainContentView.prototype.popstate.apply(this, arguments);
      if (!event.state || !event.state.level) {
        this.trigger('wentBack');
      }
    },

    refineResults: function() {
      window.history.back();

      this.clearErrorMessage();

      var $url = $.url();

      // Set url params directly to stores model with selectedValues of modal model
      var selectedValues = this.subViews.storeServicesModalView.model.get('selectedValues');
      var newFilterApplied = _.difference(this.oldServiceFilter, selectedValues).length !== 0;

      // urlParams will have the modal selected values as keys, and "1" as values. browser and wssg urls are built off of this object
      var urlParams = _.object(selectedValues, _.range(selectedValues.length).map(function() {
        return 1;
      }));
      this.model.set('urlParams', urlParams);

      // Attach flag directly to stores model to indicate if results are "filtered" -  used by template and error handler
      var filtered = !_.isEmpty(selectedValues);
      this.model.set('filtered', filtered);
      this.$('#mb-filter-container').toggleClass('filtered', filtered);

      var url = this.prepareBrowserUrl($url.data.attr.path + '?' + $.param(_.pick($url.param(), ['reference', 'location', 'nearby', 'display'])));

      this.listenToOnce(this, 'wentBack', function() {
        App.router.navigate(url, { replace: false });
      });

      // Create a flag indicating if we currently have a valid location
      var validLocation = this.model.get('requestParams').latitude && this.model.get('requestParams').longitude;

      if (!_.isEmpty(this.model.get('stores')) || (!filtered && validLocation) || newFilterApplied) {
        // There are either stores, or we just removed all filters. re-grab
        this.renderSpinner();
        this.model.set('triggeredByBoundsChange', false);
        this.model.fetch();
      }
      else {
        // There were no stores before this filter was applied. Re-display error message
        var result = false;
        if (!validLocation) {
          // invalid search
          result = 'ZERO_RESULTS';
        }

        var view = this;

        // wait for modal to close before rendering toast
        setTimeout(function() {
          view.processResultsError(result);
        }, 350);
      }

      this.oldServiceFilter = selectedValues;
    },

    showMap: function() {
      /* global google */
      var view = this;
      var $map = $('#mb-j-map');
      var stores = this.model.get('stores');

      // Only create the map one time
      if (!this.map || $map.html().trim() === '') {
        this.map = new google.maps.Map($map[0], {
          zoom: 3, // gets overwritten by map.fitBounds();
          center: new google.maps.LatLng(39.833, -98.583), // center of US
          zoomControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // close current infowindow when map is clicked
        google.maps.event.addListener(this.map, 'click', function() {
          if (view.infoWindowHandle) {
            view.infoWindowHandle.close();
            delete view.infoWindowHandle;
          }
        });

        google.maps.event.addListener(this.map, 'dragend', function() {
          return view.mapBoundsChange();
        });

        google.maps.event.addListener(this.map, 'zoom_changed', function() {
          return view.mapBoundsChange();
        });

        if (!_.isEmpty(stores)) {
          this.renderStoresOnMap(this.model.get('stores'));
        }
        else {
          // no stores, but might be lat/lng
          this.autoCenterMap();
        }
      }
    },

    mapBoundsChange: function() {
      var view = this;

      if (!view.isAutoCentering) {
        /**
         * Determine the search radius for these bounds, by calculating the distance
         * between the center, and the closest edge. This way, all results will be
         * rendered within the viewable bounds.
         */
        var bounds = view.map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var nw = new google.maps.LatLng(ne.lat(), sw.lng());

        // Determine horizontal and vertical distances for map bounds, to infer which edge is closer
        var horiz = google.maps.geometry.spherical.computeDistanceBetween(nw, ne);
        var vert = google.maps.geometry.spherical.computeDistanceBetween(nw, sw);
        var edge;

        // determine if the map is wider than it is tall, or visa-versa - use the edge closest to center
        if (horiz > vert) {
          // find the center point between the two upper bounds
          edge = new google.maps.LatLng(nw.lat(), ((nw.lng() + ne.lng()) / 2));
        }
        else {
          // find the center point between the two left bounds
          edge = new google.maps.LatLng(((nw.lat() + sw.lat()) / 2), nw.lng());
        }

        // calculate the distance from the bounds center to the closest edge (in miles), and set it on the model
        var center = view.map.getCenter();
        var radius = Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(center, edge) * 0.000621371192);
        view.model.set('radius', radius);

        // Find stores within the viewable area, and render them as markers on the map
        view.model.set('triggeredByBoundsChange', true);
        view.model.set('errorHandler', 'showOverlay');
        view.findStoresNearLatLng(center.lat(), center.lng());
      }
      else {
        view.isAutoCentering = false;
      }

      return false;
    },

    clearMapMarkers: function() {
      for (var i = 0; i < this.mapMarkers.length; i++) {
        this.mapMarkers[i].setMap(null);
      }

      this.mapMarkers.length = 0;
    },

    renderStoresOnMap: function(stores) {
      var view = this;
      var bounds;

      if (!view.model.get('triggeredByBoundsChange')) {
        bounds = new google.maps.LatLngBounds();
      }

      // Clear all current markers
      view.clearMapMarkers();

      _.each(stores, function(store) {
        // create an infowindow for each store
        var contentString = TEMPLATE.storeMapInfoWindow(store);
        var infowindow = new google.maps.InfoWindow({ content: contentString });

        // create a marker for each store
        var markerOptions = view.getMarkerOptions(store);

        var marker = new google.maps.Marker(markerOptions);
        view.mapMarkers.push(marker);

        if (!view.model.get('triggeredByBoundsChange')) {
          // update bounds to include this store
          var loc = markerOptions.position;
          bounds.extend(loc);
        }

        // show infowindow when marker is clicked
        google.maps.event.addListener(marker, 'click', function() {
          if (view.infoWindowHandle) {
            view.infoWindowHandle.close();
          }

          infowindow.open(view.map, marker);
          view.infoWindowHandle = infowindow;
        });

        // trigger event handler when infowindow is domready
        google.maps.event.addListener(infowindow, 'domready', function() {
          view.infoWindowReady.call(view, $(this.k.contentNode));
        });
      });

      if (!view.model.get('triggeredByBoundsChange')) {
        // auto-center and auto-zoom map for current store set
        view.autoCenterMap(bounds);
      }

      this.bounds = bounds;
    },

    autoCenterMap: function(bounds) {
      if (this.map) {
        if (!bounds) {
          bounds = this.bounds;
        }

        this.isAutoCentering = true;

        if (bounds) {
          this.map.fitBounds(bounds);
        }
        else if (this.model.get('requestParams').latitude && this.model.get('requestParams').longitude) {
          this.map.panTo(new google.maps.LatLng(this.model.get('requestParams').latitude, this.model.get('requestParams').longitude));
        }
      }
    },

    // triggered when info window is dom-prepareed
    infoWindowReady: function($content) {
      return;
    },

    getMarkerOptions: function(store) {
      var newLatLong = new google.maps.LatLng(store.location.latitude, store.location.longitude);

      return {
        position: newLatLong,
        map: this.map,
        icon: '/mew20/images/marker.png',
        optimized: false
      };
    },

    selectStoreDetails: function(e) {
      var $storeEntry = this.$(e.currentTarget).closest('.mb-j-store-list-entry'),
          locationNumber = $storeEntry.data('location');

      // saves the search on the browser history
      App.router.navigate('/shop/store/detail?locNo=' + encodeURIComponent(locationNumber), { trigger: true });
    },

    prepareBrowserUrl: function(base) {
      var url = base;

      var urlParams = this.model.get('urlParams');
      if (!_.isEmpty(urlParams)) {
        url += '&' + $.param(urlParams);
      }

      return url;
    }
  });

  return StoresView;
});
