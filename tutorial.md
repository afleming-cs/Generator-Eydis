Eydís Tutorial
==============

Eydís is not a framework in the typical sense. Eydís is a collection of tools and best practices for creating front-end web applications. The primary goal of Eydís is to provide a skeleton for AngularJS projects that depend on Google APIs.


Getting started
---------------

In order to begin using Eydís you need a working and sane node.js environment. Make sure the yeoman, bower, gulp,  and karma are all installed

    npm install -g yo bower karma gulp

Now it's just necessary to install the Eydís yeoman generator:

    npm install -g generator-eydis

Now, we'll need to create a new project and run the generator

    mkdir eydis-drive
    cd eydis-drive
    yo eydis

It will now ask you a series of questions. For the project name use ``eydis_drive``. For the remaining questions you'll need to create a project in the Google Developer Console.

The project will be generated and will take a few minutes to install dependencies.


Running your code
-----------------

Now that you've got a project created it's time to take a look at it.

    gulp watch

Gulp is a task runner. Eydís generates a bunch of tasks for you but the one most commonly used will be ``watch``. Watch runs the application server and watches the file system for changes and triggers livereload. To take advantage of livereload you'll need to install the livereload chrome extension.

Gulp should have opened a new tab in your browser. If not, open up http://localhost:8081/. 

You should see a G+ Sign-in button. Once you sign-in and authorize the application you should see a simple "I am section default" message. 


Making changes
--------------

Some quick things to play around with:

* You can edit app/default/default.html to change the content in the default section.
* You can edit main.less and gulp will automatically build it into main.css

Whenever you make a change livereload will be triggered. You can of course turn temporarily turn off the livereload extension if needed. In general, you should design apps that can be refreshed with minimal interference.


Sections
--------

Sections are mostly independent parts of your application that have *routes*. This is an important distinction that separates sections from components. Sections consume components to present to the user and allow for user interaction. Sections are capable of having sub-sections as well.

We're going to create a new section that lists all files in Google Drive. Luckily, yeoman can do this for us.

    yo eydis:section file_list

Now that we've done this we need to do a little bit of wiring to make it work. First, we'll use gulp to automatically include the js files. This way you don't have to manually write the script tags.

    gulp wire

Now that we've got that we just need to add our section as a dependency in ``app/app.js``.

    angular
      .module('EydisDriveApp', [
        /* Include sections here. The sections will include their own dependencies */
        'section.default',
        'section.file_list',
        ...


We can now access the file list section using http://localhost:8081/file_list. However, if we want we can change the URL by modifying ``app/file_list/file_list.js``:

    /* Configure routes */
    config(function($routeProvider){
      $routeProvider
        .when('/files', {
          templateUrl: 'file_list/file_list.html',
          controller: 'fileListCtrl',
          controllerAs: 'file_list'
        });
    })

Each section configures it own routes so be careful not to overwrite another section's routes!

We also might want to skip the default section all together and go to the file list section. We can do this in ``app/app.js``.

      /* Default route configuration */
      .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        /* Here we'll just route to the default subsection. Subsections do their own routing. */
        $routeProvider
          .when('/', {
            redirectTo: '/files' //! <--- changed
          })
          .otherwise({
            redirectTo: '/'
          });
      })


Components and Services
-----------------------

Now that we have a section to display data we need a service that actually fetches the data for our section's controller. This is a great use case for a component. Unlike sections, there's no routing to components and they are intended to be re-usable. Like sections, yeoman can generate for us:

    yo eydis:component drive

Make sure to select "service" and not "directive" when generating the component. Again, you'll want to run wire to insert script tags for you.

    gulp wire

Open up ``app/components/drive/drive-service.js``. Our service doesn't have much to it yet but it has enough for us to inject it into our controller and start playing around. Open up ``app/file_list/file_list.js`` and add our service as a dependency:

    angular.module('section.file_list', [
      'ngRoute',
      /* Add additional dependencies here */
      'drive.service'
    ]).

And then modify the controller to make a quick call to it:

    /* Controller */
    .controller('fileListCtrl', function(driveService){
      this.name = 'file_list';
      this.service_name = driveService.name;
    });

Finally, modify the section's view at ``app/file_list/file_list.html``:

    <div>
    I am section {{file_list.name}} and I have service {{file_list.service_name}}.
    </div>

If you refresh the page you should now see the following text:

    I am section file_list and I have service drive.


Using Google APIs
-----------------

Now we'll actually load and use a Google API in our service. Before we can do that, we'll need to add a scope to the OAuth configuration. Modify ``app/app.js`` to include the scope for Google Drive:


    /* Google API configuration */
    .config(function($gapiProvider){
      $gapiProvider.client_id = '...';
      $gapiProvider.scopes.push('https://www.googleapis.com/auth/drive');
      ...

NOTE: Before we continue make sure you have turned on the Google Drive API in the Developer Console.


When the page refreshes you'll likely have to re-login to approve the new scopes. Now that we've got that working we can load Google Drive. Modify ``drive-service.js``:

    'use strict';

    angular.module('drive.service', ['eydis.gapi']).
    factory('driveService', function($gapi){
        var name = 'drive';

        var ready = $gapi.load('drive', 'v2');

        var list_files = function(){
          return $gapi.client.drive.files.list({maxResults: 10});
        };

        return {
            name: name,
            ready: ready,
            list_files: list_files
        };
    });


We added quite a lot. Let's review line by line. First, we added a dependency on the Google API helper, ``eydis.gapi``:

    angular.module('drive.service', ['eydis.gapi']).
    factory('driveService', function($gapi){

Then we loaded the Google Drive API- this returns a promise.

    var ready = $gapi.load('drive', 'v2');

Finally, we create a simple function that lists files for us:

    var list_files = function(){
      return $gapi.client.drive.files.list({maxResults: 10});
    };

Notice that unlike the normal ``gapi``, we're not calling ``execute``. Eydís wraps all of the gapi functions to make them return promises instead.


Consuming Services
------------------

With the service in place we can start using it on our controller. Modify ``app/file_list/file_list.js``:

    /* Controller */
    .controller('fileListCtrl', function(driveService){
      var that = this;

      this.name = 'file_list';
      this.service_name = driveService.name;

      driveService.ready.then(function(){
        driveService.list_files().then(function(r){
          that.files = r;
        });
      });
    });

Here, we're waiting until the drive service is ready and then making the call to list all of the user's files.

All that's left is to show them in the template:

    <ul>
      <li ng-repeat="file in file_list.files.items">
        {{file.title}}
      </li>
    </ul>


Summary
-------

You should now have a working application that lists some files from a user's Google Drive. There's plenty more to explore within Eydís, such as creating more sections and using directives.

