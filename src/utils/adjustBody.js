import loadFile from './loadFile';

// eslint-disable-next-line no-unused-vars
function loadFromFile(filePath) {
  return loadFile(filePath);
}

export default function adjustBody({ requestBody, responseBody, rules, responseStatusCode }) {
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
}
