const { src, dest, watch, parallel, series } = require('gulp');

// const scss = require('gulp-sass')(require('sass'));
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const clean = require('gulp-clean');
const fileInclude = require('gulp-file-include');
// const webp = require('gulp-webp').default;

// const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

function styles() {
  return src('app/scss/style.scss') // оставляем только точку входа
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(
      postcss([autoprefixer({ overrideBrowserslist: ['last 10 versions'] })])
    )
    .pipe(concat('style.min.css'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}
// function styles() {
//   return src('app/scss/style.scss') // оставляем только точку входа
//     .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
//     .pipe(
//       postcss([autoprefixer({ overrideBrowserslist: ['last 10 versions'] })])
//     )
//     .pipe(concat('style.min.css'))
//     .pipe(dest('app/css'))
//     .pipe(browserSync.stream());
// }

function scripts() {
  return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

// Задача на сборку HTML
function html() {
  return src(['app/index.html'])
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(dest('dist'));
}

function copyStylesToDist() {
  return src('app/css/style.min.css').pipe(dest('dist/css'));
}

function copyJsToDist() {
  return src('app/js/main.min.js').pipe(dest('dist/js'));
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'dist/',
    },
  });
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/**/*.html'], html);
  watch(['app/js/main.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
  watch(['app/scss/**/*.scss'], series(styles, copyStylesToDist));
  watch(['app/**/*.html'], series(html, browserSync.reload));
  watch(['app/js/main.js'], series(scripts, copyJsToDist));
}

// function images() {
//   return src('app/images/**/*')
//     .pipe(newer('dist/images'))
//     .pipe(dest('dist/images'));
// }

// function images() {
//   return src('app/images/src/*.*')
//     .pipe(newer('app/images/dist'))
//     .pipe(webp())

//     .pipe(src('app/images/src/*.*'))
//     .pipe(newer('app/images/dist'))
//     .pipe(imagemin())

//     .pipe(dest('app/images/dist'));
// }

function building() {
  return src(['app/css/style.min.css', 'app/js/main.min.js', 'app/**/*.html'], {
    base: 'app',
  }).pipe(dest('dist'));
}

function cleanDist() {
  return src(['dist/**/*', '!dist/images/**'], {
    read: false,
    allowEmpty: true,
  }).pipe(clean());
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
// exports.images = images;

exports.html = html;

exports.build = series(cleanDist, styles, building);
exports.default = parallel(html, styles, scripts, watching);
