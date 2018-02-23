var gulp = require('gulp'),
    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify');

gulp.task('sass', function () {
    gulp.src('./source/app/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./extension/dist/'))
        .pipe(connect.reload())
});

gulp.task('production-sass', function () {
    gulp.src('./source/app/*.scss')
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./extension/dist/'))
});

gulp.task('production-app', () => {
    console.log('This process will take a several minutes, feel free to have a coffee.');
    var bundler = browserify({
        entries: ['./source/app/app.js'],
        debug: false
    }).transform(babelify, {presets: ["es2015", "react"]});
    return bundler
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./extension/dist/'))
});

gulp.task('production-bg', () => {
    var bundler = browserify({
        entries: ['./source/background/background.js'],
        debug: false
    }).transform(babelify, {presets: ["es2015"]});
    return bundler
        .bundle()
        .pipe(source('background.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./extension/js'))
});

gulp.task('dev-app', () => {
    var bundler = browserify({
        entries: ['./source/app/app.js'],
        debug: true
    }).transform(babelify, {presets: ["es2015", "react"]});
    return bundler
        .bundle()
        .on('error', (err) => {
            console.log(err.message);
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./extension/dist/'))
        .pipe(connect.reload())
});

gulp.task('dev-bg', () => {
    var bundler = browserify({
        entries: ['./source/background/background.js'],
        debug: true
    }).transform(babelify, {presets: ["es2015"]});
    return bundler
        .bundle()
        .on('error', (err) => {
            console.log(err.message);
        })
        .pipe(source('background.js'))
        .pipe(gulp.dest('./extension/js'))
        .pipe(connect.reload())
});
// if dev build is falling on this task, just try to change port number - its reported bug of gulp-connect
gulp.task('connect', () => {
    connect.server({
        root: 'app',
        port: 3014,
        livereload: true
    })
});

gulp.task('html', () => {
    gulp.src('./extension/*.html').pipe(connect.reload())
});

gulp.task('watch', () => {
    gulp.watch('./source/background/**/*.js', ['dev-bg']);
    gulp.watch('./source/app/index.html', ['html']);
    gulp.watch('./source/app/**/*.scss', ['sass']);
    gulp.watch('./source/app/**/*.js', ['dev-app'])
});

gulp.task('default', ['production-app', 'production-bg', 'sass']);
gulp.task('serve', ['dev-bg', 'dev-app', 'sass', 'connect', 'watch']);
gulp.task('production', ['production-app', 'production-bg', 'production-sass']);
