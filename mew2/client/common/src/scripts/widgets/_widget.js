/**
 * @file _widget.js
 *
 * All widgets should extend this base object
 */

define([
  'views/baseView'
], function(BaseView) {
  'use strict';

  var Widget = BaseView.extend({
    init: function() {
      if (!this.template) {
        throw new Error('All widgets must specify a template');
      }

      if (this.className) {
        this.$el.addClass(this.className);
      }

      this.render();
    },

    render: function() {
      this.$el.append(this.template(this.options));
      return this;
    }
  });

  return Widget;
});
