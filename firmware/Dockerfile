FROM ubuntu:xenial

RUN apt update && apt install --yes curl make xz-utils vim
ENV ARDUINO_IDE_VERSION=1.8.5
ENV ARDUINO_ROOT=/opt/arduino-${ARDUINO_IDE_VERSION}
ENV DOWNLOAD=https://downloads.arduino.cc/arduino-${ARDUINO_IDE_VERSION}-linux64.tar.xz
RUN mkdir -p /opt && curl ${DOWNLOAD} | tar xJ -C /opt
RUN mkdir -p ~/.arduino15 && echo boardsmanager.additional.urls=http://arduino.esp8266.com/stable/package_esp8266com_index.json >> ~/.arduino15/preferences.txt
ENV ESPSDK_VERSION=2.4.1
ENV PATH=${ARDUINO_ROOT}:${PATH}
RUN arduino --install-boards "esp8266:esp8266:${ESPSDK_VERSION}"
RUN arduino --install-library "ArduinoJson:5.13.2"
RUN apt install --yes npm && npm install -g standalone-html && update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10
ADD . /src
WORKDIR /src
RUN make build ARDUINO_ROOT=${ARDUINO_ROOT} \
    ARDUINO_PKGS=~/.arduino15/packages \
    ARDUINO_HOME=~/Arduino \
    SERIAL_PORT=/dev/ttyAMA0
