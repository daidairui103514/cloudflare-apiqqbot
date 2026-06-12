const http = require('http');

['/api/models', '/api/settings', '/api/stats', '/api/me', '/api/users'].forEach(path => {
  http.get(`http://localhost:3000${path}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[${path}] Status: ${res.statusCode}, Body: ${data.substring(0, 50)}...`);
    });
  }).on('error', err => console.error(`Error on ${path}:`, err.message));
});
