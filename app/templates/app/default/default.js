/*
 * This is a "section" definition. Each section should have its own module, template and controller.
 * Sections should be specific to an individual app and are by definition NOT reusable.
 */
'use strict';

angular.module('section.default', [
  'ngRoute',
  /* Include any additional dependencies or subsections here */
]).

/*
 * Each section does it own routing.
 */
config(function ($routeProvider) {
  $routeProvider
    .when('/default', {
      templateUrl: 'default/default.html',
      controller: 'Default',
      controllerAs: 'default'
    });
}).

/* Default section controller */
controller('Default', function($scope){
  /* jshint unused: false */
  this.appname = '<%= appname %>';
});
