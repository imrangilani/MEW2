define([
  'jquery',
  // Views
  'views/overlayView',
  // Models
  'models/addToRegistryModel',
  //util
  'analytics/analyticsTrigger',
  'util/tooltip'
  // Views
], function($, OverlayView, AddToRegistryModel, analytics, tooltip) {

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
    id: 'm-addtoregistry-overlay',
    className: 'hide',
    events: _.extend(_.clone(OverlayView.prototype.events), {
      'click .m-access-registry': 'addToRegistryAccess',
      'click .m-create-registry': 'addToRegistryCreate'
    }),

    init: function() {
      this.model = new AddToRegistryModel();
      this.listenTo(this.model, 'modelready', this.render);
      this.listenTo(this.model, 'error', this.errorHandler);
      this.model.set ('errorHandler', 'showOverlay');
    },
    getViewData: function() {
      var data = {
        product:  this.model.product,
        image:    this.model.product.images[this.model.product.activeImageset][0],
        registry: this.model.attributes
      };

      return data;
    },
    renderTemplate: function() {
      if (this.model.get('success')){
        var templateHtml;
        if (this.model.get('noRegistry') === true){
          templateHtml = TEMPLATE.addToRegistryCreate();
        }else {
          templateHtml = TEMPLATE.addToRegistry(this.getViewData());
        }

        this.$el.html(templateHtml);

        this.$el.removeClass('hide');
        this.showMask();

        $('#mb-mask').on('click.mask', _.bind(function() {
          this.close();
        }, this));

        this.doAnalytics();

      } else if (this.model.get('REDIRECT')) {
        location.href = this.model.get('REDIRECT');
      } else {
        this.showMessage(this.model.get('errorMessage'));
      }

      // remove spinner from add to registry buttons
      $('.m-j-product-add-registry').removeClass('spinner');
    },

    errorHandler: function() {
      // remove spinner from add to registry buttons
      $('.m-j-product-add-registry').removeClass('spinner');
    },

    doAnalytics: function() {
      var prices = this.model.product.prices;
      var price = parseFloat(prices[ prices.length - 1].amt.replace('$', '')).toFixed(2);

      analytics.triggerTag({
        tagType: 'conversionEventTagRegistry',
        eventID: this.model.product.id,
        actionType: 2,
        categoryId: 'Add to Registry',
        points: this.model.product.activeQty,
        att3: price,
        att4: this.model.product.categoriesBreadcrumb,
        att5: this.model.product.name
      });
    },

    invoke: function(product) {
      this.model.product = product;

      this.model.addToRegistry({
        quantity: product.activeQty,
        productId: product.id,
        color: productColorName(product) || 'NA',
        size: productSizeName(product) || 'NA',
        type: productTypeName(product) || 'NA'
      });
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
      message = message || 'We\'re sorry. The item you selected has not been added to your registry. Please try again.';

      tooltip(
        $('.m-j-product-add-registry'),  // element: The swatch tapped
        message,                         // content
        0,                               // arrowPosition: No arrow
        0,                               // ttl (time-to-live): Stay on forever
        1                                // marginBottom
      );                                 // -ekever
    },
    close: function() {
      $('#mb-mask').off('click.mask');
      this.hide();
    }

  });

  return addToRegistryView;
});
