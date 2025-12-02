const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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

// Load and parse CSV files
let peopleData = {};
let appearancesData = [];

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadCSVData() {
  try {
    // Load People.csv
    const peoplePath = path.join(__dirname, '../data/People.csv');
    const peopleCSV = fs.readFileSync(peoplePath, 'utf-8');
    const peopleLines = peopleCSV.split('\n');
    
    for (let i = 1; i < peopleLines.length; i++) {
      const line = peopleLines[i].trim();
      if (!line) continue;
      
      const parts = parseCSVLine(line);
      if (parts.length >= 16) {
        const playerID = parts[1];
        const nameFirst = parts[14];
        const nameLast = parts[15];
        if (playerID && nameFirst && nameLast) {
          peopleData[playerID] = { nameFirst, nameLast };
        }
      }
    }
    
    // Load Appearances.csv
    const appearancesPath = path.join(__dirname, '../data/Appearances.csv');
    const appearancesCSV = fs.readFileSync(appearancesPath, 'utf-8');
    const appearancesLines = appearancesCSV.split('\n');
    
    for (let i = 1; i < appearancesLines.length; i++) {
      const line = appearancesLines[i].trim();
      if (!line) continue;
      
      const parts = parseCSVLine(line);
      if (parts.length >= 4) {
        const yearID = parseInt(parts[0]);
        const teamID = parts[1];
        const playerID = parts[3];
        
        if (yearID >= 2015 && yearID <= 2025 && teamID && playerID) {
          appearancesData.push({ yearID, teamID, playerID });
        }
      }
    }
    
    console.log(`Loaded ${Object.keys(peopleData).length} players`);
    console.log(`Loaded ${appearancesData.length} appearances (2015-2025)`);
  } catch (error) {
    console.error('Error loading CSV data:', error);
  }
}

// Load data on startup
loadCSVData();

// API endpoint to get players by team and year
app.get('/api/players/:team/:year', (req, res) => {
  try {
    const team = teamMapping[req.params.team.toLowerCase()];
    const year = parseInt(req.params.year);
    
    console.log(`Request: team=${req.params.team} (mapped to ${team}), year=${year}`);
    
    if (!team) {
      console.log(`Invalid team: ${req.params.team}`);
      return res.status(400).json({ error: 'Invalid team' });
    }
    
    if (year < 2015 || year > 2025) {
      console.log(`Invalid year: ${year}`);
      return res.status(400).json({ error: 'Year must be between 2015 and 2025' });
    }
    
    // Find all players for this team and year
    const playerIDs = new Set();
    appearancesData.forEach(appearance => {
      if (appearance.teamID === team && appearance.yearID === year) {
        playerIDs.add(appearance.playerID);
      }
    });
    
    console.log(`Found ${playerIDs.size} unique players for ${team} in ${year}`);
    
    // Get player names
    const players = [];
    playerIDs.forEach(playerID => {
      if (peopleData[playerID]) {
        players.push({
          name: `${peopleData[playerID].nameFirst} ${peopleData[playerID].nameLast}`,
          playerID: playerID
        });
      }
    });
    
    // Sort by last name, first name
    players.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Returning ${players.length} players with names`);
    res.json(players);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html in your browser`);
});
