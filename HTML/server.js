const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'baseball',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Map team abbreviations to database team IDs
const teamMapping = {
  'adb': 'ARI',
  'ath': 'OAK',
  'atl': 'ATL',
  'bal': 'BAL',
  'bos': 'BOS',
  'chc': 'CHN',
  'cws': 'CHA',
  'cin': 'CIN',
  'cle': 'CLE',
  'col': 'COL',
  'det': 'DET',
  'hou': 'HOU',
  'kan': 'KCA',
  'laa': 'LAA',
  'lad': 'LAN',
  'mia': 'MIA',
  'mil': 'MIL',
  'min': 'MIN',
  'nym': 'NYN',
  'nyy': 'NYA',
  'phi': 'PHI',
  'pit': 'PIT',
  'sdp': 'SDN',
  'sfg': 'SFN',
  'sea': 'SEA',
  'stl': 'SLN',
  'tam': 'TBA',
  'tex': 'TEX',
  'tor': 'TOR',
  'was': 'WAS'
};

// API endpoint to get players by team and year
app.get('/api/players/:team/:year', async (req, res) => {
  try {
    const team = teamMapping[req.params.team.toLowerCase()];
    const year = parseInt(req.params.year);
    
    if (!team) {
      return res.status(400).json({ error: 'Invalid team' });
    }
    
    if (year < 2015 || year > 2025) {
      return res.status(400).json({ error: 'Year must be between 2015 and 2025' });
    }
    
    const query = `
      SELECT DISTINCT p."nameFirst", p."nameLast", p."playerID"
      FROM "Appearances" a
      JOIN "People" p ON a."playerID" = p."playerID"
      WHERE a."teamID" = $1 AND a."yearID" = $2
      ORDER BY p."nameLast", p."nameFirst"
    `;
    
    const result = await pool.query(query, [team, year]);
    const players = result.rows.map(row => ({
      name: `${row.nameFirst} ${row.nameLast}`,
      playerID: row.playerID
    }));
    
    res.json(players);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

