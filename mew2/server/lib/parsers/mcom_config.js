'use strict';

var config = {
  brand: 'mcom',
  onlineUid: 'macys_online_uid',
  categories: {
    options: {
      // do we allow categories that are hidden on the GN
      // to be deep-linked?
      allowDeepLinkIfNotMobilePublished: true
    },
    giftcards: 1405,
    beauty: 669,
    furniture: 29391
  },
  desktop: 'macys.com',
  images: {
    preset: {
      pdp: '$filtermed$',
      pdpZoom: '$filterlarge$'
    },
    width: {
      pdp: '400',
      pdpZoom: '1000'
    },
    pdp: {
      memberReplaceSwatch: true,
      forceDefaultColor: true,
      swatchSize: 46,
      swatchesPerSprite: 16,
      brand: 'MCY',
      selectSingleColor: false
    }
  },
  hours: {
    labelToday: 'Today',
    labelTomorrow: 'Tomorrow'
  },
  paths: {
    adMediaImgPath: 'http://assets.macys.com/dyn_img/site_ads/'
  },
  prices: {
    lowPricePrefix: '$',
    highPricePrefix: ''
  },
  products: {
    memberOfMasterBullets: 5000
  },
  facets: {
    bopsFacet: {
      displayName: 'Pick Up In-Store',
      position: 'first', // possible values: "first", "last"
    }
  },
  menus: {
    1405: {
      n: 'Gift Cards',
      u: '/shop/gift-cards?id=1405',
      p: 'shop',
      c: [30668]
    },
    top: {
      n: 'Menu',
      u: '/',
      c: ['shop', 'offers', 'my-account', 'my-wishlist', 'stores', 'registry', 'customer-service', 'more'],
      a: 'MENU'
    },
    shop: {
      n: 'Shop',
      p: 'top',
      v: 'y',
      c: [118, 1, 13247, 544, 23930, 26846, 669, 5991, 16904, 7495, 7497, 22672, 29391, 3536, 1405],
      a: 'SHOP'
    },
    'my-account': {
      n: 'My Account',
      p: 'top',
      u: '/account/myaccount',
      e: 1,
      s: 'y',
      a: 'MY ACCOUNT'
    },
    'my-wishlist': {
      n: 'My Wish Lists',
      p: 'top',
      u: '/wishlist/mylist',
      e: 1,
      a: 'MY WISHLIST'
    },
    stores: {
      n: 'Stores',
      p: 'top',
      u: '/shop/store/search',
      e: 1,
      a: 'STORES'
    },
    offers: {
      n: 'Offers',
      p: 'top',
      u: '/shop/coupons-deals',
      e: 1,
      a: 'OFFERS'
    },
    registry: {
      n: 'Registry',
      p: 'top',
      u: '/registry/wedding/registryhome',
      e: 1,
      s: 'y',
      a: 'REGISTRY'
    },
    'customer-service': {
      n: 'Customer Service',
      p: 'top',
      u: 'https://customerservice.macys.com/',
      e: 1,
      a: 'CUSTOMER SERVICE'
    },
    more: {
      n: 'More',
      p: 'top',
      v: 'y',
      c: ['catalog', 'legalpolicies'],
      a: 'MORE'
    },
    catalog: {
      n: 'Catalog',
      p: 'more',
      u: 'http://macys.circularhub.com/mobile/macys/postal?locale=en-US&type=1&cm_sp=mew_navigation-_-more-_-catalog',
      e: 1
    },
    legalpolicies: {
      n: 'Legal Policies',
      p: 'more',
      u: 'https://customerservice.macys.com/app/answers/list/c/15?cm_sp=mew_navigation-_-more-_-legal%20policies',
      e: 1
    }
  },
  mew10Routes: [
    '/shop/coupons-deals'
  ],
  mew10ProductPattern: [
  ],
  staticRoutes: []
};

module.exports = config;
