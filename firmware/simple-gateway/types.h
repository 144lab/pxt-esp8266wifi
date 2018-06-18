struct Request {
  String uri;
  String fingerprint;
  String payload;
  String filter;
};

struct Response {
  int code;
  String payload;
};

const char *http100[] = {
    "Continue",
    "Switching Protocols",
    "Processing",
    "Early Hints",
};

const char *http200[] = {
    "OK",
    "Created",
    "Accepted",
    "Non-Authoritative Information",
    "No Content",
    "Reset Content",
    "Partial Content",
    "Multi-Status",
    "Already Reported",
};

const char *http300[] = {
    "Multiple Choices", "Moved Permanently",  "Found",
    "See Other",        "Not Modified",       "Use Proxy",
    "(Unused)",         "Temporary Redirect", "Permanent Redirect",
};

const char *http400[] = {
    "Bad Request",
    "Unauthorized",
    "Payment Required",
    "Forbidden",
    "Not Found",
    "Method Not Allowed",
    "Not Acceptable",
    "Proxy Authentication Required",
    "Request Timeout",
    "Conflict",
    "Gone",
    "Length Required",
    "Precondition Failed",
    "Payload Too Large",
    "URI Too Long",
    "Unsupported Media Type",
    "Range Not Satisfiable",
    "Expectation Failed",
};

const char *http500[] = {
    "Internal Server Error", "Not Implemented", "Bad Gateway",
    "Service Unavailable",   "Gateway Timeout", "HTTP Version Not Supported",
};

const char *getHttpStatusString(int code) {
  if (code < 100) {
    return NULL;
  } else if (code < 200) {
    return http100[code - 100];
  } else if (code < 300) {
    return http200[code - 200];
  } else if (code < 400) {
    return http300[code - 300];
  } else if (code < 500) {
    return http400[code - 400];
  } else if (code < 600) {
    return http500[code - 500];
  }
  return NULL;
}