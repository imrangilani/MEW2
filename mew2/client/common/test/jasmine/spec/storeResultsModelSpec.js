define([
  'models/_storeResultsModel'
], function(StoreResultsModel) {
  'use strict';

  describe('_storeResultsModel', function() {
    var storeResultsModel;

    beforeEach(function() {
      storeResultsModel = new StoreResultsModel();
    });

    describe('#parse', function() {
      var sampleResponse;

      beforeEach(function() {
        sampleResponse = {
          stores: [
            {
              workingHours: [],
              timezoneOffset: -5
            }
          ]
        };
      });

      it('should return a response that contains information about whether the stores are open at the moment', function() {
        var now = new Date();
        sampleResponse.stores[0].workingHours.push({
          date: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
          storeopenhour: '10:00',
          storeclosehour: '21:00'
        });
        now.setDate(now.getDate() + 1);
        sampleResponse.stores[0].workingHours.push({
          date: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
          storeopenhour: '10:00',
          storeclosehour: '21:00'
        });
        var response = storeResultsModel.parse(sampleResponse);
        // FIX ME
        //expect(response.stores[0].isOpenNow).toBeDefined();
      });
    });

    describe('#isOpenNow', function() {
      var moment = require('moment');

      it('should be true if the store is currently open', function() {
        var date = new Date(),
            storeInfo = {
              workingHours: [
                {
                  date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
                  storeopenhour: '10:00',
                  storeclosehour: '21:00'
                }
              ],
              timezoneOffset: 0
            },
            storeShouldBeOpenOnThisTime = moment.utc(storeInfo.workingHours[0].date + ' ' + storeInfo.workingHours[0].storeopenhour, 'YYYY-MM-DD HH:mm').add('hour', -storeInfo.timezoneOffset).add('minute', 1);
        var isOpen = storeResultsModel.isOpenNow(storeInfo, storeShouldBeOpenOnThisTime);
        // FIX ME
        //expect(isOpen).toBeTruthy();
      });

      it('should be false if the store is NOT currently open', function() {
        var date = new Date(),
            storeInfo = {
              workingHours: [
                {
                  date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
                  storeopenhour: '14:00',
                  storeclosehour: '15:00'
                }
              ],
              timezoneOffset: 0
            },
            storeShouldBeClosedOnThisTime = moment.utc(storeInfo.workingHours[0].date + ' 08:00', 'YYYY-MM-DD HH:mm').add('hour', -storeInfo.timezoneOffset);
        var isOpen = storeResultsModel.isOpenNow(storeInfo, storeShouldBeClosedOnThisTime);
        // FIX ME
        //expect(isOpen).toBe(false);
      });

      it('should be undefined if no information for the working hours on current day is NOT provided', function() {
        var storeInfo = {
              workingHours: [
                {
                  date: '1999-01-01',
                  storeopenhour: '10:00',
                  storeclosehour: '21:00'
                }
              ],
              timezoneOffset: 0
            },
            timeToTest = moment();
        var isOpen = storeResultsModel.isOpenNow(storeInfo, timeToTest);
        expect(isOpen).toBeUndefined();
      });
    });
  });
});
