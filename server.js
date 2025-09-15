import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg'; // or sqlite3, mysql2, etc.

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---- Postgres example (adjust connection string/env) ----
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL // e.g., "postgres://user:pass@localhost:5432/unifi"
});

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Save a quote
app.post('/api/quotes', async (req, res) => {
  try {
    const data = req.body || {};
    // Basic validation
    if (!data.type) return res.status(400).json({ error: "Missing type" });

    const { rows } = await pool.query(
      `INSERT INTO quotes (payload)
       VALUES ($1)
       RETURNING id, created_at`,
      [data]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save quote" });
  }
});

// List quotes (for admin)
app.get('/api/quotes', async (_req, res) => {
  const { rows } = await pool.query(`SELECT id, created_at, payload FROM quotes ORDER BY created_at DESC LIMIT 100`);
  res.json(rows);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
