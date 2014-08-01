'use strict';

/**
 * Modules and dependencies for the app
 */
angular
  .module('<%= appnamecamel %>App', [
    /* Include sections here. The sections will include their own dependencies */
    'section.default',

    /* Internal depedencies */
    '<%= appnamecamel %>App.app_controller',
    '<%= appnamecamel %>App.precompiled-templates',

    /* Eydis library dependencies */
    'eydis.gapi',

    /* External dependencies */
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
  ])
  /* Default route configuration */
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    /* Here we'll just route to the default subsection. Subsections do their own routing. */
    $routeProvider
      .when('/', {
        redirectTo: '/default'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  /* Google API configuration */
  .config(function($gapiProvider){
    $gapiProvider.client_id = '<%= oauth2_client_id %>';

    if(window.location.hostname === 'localhost'){
      $gapiProvider.api_base = 'http://localhost:8080/_ah/api';
    } else {
      $gapiProvider.api_base = 'https://api-dot-<%= appspot_id %>.appspot.com/_ah/api';
    }
  });
