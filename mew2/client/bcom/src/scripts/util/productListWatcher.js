define([
  'jquery',
  'underscore'
], function($, _) {
  'use strict';

  function ProductListWatcher(options) {
    this.currentItemId = null;
    this.productRows = [];
    this.updateHandler = -1;
    this.initialized = false;
    this.options = _.defaults(options, {
      updateDelay: 300 // milliseconds
    });
  }

  _.extend(ProductListWatcher.prototype, {
    update: function() {
      if (this.updateHandler !== -1) {
        clearTimeout(this.updateHandler);
      }

      this.updateHandler = setTimeout(_.bind(this.updateCurrentItem, this), this.options.updateDelay);
    },

    updateCurrentItem: function() {
      var scrollTop = $(window).scrollTop();

      this.currentItemId = 0;
      this.updateProductList();

      for (var i = 0; i < this.productRows.length; i++) {
        var product = this.productRows[i].items[0];

        if (product.offset.top + (product.height / 2) > scrollTop) {
          this.currentItemId = product.id;
          break;
        }
      }

      this.updateHandler = -1;
    },

    updateProductList: function() {
      var productRows = [];
      var options = this.options;
      var productRow;
      var $productContainer = $(this.options.containerSelector);

      if ($productContainer.length === 0) {
        return;
      }

      $productContainer.find(this.options.itemSelector).each(function() {
        var $this = $(this);
        var offset = $this.offset();

        if ((productRow === undefined) || (productRow.offsetTop !== offset.top)) {
          productRow = {
            offsetTop: offset.top,
            items: []
          };

          productRows.push(productRow);
        }

        productRow.items.push({
          id: $this.attr(options.itemIdAttrName),
          height: $this.height(),
          offset: offset
        });
      });

      this.productRows = productRows;
    },

    scrollToCurrent: function() {
      var scrollToTop;

      if (!this.currentItemId) {
        return;
      }

      this.updateProductList();

      for (var rowId = 0; (rowId < this.productRows.length) && (scrollToTop === undefined); rowId++) {
        var productRow = this.productRows[rowId];

        for (var colId = 0; colId < productRow.items.length; colId++) {
          if (productRow.items[colId].id === this.currentItemId) {
            scrollToTop = productRow.items[colId].offset.top;
            break;
          }
        }
      }

      if (scrollToTop !== undefined) {
        $(window).scrollTop(scrollToTop);
      }
    }

  });

  return ProductListWatcher;
});
