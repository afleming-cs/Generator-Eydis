'use strict';

describe('Controller: <%= name_camel %>', function () {

  beforeEach(module('section.<%= name %>'));

  var Ctrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    Ctrl = $controller('<%= name_camel %>Ctrl as <%= name %>', {$scope: scope});
  }));

  it('should know its name.', function(){
    expect(scope.<%= name %>.name).toBe('<%= name %>');
  });
});
