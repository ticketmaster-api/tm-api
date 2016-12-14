import { request } from 'axios';
import URLSearchParams from 'url-search-params';
const API_ROOT_URL = 'https://app.ticketmaster.com';
const OAUTH_ROOT_URL = 'https://oauth.ticketmaster.com';
const WAVES_ROOT_URL = 'https://payment.ticketmaster.com';

const METHODS = {
  'GET': 'get',
  'PUT': 'put',
  'POST': 'post',
  'DELETE': 'delete',
  'PATCH': 'patch',
};

const VERSION = 'v2';
const WAVES_VERSION = 'v3';

const DISCOVERY_PREFIX = `${API_ROOT_URL}/discovery/${VERSION}`;

const DISCOVERY_EVENT_URL = `${DISCOVERY_PREFIX}/events`;
const DISCOVERY_VENUE_URL = `${DISCOVERY_PREFIX}/venues`;
const DISCOVERY_ATTRACTION_URL = `${DISCOVERY_PREFIX}/attractions`;
const DISCOVERY_CLASSIFICATION_URL = `${DISCOVERY_PREFIX}/classifications`;

const COMMERCE_PREFIX = `${API_ROOT_URL}/commerce/${VERSION}`;

const COMMERCE_EVENT_URL = `${COMMERCE_PREFIX}/events`;
const COMMERCE_SHOPPING_URL = `${COMMERCE_PREFIX}/shopping`;
const COMMERCE_CART_URL = `${COMMERCE_SHOPPING_URL}/carts`;
const COMMERCE_CHECKOUT_URL = `${COMMERCE_PREFIX}/checkout`;
const COMMERCE_CHECKOUT_CART_URL = `${COMMERCE_CHECKOUT_URL}/carts`;

const OAUTH_PREFIX = `${OAUTH_ROOT_URL}/oauth`;
const OAUTH_AUTHORIZE_URL = `${OAUTH_PREFIX}/authorize`;
const OAUTH_TOKEN_URL = `${OAUTH_PREFIX}/token`;

const WAVES_PREFIX = `${WAVES_ROOT_URL}/waves/${WAVES_VERSION}`;
const WAVES_INSTRUMENT_URL = `${WAVES_PREFIX}/instrument`;

// This is to strip millisecond portion of Date ISO string so API can accept the value
// e.g. "2016-11-30T18:48:01.669Z" -> "2016-11-30T18:48:01Z"
const isoDateFormatFix = isoString => isoString.replace(/\.([0-9]+)Z/g, 'Z');

const sanitizeParams = params => {
  let sanitizedParams = Object.assign({}, params);
  if (sanitizedParams.startDateTime) {
    sanitizedParams.startDateTime = isoDateFormatFix(sanitizedParams.startDateTime);
  }
  if (sanitizedParams.endDateTime) {
    sanitizedParams.endDateTime = isoDateFormatFix(sanitizedParams.endDateTime);
  }
  return sanitizedParams;
};

const requestURLHelper = (url, id, subResource, format) => {
  const ID = id? `/${id}` : '';
  const SUB_RESOURCE = subResource? `/${subResource}` : '';
  const FORMAT = format? `.${format}` : '';

  return `${url}${ID}${SUB_RESOURCE}${FORMAT}`;
};

const requestMakerHelper = (method, baseUrl, id, subResource, urlParams, requestBody, headers, format, useURLSearchParams) => {
  const sanitizeUrlParams = sanitizeParams(urlParams);
  const url = requestURLHelper(baseUrl, id, subResource, format);
  let requestConfig = {
    method,
    url,
    params: sanitizeUrlParams
  };

  if (headers) {
    requestConfig.headers = headers;
  }

  if (method === METHODS.PUT || method === METHODS.POST || method === METHODS.PATCH) {
    // useURLSearchParams is true likely in the case of OAuth related requests, where form data needed to be serialized instead of regular JSON format
    if (useURLSearchParams) {
      const searchParams = new URLSearchParams();
      for (let p in requestBody) {
        if (requestBody.hasOwnProperty(p) && requestBody[p]) {
          searchParams.set(p, requestBody[p]);
        }
      }
      requestConfig.data = searchParams.toString();
    } else {
      requestConfig.data = requestBody;
    }
  }

  return request(requestConfig);
};

const requestMaker = (method, baseUrl, id = null, subResource = null, urlParams = {}, requestBody = {}, headers = null, format = 'json', useURLSearchParams = false) => (
  requestMakerHelper(method, baseUrl, id, subResource, {
    apikey: TMAPI.apikey,
    ...urlParams
  }, requestBody, headers, format, useURLSearchParams)
);

const oauthRequestMaker = params => requestMakerHelper(METHODS.POST, OAUTH_TOKEN_URL, null, null, {}, params, OAUTH_REQUEST_HEADERS, '', true);

const wavesAddInstrumentRequest = (accessToken, requestBody) => {
  const requestConfig = {
    method: METHODS.POST,
    url: WAVES_INSTRUMENT_URL,
    params: {
      "access_token": accessToken
    },
    data: Object.assign({}, requestBody)
  };
  return request(requestConfig);
};

const OAUTH_REQUEST_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

const OAUTH_TOKEN_GRANT_TYPE_AUTHORIZATION = 'authorization_code';
const OAUTH_TOKEN_GRANT_TYPE_REFRESH = 'refresh_token';

const getOAuthTokenParams = (code, type) => {
  let params = {
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

const getOAuthTokenAuthorizeParams = code => getOAuthTokenParams(code, OAUTH_TOKEN_GRANT_TYPE_AUTHORIZATION);
const getOAuthTokenRefreshParams = code => getOAuthTokenParams(code, OAUTH_TOKEN_GRANT_TYPE_REFRESH);

const TMAPI = {
  apikey: '',
  secret: '',
  setAPIKey: apikey => { TMAPI.apikey = apikey },
  setSecret: secret => { TMAPI.secret = secret },
  URL: {
    DISCOVERY_EVENT_URL, DISCOVERY_VENUE_URL, DISCOVERY_ATTRACTION_URL, DISCOVERY_CLASSIFICATION_URL,
    COMMERCE_EVENT_URL, COMMERCE_SHOPPING_URL, COMMERCE_CART_URL, COMMERCE_CHECKOUT_CART_URL,
    OAUTH_AUTHORIZE_URL, OAUTH_TOKEN_URL,
    WAVES_INSTRUMENT_URL
  },
  events: {
    getDetails: eventId => requestMaker(METHODS.GET, DISCOVERY_EVENT_URL, eventId),
    getImages: eventId => requestMaker(METHODS.GET, DISCOVERY_EVENT_URL, eventId, 'images'),
    search: params => requestMaker(METHODS.GET, DISCOVERY_EVENT_URL, null, null, params)
  },
  venues: {
    getDetails: venueId => requestMaker(METHODS.GET, DISCOVERY_VENUE_URL, venueId),
    search: params => requestMaker(METHODS.GET, DISCOVERY_VENUE_URL, null, null, params)
  },
  attractions: {
    getDetails: attractionId => requestMaker(METHODS.GET, DISCOVERY_ATTRACTION_URL, attractionId),
    search: params => requestMaker(METHODS.GET, DISCOVERY_ATTRACTION_URL, null, null, params)
  },
  classifications: {
    getDetails: classificationId => requestMaker(METHODS.GET, DISCOVERY_CLASSIFICATION_URL, classificationId),
    search: (params = {}) => requestMaker(METHODS.GET, DISCOVERY_CLASSIFICATION_URL, null, null, params)
  },
  eventOffers: {
    getDetails: eventId => requestMaker(METHODS.GET, COMMERCE_EVENT_URL, eventId, 'offers')
  },
  cart: {
    getCart: cartId => requestMaker(METHODS.GET, COMMERCE_CART_URL, cartId),
    createCart: requestBody => requestMaker(METHODS.POST, COMMERCE_CART_URL, null, null, {}, requestBody),
    emptyCart: cartId => requestMaker(METHODS.DELETE, COMMERCE_CART_URL, cartId),
    updateCart: (cartId, requestBody) => requestMaker(METHODS.PATCH, COMMERCE_CART_URL, cartId, 'products', {}, requestBody),
    completeOrder: (cartId, requestBody, mockpurchase = false) => requestMaker(METHODS.POST, COMMERCE_CART_URL, cartId, 'purchase', { mock: !!mockpurchase }, requestBody),
    selectDeliveries: (cartId, requestBody) => requestMaker(METHODS.PATCH, COMMERCE_CART_URL, cartId, 'deliveries', {}, requestBody),
    selectPayments: (cartId, requestBody) => requestMaker(METHODS.PATCH, COMMERCE_CART_URL, cartId, 'payments', {}, requestBody)
  },
  checkout: {
    getDeliveries: cartId => requestMaker(METHODS.GET, COMMERCE_CHECKOUT_CART_URL, cartId, 'deliveries')
  },
  oauth: {
    tokenAuthorize: code => oauthRequestMaker(getOAuthTokenAuthorizeParams(code)),
    tokenRefresh: code => oauthRequestMaker(getOAuthTokenRefreshParams(code))
  },
  waves: {
    addInstrument: wavesAddInstrumentRequest
  }
};

module.exports = TMAPI;
