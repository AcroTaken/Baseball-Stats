CREATE OR REPLACE FUNCTION fn_team_avg(p_team TEXT, p_year INT)
RETURNS NUMERIC AS $$
DECLARE
    v_avg NUMERIC;
BEGIN
    SELECT ROUND(SUM(H)::NUMERIC / NULLIF(SUM(AB),0), 3)
    INTO v_avg
    FROM Batting b
JOIN Teams t USING (yearID, teamID)
WHERE t.name = p_team AND b.yearID = p_year;

$$ LANGUAGE plpgsql;
