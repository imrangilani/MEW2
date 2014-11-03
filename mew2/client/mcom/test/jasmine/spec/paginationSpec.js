define([
  'util/pagination'
], function(paginator) {

  'use strict';

  describe('Paginator ', function() {

    beforeEach(function() {
      jasmine.addMatchers({
        toEqualArrayOfObjects: function() {
          return {
            compare: function(actual, expected) {
              var notEqual = false, result = {};

              if (actual.length !== expected.length) {
                result.pass = false;
                return result;
              }

              function compare(key, v) {
                var t = expected[i];
                if (t[key] !== v) {
                  notEqual = true;
                  return false;
                }
              }

              for (var i = 0, l = actual.length; i < l; i++) {
                $.each(actual[i], compare);

                if (notEqual) {
                  result.pass = false;
                  return result;
                }
              }

              result.pass = true;
              return result;
            }
          };
        }
      });
    });

    it('does not generate page numbers when fewer than 24 products in a set', function() {

      var pagination = paginator.prepare(23, 1);

      expect(pagination.tokenList.length).toEqual(0);
    });

    it('generates 3 page numbers when 60 products in a set and current page is 1', function() {

      var pagination = paginator.prepare(60, 1);

      expect(pagination.tokenList).toEqualArrayOfObjects([
        { pageNumber: 1, currentPage: true },
        { pageNumber: 2, currentPage: false },
        { pageNumber: 3, currentPage: false }
      ]);
      expect(pagination.previousPage).toEqual(0);
      expect(pagination.nextPage).toEqual(2);
    });

    it('generates 3 page numbers when 60 products in a set and current page is 3', function() {

      var pagination = paginator.prepare(60, 3);

      expect(pagination.tokenList).toEqualArrayOfObjects([
        { pageNumber: 1, currentPage: false },
        { pageNumber: 2, currentPage: false },
        { pageNumber: 3, currentPage: true }
      ]);
      expect(pagination.previousPage).toEqual(2);
      expect(pagination.nextPage).toEqual(0);
    });

    it('generates 1 ... 3 4 5 6 page numbers when  132 products in a set and current page is 4', function() {

      var pagination = paginator.prepare(132,  4);

      expect(pagination.tokenList).toEqualArrayOfObjects([
        { pageNumber: 1, currentPage: false },
        { separator: '...' },
        { pageNumber: 3, currentPage: false },
        { pageNumber: 4, currentPage: true },
        { pageNumber: 5, currentPage: false },
        { pageNumber: 6, currentPage: false }
      ]);
      expect(pagination.previousPage).toEqual(3);
      expect(pagination.nextPage).toEqual(5);
    });

    it('generates 1 2 3 4 … 6 page numbers when  132 products in a set and current page is 3', function() {

      var pagination = paginator.prepare(132,  3);

      expect(pagination.tokenList).toEqualArrayOfObjects([
        { pageNumber: 1, currentPage: false },
        { pageNumber: 2, currentPage: false },
        { pageNumber: 3, currentPage: true },
        { pageNumber: 4, currentPage: false },
        { separator: '...' },
        { pageNumber: 6, currentPage: false }
      ]);
      expect(pagination.previousPage).toEqual(2);
      expect(pagination.nextPage).toEqual(4);
    });

    it('generates 1 ... 5 6 7 … 10 page numbers when  235 products in a set and current page is 6', function() {

      var pagination = paginator.prepare(235,  6);

      expect(pagination.tokenList).toEqualArrayOfObjects([
        { pageNumber: 1, currentPage: false },
        { separator: '...' },
        { pageNumber: 5, currentPage: false },
        { pageNumber: 6, currentPage: true },
        { pageNumber: 7, currentPage: false },
        { separator: '...' },
        { pageNumber: 10, currentPage: false }
      ]);
      expect(pagination.previousPage).toEqual(5);
      expect(pagination.nextPage).toEqual(7);
    });
  });
});
