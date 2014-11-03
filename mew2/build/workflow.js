/* jshint evil: true*/
// Script added to index.html during dev build

// Adds LiveReload
document.write('<script src="http://' + window.location.hostname + ':35729/livereload.js?snipver=1"><\/script>');

// Adds weinre(web inspector remote) debugging at http://localhost:8082/client/#anonymous
// We currently use this to debug Android Browser
if (navigator.userAgent.indexOf('Android') !== -1) {
  document.write('<script src="http://' + window.location.hostname + ':8082/target/target-script-min.js#anonymous"><\/script>');
}
