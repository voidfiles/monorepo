#! /bin/bash

my_var=$(cat dist/index.js.bookmarklet)

cat readme.template.md | sed "s/SCRIPT_GOES_HERE/${my_var}/g" > readme.md