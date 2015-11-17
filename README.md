# FFXIV Crafting Optimizer Website

This project contains the source for the [FFXIV Crafting Optimizer Website](http://ffxiv.lokyst.net/). 
It uses [AngularJS](http://angularjs.org/), [AngularUI Bootstrap](http://angular-ui.github.io/bootstrap/), 
and [Bootstrap](http://getbootstrap.com/).


### Running the app during development

You can pick one of these options:

* serve this repository with your webserver
* install node.js and run:
  * `npm install`
  * `npm start`
* install Docker and run:
  * `docker build -t ffxiv-craft-opt-web .`
  * `docker run --rm -it -p 8001:8001 ffxiv-craft-opt-web`

Then navigate your browser to `http://localhost:<port>/app/index.html` to see the app running in
your browser.


### Translations

Localization files can be found in `app/locale`. The `app/locale/en.json` file is purposefully 
missing because the English strings are used as the translation keys. Strings which require
interpolation are defined in app.js so that they can be displayed immediately as a fallback until 
the actual locale json file finishes loading.
