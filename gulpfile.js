const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const pump = require('pump');
const imagemin = require('gulp-imagemin');

gulp.task('html', () => {
    gulp.src('/src/*.html')
    .pipe(gulp.dest('/public'));
});

gulp.task('styles', () => {
    gulp.src('/src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('/public/css/style.css'));
});

gulp.task('scripts', cb => {
    pump([
        gulp.src('/src/js/*.js'),
        uglify(),
        gulp.dest('/public/js')
    ]),
    cb
});

gulp.task('images', () => {
    gulp.src('/app/img/*.jpg')
    .pipe(imagemin([imagemin.jpegtran({progressive: true})]))
    .pipe(gulp.dest('public/img'))
});

gulp.task('manifest', () => {
    gulp.src(['/app/*.webmanifest', '/app/*.jpg', '/app/**/*.ico'])
    gulp.dest('/public')
});

gulp.task('watch', () => {
    gulp.watch('/src/*.html', html);
    gulp.watch(['/src/**/*.js', '!service-w*.js'], scripts);
    gulp.watch('/src/scss/**/*.scss', styles)
});

gulp.task('default', [html, styles, scripts, images, manifest, watch]);

gulp.task('build', [html, styles, scripts, images, manifest]);