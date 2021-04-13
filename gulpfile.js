const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const purgecss = require('gulp-purgecss')

function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/' }
    })
}

function scripts() {
    return src(['app/js/**/*.js', '!app/**/*.min.js'])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js/'))
        .pipe(browserSync.stream())
}


function purgeCss() {
    return src('app/css/**/*.min.css')
        .pipe(purgecss({
            content: ['app/**/*.html']
        }))
        .pipe(dest('app/css/'))
}

function compileSass() {
    return src('app/sass/main.sass')
        .pipe(sass())
        .pipe(concat('app.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(cleancss(({ level: { 1: { specialComments: 0 } } })))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/src/**/*')
        .pipe(newer('app/images/dest/'))
        .pipe(imagemin())
        .pipe(dest('app/images/dest/'))
}

function cleanImg() {
    return del('app/images/dest/**/*', { force: true })
}

function cleanBuild() {
    return del('build/**/*', { force: true })
}

function buildCopy() {
    return src([
            'app/css/**/*.min.css',
            'app/js/**/*.min.js',
            'app/images/dest/**/*',
            'app/**/*.html'
        ], { base: 'app' })
        .pipe(dest('build'))
}


function startWatch() {
    watch(['app/**/*.sass'], compileSass, purgeCss)
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
    watch('app/**/*.html').on('change', browserSync.reload)
    watch('app/images/src/**/*', images)
}



exports.browsersync = browsersync;
exports.scripts = scripts;
exports.compileSass = compileSass;
exports.purgeCss = purgecss;
exports.images = images;
exports.cleanImg = cleanImg;
exports.build = series(cleanBuild, compileSass, purgeCss, scripts, images, buildCopy);
exports.default = parallel(scripts, compileSass, browsersync, startWatch);