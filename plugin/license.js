/* jshint node: true */
'use strict';

var async = require('async');
var formatter = require('formatter');
var fs = require('fs');
var path = require('path');
var pull = require('pull-stream');
var licensePath = path.resolve(__dirname, '..', 'licenses');

/**
  ### license

  Insert the license at the tail end of your documentation.

**/

module.exports =  pull.Through(function(read, config, pkgInfo) {
  var ended = false;

  function readLicense(license, callback) {
    var licenseName = pkgInfo.license.replace(/\s/g, '-').toLowerCase();
    var licenseFile = path.join(licensePath, licenseName + '.txt');

    // read the file
    fs.readFile(licenseFile, 'utf8', function(err, data) {
      // if we had an error, abort
      if (err) {
        return callback(err);
      }

      callback(null, '### ' + license + '\n\n' + formatter(data)({
        year: new Date().getFullYear(),
        pkgInfo: pkgInfo
      }));
    });
  }

  return function(end, cb) {
    function next(end, data) {
      var licenseFile;
      var licenseName;

      // update the ended state
      ended = ended || end;

      // if end is an error, then abort
      if (end instanceof Error) {
        return cb(end, data);
      }
      // otherwise, if end is set then read the appropriate license
      else if (end && pkgInfo.license) {
        async.map(
          [].concat(pkgInfo.license),
          readLicense,
          function(err, results) {
            if (err) {
              return cb(err);
            }

            cb(null, ['\n## License(s)\n\n' + results.join('\n\n')]);
            cb(end, data);
          }
        );
      }
      else {
        cb(end, data);
      }
    }

    return ended ? null : read(end, next);
  };
});