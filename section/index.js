'use strict';
var util = require('util');
var chalk = require('chalk');
var yeoman = require('yeoman-generator');
var inflection = require('inflection');

var SectionGenerator = yeoman.generators.NamedBase.extend({
  init: function () {
    this.name = inflection.underscore(this.name);
    this.name_camel = inflection.camelize(this.name, true);
    this.name_dashed = inflection.dasherize(this.name);

    this.on('end', function () {
      this.spawnCommand('gulp', ['wire']);
    });
  },

  files: function () {
    /*jshint camelcase: false */
    var base = 'app/' + this.name;
    this.component_dependencies = [];

    this.mkdir(base);

    this.template('section.html', base + '/' + this.name + '.html');
    this.template('section.js', base + '/' + this.name + '.js');
    this.template('section_test.js', base + '/' + this.name + '_test.js');

    console.log(chalk.green('Section generated. Top-level module for injection is ' + this.name));
  }
});

module.exports = SectionGenerator;
