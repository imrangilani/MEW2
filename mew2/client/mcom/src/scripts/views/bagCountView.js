define([
  // Views
  'views/_bagCountView'
], function(BagCountView) {
  'use strict';

  var MCOMBagCountView = BagCountView.extend({

    onBagCountChange: function() {
      BagCountView.prototype.onBagCountChange.apply(this, arguments);

      var bagItemsCount = this.model.get('bagItemsCount');

      if (bagItemsCount > 0) {
        //Render the circle and bag count number inside
        var canvas = document.getElementById('m-bag-count');
        if (canvas) {
          var context = canvas.getContext('2d');
          var strokeWidth = 2;
          var centerX = canvas.width / 2;
          var centerY = canvas.height / 2;
          var radius = canvas.width / 2 - strokeWidth - 1;

          context.beginPath();
          context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
          context.fillStyle = '#000';
          context.fill();
          context.lineWidth = strokeWidth;
          context.strokeStyle = '#aaa';
          context.stroke();
          context.closePath();

          if( bagItemsCount > 99){
            //Display 3 digits in a smaller font
            context.font = 'bold 13px Arial';
          }else{
            context.font = 'bold 16px Arial';
          }
          context.fillStyle = 'white';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(bagItemsCount, canvas.width / 2, canvas.height / 2);
        }
      }
    }

  });

  return MCOMBagCountView;
});
