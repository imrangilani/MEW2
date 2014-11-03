/* Preliminary design.
 *
 * Provides ability to sequence view rendering events and to run them only when a process
 * that requires rendering to be blocked (navigation) allows it.
 * The component is targeted for specific needs of navigation/mask/view interaction.
 * Views don't have to know who blocks rendering and when rendering is completed. But it's possible to provide
 * an interface for them to be notified if needed.
 * this component would live in the ViewController.
 * The same can be achieved with events listener instead of synch calls, but I think we've got too many events already.
 *
 * Scanario:
 * Navigation is being rendered - 'helper.requestRender ( nav.render, nav, blocking)'
 * User clicked on the menu item and browse view got the data and needs to be rendered (helper.requestRender( view, view.render) )
 * If navigation finishes first it has to call helper.unblockRender to allow view to render
 * If user touches the mask before navigation rendering is completed - mask has to call helper.unblockRenderForce
 * to ignore naviagation and to render the view
 *
 */
define( [], function(){
  'use strict';

  var wrapper = function( fn, context){
    return function(){
      fn.call( context);
    };
  };

  function RenderHandler(){
    this.renderQueue = [];
    this.block = {
        count: 0
      };
  }

  RenderHandler.prototype.requestRender = function( fn, context, blocking){
    if (typeof fn !== 'function') {
      return;
    }
    if (!this.block.count){
      fn.call( context);
      if( blocking){
        this.block.count++;
      }
    }
    else{
      if (!blocking){
        var fun = wrapper( fn, context);
        this.renderQueue.push( fun );
      }
      else{
        this.block.count++;
      }

    }
  };

  RenderHandler.prototype.unblockRender = function(){
    if( this.block.count > 0){
      this.block.count--;
    }

    if( this.block.count === 0){
      while( this.renderQueue.length){
        (this.renderQueue.shift())();
      }
    }
  };

  RenderHandler.prototype.unblockRenderForce = function(){
    this.block.count = 0;
    while( this.renderQueue.length){
      (this.renderQueue.shift())();
    }
  };

  return RenderHandler;
});