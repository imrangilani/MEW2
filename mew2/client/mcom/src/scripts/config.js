define([
], function() {
  'use strict';

  return {
    brand: 'mcom',
    nav_autoexpand: {
      catsplash: {
        default: 'show'
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
        image: 'http://slimages.macys.com/is/image/MCY/products/3/optimized/',
        swatch: 'http://slimages.macys.com/is/image/MCY/swatches/3/optimized/',
        sizeChart: 'http://assets.macys.com/dyn_img/size_charts/',
        swatchSprite: 'http://slimages.macys.com/is/image/MCY/'
      }
    },
    menus: {

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
        c: [118, 1, 13247, 544, 23930, 26846, 669, 5991, 16904, 7495, 7497, 22672, 29391, 3536],
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
      'customer-service': {
        n: 'Customer Service',
        p: 'top',
        u: 'https://customerservice.macys.com/',
        e: 1,
        a: 'CUSTOMER SERVICE'
      },
      registry: {
        n: 'Registry',
        p: 'top',
        u: '/registry/wedding/registryhome',
        e: 1,
        s: 'y',
        a: 'REGISTRY'
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
    pdp: {
      swatchWidth: '46',
      swatchesPerSprite: 16,
      recentlyViewedCount: 30
    },
    signIn: {
      experiences: {
        '1.0': {
          urls: {
            signIn: '/signin/index.ognc?cm_sp=mew_navigation-_-bottom_nav-_-sign_in',
            signOut: '/signin/signout.ognc?cm_sp=mew_navigation-_-bottom_nav-_-sign_in'
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
      onlineUid: 'macys_online_uid',
      FORWARDPAGE_KEY: {
        // should we encode the URL when setting the FORWARDPAGE_KEY cookie?
        encode: true
      }
    },
    zoom: {
      // image serving root path. If no domain is specified, the domain from which the viewer is served is applied
      serverUrl: 'http://slimages.macys.com/is/image',
      // path to the optimized zoomed images on the images server
      serverImagesPath: 'MCY/products/3/optimized/',
      // enables/disables the IconEffect on the viewer suggesting a suitable zoom gesture when the view is in reset state
      iconEffect: '0',
      // how many zoom in and zoom out actions are required to increase or decrease the resolution by a factor of two
      zoomStep: '3,1'
    },
    video: {
      playerId: '3613892853001', //mobile
      publisherId: '24953835001'
    },
    geolocation: {
      coordinates: {
        precision: 2
      }
    },
    mapsApi: {
      serverUrl: {
        nonproductionUrl: 'http://maps.googleapis.com/maps/api/js?key=$key$&sensor=false&v=3.14&libraries=places,geometry',
        productionUrl: 'http://maps.googleapis.com/maps/api/js?client=$key$&sensor=false&v=3.14&libraries=places,geometry&channel=MMEW'
      },
      timeout:    3000,
      zoomLevel:  15
    },
    stores: {
      locatorRadius: 100,
      maxNumberOfStores: 10,
      calendarProductId: 'm.macys.com',
      services: [
        { bridal: 'Wedding & Gift Registry' },
        { shopper: 'Personal Shopper' },
        { mattress: 'Mattresses' },
        { visitor: 'Visitor Services' },
        { furniture: 'Furniture Gallery' },
        { restaurant: 'Restaurants' }
      ]
    },
    search: {
      autoCompletePulseRate: 250,
      autoCompleteHost: {
        protocol: 'http://',
        subdomain: 'www.',
        path: '/suggester'
      }
    },
    BrightTag: {
      siteId: 'y1Kv3wY'
    },
    recommendations: {
      requester: 'MCOM-MMEW',
      context: 'PDP_ZONE_B',
      maxRecommendations: 10
    },
    countries: [
      { US: 'US' },
      { UK: 'UK' },
      { AU: 'Australia' },
      { JP: 'Japan' },
      { IT: 'Italy' },
      { FR: 'France' },
      { CN: 'China' },
      { EU: 'Europe' }
    ],
    states: [
      { AL: 'Alabama' },
      { AK: 'Alaska' },
      { AS: 'American Samoa' },
      { AZ: 'Arizona' },
      { AR: 'Arkansas' },
      { AA: 'Armed Forces Americas' },
      { AE: 'Armed Forces Europe' },
      { AP: 'Armed Forces Pacific' },
      { CA: 'California' },
      { CO: 'Colorado' },
      { CT: 'Connecticut' },
      { DE: 'Delaware' },
      { DC: 'District of Columbia' },
      { FM: 'Federated States of Micronesia' },
      { FL: 'Florida' },
      { GA: 'Georgia' },
      { GU: 'Guam' },
      { HI: 'Hawaii' },
      { ID: 'Idaho' },
      { IL: 'Illinois' },
      { IN: 'Indiana' },
      { IA: 'Iowa' },
      { KS: 'Kansas' },
      { KY: 'Kentucky' },
      { LA: 'Louisiana' },
      { ME: 'Maine' },
      { MH: 'Marshall Islands' },
      { MD: 'Maryland' },
      { MA: 'Massachusetts' },
      { MI: 'Michigan' },
      { MN: 'Minnesota' },
      { MS: 'Mississippi' },
      { MO: 'Missouri' },
      { MT: 'Montana' },
      { NE: 'Nebraska' },
      { NV: 'Nevada' },
      { NH: 'New Hampshire' },
      { NJ: 'New Jersey' },
      { NM: 'New Mexico' },
      { NY: 'New York' },
      { NC: 'North Carolina' },
      { ND: 'North Dakota' },
      { MP: 'Northern Mariana' },
      { OH: 'Ohio' },
      { OK: 'Oklahoma' },
      { OR: 'Oregon' },
      { PW: 'Palau' },
      { PA: 'Pennsylvania' },
      { PR: 'Puerto Rico' },
      { RI: 'Rhode Island' },
      { SC: 'South Carolina' },
      { SD: 'South Dakota' },
      { TN: 'Tennessee' },
      { TX: 'Texas' },
      { VI: 'U.S. Virgin Islands' },
      { UT: 'Utah' },
      { VT: 'Vermont' },
      { VA: 'Virginia' },
      { WA: 'Washington' },
      { WV: 'West Virginia' },
      { WI: 'Wisconsin' },
      { WY: 'Wyoming' }
    ],
    mew10Routes: [
      'shop/coupons-deals',
      'shop/gift-cards/all-occasions/(:facetKeys)(/:facetValues)(?*querystring)'
    ],
    mew10ProductPattern: [
    ],
    legacyUrls: ['womens', 'mens', 'beauty', 'juniors', 'kids', 'plus-sizes']
  };
});
