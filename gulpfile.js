var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  gulp.src('src/style/style.scss')
  .pipe(sass())
  .pipe(connect.reload())
  .pipe(gulp.dest('dist/css'));
});
  
gulp.task('connect', function() {
    connect.server({
      root: './dist',
      port: 8080,
      livereload: true
    });
});

gulp.task('html', function () {
  gulp.src('src/html/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function () {
  gulp.src('src/js/**/*.js')
    .pipe(gulp.dest('./dist/js'))
    .pipe(connect.reload());
});

gulp.task('bower', function() {
  gulp.src('bower_components/**/*')
    .pipe(gulp.dest('./dist/bower_components'));
});

gulp.task('images', function() {
  gulp.src('src/img/**/*.png')
    .pipe(gulp.dest('./dist/img'));
  gulp.src('src/img/**/*.jpg')
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch(['src/**/*.html'], ['html']);
  gulp.watch(['src/**/*.scss'], ['sass']);
  gulp.watch(['src/**/*.js'], ['scripts']);
});

gulp.task('build', ['sass', 'html', 'scripts', 'bower', 'images']);

gulp.task('default', ['connect', 'watch']);
