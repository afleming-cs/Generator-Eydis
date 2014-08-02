'use strict';

var gulp = require('gulp');
var wiredep = require('wiredep');
var merge = require('merge-stream');
var exec = require('child_process').exec;
var $ = require('gulp-load-plugins')();
var opn = require('opn');
var chalk = require('chalk');


var run_gae = function(yaml, port, admin_port){
  admin_port = admin_port || 9001;
  port = port || 8081;
  var silent = false;
  var child = exec('dev_appserver.py --host 0.0.0.0 --admin_host 0.0.0.0 --port ' + port + ' --admin_port ' + admin_port + ' ' + yaml);
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

var task_styles = function () {
  /* Compiles all less and runs autoprefixer */
  return gulp.src('app/styles/*.less')
    .pipe($.plumber()) // prevent errors from crashing everything
    .pipe($.less({compressed: true}))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('app/styles'));
};


var task_jshint = function () {
  return gulp.src(['app/**/*.js'])
    .pipe($.plumber()) // prevent errors from crashing everything
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
};


var task_karma = function () {
  console.log(chalk.red('WARNING: Karma is not integrated with gulp yet, you must run `karma start` separately!') );
};


var task_nghtml = function (moduleName) {
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
        moduleName: moduleName,
    }))
    .pipe($.concat('precompiled-templates.js'))
    // no need to uglify, the html task does that already.
    .pipe(gulp.dest('.tmp'));
};


var task_html = function(){
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
};


var task_images = function () {
  /* Optimizes all images */
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
};


var task_fonts = function () {
  /* copies fonts from bower into dist */
  return gulp.src('bower_components/**/*.{otf,eot,svg,ttf,woff}')
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
};


var task_extras = function (){
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
};


var task_wire_bower = function () {
  var wiredep = require('wiredep').stream;
  return gulp.src('app/index.html')
    .pipe($.plumber()) // prevent errors from crashing everything
    .pipe(wiredep({
      directory: 'bower_components',
      ignorePath: /..\//
    }))
    .pipe(gulp.dest('app'));
};


var task_wire_scripts = function(){
  var concat = require('concat-stream');
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


/* Export time */
exports.compile = {
  styles: task_styles,
  nghtml: task_nghtml,
  html: task_html,
  images: task_images,
  fonts: task_fonts,
  extras: task_extras
};

exports.check = {
  jshint: task_jshint,
  karma: task_karma
};

exports.wiring = {
  bower: task_wire_bower,
  scripts: task_wire_scripts
};


exports.run = {
  gae: run_gae
};
