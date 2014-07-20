'use strict';
// generated on 2014-07-20 using generator-eydis 0.0.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var eydis = require('./gulp-eydis');

/*
 * Tasks involving checking and testing
 */

// javascript linting
gulp.task('jshint', eydis.check.jshint);

gulp.task('test', eydis.check.karma);

/*
 * Tasks involving wiring
 */

// bower depedencies -> index.html (css & js)
gulp.task('wire:bower', eydis.wiring.bower);

// js files in app -> index.html
gulp.task('wire:scripts', eydis.wiring.scripts);

// internal tasks to do wiring in on run
gulp.task('internal:wire:bower', eydis.wiring.bower);
gulp.task('internal:wire:scripts', ['internal:wire:bower'], eydis.wiring.scripts );

gulp.task('wire', ['internal:wire:scripts'], function(){});

/*
 * Tasks involving building source files
 */

// less -> css (in same directory)
gulp.task('build:styles', eydis.compile.styles);

// angular html -> precompiled templates. placed in .tmp
gulp.task('build:nghtml', function(){
  eydis.compile.nghtml('<%= appnamecamel %>App.precompiled-templates');
});

// index.html -> dist/index.html with minimized scripts and styles
gulp.task('build:html', ['build:styles', 'wire', 'build:nghtml'], eydis.compile.html);

// images -> dist (compressed)
gulp.task('build:images', eydis.compile.images);

// fonts (from app and bower) -> dist
gulp.task('build:fonts', eydis.compile.fonts);

// all other misc remaining files -> dist
gulp.task('build:extras', eydis.compile.extras);

// cleans up build files
gulp.task('build:clean', require('del').bind(null, ['dist', '.tmp']));

// prepares the application for distribution
gulp.task('build', ['jshint', 'build:html', 'build:images', 'build:fonts', 'build:extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

// does the in-place building tasks (wiring and styles) needed for development.
gulp.task('build:dev', ['build:styles', 'wire']);


/*
 * Tasks related to serving the application
 */

gulp.task('serve', ['build:dev'], function(){
  eydis.run.gae('app.dev.yaml');
});

gulp.task('serve:dist', ['build'], function(){
  eydis.run.gae('dist/app.yaml');
});

gulp.task('watch', ['serve'], function () {
  require('connect-livereload')({port: 35729});
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/**/*.html',
    'app/**/*.js',
    'app/styles/**/*.css',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/**/*.js', ['jshint']);
  gulp.watch('app/styles/**/*.less', ['build:styles']);
  gulp.watch('bower.json', ['wire:bower']);
  gulp.watch('app/**/*.js', function(e){
    if(e.type === 'deleted' || e.type === 'added'){
      console.log('A script file was added or deleted.');
      gulp.start('wire:scripts');
    }
  });
});

// default task starts watch.
gulp.task('default', function () {
  gulp.start('watch');
});
