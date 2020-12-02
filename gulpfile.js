const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const rename = require('gulp-rename');

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            }) 
        ]))
        .pipe(dest('dist/images'))
}

function styles() {
    return src('app/scss/**/*.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function css() {
  return src([
      'node_modules/normalize.css/normalize.css',
      'node_modules/slick-carousel/slick/slick.css',
      'node_modules/fullpage.js/dist/fullpage.css',
  ])
      .pipe(concat('_libs.scss'))
      .pipe(dest('app/scss'))
      .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/fullpage.js/dist/fullpage.js',
        'node_modules/fullpage.js/vendors/scrolloverflow.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function build() {
    return src([
        'app/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/fonts/**/*'
    ], {base: 'app'})
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/*.html']).on('change', browserSync.reload);
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
}

exports.styles = styles;
exports.css = css;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(css, styles, scripts, browsersync, watching)
