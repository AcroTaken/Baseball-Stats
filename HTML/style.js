const teamSelect = document.getElementById("team");
const playerSearch = document.getElementById("playerSearch");
const yearSelect = document.getElementById("yearID");
const rosterDisplay = document.getElementById("rosterDisplay");
const rosterTitle = document.getElementById("rosterTitle");
const playerCount = document.getElementById("playerCount");
const playerList = document.getElementById("playerList");

let allPlayers = [];

// Check URL parameters and pre-select team/year
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get('team');
    const year = urlParams.get('year');
    
    if (team && teamSelect) {
        teamSelect.value = team;
    }
    
    if (year && yearSelect) {
        yearSelect.value = year;
    }
    
    // If both are set, trigger the update
    if (team && year) {
        updatePlayerList();
    }
}

// Team name mapping
const teamNames = {
    'adb': 'Arizona Diamondbacks',
    'ath': 'Athletics',
    'atl': 'Atlanta Braves',
    'bal': 'Baltimore Orioles',
    'bos': 'Boston Red Sox',
    'chc': 'Chicago Cubs',
    'cws': 'Chicago White Sox',
    'cin': 'Cincinnati Reds',
    'cle': 'Cleveland Guardians',
    'col': 'Colorado Rockies',
    'det': 'Detroit Tigers',
    'hou': 'Houston Astros',
    'kan': 'Kansas City Royals',
    'laa': 'Los Angeles Angels',
    'lad': 'Los Angeles Dodgers',
    'mia': 'Miami Marlins',
    'mil': 'Milwaukee Brewers',
    'min': 'Minnesota Twins',
    'nym': 'New York Mets',
    'nyy': 'New York Yankees',
    'phi': 'Philadelphia Phillies',
    'pit': 'Pittsburgh Pirates',
    'sdp': 'San Diego Padres',
    'sfg': 'San Francisco Giants',
    'sea': 'Seattle Mariners',
    'stl': 'St. Louis Cardinals',
    'tam': 'Tampa Bay Rays',
    'tex': 'Texas Rangers',
    'tor': 'Toronto Blue Jays',
    'was': 'Washington Nationals'
};

async function updatePlayerList() {
    const selectedTeam = teamSelect.value;
    const selectedYear = yearSelect.value;
    
    // Enable or disable player search based on selections
    if (!selectedTeam || !selectedYear) {
        playerSearch.disabled = true;
        playerSearch.placeholder = 'Select Team and Year first';
        playerSearch.value = '';
        allPlayers = [];
        rosterDisplay.style.display = 'none';
        return;
    }
    
    try {
        // Enable and show loading state
        playerSearch.disabled = false;
        playerSearch.placeholder = 'Loading players...';
        playerSearch.value = '';
        
        // Show loading in roster display
        rosterDisplay.style.display = 'block';
        rosterTitle.textContent = `${teamNames[selectedTeam]} - ${selectedYear} Roster`;
        playerCount.textContent = 'Loading players...';
        playerList.innerHTML = '';
        
        // Fetch players from the API
        const response = await fetch(`http://localhost:3001/api/players/${selectedTeam}/${selectedYear}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch players');
        }
        
        const players = await response.json();
        allPlayers = players;
        
        // Display players in the roster section
        if (players.length === 0) {
            playerSearch.placeholder = 'No players found for this team/year';
            playerCount.textContent = 'No players found';
            playerList.innerHTML = '<p>No players found for this team and year.</p>';
        } else {
            playerSearch.placeholder = `Search ${players.length} players...`;
            
            // Display roster
            playerCount.textContent = `Total Players: ${players.length}`;
            playerList.innerHTML = '';
            
            players.forEach((player) => {
                const playerDiv = document.createElement("div");
                playerDiv.className = "player-item";
                playerDiv.innerHTML = `<div class="player-name">${player.name}</div>`;
                playerDiv.onclick = () => showPlayerStats(player.playerID, player.name);
                playerList.appendChild(playerDiv);
            });
        }
    } catch (error) {
        console.error('Error fetching players:', error);
        playerSearch.placeholder = 'Error loading players';
        playerCount.textContent = 'Error loading players';
        playerList.innerHTML = '<p>Error loading players. Please try again.</p>';
        allPlayers = [];
    }
}

function filterPlayers() {
    const searchTerm = playerSearch.value.toLowerCase().trim();
    
    if (!searchTerm || allPlayers.length === 0) {
        playerList.innerHTML = '';
        allPlayers.forEach((player) => {
            const playerDiv = document.createElement("div");
            playerDiv.className = "player-item";
            playerDiv.innerHTML = `<div class="player-name">${player.name}</div>`;
            playerList.appendChild(playerDiv);
        });
        playerCount.textContent = `Total Players: ${allPlayers.length}`;
        return;
    }
    
    const filteredPlayers = allPlayers.filter(player => 
        player.name.toLowerCase().includes(searchTerm)
    );
    
    playerList.innerHTML = '';
    
    if (filteredPlayers.length === 0) {
        playerList.innerHTML = '<p>No players found matching your search.</p>';
        playerCount.textContent = 'No matches';
    } else {
        filteredPlayers.forEach((player) => {
            const playerDiv = document.createElement("div");
            playerDiv.className = "player-item";
            playerDiv.innerHTML = `<div class="player-name">${player.name}</div>`;
            playerDiv.onclick = () => showPlayerStats(player.playerID, player.name);
            playerList.appendChild(playerDiv);
        });
        playerCount.textContent = `Showing ${filteredPlayers.length} of ${allPlayers.length} players`;
    }
}

async function showPlayerStats(playerID, playerName) {
    const selectedTeam = teamSelect.value;
    const selectedYear = yearSelect.value;
    
    const modal = document.getElementById('statsModal');
    const statsPlayerName = document.getElementById('statsPlayerName');
    const statsContent = document.getElementById('statsContent');
    
    // Show modal with loading state
    modal.style.display = 'block';
    statsPlayerName.textContent = playerName;
    statsContent.innerHTML = '<p>Loading stats...</p>';
    
    try {
        const response = await fetch(`http://localhost:3001/api/stats/${playerID}/${selectedTeam}/${selectedYear}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        
        const stats = await response.json();
        
        let html = '';
        
        // Batting Stats
        if (stats.batting) {
            html += '<div class="stats-section">';
            html += '<h3>Batting Statistics</h3>';
            html += '<table class="stats-table">';
            html += '<tr><th>Stat</th><th>Value</th></tr>';
            html += `<tr><td>Games (G)</td><td>${stats.batting.G || '-'}</td></tr>`;
            html += `<tr><td>At Bats (AB)</td><td>${stats.batting.AB || '-'}</td></tr>`;
            html += `<tr><td>Runs (R)</td><td>${stats.batting.R || '-'}</td></tr>`;
            html += `<tr><td>Hits (H)</td><td>${stats.batting.H || '-'}</td></tr>`;
            html += `<tr><td>Doubles (2B)</td><td>${stats.batting['2B'] || '-'}</td></tr>`;
            html += `<tr><td>Triples (3B)</td><td>${stats.batting['3B'] || '-'}</td></tr>`;
            html += `<tr><td>Home Runs (HR)</td><td>${stats.batting.HR || '-'}</td></tr>`;
            html += `<tr><td>RBI</td><td>${stats.batting.RBI || '-'}</td></tr>`;
            html += `<tr><td>Stolen Bases (SB)</td><td>${stats.batting.SB || '-'}</td></tr>`;
            html += `<tr><td>Caught Stealing (CS)</td><td>${stats.batting.CS || '-'}</td></tr>`;
            html += `<tr><td>Walks (BB)</td><td>${stats.batting.BB || '-'}</td></tr>`;
            html += `<tr><td>Strikeouts (SO)</td><td>${stats.batting.SO || '-'}</td></tr>`;
            html += '</table></div>';
        }
        
        // Pitching Stats
        if (stats.pitching) {
            html += '<div class="stats-section">';
            html += '<h3>Pitching Statistics</h3>';
            html += '<table class="stats-table">';
            html += '<tr><th>Stat</th><th>Value</th></tr>';
            html += `<tr><td>Wins (W)</td><td>${stats.pitching.W || '-'}</td></tr>`;
            html += `<tr><td>Losses (L)</td><td>${stats.pitching.L || '-'}</td></tr>`;
            html += `<tr><td>Games (G)</td><td>${stats.pitching.G || '-'}</td></tr>`;
            html += `<tr><td>Games Started (GS)</td><td>${stats.pitching.GS || '-'}</td></tr>`;
            html += `<tr><td>Saves (SV)</td><td>${stats.pitching.SV || '-'}</td></tr>`;
            html += `<tr><td>Innings Pitched Outs</td><td>${stats.pitching.IPouts || '-'}</td></tr>`;
            html += `<tr><td>Hits (H)</td><td>${stats.pitching.H || '-'}</td></tr>`;
            html += `<tr><td>Earned Runs (ER)</td><td>${stats.pitching.ER || '-'}</td></tr>`;
            html += `<tr><td>Home Runs (HR)</td><td>${stats.pitching.HR || '-'}</td></tr>`;
            html += `<tr><td>Walks (BB)</td><td>${stats.pitching.BB || '-'}</td></tr>`;
            html += `<tr><td>Strikeouts (SO)</td><td>${stats.pitching.SO || '-'}</td></tr>`;
            html += `<tr><td>ERA</td><td>${stats.pitching.ERA || '-'}</td></tr>`;
            html += '</table></div>';
        }
        
        // No stats found
        if (!stats.batting && !stats.pitching) {
            html = '<div class="no-stats">No statistics found for this player in the selected team/year.</div>';
        }
        
        statsContent.innerHTML = html;
    } catch (error) {
        console.error('Error fetching stats:', error);
        statsContent.innerHTML = '<p class="no-stats">Error loading stats. Please try again.</p>';
    }
}

// Modal close functionality
const modal = document.getElementById('statsModal');
const closeBtn = document.getElementsByClassName('close')[0];

if (closeBtn) {
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

if (teamSelect && playerSearch && yearSelect) {
    teamSelect.addEventListener("change", updatePlayerList);
    yearSelect.addEventListener("change", updatePlayerList);
    playerSearch.addEventListener("input", filterPlayers);
    
    // Check for URL parameters on page load
    checkURLParams();
}