define([
  'jquery',
  // Views
  'views/overlayView',
  // Models
  'models/addToRegistryModel',
  // Util
  'util/util'
], function($, OverlayView, AddToRegistryModel, util) {

  'use strict';

  var productSizeName = function(product) {
    if (product.activeSize) {
      return _.find(product.sizes, function(size) {
        return size.id === product.activeSize;
      }).name;
    }

    return undefined;
  };

  var productTypeName = function(product) {
    if (product.activeType) {
      return _.find(product.types, function(type) {
        return type.id === product.activeType;
      }).name;
    } else if (product.types && product.types.length === 1) {
      return product.types[0].name;
    }

    return undefined;
  };

  var productColorName = function(product) {
    if (product.activeColor) {
      return _.find(product.colors, function(color) {
        return color.id === product.activeColor;
      }).name;
    } else if (product.colors && product.colors.length === 1) {
      return product.colors[0].name;
    }

    return undefined;
  };

  var addToRegistryView = OverlayView.extend({
    className: 'hide',

    events: _.extend(_.clone(OverlayView.prototype.events), {
      'click .mb-j-atr-access-registry': 'addToRegistryAccess',
      'click .mb-j-atr-create-registry': 'addToRegistryCreate'
    }),
    init: function() {
      this.model = new AddToRegistryModel();
      this.listenTo(this.model, 'modelready', this.handleAddToRegistryResponse);
      this.model.set ('errorHandler', 'showOverlay');
    },

    handleAddToRegistryResponse: function() {
      if (this.model.get('REDIRECT')) {
        location.href = this.model.get('REDIRECT');
        return;
      } else if (this.showModelErrorMessage()) {
        return;
      }
      this.render();
    },

    renderTemplate: function() {
      var templateHtml;
      if (this.model.get('noRegistry') === true){
        templateHtml = TEMPLATE.addToRegistryCreate();
      } else {
        templateHtml = TEMPLATE.addToRegistry(this.getViewData());
      }

      this.$el.html(templateHtml);
      this.$el.removeClass('hide');

      this.renderMask();
    },
    renderMask: function() {
      this.showMask();

      $('#mb-mask').on('click.mask', _.bind(function() {
        this.close();
      }, this));
    },
    show: function(product) {
      this.model.product = product;

      this.model.addToRegistry({
        productId: product.id,
        quantity: product.activeQty,
        color: productColorName(product) || 'NA',
        size: productSizeName(product) || 'NA',
        type: productTypeName(product) || 'NA'
      });
    },
    postRender: function() {
      this.fireCoremetrics(this.model.product);
    },
    getViewData: function() {
      util.abstractMethod(true);
    },
    hasModelError: function() {
      return this.model.get('success') !== true;
    },
    //These two actions below are initialited from TEMPLATE.addToRegistryCreate
    //Sending them through Bb save does not work as it is sent as XMLHttpRequest
    //and we have here a full page reload to MEW1.0 content
    //Using jQuery form does not work as well.
    addToRegistryAccess: function() {
      var form = document.createElement('form');
      form.action = '/wedding-registry/addtoregistry?registryClaim=YES';
      this.postRegistryForm(form);
    },
    addToRegistryCreate: function() {
      var form = document.createElement('form');
      form.action = '/wedding-registry/addtoregistry?registryClaim=NO';
      this.postRegistryForm(form);
    },
    postRegistryForm: function(form) {
      form.method = 'POST';
      document.body.appendChild(form);
      form.submit();
    },
    showMessage: function(message) {
      window.alert(message);
    },
    showModelErrorMessage: function() {
      if (!this.hasModelError()) {
        return false;
      }

      var message = this.model.get('errorMessage');
      this.showMessage(message);

      return true;
    },
    fireCoremetrics: function(/*product*/) {
      // Abstract method
    },
    close: function() {
      $('#mb-mask').off('click.mask');
      this.hide();
    }
  });

  return addToRegistryView;
});
