module.exports = function sendError({ res, message }) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ERROR', message }));
};
