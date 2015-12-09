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
    gulp.src('./app/src/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/dist/'))
        .pipe(connect.reload())

});

gulp.task('productify', function () {

    var bundler = browserify({
        entries: ['./app/src/app.js'],
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
        .pipe(gulp.dest('./app/dist'))
});

gulp.task('browserify-app', function () {

    var bundler = browserify({
        entries: ['./app/src/app.js'],
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
        .pipe(gulp.dest('./app/dist'))
});

gulp.task('browserify-bg', function () {
    var bundler = browserify({
        entries: ['./app/background/background.js'],
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
        .pipe(gulp.dest('./app/js'))
});

gulp.task('connect', function () {
    connect.server({
        root: 'app',
        port: 3000,
        livereload: true
    })
});

gulp.task('html', function () {
    gulp.src('./app/*.html').pipe(connect.reload())
});

gulp.task('js', function () {
    gulp.src('./app/dist/**/*.js').pipe(connect.reload())
});

gulp.task('css', function () {
    gulp.src('./app/dist/**/*.css').pipe(connect.reload())
});

gulp.task('watch', function () {
    gulp.watch('./app/background/*.js', ['browserify-bg']);
    gulp.watch('./app/index.html', ['html']);
    gulp.watch('./app/src/**/*.scss', ['sass']);
    gulp.watch('./app/src/**/*.js', ['browserify-app'])
});

gulp.task('default', ['browserify-bg', 'browserify-app', 'sass']);
gulp.task('serve', ['browserify-bg', 'browserify-app', 'sass', 'connect', 'watch']);
gulp.task('production', ['browserify-bg', 'browserify-app', 'sass']);
