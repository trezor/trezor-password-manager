var gulp = require('gulp'),
  sass = require('gulp-sass'),
  connect = require('gulp-connect'),
  uglify = require('gulp-uglifyes'),
  cleanCSS = require('gulp-clean-css'),
  sourcemaps = require('gulp-sourcemaps'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  browserify = require('browserify');

gulp.task('sass', function() {
  gulp
    .src('./source/app/style.scss')
    .pipe(sass())
    .pipe(gulp.dest('./extension/dist/'))
    .pipe(connect.reload());
});

gulp.task('dev-app', () => {
  var bundler = browserify({
    entries: ['./source/app/index.js'],
    debug: true
  }).transform(babelify, { presets: ['es2015', 'react'] });
  return bundler
    .bundle()
    .on('error', err => {
      console.log(err.message);
    })
    .pipe(source('app.js'))
    .pipe(gulp.dest('./extension/dist/'))
});

gulp.task('dev-bg', () => {
  var bundler = browserify({
    entries: ['./source/background/background.js'],
    debug: true
  }).transform(babelify, { presets: ['es2015'] });
  return bundler
    .bundle()
    .on('error', err => {
      console.log(err.message);
    })
    .pipe(source('background.js'))
    .pipe(gulp.dest('./extension/js'))
});

gulp.task('watch', () => {
  gulp.watch('./source/background/**/*.js', ['dev-bg']);
  gulp.watch('./source/app/**/*.scss', ['sass']);
  gulp.watch('./source/app/**/*.js', ['dev-app']);
});

gulp.task('default', ['dev-bg', 'dev-app', 'sass', 'watch']);
