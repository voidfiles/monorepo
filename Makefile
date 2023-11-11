.SILENT: ; # no need for @

PWD    :=$(shell pwd)
GOOS   :=$(shell go env GOOS)
GOARCH :=$(shell go env GOARCH)

bootstrap:
	(cd ${PWD}/src/go/mrun && go build -o ${PWD}/mrun_${GOOS}_${GOARCH})
	sudo cp ${PWD}/mrun_${GOOS}_${GOARCH} /usr/local/bin/mrun