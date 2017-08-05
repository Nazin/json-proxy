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
1. Proxy runs on two ports, 3005 - used to relay the communication to webservice, 3006 - used to adjust the configuration
1. config.json defines rules and endpoints
