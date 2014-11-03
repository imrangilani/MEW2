define([
  // Views
  'views/facetSelectionModalView',
  //Util
  'util/util',
  'util/geoCode',
  'util/localstorage',
  'util/multiValueCookie'
], function(FacetSelectionModalView, util, GeoCode, localStorage, mvCookie) {
  'use strict';

  var FacetBopsView = FacetSelectionModalView.extend({
    id: 'mb-facetBopsModal-container',

    events: _.extend(_.clone(FacetSelectionModalView.prototype.events), {
      'input #mb-bops-address': 'updateClearIcon',
      'click #mb-bops-nearme': 'getUserLocation',
      'click #mb-bops-search': 'searchByAddress',
      'click #mb-bops-change': 'changeSearch',
      'click #mb-bops-cancel': 'cancel',
      'click #mb-bops-clear': 'clearAll',
      'click .mb-bops-search-clear': 'clearSearch',
      'click ul li.facet-value:not(.facet-value-selected,.facet-value-none,.facet-value-disabled)' : 'storeBopsLocation',
      'click ul li.facet-value.facet-value-selected' : 'clearAll',
      'keyup #mb-bops-address': 'clearErrors',
      'change #mb-bops-distance': 'clearErrors',
      'submit #mb-bops-search-form': 'submitForm'
    }),

    init: function() {
      FacetSelectionModalView.prototype.init.apply(this, arguments);

      this.coordinatesPrecision = App.config.geolocation.coordinates.precision;
      this.listenTo(this.model, 'modelready', this.updateStoreList);

      // If bops location is passed in url, store it
      var $url = $.url();
      var locationNumber = $url.param('UPC_BOPS_PURCHASABLE');
      if (locationNumber) {
        this.storeBopsLocation(null, parseInt(locationNumber));
      }
    },

    updateExtraData: function(facetListModalModel) {
      FacetSelectionModalView.prototype.updateExtraData.apply(this, arguments);

      this.updateModelRequestParams(facetListModalModel);
      this.model.set('context', facetListModalModel.get('context'));
    },

    updateModelRequestParams: function(facetListModalModel) {
      this.model.clearRequestParams();
      this.model.addRequestParams(_.omit(facetListModalModel.get('requestParams'), ['UPC_BOPS_PURCHASABLE']), true);
    },

    renderTemplate: function() {
      $(this.el).html(TEMPLATE.facetBopsModal(_.extend(this.model.attributes, {
        distance: localStorage.get('bops_filter_radius') || 25
      })));

      this.toggleSelectionModalButtons();
      this.initialScroll = $(window).scrollTop();
    },

    postRender: function() {
      FacetSelectionModalView.prototype.postRender.apply(this, arguments);

      var zipCode = mvCookie.get('USERPC', 'MISCGCs');
      var distance = localStorage.get('bops_filter_radius') || 25;

      if (zipCode) {
        this.$el.find('#mb-bops-address').val(zipCode);
        this.$el.find('#mb-bops-distance').val(distance);

        this.searchByAddress();
      }

      this.updateClearIcon();
    },

    updateClearIcon: function() {
      if (this.$el.find('#mb-bops-address').val() === '') {
        this.$el.find('.mb-bops-search-clear').css('visibility', 'hidden');
      } else {
        this.$el.find('.mb-bops-search-clear').css('visibility', 'visible');
      }
    },

    getUserLocation: function(e) {
      GeoCode.init();
      GeoCode.getLocalLatLng(_.bind(this.processUserLocationSuccess, this), _.bind(this.processUserLocationError, this));
    },

    processUserLocationSuccess: function(coords) {
      var latitude = parseFloat(coords.latitude).toFixed(this.coordinatesPrecision);
      var longitude = parseFloat(coords.longitude).toFixed(this.coordinatesPrecision);

      this.searchByLatLng(latitude, longitude);
    },

    processUserLocationError: function(error) {
      if (error) {
        this.displayErrorMessage('We are unable to determine your location. Please enable Location Service access in your phone\'s settings.');
      }
    },

    processGeoLocationError: function(error) {
      if (error) {
        this.displayErrorMessage('Unable to determine location.');
      }
    },

    clearErrors: function() {
      $('#bops-errorContainer').css('display', 'none');
    },

    displayErrorMessage: function(message) {
      $('#bops-errorContainer').html(message).css('display', 'block');
    },

    searchByLatLng: function(latitude, longitude) {
      var searchDetails = latitude + ', ' + longitude;

      // We have to search by lat/lng but we also need to store the user's zip code
      GeoCode.getZipCodeByLocation(latitude, longitude,
        _.bind(function(zipCode) {
          searchDetails = zipCode || searchDetails;
          this.$el.find('#mb-bops-address').val(searchDetails);

          this.searchByLatLngZip(latitude, longitude, zipCode, searchDetails);
        }, this),
        _.bind(this.processGeoLocationError, this));
    },

    searchByAddress: function() {
      var address = this.$el.find('#mb-bops-address').val(),
          positionCookie = this.getUserLatLngCookie(),
          zipCodeCookie = this.getZipCodeCookie(),
          zipCodeMatcher = /^\d{5}$/;

      if (address === '') {
        return;
      }

      if ((address === zipCodeCookie) && positionCookie.latitude && positionCookie.longitude) {
        this.searchByLatLngZip(positionCookie.latitude, positionCookie.longitude, address, address);
        return;
      } else {
        GeoCode.getLatLngByTextQuery(address, _.bind(function(geoCodeData) {
          if (!geoCodeData) {
            this.updateError('INVALID_SEARCH');
            return;
          }

          var latitude = parseFloat(geoCodeData.latitude).toFixed(this.coordinatesPrecision);
          var longitude = parseFloat(geoCodeData.longitude).toFixed(this.coordinatesPrecision);
          var zipCode = zipCodeMatcher.test(address) ? address : geoCodeData.zipCode;

          this.searchByLatLngZip(latitude, longitude, zipCode, address);

        }, this), _.bind(this.processGeoLocationError, this));
      }
    },

    searchByLatLngZip: function(latitude, longitude, zipCode, searchDetails) {
      this.setUserLatLngCookie(latitude, longitude);
      this.setZipCodeCookie(zipCode);

      this.search({ latitude: latitude, longitude: longitude }, searchDetails);
    },

    search: function(requestParams, searchDetails) {
      var radius = this.$el.find('#mb-bops-distance').val();
      _.extend(requestParams, { radius: radius });

      localStorage.set('bops_filter_radius', radius);

      // Clear the results section
      $('#mb-facet-bops-results').html('');

      this.model.resetRequestParams();
      this.model.addRequestParams(requestParams);
      this.model.fetch();
    },

    updateStoreList: function() {
      var facetValues = this.getFacetsValues();
      var selectedValues = this.model.get('selectedValues');
      var selectedStore = selectedValues.length ? selectedValues[0] : "";

      $('#mb-facet-bops-results').html(TEMPLATE.bopsFacetResults({
        stores: facetValues,
        selectedStore: selectedStore,
        requestParams: this.model.get('requestParams')
      }));
    },

    storeBopsLocation: function(e, newLocationNumber) {
      var prevLocationNumber = mvCookie.get('BOPSPICKUPSTORE', 'MISCGCs');

      if (!newLocationNumber) {
        newLocationNumber = parseInt($(e.currentTarget).data('facet-value'));
      }

      util.storage.remove('bops_location_number');

      if (prevLocationNumber) {
        prevLocationNumber = parseInt(prevLocationNumber);
      }

      if (prevLocationNumber !== newLocationNumber) {
        localStorage.set('bops_location_number', newLocationNumber);
      }
    },

    getFacetsValues: function() {
      var bopsFacet = _.find(this.model.get('facets'), function(facet) {
        return facet.name == 'UPC_BOPS_PURCHASABLE';
      });
      return bopsFacet ? bopsFacet.value : [];
    },

    getZipCodeCookie: function(zipCode) {
      return mvCookie.get('USERPC', 'MISCGCs');
    },

    setZipCodeCookie: function(zipCode) {
      if (!zipCode || (!/^\d{5}$/.test(zipCode))) {
        return;
      }

      mvCookie.set('USERPC', zipCode, 'MISCGCs');
    },

    getUserLatLngCookie: function(latitude, longitude) {
      var value = mvCookie.get('USERLL', 'MISCGCs');
          latitude,
          longitude;

      if (value) {
        var tokens = value.split(',');
        latitude = parseFloat(tokens[0]);
        longitude = parseFloat(tokens[1]);
      }

      return {
        latitude: latitude,
        longitude: longitude
      };
    },

    setUserLatLngCookie: function(latitude, longitude) {
      mvCookie.set('USERLL', latitude + ',' + longitude, 'MISCGCs');
    },

    updateError: function(errorCode) {
      $('#mb-facet-bops-results').html(TEMPLATE.bopsFacetResults({
        distance: this.$el.find('#mb-bops-distance').val(),
        errorCode: errorCode
      }));
    },

    changeSearch: function() {
      $('#mb-facet-bops-results').html('');
      this.clearAll();
    },

    clearAll: function() {
      FacetSelectionModalView.prototype.clearAll.apply(this, arguments);
      this.model.set('urlParams', []);
      this.toggleSelectionModalButtons();
    },

    clearSearch: function() {
      $('#mb-bops-address').blur();
      $('#mb-bops-address').focus();
      $('#mb-bops-address').val('');
      this.updateClearIcon();
    },

    submitForm: function(e) {
      $('#mb-bops-address').blur(); 
      return false; 
    }
    
  });

  return FacetBopsView;
});
