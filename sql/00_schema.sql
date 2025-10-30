
CREATE TABLE Teams (
  yearID INT,
  teamID TEXT,
  name TEXT,
  PRIMARY KEY (yearID, teamID)
);

CREATE TABLE Appearances (
  playerID TEXT,
  yearID INT,
  teamID TEXT,
  G_all INT,
  G_batting INT,
  G_defense INT,
  PRIMARY KEY (playerID, yearID, teamID)
);

CREATE TABLE Batting (
  playerID TEXT,
  yearID INT,
  teamID TEXT,
  G INT,
  AB INT,
  R INT,
  H INT,
  HR INT,
  RBI INT,
  SB INT,
  SO INT,
  PRIMARY KEY (playerID, yearID, teamID)
);

CREATE TABLE Pitching (
  playerID TEXT,
  yearID INT,
  teamID TEXT,
  ER INT,
  HR INT,
  BB INT,
  SO INT,
  PRIMARY KEY (playerID, yearID, teamID)
);
