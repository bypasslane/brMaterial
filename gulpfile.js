var gulp = require('gulp');
var server = require('gulp-webserver');
var jshint = require('gulp-jshint');
var flatten = require('gulp-flatten');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var inject = require('gulp-inject');
var through = require('through2');
var gulpFilter = require('gulp-filter');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var del = require('del');
var runSequence = require('run-sequence');
var wrap = require("gulp-wrap");
var del = require('del');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var bump = require('gulp-bump');
var templateCache = require('gulp-angular-templatecache');
var rename = require("gulp-rename");
var bump = require('gulp-bump');



var BASE = 'src/';
var paths = {
  appScripts: ['src/core/core.js', 'src/**/*.js'],
  scripts: ['client/app.js', 'client/controller.js', 'client/exampleController.js', 'src/**/*.js'],
  css: ['src/core/*.css', 'src/components/**/*.css'],
  index: ['client/index.html'],
  partials: ['client/partials/*.html'],
  font: ['src/core/brMaterialIcons.woff'],
  images: ['client/images/*.png', 'client/images/*.jpg']
};






gulp.task('default', function () {
  runSequence(
    'clean',
    'copyIndex',
    'copyPartials',
    'copyFont',
    'copyImages',
    'copyAngular',
    'build',
    ['webserver', 'watch']
  );
});



// --- Docs ----
gulp.task('doc', function () {

});




// --- Webserver --------------------------------

gulp.task('webserver', function () {
  setTimeout(function () {
    gulp.src('public')
      .pipe(server({
        port: '8081',
        host: '0.0.0.0',
      }));
    }, 1000);
});



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





// --- Clean Path -------
gulp.task('clean', function () {
  return del(['public/']);
});



// --- Copy Angular -------
gulp.task('copyAngular', function () {
  gulp.src(['angular/*.js'])
    .pipe(gulp.dest('public'));
});

// --- Copy Images -------
gulp.task('copyImages', function () {
  gulp.src(paths.images)
    .pipe(gulp.dest('public/images'));
});

// --- Copy Angular -------
gulp.task('copyIndex', function () {
  gulp.src(paths.index)
    .pipe(gulp.dest('public'));
});


// --- Copy partials -------
gulp.task('copyPartials', function () {
  gulp.src(paths.partials)
    .pipe(gulp.dest('public/partials/'));
});

// --- Copy Font -------
gulp.task('copyFont', function () {
  gulp.src(paths.font)
    .pipe(gulp.dest('public/stylesheets/core/'));
});




// --- Build ---------------------------

gulp.task('build', function () {
  buildTheme();
  buildCSS(paths.css, function () {
    injectCss();
  });
  buildJS(paths.scripts, function () {
    injectJs();
  });
});




// --- watcher --------------------------------

gulp.task('watch', function () {

  // JS
  gulp.watch(paths.scripts, function (event) {
    buildJS(event.path, function () {
      if (event.type === 'added') {
        injectJs();
      }
    });
  });


  // CSS
  gulp.watch(paths.css, function (event) {

    // theme files
    if (event.path.indexOf('-theme.css') > -1) {
      buildTheme();

    // non theme files
    } else {
      buildCSS(event.path, function () {
        if (event.type === 'added') {
          injectCss();
        }
      });
    }
  });



  gulp.watch(paths.partials, function (event) {
    gulp.src(event.path)
      .pipe(gulp.dest('public/partials/'));
  });
});








// --- Release ---

gulp.task('release', function (done) {

  // font
  gulp.src(paths.font)
    .pipe(gulp.dest('dist/'));

  // theme
  gulp.src(paths.css)
    .pipe(gulpFilter(function (file) {
      return /-theme/.test(file.path);
    }))
    .pipe(concat('theme.js'))
    .pipe(cssnano())
    .pipe(cssToConstant())
    .pipe(gulp.dest('src/'))
    .on('end', function() {

      // js
      gulp.src(paths.appScripts, {base: BASE})
        .pipe(wrap('(function(){"use strict";<%= contents %>}());'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .pipe(concat('brmaterial.js'))
        .pipe(gulp.dest('dist/'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(rename('brmaterial.min.js'))
        .pipe(gulp.dest('dist/'))
        .on('end', function () {

          // css
          gulp.src(paths.css, {base: BASE})
            .pipe(gulpFilter(function (file) {
              return file.path.indexOf('-theme') === -1;
            }))
            .pipe(autoprefixer())
            .pipe(concat('brmaterial.css'))
            .pipe(cssnano())
            .pipe(gulp.dest('dist/'))
            .on('end', function () {
              del(['src/theme.js']);
              gutil.log(gutil.colors.green('✔ Release'), 'Build Successful');
            });
        });
    });
});








// --- helpers --------



function injectCss() {
  gulp.src('public/index.html')
    .pipe(inject(gulp.src(['public/stylesheets/*.css', 'public/stylesheets/**/*.css'], {read: false}), {relative: true, ignorePath: '../public/'}))
    .pipe(gulp.dest('public'));
}

function injectJs() {
  gulp.src('public/index.html')
    .pipe(inject(gulp.src(['public/javascripts/core/core.js', 'public/client/*js', 'public/javascripts/**/*.js'], {read: false}), {relative: true, ignorePath: '../public/'}))
    .pipe(gulp.dest('public'));
}


function buildJS(path, callback) {
  gulp.src(path, {base: BASE})
    .pipe(wrap('(function(){"use strict";<%= contents %>}());'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('public/javascripts/'))
    .on('end', function() {
      // gutil.log(gutil.colors.green('✔ JS build'), 'Finished');
      if (typeof callback === 'function') callback();
    });
}


function buildCSS(path, callback) {
  gulp.src(path, {base: BASE})
    .pipe(gulpFilter(function (file) {
      return file.path.indexOf('-theme') === -1;
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('public/stylesheets/'))
    .on('end', function(){
      gutil.log(gutil.colors.green('✔ CSS build'), 'Finished');
      if (typeof callback === 'function') callback();
    });
}




function buildTheme() {
  gulp.src(paths.css)
    .pipe(gulpFilter(function (file) {
      return /-theme/.test(file.path);
    }))
    .pipe(concat('theme.js'))
    .pipe(cssnano())
    .pipe(cssToConstant())
    .pipe(gulp.dest('public/javascripts/core'))
    .on('end', function() {
      gutil.log(gutil.colors.green('✔ Theme build'), 'Finished');
    });
}


function cssToConstant () {
  return through.obj(function (file, enc, next) {
    var template = '(function(){ \nangular.module("brMaterial").constant("$BR_THEME_CSS", "%1"); \n})();\n\n';
    var output = file.contents.toString().replace(/\n/g, '').replace(/\"/g,'\\"');

    var jsFile = new gutil.File({
      base: file.base,
      path: file.path.replace('css', 'js'),
      contents: new Buffer(
        template.replace('%1', output)
      )
    });

    this.push(jsFile);
    next();
  });
}
