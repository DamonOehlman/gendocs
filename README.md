# gendocs

This is a simple documentation generator that generates an output markdown
file designed to be saved as your `README.md` in your repository.


[![NPM](https://nodei.co/npm/gendocs.png)](https://nodei.co/npm/gendocs/)

[![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](https://github.com/badges/stability-badges) [![Dependency Status](https://david-dm.org/DamonOehlman/gendocs.svg)](https://david-dm.org/DamonOehlman/gendocs) 

## Usage

Install using the instructions shown in the lovely
[nodei.co](http://nodei.co) badge above then run in a repository directory:

```
gendocs > README.md
```

Done. By default all `gendocs` does is extract all special
[emu](https://github.com/puffnfresh/emu.js) comments from your source files
and generate a single markdown file using a sensible ordering system
implemented by [sourcecat](https://github.com/DamonOehlman/sourcecat).

Emu looks for standard JS block comments, but with two asterisks instead
of one.  While emu is unfussy about the content of those comments, gendocs
is expecting mardown formatted text to be present.

For example:

```js
/**
  # module-level

  This is a module which does blah.

  ## Example Usage

  Jump up and down.

  ## Reference

**/

/**
  ### sayHello(target)

  The `sayHello` function is used to say, um, hello to the specified
  target.
**/
exports.sayHello = function(target) {
};
```

__NOTE:__ As emu is a little fussy about the indentation of the
documentation within the comment block, it's wise to make sure you indent
your documentation one level in from the opening comment. If you haven't
you will notice this with code samples losing indentation.

## Customizing Output

Gendocs uses a simple plugin system to allow you to customize the
documentation generated. Most plugins are manually enabled through
configuration within a `docs.json` file, though some are enabled
automatically.

### badges

Generate badges for your documentation without having to remember those
special markdown image link things.

Will be inserted just before the first non top level (`#`) heading
encountered in your documentation.

#### Example Docs Configuration for Simple Badges

```json
{
  "badges": {
    "nodeico": true,
    "travis": true,
    "stability": "experimental",
    "testling": true
  },

  "license": {}
}
```

If you want to bootstrap a new `docs.json` file in your project directory
then try the following:

```
curl https://gist.github.com/DamonOehlman/6249137/raw > docs.json
```

### include-code

Copy and paste.  Yeah, I'm not a fan.  If I'm going to write some example
code, I'd rather write it once and include it into a file.  This plugin
helps you do that and it's enabled by default.

Any time a line similar to the following is encountered:

```markdown
<<< examples/demo.js
```

The file contents is included and an appropriate Github flavoured markdown
code section is created with the syntax highlighting mode to set match
the file type.  So in the case of our previous example, something like the
following might get created in our resulting markdown file:

```
!!!js
console.log('this is a tricky demo');
!!!
```

You have to imagine that the exclamation marks are backticks in the output
above, but you get the idea.

__NOTE:__ Should you wish to highlight a syntax that is different to it's
extension (or it's extension is not recognised), simply specify the
highlighter syntax directly after the the `<<<` directive.  For example,
to include a stylus file using the css highlighter, you could do something
like:

```
<<<css examples.styl
```

#### Regarding Relative File Paths

At this stage, **all** include paths are relative to the project root rather
than the source file location.  So if you had were including an example from
a subfolder in your project, rather than referencing `../examples/demo.js`
simply reference `examples/demo.js` and everything will be sweet.

#### Including Example code from Github Gists

If you have example code in a [gist](https://gist.github.com) then you
can include that into your readme also quite easily.  For example:

```
<<< gist://DamonOehlman:6249137
```

However, as gendocs is unable to determine what the file type is from a
raw http request (and github serves all raw content as text/plain IIRC) you
need to tell gendocs the typeof of syntax highlighting you want:

```
<<<json gist://DamonOehlman:6249137
```

#### Alternative Include Format (Leanpub Compatible)

In addition to the format outlined above, I have been experimenting with
adding support for the [leanpub](https://leanpub.com/) markdown includes:

https://github.com/peterarmstrong/leanpub_sample_markdown_book/blob/master/Leanpub%20Book%20Format.md

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

## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
