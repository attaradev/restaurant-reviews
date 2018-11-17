const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const reload = browserSync.reload;

const src = {
  sass: 'sass/**/*.scss',
  css: 'app/css',
  html: 'app/*.html'
};

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], () => {

  browserSync.init({
    server: "./app"
  });

  gulp.watch(src.sass, ['sass']);
  gulp.watch(src.html).on('change', reload);
});

// Compile sass into CSS
gulp.task('sass', () => {
  return gulp.src(src.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(src.css))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('default', ['serve']);