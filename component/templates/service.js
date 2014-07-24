'use strict';

angular.module('<%= name %>.service', []).
factory('<%= name_camel %>Service', function(){
    var name = '<%= name %>';

    return {
        name: name
    };
});
