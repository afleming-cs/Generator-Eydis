'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var inflection = require('inflection');

var ComponentGenerator = yeoman.generators.NamedBase.extend({
  init: function () {
    this.name = inflection.underscore(this.name);
    this.name_camel = inflection.camelize(this.name);
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
      console.log(this.parts);

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
      this.component_dependencies += ['\'' + this.name + '.service' + '\''];
    }


    this.template('component.js', base + '/' + this.name + '.js');
  }
});

module.exports = ComponentGenerator;
