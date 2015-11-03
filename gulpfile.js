var gulp = require('gulp'),
 
    // include plug-ins
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    del = require('del'),

    // paths for src files
    paths = {
        jade: 'frontend/templates/tocompile/**/*.jade',
        sass: 'frontend/sass/**/*.scss',
        js: 'frontend/js/**/*.js',
        images: 'frontend/images/**/*',
        fonts: 'frontend/fonts/**/*'
    },

    // error handling
    onError = function (err) {
        gutil.beep();
        console.log(err);
        this.emit('end');
    };


// ===========================
// Development tasks
// ===========================

// JS dev task
gulp.task('jsdev', function() {
    return gulp.src(paths.js)
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
        .pipe(gulp.dest('static/css/'));
});

// jade dev task
gulp.task('jadedev', function() {
    return gulp.src(paths.jade)
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('static/templates'));
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

// cleanup
gulp.task('pre-cleanup', function() {
    return del([
        'static/**/*',
        'rev-manifest.json'
    ]);
});

// jade prod task
gulp.task('jadeprod', ['pre-cleanup'], function() {
    return gulp.src(paths.jade)
        .pipe(jade())
        .pipe(gulp.dest('static/templates'));
});

gulp.task('rev-tmpl', ['jadeprod'], function() {
    return gulp.src('static/templates/partials/*.html')
        .pipe(rev())
        .pipe(gulp.dest('static/templates/partials'))
        .pipe(rev.manifest({
            base: 'static/',
            merge: true
        }))
        .pipe(gulp.dest('static/'));
});

gulp.task('rev-replace-tmpl', ['rev-tmpl'], function() {
    var manifest = gulp.src("./rev-manifest.json");

    return gulp.src('frontend/js/app.js')
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: ['.js']    
        }))
        .pipe(gulp.dest('frontend/js'));
});

// JS prod task
gulp.task('jsprod', ['pre-cleanup'], function() {
  return gulp.src(paths.js)
    .pipe(uglify({
        mangle: false
    }))
    .pipe(rev())
    .pipe(gulp.dest('static/js/'))
    .pipe(rev.manifest({
        base: 'static/',
        merge: true
    }))
    .pipe(gulp.dest('static/'));
});

// Sass prod task
gulp.task('sassprod', ['jsprod'], function () {
    var config = {};

    config.outputStyle = 'compressed';

    return gulp.src(paths.sass)
        .pipe(sass(config))
        .pipe(autoprefixer())
        .pipe(rev())
        .pipe(gulp.dest('static/css'))
        .pipe(rev.manifest({
            base: 'static/',
            merge: true
        }))
        .pipe(gulp.dest('static/'));
});

// rev replace task
gulp.task('revreplace', ['jsprod', 'sassprod', 'jadeprod'], function() {
    var manifest = gulp.src("./rev-manifest.json");

    return gulp.src(['frontend/templates/root_base.jade', 'frontend/templates/register.jade', 'static/js/'])
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: ['.jade', '.js']
        }))
        .pipe(gulp.dest('frontend/templates/'));
});

// Images prod task
gulp.task('imagesprod', ['pre-cleanup'], function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('static/images'))
});

// Fonts prod task
gulp.task('fontsprod', ['pre-cleanup'], function() {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('static/fonts'))
});


// ===========================
// Main tasks
// ===========================

// Rerun the task when a file changes
gulp.task('watch', ['sassdev', 'jsdev', 'jadedev', 'imagesdev', 'fontsdev'],  function() {
    gulp.watch(paths.sass, ['sassdev']);
    gulp.watch(paths.js, ['jsdev']);
    gulp.watch(paths.jade, ['jadedev']);
    gulp.watch(paths.images, ['imagesdev']);
    gulp.watch(paths.fonts, ['fontsdev']);
});

// start task
gulp.task('start', ['pre-cleanup', 'watch']);

// To prod task
gulp.task('toprod', ['pre-cleanup', 'jadeprod', 'rev-tmpl', 'rev-replace-tmpl', 'jsprod', 'sassprod', 'revreplace', 'imagesprod', 'fontsprod']);