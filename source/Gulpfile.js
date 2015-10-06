var gulp        = require('gulp');
var sass        = require('gulp-sass');
var connect     = require('gulp-connect');
var sourcemaps  = require('gulp-sourcemaps');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var browserify  = require('browserify');
var uglify      = require('uglifyify');
var envify      = require('envify/custom')

gulp.task('sass', function() {
    gulp.src('./app/src/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./app/dist/'))
    .pipe(connect.reload())

});

gulp.task('productify', function() {

    var bundler = browserify({
        entries: ['./app/src/app.js'],
        debug: true
    }).transform('reactify', { es6: true })
    .transform(envify({ NODE_ENV: 'production' }))
    .transform({global: true}, 'uglifyify');

    return bundler
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/dist'))
});

gulp.task('browserify', function() {

    var bundler = browserify({
        entries: ['./app/src/app.js'],
        debug: true
    }).transform('reactify', { es6: true })
    .transform(envify({ NODE_ENV: 'development' }));

    return bundler
    .bundle()
    .on('error', function(err){
        console.log(err.message);
        this.emit('end');
    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/dist'))
});

gulp.task('connect', function() {
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

gulp.task('watch', function() {
    gulp.watch('./app/index.html', ['html']);
    gulp.watch('./app/src/**/*.scss', ['sass']);
    gulp.watch('./app/src/**/*.js', ['browserify'])
});

gulp.task('default', ['browserify', 'sass']);
gulp.task('serve', ['browserify', 'sass', 'connect', 'watch']);
gulp.task('production', ['productify', 'sass']);
