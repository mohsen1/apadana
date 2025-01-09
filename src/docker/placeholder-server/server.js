import fs from 'fs';
import http from 'http';
import path from 'path';

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }

  // Serve static files from the current directory
  const filePath = path.join(import.meta.dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(3030, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error('Error starting placeholder server:', err);
  } else {
    // eslint-disable-next-line no-console
    console.log('Placeholder server running on port 3030');
  }
});
