// [Compile .scss/.sass to .css and creates image sprite](https://github.com/gruntjs/grunt-contrib-compass)
module.exports = {
  options: {
    force: true,
    sassDir: '<%= brandSrc %>/src/styles/',
    cssDir: '<%= clientDest %>/styles/css/',
    imagesDir: '<%= brandSrc %>/src/images/',
    raw: 'generated_images_dir="<%= brandSrc %>/src/images/";http_generated_images_path="../../images"'
  },
  dev: {},
  dist: {
    options: {
      outputStyle: 'compressed'
    }
  }
};
