const loadFile = require('./loadFile');

// eslint-disable-next-line no-unused-vars
function loadFromFile(filePath) {
  return loadFile(filePath);
}

module.exports = function adjustBody({// eslint-disable-next-line no-unused-vars
  requestBody, responseBody, rules, responseStatusCode, isResponse = false, isRequest = false, funcRules, reqURL, reqMethod,
}) {
  rules.forEach((detailedRule) => {
    try {
      if (eval(detailedRule.condition)) {
        console.log(`Condition "${detailedRule.condition}" is valid`);
        detailedRule.actions.forEach((action) => {
          console.log(`Applying rule: ${action}`);
          try {
            eval(action);
          } catch (e) {
            console.log('Invalid rule');
          }
        });
      }
    } catch (e) {
      console.log(`Invalid condition: "${detailedRule.condition}"`);
    }
  });
  funcRules.forEach((func) => {
    try {
      func.call(null, {
        requestBody, responseStatusCode, responseBody, isResponse, isRequest, reqURL, reqMethod,
      });
    } catch (e) {
      console.log('Invalid dynamic rule');
      console.log(e);
    }
  });
  return { requestBody, responseBody, responseStatusCode };
};
