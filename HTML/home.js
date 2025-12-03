const homePlayerSearch = document.getElementById('homePlayerSearch');
const searchResults = document.getElementById('searchResults');
const playerTeamsDisplay = document.getElementById('playerTeamsDisplay');
const selectedPlayerName = document.getElementById('selectedPlayerName');
const teamsList = document.getElementById('teamsList');

let allPlayers = [];
let searchTimeout;

// Team name mapping
const teamNames = {
    'ARI': 'Arizona Diamondbacks',
    'OAK': 'Oakland Athletics',
    'ATL': 'Atlanta Braves',
    'BAL': 'Baltimore Orioles',
    'BOS': 'Boston Red Sox',
    'CHN': 'Chicago Cubs',
    'CHA': 'Chicago White Sox',
    'CIN': 'Cincinnati Reds',
    'CLE': 'Cleveland Guardians',
    'COL': 'Colorado Rockies',
    'DET': 'Detroit Tigers',
    'HOU': 'Houston Astros',
    'KCA': 'Kansas City Royals',
    'LAA': 'Los Angeles Angels',
    'LAN': 'Los Angeles Dodgers',
    'MIA': 'Miami Marlins',
    'MIL': 'Milwaukee Brewers',
    'MIN': 'Minnesota Twins',
    'NYN': 'New York Mets',
    'NYA': 'New York Yankees',
    'PHI': 'Philadelphia Phillies',
    'PIT': 'Pittsburgh Pirates',
    'SDN': 'San Diego Padres',
    'SFN': 'San Francisco Giants',
    'SEA': 'Seattle Mariners',
    'SLN': 'St. Louis Cardinals',
    'TBA': 'Tampa Bay Rays',
    'TEX': 'Texas Rangers',
    'TOR': 'Toronto Blue Jays',
    'WAS': 'Washington Nationals'
};

// Team code mapping (for navigation to player-search page)
const teamCodeMapping = {
    'ARI': 'adb',
    'OAK': 'ath',
    'ATL': 'atl',
    'BAL': 'bal',
    'BOS': 'bos',
    'CHN': 'chc',
    'CHA': 'cws',
    'CIN': 'cin',
    'CLE': 'cle',
    'COL': 'col',
    'DET': 'det',
    'HOU': 'hou',
    'KCA': 'kan',
    'LAA': 'laa',
    'LAN': 'lad',
    'MIA': 'mia',
    'MIL': 'mil',
    'MIN': 'min',
    'NYN': 'nym',
    'NYA': 'nyy',
    'PHI': 'phi',
    'PIT': 'pit',
    'SDN': 'sdp',
    'SFN': 'sfg',
    'SEA': 'sea',
    'SLN': 'stl',
    'TBA': 'tam',
    'TEX': 'tex',
    'TOR': 'tor',
    'WAS': 'was'
};

// Load all players on page load
async function loadAllPlayers() {
    try {
        const response = await fetch('http://localhost:3001/api/all-players');
        if (response.ok) {
            allPlayers = await response.json();
        }
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

// Search players as user types
homePlayerSearch.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim().toLowerCase();
    
    if (searchTerm.length < 2) {
        searchResults.classList.remove('show');
        return;
    }
    
    searchTimeout = setTimeout(() => {
        const matches = allPlayers.filter(player => 
            player.name.toLowerCase().includes(searchTerm)
        ).slice(0, 10); // Limit to 10 results
        
        displaySearchResults(matches);
    }, 300);
});

function displaySearchResults(matches) {
    if (matches.length === 0) {
        searchResults.innerHTML = '<div class="no-results-message">No players found</div>';
        searchResults.classList.add('show');
        return;
    }
    
    searchResults.innerHTML = matches.map(player => 
        `<div class="search-result-option" data-playerid="${player.playerID}">
            ${player.name}
        </div>`
    ).join('');
    
    searchResults.classList.add('show');
    
    // Add click handlers
    document.querySelectorAll('.search-result-option').forEach(option => {
        option.addEventListener('click', () => {
            const playerID = option.dataset.playerid;
            const playerName = option.textContent.trim();
            selectPlayer(playerID, playerName);
        });
    });
}

async function selectPlayer(playerID, playerName) {
    // Hide search results
    searchResults.classList.remove('show');
    homePlayerSearch.value = playerName;
    
    // Show loading state
    playerTeamsDisplay.style.display = 'block';
    selectedPlayerName.textContent = playerName;
    teamsList.innerHTML = '<p>Loading teams...</p>';
    
    try {
        const response = await fetch(`http://localhost:3001/api/player-teams/${playerID}`);
        if (!response.ok) throw new Error('Failed to fetch teams');
        
        const teams = await response.json();
        
        if (teams.length === 0) {
            teamsList.innerHTML = '<p>No teams found for this player (2015-2025)</p>';
            return;
        }
        
        // Display teams
        teamsList.innerHTML = teams.map(team => {
            const teamName = teamNames[team.teamID] || team.teamID;
            return `
                <div class="team-item" data-team="${team.teamID}" data-year="${team.yearID}">
                    <div class="team-info">
                        <div class="team-name">${teamName}</div>
                        <div class="team-year">Year: ${team.yearID}</div>
                    </div>
                    <div class="team-arrow">→</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers to teams
        document.querySelectorAll('.team-item').forEach(item => {
            item.addEventListener('click', () => {
                const teamID = item.dataset.team;
                const year = item.dataset.year;
                const teamName = teamNames[teamID] || teamID;
                
                // Show stats for this player on this team
                showPlayerTeamStats(playerID, playerName, teamID, teamName, year);
            });
        });
        
    } catch (error) {
        console.error('Error fetching player teams:', error);
        teamsList.innerHTML = '<p>Error loading teams. Please try again.</p>';
    }
}

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        searchResults.classList.remove('show');
    }
});

// Function to view player in roster page
function viewPlayerInRoster(playerID, playerName, teamCode, year) {
    // Navigate to roster search page with player highlighted
    window.location.href = `player-search.html?team=${teamCode}&year=${year}&player=${playerID}`;
}

// Show player stats for a specific team/year
async function showPlayerTeamStats(playerID, playerName, teamID, teamName, year) {
    // Create or get modal
    let modal = document.getElementById('homeStatsModal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'homeStatsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2 id="homeStatsPlayerName">Player Stats</h2>
                <div id="homeStatsContent">
                    <p>Loading...</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close handlers
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.style.display = 'none';
        
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    const statsPlayerName = document.getElementById('homeStatsPlayerName');
    const statsContent = document.getElementById('homeStatsContent');
    
    // Show modal with loading state
    modal.style.display = 'block';
    statsPlayerName.textContent = `${playerName} - ${teamName} (${year})`;
    statsContent.innerHTML = '<p>Loading stats...</p>';
    
    try {
        const teamCode = teamCodeMapping[teamID];
        const response = await fetch(`http://localhost:3001/api/stats/${playerID}/${teamCode}/${year}`);
        
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
        
        // Add quick actions: favorite player, favorite team and "Show Full Roster" button
        const isPlayerFav = window.Favorites ? window.Favorites.getFavoritePlayers().find(p => p.playerID === playerID) : false;
        const favPlayerText = isPlayerFav ? '★ Favorite' : '☆ Favorite';
        const favPlayerClass = isPlayerFav ? 'favorite-btn' : 'favorite-btn outline';

        const favTeams = window.Favorites ? window.Favorites.getFavoriteTeams() : [];
        const teamCodeShort = teamCodeMapping[teamID];
        const isTeamFav = favTeams.find(t => t.teamCode === teamCodeShort && String(t.year) === String(year));
        const favTeamText = isTeamFav ? '★ Favorited' : '☆ Favorite team';
        const favTeamClass = isTeamFav ? 'favorite-btn' : 'favorite-btn outline';

        html += `
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:8px;">
              <button id="homeModalFavPlayer" class="${favPlayerClass}">${favPlayerText}</button>
              <button id="homeModalFavTeam" class="${favTeamClass}">${favTeamText}</button>
            </div>
            <div class="modal-actions">
                <button class="btn-show-roster" onclick="viewPlayerInRoster('${playerID}', '${playerName}', '${teamCode}', ${year})">
                    View Player Stats
                </button>
            </div>
        `;
        
        statsContent.innerHTML = html;

        // Hook up modal favorite buttons
        const favPlayerBtn = document.getElementById('homeModalFavPlayer');
        if (favPlayerBtn) {
            favPlayerBtn.onclick = () => {
                if (!window.Favorites) return;
                const exists = window.Favorites.getFavoritePlayers().find(p => p.playerID === playerID);
                if (exists) {
                    window.Favorites.removeFavoritePlayer(playerID);
                    favPlayerBtn.classList.add('outline');
                    favPlayerBtn.textContent = '☆ Favorite';
                } else {
                    window.Favorites.addFavoritePlayer({ playerID, name: playerName, team: teamCodeShort, year: Number(year) });
                    favPlayerBtn.classList.remove('outline');
                    favPlayerBtn.textContent = '★ Favorite';
                }
            };
        }

        const favTeamBtn = document.getElementById('homeModalFavTeam');
        if (favTeamBtn) {
            favTeamBtn.onclick = () => {
                if (!window.Favorites) return;
                if (isTeamFav) {
                    window.Favorites.removeFavoriteTeam(teamCodeShort, Number(year));
                    favTeamBtn.classList.add('outline');
                    favTeamBtn.textContent = '☆ Favorite team';
                } else {
                    window.Favorites.addFavoriteTeam({ teamCode: teamCodeShort, year: Number(year), name: teamName });
                    favTeamBtn.classList.remove('outline');
                    favTeamBtn.textContent = '★ Favorited';
                }
            };
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        statsContent.innerHTML = '<p class="no-stats">Error loading stats. Please try again.</p>';
    }
}

// Function to view player in roster page
function viewPlayerInRoster(playerID, playerName, teamCode, year) {
    // Navigate to roster search page with player highlighted
    window.location.href = `player-search.html?team=${teamCode}&year=${year}&player=${playerID}`;
}

// Load players on page load
loadAllPlayers();
