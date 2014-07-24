'use strict';

angular.module('<%= name %>.directive', []).
directive('<%= name_camel %>', function () {
  return {
    restrict: 'EA',
    scope: {},
    templateUrl: 'components/<%= name %>/<%= name %>-directive.html',
    controller: function($scope){
      $scope.name = '<%= name %>';
    }
  };
});
