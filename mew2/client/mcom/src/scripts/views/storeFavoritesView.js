define([
  // Views
  'views/baseView',

  // Models
  'models/storeFavoritesModel',

  // utils
  'util/spinner',
  'jquery.dotdotdot'
], function(BaseView, StoreFavoritesModel, spinner) {
  'use strict';

  var MCOMStoreFavoritesView = BaseView.extend({
    events: {
      'click #m-j-favorite-stores-edit': 'startEditingFavorites',
      'click .m-j-favorite-stores-done': 'doneEditingFavorites',
      'click .mb-store-list.editing .mb-j-store-list-entry': 'removeFromFavorites'
    },

    init: function() {
      // model might be passed in
      if (!this.model) {
        this.model = new StoreFavoritesModel();
      }

      this.listenTo(this.model, 'modelready', this.render);

      if (this.model.hasFavorites()) {
        spinner.add(this.$el, 'white', 60);
        this.model.fetch();
      }
    },

    renderTemplate: function() {
      spinner.remove(this.$el);
      this.$el.html(TEMPLATE.storeFavorites(this.model.attributes));
      this.$('.mb-store-list .mb-j-store-list-entry .m-store-list-entry-name').dotdotdot();
    },

    startEditingFavorites: function() {
      this.$('#m-store-favorites').addClass('editing').find('.mb-store-list').addClass('editing');

      // Create an invisible mask over the search form area that will prevent interaction and trigger "done"
      var $intro = $('#m-stores-content .intro-text');
      var introHeight = $intro.height() + parseInt($intro.css('margin-top').replace('px', '')) + parseInt($intro.css('margin-bottom').replace('px', ''));

      var $search = $('#m-stores-content .m-stores-search-form');
      var searchHeight = $search.height() + parseInt($search.css('margin-top').replace('px', '')) + parseInt($search.css('margin-bottom').replace('px', ''));

      var height = introHeight + searchHeight;
      this.$('#m-j-mask').height(height + 'px').css('top', (-height) + 'px').show();
    },

    doneEditingFavorites: function() {
      this.$('#m-j-mask').hide();
      this.$('#m-store-favorites').removeClass('editing').find('.mb-store-list').removeClass('editing');
    },

    removeFromFavorites: function(e) {
      var $clicked = $(e.currentTarget);

      this.model.removeFavorite($clicked.data('location'));

      // Remove the item from display
      $clicked.remove();

      // If there are no more favorites, get rid of the section all together
      if (_.isEmpty(this.model._favorites)) {
        $('#mb-j-stores-favorites').remove();
      }
    }
  });

  return MCOMStoreFavoritesView;
});
