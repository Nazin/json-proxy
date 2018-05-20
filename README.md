# MIM JSON proxy

[![NPM Version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/mim-json-proxy.svg
[npm-url]: https://www.npmjs.com/package/mim-json-proxy

A tool which can be used as ‘man in the middle’ proxy. It can be used to sit between two JSON webservices endpoints (e.g. Facebook/Twitter and your application) to intercept the webservices traffic between them and modify it.

## Getting Started (API)
1. Install the proxy
    ```bash
    npm i mim-json-proxy
    ```
1. In your code
    ```javascript
    const JsonProxy = require('mim-json-proxy');
    const proxy = new JsonProxy(options);
    proxy.start();
    ```

## Install

With npm do:

```bash
npm install -g mim-json-proxy
```

## Usage

Usage:
 
```bash
mim-json-proxy {OPTIONS}
```

## Options

Options are for API usage and the command line:

- `port`: port to open the server on (default `3005`)
- `configsDirectory`: defines proxy configurations directory (default `./configs`)
- `defaultConfigName`: defines default configuration name (default `proxy-config.json`) 
- `configUI.enabled`: whether to enable the UI for easier proxy config adjustments (default `true`)
- `configUI.endpoint`: path for the config UI (default `/config`)
- `bodyParserLimit`: limit for express bodyParser (default `5mb`)
- `cors`: cors configuration to pass to express (default `{credentials: true}`)
- `https`: whether to start server using https or not (default `false`)
- `certificates.key`: HTTPS certificate key path (default `./certificates/server.key`)
- `certificates.cert`: HTTPS certificate CRT path (default `./certificates/server.crt`)

## API

- `start(options)`: starts the server with provided `options`
- `addController(path, controller)`: possibility to define custom controller on the server (i.e. replacing `/config`)

## Developer Notes
- You can use `npm start` to run the proxy locally
- Proxy runs on port 3005 by default to relay the communication to webservice. The `/config` endpoint can be used to adjust the configuration in simple UI
- `configs/proxy-config.json` defines rules and endpoints
- `proxy-config.schema.json` defines how the above file should look like
