'use strict';

describe('Component Directive: <%= name %>', function(){
  var elm, scope;

  beforeEach(module('<%= name %>.directive', 'components/<%= name %>/<%= name %>-directive.html'));

  beforeEach(inject(function($rootScope, $compile){
    elm = angular.element('<<%= name_dashed %>></<%= name_dashed %>>');
    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();
  }));

  it('Should display its name.', function(){
    expect(elm.text().indexOf('<%= name %>')).not.toBe(-1);
  });
});
