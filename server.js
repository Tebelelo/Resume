const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch'); // Import node-fetch

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(__dirname)); // Serve static files from the root directory

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY not found in .env file.");
    process.exit(1);
}

// API proxy endpoint
app.post('/api/gemini', async (req, res) => {
    const { model, payload } = req.body;

    if (!model || !payload) {
        return res.status(400).json({ error: 'Missing model or payload in request body' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying request to Gemini API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/index.html`);
});