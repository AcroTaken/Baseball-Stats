
-- 1. Top 5 teams by home runs in a season
SELECT t.name, b.yearID, SUM(b.HR) AS total_hr
FROM Batting b
JOIN Teams t USING (yearID, teamID)
GROUP BY t.name, b.yearID
ORDER BY total_hr DESC
LIMIT 5;

-- 2. Teams with highest average strikeouts per pitcher
SELECT t.name, p.yearID,
       ROUND(AVG(p.SO), 2) AS avg_so
FROM Pitching p
JOIN Teams t USING (yearID, teamID)
GROUP BY t.name, p.yearID
ORDER BY avg_so DESC
LIMIT 5;

-- 3. Correlation of appearances and home runs
SELECT a.teamID, a.yearID,
       SUM(a.G_all) AS total_games,
       SUM(b.HR) AS total_hr
FROM Appearances a
JOIN Batting b USING (playerID, yearID, teamID)
GROUP BY a.teamID, a.yearID
ORDER BY total_hr DESC
LIMIT 5;

-- 4. Teams with the highest total strikeouts per season
SELECT 
    t.name AS team_name,
    p.yearID,
    SUM(p.SO) AS total_strikeouts
FROM Pitching p
JOIN Teams t USING (yearID, teamID)
GROUP BY t.name, p.yearID
ORDER BY total_strikeouts DESC
LIMIT 10;

-- 5. Teams with the Most Walks Allowed
SELECT 
    t.name AS team_name,
    p.yearID,
    SUM(p.BB) AS total_walks_allowed
FROM Pitching p
JOIN Teams t USING (yearID, teamID)
GROUP BY t.name, p.yearID
ORDER BY total_walks_allowed DESC
LIMIT 10;

-- 6. Team strikeouts vs walks per season
SELECT 
    t.name AS team_name,
    p.yearID,
    SUM(p.SO) AS total_strikeouts,
    SUM(p.BB) AS total_walks,
    ROUND(SUM(p.SO)::NUMERIC / NULLIF(SUM(p.BB), 0), 2) AS so_bb_ratio
FROM Pitching p
JOIN Teams t USING (yearID, teamID)
GROUP BY t.name, p.yearID
ORDER BY so_bb_ratio DESC
LIMIT 10;
