var gulp = require('gulp'),
    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    uglify = require('uglifyify'),
    envify = require('envify/custom');

gulp.task('sass', function () {
    gulp.src('./source/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./extension/dist/'))
        .pipe(connect.reload())

});

gulp.task('productify', function () {

    var bundler = browserify({
        entries: ['./source/app.js'],
        debug: true
    }).transform('reactify', {es6: true})
        .transform(envify({NODE_ENV: 'production'}))
        .transform({global: true}, 'uglifyify');

    return bundler
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./extension/dist/'))
});

gulp.task('browserify-app', function () {

    var bundler = browserify({
        entries: ['./source/app.js'],
        debug: true
    }).transform('reactify', {es6: true})
        .transform(envify({NODE_ENV: 'development'}));

    return bundler
        .bundle()
        .on('error', function (err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./extension/dist/'))
});

gulp.task('browserify-bg', function () {
    var bundler = browserify({
        entries: ['./source/background/background.js'],
        debug: true
    }).transform('reactify', {es6: true})
        .transform(envify({NODE_ENV: 'development'}));

    return bundler
        .bundle()
        .on('error', function (err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source('background.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./extension/js'))
});

gulp.task('connect', function () {
    connect.server({
        root: 'app',
        port: 3000,
        livereload: true
    })
});

gulp.task('html', function () {
    gulp.src('./extension/*.html').pipe(connect.reload())
});

gulp.task('js', function () {
    gulp.src('./extension/dist/**/*.js').pipe(connect.reload())
});

gulp.task('css', function () {
    gulp.src('./extension/dist/**/*.css').pipe(connect.reload())
});

gulp.task('watch', function () {
    gulp.watch('./source/background/*.js', ['browserify-bg']);
    gulp.watch('./source/index.html', ['html']);
    gulp.watch('./source/**/*.scss', ['sass']);
    gulp.watch('./source/**/*.js', ['browserify-app'])
});

gulp.task('default', ['browserify-bg', 'browserify-app', 'sass']);
gulp.task('serve', ['browserify-bg', 'browserify-app', 'sass', 'connect', 'watch']);
gulp.task('production', ['browserify-bg', 'browserify-app', 'sass']);
