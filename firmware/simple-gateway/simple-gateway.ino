#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <SPISlave.h>

#include "types.h"

#define BAUDRATE 115200

HTTPClient http;

String command;

String buffer;

void onData(uint8_t *data, size_t len) {
  String chunk = String((char *)data);
  buffer += chunk;
  if (chunk.length() == 32) {
    return;
  }
  Serial.printf("command(%dbytes): %s\r\n", buffer.length(), buffer.c_str());
  command = buffer;
  buffer = "";
}

String replyContent;
uint8_t zeros[32] = {0};

bool replyChunk() {
  uint8_t chunk[33] = {0};
  if (replyContent.length() == 0) {
    SPISlave.setData(chunk, 32);
    return false;
  }
  unsigned int len = min(replyContent.length(), (unsigned int)32);
  strcpy((char *)(chunk), replyContent.substring(0, len).c_str());
  SPISlave.setData(chunk, 32);
  replyContent = replyContent.substring(len);
  return true;
}

void onDataSent() { replyChunk(); }

bool reply(const String &content) {
  replyContent = content + "\x00";
  replyChunk();
}

void setup() {
  Serial.begin(BAUDRATE);

  SPISlave.onData(onData);
  SPISlave.onDataSent(onDataSent);
  SPISlave.setData(zeros, 32);
  SPISlave.begin();

  delay(200);
  Serial.println("");
  Serial.println("boot");
  Serial.setTimeout(10000);
}

bool getCommand(String *arg) {
  String line = command;
  command = "";
  line.trim();
  if (line.length() == 0) {
    return false;
  }
  int from = 0;
  int found = 0;
  while (line.length() > from) {
    int next = line.indexOf(",", from);
    if (next < 0 || found == 4) {
      next = line.length();
    }
    arg[found] = line.substring(from, next);
    found++;
    from = next + 1;
  }
  return found > 0;
}

bool connect(const String &ssid, const String &password) {
  WiFi.mode(WIFI_STA);
  delay(200);
  if (!WiFi.begin(ssid.c_str(), password.c_str())) {
    return false;
  }
  return WiFi.waitForConnectResult() == WL_CONNECTED;
}

Response httpGet(const Request &r) {
  Response res;
  if (r.uri.startsWith("https:")) {
    http.begin(r.uri, r.fingerprint);
  } else {
    http.begin(r.uri);
  }
  res.code = http.GET();
  if (res.code <= 0) {
    res.code = 504;
    return res;
  }
  res.payload = http.getString();
  return res;
}

Response httpPost(const Request &r) {
  Response res;
  if (r.uri.startsWith("https:")) {
    http.begin(r.uri, r.fingerprint);
  } else {
    http.begin(r.uri);
  }
  res.code = http.POST(r.payload);
  if (res.code <= 0) {
    res.code = 504;
    return res;
  }
  res.payload = http.getString();
  return res;
}

void response(int code, const String &cmd, const String &content) {
  String s;
  s += cmd;
  s += ",";
  s += String(code);
  s += ",";
  s += getHttpStatusString(code);
  s += ",";
  s += content;
  reply(s);
  Serial.println(s);
}

void loop() {
  String arg[5];
  if (!getCommand(arg)) {
    delay(10);
    return;
  }
  replyContent = "";

  if (arg[0] == "AB") {
    Serial.println("AB command received.");
    reply("reply: 123456789090809809127894798728947897839");
  } else if (arg[0] == "c") {
    if (!connect(arg[1], arg[2])) {
      response(503, "c", "Wi-Fi connect failed");
      return;
    }
    response(200, "c", "Wi-Fi connect succeeded");
  } else if (arg[0] == "?") {
    if (!WiFi.isConnected()) {
      response(200, "?", "Wi-Fi disconnected");
      return;
    }
    response(200, "?", "Wi-Fi connected");
  } else if (arg[0] == "g") {
    Request req;
    req.uri = arg[1];
    req.fingerprint = arg[2];
    req.filter = arg[3];
    Response res = httpGet(req);
    response(res.code, "g", res.payload);
  } else if (arg[0] == "p") {
    Request req;
    req.uri = arg[1];
    req.fingerprint = arg[2];
    req.payload = arg[3];
    req.filter = arg[4];
    Response res = httpPost(req);
    response(res.code, "p", res.payload);
  }
}
