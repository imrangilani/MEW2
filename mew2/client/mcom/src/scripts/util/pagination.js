define([], function() {
  'use strict';

  var PRODUCTS_PER_PAGE = 24;
  var beforeDots = 3;
  var MAX_DISPLAYED = 5;
  var SKIP_TOKEN = '...';
  // Array to hold a list of dsiplay tokens
  var pageList = [];

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function pushPaginationToken(token, current) {
    if (isNumber(token)) {
      var page = {
        pageNumber: token,
        currentPage: current === token ? true : false
      };
      pageList.push(page);
    } else {
      pageList.push({ separator: token });
    }
  }

  var pagination = {
    prepare: function(totalproducts, currentpage) {
      var pages = {};
      pageList = [];

      // ensure passed-in values are numbers
      totalproducts = parseInt(totalproducts);
      currentpage = parseInt(currentpage);

      var totalpages = Math.floor(totalproducts / PRODUCTS_PER_PAGE);
      if (totalproducts%PRODUCTS_PER_PAGE !== 0) {
        ++totalpages;
      }

      if (currentpage > totalpages) {
        return;
      }

      if (totalpages > 1) {
        pushPaginationToken(1, currentpage);

        if (totalpages <= MAX_DISPLAYED) {
          for (var i = 2; i < totalpages; i++) {
            pushPaginationToken(i, currentpage);
          }
        // totalpages > MAX_DISPLAYED
        } else {
          if (currentpage > beforeDots) {
            pushPaginationToken(SKIP_TOKEN);

            if (currentpage > totalpages - beforeDots) {
              for (var j = totalpages - beforeDots; j < totalpages; j++) {
                pushPaginationToken(j, currentpage);
              }
            } else if (currentpage <= totalpages - beforeDots) {
              pushPaginationToken(currentpage - 1, currentpage);
              pushPaginationToken(currentpage, currentpage);
              pushPaginationToken(1 + parseInt(currentpage, 10), currentpage);
            }
          } else if (currentpage <= beforeDots) {
            for (var k = 2; k <= beforeDots + 1; k++) {
              pushPaginationToken(k, currentpage);
            }
          }

          if (currentpage < totalpages - 2) {
            pushPaginationToken(SKIP_TOKEN);
          }

        }
        pushPaginationToken(totalpages, currentpage);

      }
      pages.tokenList = pageList;
      pages.nextPage = currentpage < totalpages ? parseInt(currentpage) + 1 : 0;
      pages.previousPage = currentpage - 1;

      return pages;
    }
  };

  return pagination;
});
