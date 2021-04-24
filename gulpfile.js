// include modules needed in my tasks
var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var connect = require('connect');
var serve = require('serve-static');
var browsersync = require('browser-sync');
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');

gulp.task('styles', function() {
   return gulp.src('app/css/*.css')
       .pipe(concat('all.css'))
       .pipe(postcss([
           cssnext(), cssnano()
       ]))
       .pipe(gulp.dest('dist'))
});

gulp.task('html', function() {
    return gulp.src('./*.html');
})

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
       .pipe(gulp.dest('dist/img'))
})

gulp.task('server', function() {
   return connect().use(serve(__dirname)).listen(8080)
       .on('listening', function() {
          console.log('Server Running: View at http://localhost:8080')
       })
});

gulp.task('browsersync', function() {
    return browsersync({
        'server': {
            baseDir: './'
        }
    })
});

gulp.task('watch', function() {
   gulp.watch('app/css/*.css', gulp.series('styles', browsersync.reload));
   gulp.watch('app/js/*.js', gulp.series('scripts', browsersync.reload));
   gulp.watch('app/img/*', gulp.series('images', browsersync.reload));
   gulp.watch('./*.html', gulp.series('html', browsersync.reload));
});

gulp.task('default', gulp.parallel('styles', 'scripts',
                                  'images', 'watch','html',
                                  'browsersync'));