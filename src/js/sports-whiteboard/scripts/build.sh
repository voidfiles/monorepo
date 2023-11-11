#! /usr/bin/env bash

if command -v yum &> /dev/null; then
    yum search "zlib"
    yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
    export LD_PRELOAD=${PWD}/node_modules/canvas/build/Release/libz.so.1
else
    echo "ym not installed"
fi
# pwd
# env
next build