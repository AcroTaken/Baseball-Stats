const teamSelect = document.getElementById("team");
const playerSearch = document.getElementById("playerSearch");
const yearSelect = document.getElementById("yearID");
const rosterDisplay = document.getElementById("rosterDisplay");
const rosterTitle = document.getElementById("rosterTitle");
const playerCount = document.getElementById("playerCount");
const playerList = document.getElementById("playerList");

let allPlayers = [];

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
            playerList.appendChild(playerDiv);
        });
        playerCount.textContent = `Showing ${filteredPlayers.length} of ${allPlayers.length} players`;
    }
}

if (teamSelect && playerSearch && yearSelect) {
    teamSelect.addEventListener("change", updatePlayerList);
    yearSelect.addEventListener("change", updatePlayerList);
    playerSearch.addEventListener("input", filterPlayers);
}