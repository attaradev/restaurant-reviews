const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('uglify-es');
const pump = require('pump');
const imagemin = require('gulp-imagemin');
const del = require('del');
const composer = require('gulp-uglify/composer');

const minify = composer(uglify, console);

gulp.task('html', () => {
    gulp.src(['src/*.html'])
    .pipe(gulp.dest('public/'));
});

gulp.task('styles', () => {
    gulp.src('src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('scripts', cb => {
    pump([
            gulp.src(['src/js/*.js']),
            sourcemaps.init(),
            minify(),
            sourcemaps.write(),
            gulp.dest('public/js')
        ],
        cb
    );
});

gulp.task('images', () => {
    gulp.src(['app/**/*.jpg', 'app/**/*.png', 'app/**/*.svg'])
    .pipe(imagemin([
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(gulp.dest('public/'))
});

gulp.task('manifest', () => {
    gulp.src(['app/**/*.ico', 'app/**/*.webmanifest'])
    .pipe(gulp.dest('public'))
});

gulp.task('clean', () => {
    del(['public/**', '!public'])
    .then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});

gulp.task('build', ['html', 'styles', 'images', 'manifest', 'scripts']);
gulp.task('default', ['clean', 'build', 'scripts']);