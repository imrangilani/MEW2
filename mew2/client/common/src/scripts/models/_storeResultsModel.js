define([
  // Utilities
  'util/util',
  'moment',

  // Models
  'models/baseModel'
], function(util, moment, BaseModel) {
  'use strict';

  var StoreResultsModel = BaseModel.extend({
    urlRoot: '/api/v2/store/detail',

    defaults: {
      requestParams: {
        latitude: null,
        longitude: null
      }
    },

    url: function() {
      var urlRoot = this.urlRoot,
          radius = this.get('radius') || App.config.stores.locatorRadius,
          maxNumberOfStores = App.config.stores.maxNumberOfStores,
          myLocalStoreNumber = this.get('localStoreNumber') || 0,
          queryString = '';

      if (myLocalStoreNumber) {
        urlRoot += '/' + myLocalStoreNumber;
      } else {
        queryString  = util.buildUrl(this.get('requestParams')) + '&radius=' + radius;
        queryString += (maxNumberOfStores ? '&numOfStores=' + maxNumberOfStores : '');
        queryString += this.prepareServicesFilterQueryString();
      }

      return urlRoot + queryString;
    },

    error: function(model, response) {
      if (response.status === 404) {
        model.trigger('processResultsError');
      }
      else {
        BaseModel.prototype.error.apply(this, arguments);
      }
    }
  });

  _.extend(StoreResultsModel.prototype, {
    prepareServicesFilterQueryString: function() {
      var queryString = '';

      var urlParams = this.get('urlParams');
      if (!_.isEmpty(urlParams)) {
        // browser key : wssg key
        var dataMap = {
          visitor: 'visitor_center',
          shopper: 'personal_shopper',
          furniture: 'furniture_gallery'
        };

        var values = _(urlParams)
          .keys()
          .map(function(key) {
            var value = (dataMap[key]) ? (dataMap[key]) : (key);
            return value.toUpperCase();
          })
          .value();

        queryString += '&filterby=' + values.join(',');
      }

      return queryString;
    },

    parse: function(response) {
      _.each(response.stores, _.bind(function(store) {
        store.timezoneOffset = StoreResultsModel.prototype.getTimezoneOffset.call(this, store);

        store.isOpenNow = StoreResultsModel.prototype.isOpenNow.call(this, store);
        if (typeof store.isOpenNow !== 'undefined') {
          store.hasWorkingHoursInfo = true;
        }

        delete store.timezone;
        delete store.workingHours;
        delete store.timezoneOffset;
      }, this));

      return response;
    },

    // Shift timezone offset based on daylight savings time
    getTimezoneOffset: function(store) {
      var now = moment();
      var isDST = now.isDST();

      var offset = store.timezoneOffset;

      var timezone = store.timezone;

      if (!timezone) {
        return offset;
      }

      var dst = timezone.slice(-2) === 'DT';

      if (offset) {
        switch (isDST) {
        case true:
          if (!dst) {
            offset++;
          }
          break;
        case false:
          if (dst) {
            offset--;
          }
          break;
        }

        return offset;
      }

      return 0;
    },

    isOpenNow: function(store, now) {
      // puts the current client local time "now" in the same timezone as the current store
      now = (now || moment.utc()).zone(-store.timezoneOffset);

      // gets the working hours information for the day/time of the client
      var workingHoursToday = _.find(store.workingHours, function(item) {
        var dayMatches = moment(item.date).isSame(now, 'day');
        if (dayMatches) {
          // creates a moment object at the tz of the store
          var storeOpen = item.date + ' ' + item.storeopenhour;
          var storeClose = item.date + ' ' + item.storeclosehour;
          item.storeOpensAt =  moment.utc(storeOpen, 'YYYY-MM-DD HH:mm').zone(-store.timezoneOffset).add('hours', -store.timezoneOffset);
          item.storeClosesAt = moment.utc(storeClose, 'YYYY-MM-DD HH:mm').zone(-store.timezoneOffset).add('hours', -store.timezoneOffset);
          return true;
        }
        return false;
      });

      if (!workingHoursToday) {
        return undefined;
      }

      // it's open if the client local time (in the timezone of the store) is between the
      // hours that the store opens and closes
      return now.isAfter(workingHoursToday.storeOpensAt) && now.isBefore(workingHoursToday.storeClosesAt);
    }
  });

  return StoreResultsModel;
});
