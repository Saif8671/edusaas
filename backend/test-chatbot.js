const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/study-assistant',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});

req.on('error', (e) => console.error(e));
req.write(JSON.stringify({ message: "What is React?", course: "Web Dev" }));
req.end();
