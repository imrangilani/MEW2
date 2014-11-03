define([
  // Utilities
  'util/multiValueCookie',
  'util/util',
  'config',

  // Views
  'views/baseView',
  'views/footerView',
  'views/confirmAddToWalletView'
], function(mvCookie, util, config, BaseView, FooterView, ConfirmAddToWalletView) {

  'use strict';

  var mainContentView = BaseView.extend({

    el: '#mb-j-content-container',

    postInitialize: function() {
      // Views can respond to the popstate event if there is a micro-state ie. an open modal
      // which needs to be closed when popstate occurs
      this.listenTo(Backbone, 'popstate', this.popstate);

      if (this.model) {
        this.listenTo(this.model, 'modelready', this.generateBrightTagEvent);
        this.listenTo(this.model, 'allDataAvailable', this.generateBrightTagEvent);
      } else {
        this.generateBrightTagEvent();
      }

      BaseView.prototype.postInitialize.apply(this, arguments);
    },

    postRender: function() {
      var view = this;
      view.rendered = true;

      // Add the footer
      var $contentContainer;
      if (this.el) {
        $contentContainer = $(this.el);
        var signedinCookie = mvCookie.get('SignedIn');

        var data = {
          authenticated: true,
          simple:        (this.viewName !== 'home'),
          signedIn:      (!!signedinCookie && signedinCookie !== '0') ? (true) : (false),
          ios:           /iphone|ipad|ipod/i.test(navigator.userAgent)
        };
        //$contentContainer.append(TEMPLATE.footer(data));
        this.postRenderFooterView(data);

        BaseView.prototype.postRender.apply(this);
      }

      // Check query param for adding offer from email
      var identifier = $.url().param('ocoffermsg');
      if (identifier) {
        identifier = identifier.replace(/\%/g, '%25').replace(/\+/g, '%20');
        this.subViews.confirmAddToWalletView = new ConfirmAddToWalletView({ options: { identifier: identifier }});
      }

      this.notifyRenderCompleted();
      this.checkBrowsersPrivateMode();

      //This cookie is also set in _globalEventsView on click,
      //but we're duplicating it here in case if it is a deep link url
      util.setForwardPageCookie(config.cookies.FORWARDPAGE_KEY.encode);
    },

    //If a view has this method it will be called here before triggering BrightTag event
    //which will notify BT that view got changed and they can trigger tags for this url
    //Assuming for now that bcom will load BT and setup data dictionary in some form,
    //otherwise will move it
    generateBrightTagEvent: function() {
      if (this.defineBTDataDictionary){
        this.defineBTDataDictionary();
      }
      //Trigger an event that Bright Tag is Listening to
      //it's too early for categories, the data that BT needs is not there yet
      $(window).trigger('newViewLoad');
    },

    back: function() {
      window.history.back();
    },

    close: function() {
      BaseView.prototype.close.call(this);
    },

    /**
     * Handles popstate events in case the Main Content View needs to animate child modal views
     * @param  {Object} event Push state event object
     */
    popstate: function(event) {
      //Get a modal opened by this view
      var shownModal = this.getShownModal();
      if (event.state && event.state.level) {
        if (event.state.level === 1) {
          //Means return to modal level 1
          this.popstateModalLevelOne(shownModal, event);
        } else if (event.state.level === 2 && shownModal) {
          //Means to open level 2
          this.popstateModalLevelTwo(shownModal, event);
        }
      } else if (shownModal) {
        //If no history and modal is shown - means close it
        shownModal.hide();
      }
    },

    //Invoked for modals level 1 - can be called by back and forward buttons
    popstateModalLevelOne: function(shownModal, event) {
      if (shownModal) {
        //if modal level 1 is shown
        var secondLevelModal = shownModal.getShownModal();
        //And level 2 is shown
        if (secondLevelModal){
          //We have to hide level 2 to display level 1
          secondLevelModal.hide();
        }
      } else {
        //Modal not shown - means to open modal level 1
        if (_.isFunction(this[event.state.modalShowFunction])) {
          this[event.state.modalShowFunction](event.state.e, true, event.state.modalShowData);
        }
      }
    },

    //Invoked for modal level 2 - can be called only by clicking forward button
    popstateModalLevelTwo: function(shownModal, event) {
      //Level 2 should be opened by level 1 modal
      if (_.isFunction(shownModal[event.state.modalShowFunction])){
        shownModal[event.state.modalShowFunction](event.state.e, true, event.state.modalShowData);
      }
    },

    /*
     * Method called when render is completed. Views can override it, and do custom
     * renderCompleted triggering.
     */
    notifyRenderCompleted: function() {
      Backbone.trigger('renderCompleted');
    },

    setPageTitle: function(title) {
      var $titleTag = $('head title');
      if (_.isEmpty($titleTag)) {
        $('head').prepend('<title></title>');
      }
      document.title = title;
    },

    setPageDesc: function(desc) {
      $('meta[name=description]').remove();
      $('title').after('<meta name="description" content="' + desc + '" />');
    },

    checkBrowsersPrivateMode: function() {
      var inPrivateMode = util.isInPrivateMode(),
          $privateContainer = $('#mb-private-browsing-container');

      $privateContainer.html(TEMPLATE.privateBrowsing()).toggle(inPrivateMode);
    },

    postRenderFooterView: function(data) {
      this.subViews.footerView = new FooterView({ options: data });
      this.$el.append(this.subViews.footerView.el);
    }
  });

  return mainContentView;
});
