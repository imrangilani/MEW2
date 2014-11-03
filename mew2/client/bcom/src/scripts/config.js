define([
], function() {
  'use strict';

  return {
    brand: 'bcom',
    nav_autoexpand: {
      catsplash: {
        default: 'hide'
      }
    },
    localStorage: {
      // Versions localStorage, should be updated when endpoint data format changes
      storageversion: '1',
      // Array of keys which will be saved when a reset occurs due to the quota being exceeded
      savedKeys: ['catIndex']
    },
    paths: {
      product: {
        image: 'http://images.bloomingdales.com/is/image/BLM/products/3/optimized/',
        swatch: 'http://images.bloomingdales.com/is/image/BLM/swatches/3/optimized/',
        sizeChart: 'http://assets.bloomingdales.com/dyn_img/size_charts/',
        swatchSprite: 'http://images.bloomingdales.com/is/image/BLM/',
        imageClarity: '&qlt=90,0&layer=comp&op_sharpen=0&resMode=sharp2&op_usm=0.7,1.0,0.5,0&fmt=jpeg'
      },
      rightnowUrl: 'https://customerservice.bloomingdales.com'
    },
    pdp: {
      recentlyViewedCount: 10,
      swatchWidth: '40',
      swatchesPerSprite: 16
    },
    signIn: {
      experiences: {
        '1.0': {
          urls: {
            signIn: '/signin/index.ognc',
            signOut: '/signin/signout.ognc'
          }
        },
        '2.0': {
          urls: {
            signIn: '/account/signin',
            signOut: ''
          }
        }
      }
    },
    cookies: {
      onlineUid: 'bloomingdales_online_uid',
      FORWARDPAGE_KEY: {
        // should we encode the URL when setting the FORWARDPAGE_KEY cookie?
        encode: false
      }
    },
    zoom: {
      // image serving root path. If no domain is specified, the domain from which the viewer is served is applied
      serverUrl: 'http://images.bloomingdales.com/is/image',
      // path to the optimized zoomed images on the images server
      serverImagesPath: 'BLM/products/3/optimized/',
      // enables/disables the IconEffect on the viewer suggesting a suitable zoom gesture when the view is in reset state
      iconEffect: '0',
      // how many zoom in and zoom out actions are required to increase or decrease the resolution by a factor of two
      zoomStep: '3,1'
    },
    geolocation: {
      coordinates: {
        precision: 2
      }
    },
    mapsApi: {
      serverUrl: {
        nonproductionUrl: 'http://maps.googleapis.com/maps/api/js?key=$key$&sensor=false&v=3.14&libraries=places,geometry',
        productionUrl: 'http://maps.googleapis.com/maps/api/js?client=$key$&sensor=false&v=3.14&libraries=places,geometry&channel=BMEW'
      },
      timeout: 3000,
      zoomLevel: 15
    },
    stores: {
      locatorRadius: 250,
      maxNumberOfStores: 0,
      services: [
        {'mattress': 'Mattress'},
        {'wifi' : 'Wifi'},
        {'studio' : 'Studio Services'},
        {'visitor': 'Visitor Services'},
        {'restaurant': 'Restaurant'},
        {'outlet' : 'Outlet'},
        {'shopper': 'Personal Shopper'},
        {'bridal': 'Wedding & Gift Registry'},
        {'furniture' : 'Furniture'},
        {'bops': 'Bops'}
      ],
      calendarProductId: 'm.bloomingdales.com'
    },
    search: {
      autoCompletePulseRate: 500,
      autoCompleteHost: {
        protocol: 'http://',
        subdomain: 'www.',
        path: '/suggester'
      }
    },
    BrightTag: {
      siteId: 'nl6o4FJ'
    },
    recommendations: {
      requester: 'BCOM-BMEW',
      context: 'PDP_ZONE_A',
      maxRecommendations: 6
    },
    countries: [
      { 'US': 'US'},
      { 'UK': 'UK'},
      { 'AU': 'Australia'},
      { 'JP': 'Japan'},
      { 'IT': 'Italy'},
      { 'FR': 'France'},
      { 'CN': 'China'},
      { 'EU': 'Europe'}
    ],
    states: [
      {'AL' : 'Alabama'},
      {'AK' : 'Alaska'},
      {'AZ' : 'Arizona'},
      {'AR' : 'Arkansas'},
      {'CA' : 'California'},
      {'CO' : 'Colorado'},
      {'CT' : 'Connecticut'},
      {'DE' : 'Delaware'},
      {'DC' : 'District of Columbia'},
      {'FL' : 'Florida'},
      {'GA' : 'Georgia'},
      {'HI' : 'Hawaii'},
      {'ID' : 'Idaho'},
      {'IL' : 'Illinois'},
      {'IN' : 'Indiana'},
      {'IA' : 'Iowa'},
      {'KS' : 'Kansas'},
      {'KY' : 'Kentucky'},
      {'LA' : 'Louisiana'},
      {'ME' : 'Maine'},
      {'MD' : 'Maryland'},
      {'MA' : 'Massachusetts'},
      {'MI' : 'Michigan'},
      {'MN' : 'Minnesota'},
      {'MS' : 'Mississippi'},
      {'MO' : 'Missouri'},
      {'MT' : 'Montana'},
      {'NE' : 'Nebraska'},
      {'NV' : 'Nevada'},
      {'NH' : 'New Hampshire'},
      {'NJ' : 'New Jersey'},
      {'NM' : 'New Mexico'},
      {'NY' : 'New York'},
      {'NC' : 'North Carolina'},
      {'ND' : 'North Dakota'},
      {'OH' : 'Ohio'},
      {'OK' : 'Oklahoma'},
      {'OR' : 'Oregon'},
      {'PA' : 'Pennsylvania'},
      {'RI' : 'Rhode Island'},
      {'SC' : 'South Carolina'},
      {'SD' : 'South Dakota'},
      {'TN' : 'Tennessee'},
      {'TX' : 'Texas'},
      {'UT' : 'Utah'},
      {'VT' : 'Vermont'},
      {'VA' : 'Virginia'},
      {'WA' : 'Washington'},
      {'WV' : 'West Virginia'},
      {'WI' : 'Wisconsin'},
      {'WY' : 'Wyoming'}
    ],
    mew10Routes: [
      'shop/sales-offers',
      'shop/tabletop-builder/set-your-table'
    ],
    mew10ProductPattern: [
      'gift-card',
      'e-gift-card',
      '-e-card',
      '/e-card'
    ],
    products: {
      giftCard: {
        urlPatterns: [
          'e-gift-card',
          '-e-card',
          '/e-card'
        ]
      }
    },
    fobs: {
      urlMap: {
        'jewelry-accessories': 'Jewelry & Accessories'
      }
    },
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
        c: [13668, 2910, 16961, 16958, 3376, 2921, 3864, 3866, 3865, 3948, 3977]
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
      }
    },
    legacyUrls: []
  };
});
