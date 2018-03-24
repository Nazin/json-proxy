import adjustBody from './adjustBody';

export default function adjustRequest({ requestBody, rules }) {
  let newRequestBody;
  try {
    const result = adjustBody({ requestBody, rules, isRequest: true });
    newRequestBody = result.requestBody;
    newRequestBody = newRequestBody ? JSON.stringify(newRequestBody) : newRequestBody;
  } catch (e) {
    console.log('Problem with adjusting the request');
    newRequestBody = requestBody;
  }
  return newRequestBody;
}
