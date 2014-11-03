define([
  'util/_renderSequenceHandler'
], function (RenderHandler) {
  'use strict';

  describe('_renderSequenceHandler', function () {
    var renderHandler;

    beforeEach(function () {
      renderHandler = new RenderHandler();
    });

    describe('#requestRender', function() {
      it('executes a function when there are no blocking functions', function () {
        var view = {};
        view.fn = function(){};

        spyOn(view, 'fn');
        renderHandler.requestRender( view.fn, view);

        expect(view.fn).toHaveBeenCalled();
      });

      it('does not execute a function when blocking function was called first', function () {
        var blockingView = {};
        blockingView.blockingFn = function(){};


        var view = {};
        view.fn = function(){};

        spyOn( view, 'fn');
        renderHandler.requestRender( blockingView.blockingFn, blockingView, true);
        renderHandler.requestRender( view.fn, view);

        expect(view.fn).not.toHaveBeenCalled();
      });

      it('executes a function after blocking function is completed when blocking function was called first and not before', function () {
        var blockingView = {};
        blockingView.blockingFn = function(){};


        var view = {};
        view.fn = function(){ };

        spyOn(view, 'fn');
        renderHandler.requestRender( blockingView.blockingFn, blockingView, true);
        renderHandler.requestRender( view.fn, view);
        expect(view.fn).not.toHaveBeenCalled();

        renderHandler.unblockRender();

        expect(view.fn).toHaveBeenCalled();
      });

      it('does not execute a function after multiple blocking functions are called and only one unblockRender called', function () {
        var blockingView = {};
        blockingView.blockingFn = function(){};

        var blockingViewToo = {};
        blockingViewToo.blockingFnToo = function(){};

        var view = {};
        view.fn = function() {};

        spyOn(view, 'fn');

        renderHandler.requestRender(blockingView.blockingFn, blockingView, true);
        renderHandler.requestRender(blockingViewToo.blockingFnToo, blockingViewToo, true);

        renderHandler.requestRender(view.fn, view);
        renderHandler.unblockRender();

        expect(view.fn).not.toHaveBeenCalled();
      });

      it('executes a function after multiple blocking functions are called and unblockRenderForce called', function () {
        var blockingView = {};
        blockingView.blockingFn = function() {};

        var maskView = {};
        maskView.blockingFnToo = function() {};

        var view = {};
        view.fn = function(){ };

        spyOn( view, 'fn');

        renderHandler.requestRender(blockingView.blockingFn, blockingView, true);
        renderHandler.requestRender(maskView.blockingFnToo, maskView, true);

        renderHandler.requestRender(view.fn, view);
        renderHandler.unblockRenderForce();

        expect(view.fn).toHaveBeenCalled();
      });
    });
  });
});
