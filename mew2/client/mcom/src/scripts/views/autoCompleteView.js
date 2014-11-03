define([
  // Views
  'views/_autoCompleteView',
  'analytics/analyticsData'
], function(AutoCompleteView, analyticsData) {
  'use strict';

  var MCOMAutoCompleteView = AutoCompleteView.extend({

    saveAutocompleteString: function(event){
      var str = $(event.currentTarget).data('kwac');
      analyticsData.setCMAutocompleteKeyword( str );
      AutoCompleteView.prototype.saveAutocompleteString.apply(this, arguments);
    }
  });
  return MCOMAutoCompleteView;
});
