# gendocs

This is a simple documentation generator that generates an output markdown
file designed to be saved as your `README.md` in your repository.

[![Build Status](https://travis-ci.org/DamonOehlman/gendocs.png?branch=master)](https://travis-ci.org/DamonOehlman/gendocs)

## Usage

First install:

```
npm install -g gendocs
```

Then run in a repository directory:

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
