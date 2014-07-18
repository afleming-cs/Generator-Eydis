Eydís [Yeoman](http://yeoman.io) generator
==========================================

What is Eydís?
--------------

Eydís is a starter application for single-page applications that use AngularJS, Google Sign-in, and Google Cloud Endpoints.

Getting Started
---------------

Install Yeoman

```bash
$ npm install -g yo
```

Install the generator

```bash
$ npm install -g generator-eydis
```

Run the generator

```bash
$ yo eydis
```

Run gulp to develop

```bash
$ gulp watch
```

Developing Locally
------------------

 * Install the [LiveReload chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei).
 * Run ``gulp watch``. It'll start the server and open your browser.
 * Make sure LiveReload is enabled by clicking the button next to the toolbar.
 * Anytime you change a file in app (js, less, or html) the browser should auto-reload.
 * If you don't like auto-reload just click the button to turn off the extension.
 * Bower dependencies and js files in app are automatically wired. See the next two sections.


Installing and using dependencies
---------------------------------

  * Use bower. For example, to install the moment library use ``bower install --save moment``. It's important to use ``--save`` as it'll update the bower.json file with the new dependency.
  * The ``wiredep`` utility will automatically include the new depedency in ``index.html``. If you're using ``gulp watch`` then it's already happened, but you can run it manually using ``gulp wiredep``.


Automatic script wiring
-----------------------

All js files in ``app`` will be automatically included into ``index.html``. You don't have to do anything to make this happen if you're using ``gulp watch`` but you can run ``gulp wirescripts`` to trigger it manually. **Note** that no files ending in ``_test.js`` will be included.

Running Tests
-------------

Unfortunately Karma isn't well integrated into gulp yet. I'm waiting on some plugins to come into maturity. In the meantime you can run karma directly. Tests specs should live alongside the file/module they test. For example, ``users.js`` would be tested by ``users_test.js``.

 * Run ``karma start``.
 * It should detect and run all files in app.
 * However, it does not automatically wire bower depedencies. Edit ``karma.conf.js`` to add them.


Building & deploying
--------------------

To build your application simply run ``gulp build`` or just ``gulp`` (build is the default task). This task does quite a lot of things.

  * It builds the app inside of the ``dist`` folder.
  * It concats and minifies all js and css. External css and js is prepared into ``vendor.css`` and ``vendor.js``, respectively. Internal css and js is prepared into ``styles.css`` and ``scripts.js``, respectively.
  * It compiles all html files used by angular into a single js file. This neat trick means that angular never has to make a request to load a template file.
  * It copies over static assets like images, fonts, etc.
  * It prepares an ``app.yaml`` file for you.
  * More.

Once build is finished you can run your application by running:

    cd dist
    app-server

You can do all of this in one step by running ``gulp serve:dist``.

You can deploy using the normal ``appcfg.py`` tool from the ``dist`` folder.

If you need to prepare a debug build use ``gulp build:debug``.


License
-------

Apache, Version 2
