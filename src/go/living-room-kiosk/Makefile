PROJECT := living-room-kiosk
GO_PATH := $(shell go env GOPATH)
GOK := $(GO_PATH)/bin/gok
PWD := $(shell pwd)
PARENT_DIR := $(shell dirname `pwd`)

help:
	$(GOK) help

build_qemu:
	GOARCH=amd64 GOWORK=off $(GOK) overwrite --parent_dir $(PARENT_DIR) -i $(PROJECT) --full $(PWD)/build.img --target_storage_bytes=1258299392

build:
	GOARCH=arm64 GOWORK=off $(GOK) overwrite --parent_dir $(PARENT_DIR) -i $(PROJECT) --full $(PWD)/build.img --target_storage_bytes=1258299392

build_image:
	GOARCH=arm64 GOWORK=off $(GOK) overwrite --parent_dir $(PARENT_DIR) -i $(PROJECT) --full $(PWD)/build.img --target_storage_bytes=1258299392

add:
	cat config.json | jq -c -r .Packages[] | xargs -n 1 $(GOK) add --parent_dir $(PARENT_DIR) -i $(PROJECT)

_data/vmlinuz:
	curl -L "https://github.com/gokrazy/kernel/raw/main/vmlinuz" > _data/vmlinuz

_data/bcm2711-rpi-4-b.dtb:
	curl -L "https://github.com/gokrazy/kernel/raw/main/bcm2711-rpi-4-b.dtb" > _data//bcm2711-rpi-4-b.dtb

setup: _data/vmlinuz _data/bcm2711-rpi-4-b.dtb

boot_qemu:
	qemu-system-x86_64 \
		-machine pc \
		-smp 8 \
		-device e1000,netdev=net0 \
		-netdev user,id=net0,hostfwd=tcp:127.0.0.1:8888-:80 \
		-m 2048 \
		-drive file=$(PWD)/build.img,format=raw

boot_qemu_rpi:
	qemu-system-aarch64 \
		-machine virt -cpu cortex-a72 -smp 6 -m 2G \
		-drive "file=$(PWD)/build.img,if=none,index=0,media=disk,format=raw,id=disk0" \
    	-device 'virtio-blk-pci,drive=disk0,disable-modern=on,disable-legacy=off' \
		-device e1000,netdev=mynet \
		-netdev user,id=mynet,hostfwd=tcp:127.0.0.1:8888-:80 \
		-dtb "_data/bcm2711-rpi-4-b.dtb" \
		-kernel "_data/vmlinuz" \
   	 	-append 'root=/dev/vda2 panic=1'