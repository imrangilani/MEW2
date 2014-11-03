/**
 * @file _characterCount.js
 *
 * Display a character count for a given text input
 */

define([
  'widgets/widget'
], function(Widget) {
  'use strict';

  var CharacterCount = Widget.extend({
    template: TEMPLATE.characterCountWidget,

    init: function() {
      if (!this.options.$display) {
        throw new Error('Character count widget expects $display option, indicating where to display the character count');
      }

      Widget.prototype.init.apply(this, arguments);
    },

    render: function() {
      return this;
    },

    events: {
      'keyup textarea,input': 'updateCharacterCount'
    },

    updateCharacterCount: function(e) {
      var characterCount = $(e.currentTarget).val().length;
      this.options.$display.html(this.template({ characterCount: characterCount }));
    }
  });

  return CharacterCount;
});
