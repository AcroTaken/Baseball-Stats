CREATE OR REPLACE VIEW view_team_batting_summary AS 
SELECT t.name AS team_name, b.yearID,
    SUM(b.G) AS games,
    SUM(b.HR) AS total_hr,
    ROUND(SUM(b.H)::NUMERIC / NULLIF(SUM(b.AB),0), 3) AS team_avg
FROM Batting b 
JOIN Teams t USING (yearID, teamID)
GROUP BY t.name, b.yearID;

CREATE OR REPLACE VIEW view_team_batting_summary AS
SELECT t.name AS team_name, p.yearID,
    SUM(p.SO) AS total_strikeouts,
    SUM(b.BB) AS total_walks,
    SUM(b.HR) AS total_hr_allowed
FROM Pitching p
