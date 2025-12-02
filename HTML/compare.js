// compare.js - compare players side-by-side

const MAX_SLOTS = 3;
const allPlayersUrl = 'http://localhost:3001/api/all-players';

const teamCodeToShort = {
	'ARI': 'adb','OAK': 'ath','ATL':'atl','BAL':'bal','BOS':'bos','CHN':'chc','CHA':'cws','CIN':'cin','CLE':'cle','COL':'col','DET':'det','HOU':'hou','KCA':'kan','LAA':'laa','LAN':'lad','MIA':'mia','MIL':'mil','MIN':'min','NYN':'nym','NYA':'nyy','PHI':'phi','PIT':'pit','SDN':'sdp','SFN':'sfg','SEA':'sea','SLN':'stl','TBA':'tam','TEX':'tex','TOR':'tor','WAS':'was'
};

let allPlayers = [];

async function loadAllPlayers() {
	try {
		const res = await fetch(allPlayersUrl);
		if (!res.ok) return;
		allPlayers = await res.json();
	} catch (err) {
		console.error('Failed to load all players', err);
		allPlayers = [];
	}
}

function debounce(fn, delay=300) {
	let t;
	return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), delay); };
}

function createPickerHandlers() {
	const pickers = document.querySelectorAll('.player-picker');
	pickers.forEach(picker => {
		const input = picker.querySelector('.player-search-input');
		const meta = picker.querySelector('.player-picker-meta');
		const teamSelectWrapper = picker.querySelector('.player-team-select');
		const slot = Number(picker.dataset.slot);

		let currentMatches = [];

		const showMatches = (matches) => {
			if (!matches || matches.length === 0) {
				meta.innerHTML = '<div class="no-results-message">No matches</div>';
				return;
			}

			meta.innerHTML = matches.slice(0, 8).map(p => `<div class="search-result-option" data-playerid="${p.playerID}">${p.name}</div>`).join('');

			meta.querySelectorAll('.search-result-option').forEach(el => {
				el.addEventListener('click', async () => {
					const playerID = el.dataset.playerid;
					const playerName = el.textContent.trim();
					input.value = playerName;
					meta.innerHTML = '';

					// fetch teams and populate teamSelect
					teamSelectWrapper.style.display = 'block';
					teamSelectWrapper.innerHTML = '<div>Loading teams...</div>';
					try {
						const teamsRes = await fetch(`http://localhost:3001/api/player-teams/${playerID}`);
						if (!teamsRes.ok) throw new Error('no teams');
						const teams = await teamsRes.json();
						if (!teams || teams.length === 0) {
							teamSelectWrapper.innerHTML = '<div class="no-results-message">No teams found (2015-2025)</div>';
						} else {
							const options = teams.map(t => ({teamID: t.teamID, year: t.yearID}));
							// build select
							teamSelectWrapper.innerHTML = `<label>Select season</label><select data-playerid="${playerID}">${options.map(o => `<option value="${o.teamID}::${o.year}">${o.teamID} — ${o.year}</option>`).join('')}</select>`;
						}
					} catch (err) {
						console.error('teams error', err);
						teamSelectWrapper.innerHTML = '<div class="no-results-message">Unable to load teams</div>';
					}
				});
			});
		};

		const onInput = debounce((e) => {
			const q = e.target.value.trim().toLowerCase();
			if (!q || q.length < 2) { meta.innerHTML = ''; teamSelectWrapper.style.display = 'none'; return; }
			const matches = allPlayers.filter(p => p.name.toLowerCase().includes(q));
			currentMatches = matches;
			showMatches(currentMatches);
		}, 200);

		input.addEventListener('input', onInput);
	});
}

async function comparePlayers() {
	const pickers = document.querySelectorAll('.player-picker');
	const toCompare = [];
	pickers.forEach(picker => {
		const input = picker.querySelector('.player-search-input');
		const teamSelect = picker.querySelector('select');
		const playerName = input.value.trim();
		if (!playerName) return;
		// try to find ID from allPlayers
		const found = allPlayers.find(p => p.name === playerName) || allPlayers.find(p => p.name.toLowerCase().includes(playerName.toLowerCase()));
		if (!found) return;
		if (!teamSelect) return; // need player and a selected team/season
		const [teamID, year] = teamSelect.value.split('::');
		const teamShort = teamCodeToShort[teamID] || teamID.toLowerCase();
		toCompare.push({ playerID: found.playerID, name: found.name, team: teamShort, year });
	});

	if (toCompare.length === 0) {
		alert('Select at least one player with a season to compare');
		return;
	}

	// fetch stats for each
	const results = [];
	for (const entry of toCompare) {
		try {
			const res = await fetch(`http://localhost:3001/api/stats/${entry.playerID}/${entry.team}/${entry.year}`);
			if (!res.ok) {
				results.push({ ...entry, error: true });
				continue;
			}
			const stats = await res.json();
			results.push({ ...entry, stats });
		} catch (err) {
			results.push({ ...entry, error: true });
		}
	}

	renderComparison(results);
}

function renderComparison(entries) {
	const container = document.getElementById('compareTables');
	const wrapper = document.getElementById('compareResults');
	wrapper.style.display = 'block';
	container.innerHTML = '';

	// Build batting table
	const battingKeys = ['G','AB','R','H','2B','3B','HR','RBI','SB','CS','BB','SO'];
	const pitchingKeys = ['W','L','G','GS','SV','IPouts','H','ER','HR','BB','SO','ERA'];

	// header area with player names
	const headerRow = `<div class="compare-row header">
		<div class="compare-cell stat-name">Stat</div>
		${entries.map(e => `<div class="compare-cell player-name">${e.name}<div class="sub">${(e.team||'')}${e.year? ' — ' + e.year : ''}</div></div>`).join('')}
	</div>`;

	const battingTable = document.createElement('div');
	battingTable.className = 'compare-table';
	battingTable.innerHTML = `<h3>Batting</h3>` + headerRow + battingKeys.map(stat => `<div class="compare-row"><div class="compare-cell stat-name">${stat}</div>${entries.map(e => `<div class="compare-cell">${(e.stats && e.stats.batting && (e.stats.batting[stat] !== undefined ? e.stats.batting[stat] : '-')) || (e.error ? 'Error' : '-')}</div>`).join('')}</div>`).join('');

	const pitchingTable = document.createElement('div');
	pitchingTable.className = 'compare-table';
	pitchingTable.innerHTML = `<h3>Pitching</h3>` + headerRow + pitchingKeys.map(stat => `<div class="compare-row"><div class="compare-cell stat-name">${stat}</div>${entries.map(e => `<div class="compare-cell">${(e.stats && e.stats.pitching && (e.stats.pitching[stat] !== undefined ? e.stats.pitching[stat] : '-')) || (e.error ? 'Error' : '-')}</div>`).join('')}</div>`).join('');

	container.appendChild(battingTable);
	container.appendChild(pitchingTable);

		// allow add to favorites per player (attach listeners to avoid HTML string injection)
		const favBar = document.createElement('div');
		favBar.style.marginTop = '12px';
		entries.forEach(e => {
			const btn = document.createElement('button');
			btn.className = 'btn-show-roster';
			btn.style.marginRight = '8px';
			btn.textContent = `Add ${e.name} to Favorites`;
			btn.addEventListener('click', () => {
				if (!window.Favorites) return;
				window.Favorites.addFavoritePlayer({ playerID: e.playerID, name: e.name, team: e.team, year: Number(e.year) });
				btn.textContent = `Added ${e.name}`;
				btn.disabled = true;
			});
			favBar.appendChild(btn);
		});
		container.appendChild(favBar);
}

function clearPickers() {
	document.querySelectorAll('.player-picker').forEach(p => {
		p.querySelector('.player-search-input').value = '';
		p.querySelector('.player-picker-meta').innerHTML = '';
		const wrapper = p.querySelector('.player-team-select');
		wrapper.innerHTML = '';
		wrapper.style.display = 'none';
	});
	document.getElementById('compareResults').style.display = 'none';
	document.getElementById('compareTables').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadAllPlayers();
	createPickerHandlers();

	document.getElementById('compareBtn').addEventListener('click', comparePlayers);
	document.getElementById('clearBtn').addEventListener('click', clearPickers);
});

