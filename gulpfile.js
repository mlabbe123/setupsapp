    // include gulp
var gulp = require('gulp'),
 
    // include plug-ins
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    gulpconcat = require('gulp-concat'),
    jade = require('gulp-jade'),
    gzip = require('gulp-gzip'),
    sourcemaps = require('gulp-sourcemaps'),

    // paths for src files
    paths = {
        jade: 'frontend/templates/**/*.jade',
        sass: 'frontend/sass/**/*.scss',
        js: 'frontend/js/**/*.js',
        jstoconcat: ['frontend/js/lib/jquery-1.11.1.js', 'frontend/js/lib/respond.js', 'frontend/js/lib/modernizr.loadonly.js', 'frontend/js/common/app.modernizr.js']
    };
 
// jade dev task
gulp.task('jadedev', function() {
    gulp.src(paths.jade)
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('builds/development'));
});

// jade prod task
gulp.task('jadeprod', function() {
    gulp.src(paths.jade)
        .pipe(jade())
        .pipe(gzip())
        .pipe(gulp.dest('builds/production'));
});

// JS hint task
gulp.task('jshint', function() {
    gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// JS dev task
gulp.task('jsdev', function() {
    gulp.src([
            'frontend/js/lib/require.js',
            'frontend/js/lib/angular.min.js'        
        ])
        .pipe(gulp.dest('builds/development/js/lib/'));

    gulp.src([
            'frontend/js/require.config.js',
            'frontend/js/app.js',
            'frontend/js/controllers.js'
        ])
        .pipe(gulp.dest('builds/development/js/'));

    gulp.src(paths.jstoconcat)
        .pipe(sourcemaps.init())
            .pipe(gulpconcat('load.js'))
            .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('builds/development/js/'));
});

// JS prod task
gulp.task('jsprod', function() {
  gulp.src(paths.js)
    .pipe(uglify())
    .pipe(gulp.dest('builds/production/js/'));
});

// Sass dev task
gulp.task('sassdev', function () {
    var config = {};

    config.sourceComments = 'map';

    return gulp.src(paths.sass)
        .pipe(sass(config))
        .pipe(gulp.dest('builds/development/css'));   
});

// Sass prod dev
gulp.task('sassprod', function () {
    var config = {};

    config.outputStyle = 'compressed';

    return gulp.src(paths.sass)
        .pipe(sass(config))
        .pipe(gulp.dest('builds/production/css'));   
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.jade, ['jadedev']);
    gulp.watch(paths.sass, ['sassdev']);
    gulp.watch(paths.js, ['jsdev']);
});

// start task
gulp.task('start', ['watch' ,'jadedev', 'sassdev', 'jsdev']);

// To prod task
gulp.task('toprod', ['jadeprod', 'sassprod', 'jsprod']);