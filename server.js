const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres', // Using default DB
    password: 'mike',
    port: 5433,
});

// Initialize Database Table
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS agents (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50),
                role VARCHAR(50),
                status VARCHAR(20)
            );
        `);
        console.log('Database initialized: "agents" table ready.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// GET all agents
app.get('/agents', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM agents ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST new agent
app.post('/agents', async (req, res) => {
    const { name, role, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO agents (name, role, status) VALUES ($1, $2, $3) RETURNING *',
            [name, role, status]
        );
        res.json(result.rows[0]);

        console.log('Request Receivedssdfas!');

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
