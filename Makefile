# Copyright 2017 Berkeley Electronic Press.
# All rights reserved.
#
.SILENT: ; # no need for @

PROJECT			=monorepo
PROJECT_DIR	    =$(shell pwd)
OS              := $(shell go env GOOS)
ARCH            := $(shell go env GOARCH)

GITHASH         :=$(shell git rev-parse --short HEAD)
GITBRANCH       :=$(shell git rev-parse --abbrev-ref HEAD)
GITTAGORBRANCH 	:=$(shell sh -c 'git describe --always --dirty 2>/dev/null')
BUILDDATE      	:=$(shell date -u +%Y%m%d%H%M)

ARTIFACT_DIR    :=$(PROJECT_DIR)/_artifacts
WORKDIR         :=$(PROJECT_DIR)/_workdir


setup:
	which -s brew || ./setup/install_homebrew.sh

clean:
	rm -f $(WORKDIR)/*
	rm -f $(ARTIFACT_DIR)/*