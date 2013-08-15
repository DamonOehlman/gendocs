/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var pull = require('pull-stream');
var reInclude = /^\s*\<{3}\s+(\S+)/;

/**
  ### include-code

  Copy and paste.  Yeah, I'm not a fan.  If I'm going to write some example
  code, I'd rather write it once and include it into a file.  This plugin
  helps you do that and it's enabled by default.

  Any time a line similar to the following is encountered:

  ```markdown
  \<\<\< examples/demo.js
  ```

  The file contents is included and an appropriate Github flavoured markdown
  code section is created with the syntax highlighting mode to set match
  the file type.  So in the case of our previous example, something like the
  following might get created in our resulting markdown file:

  ```markdown
  \`\`\`js
  console.log('this is a tricky demo');
  \`\`\`
  ```

  Sweet, eh?

  __NOTE:__ At this stage includes are processed relative to the root
  of the project.  So in the case where you are defining an include that
  exists within a subfolder of a project, remap the example code include
  back to the project root.  For example, you would probably use
  `examples/demo.js` rather than `../examples/demo.js`.  Just something to
  be aware of and an artifact of the way gendocs uses sourcecat at the present
  time.
**/

module.exports =  pull.Through(function(read, config, pkgInfo) {
  return function(end, cb) {
    function next(end, data) {
      // run the test on the first line in the data only at this stage
      // TODO: process all the lines in case things have generated includes
      var match = data && reInclude.exec(data[0]);
      var fileType;

      // if this is not a match, pass the data on
      if (! match) {
        return cb(end, data);
      }

      // get the filetype
      fileType = path.extname(match[1]).slice(1);

      // read the contents of the specified file
      fs.readFile(path.resolve(match[1]), 'utf8', function(err, contents) {
        // if we encountered an error, include an error message in the
        // output
        if (err) {
          fileType = '';
          contents = 'ERROR: could not find: ' + match[1];
        }

        // send the data along
        cb(
          end,
          ['```' + fileType]
            .concat(contents.split('\n'))
            .concat(data.slice(1))
            .concat('```')
        );
      });
    }

    return read(end, next);
  };
});