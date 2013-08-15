/* jshint node: true */
'use strict';

var pull = require('pull-stream');
var util = require('../util');
var reNonH1 = /^\s*#{2,}\s+/;

var generators = {
  travis: function(config, pkgInfo) {
    var project = util.getRepoName(pkgInfo);

    return config && project ? [
      '[',
      '![Build Status]',
      '(https://travis-ci.org/' + project + '.png?branch=master)',
      '](https://travis-ci.org/' + project + ')'
    ].join('') : '';
  }
};

/**
  ### badges

  Generate badges for your documentation without having to remember those
  special markdown image link things.

  Will be inserted just before the first non top level (`#`) heading
  encountered in your documentation.

**/

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