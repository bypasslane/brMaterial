var paths = require('./gulp/config').paths;

var gulp = require('gulp');
var del = require('del');
var bump = require('gulp-bump');
var serve = require('gulp-serve');
var Dgeni = require('dgeni');
var gulpSequence = require('gulp-sequence');



// require tasks

gulp.task('themeBuild', require('./gulp/themeBuilder').dev);
gulp.task('jsBuild', require('./gulp/buildJs').dev);
gulp.task('cssBuild', require('./gulp/buildCss').dev);
gulp.task('indexBuild', require('./gulp/buildIndex').inject);
gulp.task('demos', require('./gulp/demos'));





// -- main tasks. use these to watch and build and release

gulp.task('build', gulpSequence('clean', ['copyDocJs', 'copyDocCss', 'copyDocPartials', 'themeBuild', 'jsBuild', 'cssBuild', 'demos', 'copyFont', 'docs-generate'], 'indexBuild', 'copyPostInjectModules'));
gulp.task('default', gulpSequence('build', ['serve', 'watch']));




// --- Version Tasks ----

gulp.task('major', function(){
  gulp.src('./package.json')
  .pipe(bump({type:'major'}))
  .pipe(gulp.dest('./'));
});

gulp.task('minor', function(){
  gulp.src('./package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('patch', function(){
  gulp.src('./package.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));
});




// sub tasks

gulp.task('docs-generate', function() {
  var dgeni = new Dgeni([
    require('./docs/config')
  ]);
  return dgeni.generate();
});

gulp.task('copyFont', function () {
  return gulp.src(paths.font)
    .pipe(gulp.dest(paths.dest + 'modules/brmaterial/core/'));
});

gulp.task('copyDocJs', function () {
  return gulp.src(['docs/js/app.js', 'docs/js/**/*.js'])
    .pipe(gulp.dest(paths.dest + 'js'));
});

gulp.task('copyDocCss', function () {
  return gulp.src('docs/js/**/*.css')
    .pipe(gulp.dest(paths.dest + 'js'));
});

gulp.task('copyDocPartials', function () {
  return gulp.src('docs/partials/*.html')
    .pipe(gulp.dest(paths.dest + 'partials'));
});

gulp.task('copyPostInjectModules', function () {
  return gulp.src('docs/modules/**/*')
    .pipe(gulp.dest(paths.dest + 'modules'));
});

gulp.task('clean', function () {
  return del(paths.dest);
});

gulp.task('serve', serve({
  root: ['dist/docs', 'bower_components'],
  port: 8081
}));

gulp.task('watch', function () {
  gulp.watch(paths.scripts, gulpSequence('jsBuild', 'indexBuild'));
  gulp.watch(paths.css, gulpSequence('cssBuild', 'indexBuild'));
});
