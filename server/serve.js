const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3300
const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

// Use CORS middleware
app.use(cors());

app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Serve static files from the "site" directory for the example site
app.use('/site', express.static(path.join(__dirname, '../site')));

// Serve static files from the "dist" directory for the widget
app.use('/static', express.static(path.join(__dirname, '../dist')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, '../site/index.html')).pipe(res);
});

// Serve data.json from src directory at the /chat endpoint
app.get('/chat/data.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../data/data.json'));
});

// Endpoint to handle chat messages
app.post('/chat/send-message', (req, res) => {
    const { message, payload } = req.body;
    console.log('Received message:', { message, payload });

    // Simulate AI response
    const aiResponse = `AI response to: ${message}`;
    const data = {
        "apiKey": "your-api-key",
        "avatarUrl": "path/to/ai-avatar.png",
        "aiName": "ChatBot",
        "greeting": "Hello! How can I assist you today?"
    };

    // Respond with AI message
    res.json({ message: aiResponse, payload: data });
});

https.createServer(options, app).listen(port, () => {
    console.log('running on port 3300 -- https://localhost:3300/');
});
