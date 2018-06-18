/**
 * http blocks for esp8266
 */
//% weight=2 color=#002050 icon="\uf287"
namespace esp8266wifi {
  let event_src_esp8266wifi = 125
  let event_connect_succeeded = 1
  let event_connect_failed = 2
  let event_response_succeeded = 3
  let event_response_failed = 4
  let initialized: boolean = false
  let lastResult: string
  let lastError: string

  function parse(t: string) {
      let args: string[] = []
      let arg: string = ""
      for (let i = 0; i < t.length; i++) {
          let c = t.charCodeAt(i)
          if (c < 0x20 || c > 0x7e) {
              continue
          }
          if (t[i] != ",") {
              arg += t[i]
          } else {
              args.push(arg)
              arg = ""
          }
      }
      args.push(arg)
      return args
  }

  function bytes2str(array: number[]): string {
      let line: string = ""
      for (let i = 0; i < array.length; i++) {
          let v = array[i]
          if (v == 0) {
              return line
          }
          line += String.fromCharCode(v)
      }
      return line
  }

  function writeData(chunk: string) {
      pins.digitalWritePin(DigitalPin.P16, 0)
      pins.spiWrite(2)
      pins.spiWrite(0)
      for (let i: number = 0; i < 32; i++) {
          if (i < chunk.length) {
              pins.spiWrite(chunk.charCodeAt(i))
          } else {
              pins.spiWrite(0)
          }
      }
      pins.digitalWritePin(DigitalPin.P16, 1)
  }

  function readData(): number[] {
      let res: number[] = []
      pins.digitalWritePin(DigitalPin.P16, 0)
      pins.spiWrite(3)
      pins.spiWrite(0)
      for (let i: number = 0; i < 32; i++) {
          res.push(pins.spiWrite(0))
      }
      pins.digitalWritePin(DigitalPin.P16, 1)
      return res
  }

  function send(content: string) {
      for (let i: number = 0; i < content.length; i += 32) {
          writeData(content.substr(i, 32))
      }
      if (content.length % 32 == 0) {
          writeData("\x00")
      }
  }

  function _recv(): string {
      let res = ""
      let running = true
      while (running) {
          let chunk = bytes2str(readData())
          if (chunk.length < 32) {
              running = false
          }
          res += chunk
      }
      return res
  }

  function recv(): string {
      let begin = input.runningTime()
      while (true) {
          let now = input.runningTime()
          if (now - begin > 5000) {
              // recv timeout
              return ""
          }
          let res = _recv()
          if (res.length > 0) {
              return res
          }
          basic.pause(20)
      }
  }

  /**
   * Attaches Wi-Fi connect succeeded event handler
   */
  //% blockId=esp8266wifi_on_connect_succeeded block="on connect succeeded"
  export function onConnectSucceeded(cb: Action): void {
      control.onEvent(event_src_esp8266wifi, event_connect_succeeded, cb)
  }

  /**
   * Attaches Wi-Fi connect failed event handler
   */
  //% blockId=esp8266wifi_on_connect_failed block="on connect failed"
  export function onConnectFailed(cb: Action): void {
      control.onEvent(event_src_esp8266wifi, event_connect_failed, cb)
  }

  /**
   * Attaches Wi-Fi response succeeded event handler
   */
  //% blockId=esp8266wifi_on_response_succeeded block="on response succeeded"
  export function onResponseSucceeded(cb: Action): void {
      control.onEvent(event_src_esp8266wifi, event_response_succeeded, cb)
  }

  /**
   * Attaches Wi-Fi response failed event handler
   */
  //% blockId=esp8266wifi_on_response_failed block="on response failed"
  export function onResponseFailed(cb: Action): void {
      control.onEvent(event_src_esp8266wifi, event_response_failed, cb)
  }

  /**
   * Connect to Wi-Fi AccessPoint
   * @param ssid Wi-Fi ssid ,eg: "your-SSID"
   * @param password Wi-Fi password ,eg: "your-Password"
   */
  //% blockId=esp8266wifi_connect
  //% block="connect Wi-Fi ssid: %ssid| password: %password"
  //% blockExternalInputs = 1
  export function connect(ssid: string, password: string): void {
      if (!initialized) {
          pins.digitalWritePin(DigitalPin.P16, 1)
          pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
          pins.spiFormat(8, 3)
          pins.spiFrequency(1000000)
          initialized = true
      }
      send("c," + ssid + "," + password)
      let args = parse(recv())
      if (args.length > 3) {
          lastResult = args[3]
          if (args[1] === "200") {
              control.raiseEvent(event_src_esp8266wifi, event_connect_succeeded)
              return
          }
      }
      if (args.length > 2) {
          lastError = args[2];
      } else {
          lastError = "invalid response"
      }
      control.raiseEvent(event_src_esp8266wifi, event_connect_failed)
  }

  /**
   * HTTPS Get
   * @param url URL for internet resource ,eg: "http://host-address/path..."
   * @param fingerprint SHA1 fingerprint for server certificate (need for https://) ,eg: ""
   */
  //% blockId=esp8266wifi_https_get block="http get url %url |fingerprint %fingerprint"
  //% blockExternalInputs = 1
  export function httpGet(url: string, fingerprint: string): void {
      send("g," + url + "," + fingerprint)
      let args = parse(recv())
      if (args.length > 3) {
          lastResult = args[3]
          if (args[1] === "200") {
              control.raiseEvent(event_src_esp8266wifi, event_response_succeeded)
              return
          }
      }
      if (args.length > 2) {
          lastError = args[2];
      } else {
          lastError = "invalid response"
      }
      control.raiseEvent(event_src_esp8266wifi, event_response_failed)
  }

  /**
   * HTTP Post
   * @param url URL for internet resource ,eg: "http://host-address/path..."
   * @param fingerprint SHA1 fingerprint for server certificate (need for https://) ,eg: ""
   * @param data post data ,eg: "<data>"
   */
  //% blockId=esp8266wifi_https_post block="http post url %url |fingerprint %fingerprint |data %data"
  //% blockExternalInputs = 1
  export function httpPost(
      url: string,
      fingerprint: string,
      data: string = ""
  ): void {
      send("p," + url + "," + fingerprint + "," + data)
      let args = parse(recv())
      if (args.length > 3) {
          lastResult = args[3]
          if (args[1] === "200") {
              control.raiseEvent(event_src_esp8266wifi, event_response_succeeded)
              return
          }
      }
      if (args.length > 2) {
          lastError = args[2];
      } else {
          lastError = "invalid response"
      }
      control.raiseEvent(event_src_esp8266wifi, event_response_failed)
  }
}
