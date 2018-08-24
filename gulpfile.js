const gulp = require('gulp');
const pug = require('gulp-pug');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');

const pugFiles = 'pug/**/*.pug';
const pcssFiles = 'css/**/*.pcss';
const jsFiles = 'js/**/*.js';

gulp.task('scripts', () => {
  return gulp.src(jsFiles)
    .pipe(gulp.dest('www/js'));
});

gulp.task('styles', () => {
  return gulp.src(pcssFiles)
    .pipe(sourcemaps.init())
    .pipe(rename(path => path.extname = '.css'))
    .pipe(postcss([precss, autoprefixer]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('www/css'))
});

gulp.task('pug', ['styles', 'scripts'], () => {
  return gulp.src(pugFiles)
    .pipe(pug({

    }))
    .pipe(gulp.dest('www'));
});

gulp.task('vendor', () => {
  return gulp.src('node_modules/monaco-editor/min/**/*')
    .pipe(gulp.dest('www/vendor/monaco'));
})

gulp.task('default', ['watch', 'vendor', 'styles'], () => {
  const express = require('express');
  const app = express();
  app.use(express.static('www'));
  app.listen(80, () => console.log('Express server listening on port 80'));
});

gulp.task('watch', ['pug'], () => {
  gulp.watch(pugFiles, ['pug']);
  gulp.watch(jsFiles, ['scripts']);
  gulp.watch(pcssFiles, ['styles']);
  gulp.watch('gulpfile.js', () => {
    console.log('Gulpfile.js changed! Exiting');
    process.exit()
  });
});