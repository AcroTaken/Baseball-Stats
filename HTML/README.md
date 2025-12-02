# Baseball Stats - Player Roster Viewer

This application dynamically loads player rosters by team and year from your PostgreSQL database.

## Prerequisites

1. PostgreSQL database with baseball data loaded
2. Node.js installed
3. Required npm packages: `express`, `cors`, `pg`

## Setup

1. Install dependencies:
```bash
npm install express cors pg
```

2. Make sure your PostgreSQL database is running with the baseball data loaded

3. Configure database connection (if needed):
   - Edit `server.js` if your database credentials differ from defaults
   - Default connection: `postgres://postgres:postgres@localhost:5432/baseball`

## Running the Application

1. Start the server:
```bash
node server.js
```

2. Open your browser to:
```
http://localhost:3000/index.html
```

## How It Works

1. Select a team from the dropdown
2. Select a year (2015-2025)
3. The player dropdown will automatically load all players who played for that team in that specific year
4. Player names are pulled directly from your database's `Appearances` and `People` tables

## Features

- **Real Data**: Players are loaded from your actual database, not hardcoded
- **Complete Rosters**: Shows all players who appeared for a team in a given year
- **Year Filtering**: Only shows data from 2015 onwards as specified
- **Dynamic Loading**: Players load as you change team/year selections
