
ALTER TABLE Appearances
  ADD CONSTRAINT fk_appearances_teams FOREIGN KEY (yearID, teamID) REFERENCES Teams(yearID, teamID),
  ADD CONSTRAINT ck_appearances_counts CHECK (G_all >= 0 AND G_batting >= 0 AND G_defense >= 0);

ALTER TABLE Batting
  ADD CONSTRAINT fk_batting_teams FOREIGN KEY (yearID, teamID) REFERENCES Teams(yearID, teamID),
  ADD CONSTRAINT ck_batting_values CHECK (G >= 0 AND AB >= 0 AND H >= 0 AND HR >= 0 AND RBI >= 0);

ALTER TABLE Pitching
  ADD CONSTRAINT fk_pitching_teams FOREIGN KEY (yearID, teamID) REFERENCES Teams(yearID, teamID),
  ADD CONSTRAINT ck_pitching_values CHECK (ER >= 0 AND HR >= 0 AND BB >= 0 AND SO >= 0);

ALTER TABLE Teams
  ADD CONSTRAINT uq_team_name_per_year UNIQUE (yearID, name);
