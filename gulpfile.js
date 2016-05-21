var paths = require('./gulp/config').paths;

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var inject = require('gulp-inject');
var gulpFilter = require('gulp-filter');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var del = require('del');
var gulpSequence = require('gulp-sequence');
var wrap = require("gulp-wrap");
var stripDebug = require('gulp-strip-debug');
var bump = require('gulp-bump');
var serve = require('gulp-serve');
var rename = require("gulp-rename");
var through2 = require('through2');
var lazypipe = require('lazypipe');
var gulpif = require('gulp-if');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var Dgeni = require('dgeni');


gulp.task('docs-generate', function() {
  var dgeni = new Dgeni([
    require('./docs/config')
  ]);
  return dgeni.generate();
});



gulp.task('themeBuild', require('./gulp/themeBuilder').dev);
gulp.task('jsBuild', require('./gulp/buildJs').dev);
gulp.task('cssBuild', require('./gulp/buildCss').dev);
gulp.task('indexBuild', require('./gulp/buildIndex').inject);
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


gulp.task('build', gulpSequence('clean', ['copyDocJs', 'copyDocCss', 'copyDocPartials', 'themeBuild', 'jsBuild', 'cssBuild', 'demos', 'copyFont', 'docs-generate'], 'indexBuild', 'copyPostInjectModules'));
gulp.task('default', gulpSequence('build', ['serve', 'watch']));




// Serve Locally
gulp.task('serve', serve({
  root: ['dist/docs', 'bower_components'],
  port: 8081
}));



// --- watcher --------------------------------

gulp.task('watch', function () {
  gulp.watch(paths.scripts, gulpSequence('jsBuild', 'indexBuild'));
  gulp.watch(paths.css, gulpSequence('cssBuild', 'indexBuild'));
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





gulp.task('demos', function() {
  var demos = [];
  return generateDemos()
    .pipe(through2.obj(function(demo, enc, next) {
      // Don't include file contents into the docs app,
      // it saves space
      demo.css.concat(demo.js).concat(demo.html).concat(demo.index)
        .forEach(function(file) {
          delete file.contents;
        });
      demos.push(demo);
      next();
    }, function(done) {
      var demoIndex = _(demos)
        .groupBy('moduleName')
        .map(function(moduleDemos, moduleName) {
          var componentName = moduleName.split('.').pop();
          console.log(componentName);
          return {
            name: componentName,
            moduleName: moduleName,
            label: humanizeCamelCase(componentName),
            demos: moduleDemos,
            url: 'demo/' + componentName
          };
        })
        .value();

      var dest = path.resolve(__dirname, 'dist/docs/js');
      var file = "angular.module('docsApp').constant('DEMOS', " +
        JSON.stringify(demoIndex, null, 2) + ");";
      mkdirp.sync(dest);
      fs.writeFileSync(dest + '/demo-data.js', file);

      done();
    }));
});

gulp.task('gen', function () {
  return generateDemos();
});
function generateDemos() {
  return gulp.src(paths.src + 'components/*/')
    .pipe(through2.obj(function(folder, enc, next) {
      var self = this;
      var split = folder.path.split(path.sep);
      var name = split.pop();
      var moduleName = name;

      copyDemoAssets(name, paths.src + 'components/', 'dist/docs/demo-partials/');

      readModuleDemos(moduleName, function(demoId) {
        return lazypipe()
          .pipe(gulpif, /.css$/, transformCss(demoId))
          .pipe(gulp.dest, 'dist/docs/demo-partials/' + name)
        ();
      })
        .on('data', function(demo) {
          self.push(demo);
        })
        .on('end', next);

      function transformCss(demoId) {
        return lazypipe()
          .pipe(through2.obj, function(file, enc, next) {
            file.contents = new Buffer(
              '.' + demoId + ' {\n' + file.contents.toString() + '\n}'
            );
            next(null, file);
          })
        ();
      }
    }));
}

function copyDemoAssets(component, srcDir, distDir) {
  gulp.src(srcDir + component + '/demo*/')
      .pipe(through2.obj(copyAssetsFor));

  function copyAssetsFor(demo, enc, next) {
    var demoID = component + "/" + path.basename(demo.path);
    var demoDir = demo.path + "/**/*";
    var notJS  = '!' + demoDir + '.js';
    var notCSS = '!' + demoDir + '.css';
    var notHTML= '!' + demoDir + '.html';

    gulp.src([demoDir, notJS, notCSS, notHTML])
        .pipe(gulp.dest(distDir + demoID));

    next();
  }
}



function readModuleDemos(moduleName, fileTasks) {
  var name = moduleName.split('.').pop();
  return gulp.src(paths.src + 'components/' + name + '/demo*/')
    .pipe(through2.obj(function(demoFolder, enc, next) {
      var demoId = name + path.basename(demoFolder.path);
      var srcPath = demoFolder.path.substring(demoFolder.path.indexOf(paths.src) + 4);
      var split = srcPath.split('/');

      var demo = {
        ngModule: '',
        id: demoId,
        css:[], html:[], js:[]
      };

      gulp.src(demoFolder.path + '/**/*', { base: path.dirname(demoFolder.path) })
        .pipe(fileTasks(demoId))
        .pipe(through2.obj(function(file, enc, cb) {
          if (/index.html$/.test(file.path)) {
            demo.moduleName = moduleName;
            demo.name = path.basename(demoFolder.path);
            demo.label = humanizeCamelCase(path.basename(demoFolder.path).replace(/^demo/, ''));
            demo.id = demoId;
            demo.index = toDemoObject(file);

          } else {
            var fileType = path.extname(file.path).substring(1);
            if (fileType == 'js') {
              demo.ngModule = demo.ngModule || findAnyModule(file.contents.toString());
            }
            demo[fileType] && demo[fileType].push(toDemoObject(file));
          }
          cb();
        }, function(done) {
          next(null, demo);
        }));

      function toDemoObject(file) {
        return {
          contents: file.contents.toString(),
          name: path.basename(file.path),
          label: path.basename(file.path),
          fileType: path.extname(file.path).substring(1),
          outputPath: 'demo-partials/' + name + '/' + path.basename(demoFolder.path) + '/' + path.basename(file.path)
        };
      }
    }));
}



function humanizeCamelCase(str) {
  return str.charAt(0).toUpperCase() + str.substring(1).replace(/[A-Z]/g, function ($1) {
      return ' ' + $1.toUpperCase();
    });
}






// TODO move to module
var ANY = /\.module\(('[^']*'|"[^"]*")\s*,(?:\s*\[([^\]]+)\])?/;
var findAnyModule = buildScanner(ANY);
function buildScanner(pattern) {
  return function findPatternIn(content) {
    var dependencies;
    var match = pattern.exec(content || '');
    var moduleName = match ? match[1].replace(/\'/gi,'') : null;
    var depsMatch = match && match[2] && match[2].trim();

    if (depsMatch) {
      dependencies = depsMatch.split(/\s*,\s*/).map(function(dep) {
        dep = dep.trim().slice(1, -1); //remove quotes
        return dep;
      });
    }

    return match ? {
      name         : moduleName || '',
      module       : moduleName || '',
      dependencies : dependencies || [ ]
    } : null;
  }
}
