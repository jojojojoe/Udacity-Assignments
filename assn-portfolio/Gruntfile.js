module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            width: 1600,
            suffix: '_table',
            quality: 30
          },{
            width: 750,
            suffix: '_pad',
            quality: 30
          },
          {
            width: 500,
            suffix: '_phone',
            quality: 30
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'images_src/home/',
          dest: 'images/'
        }]
      }
    },
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);

};
