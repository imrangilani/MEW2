/**
 * @file admediaGlobal.js
 *
 * V3 ad media parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var config = require('../config');

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param request {Object} the node request object
   * @param payload {Object} the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function (request, payload) {
    var response = { pools: []};

    for (var i = 0, len = payload.mediaPoolMapper.mediaPoolItem.length; i < len; i++) {

      var pool = {};

      var mediaPoolItem = payload.mediaPoolMapper.mediaPoolItem[i];
      pool.name = mediaPoolItem.poolName;

      pool.items = [];

      for( var j = 0, itemscount = mediaPoolItem.mediaItemMapper.mediaItem.length; j < itemscount; j++){

        var poolItem = {};

        var mediaItem = mediaPoolItem.mediaItemMapper.mediaItem[j];

        //It's possible to have no links associated with an image
        if( mediaItem.mediaLinkMapper ){
            //Mobile will NEVER have image maps, so we always use the first link
            //in the mapper
            poolItem.url = mediaItem.mediaLinkMapper.mediaLinkItem[0].fullLinkURL;
            //Text is used to be displayed as a category name for HP categories pool
            poolItem.text = mediaItem.mediaLinkMapper.mediaLinkItem[0].text;
        }

        poolItem.imageFileName = config.paths.adMediaImgPath + mediaItem.filename;
        poolItem.height = mediaItem.height;
        poolItem.width = mediaItem.width;
        poolItem.mediaType = mediaItem.mediaType;

        poolItem.altText = mediaItem.text;

        pool.items.push( poolItem);
      }

      response.pools.push( pool );
    }

    return response;
  }
};

module.exports = parser;
