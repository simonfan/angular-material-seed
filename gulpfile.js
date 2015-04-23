// native
var path = require('path');

// general 3rd party dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var _ = require('lodash');
var gulpWatch = require('gulp-watch');

// CONSTANTS
var SRC_DIR = 'src';
var DEV_DIR = 'dev';
var DIST_DIR = 'dist';

////////////////
// BROWSERIFY //
var watchify = require('watchify');
var browserify = require('browserify');
var vinylSourceStream = require('vinyl-source-stream');

gulp.task('browserify', function () {

  // add custom browserify options here
  var browserifyOptions = _.assign({}, watchify.args, {
    entries: ['./src/index.js'],
    debug: true
  });
  var b = watchify(browserify(browserifyOptions));

  // brfs for the filesystem reading static files.
  b.transform('brfs');

  b.on('update', bundle); // on any dep update, runs the bundler
  b.on('log', gutil.log); // output build logs to terminal

  function bundle() {
    return b.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(vinylSourceStream('index.js'))
      .pipe(gulp.dest(DEV_DIR));
  }

  // do initial bundling
  bundle();
});
// BROWSERIFY //
////////////////

//////////
// DIST //
var minifyCss = require('gulp-minify-css');
var gulpUglify = require('gulp-uglify');

gulp.task('dist', function() {
  // html - simply copy
  gulp.src(DEV_DIR + '/*.html')
    .pipe(gulp.dest(DIST_DIR));

  // css
  gulp.src(DEV_DIR + '/*.css')
    .pipe(minifyCss())
    .pipe(gulp.dest(DIST_DIR))

  // js
  gulp.src(DEV_DIR + '/*.js')
    .pipe(gulpUglify())
    .pipe(gulp.dest(DIST_DIR));
});
// DIST //
//////////

//////////
// LESS //
var gulpLess = require('gulp-less');
 
gulp.task('less', function () {

  function processLess() {

    gutil.log(gutil.colors.blue('processing less'));

    return gulp.src('./src/index.less')
      .pipe(gulpLess())
      .on('error', gutil.log.bind(gutil, gutil.colors.red('Less processing error')))
      .pipe(gulp.dest(DEV_DIR));
  }

  // set up watcher
  var watcher = gulpWatch(SRC_DIR + '/**/*.less', processLess);

  return processLess();

});
// LESS //
//////////

//////////
// HTML //
gulp.task('html', function () {

  function processHTML() {
    // simply copy the index.html file.
    // for now.
    return gulp.src(SRC_DIR + '/index.html')
      .pipe(gulp.dest(DEV_DIR));
  }

  // set up watcher
  var watcher = gulpWatch(SRC_DIR + '/index.html', processHTML);

  return processHTML();
});
// HTML //
//////////

///////////
// SERVE //
var browserSync = require('browser-sync');

gulp.task('serve', function () {
  browserSync({
    server: {
      baseDir: DEV_DIR
    }
  });

  var files = [
    DEV_DIR + '/*.html',
    DEV_DIR + '/*.css',
    DEV_DIR + '/*.js',
  ]

  gulpWatch(files, browserSync.reload);
})
// SERVE //
///////////

gulp.task('default', ['browserify', 'html', 'less', 'serve'])