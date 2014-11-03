define([
  'util/spinner',
  'models/_productModel'
], function(Spinner, ProductModel) {
  'use strict';

  var MCOMProductModel = ProductModel.extend({

    initialize: function() {
      this.listenTo(Backbone, 'pdp:memberClicked', this.saveCurrentMember);
      this.listenTo(Backbone, 'pdp:loaded', this.checkMembers);
      this.listenTo(Backbone, 'pdp:clearMember', this.clearCurrentMember);
    },

    // TODO(ciro): move it to the view
    checkMembers: function() {
      var id = this.get('currentMemberID'),
          $el = $('#' + id);

      if ($el.length > 0) {
        setTimeout(function() {
          window.scrollTo(0, $('#' + id).offset().top);
          location.hash = '#' + id;
        }, 900);
      }
    },

    saveCurrentMember: function(id) {
      this.set('currentMemberID', id);
    },

    clearCurrentMember: function() {
      this.unset('currentMemberID', { silent: true });
    },

    // expected by Spinner.Model
    container: '#mb-j-content-container'
  });

  // Show spinner while content is loading
  _.extend(MCOMProductModel.prototype, Spinner.Model);

  return MCOMProductModel;
});
