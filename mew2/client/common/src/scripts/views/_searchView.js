define([
  // Views
  'views/baseView',
  'toggleNav',

  'views/autoCompleteView',

  'url-parser'
], function(BaseView, toggleNav, AutoCompleteView) {
  'use strict';

  var searchView = BaseView.extend({

    el: '#mb-j-search-container',

    events: {
      'submit #mb-keyword-search-form':        'submitSearch',
      'input #mb-j-search-field':              'toggleSearchClearVisibility',
      'click #mb-j-search-clear':              'clearSearchField',
      'touchstart #mb-j-search-clear':         'clearSearchField',
      'touchstart #mb-page-content-container': 'blurSearch',
      'focus #mb-j-search-field':              'closeNavAndFocus'
    },

    init: function() {
      this.render();
    },

    closeNavAndFocus: function() {
      if ($('body').hasClass('nav-toggle')) {
        setTimeout(function() {
          $('#mb-j-search-field').focus();
        }, 250);
        toggleNav.toggle();
      }
    },

    renderTemplate: function() {
      // Populate with search phrase if exists
      var encoded = $.url().param('keyword'),
          searchPhrase = '';

      if (encoded) {
        // The MCOM requirement is to empty out search field when results are displayed
        // @TODO does this also apply to bcom? Also, I believe the requirement may change in the future
        // searchPhrase = decodeURIComponent(encoded)
      }

      this.$el.html(TEMPLATE.search({ searchPhrase: searchPhrase }));
    },

    // Assuming the sanitized search keys are valid, perform the search. Currently, redirect to 1.0 page, so allow default behavior.
    submitSearch: function() {
      var trimmedSearchTerms = $.trim($('#mb-j-search-field').val());

      if (trimmedSearchTerms.length === 0) {
        return false;
      }

      var redirect = 'shop/search?keyword=' + encodeURIComponent(trimmedSearchTerms);
      App.router.navigate(redirect, { trigger: true });

      if (this.subViews.autoCompleteView) {
        this.subViews.autoCompleteView.clearTimer();
      }

      this.doSearchAnalytics(trimmedSearchTerms);
      this.clearSearchField();
      this.blurSearch();

      return false;
    },

    doSearchAnalytics: function() {
    },

    // Toggles the display of the search clear icon "x" based on the presence of user-supplied search terms
    toggleSearchClearVisibility: function() {
      this.searchSubmit = false;
      var searchTerms = $('#mb-j-search-field').val();
      $('#mb-j-search-clear').toggleClass('hide', searchTerms === '');
      this.triggerAutoComplete(searchTerms);
    },

    clearSearchField: function() {
      $('#mb-j-search-field').val('');
      this.toggleSearchClearVisibility();
      if (this.subViews.autoCompleteView) {
        this.subViews.autoCompleteView.previousSuggestions = undefined;
        this.subViews.autoCompleteView.clearTimer();
      }
    },

    blurSearch: function() {
      $('#mb-j-search-field').blur();
    },

    triggerAutoComplete: function(searchTerm) {
      if (this.subViews.autoCompleteView) {
        this.subViews.autoCompleteView.clearTimer();
      }

      if (App.config.ENV_CONFIG.autocomplete !== 'off') {
        // Removing special characters and normalizing spaces
        searchTerm = searchTerm.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');

        // Trigger autocomplete only if the keyword is not empty and keyword length is more than 1
        if (searchTerm !== '' && searchTerm.length > 1) {
          if (!this.subViews.autoCompleteView) {
            this.subViews.autoCompleteView = new AutoCompleteView({ options: {
              prefix: searchTerm
            }});
          } else {
            // Set the model with the new keyword and trigger the fetch()
            this.subViews.autoCompleteView.model.get('requestParams').prefix = searchTerm;
            this.subViews.autoCompleteView.triggerFetch();
          }
        } else {
          if (this.subViews.autoCompleteView) {
            this.subViews.autoCompleteView.clearResults();
          }
        }
      }
    }

  });

  return searchView;
});
