.SILENT: ; # no need for @

include ../envfile.mk

LOCAL_IP        := $(shell multipass list --format=json | jq -j -rc '.list[] | select( .name | contains("local")) | .ipv4[0]' | tr -d '\n');
VERBOSE         ?=
ASK_FOR_PASS    ?=
TAGS            ?=
ARTIFACT_DIR    := $(PROJECT_DIR)/_artifacts
WORKDIR         := $(PROJECT_DIR)/_workdir

export

setup:
	which -s python3 || brew install python3
	which -s pipenv || brew install pipenv
	pipenv --python 3
	pipenv install
	pipenv run ansible --version
	pipenv run ansible-galaxy install -r requirements.yml --force
	curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl

local:
	./scripts/local.sh

clear:
	# multipass exec local sudo tailscale logout
	multipass delete local
	multipass purge

shell:
	multipass shell local

variables:
	$(foreach v,                                        \
		$(filter-out $(VARS_OLD) VARS_OLD,$(.VARIABLES)), \
		$(info $(v) = $($(v))))