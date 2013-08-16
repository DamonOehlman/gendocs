/* jshint node: true */
'use strict';

var pull = require('pull-stream');
var util = require('../util');
var reNonH1 = /^\s*#{2,}\s+/;

/**
  ### badges

  Generate badges for your documentation without having to remember those
  special markdown image link things.

  Will be inserted just before the first non top level (`#`) heading
  encountered in your documentation.

  #### Example Docs Configuration for Simple Badges

  <<<json gist://6249137

  If you want to bootstrap a new `docs.json` file in your project directory
  then try the following:

  ```
  curl https://raw.github.com/gist/6249137 > docs.json
  ```

**/

var generators = {
  travis: function(enabled, pkgInfo) {
    var project = util.getRepoName(pkgInfo);

    return enabled && project ? [
      '[',
      '![Build Status]',
      '(https://travis-ci.org/' + project + '.png?branch=master)',
      '](https://travis-ci.org/' + project + ')'
    ].join('') : '';
  },

  testling: function(enabled, pkgInfo) {
    var project = util.getRepoName(pkgInfo);

    return enabled && project ? '\n' + [
      '[',
      '![browser support]',
      '(https://ci.testling.com/' + project + '.png)',
      '](https://ci.testling.com/' + project + ')'
    ].join('') + '\n' : '';
  },

  stability: function(stability) {
    return [
      '[',
      '![' + stability + ']',
      '(http://hughsk.github.io/stability-badges/dist/' + stability + '.svg)',
      '](http://github.com/hughsk/stability-badges)'
    ].join('');
  },

  nodeico: function(flags, pkgInfo) {
    // TODO: do something sensible with the flags
    return flags ? '\n' + [
      '[',
      '![NPM]',
      '(https://nodei.co/npm/' + pkgInfo.name + '.png)',
      '](https://nodei.co/npm/' + pkgInfo.name + '/)'
    ].join('') + '\n' : '';
  }
};

function getBadgeLines(config, pkgInfo, callback) {
  callback(null, Object.keys(config).map(function(badgeType) {
    var generator = generators[badgeType];

    if (typeof generator == 'function') {
      return generator(config[badgeType], pkgInfo);
    }

    return '';
  }).concat(''));
}

module.exports = pull.Through(function(read, config, pkgInfo) {
  var addedBadges = false;

  return function(end, cb) {
    function next(end, data) {
      if (addedBadges || end) {
        return cb(end, data);
      }

      // get the test line (we are prepending content so it will be
      // the last line of the group if any mods have been made)
      if (reNonH1.test(data[data.length - 1])) {
        getBadgeLines(config, pkgInfo, function(err, lines) {
          addedBadges = true;
          cb(null, (err ? [] : lines).concat(data));
        });
      }
      else {
        return cb(end, data);
      }
    }

    return read(end, next);
  };
});