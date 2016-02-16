module.exports = function(grunt) {
    //grunt wrapper function 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
          //grunt task configuration will go here
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    './public/min-safe/js/static.js': ['./public/static/js/*.js','./public/static/js/*/*.js'],
                    './public/min-safe/js/vendors/all-vendors.js': ['./public/vendors/js/*.js', './public/vendors/js/modules/*.js'],
                    './public/min-safe/app.js': ['./public/static/js/app.js']
                }
            }
        },
        concat: {
            js: { //target
                src: [ './public/min-safe/app.js', './public/min-safe/js/*.js'],
                dest: './public/min/app.js'
            }, vendors: { //target
                src: [ './public/min-safe/js/vendors/*.js'],
                dest: './public/min/vendors.js'
            }, css :{
                //target
                src: ['./public/vendors/css/*.css', './public/static/css/*.css'],
                dest: './public/css/min/app.css'
            }
        },
        uglify: {
            js: { //target
                src: ['./public/min/app.js'],
                dest: './public/min/app.js'
            },vendors: { //target
                src: ['./public/min/vendors.js'],
                dest: './public/min/vendors.js'
            }
        },
        cssmin: {
             options: {
                shorthandCompacting: false,
                roundingPrecision: -1
              },
              target: {
                files: {
                  './public/min/app.css': ['./public/css/min/app.css']
                }
              }
        }

    });
    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    //register grunt default task
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify', 'cssmin']);
};