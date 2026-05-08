const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = 'mb.lasceneparisienne@gmail.com';
const ADMIN_PASS  = 'lascenemsv@1234';
const DATA_FILE   = path.join(__dirname, 'data', 'shows.json');

const sessions = new Set();

fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-session-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

function requireAuth(req, res, next) {
    const token = req.headers['x-session-token'];
    if (!token || !sessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

function readShows() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
    catch { return []; }
}
function writeShows(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        const token = crypto.randomBytes(32).toString('hex');
        sessions.add(token);
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Logout
app.post('/api/logout', requireAuth, (req, res) => {
    sessions.delete(req.headers['x-session-token']);
    res.json({ ok: true });
});

// Public — no login needed (for index.html & show.html)
app.get('/api/public/shows', (req, res) => {
    res.json(readShows());
});

// Get shows (admin)
app.get('/api/shows', requireAuth, (req, res) => {
    res.json(readShows());
});

// Add show  — image sent as base64 in JSON body
app.post('/api/shows', requireAuth, (req, res) => {
    const { title, date, type, desc, time, Salle, price, duration, image } = req.body;
    if (!title || !date || !image) return res.status(400).json({ error: 'title, date and image are required' });

    const shows = readShows();
    const show = {
        id: Date.now().toString(),
        title, date, type, desc: desc || '',
        time: time || '', Salle: Salle || '',
        price: price || '', duration: duration || '',
        image,
        createdAt: new Date().toISOString()
    };
    shows.unshift(show);
    writeShows(shows);
    res.json(show);
});

// Edit show
app.put('/api/shows/:id', requireAuth, (req, res) => {
    const shows = readShows();
    const idx = shows.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    const { title, date, type, desc, time, Salle, price, duration, image } = req.body;
    shows[idx] = {
        ...shows[idx],
        title, date, type, desc: desc || '',
        time: time || '', Salle: Salle || '',
        price: price || '', duration: duration || '',
        updatedAt: new Date().toISOString()
    };
    if (image) shows[idx].image = image;

    writeShows(shows);
    res.json(shows[idx]);
});

// Delete show
app.delete('/api/shows/:id', requireAuth, (req, res) => {
    const shows = readShows();
    const idx = shows.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    shows.splice(idx, 1);
    writeShows(shows);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log('\n==========================================');
    console.log('  La Scene Parisienne - Admin Server');
    console.log('==========================================');
    console.log(`  URL : http://localhost:${PORT}`);
    console.log('==========================================\n');
});
