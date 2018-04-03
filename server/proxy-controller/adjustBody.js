const loadFile = require('./loadFile');

// eslint-disable-next-line no-unused-vars
function loadFromFile(filePath) {
  return loadFile(filePath);
}

module.exports = function adjustBody({// eslint-disable-next-line no-unused-vars
  requestBody, responseBody, rules, responseStatusCode, isResponse = false, isRequest = false,
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
  return { requestBody, responseBody, responseStatusCode };
};
