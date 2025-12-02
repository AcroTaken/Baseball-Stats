// favorites.js - client-side localStorage backed favorites manager

const FAVORITE_PLAYERS_KEY = 'favorites_players';
const FAVORITE_TEAMS_KEY = 'favorites_teams';

function getFavoritePlayers() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_PLAYERS_KEY) || '[]');
  } catch (err) {
    console.error('Error parsing favorite players', err);
    return [];
  }
}

function setFavoritePlayers(list) {
  localStorage.setItem(FAVORITE_PLAYERS_KEY, JSON.stringify(list || []));
}

function addFavoritePlayer(player) {
  const list = getFavoritePlayers();
  if (!list.find(p => p.playerID === player.playerID)) {
    list.push(player);
    setFavoritePlayers(list);
  }
}

function removeFavoritePlayer(playerID) {
  const list = getFavoritePlayers().filter(p => p.playerID !== playerID);
  setFavoritePlayers(list);
}

function getFavoriteTeams() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_TEAMS_KEY) || '[]');
  } catch (err) {
    console.error('Error parsing favorite teams', err);
    return [];
  }
}

function setFavoriteTeams(list) {
  localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(list || []));
}

function addFavoriteTeam(team) {
  // team = {teamCode, year, name}
  const list = getFavoriteTeams();
  if (!list.find(t => t.teamCode === team.teamCode && t.year === team.year)) {
    list.push(team);
    setFavoriteTeams(list);
  }
}

function removeFavoriteTeam(teamCode, year) {
  const list = getFavoriteTeams().filter(t => !(t.teamCode === teamCode && t.year === year));
  setFavoriteTeams(list);
}

function renderFavorites() {
  const players = getFavoritePlayers();
  const teams = getFavoriteTeams();

  const playersContainer = document.getElementById('favoritePlayersList');
  const teamsContainer = document.getElementById('favoriteTeamsList');

  const noPlayers = document.getElementById('noFavoritePlayers');
  const noTeams = document.getElementById('noFavoriteTeams');

  playersContainer.innerHTML = '';
  teamsContainer.innerHTML = '';

  if (!players || players.length === 0) {
    noPlayers.style.display = 'block';
  } else {
    noPlayers.style.display = 'none';
    players.forEach(p => {
      const entry = document.createElement('div');
      entry.className = 'favorite-entry';
      entry.innerHTML = `
        <div class="fav-left">
          <div class="fav-title">${p.name}</div>
          <div class="fav-sub">Player ID: ${p.playerID}${p.team ? ' — ' + p.team + ' ' + p.year : ''}</div>
        </div>
        <div class="fav-actions">
          <button onclick="window.location.href='player-search.html?team=${p.team || ''}&year=${p.year || ''}&player=${p.playerID}'">View</button>
          <button class="danger" onclick="removeAndRenderPlayer('${p.playerID}')">Remove</button>
        </div>
      `;
      playersContainer.appendChild(entry);
    });
  }

  if (!teams || teams.length === 0) {
    noTeams.style.display = 'block';
  } else {
    noTeams.style.display = 'none';
    teams.forEach(t => {
      const entry = document.createElement('div');
      entry.className = 'favorite-entry';
      entry.innerHTML = `
        <div class="fav-left">
          <div class="fav-title">${t.name} — ${t.year}</div>
          <div class="fav-sub">Team: ${t.teamCode}</div>
        </div>
        <div class="fav-actions">
          <button onclick="window.location.href='player-search.html?team=${t.teamCode}&year=${t.year}'">Open Roster</button>
          <button class="danger" onclick="removeAndRenderTeam('${t.teamCode}', ${t.year})">Remove</button>
        </div>
      `;
      teamsContainer.appendChild(entry);
    });
  }
}

function removeAndRenderPlayer(playerID) {
  removeFavoritePlayer(playerID);
  renderFavorites();
}

function removeAndRenderTeam(teamCode, year) {
  removeFavoriteTeam(teamCode, year);
  renderFavorites();
}

// Expose helpers for other pages to reuse
window.Favorites = {
  addFavoritePlayer,
  removeFavoritePlayer,
  addFavoriteTeam,
  removeFavoriteTeam,
  getFavoritePlayers,
  getFavoriteTeams
};

document.addEventListener('DOMContentLoaded', renderFavorites);
