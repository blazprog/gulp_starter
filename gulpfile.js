// include modules needed in my tasks
var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var connect = require('connect');
var serve = require('serve-static');
var browsersync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var validator = require('gulp-html');
var nunjucksRender = require('gulp-nunjucks-render');

gulp.task('styles', function() {
   return gulp.src('app/css/*.css')
       .pipe(concat('all.css'))
       .pipe(postcss([
           cssnext(), cssnano()
       ]))
       .pipe(gulp.dest('dist'))
});

gulp.task('sass', function() {
    return gulp.src('app/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            cssnext(), cssnano()
        ]))
        .pipe(gulp.dest('dist'))
});
gulp.task('nunjucks', function() {
    // Gets .html and .nunjucks files in pages
    return gulp.src('app/html/pages/**/*.+(html|njk)')
        // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: ['app/html/templates']
        }))
        // output files in app folder
        .pipe(gulp.dest('dist'))
});

gulp.task('copy_html', function() {
    return gulp.src('app/html/*.html')
        .pipe(gulp.dest('dist'))
});


gulp.task('scripts', function(){
   return gulp.src('app/js/*.js')
       .pipe(jshint())
       .pipe(jshint.reporter('default'))
       .pipe(concat('all.js'))
       .pipe(uglify())
       .pipe(gulp.dest('dist'));
});

// Browserify Task
gulp.task('browserify', function() {
    return browserify('./app/js/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'));
});


gulp.task('images', function() {
   return gulp.src('app/img/*')
       .pipe(imagemin())
       .pipe(gulp.dest('dist/img'));
});

gulp.task('server', function() {
   return connect().use(serve(__dirname)).listen(8080)
       .on('listening', function() {
          console.log('Server Running: View at http://localhost:8080')
       })
});

function browsersyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: './dist'
        }
    });
    cb()
};

function browsersyncReload(cb){
    browsersync.reload();
    cb();
};

gulp.task('watch', function() {

   gulp.watch('app/html/*.html',gulp.series('copy_html', browsersyncReload));
   gulp.watch('app/sass/*.scss', gulp.series('sass', browsersyncReload));
   gulp.watch('app/css/*.css', gulp.series('styles', browsersyncReload));
   gulp.watch('app/js/*.js', gulp.series('scripts', browsersyncReload));
   gulp.watch('app/img/*', gulp.series('images', browsersyncReload));
});

gulp.task('default', gulp.parallel('sass','copy_html', 'styles', 'scripts',
                                   browsersyncServe, 'watch'));