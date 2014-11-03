define([
  'jasmineHelpers',
  'models/_baseModel',
  'util/_localstorage'
], function(jasmineHelpers, BaseModel, $localStorage) {
  'use strict';

  describe('_baseModel', function() {
    jasmineHelpers.prepareAppGlobals();

    var baseModelInstance = new BaseModel();

    describe('#sync', function() {

      describe('when fetching a localStorage-enabled model/collection in a localStorage-enabled browser', function() {

        // Set up pretend model which is stored in local storage
        baseModelInstance.isStoredInLocalStorage = true;
        baseModelInstance.getKey = function() { return 'key'; };
        baseModelInstance.dataLifeSpan = 10000;
        baseModelInstance.isCrossDomain = true;

        describe('should call Backbone.sync', function() {

          var localStorageSuccess;

          it('if a resource is able to be stored in local storage but hasn\'t been received yet', function() {
            spyOn(Backbone, 'sync');
            baseModelInstance.sync('read', {}, {});
            expect(Backbone.sync).toHaveBeenCalled();
          });

          it('if a resource is stored in local storage, but has expired', function() {
            var options = {
              success: function() {}
            };
            $localStorage.set(baseModelInstance.getKey() + ':timestamp', '0');
            spyOn(Backbone, 'sync');
            baseModelInstance.sync('read', {}, options);
            expect(Backbone.sync).toHaveBeenCalled();
            localStorageSuccess = Backbone.sync.calls.mostRecent().args[2].success;
          });

          // it('and store the fetched data in localStorage', function() {
          //   spyOn($localStorage, 'set');
          //   localStorageSuccess();
          //   expect($localStorage.set.calls.mostRecent().args[0]).toBe('key:timestamp');
          // });
        });

        // it('should call the success function asynchronously if the resource is already stored in local storage', function(done) {
        //   var options = {
        //     success: function() {}
        //   };

        //   $localStorage.set(baseModelInstance.getKey() + ':timestamp', new Date().getTime());

        //   spyOn(Backbone, 'sync');
        //   spyOn(options, 'success');

        //   baseModelInstance.sync('read', {}, options);

        //   expect(Backbone.sync).not.toHaveBeenCalled();

        //   setTimeout(function() {
        //     expect(options.success).toHaveBeenCalled();
        //     done();
        //   }, 0);
        // });
      });
    });
  });
});
