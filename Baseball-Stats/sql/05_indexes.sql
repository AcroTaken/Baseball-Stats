CREATE INDEX ix_batting_team_year ON Batting (teamID, yearID);
CREATE INDEX ix_pitching_team_year ON Pitching (teamID, yearID);
CREATE INDEX ix_appearances_team_year ON Appearances (teamID, yearID);