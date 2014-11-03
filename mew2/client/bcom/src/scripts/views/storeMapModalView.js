define([
  'jquery',
  'util/geoCode',
  // Views
  'views/modalView',
  'util/orientation',
  'util/crossBrowserHeight'
], function($, GeoCode, ModalView, orientation, crossBrowserHeight) {
  'use strict';

  var StoreMapModalView = ModalView.extend({
    id: 'b-map-modal',
    className: ModalView.prototype.className + ' modal-level-2',

    events: _.extend(ModalView.prototype.events, {
      'click  #b-map-back': 'back'
    }),

    init: function() {
      this.listenTo(orientation, 'orientationchange', this.setMapHeight);
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.storeMapModal({}));
    },

    postRender: function() {

    },

    //Google maps want the height of the map set on the element
    setMapHeight: function() {
      var mapHeight = crossBrowserHeight.height() - parseInt($('header.mb-modal-header').css('height')) - parseInt($('#b-map-header').css( 'height'));
      if (_.isNumber(mapHeight)) {
        $('#mb-j-map').css('height', mapHeight + 'px');
      } else {
        //It's going to be too large, but it's better than no map at all
        $('#mb-j-map').css('height', '100%');
      }
    },

    //displays store info and a map based on the data passed from the bops modal
    show: function(store) {
      this.render();
      //Display store info
      this.$('#b-map-header').html(TEMPLATE.storeMapHeader(store));

      ModalView.prototype.show.call(this);

      //Set css height of the map
      this.setMapHeight();

      //Define map parameters
      GeoCode.getMapLatLng( store.location, this.showMap);
    },

    showMap: function(latlng){
      var mapOptions = {
        zoom: App.config.mapsApi.zoomLevel,
        center: latlng,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("mb-j-map"), mapOptions);

      var markerOptions = {
        position: latlng
      };

      var marker = new google.maps.Marker(markerOptions);
      marker.setMap(map);
    }

  });

  return StoreMapModalView;
});
