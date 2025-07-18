const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is working!\n');
});

server.listen(4000, '127.0.0.1', () => {
  console.log('Test server running at http://127.0.0.1:4000/');
});