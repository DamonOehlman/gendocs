/* jshint node: true */
'use strict';

var out = require('out');
var path = require('path');
var sourcecat = require('sourcecat');
var emu = require('emu');
var pull = require('pull-stream');

/**
  # gendocs

  This is a simple documentation generator that generates an output markdown
  file designed to be saved as your `README.md` in your repository.

  ## Usage

  First install:

  ```
  npm install -g gendocs
  ```

  Then run in a repository directory:

  ```
  gendocs > README.md
  ```

  Done.

  ## Customizing Output

  By default all `gendocs` does is extract all special
  [emu](https://github.com/puffnfresh/emu.js) comments from your source files
  and generate a single markdown file using a sensible ordering system
  implemented by [sourcecat](https://github.com/DamonOehlman/sourcecat).

  Given the chance though, it will be even more helpful using the processors
  documented below:

**/

module.exports = function(args, callback) {
  var pkgInfo = {};
  var docInfo = {};
  var plugins = [];

  try {
    // attempt to include package info
    pkgInfo = require(path.resolve('package.json'));

    // go a step futher and attempt to read doc info
    docInfo = require(path.resolve('docs.json'));
  }
  catch (e) {
  }

  // load the plugins
  plugins = Object.keys(docInfo).map(function(plugin) {
    try {
      return require('./plugin/' + plugin)(docInfo[plugin], pkgInfo);
    }
    catch (e) {
      return null;
    }
  }).filter(Boolean);

  // sourcecat
  sourcecat.generate('**/*.js', function(err, files) {
    var content;

    if (err) {
      return callback(err);
    }

    // concat
    content = files.map(function(file) {
      return file.content.toString('utf8');
    }).join('');

    // run the conversion pipeline
    pull.apply(pull, [
      pull.values(emu.getComments(content).split('\n')),
      pull.group(1)
    ].concat(plugins).concat([
      pull.flatten(),
      pull.collect(function(err, lines) {
        callback(null, lines.join('\n'));
      })      
    ]));
  });
};