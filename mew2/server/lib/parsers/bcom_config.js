'use strict';

var config = {
  brand: 'bcom',
  onlineUid: 'bloomingdales_online_ui',
  categories: {
    options: {
      // do we allow categories that are hidden on the GN
      // to be deep-linked?
      allowDeepLinkIfNotMobilePublished: true
    },
    giftcards: 3948,
    beauty: 2921,
    furniture: 2916
  },
  desktop: 'bloomingdales.com',
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
      swatchSize: 40,
      swatchesPerSprite: 16,
      brand: 'BLM',
      selectSingleColor: true
    }
  },
  paths: {
    adMediaImgPath: 'http://assets.bloomingdales.com/dyn_img/site_ads/'
  },
  prices: {
    lowPricePrefix: '$',
    highPricePrefix: '$'
  },
  products: {
    memberOfMasterBullets: 5
  },
  facets: {
    bopsFacet: {
      displayName: 'Pick up in store',
      position: 'last', // possible values: "first", "last"
    }
  },
  hours: {},
  menus: {
    top: {
      n: 'Menu',
      u: '/?cm_sp=NAVIGATION_MEW-_-TOP_NAV-_-MAINICON-n-n',
      c: ['shop', 'deals', 'stores', 'myAccount', 'myWallet', 'loyallist', 'registry']
    },
    shop: {
      n: 'Shop',
      p: 'top',
      v: 'y',
      c: [13668, 2910, 16961, 16958, 3376, 2921, 3864, 3866, 3865, 3948, 3977, 1001351]
    },
    deals: {
      n: 'Promotions',
      p: 'top',
      u: '/shop/sales-offers',
      e: 1,
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-OFFERS-n-n'
    },
    stores: {
      n: 'Stores',
      p: 'top',
      u: '/shop/store/search',
      e: 1,
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-STORESANDEVENTS-n-n'
    },
    myAccount: {
      n: 'My Account',
      p: 'top',
      u: '/account/myaccount',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-MYACCOUNT-n-n'
    },
    myWallet: {
      n: 'MY bWALLET',
      p: 'top',
      u: '/account/wallet?ocwallet=true',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-MY_WALLET-n-n'
    },
    loyallist: {
      n: 'My Loyallist',
      p: 'top',
      v: 'y',
      c: ['viewMyPoints', 'enroll']
    },
    viewMyPoints: {
      n: 'View My Points',
      p: 'loyallist',
      u: '/loyallist/accountsummary',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-MYLOYALLIST-VIEWMYPOINTS-n'
    },
    enroll: {
      n: 'Enroll',
      p: 'loyallist',
      u: '/loyallist',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-MYLOYALLIST-ENROLL-n'
    },
    registry: {
      n: 'The Registry',
      p: 'top',
      v: 'y',
      c: ['find', 'manage', 'create']
    },
    find: {
      n: 'Find',
      p: 'registry',
      u: '/registry/wedding/registrysearch',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-REGISTRY-FIND-n'
    },
    manage: {
      n: 'Manage',
      p: 'registry',
      u: '/registry/wedding/registrymanager',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-REGISTRY-MANAGE-n'
    },
    create: {
      n: 'Create',
      p: 'registry',
      u: '/registry/wedding/registrycaptureemail',
      e: 1,
      s: 'y',
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-REGISTRY-CREATE-n'
    },
    1001351: {
      n: 'ALL DESIGNERS',
      p: 'shop',
      u: '/shop/all-designers?id=1001351',
      e: 1,
      c: [],
      a: 'NAVIGATION_MEW-_-SIDE_NAV-_-SHOP-DESIGNERS-n'
    }
  },
  mew10Routes: [
    '/shop/sales-offers'
    // e-gift cards had to be manually put here as hapi (till 4.X.X) does not allow us to use the querystring
    // to determine a route - only the path is used by its router module
    // if hapi eventually allows the use of querystring params to specify routes, we can use
    // the e-giftcards CategoryID (3955) to send it to MEW 1.0
    // '/shop/product/e-gift-card-happy-birthday',
    // '/shop/product/e-gift-card-wedding',
    // '/shop/product/bloomingdalescom-e-gift-card',
    // '/shop/product/e-gift-card-thank-you',
    // '/shop/product/bloomingdales-shoppers-e-card',
    // '/shop/product/bloomingdales-cityscape-e-card',
    // '/shop/product/only-at-bloomingdales-e-gift-card-bloomingdales',
    // '/shop/product/only-at-bloomingdales-e-gift-card-shopping-girls',
    // '/shop/product/e-gift-card-store-front',
    // '/shop/product/e-gift-card-elevator-with-girl',
    // '/shop/product/e-gift-card-girls-in-dresses',
    // '/shop/product/e-gift-card-holiday-celebration',
    // '/shop/product/e-gift-card-latin-celebration',
    // '/shop/product/e-gift-card-newborn-celebration',
    // '/shop/product/e-gift-card-congratulations'
  ],
  mew10ProductPattern: [
  ],
  staticRoutes: [
    '/myloyallist',
    '/theregistry'
  ]
};

module.exports = config;
