
include settings.mk
ARDUINO_ROOT := /Applications/Arduino.app/Contents/Java
ARDUINO_PKGS := ~/Library/Arduino15/packages
ARDUINO_HOME := ~/Documents/Arduino
SERIAL_PORT  := /dev/tty.usbserial-DN01ES83

NAME         := simple-gateway
DEPLOY_NAME  := $(NAME)-$(VERSION)
TARGET_DIR   := $(CURDIR)/build
CODE_SOURCE  := $(CURDIR)/$(NAME)
CODE_MAIN    := $(CODE_SOURCE)/$(NAME).ino
CODE_BIN     := $(TARGET_DIR)/$(DEPLOY_NAME).ino.bin
CODE_SOURCES := $(shell find $(CODE_SOURCE) -type f -maxdepth 1)
ALL_SOURCS   := $(CODE_SOURCES) $(CODE_SOURCE)/gen/version.h

DEBUG_OPTION := Debug=Disabled,DebugLevel=None____
#DEBUG_OPTION := Debug=Serial,DebugLevel=HTTPClient

.PHONY: all clean build flash update data format docker genversion

all: clean build 

clean:
	@rm -rf $(TARGET_DIR) $(CODE_SOURCE)/gen

build: $(CODE_BIN)

genversion: $(CODE_SOURCE)/gen/version.h

$(CODE_SOURCE)/gen/version.h: settings.mk
	mkdir -p $(CODE_SOURCE)/gen
	printf '#define VERSION "%s"\n' $(VERSION) > $(CODE_SOURCE)/gen/version.h
	printf '#define REVISION "%s"' $(REVISION) >> $(CODE_SOURCE)/gen/version.h

$(CODE_BIN): $(ALL_SOURCS)
	mkdir -p $(TARGET_DIR)
	arduino-builder -compile \
	-hardware $(ARDUINO_ROOT)/hardware \
	-tools $(ARDUINO_ROOT)/tools-builder \
	-hardware $(ARDUINO_PKGS) \
	-tools $(ARDUINO_PKGS) \
	-libraries $(ARDUINO_HOME)/libraries \
	-fqbn "esp8266:esp8266:generic:CpuFrequency=160,FlashFreq=80,FlashMode=qio,UploadSpeed=230400,FlashSize=2M,ResetMethod=nodemcu,$(DEBUG_OPTION)" \
	-build-path $(TARGET_DIR) \
	$(CODE_MAIN)
	mv $(TARGET_DIR)/$(NAME).ino.bin $@

flash: $(CODE_BIN)
	esptool.py -p $(SERIAL_PORT) -b 230400 --before no_reset --after no_reset write_flash \
	--flash_freq 80m --flash_size 2MB --flash_mode qio \
	0x000000 $(CODE_BIN)

format: $(DATA_BIN)
	esptool.py -p $(SERIAL_PORT) -b 230400 --before no_reset --after no_reset write_flash \
	--flash_freq 80m --flash_size 2MB --flash_mode qio \
	0x100000 $(DATA_BIN)

docker: genversion
	$(MAKE) -f Makefile.docker

monitor:
	# Exit: Ctrl+a -> k -> y
	screen $(SERIAL_PORT) 115200 
