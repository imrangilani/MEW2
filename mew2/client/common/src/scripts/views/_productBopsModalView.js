define([
  'handlebars',
  'util/spinner',

  // Models
  'models/bopsUpcModel',

  // Views
  'views/modalView',
  'views/storeMapModalView',
  //Util
  'util/geoCode',
  'util/multiValueCookie',
  'util/localstorage'
], function(Handlebars, spinner, BopsUpcModel, ModalView, StoreMapModalView, GeoCode, mvCookie, localStorage) {
  'use strict';

  var ProductBopsModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(ModalView.prototype.events, {
      'click  .bops-store-select':    'setBopsStore',
      'click  .bops-result-map-link': 'showStoreMap',
      'click  #mb-bops-nearme':       'searchByUserLocation',
      'click  #mb-bops-search':       'searchByAddress',
      'keyup  #mb-bops-address':      'clearErrors',
      'change #mb-bops-distance':     'clearErrors'
    }),

    init: function() {
      this.model = new BopsUpcModel();
      this.listenTo(this.model, 'modelready', this.renderBopsResults);

      //Needed for the model to insert error message
      this.model.set('errorContainer', this.$el);
      this.model.set('errorHandler', 'showModal');
    },

    /**
     * Before the modal content is rendered, be sure to set the correct product and model id,
     * based on which link was clicked on, and the associated active upc of the corresponding product
     */
    renderTemplate: function() {
      var product = this.model.get('product');
      var upcNumber = product.upcs[product.activeUpc.upcKey].id;
      this.model.set('id', upcNumber);

      $(this.el).html(TEMPLATE.productBopsModal(this.model.attributes));
      var distance = localStorage.get('bops_filter_radius') || 25;
      this.$el.find('#mb-bops-distance').val(distance);

      if (this.model.get('defaultZipCode')) {
        // For situations where default zip code is provided during initialization, immediately do a "search"
        // on the provided zip
        this.searchByAddress();
      } else {
        //Check if location/LL cookie exists and if yes search by lat/long
        //and display zip for the user
        var cookieZipCode = this.getZipCodeCookie();
        var cookieLocation =   this.getUserLatLngCookie();

        if (cookieZipCode && cookieLocation){
          $('#mb-bops-address').val(cookieZipCode);
          this.searchByLatLng(cookieLocation.latitude, cookieLocation.longitude);
        }
      }
    },

    renderBopsResults: function() {
      this.removeSpinner();

      var product = this.model.get('product');
      var $results = $(this.el).find('#bops-results');

      $results.css('height', 'auto');

      if (product.isFIIS) {
        $results.html(TEMPLATE.productFIISResults(this.model.attributes));
      } else {
        $results.html(TEMPLATE.productBopsResults(this.model.attributes));
      }

      if (!this.model.get('defaultZipCode')){
        if (this.model.get('stores').bops){
          var location = this.model.get('requestParams');
          var zipCode = this.model.get('locationZipCode');
          if (!zipCode){
            zipCode = this.model.get('stores').bops[0].address.zipCode;
          }
          //Set location/zipCode cookie using request for LL
          //and a zipcode from either geoCode obj, or from the first store address
          this.setUserLatLngCookie (location.latitude, location.longitude);
          this.setZipCodeCookie(zipCode);
        }
      }

      var topOffset = $results.offset().top;
      if (topOffset) {
        //Scroll down to result
        $('body').animate({
          scrollTop: topOffset - 50 // -50 for fixed header height
        }, 1000);
      }
    },

    setBopsStore: function(e) {
      var locationNumber = $(e.currentTarget).closest('.bops-result').data('location');
      this.model.set('locationNumber', locationNumber);
      window.history.back();
      return false;
    },

    showStoreMap: function(e, triggeredByPopState, modalShowData) {
      if (!this.subViews.storeMapModalView) {
        this.subViews.storeMapModalView = new StoreMapModalView();
      }

      var store;
      if (!triggeredByPopState) {
        var $stateElement = this.getStateElement(e);
        var locationNumber = $stateElement.closest('.bops-result').data('location');
        store = _.find(_.union(this.model.attributes.stores.pickup, this.model.attributes.stores.bops), function(store) {
          return store.locationNumber === locationNumber;
        });
        this.pushModalState('showStoreMap', e.currentTarget.id, {
          store: store
        });
      } else {
        store = modalShowData.store;
      }

      if (!_.isUndefined(store)){
        this.subViews.storeMapModalView.show(store);
      }
      return false;
    },

    clearResults: function() {
      this.clearErrors();
      $('#bops-results').html('');
    },

    showSpinner: function() {
      var spinnerColor = 'white',
          spinnerSize = 60;
      var $results = $(this.el).find('#bops-results');
      if (!$results.hasClass(spinnerColor + '-' + spinnerSize)){
        spinner.add($results, spinnerColor, spinnerSize);
        $results.css('height', '');
      }

      // Scroll down enough to see the spinner
      var topOffset = $results.offset().top;
      if (topOffset) {
        //Scroll down to result
        $('body').animate({
          scrollTop: topOffset - 50 // -50 for fixed header height
        }, 1000);
      }
    },

    removeSpinner: function() {
      var $results = $(this.el).find('#bops-results');
      spinner.remove($results);
    },

    searchByUserLocation: function(e) {
      this.clearResults();
      this.showSpinner();
      $('#mb-bops-address').val('');

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
      this.removeSpinner();
      $('#bops-errorContainer').html(message).css('display', 'block');
    },

    searchByLatLng: function(latitude, longitude) {
      this.showSpinner();
      this.search({ latitude: latitude, longitude: longitude });
    },

    searchByAddress: function() {
      this.clearResults();

      var address = this.$el.find('#mb-bops-address').val(),
          positionCookie = this.getUserLatLngCookie(),
          zipCodeCookie = this.getZipCodeCookie(),
          zipCodeMatcher = /^\d{5}$/;

      if (address === '') {
        return;
      }

      this.showSpinner();

      if ((address === zipCodeCookie) && positionCookie.latitude && positionCookie.longitude) {
        this.search({ latitude: positionCookie.latitude, longitude: positionCookie.longitude });
        return;
      } else {
        GeoCode.getLatLngByTextQuery(address, _.bind(function(geoCodeData) {
          if (!geoCodeData) {
            this.displayErrorMessage('Either the location you entered is invalid or there are no stores within ' + this.model.get('requestParams').distance + ' miles. Please try again.');
            return;
          }

          var latitude = parseFloat(geoCodeData.latitude).toFixed(this.coordinatesPrecision);
          var longitude = parseFloat(geoCodeData.longitude).toFixed(this.coordinatesPrecision);
          var zipCode = zipCodeMatcher.test(address) ? address : geoCodeData.zipCode;

          this.model.set('locationZipCode', zipCode);
           this.search({ latitude: latitude, longitude: longitude });

        }, this), _.bind(this.processGeoLocationError, this));
      }
    },

    search: function(requestParams) {//, searchDetails) {
      var distance = this.$el.find('#mb-bops-distance').val();
      _.extend(requestParams, { distance: distance });

      localStorage.set('bops_filter_radius', distance);

      // Clear the results section
      $('#bops-results').html('');
      this.clearErrors();

      this.model.resetRequestParams();
      this.model.set('requestParams', requestParams);
      this.model.fetch();

    },
    getUserLatLngCookie: function() {
      var value = mvCookie.get('USERLL', 'MISCGCs'),
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

    getZipCodeCookie: function(zipCode) {
      return mvCookie.get('USERPC', 'MISCGCs');
    },

    setZipCodeCookie: function(zipCode) {
      mvCookie.set('USERPC', zipCode, 'MISCGCs');
    }

  });

  Handlebars.registerHelper('productPrimaryImage', function(images, activeImageset) {
    return images[activeImageset][0] ? images[activeImageset][0].image || images[activeImageset][0].swatch : '';
  });

  Handlebars.registerHelper('ifNoStores', function(options) {
    // 400 - Unable to find specified location for ZIP code '99999' (Invalid ZIP code)
    // 404 - No stores found
    if ((this.errorCode === 400) || (this.errorCode === 404)) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('ifAllUnavailable', function(options) {
    if (!this.stores.bops && !this.stores.pickup && this.stores.unavailable) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  return ProductBopsModalView;
});
