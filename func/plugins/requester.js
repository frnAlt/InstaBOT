import axios from "axios";

async function requester(ogUrl, query = {}, method = "GET") {
  try {
    if (!ogUrl) {
      throw new Error("No URL provided!");
    }
    if (!ogUrl.startsWith("https://") && !ogUrl.startsWith("http://")) {
      ogUrl = "https://" + ogUrl;
    }
    const url = `${ogUrl}?${Object.keys(query)
      .map((i) => `${i}=${encodeURIComponent(query[i])}`)
      .join("&")}`;
    let methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"];
    if (!methods.includes(method.toUpperCase())) {
      throw new Error(`Invalid method: ${method}`);
    }
    const response = await axios[method.toLowerCase()](url);
    return { response: response.data, error: null, url };
  } catch (error) {
    return {
      response: null,
      error: {
        ...error,
        message: explainErrorCode(error.response.status),
      },
      url: null,
    };
  }
}
requester.explainErrorCode = explainErrorCode;

export const meta = {
  name: "requester",
  author: "Liane Cagara",
  version: "1.0.0",
  description:
    "Requester is a plugin that streamlines the process of making HTTP requests.",
  supported: "^1.2.0",
  order: 2,
  type: "plugin",
  expect: ["requester"],
};

export function use(obj) {
  obj.requester = requester;
  obj.next();
}

function explainErrorCode(errorCode) {
  let errorMessage;

  switch (errorCode) {
    case 400:
      errorMessage =
        "Bad Request. The server could not understand the request.";
      break;
    case 401:
      errorMessage =
        "Unauthorized. Authentication is required and has failed or not been provided.";
      break;
    case 402:
      errorMessage =
        "Payment Required. Payment is required to fulfill the request.";
      break;
    case 403:
      errorMessage =
        "Forbidden. You don't have permission to access the requested resource.";
      break;
    case 404:
      errorMessage =
        "Not Found. The requested resource could not be found on the server.";
      break;
    case 405:
      errorMessage =
        "Method Not Allowed. The method specified in the request is not allowed.";
      break;
    case 406:
      errorMessage =
        "Not Acceptable. The server cannot produce a response matching the list of acceptable values.";
      break;
    case 407:
      errorMessage =
        "Proxy Authentication Required. The client must first authenticate itself with the proxy.";
      break;
    case 408:
      errorMessage =
        "Request Timeout. The server timed out waiting for the request.";
      break;
    case 409:
      errorMessage =
        "Conflict. The request could not be completed due to a conflict with the current state of the target resource.";
      break;
    case 410:
      errorMessage = "Gone. The requested resource is no longer available.";
      break;
    case 411:
      errorMessage =
        "Length Required. The server requires a content-length in the request.";
      break;
    case 412:
      errorMessage =
        "Precondition Failed. One or more conditions specified in the request header fields evaluated to false.";
      break;
    case 413:
      errorMessage =
        "Payload Too Large. The request is larger than the server is willing or able to process.";
      break;
    case 414:
      errorMessage =
        "URI Too Long. The URI provided was too long for the server to process.";
      break;
    case 415:
      errorMessage =
        "Unsupported Media Type. The server does not support the media type transmitted in the request.";
      break;
    case 416:
      errorMessage =
        "Range Not Satisfiable. The range specified in the request header fields cannot be satisfied.";
      break;
    case 417:
      errorMessage =
        "Expectation Failed. The server cannot meet the requirements of the Expect request-header field.";
      break;
    case 418:
      errorMessage =
        "I'm a teapot. This code was defined in 1998 as one of the traditional IETF April Fools' jokes.";
      break;
    case 421:
      errorMessage =
        "Misdirected Request. The request was directed at a server that is not able to produce a response.";
      break;
    case 422:
      errorMessage =
        "Unprocessable Entity. The server understands the content type of the request entity but was unable to process the contained instructions.";
      break;
    case 423:
      errorMessage = "Locked. The resource that is being accessed is locked.";
      break;
    case 424:
      errorMessage =
        "Failed Dependency. The request failed because it depended on another request and that request failed.";
      break;
    case 425:
      errorMessage =
        "Too Early. The server is unwilling to risk processing a request that might be replayed.";
      break;
    case 426:
      errorMessage =
        "Upgrade Required. The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.";
      break;
    case 428:
      errorMessage =
        "Precondition Required. The origin server requires the request to be conditional.";
      break;
    case 429:
      errorMessage =
        "Too Many Requests. The user has sent too many requests in a given amount of time.";
      break;
    case 431:
      errorMessage =
        "Request Header Fields Too Large. The server is unwilling to process the request because its header fields are too large.";
      break;
    case 451:
      errorMessage =
        "Unavailable For Legal Reasons. The server is denying access to the resource as a consequence of a legal demand.";
      break;
    case 500:
      errorMessage =
        "Internal Server Error. Something went wrong on the server.";
      break;
    case 501:
      errorMessage =
        "Not Implemented. The server does not support the functionality required to fulfill the request.";
      break;
    case 502:
      errorMessage =
        "Bad Gateway. The server, while acting as a gateway, received an invalid response.";
      break;
    case 503:
      errorMessage =
        "Service Unavailable. The server is not ready to handle the request.";
      break;
    default:
      errorMessage = "Unknown error.";
  }

  return `Status: ${errorCode}\n${errorMessage}`;
}
