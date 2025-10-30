CREATE OR REPLACE FUNCTION fn_team_avg(p_team TEXT, p_year INT)
RETURNS NUMERIC AS $$
DECLARE
    v_avg NUMERIC;
BEGIN
    SELECT ROUND(SUM(H)::NUMERIC / NULLIF(SUM(AB),0), 3)
    INTO v_avg
    FROM Batting Batting
    JOIN Teams t USING (yearID, teamID)
    WHERE t.name = p_team AND b.yearID = p_year;

    RETURN COALESCE(v_avg, 0);
END;
$$ LANGUAGE plpsql;