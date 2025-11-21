const teamSelect = document.getElementById("team");
const playerSelect = document.getElementById("playerID");

if (teamSelect && playerSelect) {
    teamSelect.addEventListener("change", function () {
        const selectedTeam = teamSelect.value;
        const players = (typeof teamPlayers !== "undefined" && teamPlayers[selectedTeam]) ? teamPlayers[selectedTeam] : [];

        playerSelect.innerHTML = '<option value="">Select Player</option>';

        players.forEach((player) => {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
    });
}