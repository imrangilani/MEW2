module.exports = {
  dist: {
    options: {
      mangle: false
    },
    files: {
      '<%= clientDest %>/scripts/coremetrics/cmcustom.js': ['<%= brandSrc %>/src/scripts/coremetrics/cmcustom.js']
    }
  }
};