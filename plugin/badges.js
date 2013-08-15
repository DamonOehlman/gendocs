/* jshint node: true */
'use strict';

var pull = require('pull-stream');
var reNonH1 = /^\s*#{2,}\s+/;

/**
  ### badges

  Generate badges for your documentation without having to remember those
  special markdown image link things.

  Will be inserted just before the first non top level (`#`) heading
  encountered in your documentation.

**/

function getBadgeLines(callback) {
  return callback(null, [ 'badger', 'badger', 'badger', '']);
}

module.exports = pull.Through(function(read, config) {
  var addedBadges = false;

  return function(end, cb) {
    function next(end, data) {
      if (addedBadges || end) {
        return cb(end, data);
      }

      // get the test line (we are prepending content so it will be
      // the last line of the group if any mods have been made)
      if (reNonH1.test(data[data.length - 1])) {
        getBadgeLines(function(err, lines) {
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