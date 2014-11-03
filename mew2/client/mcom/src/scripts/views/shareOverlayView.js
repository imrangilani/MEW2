define([
  'jquery',
  // Views
  'views/_shareOverlayView',
  'analytics/analyticsTrigger',
  'analytics/analyticsListener',
  'analytics/analyticsData'
], function($, ShareOverlayView, analytics, analyticsListener, analyticsData) {

  'use strict';

  var shareOverlayView = ShareOverlayView.extend({
    id: 'm-share-overlay',

    events:{
      'click .m-share-content-col': 'doShareAnalysis'
    },

    renderTemplate: function() {
      var html = TEMPLATE.shareOverlay(this.options);

      this.$el.html(html);

      this.$el.removeClass('hide');
      this.showMask();
    },

    postRender: function() {
      $('#mb-mask').on('click.mask', _.bind(function() {
        this.close();
      }, this));

      /**
      Adding the CLICK listener on CLOSE icon on overlay since the event is not working on _overlayView.js.
      This is a temporary fix.
      **/
      $('.mb-j-overlay-close').on('click', _.bind(function() {
        this.close();
      }, this));

      ShareOverlayView.prototype.postRender.call(this);
    },

    show: function() {
      ShareOverlayView.prototype.show.apply(this, arguments);
    },

    close: function() {
      $('#mb-mask').off('click.mask');
      this.hide();
    },

    doShareAnalysis: function(evt){
      var service = $(evt.target).closest('.m-share-content-col').attr('data-service');
      var elementID = 'share ' + service.toLowerCase();
      analytics.triggerTag({
        tagType: 'pageElementPDPTag',
        elementId: elementID,
        elementCategory: 'pdpshare',
        att8: this.options.id,
        att7: this.options.categoriesBreadcrumb
      });

    }
  });

  Handlebars.registerHelper('constructProductShareLink', function(product, type) {
    var $url = $.url();
    var urlPrefix = $url.attr('base');
    //var ios = util.isiOS();

    var fullShareUrl = 'url=' + urlPrefix + product.productUrl;
    if(type === 'pinterest'){

      var activeImageIdx = product.activeImageset;
      var activeImageSet = product.images[activeImageIdx];
      var activeImage = activeImageSet[0].image;

      fullShareUrl = fullShareUrl + '&cm_mmc=' + 'pinterest-_-pdpshare-_-n-_-n';
      fullShareUrl = fullShareUrl + '&media=' + App.config.paths.product.image + activeImage;
      fullShareUrl = fullShareUrl + '&description=' + product.name + " | macys.com";
    }else if(type === 'google'){
      fullShareUrl = fullShareUrl + '&cm_mmc=' + 'google_plus-_-pdpshare-_-n-_-n';
    }else if(type === 'twitter'){
      fullShareUrl = fullShareUrl + '&cm_mmc=' + 'twitter-_-pdpshare-_-n-_-n';
      fullShareUrl = fullShareUrl + 'original_referer=' + urlPrefix + product.productUrl;
      fullShareUrl = fullShareUrl + '&text=' + product.name + " @Macys";
    }else if(type === 'facebook'){
      fullShareUrl = fullShareUrl + '&cm_mmc=' + 'facebook-_-pdpshare-_-n-_-n';
    }

    return fullShareUrl;
  });
  return shareOverlayView;
});
