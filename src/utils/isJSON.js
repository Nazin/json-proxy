export default function isJSON(string) {
  try {
    return !!(JSON.parse(string) && !!string);
  } catch (e) {
    return false;
  }
}
