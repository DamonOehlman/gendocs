/* jshint node: true */
'use strict';

var pull = require('pull-stream');
var util = require('../util');
var reNonH1 = /^\s*#{2,}\s+/;
var stabilityColors = {
  deprecated: 'aa8899',
  experimental: 'red',
  unstable: 'yellowgreen',
  stable: 'green',
  frozen: 'blue',
  locked: '00bbff'
};

/**
  ### badges

  Generate badges for your documentation without having to remember those
  special markdown image link things.

  Will be inserted just before the first non top level (`#`) heading
  encountered in your documentation.

  #### Example Docs Configuration for Simple Badges

  <<<json gist://DamonOehlman:6249137

  If you want to bootstrap a new `docs.json` file in your project directory
  then try the following:

  ```
  curl https://gist.github.com/DamonOehlman/6249137/raw > docs.json
  ```

**/

var generators = {
  travis: function(enabled, pkgInfo) {
    var project = util.getRepoName(pkgInfo);

    return enabled && project ? [
      '[',
      '![Build Status]',
      '(https://api.travis-ci.org/' + project.path + '.svg?branch=master)',
      '](https://travis-ci.org/' + project.path + ')'
    ].join('') + ' ' : '';
  },

  drone: function(enabled, pkgInfo) {
    var p = util.getRepoName(pkgInfo);

    return enabled && p ? [
      '[',
      '![Build Status]',
      '(https://drone.io/' + p.host + '/' + p.path + '/status.png)',
      '](https://drone.io/' + p.host + '/' + p.path + '/latest)'
    ].join('') + ' ' : '';
  },

  testling: function(enabled, pkgInfo) {
    var project = util.getRepoName(pkgInfo);

    return enabled && project ? '\n' + [
      '[',
      '![browser support]',
      '(https://ci.testling.com/' + project.path + '.png)',
      '](https://ci.testling.com/' + project.path + ')'
    ].join('') + '\n\n' : '';
  },

  david: function(enabled, pkgInfo) {
    var project = util.getRepoName(pkgInfo);

    return enabled && project ? [
      '[',
      '![Dependency Status]',
      '(https://david-dm.org/' + project.path + '.svg)',
      '](https://david-dm.org/' + project.path + ')'
    ].join('') + ' ': '';
  },

  stability: function(stability, pkgInfo) {
    var color;

    // if not a stability string, then abort
    if (! stability) {
      return [];
    }

    // if docs.json indicates stability should be included, then read from the pkgInfo
    if (stability === true) {
      stability = pkgInfo.stability || 'experimental';
    }

    color = stabilityColors[stability] || 'lightgrey';
    return [
      '[',
      '![' + stability + ']',
      '(https://img.shields.io/badge/stability-' + stability + '-' + color + '.svg)',
      '](https://github.com/dominictarr/stability#' + stability + ')'
    ].join('') + ' ';
  },

  nodeico: function(flags, pkgInfo) {
    // TODO: do something sensible with the flags
    return flags ? '\n' + [
      '[',
      '![NPM]',
      '(https://nodei.co/npm/' + pkgInfo.name + '.png)',
      '](https://nodei.co/npm/' + pkgInfo.name + '/)'
    ].join('') + '\n\n' : '';
  },

  gitter: function(room, pkgInfo) {
    // room could be true or an empty object if we have
    // read this directly from json
    if (typeof room != 'string') {
      room = util.getRepoName(pkgInfo).path;
    }

    return '\n' + [
      '[',
      '![Gitter chat]',
      '(https://badges.gitter.im/' + room + '.png)',
      '](https://gitter.im/' + room + ')'
    ].join('') + '\n\n';

  },

  group: function(name, pkgInfo) {
    return '\n' + [
      '[',
      '![' + name + ' google group]',
      '(http://img.shields.io/badge/discuss-' + name + '-blue.svg)',
      '](https://groups.google.com/forum/#!forum/' + name.replace(/\./g, '-') + ')'
    ].join('') + '\n\n';
  },

  bithound: function(enabled, pkgInfo) {
    var p = util.getRepoName(pkgInfo);
    var host = p && p.host.split('.')[0];

    return enabled && p ? [
      '[',
      '![bitHound Score]',
      '(https://www.bithound.io/' + host + '/' + p.path + '/badges/score.svg)',
      '](https://www.bithound.io/' + host + '/' + p.path + ')'
    ].join('') + ' ' : '';
  },

  codeclimate: function(enabled, pkgInfo) {
    var p = util.getRepoName(pkgInfo);
    var host = p && p.host.split('.')[0];

    return enabled && p ? [
      '[',
      '![Code Climate]',
      '(https://codeclimate.com/' + host + '/' + p.path + '/badges/gpa.svg)',
      '](https://codeclimate.com/' + host + '/' + p.path + ')'
    ].join('') + ' ' : '';
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
          // cleanup the lines to ensure empty lines are removed
          lines = (lines || []).filter(Boolean).concat('\n\n').concat(data);

          addedBadges = true;
          cb(null, [ lines.join('') ]);
        });
      }
      else {
        return cb(end, data);
      }
    }

    return read(end, next);
  };
});
