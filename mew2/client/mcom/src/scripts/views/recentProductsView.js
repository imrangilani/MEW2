define([
	'views/_recentProductsView',
	'analytics/analyticsTrigger',
	'analytics/analyticsData'
], function(recentProductsView, analytics, analyticsData) {
	'use strict';
	var MCOMRecentProductsView = recentProductsView.extend({
		events: {
			'click #m-j-product-recently-viewed-edit':   'toggleEdit',
			'click .m-j-product-recently-viewed-remove': 'removeProduct',
			'click .m-product-recently-viewed-product':  'setCMProductSelectionContext',
			// preventDefault and stopPropagation of links when editing
			'click .editing a': function() { return false; }
		},

		postRender: function() {
			this.editing = false;

			this.recentProductsSwiper = $('#m-product-recently-viewed-swiper').swiper({
				// Default slide class was interfering with other swipers on PDP
				slideClass: 'm-product-recently-viewed-product',
				slidesPerView: 'auto',
				initialSlide: 0,
				autoResize: false,
				calculateHeight: true,
				onSlideClick: function(swiper) { this.slideIndex = swiper.clickedSlideIndex; }.bind(this)
			});

			this.$('.m-product-recently-viewed-name').dotdotdot();
		},

		toggleEdit: function() {
			this.editing = this.editing ? false : true;
			var text = this.editing ? 'done' : 'edit';
			this.$('#m-j-product-recently-viewed-edit').text(text).toggleClass('glow-red', this.editing);
			this.$('#m-product-recently-viewed-products').toggleClass('editing', this.editing);
			// QE wants active class added to remove button
			this.$('.m-j-product-recently-viewed-remove').toggleClass('active', this.editing);

			this.doEditRecentlyViewedAnalytics(this.editing);
		},

		doEditRecentlyViewedAnalytics: function(toEdit) {
			analytics.triggerTag({
        tagType: 'conversionEventTag',
        actionType: toEdit ? '1' : '2',
        categoryId: 'recently_viewed_panel_edit',
        points: '0'
	    });
		},

		removeProduct: function(e) {
			this.collection.remove($(e.target).data('product-id'));
			this.recentProductsSwiper.removeSlide(this.slideIndex);
			if (this.collection.size() <= 1) {
				this.remove();
			}
		},

		setCMProductSelectionContext: function(e) {
			var context = {};
			context[22] = this.options.parentView.getCMPanelType();
			context[23] = $(e.currentTarget).index('.m-product-recently-viewed-product') + 1;
			analyticsData.setCMProductSelectionContext(context);
			//These attributes should be empty for products displayed from Recently viewed
			analyticsData.setCMBrowseContext(null);
		}
	});
	return MCOMRecentProductsView;
});
