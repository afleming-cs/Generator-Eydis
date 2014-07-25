'use strict';

/* Top-level module */
angular.module('section.<%= name %>', [
  'ngRoute',
  /* Add additional dependencies here */
]).

/* Configure routes */
config(function($routeProvider){
  $routeProvider
    .when('/<%= name %>', {
      templateUrl: '<%= name %>/<%= name %>.html',
      controller: '<%= name_camel %>Ctrl',
      controllerAs: '<%= name %>'
    });
})

/* Controller */
.controller('<%= name_camel %>Ctrl', function(){
  this.name = '<%= name %>';
});
