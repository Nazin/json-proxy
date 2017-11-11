import adjustBody from './adjustBody';

export default function adjustRequest({ requestBody, rules }) {
  let newRequestBody;
  try {
    newRequestBody = requestBody ? JSON.parse(requestBody) : requestBody;
    const result = adjustBody({ requestBody: newRequestBody, rules });
    newRequestBody = result.requestBody;
    newRequestBody = newRequestBody ? JSON.stringify(newRequestBody) : newRequestBody;
  } catch (e) {
    console.log('Problem with adjusting the request');
    newRequestBody = requestBody;
  }
  return newRequestBody;
}
