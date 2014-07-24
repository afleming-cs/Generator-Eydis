'use strict';
var util = require('util');
var chalk = require('chalk');
var yeoman = require('yeoman-generator');
var inflection = require('inflection');

var ComponentGenerator = yeoman.generators.NamedBase.extend({
  init: function () {
    this.name = inflection.underscore(this.name);
    this.name_camel = inflection.camelize(this.name, true);
    this.name_dashed = inflection.dasherize(this.name);
  },

  askFor: function () {
    var done = this.async();

    var prompts = [{
      type    : 'checkbox',
      name    : 'parts',
      message : 'What stuff will your component have? (you can always add more later)',
      choices : ['service', 'directive']
    },];

    this.prompt(prompts, function (props) {
      this.parts = props.parts;

      done();
    }.bind(this));
  },

  files: function () {
    /*jshint camelcase: false */
    var base = 'app/components/' + this.name;
    this.component_dependencies = [];

    this.mkdir(base);


    if(this.parts.indexOf('service') !== -1){
      this.template('service.js', base + '/' + this.name + '-service.js');
      this.template('service_test.js', base + '/' + this.name + '-service_test.js');
      this.component_dependencies.push('\'' + this.name + '.service' + '\'');
    }

    if(this.parts.indexOf('directive') !== -1){
      this.template('directive.js', base + '/' + this.name + '-directive.js');
      this.template('directive.html', base + '/' + this.name + '-directive.html');
      this.template('directive_test.js', base + '/' + this.name + '-directive_test.js');
      this.component_dependencies.push('\'' + this.name + '.directive' + '\'');
    }

    this.component_dependencies = this.component_dependencies ? this.component_dependencies.join(', ') : '';

    this.template('component.js', base + '/' + this.name + '.js');

    console.log(chalk.green('Component generated. Top-level module for injection is ' + this.name));
  }
});

module.exports = ComponentGenerator;
