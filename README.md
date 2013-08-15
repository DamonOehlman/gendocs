# gendocs

This is a simple documentation generator that generates an output markdown
file designed to be saved as your `README.md` in your repository.


[![NPM](https://nodei.co/npm/gendocs.png)](https://nodei.co/npm/gendocs/)

[![Build Status](https://travis-ci.org/DamonOehlman/gendocs.png?branch=master)](https://travis-ci.org/DamonOehlman/gendocs)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)

## Usage

Install using the instructions shown in the lovely
[nodei.co](http://nodei.co) badge above then run in a repository directory:

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

### badges

Generate badges for your documentation without having to remember those
special markdown image link things.

Will be inserted just before the first non top level (`#`) heading
encountered in your documentation.

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

<code>
```js
console.log('this is a tricky demo');
```
</code>

Sweet, eh?

__NOTE:__ At this stage includes are processed relative to the root
of the project.  So in the case where you are defining an include that
exists within a subfolder of a project, remap the example code include
back to the project root.  For example, you would probably use
`examples/demo.js` rather than `../examples/demo.js`.  Just something to
be aware of and an artifact of the way gendocs uses sourcecat at the present
time.
