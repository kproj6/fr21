var gulp = require('gulp')
  connect = require('gulp-connect');

  gulp.task('connect', function() {
    connect.server({
      root: './',
      port: 8080,
      livereload: true
    });
  });

gulp.task('html', function () {
  gulp.src('**/*.html')
    .pipe(connect.reload());
});

gulp.task('style', function () {
  gulp.src('**/*.css')
    .pipe(connect.reload());
});

gulp.task('scripts', function () {
  gulp.src('**/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['**/*.html'], ['html']);
  gulp.watch(['**/*.css'], ['style']);
  gulp.watch(['**/*.js'], ['scripts']);
});

gulp.task('default', ['connect', 'watch']);


