'use strict';

var gulp         = require('gulp');
var $            = require('gulp-load-plugins')();
var cleanCSS     = require('gulp-clean-css');
var inlinesource = require('gulp-inline-source');

var copyFiles = [
  'src/CacheBlocks.php',
  'src/api.php',
  'src/vendor/**/*',
  'src/media/**/*',
  'src/cache/**/*',
  'src/.htaccess',
  'src/favicon.ico'
];

gulp.task('lint', function() {
  return gulp.src('src/js/**/*.js')
             .pipe($.jshint())
             .pipe($.jshint.reporter($.stylish));
});

gulp.task('uglify', ['lint'], function() {
  gulp.src([
           'node_modules/ion-sound/js/ion.sound.js',
         ])
             .pipe($.concat('ion.sound.js'))
             .pipe(gulp.dest('dist/js'))
             .pipe($.uglify())
             .pipe(gulp.dest('dist/js'));

  return gulp.src([
           'node_modules/jquery/dist/jquery.js',
           'node_modules/js-cookie/src/js.cookie.js',
           'src/js/jquery.timeago.js',
           'src/js/app.js'
         ])
             .pipe($.concat('app.js'))
             .pipe(gulp.dest('dist/js'))
             .pipe($.uglify())
             .pipe(gulp.dest('dist/js'));

});

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('compass', ['images'], function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe($.compass({
      css: 'dist/css',
      sass: 'src/scss',
      image: 'dist/img',
    }))
    .pipe(gulp.dest('tmp'));
});

gulp.task('clean', ['compass', 'html'], function() {
  return gulp.src('dist/css/*.css')
    .pipe($.shorthand())
    .pipe(cleanCSS({
      debug: true
    }, function(details) {
      console.log(details.name + ': ' + details.stats.originalSize);
      console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('inline', ['clean'], function() {
  return gulp.src('dist/index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src('src/img/*')
        .pipe($.imagemin({
          progressive: true
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('copy', function() {
  return gulp.src(copyFiles, {base: 'src'})
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['uglify', 'inline', 'copy'], function() {
  gulp.watch(['src/js/**/*.js'], ['uglify', 'inline']);
  gulp.watch(['src/index.html', 'src/scss/**/*.scss'], ['inline']);
  gulp.watch(['src/img/*'], ['images']);
  gulp.watch(copyFiles, ['copy']);
});