/**
 * @file _routeOrder.js
 *
 * Specify the order of routes
 *
 * @see _core/_handlers
 */

define([
], function() {
  'use strict';

  var routeOrder = {
    '': 'home',
    'index.ognc': 'home',
    'shop/product(/)': 'product',
    'shop/product(/:productName)': 'product',
    'shop/featured/:brandName(/:facetKeys)(/:facetValues)': 'featured',
    'shop/gift-cards?id=1405(*moreQuery)': 'giftCards',
    'shop/shop-by-category?id=63482(*moreQuery)': 'shopByCategory',
    'shop/all-designers(/:categoryName)': 'brandIndex',
    'shop/all-designers:categoryString': 'brandIndex',
    'shop/all-brands/:categoryString': 'brandIndex',
    'shop/search(/:facetKeys)(/:facetValues)(?*querystring)': 'search',
    'shop/store': 'legacyStores',
    'shop/store/eventsearch': 'legacyStores',
    'shop/store/search(?*query)': 'stores',
    'store/index.ognc(?*query)': 'legacyStoreDetails',
    'store/event': 'legacyStoreDetails',
    'store/event/index.ognc(?*query)': 'legacyStoreDetails',
    'shop/store/detail(?locNo=*loc)': 'storeDetails',
    'catalog/index.ognc': 'category',
    'shop(/)?id=*id': 'category',
    'shop/:categoryString(/:facetKeys)(/:facetValues)': 'category',
    'shop/:parentCategoryName/:categoryString(/:facetKeys)(/:facetValues)': 'category',
    'buy/all-designers/:fob/:designerName(/:facetKeys)(/:facetValues)': 'buyFob',
    'buy/:designerName(/:facetKeys)(/:facetValues)': 'buy',
    'm/campaign/free-shipping/free-shipping-everyday': 'freeShip',
    'shop(/)': 'shop',
    '*actions': 'notFound'
  };

  return routeOrder;
});
