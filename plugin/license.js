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

  Insert the license at the tail end of your documentation. Uses the current
  year and package information from the `package.json` file to generate an 
  appropriate license for your project.  The license(s) that will be appended
  to your README are based on the licenses specified in the `package.json`
  file also.

  To enable, you will need to inform `docs.json` that you want this
  functionality:

  ```json
  {
    "license": {}
  }
  ```
  
  If you want to override the copyright holder (or year) from the default of
  the author in the package.json file, then use the following in your
  `docs.json` file:

  ```json
  {
    "license": {
      "year": "2008 - 2013",
      "holder": "Foobar Corp <development@foobar.com>"
    }
  }
  ```

  Currently implemented license templates can be found at the following
  location:

  <https://github.com/DamonOehlman/gendocs/tree/master/licenses>


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
        year: config.year || new Date().getFullYear(),
        holder: config.holder || pkgInfo.author
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