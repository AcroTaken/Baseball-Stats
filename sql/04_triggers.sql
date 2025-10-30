CREATE OR REPLACE FUNCTION trg_validate_batting()
RETURNS TRIGGER AS $$
BEGIN 
    IF NEW.H > NEW.AB THEN
    RAISE EXCEPTION 'Hits cannot exceed at-bats';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpsql;

DROP TRIGGER IF EXISTS trg_validate_batting ON Batting;
CREATE TRIGGER trg_validate_batting
BEFORE INSERT OR UPDATE ON Batting 
FOR EACH ROW EXECUTE FUNCTION trg_validate_batting();