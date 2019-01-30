const gulp = require("gulp");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const reload = browserSync.reload;
const uglify = require("gulp-terser");

const src = {
  sass: "sass/**/*.scss",
  css: "app/css",
  html: "app/*.html",
  js: "app/js/*.js"
};

// Static Server + watching scss/html files
gulp.task("serve", ["sass", "minify"], () => {
  browserSync.init({
    server: "./app"
  });

  gulp.watch(src.sass, ["sass"]);
  gulp.watch(src.html).on("change", reload);
});

// Compile sass into CSS
gulp.task("sass", () => {
  return gulp
    .src(src.sass)
    .pipe(
      sass({
        outputStyle: "compressed"
      }).on("error", sass.logError)
    )
    .pipe(gulp.dest(src.css))
    .pipe(
      reload({
        stream: true
      })
    );
});

// minify js
gulp.task("minify", () => {
  return gulp
    .src(src.js)
    .pipe(sourcemaps.init())
    .pipe(
      rename(function(path) {
        path.dirname += "";
        path.basename += ".min";
        path.extname = ".js";
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./app/js"));
});

gulp.task("default", ["serve"]);

gulp.task("build", () =>
  gulp
    .src([
      "app/**/*.html",
      "app/**/*.min.js",
      "app/**/*.css",
      "app/sw.js",
      "app/manifest.json",
      "app/**/icons/*",
      "app/**/img/*"
    ])
    .pipe(gulp.dest("./public/"))
);
