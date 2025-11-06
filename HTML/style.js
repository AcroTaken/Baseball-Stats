const teamSelect = document.getElemendById("team");
      const playerSelect= document.getElementById("playerID");


      teamSelect.addEventListener("change", function() {
       const selectedTeam = teamSelect.value;
       const players = teamPlayers[selectedTeam] || [];


       playerSelect.innerHTML ='<option value="">Select Player</option>';


       players.forEach((player) => {
           const option = document.createElement("option");
           option.value = player;
           option.textContent = player;
           playerSelect.appendChild(option);
       });
      });