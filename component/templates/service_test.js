'use strict';

describe('Component Service: <%= name %>', function () {
  var <%= name_camel %>Service;

  beforeEach(module('<%= name %>.service'));

  beforeEach(inject(function (_<%= name_camel %>Service_){
    <%= name_camel %>Service = _<%= name_camel %>Service_;
  }));

  /* Replace these tests with your own tests */
  it('should expose its name', function(){
    expect(<%= name_camel %>Service.name).toBe('<%= name %>');
  });
});
