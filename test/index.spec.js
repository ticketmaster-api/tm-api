import { expect } from 'chai';
import { stub, assert } from 'sinon';
import axios, { request } from 'axios';
import TMAPI from '../src/index';

const {
  DISCOVERY_EVENT_URL, DISCOVERY_VENUE_URL, DISCOVERY_ATTRACTION_URL, DISCOVERY_CLASSIFICATION_URL,
  COMMERCE_EVENT_URL, COMMERCE_SHOPPING_URL, COMMERCE_CART_URL, COMMERCE_CHECKOUT_CART_URL,
  OAUTH_TOKEN_URL,
  WAVES_INSTRUMENT_URL
} = TMAPI.URL;

const TEST_APIKEY = 'TEST_APIKEY';
const TEST_API_SECRET = 'TEST_API_SECRET';
const JSON_FORMAT = 'json';
const SEARCH_KEYWORD = 'SEARCH_KEYWORD';
const SEARCH_PARAMS = {
  keyword: SEARCH_KEYWORD,
  startDateTime: '2016-08-10T20:15:56.221Z',
  endDateTime: '2016-08-17T20:15:56.221Z'
};

const REQUEST_PARAMS = {
  apikey: TEST_APIKEY
};

const SANITIZED_REQUEST_PARAMS = {
  apikey: TEST_APIKEY,
  keyword: SEARCH_KEYWORD,
  startDateTime: '2016-08-10T20:15:56Z',
  endDateTime: '2016-08-17T20:15:56Z'
};

const CART_ID = 'CART_ID';

function setupAPI (tmapi, apikey, secret) {
  tmapi.setAPIKey(apikey);
  tmapi.setSecret(secret);
};

const SINGLE_PRODUCT = {
  "offers":[
    {
      "offer":"000000000001"
    }
  ],
  "filters":{
    "maxPrice":{
      "amount":"47.75",
      "code":"USD"
    },
    "minPrice":{
      "amount":"47.75",
      "code":"USD"
    }
  },
  "qty":2,
  "product":"09005063D7E8350B"
};
const ADD_SINGLE_PRODUCT = Object.assign({op: "add"}, SINGLE_PRODUCT);
const pollingCallbackUrl = "http://localhost/some_callback_url";
const CREATE_CART_REQUEST_BODY = {
  pollingCallbackUrl,
  "products":[SINGLE_PRODUCT]
};

const UPDATE_CART_REQUEST_BODY = {
  pollingCallbackUrl,
  "products":[ADD_SINGLE_PRODUCT]
};

const SELECT_DELIVERIES_REQUEST_BODY = {
  pollingCallbackUrl,
  "deliveries":[{
    "deliveryId" : "ad20f8bc3e69a6c7a340c711731f2342"
  }]
};

const SELECT_PAYMENTS_REQUEST_BODY = {
  pollingCallbackUrl,
  "payments":[
    {
      "type":"wallet",
      "token":"encryptedWalletToken1",
      "cvv":"123",
      "amount":{
        "amount":"19.00",
        "currency":"USD"
      }
    },
    {
      "type":"cash",
      "amount":{
        "amount":"19.00",
        "currency":"USD"
      }
    }
  ]
};

describe('Ticketmaster API library', function () {

  before(function () {
    stub(axios, 'request', function (url, config){
      return new Promise(function(resolve, reject) {
        return;
      });
    });
  });

  describe('init', function () {
    it('should have no apikey or secret before setting', function () {
      expect(TMAPI.apikey).to.equal('');
      expect(TMAPI.secret).to.equal('');
    });

    it('should have apikey and secret after setting', function () {
      setupAPI(TMAPI, TEST_APIKEY, TEST_API_SECRET);
      expect(TMAPI.apikey).to.equal(TEST_APIKEY);
      expect(TMAPI.secret).to.equal(TEST_API_SECRET);
    });
  });

  describe('events API calls', function () {
    it('should send the correct GET request for search', function () {
      TMAPI.events.search(SEARCH_PARAMS);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_EVENT_URL}.${JSON_FORMAT}`,
        params: SANITIZED_REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct GET request for get details', function () {
      const EVENT_ID = 'EVENT_ID';
      TMAPI.events.getDetails(EVENT_ID);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_EVENT_URL}/${EVENT_ID}.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct GET request for get images', function () {
      const EVENT_ID = 'EVENT_ID';
      TMAPI.events.getImages(EVENT_ID);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_EVENT_URL}/${EVENT_ID}/images.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('venues API calls', function () {
    it('should send the correct GET request for search', function () {
      TMAPI.venues.search(SEARCH_PARAMS);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_VENUE_URL}.${JSON_FORMAT}`,
        params: SANITIZED_REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct GET request for get details', function () {
      const VENUE_ID = 'VENUE_ID';
      TMAPI.venues.getDetails(VENUE_ID);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_VENUE_URL}/${VENUE_ID}.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('attractions API calls', function () {
    it('should send the correct GET request for search', function () {
      TMAPI.attractions.search(SEARCH_PARAMS);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_ATTRACTION_URL}.${JSON_FORMAT}`,
        params: SANITIZED_REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct GET request for get details', function () {
      const ATTRACTION_ID = 'ATTRACTION_ID';
      TMAPI.attractions.getDetails(ATTRACTION_ID);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_ATTRACTION_URL}/${ATTRACTION_ID}.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('classifications API calls', function () {
    it('should send the correct GET request for search', function () {
      TMAPI.classifications.search(SEARCH_PARAMS);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_CLASSIFICATION_URL}.${JSON_FORMAT}`,
        params: SANITIZED_REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct GET request for get details', function () {
      const CLASSIFICATION_ID = 'CLASSIFICATION_ID';
      TMAPI.classifications.getDetails(CLASSIFICATION_ID);
      const requestConfig = {
        method: 'get',
        url: `${DISCOVERY_CLASSIFICATION_URL}/${CLASSIFICATION_ID}.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('event offers API calls', function () {
    it('should send the correct GET request for get details', function () {
      const EVENT_ID = 'EVENT_ID';
      TMAPI.eventOffers.getDetails(EVENT_ID);
      const requestConfig = {
        method: 'get',
        url: `${COMMERCE_EVENT_URL}/${EVENT_ID}/offers.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('cart API calls', function () {
    it('should send the correct POST request for create cart', function () {
      TMAPI.cart.createCart(CREATE_CART_REQUEST_BODY);
      const requestConfig = {
        method: 'post',
        url: `${COMMERCE_CART_URL}.${JSON_FORMAT}`,
        params: REQUEST_PARAMS,
        data: CREATE_CART_REQUEST_BODY
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct GET request for get cart', function () {
      TMAPI.cart.getCart(CART_ID);
      const requestConfig = {
        method: 'get',
        url: `${COMMERCE_CART_URL}/${CART_ID}.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct PATCH request for update cart', function () {
      TMAPI.cart.updateCart(CART_ID, UPDATE_CART_REQUEST_BODY);
      const requestConfig = {
        method: 'patch',
        url: `${COMMERCE_CART_URL}/${CART_ID}/products.${JSON_FORMAT}`,
        params: REQUEST_PARAMS,
        data: UPDATE_CART_REQUEST_BODY
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct POST request for complete order', function () {
      const MOCK_PURCHASE = false;
      TMAPI.cart.completeOrder(CART_ID, {pollingCallbackUrl}, MOCK_PURCHASE);
      const requestConfig = {
        method: 'post',
        url: `${COMMERCE_CART_URL}/${CART_ID}/purchase.${JSON_FORMAT}`,
        params: {
          ...REQUEST_PARAMS,
          mock: MOCK_PURCHASE
        },
        data: {pollingCallbackUrl}
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct PATCH request for select deliveries', function () {
      TMAPI.cart.selectDeliveries(CART_ID, SELECT_DELIVERIES_REQUEST_BODY);
      const requestConfig = {
        method: 'patch',
        url: `${COMMERCE_CART_URL}/${CART_ID}/deliveries.${JSON_FORMAT}`,
        params: REQUEST_PARAMS,
        data: SELECT_DELIVERIES_REQUEST_BODY
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct PATCH request for select payments', function () {
      TMAPI.cart.selectPayments(CART_ID, SELECT_PAYMENTS_REQUEST_BODY);
      const requestConfig = {
        method: 'patch',
        url: `${COMMERCE_CART_URL}/${CART_ID}/payments.${JSON_FORMAT}`,
        params: REQUEST_PARAMS,
        data: SELECT_PAYMENTS_REQUEST_BODY
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('checkout API calls', function () {
    it('should send the correct GET request for get deliveries', function () {
      TMAPI.checkout.getDeliveries(CART_ID);
      const requestConfig = {
        method: 'get',
        url: `${COMMERCE_CHECKOUT_CART_URL}/${CART_ID}/deliveries.${JSON_FORMAT}`,
        params: REQUEST_PARAMS
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('OAuth API calls', function () {
    it('should send the correct POST request to authorize token', function () {
      const AUTHORIZE_CODE = 'AUTHORIZE_CODE';
      TMAPI.oauth.tokenAuthorize(AUTHORIZE_CODE);
      const requestConfig = {
        method: 'post',
        url: OAUTH_TOKEN_URL,
        params: {},
        data:
        `client_id=${TEST_APIKEY}&client_secret=${TEST_API_SECRET}&grant_type=authorization_code&code=${AUTHORIZE_CODE}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      };

      assert.calledWith(request, requestConfig);
    });

    it('should send the correct POST request to refresh token', function () {
      const REFRESH_TOKEN = 'REFRESH_TOKEN';
      TMAPI.oauth.tokenRefresh(REFRESH_TOKEN);
      const requestConfig = {
        method: 'post',
        url: OAUTH_TOKEN_URL,
        params: {},
        data:
        `client_id=${TEST_APIKEY}&client_secret=${TEST_API_SECRET}&grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      };

      assert.calledWith(request, requestConfig);
    });
  });

  describe('Waves API calls', function () {
    it('should send the correct POST request to add instrument', function () {
      const ACCESS_TOKEN = 'ACCESS_TOKEN';
      TMAPI.waves.addInstrument(ACCESS_TOKEN, {});
      const requestConfig = {
        method: 'post',
        url: WAVES_INSTRUMENT_URL,
        params: {
          "access_token": ACCESS_TOKEN
        },
        data: {}
      };

      assert.calledWith(request, requestConfig);
    });
  });

});
