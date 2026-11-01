const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for RumptyCloud
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Redirect any other route to the article
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n📖 Article server running at http://0.0.0.0:${PORT}\n`);
});

