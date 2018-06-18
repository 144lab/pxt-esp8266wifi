# esp8266 firmware

* Arduino-Core SDK 2.3.0

# protocol

要求:

* WiFi 接続: `c,<ssid>,<password>` + CRLF
* 接続確認: `?` + CRLF
* HTTP-GET: `g,<uri>,<fingerprint>,<filter>` + CRLF
* HTTP-POST: `g,<uri>,<fingerprint>,<payload>,<filter>` + CRLF

応答:

* `<code>,<message>,<payload>` + CRLF

ex:

```
g,http://10.0.0.3:8888/content.json
200,OK,{"result":"ok"}
```
