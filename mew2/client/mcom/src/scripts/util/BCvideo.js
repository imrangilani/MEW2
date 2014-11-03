define([
  'jquery',
  'backbone',
  'config',
  'util/orientation'
], function ($, Backbone, config, orientation) {
  'use strict';

  var videoPlayer, experienceModule;


  require(['http://admin.brightcove.com/js/BrightcoveExperiences.js'], function() {
  });


  var BC =  {};

  _.extend(BC, Backbone.Events);
  _.extend(BC, {
    onTemplateReady: function(evt){
        var player = brightcove.api.getExperience(evt.target.experience.id);
        var APIModules = brightcove.api.modules.APIModules;
        BC.videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
        BC.experienceModule = player.getModule(APIModules.EXPERIENCE);

        Backbone.trigger('videoready');



    },
    play: function($container, videoId){
      var playerData = {
        'playerId' : App.config.video.playerId, //mobile
        'publisherId': App.config.video.publisherId,
        'videoId' : videoId };

      $container.append(TEMPLATE.videoObj(playerData));

      brightcove.createExperiences();

      this.listenTo(orientation, 'orientationchange', function() {
        BC.experienceModule.setSize( window.innerWidth, '280');
      });
    },
    pause: function(){
      BC.videoPlayer.pause();
    }
  });

  return BC;
});