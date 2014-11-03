/**
  ModalView Class

  This class provides methods to show and hide a modal. It will automatically update the modal height
  to fill the window when the modal is initially shown and when the user changes orientation.

  By inheriting from this class, you must render a template with the following DOM structure:

  <div class="mb-modal-header">
  </div>
  <div class="mb-modal-content">
  </div>

**/
define([
  // Views
  'views/baseView',
  'util/orientation',
  'util/crossBrowserHeight'
], function(BaseView, orientation, crossBrowserHeight) {
  'use strict';

  var modalView = BaseView.extend({
    className: 'mb-fixed-modal-wrapper',

    // Animation time is larger than the CSS transition duration as the modal isn't fully off canvas at 500ms
    animationTime: 600,

    postInitialize: function() {
      this.listenTo(orientation, 'orientationchange', this.setHeights);
      BaseView.prototype.postInitialize.call(this, arguments);
    },

    // Provide default button classes for backing out of modal state
    events: {
      'click .mb-j-modalHeader-left': 'back',
      'click .mb-j-modalHeader-right': 'back'
    },

    // Shows a modal
    show: function() {

      if (!this.elementInDOM()) {
        $('body').append(this.$el);
      }

      crossBrowserHeight.updateHeight();
      // Used by parent to determine if modal is currently shown
      this.shown = true;

      // Display:block's modal in case it was previously display:none'd when being closed
      this.$el.css('display', 'block');

      this.$el.find('.mb-modal-content').css('height', crossBrowserHeight.height() - parseInt( $(this.el).find('.mb-modal-header').css('height')));


      // Used to determine if the view is animating during destruction in the hide method
      this.animatingIntoView = true;

      if (this.$el.hasClass('modal-level-1')) {
        this.scrollPosition = $(window).scrollTop();
      }

      setTimeout( function(){
        this.$el.addClass('modal-visible');
      }.bind(this), 100);

      // After the modal animates
      setTimeout(function() {
        if (this.shown === true) {
          $('#mb-page-wrapper').css('height',  crossBrowserHeight.height());
        }

        this.animatingIntoView = false;
        $('body').addClass('modal-visible');

      }.bind(this), 600);

      var throttled = _.bind( _.throttle(function() {
        //Relative position is set when modal has a form and
        //user opens a virtual keybodard. In this case we don't need to resize
        // - browser does it for us
        if( this.$el.css('position') !== 'relative'){
          var headerHeight = this.$el.find('.mb-modal-header').css('height');
          if (headerHeight){
            var nh = crossBrowserHeight.height() - parseInt(this.$el.find('.mb-modal-header').css('height'));
            if (_.isNumber(nh)){
              this.$el.find('.mb-modal-content').css('height', nh);

              $('#mb-page-wrapper').css('height', crossBrowserHeight.height());
            }
          }
        }
      }, 200), this);

      $(window).on('resize.modal', throttled);
    },

    // Updates the modal height when it is first shown and when an orientation change occurs
    setHeights: function() {

      if (this.$el.hasClass('modal-visible')) {
        setTimeout(function() {
          this.$el.find('.mb-modal-content').css('height', (crossBrowserHeight.height() - parseInt( $(this.el).find('.mb-modal-header').height())));
        }.bind(this), 0);
      }
    },

    // By default modal header buttons will go back in the browser history
    // with the expectation that the parent main content view
    // will perform the correct hiding action
    back: function() {
      window.history.back();
    },

    // Hides a currently displayed modal
    hide: function() {
      this.shown = false;

      // If the modal currently being closed was the first opened, restore the body height and page height
      // so that user can scroll through all the content

      if (this.$el.hasClass('modal-level-1')) {
        $('#mb-page-wrapper').css({ 'height':  '' });
        $(window).off('resize.modal');
        $('body').removeClass('modal-visible');
        setTimeout(function() {
          $(window).scrollTop(this.scrollPosition);
        }.bind(this), 100);
      }

      this.$el.removeClass('modal-visible');
      this.shown = false;
      // Hide the modal once the animation is complete so that the user cannot scroll off the window
      // to reach the modal
      setTimeout(function() {
        // Don't hide the modal if the user shows the modal while closing it
        if (!this.animatingIntoView) {
          this.$el.css('display', 'none');
        }
      }.bind(this), 1000);
    },

    // Animates modal from bottom -> top rather than right -> left
    setSlideVerticalDirection: function() {
      this.$el.addClass('modal-vertical');
    }
  });

  return modalView;
});
