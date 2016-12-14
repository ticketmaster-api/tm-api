# tm-api
Node.js modules for Ticketmaster Open platform APIs

## Installation

First install with npm

``` npm i tm-api --save ```

To require in projects;

```js
var TMAPI = require('tm-api');

TMAPI.setAPIKey("my-consumer-key");
TMAPI.setSecret("my-consumer-secret");

var promise = TMAPI.events.search('Rihanna');
```
