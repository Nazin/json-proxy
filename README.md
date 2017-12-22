# JSON proxy

A tool which can be used as ‘man in the middle’ proxy. It can be used to sit between two JSON webservices endpoints (e.g. Facebook/Twitter and your application) to intercept the webservices traffic between them and modify it.

## Getting Started
1. Clone the project
1. Install Node and NPM.
1. Install project dependencies
    ```bash
    npm install
    ```
1. Start the proxy and configuration endpoint
    ```bash
    npm start
    ```

## Developer Notes
1. Proxy runs on port 3005 by default to relay the communication to webservice. The /config endpoint can be used to adjust the configuration in simple UI
1. config.json defines rules and endpoints
