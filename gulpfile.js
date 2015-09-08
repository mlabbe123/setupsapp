var gulp = require('gulp'),
 
    // include plug-ins
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer')

    // paths for src files
    paths = {
        jade: 'frontend/templates/tocompile/**/*.jade',
        sass: 'frontend/sass/**/*.scss',
        js: 'frontend/js/**/*.js',
        images: 'frontend/images/**/*',
        fonts: 'frontend/fonts/**/*'
    },

    onError = function (err) {
        gutil.beep();
        console.log(err);
        this.emit('end');
    };


// ===========================
// Development tasks
// ===========================
 
// jade dev task
gulp.task('jadedev', function() {
    gulp.src(paths.jade)
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('static/templates'));
});

// JS dev task
gulp.task('jsdev', function() {
    gulp.src(paths.js)
        .pipe(gulp.dest('static/js/'));
});

// Sass dev task
gulp.task('sassdev', function () {
    var config = {};

    config.sourceComments = 'map';

    return gulp.src(paths.sass)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sass(config))
        .pipe(autoprefixer())
        .pipe(plumber.stop())
        .pipe(gulp.dest('static/css'));
});

// Images dev task
gulp.task('imagesdev', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('static/images'))
});

// Fonts dev task
gulp.task('fontsdev', function() {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('static/fonts'))
});

// JS hint task
gulp.task('jshint', function() {
    gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


// ===========================
// Production tasks
// ===========================

// jade prod task
gulp.task('jadeprod', function() {
    gulp.src(paths.jade)
        .pipe(jade())
        .pipe(gulp.dest('static/templates'));
});

// JS prod task
gulp.task('jsprod', function() {
  gulp.src(paths.js)
    .pipe(uglify({
        mangle: false
    }))
    .pipe(gulp.dest('static/js/'));
});

// Sass prod task
gulp.task('sassprod', function () {
    var config = {};

    config.outputStyle = 'compressed';

    return gulp.src(paths.sass)
        .pipe(sass(config))
        .pipe(autoprefixer())
        .pipe(gulp.dest('static/css'));
});

// Images prod task
gulp.task('imagesprod', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('static/images'))
});

// Fonts prod task
gulp.task('fontsprod', function() {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('static/fonts'))
});


// ===========================
// Main tasks
// ===========================

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.jade, ['jadedev']);
    gulp.watch(paths.sass, ['sassdev']);
    gulp.watch(paths.js, ['jsdev']);
    gulp.watch(paths.images, ['imagesdev']);
    gulp.watch(paths.fonts, ['fontsdev']);
});

// start task
gulp.task('start', ['watch' ,'jadedev', 'sassdev', 'jsdev', 'imagesdev', 'fontsdev']);

// To prod task
gulp.task('toprod', ['jadeprod', 'sassprod', 'jsprod', 'imagesprod', 'fontsprod']);