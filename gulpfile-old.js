const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefix = require('autoprefixer');
const uglify = require('uglify-es');
const pump = require('pump');
const imagemin = require('gulp-imagemin');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const composer = require('gulp-uglify/composer');
const minify = composer(uglify, console);
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const src = {
    html: 'app/**/*.html',
    scss: 'app/**/*.scss',
    js: 'app/**/*.js',
    css: 'app/css'
};

let dev = true;

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], () => {
    browserSync.init({
        server: "./app"
    });

    gulp.watch(src.scss, ['sass']);
    gulp.watch(src.html).on('change', reload);
});

gulp.task('sass', () => {
    return gulp
    .src(src.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(src.css));
});

gulp.task('build', ['html', 'styles', 'images', 'manifest', 'scripts']);
gulp.task('default', ['clean', 'build', 'scripts']);


// gulp.task('manifest', () => {
//     return gulp
//     .src(['app/**/*.ico', 'app/**/*.webmanifest'])
//     .pipe(gulp.dest('public'))
// });

// gulp.task('clean', () => {
//     del(['public/**', '!public'])
//     .then(paths => {
//         console.log('Deleted files and folders:\n', paths.join('\n'));
//     });
// });

// gulp.task('scripts', cb => {
//     pump([
//             gulp.src(['src/js/*.js']),
//             sourcemaps.init(),
//             minify(),
//             sourcemaps.write(),
//             gulp.dest('public/js')
//         ],
//         cb
//     );
// });

// gulp.task('images', () => {
//     return gulp
//     .src(['app/**/*.jpg', 'app/**/*.png', 'app/**/*.svg'])
//     .pipe(imagemin([
//         imagemin.jpegtran({progressive: true}),
//         imagemin.optipng({optimizationLevel: 5}),
//         imagemin.svgo({
//             plugins: [
//                 {removeViewBox: true},
//                 {cleanupIDs: false}
//             ]
//         })
//     ]))
//     .pipe(gulp.dest('public/'))
// });
