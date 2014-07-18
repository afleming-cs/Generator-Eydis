'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var inflection = require('inflection');


var EydisGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous Eydis generator!'));

    var prompts = [{
      type    : 'input',
      name    : 'appname',
      message : 'What is your project name? This will be used as the AngularJS module name so try to stick to lower_case_underscore otherwise bad things might happen.',
      default : this.appname // Default to current folder name
    },{
      type    : 'input',
      name    : 'appspot_id',
      message : 'What is your cloud project id? (ex, lofty-seer-632).',
    },{
      type    : 'input',
      name    : 'oauth2_client_id',
      message : 'What is your OAuth2 client id? (the default one only works for localhost).',
      default: '462711127220-1mr3uha1ukgicv4s0ebvo26bulkpb4k1.apps.googleusercontent.com'
    }];

    this.prompt(prompts, function (props) {
      this.appname = props.appname;
      this.appnamecamel = inflection.camelize(this.appname.replace('-', '_'));
      this.appspot_id = props.appspot_id;
      this.oauth2_client_id = props.oauth2_client_id;

      done();
    }.bind(this));
  },

  app: function () {

    /* Top level files */
    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('app.dev.yaml');
    this.template('app.dist.yaml');
    this.copy('editorconfig');
    this.template('gulpfile.js');
    this.copy('jshintrc');
    this.copy('karma.conf.js');

    /* App fies */
    this.mkdir('app');
    this.directory('app');
    this.template('app/app-controller.js');
    this.template('app/app.js');
    this.template('app/index.html');
    this.template('app/precompiled-templates.js');

    /* Sections */
    this.directory('app/default');
    this.template('app/default/default.js');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = EydisGenerator;
