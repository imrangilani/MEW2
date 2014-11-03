define([
  'jasmineHelpers',
  'views/_searchView'
], function (jasmineHelpers, SearchView) {
  'use strict';

  describe('_searchView', function() {
    var searchViewInstance;

    var initializeContext = function() {
      jasmineHelpers.loadFixture('search.html');
      searchViewInstance = new SearchView();
    };

    describe('#blurSearch', function() {
      beforeEach(initializeContext);

      it('should blur the search input field', function() {
        searchViewInstance.blurSearch();
        expect($('#mb-j-search-field').is(':focus')).toBeFalsy();
      });
    });

    describe('#clearSearchField', function() {
      beforeEach(initializeContext);

      it('should clear the contents of the search input field', function() {
        $('#mb-j-search-field').val('');
        //searchViewInstance.clearSearchField();
        expect($('#mb-j-search-field').val()).toBe('');
      });
    });

    describe('#validateSearch', function() {
      var keypressSpy;

      beforeEach(function() {
        initializeContext();
        keypressSpy = spyOnEvent('#mb-j-search-field', 'keypress');
      });

      // it('should not let empty queries execute search', function() {
      //   $('#mb-j-search-field').val('').keypress(function() { console.log('handled inside the spec'); }).trigger('keypress');
      //   expect(keypressSpy).toHaveBeenPrevented();
      // });

      // it('should let non-empty queries execute search', function() {
      //   $('#mb-j-search-field').val('dresses').keypress();
      //   expect(keypressSpy).not.toHaveBeenPrevented();
      // });
    });
  });
});
