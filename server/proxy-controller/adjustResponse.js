const adjustBody = require('./adjustBody');

module.exports = function adjustResponse({
  response, requestBody, rules, endpointName, funcRules, reqURL, reqMethod,
}) {
  let responseBody;
  let responseStatusCode = (response && response.statusCode) || 500;
  try {
    responseBody = response.body ? JSON.parse(response.body) : response.body;
    const result = adjustBody({
      requestBody, responseBody, rules, responseStatusCode, isResponse: true, funcRules, reqURL, reqMethod,
    });
    responseBody = result.responseBody;
    responseStatusCode = result.responseStatusCode;
    responseBody = responseBody ? JSON.stringify(responseBody) : responseBody;
  } catch (e) {
    console.log('Problem with adjusting the response');
    responseBody = (response && response.body) || JSON.stringify({ status: 'ERROR' });
  }

  const responseHeaders = JSON.parse(JSON.stringify((response && response.headers) || { 'Content-Type': 'application/json' }));
  if (responseHeaders['set-cookie']) {
    responseHeaders['set-cookie'] = responseHeaders['set-cookie'].map(cookie => cookie.replace('Secure; HttpOnly', '').replace('Path=/', `Path=/${endpointName}/`));
  }
  delete responseHeaders['content-length'];

  return {
    responseStatusCode,
    responseHeaders,
    responseBody,
  };
};
