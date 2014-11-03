define([
	'handlebars',
  // Views
  'views/baseView',
  'models/autoCompleteModel',
  'url-parser'
], function(Handlebars, BaseView, AutoCompleteModel) {
  'use strict';

  var autoCompleteView = BaseView.extend({
    el: '#mb-j-autocomplete-container',

    events:  {
      'click .mb-select-autocomplete': 'saveAutocompleteString'
    },

    init: function() {
      this.model = new AutoCompleteModel({ requestParams: { prefix: this.options.prefix }});
      this.listenTo(this.model, 'modelready', this.render);
      this.triggerFetch();
      this.model.set('errorHandler', 'ignoreAll');
    },

    clearTimer: function() {
      clearTimeout(this.timer);
      this.timer = -1;
    },

    clearResults: function() {
      $('#mb-j-autocomplete-container').html('');
    },

    triggerFetch: function() {
      this.clearTimer();

      this.timer = setTimeout(_.bind(function() {
        if (!this.searchSubmit) {
          if (this.previousSuggestions && this.previousSuggestions.prefix.length < this.model.get('requestParams').prefix.length) {
            if (this.previousSuggestions.SUGGESTION.length > 0) {
              this.model.fetch();
            }
          } else {
            this.model.fetch();
          }
        }
      }, this), App.config.search.autoCompletePulseRate);
    },

    renderError: function() {
      // intentionally left blank
    },

    saveAutocompleteString: function() {
      $('#mb-j-search-field').val('');
      $('#mb-j-search-clear').toggleClass('hide', true);
    },

    renderTemplate: function() {
      if (this.timer === -1) {
        return;
      }

      this.previousSuggestions = this.model.attributes;
      this.$el.html(TEMPLATE.autoComplete(this.model.attributes));
    }
  });

  Handlebars.registerHelper('autoCompleteList', function(searchSuggestion, prefix) {
    var matchRegex = new RegExp('\\b' + prefix.replace(/([()[\]{}*+.$^\\|?])/g, '\\$1'), 'gim');
    return new Handlebars.SafeString(searchSuggestion.replace(matchRegex, '<span class="match">$&</span>'));
  });

  return autoCompleteView;
});
