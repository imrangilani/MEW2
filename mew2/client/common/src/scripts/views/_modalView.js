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
  'util/crossBrowserHeight',
  'util/util'
], function(BaseView, orientation, crossBrowserHeight, Util) {
  'use strict';

  var slideView = BaseView.extend({
    className: 'mb-modal-wrapper',

    // Animation time is larger than the CSS transition duration as the modal isn't fully off canvas at 500ms
    animationTime: 600,

    postInitialize: function() {
      BaseView.prototype.postInitialize.call(this, arguments);
      this.listenTo(orientation, 'orientationchange', function() {
        setTimeout(this.orientationChanged.bind(this), 200);
      });
    },

    // Provide default button classes for backing out of modal state
    events: {
      'click .mb-j-modalHeader-left': 'back',
      'click .mb-j-modalHeader-right': 'back',
      'click #continue-shopping': 'back',
      'focus select, input[type="text"], textarea': 'handleKeyboardOn',
      'blur select, input[type="text"], textarea': 'handleKeyboardOff'
    },

    handleKeyboardOn: function() {
      //If we have multiple controls on a modal then clicking on one will add Class
      //and on another one will remove Class, so plain toggleClass will not work.

      $('body').addClass('mb-fix-fixed');
    },
    handleKeyboardOff: function() {
      //If we have multiple controls on a modal then clicking on one will add Class
      //and on another one will remove Class, so plain toggleClass will not work.

      $('body').removeClass('mb-fix-fixed');
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

      // Used to determine if the view is animating during destruction in the hide method
      //Not sure if we need it now
      this.animatingIntoView = true;

      if (this.$el.hasClass('modal-level-1')) {
        this.scrollPosition = $(window).scrollTop();
      }

      //Modal cannot be shorter than the window
      this.$el.css('min-height',  crossBrowserHeight.height());

      if (this.$el.hasClass('modal-level-2')){
        //Without this line level 2 transition doesn't work. Mystery.
        $(window).scrollTop();
      }

      //Start transition
      //this.$el.addClass('modal-visible').one('webkitTransitionEnd', _.bind(this.endOfShow, this));
      setTimeout(function() {
          this.$el.addClass('modal-visible').one('webkitTransitionEnd', _.bind(this.endOfShow, this));
        }.bind(this), 700);
    },

    endOfShow: function(e) {
      //Now that transition is completed
      //we need to remove transform because on IOS transform changes behavior of fixed-positioned children (header)
      //and we need to make modal header fixed
      this.$el.css('transform',  'none');

      if (this.$el.hasClass('modal-level-1')) {
        //Shorten main content and move scrollbar to the top
        //Setting it to 0 will make browser header/footer to open, so we set it to window height
        $('#mb-page-wrapper').css('height',  crossBrowserHeight.height());
        $(window).scrollTop(0);
        //Sets overflow:hidden on #mb-page-wrapper
        $('body').addClass('modal-visible');
      }

      if (this.$el.hasClass('modal-level-2')) {
        //in case if modal 1 is smaller - make it invisible
        //We probably have multiple level 1 modals at the point that were previously opened
        //but they have set display:none
        $('.modal-level-1').not('[display="none"]').css({
          height:     '0',
          overflow:   'hidden',
          'min-height': ''
        });
      }

      //Replace position: fixed that was set during transition to avoid
      //vertical scroll but which disables window scroll that we need
      //TO DO: moved it down to after page height changes
      this.$el.css('position',  'absolute');
      /*
      Defect #22599
      Adding only for android since it is created an issue in ios8 (#26942)
      */
      if (Util.isAndroid()) {
        this.$el.css('overflow',  'scroll');
        this.$el.css('max-height',  '100%');
      }
      
      e.stopPropagation();
    },

    orientationChanged: function() {
      if (!this.shown) {
        return;
      }

      if (this.$el.hasClass('modal-level-1')) {
        $(window).scrollTop(0);
        this.$el.find('.mb-modal-content').scrollTop(0);
        this.$el.css('min-height',  crossBrowserHeight.height());

        $('#mb-page-wrapper').css('height',  crossBrowserHeight.height());
      }

      this.setHeights();
    },

    // Updates the modal height when it is first shown and when an orientation change occurs
    setHeights: function() {},

    // By default modal header buttons will go back in the browser history
    // with the expectation that the parent main content view
    // will perform the correct hiding action
    back: function() {
      window.history.back();
      return false;
    },

    // slides this displayed modal out of view
    hide: function() {
      //Used by mainContentView to figre out if any modals are displayed
      this.shown = false;

      var scrollPosition = $(window).scrollTop();
      var minHeight = crossBrowserHeight.height() + 'px';
      var $modalTooltip = $('.error-tooltip');

      //Remove absolute position (return to fixed) so we can modify page wrapper height without
      //causing repositioning of the modal. Setting margin-top compensates for change of height
      this.$el.css({ 'margin-top': (-1) * scrollPosition + 'px', position: '' });

      //Turning transition on will make fixed header disappear on iOS
      //so we change position to absolute and compensate for change of position
      //by setting a negative margin
      this.$el.find('.mb-modal-header').css({
        position:  'absolute',
        'margin-top': scrollPosition + 'px'
      });

      //Need to kill all modal tooltip when hiding it
      if ($modalTooltip) {
        $modalTooltip.remove();
      }

      // If this modal is level 1, restore the body height and page height
      if (this.$el.hasClass('modal-level-1')) {
        $('#mb-page-wrapper').css({ height:  '' });

        //Return the main content to its previous position
        //Scrolling window immediately without timeout
        //causes a flicker
        setTimeout(function() {
          $(window).scrollTop(this.scrollPosition);
          $('body').removeClass('modal-visible');
        }.bind(this), 100);
      }

      //If this is level 2
      if (this.$el.hasClass('modal-level-2')) {
        //We need to have some height on main content to avoid browser's header/footer
        //display on iOS - temporary until line 170
        $('#mb-page-wrapper').css({ height:  '' });
        //Restore height of level 1 that was opened before
        setTimeout(function() {
          $('.modal-level-1').not('[display="none"]').css({
            height:  '',
            'min-height': minHeight,
            overflow: ''
          });
        }.bind(this), 100);
      }

      setTimeout(function() {
        //Remove transform:none which was set to enable fixed header
        this.$el.css('transform',  '');

        //Start transition
        this.$el.removeClass('modal-visible');
        //Reset back to 0 main content
        if (this.$el.hasClass('modal-level-2')) {
          $('#mb-page-wrapper').css({ height:  crossBrowserHeight.height() });
        }
      }.bind(this), 100);

      //transitionEnd gets triggered too early, so we synchronize movements through
      setTimeout(function() {
        this.endOfHide();
      }.bind(this), 700);

    },

    endOfHide: function() {
      this.shown = false;
      //Modify attributes for storage
      this.$el.css({
        display: 'none',
        'min-height': '',
        'margin-top': '' });
      this.$el.find('.mb-modal-header').css({
        position:  '',
        'margin-top': ''
      });

      //If displayed content was error message - remove it and set the flag
      //so the parent view will reinitialize the modal if needed
      if (this.$el.find('#m-error-modal').length){
        this.$el.html('');
        this.failed = true;
      }
    },

    // Animates modal from bottom -> top rather than right -> left
    setSlideVerticalDirection: function() {
      this.$el.addClass('modal-vertical');
      this.vertical = true;
    }
  });

  return slideView;
});
