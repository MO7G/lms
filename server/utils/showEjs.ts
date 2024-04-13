import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    // Check if the request is for the HTML file
    console.
    if (req.url === '/rendered.html') {
        // Read the HTML file
        const htmlPath = path.join(__dirname, 'rendered.html');
        fs.readFile(htmlPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
        // Handle other routes (if any)
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
