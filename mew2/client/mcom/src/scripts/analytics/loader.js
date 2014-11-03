define([], function() {
  'use strict';
  
  var loader = {
    load: function(deferred, debug){
      this.deferred = deferred;
      [ {name: '/mew20/scripts/coremetrics/eluminate.js', notify: false},
        {name: '/mew20/scripts/coremetrics/cmcustom.js', notify: true}
      ].forEach(_.bind(function(file) {
        var script   = document.createElement("script");
        script.src   = file.name;
        script.async = false;
        
        script.onload = _.bind( function(){
          if( debug ){
            console.log("loaded " + file.name);
          }
          if( file.notify ){
            this.deferred.resolve();
          }
        }, this);
        
        document.body.appendChild(script);

      }, this ));
    }
  };

  return loader;
});


