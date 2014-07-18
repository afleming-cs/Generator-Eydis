'use strict';
// generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var exec = require('child_process').exec;
var merge = require('merge-stream');
var opn = require('opn');
var concat = require('concat-stream');
var chalk = require('chalk');

/*
 * Tasks involving building source files
 */
gulp.task('styles', function () {
  /* Compiles all less and runs autoprefixer */
  return gulp.src('app/styles/*.less')
    .pipe($.plumber()) // prevent errors from crashing everything
    .pipe($.less({compressed: true}))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('app/styles'));
});

gulp.task('jshint', function () {
  return gulp.src(['app/**/*.js'])
    .pipe($.plumber()) // prevent errors from crashing everything
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

/*
  This compiles angular templates into a single JS file.
*/
gulp.task('nghtml', function(){
  var wiredep = require('wiredep');
  /* This discovers any html files in bower components */

  var bower_htmls = wiredep({
    fileTypes: {
      html: {
        detect: { html: true }
      }
    }
  }).html || [];

  var app_htmls = [
    'app/**/*.html',
    '!app/*.html'
  ];

  var srcs = merge(
    gulp.src(app_htmls),
    gulp.src(bower_htmls, {base: '.'})
  );

  return srcs
    .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
    }))
    .pipe($.ngHtml2js({
        moduleName: '<%= appnamecamel %>App.precompiled-templates',
    }))
    .pipe($.concat('precompiled-templates.js'))
    // no need to uglify, the html task does that already.
    //.pipe(uglify())
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html', ['styles', 'wiring', 'nghtml'], function () {
  /* This "builds" the HTML
    - useref replaces sections between build comment tags with optimized versions
    - uses ngmin to make sure angular code is safe
    - uglifies js
    - optimizes css
    - revisionify
    - copies it to dist
  */
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src('app/index.html')
    .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    /* This fixes bad font url references */
    .pipe($.replace('bower_components/bootstrap/vendor/assets/fonts/bootstrap','fonts'))
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe($.rev())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulp.dest('dist'));
});

gulp.task('html:debug', ['styles', 'wiring'], function () {
  var app_stream = gulp.src(['app/**/*.html', 'app/**/*.js', 'app/**/*.css'])
    .pipe(gulp.dest('dist'));

  var bower_stream = gulp.src(['bower_components/**/*.*',])
    .pipe(gulp.dest('dist/bower_components'));

  return concat(app_stream, bower_stream);
});

gulp.task('images', function () {
  /* Optimizes all images */
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  /* copies fonts from bower into dist */
  return gulp.src('bower_components/**/*.{otf,eot,svg,ttf,woff}')
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

/* This copies all non-compiled items to the dist directory */
gulp.task('extras', function () {
  var extras = [
    'app/404.html',
    'app/robots.txt',
    'app/favicon.ico'
  ];

  var app_stream = gulp.src(extras, {base: 'app/'})
    .pipe(gulp.dest('dist'));

  var yaml_stream = gulp.src('app.dist.yaml')
    .pipe($.rename('app.yaml'))
    .pipe(gulp.dest('dist'));

  return merge(app_stream, yaml_stream);
});

/* This handles automatically injecting bower dependencies into index.html */
var wire_bower = function () {
  var wiredep = require('wiredep').stream;
  return gulp.src('app/index.html')
    .pipe($.plumber()) // prevent errors from crashing everything
    .pipe(wiredep({
      directory: 'bower_components',
      ignorePath: /..\//
    }))
    .pipe(gulp.dest('app'));
};


gulp.task('wiredep', wire_bower);

/*
 * This is one of the most complex tasks, mostly because a gulp plugin didn't already exist
 * It's essentially the same as wiredep but for the scripts in app. You can add exclusions at the top
 */
var wire_scripts = function(){
  var script_patterns = [
    'app/**/*.js',
    '!app/**/*_test.js',
  ];

  var block_pattern = /(([ \t]*)<!--\s*wirescripts:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endwirescripts\s*-->)/gi;
  var dependencies = [];
  var replacement = function(match, startBlock, spacing, blockType, oldScripts, endBlock, offset, string){
    var returnType = /\r\n/.test(string) ? '\r\n' : '\n';
    spacing = returnType + spacing.replace(/\r|\n/g, '');
    var newContent = startBlock;
    dependencies.forEach(function(src){
      newContent += spacing + '<script src="{{filePath}}"></script>'.replace('{{filePath}}', src);
    });
    newContent += spacing + endBlock;
    return newContent;
  };

  gulp.src(script_patterns, {read: false, base: 'app/'})
    .pipe(concat(function(files){
      /* There is likely a better way to do this, but I'm node retarded. */
      dependencies = files.map(function(v){ return v.path.replace(v.cwd + '/' + v.base, ''); });

      return gulp.src('app/index.html')
        .pipe($.replace(block_pattern, replacement))
        .pipe(gulp.dest('app'));
    }));

};

gulp.task('wirescripts', wire_scripts);

/* These tasks ensures that wiring happens in the proper order */

gulp.task('internal:wiring:bower', function(){
  return wire_bower();
});

gulp.task('internal:wiring:scripts', ['internal:wiring:bower'], function(){
  return wire_scripts();
});

gulp.task('wiring', ['internal:wiring:scripts'], function(){

});

/*
 * Tasks related to testing the application
 */

gulp.task('test', function(){
  throw 'Karma doesn\'t work right with gulp yet. :/';
});

/*
 * Tasks related to serving the application
 */

gulp.task('clean', require('del').bind(null, ['dist', '.tmp']));

gulp.task('livereload', function(){
  require('connect-livereload')({port: 35729});
});

var run_gae = function(yaml){
  var silent = false;
  var child = exec('dev_appserver.py --port 8081 --admin_port 9001 ' + yaml);
  child.stdout.on('data', function (d) {
    if(!silent){ console.log('GAE: ' + d.trim()); }
  });
  child.stderr.on('data', function (d) {
    if(!silent){ console.log('GAE: ' + d.trim()); }
    /* Detect server startup and open it browser */
    if(d.indexOf('Starting module "default"') !== -1){
      console.log('App Engine Server started successfully, silencing it now.');
      silent = true;
      opn('http://localhost:8081');
    }
  });
};

gulp.task('serve', ['styles', 'wiring'], function(){
  run_gae('app.dev.yaml');
});

gulp.task('serve:dist', ['build'], function(){
  run_gae('dist/app.yaml');
});

gulp.task('watch', ['serve', 'livereload'], function () {
  console.log(chalk.red('WARNING: Karma is not integrated with gulp yet, you must run `karma start` separately!') );
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/**/*.html',
    'app/**/*.js',
    'app/styles/**/*.css',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/**/*.js', ['jshint']);
  gulp.watch('app/styles/**/*.less', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch('app/**/*.js', function(e){
    if(e.type === 'deleted' || e.type === 'added'){
      console.log('A script file was added or deleted.');
      gulp.start('wirescripts');
    }
  });
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build:debug', ['jshint', 'html:debug', 'images', 'fonts', 'extras'], function(){
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
