'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _axios = require('axios');

var _urlSearchParams = require('url-search-params');

var _urlSearchParams2 = _interopRequireDefault(_urlSearchParams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_ROOT_URL = 'https://app.ticketmaster.com';
var OAUTH_ROOT_URL = 'https://oauth.ticketmaster.com';
var WAVES_ROOT_URL = 'https://payment.ticketmaster.com';

var METHODS = {
  'GET': 'get',
  'PUT': 'put',
  'POST': 'post',
  'DELETE': 'delete',
  'PATCH': 'patch'
};

var VERSION = 'v2';
var WAVES_VERSION = 'v3';

var DISCOVERY_PREFIX = API_ROOT_URL + '/discovery/' + VERSION;

var DISCOVERY_EVENT_URL = DISCOVERY_PREFIX + '/events';
var DISCOVERY_VENUE_URL = DISCOVERY_PREFIX + '/venues';
var DISCOVERY_ATTRACTION_URL = DISCOVERY_PREFIX + '/attractions';
var DISCOVERY_CLASSIFICATION_URL = DISCOVERY_PREFIX + '/classifications';

var COMMERCE_PREFIX = API_ROOT_URL + '/commerce/' + VERSION;

var COMMERCE_EVENT_URL = COMMERCE_PREFIX + '/events';
var COMMERCE_SHOPPING_URL = COMMERCE_PREFIX + '/shopping';
var COMMERCE_CART_URL = COMMERCE_SHOPPING_URL + '/carts';
var COMMERCE_CHECKOUT_URL = COMMERCE_PREFIX + '/checkout';
var COMMERCE_CHECKOUT_CART_URL = COMMERCE_CHECKOUT_URL + '/carts';

var OAUTH_PREFIX = OAUTH_ROOT_URL + '/oauth';
var OAUTH_AUTHORIZE_URL = OAUTH_PREFIX + '/authorize';
var OAUTH_TOKEN_URL = OAUTH_PREFIX + '/token';

var WAVES_PREFIX = WAVES_ROOT_URL + '/waves/' + WAVES_VERSION;
var WAVES_INSTRUMENT_URL = WAVES_PREFIX + '/instrument';

// This is to strip millisecond portion of Date ISO string so API can accept the value
// e.g. "2016-11-30T18:48:01.669Z" -> "2016-11-30T18:48:01Z"
var isoDateFormatFix = function isoDateFormatFix(isoString) {
  return isoString.replace(/\.([0-9]+)Z/g, 'Z');
};

var sanitizeParams = function sanitizeParams(params) {
  var sanitizedParams = Object.assign({}, params);
  if (sanitizedParams.startDateTime) {
    sanitizedParams.startDateTime = isoDateFormatFix(sanitizedParams.startDateTime);
  }
  if (sanitizedParams.endDateTime) {
    sanitizedParams.endDateTime = isoDateFormatFix(sanitizedParams.endDateTime);
  }
  return sanitizedParams;
};

var requestURLHelper = function requestURLHelper(url, id, subResource, format) {
  var ID = id ? '/' + id : '';
  var SUB_RESOURCE = subResource ? '/' + subResource : '';
  var FORMAT = format ? '.' + format : '';

  return '' + url + ID + SUB_RESOURCE + FORMAT;
};

var requestMakerHelper = function requestMakerHelper(method, baseUrl, id, subResource, urlParams, requestBody, headers, format, useURLSearchParams) {
  var sanitizeUrlParams = sanitizeParams(urlParams);
  var url = requestURLHelper(baseUrl, id, subResource, format);
  var requestConfig = {
    method: method,
    url: url,
    params: sanitizeUrlParams
  };

  if (headers) {
    requestConfig.headers = headers;
  }

  if (method === METHODS.PUT || method === METHODS.POST || method === METHODS.PATCH) {
    // useURLSearchParams is true likely in the case of OAuth related requests, where form data needed to be serialized instead of regular JSON format
    if (useURLSearchParams) {
      var searchParams = new _urlSearchParams2.default();
      for (var p in requestBody) {
        if (requestBody.hasOwnProperty(p) && requestBody[p]) {
          searchParams.set(p, requestBody[p]);
        }
      }
      requestConfig.data = searchParams.toString();
    } else {
      requestConfig.data = requestBody;
    }
  }

  return (0, _axios.request)(requestConfig);
};

var requestMaker = function requestMaker(method, baseUrl) {
  var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var subResource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var urlParams = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var requestBody = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var headers = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var format = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'json';
  var useURLSearchParams = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  return requestMakerHelper(method, baseUrl, id, subResource, _extends({
    apikey: TMAPI.apikey
  }, urlParams), requestBody, headers, format, useURLSearchParams);
};

var oauthRequestMaker = function oauthRequestMaker(params) {
  return requestMakerHelper(METHODS.POST, OAUTH_TOKEN_URL, null, null, {}, params, OAUTH_REQUEST_HEADERS, '', true);
};

var wavesAddInstrumentRequest = function wavesAddInstrumentRequest(accessToken, requestBody) {
  var requestConfig = {
    method: METHODS.POST,
    url: WAVES_INSTRUMENT_URL,
    params: {
      "access_token": accessToken
    },
    data: Object.assign({}, requestBody)
  };
  return (0, _axios.request)(requestConfig);
};

var OAUTH_REQUEST_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

var OAUTH_TOKEN_GRANT_TYPE_AUTHORIZATION = 'authorization_code';
var OAUTH_TOKEN_GRANT_TYPE_REFRESH = 'refresh_token';

var getOAuthTokenParams = function getOAuthTokenParams(code, type) {
  var params = {
    client_id: TMAPI.apikey,
    client_secret: TMAPI.secret,
    grant_type: type
  };

  if (type === OAUTH_TOKEN_GRANT_TYPE_AUTHORIZATION) {
    params.code = code;
  } else if (type === OAUTH_TOKEN_GRANT_TYPE_REFRESH) {
    params.refresh_token = code;
  }

  return params;
};

var getOAuthTokenAuthorizeParams = function getOAuthTokenAuthorizeParams(code) {
  return getOAuthTokenParams(code, OAUTH_TOKEN_GRANT_TYPE_AUTHORIZATION);
};
var getOAuthTokenRefreshParams = function getOAuthTokenRefreshParams(code) {
  return getOAuthTokenParams(code, OAUTH_TOKEN_GRANT_TYPE_REFRESH);
};

var TMAPI = {
  apikey: '',
  secret: '',
  setAPIKey: function setAPIKey(apikey) {
    TMAPI.apikey = apikey;
  },
  setSecret: function setSecret(secret) {
    TMAPI.secret = secret;
  },
  URL: {
    DISCOVERY_EVENT_URL: DISCOVERY_EVENT_URL, DISCOVERY_VENUE_URL: DISCOVERY_VENUE_URL, DISCOVERY_ATTRACTION_URL: DISCOVERY_ATTRACTION_URL, DISCOVERY_CLASSIFICATION_URL: DISCOVERY_CLASSIFICATION_URL,
    COMMERCE_EVENT_URL: COMMERCE_EVENT_URL, COMMERCE_SHOPPING_URL: COMMERCE_SHOPPING_URL, COMMERCE_CART_URL: COMMERCE_CART_URL, COMMERCE_CHECKOUT_CART_URL: COMMERCE_CHECKOUT_CART_URL,
    OAUTH_AUTHORIZE_URL: OAUTH_AUTHORIZE_URL, OAUTH_TOKEN_URL: OAUTH_TOKEN_URL,
    WAVES_INSTRUMENT_URL: WAVES_INSTRUMENT_URL
  },
  events: {
    getDetails: function getDetails(eventId) {
      return requestMaker(METHODS.GET, DISCOVERY_EVENT_URL, eventId);
    },
    getImages: function getImages(eventId) {
      return requestMaker(METHODS.GET, DISCOVERY_EVENT_URL, eventId, 'images');
    },
    search: function search(params) {
      return requestMaker(METHODS.GET, DISCOVERY_EVENT_URL, null, null, params);
    }
  },
  venues: {
    getDetails: function getDetails(venueId) {
      return requestMaker(METHODS.GET, DISCOVERY_VENUE_URL, venueId);
    },
    search: function search(params) {
      return requestMaker(METHODS.GET, DISCOVERY_VENUE_URL, null, null, params);
    }
  },
  attractions: {
    getDetails: function getDetails(attractionId) {
      return requestMaker(METHODS.GET, DISCOVERY_ATTRACTION_URL, attractionId);
    },
    search: function search(params) {
      return requestMaker(METHODS.GET, DISCOVERY_ATTRACTION_URL, null, null, params);
    }
  },
  classifications: {
    getDetails: function getDetails(classificationId) {
      return requestMaker(METHODS.GET, DISCOVERY_CLASSIFICATION_URL, classificationId);
    },
    search: function search() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return requestMaker(METHODS.GET, DISCOVERY_CLASSIFICATION_URL, null, null, params);
    }
  },
  eventOffers: {
    getDetails: function getDetails(eventId) {
      return requestMaker(METHODS.GET, COMMERCE_EVENT_URL, eventId, 'offers');
    }
  },
  cart: {
    getCart: function getCart(cartId) {
      return requestMaker(METHODS.GET, COMMERCE_CART_URL, cartId);
    },
    createCart: function createCart(requestBody) {
      return requestMaker(METHODS.POST, COMMERCE_CART_URL, null, null, {}, requestBody);
    },
    emptyCart: function emptyCart(cartId) {
      return requestMaker(METHODS.DELETE, COMMERCE_CART_URL, cartId);
    },
    updateCart: function updateCart(cartId, requestBody) {
      return requestMaker(METHODS.PATCH, COMMERCE_CART_URL, cartId, 'products', {}, requestBody);
    },
    completeOrder: function completeOrder(cartId, requestBody) {
      var mockpurchase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      return requestMaker(METHODS.POST, COMMERCE_CART_URL, cartId, 'purchase', { mock: !!mockpurchase }, requestBody);
    },
    selectDeliveries: function selectDeliveries(cartId, requestBody) {
      return requestMaker(METHODS.PATCH, COMMERCE_CART_URL, cartId, 'deliveries', {}, requestBody);
    },
    selectPayments: function selectPayments(cartId, requestBody) {
      return requestMaker(METHODS.PATCH, COMMERCE_CART_URL, cartId, 'payments', {}, requestBody);
    }
  },
  checkout: {
    getDeliveries: function getDeliveries(cartId) {
      return requestMaker(METHODS.GET, COMMERCE_CHECKOUT_CART_URL, cartId, 'deliveries');
    }
  },
  oauth: {
    tokenAuthorize: function tokenAuthorize(code) {
      return oauthRequestMaker(getOAuthTokenAuthorizeParams(code));
    },
    tokenRefresh: function tokenRefresh(code) {
      return oauthRequestMaker(getOAuthTokenRefreshParams(code));
    }
  },
  waves: {
    addInstrument: wavesAddInstrumentRequest
  }
};

module.exports = TMAPI;