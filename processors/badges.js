var pull = require('pull-stream');
var reH1 = /^\s*#\s+/;
var reH2 = /^\s*#{2}\s+/;

function getBadgeLines(callback) {
  return callback(null, [ 'badger', 'badger', 'badger', '']);
}

module.exports = pull.Through(function(read) {
  var addedBadges = false;
  var inHeader = false;

  return function(end, cb) {
    function next(end, data) {
      var testLine;

      if (addedBadges || end) {
        return cb(end, data);
      }

      // get the test line (we are prepending content so it will be
      // the last line of the group if any mods have been made)
      testLine = data[data.length - 1];

      // check whether we are in the header section
      inHeader = inHeader || reH1.test(testLine);

      // if we are in the header and we hit a h2 then add the badges
      if (inHeader && reH2.test(testLine)) {
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