define([
  'underscore',
  'backbone',
  'analytics/bloomiesCoremetrics',
  'analytics/analyticsData',
  'util/multiValueCookie'
], function (_, Backbone, bloomiesCoremetrics, analyticsData, mvCookie) {
  'use strict';

  var listener = {
    initialize: function (){
      this.baseUrl = window.location.protocol + '//' + window.location.host + (window.location.port ? ':' + window.location.port : '');
      this.listenTo(Backbone, 'analytics', this.processAnalyticsTagEvent);

      // use Production vs Non-production coremetrics ID
      if (window.ENV_CONFIG.production === 'y' || window.ENV_CONFIG.production === 'Y') {
        cmSetClientID('90067797', false, 'www3.bloomingdales.com', 'bloomingdales.com');
      } else {
        cmSetClientID('60067797', false, 'testdata.coremetrics.com', 'bloomingdales.com');
      }
    },

    // Redirects processing event based on tag.tagType
    processAnalyticsTagEvent: function(tag) {
      // All tag processing function names follow the pattern: 'process' + tagName
      var name = 'process' + tag.tagType.charAt(0).toUpperCase() + tag.tagType.substring(1);
      // Invoke the function and pass parameters
      var invokee = this[name];
      if (invokee) {
        invokee.call(this, tag);
      } else {
        console.log('Tried to invoke invalid tag: ' + tag.tagType);
      }
    },

    processRegistrationTag: function(tag) {
      bloomiesCoremetrics.createRegistrationTag(tag.email, tag.city, tag.state, tag.zip, tag.gender, tag.newsletterName, tag.isSubscribed);
    },

    processPageElementTag: function(tag) {
      var attributes = this.fillElementExploreAttributes(tag.attributes);
      bloomiesCoremetrics.cmCreatePageElementTag(tag.elementId, tag.elementCategory, attributes.toString());
    },

    processPageViewTag: function(tag) {
      var attributes = this.fillPageviewExploreAttributes(_.defaults(tag.attributes || {}, this.getABTestingExploreAttributes())),
          referralURL = document.referrer;

      // sets the referralURL (rf) to the previous route, if there is one
      var previousRoute = App.router.getRouteHistory(-1);
      if (previousRoute) {
        referralURL = this.baseUrl + previousRoute.$url.attr('relative');
      }
      // throws a manual page view tag (instead of a page view) so we can provide the referralURL (rf) parameter manually
      bloomiesCoremetrics.cmCreateManualPageviewTag(tag.pageId, tag.categoryId, tag.searchString || '', _.isUndefined(tag.searchResults) ? '' : tag.searchResults, referralURL, attributes.toString());
    },

    processProductViewTag: function(tag) {
      var attributes = this.fillPdpExploreAttributes(_.defaults(tag.attributes || {}, this.getABTestingExploreAttributes()));
      bloomiesCoremetrics.cmCreateProductviewTag(tag.productId, tag.productName, tag.categoryId, attributes.toString());
    },

    processConversionEventTag: function(tag) {
      var attributes = this.fillConversionExploreAttributes(tag.attributes);
      bloomiesCoremetrics.cmCreateConversionEventTag(tag.eventId, tag.eventType, tag.categoryId, tag.points, attributes.toString());
    },

    processTechPropertiesTag: function(tag) {
      var attributes = new bloomiesCoremetrics.exploreAttributes(_.defaults(tag.attributes || {}, this.getABTestingExploreAttributes()));
      bloomiesCoremetrics.cmCreateTechPropsTag(tag.pageId, tag.categoryId, attributes.toString());
    },

    processAddToBag: function(tag) {
      var attributes = this.fillPdpExploreAttributes(tag.attributes);
      bloomiesCoremetrics.cmCreatePageviewTag(analyticsData.getCMPageId(), analyticsData.getCMPanelType(), '', '');
      bloomiesCoremetrics.cmCreateShopAction5Tag(tag.productId, tag.productName, tag.productQuantity, tag.productPrice, tag.categoryId, tag.masterProductId, attributes.toString());
    },

    processAddToRegistry: function(tag) {
      bloomiesCoremetrics.cmCreatePageviewTag('Add_to_Registry_BWEDD', tag.categoryId, '', '');
      bloomiesCoremetrics.cmCreateConversionEventTag(tag.productId, 'conversion_complete', 'Item added to Registry', tag.productQuantity, new bloomiesCoremetrics.exploreAttributes(tag.attributes).toString());
    },

    fillConversionExploreAttributes: function(attributes) {
      attributes = new bloomiesCoremetrics.exploreAttributes(attributes || {});

      // TODO: check the need to fill other attributes according to Mingle #1442
      return attributes;
    },

    fillElementExploreAttributes: function(attrs) {
      attrs = attrs || {};
      var attributes = new bloomiesCoremetrics.exploreAttributes(attrs);

      // Element Attribute Field 2: Page this event took place on
      var pageId = analyticsData.getCMPageId();
      if (pageId && !attrs['2']) {
        attributes.add({
          2: pageId
        });
      }

      // Element Attribute Field 5: Apollo Keyword
      var searchKeyword = analyticsData.getCMSearchKeyword();
      if (searchKeyword && !attrs['5']) {
        attributes.add({
          5: searchKeyword
        });
      }

      return attributes;
    },

    fillPageviewExploreAttributes: function(attributes) {
      var signedinCookie = mvCookie.get('SignedIn');

      attributes = new bloomiesCoremetrics.exploreAttributes(attributes || {});

      // Add signed in status
      attributes.add({
        10: (!!signedinCookie && signedinCookie !== '0') ? 'signed in' : 'guest'
      });

      return attributes;
    },

    fillPdpExploreAttributes: function(attributes) {
      var productSelectionContext = analyticsData.getCMProductSelectionContext(),
          productSelectionPosition = analyticsData.getCMProductSelectionPosition(),
          browseContext = analyticsData.getCMBrowseContext(),
          searchKeyword = analyticsData.getCMSearchKeyword(),
          autocompleteKeyword = analyticsData.getCMAutocompleteKeyword(),
          shopByBrandFlow = analyticsData.getCMShopByBrandFlow(),
          signedinCookie = mvCookie.get('SignedIn');

      attributes = new bloomiesCoremetrics.exploreAttributes(attributes || {});

      // if available, includes data regarding how was the context of the app when this product was selected
      // can be set by facets, recently viewed, product recommendations
      if (productSelectionContext) {
        attributes.add(productSelectionContext);
      }

      // gets browse page and search page context attributes
      // set by browse and search results views
      if (browseContext) {
        attributes.add({
          14: browseContext.totalProducts
        });
      }

      // if available, includes the position in the set of products from which the product was clicked from
      if (productSelectionPosition) {
        attributes.add({
          20: productSelectionPosition
        });
      }

      // search keyword that led the user into the current view
      if (searchKeyword) {
        attributes.add({
          29: (!!autocompleteKeyword ? ('Autocomplete: ' + searchKeyword + ' | ac: ' + autocompleteKeyword) : searchKeyword)
        });
      }

      if (shopByBrandFlow) {
        attributes.add({
          31: 'Shop by Brand'
        });
      }

      // Add signed in status
      attributes.add({
        38: (!!signedinCookie && signedinCookie !== '0') ? 'signed in' : 'guest'
      });

      return attributes;
    },

    getABTestingExploreAttributes: function() {
      var mobileLottery = mvCookie.get('m_sl');
      if (window.ENV_CONFIG.abtesting_softlaunch &&
        window.ENV_CONFIG.abtesting_softlaunch.toLowerCase() === 'on') {
        return {
          12: 'Mew2 New:' + (!!mobileLottery ? 'B' : 'None')
        };
      }
      return {};
    }
  };

  _.extend(listener, Backbone.Events);
  listener.initialize();

  return listener;
});
